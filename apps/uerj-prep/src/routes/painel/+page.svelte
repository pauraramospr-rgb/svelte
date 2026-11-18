<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	import DisciplineBadge from '$lib/components/DisciplineBadge.svelte';
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import { DISCIPLINES, type DisciplineCode } from '$lib/data/official/exam-2027';

	let { data } = $props();
	const pct = (x: number | null) => (x === null || x === undefined ? '—' : `${Math.round(x * 100)}%`);
	const hours = $derived(Math.round((data.overview.studySeconds / 3600) * 10) / 10);
</script>

<svelte:head><title>Painel · {APP_NAME}</title></svelte:head>

<div class="spread">
	<div>
		<h1>Olá, {data.user?.name.split(' ')[0]}!</h1>
		{#if data.user?.course}
			<p class="muted">
				{data.user.course.name} ({data.user.course.campus}) ·
				<DisciplineBadge code={data.user.course.peso2} /> peso 2 · <DisciplineBadge code={data.user.course.peso1} /> peso 1 ·
				<DisciplineBadge code="RED" /> peso 1
			</p>
		{/if}
	</div>
	<div class="row">
		<a class="btn primary" href="/simulados/novo">Novo simulado</a>
		<a class="btn" href="/redacao/escrever">Escrever redação</a>
	</div>
</div>

{#if !data.hasCourse}
	<p class="notice warn">Escolha seu curso no <a href="/perfil">perfil</a> para personalizar trilha, simulados e cronograma.</p>
{/if}

<section class="grid cols-3 stats">
	<div class="card"><span class="muted small">Questões respondidas</span><strong>{data.overview.attempts}</strong><span class="small muted">{data.overview.graded} corrigidas</span></div>
	<div class="card"><span class="muted small">Aproveitamento médio</span><strong>{pct(data.overview.avgCredit)}</strong><span class="small muted">crédito total=100%, parcial=50%</span></div>
	<div class="card"><span class="muted small">Redações corrigidas</span><strong>{data.overview.essays}</strong><span class="small muted">{data.overview.essayAvg !== null ? `média estimada ${data.overview.essayAvg.toFixed(1)}/20` : 'nenhuma ainda'}</span></div>
	<div class="card"><span class="muted small">Simulados concluídos</span><strong>{data.overview.simulados}</strong><span class="small muted">{hours} h de prática registradas</span></div>
</section>

<section class="grid cols-2" style="margin-top:1rem">
	<div class="card">
		<div class="spread"><h2>Plano de hoje</h2><CategoryTag category="pedagogica" /></div>
		{#if data.today}
			{#if data.today.note}<p class="notice info small">{data.today.note}</p>{/if}
			<ul class="plan">
				{#each data.today.blocks as b, i (i)}
					<li>
						<DisciplineBadge code={b.discipline} />
						<div>
							{#if b.topicId}<a href="/trilha/{b.topicId}"><strong>{b.title}</strong></a>{:else}<strong>{b.title}</strong>{/if}
							<p class="small muted">{b.activity} · {b.minutes} min</p>
						</div>
					</li>
				{/each}
			</ul>
			<a href="/revisao#cronograma" class="small">Ver cronograma completo →</a>
		{:else}
			<p class="muted">Defina seu curso para gerar o plano diário.</p>
		{/if}
	</div>
	<div class="card">
		<div class="spread"><h2>Revisões pendentes</h2><span class="pill">{data.due.length}</span></div>
		{#if data.due.length}
			<ul class="plain">
				{#each data.due.slice(0, 6) as c (c.topic_id)}
					<li class="row"><DisciplineBadge code={c.discipline} /><a href="/trilha/{c.topic_id}">{c.title}</a></li>
				{/each}
			</ul>
			<a href="/revisao" class="small">Ir para a revisão →</a>
		{:else}
			<p class="muted small">Nenhuma revisão vencida. As revisões são agendadas automaticamente (repetição espaçada) a partir das questões corrigidas.</p>
		{/if}
		{#if data.weak.length}
			<h3 style="margin-top:1rem">Tópicos com mais erros</h3>
			<ul class="plain">
				{#each data.weak as w (w.topicId)}
					<li class="row"><DisciplineBadge code={w.discipline} /><a href="/trilha/{w.topicId}">{w.title}</a><span class="small muted">{pct(w.avgCredit)} de aproveitamento</span></li>
				{/each}
			</ul>
		{/if}
		{#if data.persistent > 0}<p class="notice warn small">{data.persistent} tópico(s) com dificuldade persistente. <a href="/revisao">Ver diagnóstico</a></p>{/if}
	</div>
</section>

<section class="grid cols-2" style="margin-top:1rem">
	<div class="card">
		<h2>Desempenho por disciplina</h2>
		{#if data.disciplines.length}
			{#each data.disciplines as d (d.discipline)}
				<div class="drow">
					<span>{DISCIPLINES[d.discipline as DisciplineCode]?.short ?? d.discipline}</span>
					<div class="bar"><span style="width:{Math.round((d.avg ?? 0) * 100)}%; background:{DISCIPLINES[d.discipline as DisciplineCode]?.color}"></span></div>
					<span class="small muted">{pct(d.avg)} · {d.n}</span>
				</div>
			{/each}
		{:else}
			<p class="muted small">Responda questões no <a href="/banco">banco</a> ou faça um <a href="/simulados/novo">simulado</a> para ver seu desempenho.</p>
		{/if}
	</div>
	<div class="card">
		<h2>Atividade recente</h2>
		{#if data.recentSims.length || data.recentEssays.length}
			<ul class="plain">
				{#each data.recentSims as s (s.id)}
					<li><a href="/simulados/{s.id}">{s.title}</a> <span class="small muted">{s.finished_at ? (s.result ? `${s.result.discursive} pts (estimado)` : 'concluído') : 'em andamento'}</span></li>
				{/each}
				{#each data.recentEssays as e (e.id)}
					<li><a href="/redacao/{e.id}">Redação: {e.title || 'sem título'}</a> <span class="small muted">{e.score !== null ? `${e.score.toFixed(1)}/20 (estimado)` : 'aguardando correção'}</span></li>
				{/each}
			</ul>
		{:else}
			<p class="muted small">Nada por aqui ainda. Comece pela <a href="/trilha">sua trilha</a>.</p>
		{/if}
	</div>
</section>

<style>
	.stats {
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	}
	.stats .card {
		display: flex;
		flex-direction: column;
	}
	.stats strong {
		font-size: 1.8rem;
		line-height: 1.2;
	}
	.plan,
	.plain {
		list-style: none;
		padding: 0;
		margin: 0.5rem 0;
	}
	.plan li {
		display: flex;
		gap: 0.6rem;
		align-items: flex-start;
		padding: 0.45rem 0;
		border-bottom: 1px solid var(--border);
	}
	.plan p {
		margin: 0;
	}
	.plain li {
		padding: 0.3rem 0;
	}
	.drow {
		display: grid;
		grid-template-columns: 110px 1fr 90px;
		gap: 0.6rem;
		align-items: center;
		padding: 0.25rem 0;
	}
</style>
