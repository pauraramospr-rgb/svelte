<svelte:options namespace="svg" />

<script lang="ts">
	import type { Variante } from '../tipos';
	import { FONTE } from '../util';
	import { caberLinha, encaixar } from '../medida.svelte';

	/**
	 * Retrato ilustrado em silhueta, centrado em (0,0). Não imita o rosto de pessoas reais:
	 * só a moldura, a silhueta e o nome, como um cartão de identificação de documentário.
	 */
	let { nome, legenda = '', v }: { nome: string; legenda?: string; v?: Variante } = $props();
	const tamNome = $derived(caberLinha(nome, 300, 'display', 31, 800));
	const leg = $derived(encaixar(legenda, 360, 96, 'corpo', 25, 700, 1.2, 12));
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
	<rect x="-170" y="156" width="340" height="60" rx="6" fill="#1a1410" />
	<text x="0" y={186 + tamNome * 0.36} text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size={tamNome} fill="#f3ead8">{nome}</text>
	{#if legenda}
		<rect x="-190" y="224" width="380" height={leg.altura + 18} rx="8" fill="rgba(26,20,16,0.82)" />
		{#each leg.linhas as l, i (i)}
			<text x="0" y={232 + leg.tam * (0.95 + i * 1.2)} text-anchor="middle" font-family={FONTE.corpo} font-weight="700" font-size={leg.tam} fill="#f3ead8">{l}</text>
		{/each}
	{/if}
</g>
