<script lang="ts">
	import { onDestroy, onMount, untrack } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Palco from './Palco.svelte';
	import type { CenaTocavel, EpisodioTocavel } from './aulas';
	import type { Cronograma } from './tempo';
	import { cronograma, formatarTempo, instante } from './tempo';
	import { Trilha } from './som';
	import { aoMudarVozes, calar, destravar, falar, temVoz, totalDeVozes, vozesPortugues, type OpcaoVoz } from './voz';
	import { cronogramaGravado, ENTRADA_AUDIO, type Gravacao } from './gravacoes';
	import { Narrador, sessaoDeReproducao, urlDaGravacao } from './narrador';

	let { episodios, inicial = 0 }: { episodios: EpisodioTocavel[]; inicial?: number } = $props();

	// ——— Estado de reprodução ———
	let epIdx = $state(untrack(() => Math.min(Math.max(0, inicial), episodios.length - 1)));
	let cenaIdx = $state(0);
	let t = $state(0);
	let vivo = $state(0);
	let tocando = $state(false);
	/** Parado mostrando um quadro de prévia (capa do episódio ou da cena escolhida). */
	let previa = $state(true);
	let terminou = $state(false);
	let falando = $state(false);
	let limite = $state(-1);

	// ——— Preferências ———
	let legendas = $state(true);
	let narracao = $state(true);
	let musica = $state(true);
	let velocidade = $state(1);
	let vozes = $state<OpcaoVoz[]>([]);
	let vozId = $state('');
	let suporteVoz = $state(false);
	let movimento = $state(true);
	let calib = $state(1);
	let calibCena = $state(1);
	/** O navegador lista zero vozes (alguns apps): a fala usa a voz padrão do sistema em português. */
	let semLista = $state(false);
	/** A voz sintetizada não chegou a falar neste aparelho: a aula segue só com legendas. */
	let vozMuda = $state(false);
	let ios = $state(false);

	// ——— Narração gravada (voz do ElevenLabs) ———
	let narrador: Narrador | null = null;
	/** Arquivos gravados que o navegador recusou: as cenas deles voltam para a voz sintetizada. */
	let falhas = $state<string[]>([]);
	const gravFalhou = $derived(falhas.length > 0);
	/** O navegador pediu um toque antes de tocar som (o player pausou). */
	let bloqueado = $state(false);
	/** A gravação da cena atual já tocou até o fim. */
	let fimDoAudio = false;

	let caixa: HTMLDivElement | undefined = $state();
	/**
	 * Tela cheia: "nativa" usa a API do navegador (computador, Android, alguns iPads); "pagina" é o
	 * player cobrindo a janela por CSS, para onde a API não existe ou é recusada (iPhone, app do Claude,
	 * página dentro de outra).
	 */
	let modoTela = $state<'' | 'nativa' | 'pagina'>('');
	const telaCheia = $derived(modoTela !== '');
	/** Em tela cheia, os controles ficam sobre a imagem e somem durante a reprodução. */
	let controlesVisiveis = $state(true);
	let timerControles: ReturnType<typeof setTimeout> | undefined;
	let alturaPlayer = $state(0);
	let alturaTela = $state(0);
	let alturaControles = $state(0);
	const controlesOcultos = $derived(telaCheia && tocando && !controlesVisiveis);
	/** Quanto subir a legenda para os controles (sobre a imagem) não a cobrirem. */
	const elevarLegenda = $derived(telaCheia && !controlesOcultos ? Math.max(0, alturaControles - (alturaPlayer - alturaTela) / 2) : 0);

	/** Gravação que pode tocar nesta cena (existe, tem arquivo e o navegador aceita áudio gravado). */
	function gravacaoTocavel(c: CenaTocavel): Gravacao | null {
		if (c.abertura || !c.gravacao) return null;
		const url = urlDaGravacao(c.gravacao.arquivo);
		return url && !falhas.includes(url) ? c.gravacao : null;
	}

	const ep = $derived(episodios[epIdx]);
	const cena = $derived(ep.cenas[cenaIdx]);
	const grav = $derived(gravacaoTocavel(cena));
	const urlGrav = $derived(grav ? (urlDaGravacao(grav.arquivo) ?? '') : '');
	const crono = $derived.by((): Cronograma => {
		if (cena.abertura || !cena.narracao) return { frases: [], inicios: [], duracoes: [], total: cena.animada.duracao ?? 5 };
		if (grav) return cronogramaGravado(cena.narracao, grav);
		return cronograma(cena.narracao, calibCena);
	});
	const vozAtiva = $derived(narracao && !grav && suporteVoz && !vozMuda && (vozes.length > 0 || semLista));
	/** Quadro mostrado na prévia: depois da primeira frase (ou o título, na abertura). */
	const tPrevia = $derived((crono.inicios[1] ?? crono.total * 0.55) + 0.6);
	const duracoes = $derived(
		ep.cenas.map((c) => {
			if (c.abertura) return c.animada.duracao ?? 5;
			const g = gravacaoTocavel(c);
			return g ? cronogramaGravado(c.narracao, g).total : cronograma(c.narracao, calib).total;
		})
	);
	const cenasFaladas = $derived(episodios.flatMap((e) => e.cenas.filter((c) => !c.abertura && c.narracao)));
	const gravadas = $derived(cenasFaladas.filter((c) => c.gravacao));
	const todasGravadas = $derived(gravadas.length > 0 && gravadas.length === cenasFaladas.length && !gravFalhou);
	const vozGravada = $derived(gravadas[0]?.gravacao?.voz.startsWith('ElevenLabs') ? 'Voz gravada (ElevenLabs)' : 'Narração gravada (voz neural gratuita)');

	// ——— Fala em andamento (fora do estado reativo) ———
	type Corrente = {
		indice: number;
		terminou: boolean;
		cancelar: () => void;
		inicio: number;
		/** Caracteres já falados antes do pedaço atual (frases longas são faladas em pedaços). */
		base: number;
		/** Último caractere informado pelo navegador e quando. */
		ch: number;
		quando: number;
		seguranca: ReturnType<typeof setTimeout>;
		/** O navegador avisou que a fala começou. */
		comecou: boolean;
	};
	let corrente: Corrente | null = null;
	let faladas = new Set<number>();
	let raf = 0;
	let ultimo = 0;
	let ultimoFalando = false;
	const trilha = new Trilha();

	/** Divide frases longas em pedaços de até ~170 caracteres (vozes do navegador travam em falas longas). */
	function pedacos(frase: string): string[] {
		if (frase.length <= 170) return [frase];
		const partes: string[] = [];
		let atual = '';
		for (const p of frase.split(/(?<=[,;:—–])\s+/)) {
			if (atual && (atual + ' ' + p).length > 170) {
				partes.push(atual);
				atual = p;
			} else atual = atual ? atual + ' ' + p : p;
		}
		if (atual) partes.push(atual);
		return partes;
	}

	function indiceFrase(c: Cronograma, tempo: number): number {
		let i = -1;
		for (let k = 0; k < c.inicios.length; k++) if (c.inicios[k] <= tempo + 1e-6) i = k;
		return i;
	}

	const fraseAtual = $derived.by(() => {
		if (!crono.frases.length) return -1;
		const i = indiceFrase(crono, t);
		if (i < 0) return -1;
		if (falando) return i;
		return t <= crono.inicios[i] + crono.duracoes[i] ? i : -1;
	});

	/** Legenda: a frase atual, em pedaços de até ~95 caracteres. */
	const legenda = $derived.by(() => {
		if (fraseAtual < 0) return '';
		const frase = crono.frases[fraseAtual];
		if (frase.length <= 110) return frase;
		const partes: string[] = [];
		let atual = '';
		for (const pedaco of frase.split(/(?<=[,;:—–])\s+/)) {
			if (atual && (atual + ' ' + pedaco).length > 95) {
				partes.push(atual);
				atual = pedaco;
			} else atual = atual ? atual + ' ' + pedaco : pedaco;
		}
		if (atual) partes.push(atual);
		const prog = falando && limite >= 0 ? limite / frase.length : (t - crono.inicios[fraseAtual]) / crono.duracoes[fraseAtual];
		let acumulado = 0;
		for (const p of partes) {
			acumulado += p.length + 1;
			if (prog * frase.length < acumulado) return p;
		}
		return partes[partes.length - 1];
	});

	// Efeitos sonoros ligados às entradas de carimbos, datilografia e títulos.
	const eventos = $derived.by(() => {
		const lista: { tempo: number; nome: 'carimbo' | 'maquina' | 'passagem'; dur: number }[] = [];
		for (const el of cena.animada.elementos) {
			const tempo = instante(el.a, crono);
			if (el.k === 'carimbo') lista.push({ tempo, nome: 'carimbo', dur: 0 });
			else if (el.a.fx === 'type') lista.push({ tempo, nome: 'maquina', dur: Math.min(6, el.a.dur ?? 0.7) });
			else if (el.k === 'titulo') lista.push({ tempo, nome: 'passagem', dur: 0 });
			if (el.k === 'mapa') for (const r of el.rotulos ?? []) if (r.carimbo) lista.push({ tempo: instante(r.a, crono), nome: 'carimbo', dur: 0 });
		}
		return lista;
	});

	/** Posição (s) em que o áudio gravado deveria estar tocando agora, ou null se deve ficar parado. */
	function posicaoDoAudio(): number | null {
		if (!narrador || !tocando || !narracao || !grav || fimDoAudio) return null;
		const pos = t - ENTRADA_AUDIO;
		if (pos < 0 || pos >= grav.dur - 0.08) return null;
		return pos;
	}

	/** Põe o elemento de áudio no estado que a cena pede (barato: chamado a cada quadro). */
	function sincronizarAudio(buscar = false) {
		if (!narrador) return;
		const pos = posicaoDoAudio();
		if (pos === null) narrador.pausar();
		else narrador.tocar(urlGrav, grav!.inicio + pos, velocidade, buscar);
	}

	function pararFala() {
		if (corrente) {
			clearTimeout(corrente.seguranca);
			corrente.cancelar();
		}
		corrente = null;
		falando = false;
		limite = -1;
		calar();
	}

	function iniciarFala(i: number) {
		faladas.add(i);
		const c = crono;
		const frase = c.frases[i];
		const partes = pedacos(frase);
		const estado: Corrente = { indice: i, terminou: false, cancelar: () => {}, inicio: performance.now(), base: 0, ch: -1, quando: 0, seguranca: 0 as unknown as ReturnType<typeof setTimeout>, comecou: false };
		corrente = estado;
		falando = true;
		limite = -1;
		const fim = () => {
			if (estado.terminou) return;
			estado.terminou = true;
			clearTimeout(estado.seguranca);
			if (corrente === estado) {
				falando = false;
				limite = -1;
			}
			// Sem lista de vozes e sem nenhum sinal de fala: o aparelho não tem voz; segue com legendas.
			if (!estado.comecou && semLista) {
				vozMuda = true;
				return;
			}
			const real = (performance.now() - estado.inicio) / 1000;
			if (real > 0.8) {
				const base = frase.length / 14.5 + 0.45;
				const alvo = base / (real * velocidade);
				calib = Math.min(1.8, Math.max(0.6, calib * 0.7 + alvo * 0.3));
			}
		};
		const falarParte = (k: number) => {
			if (estado.terminou || corrente !== estado) return;
			const f = falar(partes[k], {
				vozId,
				ritmo: velocidade,
				aoTerminar: () => {
					if (estado.terminou || corrente !== estado) return;
					if (k + 1 < partes.length) {
						estado.base += partes[k].length + 1;
						falarParte(k + 1);
					} else fim();
				},
				aoLimite: (ch) => {
					estado.comecou = true;
					estado.ch = estado.base + ch;
					estado.quando = performance.now();
					limite = estado.ch;
				},
				aoComecar: () => {
					estado.comecou = true;
				}
			});
			estado.cancelar = f.cancelar;
		};
		falarParte(0);
		estado.seguranca = setTimeout(fim, ((c.duracoes[i] / velocidade) * 2.6 + 3) * 1000);
	}

	/** Narração gravada: o relógio da cena segue o áudio (e espera enquanto ele carrega). */
	function relogioGravado(dt: number): number {
		let novo = t + dt * velocidade;
		const n = narrador;
		if (n && narracao && !fimDoAudio && n.usando(urlGrav) && !n.el.paused) {
			const alvo = ENTRADA_AUDIO + n.el.currentTime - (grav?.inicio ?? 0);
			const erro = alvo - novo;
			if (erro > 0.4) novo = alvo;
			else if (erro < -0.4) novo = t;
			else novo += erro * Math.min(1, dt * 4);
			if (novo < t) novo = t;
		}
		return novo;
	}

	/** Voz sintetizada: o relógio persegue a posição estimada da fala. */
	function relogioSintetizado(dt: number, c: Cronograma): number {
		let novo = t;
		if (!corrente || !vozAtiva) return novo + dt * velocidade;
		if (!corrente.comecou && !corrente.terminou && semLista && performance.now() - corrente.inicio > 4000) {
			// Nenhum sinal de fala em 4 s e nenhuma voz listada: o aparelho não tem voz sintetizada.
			vozMuda = true;
			pararFala();
			return novo + dt * velocidade;
		}
		const f = corrente.indice;
		const ini = c.inicios[f];
		const dur = c.duracoes[f];
		const fimFrase = ini + dur;
		if (!corrente.terminou) {
			const agora = performance.now();
			const esperado = dur / velocidade;
			let prog = (agora - corrente.inicio) / 1000 / esperado;
			if (corrente.ch >= 0) {
				const len = Math.max(1, c.frases[f].length);
				const pb = corrente.ch / len + (agora - corrente.quando) / 1000 / esperado;
				prog = Math.max(Math.min(prog, pb + 0.08), pb);
			}
			const alvo = ini + dur * Math.min(0.97, Math.max(0, prog));
			const passo = Math.min((alvo - novo) * Math.min(1, dt * 5), dt * velocidade * 1.8);
			if (passo > 0) novo += passo;
		} else {
			novo += dt * velocidade * (novo < fimFrase - 0.02 ? 1.7 : 1);
			if (novo >= fimFrase) corrente = null;
		}
		return novo;
	}

	/**
	 * Relógio suave: com voz gravada, o tempo da cena segue o áudio; com voz sintetizada, persegue a
	 * posição estimada da fala (pelos limites de palavra, quando o navegador informa, ou pelo tempo
	 * decorrido), sem congelar nem dar saltos.
	 */
	function avancar(dt: number) {
		const c = crono;
		const antes = t;
		t = grav ? relogioGravado(dt) : relogioSintetizado(dt, c);
		if (grav) {
			sincronizarAudio();
			const n = narrador;
			const fala = narracao && !!n && n.usando(urlGrav) && !n.el.paused && t >= (c.inicios[0] ?? 0) - 0.05 && t <= ENTRADA_AUDIO + grav.fim;
			if (fala !== falando) falando = fala;
		} else if (vozAtiva && !corrente) {
			const i = indiceFrase(c, t);
			if (i >= 0 && !faladas.has(i)) iniciarFala(i);
		}
		for (const ev of eventos) if (ev.tempo > antes && ev.tempo <= t) trilha.efeito(ev.nome, ev.dur);
		if (falando !== ultimoFalando) {
			ultimoFalando = falando;
			trilha.ajustarMusica(falando);
		}
		if (t >= c.total) proximaCena(true);
	}

	function quadro(agora: number) {
		const dt = ultimo ? Math.min(0.1, (agora - ultimo) / 1000) : 0;
		ultimo = agora;
		vivo += dt;
		if (tocando) avancar(dt);
		raf = tocando ? requestAnimationFrame(quadro) : 0;
	}

	function rodar() {
		if (!raf) {
			ultimo = 0;
			raf = requestAnimationFrame(quadro);
		}
	}

	function tocar() {
		if (terminou) {
			irParaCena(epIdx, 0, true);
			return;
		}
		if (previa) {
			previa = false;
			t = 0;
			faladas = new Set();
		}
		bloqueado = false;
		// Tudo dentro do toque do aluno: libera o som no iPhone, no iPad e no Android.
		sessaoDeReproducao();
		destravar();
		narrador?.destravar();
		trilha.musicaLigada = musica;
		trilha.iniciar();
		trilha.definirHumor(cena.animada.fundo);
		tocando = true;
		sincronizarAudio(true);
		rodar();
	}

	function pausar() {
		tocando = false;
		if (corrente) {
			// Ao retomar, a frase interrompida recomeça do início.
			faladas.delete(corrente.indice);
			t = crono.inicios[corrente.indice];
		}
		pararFala();
		narrador?.pausar();
		trilha.pausar();
	}

	function alternar() {
		if (tocando) pausar();
		else tocar();
	}

	function irParaCena(e: number, c: number, continuar = tocando) {
		pararFala();
		narrador?.pausar();
		fimDoAudio = false;
		epIdx = e;
		cenaIdx = c;
		calibCena = calib;
		t = 0;
		faladas = new Set();
		terminou = false;
		previa = !continuar;
		if (urlGrav && grav) narrador?.preparar(urlGrav, grav.inicio);
		trilha.definirHumor(episodios[e].cenas[c].animada.fundo);
		if (continuar) {
			tocando = false;
			tocar();
		}
	}

	function proximaCena(automatico = false) {
		if (cenaIdx < ep.cenas.length - 1) irParaCena(epIdx, cenaIdx + 1, automatico ? true : tocando);
		else if (automatico) {
			pararFala();
			narrador?.pausar();
			tocando = false;
			terminou = true;
			trilha.pausar();
		} else if (epIdx < episodios.length - 1) irParaCena(epIdx + 1, 0, tocando);
	}

	function cenaAnterior() {
		if (t > 4 || cenaIdx === 0) irParaCena(epIdx, cenaIdx, tocando);
		else irParaCena(epIdx, cenaIdx - 1, tocando);
	}

	function irPara(alvo: number) {
		pararFala();
		const c = crono;
		let novo = Math.max(0, Math.min(c.total - 0.05, alvo));
		const i = indiceFrase(c, novo);
		if (vozAtiva && i >= 0) novo = c.inicios[i];
		faladas = new Set(Array.from({ length: Math.max(0, i) }, (_, k) => k));
		t = novo;
		previa = false;
		terminou = false;
		fimDoAudio = false;
		sincronizarAudio(true);
	}

	function frasePasso(delta: number) {
		const c = crono;
		if (!c.frases.length) return;
		const i = indiceFrase(c, t);
		const alvo = Math.max(0, Math.min(c.frases.length - 1, i + delta));
		irPara(c.inicios[alvo]);
	}

	function cliqueBarra(ev: MouseEvent) {
		const r = (ev.currentTarget as HTMLElement).getBoundingClientRect();
		irPara(((ev.clientX - r.left) / r.width) * crono.total);
	}

	function teclaBarra(ev: KeyboardEvent) {
		if (ev.key === 'ArrowLeft') {
			ev.preventDefault();
			frasePasso(-1);
		} else if (ev.key === 'ArrowRight') {
			ev.preventDefault();
			frasePasso(1);
		}
	}

	function teclas(ev: KeyboardEvent) {
		mostrarControles();
		const alvo = ev.target as HTMLElement;
		if (ev.key === 'Escape' && modoTela === 'pagina') {
			sairDaTelaDaPagina();
			return;
		}
		if (alvo.closest('select, input, textarea, [role="slider"]')) return;
		const k = ev.key.toLowerCase();
		if (k === ' ' || k === 'k') {
			if (alvo.closest('button')) return;
			ev.preventDefault();
			alternar();
		} else if (k === 'arrowright') frasePasso(1);
		else if (k === 'arrowleft') frasePasso(-1);
		else if (k === 'n') proximaCena();
		else if (k === 'p') cenaAnterior();
		else if (k === 'c') legendas = !legendas;
		else if (k === 'f') void alternarTelaCheia();
	}

	type DocTela = Document & { webkitFullscreenElement?: Element | null; webkitFullscreenEnabled?: boolean; webkitExitFullscreen?: () => void };
	type ElTela = HTMLElement & { webkitRequestFullscreen?: () => void };
	type Orientacao = ScreenOrientation & { lock?: (o: string) => Promise<void> };

	function emTelaCheiaNativa(): boolean {
		const d = document as DocTela;
		return !!(d.fullscreenElement ?? d.webkitFullscreenElement);
	}

	async function alternarTelaCheia() {
		const d = document as DocTela;
		if (modoTela === 'pagina') return sairDaTelaDaPagina();
		if (emTelaCheiaNativa()) {
			try {
				if (d.exitFullscreen) await d.exitFullscreen();
				else d.webkitExitFullscreen?.();
			} catch {
				/* já tinha saído */
			}
			return;
		}
		const el = caixa as ElTela | undefined;
		if (!el) return;
		if ((d.fullscreenEnabled || d.webkitFullscreenEnabled) && (el.requestFullscreen || el.webkitRequestFullscreen)) {
			try {
				if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
				else el.webkitRequestFullscreen?.();
			} catch {
				/* recusada (por exemplo, numa página dentro de outra): vai para a tela cheia da página */
			}
			// O Safari com prefixo não devolve promessa: espera um instante antes de decidir.
			for (let i = 0; i < 8 && !emTelaCheiaNativa(); i++) await new Promise((r) => setTimeout(r, 50));
			if (emTelaCheiaNativa()) {
				// No Android, deita a tela (só funciona em tela cheia nativa; nos outros, ignora).
				(screen.orientation as Orientacao | undefined)?.lock?.('landscape').catch(() => {});
				return;
			}
		}
		entrarNaTelaDaPagina();
	}

	function entrarNaTelaDaPagina() {
		modoTela = 'pagina';
		document.documentElement.classList.add('player-tela-cheia');
		caixa?.focus({ preventScroll: true });
	}

	function sairDaTelaDaPagina() {
		modoTela = '';
		document.documentElement.classList.remove('player-tela-cheia');
	}

	function mostrarControles() {
		controlesVisiveis = true;
		clearTimeout(timerControles);
		if (telaCheia && tocando) timerControles = setTimeout(() => (controlesVisiveis = false), 3000);
	}

	// Ao entrar ou sair da tela cheia e ao tocar ou pausar, os controles reaparecem e o prazo recomeça.
	$effect(() => {
		void telaCheia;
		void tocando;
		mostrarControles();
		return () => clearTimeout(timerControles);
	});

	/** Toque na imagem: com os controles escondidos, o primeiro toque só os mostra. */
	function toqueNaTela() {
		if (controlesOcultos) {
			mostrarControles();
			return;
		}
		alternar();
	}

	function trocarMusica() {
		musica = !musica;
		trilha.musicaLigada = musica;
		trilha.ajustarMusica(falando);
	}

	function trocarNarracao() {
		narracao = !narracao;
		if (!narracao) {
			if (corrente) {
				const f = corrente.indice;
				pararFala();
				faladas.add(f);
			}
		}
		sincronizarAudio(true);
	}

	function trocarVoz(id: string) {
		vozId = id;
		try {
			localStorage.setItem('discursiva:voz', id);
		} catch {
			/* sem armazenamento */
		}
		if (tocando && corrente) {
			const f = corrente.indice;
			pararFala();
			faladas.delete(f);
			t = crono.inicios[f];
		}
	}

	onMount(() => {
		suporteVoz = temVoz();
		ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
		narrador = new Narrador();
		narrador.aoAcabar = () => {
			fimDoAudio = true;
		};
		narrador.aoBloquear = () => {
			if (!tocando) return;
			pausar();
			bloqueado = true;
		};
		narrador.aoFalhar = (url) => {
			// O navegador recusou este arquivo: as cenas dele passam para a linha do tempo da voz
			// sintetizada, recomeçando a frase em que estavam.
			const i = indiceFrase(crono, t);
			const desta = urlGrav === url;
			falhas = [...falhas, url];
			if (!desta) return;
			const c = crono;
			t = i >= 0 ? (c.inicios[Math.min(i, c.inicios.length - 1)] ?? 0) : Math.min(t, 0.8);
			faladas = new Set(Array.from({ length: Math.max(0, i) }, (_, k) => k));
		};
		movimento = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
		let salva = '';
		try {
			salva = localStorage.getItem('discursiva:voz') ?? '';
		} catch {
			salva = '';
		}
		// Modo de quadros (conferência visual e renderização em vídeo): ?quadro na URL.
		if (new URLSearchParams(location.search).has('quadro')) {
			(window as unknown as { __cinema: unknown }).__cinema = {
				ir(e: number, id: string, tempo: number, relogio = tempo) {
					pararFala();
					narrador?.pausar();
					tocando = false;
					epIdx = e;
					cenaIdx = Math.max(0, episodios[e].cenas.findIndex((c) => c.id === id));
					calibCena = 1;
					previa = false;
					t = tempo;
					vivo = relogio;
				},
				duracao: () => crono.total,
				frases: () => crono.frases.length
			};
		}
		const atualizar = () => {
			vozes = vozesPortugues();
			semLista = suporteVoz && totalDeVozes() === 0;
			if (!vozes.find((v) => v.id === vozId)) vozId = vozes.find((v) => v.id === salva)?.id ?? vozes[0]?.id ?? '';
		};
		atualizar();
		const desligar = aoMudarVozes(atualizar);
		const fs = () => {
			if (modoTela === 'pagina') return;
			modoTela = emTelaCheiaNativa() ? 'nativa' : '';
			if (!modoTela) (screen.orientation as (ScreenOrientation & { unlock?: () => void }) | undefined)?.unlock?.();
		};
		document.addEventListener('fullscreenchange', fs);
		document.addEventListener('webkitfullscreenchange', fs);
		const visivel = () => {
			if (document.hidden && tocando) pausar();
		};
		document.addEventListener('visibilitychange', visivel);
		return () => {
			desligar();
			document.removeEventListener('fullscreenchange', fs);
			document.removeEventListener('webkitfullscreenchange', fs);
			document.removeEventListener('visibilitychange', visivel);
			document.documentElement.classList.remove('player-tela-cheia');
		};
	});

	onDestroy(() => {
		if (raf) cancelAnimationFrame(raf);
		pararFala();
		narrador?.encerrar();
		trilha.encerrar();
	});

	const duracaoEp = $derived(duracoes.reduce((s, d) => s + d, 0));
	const decorrido = $derived(duracoes.slice(0, cenaIdx).reduce((s, d) => s + d, 0) + Math.min(t, crono.total));
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="player"
	class:tela-cheia={telaCheia}
	class:pagina={modoTela === 'pagina'}
	class:ocultos={controlesOcultos}
	style:--elevar-legenda="{elevarLegenda}px"
	bind:this={caixa}
	bind:clientHeight={alturaPlayer}
	onkeydown={teclas}
	onpointermove={(e) => {
		if (e.pointerType === 'mouse') mostrarControles();
	}}
	role="region"
	aria-label="Aula animada"
	tabindex="-1"
>
	{#if telaCheia}
		<p class="girar" aria-hidden="true">Gire o aparelho para ver a aula maior</p>
	{/if}
	<div class="tela" bind:clientHeight={alturaTela}>
		<Palco
			cena={cena.animada}
			{crono}
			t={previa ? tPrevia : t}
			{vivo}
			falando={falando || (!vozAtiva && fraseAtual >= 0 && tocando)}
			rotulo={cena.abertura ? undefined : { id: cena.id, titulo: cena.titulo }}
			entrada={cenaIdx > 0 ? (ep.cenas[cenaIdx - 1].animada.transicao ?? 'fade') : 'preto'}
			{movimento}
		/>
		<button class="toque" onclick={toqueNaTela} aria-label={tocando ? 'Pausar' : 'Tocar'} tabindex="-1"></button>
		{#if legendas && legenda && !previa}
			<p class="legenda" aria-live="off">{legenda}</p>
		{/if}
		{#if previa || terminou || bloqueado}
			<div class="capa">
				{#if terminou}
					<p class="eyebrow">Fim do episódio {ep.numero}</p>
					<div class="capa-acoes">
						<button class="btn" onclick={() => irParaCena(epIdx, 0, true)}><Icon name="replay" size={18} /> Assistir de novo</button>
						{#if epIdx < episodios.length - 1}
							<button class="btn primary" onclick={() => irParaCena(epIdx + 1, 0, true)}><Icon name="play" size={18} /> Episódio {episodios[epIdx + 1].numero}</button>
						{/if}
					</div>
				{:else}
					<button class="grande" onclick={tocar}>
						<Icon name="play" size={20} />
						<span>{bloqueado ? 'Toque para continuar com som' : cenaIdx === 0 ? `Assistir ao episódio ${ep.numero}` : `Continuar · cena ${cena.id}`}</span>
					</button>
				{/if}
			</div>
		{/if}
	</div>

	<div class="controles" bind:clientHeight={alturaControles} onfocusin={mostrarControles}>
		<div class="barra-linha">
			<div
				class="barra"
				role="slider"
				tabindex="0"
				aria-label="Posição na cena"
				aria-valuemin={0}
				aria-valuemax={Math.round(crono.total)}
				aria-valuenow={Math.round(t)}
				aria-valuetext="{formatarTempo(t)} de {formatarTempo(crono.total)}"
				onclick={cliqueBarra}
				onkeydown={teclaBarra}
			>
				<span class="cheio" style="width: {Math.min(100, (t / crono.total) * 100)}%"></span>
				{#each crono.inicios as ini, i (i)}
					<span class="marca" style="left: {(ini / crono.total) * 100}%"></span>
				{/each}
			</div>
		</div>
		<div class="botoes">
			<button class="ic" onclick={cenaAnterior} aria-label="Cena anterior" title="Cena anterior (P)"><Icon name="prev" /></button>
			<button class="ic play" onclick={alternar} aria-label={tocando ? 'Pausar' : 'Tocar'} title="Tocar/pausar (espaço)"><Icon name={tocando ? 'pause' : 'play'} /></button>
			<button class="ic" onclick={() => proximaCena()} aria-label="Próxima cena" title="Próxima cena (N)"><Icon name="next" /></button>
			<span class="tempo mono">
				<span class="cena-id">{cena.abertura ? 'Abertura' : `Cena ${cena.id}`}</span>
				{formatarTempo(t)} / {formatarTempo(crono.total)}
				<span class="ep-tempo">· episódio {formatarTempo(decorrido)} / {formatarTempo(duracaoEp)}</span>
			</span>
			<span class="espaco"></span>
			<button class="ic" class:off={!legendas} onclick={() => (legendas = !legendas)} aria-pressed={legendas} aria-label="Legendas" title="Legendas (C)"><Icon name="cc" /></button>
			<button class="ic" class:off={!narracao || (!vozAtiva && !grav)} onclick={trocarNarracao} aria-pressed={narracao} aria-label="Narração por voz" title="Narração por voz"><Icon name="voice" /></button>
			<button class="ic" class:off={!musica} onclick={trocarMusica} aria-pressed={musica} aria-label="Trilha sonora" title="Trilha sonora"><Icon name="music" /></button>
			<label class="vel">
				<span class="sr-only">Velocidade</span>
				<select bind:value={velocidade} aria-label="Velocidade">
					<option value={0.85}>0,85×</option>
					<option value={1}>1×</option>
					<option value={1.15}>1,15×</option>
					<option value={1.3}>1,3×</option>
				</select>
			</label>
			<button
				class="ic"
				onclick={alternarTelaCheia}
				aria-label={telaCheia ? 'Sair da tela cheia' : 'Tela cheia'}
				title={telaCheia ? 'Sair da tela cheia (F)' : 'Tela cheia (F)'}><Icon name={telaCheia ? 'shrink' : 'expand'} /></button
			>
		</div>
	</div>
</div>

<div class="painel">
	<div class="voz">
		{#if gravadas.length && !gravFalhou}
			<p class="small gravada">
				<strong>{vozGravada}</strong> —
				{todasGravadas ? 'esta aula inteira toca' : 'as cenas marcadas com “voz gravada” tocam'} em qualquer aparelho: computador, iPhone, iPad e Android, inclusive com o modo silencioso ligado.
			</p>
		{/if}
		{#if gravFalhou}
			<p class="small muted">Este navegador recusou o áudio gravado; a aula seguiu com a voz sintetizada do aparelho.</p>
		{/if}
		{#if !todasGravadas}
			{#if !suporteVoz}
				<p class="small muted">
					Este navegador não oferece voz sintetizada — é o caso do app do Claude no Android. {gravadas.length && !gravFalhou ? 'As cenas com voz gravada tocam normalmente; nas demais, a' : 'A'} aula segue com legendas. Para ouvir a narração, abra a página no Chrome ou no Safari.
				</p>
			{:else if vozMuda}
				<p class="small muted">A voz sintetizada não respondeu neste aparelho; a aula segue com legendas.</p>
			{:else if vozes.length === 0 && semLista}
				<p class="small muted">O aparelho não informou a lista de vozes; a narração usa a voz padrão do sistema em português.</p>
			{:else if vozes.length === 0}
				<p class="small muted">Nenhuma voz em português foi encontrada neste aparelho. A aula segue com legendas. No Windows, instale “Português (Brasil)” em Configurações › Hora e idioma › Fala.</p>
			{:else}
				<label class="small">
					<strong>{gravadas.length && !gravFalhou ? 'Voz das cenas sem gravação' : 'Voz do professor'}</strong>
					<select value={vozId} onchange={(e) => trocarVoz((e.currentTarget as HTMLSelectElement).value)}>
						{#each vozes as v (v.id)}
							<option value={v.id}>{v.nome} ({v.lang}){v.natural ? ' — neural' : ''}</option>
						{/each}
					</select>
				</label>
				<p class="small muted">A voz sintetizada é a do seu aparelho. As vozes marcadas como “neural” (Edge, Chrome, Safari recentes) soam mais naturais.</p>
			{/if}
			{#if ios && suporteVoz}
				<p class="small muted">No iPhone e no iPad, a voz sintetizada fica muda com o modo silencioso: desligue-o (chave lateral ou Central de Controle) e aumente o volume.</p>
			{/if}
		{/if}
	</div>

	<nav class="episodios" aria-label="Episódios">
		{#each episodios as e, i (e.numero)}
			<button class:atual={i === epIdx} aria-current={i === epIdx ? 'true' : undefined} onclick={() => irParaCena(i, 0, false)}>
				<span class="mono">EP {e.numero}</span>
				<span class="t">{e.titulo}</span>
			</button>
		{/each}
	</nav>

	<ol class="capitulos">
		{#each ep.cenas as c, i (c.id)}
			{#if !c.abertura}
				<li>
					<button class:atual={i === cenaIdx} aria-current={i === cenaIdx ? 'true' : undefined} onclick={() => irParaCena(epIdx, i, tocando)}>
						<span class="num mono">{c.id}</span>
						<span class="t">{c.titulo}</span>
						<span class="d mono">{formatarTempo(duracoes[i])}</span>
						<span class="selos">
							<span class="selo" class:auto={!c.sobMedida}>{c.sobMedida ? 'animação completa' : 'encenação automática'}</span>
							{#if gravacaoTocavel(c)}<span class="selo voz-gravada">voz gravada</span>{/if}
						</span>
					</button>
				</li>
			{/if}
		{/each}
	</ol>

	{#if !cena.abertura}
		<details class="transcricao">
			<summary>Transcrição da narração — cena {cena.id}</summary>
			<p>{cena.narracao.replace(/\*\*/g, '').replace(/\*/g, '')}</p>
		</details>
	{/if}
</div>

<style>
	.player {
		container-type: inline-size;
		background: #000;
		border-radius: var(--radius);
		overflow: hidden;
		box-shadow: var(--shadow-lift);
		outline: none;
	}
	/* Tela cheia (nativa ou da página): a imagem ocupa o maior 16:9 que couber, e os controles ficam
	   sobre ela, no rodapé, sumindo durante a reprodução. */
	.player.tela-cheia {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
		box-sizing: border-box;
		height: 100vh;
		height: 100dvh;
		padding: env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px);
		border-radius: 0;
		box-shadow: none;
	}
	/* Sem a API do navegador (iPhone, app do Claude): o player cobre a janela. */
	.player.pagina {
		position: fixed;
		inset: 0;
		z-index: 1000;
		width: auto;
	}
	:global(html.player-tela-cheia),
	:global(html.player-tela-cheia body) {
		overflow: hidden;
	}
	.tela-cheia .tela {
		width: min(100%, calc((100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)) * 16 / 9));
		width: min(100%, calc((100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)) * 16 / 9));
		margin: 0 auto;
	}
	.tela-cheia .controles {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 1.75rem max(0.6rem, env(safe-area-inset-right, 0px)) max(0.5rem, env(safe-area-inset-bottom, 0px)) max(0.6rem, env(safe-area-inset-left, 0px));
		background: linear-gradient(to bottom, rgb(0 0 0 / 0%), rgb(5 6 12 / 88%) 42%);
		transition: opacity 0.3s;
	}
	.tela-cheia.ocultos .controles {
		opacity: 0;
		pointer-events: none;
	}
	.tela-cheia.ocultos {
		cursor: none;
	}
	.tela-cheia .legenda,
	.tela-cheia .grande {
		bottom: calc(5% + var(--elevar-legenda, 0px));
		transition: bottom 0.3s;
	}
	.girar {
		display: none;
	}
	@media (orientation: portrait) and (max-width: 760px) {
		.tela-cheia .girar {
			display: block;
			position: absolute;
			top: max(1rem, env(safe-area-inset-top, 0px));
			left: 0;
			right: 0;
			margin: 0;
			padding: 0 1rem;
			text-align: center;
			color: #b4bbe0;
			font-size: 0.85rem;
		}
	}
	.tela {
		position: relative;
		container-type: inline-size;
	}
	.toque {
		position: absolute;
		inset: 0;
		border: 0;
		background: transparent;
		cursor: pointer;
	}
	.legenda {
		position: absolute;
		left: 50%;
		bottom: 5%;
		transform: translateX(-50%);
		width: max-content;
		max-width: 86%;
		margin: 0;
		padding: 0.3em 0.7em;
		border-radius: 8px;
		background: rgb(0 0 0 / 72%);
		color: #fff;
		font: 600 max(11px, 2.15cqw) / 1.35 var(--font);
		text-align: center;
		text-wrap: balance;
	}
	.capa {
		position: absolute;
		inset: 0;
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 1rem;
		background: radial-gradient(circle at 50% 55%, rgb(0 0 0 / 0%), rgb(0 0 0 / 45%));
	}
	.capa .eyebrow {
		color: #ffd84d;
		font-size: max(14px, 2cqw);
		margin: 0;
	}
	.capa-acoes {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		justify-content: center;
	}
	.grande {
		position: absolute;
		left: 4%;
		bottom: 5%;
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.6em 1.15em 0.6em 0.85em;
		border-radius: 999px;
		border: 0;
		background: #fffaf0;
		color: #121633;
		font: 800 max(12px, 1.7cqw) / 1 var(--display);
		cursor: pointer;
		box-shadow: 0 10px 40px rgb(0 0 0 / 45%);
		transition: transform 0.15s;
	}
	.grande:hover,
	.grande:focus-visible {
		transform: scale(1.06);
	}
	.controles {
		background: #0d0f17;
		color: #eef0ff;
		padding: 0.35rem 0.6rem 0.5rem;
	}
	.barra {
		position: relative;
		height: 8px;
		border-radius: 999px;
		background: #2a2f45;
		cursor: pointer;
		margin: 0.35rem 0 0.4rem;
	}
	.barra:focus-visible {
		outline: 2px solid #ffd84d;
		outline-offset: 3px;
	}
	.cheio {
		position: absolute;
		inset: 0 auto 0 0;
		border-radius: 999px;
		background: #ffd84d;
	}
	.marca {
		position: absolute;
		top: 1px;
		width: 2px;
		height: 6px;
		background: rgb(255 255 255 / 35%);
	}
	.botoes {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.15rem 0.25rem;
	}
	.ic {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		border: 0;
		border-radius: 10px;
		background: transparent;
		color: inherit;
		cursor: pointer;
	}
	.ic:hover,
	.ic:focus-visible {
		background: #232842;
	}
	.ic.play {
		background: #2f3cd9;
	}
	.ic.off {
		opacity: 0.45;
	}
	.tempo {
		font-size: 0.8rem;
		color: #b4bbe0;
		margin-left: 0.3rem;
	}
	.cena-id {
		color: #ffd84d;
		margin-right: 0.35rem;
	}
	.espaco {
		flex: 1;
	}
	.vel select {
		background: #1b2033;
		color: #eef0ff;
		border: 1px solid #343b5c;
		border-radius: 8px;
		padding: 0.3rem 0.35rem;
		font: inherit;
		font-size: 0.8rem;
	}
	@container (max-width: 560px) {
		.ep-tempo {
			display: none;
		}
	}
	.painel {
		margin-top: 1rem;
		display: grid;
		gap: 0.9rem;
	}
	.voz label {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 0.75rem;
		align-items: center;
	}
	.voz select {
		max-width: 100%;
		min-width: 0;
		flex: 1 1 14rem;
		padding: 0.4rem 0.5rem;
		border-radius: 10px;
		border: 1px solid var(--border-strong);
		background: var(--surface);
		color: var(--text);
		font: inherit;
	}
	.voz p {
		margin: 0.35rem 0 0;
	}
	.episodios {
		display: flex;
		gap: 0.5rem;
		overflow-x: auto;
		padding-bottom: 0.25rem;
	}
	.episodios button {
		flex: 0 0 auto;
		max-width: 15rem;
		display: grid;
		gap: 0.1rem;
		text-align: left;
		padding: 0.55rem 0.8rem;
		border-radius: 12px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
		cursor: pointer;
		font: inherit;
	}
	.episodios button .mono {
		font-size: 0.72rem;
		color: var(--primary);
		font-weight: 700;
	}
	.episodios button .t {
		font-size: 0.85rem;
		font-weight: 600;
		line-height: 1.25;
	}
	.episodios button.atual {
		border-color: var(--primary);
		background: var(--primary-soft);
	}
	.capitulos {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.35rem;
	}
	.capitulos button {
		width: 100%;
		display: grid;
		grid-template-columns: 2.6rem minmax(0, 1fr) auto;
		gap: 0.15rem 0.6rem;
		align-items: baseline;
		text-align: left;
		padding: 0.55rem 0.75rem;
		border-radius: 12px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
		cursor: pointer;
		font: inherit;
	}
	.capitulos button.atual {
		border-color: var(--primary);
		box-shadow: inset 4px 0 0 var(--primary);
	}
	.capitulos .num {
		color: var(--primary);
		font-weight: 700;
		font-size: 0.85rem;
	}
	.capitulos .t {
		font-weight: 600;
		min-width: 0;
	}
	.capitulos .d {
		font-size: 0.78rem;
		color: var(--muted);
	}
	.capitulos .selos {
		grid-column: 2 / -1;
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}
	.capitulos .selo {
		font-size: 0.7rem;
		font-weight: 700;
		padding: 0.05rem 0.5rem;
		border-radius: 999px;
		background: var(--ok-soft);
		color: var(--ok);
	}
	.capitulos .selo.auto {
		background: var(--warn-soft);
		color: var(--warn);
	}
	.capitulos .selo.voz-gravada {
		background: var(--primary-soft);
		color: var(--primary);
	}
	.voz .gravada {
		margin: 0 0 0.35rem;
		padding: 0.55rem 0.75rem;
		border-radius: 10px;
		background: var(--primary-soft);
		line-height: 1.45;
	}
	.transcricao summary {
		cursor: pointer;
		font-weight: 600;
	}
	.transcricao p {
		line-height: 1.6;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}
</style>
