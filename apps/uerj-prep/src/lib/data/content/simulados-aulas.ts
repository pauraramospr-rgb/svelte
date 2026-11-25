/**
 * Simulado de cada aula animada: questões oficiais da UERJ classificadas no tópico da aula (de preferência as
 * de 2024–2026, que têm o caderno de prova reproduzido) e questões inéditas escritas a partir do conteúdo da
 * aula, sempre rotuladas como não oficiais. Os arquivos ficam em simulados-aulas/: his.json (trilha de
 * História), esp.json (série especial) e lpl.json (Língua Portuguesa e Literaturas).
 */
import his from './simulados-aulas/his.json';
import esp from './simulados-aulas/esp.json';
import lpl from './simulados-aulas/lpl.json';
import type { DisciplineCode } from '$lib/data/official/exam-2027';

interface Arquivo {
	aulas: Record<string, { oficiais: string[]; ineditas: string[] }>;
	questoes: Record<string, unknown>[];
}

const ARQUIVOS = [his, esp, lpl] as unknown as Arquivo[];

/** Tempo sugerido por questão discursiva (a prova tem cerca de 2 h para as 10 questões de cada disciplina). */
export const MINUTOS_POR_QUESTAO = 15;

export interface SimuladoDaAula {
	aula: string;
	disciplina: DisciplineCode;
	oficiais: string[];
	ineditas: string[];
	/** Ordem de aplicação: primeiro as oficiais, depois as inéditas. */
	questoes: string[];
	minutos: number;
}

/** Questões inéditas escritas para os simulados das aulas (entram no banco como acervo da plataforma). */
export const QUESTOES_DAS_AULAS = ARQUIVOS.flatMap((a) => a.questoes);

export const SIMULADOS_DAS_AULAS: SimuladoDaAula[] = ARQUIVOS.flatMap((a) =>
	Object.entries(a.aulas).map(([aula, s]) => ({
		aula,
		disciplina: (aula.startsWith('lpl-') ? 'LPL' : 'HIS') as DisciplineCode,
		oficiais: s.oficiais,
		ineditas: s.ineditas,
		questoes: [...s.oficiais, ...s.ineditas],
		minutos: (s.oficiais.length + s.ineditas.length) * MINUTOS_POR_QUESTAO
	}))
);

const POR_AULA = new Map(SIMULADOS_DAS_AULAS.map((s) => [s.aula, s]));

export function simuladoDaAula(aula: string): SimuladoDaAula | undefined {
	return POR_AULA.get(aula);
}
