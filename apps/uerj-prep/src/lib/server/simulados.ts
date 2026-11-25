import { db, tx } from './db';
import type { User } from './auth';
import { findCourse, courseDisciplines } from '$lib/data/official/courses-2027';
import { DISCIPLINES, type DisciplineCode } from '$lib/data/official/exam-2027';
import { pickQuestions, getQuestion } from './questions';
import { recordAttempt } from './progress';
import { TEMAS_2027, getTema } from '$lib/data/content/redacao-temas';
import { REDACAO_HISTORY } from '$lib/data/official/redacao-history';
import { provaPoints, estimateExam, type ProvaScore } from '$lib/domain/scoring';
import { simuladoDaAula } from '$lib/data/content/simulados-aulas';

export interface SimuladoConfig {
	kind: 'completo' | 'disciplina';
	disciplines: { code: DisciplineCode; weight: 1 | 2 }[];
	perProva: number;
	mix: 'oficial' | 'inedita' | 'misto';
	themeId?: string;
	/** Simulado de uma aula animada (questões fixas, definidas em simulados-aulas). */
	aulaId?: string;
}

export interface SimuladoRow {
	id: number;
	user_id: number;
	kind: 'completo' | 'disciplina';
	title: string;
	config: string;
	duration_minutes: number;
	started_at: string;
	finished_at: string | null;
	elapsed_seconds: number | null;
	result: string | null;
}

export interface ItemRow {
	simulado_id: number;
	position: number;
	question_id: string;
	discipline: string;
	answer: string;
	time_seconds: number;
	attempt_id: number | null;
}

/** Item de redação: question_id = "redacao:<temaId>" */
export function redacaoPrompt(questionId: string): { title: string; question: string; book: string } | null {
	if (!questionId.startsWith('redacao:')) return null;
	const id = questionId.slice(8);
	const t = getTema(id);
	if (t) return { title: 'Proposta plausível (não oficial)', question: t.question, book: 'O bem-amado, de Dias Gomes' };
	const h = REDACAO_HISTORY.find((r) => `oficial-${r.edition}` === id);
	if (h) return { title: `Proposta oficial UERJ ${h.edition}`, question: h.question, book: h.book ?? '' };
	return null;
}

export function createSimulado(user: User, cfg: SimuladoConfig, durationMinutes: number): number {
	return tx(() => {
		const items: { qid: string; disc: string }[] = [];
		for (const d of cfg.disciplines) {
			if (d.code === 'RED') {
				const theme = cfg.themeId ?? TEMAS_2027[Math.floor(Math.random() * TEMAS_2027.length)].id;
				items.push({ qid: `redacao:${theme}`, disc: 'RED' });
				continue;
			}
			const qs = pickQuestions({ discipline: d.code, count: cfg.perProva, mix: cfg.mix, userId: user.id, language: user.le_language });
			for (const q of qs) items.push({ qid: q.id, disc: d.code });
		}
		const title =
			cfg.kind === 'completo'
				? `Simulado completo – ${cfg.disciplines.map((d) => DISCIPLINES[d.code].short).join(' + ')}`
				: `Simulado de ${DISCIPLINES[cfg.disciplines[0].code].name}`;
		const res = db()
			.prepare('INSERT INTO simulados (user_id, kind, title, config, duration_minutes) VALUES (?,?,?,?,?)')
			.run(user.id, cfg.kind, title, JSON.stringify(cfg), durationMinutes);
		const id = Number(res.lastInsertRowid);
		const ins = db().prepare('INSERT INTO simulado_items (simulado_id, position, question_id, discipline) VALUES (?,?,?,?)');
		items.forEach((it, i) => ins.run(id, i + 1, it.qid, it.disc));
		return id;
	});
}

/** Simulado de uma aula: as questões oficiais do tópico e as inéditas escritas para a aula, nessa ordem. */
export function createSimuladoDaAula(user: User, aulaId: string, tituloAula: string): number | null {
	const s = simuladoDaAula(aulaId);
	if (!s || !s.questoes.every((id) => getQuestion(id))) return null;
	const cfg: SimuladoConfig = { kind: 'disciplina', disciplines: [{ code: s.disciplina, weight: 1 }], perProva: s.questoes.length, mix: 'misto', aulaId };
	return tx(() => {
		const res = db()
			.prepare('INSERT INTO simulados (user_id, kind, title, config, duration_minutes) VALUES (?,?,?,?,?)')
			.run(user.id, cfg.kind, `Simulado da aula: ${tituloAula}`, JSON.stringify(cfg), s.minutos);
		const id = Number(res.lastInsertRowid);
		const ins = db().prepare('INSERT INTO simulado_items (simulado_id, position, question_id, discipline) VALUES (?,?,?,?)');
		s.questoes.forEach((qid, i) => ins.run(id, i + 1, qid, s.disciplina));
		return id;
	});
}

/** Aula de cada simulado já feito (para marcar as aulas com simulado concluído). */
export function aulaDoSimulado(row: SimuladoRow): string | undefined {
	try {
		return (JSON.parse(row.config) as SimuladoConfig).aulaId;
	} catch {
		return undefined;
	}
}

export function defaultConfig(user: User, kind: 'completo' | 'disciplina', discipline?: DisciplineCode): SimuladoConfig | null {
	if (kind === 'completo') {
		const c = findCourse(user.course_id);
		if (!c) return null;
		return { kind, disciplines: courseDisciplines(c).map((d) => ({ code: d.code, weight: d.weight })), perProva: 10, mix: 'misto' };
	}
	if (!discipline) return null;
	return { kind, disciplines: [{ code: discipline, weight: 1 }], perProva: 5, mix: 'misto' };
}

export function getSimulado(userId: number, id: number): { sim: SimuladoRow; cfg: SimuladoConfig; items: ItemRow[] } | null {
	const sim = db().prepare('SELECT * FROM simulados WHERE id = ? AND user_id = ?').get(id, userId) as SimuladoRow | undefined;
	if (!sim) return null;
	const items = db().prepare('SELECT * FROM simulado_items WHERE simulado_id = ? ORDER BY position').all(id) as unknown as ItemRow[];
	return { sim, cfg: JSON.parse(sim.config) as SimuladoConfig, items };
}

export function listSimulados(userId: number): SimuladoRow[] {
	return db().prepare('SELECT * FROM simulados WHERE user_id = ? ORDER BY id DESC').all(userId) as unknown as SimuladoRow[];
}

/** Prazo final do simulado (início + duração). */
export function deadline(sim: SimuladoRow): Date {
	return new Date(new Date(sim.started_at + 'Z').getTime() + sim.duration_minutes * 60_000);
}

export function saveAnswer(userId: number, simId: number, position: number, answer: string, timeSeconds: number): boolean {
	const s = getSimulado(userId, simId);
	if (!s || s.sim.finished_at) return false;
	db()
		.prepare('UPDATE simulado_items SET answer = ?, time_seconds = MAX(time_seconds, ?) WHERE simulado_id = ? AND position = ?')
		.run(answer.slice(0, 12000), Math.max(0, Math.round(timeSeconds)), simId, position);
	return true;
}

/** Encerra o simulado: registra tentativas (pendentes) e cria a redação para correção. */
export function finishSimulado(user: User, simId: number): void {
	const s = getSimulado(user.id, simId);
	if (!s || s.sim.finished_at) return;
	tx(() => {
		const elapsed = Math.min(
			s.sim.duration_minutes * 60,
			Math.round((Date.now() - new Date(s.sim.started_at + 'Z').getTime()) / 1000)
		);
		for (const it of s.items) {
			if (it.discipline === 'RED') {
				const p = redacaoPrompt(it.question_id);
				if (!it.answer.trim()) continue;
				const [first, ...rest] = it.answer.split('\n');
				const hasTitle = first.trim().length > 0 && first.trim().length < 90 && rest.join('').trim().length > 0;
				const res = db()
					.prepare('INSERT INTO essays (user_id, theme_id, prompt, title, body) VALUES (?,?,?,?,?)')
					.run(user.id, it.question_id.slice(8), `${p?.question ?? ''} (base: ${p?.book ?? ''})`, hasTitle ? first.trim() : '', hasTitle ? rest.join('\n').trim() : it.answer.trim());
				db().prepare('UPDATE simulado_items SET attempt_id = ? WHERE simulado_id = ? AND position = ?').run(Number(res.lastInsertRowid), simId, it.position);
				continue;
			}
			const q = getQuestion(it.question_id);
			if (!q) continue;
			const attemptId = recordAttempt({
				userId: user.id,
				question: q,
				answer: it.answer.trim() || '(em branco)',
				credit: it.answer.trim() ? null : 0,
				method: it.answer.trim() ? 'pendente' : 'autoavaliacao',
				timeSeconds: it.time_seconds,
				simuladoId: simId,
				examDate: user.exam_date
			});
			db().prepare('UPDATE simulado_items SET attempt_id = ? WHERE simulado_id = ? AND position = ?').run(attemptId, simId, it.position);
		}
		db().prepare("UPDATE simulados SET finished_at = datetime('now'), elapsed_seconds = ? WHERE id = ?").run(elapsed, simId);
	});
}

export interface SimuladoResult {
	provas: (ProvaScore & { graded: number; total: number; name: string })[];
	discursive: number;
	final: number | null;
	eliminated: boolean;
	reasons: string[];
	complete: boolean;
}

/** Calcula o resultado estimado com as notas disponíveis (atualiza o cache em simulados.result). */
export function computeResult(user: User, simId: number): SimuladoResult | null {
	const s = getSimulado(user.id, simId);
	if (!s || !s.sim.finished_at) return null;
	const provas: SimuladoResult['provas'] = [];
	let complete = true;
	for (const d of s.cfg.disciplines) {
		const its = s.items.filter((i) => i.discipline === d.code);
		if (d.code === 'RED') {
			const essayId = its[0]?.attempt_id;
			const e = essayId ? (db().prepare('SELECT score FROM essays WHERE id = ? AND user_id = ?').get(essayId, user.id) as { score: number | null } | undefined) : undefined;
			const graded = e?.score !== null && e?.score !== undefined ? 1 : essayId ? 0 : 1;
			if (!graded) complete = false;
			provas.push({ discipline: 'RED', name: 'Redação', weight: d.weight, points: e?.score ?? 0, graded, total: 1 });
			continue;
		}
		const credits = its.map((i) => {
			if (!i.attempt_id) return null;
			const a = db().prepare('SELECT credit FROM attempts WHERE id = ?').get(i.attempt_id) as { credit: number | null } | undefined;
			return a?.credit ?? null;
		});
		const pp = provaPoints(credits);
		if (pp.graded < pp.total) complete = false;
		provas.push({ discipline: d.code, name: DISCIPLINES[d.code].name, weight: d.weight, points: pp.points, graded: pp.graded, total: pp.total });
	}
	const est = estimateExam(provas, s.cfg.kind === 'completo' ? user.eq_conceito : null);
	const result: SimuladoResult = { provas, discursive: est.discursive, final: est.final, eliminated: complete && est.eliminated, reasons: complete ? est.reasons : [], complete };
	db().prepare('UPDATE simulados SET result = ? WHERE id = ?').run(JSON.stringify(result), simId);
	return result;
}
