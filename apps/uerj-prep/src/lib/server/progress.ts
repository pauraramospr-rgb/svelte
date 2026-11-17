import { db, tx } from './db';
import { NEW_CARD, qualityFromCredit, review, addDays, capToExam, type CardState } from '$lib/domain/srs';
import type { Question } from '$lib/questions/types';
import { getTopic } from '$lib/domain/syllabus';

export interface AttemptRow {
	id: number;
	question_id: string;
	discipline: string;
	topic_ids: string;
	answer: string;
	credit: number | null;
	grading_method: 'ia' | 'autoavaliacao' | 'pendente';
	feedback: string | null;
	time_seconds: number;
	simulado_id: number | null;
	created_at: string;
}

export function recordAttempt(args: {
	userId: number;
	question: Question;
	answer: string;
	credit: number | null;
	method: 'ia' | 'autoavaliacao' | 'pendente';
	feedback?: unknown;
	timeSeconds?: number;
	simuladoId?: number | null;
	examDate?: string;
}): number {
	return tx(() => {
		const res = db()
			.prepare(
				'INSERT INTO attempts (user_id, question_id, discipline, topic_ids, answer, credit, grading_method, feedback, time_seconds, simulado_id) VALUES (?,?,?,?,?,?,?,?,?,?)'
			)
			.run(
				args.userId,
				args.question.id,
				args.question.discipline,
				JSON.stringify(args.question.topicIds),
				args.answer,
				args.credit,
				args.method,
				args.feedback === undefined ? null : JSON.stringify(args.feedback),
				Math.max(0, Math.round(args.timeSeconds ?? 0)),
				args.simuladoId ?? null
			);
		if (args.credit !== null) updateCards(args.userId, args.question, args.credit, args.examDate);
		return Number(res.lastInsertRowid);
	});
}

/** Atualiza a nota de uma tentativa (ex.: autoavaliação depois de ver o padrão de respostas). */
export function gradeAttempt(userId: number, attemptId: number, question: Question, credit: number, method: 'ia' | 'autoavaliacao', feedback?: unknown, examDate?: string): void {
	tx(() => {
		const prev = db().prepare('SELECT credit FROM attempts WHERE id = ? AND user_id = ?').get(attemptId, userId) as { credit: number | null } | undefined;
		if (!prev) throw new Error('Tentativa não encontrada');
		db()
			.prepare('UPDATE attempts SET credit = ?, grading_method = ?, feedback = COALESCE(?, feedback) WHERE id = ? AND user_id = ?')
			.run(credit, method, feedback === undefined ? null : JSON.stringify(feedback), attemptId, userId);
		if (prev.credit === null) updateCards(userId, question, credit, examDate);
	});
}

function updateCards(userId: number, q: Question, credit: number, examDate = '2026-11-29'): void {
	const now = new Date();
	const exam = new Date(examDate + 'T09:00:00-03:00');
	for (const topicId of q.topicIds) {
		const row = db()
			.prepare('SELECT ease, interval_days, repetitions, lapses FROM review_cards WHERE user_id = ? AND topic_id = ?')
			.get(userId, topicId) as CardState | undefined;
		const next = review(row ?? NEW_CARD, qualityFromCredit(credit));
		const due = capToExam(addDays(now, next.interval_days), exam, now);
		db()
			.prepare(
				`INSERT INTO review_cards (user_id, topic_id, discipline, ease, interval_days, repetitions, lapses, due_at, last_reviewed_at)
				 VALUES (?,?,?,?,?,?,?,?,?)
				 ON CONFLICT(user_id, topic_id) DO UPDATE SET ease=excluded.ease, interval_days=excluded.interval_days,
				 repetitions=excluded.repetitions, lapses=excluded.lapses, due_at=excluded.due_at, last_reviewed_at=excluded.last_reviewed_at`
			)
			.run(userId, topicId, q.discipline, next.ease, next.interval_days, next.repetitions, next.lapses, due.toISOString(), now.toISOString());
	}
}

export function attemptsFor(userId: number, questionId: string): AttemptRow[] {
	return db()
		.prepare('SELECT * FROM attempts WHERE user_id = ? AND question_id = ? ORDER BY created_at DESC, id DESC')
		.all(userId, questionId) as unknown as AttemptRow[];
}

export function getAttempt(userId: number, id: number): AttemptRow | undefined {
	return db().prepare('SELECT * FROM attempts WHERE user_id = ? AND id = ?').get(userId, id) as AttemptRow | undefined;
}

export interface TopicPerformance {
	topicId: string;
	title: string;
	discipline: string;
	attempts: number;
	graded: number;
	avgCredit: number | null;
	errorRate: number | null;
	lapses: number;
	persistent: boolean;
	due: boolean;
	dueAt: string | null;
}

/**
 * Desempenho por tópico. "Dificuldade persistente": ao menos 3 tentativas corrigidas com
 * média de crédito < 0,5, ou 2+ lapsos na revisão espaçada (critério da plataforma).
 */
export function topicPerformance(userId: number): TopicPerformance[] {
	const rows = db()
		.prepare('SELECT topic_ids, credit FROM attempts WHERE user_id = ?')
		.all(userId) as { topic_ids: string; credit: number | null }[];
	const agg = new Map<string, { n: number; g: number; sum: number }>();
	for (const r of rows) {
		for (const t of JSON.parse(r.topic_ids) as string[]) {
			const a = agg.get(t) ?? { n: 0, g: 0, sum: 0 };
			a.n++;
			if (r.credit !== null) {
				a.g++;
				a.sum += r.credit;
			}
			agg.set(t, a);
		}
	}
	const cards = new Map(
		(db().prepare('SELECT topic_id, lapses, due_at FROM review_cards WHERE user_id = ?').all(userId) as { topic_id: string; lapses: number; due_at: string }[]).map((c) => [
			c.topic_id,
			c
		])
	);
	const now = new Date().toISOString();
	const out: TopicPerformance[] = [];
	for (const [topicId, a] of agg) {
		const info = getTopic(topicId);
		const card = cards.get(topicId);
		const avg = a.g ? a.sum / a.g : null;
		out.push({
			topicId,
			title: info?.topic.title ?? topicId,
			discipline: info?.discipline ?? topicId.split('-')[0].toUpperCase(),
			attempts: a.n,
			graded: a.g,
			avgCredit: avg,
			errorRate: avg === null ? null : 1 - avg,
			lapses: card?.lapses ?? 0,
			persistent: (a.g >= 3 && (avg ?? 1) < 0.5) || (card?.lapses ?? 0) >= 2,
			due: Boolean(card && card.due_at <= now),
			dueAt: card?.due_at ?? null
		});
	}
	return out.sort((x, y) => (y.errorRate ?? -1) - (x.errorRate ?? -1));
}

export function dueCards(userId: number): { topic_id: string; discipline: string; due_at: string; interval_days: number; lapses: number }[] {
	return db()
		.prepare('SELECT topic_id, discipline, due_at, interval_days, lapses FROM review_cards WHERE user_id = ? AND due_at <= ? ORDER BY due_at')
		.all(userId, new Date().toISOString()) as unknown as { topic_id: string; discipline: string; due_at: string; interval_days: number; lapses: number }[];
}

export function upcomingCards(userId: number, limit = 20) {
	return db()
		.prepare('SELECT topic_id, discipline, due_at, interval_days FROM review_cards WHERE user_id = ? AND due_at > ? ORDER BY due_at LIMIT ?')
		.all(userId, new Date().toISOString(), limit) as unknown as { topic_id: string; discipline: string; due_at: string; interval_days: number }[];
}

/** Evolução semanal: média de crédito por semana e por disciplina. */
export function weeklyEvolution(userId: number): { week: string; discipline: string; avg: number; n: number }[] {
	return db()
		.prepare(
			`SELECT strftime('%Y-%W', created_at) AS week, discipline, AVG(credit) AS avg, COUNT(*) AS n
			 FROM attempts WHERE user_id = ? AND credit IS NOT NULL GROUP BY week, discipline ORDER BY week`
		)
		.all(userId) as unknown as { week: string; discipline: string; avg: number; n: number }[];
}

export function overview(userId: number) {
	const a = db()
		.prepare(
			`SELECT COUNT(*) AS total, SUM(CASE WHEN credit IS NOT NULL THEN 1 ELSE 0 END) AS graded,
			 AVG(credit) AS avg, SUM(time_seconds) AS seconds FROM attempts WHERE user_id = ?`
		)
		.get(userId) as { total: number; graded: number | null; avg: number | null; seconds: number | null };
	const essays = db().prepare('SELECT COUNT(*) AS n, AVG(score) AS avg FROM essays WHERE user_id = ? AND score IS NOT NULL').get(userId) as {
		n: number;
		avg: number | null;
	};
	const sims = db().prepare('SELECT COUNT(*) AS n FROM simulados WHERE user_id = ? AND finished_at IS NOT NULL').get(userId) as { n: number };
	return { attempts: a.total, graded: a.graded ?? 0, avgCredit: a.avg, studySeconds: a.seconds ?? 0, essays: essays.n, essayAvg: essays.avg, simulados: sims.n };
}

export function byDiscipline(userId: number): { discipline: string; n: number; graded: number; avg: number | null }[] {
	return db()
		.prepare(
			`SELECT discipline, COUNT(*) AS n, SUM(CASE WHEN credit IS NOT NULL THEN 1 ELSE 0 END) AS graded, AVG(credit) AS avg
			 FROM attempts WHERE user_id = ? GROUP BY discipline ORDER BY discipline`
		)
		.all(userId) as unknown as { discipline: string; n: number; graded: number; avg: number | null }[];
}

export function setTopicStatus(userId: number, topicId: string, status: 'estudando' | 'concluido' | null): void {
	if (status === null) db().prepare('DELETE FROM topic_progress WHERE user_id = ? AND topic_id = ?').run(userId, topicId);
	else
		db()
			.prepare(
				"INSERT INTO topic_progress (user_id, topic_id, status) VALUES (?,?,?) ON CONFLICT(user_id, topic_id) DO UPDATE SET status = excluded.status, updated_at = datetime('now')"
			)
			.run(userId, topicId, status);
}

export function topicStatuses(userId: number): Map<string, 'estudando' | 'concluido'> {
	return new Map(
		(db().prepare('SELECT topic_id, status FROM topic_progress WHERE user_id = ?').all(userId) as { topic_id: string; status: 'estudando' | 'concluido' }[]).map((r) => [
			r.topic_id,
			r.status
		])
	);
}
