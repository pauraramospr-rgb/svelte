import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { computeResult, deadline, finishSimulado, getSimulado, redacaoPrompt } from '$lib/server/simulados';
import { getQuestion } from '$lib/server/questions';
import { getTema } from '$lib/data/content/redacao-temas';
import { db } from '$lib/server/db';
import { getTopic } from '$lib/domain/syllabus';

export const load: PageServerLoad = ({ params, locals }) => {
	const user = locals.user!;
	const id = Number(params.id);
	let s = getSimulado(user.id, id);
	if (!s) error(404, 'Simulado não encontrado.');
	if (!s.sim.finished_at && deadline(s.sim).getTime() < Date.now()) {
		finishSimulado(user, id);
		s = getSimulado(user.id, id)!;
	}
	const finished = Boolean(s.sim.finished_at);
	const items = s.items.map((it) => {
		if (it.discipline === 'RED') {
			const p = redacaoPrompt(it.question_id);
			const tema = getTema(it.question_id.slice(8));
			const essay = finished && it.attempt_id
				? (db().prepare('SELECT id, score FROM essays WHERE id = ?').get(it.attempt_id) as { id: number; score: number | null } | undefined)
				: undefined;
			return {
				position: it.position,
				discipline: 'RED',
				kind: 'redacao' as const,
				prompt: p,
				motivadores: tema?.motivadores ?? [],
				answer: it.answer,
				time: it.time_seconds,
				essay: essay ?? null
			};
		}
		const q = getQuestion(it.question_id)!;
		const att = finished && it.attempt_id
			? (db().prepare('SELECT id, credit, grading_method, feedback FROM attempts WHERE id = ?').get(it.attempt_id) as
					| { id: number; credit: number | null; grading_method: string; feedback: string | null }
					| undefined)
			: undefined;
		return {
			position: it.position,
			discipline: it.discipline,
			kind: 'questao' as const,
			q,
			answer: it.answer,
			time: it.time_seconds,
			attempt: att ? { id: att.id, credit: att.credit, method: att.grading_method, feedback: att.feedback ? JSON.parse(att.feedback) : null } : null,
			topics: q.topicIds.map((t) => getTopic(t)?.topic.title ?? t)
		};
	});
	return {
		sim: { id: s.sim.id, title: s.sim.title, kind: s.sim.kind, finished, deadline: deadline(s.sim).toISOString(), elapsed: s.sim.elapsed_seconds, duration: s.sim.duration_minutes },
		items,
		result: finished ? computeResult(user, id) : null
	};
};

export const actions: Actions = {
	finish: ({ params, locals }) => {
		finishSimulado(locals.user!, Number(params.id));
		redirect(303, `/simulados/${params.id}`);
	}
};
