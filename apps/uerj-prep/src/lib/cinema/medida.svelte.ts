/**
 * Medição real de texto (canvas) para quebrar linhas e encaixar fontes dentro das caixas.
 * No servidor (sem canvas) usa uma estimativa; no navegador, recalcula quando as fontes terminam de carregar.
 */
import { FONTE } from './util';

export type Familia = keyof typeof FONTE;

/** Muda quando as fontes da página terminam de carregar: quem depende de medidas relê este valor. */
export const fontes = $state({ versao: 0 });

let ctx: CanvasRenderingContext2D | null = null;
let observando = false;
const cache = new Map<string, number>();

const ESTIMATIVA: Record<Familia, number> = { display: 0.58, corpo: 0.54, mono: 0.6, maquina: 0.6, serifa: 0.52 };

function contexto(): CanvasRenderingContext2D | null {
	if (ctx) return ctx;
	if (typeof document === 'undefined') return null;
	try {
		ctx = document.createElement('canvas').getContext('2d');
	} catch {
		ctx = null;
	}
	if (ctx && !observando) {
		observando = true;
		const renovar = () => {
			cache.clear();
			fontes.versao++;
		};
		try {
			document.fonts?.ready.then(renovar);
			document.fonts?.addEventListener?.('loadingdone', renovar);
		} catch {
			/* sem API de fontes */
		}
	}
	return ctx;
}

/** Largura de um texto em unidades do palco (1 unidade = 1px de fonte). */
export function medir(texto: string, familia: Familia, tam: number, peso = 600): number {
	const c = contexto();
	if (!c) return texto.length * tam * ESTIMATIVA[familia];
	const chave = `${familia}|${peso}|${texto}`;
	let base = cache.get(chave);
	if (base === undefined) {
		c.font = `${peso} 100px ${FONTE[familia]}`;
		base = c.measureText(texto).width / 100;
		cache.set(chave, base);
	}
	return base * tam;
}

/** Quebra em linhas que cabem em `larg` (palavras longas demais ficam sozinhas na linha). */
export function quebrarMedido(texto: string, larg: number, familia: Familia, tam: number, peso = 600): string[] {
	const linhas: string[] = [];
	for (const paragrafo of texto.split('\n')) {
		let atual = '';
		for (const palavra of paragrafo.split(/\s+/).filter(Boolean)) {
			const tentativa = atual ? `${atual} ${palavra}` : palavra;
			if (!atual || medir(tentativa, familia, tam, peso) <= larg) atual = tentativa;
			else {
				linhas.push(atual);
				atual = palavra;
			}
		}
		linhas.push(atual);
	}
	return linhas.filter((l, i) => l || i < linhas.length - 1);
}

export interface Encaixe {
	linhas: string[];
	tam: number;
	/** Altura ocupada (linhas × entrelinha). */
	altura: number;
	/** Maior largura de linha. */
	largura: number;
}

/**
 * Maior tamanho de fonte (até `tamMax`) em que o texto cabe na caixa `larg` × `alt`.
 * Nunca devolve linha mais larga que a caixa: se nem no tamanho mínimo couber, reduz a escala da linha.
 */
export function encaixar(texto: string, larg: number, alt: number, familia: Familia, tamMax: number, peso = 600, entrelinha = 1.25, tamMin = 12): Encaixe {
	void fontes.versao;
	let tam = tamMax;
	for (;;) {
		const linhas = quebrarMedido(texto, larg, familia, tam, peso);
		const altura = linhas.length * tam * entrelinha;
		const largura = Math.max(0, ...linhas.map((l) => medir(l, familia, tam, peso)));
		if ((altura <= alt && largura <= larg + 0.5) || tam <= tamMin) {
			if (largura > larg && tam <= tamMin) {
				// palavra única maior que a caixa: diminui só o necessário
				const fator = larg / largura;
				const t2 = Math.max(6, tam * fator);
				return { linhas: quebrarMedido(texto, larg, familia, t2, peso), tam: t2, altura: linhas.length * t2 * entrelinha, largura: larg };
			}
			return { linhas, tam, altura, largura };
		}
		tam = Math.max(tamMin, tam * 0.92);
	}
}

/** Uma linha só: o maior tamanho (até `tamMax`) cuja largura cabe em `larg`. */
export function caberLinha(texto: string, larg: number, familia: Familia, tamMax: number, peso = 700): number {
	void fontes.versao;
	const w = medir(texto, familia, tamMax, peso);
	return w <= larg ? tamMax : Math.max(6, (tamMax * larg) / w);
}
