/**
 * Pontuação estimada da Redação — METODOLOGIA DA PLATAFORMA (não oficial).
 *
 * O que é oficial: a Redação vale 20 pontos (edital 2027, item 4.1); os aspectos avaliados são os
 * listados no Anexo 5; vocabulário de baixo calão implica nota zero (item 4.16) e identificação
 * implica nota zero (item 5.4). A UERJ NÃO divulga quanto vale cada aspecto.
 *
 * Aproximação didática adotada: os 8 aspectos têm o mesmo peso (2,5 pontos cada);
 * "atende" = 2,5; "atende parcialmente" = 1,25; "não atende" = 0.
 */
import { REDACAO_ASPECTS } from '$lib/data/official/exam-2027';

export type AspectRating = 'atende' | 'atende_parcialmente' | 'nao_atende';

export const ASPECT_VALUE = 20 / REDACAO_ASPECTS.length;

export const RATING_FACTOR: Record<AspectRating, number> = { atende: 1, atende_parcialmente: 0.5, nao_atende: 0 };

export const RATING_LABEL: Record<AspectRating, string> = {
	atende: 'Atende',
	atende_parcialmente: 'Atende parcialmente',
	nao_atende: 'Não atende'
};

export function essayScore(
	aspects: { id: string; rating: AspectRating }[],
	formal: { offensiveLanguage: boolean; identificationRisk: boolean }
): { score: number; zeroReason: string | null } {
	if (formal.offensiveLanguage) return { score: 0, zeroReason: 'Vocabulário de baixo calão: nota zero e eliminação (edital 2027, item 4.16).' };
	if (formal.identificationRisk) return { score: 0, zeroReason: 'Identificação do candidato na prova: nota zero (edital 2027, item 5.4).' };
	let total = 0;
	for (const a of REDACAO_ASPECTS) {
		const found = aspects.find((x) => x.id === a.id);
		total += found ? RATING_FACTOR[found.rating] * ASPECT_VALUE : 0;
	}
	return { score: Math.round(total * 100) / 100, zeroReason: null };
}
