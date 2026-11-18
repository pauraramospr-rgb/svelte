<script lang="ts">
	import { APP_NAME, APP_TAGLINE } from '$lib/brand';
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import { EXAM_2027, daysUntil } from '$lib/data/official/exam-2027';
	import { COURSES_2027 } from '$lib/data/official/courses-2027';
	let { data } = $props();
	const days = daysUntil(EXAM_2027.date);
</script>

<svelte:head><title>{APP_NAME} · {APP_TAGLINE}</title></svelte:head>

<section class="hero">
	<div>
		<p class="eyebrow">Vestibular Estadual 2027 · Exame Discursivo em 29/11/2026{days > 0 ? ` · faltam ${days} dias` : ''}</p>
		<h1>Prepare-se para o Exame Discursivo da UERJ com fontes oficiais e um professor de IA ao seu lado.</h1>
		<p class="lead muted">
			Trilhas pelo curso que você quer, {data.officialCount} questões oficiais com o comentário publicado pela própria UERJ, questões inéditas,
			simulados cronometrados, laboratório de redação e revisão espaçada — sempre separando o que é oficial do que é análise, interpretação ou previsão.
		</p>
		<div class="row">
			<a class="btn primary" href="/cadastro">Criar conta gratuita</a>
			<a class="btn" href="/entrar">Já tenho conta</a>
			<a class="btn ghost" href="/obras">Ver obras de 2027</a>
		</div>
	</div>
</section>

<section class="grid cols-3 feats">
	<div class="card">
		<h3>Por curso, pelo edital</h3>
		<p class="muted small">Os {COURSES_2027.length} cursos do edital 2027 com suas duas disciplinas específicas e pesos, e o programa oficial (Anexo 5) organizado em trilha.</p>
		<CategoryTag category="oficial" />
	</div>
	<div class="card">
		<h3>Incidência histórica real</h3>
		<p class="muted small">Quantas vezes cada tópico apareceu de {Math.min(...data.years)} a {Math.max(...data.years)}, a partir da classificação oficial publicada pela UERJ em “Questões Comentadas”.</p>
		<CategoryTag category="analise" />
	</div>
	<div class="card">
		<h3>Questões inéditas identificadas</h3>
		<p class="muted small">Questões criadas por IA no padrão da banca, com resposta-modelo e habilidades avaliadas — nunca apresentadas como oficiais.</p>
		<CategoryTag category="ia" />
	</div>
	<div class="card">
		<h3>Simulados e correção comentada</h3>
		<p class="muted small">Prova completa (Redação + duas específicas, 5 horas) ou por disciplina, com crédito total/parcial/nulo como prevê o edital.</p>
		<CategoryTag category="pedagogica" />
	</div>
	<div class="card">
		<h3>Laboratório de redação</h3>
		<p class="muted small">Critérios oficiais do Anexo 5, histórico de temas 2017–2026, propostas plausíveis sobre <em>O bem-amado</em> e correção detalhada.</p>
		<CategoryTag category="previsao" />
	</div>
	<div class="card">
		<h3>Revisão inteligente</h3>
		<p class="muted small">Repetição espaçada por tópico, detecção de dificuldades persistentes e cronograma até o dia da prova.</p>
		<CategoryTag category="pedagogica" />
	</div>
</section>

<style>
	.hero {
		padding: 2.5rem 0 1.5rem;
		max-width: 860px;
	}
	.eyebrow {
		font-weight: 700;
		color: var(--primary);
		font-size: 0.9rem;
	}
	.hero h1 {
		font-size: clamp(1.8rem, 4vw, 2.6rem);
	}
	.lead {
		font-size: 1.1rem;
	}
	.feats {
		margin-top: 1.5rem;
	}
</style>
