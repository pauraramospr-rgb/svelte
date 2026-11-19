<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import Player from '$lib/cinema/Player.svelte';
	import { montarEpisodios } from '$lib/cinema/aulas';

	let { data } = $props();
	const episodios = $derived(montarEpisodios(data.topic.id, data.topic.title, data.episodios));
	const sobMedida = $derived(episodios.reduce((s, e) => s + e.sobMedida, 0));
	const total = $derived(episodios.reduce((s, e) => s + e.cenas.filter((c) => !c.abertura).length, 0));
</script>

<svelte:head><title>Aula animada: {data.topic.title} · {APP_NAME}</title></svelte:head>

<nav class="crumbs small" aria-label="Caminho">
	<a href="/aulas">Aulas animadas</a> <span aria-hidden="true">›</span>
	<span>{data.topic.title}</span>
</nav>

<header class="cabeca">
	<p class="eyebrow">Aula animada · {data.episodios.length} episódios · cerca de {Math.round(data.duracaoSeg / 60)} min</p>
	<h1>{data.topic.title}</h1>
	<div class="tags">
		<CategoryTag category="pedagogica" detail="roteiro baseado na apostila revisada" />
		<CategoryTag category="ia" detail="animação, encenação e voz geradas por computador" />
	</div>
</header>

<Player {episodios} />

<section class="card notas" aria-labelledby="notas-titulo">
	<h2 id="notas-titulo">Sobre esta produção</h2>
	<ul class="small">
		<li>
			<strong>{sobMedida} de {total} cenas</strong> têm animação feita sob medida (todo o Episódio 1). Nas demais, a encenação é montada automaticamente
			a partir do roteiro — textos na tela, objetos e personagens previstos para a cena — enquanto as animações completas são produzidas.
		</li>
		<li>A narração é a do roteiro revisado, lida pela voz sintetizada do seu aparelho. Se preferir, desligue a voz e acompanhe pelas legendas.</li>
		<li>
			Pessoas reais aparecem como <strong>silhuetas com nome</strong>, sem imitar rostos. Capas de jornal e documentos são <strong>recriações genéricas</strong>:
			só aparecem na tela os trechos citados e conferidos na apostila (como o artigo 10 do AI-5 e a frase da certidão de 2025).
		</li>
		<li>O episódio 2 trata de violência política (tortura e mortes) sem imagens explícitas.</li>
	</ul>
	<div class="row">
		{#if data.temApostila}<a class="btn" href="/trilha/{data.topic.id}/apostila">Apostila completa</a>{/if}
		<a class="btn" href="/estudio/{data.topic.id}">Roteiro cena por cena</a>
		<a class="btn" href="/trilha/{data.topic.id}">Tópico na trilha</a>
	</div>
	<p class="small muted">Roteiro revisado em {data.reviewed}. Atalhos: espaço (tocar/pausar), ← → (frase anterior/seguinte), N/P (cena), C (legendas), F (tela cheia).</p>
</section>

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
</style>
