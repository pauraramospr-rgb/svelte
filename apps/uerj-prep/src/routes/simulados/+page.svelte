<script lang="ts">
	let { data } = $props();
	const fmt = (s: string) => new Date(s + 'Z').toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
</script>

<svelte:head><title>Simulados · Discursiva</title></svelte:head>

<div class="spread">
	<div>
		<h1>Simulados</h1>
		<p class="muted">Prova completa no formato do Exame Discursivo (Redação + duas específicas do seu curso, 5 horas) ou por disciplina.</p>
	</div>
	<a class="btn primary" href="/simulados/novo">Novo simulado</a>
</div>

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
