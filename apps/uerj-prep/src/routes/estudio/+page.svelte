<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	import Markdown from '$lib/components/Markdown.svelte';
	import { DISCIPLINES } from '$lib/data/official/exam-2027';
	import { formatarDuracao } from '$lib/producao';

	let { data } = $props();
	const nomeDisc = (c: string) => (DISCIPLINES as Record<string, { name: string }>)[c]?.name ?? c;
</script>

<svelte:head><title>Estúdio de aulas · {APP_NAME}</title></svelte:head>

<header class="card hero">
	<p class="eyebrow">Área de produção</p>
	<h1>Estúdio de aulas</h1>
	<p>
		Aqui ficam os projetos nível 3: para cada tópico, uma <strong>apostila completa</strong> e o <strong>roteiro da aula animada</strong>, cena por cena —
		narração integral do professor, textos na tela, elementos visuais, animação, câmera, transição e duração. Os roteiros seguem as diretrizes de produção e
		passam por uma conferência de consistência com a apostila antes de serem publicados.
	</p>
	<p class="small muted">Prioridade atual: História e Língua Portuguesa e Literaturas. Depois, a mesma metodologia nas demais disciplinas.</p>
</header>

<section class="projetos" aria-label="Projetos">
	{#each data.projetos as p (p.topicId)}
		<article class="card projeto">
			<p class="eyebrow">{nomeDisc(p.discipline)}</p>
			<h2>{p.topicTitle}</h2>
			<p class="stats">
				<span><strong class="mono">{p.episodios.length}</strong> episódios</span>
				<span><strong class="mono">{p.cenas}</strong> cenas</span>
				<span><strong class="mono">{formatarDuracao(p.duracaoSeg)}</strong> de aula</span>
				<span class="muted">revisado em {p.reviewed}</span>
			</p>
			<ol class="eps small">
				{#each p.episodios as e (e.numero)}
					<li><span class="mono">{e.numero}.</span> {e.title} <span class="muted">— {e.cenas} cenas · {formatarDuracao(e.duracaoSeg)}</span></li>
				{/each}
			</ol>
			<div class="row">
				<a class="btn primary" href="/estudio/{p.topicId}">Abrir roteiro</a>
				<a class="btn" href="/trilha/{p.topicId}/apostila">Apostila completa</a>
			</div>
		</article>
	{/each}
</section>

<section class="card">
	<details>
		<summary><h2>Diretrizes de produção</h2></summary>
		<Markdown source={data.diretrizes} />
	</details>
</section>

<section class="card">
	<details>
		<summary><h2>Diagnóstico da banca — História e Língua Portuguesa</h2></summary>
		<Markdown source={data.diagnostico} />
	</details>
</section>

<style>
	.hero h1 {
		margin: 0.2rem 0 0.5rem;
		font-family: var(--display);
		font-size: clamp(1.6rem, 4vw, 2.3rem);
	}
	.projetos {
		display: grid;
		gap: 1rem;
		margin: 1.25rem 0;
	}
	.projeto h2 {
		margin: 0.15rem 0 0.5rem;
		text-wrap: balance;
	}
	.stats {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.1rem;
		margin: 0 0 0.6rem;
	}
	.eps {
		margin: 0 0 0.9rem;
		padding-left: 0;
		list-style: none;
	}
	.eps li {
		margin: 0.25rem 0;
	}
	details summary {
		cursor: pointer;
		list-style: none;
	}
	details summary h2 {
		display: inline;
		font-size: 1.15rem;
	}
	details summary::before {
		content: '▸ ';
		color: var(--primary);
	}
	details[open] summary::before {
		content: '▾ ';
	}
</style>
