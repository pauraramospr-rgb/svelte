<script lang="ts">
	import { buildMindMap, layoutMindMap, edgePath } from '$lib/mindmap';

	let { title, markdown }: { title: string; markdown: string } = $props();

	const tree = $derived(buildMindMap(title, markdown));
	const layout = $derived(layoutMindMap(tree));
	const palette = ['var(--c-mat)', 'var(--c-lpl)', 'var(--c-qui)', 'var(--c-his)', 'var(--c-red)', 'var(--c-fis)', 'var(--c-bio)', 'var(--c-le)', 'var(--c-geo)'];
	const color = (b: number) => (b < 0 ? 'var(--primary)' : palette[b % palette.length]);
	let fit = $state(true);
</script>

<div class="mm">
	<div class="row tools">
		<button class="btn small" class:primary={fit} onclick={() => (fit = true)} aria-pressed={fit}>Ajustar à tela</button>
		<button class="btn small" class:primary={!fit} onclick={() => (fit = false)} aria-pressed={!fit}>Tamanho real (rolar)</button>
		<span class="small muted">{tree.children.length} ramos · {tree.children.reduce((a, c) => a + c.children.length, 0)} tópicos</span>
	</div>
	<div class="canvas" class:fit>
		<svg
			viewBox="0 0 {layout.width} {layout.height}"
			width={fit ? '100%' : layout.width}
			height={fit ? undefined : layout.height}
			role="img"
			aria-label="Mapa mental: {tree.label}. Ramos: {tree.children.map((c) => c.label).join('; ')}"
		>
			{#each layout.edges as e, i (i)}
				<path d={edgePath(e)} fill="none" stroke={color(e.branch)} stroke-width="2" stroke-opacity="0.55" />
			{/each}
			{#each layout.nodes as n, i (i)}
				<g transform="translate({n.x},{n.y})">
					<rect
						width={n.w}
						height={n.h}
						rx={n.level === 2 ? 8 : 12}
						fill={n.level === 0 ? 'var(--primary)' : n.level === 1 ? 'var(--surface)' : 'var(--surface-2)'}
						stroke={color(n.branch)}
						stroke-width={n.level === 1 ? 2.5 : 1}
					/>
					{#each n.lines as line, j (j)}
						<text
							x={n.w / 2}
							y={8 + 12 + j * 16}
							text-anchor="middle"
							font-size={n.level === 0 ? 14 : n.level === 1 ? 13 : 12}
							font-weight={n.level < 2 ? 700 : 400}
							fill={n.level === 0 ? 'var(--primary-contrast)' : 'var(--text)'}>{line}</text
						>
					{/each}
				</g>
			{/each}
		</svg>
	</div>
	<details class="small outline">
		<summary>Ver o mapa como lista (leitores de tela e impressão)</summary>
		<ul>
			{#each tree.children as b (b.label)}
				<li><strong>{b.label}</strong>{#if b.children.length}<ul>{#each b.children as c (c.label)}<li>{c.label}</li>{/each}</ul>{/if}</li>
			{/each}
		</ul>
	</details>
</div>

<style>
	.tools {
		margin-bottom: 0.5rem;
	}
	.canvas {
		overflow: auto;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--bg);
		padding: 0.5rem;
		max-height: 80vh;
	}
	.canvas.fit {
		max-height: none;
	}
	svg {
		display: block;
		font-family: var(--font);
	}
	.outline {
		margin-top: 0.5rem;
	}
</style>
