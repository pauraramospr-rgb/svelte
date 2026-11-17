import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getTopic, topicStats, incidenceBand, INCIDENCE } from '$lib/domain/syllabus';
import { listQuestions } from '$lib/server/questions';
import { getResumo } from '$lib/content';
import { db } from '$lib/server/db';
import { setTopicStatus, topicPerformance, topicStatuses } from '$lib/server/progress';

export const load: PageServerLoad = ({ params, locals }) => {
	const info = getTopic(params.topic);
	if (!info) error(404, 'Tópico não encontrado no programa oficial de 2027.');
	const user = locals.user!;
	const qs = listQuestions({ topicId: params.topic, language: info.discipline === 'LE' ? (user.le_language ?? undefined) : undefined });
	const official = qs.filter((q) => q.source === 'oficial').sort((a, b) => (b as { year: number }).year - (a as { year: number }).year);
	const ineditas = qs.filter((q) => q.source === 'inedita');
	const cached = db().prepare('SELECT content, model, created_at FROM generated_summaries WHERE topic_id = ? AND level = ?').get(params.topic, user.level) as
		| { content: string; model: string; created_at: string }
		| undefined;
	const stats = topicStats(params.topic);
	return {
		topic: info.topic,
		unit: info.unit,
		discipline: info.discipline,
		stats,
		band: incidenceBand(stats),
		years: INCIDENCE.years,
		resumo: getResumo(params.topic) ?? null,
		aiSummary: cached ?? null,
		official: official.slice(0, 30).map((q) => ({ id: q.id, year: (q as { year: number }).year, number: (q as { number: number }).number, statement: q.statement.slice(0, 260), language: q.language })),
		officialTotal: official.length,
		ineditas: ineditas.map((q) => ({ id: q.id, statement: q.statement.slice(0, 260), difficulty: (q as { difficulty: string }).difficulty })),
		performance: topicPerformance(user.id).find((p) => p.topicId === params.topic) ?? null,
		status: topicStatuses(user.id).get(params.topic) ?? null
	};
};

export const actions: Actions = {
	status: async ({ request, params, locals }) => {
		const f = await request.formData();
		const s = String(f.get('status') ?? '');
		if (!['estudando', 'concluido', ''].includes(s)) return fail(400);
		setTopicStatus(locals.user!.id, params.topic, (s || null) as 'estudando' | null);
		return { ok: true };
	}
};
