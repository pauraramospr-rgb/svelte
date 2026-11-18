<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	import DisciplineBadge from '$lib/components/DisciplineBadge.svelte';
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import { DISCIPLINES, type DisciplineCode } from '$lib/data/official/exam-2027';
	import Icon from '$lib/components/Icon.svelte';

	let { data } = $props();
	const pct = (x: number | null) => (x === null || x === undefined ? '—' : `${Math.round(x * 100)}%`);
	const hours = $derived(Math.round((data.overview.studySeconds / 3600) * 10) / 10);
</script>

<svelte:head><title>Painel · {APP_NAME}</title></svelte:head>

<section class="hero">
	<div class="hello card">
		<span class="eyebrow">Bom estudo</span>
		<h1>Olá, {data.user?.name.split(' ')[0]}!</h1>
		{#if data.user?.course}
			<p class="muted course">
				{data.user.course.name} ({data.user.course.campus}) ·
				<DisciplineBadge code={data.user.course.peso2} /> peso 2 · <DisciplineBadge code={data.user.course.peso1} /> peso 1 ·
				<DisciplineBadge code="RED" /> Redação
			</p>
		{/if}
		{#if data.today?.blocks?.length && data.today.blocks[0].topicId}
			{@const next = data.today.blocks[0]}
			<a class="next" href="/trilha/{next.topicId}">
				<span class="eyebrow">Próximo passo do seu plano</span>
				<span class="next-title"><DisciplineBadge code={next.discipline} /> <strong>{next.title}</strong></span>
				<span class="small muted">{next.activity} · {next.minutes} min</span>
				<span class="go" aria-hidden="true"><Icon name="arrow" size={20} /></span>
			</a>
		{/if}
		<div class="row actions">
			<a class="btn primary" href="/simulados/novo">Novo simulado</a>
			<a class="btn" href="/redacao/escrever">Escrever redação</a>
			<a class="btn ghost" href="/guia">Como responder à UERJ</a>
		</div>
	</div>
	<div class="journey" aria-label="Sua jornada">
		<span class="eyebrow">Sua jornada</span>
		<dl>
			<div><dt>Questões respondidas</dt><dd class="num">{data.overview.attempts}</dd><span>{data.overview.graded} corrigidas</span></div>
			<div><dt>Aproveitamento</dt><dd class="num">{pct(data.overview.avgCredit)}</dd><span>total = 100%, parcial = 50%</span></div>
			<div><dt>Redações corrigidas</dt><dd class="num">{data.overview.essays}</dd><span>{data.overview.essayAvg !== null ? `média ${data.overview.essayAvg.toFixed(1)}/20` : 'nenhuma ainda'}</span></div>
			<div><dt>Simulados</dt><dd class="num">{data.overview.simulados}</dd><span>{hours} h de prática</span></div>
		</dl>
	</div>
</section>

{#if !data.hasCourse}
	<p class="notice warn">Escolha seu curso no <a href="/perfil">perfil</a> para personalizar trilha, simulados e cronograma.</p>
{/if}

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
	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr);
		gap: 1rem;
		margin-bottom: 1rem;
	}
	.hello {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		padding: 1.5rem 1.6rem;
	}
	.hello h1 {
		margin-bottom: 0.2rem;
	}
	.course {
		margin-bottom: 0.6rem;
	}
	.next {
		position: relative;
		display: grid;
		gap: 0.25rem;
		margin: 0.4rem 0 1rem;
		padding: 0.95rem 3rem 0.95rem 1.05rem;
		border-radius: 14px;
		background: var(--primary-soft);
		border: 1px solid color-mix(in srgb, var(--primary) 25%, transparent);
		color: var(--text);
		text-decoration: none;
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}
	.next:hover {
		transform: translateY(-1px);
		box-shadow: var(--shadow-lift);
		color: var(--text);
	}
	.next .eyebrow {
		margin: 0;
		color: var(--primary);
	}
	.next-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
		font-family: var(--display);
		font-size: 1.15rem;
	}
	.next-title strong {
		background: linear-gradient(transparent 60%, var(--mark-soft) 60%, var(--mark-soft) 95%, transparent 95%);
	}
	.go {
		position: absolute;
		right: 1rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--primary);
	}
	.actions {
		margin-top: auto;
	}
	/* Painel escuro, pautado como a folha de resposta. */
	.journey {
		border-radius: var(--radius);
		padding: 1.3rem 1.4rem;
		color: var(--ink-text);
		background-color: var(--ink-panel);
		background-image: linear-gradient(to bottom, transparent 27px, rgb(255 255 255 / 6%) 27px);
		background-size: 100% 28px;
		box-shadow: var(--shadow);
	}
	.journey .eyebrow {
		color: var(--ink-muted);
	}
	.journey dl {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1.1rem 1rem;
		margin: 0.6rem 0 0;
	}
	.journey dt {
		font-size: 0.8rem;
		color: var(--ink-muted);
	}
	.journey dd {
		margin: 0.1rem 0 0;
		font-size: 2rem;
		font-weight: 700;
		line-height: 1.1;
		color: var(--ink-text);
	}
	.journey dl > div:first-child dd {
		color: var(--mark);
	}
	.journey dl span {
		font-size: 0.78rem;
		color: var(--ink-muted);
	}
	@media (max-width: 860px) {
		.hero {
			grid-template-columns: minmax(0, 1fr);
		}
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
