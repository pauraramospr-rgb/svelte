<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import { REDACAO_ASPECTS } from '$lib/data/official/exam-2027';
	import { ASPECT_VALUE, RATING_FACTOR, RATING_LABEL, type AspectRating } from '$lib/domain/essay';

	let { data } = $props();
	const e = $derived(data.essay);
	const c = $derived(e.correction);
	let busy = $state(false);
	let error = $state('');
	const PROBLEM = { argumentacao: 'Argumentação', coesao: 'Coesão', coerencia: 'Coerência', estrutura: 'Estrutura', norma: 'Norma-padrão', tema: 'Adequação ao tema' } as const;

	async function correct() {
		busy = true;
		error = '';
		const res = await fetch(`/api/essays/${e.id}/correct`, { method: 'POST' });
		const out = await res.json();
		busy = false;
		if (!res.ok) error = out.error;
		else await invalidateAll();
	}
	onMount(() => {
		if (page.url.searchParams.has('corrigir') && !e.correction && data.ai) correct();
	});
</script>

<svelte:head><title>{e.title || 'Redação'} · {APP_NAME}</title></svelte:head>

<p class="small"><a href="/redacao">← Laboratório de redação</a></p>
<h1>{e.title || 'Redação sem título'}</h1>
<p class="muted small">Proposta: {e.prompt}</p>

<div class="layout">
	<section class="card">
		<div class="spread"><h2>Seu texto</h2><span class="pill">{e.lines} linhas (estimativa)</span></div>
		<div class="statement essay">{e.body}</div>
		{#if e.plan}<details><summary>Plano</summary><pre class="small">{e.plan}</pre></details>{/if}
	</section>

	<section>
		{#if !c}
			<div class="card">
				<h2>Correção detalhada</h2>
				{#if busy}
					<p role="status">Corrigindo segundo os critérios oficiais… isso pode levar até um minuto.</p>
				{:else}
					<p class="muted small">A correção avalia os 8 aspectos do Anexo 5 / padrão de respostas, aponta problemas com trechos do seu texto e sugere reescritas.</p>
					<button class="btn primary" disabled={!data.ai} onclick={correct}>Corrigir com o professor IA</button>
					{#if !data.ai}<p class="notice warn small">IA não configurada neste servidor.</p>{/if}
				{/if}
				{#if error}<p class="notice bad small" role="alert">{error}</p>{/if}
			</div>
		{:else}
			<div class="card">
				<div class="spread">
					<h2>Nota estimada: {e.score?.toFixed(1)}/20</h2>
					<CategoryTag category="ia" detail="correção automática" />
				</div>
				{#if c.zeroReason}<p class="notice bad">{c.zeroReason}</p>{/if}
				<p class="small muted">
					Estimativa da plataforma: 8 aspectos oficiais com peso igual ({ASPECT_VALUE.toFixed(2)} pts); atende 100%, parcialmente 50%, não atende 0%. A UERJ não
					divulga a pontuação por aspecto; use a nota para acompanhar sua evolução.
				</p>
				{#if c.identifiedThesis}<p><strong>Tese identificada:</strong> {c.identifiedThesis}</p>{:else}<p class="notice warn small">Não foi identificada uma tese explícita.</p>{/if}
				<table>
					<thead><tr><th>Aspecto (Anexo 5)</th><th>Avaliação</th><th>Pts</th></tr></thead>
					<tbody>
						{#each REDACAO_ASPECTS as a (a.id)}
							{@const r = c.aspects.find((x: { id: string }) => x.id === a.id)}
							<tr>
								<td>
									<strong>{a.label}</strong>
									{#if r}<p class="small">{r.comment}</p>{#each r.evidence as ev, i (i)}<q class="small ev">{ev}</q>{/each}{/if}
								</td>
								<td class="rating {r?.rating}">{r ? RATING_LABEL[r.rating as AspectRating] : '—'}</td>
								<td>{r ? (RATING_FACTOR[r.rating as AspectRating] * ASPECT_VALUE).toFixed(2) : '0'}</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<p class="small">
					Formato: {c.formal.isProse ? 'em prosa' : 'NÃO está em prosa'} · {c.formal.hasTitle || e.title ? 'com título' : 'sem título'}
					{#if c.formal.notes}· {c.formal.notes}{/if}
				</p>
			</div>

			{#if c.problems.length}
				<div class="card">
					<h2>Problemas identificados</h2>
					{#each c.problems as p, i (i)}
						<div class="prob">
							<span class="pill">{PROBLEM[p.type as keyof typeof PROBLEM]}</span>
							<p><q>{p.excerpt}</q></p>
							<p class="small">{p.explanation}</p>
							<p class="small"><strong>Reescrita sugerida:</strong> {p.rewrite}</p>
						</div>
					{/each}
				</div>
			{/if}
			<div class="card">
				<h2>Pontos fortes</h2>
				<ul>{#each c.strengths as s, i (i)}<li>{s}</li>{/each}</ul>
				{#if c.rewriteSuggestions.length}
					<h2>Sugestões de reescrita</h2>
					{#each c.rewriteSuggestions as s, i (i)}
						<div class="prob"><p class="small"><del>{s.original}</del></p><p class="small"><ins>{s.suggestion}</ins></p><p class="small muted">{s.why}</p></div>
					{/each}
				{/if}
				<h2>Avaliação geral</h2>
				<p>{c.overall}</p>
				<h3>Próximos passos</h3>
				<ul>{#each c.nextSteps as s, i (i)}<li>{s}</li>{/each}</ul>
				<p class="row"><a class="btn" href="/redacao/escrever">Reescrever / nova redação</a> <a class="btn ghost" href="/tutor?redacao={e.id}">Discutir a correção com o professor IA</a></p>
			</div>
		{/if}
	</section>
</div>

<style>
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 1rem;
		align-items: start;
	}
	.layout section > .card + .card {
		margin-top: 1rem;
	}
	.essay {
		line-height: 1.8;
	}
	.rating.atende {
		color: var(--ok);
		font-weight: 700;
	}
	.rating.atende_parcialmente {
		color: var(--warn);
		font-weight: 700;
	}
	.rating.nao_atende {
		color: var(--bad);
		font-weight: 700;
	}
	.ev {
		display: block;
		color: var(--muted);
		margin-top: 0.2rem;
	}
	.prob {
		border-top: 1px solid var(--border);
		padding-top: 0.6rem;
		margin-top: 0.6rem;
	}
	ins {
		text-decoration: none;
		background: var(--ok-soft);
	}
	del {
		background: var(--bad-soft);
	}
	pre {
		white-space: pre-wrap;
	}
	@media (max-width: 1000px) {
		.layout {
			grid-template-columns: 1fr;
		}
	}
</style>
