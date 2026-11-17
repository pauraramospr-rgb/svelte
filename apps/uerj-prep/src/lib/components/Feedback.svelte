<script lang="ts">
	import CategoryTag from './CategoryTag.svelte';

	interface FeedbackData {
		credit: 'total' | 'parcial' | 'nula';
		summary: string;
		correctPoints: string[];
		conceptualErrors: { excerpt: string; problem: string; correction: string }[];
		missingElements: string[];
		improvedAnswer: string;
		studyTips: string[];
		confidence: 'alta' | 'media' | 'baixa';
	}
	let { fb }: { fb: FeedbackData } = $props();
	const label = { total: 'Pontuação total', parcial: 'Pontuação parcial', nula: 'Pontuação nula' };
</script>

<div class="fb card">
	<div class="spread">
		<h3 class="credit {fb.credit}">{label[fb.credit]}</h3>
		<CategoryTag category="ia" detail="correção automática · confiança {fb.confidence}" />
	</div>
	<p>{fb.summary}</p>
	{#if fb.correctPoints.length}
		<h4>O que você acertou</h4>
		<ul>{#each fb.correctPoints as p, i (i)}<li>{p}</li>{/each}</ul>
	{/if}
	{#if fb.conceptualErrors.length}
		<h4>Erros conceituais</h4>
		<ul>
			{#each fb.conceptualErrors as e, i (i)}
				<li><q>{e.excerpt}</q> — {e.problem} <br /><span class="small"><strong>Correção:</strong> {e.correction}</span></li>
			{/each}
		</ul>
	{/if}
	{#if fb.missingElements.length}
		<h4>O que faltou</h4>
		<ul>{#each fb.missingElements as p, i (i)}<li>{p}</li>{/each}</ul>
	{/if}
	<h4>Como a resposta poderia ficar</h4>
	<blockquote>{fb.improvedAnswer}</blockquote>
	{#if fb.studyTips.length}
		<h4>Para estudar</h4>
		<ul>{#each fb.studyTips as p, i (i)}<li>{p}</li>{/each}</ul>
	{/if}
	<p class="small muted">
		Metodologia: o edital prevê pontuação total, parcial ou nula (item 4.29.5); a plataforma compara sua resposta ao comentário oficial (questões da UERJ)
		ou à resposta-modelo (inéditas) e conta parcial como 50% — a UERJ não divulga essa fração.
	</p>
</div>

<style>
	.credit.total {
		color: var(--ok);
	}
	.credit.parcial {
		color: var(--warn);
	}
	.credit.nula {
		color: var(--bad);
	}
	h4 {
		margin: 0.9rem 0 0.3rem;
		font-size: 0.95rem;
	}
	ul {
		margin: 0;
		padding-left: 1.2rem;
	}
	blockquote {
		margin: 0.3rem 0;
		padding: 0.6rem 0.9rem;
		background: var(--surface-2);
		border-left: 3px solid var(--ok);
		border-radius: 0 8px 8px 0;
	}
</style>
