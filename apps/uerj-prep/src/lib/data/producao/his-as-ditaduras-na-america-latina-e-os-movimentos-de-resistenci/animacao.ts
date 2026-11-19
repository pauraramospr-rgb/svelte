/**
 * Animação sob medida do Episódio 1 (“1964: o golpe e a construção da ditadura”).
 * Cada cena segue o roteiro de `aula.md`; os momentos `s` apontam para a frase da narração (0 = primeira).
 * Regras: só aparecem na tela textos que estão no roteiro/apostila revisados; pessoas reais são
 * representadas por silhuetas com nome (sem imitar rostos); capas de jornal são recriações genéricas.
 */
import type { Animacao, CenaAnimada, Efeito } from '$lib/cinema/tipos';

/** Atalho: entra na frase `s` (+`d` segundos), com efeito e saída opcionais. */
function em(s: number, d = 0, fx?: Efeito, extra: Partial<Animacao> = {}): Animacao {
	return { s, d, fx, ...extra };
}
const ate = (s: number, d = 0) => ({ sai: { s, d } });

const CLARO = '#fffaf0';
const PAPEL = '#e8dcc2';
const OURO = '#ffd84d';
const TINTA = '#1a1410';
const VERMELHO = '#b3261e';
const ESCURO = '#3d3430';

export const CENAS: Record<string, CenaAnimada> = {
	// 1.1 — Duas cartas, cinquenta anos
	'1.1': {
		fundo: 'arquivo',
		transicao: 'fade',
		camera: [
			{ s: 0, x: 560, y: 430, z: 1.45 },
			{ s: 1, d: 0.5, x: 800, y: 450, z: 1, dur: 3 },
			{ s: 4, d: 0.6, x: 1040, y: 450, z: 1.22, dur: 2.4 },
			{ s: 7, x: 800, y: 450, z: 1, dur: 2.5 }
		],
		elementos: [
			{ k: 'doc', x: 560, y: 440, w: 540, h: 640, rot: -3, linhas: ['Abril de 1975', '', 'Ao Presidente da República'], barras: 8, a: em(0, 0.2, 'type', { dur: 4, ...ate(4, 0.3) }) },
			{ k: 'carimbo', texto: '1975', x: 720, y: 660, rot: -12, tam: 40, a: em(0, 3.6, 'pop', ate(4, 0.3)) },
			{ k: 'texto', texto: '1975 — carta de Zuzu Angel ao presidente Geisel', x: 800, y: 120, alinhar: 'middle', tam: 30, fonte: 'mono', peso: 700, cor: OURO, fixo: true, a: em(1, 0.8, 'fade', ate(4)) },
			{ k: 'retrato', nome: 'Zuzu Angel', legenda: 'estilista conhecida no mundo inteiro', v: 'mulher', x: 1180, y: 300, esc: 0.95, a: em(1, 0.4, 'right', ate(4, 0.3)) },
			{ k: 'brilho', x: 1180, y: 300, r: 260, a: em(2, 0, 'fade', { dur: 2, ...ate(4) }) },
			{ k: 'cartao', x: 880, y: 600, w: 600, h: 150, titulo: 'Stuart Angel, o filho', texto: 'preso em 1971 por agentes da Aeronáutica; nunca mais apareceu', cor: VERMELHO, a: em(1, 6, 'up', ate(4, 0.3)) },
			{ k: 'sombra', cor: '#05070f', opac: 0.7, a: em(3, 0, 'fade', { dur: 1.2, sai: { s: 4, d: 0.2, dur: 0.8 } }) },
			{ k: 'texto', texto: '1976 · na saída de um túnel no Rio de Janeiro', x: 800, y: 460, alinhar: 'middle', tam: 40, fonte: 'display', cor: '#d6dbe8', fixo: true, a: em(3, 0.8, 'fade', ate(4)) },
			{ k: 'texto', texto: '1975', x: 800, y: 520, alinhar: 'middle', tam: 190, fonte: 'display', cor: CLARO, fixo: true, a: em(4, 0, 'fade', { dur: 0.4, sai: { s: 4, d: 1.2, dur: 0.4 } }) },
			{ k: 'texto', texto: '2025', x: 800, y: 520, alinhar: 'middle', tam: 190, fonte: 'display', cor: OURO, fixo: true, a: em(4, 1.4, 'zoom', { dur: 0.6, ...ate(5, 0.2) }) },
			{
				k: 'doc',
				x: 1040,
				y: 450,
				w: 600,
				h: 660,
				rot: 2,
				titulo: 'CERTIDÃO DE ÓBITO',
				linhas: ['Retificação — agosto de 2025', '', 'Causa da morte:'],
				destaque: '“não natural, violenta, causada pelo Estado brasileiro”',
				a: em(5, 0.2, 'type', { dur: 6 })
			},
			{ k: 'carimbo', texto: '2025', x: 1250, y: 260, rot: 8, tam: 40, a: em(5, 1, 'pop') },
			{ k: 'texto', texto: '2025 — certidão corrigida', x: 60, y: 210, tam: 30, fonte: 'mono', peso: 700, cor: OURO, larg: 380, fixo: true, a: em(5, 0.5, 'left', ate(8)) },
			{ k: 'texto', texto: 'Anos 1970: chamava opositores de “subversivos” e negava tudo', x: 60, y: 400, tam: 26, fonte: 'corpo', peso: 700, larg: 380, cor: CLARO, caixa: 'rgba(0,0,0,0.55)', fixo: true, a: em(7, 2, 'left', ate(8)) },
			{ k: 'texto', texto: 'Hoje: o Estado assina embaixo que matou', x: 60, y: 560, tam: 26, fonte: 'corpo', peso: 700, larg: 380, cor: OURO, caixa: 'rgba(0,0,0,0.55)', fixo: true, a: em(7, 6.5, 'left', ate(8)) },
			{ k: 'doc', x: 420, y: 450, w: 440, h: 560, rot: -3, linhas: ['Abril de 1975', '', 'Ao Presidente da República'], barras: 7, a: em(8, 0, 'left', ate(10)) },
			{ k: 'carimbo', texto: 'PROVA UERJ 2026', x: 800, y: 110, rot: -4, tam: 30, fixo: true, a: em(8, 1.5, 'pop', ate(10)) },
			{ k: 'texto', texto: 'Por que o regime perseguia?', x: 800, y: 470, alinhar: 'middle', tam: 44, fonte: 'display', cor: CLARO, caixa: 'rgba(26,20,16,0.9)', fixo: true, a: em(8, 4.5, 'pop', ate(10)) },
			{ k: 'texto', texto: 'E o que significa reconhecer isso agora?', x: 800, y: 570, alinhar: 'middle', tam: 40, fonte: 'display', cor: OURO, caixa: 'rgba(26,20,16,0.9)', fixo: true, a: em(9, 0, 'pop', ate(10)) },
			{ k: 'sombra', cor: '#07080d', opac: 0.86, a: em(10, 0, 'fade', { dur: 1.2 }) },
			{ k: 'titulo', texto: 'Ditaduras na América Latina e resistências', sub: 'UMA SÉRIE EM 5 EPISÓDIOS', x: 800, y: 330, tam: 68, fixo: true, a: em(10, 0.3, 'zoom', { dur: 1.4 }) },
			{
				k: 'linha',
				x: 160,
				y: 610,
				w: 1280,
				fixo: true,
				a: em(11, 0, 'draw', { dur: 2 }),
				itens: [
					{ rotulo: '1964', texto: 'golpe', a: em(11, 0.6, 'pop') },
					{ rotulo: '1968', texto: 'AI-5', a: em(11, 2.6, 'pop') },
					{ rotulo: '1979', texto: 'Lei da Anistia', a: em(11, 4.6, 'pop') },
					{ rotulo: '1985', texto: 'governo civil', a: em(11, 6.8, 'pop') },
					{ rotulo: '1988', texto: 'Constituição', a: em(11, 8.8, 'pop') },
					{ rotulo: '2014', texto: 'relatório da CNV', a: em(11, 11, 'pop') },
					{ rotulo: '2025', texto: 'certidões corrigidas', a: em(11, 13, 'pop') }
				]
			},
			{ k: 'pessoa', v: 'professor', x: 1450, y: 900, esc: 1.05, vira: true, fala: true, gesto: 'aponta', fixo: true, a: em(12, 0, 'right') },
			{ k: 'carimbo', texto: 'MOMENTO UERJ', x: 1200, y: 170, rot: 6, tam: 28, cor: OURO, fixo: true, a: em(12, 1.5, 'pop') }
		]
	},

	// 1.2 — Um continente que escurece
	'1.2': {
		fundo: 'mapa',
		transicao: 'corte',
		camera: [
			{ s: 0, x: 800, y: 450, z: 1 },
			{ s: 7, d: 0.2, x: 1205, y: 560, z: 1.75, dur: 2.6 }
		],
		elementos: [
			{
				k: 'mapa',
				a: em(0, 0, 'fade', { dur: 1.2 }),
				cidades: [
					{ nome: 'Washington', a: em(1, 1), cor: '#5d9bd6' },
					{ nome: 'Havana', a: em(2, 0.5), lado: 'e' }
				],
				pinta: [
					{ pais: 'USA', cor: '#2f5d8c', a: em(1, 0.8) },
					{ pais: 'CUB', cor: VERMELHO, a: em(2, 0.5) },
					{ pais: 'PRY', cor: ESCURO, a: em(8, 0.3) },
					{ pais: 'BRA', cor: ESCURO, a: em(9, 0.2) },
					{ pais: 'BOL', cor: ESCURO, a: em(9, 1) },
					{ pais: 'URY', cor: ESCURO, a: em(10, 0.2) },
					{ pais: 'CHL', cor: ESCURO, a: em(10, 1) },
					{ pais: 'ARG', cor: ESCURO, a: em(11, 0.2) }
				],
				rotulos: [
					{ texto: 'ESTADOS UNIDOS', x: 900, y: 100, tam: 22, a: em(1, 1.2) },
					{ texto: '1959 — REVOLUÇÃO CUBANA', x: 900, y: 160, tam: 22, carimbo: true, a: em(2, 1.5) },
					{ texto: '1961: revolução socialista', x: 960, y: 250, tam: 20, a: em(2, 7.5) },
					{ texto: 'ALARME EM WASHINGTON', x: 1330, y: 60, tam: 20, carimbo: true, cor: '#2f5d8c', a: em(3, 1, 'pop', ate(7)) },
					{ texto: '1954', x: 1228, y: 548, tam: 17, carimbo: true, a: em(8, 0.8) },
					{ texto: '1964', x: 1300, y: 450, tam: 17, carimbo: true, a: em(9, 0.7) },
					{ texto: '1964', x: 1172, y: 496, tam: 17, carimbo: true, a: em(9, 1.4) },
					{ texto: '1973', x: 1262, y: 632, tam: 17, carimbo: true, a: em(10, 0.7) },
					{ texto: '1973', x: 1094, y: 606, tam: 17, carimbo: true, a: em(10, 1.4) },
					{ texto: '1976', x: 1185, y: 694, tam: 17, carimbo: true, a: em(11, 0.7) },
					{ texto: 'Paraguai · Stroessner', x: 1228, y: 572, tam: 10, a: em(8, 1.6) },
					{ texto: 'Brasil', x: 1300, y: 474, tam: 11, a: em(9, 1.2) },
					{ texto: 'Bolívia', x: 1172, y: 520, tam: 11, a: em(9, 1.8) },
					{ texto: 'Uruguai', x: 1262, y: 656, tam: 11, a: em(10, 1.2) },
					{ texto: 'Chile', x: 1094, y: 630, tam: 11, a: em(10, 1.8) },
					{ texto: 'Argentina', x: 1185, y: 718, tam: 11, a: em(11, 1.2) }
				]
			},
			{ k: 'brilho', x: 1070, y: 196, r: 150, a: em(3, 0, 'fade', ate(7)) },
			{ k: 'texto', texto: 'GUERRA FRIA', x: 70, y: 150, tam: 60, fonte: 'display', cor: CLARO, a: em(1, 0, 'up', ate(7)) },
			{ k: 'cartao', x: 70, y: 190, w: 470, h: 100, titulo: 'Estados Unidos', texto: 'capitalismo', cor: '#2f5d8c', a: em(1, 1.5, 'left', ate(7)) },
			{ k: 'cartao', x: 70, y: 305, w: 470, h: 100, titulo: 'União Soviética', texto: 'socialismo', cor: VERMELHO, a: em(1, 3.5, 'left', ate(7)) },
			{ k: 'cartao', x: 70, y: 430, w: 470, h: 150, titulo: 'Aliança para o Progresso (1961)', texto: 'ajuda econômica contra a pobreza que alimentava revoluções', cor: '#2f5d8c', a: em(5, 0, 'left', ate(7)) },
			{ k: 'cartao', x: 70, y: 600, w: 470, h: 130, titulo: 'A outra frente', texto: 'apoiar, formar e armar militares e grupos anticomunistas', cor: TINTA, a: em(6, 0, 'left', ate(7)) },
			{ k: 'seta', de: [1085, 45], para: [1300, 465], curva: 0.18, cor: '#7fb6e6', espessura: 5, a: em(5, 1, 'draw', { dur: 1.6, ...ate(7) }) },
			{ k: 'seta', de: [1085, 45], para: [1140, 620], curva: 0.12, cor: '#7fb6e6', espessura: 5, a: em(6, 0.5, 'draw', { dur: 1.6, ...ate(7) }) },
			{ k: 'seta', de: [1085, 45], para: [1225, 640], curva: 0.05, cor: '#7fb6e6', espessura: 5, a: em(6, 1.4, 'draw', { dur: 1.6, ...ate(7) }) },
			{ k: 'texto', texto: 'Em pouco mais de uma década, o Cone Sul inteiro sob ditaduras', x: 800, y: 110, alinhar: 'middle', tam: 34, fonte: 'display', cor: CLARO, larg: 1300, caixa: 'rgba(10,31,48,0.88)', fixo: true, a: em(12, 0, 'down') },
			{ k: 'carimbo', texto: 'NÃO FOI COINCIDÊNCIA', x: 800, y: 470, rot: -6, tam: 54, fixo: true, a: em(13, 0.4, 'pop') }
		]
	},

	// 1.3 — Três forças que se encontram
	'1.3': {
		fundo: 'prancheta',
		transicao: 'fade',
		elementos: [
			{ k: 'texto', texto: 'TRÊS FORÇAS', x: 800, y: 110, alinhar: 'middle', tam: 44, fonte: 'mono', peso: 700, cor: '#cfe3ff', a: em(0, 0.5, 'fade', ate(9)) },
			{ k: 'brilho', x: 800, y: 330, r: 150, a: em(0, 1.5, 'fade', ate(9)) },
			{ k: 'seta', de: [130, 210], para: [690, 320], curva: 0.06, cor: OURO, espessura: 9, texto: 'Guerra Fria', a: em(1, 0, 'draw', { dur: 1.4, ...ate(9) }) },
			{ k: 'seta', de: [1470, 210], para: [910, 320], curva: -0.06, cor: '#ff8a7a', espessura: 9, texto: 'Doutrina de Segurança Nacional', a: em(2, 0, 'draw', { dur: 1.4, ...ate(9) }) },
			{ k: 'texto', texto: 'Escola Superior de Guerra · 1949', x: 1470, y: 160, alinhar: 'end', tam: 24, fonte: 'mono', peso: 700, cor: '#cfe3ff', a: em(3, 0.3, 'fade', ate(9)) },
			{ k: 'texto', texto: '“INIMIGO INTERNO”', x: 800, y: 345, alinhar: 'middle', tam: 40, fonte: 'display', cor: CLARO, caixa: 'rgba(179,38,30,0.92)', a: em(5, 3, 'pop', ate(9)) },
			{ k: 'pessoa', v: 'operario', x: 470, y: 880, esc: 0.8, a: em(5, 10.2, 'up', ate(9)) },
			{ k: 'pessoa', v: 'estudante', x: 660, y: 880, esc: 0.8, a: em(5, 11.3, 'up', ate(9)) },
			{ k: 'pessoa', v: 'religioso', x: 940, y: 880, esc: 0.8, a: em(5, 12.4, 'up', ate(9)) },
			{ k: 'pessoa', v: 'jornalista', x: 1130, y: 880, esc: 0.8, a: em(5, 13.3, 'up', ate(9)) },
			{ k: 'prop', nome: 'lupa', x: 430, y: 760, esc: 0.5, mov: { ate: { s: 6, d: 3 }, dx: 700 }, a: em(5, 9.6, 'pop', ate(6, 4)) },
			{ k: 'carimbo', texto: 'SUBVERSIVO', x: 800, y: 600, rot: -6, tam: 48, a: em(6, 0.6, 'pop', ate(9)) },
			{ k: 'cartao', x: 1040, y: 400, w: 440, h: 150, titulo: 'Se a guerra é interna…', texto: 'suspender direitos · vigiar · prender · torturar', cor: VERMELHO, a: em(6, 7, 'right', ate(9)) },
			{ k: 'tarja', x: 630, y: 588, w: 340, h: 9, rot: -6, cor: '#7ee2a8', a: em(6, 12.5, 'wipe', { dur: 0.6, ...ate(9) }) },
			{ k: 'texto', texto: 'CIDADÃO', x: 800, y: 545, alinhar: 'middle', tam: 46, fonte: 'display', cor: '#7ee2a8', a: em(6, 13, 'pop', ate(9)) },
			{ k: 'seta', de: [120, 470], para: [690, 360], curva: -0.05, cor: '#7ee2a8', espessura: 9, texto: 'Tensões do desenvolvimento', a: em(7, 0, 'draw', { dur: 1.4, ...ate(9) }) },
			{ k: 'cartao', x: 60, y: 500, w: 360, h: 150, titulo: 'Reformas × privilégios', texto: 'terra · salários · educação', cor: '#0f766e', a: em(7, 7, 'left', ate(9)) },
			{ k: 'brilho', x: 800, y: 330, r: 240, a: em(8, 0, 'fade', ate(9)) },
			{ k: 'pessoa', v: 'professor', x: 190, y: 890, esc: 1.3, fala: true, gesto: 'aponta', a: em(9, 0, 'right') },
			{ k: 'texto', texto: 'Discurso: anticomunismo', x: 420, y: 190, tam: 46, fonte: 'display', cor: OURO, a: em(9, 0.6, 'up', ate(13)) },
			{ k: 'texto', texto: 'Alvo real — quem foi derrubado:', x: 420, y: 262, tam: 26, fonte: 'mono', peso: 700, cor: '#cfe3ff', a: em(9, 7, 'fade', ate(13)) },
			{ k: 'carimbo', texto: 'DISCURSO ≠ ALVO', x: 1280, y: 175, rot: -5, tam: 32, a: em(9, 9.5, 'pop', ate(13)) },
			{
				k: 'tabela',
				x: 420,
				y: 290,
				w: 1100,
				colunas: ['País', 'Governo derrubado'],
				a: em(9, 7.5, 'fade', ate(13)),
				linhas: [
					{ celulas: ['Brasil', 'trabalhismo — João Goulart, herdeiro de Vargas'], a: em(10, 0.2) },
					{ celulas: ['Argentina', 'peronismo'], a: em(10, 2.6) },
					{ celulas: ['Chile', 'socialismo eleito — Salvador Allende (1970)'], a: em(12, 0.3) }
				]
			},
			{ k: 'texto', texto: 'governos nacionalistas · base sindical · reformas sociais', x: 420, y: 680, tam: 26, fonte: 'corpo', peso: 600, cor: '#cfe3ff', a: em(11, 0, 'fade', ate(13)) },
			{ k: 'texto', texto: 'Nem toda ditadura foi igual', x: 480, y: 230, tam: 44, fonte: 'display', cor: CLARO, a: em(13, 0.3, 'up') },
			{ k: 'cartao', x: 480, y: 280, w: 720, h: 150, titulo: 'Exceção: Peru (Velasco Alvarado, 1968–1975)', texto: 'reforma agrária · nacionalização de empresas', cor: '#0f766e', icone: 'EXCEÇÃO', a: em(14, 0, 'right') },
			{ k: 'cartao', x: 480, y: 455, w: 720, h: 180, titulo: 'Cone Sul: o padrão', texto: 'ditaduras anticomunistas, alinhadas aos Estados Unidos e decididas a desmobilizar a sociedade', cor: VERMELHO, icone: 'PADRÃO', a: em(15, 0, 'right') }
		]
	},

	// 1.4 — 1961: a renúncia e a legalidade
	'1.4': {
		fundo: 'ceu',
		transicao: 'corte',
		elementos: [
			{ k: 'prop', nome: 'palacio', x: 1180, y: 775, esc: 1.05, a: em(0, 0.3, 'up') },
			{ k: 'prop', nome: 'congresso', x: 470, y: 775, esc: 0.7, a: em(0, 0.6, 'up') },
			{ k: 'texto', texto: 'Brasília', x: 800, y: 180, alinhar: 'middle', tam: 46, fonte: 'display', cor: TINTA, a: em(0, 0.8, 'up', ate(1, 0.5)) },
			{ k: 'prop', nome: 'calendario', rotulo: 'AGO|1961', x: 250, y: 560, esc: 0.85, a: em(1, 0, 'down', ate(5)) },
			{ k: 'retrato', nome: 'Jânio Quadros', legenda: 'renuncia após sete meses de governo', x: 800, y: 300, esc: 0.95, a: em(1, 0.5, 'pop', ate(2)) },
			{ k: 'carimbo', texto: 'RENÚNCIA', x: 1010, y: 190, rot: 8, tam: 36, a: em(1, 3.5, 'pop', ate(2)) },
			{ k: 'retrato', nome: 'João Goulart (Jango)', legenda: 'vice · herdeiro político de Vargas · PTB e sindicatos', x: 760, y: 300, esc: 0.95, a: em(2, 0, 'pop', ate(5)) },
			{ k: 'pessoa', v: 'soldado', x: 1080, y: 790, esc: 0.8, a: em(3, 0, 'right', ate(4, 2)) },
			{ k: 'pessoa', v: 'soldado', x: 1210, y: 790, esc: 0.8, a: em(3, 0.3, 'right', ate(4, 2)) },
			{ k: 'pessoa', v: 'soldado', x: 1340, y: 790, esc: 0.8, a: em(3, 0.6, 'right', ate(4, 2)) },
			{ k: 'carimbo', texto: 'VETO MILITAR À POSSE', x: 1250, y: 300, rot: -6, tam: 30, a: em(3, 2, 'pop', ate(4, 1)) },
			{ k: 'retrato', nome: 'Leonel Brizola', legenda: 'governador do Rio Grande do Sul', x: 1240, y: 280, esc: 0.85, a: em(4, 1, 'pop', ate(5, 2)) },
			{ k: 'prop', nome: 'radio', x: 1260, y: 760, esc: 0.95, anima: true, a: em(4, 3, 'pop', ate(5, 2)) },
			{ k: 'cartao', x: 70, y: 150, w: 520, h: 150, titulo: 'Campanha da Legalidade', texto: 'rede de rádios em defesa do cumprimento da Constituição', cor: '#0f766e', a: em(4, 4, 'left', ate(5, 2)) },
			{ k: 'texto', texto: 'Parlamentarismo improvisado (1961)', x: 800, y: 200, alinhar: 'middle', tam: 40, fonte: 'display', cor: TINTA, a: em(5, 1, 'up', ate(6)) },
			{ k: 'texto', texto: 'Plebiscito (janeiro de 1963): volta o presidencialismo', x: 800, y: 200, alinhar: 'middle', tam: 40, fonte: 'display', cor: TINTA, larg: 1300, a: em(6, 0.3, 'up', ate(7)) },
			{ k: 'balanca', x: 800, y: 760, esc: 0.85, esq: 'Presidente', dir: 'Parlamento', pende: [{ s: 5, d: 2.5, lado: 1 }, { s: 6, d: 1, lado: 0 }], a: em(5, 0.5, 'fade', ate(7)) },
			{ k: 'pessoa', v: 'professor', x: 220, y: 890, esc: 1.35, fala: true, gesto: 'aponta', a: em(7, 0, 'right') },
			{ k: 'cartao', x: 520, y: 220, w: 820, h: 150, titulo: 'Parte dos militares aceitava romper a Constituição', texto: 'para barrar um presidente que considerava perigoso', cor: VERMELHO, a: em(7, 1, 'up') },
			{ k: 'texto', texto: '1961: eles recuaram.', x: 560, y: 470, tam: 48, fonte: 'display', cor: TINTA, a: em(8, 0, 'left') },
			{ k: 'carimbo', texto: '1964: NÃO', x: 1180, y: 610, rot: -8, tam: 64, a: em(9, 0.2, 'pop') }
		]
	},

	// 1.5 — Reformas de base e um país polarizado
	'1.5': {
		fundo: 'papel',
		transicao: 'fade',
		elementos: [
			{ k: 'texto', texto: 'REFORMAS DE BASE', x: 400, y: 175, alinhar: 'middle', tam: 46, fonte: 'display', cor: TINTA, a: em(0, 1, 'up') },
			{ k: 'texto', texto: 'governo João Goulart · PTB', x: 400, y: 215, alinhar: 'middle', tam: 22, fonte: 'mono', peso: 700, cor: '#8a6a45', a: em(0, 3, 'fade') },
			{ k: 'cartao', x: 90, y: 245, w: 620, h: 90, titulo: 'Reforma agrária', cor: VERMELHO, icone: 'A MAIS EXPLOSIVA', a: em(1, 0.5, 'down') },
			{ k: 'cartao', x: 90, y: 350, w: 300, h: 76, titulo: 'urbana', cor: '#2f3cd9', a: em(2, 1.8, 'down') },
			{ k: 'cartao', x: 410, y: 350, w: 300, h: 76, titulo: 'bancária', cor: '#2f3cd9', a: em(2, 2.8, 'down') },
			{ k: 'cartao', x: 90, y: 440, w: 300, h: 76, titulo: 'tributária', cor: '#2f3cd9', a: em(2, 3.8, 'down') },
			{ k: 'cartao', x: 410, y: 440, w: 300, h: 76, titulo: 'universitária', cor: '#2f3cd9', a: em(2, 5, 'down') },
			{ k: 'cartao', x: 90, y: 530, w: 620, h: 76, titulo: 'eleitoral: voto dos analfabetos', cor: '#2f3cd9', a: em(2, 6.2, 'down') },
			{ k: 'texto', texto: 'Ligas Camponesas (desde 1955) · greves nas cidades', x: 400, y: 650, alinhar: 'middle', tam: 22, fonte: 'mono', peso: 700, cor: TINTA, larg: 680, a: em(3, 1, 'fade') },
			{ k: 'pessoa', v: 'campones', x: 170, y: 890, esc: 0.72, a: em(3, 0.4, 'up') },
			{ k: 'pessoa', v: 'campones', x: 320, y: 890, esc: 0.72, gesto: 'punho', a: em(3, 1, 'up') },
			{ k: 'pessoa', v: 'operario', x: 500, y: 890, esc: 0.72, a: em(3, 6.2, 'up') },
			{ k: 'pessoa', v: 'operario', x: 650, y: 890, esc: 0.72, gesto: 'punho', a: em(3, 6.6, 'up') },
			{ k: 'tarja', x: 800, y: -300, w: 1400, h: 1500, cor: '#23262e', a: em(4, 0, 'wipe', { dur: 1.1 }) },
			{ k: 'tarja', x: 795, y: -300, w: 10, h: 1500, cor: VERMELHO, a: em(4, 0.9, 'fade') },
			{ k: 'texto', texto: 'empresários · latifundiários · parte das classes médias', x: 1200, y: 175, alinhar: 'middle', tam: 26, fonte: 'mono', peso: 700, cor: '#e8e2d4', larg: 700, a: em(4, 1, 'fade') },
			{ k: 'pessoa', v: 'executivo', x: 1000, y: 890, esc: 0.8, a: em(4, 1.6, 'up') },
			{ k: 'pessoa', v: 'executivo', x: 1170, y: 890, esc: 0.8, a: em(4, 2, 'up') },
			{ k: 'pessoa', v: 'mulher', x: 1340, y: 890, esc: 0.8, a: em(4, 5.5, 'up') },
			{ k: 'carimbo', texto: 'IPES · IBAD', x: 1200, y: 290, rot: -5, tam: 46, cor: OURO, a: em(6, 0.4, 'pop', ate(7)) },
			{ k: 'texto', texto: 'publicações · filmes · campanhas · candidatos', x: 1200, y: 370, alinhar: 'middle', tam: 24, fonte: 'mono', peso: 700, cor: '#e8e2d4', larg: 700, a: em(6, 2, 'fade', ate(7)) },
			{ k: 'prop', nome: 'jornal', rotulo: 'PUBLICAÇÕES', x: 990, y: 610, esc: 0.55, a: em(6, 2.5, 'pop', ate(7)) },
			{ k: 'prop', nome: 'tv', rotulo: 'FILMES', x: 1210, y: 610, esc: 0.55, a: em(6, 3.2, 'pop', ate(7)) },
			{ k: 'prop', nome: 'urna', rotulo: 'VOTO', x: 1420, y: 610, esc: 0.55, a: em(6, 4.2, 'pop', ate(7)) },
			{ k: 'prop', nome: 'livro', rotulo: '1964: a conquista do Estado', x: 1200, y: 610, esc: 0.9, a: em(7, 0.5, 'pop') },
			{ k: 'texto', texto: 'René Dreifuss (1981): um complexo empresarial, com militares, articulou o golpe', x: 1200, y: 300, alinhar: 'middle', tam: 26, fonte: 'corpo', peso: 600, cor: '#e8e2d4', larg: 700, a: em(7, 1, 'fade') },
			{ k: 'carimbo', texto: 'GUARDE: DREIFUSS', x: 1200, y: 200, rot: -4, tam: 34, cor: OURO, a: em(8, 0.2, 'pop') }
		]
	},

	// 1.6 — Março de 1964, dia a dia
	'1.6': {
		fundo: 'arquivo',
		transicao: 'corte',
		elementos: [
			{ k: 'texto', texto: 'Março de 1964', x: 800, y: 470, alinhar: 'middle', tam: 96, fonte: 'display', cor: CLARO, a: em(0, 0.3, 'zoom', { dur: 1, sai: { s: 1, d: -0.4 } }) },
			{ k: 'prop', nome: 'calendario', rotulo: '13 MAR|1964', x: 250, y: 560, a: em(1, 0, 'down', { sai: { s: 2, dur: 0.3 } }) },
			{ k: 'prop', nome: 'calendario', rotulo: '19 MAR|1964', x: 250, y: 560, a: em(2, 0, 'down', { sai: { s: 3, dur: 0.3 } }) },
			{ k: 'prop', nome: 'calendario', rotulo: '25–27 MAR|1964', x: 250, y: 560, a: em(3, 0, 'down', { sai: { s: 4, dur: 0.3 } }) },
			{ k: 'prop', nome: 'calendario', rotulo: '31 MAR|1964', x: 250, y: 560, a: em(4, 0, 'down', { sai: { s: 6, dur: 0.3 } }) },
			{ k: 'prop', nome: 'calendario', rotulo: '2 ABR|1964', x: 250, y: 560, a: em(6, 0, 'down', { sai: { s: 8, dur: 0.3 } }) },

			{ k: 'texto', texto: 'Comício da Central do Brasil (Rio)', x: 1020, y: 190, alinhar: 'middle', tam: 40, fonte: 'display', cor: CLARO, larg: 1000, a: em(1, 0.5, 'up', ate(2)) },
			{ k: 'texto', texto: 'decretos: desapropriação de terras à beira de rodovias e ferrovias · nacionalização de refinarias particulares', x: 1020, y: 250, alinhar: 'middle', tam: 24, fonte: 'corpo', peso: 600, cor: PAPEL, larg: 1000, a: em(1, 7, 'fade', ate(2)) },
			{ k: 'pessoa', v: 'politico', x: 1020, y: 600, esc: 0.85, gesto: 'acena', a: em(1, 1.5, 'fade', ate(2)) },
			{ k: 'prop', nome: 'microfone', x: 1080, y: 600, esc: 0.5, a: em(1, 1.5, 'fade', ate(2)) },
			{ k: 'multidao', x: 500, y: 890, w: 1060, placas: ['REFORMAS', 'REFORMA AGRÁRIA'], a: em(1, 0.8, 'up', ate(2)) },

			{ k: 'texto', texto: 'Marcha da Família com Deus pela Liberdade (São Paulo)', x: 1020, y: 190, alinhar: 'middle', tam: 36, fonte: 'display', cor: CLARO, larg: 1050, a: em(2, 0.4, 'up', ate(3)) },
			{ k: 'texto', texto: 'setores conservadores, religiosos e de classe média contra o governo', x: 1020, y: 290, alinhar: 'middle', tam: 24, fonte: 'corpo', peso: 600, cor: PAPEL, larg: 1000, a: em(2, 4, 'fade', ate(3)) },
			{ k: 'prop', nome: 'igreja', x: 1360, y: 610, esc: 0.55, a: em(2, 1, 'fade', ate(3)) },
			{ k: 'multidao', x: 480, y: 890, w: 1080, marcha: true, placas: ['FAMÍLIA', 'LIBERDADE'], cores: ['#3d3a4f', '#7a6a52', '#d9d2c0', '#1f2f5c', '#8a3b2a', '#5a4a35'], a: em(2, 0.6, 'up', ate(3)) },

			{ k: 'texto', texto: 'Revolta dos Marinheiros (25 a 27 de março)', x: 1020, y: 190, alinhar: 'middle', tam: 38, fonte: 'display', cor: CLARO, larg: 1050, a: em(3, 0.3, 'up', ate(4)) },
			{ k: 'texto', texto: 'para os oficiais, quebra da hierarquia: o argumento que faltava para unir as Forças Armadas', x: 1020, y: 260, alinhar: 'middle', tam: 24, fonte: 'corpo', peso: 600, cor: PAPEL, larg: 1000, a: em(3, 4, 'fade', ate(4)) },
			{ k: 'pessoa', v: 'marinheiro', x: 860, y: 860, esc: 0.9, a: em(3, 1, 'up', ate(4)) },
			{ k: 'pessoa', v: 'marinheiro', x: 1020, y: 860, esc: 0.9, gesto: 'punho', a: em(3, 1.3, 'up', ate(4)) },
			{ k: 'pessoa', v: 'marinheiro', x: 1180, y: 860, esc: 0.9, a: em(3, 1.6, 'up', ate(4)) },

			{ k: 'texto', texto: '31/3: tropas saem de Juiz de Fora (MG) rumo ao Rio', x: 1020, y: 190, alinhar: 'middle', tam: 36, fonte: 'display', cor: CLARO, larg: 1050, a: em(4, 0, 'up', ate(6)) },
			{ k: 'seta', de: [560, 470], para: [1460, 470], cor: OURO, espessura: 7, texto: 'Juiz de Fora → Rio de Janeiro', a: em(4, 0.6, 'draw', { dur: 3.5, ...ate(6) }) },
			{ k: 'prop', nome: 'caminhao', x: 600, y: 720, esc: 0.75, mov: { ate: { s: 6 }, dx: 640 }, a: em(4, 0.2, 'left', ate(6)) },
			{ k: 'prop', nome: 'tanque', x: 830, y: 720, esc: 0.65, mov: { ate: { s: 6 }, dx: 600 }, a: em(4, 0.5, 'left', ate(6)) },
			{ k: 'texto', texto: 'sem resistência armada organizada', x: 1020, y: 300, alinhar: 'middle', tam: 28, fonte: 'mono', peso: 700, cor: OURO, a: em(5, 0, 'fade', ate(6)) },

			{ k: 'texto', texto: '2/4, madrugada: o presidente do Congresso declara vaga a Presidência', x: 1020, y: 170, alinhar: 'middle', tam: 30, fonte: 'display', cor: CLARO, larg: 1050, a: em(6, 0, 'up', ate(7)) },
			{ k: 'prop', nome: 'congresso', x: 1050, y: 770, a: em(6, 0.3, 'up', ate(7)) },
			{ k: 'carimbo', texto: 'PRESIDÊNCIA VAGA', x: 1050, y: 330, rot: -6, tam: 50, a: em(6, 3, 'pop', ate(7)) },
			{ k: 'texto', texto: 'com Jango ainda em território brasileiro', x: 1050, y: 420, alinhar: 'middle', tam: 26, fonte: 'mono', peso: 700, cor: OURO, a: em(6, 6.5, 'fade', ate(7)) },

			{ k: 'texto', texto: 'Os Estados Unidos reconhecem o novo governo', x: 1020, y: 180, alinhar: 'middle', tam: 36, fonte: 'display', cor: CLARO, larg: 1050, a: em(7, 0, 'up', ate(8)) },
			{ k: 'texto', texto: 'Operação Brother Sam: força naval preparada para apoiar os golpistas', x: 1020, y: 250, alinhar: 'middle', tam: 24, fonte: 'corpo', peso: 600, cor: PAPEL, larg: 1000, a: em(7, 4.5, 'fade', ate(8)) },
			{ k: 'tarja', x: -300, y: 640, w: 2200, h: 600, cor: '#1b3a56', a: em(7, 1.5, 'fade', { dur: 1.2, ...ate(8) }) },
			{ k: 'prop', nome: 'navio', x: 1150, y: 650, esc: 1.05, anima: true, a: em(7, 2.2, 'left', { dur: 2.5, ...ate(8) }) },

			{ k: 'prop', nome: 'jornal', rotulo: 'REVOLUÇÃO', x: 980, y: 760, esc: 1.6, a: em(8, 0, 'zoom', { dur: 0.8 }) },
			{ k: 'texto', texto: '“', x: 845, y: 540, alinhar: 'end', tam: 110, fonte: 'display', cor: VERMELHO, a: em(9, 3, 'pop') },
			{ k: 'texto', texto: '”', x: 1115, y: 540, alinhar: 'start', tam: 110, fonte: 'display', cor: VERMELHO, a: em(9, 3.3, 'pop') },
			{ k: 'texto', texto: 'A grande imprensa apoiou a derrubada de Jango', x: 90, y: 300, tam: 34, fonte: 'display', cor: CLARO, larg: 560, a: em(9, 0, 'left') },
			{ k: 'texto', texto: 'Essa palavra não é neutra: é a palavra de quem venceu.', x: 90, y: 470, tam: 28, fonte: 'corpo', peso: 700, cor: OURO, larg: 520, a: em(10, 0, 'left') }
		]
	},

	// 1.7 — Conspiração ou crise? E qual é o nome do regime?
	'1.7': {
		fundo: 'papel',
		transicao: 'fade',
		elementos: [
			{ k: 'pessoa', v: 'professor', x: 190, y: 890, esc: 1.35, fala: true, gesto: 'aponta', a: em(0, -0.5, 'right') },
			{ k: 'texto', texto: 'Por que houve o golpe?', x: 900, y: 150, alinhar: 'middle', tam: 56, fonte: 'display', cor: TINTA, a: em(0, 0.2, 'up', ate(5)) },
			{ k: 'prop', nome: 'livro', rotulo: 'Dreifuss: conspiração', x: 600, y: 560, a: em(2, 0, 'pop', ate(5)) },
			{ k: 'texto', texto: 'empresários, militares e interesses estrangeiros planejaram tomar o Estado', x: 600, y: 610, alinhar: 'middle', tam: 22, fonte: 'corpo', peso: 600, cor: TINTA, larg: 440, a: em(2, 3, 'fade', ate(5)) },
			{ k: 'prop', nome: 'livro', rotulo: 'Argelina Figueiredo: crise', x: 1200, y: 560, a: em(3, 0, 'pop', ate(5)) },
			{ k: 'texto', texto: 'radicalização dos dois lados e reformas sem negociação fecharam as saídas democráticas', x: 1200, y: 610, alinhar: 'middle', tam: 22, fonte: 'corpo', peso: 600, cor: TINTA, larg: 440, a: em(3, 4, 'fade', ate(5)) },
			{ k: 'texto', texto: '+', x: 900, y: 520, alinhar: 'middle', tam: 130, fonte: 'display', cor: VERMELHO, a: em(4, 0.4, 'pop', ate(5)) },
			{ k: 'texto', texto: 'houve conspiração E houve crise', x: 900, y: 255, alinhar: 'middle', tam: 40, fonte: 'display', cor: VERMELHO, a: em(4, 0.5, 'pop', ate(5)) },
			{ k: 'texto', texto: 'apoio social: empresários · imprensa · Igreja conservadora · classes médias · governadores · EUA', x: 900, y: 305, alinhar: 'middle', tam: 22, fonte: 'mono', peso: 700, cor: '#8a6a45', larg: 1100, a: em(4, 6, 'fade', ate(5)) },
			{ k: 'texto', texto: 'REGIME', x: 900, y: 470, alinhar: 'middle', tam: 110, fonte: 'display', cor: TINTA, a: em(5, 0.5, 'zoom') },
			{ k: 'cartao', x: 420, y: 530, w: 360, h: 120, titulo: 'civil-militar', texto: 'destaca a participação dos civis', cor: '#2f3cd9', a: em(6, 0, 'down') },
			{ k: 'cartao', x: 810, y: 560, w: 400, h: 120, titulo: 'empresarial-militar', texto: 'destaca o peso dos empresários', cor: '#b45309', a: em(6, 3.6, 'down') },
			{ k: 'cartao', x: 1225, y: 530, w: 330, h: 160, titulo: 'comandado pelos militares', texto: 'Carlos Fico: golpe civil-militar, regime dos militares', cor: VERMELHO, a: em(7, 0, 'down') },
			{ k: 'cartao', x: 520, y: 150, w: 760, h: 130, titulo: 'Na prova da UERJ', texto: '“ditaduras civil-militares” e “governos militares”', cor: '#2f3cd9', icone: 'UERJ', a: em(8, 0, 'up') },
			{ k: 'carimbo', texto: 'USE OS DOIS COM CONSCIÊNCIA', x: 900, y: 335, rot: -3, tam: 28, a: em(9, 0.2, 'pop') }
		]
	},

	// 1.8 — Governar por atos
	'1.8': {
		fundo: 'arquivo',
		transicao: 'preto',
		elementos: [
			{ k: 'prop', nome: 'congresso', x: 1250, y: 800, esc: 1.15, anima: true, a: em(0, 0.5, 'up') },
			{ k: 'texto', texto: 'O regime quis parecer legal', x: 90, y: 260, tam: 44, fonte: 'display', cor: CLARO, larg: 700, a: em(0, 0.4, 'up', ate(3)) },
			{ k: 'texto', texto: 'Apresentava-se como “revolução” provisória, para salvar a democracia do comunismo e da corrupção', x: 90, y: 340, tam: 28, fonte: 'corpo', peso: 600, cor: PAPEL, larg: 700, a: em(1, 0.3, 'fade', ate(3)) },
			{ k: 'doc', x: 420, y: 600, w: 380, h: 240, titulo: 'CONSTITUIÇÃO', barras: 3, a: em(2, 0, 'up', ate(3)) },
			{ k: 'cartao', x: 240, y: 420, w: 360, h: 80, titulo: 'ATO INSTITUCIONAL', cor: VERMELHO, a: em(2, 3, 'down', ate(3)) },
			{ k: 'texto', texto: 'acima da própria Constituição', x: 420, y: 760, alinhar: 'middle', tam: 24, fonte: 'mono', peso: 700, cor: OURO, a: em(2, 4.5, 'fade', ate(3)) },
			{ k: 'cartao', x: 90, y: 640, w: 680, h: 110, titulo: 'AI-1 (abril de 1964)', texto: 'cassações · eleição indireta de Castelo Branco', cor: VERMELHO, icone: 'ABR 1964', a: em(3, 0.3, 'down') },
			{ k: 'cartao', x: 120, y: 520, w: 620, h: 110, titulo: 'AI-2 (1965)', texto: 'partidos extintos · presidente indireto', cor: VERMELHO, icone: '1965', a: em(4, 5, 'down') },
			{ k: 'cartao', x: 150, y: 400, w: 560, h: 110, titulo: 'ARENA × MDB', texto: 'governo × oposição consentida', cor: '#1f2f5c', icone: '1965', a: em(5, 0.5, 'down') },
			{ k: 'cartao', x: 180, y: 280, w: 500, h: 110, titulo: 'AI-3 (1966)', texto: 'governadores eleitos indiretamente', cor: VERMELHO, icone: '1966', a: em(6, 0.3, 'down') },
			{ k: 'cartao', x: 210, y: 160, w: 440, h: 110, titulo: 'Constituição de 1967', texto: '+ Lei de Segurança Nacional', cor: TINTA, icone: '1967', a: em(7, 0.3, 'down') },
			{ k: 'texto', texto: 'civis passam a ser julgados pela Justiça Militar', x: 1250, y: 260, alinhar: 'middle', tam: 24, fonte: 'mono', peso: 700, cor: OURO, larg: 560, a: em(4, 12, 'fade', ate(5)) },
			{ k: 'texto', texto: 'Fachada de democracia, esvaziada por dentro', x: 1250, y: 200, alinhar: 'middle', tam: 40, fonte: 'display', cor: OURO, larg: 620, a: em(8, 0.3, 'up') }
		]
	},

	// 1.9 — 1968 e o AI-5
	'1.9': {
		fundo: 'ceu',
		transicao: 'preto',
		elementos: [
			{ k: 'texto', texto: '1968', x: 800, y: 330, alinhar: 'middle', tam: 160, fonte: 'display', cor: TINTA, a: em(0, 0.2, 'zoom', ate(1, 0.5)) },
			{ k: 'texto', texto: 'um ano de rua no mundo inteiro', x: 800, y: 400, alinhar: 'middle', tam: 28, fonte: 'mono', peso: 700, cor: TINTA, a: em(0, 1.5, 'fade', ate(1, 0.5)) },
			{ k: 'texto', texto: 'Março, Rio: a polícia invade o restaurante Calabouço e mata o estudante Edson Luís', x: 800, y: 200, alinhar: 'middle', tam: 32, fonte: 'display', cor: TINTA, larg: 1200, a: em(1, 0.5, 'up', ate(3)) },
			{ k: 'brilho', x: 800, y: 460, r: 110, a: em(1, 3, 'fade', { dur: 1.5, ...ate(3) }) },
			{ k: 'texto', texto: 'Edson Luís', x: 800, y: 475, alinhar: 'middle', tam: 42, fonte: 'display', cor: TINTA, a: em(1, 3.5, 'fade', { dur: 1.2, ...ate(3) }) },
			{ k: 'texto', texto: 'o enterro vira protesto', x: 800, y: 560, alinhar: 'middle', tam: 28, fonte: 'mono', peso: 700, cor: TINTA, a: em(2, 0, 'fade', ate(3)) },
			{ k: 'texto', texto: 'Junho · Passeata dos Cem Mil: estudantes, artistas, intelectuais, religiosos', x: 800, y: 200, alinhar: 'middle', tam: 32, fonte: 'display', cor: TINTA, larg: 1200, a: em(3, 0.3, 'up', ate(5)) },
			{ k: 'multidao', x: 40, y: 890, w: 1520, marcha: true, placas: ['LIBERDADE', 'DEMOCRACIA'], a: em(3, 0, 'up', { dur: 1.2, sai: { s: 8, d: 1 } }) },
			{ k: 'prop', nome: 'fabrica', x: 1380, y: 560, esc: 0.55, a: em(4, 0, 'pop', ate(5)) },
			{ k: 'texto', texto: 'greves operárias: Contagem (MG) e Osasco (SP)', x: 800, y: 290, alinhar: 'middle', tam: 28, fonte: 'mono', peso: 700, cor: TINTA, a: em(4, 0.4, 'fade', ate(5)) },
			{ k: 'prop', nome: 'congresso', x: 1300, y: 600, esc: 0.6, a: em(5, 0, 'pop', ate(8)) },
			{ k: 'texto', texto: 'Márcio Moreira Alves critica os militares; o governo pede licença para processá-lo', x: 800, y: 200, alinhar: 'middle', tam: 30, fonte: 'display', cor: TINTA, larg: 1200, a: em(5, 0.3, 'up', ate(7)) },
			{ k: 'carimbo', texto: '12/12 · A CÂMARA NEGA', x: 800, y: 330, rot: -4, tam: 38, a: em(6, 0.2, 'pop', ate(7, 1)) },
			{ k: 'sombra', cor: '#2b2f36', opac: 0.55, a: em(7, 0, 'fade', { dur: 2.5 }) },
			{ k: 'carimbo', texto: '13/12/1968 · AI-5', x: 800, y: 200, rot: -5, tam: 54, fixo: true, a: em(7, 2.5, 'pop', ate(9)) },
			{ k: 'texto', texto: 'governo Costa e Silva', x: 800, y: 290, alinhar: 'middle', tam: 26, fonte: 'mono', peso: 700, cor: '#e8e2d4', fixo: true, a: em(7, 4, 'fade', ate(9)) },
			{ k: 'cartao', x: 330, y: 360, w: 940, h: 170, titulo: 'O AI-5 permitia', texto: 'fechar o Congresso (fechado no mesmo dia) · intervir em estados e municípios · cassar mandatos · suspender direitos políticos', cor: VERMELHO, fixo: true, a: em(8, 0, 'up', ate(9)) },
			{
				k: 'doc',
				x: 800,
				y: 450,
				w: 1000,
				h: 520,
				titulo: 'ATO INSTITUCIONAL Nº 5 · 13/12/1968',
				linhas: ['Art. 10. Fica suspensa a garantia de habeas corpus, nos casos de crimes políticos, contra a segurança nacional, a ordem econômica e social e a economia popular.'],
				tam: 29,
				fixo: true,
				a: em(9, 0.3, 'type', { dur: 12, ...ate(15) })
			},
			{ k: 'texto', texto: 'habeas corpus: um juiz controla a prisão de alguém', x: 360, y: 480, tam: 28, fonte: 'corpo', peso: 700, cor: TINTA, larg: 800, fixo: true, a: em(11, 0, 'fade', ate(15)) },
			{ k: 'prop', nome: 'cadeado', x: 1210, y: 620, esc: 0.6, fixo: true, a: em(11, 0.6, 'pop', ate(15)) },
			{ k: 'texto', texto: 'sem ele: preso incomunicável, sem advogado, sem juiz', x: 360, y: 535, tam: 28, fonte: 'corpo', peso: 700, cor: VERMELHO, larg: 800, fixo: true, a: em(12, 0, 'fade', ate(15)) },
			{ k: 'texto', texto: '→ tortura sistemática', x: 360, y: 600, tam: 34, fonte: 'display', cor: VERMELHO, fixo: true, a: em(13, 0, 'fade', ate(15)) },
			{ k: 'texto', texto: 'atos fora do controle do Judiciário · sem prazo para acabar', x: 800, y: 670, alinhar: 'middle', tam: 24, fonte: 'mono', peso: 700, cor: TINTA, larg: 900, fixo: true, a: em(14, 0.3, 'fade', ate(15)) },
			{ k: 'carimbo', texto: 'UM GOLPE DENTRO DO GOLPE', x: 800, y: 430, rot: -5, tam: 52, fixo: true, a: em(15, 0, 'pop') },
			{ k: 'sombra', cor: '#3a3f47', opac: 0.86, a: em(16, 0, 'fade', { dur: 2.5 }) },
			{ k: 'texto', texto: 'ANOS DE CHUMBO', x: 800, y: 600, alinhar: 'middle', tam: 66, fonte: 'display', cor: '#a7b0ba', fixo: true, a: em(16, 0.8, 'fade', { dur: 2 }) }
		]
	},

	// 1.10 — Momento UERJ: a imprensa em 1964 (UERJ 2017)
	'1.10': {
		fundo: 'lousa',
		transicao: 'preto',
		elementos: [
			{ k: 'pessoa', v: 'professor', x: 1440, y: 880, esc: 1.35, vira: true, fala: true, gesto: 'aponta', a: em(0, -0.6, 'left') },
			{ k: 'texto', texto: 'MOMENTO UERJ', x: 120, y: 150, tam: 30, fonte: 'mono', peso: 700, cor: OURO, a: em(0, 0.5, 'fade') },
			{ k: 'texto', texto: 'Hora de ver como isso cai', x: 120, y: 215, tam: 44, fonte: 'display', cor: '#f3efe6', a: em(0, 1, 'up', ate(1, 3.6)) },
			{ k: 'carimbo', texto: 'QUESTÃO OFICIAL', x: 1150, y: 160, rot: -6, tam: 32, a: em(1, 0.5, 'pop') },
			{ k: 'texto', texto: 'UERJ 2017 · Questão 10', x: 120, y: 215, tam: 44, fonte: 'display', cor: '#f3efe6', a: em(1, 4.2, 'up') },
			{ k: 'prop', nome: 'jornal', rotulo: '2 DE ABRIL DE 1964', x: 330, y: 600, esc: 0.85, a: em(1, 2, 'pop', ate(5)) },
			{ k: 'prop', nome: 'jornal', rotulo: 'EDITORIAL DE 2013', x: 700, y: 600, esc: 0.85, a: em(1, 7, 'pop', ate(5)) },
			{ k: 'texto', texto: 'Comando: analise criticamente o papel da grande imprensa na crise de 1964', x: 880, y: 300, tam: 28, fonte: 'corpo', peso: 600, cor: '#f3efe6', larg: 420, a: em(2, 0, 'type', { dur: 3, ...ate(5) }) },
			{ k: 'texto', texto: 'ANALISE CRITICAMENTE', x: 880, y: 470, tam: 38, fonte: 'display', cor: OURO, a: em(3, 0, 'pop', ate(5)) },
			{ k: 'tarja', x: 880, y: 484, w: 420, h: 6, cor: OURO, a: em(3, 0.6, 'wipe', { dur: 0.6, ...ate(5) }) },
			{ k: 'carimbo', texto: '“A IMPRENSA APOIOU” NÃO BASTA', x: 860, y: 640, rot: -4, tam: 26, a: em(4, 0.3, 'pop', ate(5)) },
			{ k: 'texto', texto: 'Padrão de respostas da UERJ:', x: 120, y: 300, tam: 26, fonte: 'mono', peso: 700, cor: OURO, a: em(5, 0, 'fade', ate(7)) },
			{ k: 'prop', nome: 'engrenagem', x: 330, y: 560, esc: 0.7, anima: true, a: em(5, 5.6, 'pop', ate(7)) },
			{ k: 'texto', texto: 'radicalizou o ambiente', x: 330, y: 640, alinhar: 'middle', tam: 24, fonte: 'corpo', peso: 700, cor: '#f3efe6', a: em(5, 5.9, 'fade', ate(7)) },
			{ k: 'prop', nome: 'engrenagem', x: 560, y: 600, esc: 0.55, anima: true, a: em(5, 7.6, 'pop', ate(7)) },
			{ k: 'texto', texto: 'estimulou a intervenção', x: 560, y: 690, alinhar: 'middle', tam: 24, fonte: 'corpo', peso: 700, cor: '#f3efe6', a: em(5, 7.9, 'fade', ate(7)) },
			{ k: 'prop', nome: 'engrenagem', x: 790, y: 560, esc: 0.7, anima: true, a: em(5, 9.8, 'pop', ate(7)) },
			{ k: 'texto', texto: 'legitimou o golpe', x: 790, y: 640, alinhar: 'middle', tam: 24, fonte: 'corpo', peso: 700, cor: '#f3efe6', a: em(5, 10.1, 'fade', ate(7)) },
			{ k: 'texto', texto: 'GOLPE', x: 1080, y: 520, alinhar: 'middle', tam: 64, fonte: 'display', cor: '#f3efe6', a: em(5, 10.5, 'pop', ate(7)) },
			{ k: 'texto', texto: 'afastou um presidente eleito', x: 1080, y: 575, alinhar: 'middle', tam: 24, fonte: 'corpo', peso: 700, cor: OURO, a: em(5, 11.9, 'fade', ate(7)) },
			{ k: 'carimbo', texto: 'MOSTRE O MECANISMO', x: 1080, y: 340, rot: -5, tam: 30, a: em(6, 0.3, 'pop', ate(7)) },
			{ k: 'cartao', x: 120, y: 320, w: 1160, h: 160, titulo: 'Para ir além: a autocrítica de 2013', texto: 'liga-se à valorização da democracia e à busca de credibilidade junto aos leitores', cor: '#2f6f4f', a: em(7, 0, 'up', ate(8)) },
			{ k: 'texto', texto: 'Próximo episódio', x: 120, y: 420, tam: 28, fonte: 'mono', peso: 700, cor: OURO, a: em(8, 0, 'fade') },
			{ k: 'texto', texto: 'O milagre e o porão', x: 120, y: 500, tam: 60, fonte: 'display', cor: '#f3efe6', a: em(8, 0.5, 'up') },
			{ k: 'texto', texto: 'milagre econômico · a Amazônia do “Brasil Grande” · o porão da repressão', x: 120, y: 560, tam: 26, fonte: 'corpo', peso: 600, cor: '#f3efe6', larg: 1150, a: em(8, 1.5, 'fade') }
		]
	}
};
