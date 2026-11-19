<svelte:options namespace="svg" />

<script lang="ts">
	import type { Cronograma } from '../tempo';
	import { clamp01, instante, suave } from '../tempo';
	import { FONTE, linhasPara } from '../util';

	/** Balança de ideias com base em (0,0). `pende` diz para que lado ela pende a cada momento. */
	let { esq, dir, pende, crono, t }: { esq: string; dir: string; pende: { s: number; d?: number; lado: -1 | 0 | 1 }[]; crono: Cronograma; t: number } = $props();

	const angulo = $derived.by(() => {
		let atual = 0;
		for (const k of pende) {
			const ini = instante(k, crono);
			if (t < ini) break;
			const p = suave.entradaSaida(clamp01((t - ini) / 1.3));
			atual = atual + (k.lado * 11 - atual) * p;
		}
		return atual;
	});
	const rad = $derived((angulo * Math.PI) / 180);
	const ex = $derived(-230 * Math.cos(rad));
	const ey = $derived(-330 - 230 * Math.sin(rad));
	const dx = $derived(230 * Math.cos(rad));
	const dy = $derived(-330 + 230 * Math.sin(rad));
</script>

{#snippet prato(x: number, y: number, texto: string, cor: string)}
	<g transform="translate({x} {y})">
		<line x1="0" y1="0" x2="-80" y2="120" stroke="#6b5232" stroke-width="3" />
		<line x1="0" y1="0" x2="80" y2="120" stroke="#6b5232" stroke-width="3" />
		<path d="M-110,120 Q0,170 110,120 Z" fill={cor} />
		{#each linhasPara(texto, 210, 26, 'display') as l, i (i)}
			<text x="0" y={196 + i * 30} text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size="26" fill="#fffaf0" stroke="#1a1410" stroke-width="5" paint-order="stroke">{l}</text>
		{/each}
	</g>
{/snippet}

<g class="balanca">
	<path d="M-90,0 L90,0 L40,-30 L-40,-30 Z" fill="#6b5232" />
	<rect x="-10" y="-336" width="20" height="310" fill="#8a6a45" />
	<circle cx="0" cy="-336" r="16" fill="#c9a227" />
	<line x1={ex} y1={ey} x2={dx} y2={dy} stroke="#8a6a45" stroke-width="14" stroke-linecap="round" />
	{@render prato(ex, ey, esq, '#c9a227')}
	{@render prato(dx, dy, dir, '#c9a227')}
</g>
