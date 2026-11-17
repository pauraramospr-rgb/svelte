import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateQuestion } from '$lib/server/ai/tasks';
import { saveGenerated } from '$lib/server/questions';
import { aiConfigured } from '$lib/server/ai/client';
import { aiFailure, bad, readJson } from '$lib/server/http';
import { DISCIPLINES, type DisciplineCode } from '$lib/data/official/exam-2027';
import { getTopic } from '$lib/domain/syllabus';
import type { Difficulty } from '$lib/questions/types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user!;
	if (!aiConfigured()) return bad('A IA não está configurada neste servidor.', 503);
	const body = await readJson<{ discipline: DisciplineCode; topicId?: string; difficulty: Difficulty }>(request);
	if (!body || !(body.discipline in DISCIPLINES) || body.discipline === 'RED') return bad('Disciplina inválida.');
	if (!['facil', 'medio', 'dificil'].includes(body.difficulty)) return bad('Dificuldade inválida.');
	if (body.topicId && getTopic(body.topicId)?.discipline !== body.discipline) return bad('Tópico inválido.');
	try {
		const q = await generateQuestion({ discipline: body.discipline, topicId: body.topicId, difficulty: body.difficulty, userId: user.id, language: user.le_language });
		const saved = saveGenerated(q, user.id);
		return json({ id: saved.id });
	} catch (e) {
		return aiFailure(e);
	}
};
