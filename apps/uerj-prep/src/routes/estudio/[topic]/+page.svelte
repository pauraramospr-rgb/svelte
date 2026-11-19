<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	import Markdown from '$lib/components/Markdown.svelte';
	import { formatarDuracao, roteiroEmTexto } from '$lib/producao';

	let { data } = $props();

	type Aba = 'roteiro' | 'geral' | 'animacao' | 'consistencia';
	const ABAS: [Aba, string][] = [
		['roteiro', 'Roteiro por cenas'],
		['geral', 'Visão geral da série'],
		['animacao', 'Orientações de animação'],
		['consistencia', 'Conferência de consistência']
	];
	let aba = $state<Aba>('roteiro');
	let copiado = $state('');
	const totalCenas = $derived(data.aula.episodios.reduce((s, e) => s + e.cenas.length, 0));

	async function copiar(texto: string, chave: string, alvo: HTMLElement | null) {
		try {
			await navigator.clipboard.writeText(texto);
			copiado = chave;
		} catch {
			// Sem acesso à área de transferência: seleciona o texto para o usuário copiar.
			if (alvo) {
				const sel = window.getSelection();
				const range = document.createRange();
				range.selectNodeContents(alvo);
				sel?.removeAllRanges();
				sel?.addRange(range);
			}
			copiado = chave + ':selecionado';
		}
		setTimeout(() => {
			if (copiado.startsWith(chave)) copiado = '';
		}, 2500);
	}

	function rotulo(chave: string, padrao: string): string {
		if (copiado === chave) return 'Copiado!';
		if (copiado === chave + ':selecionado') return 'Texto selecionado — use Ctrl+C';
		return padrao;
	}
</script>

<svelte:head><title>Roteiro: {data.topic.title} · {APP_NAME}</title></svelte:head>

<nav class="crumbs small" aria-label="Caminho">
	<a href="/estudio">Estúdio de aulas</a> <span aria-hidden="true">›</span>
	<span>{data.topic.title}</span>
</nav>

<header class="card hero">
	<p class="eyebrow">Estúdio de aulas · roteiro audiovisual</p>
	<h1>{data.topic.title}</h1>
	<p class="stats">
		<span><strong class="mono">{data.aula.episodios.length}</strong> episódios</span>
		<span><strong class="mono">{totalCenas}</strong> cenas</span>
		<span><strong class="mono">{formatarDuracao(data.aula.duracaoSeg)}</strong> de aula</span>
		<span class="muted">revisado em {data.aula.reviewed}</span>
	</p>
	<div class="row">
		<a class="btn primary" href="/aulas/{data.topic.id}">Assistir à animação</a>
		{#if data.temApostila}<a class="btn" href="/trilha/{data.topic.id}/apostila">Apostila completa (base do roteiro)</a>{/if}
		<a class="btn" href="/trilha/{data.topic.id}">Tópico na trilha</a>
	</div>
</header>

<div class="tabs" role="tablist" aria-label="Partes do projeto">
	{#each ABAS as [id, label] (id)}
		<button role="tab" id="tab-{id}" aria-selected={aba === id} aria-controls="painel-{id}" onclick={() => (aba = id)}>{label}</button>
	{/each}
</div>

<div class="panel" role="tabpanel" id="painel-{aba}" aria-labelledby="tab-{aba}" tabindex="0">
	{#if aba === 'roteiro'}
		{#each data.aula.episodios as ep (ep.numero)}
			{@const chaveEp = `ep-${ep.numero}`}
			<section class="episodio" aria-labelledby="ep-{ep.numero}">
				<header class="ep-head">
					<div>
						<p class="eyebrow">Episódio {ep.numero} · {ep.cenas.length} cenas · {formatarDuracao(ep.duracaoSeg)}</p>
						<h2 id="ep-{ep.numero}">{ep.title}</h2>
						{#if ep.objetivo}<p class="small muted">{ep.objetivo}</p>{/if}
					</div>
					<button class="btn small" onclick={(e) => copiar(roteiroEmTexto(ep), chaveEp, (e.currentTarget as HTMLElement).closest('section'))}>
						{rotulo(chaveEp, 'Copiar roteiro do episódio')}
					</button>
				</header>

				{#each ep.cenas as c (c.id)}
					{@const chave = `cena-${c.id}`}
					<article class="cena card" id="cena-{c.id}">
						<header class="cena-head">
							<h3><span class="mono num">{c.id}</span> {c.title}</h3>
							<span class="dur mono">{c.duracao}</span>
						</header>
						<dl class="campos">
							<div><dt>Objetivo pedagógico</dt><dd><Markdown source={c.objetivo} /></dd></div>
							<div><dt>Conteúdo explicado</dt><dd><Markdown source={c.conteudo} /></dd></div>
						</dl>
						<div class="narracao">
							<div class="narr-head">
								<strong>Narração do professor</strong>
								<span class="small muted">{c.narracao.split(/\s+/).length} palavras</span>
								<button
									class="btn small"
									onclick={(e) => copiar(c.narracao, chave, (e.currentTarget as HTMLElement).closest('.narracao')?.querySelector('.texto') ?? null)}
								>
									{rotulo(chave, 'Copiar narração')}
								</button>
							</div>
							<div class="texto"><Markdown source={c.narracao} /></div>
						</div>
						<dl class="campos">
							<div><dt>Textos na tela</dt><dd><Markdown source={c.textos} /></dd></div>
							<div><dt>Elementos visuais</dt><dd><Markdown source={c.visuais} /></dd></div>
							<div><dt>Animação</dt><dd><Markdown source={c.animacao} /></dd></div>
							<div><dt>Câmera</dt><dd><Markdown source={c.camera} /></dd></div>
							<div><dt>Transição</dt><dd><Markdown source={c.transicao} /></dd></div>
						</dl>
					</article>
				{/each}
			</section>
		{/each}
	{:else if aba === 'geral'}
		<div class="card"><Markdown source={data.aula.intro} /></div>
	{:else if aba === 'animacao'}
		<div class="card"><Markdown source={data.aula.orientacoes} /></div>
	{:else}
		<div class="card"><Markdown source={data.aula.conferencia} /></div>
	{/if}
</div>

<style>
	.crumbs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin-bottom: 0.75rem;
		color: var(--muted);
	}
	.hero h1 {
		margin: 0.2rem 0 0.5rem;
		font-family: var(--display);
		font-size: clamp(1.4rem, 3.5vw, 2.1rem);
		text-wrap: balance;
	}
	.stats {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.1rem;
		margin: 0 0 0.75rem;
	}
	.tabs {
		margin-top: 1.25rem;
	}
	.episodio {
		margin: 1.25rem 0 2rem;
	}
	.ep-head {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.75rem;
		align-items: flex-end;
		margin-bottom: 0.75rem;
	}
	.ep-head h2 {
		margin: 0.1rem 0 0.25rem;
		font-family: var(--display);
	}
	.cena {
		margin: 0 0 0.9rem;
	}
	.cena-head {
		display: flex;
		justify-content: space-between;
		gap: 0.75rem;
		align-items: baseline;
		margin-bottom: 0.5rem;
	}
	.cena-head h3 {
		margin: 0;
		font-size: 1.05rem;
	}
	.num {
		color: var(--primary);
		margin-right: 0.25rem;
	}
	.dur {
		font-size: 0.8rem;
		white-space: nowrap;
		padding: 0.1rem 0.55rem;
		border-radius: 999px;
		background: var(--surface-2);
		color: var(--muted);
	}
	.campos {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
		gap: 0.5rem 1rem;
		margin: 0.5rem 0;
	}
	.campos div {
		min-width: 0;
	}
	dt {
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--muted);
	}
	dd {
		margin: 0.15rem 0 0;
	}
	dd :global(.prose p) {
		margin: 0;
	}
	.narracao {
		margin: 0.75rem 0;
		padding: 0.75rem 0.9rem;
		border-left: 4px solid var(--primary);
		border-radius: 0 12px 12px 0;
		background: var(--primary-soft);
	}
	.narr-head {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 0.9rem;
		align-items: center;
		margin-bottom: 0.4rem;
	}
	.narr-head button {
		margin-left: auto;
	}
	.texto :global(.prose) {
		max-width: none;
	}
</style>
