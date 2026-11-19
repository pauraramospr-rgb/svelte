<svelte:options namespace="svg" />

<script lang="ts">
	import { FONTE, sorteio } from '../util';
	import { encaixar, fontes, quebrarMedido } from '../medida.svelte';

	/**
	 * Folha de documento centrada em (0,0). `linhas` são datilografadas quando `digitar` está ligado;
	 * `barras` desenham linhas cinzentas no lugar de texto que não reproduzimos (só citamos o que foi conferido).
	 */
	let {
		titulo = '',
		linhas = [],
		barras = 0,
		destaque = '',
		w,
		h,
		p = 1,
		digitar = false,
		vivo,
		semente = 0,
		tam = 24
	}: { titulo?: string; linhas?: string[]; barras?: number; destaque?: string; w: number; h: number; p?: number; digitar?: boolean; vivo: number; semente?: number; tam?: number } = $props();

	/** Fonte das linhas: a maior (até `tam`) em que o texto e as barras cabem na folha. */
	const tamLinha = $derived.by(() => {
		void fontes.versao;
		const disponivel = h - (titulo ? 110 : 64) - 40 - (destaque ? 120 : 0);
		for (let k = tam; k >= 12; k -= 1) {
			const n = linhas.reduce((s, l) => s + (l === '' ? 1 : quebrarMedido(l, w - 90, 'maquina', k, 700).length), 0) + barras;
			if (n * k * 1.45 <= disponivel || k === 12) return k;
		}
		return 12;
	});
	const quebradas = $derived(linhas.flatMap((l) => (l === '' ? [''] : quebrarMedido(l, w - 90, 'maquina', tamLinha, 700))));
	const total = $derived(quebradas.reduce((s, l) => s + l.length, 0));
	const mostrar = $derived(digitar ? Math.floor(total * Math.min(1, p / 0.8)) : total);
	const visiveis = $derived.by(() => {
		let resto = mostrar;
		return quebradas.map((l) => {
			const n = Math.max(0, Math.min(l.length, resto));
			resto -= l.length;
			return l.slice(0, n);
		});
	});
	const topoTexto = $derived(-h / 2 + (titulo ? 110 : 64));
	const destaqueEnc = $derived(encaixar(destaque, w - 120, 130, 'serifa', 27, 700, 1.33, 13));
	const destaqueLinhas = $derived(destaqueEnc.linhas);
	const tamDestaque = $derived(destaqueEnc.tam);
	const marca = $derived(digitar ? Math.min(1, Math.max(0, (p - 0.8) / 0.2)) : Math.min(1, p * 1.4));
</script>

<g class="doc">
	<rect x={-w / 2 + 10} y={-h / 2 + 14} width={w} height={h} fill="rgba(0,0,0,0.35)" />
	<path d="M{-w / 2},{-h / 2} H{w / 2 - 40} L{w / 2},{-h / 2 + 40} V{h / 2} H{-w / 2} Z" fill="url(#cin-folha)" stroke="#c9b991" stroke-width="1.5" />
	<path d="M{w / 2 - 40},{-h / 2} L{w / 2 - 40},{-h / 2 + 40} L{w / 2},{-h / 2 + 40} Z" fill="#d8c79f" />
	{#if titulo}
		<text x="0" y={-h / 2 + 66} text-anchor="middle" font-family={FONTE.serifa} font-weight="700" font-size="30" letter-spacing="3" fill="#2a2016">{titulo}</text>
		<line x1={-w / 2 + 60} x2={w / 2 - 60} y1={-h / 2 + 84} y2={-h / 2 + 84} stroke="#2a2016" stroke-width="1.5" opacity="0.6" />
	{/if}
	{#each visiveis as l, i (i)}
		<text x={-w / 2 + 45} y={topoTexto + i * (tamLinha * 1.45)} font-family={FONTE.maquina} font-weight="700" font-size={tamLinha} fill="#2a2016" opacity="0.92">{l}</text>
	{/each}
	{#if digitar && mostrar < total}
		{@const li = visiveis.findIndex((l, i) => l.length < quebradas[i].length)}
		{#if li >= 0 && Math.floor(vivo * 3) % 2 === 0}
			<rect x={-w / 2 + 45 + visiveis[li].length * tamLinha * 0.6} y={topoTexto + li * (tamLinha * 1.45) - tamLinha * 0.8} width={tamLinha * 0.55} height={tamLinha} fill="#2a2016" opacity="0.7" />
		{/if}
	{/if}
	{#each { length: barras } as _, i (i)}
		<rect x={-w / 2 + 45} y={topoTexto + (quebradas.length + i) * (tamLinha * 1.45) - 14} width={(w - 90) * (0.55 + 0.45 * sorteio(i + semente * 31))} height="11" rx="3" fill="#b9ab88" opacity="0.7" />
	{/each}
	{#if destaque && marca > 0}
		{@const y0 = Math.min(h / 2 - 30 - (destaqueLinhas.length - 1) * tamDestaque * 1.33, topoTexto + (quebradas.length + barras) * (tamLinha * 1.45) + 30)}
		{#each destaqueLinhas as l, i (i)}
			<rect x={-w / 2 + 50} y={y0 + i * tamDestaque * 1.33 - tamDestaque} width={(w - 100) * marca} height={tamDestaque * 1.3} fill="#ffd84d" opacity="0.85" />
			<text x={-w / 2 + 58} y={y0 + i * tamDestaque * 1.33} font-family={FONTE.serifa} font-weight="700" font-size={tamDestaque} fill="#1a1410" opacity={Math.min(1, marca * 2)}>{l}</text>
		{/each}
	{/if}
</g>
