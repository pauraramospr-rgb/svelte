import Anthropic from '@anthropic-ai/sdk';
import { env } from '$env/dynamic/private';
import { db } from '../db';

/**
 * Integração com a API da Anthropic (Claude).
 * - Modelo padrão: claude-opus-5-5 (configurável por ANTHROPIC_MODEL).
 * - Pensamento adaptativo é o padrão do modelo; o esforço é ajustado por tarefa.
 * - Fallback no servidor em caso de recusa (beta server-side-fallback), desativável com
 *   ANTHROPIC_SERVER_FALLBACK=off.
 */
export const DEFAULT_MODEL = 'claude-opus-5-5';
const FALLBACK_BETA = 'server-side-fallback-2026-07-01';

export class AiUnavailableError extends Error {
	constructor() {
		super('Os recursos de IA não estão configurados neste servidor (defina ANTHROPIC_API_KEY).');
	}
}
export class AiLimitError extends Error {}
export class AiOutputError extends Error {}

let client: Anthropic | null = null;

export function aiConfigured(): boolean {
	return Boolean(env.ANTHROPIC_API_KEY || env.ANTHROPIC_AUTH_TOKEN);
}

export function model(): string {
	return env.ANTHROPIC_MODEL || DEFAULT_MODEL;
}

function useFallback(): boolean {
	return (env.ANTHROPIC_SERVER_FALLBACK ?? 'on') !== 'off';
}

export function getClient(): Anthropic {
	if (!aiConfigured()) throw new AiUnavailableError();
	if (!client) client = new Anthropic({ maxRetries: 2, timeout: 10 * 60 * 1000 });
	return client;
}

const DAILY_LIMIT = () => Number(env.AI_DAILY_LIMIT || 120);

export function checkQuota(userId: number): void {
	const row = db()
		.prepare("SELECT COUNT(*) AS n FROM ai_usage WHERE user_id = ? AND created_at >= datetime('now', '-1 day')")
		.get(userId) as { n: number };
	if (row.n >= DAILY_LIMIT()) {
		throw new AiLimitError(`Limite diário de ${DAILY_LIMIT()} solicitações de IA atingido. Tente novamente amanhã.`);
	}
}

export function recordUsage(userId: number | null, task: string, usage?: { input_tokens?: number | null; output_tokens?: number | null }): void {
	db()
		.prepare('INSERT INTO ai_usage (user_id, task, input_tokens, output_tokens) VALUES (?, ?, ?, ?)')
		.run(userId, task, usage?.input_tokens ?? 0, usage?.output_tokens ?? 0);
}

type Effort = 'low' | 'medium' | 'high' | 'xhigh' | 'max';

interface StructuredArgs {
	task: string;
	userId: number;
	system: string;
	user: string;
	schema: Record<string, unknown>;
	effort?: Effort;
	maxTokens?: number;
}

/** Converte erros do SDK em mensagens úteis ao estudante (do mais específico ao mais geral). */
export function describeAiError(e: unknown): string {
	if (e instanceof AiUnavailableError || e instanceof AiLimitError || e instanceof AiOutputError) return e.message;
	if (e instanceof Anthropic.AuthenticationError) return 'A chave da API configurada no servidor é inválida.';
	if (e instanceof Anthropic.PermissionDeniedError) return 'A chave da API não tem permissão para este modelo ou recurso.';
	if (e instanceof Anthropic.RateLimitError) return 'O serviço de IA está com muitas solicitações. Aguarde alguns segundos e tente de novo.';
	if (e instanceof Anthropic.BadRequestError) return `Solicitação recusada pela API: ${e.message}`;
	if (e instanceof Anthropic.APIConnectionError) return 'Não foi possível conectar ao serviço de IA. Verifique a rede do servidor.';
	if (e instanceof Anthropic.APIError) return `Erro do serviço de IA (${e.status ?? 'desconhecido'}). Tente novamente.`;
	return 'Erro inesperado ao usar a IA.';
}

/**
 * Chamada com saída estruturada (JSON Schema). Usa streaming para evitar timeouts em
 * respostas longas e devolve o objeto já validado pelo esquema da API.
 */
export async function callStructured<T>(args: StructuredArgs): Promise<T> {
	checkQuota(args.userId);
	const c = getClient();
	const params = {
		model: model(),
		max_tokens: args.maxTokens ?? 16000,
		system: args.system,
		messages: [{ role: 'user' as const, content: args.user }],
		output_config: {
			effort: args.effort ?? 'medium',
			format: { type: 'json_schema' as const, schema: args.schema }
		},
		...(useFallback() ? { betas: [FALLBACK_BETA], fallbacks: 'default' as const } : {})
	};
	const stream = c.beta.messages.stream(params);
	const message = await stream.finalMessage();
	recordUsage(args.userId, args.task, message.usage);
	if (message.stop_reason === 'refusal') {
		throw new AiOutputError('O modelo recusou esta solicitação. Reformule o pedido.');
	}
	if (message.stop_reason === 'max_tokens') {
		throw new AiOutputError('A resposta da IA ficou longa demais e foi interrompida. Tente um texto menor.');
	}
	const text = message.content
		.filter((b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text')
		.map((b) => b.text)
		.join('');
	try {
		return JSON.parse(text) as T;
	} catch {
		throw new AiOutputError('A IA devolveu uma resposta em formato inesperado. Tente novamente.');
	}
}

/** Texto livre (markdown), também via streaming. */
export async function callText(args: Omit<StructuredArgs, 'schema'>): Promise<string> {
	checkQuota(args.userId);
	const c = getClient();
	const stream = c.beta.messages.stream({
		model: model(),
		max_tokens: args.maxTokens ?? 32000,
		system: args.system,
		messages: [{ role: 'user', content: args.user }],
		output_config: { effort: args.effort ?? 'medium' },
		...(useFallback() ? { betas: [FALLBACK_BETA], fallbacks: 'default' as const } : {})
	});
	const message = await stream.finalMessage();
	recordUsage(args.userId, args.task, message.usage);
	if (message.stop_reason === 'refusal') throw new AiOutputError('O modelo recusou esta solicitação.');
	return message.content
		.filter((b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text')
		.map((b) => b.text)
		.join('');
}

/**
 * Conversa em streaming (tutor). Devolve um ReadableStream de eventos SSE:
 *   data: {"delta":"..."}   …   data: {"done":true,"text":"..."}  ou  data: {"error":"..."}
 */
export function streamChat(args: {
	userId: number;
	system: string;
	messages: { role: 'user' | 'assistant'; content: string }[];
	onComplete: (text: string) => void;
}): ReadableStream<Uint8Array> {
	checkQuota(args.userId);
	const c = getClient();
	const enc = new TextEncoder();
	return new ReadableStream({
		async start(controller) {
			const send = (obj: unknown) => controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));
			let text = '';
			try {
				const stream = c.beta.messages.stream({
					model: model(),
					max_tokens: 16000,
					system: args.system,
					messages: args.messages,
					output_config: { effort: 'medium' },
					...(useFallback() ? { betas: [FALLBACK_BETA], fallbacks: 'default' as const } : {})
				});
				for await (const event of stream) {
					if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
						text += event.delta.text;
						send({ delta: event.delta.text });
					}
				}
				const final = await stream.finalMessage();
				recordUsage(args.userId, 'tutor', final.usage);
				if (final.stop_reason === 'refusal' && !text) {
					send({ error: 'O modelo recusou responder a esta mensagem. Reformule a pergunta.' });
				} else {
					args.onComplete(text);
					send({ done: true });
				}
			} catch (e) {
				send({ error: describeAiError(e) });
			} finally {
				controller.close();
			}
		}
	});
}
