import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getObra } from '$lib/data/content/obras';
import { listQuestions } from '$lib/server/questions';

export const load: PageServerLoad = ({ params }) => {
	const obra = getObra(params.slug);
	if (!obra) error(404, 'Obra não encontrada.');
	const questions = listQuestions({ source: 'inedita', book: obra.title }).map((q) => ({ id: q.id, statement: q.statement.slice(0, 240) }));
	return { obra, questions };
};
