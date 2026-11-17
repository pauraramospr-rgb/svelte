import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getQuestion } from '$lib/server/questions';
import { attemptsFor } from '$lib/server/progress';
import { getTopic } from '$lib/domain/syllabus';

export const load: PageServerLoad = ({ params, locals }) => {
	const q = getQuestion(params.id);
	if (!q) error(404, 'Questão não encontrada.');
	const attempts = attemptsFor(locals.user!.id, q.id).map((a) => ({
		id: a.id,
		answer: a.answer,
		credit: a.credit,
		method: a.grading_method,
		created_at: a.created_at,
		feedback: a.feedback ? JSON.parse(a.feedback) : null
	}));
	return { q, topics: q.topicIds.map((t) => ({ id: t, title: getTopic(t)?.topic.title ?? t })), attempts };
};
