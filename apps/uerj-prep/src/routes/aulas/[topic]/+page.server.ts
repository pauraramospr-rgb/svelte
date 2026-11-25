import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTopic, topicsOf } from '$lib/domain/syllabus';
import { getApostila, getAula } from '$lib/producao';
import { episodiosDoRoteiro, roteiroDe } from '$lib/cinema/aulas';
import { GRUPOS_SERIE, especiaisProntos, especialDe, resumoEspecial, roteiroEspecial } from '$lib/especiais';
import { simuladoDaAula } from '$lib/data/content/simulados-aulas';

function resumoDoSimulado(id: string) {
	const s = simuladoDaAula(id);
	return s ? { total: s.questoes.length, oficiais: s.oficiais.length, ineditas: s.ineditas.length, minutos: s.minutos } : null;
}

export const load: PageServerLoad = ({ params }) => {
	const info = getTopic(params.topic);
	if (!info) {
		// Série especial de História do Brasil (aulas que atravessam vários tópicos).
		const esp = especialDe(params.topic);
		const roteiroEsp = esp ? roteiroEspecial(esp.id) : undefined;
		if (!esp || !roteiroEsp) error(404, 'Aula não encontrada.');
		const serie = especiaisProntos(esp.grupo).map((e) => e.id);
		const j = serie.indexOf(esp.id);
		const { episodios } = episodiosDoRoteiro(roteiroEsp);
		return {
			modo: 'roteiro' as const,
			topic: { id: esp.id, title: esp.titulo, subtopics: [] as string[] },
			discipline: 'HIS',
			temApostila: false,
			temEstudio: false,
			reviewed: roteiroEsp.revisado,
			referencias: roteiroEsp.referencias,
			prontos: episodios,
			episodios: [],
			vizinhos: { anterior: j > 0 ? serie[j - 1] : null, proximo: j >= 0 && j < serie.length - 1 ? serie[j + 1] : null },
			simulado: resumoDoSimulado(esp.id),
			especial: {
				grupo: GRUPOS_SERIE[esp.grupo],
				chamada: esp.chamada,
				temResumo: !!resumoEspecial(esp.id),
				relacionados: esp.relacionados.map((id) => ({ id, title: getTopic(id)?.topic.title ?? id }))
			}
		};
	}
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
			vizinhos,
			simulado: resumoDoSimulado(params.topic),
			especial: null
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
		vizinhos,
		simulado: resumoDoSimulado(params.topic),
		especial: null
	};
};
