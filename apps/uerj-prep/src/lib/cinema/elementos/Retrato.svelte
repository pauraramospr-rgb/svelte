<svelte:options namespace="svg" />

<script lang="ts">
	import type { Variante } from '../tipos';
	import { FONTE, linhasPara } from '../util';

	/**
	 * Retrato ilustrado em silhueta, centrado em (0,0). Não imita o rosto de pessoas reais:
	 * só a moldura, a silhueta e o nome, como um cartão de identificação de documentário.
	 */
	let { nome, legenda = '', v }: { nome: string; legenda?: string; v?: Variante } = $props();
	const leg = $derived(linhasPara(legenda, 360, 25, 'corpo'));
</script>

<g class="retrato">
	<ellipse cx="6" cy="10" rx="122" ry="150" fill="rgba(0,0,0,0.35)" />
	<ellipse cx="0" cy="0" rx="120" ry="148" fill="#c9b07a" />
	<ellipse cx="0" cy="0" rx="106" ry="134" fill="url(#cin-retrato)" />
	<clipPath id="cin-oval-{nome.replace(/\W/g, '')}">
		<ellipse cx="0" cy="0" rx="106" ry="134" />
	</clipPath>
	<g clip-path="url(#cin-oval-{nome.replace(/\W/g, '')})" fill="#1d1a17" opacity="0.88">
		<path d="M-110,140 Q-104,58 -40,42 Q0,58 40,42 Q104,58 110,140 Z" />
		<ellipse cx="0" cy="-20" rx="44" ry="54" />
		<rect x="-16" y="22" width="32" height="30" />
		{#if v === 'mulher' || v === 'mae'}
			<path d="M-50,-22 Q-58,-86 0,-88 Q58,-86 50,-22 Q56,30 30,46 Q40,-30 0,-56 Q-40,-30 -30,46 Q-56,30 -50,-22 Z" />
		{:else if v === 'soldado'}
			<path d="M-50,-46 Q-46,-96 0,-98 Q46,-96 50,-46 Z" />
			<rect x="-56" y="-50" width="112" height="10" rx="5" />
		{:else if v === 'religioso'}
			<rect x="-12" y="40" width="24" height="10" fill="#e8e2d4" />
		{/if}
	</g>
	<rect x={-Math.max(160, nome.length * 9.5 + 24)} y="156" width={Math.max(320, nome.length * 19 + 48)} height="60" rx="6" fill="#1a1410" />
	<text x="0" y="196" text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size="31" fill="#f3ead8">{nome}</text>
	{#each leg as l, i (i)}
		<text x="0" y={248 + i * 30} text-anchor="middle" font-family={FONTE.corpo} font-weight="700" font-size="25" fill="#f3ead8" stroke="#1a1410" stroke-width="5" paint-order="stroke">{l}</text>
	{/each}
</g>
