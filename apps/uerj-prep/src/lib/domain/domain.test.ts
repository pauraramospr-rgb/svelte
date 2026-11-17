import { describe, expect, it } from 'vitest';
import { provaPoints, estimateExam, creditLabel } from './scoring';
import { review, NEW_CARD, qualityFromCredit, capToExam } from './srs';
import { planSchedule, topicPriority } from './planner';
import { essayScore } from './essay';
import { estimateLines, wordCount } from './text';
import { REDACAO_ASPECTS } from '$lib/data/official/exam-2027';

describe('pontuação (edital 2027 + metodologia da plataforma)', () => {
	it('divide 20 pontos igualmente entre as questões e conta parcial como 50%', () => {
		expect(provaPoints([1, 1, 0.5, 0, 1])).toEqual({ points: 14, graded: 5, total: 5 });
		expect(provaPoints([1, null, null, null])).toEqual({ points: 5, graded: 1, total: 4 });
		expect(provaPoints([])).toEqual({ points: 0, graded: 0, total: 0 });
	});

	it('aplica pesos 2, 1 e 1 (máximo 80) e soma o conceito do Exame de Qualificação (máximo 100)', () => {
		const e = estimateExam(
			[
				{ discipline: 'BIO', weight: 2, points: 20 },
				{ discipline: 'QUI', weight: 1, points: 20 },
				{ discipline: 'RED', weight: 1, points: 20 }
			],
			'A'
		);
		expect(e.discursive).toBe(80);
		expect(e.final).toBe(100);
		expect(e.eliminated).toBe(false);
	});

	it('elimina com zero em qualquer prova (item 5.5) e com total final menor que 20 (item 6.2)', () => {
		const zero = estimateExam(
			[
				{ discipline: 'MAT', weight: 2, points: 10 },
				{ discipline: 'FIS', weight: 1, points: 0 },
				{ discipline: 'RED', weight: 1, points: 10 }
			],
			'B'
		);
		expect(zero.eliminated).toBe(true);
		const low = estimateExam(
			[
				{ discipline: 'MAT', weight: 2, points: 2 },
				{ discipline: 'FIS', weight: 1, points: 2 },
				{ discipline: 'RED', weight: 1, points: 2 }
			],
			'D'
		);
		expect(low.final).toBe(13);
		expect(low.eliminated).toBe(true);
	});

	it('rotula créditos', () => {
		expect(creditLabel(1)).toBe('total');
		expect(creditLabel(0.5)).toBe('parcial');
		expect(creditLabel(0)).toBe('nula');
		expect(creditLabel(null)).toBe('pendente');
	});
});

describe('repetição espaçada (SM-2)', () => {
	it('aumenta o intervalo com acertos sucessivos', () => {
		let c = review(NEW_CARD, 5);
		expect(c.interval_days).toBe(1);
		c = review(c, 5);
		expect(c.interval_days).toBe(3);
		c = review(c, 5);
		expect(c.interval_days).toBeGreaterThan(3);
		expect(c.repetitions).toBe(3);
	});

	it('reinicia e registra lapso em caso de erro, sem deixar a facilidade cair abaixo de 1,3', () => {
		let c = review(review(NEW_CARD, 5), 5);
		c = review(c, 1);
		expect(c.repetitions).toBe(0);
		expect(c.interval_days).toBe(1);
		expect(c.lapses).toBe(1);
		for (let i = 0; i < 20; i++) c = review(c, 0);
		expect(c.ease).toBeGreaterThanOrEqual(1.3);
	});

	it('converte crédito em qualidade', () => {
		expect(qualityFromCredit(1)).toBe(5);
		expect(qualityFromCredit(0.5)).toBe(3);
		expect(qualityFromCredit(0)).toBe(1);
	});

	it('agenda a revisão antes da prova quando possível', () => {
		const now = new Date('2026-11-17T12:00:00Z');
		const exam = new Date('2026-11-29T12:00:00Z');
		const due = capToExam(new Date('2026-12-20T12:00:00Z'), exam, now);
		expect(due.toISOString().slice(0, 10)).toBe('2026-11-28');
	});
});

describe('cronograma', () => {
	const base = {
		today: new Date(2026, 10, 17),
		examDate: new Date(2026, 10, 29),
		weeklyHours: 14,
		disciplines: [
			{ code: 'BIO', weight: 2 },
			{ code: 'QUI', weight: 1 },
			{ code: 'RED', weight: 1 }
		],
		topics: [
			{ id: 'bio-a', discipline: 'BIO', title: 'A', incidence: 1, mastery: null, due: false },
			{ id: 'bio-b', discipline: 'BIO', title: 'B', incidence: 0, mastery: 0.9, due: false },
			{ id: 'qui-a', discipline: 'QUI', title: 'C', incidence: 0.5, mastery: 0.2, due: true }
		]
	};

	it('cobre os dias até a prova e reserva a véspera para revisão leve', () => {
		const plan = planSchedule(base);
		expect(plan).toHaveLength(12);
		expect(plan[0].date).toBe('2026-11-17');
		expect(plan.at(-1)!.note).toMatch(/Véspera/);
	});

	it('inclui blocos de redação a cada 3 dias e prioriza peso, incidência e necessidade', () => {
		const plan = planSchedule(base);
		expect(plan[0].blocks.some((b) => b.discipline === 'RED')).toBe(true);
		expect(plan[1].blocks.some((b) => b.discipline === 'RED')).toBe(false);
		expect(topicPriority(base.topics[0], 2)).toBeGreaterThan(topicPriority(base.topics[1], 2));
	});
});

describe('redação', () => {
	it('atribui 2,5 pontos por aspecto atendido (metodologia declarada) e 20 no máximo', () => {
		const all = REDACAO_ASPECTS.map((a) => ({ id: a.id, rating: 'atende' as const }));
		expect(essayScore(all, { offensiveLanguage: false, identificationRisk: false }).score).toBe(20);
		const half = REDACAO_ASPECTS.map((a) => ({ id: a.id, rating: 'atende_parcialmente' as const }));
		expect(essayScore(half, { offensiveLanguage: false, identificationRisk: false }).score).toBe(10);
	});

	it('zera por baixo calão (item 4.16) ou identificação (item 5.4)', () => {
		const all = REDACAO_ASPECTS.map((a) => ({ id: a.id, rating: 'atende' as const }));
		expect(essayScore(all, { offensiveLanguage: true, identificationRisk: false }).score).toBe(0);
		expect(essayScore(all, { offensiveLanguage: false, identificationRisk: true }).zeroReason).toMatch(/5\.4/);
	});

	it('estima linhas e palavras', () => {
		expect(estimateLines('a'.repeat(130))).toBe(2);
		expect(estimateLines('linha um\n\nlinha dois')).toBe(2);
		expect(wordCount(' três  palavras aqui ')).toBe(3);
	});
});
