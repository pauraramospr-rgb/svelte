/**
 * Monta as aulas animadas a partir do roteiro (`aula.md`) e das animações feitas sob medida
 * (`src/lib/data/producao/<tópico>/animacao.ts`). Cenas sem animação própria recebem a encenação automática.
 */
import type { CenaAnimada } from './tipos';
import { encenar } from './auto';

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
export function abertura(serie: string, numero: number, titulo: string): CenaAnimada {
	return {
		fundo: 'noite',
		duracao: 6.5,
		transicao: 'preto',
		elementos: [
			{ k: 'sombra', cor: '#05070f', opac: 0.55, a: { s: 0, fx: 'none' } },
			{ k: 'brilho', x: 800, y: 430, r: 520, fixo: true, a: { s: 0, d: 0.2, dur: 2.5 } },
			{ k: 'texto', texto: 'DISCURSIVA · AULA ANIMADA', x: 800, y: 300, alinhar: 'middle', tam: 24, fonte: 'mono', peso: 700, cor: '#ffd84d', fixo: true, a: { s: 0, d: 0.3, dur: 1 } },
			{ k: 'titulo', texto: serie, x: 800, y: 420, tam: 70, fixo: true, a: { s: 0, d: 0.7, fx: 'zoom', dur: 1.6 } },
			{ k: 'texto', texto: `EPISÓDIO ${numero}`, x: 800, y: 590, alinhar: 'middle', tam: 30, fonte: 'mono', peso: 700, cor: '#ffd84d', fixo: true, a: { s: 0, d: 2.1, fx: 'up' } },
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
