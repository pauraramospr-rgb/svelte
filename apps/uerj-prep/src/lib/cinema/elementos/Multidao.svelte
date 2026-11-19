<svelte:options namespace="svg" />

<script lang="ts">
	import { FONTE, sorteio } from '../util';
	import { caberLinha } from '../medida.svelte';

	/** Multidão estilizada: canto inferior esquerdo em (0,0), largura `w`. */
	let {
		w,
		fileiras = 3,
		n,
		marcha = false,
		cores = ['#2f5d8c', '#b5482f', '#e0a33d', '#4b7a4a', '#7b3fa0', '#d9d2c0'],
		placas = [],
		vivo,
		tl
	}: { w: number; fileiras?: number; n?: number; marcha?: boolean; cores?: string[]; placas?: string[]; vivo: number; tl: number } = $props();

	const PELES = ['#8d5a3b', '#c98e62', '#e5b48c', '#a96b45', '#d9a57d', '#6e4429'];
	const porFileira = $derived(n ?? Math.max(4, Math.round(w / 64)));
	const avanco = $derived(marcha ? Math.min(140, tl * 14) : 0);
	const pessoas = $derived.by(() => {
		const lista: { x: number; y: number; esc: number; cor: string; pele: string; placa: string; fase: number }[] = [];
		let placa = 0;
		for (let f = fileiras - 1; f >= 0; f--) {
			for (let i = 0; i < porFileira; i++) {
				const k = f * 100 + i;
				const temPlaca = placas.length > 0 && f === fileiras - 1 && i % 3 === 1;
				lista.push({
					x: (i + 0.5) * (w / porFileira) + (sorteio(k) - 0.5) * 26 + (f % 2) * 18,
					y: -f * 34,
					esc: 1 - f * 0.12,
					cor: cores[Math.floor(sorteio(k + 7) * cores.length)],
					pele: PELES[Math.floor(sorteio(k + 13) * PELES.length)],
					placa: temPlaca ? placas[placa++ % placas.length] : '',
					fase: sorteio(k + 3) * 6
				});
			}
		}
		return lista;
	});
</script>

<g class="multidao" transform="translate({avanco} 0)">
	{#each pessoas as p, i (i)}
		{@const pulo = marcha ? Math.abs(Math.sin(vivo * 5 + p.fase)) * -6 : Math.sin(vivo * 1.5 + p.fase) * -1.5}
		<g transform="translate({p.x} {p.y + pulo}) scale({p.esc})" opacity={0.75 + p.esc * 0.25}>
			{#if p.placa}
				<line x1="22" y1="-120" x2="22" y2="-190" stroke="#6b4a2c" stroke-width="5" />
				<rect x="-48" y="-238" width="140" height="56" rx="5" fill="#fffaf0" stroke="#3a2a1a" stroke-width="2" />
				<text x="22" y="-202" text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size={caberLinha(p.placa, 126, 'display', 22, 800)} fill="#1a1410">{p.placa}</text>
			{/if}
			<path d="M-30,0 L-30,-80 Q-30,-112 0,-114 Q30,-112 30,-80 L30,0 Z" fill={p.cor} />
			<path d="M-30,0 L-30,-80 Q-30,-112 0,-114 Q30,-112 30,-80 L30,0 Z" fill="rgba(0,0,0,0.12)" transform="translate(14 0) scale(0.55 1)" />
			<rect x="-6" y="-124" width="12" height="12" fill={p.pele} />
			<circle cx="0" cy="-140" r="21" fill={p.pele} />
			<path d="M-21,-142 Q-22,-164 0,-164 Q22,-164 21,-142 Q14,-154 0,-154 Q-14,-154 -21,-142 Z" fill="#1f1712" />
			{#if p.placa}
				<rect x="16" y="-124" width="12" height="40" rx="6" fill={p.cor} />
			{/if}
		</g>
	{/each}
</g>
