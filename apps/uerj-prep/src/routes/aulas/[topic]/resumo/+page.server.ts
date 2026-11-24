import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTopic } from '$lib/domain/syllabus';
import { GRUPOS_SERIE, especialDe, resumoEspecial, roteiroEspecial } from '$lib/especiais';
import { duracaoDaCena } from '$lib/cinema/gravacoes';

/** Resumo aprofundado de uma aula da série especial (História do Brasil ou História Geral). */
export const load: PageServerLoad = ({ params }) => {
	const esp = especialDe(params.topic);
	const resumo = esp ? resumoEspecial(esp.id) : undefined;
	if (!esp || !resumo) error(404, 'Resumo aprofundado não encontrado.');
	const roteiro = roteiroEspecial(esp.id);
	const aula = roteiro
		? {
				partes: roteiro.partes.length,
				duracaoSeg: Math.round(roteiro.partes.reduce((s, p) => s + p.cenas.reduce((a, c) => a + duracaoDaCena(esp.id, c), 0), 0))
			}
		: null;
	return {
		especial: { id: esp.id, titulo: esp.titulo, chamada: esp.chamada, grupo: GRUPOS_SERIE[esp.grupo] },
		resumo,
		aula,
		relacionados: esp.relacionados.map((id) => ({ id, title: getTopic(id)?.topic.title ?? id }))
	};
};
