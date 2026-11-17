import officialJson from '$lib/data/official/questions-official.json';
import seedJson from '$lib/data/content/questoes-ineditas.json';
import { db } from './db';
import type { NewQuestion, OfficialQuestion, Question, Difficulty } from '$lib/questions/types';
import type { DisciplineCode } from '$lib/data/official/exam-2027';

const OFFICIAL = (officialJson as unknown as Omit<OfficialQuestion, 'source'>[]).map(
	(q) => ({ ...q, source: 'oficial' }) as OfficialQuestion
);
const SEED = (seedJson as unknown as Omit<NewQuestion, 'source' | 'origin'>[]).map(
	(q) => ({ ...q, source: 'inedita', origin: 'acervo' }) as NewQuestion
);

const officialById = new Map(OFFICIAL.map((q) => [q.id, q]));
const seedById = new Map(SEED.map((q) => [q.id, q]));

interface GeneratedRow {
	id: string;
	payload: string;
	model: string;
	created_at: string;
}

function fromRow(r: GeneratedRow): NewQuestion {
	return { ...(JSON.parse(r.payload) as NewQuestion), id: r.id, source: 'inedita', origin: 'gerada', model: r.model, createdAt: r.created_at };
}

export function getQuestion(id: string): Question | undefined {
	const o = officialById.get(id) ?? seedById.get(id);
	if (o) return o;
	const r = db().prepare('SELECT id, payload, model, created_at FROM generated_questions WHERE id = ?').get(id) as GeneratedRow | undefined;
	return r ? fromRow(r) : undefined;
}

export interface QuestionFilter {
	source?: 'oficial' | 'inedita' | '';
	discipline?: DisciplineCode | '';
	topicId?: string;
	year?: number;
	difficulty?: Difficulty | '';
	q?: string;
	language?: string;
	book?: string;
}

function normalize(s: string): string {
	return s
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase();
}

export function allGenerated(): NewQuestion[] {
	return (db().prepare('SELECT id, payload, model, created_at FROM generated_questions ORDER BY created_at DESC').all() as unknown as GeneratedRow[]).map(fromRow);
}

export function listQuestions(f: QuestionFilter): Question[] {
	let list: Question[] = [];
	if (f.source !== 'inedita') list = list.concat(OFFICIAL);
	if (f.source !== 'oficial') list = list.concat(SEED, allGenerated());
	return list.filter((q) => {
		if (f.discipline && q.discipline !== f.discipline) return false;
		if (f.topicId && !q.topicIds.includes(f.topicId)) return false;
		if (f.year && (q.source !== 'oficial' || q.year !== f.year)) return false;
		if (f.difficulty && (q.source !== 'inedita' || q.difficulty !== f.difficulty)) return false;
		if (f.language && q.language && q.language !== f.language) return false;
		if (f.book && (q.source !== 'inedita' || q.book !== f.book)) return false;
		if (f.q) {
			const needle = normalize(f.q);
			const hay = normalize(q.statement + ' ' + (q.source === 'oficial' ? q.programItems.join(' ') : q.knowledge.join(' ')));
			if (!hay.includes(needle)) return false;
		}
		return true;
	});
}

export function officialQuestions(): OfficialQuestion[] {
	return OFFICIAL;
}

export function officialYears(): number[] {
	return [...new Set(OFFICIAL.map((q) => q.year))].sort((a, b) => b - a);
}

export function saveGenerated(q: Omit<NewQuestion, 'id' | 'source' | 'origin'>, userId: number): NewQuestion {
	const id = `ia-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
	db()
		.prepare('INSERT INTO generated_questions (id, discipline, topic_id, difficulty, payload, created_by, model) VALUES (?, ?, ?, ?, ?, ?, ?)')
		.run(id, q.discipline, q.topicIds[0] ?? null, q.difficulty, JSON.stringify(q), userId, q.model);
	return getQuestion(id) as NewQuestion;
}

/** Seleção para simulados: mistura oficiais e inéditas, evitando repetir as já respondidas. */
export function pickQuestions(opts: {
	discipline: DisciplineCode;
	count: number;
	mix: 'oficial' | 'inedita' | 'misto';
	userId: number;
	language?: string | null;
	rng?: () => number;
}): Question[] {
	const rng = opts.rng ?? Math.random;
	const answered = new Set(
		(db().prepare('SELECT DISTINCT question_id FROM attempts WHERE user_id = ?').all(opts.userId) as { question_id: string }[]).map(
			(r) => r.question_id
		)
	);
	const lang = opts.discipline === 'LE' ? (opts.language ?? undefined) : undefined;
	const shuffle = <T>(a: T[]) => {
		const b = [...a];
		for (let i = b.length - 1; i > 0; i--) {
			const j = Math.floor(rng() * (i + 1));
			[b[i], b[j]] = [b[j], b[i]];
		}
		return b;
	};
	const freshFirst = (a: Question[]) => [...shuffle(a.filter((q) => !answered.has(q.id))), ...shuffle(a.filter((q) => answered.has(q.id)))];
	const off = freshFirst(listQuestions({ source: 'oficial', discipline: opts.discipline, language: lang }));
	const ine = freshFirst(listQuestions({ source: 'inedita', discipline: opts.discipline }).filter((q) => !(q as NewQuestion).book));
	let picked: Question[];
	if (opts.mix === 'oficial') picked = off.slice(0, opts.count);
	else if (opts.mix === 'inedita') picked = ine.slice(0, opts.count);
	else {
		const nIne = Math.min(ine.length, Math.floor(opts.count * 0.3));
		picked = [...off.slice(0, opts.count - nIne), ...ine.slice(0, nIne)];
	}
	if (picked.length < opts.count) {
		const extra = [...off, ...ine].filter((q) => !picked.includes(q));
		picked = picked.concat(extra.slice(0, opts.count - picked.length));
	}
	return picked;
}

/** Exemplos oficiais do mesmo tópico/disciplina para orientar a IA (estilo da banca). */
export function styleExamples(discipline: DisciplineCode, topicId: string | undefined, n = 3): OfficialQuestion[] {
	const same = OFFICIAL.filter((q) => q.discipline === discipline && !q.hasGraphic && (!topicId || q.topicIds.includes(topicId)));
	const pool = same.length >= n ? same : OFFICIAL.filter((q) => q.discipline === discipline && !q.hasGraphic);
	return [...pool].sort((a, b) => b.year - a.year).slice(0, n);
}
