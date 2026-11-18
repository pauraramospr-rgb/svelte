<script lang="ts">
	import { mindMapData } from '$lib/mindmap';

	let { title, markdown }: { title: string; markdown: string } = $props();

	const data = $derived(mindMapData(title, markdown));
	const half = $derived(Math.ceil(data.branches.length / 2));
	const palette = ['var(--c-mat)', 'var(--c-his)', 'var(--c-qui)', 'var(--c-red)', 'var(--c-lpl)', 'var(--c-bio)', 'var(--c-fis)', 'var(--c-geo)', 'var(--c-le)'];
	const color = (i: number) => palette[i % palette.length];

	let root: HTMLDivElement | undefined = $state();
	let core: HTMLDivElement | undefined = $state();
	let cards: HTMLElement[] = $state([]);
	let links = $state<{ d: string; i: number }[]>([]);
	let size = $state({ w: 0, h: 0 });

	function measure() {
		if (!root || !core) return;
		const r = root.getBoundingClientRect();
		const c = core.getBoundingClientRect();
		size = { w: r.width, h: r.height };
		const out: { d: string; i: number }[] = [];
		cards.forEach((el, i) => {
			if (!el) return;
			const k = el.getBoundingClientRect();
			const left = k.right <= c.left;
			const right = k.left >= c.right;
			if (!left && !right) return; // celular: caixas abaixo do centro, sem conectores
			const x1 = (left ? c.left : c.right) - r.left;
			const y1 = c.top + c.height / 2 - r.top;
			const x2 = (left ? k.right + 4 : k.left - 4) - r.left;
			const y2 = k.top + Math.min(28, k.height / 2) - r.top;
			const mx = (x1 + x2) / 2;
			out.push({ d: `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`, i });
		});
		links = out;
	}

	$effect(() => {
		data;
		if (!root) return;
		const ro = new ResizeObserver(() => measure());
		ro.observe(root);
		measure();
		return () => ro.disconnect();
	});
</script>

<div class="mm" bind:this={root}>
	{#if links.length}
		<svg class="links" width={size.w} height={size.h} viewBox="0 0 {size.w} {size.h}" aria-hidden="true">
			<defs>
				{#each palette as c, i (i)}
					<marker id="mm-arrow-{i}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
						<path d="M0,0 L10,5 L0,10 z" fill={c} />
					</marker>
				{/each}
			</defs>
			{#each links as l (l.i)}
				<path d={l.d} fill="none" stroke={color(l.i)} stroke-width="2.2" marker-end="url(#mm-arrow-{l.i % palette.length})" />
			{/each}
		</svg>
	{/if}

	<div class="board" style="--rows:{half}">
		<div class="core" bind:this={core} style="grid-row: 1 / span {half}">
			<strong>{data.center}</strong>
			{#if data.subtitle}<span>{data.subtitle}</span>{/if}
		</div>
		{#each data.branches as b, i (b.label)}
			<section
				class="branch"
				bind:this={cards[i]}
				style="--c:{color(i)}; grid-column:{i < half ? 1 : 3}; grid-row:{i < half ? i + 1 : i - half + 1}"
				aria-label="{i + 1}. {b.label}"
			>
				<h4><span class="n">{i + 1}</span>{b.label}</h4>
				{#if b.lead}<p class="lead">{b.lead}</p>{/if}
				<ul>
					{#each b.items as it, j (j)}
						<li>{#if it.strong}<strong>{it.strong}</strong>{it.sep ?? ': '}{/if}{it.text}</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>

	{#if data.timeline.length}
		<section class="timeline" aria-label="Linha do tempo">
			<h4>Linha do tempo</h4>
			<ol>
				{#each data.timeline as t, i (i)}
					<li><strong>{t.when}</strong><span>{t.what}</span></li>
				{/each}
			</ol>
		</section>
	{/if}

	{#if !data.authored}
		<p class="small muted note">Mapa montado automaticamente a partir das seções do resumo.</p>
	{/if}
</div>

<style>
	.mm {
		position: relative;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--surface);
		padding: 1rem;
	}
	.links {
		position: absolute;
		inset: 0;
		pointer-events: none;
		overflow: visible;
	}
	.board {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(140px, 190px) minmax(0, 1fr);
		grid-template-rows: repeat(var(--rows), auto);
		column-gap: 3.2rem;
		row-gap: 1rem;
		align-items: start;
	}
	.core {
		grid-column: 2;
		align-self: center;
		display: grid;
		gap: 0.3rem;
		text-align: center;
		padding: 1.1rem 0.9rem;
		border-radius: 999px / 60%;
		border: 3px solid var(--primary);
		background: var(--primary-soft);
		box-shadow: var(--shadow);
	}
	.core strong {
		font-size: 1.05rem;
		line-height: 1.25;
		text-transform: uppercase;
		letter-spacing: 0.01em;
	}
	.core span {
		font-size: 0.82rem;
		color: var(--muted);
	}
	.branch {
		border: 2px solid var(--c);
		border-radius: 14px;
		background: color-mix(in srgb, var(--c) 6%, var(--surface));
		padding: 0.6rem 0.8rem 0.7rem;
		min-width: 0;
	}
	.branch h4,
	.timeline h4 {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		margin: 0 0 0.4rem;
		font-size: 0.86rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		color: var(--c, var(--primary));
	}
	.n {
		display: inline-grid;
		place-items: center;
		width: 1.4rem;
		height: 1.4rem;
		border-radius: 50%;
		background: var(--c);
		color: var(--surface);
		font-size: 0.75rem;
		flex: none;
	}
	.lead {
		margin: 0 0 0.4rem;
		font-size: 0.9rem;
		line-height: 1.45;
	}
	.branch ul {
		margin: 0;
		padding-left: 1.05rem;
		font-size: 0.88rem;
		line-height: 1.45;
	}
	.branch li + li {
		margin-top: 0.25rem;
	}
	.timeline {
		position: relative;
		margin-top: 1.2rem;
		border-top: 2px dashed var(--border);
		padding-top: 0.8rem;
	}
	.timeline ol {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr));
		gap: 0.6rem;
		counter-reset: t;
	}
	.timeline li {
		position: relative;
		display: grid;
		gap: 0.15rem;
		font-size: 0.84rem;
		line-height: 1.35;
		border-left: 3px solid var(--primary);
		padding: 0.2rem 0 0.2rem 0.55rem;
	}
	.timeline li strong {
		color: var(--primary);
	}
	.timeline li span::first-letter {
		text-transform: uppercase;
	}
	.note {
		margin: 0.75rem 0 0;
	}
	@media (max-width: 820px) {
		.board {
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: none;
		}
		.core {
			grid-column: 1;
			grid-row: auto !important;
			border-radius: 18px;
		}
		.branch {
			grid-column: 1 !important;
			grid-row: auto !important;
			position: relative;
		}
		.branch::before {
			content: '';
			position: absolute;
			left: 1.2rem;
			top: calc(-1rem - 2px);
			height: 1rem;
			border-left: 2px solid var(--c);
		}
	}
</style>
