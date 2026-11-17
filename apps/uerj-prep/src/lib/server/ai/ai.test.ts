/**
 * Testa a integração com a API da Anthropic usando um servidor local que imita o endpoint
 * /v1/messages em modo streaming (SSE). Exercita o SDK real: montagem da requisição
 * (modelo, saída estruturada, effort, fallback), leitura do stream e tratamento de respostas.
 */
import { describe, expect, it, beforeAll, afterAll, vi } from 'vitest';

// Em testes, a configuração do servidor vem diretamente de process.env.
vi.mock('$env/dynamic/private', () => ({ env: process.env }));
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

let server: Server;
const requests: { headers: Record<string, unknown>; body: any }[] = [];
let nextText = '';
let nextStop = 'end_turn';

function sse(res: import('node:http').ServerResponse, text: string, stop: string) {
	res.writeHead(200, { 'content-type': 'text/event-stream' });
	const ev = (type: string, data: unknown) => res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
	ev('message_start', {
		type: 'message_start',
		message: { id: 'msg_test', type: 'message', role: 'assistant', model: 'claude-opus-5-5', content: [], stop_reason: null, stop_sequence: null, usage: { input_tokens: 12, output_tokens: 0 } }
	});
	ev('content_block_start', { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } });
	for (const chunk of text.match(/[\s\S]{1,40}/g) ?? []) ev('content_block_delta', { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: chunk } });
	ev('content_block_stop', { type: 'content_block_stop', index: 0 });
	ev('message_delta', { type: 'message_delta', delta: { stop_reason: stop, stop_sequence: null }, usage: { output_tokens: 34 } });
	ev('message_stop', { type: 'message_stop' });
	res.end();
}

beforeAll(async () => {
	server = createServer((req, res) => {
		let raw = '';
		req.on('data', (c) => (raw += c));
		req.on('end', () => {
			requests.push({ headers: req.headers, body: JSON.parse(raw || '{}') });
			sse(res, nextText, nextStop);
		});
	});
	await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
	const port = (server.address() as AddressInfo).port;
	process.env.ANTHROPIC_API_KEY = 'sk-ant-teste';
	process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${port}`;
	delete process.env.ANTHROPIC_AUTH_TOKEN;
	const { openDatabase, setDatabase } = await import('../db');
	setDatabase(openDatabase(':memory:'));
	const { createUser } = await import('../auth');
	createUser('ia@example.com', 'IA', 'segredo123');
});

afterAll(() => server.close());

describe('integração com a API (servidor simulado)', () => {
	it('corrige resposta com saída estruturada e devolve crédito', async () => {
		const { gradeAnswer } = await import('./tasks');
		const { getQuestion } = await import('../questions');
		nextStop = 'end_turn';
		nextText = JSON.stringify({
			credit: 'parcial',
			summary: 'Acertou a probabilidade, mas não explicou o caso das filhas.',
			correctPoints: ['P = 1/4'],
			conceptualErrors: [],
			missingElements: ['Explicar que as filhas recebem o X normal do pai.'],
			improvedAnswer: 'A mãe é portadora...',
			studyTips: ['Revise herança ligada ao X.'],
			confidence: 'alta'
		});
		const q = getQuestion('ined-bio-02')!;
		const fb = await gradeAnswer(q, 'A probabilidade é 1/4.', 'intermediario', 1);
		expect(fb.credit).toBe('parcial');
		expect(fb.creditValue).toBe(0.5);

		const req = requests.at(-1)!;
		expect(req.body.model).toBe('claude-opus-5-5');
		expect(req.body.stream).toBe(true);
		expect(req.body.output_config.format.type).toBe('json_schema');
		expect(req.body.output_config.effort).toBe('medium');
		expect(req.body.fallbacks).toBe('default');
		expect(String(req.headers['anthropic-beta'])).toContain('server-side-fallback-2026-07-01');
		expect(req.body.system).toContain('4.29.5');
		expect(req.body.messages[0].content).toContain('A probabilidade é 1/4.');
	});

	it('trata recusa e resposta truncada com mensagens claras', async () => {
		const { gradeAnswer } = await import('./tasks');
		const { getQuestion } = await import('../questions');
		const q = getQuestion('ined-mat-01')!;
		nextText = '';
		nextStop = 'refusal';
		await expect(gradeAnswer(q, 'x', 'iniciante', 1)).rejects.toThrow(/recusou/);
		nextText = '{"credit":';
		nextStop = 'max_tokens';
		await expect(gradeAnswer(q, 'x', 'iniciante', 1)).rejects.toThrow(/interrompida/);
	});

	it('gera questão inédita usando questões oficiais como referência de estilo', async () => {
		const { generateQuestion } = await import('./tasks');
		nextStop = 'end_turn';
		nextText = JSON.stringify({
			statement: 'Enunciado inédito',
			modelAnswer: 'Resposta',
			explanation: 'Explicação',
			skills: ['explicar'],
			knowledge: ['isomeria'],
			patternRationale: 'Segue o padrão...',
			commonMistakes: []
		});
		const q = await generateQuestion({ discipline: 'QUI', topicId: 'qui-isomeria', difficulty: 'dificil', userId: 1 });
		expect(q.topicIds).toEqual(['qui-isomeria']);
		expect(q.difficulty).toBe('dificil');
		const req = requests.at(-1)!;
		expect(req.body.messages[0].content).toContain('EXEMPLO OFICIAL 1');
		expect(req.body.output_config.effort).toBe('high');
	});

	it('transmite o chat do tutor em SSE e entrega o texto completo ao final', async () => {
		const { streamChat } = await import('./client');
		nextStop = 'end_turn';
		nextText = 'Vamos pensar juntos: o que é um carbono quiral?';
		let saved = '';
		const stream = streamChat({ userId: 1, system: 'tutor', messages: [{ role: 'user', content: 'Oi' }], onComplete: (t) => (saved = t) });
		const text = await new Response(stream).text();
		const deltas = text
			.split('\n\n')
			.filter((l) => l.startsWith('data: '))
			.map((l) => JSON.parse(l.slice(6)));
		expect(deltas.filter((d) => d.delta).map((d) => d.delta).join('')).toBe(nextText);
		expect(deltas.at(-1)).toEqual({ done: true });
		expect(saved).toBe(nextText);
	});

	it('registra uso e aplica limite diário por usuário', async () => {
		const { checkQuota } = await import('./client');
		const { db } = await import('../db');
		const n = (db().prepare('SELECT COUNT(*) AS n FROM ai_usage WHERE user_id = 1').get() as { n: number }).n;
		expect(n).toBeGreaterThanOrEqual(4);
		process.env.AI_DAILY_LIMIT = String(n);
		expect(() => checkQuota(1)).toThrow(/Limite diário/);
		delete process.env.AI_DAILY_LIMIT;
	});
});
