<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import DisciplineBadge from '$lib/components/DisciplineBadge.svelte';

	let { data } = $props();
</script>

<svelte:head><title>Temas em evidência · {APP_NAME}</title></svelte:head>

<h1>Temas em evidência para 2027</h1>
<p class="muted">
	Efemérides e acontecimentos recentes que podem servir de ponto de partida para as questões. As datas são fatos; a cobrança é uma <strong>hipótese</strong>, nunca garantia —
	estude o programa inteiro.
</p>

<section class="card">
	<div class="spread"><h2>Por que olhar para efemérides?</h2><CategoryTag category="analise" /></div>
	<p>
		A UERJ costuma abrir questões de História com um aniversário histórico ou com uma notícia do próprio ano. Exemplos verificáveis no banco oficial ({data.evidencias.length}
		questões):
	</p>
	<ul class="ev">
		{#each data.evidencias as e (e.id)}
			<li><a href="/banco/{e.id}"><strong>UERJ {e.year} · Q{String(e.number).padStart(2, '0')}</strong></a> — {e.gancho}. <span class="small muted">Objetivo oficial: {e.objective}</span></li>
		{/each}
	</ul>
</section>

{#each data.grupos as g (g.grupo)}
	<section class="card">
		<div class="spread"><h2>{g.grupo}</h2><CategoryTag category="previsao" /></div>
		<div class="temas">
			{#each g.temas as t (t.marco)}
				<article class="tema">
					<div class="row">{#each t.disciplinas as d (d)}<DisciplineBadge code={d} />{/each}<span class="small muted">{t.data}</span></div>
					<h3>{t.marco}</h3>
					<p class="small">{t.porque}</p>
					<ul class="small">{#each t.angulos as a, i (i)}<li>{a}</li>{/each}</ul>
					<p class="small links">
						Estudar:
						{#each t.topics as tp, i (tp.id)}{#if i > 0} · {/if}<a href="/trilha/{tp.id}">{tp.title}</a>{#if tp.editorial}<span class="pill ed">resumo aprofundado</span>{/if}{/each}
					</p>
				</article>
			{/each}
		</div>
	</section>
{/each}

<style>
	section.card {
		margin-top: 1rem;
	}
	.ev {
		padding-left: 1.1rem;
	}
	.ev li {
		margin: 0.35rem 0;
	}
	.temas {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
	}
	.tema {
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 0.9rem;
	}
	.tema h3 {
		margin: 0.4rem 0;
	}
	.tema ul {
		padding-left: 1.1rem;
	}
	.pill.ed {
		margin-left: 0.3rem;
		color: var(--cat-pedagogica);
	}
</style>
