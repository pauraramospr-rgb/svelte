import type { PageServerLoad } from './$types';
import { getTopic } from '$lib/domain/syllabus';
import { AULAS } from '$lib/producao';
import { cenasSobMedida } from '$lib/cinema/aulas';

export const load: PageServerLoad = () => {
	const aulas = AULAS.map((a) => {
		const info = getTopic(a.topicId);
		const proprias = cenasSobMedida(a.topicId);
		return {
			topicId: a.topicId,
			titulo: info?.topic.title ?? a.title,
			discipline: a.discipline,
			episodios: a.episodios.map((e) => ({
				numero: e.numero,
				title: e.title,
				cenas: e.cenas.length,
				sobMedida: e.cenas.filter((c) => proprias[c.id]).length,
				duracaoSeg: e.duracaoSeg
			})),
			duracaoSeg: a.duracaoSeg
		};
	});
	return { aulas };
};
