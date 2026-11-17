import syllabusJson from '$lib/data/official/syllabus-2027.json';
import incidenceJson from '$lib/data/analysis/incidence.json';
import type { DisciplineCode } from '$lib/data/official/exam-2027';

export interface Topic {
	id: string;
	title: string;
	subtopics: string[];
}
export interface Unit {
	name: string;
	topics: Topic[];
}
export interface SyllabusDiscipline {
	code: DisciplineCode;
	name: string;
	orientacao: string[];
	units: Unit[];
}

export const SYLLABUS = syllabusJson as SyllabusDiscipline[];

interface Incidence {
	source: string;
	sourceUrl: string;
	years: number[];
	note: string;
	questionsPerDiscipline: Record<string, Record<string, number>>;
	topics: Record<string, Record<string, number>>;
	unmatched: Record<string, Record<string, number>>;
}
export const INCIDENCE = incidenceJson as Incidence;

const topicIndex = new Map<string, { topic: Topic; unit: string; discipline: DisciplineCode }>();
for (const d of SYLLABUS) for (const u of d.units) for (const t of u.topics) topicIndex.set(t.id, { topic: t, unit: u.name, discipline: d.code });

export function getDiscipline(code: string): SyllabusDiscipline | undefined {
	return SYLLABUS.find((d) => d.code === code);
}

export function getTopic(id: string) {
	return topicIndex.get(id);
}

export function topicsOf(code: DisciplineCode): Topic[] {
	return getDiscipline(code)?.units.flatMap((u) => u.topics) ?? [];
}

export interface TopicStats {
	/** nº de questões (2017–2026) classificadas pela UERJ neste tópico */
	questions: number;
	/** nº de edições em que o tópico apareceu ao menos uma vez */
	editions: number;
	/** total de edições analisadas */
	editionsTotal: number;
	byYear: Record<string, number>;
	/** fração das questões classificadas da disciplina (0–1) */
	share: number;
}

export function topicStats(id: string): TopicStats {
	const byYear = INCIDENCE.topics[id] ?? {};
	const disc = id.split('-')[0].toUpperCase();
	const totalDisc = Object.values(INCIDENCE.questionsPerDiscipline[disc] ?? {}).reduce((a, b) => a + b, 0);
	const questions = Object.values(byYear).reduce((a, b) => a + b, 0);
	return {
		questions,
		editions: Object.keys(byYear).length,
		editionsTotal: INCIDENCE.years.length,
		byYear,
		share: totalDisc ? questions / totalDisc : 0
	};
}

/** Faixa de incidência histórica (análise, não previsão). */
export function incidenceBand(s: TopicStats): 'alta' | 'media' | 'baixa' | 'nenhuma' {
	if (s.questions === 0) return 'nenhuma';
	const ratio = s.editions / s.editionsTotal;
	if (ratio >= 0.7) return 'alta';
	if (ratio >= 0.4) return 'media';
	return 'baixa';
}

/** Nível sugerido de estudo do tópico para uma trilha do básico ao avançado (interpretação pedagógica). */
export function topicLevelOrder(unitIndex: number, topicIndex: number): number {
	return unitIndex * 100 + topicIndex;
}
