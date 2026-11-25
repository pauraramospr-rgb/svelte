import type { PageServerLoad } from './$types';
import { aulaDoSimulado, listSimulados } from '$lib/server/simulados';
import { simuladoDaAula } from '$lib/data/content/simulados-aulas';
import { topicsOf } from '$lib/domain/syllabus';
import { especiaisProntos } from '$lib/especiais';

export const load: PageServerLoad = ({ locals }) => {
	const lista = listSimulados(locals.user!.id);
	const concluidas = new Set(lista.filter((s) => s.finished_at).map(aulaDoSimulado).filter(Boolean));
	const item = (id: string, titulo: string) => {
		const s = simuladoDaAula(id);
		return s ? [{ id, titulo, questoes: s.questoes.length, oficiais: s.oficiais.length, feito: concluidas.has(id) }] : [];
	};
	const porAula = [
		{ grupo: 'História', aulas: topicsOf('HIS').flatMap((t) => item(t.id, t.title)) },
		{ grupo: 'História · série especial', aulas: especiaisProntos().flatMap((e) => item(e.id, e.titulo)) },
		{ grupo: 'Língua Portuguesa e Literaturas', aulas: topicsOf('LPL').flatMap((t) => item(t.id, t.title)) }
	].filter((g) => g.aulas.length);
	return {
		porAula,
		simulados: lista.map((s) => ({
			id: s.id,
			title: s.title,
			kind: s.kind,
			started_at: s.started_at,
			finished_at: s.finished_at,
			elapsed: s.elapsed_seconds,
			result: s.result ? JSON.parse(s.result) : null
		}))
	};
};
