<script lang="ts">
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import SourceRef from '$lib/components/SourceRef.svelte';
	import { DISCIPLINES } from '$lib/data/official/exam-2027';

	let { data, form } = $props();
	let kind = $state<'completo' | 'disciplina'>('completo');
	let perProva = $state(10);
	const suggested = $derived(kind === 'completo' ? Math.round(300 * (perProva / 10)) : perProva * 15);
</script>

<svelte:head><title>Novo simulado · Discursiva</title></svelte:head>

<p class="small"><a href="/simulados">← Simulados</a></p>
<h1>Novo simulado</h1>

<form method="POST" class="card">
	<fieldset class="kinds">
		<legend class="sr-only">Tipo de simulado</legend>
		<label class="opt" class:sel={kind === 'completo'}>
			<input type="radio" name="kind" value="completo" bind:group={kind} />
			<strong>Prova completa do seu curso</strong>
			<span class="small muted">
				{#if data.course}
					Redação + {DISCIPLINES[data.course.peso2].name} (peso 2) + {DISCIPLINES[data.course.peso1].name} (peso 1)
				{:else}
					Defina seu curso no <a href="/perfil">perfil</a>.
				{/if}
			</span>
		</label>
		<label class="opt" class:sel={kind === 'disciplina'}>
			<input type="radio" name="kind" value="disciplina" bind:group={kind} />
			<strong>Por disciplina</strong>
			<span class="small muted">Treino focado em uma disciplina específica.</span>
		</label>
	</fieldset>

	{#if kind === 'disciplina'}
		<div class="field">
			<label for="discipline">Disciplina</label>
			<select id="discipline" name="discipline" required>
				{#each data.disciplines as d (d.code)}<option value={d.code}>{d.name}</option>{/each}
			</select>
		</div>
	{/if}

	<div class="grid cols-3">
		<div class="field">
			<label for="perProva">Questões por prova</label>
			<select id="perProva" name="perProva" bind:value={perProva}>
				<option value={10}>10 (formato real de 2026)</option><option value={5}>5</option><option value={3}>3</option>
			</select>
		</div>
		<div class="field">
			<label for="mix">Composição</label>
			<select id="mix" name="mix">
				<option value="misto">Misto (≈70% oficiais, 30% inéditas)</option>
				<option value="oficial">Só questões oficiais</option>
				<option value="inedita">Só questões inéditas</option>
			</select>
		</div>
		<div class="field">
			<label for="duration">Tempo (minutos)</label>
			<input id="duration" name="duration" type="number" min="10" max="300" value={suggested} />
		</div>
	</div>

	{#if kind === 'completo'}
		<div class="field">
			<label for="theme">Proposta de redação</label>
			<select id="theme" name="theme">
				<option value="">Sortear uma proposta plausível sobre O bem-amado</option>
				<optgroup label="Propostas plausíveis 2027 (não oficiais)">
					{#each data.temas as t (t.id)}<option value={t.id}>{t.question}</option>{/each}
				</optgroup>
				<optgroup label="Propostas oficiais de anos anteriores">
					{#each data.oficiais as t (t.id)}<option value={t.id}>{t.question}</option>{/each}
				</optgroup>
			</select>
		</div>
	{/if}

	<div class="notice small">
		<p><strong>Formato oficial:</strong> o Exame Discursivo tem três provas de 20 pontos (Redação e duas específicas), em um único dia, com 5 horas de duração. Em 2026, cada prova específica teve 10 questões.</p>
		<CategoryTag category="oficial" />
		<SourceRef id="edital-2027" ref="itens 4.1, 4.2 e 4.6" />
	</div>
	{#if form?.error}<p class="notice bad" role="alert">{form.error}</p>{/if}
	<button class="btn primary" style="margin-top:0.8rem">Começar simulado</button>
</form>

<style>
	.kinds {
		border: 0;
		padding: 0;
		margin: 0 0 1rem;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 0.75rem;
	}
	.opt {
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 0.8rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		cursor: pointer;
		font-weight: 400;
	}
	.opt.sel {
		border-color: var(--primary);
		background: var(--primary-soft);
	}
	.opt input {
		width: auto;
		min-height: 0;
	}
</style>
