/**
 * Monta as aulas animadas a partir do roteiro (`aula.md`) e das animações feitas sob medida
 * (`src/lib/data/producao/<tópico>/animacao.ts`). Cenas sem animação própria recebem a encenação automática.
 */
import type { CenaAnimada } from './tipos';
import { encenar } from './auto';
import { gravacaoDe, type Gravacao } from './gravacoes';

export interface CenaRoteiro {
	id: string;
	title: string;
	narracao: string;
	textos: string;
	visuais: string;
	animacao: string;
	objetivo: string;
	conteudo: string;
	duracao: string;
	duracaoSeg: number;
	camera: string;
	transicao: string;
}

export interface EpisodioRoteiro {
	numero: number;
	title: string;
	objetivo: string;
	cenas: CenaRoteiro[];
}

export interface CenaTocavel {
	id: string;
	titulo: string;
	narracao: string;
	animada: CenaAnimada;
	sobMedida: boolean;
	abertura: boolean;
	/** Narração gravada (voz do ElevenLabs), quando a cena já foi gravada com o texto atual. */
	gravacao?: Gravacao;
}

export interface EpisodioTocavel {
	numero: number;
	titulo: string;
	cenas: CenaTocavel[];
	sobMedida: number;
}

const modulos = import.meta.glob('../data/producao/*/animacao.ts', { eager: true }) as Record<string, { CENAS: Record<string, CenaAnimada> }>;

export function cenasSobMedida(topicId: string): Record<string, CenaAnimada> {
	const entrada = Object.entries(modulos).find(([p]) => p.split('/').slice(-2, -1)[0] === topicId);
	return entrada ? entrada[1].CENAS : {};
}

export function temAnimacao(topicId: string): boolean {
	return Object.keys(cenasSobMedida(topicId)).length > 0;
}

/** Abertura de cada episódio: título da série e do episódio (6 s, sem narração). */
export function abertura(serie: string, numero: number, titulo: string, rotulo = 'EPISÓDIO'): CenaAnimada {
	return {
		fundo: 'noite',
		duracao: 6.5,
		transicao: 'preto',
		elementos: [
			{ k: 'sombra', cor: '#05070f', opac: 0.55, a: { s: 0, fx: 'none' } },
			{ k: 'brilho', x: 800, y: 430, r: 520, fixo: true, a: { s: 0, d: 0.2, dur: 2.5 } },
			{ k: 'texto', texto: 'DISCURSIVA · AULA ANIMADA', x: 800, y: 300, alinhar: 'middle', tam: 24, fonte: 'mono', peso: 700, cor: '#ffd84d', fixo: true, a: { s: 0, d: 0.3, dur: 1 } },
			{ k: 'titulo', texto: serie, x: 800, y: 420, tam: 70, fixo: true, a: { s: 0, d: 0.7, fx: 'zoom', dur: 1.6 } },
			{ k: 'texto', texto: `${rotulo} ${numero}`, x: 800, y: 590, alinhar: 'middle', tam: 30, fonte: 'mono', peso: 700, cor: '#ffd84d', fixo: true, a: { s: 0, d: 2.1, fx: 'up' } },
			{ k: 'texto', texto: titulo, x: 800, y: 652, alinhar: 'middle', tam: 46, fonte: 'display', cor: '#fffaf0', larg: 1300, fixo: true, a: { s: 0, d: 2.5, fx: 'up', dur: 1 } }
		]
	};
}

export function montarEpisodios(topicId: string, serie: string, episodios: EpisodioRoteiro[]): EpisodioTocavel[] {
	const proprias = cenasSobMedida(topicId);
	return episodios.map((ep) => {
		const cenas: CenaTocavel[] = [
			{ id: `ep${ep.numero}`, titulo: `Abertura do episódio ${ep.numero}`, narracao: '', animada: abertura(serie, ep.numero, ep.title), sobMedida: true, abertura: true },
			...ep.cenas.map((c) => ({
				id: c.id,
				titulo: c.title,
				narracao: c.narracao,
				animada: proprias[c.id] ?? encenar(c),
				sobMedida: !!proprias[c.id],
				abertura: false
			}))
		];
		return { numero: ep.numero, titulo: ep.title, cenas, sobMedida: ep.cenas.filter((c) => proprias[c.id]).length };
	});
}

// ——— Aulas no formato de roteiro com diretivas (src/lib/data/aulas/<tópico>.md) ———
import { lerAula, type AulaRoteiro } from './roteiro';
import { encenar as encenarRoteiro } from './encenador';

const roteiros = import.meta.glob('../data/aulas/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

function idDoArquivo(p: string): string {
	return p.split('/').pop()!.replace(/\.md$/, '');
}

export const AULAS_ROTEIRO: AulaRoteiro[] = Object.entries(roteiros)
	.filter(([p]) => !idDoArquivo(p).startsWith('_'))
	.map(([p, raw]) => lerAula(idDoArquivo(p), raw));

export function roteiroDe(topicId: string): AulaRoteiro | undefined {
	return AULAS_ROTEIRO.find((a) => a.topicId === topicId);
}

/** Episódios tocáveis de uma aula em roteiro: abertura de cada parte + cenas encenadas automaticamente. */
export function episodiosDoRoteiro(aula: AulaRoteiro): { episodios: EpisodioTocavel[]; avisos: string[]; ordem: string[] } {
	const avisos: string[] = [];
	const ordem: string[] = [];
	const episodios = aula.partes.map((p) => {
		const cenas: CenaTocavel[] = [
			{ id: `ep${p.numero}`, titulo: `Abertura da parte ${p.numero}`, narracao: '', animada: abertura(aula.titulo, p.numero, p.titulo, 'PARTE'), sobMedida: true, abertura: true },
			...p.cenas.map((c) => {
				const { animada, avisos: av, ordem: or } = encenarRoteiro(c);
				for (const a of av) avisos.push(`cena ${c.id} (${c.titulo}): ${a}`);
				for (const a of or) ordem.push(`cena ${c.id} (${c.titulo}): ${a}`);
				const gravacao = gravacaoDe(aula.topicId, c.id, c.narracao);
				return { id: c.id, titulo: c.titulo, narracao: c.narracao, animada, sobMedida: true, abertura: false, ...(gravacao ? { gravacao } : {}) };
			})
		];
		return { numero: p.numero, titulo: p.titulo, cenas, sobMedida: p.cenas.length };
	});
	return { episodios, avisos, ordem };
}
