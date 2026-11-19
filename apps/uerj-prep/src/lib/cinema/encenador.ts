/**
 * Encenador: transforma as diretivas de uma cena do roteiro (`roteiro.ts`) numa cena animada, com
 * diagramação automática (nada se sobrepõe: cada visual principal substitui o anterior) e com cada
 * elemento entrando exatamente na palavra da narração indicada pela âncora.
 */
import type { Animacao, CenaAnimada, Efeito, Elemento, Fundo, Item, Momento, NomeProp, Variante, Camera } from './tipos';
import type { CenaRoteiro, Diretiva, Ancora } from './roteiro';
import { frasesComPosicao, limparNarracao, normalizar } from './roteiro';
import { cameraDaRegiao, LUGARES, REGIOES, projetar } from './lugares';
import { cronograma } from './tempo';
import mundo from './mundo.json';

const PAISES = (mundo as unknown as { paises: Record<string, { c: [number, number] }> }).paises;

export const CORES: Record<string, string> = {
	azul: '#2f5d8c',
	anil: '#2f3cd9',
	vermelho: '#b3261e',
	verde: '#2f6f4f',
	petroleo: '#0f766e',
	amarelo: '#d4a017',
	ouro: '#d4a017',
	laranja: '#c2410c',
	roxo: '#6d28d9',
	rosa: '#be185d',
	cinza: '#6b7280',
	escuro: '#3d3430',
	marrom: '#7a4a2a',
	branco: '#f4f1e8'
};

/** Cores para pintar países: claras o bastante para não se confundirem com o oceano escuro. */
export const CORES_MAPA: Record<string, string> = {
	azul: '#6aa6dc',
	anil: '#8c96ec',
	vermelho: '#e0605a',
	verde: '#6cc070',
	petroleo: '#4cc2b0',
	amarelo: '#f2c94c',
	ouro: '#e8b931',
	laranja: '#f39a4a',
	roxo: '#a888e0',
	rosa: '#ec8cc0',
	cinza: '#b5b0aa',
	escuro: '#7a6a5c',
	marrom: '#b07a50',
	branco: '#f4f1e8'
};

const FUNDOS: Fundo[] = ['arquivo', 'papel', 'noite', 'mapa', 'prancheta', 'lousa', 'ceu', 'floresta', 'chumbo', 'tribunal', 'mar', 'cidade', 'campo', 'palacio'];
const VARIANTES: Variante[] = [
	'professor', 'estudante', 'operario', 'soldado', 'religioso', 'jornalista', 'mulher', 'campones', 'executivo', 'marinheiro', 'politico', 'mae',
	'rei', 'rainha', 'burgues', 'sansculotte', 'navegador', 'jesuita', 'indigena', 'escravizado', 'filosofo', 'soldado-antigo', 'guerrilheiro', 'jovem'
];
const PROPS: NomeProp[] = [
	'radio', 'tanque', 'navio', 'caminhao', 'congresso', 'palacio', 'calendario', 'jornal', 'cadeado', 'balanca', 'urna', 'fabrica', 'igreja', 'livro',
	'maquina', 'cratera', 'estrada', 'arvore', 'estadio', 'microfone', 'carro', 'aviao', 'engrenagem', 'lupa', 'pilha', 'barril', 'bolo', 'trem', 'tv',
	'celular', 'caravela', 'coroa', 'trono', 'canhao', 'bandeira', 'guilhotina', 'fortaleza', 'vapor', 'engenho', 'cana', 'cafe', 'ouro', 'moedas',
	'pergaminho', 'bussola', 'especiarias', 'mesquita', 'muro', 'foguete', 'satelite', 'explosao', 'trincheira', 'computador', 'conteiner', 'globo',
	'pena', 'lampada', 'cartaz'
];

/** Tipos de diretiva aceitos (validados nos testes). */
export const TIPOS = [
	'fundo', 'transicao', 'professor', 'mapa', 'camera', 'pinta', 'marca', 'rota', 'rotulo', 'titulo', 'cartao', 'lista', 'linha', 'compara', 'tabela',
	'doc', 'citacao', 'retrato', 'pessoas', 'multidao', 'objeto', 'carimbo', 'numero', 'grafico', 'piramide', 'causas', 'consequencias', 'uerj',
	'pergunta', 'limpa', 'balanca', 'painel'
] as const;

const PRINCIPAIS = new Set(['titulo', 'cartao', 'lista', 'linha', 'compara', 'tabela', 'doc', 'citacao', 'retrato', 'numero', 'grafico', 'piramide', 'causas', 'consequencias', 'uerj', 'balanca']);
const PALCO = new Set(['pessoas', 'multidao', 'objeto']);
const DE_MAPA = new Set(['mapa', 'camera', 'pinta', 'marca', 'rota', 'rotulo']);

function cor(nome: string | undefined, padrao: string): string {
	if (!nome) return padrao;
	const n = nome.trim().toLowerCase();
	if (/^#[0-9a-f]{6}$/i.test(n)) return n;
	return CORES[n] ?? padrao;
}

function semAspas(s: string): string {
	return s.trim().replace(/^["“]/, '').replace(/["”]$/, '').trim();
}

/** Divide os argumentos por " | ". */
function partes(args: string): string[] {
	return args.split(/\s*\|\s*/).map(semAspas);
}

interface Regiao {
	x: number;
	y: number;
	w: number;
	h: number;
}

/** Relógio de âncoras: converte palavras da narração em momentos. */
class Ancorador {
	private frases;
	private norm: string;
	private ultimo = 0;
	readonly duracoes: number[];
	readonly inicios: number[];
	constructor(
		narracao: string,
		private avisos: string[]
	) {
		const limpo = limparNarracao(narracao);
		this.norm = normalizar(limpo);
		this.frases = frasesComPosicao(narracao);
		const c = cronograma(narracao);
		this.duracoes = c.duracoes;
		this.inicios = c.inicios;
	}
	get total() {
		return this.frases.length;
	}
	momento(anc: Ancora | undefined, padrao: Momento): Momento {
		if (!anc) return padrao;
		if (/^#\d+$/.test(anc.frase)) return { s: Math.min(this.total - 1, Number(anc.frase.slice(1))), f: 0, d: anc.desloc };
		if (anc.frase === 'inicio') return { s: 0, f: 0, d: anc.desloc };
		const alvo = normalizar(anc.frase);
		let pos = this.norm.indexOf(alvo, this.ultimo);
		if (pos < 0) pos = this.norm.indexOf(alvo);
		if (pos < 0) {
			this.avisos.push(`âncora não encontrada na narração: "${anc.frase}"`);
			return padrao;
		}
		this.ultimo = pos;
		let s = this.frases.findIndex((f) => pos >= f.inicio && pos < f.fim + 1);
		if (s < 0) s = this.frases.length - 1;
		const f = this.frases[s];
		const len = Math.max(1, f.fim - f.inicio);
		const fr = (pos - f.inicio) / 14.5 / (len / 14.5 + 0.45);
		return { s, f: Math.round(fr * 1000) / 1000, d: anc.desloc };
	}
	/** Segundos aproximados (ritmo padrão), para ordenar e medir sobreposições. */
	segundos(m: Momento): number {
		const s = Math.max(0, Math.min(m.s, this.inicios.length - 1));
		return (this.inicios[s] ?? 0) + (m.f ?? 0) * (this.duracoes[s] ?? 0) + (m.d ?? 0);
	}
}

const mais = (m: Momento, d: number): Momento => ({ s: m.s, f: m.f, d: (m.d ?? 0) + d });
const anim = (m: Momento, fx?: Efeito, extra: Partial<Animacao> = {}): Animacao => ({ ...m, fx, ...extra });

interface Bloco {
	tipo: 'principal' | 'palco' | 'carimbo' | 'overlay' | 'limpa';
	inicio: Momento;
	seg: number;
	diretivas: Diretiva[];
	/** Momento de cada diretiva/elemento do bloco. */
	momentos: Momento[];
}

export interface Encenada {
	animada: CenaAnimada;
	avisos: string[];
}

export function encenar(cena: CenaRoteiro): Encenada {
	const avisos: string[] = [];
	const anc = new Ancorador(cena.narracao, avisos);
	const ds = cena.diretivas;
	let fundo: Fundo | undefined;
	let transicao: CenaAnimada['transicao'] = 'fade';
	let professor: 'esquerda' | 'direita' | 'fora' = 'esquerda';
	let painel: 'esquerda' | 'direita' = 'esquerda';
	const modoMapa = ds.some((d) => DE_MAPA.has(d.tipo));

	for (const d of ds) {
		if (!(TIPOS as readonly string[]).includes(d.tipo)) avisos.push(`linha ${d.linha}: tipo de diretiva desconhecido "${d.tipo}"`);
		if (d.tipo === 'fundo') {
			if (FUNDOS.includes(d.args as Fundo)) fundo = d.args as Fundo;
			else avisos.push(`linha ${d.linha}: fundo desconhecido "${d.args}"`);
		}
		if (d.tipo === 'transicao') transicao = (['corte', 'fade', 'preto', 'clarao'].includes(d.args) ? d.args : 'fade') as CenaAnimada['transicao'];
		if (d.tipo === 'painel') painel = d.args === 'direita' ? 'direita' : 'esquerda';
		if (d.tipo === 'professor') professor = (['esquerda', 'direita', 'fora'].includes(d.args) ? d.args : 'esquerda') as typeof professor;
		if (d.tipo === 'uerj' && !ds.some((x) => x.tipo === 'professor')) professor = 'direita';
	}
	const fundoCena: Fundo = fundo ?? (modoMapa ? 'mapa' : ds.some((d) => d.tipo === 'uerj') ? 'lousa' : 'arquivo');
	if (modoMapa) professor = 'fora';

	// ——— Momentos de todas as diretivas (e itens), na ordem do roteiro ———
	let anterior: Momento = { s: 0, f: 0, d: 0.3 };
	const momentoDe = new Map<Diretiva, Momento>();
	const momentosItens = new Map<Diretiva, Momento[]>();
	let primeiro = true;
	for (const d of ds) {
		if (['fundo', 'transicao', 'professor', 'painel'].includes(d.tipo)) continue;
		const padrao = primeiro ? { s: 0, f: 0, d: 0.3 } : mais(anterior, 1.2);
		const m = anc.momento(d.ancora, padrao);
		momentoDe.set(d, m);
		primeiro = false;
		anterior = m;
		let ult = m;
		const its: Momento[] = [];
		d.itens.forEach((it, i) => {
			const mi = anc.momento(it.ancora, i === 0 ? mais(m, 0.4) : mais(ult, 1.4));
			its.push(mi);
			ult = mi;
		});
		momentosItens.set(d, its);
		if (its.length) anterior = its[its.length - 1];
	}

	// ——— Blocos (grupos que ocupam a mesma região ao mesmo tempo) ———
	const blocos: Bloco[] = [];
	for (const d of ds) {
		const m = momentoDe.get(d);
		if (!m) continue;
		let tipo: Bloco['tipo'] | null = null;
		if (PRINCIPAIS.has(d.tipo)) tipo = 'principal';
		else if (PALCO.has(d.tipo)) tipo = 'palco';
		else if (d.tipo === 'carimbo') tipo = 'carimbo';
		else if (d.tipo === 'pergunta') tipo = 'overlay';
		else if (d.tipo === 'limpa') tipo = 'limpa';
		if (!tipo) continue;
		const ult = blocos[blocos.length - 1];
		const agrupa =
			ult &&
			ult.tipo === tipo &&
			((d.tipo === 'cartao' && ult.diretivas.every((x) => x.tipo === 'cartao') && ult.diretivas.length < (modoMapa ? 3 : 4)) ||
				(d.tipo === 'retrato' && ult.diretivas.every((x) => x.tipo === 'retrato') && ult.diretivas.length < 3));
		if (agrupa) {
			ult.diretivas.push(d);
			ult.momentos.push(m);
		} else blocos.push({ tipo, inicio: m, seg: anc.segundos(m), diretivas: [d], momentos: [m] });
	}
	// Aviso de autoria: um quadro principal não pode entrar antes de o anterior terminar de mostrar seus itens.
	{
		let fimAnterior = -1;
		let nomeAnterior = '';
		for (const b of blocos) {
			if (b.tipo !== 'principal') continue;
			if (b.seg < fimAnterior - 0.3) avisos.push(`"${b.diretivas[0].tipo}" (linha ${b.diretivas[0].linha}) entra antes de "${nomeAnterior}" terminar de mostrar seus itens`);
			const itens = b.diretivas.flatMap((d) => momentosItens.get(d) ?? []).map((m) => anc.segundos(m));
			fimAnterior = Math.max(b.seg, ...itens, ...b.momentos.map((m) => anc.segundos(m)));
			nomeAnterior = `${b.diretivas[0].tipo} (linha ${b.diretivas[0].linha})`;
		}
	}
	const totalSeg = anc.inicios.length ? anc.inicios[anc.inicios.length - 1] + anc.duracoes[anc.duracoes.length - 1] + 1.2 : 6;

	/** Fim de um bloco: entrada do próximo bloco do mesmo tipo (ou de um "limpa"). */
	function fimDe(i: number, tipos: Bloco['tipo'][]): { m?: Momento; seg: number } {
		for (let j = i + 1; j < blocos.length; j++) {
			if (tipos.includes(blocos[j].tipo) || blocos[j].tipo === 'limpa') return { m: blocos[j].inicio, seg: blocos[j].seg };
		}
		return { seg: totalSeg + 5 };
	}

	// Intervalos de vida, para saber quando o palco (pessoas/objetos) divide a tela com um quadro.
	const vidaPalco = blocos.map((b, i) => (b.tipo === 'palco' ? [b.seg, fimDe(i, ['palco']).seg] : null)).filter((x): x is number[] => !!x);
	const temPalcoEm = (a: number, b: number) => vidaPalco.some(([c, d]) => Math.max(a, c) < Math.min(b, d));

	// ——— Regiões ———
	const LX = professor === 'esquerda' ? 400 : professor === 'direita' ? 55 : 90;
	const RX = professor === 'esquerda' ? 1545 : professor === 'direita' ? 1205 : 1510;
	const PX = painel === 'direita' ? 1000 : 40;
	// No mapa, o painel lateral se divide: objetos em cima, quadro embaixo (quando aparecem juntos).
	const regiaoCheia: Regiao = modoMapa ? { x: PX, y: 125, w: 560, h: 640 } : { x: LX, y: 150, w: RX - LX, h: 615 };
	const regiaoAlta: Regiao = modoMapa ? { x: PX, y: 445, w: 560, h: 320 } : { x: LX, y: 150, w: RX - LX, h: 380 };
	const faixaPalco: Regiao = modoMapa ? { x: PX, y: 120, w: 560, h: 310 } : { x: LX, y: 560, w: RX - LX, h: 335 };

	const elementos: Elemento[] = [];
	const fixo = modoMapa;

	// ——— Mapa ———
	const cameras: Camera[] = [];
	if (modoMapa) {
		const temPainel = blocos.some((b) => b.tipo === 'principal' || b.tipo === 'palco');
		const camDe = (reg: string): { x: number; y: number; z: number } => {
			if (!REGIOES[reg]) avisos.push(`região de mapa desconhecida: "${reg}"`);
			const c = cameraDaRegiao(reg);
			if (!temPainel) return c;
			// O painel ocupa a esquerda: enquadra a região no espaço livre à direita.
			const z = Math.max(1, c.z * 0.74);
			return { x: Math.round((c.x + (painel === 'direita' ? 300 : -300) / z) * 10) / 10, y: c.y, z: Math.round(z * 100) / 100 };
		};
		const mapas = ds.filter((d) => d.tipo === 'mapa' || d.tipo === 'camera');
		const primeiro = mapas[0]?.args || 'mundo';
		cameras.push({ s: 0, f: 0, d: 0, ...camDe(primeiro) });
		for (const d of mapas.slice(1)) cameras.push({ ...(momentoDe.get(d) ?? { s: 0 }), ...camDe(d.args), dur: 2.6 });
		const pinta: Extract<Elemento, { k: 'mundo' }>['pinta'] = [];
		const marcas: Extract<Elemento, { k: 'mundo' }>['marcas'] = [];
		const rotas: Extract<Elemento, { k: 'mundo' }>['rotas'] = [];
		const rotulos: Extract<Elemento, { k: 'mundo' }>['rotulos'] = [];
		for (const d of ds) {
			const m = momentoDe.get(d);
			if (!m) continue;
			if (d.tipo === 'pinta') {
				const [codigos = '', c, ...resto] = d.args.split(/\s+/);
				const lista = codigos.split(',').map((x) => x.trim().toUpperCase()).filter(Boolean);
				for (const p of lista) if (!PAISES[p]) avisos.push(`linha ${d.linha}: país desconhecido "${p}"`);
				pinta.push({ paises: lista, cor: CORES_MAPA[(c ?? '').toLowerCase()] ?? cor(c, CORES_MAPA.vermelho), a: anim(m) });
				const rot = semAspas(resto.join(' '));
				if (rot && lista[0]) rotulos.push({ texto: rot, pais: lista[0], tam: 22, a: anim(mais(m, 0.4)) });
			} else if (d.tipo === 'marca') {
				const [lugar, ...resto] = partes(d.args);
				const c = resto.find((x) => CORES[x.toLowerCase()]);
				const texto = resto.find((x) => x && !CORES[x.toLowerCase()]);
				if (!LUGARES[lugar] && !/^-?\d/.test(lugar)) avisos.push(`linha ${d.linha}: lugar desconhecido "${lugar}"`);
				marcas.push({ lugar, texto: texto || undefined, cor: cor(c, '#b3261e'), a: anim(m) });
			} else if (d.tipo === 'rota') {
				const [caminho, ...resto] = partes(d.args).filter((x, i) => i === 0 || !/^(tracejada|reta)$/.test(x));
				const c = resto.find((x) => CORES[x.toLowerCase()]);
				const texto = resto.find((x) => x && !CORES[x.toLowerCase()]);
				const pontos = caminho.split('>').map((x) => x.trim());
				for (const p of pontos) if (!LUGARES[p] && !/^-?\d/.test(p)) avisos.push(`linha ${d.linha}: lugar desconhecido "${p}"`);
				rotas.push({ pontos, texto: texto || undefined, cor: cor(c, '#b3261e'), tracejada: /\|\s*tracejada/.test(d.args), reta: /\|\s*reta/.test(d.args), a: anim(m, 'draw', { dur: 1.3 * Math.max(1, pontos.length - 1) }) });
			} else if (d.tipo === 'rotulo') {
				const [texto, onde, tam] = partes(d.args.replace(/\|\s*carimbo\s*$/, ''));
				const pais = onde && /^[A-Z]{3}$/.test(onde) ? onde : undefined;
				if (pais && !PAISES[pais]) avisos.push(`linha ${d.linha}: país desconhecido "${pais}"`);
				if (!pais && onde && !LUGARES[onde] && !/^-?\d+(\.\d+)?\s*,\s*-?\d/.test(onde)) avisos.push(`linha ${d.linha}: lugar desconhecido "${onde}"`);
				rotulos.push({ texto, pais, lugar: pais ? undefined : onde, tam: tam ? Number(tam) : 24, carimbo: /carimbo/.test(d.args), a: anim(m) });
			}
		}
		elementos.push({ k: 'mundo', pinta, marcas, rotas, rotulos, a: { s: 0, f: 0, d: 0, fx: 'fade', dur: 1 } });
	}

	// ——— Professor ———
	if (professor !== 'fora') {
		elementos.push({
			k: 'pessoa',
			v: 'professor',
			x: professor === 'esquerda' ? 205 : 1395,
			y: 895,
			esc: 1.32,
			vira: professor === 'direita',
			fala: true,
			gesto: 'aponta',
			a: { s: 0, f: 0, d: -0.5, fx: professor === 'esquerda' ? 'right' : 'left', dur: 0.8 }
		});
	}

	// ——— Blocos visuais ———
	/** Faixas verticais ocupadas pelos visuais principais, para o carimbo não cobrir texto. */
	const ocupado: { ini: number; fim: number; y0: number; y1: number }[] = [];
	const alturaOcupada = (e: Elemento, r: Regiao): [number, number] | undefined => {
		if (e.k === 'doc' || e.k === 'retrato' || e.k === 'balanca') return [r.y, r.y + r.h];
		if (!('h' in e) || typeof e.h !== 'number' || !('y' in e)) return undefined;
		if (e.k === 'tabela') {
			// A tabela ocupa só as linhas que tem: estima a altura com a fonte cheia (30 px).
			const nc = Math.max(1, e.colunas.length);
			const larg = nc >= 3 ? [e.w * 0.24, ...Array(nc - 1).fill((e.w * 0.76) / (nc - 1))] : Array(nc).fill(e.w / nc);
			let total = 64;
			for (const l of e.linhas) {
				const n = Math.max(1, ...l.celulas.map((c, j) => Math.ceil((c.length * 30 * 0.55) / Math.max(60, (larg[j] ?? 100) - 26))));
				total += n * 30 * 1.24 + 30;
			}
			return [e.y, e.y + Math.min(e.h, total)];
		}
		return [e.y, e.y + e.h];
	};
	blocos.forEach((b, i) => {
		if (b.tipo === 'limpa') return;
		const prox = b.tipo === 'principal' ? fimDe(i, ['principal']) : b.tipo === 'palco' ? fimDe(i, ['palco']) : b.tipo === 'carimbo' ? fimDe(i, ['principal', 'carimbo']) : null;
		let sai: Momento | undefined = prox?.m ? mais(prox.m, -0.35) : undefined;
		if (b.tipo === 'overlay') {
			const seguinte = blocos[i + 1];
			sai = seguinte ? mais(seguinte.inicio, -0.3) : mais(b.inicio, 5.5);
		}
		const saida = sai ? { sai: { ...sai, dur: 0.45 } } : {};
		const d0 = b.diretivas[0];
		if (b.tipo === 'carimbo') {
			const r = regiaoCheia;
			// No mapa, o carimbo vai para o canto oposto ao painel; no quadro, para o alto da região principal.
			const x = modoMapa ? (painel === 'direita' ? 330 : 1290) : r.x + r.w - Math.min(260, r.w / 2);
			let y = modoMapa ? 90 : r.y + 30;
			if (!modoMapa) {
				// Se um quadro já ocupa o alto da região, o carimbo desce para o espaço livre logo abaixo dele.
				const t0 = b.seg + 0.5;
				const vis = ocupado.filter((o) => o.ini <= t0 && o.fim > t0);
				if (vis.length) {
					const y0 = Math.min(...vis.map((o) => o.y0));
					const y1 = Math.max(...vis.map((o) => o.y1));
					const limite = temPalcoEm(b.seg, b.seg + 3) ? regiaoAlta.y + regiaoAlta.h + 15 : r.y + r.h;
					if (y0 < r.y + 70 && limite - y1 >= 76) y = y1 + 42;
				}
			}
			elementos.push({ k: 'carimbo', texto: semAspas(d0.args), x, y, rot: -6, tam: 34, larg: modoMapa ? 560 : Math.min(520, r.w), fixo, a: anim(b.inicio, 'pop', saida) });
			return;
		}
		if (b.tipo === 'overlay') {
			elementos.push({ k: 'texto', texto: semAspas(d0.args), x: 800, y: 430, alinhar: 'middle', tam: 50, fonte: 'display', cor: '#fffaf0', larg: 1100, alt: 260, caixa: 'rgba(14,18,30,0.9)', fixo: true, a: anim(b.inicio, 'pop', saida) });
			return;
		}
		if (b.tipo === 'palco') {
			montarPalco(d0, b.inicio, faixaPalco, saida);
			return;
		}
		// principal: região cheia, ou a de cima quando o palco está ocupado ao mesmo tempo
		const fim = prox?.seg ?? totalSeg;
		const r = temPalcoEm(b.seg, fim) ? regiaoAlta : regiaoCheia;
		const antes = elementos.length;
		montarPrincipal(b, r, saida);
		for (const e of elementos.slice(antes)) {
			const faixa = alturaOcupada(e, r);
			if (faixa) ocupado.push({ ini: b.seg, fim, y0: faixa[0], y1: faixa[1] });
		}
	});

	function itensDe(d: Diretiva): Item[] {
		const ms = momentosItens.get(d) ?? [];
		return d.itens.map((it, i) => ({ texto: it.texto, a: anim(ms[i] ?? momentoDe.get(d)!, 'up') }));
	}

	function montarPalco(d: Diretiva, m: Momento, r: Regiao, saida: Partial<Animacao>) {
		const [lista, opcao] = partes(d.args);
		const base = r.y + r.h - 6;
		const baseObjeto = modoMapa ? base : Math.min(base, 835);
		if (d.tipo === 'pessoas') {
			const vs = lista.split(',').map((x) => x.trim() as Variante).filter(Boolean);
			for (const v of vs) if (!VARIANTES.includes(v)) avisos.push(`linha ${d.linha}: personagem desconhecido "${v}"`);
			const n = Math.max(1, vs.length);
			const esc = Math.min(1.05, r.h / 285, r.w / n / 130);
			vs.forEach((v, j) => {
				elementos.push({
					k: 'pessoa',
					v,
					x: r.x + (r.w / n) * (j + 0.5),
					y: base,
					esc,
					gesto: (opcao as 'aponta' | 'acena' | 'punho' | 'livro') || (j % 2 ? 'acena' : 'nenhum'),
					fixo,
					a: anim(mais(m, j * 0.25), 'up', saida)
				});
			});
		} else if (d.tipo === 'multidao') {
			const placas = lista ? lista.split(',').map(semAspas).filter(Boolean) : [];
			elementos.push({ k: 'multidao', x: r.x, y: base, w: r.w, fileiras: 3, placas, marcha: /marcha/.test(d.args), fixo, a: anim(m, 'up', saida) });
		} else if (d.tipo === 'objeto') {
			const objs = d.args.split(/\s*[|,]\s*/).map(semAspas).filter(Boolean).map((o) => {
				const [nome, ...rot] = o.split(':');
				return { nome: nome.trim() as NomeProp, rotulo: rot.join(':').trim() };
			});
			for (const o of objs) if (!PROPS.includes(o.nome)) avisos.push(`linha ${d.linha}: objeto desconhecido "${o.nome}"`);
			const n = Math.max(1, objs.length);
			const esc = Math.min(1.15, (baseObjeto - r.y) / 330, r.w / n / 300);
			objs.forEach((o, j) => {
				elementos.push({ k: 'prop', nome: o.nome, rotulo: o.rotulo || undefined, x: r.x + (r.w / n) * (j + 0.5), y: baseObjeto, esc, anima: true, fixo, a: anim(mais(m, j * 0.3), 'pop', saida) });
			});
		}
	}

	function montarPrincipal(b: Bloco, r: Regiao, saida: Partial<Animacao>) {
		const d = b.diretivas[0];
		const m = b.inicio;
		const centroX = (w: number) => r.x + (r.w - w) / 2;
		switch (d.tipo) {
			case 'titulo': {
				const [texto, sub] = partes(d.args);
				elementos.push({ k: 'sombra', cor: '#07080d', opac: 0.82, a: anim(m, 'fade', { dur: 0.6, ...saida }) });
				elementos.push({ k: 'titulo', texto, sub: sub || undefined, x: 800, y: 420, tam: 76, larg: 1300, fixo: true, a: anim(mais(m, 0.2), 'zoom', { dur: 1, ...saida }) });
				break;
			}
			case 'cartao': {
				const n = b.diretivas.length;
				const gap = 26;
				b.diretivas.forEach((dc, j) => {
					const [titulo, texto, c] = partes(dc.args);
					let x: number, y: number, w: number, h: number;
					if (modoMapa) {
						h = Math.min(300, (r.h - gap * (n - 1)) / n);
						w = r.w;
						x = r.x;
						y = r.y + j * (h + gap);
					} else if (n === 1) {
						w = Math.min(r.w, 980);
						h = Math.min(r.h, texto ? 300 : 180);
						x = centroX(w);
						y = r.y + (r.h - h) / 2;
					} else if (n === 2) {
						w = (r.w - gap) / 2;
						h = Math.min(r.h, 330);
						x = r.x + j * (w + gap);
						y = r.y + (r.h - h) / 2;
					} else {
						w = (r.w - gap) / 2;
						h = Math.min(260, (r.h - gap) / 2);
						x = r.x + (j % 2) * (w + gap);
						y = r.y + (r.h - (h * 2 + gap)) / 2 + Math.floor(j / 2) * (h + gap);
					}
					const pal = ['#b3261e', '#2f3cd9', '#0f766e', '#b45309'];
					elementos.push({ k: 'cartao', x, y, w, h, titulo, texto: texto || undefined, cor: cor(c, pal[j % 4]), escuro: modoMapa, fixo, a: anim(b.momentos[j], 'pop', saida) });
				});
				break;
			}
			case 'lista': {
				const [titulo, opcao] = partes(d.args);
				const itens = itensDe(d);
				const w = modoMapa ? r.w : Math.min(r.w, 1000);
				const h = Math.min(r.h, 110 + itens.length * 105);
				elementos.push({ k: 'lista', x: modoMapa ? r.x : centroX(w), y: r.y + (r.h - h) / 2, w, h, titulo: titulo || undefined, itens, numerada: /numerada/.test(opcao ?? ''), escuro: modoMapa, fixo, a: anim(m, 'up', saida) });
				break;
			}
			case 'linha': {
				const itens = (momentosItens.get(d) ?? []).map((mi, j) => {
					const bruto = d.itens[j].texto;
					const k = bruto.indexOf(':');
					return { rotulo: k > 0 ? bruto.slice(0, k).trim() : bruto, texto: k > 0 ? bruto.slice(k + 1).trim() : '', a: anim(mi, 'pop') };
				});
				if (modoMapa) elementos.push({ k: 'linha', x: r.x + 14, y: r.y + 14, w: r.w - 28, h: Math.min(r.h - 28, itens.length * 110), itens, vertical: true, fixo, a: anim(m, 'draw', { dur: 1.2, ...saida }) });
				else {
					const h = Math.min(r.h, 330);
					elementos.push({ k: 'linha', x: r.x, y: r.y + (r.h - h) / 2, w: r.w, h, itens, cor: fundoClaro(fundoCena) ? '#1a1410' : '#fffaf0', fixo, a: anim(m, 'draw', { dur: 1.4, ...saida }) });
				}
				break;
			}
			case 'compara':
			case 'tabela': {
				const colunas = d.tipo === 'compara' ? d.args.split(/\s*[×]\s*|\s+x\s+/).map(semAspas) : partes(d.args);
				const linhas = d.itens.map((it, j) => ({ celulas: it.texto.split(/\s*\|\s*/).map(semAspas), a: anim((momentosItens.get(d) ?? [])[j] ?? m, 'left') }));
				for (const l of linhas) if (l.celulas.length !== colunas.length) avisos.push(`linha ${d.linha}: tabela com ${colunas.length} colunas e linha com ${l.celulas.length}`);
				const w = Math.min(r.w, 1140);
				elementos.push({ k: 'tabela', x: centroX(w), y: r.y, w, h: r.h, colunas, linhas, fixo, a: anim(m, 'fade', saida) });
				break;
			}
			case 'doc': {
				const w = Math.min(r.w, 1000);
				elementos.push({
					k: 'doc',
					x: r.x + r.w / 2,
					y: r.y + r.h / 2,
					w,
					h: r.h,
					titulo: semAspas(d.args) || undefined,
					linhas: d.itens.map((it) => it.texto),
					destaque: d.destaque,
					tam: 28,
					fixo,
					a: anim(m, 'type', { dur: Math.min(14, 2 + d.itens.reduce((s, it) => s + it.texto.length, 0) / 22), ...saida })
				});
				break;
			}
			case 'citacao': {
				const [texto, fonte] = partes(d.args);
				const w = modoMapa ? r.w : Math.min(r.w, 1000);
				const h = Math.min(r.h, 340);
				elementos.push({ k: 'citacao', x: modoMapa ? r.x : centroX(w), y: r.y + (r.h - h) / 2, w, h, texto, fonte: fonte || undefined, fixo, a: anim(m, 'up', saida) });
				break;
			}
			case 'retrato': {
				const n = b.diretivas.length;
				const esc = Math.min(1, r.h / 520, r.w / n / 400);
				b.diretivas.forEach((dr, j) => {
					const [nome, legenda, v] = partes(dr.args);
					elementos.push({
						k: 'retrato',
						nome,
						legenda: legenda || undefined,
						v: (VARIANTES.includes(v as Variante) ? v : undefined) as Variante | undefined,
						x: r.x + (r.w / n) * (j + 0.5),
						y: r.y + 165 * esc,
						esc,
						fixo,
						a: anim(b.momentos[j], 'pop', saida)
					});
				});
				break;
			}
			case 'numero': {
				const [valor, legenda, c] = partes(d.args);
				const w = modoMapa ? r.w : Math.min(r.w, 760);
				const h = Math.min(r.h, 420);
				elementos.push({ k: 'numero', x: modoMapa ? r.x : centroX(w), y: r.y + (r.h - h) / 2, w, h, valor, legenda: legenda ?? '', cor: cor(c, '#b3261e'), fixo, a: anim(m, 'zoom', saida) });
				break;
			}
			case 'grafico': {
				const barras = d.itens.map((it, j) => {
					const [rot, resto = ''] = it.texto.split(/:\s*/);
					const [valor, exibido] = resto.split(/\s*\|\s*/);
					return { texto: exibido || valor, rotulo: rot, valor: Number(String(valor).replace(',', '.')) || 0, a: anim((momentosItens.get(d) ?? [])[j] ?? m, 'fade') };
				});
				const w = Math.min(r.w - 40, 1040);
				const h = Math.min(r.h - 40, 110 + barras.length * 100);
				elementos.push({ k: 'grafico', x: centroX(w), y: r.y + (r.h - h) / 2, w, h, titulo: semAspas(d.args) || undefined, barras, fixo, a: anim(m, 'fade', saida) });
				break;
			}
			case 'piramide': {
				const w = Math.min(r.w, 900);
				const h = Math.min(r.h, 560);
				elementos.push({ k: 'piramide', x: centroX(w), y: r.y + (r.h - h) / 2, w, h, titulo: semAspas(d.args) || undefined, niveis: itensDe(d), fixo, a: anim(m, 'fade', saida) });
				break;
			}
			case 'causas':
			case 'consequencias': {
				const itens = itensDe(d);
				const w = Math.min(r.w, 1140);
				const h = Math.min(r.h, Math.max(260, itens.length * 150));
				elementos.push({ k: 'causas', x: centroX(w), y: r.y + (r.h - h) / 2, w, h, centro: semAspas(d.args), itens, sentido: d.tipo === 'causas' ? 'entra' : 'sai', fixo, a: anim(m, 'fade', saida) });
				break;
			}
			case 'uerj': {
				const partesU = d.itens.map((it, j) => {
					const k = it.texto.indexOf(':');
					return { rotulo: k > 0 && k < 24 ? it.texto.slice(0, k).trim() : undefined, texto: k > 0 && k < 24 ? it.texto.slice(k + 1).trim() : it.texto, a: anim((momentosItens.get(d) ?? [])[j] ?? m, 'up') };
				});
				const w = Math.min(r.w, 1150);
				elementos.push({ k: 'uerj', x: centroX(w), y: r.y, w, h: r.h, titulo: semAspas(d.args), partes: partesU, fixo, a: anim(m, 'fade', saida) });
				break;
			}
			case 'balanca': {
				const [esq, dir] = d.args.split(/\s*[×]\s*|\s+x\s+/).map(semAspas);
				const ms = momentosItens.get(d) ?? [];
				const pende = d.itens.map((it, j) => {
					const alvo = normalizar(semAspas(it.texto));
					const lado: -1 | 0 | 1 = alvo === normalizar(esq) ? -1 : alvo === normalizar(dir) ? 1 : 0;
					return { ...(ms[j] ?? m), lado };
				});
				const esc = Math.min(1.2, r.h / 400);
				elementos.push({ k: 'balanca', x: r.x + r.w / 2, y: r.y + r.h / 2 + 176 * esc, esc, esq, dir, pende, fixo, a: anim(m, 'fade', saida) });
				break;
			}
		}
	}

	const animada: CenaAnimada = { fundo: fundoCena, transicao, elementos, camera: cameras.length ? cameras : undefined };
	return { animada, avisos };
}

function fundoClaro(f: Fundo): boolean {
	return f === 'papel' || f === 'ceu' || f === 'campo' || f === 'mar';
}

/** Coordenadas projetadas de um lugar (para testes e ferramentas). */
export function pontoDe(nome: string): [number, number] | undefined {
	const ll = LUGARES[nome];
	return ll ? projetar(ll[0], ll[1]) : undefined;
}
