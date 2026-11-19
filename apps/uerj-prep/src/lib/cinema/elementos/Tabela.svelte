<svelte:options namespace="svg" />

<script lang="ts">
	import type { Animacao } from '../tipos';
	import type { Cronograma } from '../tempo';
	import { clamp01, progresso, suave } from '../tempo';
	import { FONTE } from '../util';
	import { caberLinha, fontes, quebrarMedido } from '../medida.svelte';

	/** Tabela/comparação: as linhas entram quando são ditas; altura das linhas e fonte se ajustam ao espaço. */
	let { w, h = 560, colunas, linhas, crono, t }: { w: number; h?: number; colunas: string[]; linhas: { celulas: string[]; a: Animacao }[]; crono: Cronograma; t: number } = $props();

	const nc = $derived(Math.max(1, colunas.length));
	/** Primeira coluna um pouco mais estreita quando há 3 ou mais colunas (costuma ser o rótulo da linha). */
	const larguras = $derived(nc >= 3 ? [w * 0.24, ...Array(nc - 1).fill((w * 0.76) / (nc - 1))] : Array(nc).fill(w / nc));
	const xs = $derived(larguras.map((_, i) => larguras.slice(0, i).reduce((a, b) => a + b, 0)));
	const tamCab = $derived(Math.min(...colunas.map((c, i) => caberLinha(c, larguras[i] - 20, 'display', 30, 800))));
	const corpo = $derived.by(() => {
		void fontes.versao;
		const disponivel = h - 64 - linhas.length * 8;
		for (let tam = 30; tam >= 11; tam -= 1) {
			const quebras = linhas.map((l) => l.celulas.map((c, i) => quebrarMedido(c, (larguras[i] ?? 100) - 26, 'corpo', tam, 600)));
			const alturas = quebras.map((q) => Math.max(1, ...q.map((c) => c.length)) * tam * 1.24 + 22);
			if (alturas.reduce((a, b) => a + b, 0) <= disponivel || tam === 11) return { tam, quebras, alturas };
		}
		return { tam: 11, quebras: [], alturas: [] };
	});
	const ys = $derived(corpo.alturas.map((_, i) => 64 + corpo.alturas.slice(0, i).reduce((a, b) => a + b + 8, 0)));
</script>

<g class="tabela">
	<rect width={w} height="56" rx="12" fill="#1a1410" />
	{#each colunas as c, i (i)}
		<text x={xs[i] + larguras[i] / 2} y={28 + tamCab * 0.36} text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size={tamCab} fill="#fffaf0">{c}</text>
	{/each}
	{#each linhas as linha, r (r)}
		{@const rp = progresso(linha.a, crono, t)}
		{#if rp.visivel && corpo.quebras[r]}
			<g opacity={clamp01(rp.p * 1.5) * rp.saida} transform="translate({(1 - suave.saida(rp.p)) * -30} {ys[r]})">
				<rect width={w} height={corpo.alturas[r]} rx="12" fill={r % 2 ? '#f3ead8' : '#fffaf0'} />
				{#each corpo.quebras[r] as cel, i (i)}
					{@const bloco = cel.length * corpo.tam * 1.24}
					{#each cel as l, j (j)}
						<text
							x={xs[i] + larguras[i] / 2}
							y={(corpo.alturas[r] - bloco) / 2 + corpo.tam * (0.92 + j * 1.24)}
							text-anchor="middle"
							font-family={FONTE.corpo}
							font-weight={i === 0 ? 800 : 500}
							font-size={corpo.tam}
							fill="#1a1410">{l}</text
						>
					{/each}
				{/each}
			</g>
		{/if}
	{/each}
</g>
