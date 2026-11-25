import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { simuladoDaAula } from '$lib/data/content/simulados-aulas';
import { cadernoDaQuestao } from '$lib/data/official/caderno';
import { getTopic } from '$lib/domain/syllabus';
import { especialDe } from '$lib/especiais';
import { getQuestion } from '$lib/server/questions';
import { aulaDoSimulado, createSimuladoDaAula, listSimulados } from '$lib/server/simulados';

function tituloDaAula(id: string): string | undefined {
	return getTopic(id)?.topic.title ?? especialDe(id)?.titulo;
}

export const load: PageServerLoad = ({ params, locals }) => {
	const s = simuladoDaAula(params.aula);
	const titulo = tituloDaAula(params.aula);
	if (!s || !titulo) error(404, 'Esta aula ainda não tem simulado.');
	const questoes = s.questoes.map((id) => {
		const q = getQuestion(id)!;
		return q.source === 'oficial'
			? { id, oficial: true, rotulo: `UERJ ${q.year} · questão ${String(q.number).padStart(2, '0')}`, caderno: cadernoDaQuestao(id).length > 0 }
			: { id, oficial: false, rotulo: 'Questão inédita · não oficial', caderno: false };
	});
	const feitos = listSimulados(locals.user!.id)
		.filter((r) => aulaDoSimulado(r) === params.aula)
		.map((r) => ({ id: r.id, inicio: r.started_at, concluido: !!r.finished_at, resultado: r.result ? (JSON.parse(r.result) as { discursive: number; complete: boolean }) : null }));
	return {
		aula: { id: params.aula, titulo, disciplina: s.disciplina, especial: !getTopic(params.aula) },
		questoes,
		minutos: s.minutos,
		feitos
	};
};

export const actions: Actions = {
	default: ({ params, locals }) => {
		const titulo = tituloDaAula(params.aula);
		const id = titulo ? createSimuladoDaAula(locals.user!, params.aula, titulo) : null;
		if (!id) return fail(400, { error: 'Não foi possível montar o simulado desta aula.' });
		redirect(303, `/simulados/${id}`);
	}
};
