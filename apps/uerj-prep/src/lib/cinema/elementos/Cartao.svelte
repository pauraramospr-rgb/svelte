<svelte:options namespace="svg" />

<script lang="ts">
	import { FONTE } from '../util';
	import { encaixar, medir } from '../medida.svelte';

	/** Cartão com título e texto que sempre cabem na caixa (a fonte diminui se precisar). */
	let {
		w,
		h,
		titulo,
		texto = '',
		cor = '#2f3cd9',
		icone = '',
		escuro = false,
		citacao = false,
		fonte = ''
	}: { w: number; h: number; titulo: string; texto?: string; cor?: string; icone?: string; escuro?: boolean; citacao?: boolean; fonte?: string } = $props();

	const pad = 30;
	const larg = $derived(w - pad * 2 - 10);
	const icoLarg = $derived(icone ? medir(icone, 'mono', 18, 700) + 16 : 0);
	const tit = $derived(
		citacao
			? encaixar(titulo, larg - 40, h - pad * 2 - (fonte ? 44 : 0), 'serifa', 34, 600, 1.3, 15)
			: encaixar(titulo, larg - icoLarg, texto ? (h - pad * 2) * 0.36 : h - pad * 2, 'display', texto ? 32 : 40, 800, 1.15, 15)
	);
	const corpo = $derived(texto && !citacao ? encaixar(texto, larg, h - pad * 2 - tit.altura - 12, 'corpo', 28, 500, 1.3, 13) : null);
	const fnt = $derived(fonte ? encaixar(fonte, larg - 40, 40, 'corpo', 20, 600, 1.2, 11) : null);
	const fundo = $derived(escuro ? 'rgba(14,18,30,0.9)' : '#fffaf0');
	const tinta = $derived(escuro ? '#f3efe6' : '#1a1410');
	const tinta2 = $derived(escuro ? '#c9cde0' : '#3a3226');
	/** Centraliza verticalmente o bloco de texto. */
	const total = $derived(tit.altura + (corpo ? corpo.altura + 12 : 0) + (fnt ? fnt.altura + 14 : 0));
	const topo = $derived(Math.max(pad, (h - total) / 2));
</script>

<g class="cartao">
	<rect x="8" y="10" width={w} height={h} rx="18" fill="rgba(0,0,0,0.28)" />
	<rect width={w} height={h} rx="18" fill={fundo} />
	<rect width="12" height={h} rx="6" fill={cor} />
	{#if icone}
		<text x={w - pad} y={pad + 16} text-anchor="end" font-family={FONTE.mono} font-weight="700" font-size="18" fill={cor} letter-spacing="2">{icone}</text>
	{/if}
	{#if citacao}
		<text x={pad + 4} y={topo + 44} font-family={FONTE.serifa} font-weight="700" font-size="90" fill={cor} opacity="0.35">“</text>
		{#each tit.linhas as l, i (i)}
			<text x={pad + 44} y={topo + tit.tam * (0.95 + i * 1.3)} font-family={FONTE.serifa} font-style="italic" font-weight="600" font-size={tit.tam} fill={tinta}>{l}</text>
		{/each}
		{#if fnt}
			{#each fnt.linhas as l, i (i)}
				<text x={pad + 44} y={topo + tit.altura + 14 + fnt.tam * (1 + i * 1.2)} font-family={FONTE.corpo} font-weight="600" font-size={fnt.tam} fill={cor}>— {l}</text>
			{/each}
		{/if}
	{:else}
		{#each tit.linhas as l, i (i)}
			<text x={pad + 6} y={topo + tit.tam * (0.9 + i * 1.15)} font-family={FONTE.display} font-weight="800" font-size={tit.tam} fill={tinta}>{l}</text>
		{/each}
		{#if corpo}
			{#each corpo.linhas as l, i (i)}
				<text x={pad + 6} y={topo + tit.altura + 12 + corpo.tam * (0.95 + i * 1.3)} font-family={FONTE.corpo} font-weight="500" font-size={corpo.tam} fill={tinta2}>{l}</text>
			{/each}
		{/if}
	{/if}
</g>
