<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	import DisciplineBadge from '$lib/components/DisciplineBadge.svelte';
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import { page } from '$app/state';

	let { data } = $props();
	const link = (p: number) => {
		const u = new URL(page.url);
		u.searchParams.set('p', String(p));
		return u.pathname + u.search;
	};
</script>

<svelte:head><title>Banco de questões · {APP_NAME}</title></svelte:head>

<h1>Banco de questões</h1>
<p class="muted">
	Duas categorias, sempre identificadas: <CategoryTag category="oficial" /> questões de provas anteriores da UERJ, com o comentário oficial da banca, e
	<CategoryTag category="ia" /> questões inéditas elaboradas por IA no padrão da UERJ — que <strong>não</strong> são questões oficiais.
</p>

<form class="card filters" method="GET">
	<div class="grid cols-3">
		<div>
			<label for="fonte">Categoria</label>
			<select id="fonte" name="fonte" value={data.filters.source}>
				<option value="">Todas</option><option value="oficial">Oficiais (UERJ)</option><option value="inedita">Inéditas (IA)</option>
			</select>
		</div>
		<div>
			<label for="disciplina">Disciplina</label>
			<select id="disciplina" name="disciplina" value={data.filters.discipline} onchange={(e) => e.currentTarget.form?.requestSubmit()}>
				<option value="">Todas</option>
				{#each data.disciplines as d (d.code)}<option value={d.code}>{d.name}</option>{/each}
			</select>
		</div>
		<div>
			<label for="topico">Tópico do programa</label>
			<select id="topico" name="topico" value={data.filters.topicId} disabled={!data.topics.length}>
				<option value="">{data.topics.length ? 'Todos' : 'Escolha a disciplina'}</option>
				{#each data.topics as t (t.id)}<option value={t.id}>{t.title}</option>{/each}
			</select>
		</div>
		<div>
			<label for="ano">Ano (oficiais)</label>
			<select id="ano" name="ano" value={String(data.filters.year)}>
				<option value="">Todos</option>
				{#each data.years as y (y)}<option value={String(y)}>{y}</option>{/each}
			</select>
		</div>
		<div>
			<label for="dificuldade">Dificuldade (inéditas)</label>
			<select id="dificuldade" name="dificuldade" value={data.filters.difficulty}>
				<option value="">Todas</option><option value="facil">Fácil</option><option value="medio">Médio</option><option value="dificil">Difícil</option>
			</select>
		</div>
		<div>
			<label for="q">Buscar no enunciado</label>
			<input id="q" name="q" value={data.filters.q} placeholder="ex.: entalpia, Guerra Fria" />
		</div>
	</div>
	<div class="row" style="margin-top:0.7rem">
		<button class="btn primary">Filtrar</button>
		<a class="btn ghost" href="/banco">Limpar</a>
		<span class="muted small">{data.total} questões encontradas</span>
	</div>
</form>

<ul class="list">
	{#each data.items as q (q.id)}
		<li class="card">
			<div class="spread">
				<div class="row">
					<DisciplineBadge code={q.discipline} />
					<a href="/banco/{q.id}"><strong>{q.label}</strong></a>
					{#if q.source === 'inedita'}<CategoryTag category="ia" />{/if}
					{#if q.hasGraphic}<span class="pill" title="Contém figura, gráfico ou tabela na prova original">figura</span>{/if}
				</div>
				{#if q.answered}<span class="pill">{q.best === null ? 'respondida' : `melhor: ${Math.round(q.best * 100)}%`}</span>{/if}
			</div>
			<p class="small muted st">{q.statement}{q.statement.length >= 280 ? '…' : ''}</p>
		</li>
	{:else}
		<li class="card muted">Nenhuma questão com esses filtros.</li>
	{/each}
</ul>

{#if data.pages > 1}
	<nav class="row" aria-label="Paginação">
		{#if data.page > 1}<a class="btn small" href={link(data.page - 1)}>← Anterior</a>{/if}
		<span class="small muted">Página {data.page} de {data.pages}</span>
		{#if data.page < data.pages}<a class="btn small" href={link(data.page + 1)}>Próxima →</a>{/if}
	</nav>
{/if}

<style>
	.filters {
		margin: 1rem 0;
	}
	.list {
		list-style: none;
		padding: 0;
		margin: 0 0 1rem;
	}
	.list li + li {
		margin-top: 0.6rem;
	}
	.st {
		margin: 0.4rem 0 0;
	}
</style>
