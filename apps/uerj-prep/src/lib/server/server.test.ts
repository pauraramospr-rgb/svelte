import { describe, expect, it, beforeAll } from 'vitest';
import { openDatabase, setDatabase, tx, db } from './db';
import { createUser, createSession, validateSession, verifyPassword, hashPassword, findUserByEmail } from './auth';
import { recordAttempt, gradeAttempt, topicPerformance, dueCards } from './progress';
import { getQuestion, listQuestions, pickQuestions } from './questions';
import { createSimulado, finishSimulado, computeResult, getSimulado } from './simulados';

beforeAll(() => {
	setDatabase(openDatabase(':memory:'));
});

describe('autenticação', () => {
	it('hash de senha com scrypt e verificação', () => {
		const h = hashPassword('segredo123');
		expect(h.startsWith('scrypt$')).toBe(true);
		expect(verifyPassword('segredo123', h)).toBe(true);
		expect(verifyPassword('outra', h)).toBe(false);
	});

	it('cria usuário e sessão válida (token guardado só como hash)', () => {
		const u = createUser('Aluna@Example.com', 'Aluna', 'segredo123');
		expect(findUserByEmail('aluna@example.com')?.id).toBe(u.id);
		const { token } = createSession(u.id);
		expect(validateSession(token)?.id).toBe(u.id);
		const stored = db().prepare('SELECT id FROM sessions').get() as { id: string };
		expect(stored.id).not.toBe(token);
		expect(validateSession('invalido')).toBeNull();
	});
});

describe('transações reentrantes', () => {
	it('desfaz apenas o savepoint interno em caso de erro', () => {
		db().exec('CREATE TABLE t (x INTEGER)');
		tx(() => {
			db().prepare('INSERT INTO t VALUES (1)').run();
			try {
				tx(() => {
					db().prepare('INSERT INTO t VALUES (2)').run();
					throw new Error('falha');
				});
			} catch {}
		});
		expect((db().prepare('SELECT COUNT(*) AS n FROM t').get() as { n: number }).n).toBe(1);
	});
});

describe('progresso e revisão', () => {
	it('tentativa corrigida atualiza cartões de revisão dos tópicos da questão', () => {
		const u = createUser('b@example.com', 'B', 'segredo123');
		const q = getQuestion('ined-bio-02')!;
		const id = recordAttempt({ userId: u.id, question: q, answer: 'resposta', credit: null, method: 'pendente' });
		expect(topicPerformance(u.id)[0].graded).toBe(0);
		gradeAttempt(u.id, id, q, 0, 'autoavaliacao');
		const perf = topicPerformance(u.id).find((p) => p.topicId === 'bio-hereditariedade')!;
		expect(perf.avgCredit).toBe(0);
		const card = db().prepare('SELECT lapses, interval_days FROM review_cards WHERE user_id = ? AND topic_id = ?').get(u.id, 'bio-hereditariedade') as {
			lapses: number;
			interval_days: number;
		};
		expect(card.lapses).toBe(1);
		expect(card.interval_days).toBe(1);
		expect(dueCards(u.id)).toHaveLength(0);
	});
});

describe('banco e simulados', () => {
	it('filtra por categoria, disciplina e tópico', () => {
		expect(listQuestions({ source: 'oficial', discipline: 'MAT' }).every((q) => q.source === 'oficial' && q.discipline === 'MAT')).toBe(true);
		expect(listQuestions({ source: 'inedita', book: 'O bem-amado' }).length).toBeGreaterThanOrEqual(2);
		expect(listQuestions({ topicId: 'qui-isomeria' }).length).toBeGreaterThan(0);
	});

	it('monta simulado completo do curso, encerra e calcula o resultado com pesos', () => {
		const u = createUser('c@example.com', 'C', 'segredo123');
		db().prepare("UPDATE users SET course_id = 'medicina-rio', eq_conceito = 'A' WHERE id = ?").run(u.id);
		const user = findUserByEmail('c@example.com')!;
		expect(pickQuestions({ discipline: 'BIO', count: 3, mix: 'misto', userId: u.id, rng: () => 0.42 })).toHaveLength(3);
		const id = createSimulado(user, { kind: 'completo', disciplines: [{ code: 'BIO', weight: 2 }, { code: 'QUI', weight: 1 }, { code: 'RED', weight: 1 }], perProva: 2, mix: 'oficial', themeId: 'humor-critica' }, 60);
		const s = getSimulado(u.id, id)!;
		expect(s.items.map((i) => i.discipline)).toEqual(['BIO', 'BIO', 'QUI', 'QUI', 'RED']);
		finishSimulado(user, id);
		const r = computeResult(user, id)!;
		// respostas em branco recebem crédito nulo; redação em branco não gera texto para correção
		expect(r.discursive).toBe(0);
		expect(r.final).toBe(20);
		expect(r.complete).toBe(true);
		expect(r.eliminated).toBe(true);
	});
});
