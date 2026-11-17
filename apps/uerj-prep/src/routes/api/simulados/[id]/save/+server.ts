import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { saveAnswer } from '$lib/server/simulados';
import { bad, readJson } from '$lib/server/http';

export const POST: RequestHandler = async ({ request, params, locals }) => {
	const body = await readJson<{ position: number; answer: string; timeSeconds: number }>(request);
	if (!body || !Number.isInteger(body.position) || typeof body.answer !== 'string') return bad('Requisição inválida.');
	const ok = saveAnswer(locals.user!.id, Number(params.id), body.position, body.answer, Number(body.timeSeconds) || 0);
	return ok ? json({ ok: true }) : bad('Simulado encerrado ou inexistente.', 409);
};
