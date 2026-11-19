<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	import Icon from '$lib/components/Icon.svelte';
	import { DISCIPLINES } from '$lib/data/official/exam-2027';
	import { formatarDuracao } from '$lib/producao';

	let { data } = $props();
	const nomeDisc = (c: string) => (DISCIPLINES as Record<string, { name: string }>)[c]?.name ?? c;
</script>

<svelte:head><title>Aulas animadas · {APP_NAME}</title></svelte:head>

<header class="card hero">
	<p class="eyebrow">Assistir</p>
	<h1>Aulas animadas</h1>
	<p>
		Séries em episódios, com mapas que se movem, documentos que se datilografam na tela, personagens, linhas do tempo e o “Momento UERJ”, em que a
		questão oficial é resolvida. A narração segue o roteiro revisado, com legendas.
	</p>
</header>

<section class="lista" aria-label="Aulas disponíveis">
	{#each data.aulas as a (a.topicId)}
		<article class="card aula">
			<p class="eyebrow">{nomeDisc(a.discipline)} · {a.episodios.length} episódios · cerca de {formatarDuracao(a.duracaoSeg)}</p>
			<h2>{a.titulo}</h2>
			<ol class="eps">
				{#each a.episodios as e (e.numero)}
					<li>
						<span class="mono num">{e.numero}</span>
						<span class="t">{e.title}</span>
						<span class="selo" class:auto={e.sobMedida < e.cenas}>{e.sobMedida === e.cenas ? 'animação completa' : e.sobMedida > 0 ? `${e.sobMedida}/${e.cenas} cenas completas` : 'encenação automática'}</span>
					</li>
				{/each}
			</ol>
			<div class="row">
				<a class="btn primary" href="/aulas/{a.topicId}"><Icon name="play" size={18} /> Assistir</a>
				<a class="btn" href="/estudio/{a.topicId}">Roteiro</a>
			</div>
		</article>
	{/each}
</section>

<p class="small muted">Próximas séries: História e Língua Portuguesa e Literaturas, na ordem de prioridade do diagnóstico da banca.</p>

<style>
	.hero h1 {
		margin: 0.2rem 0 0.5rem;
		font-family: var(--display);
	}
	.lista {
		margin: 1.25rem 0;
		display: grid;
		gap: 1rem;
	}
	.aula h2 {
		margin: 0.2rem 0 0.6rem;
		font-family: var(--display);
		text-wrap: balance;
	}
	.eps {
		list-style: none;
		margin: 0 0 0.9rem;
		padding: 0;
		display: grid;
		gap: 0.35rem;
	}
	.eps li {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 0.6rem;
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
	.selo {
		font-size: 0.7rem;
		font-weight: 700;
		padding: 0.05rem 0.5rem;
		border-radius: 999px;
		background: var(--ok-soft);
		color: var(--ok);
	}
	.selo.auto {
		background: var(--warn-soft);
		color: var(--warn);
	}
	.row :global(.icon) {
		vertical-align: -3px;
	}
</style>
