import { describe, expect, it } from 'vitest';
import { SERIE_ESPECIAL, especiaisProntos, pastasEspeciais, resumoEspecial, roteiroEspecial } from './especiais';
import { episodiosDoRoteiro } from './cinema/aulas';
import { frases } from './cinema/tempo';
import { getTopic } from './domain/syllabus';
import { parseMapa, splitMapa } from './mindmap';

describe('série especial (História do Brasil e História Geral)', () => {
	it('toda pasta de aula especial está registrada na série', () => {
		const ids = SERIE_ESPECIAL.map((e) => e.id);
		for (const p of pastasEspeciais()) expect(ids, `pasta ${p}`).toContain(p);
	});

	it('os tópicos relacionados existem no programa oficial', () => {
		for (const e of SERIE_ESPECIAL) for (const t of e.relacionados) expect(getTopic(t), `${e.id} → ${t}`).toBeTruthy();
	});

	for (const e of especiaisProntos()) {
		it(`${e.id}: roteiro com narração e encenação sem avisos`, () => {
			const aula = roteiroEspecial(e.id)!;
			expect(aula.partes.length).toBeGreaterThan(0);
			expect(aula.referencias.length).toBeGreaterThan(0);
			for (const p of aula.partes) {
				expect(p.cenas.length, `parte ${p.numero}`).toBeGreaterThan(0);
				for (const c of p.cenas) {
					expect(frases(c.narracao).length, `cena ${c.id} sem narração`).toBeGreaterThan(1);
					expect(c.diretivas.length, `cena ${c.id} sem encenação`).toBeGreaterThan(1);
				}
			}
			const { avisos, ordem } = episodiosDoRoteiro(aula);
			expect(avisos).toEqual([]);
			// Série nova: cada visual e cada item entram na ordem em que a narração os apresenta.
			expect(ordem).toEqual([]);
		});

		it(`${e.id}: resumo aprofundado com referências e mapa mental`, () => {
			const r = resumoEspecial(e.id);
			expect(r, 'resumo.md').toBeTruthy();
			expect(r!.reviewed).toMatch(/^\d{4}-\d{2}-\d{2}$/);
			expect(r!.references.length).toBeGreaterThan(2);
			const { mapa } = splitMapa(r!.body);
			expect(mapa, 'seção “Mapa mental”').toBeTruthy();
			const dados = parseMapa(e.titulo, mapa!);
			expect(dados.branches.length).toBeGreaterThanOrEqual(5);
			expect(dados.timeline.length).toBeGreaterThanOrEqual(5);
		});
	}
});
