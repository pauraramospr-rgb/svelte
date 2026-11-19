<svelte:options namespace="svg" />

<script lang="ts">
	import dados from '../mapa-americas.json';
	import type { Animacao } from '../tipos';
	import type { Cronograma } from '../tempo';
	import { progresso, suave } from '../tempo';
	import { FONTE, misturar } from '../util';

	/** Mapa político das Américas (Natural Earth 1:50m, domínio público), já projetado no palco 1600×900. */
	let {
		estilo = 'papel',
		paises = {},
		rotulos = [],
		pinta = [],
		cidades = [],
		crono,
		t,
		vivo
	}: {
		estilo?: 'papel' | 'escuro';
		paises?: Record<string, string>;
		rotulos?: { texto: string; x: number; y: number; a: Animacao; cor?: string; tam?: number; carimbo?: boolean }[];
		pinta?: { pais: string; cor: string; a: Animacao }[];
		cidades?: { nome: string; a: Animacao; cor?: string; lado?: 'e' | 'd' }[];
		crono: Cronograma;
		t: number;
		vivo: number;
	} = $props();

	const PAISES = dados.paises as unknown as Record<string, { d: string; c: [number, number] }>;
	const CIDADES = dados.cidades as unknown as Record<string, [number, number]>;
	const base = $derived(estilo === 'escuro' ? '#2c3440' : '#e9dfc8');
	const borda = $derived(estilo === 'escuro' ? '#5d6878' : '#8c7a5b');

	function corDe(codigo: string): string {
		let cor = paises[codigo] ?? base;
		for (const p of pinta) {
			if (p.pais !== codigo) continue;
			const { p: k } = progresso({ ...p.a, dur: p.a.dur ?? 0.9 }, crono, t);
			if (k >= 1) cor = p.cor;
			else if (k > 0) return misturar(cor, p.cor, suave.entradaSaida(k));
		}
		return cor;
	}
</script>

<g class="mapa">
	{#each Object.entries(PAISES) as [codigo, p] (codigo)}
		<path d={p.d} fill={corDe(codigo)} stroke={borda} stroke-width="1.1" stroke-linejoin="round" />
	{/each}

	{#each cidades as c, i (i)}
		{@const pos = CIDADES[c.nome]}
		{@const pr = progresso(c.a, crono, t)}
		{#if pos && pr.visivel}
			{@const k = suave.saida(pr.p) * pr.saida}
			<g transform="translate({pos[0]} {pos[1]})" opacity={k}>
				<circle r={4 + 10 * ((vivo * 0.8 + i * 0.3) % 1)} fill="none" stroke={c.cor ?? '#b3261e'} stroke-width="1.5" opacity={1 - ((vivo * 0.8 + i * 0.3) % 1)} />
				<circle r="4" fill={c.cor ?? '#b3261e'} stroke="#fff" stroke-width="1.2" />
				<text
					x={c.lado === 'e' ? -8 : 8}
					y="4"
					text-anchor={c.lado === 'e' ? 'end' : 'start'}
					font-family={FONTE.corpo}
					font-weight="700"
					font-size="11"
					fill={estilo === 'escuro' ? '#eef0ff' : '#1a1410'}
					stroke={estilo === 'escuro' ? '#1a1f28' : '#f3ead8'}
					stroke-width="3"
					paint-order="stroke">{c.nome}</text
				>
			</g>
		{/if}
	{/each}

	{#each rotulos as r, i (i)}
		{@const pr = progresso(r.a, crono, t)}
		{#if pr.visivel}
			{@const tam = r.tam ?? 22}
			{#if r.carimbo}
				{@const k = suave.saida(Math.min(1, pr.p * 1.6))}
				<g transform="translate({r.x} {r.y}) rotate(-8) scale({1 + (1 - k) * 0.9})" opacity={k * pr.saida}>
					<rect x={-(r.texto.length * tam * 0.34) - 8} y={-tam * 0.9} width={r.texto.length * tam * 0.68 + 16} height={tam * 1.25} rx="4" fill="rgba(255,250,240,0.6)" stroke={r.cor ?? '#b3261e'} stroke-width="2.4" />
					<text text-anchor="middle" y={tam * 0.1} font-family={FONTE.mono} font-weight="700" font-size={tam} fill={r.cor ?? '#b3261e'}>{r.texto}</text>
				</g>
			{:else}
				<text
					x={r.x}
					y={r.y}
					text-anchor="middle"
					font-family={FONTE.display}
					font-weight="800"
					font-size={tam}
					fill={r.cor ?? (estilo === 'escuro' ? '#eef0ff' : '#1a1410')}
					stroke={estilo === 'escuro' ? '#1a1f28' : '#f3ead8'}
					stroke-width={tam / 6}
					paint-order="stroke"
					opacity={suave.saida(pr.p) * pr.saida}>{r.texto}</text
				>
			{/if}
		{/if}
	{/each}
</g>
