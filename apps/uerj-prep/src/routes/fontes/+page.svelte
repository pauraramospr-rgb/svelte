<script lang="ts">
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import { SOURCES, CATEGORY_HELP, CATEGORY_LABEL, type InfoCategory } from '$lib/data/official/sources';
	import { EXAM_2027 } from '$lib/data/official/exam-2027';
	import { INCIDENCE } from '$lib/domain/syllabus';
	import { PAST_EXAMS } from '$lib/data/official/past-exams';
	import { DISCIPLINES, type DisciplineCode } from '$lib/data/official/exam-2027';
	import SourceRef from '$lib/components/SourceRef.svelte';

	const cats: InfoCategory[] = ['oficial', 'analise', 'pedagogica', 'previsao', 'ia'];
</script>

<svelte:head><title>Fontes e metodologia · Discursiva</title></svelte:head>

<h1>Fontes e metodologia</h1>
<p class="muted">Como a plataforma separa o que é oficial do que é análise, interpretação ou previsão — e de onde vem cada dado.</p>

<section class="card">
	<h2>Categorias de informação</h2>
	<p class="small">Todo conteúdo exibe uma etiqueta. Passe o mouse (ou toque) sobre ela para ver a definição.</p>
	<dl>
		{#each cats as c (c)}
			<dt><CategoryTag category={c} /></dt>
			<dd>{CATEGORY_HELP[c]}</dd>
		{/each}
	</dl>
</section>

<section class="card">
	<h2>Documentos oficiais utilizados</h2>
	<ul class="small">
		{#each Object.values(SOURCES) as s (s.id)}
			<li><a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a> — {s.publisher}, {s.year}. Acesso em {new Date(s.accessedAt + 'T12:00:00').toLocaleDateString('pt-BR')}.</li>
		{/each}
	</ul>
</section>

<section class="card">
	<h2>Regras oficiais do Exame Discursivo 2027</h2>
	<ul>
		{#each EXAM_2027.rules as r, i (i)}<li>{r.text} <span class="small muted">({r.ref})</span></li>{/each}
	</ul>
	<SourceRef id="edital-2027" />
</section>

<section class="card">
	<h2>Provas e padrões de resposta oficiais</h2>
	<div class="table-wrap">
		<table>
			<thead><tr><th>Edição</th><th>Disciplinas (prova · padrão)</th><th>Questões comentadas</th></tr></thead>
			<tbody>
				{#each PAST_EXAMS as e (e.edition)}
					<tr>
						<td>{e.edition}</td>
						<td class="small">
							{#each Object.entries(e.disciplines) as [code, l], i (code)}
								{i ? ' · ' : ''}{DISCIPLINES[code as DisciplineCode]?.short}:
								{#if l?.prova}<a href={l.prova} target="_blank" rel="noopener noreferrer">prova</a>{/if}
								{#if l?.padrao} / <a href={l.padrao} target="_blank" rel="noopener noreferrer">padrão</a>{/if}
								{#if l?.padroes}{#each Object.entries(l.padroes) as [lang, url] (lang)} / <a href={url} target="_blank" rel="noopener noreferrer">{lang}</a>{/each}{/if}
							{/each}
						</td>
						<td><a href={e.commentedUrl} target="_blank" rel="noopener noreferrer">PDF</a></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<section class="card">
	<h2>Metodologias da plataforma</h2>
	<h3>Banco de questões oficiais</h3>
	<p class="small">
		As questões oficiais foram extraídas automaticamente dos documentos “Questões Comentadas” da UERJ ({INCIDENCE.years.join(', ')}), com enunciado, classificação
		oficial (item e subitem do programa), objetivo e comentário da banca. Figuras, gráficos, tabelas e fórmulas não são reproduzidos em texto: cada questão indica a
		página do PDF original. Em Língua Estrangeira, os textos-base ficam no caderno oficial. 2021–2023 tiveram Exame Único (sem provas discursivas por disciplina) e
		não entram no banco.
	</p>
	<h3>Incidência histórica</h3>
	<p class="small">
		Contamos, por edição, quantas questões a UERJ classificou em cada item do programa e associamos esses itens aos tópicos do programa de 2027 por correspondência de
		nomes (com uma lista explícita de equivalências para grafias divergentes; itens sem equivalente ficam fora). {INCIDENCE.note}
	</p>
	<h3>Correção de respostas</h3>
	<p class="small">
		O edital prevê pontuação total, parcial ou nula (item 4.29.5). A IA compara a resposta com o comentário oficial (ou com a resposta-modelo, nas inéditas); a
		plataforma conta parcial como 50% e divide os 20 pontos da prova igualmente entre as questões. A UERJ não divulga esses valores.
	</p>
	<h3>Correção de redação</h3>
	<p class="small">
		Os 8 aspectos do Anexo 5 / padrão de respostas 2026 são avaliados um a um (atende / parcialmente / não atende) com trechos do texto. A nota estimada atribui peso
		igual aos aspectos — a UERJ não publica a distribuição dos 20 pontos.
	</p>
	<h3>Questões inéditas e resumos por IA</h3>
	<p class="small">
		Gerados pelo modelo Claude (Anthropic) a partir do programa oficial e de questões oficiais do mesmo tópico usadas como referência de estilo. São sempre
		identificados como não oficiais e podem conter imprecisões.
	</p>
	<h3>Revisão espaçada e cronograma</h3>
	<p class="small">
		Algoritmo SM-2 por tópico (qualidade derivada do crédito obtido), com revisões limitadas à véspera da prova. O cronograma prioriza tópicos por peso da disciplina
		no curso × incidência histórica × necessidade (erros).
	</p>
</section>

<style>
	section.card {
		margin-top: 1rem;
	}
	dl {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 0.6rem 1rem;
		align-items: start;
	}
	dd {
		margin: 0;
		font-size: 0.92rem;
	}
</style>
