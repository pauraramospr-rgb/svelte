/**
 * Repetição espaçada por tópico (variante do algoritmo SM-2, de P. Wozniak, SuperMemo, 1987).
 * A "qualidade" (0–5) de cada revisão é derivada do crédito obtido nas questões do tópico.
 */
export interface CardState {
	ease: number;
	interval_days: number;
	repetitions: number;
	lapses: number;
}

export const NEW_CARD: CardState = { ease: 2.5, interval_days: 0, repetitions: 0, lapses: 0 };

/** Converte o crédito (0–1) da resposta em qualidade SM-2 (0–5). */
export function qualityFromCredit(credit: number): number {
	if (credit >= 0.99) return 5;
	if (credit >= 0.75) return 4;
	if (credit >= 0.5) return 3;
	if (credit > 0) return 2;
	return 1;
}

export function review(state: CardState, quality: number): CardState {
	const q = Math.max(0, Math.min(5, quality));
	let { ease, interval_days, repetitions, lapses } = state;
	if (q < 3) {
		repetitions = 0;
		interval_days = 1;
		lapses += 1;
	} else {
		repetitions += 1;
		if (repetitions === 1) interval_days = 1;
		else if (repetitions === 2) interval_days = 3;
		else interval_days = Math.round(interval_days * ease * 10) / 10;
	}
	ease = Math.max(1.3, ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
	return { ease: Math.round(ease * 100) / 100, interval_days, repetitions, lapses };
}

export function addDays(from: Date, days: number): Date {
	return new Date(from.getTime() + days * 86_400_000);
}

/** Limita o intervalo para que a revisão ocorra antes da prova (quando houver tempo). */
export function capToExam(due: Date, exam: Date, now: Date): Date {
	const dayBefore = addDays(exam, -1);
	if (due > dayBefore && dayBefore > now) return dayBefore;
	return due;
}
