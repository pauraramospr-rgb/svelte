<script lang="ts">
	import type { Question } from '$lib/questions/types';
	import { DIFFICULTY_LABEL } from '$lib/questions/types';
	import CategoryTag from './CategoryTag.svelte';
	import DisciplineBadge from './DisciplineBadge.svelte';

	let { q, compact = false }: { q: Question; compact?: boolean } = $props();
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

	{#if q.source === 'oficial' && !compact}
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

	<div class="statement" class:clamp={compact}>{q.statement}</div>

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
	.clamp {
		display: -webkit-box;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
