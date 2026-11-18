<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	import DisciplineBadge from '$lib/components/DisciplineBadge.svelte';
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import SourceRef from '$lib/components/SourceRef.svelte';
	import { DISCIPLINES } from '$lib/data/official/exam-2027';
	import { INCIDENCE } from '$lib/domain/syllabus';

	let { data } = $props();
	let showOnlyHigh = $state(false);
	const bandLabel = { alta: 'Alta incidência', media: 'Incidência média', baixa: 'Baixa incidência', nenhuma: 'Sem registro' } as const;
	const total = $derived(data.units.reduce((s, u) => s + u.topics.length, 0));
	const done = $derived(data.units.reduce((s, u) => s + u.topics.filter((t) => t.status === 'concluido').length, 0));
</script>

<svelte:head><title>Minha trilha · {APP_NAME}</title></svelte:head>

<h1>Minha trilha</h1>
{#if data.course}
	<p class="muted">Trilha montada para <strong>{data.course.name} ({data.course.campus})</strong> conforme o quadro de provas do edital 2027.</p>
{:else}
	<p class="notice warn">Você ainda não escolheu um curso: mostrando o programa de todas as disciplinas. <a href="/perfil">Escolher curso</a></p>
{/if}

<div class="tabs" role="tablist">
	{#each data.codes as c (c.code)}
		<a role="tab" aria-selected={c.code === data.selected} class:sel={c.code === data.selected} href="?d={c.code}">
			<span class="disc-dot" style="background:{DISCIPLINES[c.code].color}"></span>
			{DISCIPLINES[c.code].short}
			{#if data.course}<span class="small muted">{c.role}</span>{/if}
		</a>
	{/each}
</div>

{#if data.selected === 'RED'}
	<div class="card">
		<h2>Redação</h2>
		{#each data.discipline.orientacao as p, i (i)}<p>{p}</p>{/each}
		<CategoryTag category="oficial" />
		<SourceRef id="anexo5-2027" />
		<p style="margin-top:1rem"><a class="btn primary" href="/redacao">Abrir o Laboratório de Redação</a> <a class="btn" href="/obras/o-bem-amado">Estudar O bem-amado</a></p>
	</div>
{:else}
	<div class="card">
		<div class="spread">
			<div>
				<h2>{data.discipline.name}</h2>
				<p class="small muted">{done} de {total} tópicos concluídos</p>
			</div>
			<label class="row small" style="font-weight:500"><input type="checkbox" style="width:auto;min-height:0" bind:checked={showOnlyHigh} /> Mostrar só incidência alta/média</label>
		</div>
		<div class="bar" style="margin:0.4rem 0 0.8rem"><span style="width:{total ? (done / total) * 100 : 0}%"></span></div>
		<details>
			<summary>Orientação geral oficial da disciplina</summary>
			{#each data.discipline.orientacao as p, i (i)}<p class="small">{p}</p>{/each}
			<SourceRef id="anexo5-2027" />
		</details>
		<p class="small muted" style="margin-top:0.6rem">
			A trilha segue a ordem das unidades do programa oficial (Anexo 5). A incidência indica em quantas das {INCIDENCE.years.length} edições analisadas
			({INCIDENCE.years.join(', ')}) o tópico foi cobrado, segundo a classificação oficial da UERJ — o que já caiu não garante o que vai cair.
			<CategoryTag category="analise" />
		</p>
	</div>

	{#each data.units as u (u.name)}
		<section class="unit">
			<h3>{u.name} <span class="pill">{u.level}</span></h3>
			<div class="grid cols-2">
				{#each u.topics.filter((t) => !showOnlyHigh || t.band === 'alta' || t.band === 'media') as t (t.id)}
					<a class="topic card" href="/trilha/{t.id}">
						<div class="spread">
							<strong>{t.title}</strong>
							{#if t.status === 'concluido'}<span class="pill ok">✓ concluído</span>{:else if t.status === 'estudando'}<span class="pill">estudando</span>{/if}
						</div>
						{#if t.subtopics.length}<p class="small muted subs">{t.subtopics.join(' · ')}</p>{/if}
						<div class="row small">
							<span class="band {t.band}">{bandLabel[t.band]}{t.questions ? ` · ${t.editions}/${INCIDENCE.years.length} edições` : ''}</span>
							{#if t.hasResumo}<span class="pill">resumo</span>{/if}
							{#if t.attempts}<span class="pill">{t.avgCredit !== null ? Math.round(t.avgCredit * 100) + '%' : '…'} em {t.attempts}</span>{/if}
							{#if t.due}<span class="pill warn">revisar</span>{/if}
						</div>
					</a>
				{/each}
			</div>
		</section>
	{/each}
{/if}

<style>
	.tabs {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		margin: 1rem 0;
	}
	.tabs a {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 0.45rem 0.8rem;
		text-decoration: none;
		color: var(--text);
		background: var(--surface);
		font-weight: 600;
	}
	.tabs a.sel {
		border-color: var(--primary);
		background: var(--primary-soft);
	}
	.unit {
		margin-top: 1.5rem;
	}
	.topic {
		text-decoration: none;
		color: var(--text);
		display: block;
	}
	.topic:hover {
		border-color: var(--primary);
	}
	.topic + .topic {
		margin-top: 0;
	}
	.subs {
		margin: 0.3rem 0 0.5rem;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.band {
		font-weight: 700;
		font-size: 0.78rem;
	}
	.band.alta {
		color: var(--cat-analise);
	}
	.band.media {
		color: var(--primary);
	}
	.band.baixa,
	.band.nenhuma {
		color: var(--muted);
	}
	.pill.ok {
		color: var(--ok);
	}
	.pill.warn {
		color: var(--warn);
	}
</style>
