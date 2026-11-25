<script lang="ts">
	import type { Question } from '$lib/questions/types';
	import { DIFFICULTY_LABEL } from '$lib/questions/types';
	import CategoryTag from './CategoryTag.svelte';
	import DisciplineBadge from './DisciplineBadge.svelte';
	import { BOOKS, CURRENT_EDITION } from '$lib/data/official/books';
	import { cadernoDaQuestao } from '$lib/data/official/caderno';

	let { q, compact = false }: { q: Question; compact?: boolean } = $props();
	// Questões oficiais de Língua Portuguesa e Literaturas costumam se basear no livro indicado naquele ano.
	const pastBook = $derived(
		q.source === 'oficial' && q.discipline === 'LPL' && q.year !== CURRENT_EDITION
			? BOOKS.find((b) => b.edition === q.year && b.exam.startsWith('Língua Portuguesa'))
			: undefined
	);
	// Questões oficiais com o caderno de prova recortado: imagens, textos e tabelas como na prova.
	const caderno = $derived(q.source === 'oficial' && !compact ? cadernoDaQuestao(q.id) : []);
</script>

<article class="qv">
	<header class="row">
		<DisciplineBadge code={q.discipline} />
		{#if q.source === 'oficial'}
			<CategoryTag category="oficial" detail="UERJ {q.year} · questão {String(q.number).padStart(2, '0')}{q.language ? ` · ${q.language}` : ''}" />
		{:else}
			<CategoryTag category="ia" detail="Questão inédita · não oficial" />
			<span class="pill">{DIFFICULTY_LABEL[q.difficulty]}</span>
			{#if q.book}<span class="pill">{q.book}</span>{/if}
		{/if}
	</header>

	{#if q.source === 'oficial' && !compact && !caderno.length}
		{#if q.requiresBaseText}
			<p class="notice warn small">Esta questão se refere a textos-base publicados no início do caderno de prova. <a href={q.sourceUrl} target="_blank" rel="noopener noreferrer">Abra a prova oficial</a> para ler o texto.</p>
		{/if}
		{#if q.hasGraphic || q.formulaRisk}
			<p class="notice small">
				Transcrição automática do PDF oficial: {q.hasGraphic ? 'figuras, gráficos e tabelas não são reproduzidos' : ''}{q.hasGraphic && q.formulaRisk ? '; ' : ''}{q.formulaRisk
					? 'frações, expoentes e fórmulas podem ter perdido a formatação'
					: ''}. Confira o original:
				<a href={q.sourceUrl} target="_blank" rel="noopener noreferrer">página {q.sourcePage} do caderno comentado (UERJ)</a>.
			</p>
		{/if}
	{/if}

	{#if pastBook}
		<p class="notice small">Em {pastBook.edition}, a prova de Língua Portuguesa e Literaturas teve como base <em>{pastBook.title}</em>, de {pastBook.author}. Use esta questão para treinar o tipo de comando; o livro de {CURRENT_EDITION} é outro.</p>
	{/if}

	{#if caderno.length}
		<figure class="caderno">
			{#each caderno as pg (pg.src)}
				<img src={pg.src} alt={pg.alt} loading="lazy" decoding="async" class:texto={pg.tipo === 'texto'} />
			{/each}
			<figcaption class="small muted">
				Reprodução do caderno de prova oficial da UERJ — Vestibular Estadual {q.source === 'oficial' ? q.year : ''}, Exame Discursivo{caderno.some((c) => c.tipo === 'texto') ? ': texto-base e questão, com a numeração de linhas original' : ''}.
			</figcaption>
		</figure>
		<details class="transcricao">
			<summary class="small">Enunciado em texto (transcrição)</summary>
			<div class="statement">{q.statement}</div>
		</details>
	{:else}
		<div class="statement" class:clamp={compact}>{q.statement}</div>
	{/if}

	{#if !compact}
		<footer class="small muted">
			{#if q.source === 'oficial'}
				Classificação oficial — item do programa: {q.programItems.join('; ') || '—'}{q.programSubitems.length ? ` (subitem: ${q.programSubitems.join('; ')})` : ''}.
				Fonte: <a href={q.sourceUrl} target="_blank" rel="noopener noreferrer">UERJ, Questões Comentadas – Exame Discursivo {q.year}</a>.
			{:else}
				Elaborada com IA ({q.model}) com base no padrão de questões oficiais da UERJ. Não é questão de prova.
				{#if q.knowledge.length}Conhecimentos: {q.knowledge.join('; ')}.{/if}
			{/if}
		</footer>
	{/if}
</article>

<style>
	.qv header {
		margin-bottom: 0.7rem;
	}
	.qv footer {
		margin-top: 0.8rem;
	}
	.caderno {
		margin: 0;
		display: grid;
		gap: 0.6rem;
	}
	.caderno img {
		display: block;
		width: 100%;
		max-width: 46rem;
		height: auto;
		/* o caderno é impresso em papel branco: fica branco também no tema escuro */
		background: #fff;
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 0.4rem;
		box-sizing: border-box;
	}
	.caderno img.texto {
		border-style: dashed;
	}
	.caderno figcaption {
		margin-top: 0.1rem;
	}
	.transcricao {
		margin-top: 0.6rem;
	}
	.transcricao summary {
		cursor: pointer;
	}
	.transcricao .statement {
		margin-top: 0.5rem;
	}
	.clamp {
		display: -webkit-box;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
