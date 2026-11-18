import { describe, expect, it } from 'vitest';
import { buildMindMap, layoutMindMap, wrap } from './mindmap';
import { RESUMOS } from './content';
import { commandStats, commandsIn } from './domain/commands';

const MD = `## Conceitos fundamentais

- **Sistema colonial**: controle do comércio.
- **Iluminismo político**: crítica ao absolutismo.

## Explicação detalhada

**1. As Treze Colônias (1763–1776).** Texto longo.

**2. O Haiti.** Outro texto.

## Fórmulas e aplicações

Não se aplica. Linha do tempo:

| Ano | Fato |
|---|---|
| 1776 | Declaração de Independência |

## Exercícios de fixação

1. Pergunta que não deve entrar no mapa.
`;

describe('mapa mental', () => {
	it('usa seções como ramos e destaques como folhas, sem exercícios', () => {
		const t = buildMindMap('Colonialismos', MD);
		expect(t.label).toBe('Colonialismos');
		expect(t.children.map((c) => c.label)).toEqual(['Conceitos fundamentais', 'Explicação detalhada', 'Fórmulas e aplicações']);
		expect(t.children[0].children.map((c) => c.label)).toEqual(['Sistema colonial', 'Iluminismo político']);
		expect(t.children[1].children.map((c) => c.label)).toEqual(['As Treze Colônias (1763–1776)', 'O Haiti']);
		expect(t.children[2].children.map((c) => c.label)).toEqual(['1776 — Declaração de Independência']);
	});

	it('posiciona todos os nós sem sobreposição vertical no mesmo lado/nível', () => {
		const t = buildMindMap('Colonialismos', MD);
		const l = layoutMindMap(t);
		expect(l.nodes.length).toBe(1 + 3 + 5);
		expect(l.edges.length).toBe(3 + 5);
		for (const side of ['left', 'right'] as const)
			for (const level of [1, 2] as const) {
				const ns = l.nodes.filter((n) => n.side === side && n.level === level).sort((a, b) => a.y - b.y);
				for (let i = 1; i < ns.length; i++) expect(ns[i].y).toBeGreaterThanOrEqual(ns[i - 1].y + ns[i - 1].h);
			}
		for (const n of l.nodes) {
			expect(n.x).toBeGreaterThanOrEqual(0);
			expect(n.x + n.w).toBeLessThanOrEqual(l.width);
			expect(n.y).toBeGreaterThanOrEqual(0);
			expect(n.y + n.h).toBeLessThanOrEqual(l.height);
		}
	});

	it('quebra rótulos em linhas', () => {
		expect(wrap('um dois três quatro', 9)).toEqual(['um dois', 'três', 'quatro']);
	});

	it('todos os resumos editoriais geram mapas com pelo menos 4 ramos e folhas', () => {
		for (const r of RESUMOS) {
			const t = buildMindMap(r.title, r.body);
			expect(t.children.length, r.topicId).toBeGreaterThanOrEqual(4);
			expect(t.children.filter((c) => c.children.length > 0).length, r.topicId).toBeGreaterThanOrEqual(4);
		}
	});
});

describe('verbos de comando', () => {
	it('encontra verbos inteiros, sem confundir com partes de palavras', () => {
		expect(commandsIn('Identifique a figura. Em seguida, explique o efeito.')).toEqual(['identifique', 'explique']);
		expect(commandsIn('O texto apresenta dados; calcule a razão.')).toEqual(['calcule']);
	});

	it('conta questões com mais de um comando', () => {
		const s = commandStats([
			{ discipline: 'HIS', statement: 'Cite uma ação. Explique seu objetivo.' },
			{ discipline: 'MAT', statement: 'Calcule o valor.' }
		]);
		expect(s.total).toBe(2);
		expect(s.multi).toBe(1);
		expect(s.byDiscipline.HIS.verbs.map((v) => v.verb).sort()).toEqual(['cite', 'explique']);
	});
});
