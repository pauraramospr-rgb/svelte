<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import SourceRef from '$lib/components/SourceRef.svelte';
	import DisciplineBadge from '$lib/components/DisciplineBadge.svelte';
	import { EXAM_2027, COMPETENCIAS_2027, DISCIPLINES, type DisciplineCode } from '$lib/data/official/exam-2027';
	import { PASSOS, FASES, REGRAS, VERBOS, DISCIPLINAS, CHECKLIST, PALESTRAS } from '$lib/data/content/guia';

	let { data } = $props();
	const rules = EXAM_2027.rules.filter((r) => ['item 4.29.5', 'item 4.28.1', 'item 4.31', 'item 5.2', 'item 5.4', 'item 4.16'].includes(r.ref));
	const pct = $derived(Math.round((data.stats.multi / data.stats.total) * 100));
	const maxVerb = $derived(data.stats.verbs[0]?.count ?? 1);

	const TABS = [
		['passos', 'Passo a passo'],
		['comandos', 'O que cada comando pede'],
		['materias', 'Por matéria'],
		['banca', 'O que a banca valoriza'],
		['checklist', 'Checklist'],
		['oficial', 'Base oficial']
	] as const;
	type Tab = (typeof TABS)[number][0];
	let tab = $state<Tab>('passos');
	let disc = $state('LPL');
	let checked = $state<boolean[]>(CHECKLIST.map(() => false));
	const dicas = $derived(DISCIPLINAS.find((d) => d.code === disc));
	const verbosDisc = $derived(data.stats.byDiscipline[disc]);
</script>

<svelte:head><title>Como responder à UERJ · {APP_NAME}</title></svelte:head>

<header class="head">
	<span class="eyebrow">Guia</span>
	<h1>Como responder à UERJ</h1>
	<p class="lead muted">
		O método para transformar o que você sabe em pontos: as regras de ouro, o passo a passo na hora da prova e o que cada comando pede — a partir do edital, das
		{data.stats.total} questões oficiais de {data.years[0]} a {data.years[data.years.length - 1]} e dos comentários da banca.
	</p>
</header>

<section class="rules" aria-labelledby="regras">
	<h2 id="regras" class="sr-only">Regras de ouro</h2>
	{#each REGRAS as r, i (r.title)}
		<article class="rule">
			<span class="n num">{i + 1}</span>
			<h3>{r.title}</h3>
			<p class="small">{r.text}</p>
		</article>
	{/each}
</section>
<p class="small muted stat">
	<span class="mark"><strong>{pct}%</strong> das questões oficiais têm dois ou mais comandos</span> — responder só ao primeiro é a causa mais comum de crédito parcial.
</p>

<div class="tabs" role="tablist" aria-label="Partes do guia">
	{#each TABS as [id, label] (id)}
		<button role="tab" id="tab-{id}" aria-selected={tab === id} aria-controls="painel-{id}" onclick={() => (tab = id)}>{label}</button>
	{/each}
</div>

<div class="panel" role="tabpanel" id="painel-{tab}" aria-labelledby="tab-{tab}" tabindex="0">
	{#if tab === 'passos'}
		<div class="spread"><h2>Passo a passo na hora da prova</h2><CategoryTag category="pedagogica" /></div>
		<p class="muted small">Quatro fases, sempre na mesma ordem. Treine até virar hábito.</p>
		<ol class="fases">
			{#each FASES as f, fi (f.nome)}
				<li class="fase card">
					<span class="eyebrow">Fase {fi + 1}</span>
					<h3>{f.nome}</h3>
					<p class="small muted">{f.resumo}</p>
					<ol class="passos">
						{#each f.passos as pi (pi)}
							<li><strong>{PASSOS[pi].title}.</strong> <span class="small">{PASSOS[pi].text}</span></li>
						{/each}
					</ol>
				</li>
			{/each}
		</ol>
	{:else if tab === 'comandos'}
		<div class="spread"><h2>O que cada comando pede</h2><CategoryTag category="pedagogica" /></div>
		<p class="muted small">O verbo do comando diz o tipo de resposta. Veja o que precisa aparecer e um modelo de frase.</p>
		<div class="verbos">
			{#each VERBOS as v (v.verbo)}
				<article class="card verbo">
					<h3>{v.verbo}</h3>
					<p class="small">{v.espera}</p>
					<p class="modelo small"><span class="eyebrow">Modelo</span>{v.modelo}</p>
				</article>
			{/each}
		</div>
	{:else if tab === 'materias'}
		<div class="spread"><h2>Dicas por matéria</h2><CategoryTag category="pedagogica" /></div>
		<div class="chips" role="group" aria-label="Escolha a matéria">
			{#each DISCIPLINAS as d (d.code)}
				<button class="btn small" class:primary={disc === d.code} aria-pressed={disc === d.code} onclick={() => (disc = d.code)}>
					{DISCIPLINES[d.code as DisciplineCode]?.short ?? d.code}
				</button>
			{/each}
		</div>
		{#if dicas}
			<div class="grid cols-2 materia">
				<div class="card">
					<h3><DisciplineBadge code={dicas.code} long /></h3>
					<ul>{#each dicas.dicas as t, i (i)}<li>{t}</li>{/each}</ul>
				</div>
				{#if verbosDisc}
					<div class="card">
						<h3>Comandos mais frequentes</h3>
						<p class="small muted">Em {verbosDisc.questions} questões oficiais desta matéria.</p>
						<ul class="bars">
							{#each verbosDisc.verbs as v (v.verb)}
								<li><span>{v.verb}</span><span class="bar"><span style="width:{(v.count / verbosDisc.verbs[0].count) * 100}%"></span></span><span class="num small">{v.count}</span></li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		{/if}
	{:else if tab === 'banca'}
		<div class="spread"><h2>O que os comentários oficiais revelam</h2><CategoryTag category="pedagogica" detail="padrões oficiais" /></div>
		<div class="grid cols-2">
			{#each data.padroes as p (p.title)}
				<article class="card">
					<h3>{p.title}</h3>
					<p class="small">{p.text}</p>
					<p class="small muted"><strong>Exemplo:</strong> {p.exemplo}</p>
					<a class="small" href="/banco/{p.id}">Ver {p.ref} →</a>
				</article>
			{/each}
		</div>
		<SourceRef id="questoes-comentadas" />
	{:else if tab === 'checklist'}
		<div class="spread"><h2>Checklist antes de passar a limpo</h2><span class="pill num">{checked.filter(Boolean).length}/{CHECKLIST.length}</span></div>
		<ul class="check card">
			{#each CHECKLIST as c, i (i)}
				<li><label><input type="checkbox" id="chk-{i}" bind:checked={checked[i]} /> <span>{c}</span></label></li>
			{/each}
		</ul>
	{:else}
		<div class="spread"><h2>O que é oficial sobre a correção</h2><CategoryTag category="oficial" /></div>
		<div class="card">
			<ul>{#each rules as r (r.ref)}<li>{r.text} <span class="small muted">({r.ref})</span></li>{/each}</ul>
			<SourceRef id="edital-2027" />
		</div>
		<h3>Competências avaliadas (Anexo 4)</h3>
		<div class="grid cols-3">
			{#each COMPETENCIAS_2027 as c (c.group)}
				<div class="card"><strong>{c.group}</strong><p class="small">{c.verbs.join(', ')}</p></div>
			{/each}
		</div>
		<SourceRef id="anexo4-2027" />
		<h3>Verbos de comando mais frequentes (todas as matérias)</h3>
		<div class="card">
			<ul class="bars">
				{#each data.stats.verbs.slice(0, 12) as v (v.verb)}
					<li><span>{v.verb}</span><span class="bar"><span style="width:{(v.count / maxVerb) * 100}%"></span></span><span class="num small">{v.count}</span></li>
				{/each}
			</ul>
			<p class="small muted">Número de questões em que cada verbo aparece (uma questão pode ter vários). Contagem automática sobre o texto dos cadernos oficiais.</p>
		</div>
		<h3>Palestras da UERJ sobre os livros do Exame Discursivo</h3>
		<ul class="small">{#each PALESTRAS as p (p.livro)}<li><strong>{p.livro}</strong> — {p.quem}, {p.quando}</li>{/each}</ul>
		<p class="small muted">Programação divulgada em março de 2026; confirme datas e eventual gravação no site do Vestibular UERJ.</p>
	{/if}
</div>

<section class="card treine">
	<h2>Treine o método</h2>
	<p>
		Responda questões oficiais no <a href="/banco">banco</a> e compare com o comentário da banca, faça um <a href="/simulados">simulado</a> ou peça ao
		<a href="/tutor">professor IA</a> para corrigir sua resposta parte por parte.
	</p>
</section>

<style>
	.head {
		max-width: 72ch;
		margin-bottom: 1.2rem;
	}
	.lead {
		font-size: 1.05rem;
	}
	.rules {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 165px), 1fr));
		gap: 0.8rem;
	}
	.rule {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 1rem 1.05rem;
		box-shadow: var(--shadow);
		display: grid;
		gap: 0.3rem;
		align-content: start;
	}
	.rule .n {
		width: 2rem;
		height: 2rem;
		display: grid;
		place-items: center;
		border-radius: 10px;
		background: var(--ink-panel);
		color: var(--mark);
		font-weight: 700;
	}
	.rule h3 {
		margin: 0.25rem 0 0;
		font-size: 1rem;
	}
	.rule p {
		margin: 0;
		color: var(--muted);
	}
	.stat {
		margin: 0.9rem 0 1.4rem;
	}
	.panel {
		margin-top: 1rem;
	}
	.fases {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
		gap: 0.9rem;
	}
	.fase h3 {
		margin: 0;
		font-size: 1.25rem;
	}
	.fase .eyebrow {
		color: var(--primary);
		margin: 0;
	}
	.passos {
		padding-left: 1.15rem;
		margin: 0.6rem 0 0;
		display: grid;
		gap: 0.55rem;
	}
	.verbos {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
		gap: 0.9rem;
	}
	.verbo h3 {
		font-size: 1rem;
	}
	.modelo {
		margin: 0.4rem 0 0;
		padding: 0.6rem 0.75rem;
		background: var(--surface-2);
		border-radius: 10px;
		font-style: italic;
	}
	.modelo .eyebrow {
		font-style: normal;
		margin-bottom: 0.15rem;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin: 0.4rem 0 1rem;
	}
	.materia ul {
		padding-left: 1.1rem;
	}
	.bars {
		list-style: none;
		padding: 0;
		margin: 0.6rem 0;
		display: grid;
		gap: 0.35rem;
	}
	.bars li {
		display: grid;
		grid-template-columns: 7.5rem 1fr 2.5rem;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
	}
	.bars .bar > span {
		background: var(--cat-analise);
	}
	.bars .num {
		text-align: right;
	}
	.check {
		list-style: none;
		padding: 0.6rem 1.1rem;
		margin: 0.6rem 0 0;
	}
	.check li {
		padding: 0.45rem 0;
		border-bottom: 1px solid var(--border);
	}
	.check li:last-child {
		border-bottom: 0;
	}
	.check label {
		display: flex;
		gap: 0.6rem;
		align-items: flex-start;
		font-weight: 500;
		margin: 0;
		cursor: pointer;
	}
	.check input {
		width: 1.1rem;
		height: 1.1rem;
		min-height: 0;
		margin-top: 0.25rem;
		flex: none;
		accent-color: var(--primary);
	}
	.panel h3 {
		margin-top: 1.2rem;
	}
	.treine {
		margin-top: 1.5rem;
	}
</style>
