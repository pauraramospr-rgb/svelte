<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	import { estimateLines, wordCount } from '$lib/domain/text';
	import { onMount, untrack } from 'svelte';

	let { data, form } = $props();
	// valores iniciais do formulário (capturados uma vez, de propósito)
	let tema = $state(untrack(() => data.tema));
	let title = $state(untrack(() => form?.title ?? ''));
	let body = $state(untrack(() => form?.body ?? ''));
	let plan = $state(untrack(() => data.plano));
	let custom = $state('');
	let seconds = $state(0);
	const DRAFT = 'discursiva:rascunho-redacao';

	onMount(() => {
		try {
			if (!body) {
				const saved = JSON.parse(localStorage.getItem(DRAFT) ?? 'null');
				if (saved?.body) {
					body = saved.body;
					title = saved.title ?? '';
				}
			}
		} catch {}
		const t = setInterval(() => seconds++, 1000);
		return () => clearInterval(t);
	});
	$effect(() => {
		try {
			localStorage.setItem(DRAFT, JSON.stringify({ title, body }));
		} catch {}
	});
	const lines = $derived(estimateLines(body));
	const words = $derived(wordCount(body));
	const lineState = $derived(lines < 20 ? 'curta' : lines > 30 ? 'longa' : 'ok');
</script>

<svelte:head><title>Escrever redação · {APP_NAME}</title></svelte:head>

<p class="small"><a href="/redacao">← Laboratório de redação</a></p>
<h1>Escrever redação</h1>

<form method="POST" class="layout" onsubmit={() => { try { localStorage.removeItem(DRAFT); } catch {} }}>
	<div class="card">
		<div class="field">
			<label for="tema">Proposta</label>
			<select id="tema" name="tema" bind:value={tema}>
				<optgroup label="Plausíveis para 2027 (não oficiais) — O bem-amado">
					{#each data.temas as t (t.id)}<option value={t.id}>{t.question}</option>{/each}
				</optgroup>
				<optgroup label="Oficiais de anos anteriores">
					{#each data.oficiais as t (t.id)}<option value={t.id}>{t.question}</option>{/each}
				</optgroup>
				<option value="livre">Outra proposta (digitar)</option>
			</select>
			{#if tema === 'livre'}<textarea name="custom" bind:value={custom} rows="2" style="min-height:60px;margin-top:0.5rem" placeholder="Escreva a questão-tema"></textarea>{/if}
			{#if tema.startsWith('oficial-')}<p class="small muted">Atenção: propostas anteriores se baseiam em outros livros indicados.</p>{/if}
		</div>
		<div class="field">
			<label for="title">Título</label>
			<input id="title" name="title" bind:value={title} maxlength="150" />
		</div>
		<div class="field">
			<label for="body">Texto</label>
			<textarea id="body" name="body" class="essay" bind:value={body} spellcheck="false"></textarea>
		</div>
		{#if form?.error}<p class="notice bad" role="alert">{form.error}</p>{/if}
		<button class="btn primary">Enviar para correção</button>
	</div>
	<aside class="card side">
		<h2>Contadores</h2>
		<p class="big {lineState}">{lines} <small>linhas (estimativa)</small></p>
		<p class="small muted">Exigência oficial: 20 a 30 linhas. A estimativa usa ~65 caracteres por linha manuscrita; treine também à mão.</p>
		<p><strong>{words}</strong> palavras · {Math.floor(seconds / 60)} min</p>
		<hr />
		<h3>Seu plano</h3>
		<textarea name="plan" bind:value={plan} rows="8" style="min-height:140px" placeholder="Tese, argumentos, uso da obra, conclusão"></textarea>
		<p class="small muted">Rascunho salvo neste navegador enquanto você escreve.</p>
	</aside>
</form>

<style>
	.layout {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: 1rem;
		align-items: start;
	}
	.layout > .card + .card {
		margin-top: 0;
	}
	.essay {
		min-height: 520px;
		font-family: var(--serif);
		font-size: 1.05rem;
		line-height: 1.8;
	}
	.side {
		position: sticky;
		top: 1rem;
	}
	.big {
		font-size: 2rem;
		font-weight: 800;
		margin: 0;
	}
	.big small {
		font-size: 0.85rem;
		font-weight: 500;
	}
	.big.curta,
	.big.longa {
		color: var(--warn);
	}
	.big.ok {
		color: var(--ok);
	}
	@media (max-width: 900px) {
		.layout {
			grid-template-columns: 1fr;
		}
		.side {
			position: static;
		}
	}
</style>
