<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import Player from '$lib/cinema/Player.svelte';
	import { montarEpisodios } from '$lib/cinema/aulas';
	import { cronograma } from '$lib/cinema/tempo';
	import { getTopic } from '$lib/domain/syllabus';
	import { especialDe } from '$lib/especiais';

	let { data } = $props();
	const episodios = $derived(data.modo === 'roteiro' ? data.prontos : montarEpisodios(data.topic.id, data.topic.title, data.episodios));
	const totalCenas = $derived(episodios.reduce((s, e) => s + e.cenas.filter((c) => !c.abertura).length, 0));
	const sobMedida = $derived(episodios.reduce((s, e) => s + e.sobMedida, 0));
	const minutos = $derived(Math.round(episodios.reduce((s, e) => s + e.cenas.reduce((a, c) => a + (c.abertura ? 6 : cronograma(c.narracao).total), 0), 0) / 60));
	const nome = (id: string | null) => (id ? (getTopic(id)?.topic.title ?? especialDe(id)?.titulo ?? id) : '');
</script>

<svelte:head><title>Aula animada: {data.topic.title} · {APP_NAME}</title></svelte:head>

<nav class="crumbs small" aria-label="Caminho">
	<a href="/aulas">Aulas animadas</a> <span aria-hidden="true">›</span>
	{#if data.especial}<span>Série especial · {data.especial.grupo}</span> <span aria-hidden="true">›</span>{/if}
	<span>{data.topic.title}</span>
</nav>

<header class="cabeca">
	<p class="eyebrow">Aula animada · {episodios.length} {episodios.length === 1 ? 'parte' : 'partes'} · {totalCenas} cenas · cerca de {minutos} min</p>
	<h1>{data.topic.title}</h1>
	<div class="tags">
		<CategoryTag category="pedagogica" detail="roteiro baseado no resumo revisado e nas questões oficiais" />
		<CategoryTag category="ia" detail="animação, encenação e voz geradas por computador" />
	</div>
</header>

{#key data.topic.id}
	<Player {episodios} />
{/key}

<section class="card notas" aria-labelledby="notas-titulo">
	<h2 id="notas-titulo">Sobre esta aula</h2>
	<ul class="small">
		{#if data.modo === 'roteiro'}
			<li>Todas as {totalCenas} cenas são animadas a partir do roteiro: mapas, linhas do tempo, quadros e personagens entram na hora em que o assunto é dito.</li>
		{:else}
			<li><strong>{sobMedida} de {totalCenas} cenas</strong> têm animação feita sob medida; as demais usam a encenação automática do roteiro.</li>
		{/if}
		<li>A narração é lida pela voz sintetizada do seu aparelho; se preferir, desligue a voz e acompanhe pelas legendas. As vozes “neural” do Edge, do Chrome e do Safari soam mais naturais.</li>
		<li>Pessoas reais aparecem como <strong>silhuetas com nome</strong>, sem imitar rostos; documentos e jornais são <strong>recriações genéricas</strong> e só mostram trechos conferidos.</li>
	</ul>
	{#if data.especial}
		<div class="row">
			{#if data.especial.temResumo}<a class="btn primary" href="/aulas/{data.topic.id}/resumo">Resumo aprofundado</a>{/if}
		</div>
		<p class="small muted">Tópicos do programa que esta aula aprofunda:</p>
		<div class="row">
			{#each data.especial.relacionados as t (t.id)}<a class="btn" href="/trilha/{t.id}">{t.title}</a>{/each}
		</div>
	{:else}
		<div class="row">
			{#if data.temApostila}<a class="btn" href="/trilha/{data.topic.id}/apostila">Apostila completa</a>{/if}
			{#if data.temEstudio}<a class="btn" href="/estudio/{data.topic.id}">Roteiro cena por cena</a>{/if}
			<a class="btn" href="/trilha/{data.topic.id}">Resumo e questões do tópico</a>
		</div>
	{/if}
	{#if data.referencias.length}
		<details class="refs">
			<summary class="small">Fontes do conteúdo</summary>
			<ul class="small">
				{#each data.referencias as r, i (i)}<li>{r}</li>{/each}
			</ul>
		</details>
	{/if}
	<p class="small muted">Revisado em {data.reviewed}. Atalhos: espaço (tocar/pausar), ← → (frase anterior/seguinte), N/P (cena), C (legendas), F (tela cheia).</p>
</section>

<nav class="vizinhos" aria-label="Outras aulas">
	{#if data.vizinhos.anterior}<a class="btn" href="/aulas/{data.vizinhos.anterior}">← {nome(data.vizinhos.anterior)}</a>{/if}
	{#if data.vizinhos.proximo}<a class="btn" href="/aulas/{data.vizinhos.proximo}">{nome(data.vizinhos.proximo)} →</a>{/if}
</nav>

<style>
	.crumbs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin-bottom: 0.75rem;
		color: var(--muted);
	}
	.cabeca {
		margin-bottom: 1rem;
	}
	.cabeca h1 {
		margin: 0.15rem 0 0.6rem;
		font-family: var(--display);
		font-size: clamp(1.5rem, 3.8vw, 2.3rem);
		text-wrap: balance;
	}
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.notas {
		margin-top: 1.25rem;
	}
	.notas h2 {
		margin-top: 0;
	}
	.notas li {
		margin-bottom: 0.45rem;
	}
	.refs ul {
		overflow-wrap: anywhere;
	}
	.vizinhos {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.6rem;
		margin-top: 1rem;
	}
	.vizinhos .btn {
		max-width: 100%;
		white-space: normal;
	}
</style>
