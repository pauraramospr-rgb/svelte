<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import MindMap from '$lib/components/MindMap.svelte';
	import { renderDocument } from '$lib/markdown';
	import { splitMapa } from '$lib/mindmap';
	import { formatarDuracao } from '$lib/producao';

	let { data } = $props();

	const partes = $derived(splitMapa(data.apostila.body));
	const doc = $derived(renderDocument(partes.body));
	const sumario = $derived(doc.toc.filter((t) => t.level === 2 || (t.level === 3 && /^Parte /.test(t.text))));
	const palavras = $derived(data.apostila.body.split(/\s+/).length);
	const minutos = $derived(Math.round(palavras / 200));
	const titulo = $derived(data.apostila.title.replace(/\s+—\s+apostila completa$/i, ''));
</script>

<svelte:head><title>Apostila: {data.topic.title} · {APP_NAME}</title></svelte:head>

<nav class="crumbs small" aria-label="Caminho">
	<a href="/trilha">Minha trilha</a> <span aria-hidden="true">›</span>
	<a href="/trilha/{data.topic.id}">{data.topic.title}</a> <span aria-hidden="true">›</span>
	<span>Apostila completa</span>
</nav>

<header class="card hero">
	<p class="eyebrow">Apostila completa · nível 3</p>
	<h1>{titulo}</h1>
	<div class="meta">
		<CategoryTag category="pedagogica" detail="revisada em {data.apostila.reviewed}" />
		<span class="chip">{palavras.toLocaleString('pt-BR')} palavras · cerca de {minutos} min de leitura</span>
		<span class="chip">{sumario.filter((s) => s.level === 2).length} seções</span>
	</div>
	<p class="small muted">
		Material aprofundado, ancorado no programa oficial e nas questões da UERJ. Rótulos no texto separam o que é <strong>oficial</strong>, o que
		<strong>já foi cobrado</strong>, os <strong>aprofundamentos</strong> e as <strong>conexões possíveis</strong> (hipóteses, nunca certezas).
	</p>
	<div class="row">
		<a class="btn" href="/trilha/{data.topic.id}">Voltar ao tópico</a>
		{#if data.aula}
			<a class="btn primary" href="/estudio/{data.topic.id}">Aula animada: {data.aula.episodios} episódios · {formatarDuracao(data.aula.duracaoSeg)}</a>
		{/if}
	</div>
</header>

<div class="layout">
	<aside class="toc">
		<details open>
			<summary>Sumário</summary>
			<ol>
				{#each sumario as s (s.id)}
					<li class:sub={s.level === 3}><a href="#{s.id}">{s.text}</a></li>
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

		{#if partes.mapa}
			<h2 id="mapa-mental">Mapa mental</h2>
			<p class="small muted">Leia na ordem dos números: do contexto ao presente.</p>
			<MindMap title={titulo} markdown={data.apostila.body} />
		{/if}

		<h2 id="referencias">Referências</h2>
		<ul class="small refs">
			{#each data.apostila.references as r, i (i)}
				{@const m = r.match(/^(.*?)(https?:\/\/\S+?)([.;,)]?)$/)}
				<li>{#if m}{m[1]}<a href={m[2]} target="_blank" rel="noopener noreferrer">{m[2].replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</a>{m[3]}{:else}{r}{/if}</li>
			{/each}
		</ul>
	</article>
</div>

<style>
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
	.toc li.sub {
		padding-left: 0.8rem;
		font-size: 0.8rem;
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
	.doc :global(h2) {
		scroll-margin-top: 1rem;
	}
	.doc :global(h3),
	.doc :global(h4) {
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
