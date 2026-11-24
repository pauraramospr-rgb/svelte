import type { PageServerLoad } from './$types';
import { getTopic, topicsOf } from '$lib/domain/syllabus';
import { AULAS } from '$lib/producao';
import { AULAS_ROTEIRO, cenasSobMedida } from '$lib/cinema/aulas';
import { GRUPOS_SERIE, especiaisProntos, resumoEspecial, roteiroEspecial } from '$lib/especiais';
import { duracaoDaCena, gravacaoDe } from '$lib/cinema/gravacoes';

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
			duracaoSeg: Math.round(p.cenas.reduce((s, c) => s + duracaoDaCena(a.topicId, c), 0))
		}));
		const cenas = a.partes.flatMap((p) => p.cenas);
		const gravadas = cenas.filter((c) => gravacaoDe(a.topicId, c.id, c.narracao)).length;
		return {
			topicId: a.topicId,
			titulo: info?.topic.title ?? a.titulo,
			discipline: info?.discipline ?? a.topicId.split('-')[0].toUpperCase(),
			partes,
			completa: true,
			duracaoSeg: partes.reduce((s, p) => s + p.duracaoSeg, 0),
			vozGravada: gravadas === 0 ? ('nao' as const) : gravadas === cenas.length ? ('toda' as const) : ('parte' as const)
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
	const especiais = especiaisProntos().map((e) => {
		const r = roteiroEspecial(e.id)!;
		const partes = r.partes.map((p) => ({
			numero: p.numero,
			title: p.titulo,
			cenas: p.cenas.length,
			duracaoSeg: Math.round(p.cenas.reduce((s, c) => s + duracaoDaCena(e.id, c), 0))
		}));
		const cenas = r.partes.flatMap((p) => p.cenas);
		const gravadas = cenas.filter((c) => gravacaoDe(e.id, c.id, c.narracao)).length;
		return {
			...e,
			partes,
			duracaoSeg: partes.reduce((s, p) => s + p.duracaoSeg, 0),
			temResumo: !!resumoEspecial(e.id),
			vozGravada: gravadas === 0 ? ('nao' as const) : gravadas === cenas.length ? ('toda' as const) : ('parte' as const)
		};
	});
	const serie = (Object.keys(GRUPOS_SERIE) as (keyof typeof GRUPOS_SERIE)[])
		.map((g) => ({ grupo: g, nome: GRUPOS_SERIE[g], aulas: especiais.filter((e) => e.grupo === g) }))
		.filter((g) => g.aulas.length);
	return { aulas, total, especiais, serie };
};
