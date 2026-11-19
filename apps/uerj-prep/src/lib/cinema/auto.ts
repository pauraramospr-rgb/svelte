/**
 * Encenação automática: quando uma cena do roteiro ainda não tem animação feita sob medida,
 * monta uma a partir dos próprios campos do roteiro ("Textos na tela", "Elementos visuais", "Animação").
 * Só usa o que está no roteiro revisado: nenhum dado novo é criado aqui.
 */
import type { Cena } from '$lib/producao';
import type { CenaAnimada, Elemento, Fundo, NomeProp, Variante } from './tipos';
import { frases } from './tempo';

/** Itens de "Textos na tela": separados por " · " fora de aspas. */
export function itensDaTela(textos: string): string[] {
	const limpo = textos.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\.$/, '');
	const itens: string[] = [];
	let atual = '';
	let aspas = 0;
	for (let i = 0; i < limpo.length; i++) {
		const ch = limpo[i];
		if (ch === '“') aspas++;
		if (ch === '”') aspas = Math.max(0, aspas - 1);
		if (aspas === 0 && limpo.startsWith(' · ', i)) {
			itens.push(atual);
			atual = '';
			i += 2;
			continue;
		}
		atual += ch;
	}
	itens.push(atual);
	return itens
		.map((s) => s.trim().replace(/^“/, '').replace(/”$/, '').trim())
		.filter((s) => s.length > 1)
		.slice(0, 9);
}

const PROPS: [RegExp, NomeProp][] = [
	[/rádio/i, 'radio'],
	[/tanque|tropas/i, 'tanque'],
	[/navio|naval/i, 'navio'],
	[/congresso|plenário|senado/i, 'congresso'],
	[/palácio|la moneda/i, 'palacio'],
	[/calendário/i, 'calendario'],
	[/jornal|revista|imprensa|banca/i, 'jornal'],
	[/cadeado/i, 'cadeado'],
	[/urna|cédula|voto|plebiscito|eleiç/i, 'urna'],
	[/fábrica|macacões|operári/i, 'fabrica'],
	[/catedral|igreja|velas/i, 'igreja'],
	[/livro|relatório|constituição/i, 'livro'],
	[/máquina de escrever|redação/i, 'maquina'],
	[/cratera|garimpo/i, 'cratera'],
	[/estrada|transamazônica|trator/i, 'estrada'],
	[/estádio/i, 'estadio'],
	[/microfone|discurso/i, 'microfone'],
	[/carro/i, 'carro'],
	[/avião|aeroporto/i, 'aviao'],
	[/engrenage/i, 'engrenagem'],
	[/lupa/i, 'lupa'],
	[/processos|documentos|fichas|arquivo/i, 'pilha'],
	[/barril|petróleo/i, 'barril'],
	[/bolo/i, 'bolo'],
	[/trem/i, 'trem'],
	[/tv |televis|novela/i, 'tv'],
	[/celular|aplicativo/i, 'celular'],
	[/floresta|mata|árvore/i, 'arvore']
];

function escolherFundo(c: Cena): Fundo {
	const tudo = `${c.title} ${c.visuais} ${c.animacao}`.toLowerCase();
	if (/momento uerj|lousa/.test(tudo)) return 'lousa';
	if (/tribunal|corte interamericana|julgamento|stf|justiça/.test(tudo)) return 'tribunal';
	if (/porão|tortura|corredor|bomba|atentado|repress|confidencial/.test(tudo)) return 'chumbo';
	if (/amazônia|floresta|mata|aldeia|campo|plantação/.test(tudo)) return 'floresta';
	if (/noturn|noite/.test(tudo)) return 'noite';
	if (/mapa/.test(tudo)) return 'mapa';
	if (/diagrama|organograma|gráfico|tabela/.test(tudo)) return 'prancheta';
	if (/praça|estádio|multidão|passeata/.test(tudo)) return 'ceu';
	return 'arquivo';
}

function escolherProps(c: Cena, max = 2): NomeProp[] {
	const tudo = `${c.visuais} ${c.animacao}`;
	const achados: NomeProp[] = [];
	for (const [re, nome] of PROPS) if (re.test(tudo) && !achados.includes(nome)) achados.push(nome);
	return achados.slice(0, max);
}

function palavras(s: string): Set<string> {
	return new Set(
		s
			.toLowerCase()
			.normalize('NFD')
			.replace(/[̀-ͯ]/g, '')
			.split(/[^a-z0-9]+/)
			.filter((w) => w.length > 3 || /^\d{4}$/.test(w))
	);
}

/** Frase da narração que mais se parece com o item (para ele entrar na hora em que é dito). */
function fraseDoItem(item: string, fs: string[], minimo: number): number {
	const alvo = palavras(item);
	let melhor = -1;
	let pontos = 0;
	fs.forEach((f, i) => {
		if (i < minimo) return;
		const p = [...palavras(f)].filter((w) => alvo.has(w)).length;
		if (p > pontos) {
			pontos = p;
			melhor = i;
		}
	});
	return melhor >= 0 ? melhor : Math.min(fs.length - 1, minimo + 1);
}

const PESSOAS: [RegExp, Variante][] = [
	[/estudante/i, 'estudante'],
	[/operári|trabalhador|sindical/i, 'operario'],
	[/religios|padre|igreja|cnbb/i, 'religioso'],
	[/mulher|mães|feminino/i, 'mulher'],
	[/camponês|rurais|campo/i, 'campones'],
	[/militar|soldado|tropas/i, 'soldado'],
	[/jornalist|imprensa/i, 'jornalista']
];

/** Monta uma cena animada a partir do roteiro. */
export function encenar(c: Cena): CenaAnimada {
	const fundo = escolherFundo(c);
	const fs = frases(c.narracao);
	const itens = itensDaTela(c.textos);
	const props = escolherProps(c);
	const claro = fundo === 'papel' || fundo === 'ceu';
	const corTexto = claro ? '#1a1410' : '#fffaf0';
	const elementos: Elemento[] = [];
	const lousa = fundo === 'lousa';

	// Professor-narrador à esquerda (na lousa, à direita do quadro).
	elementos.push({ k: 'pessoa', v: 'professor', x: lousa ? 1430 : 190, y: lousa ? 860 : 880, esc: 1.45, vira: lousa, fala: true, gesto: 'aponta', a: { s: 0, d: -0.6, fx: lousa ? 'left' : 'right', dur: 0.9 } });

	// Título da cena no alto.
	// (entra depois que a etiqueta "CENA x.y" some do canto superior)
	elementos.push({ k: 'texto', texto: c.title, x: lousa ? 120 : 400, y: 110, tam: 46, fonte: 'display', cor: lousa ? '#f3efe6' : corTexto, larg: 1100, a: { s: 0, d: 6.2, fx: 'up' } });

	// Pessoas citadas nos elementos visuais (até três), em fila no fundo.
	const variantes = PESSOAS.filter(([re]) => re.test(c.visuais)).map(([, v]) => v).slice(0, 3);
	variantes.forEach((v, i) => {
		elementos.push({ k: 'pessoa', v, x: 1150 + i * 150, y: 860, esc: 0.95, fala: false, gesto: i === 1 ? 'acena' : 'nenhum', a: { s: Math.min(fs.length - 1, 1 + i), fx: 'up' } });
	});

	// Objetos de cena citados.
	props.forEach((nome, i) => {
		elementos.push({ k: 'prop', nome, x: variantes.length ? 1340 - i * 300 : 1260 - i * 330, y: variantes.length ? 560 : 820, esc: variantes.length ? 0.8 : 1.1, anima: true, a: { s: Math.min(fs.length - 1, i), d: 0.5, fx: 'pop' } });
	});

	// Itens da tela: datas viram linha do tempo; o resto vira cartões que se empilham.
	const comAno = itens.filter((it) => /^\d{1,2}\/|^\d{4}/.test(it));
	const outros = itens.filter((it) => !comAno.includes(it));
	let ultimo = 0;
	if (comAno.length >= 2 && comAno.length <= 7) {
		elementos.push({
			k: 'linha',
			x: 420,
			y: 700,
			w: 1100,
			cor: corTexto,
			a: { s: 0, d: 0.6, dur: 1.4 },
			itens: comAno.map((it) => {
				const [rot, ...resto] = it.split(/\s+[—–-]\s+|:\s+/);
				const s = fraseDoItem(it, fs, 0);
				return { rotulo: rot.slice(0, 12), texto: resto.join(' — ').slice(0, 70) || it.slice(rot.length).trim(), a: { s, fx: 'pop' as const } };
			})
		});
	}
	const cartoes = comAno.length >= 2 && comAno.length <= 7 ? outros : itens;
	const xs = [400, 870];
	cartoes.slice(0, 6).forEach((it, i) => {
		const s = Math.max(ultimo, fraseDoItem(it, fs, ultimo));
		ultimo = s;
		const col = i % 2;
		const lin = Math.floor(i / 2);
		const yBase = comAno.length >= 2 ? 170 : 200;
		elementos.push({
			k: 'cartao',
			x: xs[col],
			y: yBase + lin * 150,
			w: 440,
			h: 130,
			titulo: it.length > 60 ? it.slice(0, it.lastIndexOf(' ', 58)) + '…' : it,
			texto: it.length > 60 ? '…' + it.slice(it.lastIndexOf(' ', 58)) : '',
			cor: ['#b3261e', '#2f3cd9', '#0f766e', '#b45309', '#7c3aed', '#1f2f5c'][i % 6],
			a: { s, fx: col ? 'right' : 'left' }
		});
	});

	if (/questão oficial/i.test(c.visuais)) {
		elementos.push({ k: 'carimbo', texto: 'QUESTÃO OFICIAL', x: 1180, y: 230, rot: -7, tam: 36, a: { s: Math.min(1, fs.length - 1), fx: 'pop' } });
	}
	if (/^aviso/i.test(itens[0] ?? '')) {
		elementos.push({ k: 'texto', texto: itens[0], x: 800, y: 470, alinhar: 'middle', tam: 40, fonte: 'display', cor: '#ffd84d', larg: 1200, caixa: 'rgba(0,0,0,0.55)', fixo: true, a: { s: 0, sai: { s: 2 } } });
	}

	return { fundo, elementos, transicao: 'fade' };
}
