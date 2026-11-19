import { describe, expect, it } from 'vitest';
import { APOSTILAS, AULAS, documentoDeProducao, getApostila, roteiroEmTexto, segundos } from './producao';
import { getTopic } from '$lib/domain/syllabus';
import { parseMapa, splitMapa } from './mindmap';
import { renderDocument } from './markdown';

const SECOES_APOSTILA = [
	'## 1. Identificação do tema e relevância para a UERJ',
	'## 2. Fontes e referências utilizadas',
	'## 3. Material didático completo',
	'## 4. Conceitos fundamentais',
	'## 5. Aprofundamentos relevantes',
	'## 6. Pontos de atenção e erros frequentes',
	'## 7. Aplicações nas questões discursivas',
	'## 8. Questões oficiais e resoluções comentadas',
	'## 9. Exercícios inéditos (autorais)',
	'## 12. Checklist de aprendizagem',
	'## Mapa mental'
];

describe('produção nível 3 (apostila + aula animada)', () => {
	it('documentos de referência existem: diretrizes e diagnóstico da banca', () => {
		expect(documentoDeProducao('diretrizes')).toContain('Formato de entrega');
		expect(documentoDeProducao('diagnostico')).toContain('Questões Comentadas');
	});

	it('cada projeto pertence a um tópico do programa e tem apostila e aula', () => {
		expect(APOSTILAS.length).toBeGreaterThan(0);
		for (const a of APOSTILAS) {
			expect(getTopic(a.topicId), a.topicId).toBeDefined();
			expect(AULAS.some((x) => x.topicId === a.topicId), `${a.topicId}: aula`).toBe(true);
		}
	});

	it('apostila segue o formato de entrega, com fontes oficiais e mapa mental válido', () => {
		for (const a of APOSTILAS) {
			for (const s of SECOES_APOSTILA) expect(a.body, `${a.topicId}: ${s}`).toContain(s);
			expect(a.references.length).toBeGreaterThanOrEqual(5);
			expect(a.references.some((r) => r.includes('vestibular.uerj.br'))).toBe(true);
			expect(a.body).toContain('Não são questões oficiais');
			const { mapa } = splitMapa(a.body);
			const data = parseMapa(a.title, mapa ?? '');
			expect(data.branches.length).toBeGreaterThanOrEqual(6);
			for (const b of data.branches) {
				expect((b.lead ?? '').length, `${a.topicId}: ${b.label}`).toBeGreaterThanOrEqual(40);
				expect(b.items.length).toBeGreaterThanOrEqual(2);
			}
			if (a.discipline === 'HIS') expect(data.timeline.length).toBeGreaterThanOrEqual(6);
		}
	});

	it('cada questão oficial comentada traz fonte oficial, padrão e resposta-modelo', () => {
		for (const a of APOSTILAS) {
			const sec8 = a.body.split('## 8.')[1].split('\n## 9.')[0];
			const questoes = sec8.split(/\n(?=#### UERJ )/).filter((b) => b.startsWith('#### UERJ'));
			expect(questoes.length, a.topicId).toBeGreaterThan(0);
			for (const q of questoes) {
				const nome = q.split('\n')[0];
				expect(q, nome).toMatch(/\*\*Fonte oficial:\*\* https:\/\/www\.revista\.vestibular\.uerj\.br\//);
				expect(q, nome).toContain('**Padrão oficial');
				expect(q, nome).toContain('**Resposta-modelo:**');
			}
		}
	});

	it('roteiro: cada cena tem os dez elementos e narração integral', () => {
		for (const au of AULAS) {
			expect(au.intro, au.topicId).not.toBe('');
			expect(au.orientacoes, au.topicId).not.toBe('');
			expect(au.conferencia, au.topicId).not.toBe('');
			expect(au.episodios.length).toBeGreaterThan(0);
			for (const ep of au.episodios) {
				expect(ep.cenas.length, `ep ${ep.numero}`).toBeGreaterThan(0);
				for (const c of ep.cenas) {
					const nome = `${au.topicId} cena ${c.id}`;
					expect(c.id, nome).toMatch(/^\d+\.\d+$/);
					expect(c.title, nome).not.toBe('');
					for (const k of ['objetivo', 'conteudo', 'camera', 'transicao', 'textos', 'visuais', 'animacao'] as const) {
						expect(c[k], `${nome}: ${k}`).not.toBe('');
					}
					expect(c.duracaoSeg, nome).toBeGreaterThan(0);
					expect(c.narracao.split(/\s+/).length, `${nome}: narração`).toBeGreaterThanOrEqual(60);
				}
			}
			expect(au.duracaoSeg).toBe(au.episodios.reduce((s, e) => s + e.duracaoSeg, 0));
		}
	});

	it('a tabela de episódios bate com a soma das cenas', () => {
		for (const au of AULAS) {
			for (const ep of au.episodios) {
				const linha = au.intro.split('\n').find((l) => l.startsWith(`| ${ep.numero} |`));
				expect(linha, `${au.topicId}: episódio ${ep.numero} na tabela`).toBeDefined();
				const dur = linha!.split('|').slice(-2, -1)[0];
				expect(segundos(dur), `${au.topicId}: duração do episódio ${ep.numero}`).toBe(ep.duracaoSeg);
			}
		}
	});

	it('conferência de consistência cita todas as partes da apostila e todas as questões oficiais', () => {
		for (const au of AULAS) {
			const ap = getApostila(au.topicId)!;
			const partes = [...ap.body.matchAll(/^### (Parte [IVXLC]+)/gm)].map((m) => m[1]);
			expect(partes.length).toBeGreaterThan(0);
			for (const p of partes) expect(au.conferencia, `${au.topicId}: ${p}`).toMatch(new RegExp(`${p}(?![IVXLC])`));
			const questoes = [...ap.body.matchAll(/^#### UERJ (\d{4}) — Questão (\d+)/gm)].map((m) => `${m[1]} Q${m[2]}`);
			for (const q of questoes) expect(au.conferencia, `${au.topicId}: ${q}`).toContain(q);
		}
	});

	it('apostila vira documento navegável e o roteiro vira texto para a ferramenta de produção', () => {
		for (const a of APOSTILAS) {
			const { html, toc } = renderDocument(splitMapa(a.body).body);
			expect(toc.filter((t) => t.level === 2).length).toBeGreaterThanOrEqual(10);
			expect(new Set(toc.map((t) => t.id)).size).toBe(toc.length);
			expect(html).not.toContain('<script');
		}
		for (const au of AULAS) {
			const txt = roteiroEmTexto(au.episodios[0]);
			expect(txt).toContain('NARRAÇÃO:');
			expect(txt).not.toContain('**');
		}
	});
});
