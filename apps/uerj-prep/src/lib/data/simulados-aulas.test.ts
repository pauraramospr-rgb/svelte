import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SIMULADOS_DAS_AULAS, QUESTOES_DAS_AULAS, MINUTOS_POR_QUESTAO, simuladoDaAula } from './content/simulados-aulas';
import { cadernoDaQuestao, QUESTOES_COM_CADERNO } from './official/caderno';
import mapa from './official/caderno/mapa.json';
import { getTopic, topicsOf } from '$lib/domain/syllabus';
import { especiaisProntos } from '$lib/especiais';
import official from './official/questions-official.json';
import ineditas from './content/questoes-ineditas.json';

type Q = { id: string; discipline: string; topicIds: string[]; year?: number; [k: string]: unknown };
const OFICIAIS = new Map((official as Q[]).map((q) => [q.id, q]));
const ACERVO = new Map([...(ineditas as Q[]), ...(QUESTOES_DAS_AULAS as Q[])].map((q) => [q.id, q]));

describe('simulados por aula', () => {
	const aulas = [
		...topicsOf('HIS').map((t) => ({ id: t.id, disciplina: 'HIS' })),
		...especiaisProntos().map((e) => ({ id: e.id, disciplina: 'HIS' })),
		...topicsOf('LPL').map((t) => ({ id: t.id, disciplina: 'LPL' }))
	];

	it('toda aula de História (trilha e série especial) e de Língua Portuguesa tem simulado', () => {
		const faltando = aulas.filter((a) => !simuladoDaAula(a.id)).map((a) => a.id);
		expect(faltando).toEqual([]);
		expect(SIMULADOS_DAS_AULAS.length).toBe(aulas.length);
	});

	for (const a of aulas) {
		it(`${a.id}: ao menos 4 questões, ao menos 2 inéditas, sem repetição e na disciplina certa`, () => {
			const s = simuladoDaAula(a.id)!;
			expect(s.disciplina).toBe(a.disciplina);
			expect(s.questoes.length).toBeGreaterThanOrEqual(4);
			expect(s.ineditas.length).toBeGreaterThanOrEqual(2);
			expect(new Set(s.questoes).size).toBe(s.questoes.length);
			expect(s.questoes).toEqual([...s.oficiais, ...s.ineditas]);
			expect(s.minutos).toBe(s.questoes.length * MINUTOS_POR_QUESTAO);
			for (const id of s.oficiais) {
				const q = OFICIAIS.get(id);
				expect(q, `oficial ${id}`).toBeDefined();
				expect(q!.discipline).toBe(a.disciplina);
			}
			for (const id of s.ineditas) {
				const q = ACERVO.get(id);
				expect(q, `inédita ${id}`).toBeDefined();
				expect(q!.discipline).toBe(a.disciplina);
			}
		});
	}

	it('questões escritas para os simulados: ids próprios, campos completos, tópicos válidos e nunca como oficiais', () => {
		const ids = new Set<string>();
		for (const q of QUESTOES_DAS_AULAS as Q[]) {
			expect(q.id).toMatch(/^simu-/);
			expect(ids.has(q.id), q.id).toBe(false);
			expect(OFICIAIS.has(q.id)).toBe(false);
			ids.add(q.id);
			expect(q).not.toHaveProperty('year');
			expect(q).not.toHaveProperty('source');
			expect(['facil', 'medio', 'dificil']).toContain(q.difficulty);
			for (const campo of ['statement', 'modelAnswer', 'explanation', 'patternRationale'] as const) {
				expect(String(q[campo]).length, `${q.id}.${campo}`).toBeGreaterThan(60);
			}
			for (const campo of ['skills', 'knowledge', 'commonMistakes'] as const) {
				expect((q[campo] as string[]).length, `${q.id}.${campo}`).toBeGreaterThan(0);
			}
			expect(String(q.model)).toMatch(/simulado da aula/);
			expect(q.topicIds.length).toBeGreaterThan(0);
			for (const t of q.topicIds) expect(getTopic(t), `${q.id}:${t}`).toBeDefined();
		}
		expect(ids.size).toBeGreaterThan(100);
	});
});

describe('caderno de prova reproduzido nas questões oficiais', () => {
	const MAPA = mapa as Record<string, string[]>;
	const pasta = fileURLToPath(new URL('./official/caderno/', import.meta.url));

	it('toda questão de História e de Língua Portuguesa de 2024 a 2026 tem o recorte do caderno', () => {
		const esperadas = [...OFICIAIS.values()].filter((q) => (q.discipline === 'HIS' || q.discipline === 'LPL') && Number(q.year) >= 2024).map((q) => q.id);
		expect(esperadas.length).toBeGreaterThanOrEqual(56);
		expect(esperadas.filter((id) => !MAPA[id])).toEqual([]);
	});

	it('os arquivos existem, o recorte da questão vem por último e o texto-base vem antes', () => {
		for (const [id, arquivos] of Object.entries(MAPA)) {
			expect(OFICIAIS.has(id), id).toBe(true);
			for (const arq of arquivos) expect(existsSync(pasta + arq), arq).toBe(true);
			expect(arquivos.at(-1)).toBe(`${id}.webp`);
			for (const arq of arquivos.slice(0, -1)) expect(arq, id).toMatch(/-texto-p\d+\.webp$/);
			const paginas = cadernoDaQuestao(id);
			expect(paginas.length).toBe(arquivos.length);
			expect(paginas.at(-1)!.tipo).toBe('questao');
			for (const p of paginas) {
				expect(p.src).toBeTruthy();
				expect(p.alt).toMatch(/UERJ \d{4}/);
			}
		}
		expect(QUESTOES_COM_CADERNO.length).toBe(Object.keys(MAPA).length);
	});

	it('questões sem recorte continuam só com o enunciado transcrito', () => {
		expect(cadernoDaQuestao('2019-HIS-02')).toEqual([]);
		expect(cadernoDaQuestao('ined-his-01')).toEqual([]);
	});
});
