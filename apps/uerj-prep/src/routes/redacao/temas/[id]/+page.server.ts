import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTema } from '$lib/data/content/redacao-temas';

export const load: PageServerLoad = ({ params }) => {
	const tema = getTema(params.id);
	if (!tema) error(404, 'Proposta não encontrada.');
	return { tema };
};
