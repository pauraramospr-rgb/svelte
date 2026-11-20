import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTopic } from '$lib/domain/syllabus';
import { especialDe, resumoEspecial, roteiroEspecial } from '$lib/especiais';
import { cronograma } from '$lib/cinema/tempo';

/** Resumo aprofundado de uma aula da série especial de História do Brasil. */
export const load: PageServerLoad = ({ params }) => {
	const esp = especialDe(params.topic);
	const resumo = esp ? resumoEspecial(esp.id) : undefined;
	if (!esp || !resumo) error(404, 'Resumo aprofundado não encontrado.');
	const roteiro = roteiroEspecial(esp.id);
	const aula = roteiro
		? {
				partes: roteiro.partes.length,
				duracaoSeg: Math.round(roteiro.partes.reduce((s, p) => s + p.cenas.reduce((a, c) => a + cronograma(c.narracao).total, 0), 0))
			}
		: null;
	return {
		especial: { id: esp.id, titulo: esp.titulo, chamada: esp.chamada },
		resumo,
		aula,
		relacionados: esp.relacionados.map((id) => ({ id, title: getTopic(id)?.topic.title ?? id }))
	};
};
