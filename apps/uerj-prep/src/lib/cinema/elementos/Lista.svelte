<svelte:options namespace="svg" />

<script lang="ts">
	import type { Item } from '../tipos';
	import type { Cronograma } from '../tempo';
	import { clamp01, progresso, suave } from '../tempo';
	import { FONTE } from '../util';
	import { encaixar, fontes, quebrarMedido } from '../medida.svelte';

	/** Lista com título; cada item entra quando é dito. Todo o texto cabe na caixa. */
	let {
		w,
		h,
		titulo = '',
		itens,
		cor = '#2f3cd9',
		escuro = false,
		numerada = false,
		crono,
		t
	}: { w: number; h: number; titulo?: string; itens: Item[]; cor?: string; escuro?: boolean; numerada?: boolean; crono: Cronograma; t: number } = $props();

	const pad = 28;
	const recuo = 46;
	const tit = $derived(titulo ? encaixar(titulo, w - pad * 2, 100, 'display', 38, 800, 1.15, 16) : null);
	const topoItens = $derived(pad + (tit ? tit.altura + 18 : 0));
	/** Maior fonte comum em que todos os itens cabem. */
	const corpo = $derived.by(() => {
		void fontes.versao;
		const disponivel = h - topoItens - pad;
		const larg = w - pad * 2 - recuo;
		for (let tam = 33; tam >= 12; tam -= 1) {
			const linhas = itens.map((it) => quebrarMedido(it.texto, larg, 'corpo', tam, 600));
			const altura = linhas.reduce((s, l) => s + l.length * tam * 1.27, 0) + (itens.length - 1) * tam * 0.55;
			if (altura <= disponivel || tam === 12) return { tam, linhas };
		}
		return { tam: 12, linhas: itens.map((it) => [it.texto]) };
	});
	const posicoes = $derived.by(() => {
		let y = topoItens;
		return corpo.linhas.map((l) => {
			const y0 = y;
			y += l.length * corpo.tam * 1.27 + corpo.tam * 0.55;
			return y0;
		});
	});
	const fundo = $derived(escuro ? 'rgba(14,18,30,0.9)' : '#fffaf0');
	/** Altura real do conteúdo: a caixa encolhe e fica centralizada no espaço reservado. */
	const alturaReal = $derived(Math.min(h, topoItens + corpo.linhas.reduce((s, l) => s + l.length * corpo.tam * 1.27, 0) + (itens.length - 1) * corpo.tam * 0.55 + pad));
	const deslocY = $derived((h - alturaReal) / 2);
	const tinta = $derived(escuro ? '#f3efe6' : '#1a1410');
</script>

<g class="lista" transform="translate(0 {deslocY})">
	<rect x="8" y="10" width={w} height={alturaReal} rx="20" fill="rgba(0,0,0,0.28)" />
	<rect width={w} height={alturaReal} rx="20" fill={fundo} />
	<rect width={w} height="10" rx="5" fill={cor} />
	{#if tit}
		{#each tit.linhas as l, i (i)}
			<text x={pad} y={pad + tit.tam * (0.95 + i * 1.15)} font-family={FONTE.display} font-weight="800" font-size={tit.tam} fill={tinta}>{l}</text>
		{/each}
	{/if}
	{#each itens as it, i (i)}
		{@const pr = progresso(it.a, crono, t)}
		{#if pr.visivel}
			{@const e = suave.saida(pr.p)}
			<g transform="translate({(1 - e) * 26} {posicoes[i]})" opacity={clamp01(pr.p * 1.6) * pr.saida}>
				{#if numerada}
					<circle cx={pad + 15} cy={corpo.tam * 0.6} r={corpo.tam * 0.72} fill={cor} />
					<text x={pad + 15} y={corpo.tam * 0.6 + corpo.tam * 0.36} text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size={corpo.tam * 0.9} fill="#fff">{i + 1}</text>
				{:else}
					<rect x={pad + 6} y={corpo.tam * 0.38} width={corpo.tam * 0.5} height={corpo.tam * 0.5} rx="3" fill={cor} transform="rotate(45 {pad + 6 + corpo.tam * 0.25} {corpo.tam * 0.63})" />
				{/if}
				{#each corpo.linhas[i] as l, j (j)}
					<text x={pad + recuo} y={corpo.tam * (0.95 + j * 1.27)} font-family={FONTE.corpo} font-weight="600" font-size={corpo.tam} fill={tinta}>{l}</text>
				{/each}
			</g>
		{/if}
	{/each}
</g>
