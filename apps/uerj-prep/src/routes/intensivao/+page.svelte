<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { APP_NAME } from '$lib/brand';
	import Icon from '$lib/components/Icon.svelte';
	import Player from '$lib/cinema/Player.svelte';
	import type { EpisodioTocavel } from '$lib/cinema/aulas';
	import type { AulaDoIntensivao, SequenciaIntensivao } from '$lib/intensivao';

	let { data } = $props();

	const CHAVE = 'discursiva:intensivao';
	const SEQUENCIAS: { id: SequenciaIntensivao; nome: string }[] = [
		{ id: 'tudo', nome: 'Todas as aulas' },
		{ id: 'HIS', nome: 'Só História' },
		{ id: 'LPL', nome: 'Só Língua Portuguesa' }
	];

	let seq = $state<SequenciaIntensivao>('tudo');
	const lista = $derived<AulaDoIntensivao[]>(seq === 'tudo' ? data.aulas : data.aulas.filter((a) => a.disciplina === seq));

	// ——— Fila carregada: a partir da aula `inicio`, as aulas chegam inteiras, uma de cada vez ———
	let inicio = $state(0);
	let carregadas = $state<{ id: string; primeiro: number; partes: number }[]>([]);
	/** Partes de todas as aulas carregadas, em sequência (estado “raso”: o player lê muito e não precisa de proxies). */
	let episodios = $state.raw<EpisodioTocavel[]>([]);
	let epAtual = $state(0);
	let parteInicial = $state(0);
	let sessao = $state(0);
	let carregando = $state(false);
	let erro = $state('');
	let vistas = $state<string[]>([]);
	let player: Player | undefined = $state();

	const haMais = $derived(carregando || inicio + carregadas.length < lista.length);
	/** Índice (em `carregadas`) da aula que está tocando. */
	const jAtual = $derived.by(() => {
		let j = 0;
		for (let k = 0; k < carregadas.length; k++) if (carregadas[k].primeiro <= epAtual) j = k;
		return j;
	});
	const kAtual = $derived(inicio + jAtual);
	const aulaAtual = $derived(lista[kAtual]);
	const parteAtual = $derived(carregadas[jAtual] ? epAtual - carregadas[jAtual].primeiro + 1 : 1);
	const totalPartes = $derived(lista.reduce((s, a) => s + a.partes, 0));
	const totalHoras = $derived(lista.reduce((s, a) => s + a.duracaoSeg, 0) / 3600);
	const restanteSeg = $derived(lista.slice(kAtual + 1).reduce((s, a) => s + a.duracaoSeg, 0));
	const grupos = $derived(
		data.grupos
			.map((g) => ({ nome: g, aulas: lista.map((a, k) => ({ a, k })).filter((x) => x.a.grupo === g) }))
			.filter((g) => g.aulas.length)
	);

	const horas = (s: number) => {
		const h = Math.floor(s / 3600);
		const m = Math.round((s % 3600) / 60);
		return h ? `${h} h ${String(m).padStart(2, '0')} min` : `${m} min`;
	};

	function ler(): { seq?: SequenciaIntensivao; aula?: string; parte?: number; vistas?: string[] } {
		try {
			return JSON.parse(localStorage.getItem(CHAVE) ?? '{}');
		} catch {
			return {};
		}
	}
	function salvar() {
		try {
			localStorage.setItem(CHAVE, JSON.stringify({ seq, aula: aulaAtual?.id, parte: parteAtual - 1, vistas }));
		} catch {
			/* armazenamento indisponível: o Intensivão funciona, só não lembra onde parou */
		}
	}

	async function buscar(id: string): Promise<EpisodioTocavel[]> {
		const r = await fetch(`/api/aulas/${encodeURIComponent(id)}/episodios`);
		if (!r.ok) throw new Error(String(r.status));
		return (await r.json()) as EpisodioTocavel[];
	}

	/** Carrega a próxima aula da fila e a põe no fim da sequência do player. */
	async function anexarProxima(minhaSessao = sessao) {
		const k = inicio + carregadas.length;
		if (carregando || k >= lista.length) return;
		carregando = true;
		erro = '';
		try {
			const eps = await buscar(lista[k].id);
			if (minhaSessao !== sessao) return;
			carregadas = [...carregadas, { id: lista[k].id, primeiro: episodios.length, partes: eps.length }];
			episodios = [...episodios, ...eps];
		} catch {
			if (minhaSessao === sessao) erro = `Não foi possível carregar a aula “${lista[k].titulo}”. Verifique a conexão.`;
		} finally {
			if (minhaSessao === sessao) carregando = false;
		}
	}

	/** Recomeça a fila na aula `k` (e na parte `parte` dela). O player mostra a capa e espera o toque. */
	async function comecar(k: number, parte = 0) {
		sessao++;
		const minha = sessao;
		inicio = Math.max(0, Math.min(k, lista.length - 1));
		carregadas = [];
		episodios = [];
		// O player lê a parte inicial ao montar (e a limita às partes da aula).
		parteInicial = Math.max(0, parte);
		epAtual = 0;
		carregando = false;
		await anexarProxima(minha);
		if (minha !== sessao) return;
		void anexarProxima(minha);
	}

	/** Pela lista: aula já carregada toca na hora (dentro do toque); aula mais adiante recomeça a fila nela. */
	function irParaAula(k: number) {
		const j = k - inicio;
		if (j >= 0 && j < carregadas.length && player) player.irParaEpisodio(carregadas[j].primeiro);
		else void comecar(k);
	}

	function trocarSequencia(s: SequenciaIntensivao) {
		if (s === seq) return;
		seq = s;
		void comecar(0);
	}

	function aoMudarEpisodio(i: number) {
		const antes = jAtual;
		epAtual = i;
		// Aula concluída: a anterior fica marcada como vista quando a seguinte começa.
		if (jAtual > antes) {
			const ids = carregadas.slice(antes, jAtual).map((c) => c.id);
			vistas = [...new Set([...vistas, ...ids])];
		}
	}

	// Mantém sempre a aula seguinte carregada, para a troca ser imediata.
	$effect(() => {
		if (carregadas.length && jAtual >= carregadas.length - 1 && inicio + carregadas.length < lista.length) {
			untrack(() => void anexarProxima());
		}
	});

	$effect(() => {
		void [aulaAtual?.id, parteAtual, vistas.length, seq];
		if (carregadas.length) untrack(salvar);
	});

	onMount(() => {
		const s = ler();
		if (s.seq && SEQUENCIAS.some((x) => x.id === s.seq)) seq = s.seq;
		vistas = Array.isArray(s.vistas) ? s.vistas.filter((v) => typeof v === 'string') : [];
		const k = s.aula ? lista.findIndex((a) => a.id === s.aula) : -1;
		void comecar(k >= 0 ? k : 0, k >= 0 ? Math.max(0, Number(s.parte) || 0) : 0);
	});
</script>

<svelte:head><title>Intensivão · {APP_NAME}</title></svelte:head>

<header class="card hero">
	<p class="eyebrow">Assistir em sequência</p>
	<h1>Intensivão</h1>
	<p class="desc">
		Todas as aulas animadas, <strong>inteiras e na ordem</strong>, uma depois da outra: quando uma aula termina, a próxima começa sozinha, até a
		última. Nada foi cortado nem resumido — são as mesmas aulas da página de cada tópico, com narração, legendas e tela cheia.
	</p>
	<p class="small muted">
		{lista.length} aulas · {totalPartes} partes · cerca de {Math.round(totalHoras)} horas de aula. O Intensivão lembra, neste aparelho, onde você parou.
	</p>
	<div class="seq" role="radiogroup" aria-label="Quais aulas entram na sequência">
		{#each SEQUENCIAS as s (s.id)}
			{@const n = s.id === 'tudo' ? data.aulas.length : data.aulas.filter((a) => a.disciplina === s.id).length}
			<button class="btn" class:primary={seq === s.id} role="radio" aria-checked={seq === s.id} onclick={() => trocarSequencia(s.id)}>
				{s.nome} <span class="n">{n}</span>
			</button>
		{/each}
	</div>
</header>

<section class="palco-intensivo" aria-label="Aula tocando">
	{#if aulaAtual}
		<div class="agora">
			<p class="eyebrow">Aula {kAtual + 1} de {lista.length} · {aulaAtual.grupo}</p>
			<h2>{aulaAtual.titulo}</h2>
			<p class="small muted">
				Parte {parteAtual} de {aulaAtual.partes}
				{#if restanteSeg > 0}· depois desta, ainda há cerca de {horas(restanteSeg)} de aulas{/if}
			</p>
			{#if carregadas[jAtual]}
				{@const c = carregadas[jAtual]}
				<div class="partes" role="group" aria-label="Partes desta aula">
					{#each { length: c.partes } as _, n (n)}
						<button
							class:atual={n + 1 === parteAtual}
							aria-current={n + 1 === parteAtual ? 'true' : undefined}
							title={episodios[c.primeiro + n]?.titulo}
							onclick={() => player?.irParaEpisodio(c.primeiro + n)}
						>
							<span class="mono">{n + 1}</span>
							<span class="pt">{episodios[c.primeiro + n]?.titulo}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	{#if episodios.length}
		{#key sessao}
			<Player
				bind:this={player}
				{episodios}
				inicial={parteInicial}
				continuo
				{haMais}
				mostrarEpisodios={false}
				cenasRecolhidas
				rotuloInicio={`Assistir · aula ${kAtual + 1} de ${lista.length}`}
				{aoMudarEpisodio}
			/>
		{/key}
	{:else}
		<div class="carregando card" aria-live="polite">
			{#if erro}
				<p>{erro}</p>
				<button class="btn primary" onclick={() => comecar(inicio)}>Tentar de novo</button>
			{:else}
				<p class="muted">Carregando a aula…</p>
			{/if}
		</div>
	{/if}

	{#if erro && episodios.length}
		<p class="notice warn small">{erro} <button class="btn" onclick={() => anexarProxima()}>Tentar de novo</button></p>
	{/if}

	{#if aulaAtual}
		<div class="navega">
			<button class="btn" disabled={kAtual === 0} onclick={() => irParaAula(kAtual - 1)}><Icon name="prev" size={18} /> Aula anterior</button>
			<button class="btn" disabled={kAtual >= lista.length - 1} onclick={() => irParaAula(kAtual + 1)}>Próxima aula <Icon name="next" size={18} /></button>
			<span class="espaco"></span>
			<a class="btn" href="/simulados/aula/{aulaAtual.id}">Simulado desta aula</a>
			<a class="btn" href="/aulas/{aulaAtual.id}">Página da aula</a>
		</div>
	{/if}
</section>

<section class="fila" aria-labelledby="fila-titulo">
	<h2 id="fila-titulo">A sequência</h2>
	<p class="small muted">Toque numa aula para ir direto a ela; a reprodução continua dali até o fim da lista.</p>
	{#each grupos as g (g.nome)}
		<details open={g.aulas.some((x) => x.k === kAtual)}>
			<summary><strong>{g.nome}</strong> <span class="small muted">· {g.aulas.length} aulas</span></summary>
			<ol class="aulas">
				{#each g.aulas as { a, k } (a.id)}
					<li>
						<button class:atual={k === kAtual} aria-current={k === kAtual ? 'true' : undefined} onclick={() => irParaAula(k)}>
							<span class="num mono">{String(k + 1).padStart(2, '0')}</span>
							<span class="t">{a.titulo}</span>
							<span class="meta small muted">{a.partes} {a.partes === 1 ? 'parte' : 'partes'} · {horas(a.duracaoSeg)}</span>
							{#if k === kAtual}
								<span class="estado tocando">tocando</span>
							{:else if vistas.includes(a.id)}
								<span class="estado vista"><Icon name="check" size={14} /> vista</span>
							{/if}
						</button>
					</li>
				{/each}
			</ol>
		</details>
	{/each}
</section>

<style>
	.hero h1 {
		margin: 0.2rem 0 0.5rem;
		font-family: var(--display);
	}
	.hero p {
		max-width: 70ch;
	}
	.seq {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}
	.seq .n {
		font-family: var(--mono);
		font-size: 0.8em;
		opacity: 0.75;
		margin-left: 0.25rem;
	}
	@media (max-width: 640px) {
		.hero .desc {
			font-size: 0.95rem;
			line-height: 1.5;
		}
		.seq .btn {
			padding: 0.4rem 0.75rem;
			font-size: 0.9rem;
		}
	}
	.palco-intensivo {
		margin: 1.25rem 0;
		display: grid;
		gap: 0.75rem;
		min-width: 0;
	}
	/* Itens da grade não crescem além da coluna (a fila de partes rola por dentro). */
	.palco-intensivo > :global(*) {
		min-width: 0;
	}
	.agora h2 {
		margin: 0.1rem 0 0.2rem;
		font-family: var(--display);
		text-wrap: balance;
	}
	.agora p {
		margin: 0;
	}
	/* Uma linha só: no celular, as partes deslizam para o lado e o player fica no alto da tela. */
	.partes {
		display: flex;
		flex-wrap: nowrap;
		gap: 0.4rem;
		margin-top: 0.6rem;
		overflow-x: auto;
		max-width: 100%;
		padding-bottom: 0.25rem;
		scrollbar-width: thin;
	}
	.partes button {
		flex: none;
	}
	.partes button {
		display: inline-flex;
		align-items: baseline;
		gap: 0.4rem;
		max-width: 100%;
		padding: 0.3rem 0.7rem;
		border-radius: 999px;
		border: 1px solid var(--border-strong);
		background: var(--surface);
		color: inherit;
		font: inherit;
		font-size: 0.85rem;
		cursor: pointer;
		min-width: 0;
	}
	.partes button .mono {
		color: var(--primary);
		font-weight: 700;
	}
	.partes button .pt {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 22ch;
	}
	.partes button.atual {
		background: var(--primary);
		border-color: var(--primary);
		color: var(--primary-contrast);
	}
	.partes button.atual .mono {
		color: inherit;
	}
	.carregando {
		aspect-ratio: 16 / 9;
		max-width: 100%;
		display: grid;
		place-content: center;
		justify-items: center;
		gap: 0.75rem;
		text-align: center;
	}
	.navega {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
	}
	.navega .espaco {
		flex: 1;
	}
	.navega :global(.icon),
	.estado :global(.icon) {
		vertical-align: -3px;
	}
	.fila h2 {
		font-family: var(--display);
		margin: 1.5rem 0 0.25rem;
	}
	.fila details {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 0.6rem 0.9rem;
		margin-top: 0.75rem;
	}
	.fila summary {
		cursor: pointer;
		padding: 0.25rem 0;
	}
	.aulas {
		list-style: none;
		margin: 0.5rem 0 0.25rem;
		padding: 0;
		display: grid;
		gap: 0.25rem;
	}
	.aulas button {
		width: 100%;
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		grid-template-areas: 'num t estado' 'num meta estado';
		gap: 0 0.75rem;
		align-items: center;
		text-align: left;
		padding: 0.55rem 0.7rem;
		border-radius: var(--radius-sm);
		border: 1px solid transparent;
		background: transparent;
		color: inherit;
		font: inherit;
		cursor: pointer;
	}
	.aulas button:hover {
		background: var(--primary-soft);
	}
	.aulas button.atual {
		background: var(--primary-soft);
		border-color: var(--primary);
	}
	.aulas .num {
		grid-area: num;
		color: var(--primary);
		font-weight: 700;
	}
	.aulas .t {
		grid-area: t;
		font-weight: 600;
		min-width: 0;
	}
	.aulas .meta {
		grid-area: meta;
	}
	.estado {
		grid-area: estado;
		font-size: 0.78rem;
		font-weight: 700;
		padding: 0.1rem 0.55rem;
		border-radius: 999px;
		white-space: nowrap;
	}
	.estado.tocando {
		background: var(--primary);
		color: var(--primary-contrast);
	}
	.estado.vista {
		background: var(--ok-soft);
		color: var(--ok);
	}
</style>
