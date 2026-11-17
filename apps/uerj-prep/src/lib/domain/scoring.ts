/**
 * Cálculo de pontuação no formato do Exame Discursivo 2027.
 *
 * OFICIAL (edital 2027): cada prova vale 20 pontos; pesos 2 (1ª específica), 1 (2ª específica)
 * e 1 (Redação); Exame Discursivo = até 80 pontos; resultado final = Discursivo + pontos do
 * conceito no Exame de Qualificação (A=20, B=15, C=10, D=5), até 100; eliminação com total < 20
 * ou com zero em qualquer prova; a banca atribui pontuação total, parcial ou nula (item 4.29.5).
 *
 * METODOLOGIA DA PLATAFORMA (não oficial): a UERJ não publica o valor de cada questão nem a
 * fração atribuída a respostas parciais. Para estimar, a plataforma (1) divide os 20 pontos
 * igualmente entre as questões da prova e (2) atribui 100% (total), 50% (parcial) ou 0% (nula).
 */
export type Credit = 1 | 0.5 | 0;
export type CreditLabel = 'total' | 'parcial' | 'nula';

export const CREDIT_FROM_LABEL: Record<CreditLabel, Credit> = { total: 1, parcial: 0.5, nula: 0 };

export function creditLabel(c: number | null | undefined): CreditLabel | 'pendente' {
	if (c === null || c === undefined) return 'pendente';
	if (c >= 0.99) return 'total';
	if (c > 0) return 'parcial';
	return 'nula';
}

/** Pontos (0–20) de uma prova, dados os créditos de suas questões (null = não corrigida). */
export function provaPoints(credits: (number | null)[], pointsPerProva = 20): { points: number; graded: number; total: number } {
	const total = credits.length;
	if (total === 0) return { points: 0, graded: 0, total: 0 };
	const per = pointsPerProva / total;
	let points = 0;
	let graded = 0;
	for (const c of credits) {
		if (c === null) continue;
		graded++;
		points += Math.max(0, Math.min(1, c)) * per;
	}
	return { points: round1(points), graded, total };
}

export interface ProvaScore {
	discipline: string;
	weight: 1 | 2;
	points: number; // 0–20
}

export interface ExamEstimate {
	discursive: number; // 0–80
	eqPoints: number | null;
	final: number | null; // 0–100
	eliminated: boolean;
	reasons: string[];
}

export function estimateExam(provas: ProvaScore[], eqConceito: 'A' | 'B' | 'C' | 'D' | null): ExamEstimate {
	const discursive = round1(provas.reduce((s, p) => s + p.points * p.weight, 0));
	const eqTable = { A: 20, B: 15, C: 10, D: 5 } as const;
	const eqPoints = eqConceito ? eqTable[eqConceito] : null;
	const final = eqPoints === null ? null : round1(discursive + eqPoints);
	const reasons: string[] = [];
	if (provas.some((p) => p.points === 0)) reasons.push('Zero em uma das provas (edital, item 5.5).');
	if (final !== null && final < 20) reasons.push('Resultado final menor que 20 pontos (edital, item 6.2).');
	return { discursive, eqPoints, final, eliminated: reasons.length > 0, reasons };
}

export function round1(n: number): number {
	return Math.round(n * 10) / 10;
}
