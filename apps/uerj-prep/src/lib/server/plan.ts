import type { User } from './auth';
import { findCourse, courseDisciplines } from '$lib/data/official/courses-2027';
import { topicsOf, topicStats } from '$lib/domain/syllabus';
import { planSchedule, type PlannerTopic } from '$lib/domain/planner';
import { topicPerformance } from './progress';
import type { DisciplineCode } from '$lib/data/official/exam-2027';

/** Monta o cronograma do estudante a partir do curso, do histórico oficial e do desempenho. */
export function buildPlan(user: User, maxDays = 21) {
	const course = findCourse(user.course_id);
	if (!course) return null;
	const discs = courseDisciplines(course);
	const perf = new Map(topicPerformance(user.id).map((p) => [p.topicId, p]));
	const topics: PlannerTopic[] = [];
	for (const d of discs) {
		if (d.code === 'RED') continue;
		const list = topicsOf(d.code as DisciplineCode);
		const max = Math.max(1, ...list.map((t) => topicStats(t.id).questions));
		for (const t of list) {
			const p = perf.get(t.id);
			topics.push({
				id: t.id,
				discipline: d.code,
				title: t.title,
				incidence: topicStats(t.id).questions / max,
				mastery: p?.avgCredit ?? null,
				due: p?.due ?? false
			});
		}
	}
	return {
		course,
		days: planSchedule({
			today: new Date(),
			examDate: new Date(user.exam_date + 'T12:00:00'),
			weeklyHours: user.weekly_hours,
			disciplines: discs.map((d) => ({ code: d.code, weight: d.weight })),
			topics,
			maxDays
		})
	};
}
