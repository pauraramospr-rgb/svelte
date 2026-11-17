<script lang="ts">
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import SourceRef from '$lib/components/SourceRef.svelte';
	import { BOOKS, CURRENT_EDITION } from '$lib/data/official/books';

	const current = BOOKS.filter((b) => b.edition === CURRENT_EDITION);
	const previous = BOOKS.filter((b) => b.edition !== CURRENT_EDITION);
	const editions = [...new Set(previous.map((b) => b.edition))];
</script>

<svelte:head><title>Obras literárias · Discursiva</title></svelte:head>

<h1>Obras literárias indicadas pela UERJ</h1>
<p class="muted">Lista oficial atual e listas de edições anteriores, sempre identificadas. A UERJ declara a leitura destes livros “indispensável/imprescindível”.</p>

<section class="card">
	<div class="spread"><h2>Vestibular Estadual {CURRENT_EDITION} — lista atual</h2><CategoryTag category="oficial" /></div>
	<div class="grid cols-2">
		{#each current as b (b.title)}
			<div class="book" class:disc={b.exam.includes('Discursivo')}>
				<span class="small muted">{b.exam}</span>
				<h3>{b.title}</h3>
				<p class="small">{b.author}</p>
				{#if b.slug}<a class="btn small primary" href="/obras/{b.slug}">Análise completa</a>{:else}<span class="small muted">Obra dos Exames de Qualificação (já realizados).</span>{/if}
			</div>
		{/each}
	</div>
	<SourceRef id="anexo3-1fase-2027" ref="indicação dos 4 livros" />
	<SourceRef id="anexo5-2027" ref="Redação e Língua Portuguesa e Literaturas" />
</section>

<section class="card">
	<div class="spread"><h2>Listas de edições anteriores</h2><CategoryTag category="oficial" detail="listas antigas" /></div>
	<p class="small muted">Úteis para treinar com provas antigas — não são as obras de {CURRENT_EDITION}.</p>
	{#each editions as ed (ed)}
		<h3>{ed}{ed >= 2021 && ed <= 2023 ? ' (Exame Único)' : ''}</h3>
		<ul class="small">
			{#each previous.filter((b) => b.edition === ed) as b (b.title + b.exam)}
				<li><strong>{b.title}</strong>, {b.author} — {b.exam}</li>
			{/each}
		</ul>
	{/each}
	<p class="small muted">2019–2020 e 2024–2026: anexos oficiais dos editais. 2021–2023: livros identificados nas próprias propostas de Redação.</p>
</section>

<style>
	section.card {
		margin-top: 1rem;
	}
	.book {
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 0.9rem;
		opacity: 0.75;
	}
	.book.disc {
		opacity: 1;
		border-color: var(--primary);
		background: var(--primary-soft);
	}
	.book h3 {
		margin: 0.2rem 0;
		font-family: var(--serif);
		font-size: 1.25rem;
	}
</style>
