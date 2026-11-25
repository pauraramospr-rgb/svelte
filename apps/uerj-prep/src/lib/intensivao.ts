/**
 * Intensivão: todas as aulas animadas, inteiras, uma depois da outra — sem cortes nem resumos. A lista segue a
 * ordem da plataforma: a trilha de História (na ordem do programa), a série especial de História e a trilha de
 * Língua Portuguesa e Literaturas. Cada aula é carregada inteira, na hora de tocar (ver /api/aulas/[aula]/episodios).
 */
import { topicsOf, getTopic } from '$lib/domain/syllabus';
import { episodiosDoRoteiro, roteiroDe } from '$lib/cinema/aulas';
import type { AulaRoteiro } from '$lib/cinema/roteiro';
import { duracaoDaCena } from '$lib/cinema/gravacoes';
import { especiaisProntos, roteiroEspecial } from '$lib/especiais';

export type SequenciaIntensivao = 'tudo' | 'HIS' | 'LPL';

export interface AulaDoIntensivao {
	id: string;
	titulo: string;
	grupo: string;
	disciplina: 'HIS' | 'LPL';
	partes: number;
	cenas: number;
	/** Duração estimada (s): pela gravação, quando houver; senão, pela voz sintetizada. */
	duracaoSeg: number;
}

export const GRUPOS_INTENSIVAO = ['História · trilha do programa', 'História · série especial', 'Língua Portuguesa e Literaturas'] as const;

/** Duração de abertura de cada parte (cartela com o título), como no player. */
const ABERTURA_SEG = 6;

function roteiroDaAula(id: string): AulaRoteiro | undefined {
	return roteiroDe(id) ?? roteiroEspecial(id);
}

function item(id: string, titulo: string, grupo: string, disciplina: 'HIS' | 'LPL'): AulaDoIntensivao | null {
	const r = roteiroDaAula(id);
	if (!r) return null;
	const cenas = r.partes.flatMap((p) => p.cenas);
	const duracaoSeg = Math.round(cenas.reduce((s, c) => s + duracaoDaCena(id, c), 0) + r.partes.length * ABERTURA_SEG);
	return { id, titulo, grupo, disciplina, partes: r.partes.length, cenas: cenas.length, duracaoSeg };
}

/** Todas as aulas prontas, na ordem em que o Intensivão as toca. */
export function aulasDoIntensivao(): AulaDoIntensivao[] {
	const [trilhaHis, serie, trilhaLpl] = GRUPOS_INTENSIVAO;
	return [
		...topicsOf('HIS').map((t) => item(t.id, t.title, trilhaHis, 'HIS')),
		...especiaisProntos().map((e) => item(e.id, e.titulo, serie, 'HIS')),
		...topicsOf('LPL').map((t) => item(t.id, t.title, trilhaLpl, 'LPL'))
	].filter((a): a is AulaDoIntensivao => a !== null);
}

/** Partes (episódios) prontas para tocar de uma aula da trilha ou da série especial. */
export function episodiosDaAula(id: string) {
	const r = roteiroDaAula(id);
	return r ? episodiosDoRoteiro(r).episodios : null;
}

/** Título de uma aula (tópico do programa ou aula da série especial). */
export function tituloDaAula(id: string): string | undefined {
	return getTopic(id)?.topic.title ?? especiaisProntos().find((e) => e.id === id)?.titulo;
}
