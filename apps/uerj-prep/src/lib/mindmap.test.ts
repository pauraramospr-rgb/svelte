import { describe, expect, it } from 'vitest';
import { buildMindMap, mindMapData, parseMapa, splitMapa } from './mindmap';
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

const MAPA = `## Em uma frase

Texto.

## Mapa mental

> Brasil, 1956–1961

### O que foi?
- Governo desenvolvimentista de JK.
### Antes (contexto)
- **Vargas**: Petrobras e BNDE.
- Tentativas de golpe em 1954 e 1955.
### Causas
- Busca de industrialização acelerada.
### Linha do tempo
- **1956**: posse de JK.
- **1960**: inauguração de Brasília.

## Exercícios de fixação

1. Pergunta.
`;

describe('mapa mental', () => {
	it('separa a seção do mapa do texto do resumo', () => {
		const { body, mapa } = splitMapa(MAPA);
		expect(body).not.toContain('Mapa mental');
		expect(body).toContain('## Exercícios de fixação');
		expect(mapa).toContain('### O que foi?');
	});

	it('lê ramos, tópicos com destaque, subtítulo e linha do tempo', () => {
		const d = parseMapa('Governo JK', splitMapa(MAPA).mapa!);
		expect(d.subtitle).toBe('Brasil, 1956–1961');
		expect(d.branches.map((b) => b.label)).toEqual(['O que foi?', 'Antes (contexto)', 'Causas']);
		expect(d.branches[1].items[0]).toEqual({ strong: 'Vargas', sep: ': ', text: 'Petrobras e BNDE.' });
		expect(parseMapa('x', '### A\n- **Brasil (1964)**, Chile e Uruguai.').branches[0].items[0]).toEqual({ strong: 'Brasil (1964)', sep: '', text: ', Chile e Uruguai.' });
		expect(d.timeline).toEqual([
			{ when: '1956', what: 'posse de JK.' },
			{ when: '1960', what: 'inauguração de Brasília.' }
		]);
	});

	it('sem seção escrita, monta o mapa a partir das seções do texto', () => {
		const t = buildMindMap('Colonialismos', MD);
		expect(t.children.map((c) => c.label)).toEqual(['Conceitos fundamentais', 'Explicação detalhada', 'Fórmulas e aplicações']);
		expect(t.children[1].children.map((c) => c.label)).toEqual(['As Treze Colônias (1763–1776)', 'O Haiti']);
		const d = mindMapData('Colonialismos', MD);
		expect(d.authored).toBe(false);
		expect(d.branches[0].items.map((i) => i.text)).toEqual(['Sistema colonial', 'Iluminismo político']);
	});

	it('todo resumo editorial tem mapa mental escrito, com caixas explicativas', () => {
		for (const r of RESUMOS) {
			const d = mindMapData(r.title, r.body);
			expect(d.authored, r.topicId).toBe(true);
			expect(d.branches.length, r.topicId).toBeGreaterThanOrEqual(6);
			for (const b of d.branches) {
				expect(b.items.length, `${r.topicId}: ${b.label}`).toBeGreaterThanOrEqual(2);
				// cada balão abre com uma explicação em texto corrido
				expect((b.lead ?? '').length, `${r.topicId}: ${b.label} (texto do balão)`).toBeGreaterThanOrEqual(40);
				// tópicos explicativos (frases), não palavras soltas
				expect(b.items.every((i) => (i.strong ? i.strong.length + 2 : 0) + i.text.length >= 25), `${r.topicId}: ${b.label}`).toBe(true);
			}
		}
	});

	it('resumos de História ligam cada etapa à seguinte', () => {
		for (const r of RESUMOS.filter((x) => x.discipline === 'HIS')) {
			expect(r.body.match(/Ligação com a próxima etapa/g)?.length ?? 0, r.topicId).toBeGreaterThanOrEqual(6);
		}
	});

	it('resumos de História contam a história em ordem e têm linha do tempo no mapa', () => {
		const steps = ['### 1. Antes', '### 2. As causas', '### 3. Como começou', '### 4. O processo', '### 5. O desfecho', '### 6. As consequências', '### 7. Importância e o depois'];
		for (const r of RESUMOS.filter((x) => x.discipline === 'HIS')) {
			let last = -1;
			for (const s of steps) {
				const at = r.body.indexOf(s);
				expect(at, `${r.topicId}: ${s}`).toBeGreaterThan(last);
				last = at;
			}
			expect(mindMapData(r.title, r.body).timeline.length, r.topicId).toBeGreaterThanOrEqual(6);
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
