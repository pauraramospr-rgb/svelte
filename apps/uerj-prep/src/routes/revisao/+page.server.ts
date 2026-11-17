import type { PageServerLoad } from './$types';
import { dueCards, topicPerformance, upcomingCards, weeklyEvolution } from '$lib/server/progress';
import { buildPlan } from '$lib/server/plan';
import { getTopic } from '$lib/domain/syllabus';
import { listQuestions } from '$lib/server/questions';
import { db } from '$lib/server/db';

export const load: PageServerLoad = ({ locals }) => {
	const user = locals.user!;
	const perf = topicPerformance(user.id);
	const answered = new Set((db().prepare('SELECT DISTINCT question_id FROM attempts WHERE user_id = ?').all(user.id) as { question_id: string }[]).map((r) => r.question_id));
	const weak = perf.filter((p) => p.graded > 0 && (p.avgCredit ?? 1) < 0.6).slice(0, 8);
	const recommendations = weak.map((w) => {
		const next = listQuestions({ topicId: w.topicId, language: w.discipline === 'LE' ? (user.le_language ?? undefined) : undefined })
			.filter((q) => !answered.has(q.id))
			.slice(0, 3)
			.map((q) => ({ id: q.id, label: q.source === 'oficial' ? `UERJ ${q.year} Q${String(q.number).padStart(2, '0')}` : 'Inédita' }));
		return { topicId: w.topicId, title: w.title, discipline: w.discipline, avg: w.avgCredit, next };
	});
	const essays = db()
		.prepare('SELECT created_at, score FROM essays WHERE user_id = ? AND score IS NOT NULL ORDER BY created_at')
		.all(user.id) as { created_at: string; score: number }[];
	const plan = buildPlan(user, 28);
	return {
		due: dueCards(user.id).map((c) => ({ ...c, title: getTopic(c.topic_id)?.topic.title ?? c.topic_id })),
		upcoming: upcomingCards(user.id).map((c) => ({ ...c, title: getTopic(c.topic_id)?.topic.title ?? c.topic_id })),
		perf,
		recommendations,
		evolution: weeklyEvolution(user.id),
		essays,
		plan: plan?.days ?? null,
		weeklyHours: user.weekly_hours
	};
};
