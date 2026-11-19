import { describe, expect, it } from 'vitest';
import { AULAS_ROTEIRO, episodiosDoRoteiro } from './aulas';
import { frases } from './tempo';
import { getTopic } from '$lib/domain/syllabus';

describe('aulas animadas em roteiro', () => {
	it('existe ao menos uma aula', () => {
		expect(AULAS_ROTEIRO.length).toBeGreaterThan(0);
	});
	for (const aula of AULAS_ROTEIRO) {
		it(`${aula.topicId}: tópico do programa, cenas com narração e encenação sem avisos`, () => {
			expect(getTopic(aula.topicId), 'o arquivo deve ter o id de um tópico do programa').toBeTruthy();
			expect(aula.partes.length).toBeGreaterThan(0);
			expect(aula.referencias.length).toBeGreaterThan(0);
			for (const p of aula.partes) {
				expect(p.cenas.length, `parte ${p.numero}`).toBeGreaterThan(0);
				for (const c of p.cenas) {
					expect(frases(c.narracao).length, `cena ${c.id} sem narração`).toBeGreaterThan(1);
					expect(c.diretivas.length, `cena ${c.id} sem encenação`).toBeGreaterThan(1);
				}
			}
			const { avisos } = episodiosDoRoteiro(aula);
			expect(avisos).toEqual([]);
		});
	}
});
