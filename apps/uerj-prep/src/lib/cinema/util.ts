/** Utilidades de desenho das aulas animadas: quebra de texto, cores, fontes e paleta. */

export const FONTE = {
	display: "'Bricolage Grotesque', Inter, system-ui, sans-serif",
	corpo: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
	mono: "'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace",
	maquina: "'Courier New', Courier, 'JetBrains Mono', monospace",
	serifa: "'Iowan Old Style', 'Palatino Linotype', Georgia, serif"
} as const;

/** Largura média de um caractere, em fração do tamanho da fonte. */
const LARGURA_CHAR: Record<keyof typeof FONTE, number> = { display: 0.56, corpo: 0.53, mono: 0.6, maquina: 0.6, serifa: 0.5 };

export const COR = {
	tinta: '#1a1410',
	papel: '#f3ead8',
	papel2: '#e8dcc2',
	sepia: '#8a6a45',
	carimbo: '#b3261e',
	eua: '#2f5d8c',
	urss: '#b3261e',
	ouro: '#d4a017',
	chumbo: '#4b525c',
	verde: '#2f6f4f',
	branco: '#fffaf0',
	azul: '#2f3cd9',
	marca: '#ffd84d',
	sombra: '#0b0d12'
} as const;

/** Quebra um texto em linhas de no máximo `maxChars` caracteres (sem cortar palavras). */
export function quebrar(texto: string, maxChars: number): string[] {
	const linhas: string[] = [];
	let atual = '';
	for (const palavra of texto.split(/\s+/).filter(Boolean)) {
		if (!atual) atual = palavra;
		else if ((atual + ' ' + palavra).length <= maxChars) atual += ' ' + palavra;
		else {
			linhas.push(atual);
			atual = palavra;
		}
	}
	if (atual) linhas.push(atual);
	return linhas;
}

/** Linhas para uma caixa de largura `larg` com fonte de tamanho `tam`. */
export function linhasPara(texto: string, larg: number, tam: number, fonte: keyof typeof FONTE = 'corpo'): string[] {
	return quebrar(texto, Math.max(4, Math.floor(larg / (tam * LARGURA_CHAR[fonte]))));
}

/** Largura aproximada de um texto de uma linha. */
export function larguraTexto(texto: string, tam: number, fonte: keyof typeof FONTE = 'corpo'): number {
	return texto.length * tam * LARGURA_CHAR[fonte];
}

function hex(c: string): [number, number, number] {
	const h = c.replace('#', '');
	const n = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
	return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
}

/** Mistura duas cores hexadecimais (p = 0 → a, p = 1 → b). */
export function misturar(a: string, b: string, p: number): string {
	const [r1, g1, b1] = hex(a);
	const [r2, g2, b2] = hex(b);
	const m = (x: number, y: number) => Math.round(x + (y - x) * p);
	return `rgb(${m(r1, r2)} ${m(g1, g2)} ${m(b1, b2)})`;
}

/** Número pseudoaleatório estável a partir de um inteiro (para posições "aleatórias" que não mudam). */
export function sorteio(i: number): number {
	const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
}
