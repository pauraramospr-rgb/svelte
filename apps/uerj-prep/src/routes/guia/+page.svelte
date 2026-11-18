<script lang="ts">
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import SourceRef from '$lib/components/SourceRef.svelte';
	import DisciplineBadge from '$lib/components/DisciplineBadge.svelte';
	import { EXAM_2027, COMPETENCIAS_2027 } from '$lib/data/official/exam-2027';
	import { PASSOS, VERBOS, DISCIPLINAS, CHECKLIST, PALESTRAS } from '$lib/data/content/guia';

	let { data } = $props();
	const rules = EXAM_2027.rules.filter((r) => ['item 4.29.5', 'item 4.28.1', 'item 4.31', 'item 5.2', 'item 5.4', 'item 4.16'].includes(r.ref));
	const pct = $derived(Math.round((data.stats.multi / data.stats.total) * 100));
	const maxVerb = $derived(data.stats.verbs[0]?.count ?? 1);
	let checked = $state<boolean[]>(CHECKLIST.map(() => false));
</script>

<svelte:head><title>Como responder à UERJ · Discursiva</title></svelte:head>

<h1>Como responder exatamente o que a UERJ quer</h1>
<p class="muted">
	Um método passo a passo construído a partir do que é oficial (edital e Anexo 4), do que as provas mostram ({data.stats.total} questões oficiais de {data.years.join(', ')})
	e da leitura dos comentários da banca. A UERJ não publica uma “fórmula” de resposta: o método abaixo é interpretação pedagógica, identificada como tal.
</p>

<nav class="toc small" aria-label="Seções">
	<a href="#oficial">O que é oficial</a><a href="#comandos">Os comandos</a><a href="#padrao">O padrão da banca</a><a href="#passos">Passo a passo</a><a href="#verbos"
		>Resposta por verbo</a
	><a href="#disciplinas">Por disciplina</a><a href="#checklist">Checklist</a>
</nav>

<section class="card" id="oficial">
	<div class="spread"><h2>1. O que é oficial sobre a correção</h2><CategoryTag category="oficial" /></div>
	<ul>
		{#each rules as r (r.ref)}<li>{r.text} <span class="small muted">({r.ref})</span></li>{/each}
	</ul>
	<SourceRef id="edital-2027" />
	<h3>Competências avaliadas (Anexo 4)</h3>
	<p class="small">Os verbos dos comandos vêm dessas competências. Saber em que grupo está o verbo diz que tipo de resposta é esperada.</p>
	<div class="comp">
		{#each COMPETENCIAS_2027 as c (c.group)}
			<div><strong>{c.group}</strong><p class="small">{c.verbs.join(', ')}</p></div>
		{/each}
	</div>
	<SourceRef id="anexo4-2027" />
</section>

<section class="card" id="comandos">
	<div class="spread"><h2>2. Como os comandos aparecem nas provas</h2><CategoryTag category="analise" /></div>
	<p>
		<strong>{pct}%</strong> das {data.stats.total} questões oficiais analisadas ({data.stats.multi}) têm <strong>dois ou mais verbos de comando</strong>. Cada parte conta: responder só
		à primeira é a causa mais comum de crédito parcial.
	</p>
	<ul class="bars" aria-label="Verbos de comando mais frequentes">
		{#each data.stats.verbs.slice(0, 12) as v (v.verb)}
			<li><span class="verb">{v.verb}</span><span class="bar" style="width:{(v.count / maxVerb) * 100}%"></span><span class="n">{v.count}</span></li>
		{/each}
	</ul>
	<p class="small muted">Número de questões em que cada verbo aparece no enunciado (uma questão pode ter vários). Contagem automática sobre o texto extraído dos cadernos oficiais.</p>
	<h3>Verbos mais frequentes por disciplina</h3>
	<div class="disc">
		{#each Object.entries(data.stats.byDiscipline) as [code, d] (code)}
			<div><DisciplineBadge {code} /> <span class="small muted">{d.questions} questões</span><p class="small">{d.verbs.map((v) => `${v.verb} (${v.count})`).join(', ')}</p></div>
		{/each}
	</div>
</section>

<section class="card" id="padrao">
	<div class="spread"><h2>3. O que os comentários oficiais revelam</h2><CategoryTag category="pedagogica" detail="padrões oficiais" /></div>
	{#each data.padroes as p (p.title)}
		<article class="padrao">
			<h3>{p.title}</h3>
			<p>{p.text}</p>
			<p class="small ex"><strong>Exemplo:</strong> {p.exemplo} <a href="/banco/{p.id}">{p.ref} →</a></p>
		</article>
	{/each}
	<SourceRef id="questoes-comentadas" />
</section>

<section class="card" id="passos">
	<div class="spread"><h2>4. Passo a passo na hora da prova</h2><CategoryTag category="pedagogica" /></div>
	<ol class="passos">
		{#each PASSOS as p, i (i)}<li><strong>{p.title}.</strong> {p.text}</li>{/each}
	</ol>
</section>

<section class="card" id="verbos">
	<div class="spread"><h2>5. O que cada verbo pede</h2><CategoryTag category="pedagogica" /></div>
	<div class="table-wrap">
		<table class="stack">
			<thead><tr><th>Comando</th><th>O que a resposta precisa ter</th><th>Modelo de frase</th></tr></thead>
			<tbody>
				{#each VERBOS as v (v.verbo)}<tr><td><strong>{v.verbo}</strong></td><td data-label="Precisa ter">{v.espera}</td><td data-label="Modelo"><em>{v.modelo}</em></td></tr>{/each}
			</tbody>
		</table>
	</div>
</section>

<section class="card" id="disciplinas">
	<div class="spread"><h2>6. Dicas por disciplina</h2><CategoryTag category="pedagogica" /></div>
	<div class="grid cols-2">
		{#each DISCIPLINAS as d (d.code)}
			<div>
				<h3><DisciplineBadge code={d.code} long /></h3>
				<ul class="small">{#each d.dicas as t, i (i)}<li>{t}</li>{/each}</ul>
			</div>
		{/each}
	</div>
</section>

<section class="card" id="checklist">
	<div class="spread"><h2>7. Checklist antes de passar a limpo</h2><CategoryTag category="pedagogica" /></div>
	<ul class="check">
		{#each CHECKLIST as c, i (i)}
			<li><label><input type="checkbox" bind:checked={checked[i]} /> {c}</label></li>
		{/each}
	</ul>
	<p class="small muted">{checked.filter(Boolean).length} de {CHECKLIST.length} itens conferidos.</p>
</section>

<section class="card">
	<h2>Treine o método</h2>
	<p>
		Responda questões oficiais no <a href="/banco">banco</a> e compare com o comentário da banca; faça um <a href="/simulados">simulado</a>; peça ao
		<a href="/tutor">professor IA</a> para corrigir sua resposta parte por parte. Para os livros, veja os trechos comentados de
		<a href="/obras/luanda-lisboa-paraiso">Luanda, Lisboa, Paraíso</a> e a análise de <a href="/obras/o-bem-amado">O bem-amado</a>.
	</p>
	<h3>Palestras da UERJ sobre os livros do Exame Discursivo</h3>
	<ul class="small">
		{#each PALESTRAS as p (p.livro)}<li><strong>{p.livro}</strong> — {p.quem}, {p.quando}</li>{/each}
	</ul>
	<p class="small muted">Programação divulgada em março de 2026 para a edição 2027; confirme datas e eventual gravação no site do Vestibular UERJ. Não encontramos vídeos oficiais sobre “como responder”.</p>
</section>

<style>
	section.card {
		margin-top: 1rem;
		scroll-margin-top: 4rem;
	}
	.toc {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 0.9rem;
		margin: 1rem 0;
	}
	.comp,
	.disc {
		display: grid;
		gap: 0.6rem 1rem;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
	}
	.bars {
		list-style: none;
		padding: 0;
		margin: 0.75rem 0;
		display: grid;
		gap: 0.3rem;
	}
	.bars li {
		display: grid;
		grid-template-columns: 7.5rem 1fr 2.5rem;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
	}
	.bars .bar {
		height: 0.7rem;
		border-radius: 4px;
		background: var(--cat-analise);
		min-width: 2px;
	}
	.bars .n {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.padrao {
		border-top: 1px solid var(--border);
		padding-top: 0.6rem;
		margin-top: 0.6rem;
	}
	.padrao h3 {
		margin: 0 0 0.3rem;
	}
	.ex {
		color: var(--muted);
	}
	.passos li {
		margin: 0.45rem 0;
	}
	.check {
		list-style: none;
		padding: 0;
	}
	.check li {
		margin: 0.35rem 0;
	}
	.check input {
		width: auto;
		margin-right: 0.4rem;
	}
</style>
