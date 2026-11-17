import type { DisciplineCode } from '$lib/data/official/exam-2027';

export type Difficulty = 'facil' | 'medio' | 'dificil';

export const DIFFICULTY_LABEL: Record<Difficulty, string> = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };

interface BaseQuestion {
	id: string;
	discipline: DisciplineCode;
	statement: string;
	topicIds: string[];
	language?: string;
}

/** Questão oficial (provas anteriores), com classificação e comentário publicados pela UERJ. */
export interface OfficialQuestion extends BaseQuestion {
	source: 'oficial';
	year: number;
	exam: string;
	number: number;
	programItems: string[];
	programSubitems: string[];
	objective: string;
	officialCommentary: string;
	commentaryHasFormulas: boolean;
	hasGraphic: boolean;
	requiresBaseText: boolean;
	formulaRisk: boolean;
	transcription: 'automatica' | 'revisada';
	sourceUrl: string;
	sourcePage: number;
}

/** Questão inédita — elaborada com IA; nunca apresentada como oficial. */
export interface NewQuestion extends BaseQuestion {
	source: 'inedita';
	difficulty: Difficulty;
	modelAnswer: string;
	explanation: string;
	skills: string[];
	knowledge: string[];
	patternRationale: string;
	commonMistakes: string[];
	origin: 'acervo' | 'gerada';
	model: string;
	createdAt?: string;
	/** obra relacionada, para questões sobre livros indicados */
	book?: string;
}

export type Question = OfficialQuestion | NewQuestion;

export function isOfficial(q: Question): q is OfficialQuestion {
	return q.source === 'oficial';
}

/** Referência usada pela correção: padrão/comentário oficial ou resposta-modelo. */
export function referenceAnswer(q: Question): string {
	if (q.source === 'oficial') {
		return `Objetivo da questão (UERJ): ${q.objective}\n\nComentário oficial (UERJ): ${q.officialCommentary}`;
	}
	return `Resposta-modelo: ${q.modelAnswer}\n\nExplicação: ${q.explanation}`;
}
