import type { PageServerLoad } from './$types';
import { getTopic, topicsOf } from '$lib/domain/syllabus';
import { AULAS } from '$lib/producao';
import { AULAS_ROTEIRO, cenasSobMedida } from '$lib/cinema/aulas';
import { cronograma } from '$lib/cinema/tempo';

export const load: PageServerLoad = () => {
	const ordem = [...topicsOf('HIS'), ...topicsOf('LPL')].map((t) => t.id);
	const posicao = (id: string) => {
		const i = ordem.indexOf(id);
		return i < 0 ? 999 : i;
	};
	const novas = AULAS_ROTEIRO.map((a) => {
		const info = getTopic(a.topicId);
		const partes = a.partes.map((p) => ({
			numero: p.numero,
			title: p.titulo,
			cenas: p.cenas.length,
			duracaoSeg: Math.round(p.cenas.reduce((s, c) => s + cronograma(c.narracao).total, 0))
		}));
		return {
			topicId: a.topicId,
			titulo: info?.topic.title ?? a.titulo,
			discipline: info?.discipline ?? a.topicId.split('-')[0].toUpperCase(),
			partes,
			completa: true,
			duracaoSeg: partes.reduce((s, p) => s + p.duracaoSeg, 0)
		};
	});
	const antigas = AULAS.filter((a) => !novas.some((n) => n.topicId === a.topicId)).map((a) => {
		const info = getTopic(a.topicId);
		const proprias = cenasSobMedida(a.topicId);
		return {
			topicId: a.topicId,
			titulo: info?.topic.title ?? a.title,
			discipline: a.discipline,
			partes: a.episodios.map((e) => ({ numero: e.numero, title: e.title, cenas: e.cenas.length, duracaoSeg: e.duracaoSeg })),
			completa: a.episodios.every((e) => e.cenas.every((c) => proprias[c.id])),
			duracaoSeg: a.duracaoSeg
		};
	});
	const aulas = [...novas, ...antigas].sort((a, b) => posicao(a.topicId) - posicao(b.topicId));
	const total = { HIS: topicsOf('HIS').length, LPL: topicsOf('LPL').length };
	return { aulas, total };
};
