<script lang="ts">
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import SourceRef from '$lib/components/SourceRef.svelte';

	let { data } = $props();
	const o = $derived(data.obra);
	const sections = [
		['resumo', 'Resumo'],
		['contexto', 'Contexto'],
		['personagens', 'Personagens'],
		['temas', 'Temas centrais'],
		['simbolos', 'Simbolismos e elementos'],
		['linguagem', 'Linguagem'],
		['interpretacoes', 'Interpretações'],
		['relacoes', 'Relações'],
		['abordagens', 'Abordagens para a prova'],
		['questoes', 'Questões inéditas'],
		['confira', 'Confira na leitura']
	];
</script>

<svelte:head><title>{o.title} · Obras · Discursiva</title></svelte:head>

<p class="small"><a href="/obras">← Obras literárias</a></p>
<span class="small muted">{o.exam}</span>
<h1 class="title">{o.title}</h1>
<p class="muted">{o.author} · {o.genre}</p>

<div class="card official">
	<CategoryTag category="oficial" />
	<p style="margin-top:0.5rem">{o.officialNote}</p>
	<SourceRef id={o.officialSource} />
</div>

<p class="notice small" style="margin-top:1rem">
	<CategoryTag category="pedagogica" /> As análises abaixo foram elaboradas pela plataforma a partir de fontes de referência e não substituem a leitura integral. Itens que variam
	entre edições ou adaptações estão em <a href="#confira">“Confira na leitura”</a>.
</p>

<nav class="toc small" aria-label="Seções">{#each sections as [id, label] (id)}<a href="#{id}">{label}</a>{/each}</nav>

<section class="card">
	<h2>Ficha</h2>
	<dl>{#each o.ficha as f (f.label)}<dt>{f.label}</dt><dd>{f.value}</dd>{/each}</dl>
</section>

<section class="card" id="resumo">
	<h2>Resumo organizado</h2>
	{#each o.resumo as r, i (i)}<h3>{i + 1}. {r.title}</h3><p>{r.text}</p>{/each}
</section>

<section class="card" id="contexto">
	<h2>Contexto histórico</h2>
	<ul>{#each o.contexto.historico as p, i (i)}<li>{p}</li>{/each}</ul>
	<h2>Contexto literário</h2>
	<ul>{#each o.contexto.literario as p, i (i)}<li>{p}</li>{/each}</ul>
</section>

<section class="card" id="personagens">
	<h2>Análise dos personagens</h2>
	{#each o.personagens as p (p.name)}<h3>{p.name}</h3><p>{p.text}</p>{/each}
</section>

<section class="card" id="temas">
	<h2>Temas centrais</h2>
	<div class="grid cols-2">{#each o.temas as t (t.title)}<div><h3>{t.title}</h3><p class="small">{t.text}</p></div>{/each}</div>
</section>

<section class="card" id="simbolos">
	<h2>Simbolismos e elementos narrativos</h2>
	{#each o.simbolos as s (s.title)}<h3>{s.title}</h3><p>{s.text}</p>{/each}
</section>

<section class="card" id="linguagem">
	<h2>Características da linguagem</h2>
	<ul>{#each o.linguagem as p, i (i)}<li>{p}</li>{/each}</ul>
</section>

<section class="card" id="interpretacoes">
	<h2>Interpretações críticas</h2>
	<ul>{#each o.interpretacoes as p, i (i)}<li>{p}</li>{/each}</ul>
</section>

<section class="card" id="relacoes">
	<h2>Relações com o contexto social e histórico</h2>
	<ul>{#each o.relacoes as p, i (i)}<li>{p}</li>{/each}</ul>
</section>

<section class="card" id="abordagens">
	<h2>Possíveis abordagens interpretativas para a prova</h2>
	<CategoryTag category="previsao" />
	{#each o.abordagens as a (a.title)}<h3>{a.title}</h3><p>{a.text}</p>{/each}
	{#if o.slug === 'o-bem-amado'}<p><a class="btn primary" href="/redacao">Ver propostas de redação sobre a peça</a></p>{/if}
</section>

<section class="card" id="questoes">
	<div class="spread"><h2>Questões discursivas inéditas sobre a obra</h2><CategoryTag category="ia" detail="não oficiais" /></div>
	{#if data.questions.length}
		<ul>{#each data.questions as q (q.id)}<li><a href="/banco/{q.id}">{q.statement}…</a></li>{/each}</ul>
	{:else}<p class="muted">Em breve.</p>{/if}
	{#if data.user}<a class="btn small" href="/tutor?obra={o.slug}">Conversar com o professor IA sobre a obra</a>{:else}<a class="btn small" href="/cadastro">Crie uma conta para responder e ter correção</a>{/if}
</section>

<section class="card" id="confira">
	<h2>Confira na leitura</h2>
	<ul>{#each o.confiraNaLeitura as p, i (i)}<li>{p}</li>{/each}</ul>
	<h3>Referências</h3>
	<ul class="small">{#each o.referencias as r, i (i)}<li>{r}</li>{/each}</ul>
</section>

<style>
	.title {
		font-family: var(--serif);
		font-size: clamp(2rem, 5vw, 3rem);
		margin: 0.2rem 0;
	}
	.official {
		border-left: 4px solid var(--cat-oficial);
		margin-top: 1rem;
	}
	.toc {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 0.9rem;
		margin: 1rem 0;
	}
	section.card {
		margin-top: 1rem;
		scroll-margin-top: 4rem;
	}
	dl {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 0.3rem 1rem;
		margin: 0;
	}
	dt {
		font-weight: 700;
	}
	dd {
		margin: 0;
	}
</style>
