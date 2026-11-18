<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	import CategoryTag from '$lib/components/CategoryTag.svelte';

	let { data } = $props();
	const t = $derived(data.tema);
	let plan = $state({ posicao: '', tese: '', arg1: '', arg2: '', obra: '', conclusao: '' });
	const planText = $derived(
		`Posição: ${plan.posicao}\nTese: ${plan.tese}\nArgumento 1: ${plan.arg1}\nArgumento 2: ${plan.arg2}\nRelação com a obra: ${plan.obra}\nConclusão: ${plan.conclusao}`
	);
	const planReady = $derived(plan.tese.trim().length > 10 && plan.arg1.trim().length > 10);
</script>

<svelte:head><title>{t.question} · Redação · {APP_NAME}</title></svelte:head>

<p class="small"><a href="/redacao">← Laboratório de redação</a></p>
<CategoryTag category="previsao" detail="proposta plausível, não oficial" />
<h1 style="margin-top:0.5rem">{t.question}</h1>
<p class="muted">{t.link}</p>

<section class="card">
	<h2>Textos motivadores</h2>
	{#each t.motivadores as m, i (i)}
		<blockquote><strong class="small">{m.title}</strong><br />{m.text}</blockquote>
	{/each}
	<p class="statement">A partir da leitura de <em>O bem-amado</em>, de Dias Gomes, escreva uma redação dissertativo-argumentativa, em prosa, com 20 a 30 linhas, em que discuta a seguinte questão: <strong>{t.question}</strong></p>
</section>

<div class="grid cols-2">
	<section class="card">
		<div class="spread"><h2>Recortes temáticos possíveis</h2><CategoryTag category="pedagogica" /></div>
		{#each t.recortes as r, i (i)}<h3>{r.title}</h3><p class="small">{r.text}</p>{/each}
	</section>
	<section class="card">
		<div class="spread"><h2>Repertório sociocultural</h2><CategoryTag category="pedagogica" /></div>
		<ul class="small">{#each t.repertorio as r, i (i)}<li><strong>{r.ref}</strong> — {r.use}</li>{/each}</ul>
		<p class="small muted">Use repertório a serviço do argumento e só cite o que você domina com segurança.</p>
	</section>
</div>

<section class="card">
	<div class="spread"><h2>Possibilidades de construção argumentativa</h2><CategoryTag category="pedagogica" /></div>
	<p class="small muted">A questão admite, no mínimo, “sim, não e depende” (padrão de respostas oficial da Redação 2026). Exemplos de caminhos:</p>
	<div class="grid cols-3">
		{#each t.caminhos as c (c.posicao)}
			<div class="path">
				<h3>{c.posicao}</h3>
				<p class="small"><strong>Tese:</strong> {c.tese}</p>
				<ul class="small">{#each c.argumentos as a, i (i)}<li>{a}</li>{/each}</ul>
			</div>
		{/each}
	</div>
	<h3 style="margin-top:1rem">Armadilhas</h3>
	<ul class="small">{#each t.armadilhas as a, i (i)}<li>{a}</li>{/each}</ul>
</section>

<section class="card">
	<h2>Exercício de planejamento</h2>
	<p class="small muted">Planeje antes de escrever (10–15 minutos na prova). O plano é salvo junto com a sua redação.</p>
	<div class="grid cols-2">
		<div class="field">
			<label for="pos">Sua posição</label>
			<select id="pos" bind:value={plan.posicao}><option value="">—</option><option>Sim</option><option>Não</option><option>Depende</option></select>
		</div>
		<div class="field"><label for="tese">Tese (uma frase)</label><input id="tese" bind:value={plan.tese} /></div>
		<div class="field"><label for="a1">Argumento 1</label><textarea id="a1" rows="3" style="min-height:80px" bind:value={plan.arg1}></textarea></div>
		<div class="field"><label for="a2">Argumento 2</label><textarea id="a2" rows="3" style="min-height:80px" bind:value={plan.arg2}></textarea></div>
		<div class="field"><label for="obra">Como a peça entra no texto</label><textarea id="obra" rows="3" style="min-height:80px" bind:value={plan.obra}></textarea></div>
		<div class="field"><label for="conc">Conclusão</label><textarea id="conc" rows="3" style="min-height:80px" bind:value={plan.conclusao}></textarea></div>
	</div>
	<form method="GET" action="/redacao/escrever">
		<input type="hidden" name="tema" value={t.id} />
		<input type="hidden" name="plano" value={planText} />
		<button class="btn primary" disabled={!planReady}>Escrever a redação com este plano</button>
		{#if !planReady}<span class="small muted">Preencha ao menos a tese e o argumento 1.</span>{/if}
	</form>
</section>

<style>
	section.card,
	.grid {
		margin-top: 1rem;
	}
	blockquote {
		margin: 0.6rem 0;
		padding: 0.6rem 0.9rem;
		background: var(--surface-2);
		border-radius: 8px;
	}
	.path {
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 0.8rem;
	}
</style>
