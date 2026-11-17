import type { PageServerLoad } from './$types';
import { findCourse, courseDisciplines } from '$lib/data/official/courses-2027';
import { SYLLABUS, topicStats, incidenceBand } from '$lib/domain/syllabus';
import { topicPerformance, topicStatuses } from '$lib/server/progress';
import { RESUMOS } from '$lib/content';
import type { DisciplineCode } from '$lib/data/official/exam-2027';

export const load: PageServerLoad = ({ locals, url }) => {
	const user = locals.user!;
	const course = findCourse(user.course_id);
	const codes: { code: DisciplineCode; weight: number; role: string }[] = course
		? courseDisciplines(course)
		: SYLLABUS.map((d) => ({ code: d.code, weight: 1, role: 'Programa oficial' }));
	const perf = new Map(topicPerformance(user.id).map((p) => [p.topicId, p]));
	const status = topicStatuses(user.id);
	const resumos = new Set(RESUMOS.map((r) => r.topicId));
	const selected = (url.searchParams.get('d') as DisciplineCode) || codes[0].code;
	const discipline = SYLLABUS.find((d) => d.code === selected) ?? SYLLABUS.find((d) => d.code === codes[0].code)!;
	const units = discipline.units.map((u, ui) => ({
		name: u.name,
		level: ui === 0 ? 'Fundamentos' : ui < discipline.units.length - 1 ? 'Intermediário' : 'Avançado',
		topics: u.topics.map((t) => {
			const s = topicStats(t.id);
			const p = perf.get(t.id);
			return {
				id: t.id,
				title: t.title,
				subtopics: t.subtopics,
				questions: s.questions,
				editions: s.editions,
				band: incidenceBand(s),
				avgCredit: p?.avgCredit ?? null,
				attempts: p?.attempts ?? 0,
				due: p?.due ?? false,
				status: status.get(t.id) ?? null,
				hasResumo: resumos.has(t.id)
			};
		})
	}));
	return { course, codes, selected: discipline.code, discipline: { code: discipline.code, name: discipline.name, orientacao: discipline.orientacao }, units };
};
