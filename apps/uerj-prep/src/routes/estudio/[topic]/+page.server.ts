import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTopic } from '$lib/domain/syllabus';
import { getApostila, getAula } from '$lib/producao';

export const load: PageServerLoad = ({ params }) => {
	const info = getTopic(params.topic);
	if (!info) error(404, 'Tópico não encontrado no programa oficial de 2027.');
	const aula = getAula(params.topic);
	if (!aula) error(404, 'Este tópico ainda não tem roteiro de aula.');
	return { topic: info.topic, discipline: info.discipline, aula, temApostila: !!getApostila(params.topic) };
};
