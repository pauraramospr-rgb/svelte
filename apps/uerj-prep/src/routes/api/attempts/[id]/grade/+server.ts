import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAttempt, gradeAttempt } from '$lib/server/progress';
import { getQuestion } from '$lib/server/questions';
import { gradeAnswer } from '$lib/server/ai/tasks';
import { aiConfigured } from '$lib/server/ai/client';
import { aiFailure, bad } from '$lib/server/http';

/** Corrige com IA uma tentativa pendente (ex.: questões de simulado). */
export const POST: RequestHandler = async ({ params, locals }) => {
	const user = locals.user!;
	if (!aiConfigured()) return bad('A IA não está configurada neste servidor.', 503);
	const att = getAttempt(user.id, Number(params.id));
	if (!att) return bad('Tentativa não encontrada.', 404);
	const q = getQuestion(att.question_id);
	if (!q) return bad('Questão não encontrada.', 404);
	try {
		const fb = await gradeAnswer(q, att.answer, user.level, user.id);
		gradeAttempt(user.id, att.id, q, fb.creditValue, 'ia', fb, user.exam_date);
		return json({ feedback: fb, credit: fb.creditValue });
	} catch (e) {
		return aiFailure(e);
	}
};
