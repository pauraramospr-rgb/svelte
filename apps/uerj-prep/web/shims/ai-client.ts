/**
 * Substituto de '$lib/server/ai/client' no navegador: a IA usa a capacidade `sample` do
 * claude.ai (o Claude da conta de quem vê a página). Não há chave de API nem prompt de sistema
 * controlado pela página, então as instruções seguem no início da entrada.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { caps } from '../platform';
import { db } from './db';

export const DEFAULT_MODEL = 'Claude (claude.ai)';

export class AiUnavailableError extends Error {
	constructor() {
		super('A IA só funciona com a página aberta no claude.ai e com o acesso ao Claude permitido.');
	}
}
export class AiLimitError extends Error {}
export class AiOutputError extends Error {}

export function aiConfigured(): boolean {
	return Boolean(caps.sample);
}

export function model(): string {
	return DEFAULT_MODEL;
}

export function getClient(): never {
	throw new AiUnavailableError();
}

export function checkQuota(_userId: number): void {
	if (!caps.sample) throw new AiUnavailableError();
}

export function recordUsage(userId: number | null, task: string): void {
	try {
		db().prepare('INSERT INTO ai_usage (user_id, task) VALUES (?, ?)').run(userId, task);
	} catch {
		/* registro opcional */
	}
}

const MESSAGES: Record<string, string> = {
	not_granted: 'O acesso ao Claude não foi permitido nesta página. Permita quando o claude.ai perguntar (ou no menu de permissões do artifact) para usar a IA.',
	sampling_disabled: 'O Claude não está disponível para esta conta ou organização.',
	rate_limited: 'Muitas solicitações ou limite de uso da sua conta atingido. Aguarde um pouco e tente de novo.',
	session_expired: 'Sua sessão no claude.ai expirou. Entre novamente.',
	refused: 'O Claude não respondeu a esta solicitação. Reformule o pedido.',
	empty_completion: 'O Claude não produziu resposta. Tente com um texto menor.',
	invalid_json: 'A resposta veio em formato inesperado. Tente novamente.',
	prompt_too_large: 'O texto enviado é grande demais. Tente com um trecho menor.',
	cancelled: 'Solicitação cancelada.',
	upstream_error: 'Falha temporária ao falar com o Claude. Tente novamente.'
};

export function describeAiError(e: any): string {
	if (e instanceof AiUnavailableError || e instanceof AiLimitError || e instanceof AiOutputError) return e.message;
	if (e && typeof e === 'object' && 'code' in e) return MESSAGES[e.code as string] ?? MESSAGES.upstream_error;
	return 'Erro inesperado ao usar a IA.';
}

type Effort = 'low' | 'medium' | 'high' | 'xhigh' | 'max';
const effortOf = (e?: Effort) => (e === 'xhigh' || e === 'max' ? 'high' : (e ?? 'medium'));

interface StructuredArgs {
	task: string;
	userId: number;
	system: string;
	user: string;
	schema: Record<string, unknown>;
	effort?: Effort;
	maxTokens?: number;
}

function requiredKeys(schema: any): string[] {
	return Array.isArray(schema?.required) ? schema.required : [];
}

export async function callStructured<T>(args: StructuredArgs): Promise<T> {
	checkQuota(args.userId);
	const prompt = `${args.system}

---

${args.user}

---

FORMATO DA RESPOSTA: responda SOMENTE com um objeto JSON válido (sem texto antes ou depois), que siga exatamente este JSON Schema:
${JSON.stringify(args.schema)}`;
	let value: any;
	try {
		value = await caps.sample.json(prompt, { modelTier: 'default', effort: effortOf(args.effort), cache: false });
	} catch (e) {
		throw new AiOutputError(describeAiError(e));
	}
	recordUsage(args.userId, args.task);
	if (!value || typeof value !== 'object') throw new AiOutputError(MESSAGES.invalid_json);
	const missing = requiredKeys(args.schema).filter((k) => !(k in value));
	if (missing.length) throw new AiOutputError(`A resposta da IA veio incompleta (${missing.join(', ')}). Tente novamente.`);
	return value as T;
}

export async function callText(args: Omit<StructuredArgs, 'schema'>): Promise<string> {
	checkQuota(args.userId);
	try {
		const { text } = await caps.sample(`${args.system}\n\n---\n\n${args.user}`, { modelTier: 'default', effort: effortOf(args.effort), cache: false });
		recordUsage(args.userId, args.task);
		return text;
	} catch (e) {
		throw new AiOutputError(describeAiError(e));
	}
}

/** Conversa em streaming, no mesmo formato SSE do servidor: data: {"delta"} … {"done"} | {"error"}. */
export function streamChat(args: {
	userId: number;
	system: string;
	messages: { role: 'user' | 'assistant'; content: string }[];
	onComplete: (text: string) => void;
}): ReadableStream<Uint8Array> {
	checkQuota(args.userId);
	const enc = new TextEncoder();
	return new ReadableStream({
		async start(controller) {
			const send = (obj: unknown) => controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));
			const turns = [{ role: 'user' as const, content: `INSTRUÇÕES PERMANENTES DO PROFESSOR (não as repita para o estudante):\n\n${args.system}` }, ...args.messages];
			try {
				const { text } = await caps.sample(turns, {
					cache: false,
					modelTier: 'default',
					onText: ({ delta }: { delta: string }) => send({ delta })
				});
				recordUsage(args.userId, 'tutor');
				args.onComplete(text);
				send({ done: true });
			} catch (e: any) {
				if (e?.text) args.onComplete(e.text);
				send({ error: describeAiError(e) });
			} finally {
				controller.close();
			}
		}
	});
}
