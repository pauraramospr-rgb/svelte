<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	import QuestionView from '$lib/components/QuestionView.svelte';
	import AnswerPanel from '$lib/components/AnswerPanel.svelte';
	import Feedback from '$lib/components/Feedback.svelte';
	import Reference from '$lib/components/Reference.svelte';

	let { data } = $props();
	let showHistory = $state(false);
	const creditText = (c: number | null) => (c === null ? 'aguardando correção' : c >= 0.99 ? 'total' : c > 0 ? 'parcial' : 'nula');
</script>

<svelte:head><title>{data.q.source === 'oficial' ? `UERJ ${data.q.year} Q${data.q.number}` : 'Questão inédita'} · {APP_NAME}</title></svelte:head>

<p class="small"><a href="/banco">← Banco de questões</a></p>

<div class="card">
	<QuestionView q={data.q} />
	{#if data.topics.length}
		<p class="small" style="margin-top:0.6rem">Tópicos do programa 2027: {#each data.topics as t, i (t.id)}{i ? ' · ' : ''}<a href="/trilha/{t.id}">{t.title}</a>{/each}</p>
	{/if}
</div>

{#key data.q.id}
	<AnswerPanel q={data.q} ai={data.ai} />
{/key}

{#if data.attempts.length}
	<section class="card" style="margin-top:1rem">
		<div class="spread">
			<h2>Suas tentativas anteriores ({data.attempts.length})</h2>
			<button class="btn small" onclick={() => (showHistory = !showHistory)}>{showHistory ? 'Ocultar' : 'Mostrar'}</button>
		</div>
		{#if showHistory}
			{#each data.attempts as a (a.id)}
				<div class="att">
					<p class="small muted">{new Date(a.created_at + 'Z').toLocaleString('pt-BR')} · pontuação {creditText(a.credit)} · {a.method === 'ia' ? 'correção por IA' : a.method === 'autoavaliacao' ? 'autoavaliação' : 'sem correção'}</p>
					<blockquote class="statement">{a.answer}</blockquote>
					{#if a.feedback}<Feedback fb={a.feedback} />{/if}
				</div>
			{/each}
			<Reference q={data.q} />
		{/if}
	</section>
{/if}

<style>
	.att {
		border-top: 1px solid var(--border);
		padding-top: 0.6rem;
		margin-top: 0.6rem;
	}
	blockquote {
		margin: 0.3rem 0;
		padding: 0.5rem 0.8rem;
		background: var(--surface-2);
		border-radius: 8px;
		font-size: 0.95rem;
	}
</style>
