import type { PageServerLoad } from './$types';
import { getTopic } from '$lib/domain/syllabus';
import { AULAS, documentoDeProducao } from '$lib/producao';
import { parseDoc } from '$lib/content';

export const load: PageServerLoad = () => {
	const projetos = AULAS.map((a) => {
		const info = getTopic(a.topicId);
		return {
			topicId: a.topicId,
			topicTitle: info?.topic.title ?? a.title,
			discipline: a.discipline,
			reviewed: a.reviewed,
			episodios: a.episodios.map((e) => ({ numero: e.numero, title: e.title, cenas: e.cenas.length, duracaoSeg: e.duracaoSeg })),
			cenas: a.episodios.reduce((s, e) => s + e.cenas.length, 0),
			duracaoSeg: a.duracaoSeg
		};
	});
	return {
		projetos,
		diretrizes: parseDoc(documentoDeProducao('diretrizes')).body,
		diagnostico: parseDoc(documentoDeProducao('diagnostico')).body
	};
};
