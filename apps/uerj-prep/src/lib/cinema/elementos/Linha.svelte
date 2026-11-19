<svelte:options namespace="svg" />

<script lang="ts">
	import type { Animacao } from '../tipos';
	import type { Cronograma } from '../tempo';
	import { clamp01, progresso, suave } from '../tempo';
	import { FONTE } from '../util';
	import { caberLinha, fontes, quebrarMedido } from '../medida.svelte';

	/** Linha do tempo (horizontal ou vertical). Ano e texto de cada marco sempre cabem no espaço do marco. */
	let {
		w,
		h,
		itens,
		cor = '#fffaf0',
		vertical = false,
		p,
		crono,
		t
	}: { w: number; h: number; itens: { rotulo: string; texto: string; a: Animacao }[]; cor?: string; vertical?: boolean; p: number; crono: Cronograma; t: number } = $props();

	const n = $derived(Math.max(1, itens.length));
	const passo = $derived(vertical ? h / n : w / n);
	/** Fonte do ano: a mesma para todos, a maior que cabe. */
	const tamAno = $derived(Math.min(...itens.map((it) => caberLinha(it.rotulo, vertical ? 118 : passo - 12, 'mono', vertical ? 26 : 30, 700))));
	const corpo = $derived.by(() => {
		void fontes.versao;
		const larg = vertical ? w - 150 : passo - 18;
		const alt = vertical ? passo - 10 : h - 110;
		for (let tam = 23; tam >= 11; tam -= 1) {
			const linhas = itens.map((it) => quebrarMedido(it.texto, larg, 'corpo', tam, 600));
			if (linhas.every((l) => l.length * tam * 1.22 <= alt) || tam === 11) return { tam, linhas };
		}
		return { tam: 11, linhas: itens.map((it) => [it.texto]) };
	});
	const desenho = $derived(suave.entradaSaida(clamp01(p)));
</script>

<g class="linha-tempo">
	{#if vertical}
		<rect x="-14" y="-14" width={w + 28} height={h + 28} rx="18" fill="rgba(14,18,30,0.86)" />
		<line x1="40" y1="0" x2="40" y2={h * desenho} stroke={cor} stroke-width="4" opacity="0.8" />
		{#each itens as it, i (i)}
			{@const ip = progresso(it.a, crono, t)}
			{#if ip.visivel}
				{@const cy = passo * (i + 0.5)}
				{@const blocoAlt = corpo.linhas[i].length * corpo.tam * 1.22}
				<g opacity={clamp01(ip.p * 2) * ip.saida} transform="translate({(1 - suave.saida(ip.p)) * 20} 0)">
					<circle cx="40" {cy} r={10 * suave.elastico(ip.p)} fill="#b3261e" stroke={cor} stroke-width="3" />
					<text x="62" y={cy + tamAno * 0.36} font-family={FONTE.mono} font-weight="700" font-size={tamAno} fill="#ffd84d">{it.rotulo}</text>
					{#each corpo.linhas[i] as l, j (j)}
						<text x="190" y={cy - blocoAlt / 2 + corpo.tam * (0.9 + j * 1.22)} font-family={FONTE.corpo} font-weight="600" font-size={corpo.tam} fill={cor}>{l}</text>
					{/each}
				</g>
			{/if}
		{/each}
	{:else}
		<line x1="0" y1="62" x2={w * desenho} y2="62" stroke={cor} stroke-width="4" opacity="0.85" />
		{#each itens as it, i (i)}
			{@const ip = progresso(it.a, crono, t)}
			{#if ip.visivel}
				{@const cx = passo * (i + 0.5)}
				<g opacity={clamp01(ip.p * 2) * ip.saida}>
					<circle {cx} cy="62" r={11 * suave.elastico(ip.p)} fill="#b3261e" stroke={cor} stroke-width="3" />
					<text x={cx} y="36" text-anchor="middle" font-family={FONTE.mono} font-weight="700" font-size={tamAno} fill={cor}>{it.rotulo}</text>
					{#each corpo.linhas[i] as l, j (j)}
						<text x={cx} y={100 + j * corpo.tam * 1.22} text-anchor="middle" font-family={FONTE.corpo} font-weight="600" font-size={corpo.tam} fill={cor} opacity="0.94">{l}</text>
					{/each}
				</g>
			{/if}
		{/each}
	{/if}
</g>
