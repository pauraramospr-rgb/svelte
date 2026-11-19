/**
 * Modelo das aulas animadas. Cada cena tem um fundo, uma câmera e elementos que entram em cena junto
 * com a narração. Tudo é função do tempo `t` (segundos dentro da cena), então a mesma cena pode ser
 * tocada ao vivo no navegador ou renderizada quadro a quadro.
 */

/** Momento em que algo acontece: na frase `s` da narração (0 = primeira), na fração `f` dela, mais `d` segundos. */
export interface Momento {
	s: number;
	/** Fração da frase (0–1), para entrar exatamente na palavra dita. */
	f?: number;
	d?: number;
}

export type Efeito = 'fade' | 'up' | 'down' | 'left' | 'right' | 'pop' | 'zoom' | 'draw' | 'type' | 'wipe' | 'none';

export interface Animacao extends Momento {
	/** Efeito de entrada (padrão: fade). */
	fx?: Efeito;
	/** Duração da entrada em segundos (padrão: 0,7). */
	dur?: number;
	/** Saída opcional. */
	sai?: Momento & { fx?: Efeito; dur?: number };
}

export type Fundo =
	| 'arquivo'
	| 'papel'
	| 'noite'
	| 'mapa'
	| 'prancheta'
	| 'lousa'
	| 'ceu'
	| 'floresta'
	| 'chumbo'
	| 'tribunal'
	| 'mar'
	| 'cidade'
	| 'campo'
	| 'palacio';

export type Variante =
	| 'professor'
	| 'estudante'
	| 'operario'
	| 'soldado'
	| 'religioso'
	| 'jornalista'
	| 'mulher'
	| 'campones'
	| 'executivo'
	| 'marinheiro'
	| 'politico'
	| 'mae'
	| 'rei'
	| 'rainha'
	| 'burgues'
	| 'sansculotte'
	| 'navegador'
	| 'jesuita'
	| 'indigena'
	| 'escravizado'
	| 'filosofo'
	| 'soldado-antigo'
	| 'guerrilheiro'
	| 'jovem';

export type NomeProp =
	| 'radio'
	| 'tanque'
	| 'navio'
	| 'caminhao'
	| 'congresso'
	| 'palacio'
	| 'calendario'
	| 'jornal'
	| 'cadeado'
	| 'balanca'
	| 'urna'
	| 'fabrica'
	| 'igreja'
	| 'livro'
	| 'maquina'
	| 'cratera'
	| 'estrada'
	| 'arvore'
	| 'estadio'
	| 'microfone'
	| 'carro'
	| 'aviao'
	| 'engrenagem'
	| 'lupa'
	| 'pilha'
	| 'barril'
	| 'bolo'
	| 'trem'
	| 'tv'
	| 'celular'
	| 'caravela'
	| 'coroa'
	| 'trono'
	| 'canhao'
	| 'bandeira'
	| 'guilhotina'
	| 'fortaleza'
	| 'vapor'
	| 'engenho'
	| 'cana'
	| 'cafe'
	| 'ouro'
	| 'moedas'
	| 'pergaminho'
	| 'bussola'
	| 'especiarias'
	| 'mesquita'
	| 'muro'
	| 'foguete'
	| 'satelite'
	| 'explosao'
	| 'trincheira'
	| 'computador'
	| 'conteiner'
	| 'globo'
	| 'pena'
	| 'lampada'
	| 'cartaz';

export interface Base {
	a: Animacao;
	/** Fora da câmera (fica fixo na tela, como legenda ou vinheta). */
	fixo?: boolean;
	/** Deslocamento ao longo do tempo: sai da posição original e chega a (dx, dy) no momento `ate`. */
	mov?: { ate: Momento; dx: number; dy?: number };
}

/** Item que entra sozinho dentro de um elemento maior (linha do tempo, lista, tabela…). */
export interface Item {
	texto: string;
	a: Animacao;
	rotulo?: string;
}

export type Elemento = Base &
	(
		| { k: 'titulo'; texto: string; sub?: string; x: number; y: number; tam?: number; cor?: string; alinhar?: 'start' | 'middle' | 'end'; larg?: number }
		| { k: 'texto'; texto: string; x: number; y: number; tam?: number; cor?: string; fonte?: 'display' | 'corpo' | 'mono' | 'maquina' | 'serifa'; peso?: number; larg?: number; alt?: number; alinhar?: 'start' | 'middle' | 'end'; caixa?: string; italico?: boolean }
		| { k: 'carimbo'; texto: string; x: number; y: number; rot?: number; cor?: string; tam?: number; larg?: number }
		| { k: 'doc'; titulo?: string; linhas?: string[]; barras?: number; x: number; y: number; w: number; h: number; rot?: number; destaque?: string; tam?: number }
		| {
				k: 'mapa';
				estilo?: 'papel' | 'escuro';
				paises?: Record<string, string>;
				rotulos?: { texto: string; x: number; y: number; a: Animacao; cor?: string; tam?: number; carimbo?: boolean }[];
				pinta?: { pais: string; cor: string; a: Animacao }[];
				cidades?: { nome: string; a: Animacao; cor?: string; lado?: 'e' | 'd' }[];
		  }
		| {
				k: 'mundo';
				pinta: { paises: string[]; cor: string; a: Animacao }[];
				marcas: { lugar: string; texto?: string; cor?: string; a: Animacao }[];
				rotas: { pontos: string[]; cor?: string; texto?: string; tracejada?: boolean; reta?: boolean; a: Animacao }[];
				rotulos: { texto: string; lugar?: string; pais?: string; tam?: number; cor?: string; carimbo?: boolean; a: Animacao }[];
		  }
		| { k: 'seta'; de: [number, number]; para: [number, number]; cor?: string; curva?: number; texto?: string; espessura?: number; tracejada?: boolean }
		| { k: 'cartao'; x: number; y: number; w: number; h: number; titulo: string; texto?: string; cor?: string; icone?: string; escuro?: boolean }
		| { k: 'lista'; x: number; y: number; w: number; h: number; titulo?: string; itens: Item[]; cor?: string; escuro?: boolean; numerada?: boolean }
		| { k: 'citacao'; x: number; y: number; w: number; h: number; texto: string; fonte?: string; cor?: string }
		| { k: 'numero'; x: number; y: number; w: number; h: number; valor: string; legenda: string; cor?: string }
		| { k: 'grafico'; x: number; y: number; w: number; h: number; titulo?: string; barras: (Item & { valor: number })[]; cor?: string }
		| { k: 'piramide'; x: number; y: number; w: number; h: number; titulo?: string; niveis: Item[] }
		| { k: 'causas'; x: number; y: number; w: number; h: number; centro: string; itens: Item[]; sentido?: 'entra' | 'sai'; cor?: string }
		| { k: 'uerj'; x: number; y: number; w: number; h: number; titulo: string; partes: Item[] }
		| { k: 'pessoa'; v: Variante; x: number; y: number; esc?: number; vira?: boolean; fala?: boolean; gesto?: 'aponta' | 'acena' | 'punho' | 'placa' | 'livro' | 'nenhum'; placa?: string; anda?: { ate: Momento; dx: number } }
		| { k: 'multidao'; x: number; y: number; w: number; fileiras?: number; n?: number; marcha?: boolean; cores?: string[]; placas?: string[] }
		| { k: 'prop'; nome: NomeProp; x: number; y: number; esc?: number; cor?: string; rot?: number; anima?: boolean; rotulo?: string }
		| { k: 'linha'; x: number; y: number; w: number; h?: number; itens: { rotulo: string; texto: string; a: Animacao }[]; cor?: string; vertical?: boolean }
		| { k: 'tabela'; x: number; y: number; w: number; h?: number; colunas: string[]; linhas: { celulas: string[]; a: Animacao }[] }
		| { k: 'retrato'; nome: string; legenda?: string; x: number; y: number; esc?: number; v?: Variante }
		| { k: 'balanca'; x: number; y: number; esc?: number; esq: string; dir: string; pende: { s: number; f?: number; d?: number; lado: -1 | 0 | 1 }[] }
		| { k: 'tarja'; x: number; y: number; w: number; h: number; cor?: string; rot?: number }
		| { k: 'sombra'; cor?: string; opac?: number }
		| { k: 'brilho'; x: number; y: number; r: number; cor?: string }
	);

export interface Camera extends Momento {
	x: number;
	y: number;
	/** Zoom (1 = palco inteiro). */
	z: number;
	dur?: number;
}

export interface CenaAnimada {
	fundo: Fundo;
	/** Duração fixa (s) para cenas sem narração, como a abertura do episódio. */
	duracao?: number;
	camera?: Camera[];
	elementos: Elemento[];
	/** Transição para a cena seguinte. */
	transicao?: 'fade' | 'preto' | 'clarao' | 'corte';
}

export const LARGURA = 1600;
export const ALTURA = 900;
