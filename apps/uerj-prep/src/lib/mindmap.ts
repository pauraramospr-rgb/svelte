/**
 * Mapas mentais dos resumos.
 *
 * 1. Preferencial: a seção "## Mapa mental" escrita no próprio resumo — cada "### Ramo" é uma
 *    caixa com tópicos explicativos (frases curtas, em ordem lógica ou cronológica) e
 *    "### Linha do tempo" vira a faixa cronológica do mapa.
 * 2. Alternativa (resumos sem essa seção): mapa montado a partir das seções e destaques do texto.
 */

export interface MindNode {
	label: string;
	children: MindNode[];
}

/** Seções que não entram no mapa (exercícios e respostas são para treino, não para revisão visual). */
const SKIP = /^(exercícios|respostas|referências|fontes)/i;
const MAX_LEAVES = 7;
const MAX_LABEL = 70;

function clean(s: string): string {
	return s
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/[*_`]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function shorten(s: string, max = MAX_LABEL): string {
	if (s.length <= max) return s;
	const cut = s.slice(0, max);
	const sp = cut.lastIndexOf(' ');
	return (sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[,;:.\s]+$/, '') + '…';
}

/** Extrai o rótulo de uma linha de conteúdo, ou null se ela não gera folha. */
function leafLabel(line: string): string | null {
	const t = line.trim();
	if (!t || t.startsWith('>') || t.startsWith('|---') || /^\|?\s*-{3,}/.test(t)) return null;
	// Linha de tabela: "| 1776 | Declaração … |" → "1776 — Declaração …"
	if (t.startsWith('|')) {
		const cells = t
			.split('|')
			.map((c) => clean(c))
			.filter(Boolean);
		if (cells.length < 2 || /^(ano|fato|data|grandeza|tipo)$/i.test(cells[0])) return null;
		return shorten(`${cells[0]} — ${cells[1]}`);
	}
	// Parágrafo que começa com título em negrito: "**1. A crise.** Texto" → "A crise"
	const bold = t.match(/^(?:[-*]\s+|\d+\.\s+)?\*\*([^*]+?)\*\*/);
	if (bold) {
		const label = clean(bold[1])
			.replace(/^\d+\.\s*/, '')
			.replace(/[.:]$/, '');
		if (label.length >= 2) return shorten(label);
	}
	// Item de lista simples: "- texto: explicação" → "texto"
	const item = t.match(/^(?:[-*]|\d+\.)\s+(.*)$/);
	if (item) {
		const body = clean(item[1]);
		const head = body.split(/:\s|\s—\s|\s–\s/)[0];
		return shorten(head.length >= 3 ? head : body);
	}
	return null;
}

export function buildMindMap(title: string, markdown: string): MindNode {
	const root: MindNode = { label: shorten(clean(title), 60), children: [] };
	let current: MindNode | null = null;
	let skipping = false;
	const firstText = new Map<MindNode, string>();
	for (const raw of markdown.split('\n')) {
		const h = raw.match(/^##\s+(.*)$/);
		if (h) {
			const name = clean(h[1]);
			skipping = SKIP.test(name);
			current = skipping ? null : { label: shorten(name, 50), children: [] };
			if (current) root.children.push(current);
			continue;
		}
		if (skipping || !current) continue;
		if (/^#{3,}\s/.test(raw)) {
			const sub = clean(raw.replace(/^#+\s*/, ''));
			if (current.children.length < MAX_LEAVES && sub) current.children.push({ label: shorten(sub), children: [] });
			continue;
		}
		if (current.children.length >= MAX_LEAVES) continue;
		const label = leafLabel(raw);
		if (label && !current.children.some((c) => c.label === label)) current.children.push({ label, children: [] });
		else if (!label && raw.trim() && !/^[>|#]/.test(raw.trim()) && !firstText.has(current)) firstText.set(current, clean(raw));
	}
	// Seções só com texto corrido: usa as primeiras frases como folhas.
	for (const [branch, text] of firstText) {
		if (branch.children.length) continue;
		for (const sentence of text.split(/(?<=[.!?])\s+/).slice(0, 2)) if (sentence.length > 3) branch.children.push({ label: shorten(sentence), children: [] });
	}
	root.children = root.children.filter((c) => c.children.length > 0 || !/^(fórmulas|não se aplica)/i.test(c.label));
	return root;
}

/* ------------------------------------------------------------------ mapa escrito */

export interface MapItem {
	strong?: string;
	/** Separador entre o destaque e o texto (": " quando o original tinha dois-pontos ou travessão). */
	sep?: string;
	text: string;
}

export interface MapBranch {
	label: string;
	/** Texto corrido que abre o balão (explica o ramo antes dos tópicos). */
	lead?: string;
	items: MapItem[];
}

export interface MindMapData {
	center: string;
	subtitle?: string;
	branches: MapBranch[];
	timeline: { when: string; what: string }[];
	authored: boolean;
}

const MAPA_HEADING = /^##\s+Mapa mental\s*$/im;

/** Separa a seção "## Mapa mental" do restante do resumo (o texto não a exibe). */
export function splitMapa(markdown: string): { body: string; mapa: string | null } {
	const m = MAPA_HEADING.exec(markdown);
	if (!m) return { body: markdown, mapa: null };
	const start = m.index;
	const after = markdown.slice(start + m[0].length);
	const next = after.search(/^##\s+(?!#)/m);
	const mapa = next === -1 ? after : after.slice(0, next);
	const rest = next === -1 ? '' : after.slice(next);
	return { body: (markdown.slice(0, start) + rest).trim(), mapa: mapa.trim() };
}

function parseItem(line: string): MapItem {
	const t = line.replace(/^(?:[-*]|\d+\.)\s+/, '').trim();
	const m = t.match(/^\*\*([^*]+?)\*\*(\s*[:—–]\s*|\s*)(.*)$/);
	if (m) {
		const rest = clean(m[3]);
		const sep = m[2].trim() ? ': ' : /^[,.;)]/.test(rest) || !rest ? '' : ' ';
		return { strong: clean(m[1]).replace(/[:.]$/, ''), sep, text: rest };
	}
	return { text: clean(t) };
}

/** Lê a seção escrita do mapa mental. */
export function parseMapa(title: string, mapa: string): MindMapData {
	const data: MindMapData = { center: clean(title), branches: [], timeline: [], authored: true };
	let current: MapBranch | null = null;
	let isTimeline = false;
	for (const raw of mapa.split('\n')) {
		const line = raw.trim();
		if (!line) continue;
		const h = line.match(/^###\s+(.*)$/);
		if (h) {
			const label = clean(h[1]);
			isTimeline = /^linha do tempo/i.test(label);
			current = isTimeline ? null : { label, items: [] };
			if (current) data.branches.push(current);
			continue;
		}
		if (line.startsWith('>')) {
			if (!data.subtitle) data.subtitle = clean(line.replace(/^>\s*/, ''));
			continue;
		}
		if (!/^(?:[-*]|\d+\.)\s+/.test(line)) {
			if (current && !isTimeline) current.lead = (current.lead ? current.lead + ' ' : '') + clean(line);
			continue;
		}
		const item = parseItem(line);
		if (isTimeline) data.timeline.push({ when: item.strong ?? '', what: item.text });
		else current?.items.push(item);
	}
	data.branches = data.branches.filter((b) => b.items.length > 0);
	return data;
}

/** Mapa do resumo: a seção escrita, se existir; senão, o mapa montado a partir do texto. */
export function mindMapData(title: string, markdown: string): MindMapData {
	const { body, mapa } = splitMapa(markdown);
	if (mapa) {
		const d = parseMapa(title, mapa);
		if (d.branches.length >= 3) return d;
	}
	const tree = buildMindMap(title, body);
	return {
		center: tree.label,
		branches: tree.children.filter((c) => c.children.length > 0).map((c) => ({ label: c.label, items: c.children.map((x) => ({ text: x.label })) })),
		timeline: [],
		authored: false
	};
}
