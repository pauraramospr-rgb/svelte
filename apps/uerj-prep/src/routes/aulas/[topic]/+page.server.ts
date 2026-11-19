import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTopic, topicsOf } from '$lib/domain/syllabus';
import { getApostila, getAula } from '$lib/producao';
import { episodiosDoRoteiro, roteiroDe } from '$lib/cinema/aulas';

export const load: PageServerLoad = ({ params }) => {
	const info = getTopic(params.topic);
	if (!info) error(404, 'Tópico não encontrado no programa oficial de 2027.');
	const ordem = topicsOf(info.discipline).map((t) => t.id);
	const i = ordem.indexOf(params.topic);
	const vizinhos = { anterior: i > 0 ? ordem[i - 1] : null, proximo: i >= 0 && i < ordem.length - 1 ? ordem[i + 1] : null };
	const roteiro = roteiroDe(params.topic);
	if (roteiro) {
		const { episodios } = episodiosDoRoteiro(roteiro);
		return {
			modo: 'roteiro' as const,
			topic: info.topic,
			discipline: info.discipline,
			temApostila: !!getApostila(params.topic),
			temEstudio: !!getAula(params.topic),
			reviewed: roteiro.revisado,
			referencias: roteiro.referencias,
			prontos: episodios,
			episodios: [],
			vizinhos
		};
	}
	const aula = getAula(params.topic);
	if (!aula) error(404, 'Este tópico ainda não tem aula animada.');
	return {
		modo: 'producao' as const,
		topic: info.topic,
		discipline: info.discipline,
		temApostila: !!getApostila(params.topic),
		temEstudio: true,
		reviewed: aula.reviewed,
		referencias: aula.references,
		prontos: [],
		episodios: aula.episodios.map((e) => ({ numero: e.numero, title: e.title, objetivo: e.objetivo, cenas: e.cenas.map((c) => ({ ...c })) })),
		vizinhos
	};
};
