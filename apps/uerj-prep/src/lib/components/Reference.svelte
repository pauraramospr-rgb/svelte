<script lang="ts">
	import type { Question } from '$lib/questions/types';
	import CategoryTag from './CategoryTag.svelte';
	import Markdown from './Markdown.svelte';

	let { q }: { q: Question } = $props();
</script>

{#if q.source === 'oficial'}
	<div class="card ref">
		<div class="spread"><h3>Comentário oficial da UERJ</h3><CategoryTag category="oficial" detail="Questões Comentadas {q.year}" /></div>
		<p><strong>Objetivo:</strong> {q.objective || '—'}</p>
		<div class="statement">{q.officialCommentary || 'Comentário não disponível na transcrição.'}</div>
		{#if q.commentaryHasFormulas}
			<p class="notice small" style="margin-top:0.6rem">O comentário oficial contém fórmulas ou esquemas que não aparecem na transcrição. <a href={q.sourceUrl} target="_blank" rel="noopener noreferrer">Veja o original</a>.</p>
		{/if}
		<p class="small muted">Transcrição do documento “Questões Comentadas” publicado pela UERJ (padrão de resposta e comentário da banca).</p>
	</div>
{:else}
	<div class="card ref">
		<div class="spread"><h3>Resposta-modelo e resolução</h3><CategoryTag category="ia" detail="elaborada com IA" /></div>
		<h4>Resposta-modelo</h4>
		<Markdown source={q.modelAnswer} />
		<h4>Resolução comentada</h4>
		<Markdown source={q.explanation} />
		{#if q.commonMistakes.length}
			<h4>Erros comuns</h4>
			<ul>{#each q.commonMistakes as m, i (i)}<li>{m}</li>{/each}</ul>
		{/if}
		{#if q.skills.length}<p class="small"><strong>Habilidades avaliadas (Anexo 4):</strong> {q.skills.join(', ')}</p>{/if}
		{#if q.patternRationale}<p class="small muted"><strong>Relação com o padrão UERJ:</strong> {q.patternRationale}</p>{/if}
	</div>
{/if}

<style>
	h4 {
		margin: 0.9rem 0 0.3rem;
		font-size: 0.95rem;
	}
	.ref {
		border-left: 4px solid var(--ok);
	}
</style>
