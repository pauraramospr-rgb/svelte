<script lang="ts">
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import { INCIDENCE } from '$lib/domain/syllabus';
	let { data } = $props();
	let only = $state<'todos' | 'editorial' | 'prioridade'>('todos');
</script>

<svelte:head><title>Resumos · Discursiva</title></svelte:head>

<h1>Resumos estratégicos</h1>
<p class="muted">
	Todos os tópicos do programa oficial de 2027. <CategoryTag category="pedagogica" /> {data.editorialCount} resumos editoriais da plataforma (com referências) e
	<CategoryTag category="ia" /> resumos gerados sob demanda para o seu nível nos demais tópicos. A prioridade reflete a incidência histórica nas {INCIDENCE.years.length}
	edições analisadas — nunca uma garantia de cobrança.
</p>
<div class="row" role="group" aria-label="Filtro">
	<button class="btn small" class:primary={only === 'todos'} onclick={() => (only = 'todos')}>Todos</button>
	<button class="btn small" class:primary={only === 'editorial'} onclick={() => (only = 'editorial')}>Com resumo editorial</button>
	<button class="btn small" class:primary={only === 'prioridade'} onclick={() => (only = 'prioridade')}>Alta incidência</button>
</div>

{#each data.disciplines as d (d.code)}
	{@const list = d.topics.filter((t) => only === 'todos' || (only === 'editorial' ? t.editorial : t.band === 'alta'))}
	{#if list.length}
		<section class="card">
			<h2>{d.name}</h2>
			<ul class="tl">
				{#each list as t (t.id)}
					<li>
						<a href="/trilha/{t.id}">{t.title}</a>
						<span class="small muted">{t.unit}</span>
						{#if t.editorial}<span class="pill ed">resumo editorial</span>{:else if t.generated}<span class="pill">resumo IA gerado</span>{/if}
						{#if t.band === 'alta'}<span class="pill hi">{t.editions}/{INCIDENCE.years.length} edições</span>{/if}
					</li>
				{/each}
			</ul>
		</section>
	{/if}
{/each}

<style>
	section.card {
		margin-top: 1rem;
	}
	.tl {
		list-style: none;
		padding: 0;
		columns: 2 320px;
	}
	.tl li {
		break-inside: avoid;
		padding: 0.3rem 0;
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		align-items: baseline;
	}
	.pill.ed {
		color: var(--cat-pedagogica);
	}
	.pill.hi {
		color: var(--cat-analise);
	}
</style>
