<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	let { data } = $props();
	const fmt = (s: string) => new Date(s + 'Z').toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
</script>

<svelte:head><title>Simulados · {APP_NAME}</title></svelte:head>

<div class="spread">
	<div>
		<h1>Simulados</h1>
		<p class="muted">Prova completa no formato do Exame Discursivo (Redação + duas específicas do seu curso, 5 horas) ou por disciplina.</p>
	</div>
	<a class="btn primary" href="/simulados/novo">Novo simulado</a>
</div>

{#if data.porAula.length}
	<section class="card por-aula" aria-labelledby="por-aula-titulo">
		<h2 id="por-aula-titulo">Simulados por aula</h2>
		<p class="small muted">Um simulado para cada aula animada: as questões da UERJ sobre o assunto (com o caderno original de 2024 a 2026) e inéditas escritas a partir da aula, rotuladas como não oficiais.</p>
		{#each data.porAula as g (g.grupo)}
			<details open={g.grupo === 'História'}>
				<summary><strong>{g.grupo}</strong> <span class="muted small">· {g.aulas.length} simulados</span></summary>
				<ul>
					{#each g.aulas as a (a.id)}
						<li>
							<a href="/simulados/aula/{a.id}">{a.titulo}</a>
							<span class="muted small">{a.questoes} questões{a.oficiais ? ` (${a.oficiais} da UERJ)` : ''}</span>
							{#if a.feito}<span class="pill feito">feito</span>{/if}
						</li>
					{/each}
				</ul>
			</details>
		{/each}
	</section>
{/if}

<h2 class="historico">Seus simulados</h2>
{#if data.simulados.length}
	<div class="table-wrap card">
		<table>
			<thead><tr><th>Simulado</th><th>Início</th><th>Situação</th><th>Resultado estimado</th></tr></thead>
			<tbody>
				{#each data.simulados as s (s.id)}
					<tr>
						<td><a href="/simulados/{s.id}">{s.title}</a></td>
						<td>{fmt(s.started_at)}</td>
						<td>{s.finished_at ? `concluído em ${Math.round((s.elapsed ?? 0) / 60)} min` : 'em andamento'}</td>
						<td>
							{#if s.result}
								{s.result.discursive} pts{s.kind === 'completo' ? ' de 80' : ' de 20'}{s.result.complete ? '' : ' (correção incompleta)'}
							{:else}—{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{:else}
	<p class="card muted">Você ainda não fez simulados.</p>
{/if}

<style>
	.por-aula {
		margin: 1rem 0 1.5rem;
	}
	.por-aula details {
		margin-top: 0.6rem;
	}
	.por-aula summary {
		cursor: pointer;
	}
	.por-aula ul {
		margin: 0.5rem 0 0;
		padding-left: 1.2rem;
		display: grid;
		gap: 0.3rem;
	}
	.feito {
		background: var(--ok-soft);
		color: var(--ok);
	}
	.historico {
		margin-top: 1.5rem;
	}
</style>
