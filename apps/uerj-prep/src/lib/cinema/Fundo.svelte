<svelte:options namespace="svg" />

<script lang="ts">
	import type { Fundo } from './tipos';
	import { sorteio } from './util';

	/** Cenário de fundo (desenhado maior que o palco para aguentar o movimento de câmera). */
	let { fundo, vivo }: { fundo: Fundo; vivo: number } = $props();

	const poeira = Array.from({ length: 34 }, (_, i) => ({ x: sorteio(i) * 1800 - 100, y: sorteio(i + 50) * 1000 - 50, r: 1 + sorteio(i + 99) * 2.4, v: 6 + sorteio(i + 7) * 14 }));
	const estrelas = Array.from({ length: 90 }, (_, i) => ({ x: sorteio(i + 3) * 1900 - 150, y: sorteio(i + 300) * 640 - 120, r: 0.6 + sorteio(i + 900) * 1.6, f: sorteio(i + 41) * 6 }));
	const arvores = Array.from({ length: 26 }, (_, i) => ({ x: i * 76 - 180 + sorteio(i) * 40, h: 180 + sorteio(i + 12) * 160, r: 50 + sorteio(i + 33) * 40 }));
	const nuvens = [
		{ x: 120, y: 150, s: 1.2 },
		{ x: 760, y: 90, s: 0.9 },
		{ x: 1250, y: 190, s: 1.4 }
	];
</script>

<g class="fundo">
	{#if fundo === 'arquivo'}
		<rect x="-300" y="-200" width="2200" height="1300" fill="url(#cin-arquivo)" />
		<g opacity="0.08" stroke="#f3ead8" stroke-width="2">
			{#each { length: 14 } as _, i (i)}
				<line x1={-300 + i * 160} y1="-200" x2={-160 + i * 160} y2="1100" />
			{/each}
		</g>
		{#each poeira as p, i (i)}
			<circle cx={p.x + Math.sin(vivo * 0.3 + i) * 18} cy={((p.y - vivo * p.v) % 1100 + 1100) % 1100 - 100} r={p.r} fill="#f8e7c4" opacity={0.18 + 0.12 * Math.sin(vivo + i)} />
		{/each}
	{:else if fundo === 'papel'}
		<rect x="-300" y="-200" width="2200" height="1300" fill="url(#cin-papel)" />
		<g stroke="#b9a983" stroke-width="1.2" opacity="0.35">
			{#each { length: 30 } as _, i (i)}
				<line x1="-300" x2="1900" y1={-160 + i * 44} y2={-160 + i * 44} />
			{/each}
		</g>
		<line x1="140" x2="140" y1="-200" y2="1100" stroke="#d98b8b" stroke-width="2" opacity="0.45" />
	{:else if fundo === 'noite'}
		<rect x="-300" y="-200" width="2200" height="1300" fill="url(#cin-noite)" />
		{#each estrelas as e, i (i)}
			<circle cx={e.x} cy={e.y} r={e.r} fill="#fff" opacity={0.35 + 0.35 * Math.sin(vivo * 1.3 + e.f)} />
		{/each}
		<circle cx="1320" cy="150" r="58" fill="#f4efd9" opacity="0.9" />
		<circle cx="1320" cy="150" r="140" fill="url(#cin-luar)" />
	{:else if fundo === 'mapa'}
		<rect x="-300" y="-200" width="2200" height="1300" fill="url(#cin-oceano)" />
		<g stroke="#9cc3df" stroke-width="1" opacity="0.13">
			{#each { length: 24 } as _, i (i)}
				<line x1={-300 + i * 100} y1="-200" x2={-300 + i * 100} y2="1100" />
			{/each}
			{#each { length: 14 } as _, i (i)}
				<line x1="-300" y1={-200 + i * 100} x2="1900" y2={-200 + i * 100} />
			{/each}
		</g>
	{:else if fundo === 'prancheta'}
		<rect x="-300" y="-200" width="2200" height="1300" fill="url(#cin-prancheta)" />
		<g stroke="#cfe3ff" opacity="0.1">
			{#each { length: 56 } as _, i (i)}
				<line x1={-300 + i * 40} y1="-200" x2={-300 + i * 40} y2="1100" stroke-width={i % 5 === 0 ? 2 : 0.8} />
			{/each}
			{#each { length: 33 } as _, i (i)}
				<line x1="-300" y1={-200 + i * 40} x2="1900" y2={-200 + i * 40} stroke-width={i % 5 === 0 ? 2 : 0.8} />
			{/each}
		</g>
	{:else if fundo === 'lousa'}
		<rect x="-300" y="-200" width="2200" height="1300" fill="#3b2a1c" />
		<rect x="40" y="30" width="1520" height="760" rx="8" fill="url(#cin-lousa)" stroke="#6b4a2c" stroke-width="22" />
		<g opacity="0.06" fill="#fff">
			<ellipse cx="420" cy="300" rx="260" ry="60" />
			<ellipse cx="1150" cy="520" rx="300" ry="70" />
		</g>
		<rect x="20" y="790" width="1560" height="26" rx="5" fill="#5a3d24" />
		<rect x="300" y="784" width="70" height="10" rx="3" fill="#f3efe6" />
		<rect x="390" y="785" width="44" height="9" rx="3" fill="#f0c9c9" />
	{:else if fundo === 'ceu'}
		<rect x="-300" y="-200" width="2200" height="1300" fill="url(#cin-ceu)" />
		<circle cx="1260" cy="220" r="160" fill="url(#cin-sol)" />
		{#each nuvens as n, i (i)}
			<g transform="translate({((n.x + vivo * (8 + i * 3)) % 2100) - 300} {n.y}) scale({n.s})" fill="#fff" opacity="0.85">
				<ellipse cx="0" cy="0" rx="90" ry="34" />
				<ellipse cx="60" cy="-18" rx="64" ry="40" />
				<ellipse cx="-56" cy="-8" rx="52" ry="30" />
			</g>
		{/each}
		<rect x="-300" y="760" width="2200" height="400" fill="#6d8f5a" />
		<rect x="-300" y="760" width="2200" height="10" fill="#5c7c4a" />
	{:else if fundo === 'floresta'}
		<rect x="-300" y="-200" width="2200" height="1300" fill="url(#cin-floresta)" />
		{#each arvores as a, i (i)}
			<g transform="translate({a.x} 900)" opacity={0.55 + (i % 3) * 0.15}>
				<rect x="-7" y={-a.h} width="14" height={a.h} fill="#20301f" />
				<circle cx="0" cy={-a.h} r={a.r} fill={i % 2 ? '#1f4d2b' : '#2a5f36'} />
				<circle cx={-a.r * 0.6} cy={-a.h + 24} r={a.r * 0.7} fill={i % 2 ? '#24573a' : '#1b4426'} />
			</g>
		{/each}
		<rect x="-300" y="860" width="2200" height="300" fill="#16301c" />
	{:else if fundo === 'chumbo'}
		<rect x="-300" y="-200" width="2200" height="1300" fill="url(#cin-chumbo)" />
		<g stroke="#c9d1db" stroke-width="1.4" opacity="0.12">
			{#each { length: 60 } as _, i (i)}
				{@const x = sorteio(i) * 2200 - 300}
				{@const y = ((sorteio(i + 80) * 1300 + vivo * 420) % 1300) - 200}
				<line x1={x} y1={y} x2={x - 10} y2={y + 46} />
			{/each}
		</g>
	{:else if fundo === 'tribunal'}
		<rect x="-300" y="-200" width="2200" height="1300" fill="url(#cin-tribunal)" />
		<g fill="#000" opacity="0.18">
			{#each { length: 12 } as _, i (i)}
				<rect x={-260 + i * 180} y="-200" width="10" height="1300" />
			{/each}
		</g>
		<rect x="-300" y="640" width="2200" height="20" fill="#2a170c" opacity="0.6" />
		<g transform="translate(800 150)" opacity="0.22" stroke="#e8c98f" stroke-width="5" fill="none">
			<circle r="90" />
			<line x1="-60" y1="-20" x2="60" y2="-20" />
			<line x1="0" y1="-60" x2="0" y2="50" />
			<path d="M-60,-20 L-80,20 L-40,20 Z M60,-20 L40,20 L80,20 Z" />
		</g>
	{/if}
</g>
