<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import DisciplineBadge from '$lib/components/DisciplineBadge.svelte';
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import SourceRef from '$lib/components/SourceRef.svelte';
	import Markdown from '$lib/components/Markdown.svelte';
	import MindMap from '$lib/components/MindMap.svelte';
	import { DIFFICULTY_LABEL, type Difficulty } from '$lib/questions/types';

	let { data } = $props();
	let summary = $state<string | null>(null);
	let busy = $state('');
	let error = $state('');
	let difficulty = $state<Difficulty>('medio');
	let view = $state<'texto' | 'mapa'>('texto');
	const shownSummary = $derived(summary ?? data.aiSummary?.content ?? null);
	const maxYear = $derived(Math.max(1, ...Object.values(data.stats.byYear)));

	async function genSummary() {
		busy = 'summary';
		error = '';
		const res = await fetch('/api/summary', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ topicId: data.topic.id }) });
		const out = await res.json();
		busy = '';
		if (!res.ok) error = out.error;
		else summary = out.content;
	}

	async function genQuestion() {
		busy = 'question';
		error = '';
		const res = await fetch('/api/questions/generate', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ discipline: data.discipline, topicId: data.topic.id, difficulty })
		});
		const out = await res.json();
		busy = '';
		if (!res.ok) error = out.error;
		else goto(`/banco/${out.id}`);
	}
</script>

<svelte:head><title>{data.topic.title} · Trilha · Discursiva</title></svelte:head>

<p class="small"><a href="/trilha?d={data.discipline}">← Trilha</a></p>
<div class="spread">
	<div>
		<div class="row"><DisciplineBadge code={data.discipline} long /> <span class="pill">{data.unit}</span></div>
		<h1 style="margin-top:0.5rem">{data.topic.title}</h1>
	</div>
	<form method="POST" action="?/status" use:enhance class="row">
		<button class="btn small" class:primary={data.status === 'estudando'} name="status" value={data.status === 'estudando' ? '' : 'estudando'}>Estudando</button>
		<button class="btn small" class:primary={data.status === 'concluido'} name="status" value={data.status === 'concluido' ? '' : 'concluido'}>✓ Concluído</button>
	</form>
</div>

<div class="grid cols-2">
	<div class="card">
		<div class="spread"><h2>Programa oficial</h2><CategoryTag category="oficial" /></div>
		{#if data.topic.subtopics.length}
			<ul>{#each data.topic.subtopics as s, i (i)}<li>{s}</li>{/each}</ul>
		{:else}
			<p class="muted">Tópico sem subdivisões no Anexo 5.</p>
		{/if}
		<SourceRef id="anexo5-2027" ref="unidade “{data.unit}”" />
	</div>
	<div class="card">
		<div class="spread"><h2>Histórico de cobrança</h2><CategoryTag category="analise" /></div>
		{#if data.stats.questions}
			<p>
				<strong>{data.stats.questions}</strong> questão(ões) classificadas pela UERJ neste tópico, em <strong>{data.stats.editions}</strong> das {data.stats.editionsTotal} edições analisadas
				({Math.round(data.stats.share * 100)}% das questões classificadas da disciplina{data.discipline === 'LE' ? ', somando Espanhol, Francês e Inglês' : ''}).
			</p>
			<div class="years" aria-label="Questões por edição">
				{#each data.years as y (y)}
					<div class="ycol" title="{y}: {data.stats.byYear[y] ?? 0}">
						<span style="height:{((data.stats.byYear[y] ?? 0) / maxYear) * 60}px"></span>
						<small>{String(y).slice(2)}</small>
					</div>
				{/each}
			</div>
		{:else}
			<p class="muted">Nenhuma questão das edições analisadas foi classificada pela UERJ neste tópico. Isso não significa que ele não possa ser cobrado.</p>
		{/if}
		<p class="small muted">Base: classificação oficial (“Item do programa”) das Questões Comentadas da UERJ. Frequência passada não garante cobrança futura.</p>
	</div>
</div>

{#if error}<p class="notice bad" role="alert">{error}</p>{/if}

<section class="card">
	{#if data.resumo || shownSummary}
		<div class="spread">
			<h2>Resumo estratégico</h2>
			{#if data.resumo}<CategoryTag category="pedagogica" detail="revisado em {data.resumo.reviewed}" />{:else}<CategoryTag category="ia" detail="gerado sob demanda" />{/if}
		</div>
		<div class="row view" role="group" aria-label="Forma de visualização">
			<button class="btn small" class:primary={view === 'texto'} aria-pressed={view === 'texto'} onclick={() => (view = 'texto')}>Texto completo</button>
			<button class="btn small" class:primary={view === 'mapa'} aria-pressed={view === 'mapa'} onclick={() => (view = 'mapa')}>Mapa mental</button>
		</div>
		{#if !data.resumo}<p class="notice small">Resumo gerado por IA para o seu nível. Confira dados e definições com o material oficial e com seu professor.</p>{/if}
		{#if view === 'mapa'}
			<p class="small muted">O mapa é montado automaticamente a partir das seções e dos termos em destaque do resumo. Use-o para revisar; para estudar, leia o texto completo.</p>
			<MindMap title={data.topic.title} markdown={data.resumo?.body ?? shownSummary ?? ''} />
		{:else}
			<Markdown source={data.resumo?.body ?? shownSummary ?? ''} />
		{/if}
		{#if data.resumo?.references.length}
			<h3>Referências</h3>
			<ul class="small">{#each data.resumo.references as r, i (i)}<li>{r}</li>{/each}</ul>
		{/if}
	{:else}
		<h2>Resumo estratégico</h2>
		<p class="muted">Este tópico ainda não tem resumo editorial. Você pode gerar um resumo com IA, adaptado ao seu nível, com conceitos, exemplos, relações entre conteúdos, como o tema aparece nas provas e exercícios de fixação.</p>
		<button class="btn primary" disabled={!data.ai || busy !== ''} onclick={genSummary}>{busy === 'summary' ? 'Gerando resumo… (pode levar 1 min)' : 'Gerar resumo com IA'}</button>
	{/if}
</section>

<section class="card">
	<div class="spread"><h2>Questões oficiais deste tópico</h2><span class="pill">{data.officialTotal}</span></div>
	{#if data.official.length}
		<ul class="qlist">
			{#each data.official as q (q.id)}
				<li><a href="/banco/{q.id}"><strong>UERJ {q.year} · Q{String(q.number).padStart(2, '0')}{q.language ? ` · ${q.language}` : ''}</strong></a> <span class="muted small">{q.statement}…</span></li>
			{/each}
		</ul>
	{:else}
		<p class="muted">Sem questões oficiais classificadas neste tópico nas edições analisadas.</p>
	{/if}
</section>

<section class="card">
	<div class="spread"><h2>Questões inéditas</h2><CategoryTag category="ia" detail="não oficiais" /></div>
	{#if data.ineditas.length}
		<ul class="qlist">
			{#each data.ineditas as q (q.id)}
				<li><a href="/banco/{q.id}"><strong>Inédita · {DIFFICULTY_LABEL[q.difficulty as Difficulty]}</strong></a> <span class="muted small">{q.statement}…</span></li>
			{/each}
		</ul>
	{/if}
	<div class="row">
		<label for="dif" class="sr-only">Dificuldade</label>
		<select id="dif" bind:value={difficulty} style="width:auto">
			<option value="facil">Fácil</option><option value="medio">Médio</option><option value="dificil">Difícil</option>
		</select>
		<button class="btn primary" disabled={!data.ai || busy !== ''} onclick={genQuestion}>{busy === 'question' ? 'Elaborando questão…' : 'Gerar questão inédita'}</button>
		<a class="btn" href="/tutor?topico={data.topic.id}">Tirar dúvidas com o professor IA</a>
	</div>
</section>

<style>
	.years {
		display: flex;
		gap: 0.5rem;
		align-items: flex-end;
		height: 84px;
		margin: 0.5rem 0;
	}
	.ycol {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
		gap: 2px;
		width: 28px;
	}
	.ycol span {
		width: 18px;
		background: var(--cat-analise);
		border-radius: 4px 4px 0 0;
		min-height: 2px;
	}
	.view {
		margin: 0.25rem 0 0.75rem;
	}
	.qlist {
		list-style: none;
		padding: 0;
	}
	.qlist li {
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--border);
	}
	section.card {
		margin-top: 1rem;
	}
</style>
