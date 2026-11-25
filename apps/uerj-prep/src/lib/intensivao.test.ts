import { describe, expect, it } from 'vitest';
import { aulasDoIntensivao, episodiosDaAula, GRUPOS_INTENSIVAO, tituloDaAula } from './intensivao';
import { topicsOf } from './domain/syllabus';
import { especiaisProntos } from './especiais';
import { GET } from '../routes/api/aulas/[aula]/episodios/+server';

describe('Intensivão', () => {
	const aulas = aulasDoIntensivao();

	it('junta todas as aulas, sem faltar nenhuma, na ordem: trilha de História, série especial, Língua Portuguesa', () => {
		const esperado = [...topicsOf('HIS').map((t) => t.id), ...especiaisProntos().map((e) => e.id), ...topicsOf('LPL').map((t) => t.id)];
		expect(aulas.map((a) => a.id)).toEqual(esperado);
		expect(new Set(aulas.map((a) => a.grupo))).toEqual(new Set(GRUPOS_INTENSIVAO));
		expect(aulas.filter((a) => a.disciplina === 'LPL').every((a) => a.grupo === GRUPOS_INTENSIVAO[2])).toBe(true);
	});

	it('cada aula entra inteira: todas as partes e cenas do roteiro, com duração', () => {
		for (const a of aulas) {
			const eps = episodiosDaAula(a.id)!;
			expect(eps, a.id).toBeTruthy();
			expect(eps.length, a.id).toBe(a.partes);
			expect(eps.reduce((s, e) => s + e.cenas.filter((c) => !c.abertura).length, 0), a.id).toBe(a.cenas);
			expect(a.duracaoSeg, a.id).toBeGreaterThan(60);
			expect(tituloDaAula(a.id), a.id).toBe(a.titulo);
		}
		// São muitas horas de aula: o Intensivão não corta nada.
		expect(aulas.reduce((s, a) => s + a.duracaoSeg, 0) / 3600).toBeGreaterThan(10);
	});

	it('a API entrega as partes de uma aula e recusa aula inexistente', async () => {
		const ok = await GET({ params: { aula: aulas[0].id } } as never);
		const eps = await ok.json();
		expect(eps.length).toBe(aulas[0].partes);
		expect(eps[0].cenas[0].abertura).toBe(true);
		await expect(async () => GET({ params: { aula: 'nao-existe' } } as never)).rejects.toMatchObject({ status: 404 });
	});
});
