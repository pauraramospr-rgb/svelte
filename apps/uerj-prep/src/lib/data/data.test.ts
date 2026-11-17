import { describe, expect, it } from 'vitest';
import { COURSES_2027, courseDisciplines } from './official/courses-2027';
import { DISCIPLINES, EXAM_2027, REDACAO_ASPECTS } from './official/exam-2027';
import { BOOKS, CURRENT_EDITION } from './official/books';
import { REDACAO_HISTORY } from './official/redacao-history';
import { PAST_EXAMS } from './official/past-exams';
import { SOURCES } from './official/sources';
import { SYLLABUS, INCIDENCE, getTopic } from '$lib/domain/syllabus';
import { RESUMOS } from '$lib/content';
import { TEMAS_2027 } from './content/redacao-temas';
import { OBRAS } from './content/obras';
import official from './official/questions-official.json';
import ineditas from './content/questoes-ineditas.json';

const codes = Object.keys(DISCIPLINES);

describe('dados oficiais', () => {
	it('quadro de cursos do edital 2027: duas específicas distintas e válidas por curso', () => {
		expect(COURSES_2027.length).toBe(83); // linhas do quadro do item 4.2
		for (const c of COURSES_2027) {
			expect(codes).toContain(c.peso2);
			expect(codes).toContain(c.peso1);
			expect(c.peso1).not.toBe(c.peso2);
			expect(c.peso2).not.toBe('RED');
			expect(courseDisciplines(c).map((d) => d.weight)).toEqual([2, 1, 1]);
		}
		expect(new Set(COURSES_2027.map((c) => c.id)).size).toBe(COURSES_2027.length);
	});

	it('casos do quadro conferidos pela posição das colunas no PDF', () => {
		const find = (name: string, campus: string) => COURSES_2027.find((c) => c.name === name && c.campus === campus)!;
		expect(find('Administração', 'RIO')).toMatchObject({ peso2: 'MAT', peso1: 'LPL' });
		expect(find('Direito', 'RIO')).toMatchObject({ peso2: 'LPL', peso1: 'HIS' });
		expect(find('Medicina', 'RIO')).toMatchObject({ peso2: 'BIO', peso1: 'QUI' });
		expect(find('Letras: Inglês/Literaturas', 'RIO')).toMatchObject({ peso2: 'LE', peso1: 'LPL' });
		expect(find('Pedagogia', 'RIO')).toMatchObject({ peso2: 'HIS', peso1: 'LPL' });
	});

	it('estrutura do exame 2027', () => {
		expect(EXAM_2027.date).toBe('2026-11-29');
		expect(EXAM_2027.pointsPerProva * 4).toBe(EXAM_2027.discursiveMax);
		expect(REDACAO_ASPECTS).toHaveLength(8);
		for (const r of EXAM_2027.rules) expect(SOURCES[r.source]).toBeDefined();
	});

	it('lista atual de obras tem 4 livros e todas as fontes existem', () => {
		expect(BOOKS.filter((b) => b.edition === CURRENT_EDITION)).toHaveLength(4);
		for (const b of BOOKS) if (b.source !== 'prova') expect(SOURCES[b.source]).toBeDefined();
		for (const b of BOOKS.filter((x) => x.slug)) expect(OBRAS.find((o) => o.slug === b.slug)).toBeDefined();
	});

	it('histórico de redação e provas anteriores apontam para domínios oficiais', () => {
		for (const r of REDACAO_HISTORY) expect(r.provaUrl).toMatch(/^https:\/\/www\.vestibular\.uerj\.br\//);
		for (const e of PAST_EXAMS) {
			expect(e.commentedUrl).toMatch(/^https:\/\/www\.revista\.vestibular\.uerj\.br\//);
			for (const l of Object.values(e.disciplines)) if (l?.prova) expect(l.prova).toMatch(/vestibular\.uerj\.br/);
		}
	});
});

describe('programa e incidência', () => {
	it('ids de tópicos são únicos', () => {
		const ids = SYLLABUS.flatMap((d) => d.units.flatMap((u) => u.topics.map((t) => t.id)));
		expect(new Set(ids).size).toBe(ids.length);
		expect(SYLLABUS.map((d) => d.code).sort()).toEqual([...codes].sort());
	});

	it('incidência só referencia tópicos existentes', () => {
		for (const id of Object.keys(INCIDENCE.topics)) expect(getTopic(id), id).toBeDefined();
		expect(INCIDENCE.years.length).toBeGreaterThanOrEqual(7);
	});
});

describe('banco de questões', () => {
	it('questões oficiais: campos obrigatórios, ids únicos e tópicos válidos', () => {
		const ids = new Set<string>();
		for (const q of official as any[]) {
			expect(ids.has(q.id)).toBe(false);
			ids.add(q.id);
			expect(codes).toContain(q.discipline);
			expect(q.statement.length).toBeGreaterThan(40);
			expect(q.sourceUrl).toMatch(/^https:\/\/www\.revista\.vestibular\.uerj\.br\/arquivos\/pdf\/questao\/\d+\.pdf#page=\d+$/);
			for (const t of q.topicIds) expect(getTopic(t), `${q.id}:${t}`).toBeDefined();
		}
		expect(ids.size).toBeGreaterThan(500);
	});

	it('questões inéditas nunca se passam por oficiais e têm resposta-modelo', () => {
		for (const q of ineditas as any[]) {
			expect(q.id.startsWith('ined-')).toBe(true);
			expect(q.modelAnswer.length).toBeGreaterThan(40);
			expect(q.explanation.length).toBeGreaterThan(20);
			expect(['facil', 'medio', 'dificil']).toContain(q.difficulty);
			expect(q).not.toHaveProperty('year');
			for (const t of q.topicIds) expect(getTopic(t), `${q.id}:${t}`).toBeDefined();
		}
	});
});

describe('conteúdo pedagógico', () => {
	it('resumos editoriais correspondem a tópicos, têm referências e todas as seções', () => {
		expect(RESUMOS.length).toBeGreaterThanOrEqual(9);
		for (const r of RESUMOS) {
			expect(getTopic(r.topicId), r.topicId).toBeDefined();
			expect(r.references.length).toBeGreaterThan(0);
			for (const s of ['Conceitos fundamentais', 'Explicação detalhada', 'Exemplos práticos', 'Como o assunto pode aparecer na prova discursiva', 'Exercícios de fixação']) {
				expect(r.body, `${r.topicId}: ${s}`).toContain(`## ${s}`);
			}
		}
	});

	it('propostas de redação plausíveis têm caminhos sim/não/depende', () => {
		for (const t of TEMAS_2027) {
			expect(t.question.endsWith('?')).toBe(true);
			expect(t.caminhos.map((c) => c.posicao).sort()).toEqual(['Depende', 'Não', 'Sim']);
			expect(t.motivadores.every((m) => m.title.includes('elaborado'))).toBe(true);
		}
	});
});
