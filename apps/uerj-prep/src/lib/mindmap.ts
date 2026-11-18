/**
 * Mapa mental gerado a partir da estrutura de um resumo em Markdown.
 * Ramos = seções "## …"; folhas = termos em destaque, títulos de parágrafos numerados,
 * itens de lista e linhas de tabela. Funciona para resumos editoriais e para os gerados por IA.
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

/* ------------------------------------------------------------------ layout */

export interface PlacedNode {
	x: number;
	y: number;
	w: number;
	h: number;
	lines: string[];
	level: 0 | 1 | 2;
	branch: number;
	side: 'left' | 'right' | 'center';
}

export interface Edge {
	from: { x: number; y: number };
	to: { x: number; y: number };
	branch: number;
}

export interface MindLayout {
	width: number;
	height: number;
	nodes: PlacedNode[];
	edges: Edge[];
}

const LINE = 16;
const PAD_Y = 8;
const CHARS = { 0: 18, 1: 22, 2: 30 } as const;
const WIDTH = { 0: 180, 1: 190, 2: 240 } as const;
const GAP_X = 36;
const GAP_LEAF = 8;
const GAP_BRANCH = 18;

export function wrap(text: string, max: number): string[] {
	const words = text.split(' ');
	const lines: string[] = [];
	let line = '';
	for (const w of words) {
		if (!line) line = w;
		else if ((line + ' ' + w).length <= max) line += ' ' + w;
		else {
			lines.push(line);
			line = w;
		}
	}
	if (line) lines.push(line);
	return lines;
}

function box(label: string, level: 0 | 1 | 2) {
	const lines = wrap(label, CHARS[level]);
	return { lines, w: WIDTH[level], h: lines.length * LINE + PAD_Y * 2 };
}

export function layoutMindMap(tree: MindNode): MindLayout {
	const n = tree.children.length;
	const rightCount = Math.ceil(n / 2);
	const sides: { side: 'right' | 'left'; items: number[] }[] = [
		{ side: 'right', items: tree.children.map((_, i) => i).slice(0, rightCount) },
		{ side: 'left', items: tree.children.map((_, i) => i).slice(rightCount) }
	];
	const rootBox = box(tree.label, 0);
	const sideW = WIDTH[1] + WIDTH[2] + GAP_X * 2;
	const width = rootBox.w + sideW * 2;
	const cx = width / 2;

	const nodes: PlacedNode[] = [];
	const edges: Edge[] = [];

	// Altura de cada lado
	const blocks = sides.map((s) =>
		s.items.map((i) => {
			const b = tree.children[i];
			const bb = box(b.label, 1);
			const leaves = b.children.map((c) => box(c.label, 2));
			const leavesH = leaves.reduce((a, l) => a + l.h, 0) + Math.max(0, leaves.length - 1) * GAP_LEAF;
			return { i, bb, leaves, h: Math.max(bb.h, leavesH) };
		})
	);
	const sideH = blocks.map((bl) => bl.reduce((a, b) => a + b.h, 0) + Math.max(0, bl.length - 1) * GAP_BRANCH);
	const height = Math.max(rootBox.h, ...sideH) + 40;
	const cy = height / 2;

	nodes.push({ x: cx - rootBox.w / 2, y: cy - rootBox.h / 2, w: rootBox.w, h: rootBox.h, lines: rootBox.lines, level: 0, branch: -1, side: 'center' });

	sides.forEach((s, si) => {
		let y = cy - sideH[si] / 2;
		const right = s.side === 'right';
		const bx = right ? cx + rootBox.w / 2 + GAP_X : cx - rootBox.w / 2 - GAP_X - WIDTH[1];
		const lx = right ? bx + WIDTH[1] + GAP_X : bx - GAP_X - WIDTH[2];
		for (const blk of blocks[si]) {
			const by = y + blk.h / 2 - blk.bb.h / 2;
			nodes.push({ x: bx, y: by, w: blk.bb.w, h: blk.bb.h, lines: blk.bb.lines, level: 1, branch: blk.i, side: s.side });
			edges.push({
				from: { x: right ? cx + rootBox.w / 2 : cx - rootBox.w / 2, y: cy },
				to: { x: right ? bx : bx + WIDTH[1], y: by + blk.bb.h / 2 },
				branch: blk.i
			});
			const leavesH = blk.leaves.reduce((a, l) => a + l.h, 0) + Math.max(0, blk.leaves.length - 1) * GAP_LEAF;
			let ly = y + blk.h / 2 - leavesH / 2;
			for (const lf of blk.leaves) {
				nodes.push({ x: lx, y: ly, w: lf.w, h: lf.h, lines: lf.lines, level: 2, branch: blk.i, side: s.side });
				edges.push({
					from: { x: right ? bx + WIDTH[1] : bx, y: by + blk.bb.h / 2 },
					to: { x: right ? lx : lx + WIDTH[2], y: ly + lf.h / 2 },
					branch: blk.i
				});
				ly += lf.h + GAP_LEAF;
			}
			y += blk.h + GAP_BRANCH;
		}
	});

	return { width, height, nodes, edges };
}

/** Caminho SVG suave entre dois pontos (curva horizontal). */
export function edgePath(e: Edge): string {
	const mx = (e.from.x + e.to.x) / 2;
	return `M${e.from.x},${e.from.y} C${mx},${e.from.y} ${mx},${e.to.y} ${e.to.x},${e.to.y}`;
}
