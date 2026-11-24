import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ENTRADA_AUDIO, ENTRADAS, cronogramaGravado, gravacaoValida, impressao, textoParaGravar, type EntradaGravacao } from './gravacoes';
import { frases } from './tempo';
import { roteiroDe } from './aulas';
import { roteiroEspecial } from '$lib/especiais';

const PASTA = fileURLToPath(new URL('../data/narracao/', import.meta.url));

describe('impressão digital do texto falado', () => {
	it('ignora espaços e marcas de destaque, mas muda quando a fala muda', () => {
		const a = 'Primeira frase. Segunda frase!';
		expect(impressao(a)).toMatch(/^[0-9a-f]{8}$/);
		expect(impressao('Primeira  frase.\n Segunda **frase**!')).toBe(impressao(a));
		expect(impressao('Primeira frase. Segunda frase?')).not.toBe(impressao(a));
		expect(textoParaGravar('Uma **coisa**.  Outra.')).toBe('Uma coisa. Outra.');
	});
});

describe('linha do tempo pela gravação', () => {
	const narracao = 'Primeira frase aqui. Segunda frase, mais longa, aqui. Terceira.';
	const entrada: EntradaGravacao = { aula: 'x', cena: '1.1', hash: impressao(narracao), arquivo: 'x/1.1.mp3', dur: 9.5, marcas: [0.1, 3.2, 7.5], fim: 9.1, voz: 'teste' };

	it('cada frase começa quando a voz a começa', () => {
		const g = gravacaoValida(entrada, narracao)!;
		const c = cronogramaGravado(narracao, g);
		expect(c.frases).toHaveLength(3);
		expect(c.inicios).toEqual([ENTRADA_AUDIO + 0.1, ENTRADA_AUDIO + 3.2, ENTRADA_AUDIO + 7.5]);
		expect(c.duracoes[0]).toBeCloseTo(3.1);
		expect(c.duracoes[2]).toBeCloseTo(1.6);
		expect(c.total).toBeGreaterThan(ENTRADA_AUDIO + 9.5);
	});

	it('descarta a gravação quando o texto da cena mudou', () => {
		expect(gravacaoValida(entrada, narracao)).toBeTruthy();
		expect(gravacaoValida(entrada, narracao.replace('Terceira', 'Quarta'))).toBeUndefined();
		expect(gravacaoValida({ ...entrada, marcas: [0.1, 3.2] }, narracao)).toBeUndefined();
		expect(gravacaoValida(undefined, narracao)).toBeUndefined();
	});
});

describe('manifesto da narração gravada', () => {
	it('cada MP3 da pasta está no manifesto, e vice-versa', () => {
		const mp3: string[] = [];
		const varrer = (dir: string, pre = '') => {
			for (const d of readdirSync(dir, { withFileTypes: true })) {
				if (d.isDirectory()) varrer(dir + d.name + '/', pre + d.name + '/');
				else if (d.name.endsWith('.mp3')) mp3.push(pre + d.name);
			}
		};
		varrer(PASTA);
		expect(mp3.sort()).toEqual([...new Set(ENTRADAS.map((e) => e.arquivo))].sort());
	});

	it('cenas que dividem um arquivo não se sobrepõem', () => {
		const porArquivo = new Map<string, EntradaGravacao[]>();
		for (const e of ENTRADAS) porArquivo.set(e.arquivo, [...(porArquivo.get(e.arquivo) ?? []), e]);
		for (const [arquivo, es] of porArquivo) {
			const ordem = [...es].sort((a, b) => (a.inicio ?? 0) - (b.inicio ?? 0));
			for (let i = 1; i < ordem.length; i++) expect((ordem[i].inicio ?? 0) + 1e-6, arquivo).toBeGreaterThanOrEqual((ordem[i - 1].inicio ?? 0) + ordem[i - 1].dur - 0.01);
		}
	});

	for (const e of ENTRADAS) {
		it(`${e.aula} · cena ${e.cena}: o texto atual é o que foi gravado`, () => {
			const aula = roteiroEspecial(e.aula) ?? roteiroDe(e.aula);
			expect(aula, `aula ${e.aula} não existe`).toBeTruthy();
			const cena = aula!.partes.flatMap((p) => p.cenas).find((c) => c.id === e.cena);
			expect(cena, `cena ${e.cena} não existe`).toBeTruthy();
			expect(e.hash, 'o texto da cena mudou depois da gravação: regrave a cena (LEIAME.md)').toBe(impressao(cena!.narracao));
			expect(e.marcas).toHaveLength(frases(cena!.narracao).length);
			expect(e.marcas[0]).toBeGreaterThanOrEqual(0);
			for (let i = 1; i < e.marcas.length; i++) expect(e.marcas[i], `marca ${i}`).toBeGreaterThan(e.marcas[i - 1] + 0.3);
			expect(e.fim).toBeGreaterThan(e.marcas[e.marcas.length - 1]);
			expect(e.fim).toBeLessThanOrEqual(e.dur + 0.01);
			expect(existsSync(PASTA + e.arquivo)).toBe(true);
		});
	}
});
