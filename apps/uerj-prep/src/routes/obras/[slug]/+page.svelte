<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import SourceRef from '$lib/components/SourceRef.svelte';

	let { data } = $props();
	const o = $derived(data.obra);
	const sections = $derived(
		[
			['resumo', 'Resumo'],
			['linha', 'Linha do tempo', !!o.linhaDoTempo],
			['contexto', 'Contexto'],
			['personagens', 'Personagens'],
			['espacos', 'Espaços', !!o.espacos],
			['elementos', o.slug === 'o-bem-amado' ? 'Elementos do texto teatral' : 'Elementos da narrativa', !!o.elementos],
			['trechos', 'Trechos comentados', !!o.trechos],
			['gramatica', 'Gramática na obra', !!o.gramatica],
			['temas', 'Temas centrais'],
			['simbolos', 'Simbolismos'],
			['linguagem', 'Linguagem'],
			['interpretacoes', 'Interpretações'],
			['relacoes', 'Relações'],
			['abordagens', 'Abordagens para a prova'],
			['questoes', 'Questões inéditas'],
			['confira', 'Confira na leitura']
		].filter((s) => s[2] !== false) as [string, string][]
	);
</script>

<svelte:head><title>{o.title} · Obras · {APP_NAME}</title></svelte:head>

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

{#if o.linhaDoTempo}
	<section class="card" id="linha">
		<h2>Linha do tempo</h2>
		<ol class="timeline">
			{#each o.linhaDoTempo as t, i (i)}<li><strong>{t.quando}</strong><span>{t.fato}</span></li>{/each}
		</ol>
	</section>
{/if}

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

{#if o.espacos}
	<section class="card" id="espacos">
		<h2>Os espaços e suas funções</h2>
		<p class="small muted">Os espaços não são apenas cenários: eles participam da transformação das personagens.</p>
		<div class="table-wrap">
			<table class="stack">
				<thead><tr><th>Espaço</th><th>Função na narrativa</th><th>Na obra</th></tr></thead>
				<tbody>{#each o.espacos as e (e.lugar)}<tr><td><strong>{e.lugar}</strong></td><td data-label="Função">{e.funcao}</td><td data-label="Na obra">{e.naObra}</td></tr>{/each}</tbody>
			</table>
		</div>
	</section>
{/if}

{#if o.elementos}
	<section class="card" id="elementos">
		<h2>{o.slug === 'o-bem-amado' ? 'Elementos do texto teatral' : 'Elementos da narrativa'}</h2>
		<p class="small muted">Conceito + aplicação: é assim que a UERJ espera que você responda — nomear o elemento e mostrá-lo funcionando na obra.</p>
		<div class="table-wrap">
			<table class="stack">
				<thead><tr><th>Elemento</th><th>O que significa</th><th>Aplicação na obra</th></tr></thead>
				<tbody>{#each o.elementos as e (e.elemento)}<tr><td><strong>{e.elemento}</strong></td><td data-label="Conceito">{e.conceito}</td><td data-label="Na obra">{e.naObra}</td></tr>{/each}</tbody>
			</table>
		</div>
	</section>
{/if}

{#if o.trechos}
	<section class="card" id="trechos">
		<h2>Trechos comentados</h2>
		<p class="small muted">Citações curtas, para estudo e crítica (Lei 9.610/98, art. 46, III), identificadas por capítulo — a paginação muda conforme a edição.</p>
		{#each o.trechos as t (t.ref)}
			<article class="trecho">
				<h3>{t.ref}</h3>
				<blockquote>{t.texto}</blockquote>
				<p><strong>Leitura:</strong> {t.leitura}</p>
				<ul class="recursos">{#each t.recursos as r (r.nome)}<li><strong>{r.nome}.</strong> {r.comentario}</li>{/each}</ul>
			</article>
		{/each}
	</section>
{/if}

{#if o.gramatica}
	<section class="card" id="gramatica">
		<h2>Gramática a partir da obra</h2>
		<p class="small muted">Cada item corresponde a um conteúdo do programa oficial de Língua Portuguesa (Anexo 5). A UERJ cobra gramática sempre ligada ao sentido do texto.</p>
		<div class="table-wrap">
			<table class="stack">
				<thead><tr><th>Fenômeno</th><th>Item do programa</th><th>Exemplo</th><th>Análise e efeito</th></tr></thead>
				<tbody>{#each o.gramatica as g (g.item)}<tr><td><strong>{g.item}</strong></td><td class="small" data-label="Programa">{g.programa}</td><td data-label="Exemplo"><em>{g.exemplo}</em></td><td data-label="Análise">{g.analise}</td></tr>{/each}</tbody>
			</table>
		</div>
	</section>
{/if}

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
	.timeline {
		list-style: none;
		padding: 0;
		margin: 0;
		border-left: 2px solid var(--border);
	}
	.timeline li {
		position: relative;
		padding: 0.35rem 0 0.35rem 1rem;
		display: grid;
		gap: 0.1rem;
	}
	.timeline li::before {
		content: '';
		position: absolute;
		left: -6px;
		top: 0.75rem;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--primary);
	}
	.trecho {
		border-top: 1px solid var(--border);
		padding-top: 0.75rem;
		margin-top: 0.75rem;
	}
	.trecho blockquote {
		font-family: var(--serif);
		font-size: 1.05rem;
		border-left: 3px solid var(--cat-pedagogica);
		margin: 0.5rem 0;
		padding: 0.25rem 0 0.25rem 0.9rem;
	}
	.recursos {
		padding-left: 1.1rem;
	}
	.recursos li {
		margin: 0.2rem 0;
	}
</style>
