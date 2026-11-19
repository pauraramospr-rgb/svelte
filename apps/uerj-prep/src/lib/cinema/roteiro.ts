/**
 * Leitura dos roteiros das aulas animadas (`src/lib/data/aulas/<tópico>.md`).
 *
 * Formato:
 *   ---  (front matter: title, reviewed, referências em linhas "- ")
 *   # Parte 1 — Título da parte        → episódio
 *   ## Título da cena                   → cena
 *   Parágrafos de narração (texto corrido).
 *   :: tipo argumentos @âncora          → diretiva de encenação (entra quando a âncora é dita)
 *   - item @âncora                      → itens da diretiva anterior
 *   > destaque                          → destaque (documentos)
 *
 * A âncora é uma palavra (`@Ceuta`) ou frase (`@"Bartolomeu Dias"`) da narração, com ajuste opcional em
 * segundos (`@Ceuta+1.5`).
 */

export interface Ancora {
	frase: string;
	desloc: number;
}

export interface ItemDiretiva {
	texto: string;
	ancora?: Ancora;
	linha: number;
}

export interface Diretiva {
	tipo: string;
	args: string;
	ancora?: Ancora;
	itens: ItemDiretiva[];
	destaque?: string;
	linha: number;
}

export interface CenaRoteiro {
	id: string;
	titulo: string;
	narracao: string;
	diretivas: Diretiva[];
}

export interface ParteRoteiro {
	numero: number;
	titulo: string;
	cenas: CenaRoteiro[];
}

export interface AulaRoteiro {
	topicId: string;
	titulo: string;
	revisado: string;
	referencias: string[];
	partes: ParteRoteiro[];
}

const RE_ANCORA = /\s@(?:"([^"]+)"|“([^”]+)”|([\p{L}\p{N}\-]+))([+-]\d+(?:\.\d+)?)?\s*$/u;

/** Separa a âncora do fim de uma linha. */
export function separarAncora(linha: string): { texto: string; ancora?: Ancora } {
	const m = linha.match(RE_ANCORA);
	if (!m) return { texto: linha.trim() };
	return { texto: linha.slice(0, m.index).trim(), ancora: { frase: (m[1] ?? m[2] ?? m[3]).trim(), desloc: m[4] ? Number(m[4]) : 0 } };
}

export function lerAula(topicId: string, raw: string): AulaRoteiro {
	const texto = raw.replace(/\r\n/g, '\n');
	let corpo = texto;
	const meta: Record<string, string> = {};
	const referencias: string[] = [];
	const fm = texto.match(/^---\n([\s\S]*?)\n---\n/);
	if (fm) {
		corpo = texto.slice(fm[0].length);
		for (const l of fm[1].split('\n')) {
			const kv = l.match(/^(\w+):\s*(.*)$/);
			if (kv) meta[kv[1]] = kv[2].trim();
			else if (l.startsWith('- ')) referencias.push(l.slice(2).trim());
		}
	}
	const partes: ParteRoteiro[] = [];
	let parte: ParteRoteiro | null = null;
	let cena: (CenaRoteiro & { paragrafos: string[] }) | null = null;
	let diretiva: Diretiva | null = null;
	let paragrafo: string[] = [];

	const fecharParagrafo = () => {
		if (cena && paragrafo.length) cena.paragrafos.push(paragrafo.join(' '));
		paragrafo = [];
	};
	const fecharCena = () => {
		fecharParagrafo();
		if (cena && parte) {
			cena.narracao = cena.paragrafos.join(' ').replace(/\s+/g, ' ').trim();
			const { paragrafos, ...resto } = cena;
			void paragrafos;
			parte.cenas.push(resto);
		}
		cena = null;
		diretiva = null;
	};

	corpo.split('\n').forEach((bruta, n) => {
		const linha = bruta.trimEnd();
		const num = n + 1;
		const parteM = linha.match(/^#\s+Parte\s+(\d+)\s*[—–-]\s*(.+)$/);
		if (parteM) {
			fecharCena();
			parte = { numero: Number(parteM[1]), titulo: parteM[2].trim(), cenas: [] };
			partes.push(parte);
			return;
		}
		const cenaM = linha.match(/^##\s+(.+)$/);
		if (cenaM) {
			fecharCena();
			if (!parte) {
				parte = { numero: 1, titulo: meta.title ?? topicId, cenas: [] };
				partes.push(parte);
			}
			const p = parte as ParteRoteiro;
			cena = { id: `${p.numero}.${p.cenas.length + 1}`, titulo: cenaM[1].trim(), narracao: '', diretivas: [], paragrafos: [] };
			return;
		}
		if (!cena) return;
		const c = cena as CenaRoteiro & { paragrafos: string[] };
		if (linha.startsWith('::')) {
			fecharParagrafo();
			const { texto: semAncora, ancora } = separarAncora(linha.slice(2).trim());
			const [tipo, ...resto] = semAncora.split(/\s+/);
			diretiva = { tipo: tipo.toLowerCase(), args: resto.join(' ').trim(), ancora, itens: [], linha: num };
			c.diretivas.push(diretiva);
			return;
		}
		if (diretiva && /^-\s+/.test(linha)) {
			const { texto: t, ancora } = separarAncora(linha.replace(/^-\s+/, ''));
			diretiva.itens.push({ texto: t, ancora, linha: num });
			return;
		}
		if (diretiva && /^>\s*/.test(linha)) {
			diretiva.destaque = linha.replace(/^>\s*/, '').trim();
			return;
		}
		if (!linha.trim()) {
			fecharParagrafo();
			diretiva = null;
			return;
		}
		diretiva = null;
		paragrafo.push(linha.trim());
	});
	fecharCena();
	return { topicId, titulo: meta.title ?? topicId, revisado: meta.reviewed ?? '', referencias, partes };
}

// ——— Posição das frases (mesma divisão de `tempo.ts`) ———

export interface FrasePos {
	texto: string;
	inicio: number;
	fim: number;
}

export function limparNarracao(narracao: string): string {
	return narracao.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\s+/g, ' ').trim();
}

export function frasesComPosicao(narracao: string): FrasePos[] {
	const limpo = limparNarracao(narracao);
	const re = /(?<=[.!?…][”"’)]?)\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9“"(])/gu;
	const lista: FrasePos[] = [];
	let inicio = 0;
	for (const m of limpo.matchAll(re)) {
		const fim = m.index ?? 0;
		lista.push({ texto: limpo.slice(inicio, fim), inicio, fim });
		inicio = fim + m[0].length;
	}
	lista.push({ texto: limpo.slice(inicio), inicio, fim: limpo.length });
	return lista.filter((f) => f.texto.trim());
}

/** Texto para comparação: minúsculas, sem acentos e com aspas retas (mesmo comprimento do original). */
export function normalizar(s: string): string {
	return s
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[“”«»]/g, '"')
		.replace(/[‘’]/g, "'");
}
