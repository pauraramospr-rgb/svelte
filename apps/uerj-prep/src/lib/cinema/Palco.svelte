<script lang="ts">
	import type { CenaAnimada } from './tipos';
	import { ALTURA, LARGURA } from './tipos';
	import type { Cronograma } from './tempo';
	import { cameraEm, clamp01 } from './tempo';
	import { FONTE } from './util';
	import Fundo from './Fundo.svelte';
	import Elemento from './Elemento.svelte';

	/**
	 * Palco 1600×900 de uma cena animada. Tudo é função de `t` (tempo da narração) e de `vivo`
	 * (relógio contínuo para respiração, piscadas, fumaça e outros movimentos de fundo).
	 */
	let {
		cena,
		crono,
		t,
		vivo,
		falando = false,
		rotulo,
		entrada = 'fade',
		movimento = true
	}: {
		cena: CenaAnimada;
		crono: Cronograma;
		t: number;
		vivo: number;
		falando?: boolean;
		rotulo?: { id: string; titulo: string };
		entrada?: 'fade' | 'preto' | 'clarao' | 'corte';
		movimento?: boolean;
	} = $props();


	const cam = $derived.by(() => {
		const c = cameraEm(cena.camera, crono, t);
		if (!cena.camera?.length && movimento) c.z *= 1 + 0.035 * clamp01(t / Math.max(1, crono.total));
		return c;
	});
	const camTransform = $derived(`translate(${LARGURA / 2} ${ALTURA / 2}) scale(${cam.z}) translate(${-cam.x} ${-cam.y})`);
	const par = 0.35;
	const fundoTransform = $derived(
		`translate(${LARGURA / 2} ${ALTURA / 2}) scale(${1 + (cam.z - 1) * par}) translate(${-(800 + (cam.x - 800) * par)} ${-(450 + (cam.y - 450) * par)})`
	);

	const noCamera = $derived(cena.elementos.map((el, i) => ({ el, i })).filter((x) => !x.el.fixo && x.el.k !== 'sombra'));
	const fixos = $derived(cena.elementos.map((el, i) => ({ el, i })).filter((x) => x.el.fixo || x.el.k === 'sombra'));

	const veu = $derived.by(() => {
		const ini = entrada === 'corte' ? 0 : 1 - clamp01(t / (entrada === 'clarao' ? 0.5 : 0.45));
		const sai = cena.transicao === 'corte' ? 0 : 1 - clamp01((crono.total - t) / (cena.transicao === 'preto' ? 0.9 : 0.55));
		return { opac: Math.max(ini, sai), cor: (sai > ini ? cena.transicao : entrada) === 'clarao' ? '#fffaf0' : '#000' };
	});
	const rot = $derived.by(() => {
		if (!rotulo) return 0;
		return clamp01((t - 0.5) / 0.6) * (1 - clamp01((t - 5.2) / 0.8));
	});
</script>

<svg class="palco" viewBox="0 0 {LARGURA} {ALTURA}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label={rotulo?.titulo ?? 'Cena animada'}>
	<defs>
		<radialGradient id="cin-arquivo" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#5b4330" /><stop offset="0.6" stop-color="#3a2a1d" /><stop offset="1" stop-color="#1a120c" /></radialGradient>
		<linearGradient id="cin-papel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6efdf" /><stop offset="1" stop-color="#e9dcc0" /></linearGradient>
		<linearGradient id="cin-noite" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#060914" /><stop offset="0.7" stop-color="#141d40" /><stop offset="1" stop-color="#26305a" /></linearGradient>
		<radialGradient id="cin-luar"><stop offset="0" stop-color="#f4efd9" stop-opacity="0.35" /><stop offset="1" stop-color="#f4efd9" stop-opacity="0" /></radialGradient>
		<radialGradient id="cin-oceano" cx="60%" cy="50%" r="80%"><stop offset="0" stop-color="#1b4a6b" /><stop offset="1" stop-color="#0a1f30" /></radialGradient>
		<linearGradient id="cin-prancheta" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#123a6b" /><stop offset="1" stop-color="#0b2547" /></linearGradient>
		<radialGradient id="cin-lousa" cx="50%" cy="40%" r="80%"><stop offset="0" stop-color="#2f4a3c" /><stop offset="1" stop-color="#18261f" /></radialGradient>
		<linearGradient id="cin-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d9bd6" /><stop offset="0.75" stop-color="#bcd8ee" /><stop offset="1" stop-color="#f6d9a8" /></linearGradient>
		<radialGradient id="cin-sol"><stop offset="0" stop-color="#fff6d0" /><stop offset="0.35" stop-color="#ffe08a" stop-opacity="0.8" /><stop offset="1" stop-color="#ffe08a" stop-opacity="0" /></radialGradient>
		<linearGradient id="cin-floresta" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fc7a2" /><stop offset="0.6" stop-color="#3f7a4f" /><stop offset="1" stop-color="#1b3a24" /></linearGradient>
		<linearGradient id="cin-chumbo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22262d" /><stop offset="1" stop-color="#4b525c" /></linearGradient>
		<linearGradient id="cin-tribunal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a170c" /><stop offset="0.7" stop-color="#5a3a24" /><stop offset="1" stop-color="#3b2416" /></linearGradient>
		<linearGradient id="cin-mar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fc1e3" /><stop offset="0.42" stop-color="#d6e9f2" /><stop offset="0.45" stop-color="#2f6f9a" /><stop offset="1" stop-color="#123a56" /></linearGradient>
		<linearGradient id="cin-cidade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2b880" /><stop offset="0.7" stop-color="#e98a6a" /><stop offset="1" stop-color="#7a4a5a" /></linearGradient>
		<linearGradient id="cin-campo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9cc8e8" /><stop offset="0.55" stop-color="#e8f0d8" /><stop offset="0.56" stop-color="#8fb35a" /><stop offset="1" stop-color="#5f8a3a" /></linearGradient>
		<linearGradient id="cin-palacio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a1f2a" /><stop offset="0.75" stop-color="#7a3a3a" /><stop offset="1" stop-color="#3a1a14" /></linearGradient>
		<linearGradient id="cin-folha" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbf5e6" /><stop offset="1" stop-color="#eadcb9" /></linearGradient>
		<radialGradient id="cin-retrato" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="#e6d6b0" /><stop offset="1" stop-color="#a68f62" /></radialGradient>
		<radialGradient id="cin-tela" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#9fe0c8" /><stop offset="1" stop-color="#1c3a33" /></radialGradient>
		<radialGradient id="cin-brilho"><stop offset="0" stop-color="#fff3c4" stop-opacity="0.9" /><stop offset="1" stop-color="#ffd84d" stop-opacity="0" /></radialGradient>
		<radialGradient id="cin-vinheta" cx="50%" cy="50%" r="75%"><stop offset="0.55" stop-color="#000" stop-opacity="0" /><stop offset="1" stop-color="#000" stop-opacity="0.55" /></radialGradient>
	</defs>

	<rect width={LARGURA} height={ALTURA} fill="#000" />
	<g transform={fundoTransform}><Fundo fundo={cena.fundo} {vivo} /></g>
	<g transform={camTransform}>
		{#each noCamera as { el, i } (i)}
			<Elemento {el} {crono} {t} {vivo} {falando} indice={i} {cam} />
		{/each}
	</g>
	{#each fixos as { el, i } (i)}
		<Elemento {el} {crono} {t} {vivo} {falando} indice={i} />
	{/each}

	{#if rotulo && rot > 0}
		<g opacity={rot} transform="translate({60 - (1 - rot) * 30} 86)">
			<rect x="-4" y="-38" width="6" height="64" fill="#ffd84d" />
			<text x="18" y="-14" font-family={FONTE.mono} font-weight="700" font-size="17" letter-spacing="3" fill="#ffd84d">CENA {rotulo.id}</text>
			<text x="18" y="16" font-family={FONTE.display} font-weight="800" font-size="27" fill="#fffaf0" stroke="#000" stroke-opacity="0.35" stroke-width="5" paint-order="stroke">{rotulo.titulo}</text>
		</g>
	{/if}

	<rect width={LARGURA} height={ALTURA} fill="url(#cin-vinheta)" pointer-events="none" />
	{#if veu.opac > 0.001}
		<rect width={LARGURA} height={ALTURA} fill={veu.cor} opacity={veu.opac} />
	{/if}
</svg>

<style>
	.palco {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 16 / 9;
		background: #000;
		user-select: none;
	}
</style>
