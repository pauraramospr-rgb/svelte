/**
 * Projetos de produção nível 3 (ver `src/lib/data/producao/_diretrizes.md`): para cada tópico,
 * uma apostila completa (`apostila.md`, seções 1–9 e 12 do formato de entrega) e o roteiro da
 * aula animada (`aula.md`, seções 10, 11 e 13). Categoria: interpretação pedagógica.
 */
import { parseDoc } from '$lib/content';

const apostilaFiles = import.meta.glob('./data/producao/*/apostila.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const aulaFiles = import.meta.glob('./data/producao/*/aula.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const docFiles = import.meta.glob('./data/producao/_*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export interface Documento {
	topicId: string;
	title: string;
	discipline: string;
	level: string;
	reviewed: string;
	references: string[];
	body: string;
}

export interface Cena {
	id: string;
	title: string;
	objetivo: string;
	conteudo: string;
	duracao: string;
	duracaoSeg: number;
	camera: string;
	transicao: string;
	narracao: string;
	textos: string;
	visuais: string;
	animacao: string;
}

export interface Episodio {
	numero: number;
	title: string;
	objetivo: string;
	cenas: Cena[];
	duracaoSeg: number;
}

export interface Aula extends Documento {
	intro: string;
	episodios: Episodio[];
	orientacoes: string;
	conferencia: string;
	duracaoSeg: number;
}

function topicOf(path: string): string {
	return path.split('/').slice(-2, -1)[0];
}

function documento(path: string, raw: string): Documento {
	const { meta, refs, body } = parseDoc(raw);
	const topicId = topicOf(path);
	return {
		topicId,
		title: meta.title ?? topicId,
		discipline: meta.discipline ?? topicId.split('-')[0].toUpperCase(),
		level: meta.level ?? '',
		reviewed: meta.reviewed ?? '',
		references: refs,
		body: body.trim()
	};
}

/** “1 min 40 s”, “2 min”, “50 s” → segundos. */
export function segundos(duracao: string): number {
	const min = duracao.match(/(\d+)\s*min/);
	const seg = duracao.match(/(\d+)\s*s\b/);
	return (min ? Number(min[1]) * 60 : 0) + (seg ? Number(seg[1]) : 0);
}

export function formatarDuracao(seg: number): string {
	const m = Math.floor(seg / 60);
	const s = seg % 60;
	return s ? `${m} min ${String(s).padStart(2, '0')} s` : `${m} min`;
}

/** Divide um texto em blocos pelos títulos de um nível (`## ` ou `### `), preservando o título. */
function blocos(texto: string, marcador: string): string[] {
	return texto.split(new RegExp(`\\n(?=${marcador} )`)).map((b) => b.trim());
}

function campo(texto: string, rotulo: string): string {
	const m = texto.match(new RegExp(`\\*\\*${rotulo}:\\*\\*\\s*([\\s\\S]*?)(?=\\n- \\*\\*|\\n\\n\\*\\*|$)`));
	return m ? m[1].trim() : '';
}

function cena(bloco: string): Cena {
	const [cabecalho] = bloco.split('\n');
	const t = cabecalho.replace(/^###\s+Cena\s+/, '');
	const [id, ...resto] = t.split(' — ');
	const narr = bloco.match(/\*\*Narração\*\*\s*\n+((?:>.*\n?)+)/);
	const duracao = campo(bloco, 'Duração estimada');
	return {
		id: id.trim(),
		title: resto.join(' — ').trim(),
		objetivo: campo(bloco, 'Objetivo pedagógico'),
		conteudo: campo(bloco, 'Conteúdo'),
		duracao,
		duracaoSeg: segundos(duracao),
		camera: campo(bloco, 'Câmera'),
		transicao: campo(bloco, 'Transição'),
		narracao: narr
			? narr[1]
					.split('\n')
					.map((l) => l.replace(/^>\s?/, ''))
					.join('\n')
					.trim()
			: '',
		textos: campo(bloco, 'Textos na tela'),
		visuais: campo(bloco, 'Elementos visuais'),
		animacao: campo(bloco, 'Animação')
	};
}

function aula(path: string, raw: string): Aula {
	const doc = documento(path, raw);
	const secoes = blocos('\n' + doc.body, '##');
	let intro = '';
	let orientacoes = '';
	let conferencia = '';
	const episodios: Episodio[] = [];
	for (const s of secoes) {
		if (s.startsWith('## 10.')) intro = s.replace(/^## .*\n/, '').trim();
		else if (s.startsWith('## 11.')) orientacoes = s.replace(/^## .*\n/, '').trim();
		else if (s.startsWith('## 13.')) conferencia = s.replace(/^## .*\n/, '').trim();
		else if (s.startsWith('## Episódio')) {
			const [cab] = s.split('\n');
			const m = cab.match(/^## Episódio\s+(\d+)\s+—\s+(.*)$/);
			const obj = s.match(/^>\s*Objetivo do episódio:\s*(.*)$/m);
			const cenas = blocos(s, '###')
				.filter((b) => b.startsWith('### Cena'))
				.map(cena);
			episodios.push({
				numero: m ? Number(m[1]) : episodios.length + 1,
				title: m ? m[2].trim() : cab.replace(/^##\s*/, ''),
				objetivo: obj ? obj[1].trim() : '',
				cenas,
				duracaoSeg: cenas.reduce((a, c) => a + c.duracaoSeg, 0)
			});
		}
	}
	return { ...doc, intro, episodios, orientacoes, conferencia, duracaoSeg: episodios.reduce((a, e) => a + e.duracaoSeg, 0) };
}

export const APOSTILAS: Documento[] = Object.entries(apostilaFiles).map(([p, raw]) => documento(p, raw));
export const AULAS: Aula[] = Object.entries(aulaFiles).map(([p, raw]) => aula(p, raw));

export function getApostila(topicId: string): Documento | undefined {
	return APOSTILAS.find((a) => a.topicId === topicId);
}

export function getAula(topicId: string): Aula | undefined {
	return AULAS.find((a) => a.topicId === topicId);
}

/** Documentos de referência da produção: diretrizes e diagnóstico da banca. */
export function documentoDeProducao(nome: 'diretrizes' | 'diagnostico'): string {
	const entry = Object.entries(docFiles).find(([p]) => p.endsWith(`/_${nome}.md`));
	return entry ? entry[1] : '';
}

/** Texto corrido de um episódio, pronto para colar na ferramenta de produção. */
export function roteiroEmTexto(ep: Episodio): string {
	const linhas = [`EPISÓDIO ${ep.numero} — ${ep.title}`, ep.objetivo ? `Objetivo: ${ep.objetivo}` : '', ''];
	for (const c of ep.cenas) {
		linhas.push(
			`CENA ${c.id} — ${c.title}`,
			`Objetivo pedagógico: ${c.objetivo}`,
			`Conteúdo: ${c.conteudo}`,
			`Duração estimada: ${c.duracao}`,
			`Câmera: ${c.camera}`,
			`Transição: ${c.transicao}`,
			`NARRAÇÃO: ${c.narracao}`,
			`Textos na tela: ${c.textos}`,
			`Elementos visuais: ${c.visuais}`,
			`Animação: ${c.animacao}`,
			''
		);
	}
	return linhas.join('\n').replace(/\*\*/g, '').replace(/\*/g, '');
}
