import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { episodiosDaAula } from '$lib/intensivao';

/** As partes de uma aula, inteiras, prontas para o player (o Intensivão carrega uma aula por vez). */
export const GET: RequestHandler = ({ params }) => {
	const episodios = episodiosDaAula(params.aula);
	if (!episodios) error(404, 'Aula não encontrada.');
	return json(episodios, { headers: { 'cache-control': 'public, max-age=3600' } });
};
