import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getQuestion } from '$lib/server/questions';
import { recordAttempt } from '$lib/server/progress';
import { gradeAnswer } from '$lib/server/ai/tasks';
import { aiConfigured } from '$lib/server/ai/client';
import { aiFailure, bad, readJson } from '$lib/server/http';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user!;
	const body = await readJson<{ questionId: string; answer: string; timeSeconds?: number; mode: 'ia' | 'auto' }>(request);
	if (!body || typeof body.questionId !== 'string' || typeof body.answer !== 'string') return bad('Requisição inválida.');
	const q = getQuestion(body.questionId);
	if (!q) return bad('Questão não encontrada.', 404);
	const answer = body.answer.trim().slice(0, 8000);
	if (answer.length < 3) return bad('Escreva sua resposta.');
	const time = Number(body.timeSeconds) || 0;

	if (body.mode === 'ia') {
		if (!aiConfigured()) return bad('A IA não está configurada neste servidor. Use a autoavaliação.', 503);
		try {
			const fb = await gradeAnswer(q, answer, user.level, user.id);
			const attemptId = recordAttempt({ userId: user.id, question: q, answer, credit: fb.creditValue, method: 'ia', feedback: fb, timeSeconds: time, examDate: user.exam_date });
			return json({ attemptId, feedback: fb });
		} catch (e) {
			return aiFailure(e);
		}
	}
	const attemptId = recordAttempt({ userId: user.id, question: q, answer, credit: null, method: 'pendente', timeSeconds: time, examDate: user.exam_date });
	return json({ attemptId });
};
