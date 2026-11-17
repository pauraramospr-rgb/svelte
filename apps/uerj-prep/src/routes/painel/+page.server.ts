import type { PageServerLoad } from './$types';
import { buildPlan } from '$lib/server/plan';
import { byDiscipline, dueCards, overview, topicPerformance } from '$lib/server/progress';
import { db } from '$lib/server/db';
import { getTopic } from '$lib/domain/syllabus';

export const load: PageServerLoad = ({ locals }) => {
	const user = locals.user!;
	const plan = buildPlan(user, 7);
	const perf = topicPerformance(user.id);
	const recentSims = db()
		.prepare('SELECT id, title, finished_at, result FROM simulados WHERE user_id = ? ORDER BY id DESC LIMIT 3')
		.all(user.id) as { id: number; title: string; finished_at: string | null; result: string | null }[];
	const recentEssays = db()
		.prepare('SELECT id, title, score, created_at FROM essays WHERE user_id = ? ORDER BY id DESC LIMIT 3')
		.all(user.id) as { id: number; title: string; score: number | null; created_at: string }[];
	return {
		today: plan?.days[0] ?? null,
		hasCourse: Boolean(plan),
		overview: overview(user.id),
		disciplines: byDiscipline(user.id),
		due: dueCards(user.id).map((c) => ({ ...c, title: getTopic(c.topic_id)?.topic.title ?? c.topic_id })),
		weak: perf.filter((p) => p.graded > 0 && (p.avgCredit ?? 1) < 0.6).slice(0, 5),
		persistent: perf.filter((p) => p.persistent).length,
		recentSims: recentSims.map((s) => ({ ...s, result: s.result ? JSON.parse(s.result) : null })),
		recentEssays,
		eq: user.eq_conceito
	};
};
