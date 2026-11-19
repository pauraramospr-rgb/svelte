import { describe, expect, it } from 'vitest';
import { AULAS } from '$lib/producao';
import { cronograma, frases, instante, progresso } from './tempo';
import { cenasSobMedida, montarEpisodios } from './aulas';
import { encenar, itensDaTela } from './auto';
import type { Animacao, CenaAnimada, Elemento, Momento } from './tipos';

/** Todos os momentos citados por uma cena (entradas, saídas, câmera, itens internos). */
function momentos(cena: CenaAnimada): { onde: string; m: Momento }[] {
	const lista: { onde: string; m: Momento }[] = [];
	const anim = (onde: string, a: Animacao) => {
		lista.push({ onde, m: a });
		if (a.sai) lista.push({ onde: onde + '.sai', m: a.sai });
	};
	(cena.camera ?? []).forEach((c, i) => lista.push({ onde: `camera[${i}]`, m: c }));
	cena.elementos.forEach((el: Elemento, i) => {
		const onde = `${el.k}[${i}]`;
		anim(onde, el.a);
		if (el.mov) lista.push({ onde: onde + '.mov', m: el.mov.ate });
		if (el.k === 'pessoa' && el.anda) lista.push({ onde: onde + '.anda', m: el.anda.ate });
		if (el.k === 'mapa') {
			el.rotulos?.forEach((r, j) => anim(`${onde}.rotulo[${j}]`, r.a));
			el.pinta?.forEach((r, j) => anim(`${onde}.pinta[${j}]`, r.a));
			el.cidades?.forEach((r, j) => anim(`${onde}.cidade[${j}]`, r.a));
		}
		if (el.k === 'linha') el.itens.forEach((r, j) => anim(`${onde}.item[${j}]`, r.a));
		if (el.k === 'tabela') el.linhas.forEach((r, j) => anim(`${onde}.linha[${j}]`, r.a));
		if (el.k === 'balanca') el.pende.forEach((r, j) => lista.push({ onde: `${onde}.pende[${j}]`, m: r }));
	});
	return lista;
}

describe('relógio das cenas', () => {
	it('divide a narração em frases sem perder texto', () => {
		const n = 'Em 1964, houve golpe. O AI-5 veio em 1968! E depois? “Revolução” era a palavra.';
		expect(frases(n)).toEqual(['Em 1964, houve golpe.', 'O AI-5 veio em 1968!', 'E depois?', '“Revolução” era a palavra.']);
	});
	it('o cronograma é crescente e o progresso respeita entrada e saída', () => {
		const c = cronograma('Primeira frase aqui. Segunda frase, um pouco maior. Terceira.');
		expect(c.inicios).toEqual([...c.inicios].sort((a, b) => a - b));
		expect(c.total).toBeGreaterThan(c.inicios[2] + c.duracoes[2]);
		const a: Animacao = { s: 1, dur: 1, sai: { s: 2, dur: 0.5 } };
		expect(progresso(a, c, instante({ s: 1 }, c) - 0.1).visivel).toBe(false);
		expect(progresso(a, c, instante({ s: 1 }, c) + 1).p).toBe(1);
		expect(progresso(a, c, instante({ s: 2 }, c) + 1).visivel).toBe(false);
	});
});

describe('animações sob medida', () => {
	for (const aula of AULAS) {
		const proprias = cenasSobMedida(aula.topicId);
		const cenas = new Map(aula.episodios.flatMap((e) => e.cenas).map((c) => [c.id, c]));
		for (const [id, cena] of Object.entries(proprias)) {
			it(`${aula.topicId} · cena ${id}: existe no roteiro e só cita frases da narração`, () => {
				const roteiro = cenas.get(id);
				expect(roteiro, `cena ${id} não existe em aula.md`).toBeTruthy();
				const n = frases(roteiro!.narracao).length;
				for (const { onde, m } of momentos(cena)) expect(m.s, `${id} ${onde}`).toBeLessThan(n);
				expect(cena.elementos.length).toBeGreaterThan(4);
			});
		}
	}
	it('o Episódio 1 da série das ditaduras está completo', () => {
		const aula = AULAS.find((a) => a.topicId.startsWith('his-as-ditaduras'))!;
		const proprias = cenasSobMedida(aula.topicId);
		for (const c of aula.episodios[0].cenas) expect(proprias[c.id], `cena ${c.id}`).toBeTruthy();
	});
});

describe('encenação automática e montagem dos episódios', () => {
	it('lê os itens de "Textos na tela" sem quebrar citações', () => {
		expect(itensDaTela('“1975 — carta” · “Discurso: anticomunismo | Alvo: trabalhismo · peronismo” · título: “X”.')).toEqual([
			'1975 — carta',
			'Discurso: anticomunismo | Alvo: trabalhismo · peronismo',
			'título: “X'
		]);
	});
	it('toda cena do roteiro vira uma cena tocável, com abertura em cada episódio', () => {
		for (const aula of AULAS) {
			const eps = montarEpisodios(aula.topicId, aula.title, aula.episodios);
			expect(eps.length).toBe(aula.episodios.length);
			eps.forEach((ep, i) => {
				expect(ep.cenas[0].abertura).toBe(true);
				expect(ep.cenas.length).toBe(aula.episodios[i].cenas.length + 1);
				for (const c of ep.cenas.slice(1)) {
					expect(c.narracao.length).toBeGreaterThan(100);
					expect(c.animada.elementos.length).toBeGreaterThan(2);
				}
			});
			for (const c of aula.episodios.flatMap((e) => e.cenas)) {
				const n = frases(c.narracao).length;
				for (const { onde, m } of momentos(encenar(c))) expect(m.s, `${c.id} ${onde}`).toBeLessThan(n);
			}
		}
	});
});
