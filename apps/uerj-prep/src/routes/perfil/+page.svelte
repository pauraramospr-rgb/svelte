<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { DISCIPLINES } from '$lib/data/official/exam-2027';
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import SourceRef from '$lib/components/SourceRef.svelte';
	import { untrack } from 'svelte';

	let { data, form } = $props();
	let courseId = $state(untrack(() => data.profile.course_id ?? ''));
	let filter = $state('');
	const selected = $derived(data.courses.find((c) => c.id === courseId));
	const filtered = $derived(
		data.courses.filter((c) =>
			(c.name + ' ' + c.campus)
				.normalize('NFD')
				.replace(/[̀-ͯ]/g, '')
				.toLowerCase()
				.includes(filter.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase())
		)
	);
	const welcome = page.url.searchParams.has('boas-vindas');
</script>

<svelte:head><title>Perfil · Discursiva</title></svelte:head>

<h1>Seu perfil de estudos</h1>
{#if welcome}<p class="notice info">Bem-vindo(a)! Escolha o curso pretendido para montar sua trilha, seus simulados e seu cronograma.</p>{/if}

<form method="POST" use:enhance class="grid cols-2">
	<div class="card">
		<h2>Curso pretendido</h2>
		<div class="field">
			<label for="filtro">Buscar curso</label>
			<input id="filtro" placeholder="Ex.: Medicina, Direito, Engenharia…" bind:value={filter} />
		</div>
		<div class="field">
			<label for="course">Curso (campus)</label>
			<select id="course" name="course_id" bind:value={courseId} size="8">
				<option value="">— não definido —</option>
				{#each filtered as c (c.id)}
					<option value={c.id}>{c.name} — {c.campus}</option>
				{/each}
			</select>
		</div>
		{#if selected}
			<div class="notice">
				<strong>Provas do Exame Discursivo para {selected.name} ({selected.campus}):</strong>
				<ul>
					<li>{DISCIPLINES[selected.peso2].name} — específica, <strong>peso 2</strong></li>
					<li>{DISCIPLINES[selected.peso1].name} — específica, peso 1</li>
					<li>Redação — geral, peso 1</li>
				</ul>
				<CategoryTag category="oficial" />
				<SourceRef id="edital-2027" ref="item 4.2" />
			</div>
			{#if selected.peso2 === 'LE' || selected.peso1 === 'LE'}
				<div class="field" style="margin-top:0.8rem">
					<label for="le">Língua estrangeira</label>
					<select id="le" name="le_language" value={data.profile.le_language ?? ''}>
						<option value="">— escolher —</option>
						<option>Espanhol</option><option>Francês</option><option>Inglês</option>
					</select>
					<span class="small muted">Alguns cursos de Letras têm a língua definida automaticamente (edital, itens 2.18.1 e 2.18.2).</span>
				</div>
			{/if}
		{/if}
	</div>
	<div class="card">
		<h2>Dados de estudo</h2>
		<div class="field">
			<label for="name">Nome</label>
			<input id="name" name="name" value={data.profile.name} required />
		</div>
		<div class="field">
			<label for="level">Seu nível atual</label>
			<select id="level" name="level" value={data.profile.level}>
				<option value="iniciante">Iniciante — quero começar pelos fundamentos</option>
				<option value="intermediario">Intermediário — já estudei, preciso consolidar</option>
				<option value="avancado">Avançado — quero refinar e treinar questões difíceis</option>
			</select>
		</div>
		<div class="field">
			<label for="exam">Data da prova</label>
			<input id="exam" name="exam_date" type="date" value={data.profile.exam_date} />
			<span class="small muted">Exame Discursivo 2027: 29/11/2026 (edital, Anexo 1).</span>
		</div>
		<div class="field">
			<label for="eq">Conceito no Exame de Qualificação (opcional)</label>
			<select id="eq" name="eq_conceito" value={data.profile.eq_conceito ?? ''}>
				<option value="">— não informar —</option>
				<option value="A">A (20 pontos)</option><option value="B">B (15 pontos)</option><option value="C">C (10 pontos)</option><option value="D">D (5 pontos)</option>
			</select>
			<span class="small muted">Usado para estimar seu resultado final (edital, item 6.1.1).</span>
		</div>
		<div class="field">
			<label for="hours">Horas de estudo por semana</label>
			<input id="hours" name="weekly_hours" type="number" min="1" max="80" value={data.profile.weekly_hours} />
		</div>
		{#if form?.error}<p class="notice bad" role="alert">{form.error}</p>{/if}
		{#if form?.saved}<p class="notice ok" role="status">Perfil salvo. <a href="/trilha">Ver minha trilha →</a></p>{/if}
		<button class="btn primary">Salvar perfil</button>
	</div>
</form>
