import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getAttempt, gradeAttempt } from '$lib/server/progress';
import { getQuestion } from '$lib/server/questions';
import { CREDIT_FROM_LABEL, type CreditLabel } from '$lib/domain/scoring';
import { bad, readJson } from '$lib/server/http';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user!;
	const body = await readJson<{ attemptId: number; credit: CreditLabel }>(request);
	if (!body || !Number.isInteger(body.attemptId) || !(body.credit in CREDIT_FROM_LABEL)) return bad('Requisição inválida.');
	const att = getAttempt(user.id, body.attemptId);
	if (!att) return bad('Tentativa não encontrada.', 404);
	const q = getQuestion(att.question_id);
	if (!q) return bad('Questão não encontrada.', 404);
	gradeAttempt(user.id, att.id, q, CREDIT_FROM_LABEL[body.credit], 'autoavaliacao', undefined, user.exam_date);
	return json({ ok: true });
};
