import type { PageServerLoad } from './$types';
import { EM_EVIDENCIA, EVIDENCIAS } from '$lib/data/content/em-evidencia';
import { getQuestion } from '$lib/server/questions';
import { getTopic } from '$lib/domain/syllabus';
import { getResumo } from '$lib/content';
import type { OfficialQuestion } from '$lib/questions/types';

export const load: PageServerLoad = () => {
	const evidencias = EVIDENCIAS.map((e) => {
		const q = getQuestion(e.id) as OfficialQuestion | undefined;
		return q ? { id: e.id, gancho: e.gancho, year: q.year, number: q.number, objective: q.objective } : null;
	}).filter((e) => e !== null);
	const grupos = EM_EVIDENCIA.map((g) => ({
		grupo: g.grupo,
		temas: g.temas.map((t) => ({
			...t,
			topics: t.topicIds
				.map((id) => {
					const info = getTopic(id);
					return info ? { id, title: info.topic.title, editorial: !!getResumo(id) } : null;
				})
				.filter((x) => x !== null)
		}))
	}));
	return { evidencias, grupos };
};
