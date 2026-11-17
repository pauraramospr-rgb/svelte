<script lang="ts">
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import SourceRef from '$lib/components/SourceRef.svelte';
	import { REDACAO_2027, REDACAO_ASPECTS, PADRAO_REDACAO_2026_EXCERPT } from '$lib/data/official/exam-2027';
	import { REDACAO_HISTORY, REDACAO_PATTERNS } from '$lib/data/official/redacao-history';
	import { TEMAS_2027 } from '$lib/data/content/redacao-temas';
	import { ASPECT_VALUE } from '$lib/domain/essay';

	let { data } = $props();
	const evo = $derived(data.essays.filter((e) => e.score !== null).reverse());
</script>

<svelte:head><title>Laboratório de redação · Discursiva</title></svelte:head>

<div class="spread">
	<div>
		<h1>Laboratório de redação</h1>
		<p class="muted">Tema de 2027 a partir de <em>{REDACAO_2027.book.title}</em>, de {REDACAO_2027.book.author}. <a href="/obras/o-bem-amado">Estude a obra →</a></p>
	</div>
	<a class="btn primary" href="/redacao/escrever">Escrever redação</a>
</div>

<section class="card">
	<div class="spread"><h2>O que a UERJ avalia</h2><CategoryTag category="oficial" /></div>
	<p>{REDACAO_2027.orientation}</p>
	<p><strong>{REDACAO_2027.format}</strong> {REDACAO_2027.aspectsText}</p>
	<SourceRef id="anexo5-2027" ref="Redação – Orientação geral" />
	<blockquote class="small">“{PADRAO_REDACAO_2026_EXCERPT}”</blockquote>
	<SourceRef id="padrao-redacao-2026" />
	<details style="margin-top:0.8rem">
		<summary>Como a plataforma estima a nota (metodologia explícita)</summary>
		<p class="small">
			A UERJ informa que a Redação vale 20 pontos (edital, item 4.1), lista os aspectos avaliados (Anexo 5) e prevê nota zero para vocabulário de baixo calão
			(item 4.16) e para identificação do candidato (item 5.4). <strong>Ela não divulga quanto vale cada aspecto.</strong> Por isso, a estimativa da plataforma
			usa os {REDACAO_ASPECTS.length} aspectos do padrão de respostas com pesos iguais ({ASPECT_VALUE.toFixed(2)} pontos cada): atende = 100%, atende
			parcialmente = 50%, não atende = 0%. Use a nota como termômetro de evolução, não como previsão da nota oficial.
		</p>
		<ol class="small">{#each REDACAO_ASPECTS as a (a.id)}<li><strong>{a.label}</strong> — “{a.official}”</li>{/each}</ol>
		<CategoryTag category="pedagogica" />
	</details>
</section>

<section class="card">
	<div class="spread"><h2>Propostas plausíveis para 2027</h2><CategoryTag category="previsao" /></div>
	<p class="small muted">Elaboradas pela plataforma a partir do programa de 2027 e do padrão histórico abaixo. Nenhuma é oficial, e o tema real pode ser outro.</p>
	<ul class="temas">
		{#each TEMAS_2027 as t (t.id)}
			<li><a href="/redacao/temas/{t.id}"><strong>{t.question}</strong></a><br /><span class="small muted">{t.link}</span></li>
		{/each}
	</ul>
</section>

<section class="card">
	<div class="spread"><h2>Histórico de temas da UERJ (2017–2026)</h2><CategoryTag category="oficial" /></div>
	<div class="table-wrap">
		<table>
			<thead><tr><th>Edição</th><th>Livro-base</th><th>Questão-tema</th><th>Documentos</th></tr></thead>
			<tbody>
				{#each REDACAO_HISTORY as r (r.edition)}
					<tr>
						<td>{r.edition}{r.exam === 'Exame Único' ? '*' : ''}</td>
						<td>{r.book ?? '—'}</td>
						<td>{r.question}</td>
						<td class="small"><a href={r.provaUrl} target="_blank" rel="noopener noreferrer">prova</a>{#if r.padraoUrl} · <a href={r.padraoUrl} target="_blank" rel="noopener noreferrer">padrão</a>{/if}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="small muted">* Exame Único (2021–2023). Transcrito dos cadernos de prova oficiais.</p>
	<h3>O que o histórico mostra</h3>
	<ul class="small">{#each REDACAO_PATTERNS as p, i (i)}<li>{p}</li>{/each}</ul>
	<CategoryTag category="analise" />
</section>

<section class="card">
	<h2>Suas redações</h2>
	{#if data.essays.length}
		{#if evo.length > 1}
			<div class="evo" aria-label="Evolução das notas estimadas">
				{#each evo as e (e.id)}<span style="height:{((e.score ?? 0) / 20) * 70}px" title="{e.score?.toFixed(1)}/20"></span>{/each}
			</div>
		{/if}
		<table>
			<thead><tr><th>Data</th><th>Título / proposta</th><th>Nota estimada</th></tr></thead>
			<tbody>
				{#each data.essays as e (e.id)}
					<tr>
						<td>{new Date(e.created_at + 'Z').toLocaleDateString('pt-BR')}</td>
						<td><a href="/redacao/{e.id}">{e.title || 'Sem título'}</a><br /><span class="small muted">{e.prompt.slice(0, 120)}</span></td>
						<td>{e.score !== null ? `${e.score.toFixed(1)}/20` : 'não corrigida'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<p class="muted">Nenhuma redação ainda. Comece por uma proposta plausível ou por um tema oficial anterior.</p>
	{/if}
</section>

<style>
	section.card {
		margin-top: 1rem;
	}
	blockquote {
		margin: 0.8rem 0 0;
		padding: 0.6rem 0.9rem;
		background: var(--surface-2);
		border-left: 3px solid var(--cat-oficial);
		border-radius: 0 8px 8px 0;
	}
	.temas {
		list-style: none;
		padding: 0;
	}
	.temas li {
		padding: 0.55rem 0;
		border-bottom: 1px solid var(--border);
	}
	.evo {
		display: flex;
		gap: 6px;
		align-items: flex-end;
		height: 80px;
		margin-bottom: 0.6rem;
	}
	.evo span {
		width: 16px;
		background: var(--c-red);
		border-radius: 4px 4px 0 0;
	}
</style>
