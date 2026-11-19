<script lang="ts">
	import { onDestroy, onMount, untrack } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Palco from './Palco.svelte';
	import type { EpisodioTocavel } from './aulas';
	import type { Cronograma } from './tempo';
	import { cronograma, formatarTempo, instante } from './tempo';
	import { Trilha } from './som';
	import { aoMudarVozes, calar, destravar, falar, temVoz, vozesPortugues, type OpcaoVoz } from './voz';

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

	let caixa: HTMLDivElement | undefined = $state();
	let telaCheia = $state(false);

	const ep = $derived(episodios[epIdx]);
	const cena = $derived(ep.cenas[cenaIdx]);
	const crono = $derived.by((): Cronograma => {
		if (cena.abertura || !cena.narracao) return { frases: [], inicios: [], duracoes: [], total: cena.animada.duracao ?? 5 };
		return cronograma(cena.narracao, calibCena);
	});
	const vozAtiva = $derived(narracao && suporteVoz && vozes.length > 0);
	/** Quadro mostrado na prévia: depois da primeira frase (ou o título, na abertura). */
	const tPrevia = $derived((crono.inicios[1] ?? crono.total * 0.55) + 0.6);
	const duracoes = $derived(ep.cenas.map((c) => (c.abertura ? (c.animada.duracao ?? 5) : cronograma(c.narracao, calib).total)));

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
		const estado: Corrente = { indice: i, terminou: false, cancelar: () => {}, inicio: performance.now(), base: 0, ch: -1, quando: 0, seguranca: 0 as unknown as ReturnType<typeof setTimeout> };
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
					estado.ch = estado.base + ch;
					estado.quando = performance.now();
					limite = estado.ch;
				}
			});
			estado.cancelar = f.cancelar;
		};
		falarParte(0);
		estado.seguranca = setTimeout(fim, ((c.duracoes[i] / velocidade) * 2.6 + 3) * 1000);
	}

	/**
	 * Relógio suave: enquanto a voz fala, o tempo da cena persegue a posição estimada da fala
	 * (pelos limites de palavra, quando o navegador informa, ou pelo tempo decorrido), sem congelar nem dar saltos.
	 */
	function avancar(dt: number) {
		const c = crono;
		const antes = t;
		let novo = t;
		if (corrente && vozAtiva) {
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
		} else novo += dt * velocidade;
		t = novo;
		if (vozAtiva && !corrente) {
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
		destravar();
		trilha.musicaLigada = musica;
		trilha.iniciar();
		trilha.definirHumor(cena.animada.fundo);
		tocando = true;
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
		trilha.pausar();
	}

	function alternar() {
		if (tocando) pausar();
		else tocar();
	}

	function irParaCena(e: number, c: number, continuar = tocando) {
		pararFala();
		epIdx = e;
		cenaIdx = c;
		calibCena = calib;
		t = 0;
		faladas = new Set();
		terminou = false;
		previa = !continuar;
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
		const alvo = ev.target as HTMLElement;
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

	async function alternarTelaCheia() {
		try {
			if (document.fullscreenElement) await document.exitFullscreen();
			else await caixa?.requestFullscreen?.();
		} catch {
			/* tela cheia indisponível neste aparelho */
		}
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
			if (!vozes.find((v) => v.id === vozId)) vozId = vozes.find((v) => v.id === salva)?.id ?? vozes[0]?.id ?? '';
		};
		atualizar();
		const desligar = aoMudarVozes(atualizar);
		const fs = () => (telaCheia = !!document.fullscreenElement);
		document.addEventListener('fullscreenchange', fs);
		const visivel = () => {
			if (document.hidden && tocando) pausar();
		};
		document.addEventListener('visibilitychange', visivel);
		return () => {
			desligar();
			document.removeEventListener('fullscreenchange', fs);
			document.removeEventListener('visibilitychange', visivel);
		};
	});

	onDestroy(() => {
		if (raf) cancelAnimationFrame(raf);
		pararFala();
		trilha.encerrar();
	});

	const duracaoEp = $derived(duracoes.reduce((s, d) => s + d, 0));
	const decorrido = $derived(duracoes.slice(0, cenaIdx).reduce((s, d) => s + d, 0) + Math.min(t, crono.total));
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div class="player" class:tela-cheia={telaCheia} bind:this={caixa} onkeydown={teclas} role="region" aria-label="Aula animada" tabindex="-1">
	<div class="tela">
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
		<button class="toque" onclick={alternar} aria-label={tocando ? 'Pausar' : 'Tocar'} tabindex="-1"></button>
		{#if legendas && legenda && !previa}
			<p class="legenda" aria-live="off">{legenda}</p>
		{/if}
		{#if previa || terminou}
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
						<span>{cenaIdx === 0 ? `Assistir ao episódio ${ep.numero}` : `Continuar · cena ${cena.id}`}</span>
					</button>
				{/if}
			</div>
		{/if}
	</div>

	<div class="controles">
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
			<button class="ic" class:off={!narracao || !vozAtiva} onclick={trocarNarracao} aria-pressed={narracao} aria-label="Narração por voz" title="Narração por voz"><Icon name="voice" /></button>
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
			<button class="ic" onclick={alternarTelaCheia} aria-label="Tela cheia" title="Tela cheia (F)"><Icon name="expand" /></button>
		</div>
	</div>
</div>

<div class="painel">
	<div class="voz">
		{#if !suporteVoz}
			<p class="small muted">Este navegador não oferece voz sintetizada. A aula segue com legendas; tente o Chrome, o Edge ou o Safari para ouvir a narração.</p>
		{:else if vozes.length === 0}
			<p class="small muted">Nenhuma voz em português foi encontrada neste aparelho. A aula segue com legendas. No Windows, instale “Português (Brasil)” em Configurações › Hora e idioma › Fala.</p>
		{:else}
			<label class="small">
				<strong>Voz do professor</strong>
				<select value={vozId} onchange={(e) => trocarVoz((e.currentTarget as HTMLSelectElement).value)}>
					{#each vozes as v (v.id)}
						<option value={v.id}>{v.nome} ({v.lang}){v.natural ? ' — neural' : ''}</option>
					{/each}
				</select>
			</label>
			<p class="small muted">A voz é a do seu aparelho. As vozes marcadas como “neural” (Edge, Chrome, Safari recentes) soam mais naturais.</p>
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
						<span class="selo" class:auto={!c.sobMedida}>{c.sobMedida ? 'animação completa' : 'encenação automática'}</span>
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
	.player.tela-cheia {
		display: flex;
		flex-direction: column;
		justify-content: center;
		border-radius: 0;
		height: 100vh;
	}
	.tela-cheia .tela {
		width: min(100%, calc((100vh - 96px) * 16 / 9));
		margin: 0 auto;
	}
	.tela {
		position: relative;
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
	.capitulos .selo {
		grid-column: 2 / -1;
		justify-self: start;
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
