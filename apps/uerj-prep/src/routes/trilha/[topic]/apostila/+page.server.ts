import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTopic } from '$lib/domain/syllabus';
import { getApostila, getAula } from '$lib/producao';

export const load: PageServerLoad = ({ params }) => {
	const info = getTopic(params.topic);
	if (!info) error(404, 'Tópico não encontrado no programa oficial de 2027.');
	const apostila = getApostila(params.topic);
	if (!apostila) error(404, 'Este tópico ainda não tem apostila completa.');
	const aula = getAula(params.topic);
	return {
		topic: info.topic,
		discipline: info.discipline,
		apostila,
		aula: aula ? { episodios: aula.episodios.length, cenas: aula.episodios.reduce((s, e) => s + e.cenas.length, 0), duracaoSeg: aula.duracaoSeg } : null
	};
};
