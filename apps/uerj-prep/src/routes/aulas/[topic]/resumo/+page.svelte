<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import MindMap from '$lib/components/MindMap.svelte';
	import { renderDocument } from '$lib/markdown';
	import { splitMapa } from '$lib/mindmap';

	let { data } = $props();

	const partes = $derived(splitMapa(data.resumo.body));
	const doc = $derived(renderDocument(partes.body));
	const sumario = $derived(doc.toc.filter((t) => t.level === 2));
	const palavras = $derived(data.resumo.body.split(/\s+/).length);
	const minutos = $derived(Math.round(palavras / 200));
	const min = (s: number) => Math.max(1, Math.round(s / 60));
</script>

<svelte:head><title>Resumo aprofundado: {data.especial.titulo} · {APP_NAME}</title></svelte:head>

<nav class="crumbs small" aria-label="Caminho">
	<a href="/aulas">Aulas animadas</a> <span aria-hidden="true">›</span>
	<a href="/aulas/{data.especial.id}">{data.especial.titulo}</a> <span aria-hidden="true">›</span>
	<span>Resumo aprofundado</span>
</nav>

<header class="card hero">
	<p class="eyebrow">Série especial · {data.especial.grupo} · resumo aprofundado</p>
	<h1>{data.resumo.title}</h1>
	<div class="meta">
		<CategoryTag category="pedagogica" detail="revisado em {data.resumo.reviewed}" />
		<span class="chip">{palavras.toLocaleString('pt-BR')} palavras · cerca de {minutos} min de leitura</span>
		<span class="chip">{sumario.length} seções</span>
	</div>
	<p class="small muted">
		O mesmo conteúdo da aula animada, em texto, para ler e revisar. Os rótulos separam o que é <strong>oficial</strong> (programa, questões e padrões
		da UERJ), o que é <strong>interpretação historiográfica</strong> e o que é <strong>conexão possível</strong> (hipótese, nunca certeza).
	</p>
	<div class="row">
		{#if data.aula}
			<a class="btn primary" href="/aulas/{data.especial.id}">Assistir à aula: {data.aula.partes} partes · cerca de {min(data.aula.duracaoSeg)} min</a>
		{/if}
		{#each data.relacionados as t (t.id)}<a class="btn" href="/trilha/{t.id}">{t.title}</a>{/each}
	</div>
</header>

<div class="layout">
	<aside class="toc">
		<details open>
			<summary>Sumário</summary>
			<ol>
				{#each sumario as s (s.id)}
					<li><a href="#{s.id}">{s.text}</a></li>
				{/each}
				{#if partes.mapa}<li><a href="#mapa-mental">Mapa mental</a></li>{/if}
				<li><a href="#referencias">Referências</a></li>
			</ol>
		</details>
	</aside>

	<article class="card doc">
		<div class="prose wide">
			<!-- conteúdo sanitizado em renderDocument (HTML bruto escapado, links filtrados) -->
			{@html doc.html}
		</div>
	</article>
</div>

{#if partes.mapa}
	<section class="card largura-total">
		<h2 id="mapa-mental">Mapa mental</h2>
		<p class="small muted">Leia na ordem dos números: do contexto ao legado.</p>
		<MindMap title={data.especial.titulo} markdown={data.resumo.body} />
	</section>
{/if}

<section class="card largura-total">
	<h2 id="referencias">Referências</h2>
	<ul class="small refs">
		{#each data.resumo.references as r, i (i)}
			{@const m = r.match(/^(.*?)(https?:\/\/\S+?)([.;,)]?)$/)}
			<li>{#if m}{m[1]}<a href={m[2]} target="_blank" rel="noopener noreferrer">{m[2].replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</a>{m[3]}{:else}{r}{/if}</li>
		{/each}
	</ul>
</section>

<style>
	.largura-total {
		margin-top: 1.25rem;
	}
	.largura-total h2 {
		margin-top: 0;
		scroll-margin-top: 1rem;
	}
	.crumbs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin-bottom: 0.75rem;
		color: var(--muted);
	}
	.hero h1 {
		margin: 0.2rem 0 0.6rem;
		font-family: var(--display);
		font-size: clamp(1.5rem, 3.5vw, 2.2rem);
		line-height: 1.15;
		text-wrap: balance;
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
		margin-bottom: 0.6rem;
	}
	.chip {
		font-size: 0.78rem;
		font-weight: 600;
		padding: 0.15rem 0.6rem;
		border-radius: 999px;
		background: var(--surface-2);
		color: var(--muted);
	}
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 15rem) minmax(0, 1fr);
		gap: 1.25rem;
		align-items: start;
		margin-top: 1.25rem;
	}
	.toc {
		position: sticky;
		top: 1rem;
		max-height: calc(100vh - 2rem);
		overflow: auto;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 0.75rem 0.9rem;
	}
	.toc summary {
		font-weight: 700;
		cursor: pointer;
	}
	.toc ol {
		list-style: none;
		margin: 0.5rem 0 0;
		padding: 0;
		font-size: 0.85rem;
	}
	.toc li {
		margin: 0.3rem 0;
	}
	.toc a {
		color: var(--text);
		text-decoration: none;
	}
	.toc a:hover {
		color: var(--primary);
		text-decoration: underline;
	}
	.doc {
		min-width: 0;
	}
	.doc :global(.prose.wide) {
		max-width: 80ch;
	}
	.doc :global(h2),
	.doc :global(h3) {
		scroll-margin-top: 1rem;
	}
	.refs {
		padding-left: 1.1rem;
	}
	.refs li {
		margin: 0.25rem 0;
		overflow-wrap: anywhere;
	}
	@media (max-width: 900px) {
		.layout {
			grid-template-columns: minmax(0, 1fr);
		}
		.toc {
			position: static;
			max-height: none;
		}
	}
</style>
