<script lang="ts">
	import { enhance } from '$app/forms';
	import { APP_NAME } from '$lib/brand';
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import DisciplineBadge from '$lib/components/DisciplineBadge.svelte';

	let { data, form } = $props();
	const oficiais = $derived(data.questoes.filter((q) => q.oficial).length);
	const ineditas = $derived(data.questoes.length - oficiais);
	const fmt = (s: string) => new Date(s + 'Z').toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
	let enviando = $state(false);
</script>

<svelte:head><title>Simulado da aula: {data.aula.titulo} · {APP_NAME}</title></svelte:head>

<nav class="crumbs small" aria-label="Caminho">
	<a href="/simulados">Simulados</a> <span aria-hidden="true">›</span>
	<span>Simulado da aula</span>
</nav>

<header class="cabeca">
	<p class="eyebrow">Simulado da aula · {data.questoes.length} questões discursivas · cerca de {data.minutos} min</p>
	<h1>{data.aula.titulo}</h1>
	<div class="tags">
		<DisciplineBadge code={data.aula.disciplina} />
		{#if oficiais}<CategoryTag category="oficial" detail="{oficiais} {oficiais === 1 ? 'questão' : 'questões'} da UERJ" />{/if}
		<CategoryTag category="ia" detail="{ineditas} {ineditas === 1 ? 'inédita' : 'inéditas'} · não oficiais" />
	</div>
</header>

<section class="card">
	<h2>Como funciona</h2>
	<ul class="small">
		<li>As questões vêm em sequência, como na prova: primeiro as oficiais da UERJ sobre o assunto da aula, depois as inéditas escritas a partir da aula.</li>
		<li>Nas questões oficiais de 2024 a 2026, você vê o <strong>caderno de prova original</strong>: imagens, textos e tabelas como foram impressos.</li>
		<li>As respostas são salvas automaticamente. O tempo sugerido é de {data.minutos} minutos (cerca de 15 por questão); ao terminar, você compara sua resposta com o comentário oficial ou com a resposta esperada.</li>
		<li>As inéditas são <strong>treino</strong>: foram elaboradas pela plataforma no padrão da banca e não são questões de prova.</li>
	</ul>
	<ol class="lista">
		{#each data.questoes as q, i (q.id)}
			<li>
				<span class="num mono">{String(i + 1).padStart(2, '0')}</span>
				<span>{q.rotulo}</span>
				{#if q.caderno}<span class="pill">caderno original</span>{/if}
			</li>
		{/each}
	</ol>
	{#if form?.error}<p class="notice warn small">{form.error}</p>{/if}
	<form
		method="POST"
		use:enhance={() => {
			enviando = true;
			return async ({ update }) => {
				await update();
				enviando = false;
			};
		}}
	>
		<div class="row">
			<button class="btn primary" type="submit" disabled={enviando}>{enviando ? 'Montando…' : `Começar o simulado (${data.questoes.length} questões)`}</button>
			<a class="btn" href="/aulas/{data.aula.id}">Rever a aula</a>
			{#if !data.aula.especial}<a class="btn" href="/trilha/{data.aula.id}">Resumo do tópico</a>{:else}<a class="btn" href="/aulas/{data.aula.id}/resumo">Resumo aprofundado</a>{/if}
		</div>
	</form>
</section>

{#if data.feitos.length}
	<section class="card">
		<h2>Suas tentativas</h2>
		<ul class="small">
			{#each data.feitos as f (f.id)}
				<li>
					<a href="/simulados/{f.id}">{fmt(f.inicio)}</a> —
					{#if !f.concluido}em andamento{:else if f.resultado}{f.resultado.discursive} de 20 pontos{f.resultado.complete ? '' : ' (correção incompleta)'}{:else}concluído{/if}
				</li>
			{/each}
		</ul>
	</section>
{/if}

<style>
	.cabeca .tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-top: 0.5rem;
	}
	.lista {
		list-style: none;
		padding: 0;
		margin: 1rem 0;
		display: grid;
		gap: 0.35rem;
	}
	.lista li {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.6rem;
	}
	.lista .num {
		color: var(--primary);
		font-weight: 700;
	}
</style>
