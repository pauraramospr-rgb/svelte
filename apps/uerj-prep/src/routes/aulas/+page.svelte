<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	import Icon from '$lib/components/Icon.svelte';
	import { DISCIPLINES } from '$lib/data/official/exam-2027';

	let { data } = $props();
	const nomeDisc = (c: string) => (DISCIPLINES as Record<string, { name: string }>)[c]?.name ?? c;
	const grupos = $derived(
		(['HIS', 'LPL'] as const).map((d) => ({ codigo: d, aulas: data.aulas.filter((a) => a.discipline === d) })).filter((g) => g.aulas.length)
	);
	const min = (s: number) => Math.max(1, Math.round(s / 60));
</script>

<svelte:head><title>Aulas animadas · {APP_NAME}</title></svelte:head>

<header class="card hero">
	<p class="eyebrow">Assistir</p>
	<h1>Aulas animadas</h1>
	<p>
		Aulas completas, tópico por tópico da trilha: mapas que se movem, linhas do tempo, documentos, personagens e o “Momento UERJ”, em que a questão
		oficial é resolvida. A narração segue o roteiro revisado, com legendas.
	</p>
	<p class="small muted">
		Prontas: {data.aulas.filter((a) => a.discipline === 'HIS').length} de {data.total.HIS} tópicos de História · {data.aulas.filter((a) => a.discipline === 'LPL').length} de {data.total.LPL} de
		Língua Portuguesa e Literaturas.
	</p>
</header>

{#each data.serie as g (g.grupo)}
	<section class="grupo serie" aria-labelledby="g-serie-{g.grupo}">
		<h2 id="g-serie-{g.grupo}">Série especial · {g.nome} para a UERJ</h2>
		<p class="small muted chamada-serie">
			Aulas longas e aprofundadas, que atravessam vários tópicos do programa, cada uma com um resumo aprofundado para ler e revisar.
		</p>
		<div class="lista">
			{#each g.aulas as a (a.id)}
				<article class="card aula">
					<p class="eyebrow">{a.partes.length} {a.partes.length === 1 ? 'parte' : 'partes'} · cerca de {min(a.duracaoSeg)} min</p>
					<h3>{a.titulo}</h3>
					{#if a.vozGravada !== 'nao'}<p class="selo-voz small">{a.vozGravada === 'toda' ? 'Voz gravada (ElevenLabs): toca em qualquer aparelho' : 'Parte das cenas com voz gravada (ElevenLabs)'}</p>{/if}
					<p class="small muted">{a.chamada}</p>
					<ol class="eps">
						{#each a.partes as e (e.numero)}
							<li><span class="mono num">{e.numero}</span> <span class="t">{e.title}</span> <span class="muted small">{e.cenas} cenas</span></li>
						{/each}
					</ol>
					<div class="acoes">
						<a class="btn primary" href="/aulas/{a.id}"><Icon name="play" size={18} /> Assistir</a>
						{#if a.temResumo}<a class="btn" href="/aulas/{a.id}/resumo">Resumo aprofundado</a>{/if}
					</div>
				</article>
			{/each}
		</div>
	</section>
{/each}

{#each grupos as g (g.codigo)}
	<section class="grupo" aria-labelledby="g-{g.codigo}">
		<h2 id="g-{g.codigo}">{nomeDisc(g.codigo)}</h2>
		<div class="lista">
			{#each g.aulas as a (a.topicId)}
				<article class="card aula">
					<p class="eyebrow">{a.partes.length} {a.partes.length === 1 ? 'parte' : 'partes'} · cerca de {min(a.duracaoSeg)} min</p>
					<h3>{a.titulo}</h3>
					<ol class="eps">
						{#each a.partes as e (e.numero)}
							<li><span class="mono num">{e.numero}</span> <span class="t">{e.title}</span> <span class="muted small">{e.cenas} cenas</span></li>
						{/each}
					</ol>
					<a class="btn primary" href="/aulas/{a.topicId}"><Icon name="play" size={18} /> Assistir</a>
				</article>
			{/each}
		</div>
	</section>
{/each}

<style>
	.hero h1 {
		margin: 0.2rem 0 0.5rem;
		font-family: var(--display);
	}
	.grupo h2 {
		font-family: var(--display);
		margin: 1.5rem 0 0.75rem;
	}
	.selo-voz {
		justify-self: start;
		margin: 0;
		padding: 0.15rem 0.6rem;
		border-radius: 999px;
		background: var(--primary-soft);
		color: var(--primary);
		font-weight: 700;
	}
	.chamada-serie {
		margin: -0.4rem 0 0.9rem;
		max-width: 70ch;
	}
	.acoes {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.lista {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
		gap: 1rem;
	}
	.aula {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		min-width: 0;
	}
	.aula h3 {
		margin: 0;
		font-family: var(--display);
		text-wrap: balance;
	}
	.eps {
		list-style: none;
		margin: 0 0 0.4rem;
		padding: 0;
		display: grid;
		gap: 0.25rem;
		flex: 1;
	}
	.eps li {
		display: flex;
		flex-wrap: wrap;
		gap: 0.2rem 0.5rem;
		align-items: baseline;
	}
	.num {
		color: var(--primary);
		font-weight: 700;
	}
	.t {
		font-weight: 600;
		min-width: 0;
	}
	.aula .btn {
		align-self: flex-start;
	}
	.aula :global(.icon) {
		vertical-align: -3px;
	}
</style>
