<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	import DisciplineBadge from '$lib/components/DisciplineBadge.svelte';
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import { DISCIPLINES, type DisciplineCode } from '$lib/data/official/exam-2027';

	let { data } = $props();
	const pct = (x: number | null) => (x === null ? '—' : `${Math.round(x * 100)}%`);
	const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
	const weekday = (d: string) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });

	// séries de evolução por disciplina (média semanal de crédito)
	const weeks = $derived([...new Set(data.evolution.map((e) => e.week))]);
	const series = $derived(
		[...new Set(data.evolution.map((e) => e.discipline))].map((d) => ({
			d,
			points: weeks.map((w) => data.evolution.find((e) => e.week === w && e.discipline === d)?.avg ?? null)
		}))
	);
	const W = 560,
		H = 160,
		P = 28;
	const x = (i: number) => P + (weeks.length > 1 ? (i * (W - 2 * P)) / (weeks.length - 1) : (W - 2 * P) / 2);
	const y = (v: number) => H - P - v * (H - 2 * P);
	function path(points: (number | null)[]) {
		let d = '';
		points.forEach((v, i) => {
			if (v === null) return;
			d += `${d ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)} `;
		});
		return d;
	}
</script>

<svelte:head><title>Revisão e evolução · {APP_NAME}</title></svelte:head>

<h1>Revisão e evolução</h1>
<p class="muted">Repetição espaçada por tópico: cada questão corrigida atualiza o intervalo até a próxima revisão daquele tópico (algoritmo SM-2, ajustado para que revisões caiam antes da prova).</p>

<div class="grid cols-2">
	<section class="card">
		<div class="spread"><h2>Revisões vencidas</h2><span class="pill">{data.due.length}</span></div>
		{#if data.due.length}
			<ul class="plain">
				{#each data.due as c (c.topic_id)}
					<li class="row"><DisciplineBadge code={c.discipline} /><a href="/trilha/{c.topic_id}">{c.title}</a>{#if c.lapses >= 2}<span class="pill warn">{c.lapses} lapsos</span>{/if}</li>
				{/each}
			</ul>
		{:else}<p class="muted small">Nenhuma revisão vencida agora.</p>{/if}
		{#if data.upcoming.length}
			<h3>Próximas</h3>
			<ul class="plain small">{#each data.upcoming as c (c.topic_id)}<li>{fmtDate(c.due_at)} · {c.title}</li>{/each}</ul>
		{/if}
	</section>

	<section class="card">
		<div class="spread"><h2>Exercícios recomendados</h2><CategoryTag category="pedagogica" /></div>
		{#if data.recommendations.length}
			{#each data.recommendations as r (r.topicId)}
				<div class="rec">
					<div class="row"><DisciplineBadge code={r.discipline} /><a href="/trilha/{r.topicId}"><strong>{r.title}</strong></a><span class="small muted">{pct(r.avg)}</span></div>
					<div class="row small">
						{#each r.next as q (q.id)}<a class="btn small" href="/banco/{q.id}">{q.label}</a>{:else}<a class="btn small" href="/trilha/{r.topicId}">Gerar questão inédita</a>{/each}
						<a class="btn small ghost" href="/tutor?topico={r.topicId}">Revisar com o tutor</a>
					</div>
				</div>
			{/each}
		{:else}<p class="muted small">Quando você errar ou acertar parcialmente questões, os tópicos aparecerão aqui com exercícios sugeridos.</p>{/if}
	</section>
</div>

<section class="card">
	<div class="spread"><h2>Diagnóstico por tópico</h2><CategoryTag category="pedagogica" detail="critérios da plataforma" /></div>
	{#if data.perf.length}
		<div class="table-wrap">
			<table>
				<thead><tr><th>Tópico</th><th>Tentativas</th><th>Aproveitamento</th><th>Índice de erro</th><th>Situação</th></tr></thead>
				<tbody>
					{#each data.perf as p (p.topicId)}
						<tr>
							<td><DisciplineBadge code={p.discipline} /> <a href="/trilha/{p.topicId}">{p.title}</a></td>
							<td>{p.attempts} ({p.graded} corrigidas)</td>
							<td>{pct(p.avgCredit)}</td>
							<td>{pct(p.errorRate)}</td>
							<td>{#if p.persistent}<span class="pill bad">dificuldade persistente</span>{:else if p.due}<span class="pill warn">revisar</span>{:else}—{/if}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="small muted">Dificuldade persistente: 3 ou mais tentativas corrigidas com aproveitamento médio abaixo de 50%, ou 2 ou mais lapsos na revisão espaçada.</p>
	{:else}<p class="muted small">Sem dados ainda.</p>{/if}
</section>

<section class="card">
	<h2>Evolução</h2>
	{#if weeks.length}
		<svg viewBox="0 0 {W} {H}" role="img" aria-label="Aproveitamento médio semanal por disciplina" class="chart">
			{#each [0, 0.5, 1] as g (g)}
				<line x1={P} x2={W - P} y1={y(g)} y2={y(g)} class="grid-line" />
				<text x={4} y={y(g) + 4} class="axis">{g * 100}%</text>
			{/each}
			{#each series as s (s.d)}
				<path d={path(s.points)} fill="none" stroke={DISCIPLINES[s.d as DisciplineCode]?.color} stroke-width="2.5" />
				{#each s.points as v, i (i)}{#if v !== null}<circle cx={x(i)} cy={y(v)} r="3.5" fill={DISCIPLINES[s.d as DisciplineCode]?.color}><title>{DISCIPLINES[s.d as DisciplineCode]?.short} · semana {weeks[i]}: {Math.round(v * 100)}%</title></circle>{/if}{/each}
			{/each}
		</svg>
		<div class="row small">{#each series as s (s.d)}<DisciplineBadge code={s.d} />{/each}</div>
	{:else}<p class="muted small">Responda questões para acompanhar sua evolução semanal.</p>{/if}
	{#if data.essays.length}
		<h3>Redações (nota estimada)</h3>
		<div class="row small">{#each data.essays as e, i (i)}<span class="pill">{new Date(e.created_at + 'Z').toLocaleDateString('pt-BR')}: {e.score.toFixed(1)}</span>{/each}</div>
	{/if}
</section>

<section class="card" id="cronograma">
	<div class="spread"><h2>Cronograma personalizado</h2><CategoryTag category="pedagogica" /></div>
	{#if data.plan}
		<p class="small muted">
			Gerado a partir dos pesos do seu curso (edital), da incidência histórica de cada tópico (classificação oficial 2017–2026) e do seu desempenho, para
			{data.weeklyHours} h/semana (ajuste no <a href="/perfil">perfil</a>). Tópicos com mais peso, mais incidência e mais erros aparecem antes e com mais frequência.
		</p>
		<div class="days">
			{#each data.plan as d (d.date)}
				<div class="day">
					<strong class="small">{weekday(d.date)}</strong>
					{#if d.note}<p class="small notice info">{d.note}</p>{/if}
					{#each d.blocks as b, i (i)}
						<div class="blk" style="border-color:{DISCIPLINES[b.discipline as DisciplineCode]?.color}">
							{#if b.topicId}<a href="/trilha/{b.topicId}">{b.title}</a>{:else}<a href="/redacao/escrever">{b.title}</a>{/if}
							<span class="small muted">{b.minutes} min</span>
						</div>
					{/each}
				</div>
			{/each}
		</div>
	{:else}<p class="muted">Escolha seu curso no <a href="/perfil">perfil</a> para gerar o cronograma.</p>{/if}
</section>

<style>
	section.card {
		margin-top: 1rem;
	}
	.grid > section.card {
		margin-top: 0;
	}
	.plain {
		list-style: none;
		padding: 0;
	}
	.plain li {
		padding: 0.25rem 0;
	}
	.rec {
		border-bottom: 1px solid var(--border);
		padding: 0.5rem 0;
	}
	.pill.warn {
		color: var(--warn);
	}
	.pill.bad {
		color: var(--bad);
	}
	.chart {
		width: 100%;
		max-width: 640px;
		height: auto;
	}
	.grid-line {
		stroke: var(--border);
	}
	.axis {
		font-size: 10px;
		fill: var(--muted);
	}
	.days {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
		gap: 0.6rem;
	}
	.day {
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 0.6rem;
		background: var(--surface-2);
	}
	.blk {
		border-left: 3px solid;
		padding: 0.15rem 0 0.15rem 0.5rem;
		margin-top: 0.4rem;
		font-size: 0.85rem;
		display: flex;
		flex-direction: column;
	}
</style>
