<svelte:options namespace="svg" />

<script lang="ts">
	import dados from '../mundo.json';
	import type { Animacao } from '../tipos';
	import type { Cronograma } from '../tempo';
	import { clamp01, progresso, suave } from '../tempo';
	import { lugar } from '../lugares';
	import { FONTE, misturar } from '../util';
	import { medir } from '../medida.svelte';

	/**
	 * Mapa-múndi (Natural Earth 1:50m, domínio público), projetado no palco em Mercator.
	 * Só desenha os países que aparecem na câmera; rótulos e traços mantêm o tamanho na tela em qualquer zoom.
	 */
	let {
		pinta = [],
		marcas = [],
		rotas = [],
		rotulos = [],
		crono,
		t,
		vivo,
		cam
	}: {
		pinta?: { paises: string[]; cor: string; a: Animacao }[];
		marcas?: { lugar: string; texto?: string; cor?: string; lado?: 'esq' | 'dir'; a: Animacao }[];
		rotas?: { pontos: string[]; cor?: string; texto?: string; tracejada?: boolean; reta?: boolean; a: Animacao }[];
		rotulos?: { texto: string; lugar?: string; pais?: string; tam?: number; cor?: string; carimbo?: boolean; a: Animacao }[];
		crono: Cronograma;
		t: number;
		vivo: number;
		cam: { x: number; y: number; z: number };
	} = $props();

	type Pais = { n: string; d: string; c: [number, number]; b: [number, number, number, number] };
	const PAISES = (dados as unknown as { paises: Record<string, Pais> }).paises;
	const CODIGOS = Object.keys(PAISES);
	const BASE = '#e9dfc8';
	const BORDA = '#8c7a5b';

	const k = $derived(1 / cam.z);
	const visiveis = $derived.by(() => {
		const mx = 820 / cam.z;
		const my = 470 / cam.z;
		const x0 = cam.x - mx;
		const x1 = cam.x + mx;
		const y0 = cam.y - my;
		const y1 = cam.y + my;
		return CODIGOS.filter((c) => {
			const b = PAISES[c].b;
			return b[2] >= x0 && b[0] <= x1 && b[3] >= y0 && b[1] <= y1;
		});
	});

	function corDe(codigo: string): string {
		let cor = BASE;
		for (const p of pinta) {
			if (!p.paises.includes(codigo)) continue;
			const { p: kk } = progresso({ ...p.a, dur: p.a.dur ?? 0.9 }, crono, t);
			if (kk >= 1) cor = p.cor;
			else if (kk > 0) return misturar(cor, p.cor, suave.entradaSaida(kk));
		}
		return cor;
	}

	function posicao(nome?: string, pais?: string): [number, number] | undefined {
		if (pais && PAISES[pais]) return PAISES[pais].c;
		return nome ? lugar(nome) : undefined;
	}

	/** Pontos de uma rota em curva suave (quadrática por trecho). */
	function trechos(pontos: string[], reta = false): { d: string; fim: [number, number]; ang: number; meio: [number, number] }[] {
		const ps = pontos.map((p) => lugar(p)).filter((p): p is [number, number] => !!p);
		const lista: { d: string; fim: [number, number]; ang: number; meio: [number, number] }[] = [];
		for (let i = 0; i < ps.length - 1; i++) {
			const [x1, y1] = ps[i];
			const [x2, y2] = ps[i + 1];
			const dist = Math.hypot(x2 - x1, y2 - y1);
			const curva = reta ? 0 : 0.18;
			const cx = (x1 + x2) / 2 - ((y2 - y1) / (dist || 1)) * dist * curva;
			const cy = (y1 + y2) / 2 + ((x2 - x1) / (dist || 1)) * dist * curva;
			// meio: ponto da curva em t = 0,5 (onde vai o rótulo da rota)
			const meio: [number, number] = [0.25 * x1 + 0.5 * cx + 0.25 * x2, 0.25 * y1 + 0.5 * cy + 0.25 * y2];
			lista.push({ d: `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`, fim: [x2, y2], ang: (Math.atan2(y2 - cy, x2 - cx) * 180) / Math.PI, meio });
		}
		return lista;
	}
</script>

<g class="mundo">
	{#each visiveis as codigo (codigo)}
		<path d={PAISES[codigo].d} fill={corDe(codigo)} stroke={BORDA} stroke-width={0.9 * k} stroke-linejoin="round" />
	{/each}

	{#each rotas as r, i (i)}
		{@const pr = progresso(r.a, crono, t)}
		{#if pr.visivel}
			{@const partes = trechos(r.pontos, r.reta)}
			{@const cor = r.cor ?? '#b3261e'}
			{@const total = clamp01(pr.p) * partes.length}
			<g opacity={pr.saida}>
				{#each partes as tr, j (j)}
					{@const kk = clamp01(total - j)}
					{#if kk > 0}
						<path d={tr.d} fill="none" stroke="rgba(10,14,22,0.45)" stroke-width={7 * k} stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset={1 - kk} />
						<path
							d={tr.d}
							fill="none"
							stroke={cor}
							stroke-width={4 * k}
							stroke-linecap="round"
							pathLength="1"
							stroke-dasharray={r.tracejada ? '0.012 0.012' : '1 1'}
							stroke-dashoffset={r.tracejada ? 0 : 1 - kk}
							opacity={r.tracejada ? clamp01(kk * 3) : 1}
						/>
						{#if kk >= 1 && j === partes.length - 1}
							<path d="M0,0 L-14,-8 L-14,8 Z" fill={cor} transform="translate({tr.fim[0]} {tr.fim[1]}) rotate({tr.ang}) scale({k})" />
						{/if}
					{/if}
				{/each}
				{#if r.texto && partes.length && pr.p > 0.5}
					{@const meio = partes[Math.floor((partes.length - 1) / 2)]?.meio}
					{#if meio}
						{@const tam = 26}
						{@const larg = medir(r.texto, 'display', tam, 800) + 28}
						<g transform="translate({meio[0]} {meio[1]}) scale({k}) translate(0 -26)" opacity={clamp01((pr.p - 0.5) * 3)}>
							<rect x={-larg / 2} y={-tam - 4} width={larg} height={tam + 16} rx="8" fill="rgba(10,14,22,0.82)" />
							<text text-anchor="middle" y="2" font-family={FONTE.display} font-weight="800" font-size={tam} fill={misturar(cor, '#ffffff', 0.55)}>{r.texto}</text>
						</g>
					{/if}
				{/if}
			</g>
		{/if}
	{/each}

	{#each marcas as m, i (i)}
		{@const pr = progresso(m.a, crono, t)}
		{@const pos = posicao(m.lugar)}
		{#if pr.visivel && pos}
			{@const cor = m.cor ?? '#b3261e'}
			{@const pulso = (vivo * 0.7 + i * 0.37) % 1}
			{@const texto = m.texto ?? m.lugar}
			{@const tam = 24}
			{@const larg = medir(texto, 'corpo', tam, 800) + 20}
			{@const telaX = (pos[0] - cam.x) * cam.z + 800}
			{@const esquerda = m.lado === 'esq' || (m.lado !== 'dir' && telaX + larg + 30 > 1590)}
			<g transform="translate({pos[0]} {pos[1]}) scale({k})" opacity={suave.saida(pr.p) * pr.saida}>
				<circle r={6 + 16 * pulso} fill="none" stroke={cor} stroke-width="2" opacity={1 - pulso} />
				<circle r={7 * suave.elastico(pr.p)} fill={cor} stroke="#fff" stroke-width="2.4" />
				{#if texto}
					<g transform="translate({esquerda ? -14 - larg + 4 : 14} -14)">
						<rect x="-4" y={-tam - 2} width={larg} height={tam + 12} rx="7" fill="rgba(255,250,240,0.92)" stroke={cor} stroke-width="1.6" />
						<text x={larg / 2 - 4} y="3" text-anchor="middle" font-family={FONTE.corpo} font-weight="800" font-size={tam} fill="#1a1410">{texto}</text>
					</g>
				{/if}
			</g>
		{/if}
	{/each}

	{#each rotulos as r, i (i)}
		{@const pr = progresso(r.a, crono, t)}
		{@const pos = posicao(r.lugar, r.pais)}
		{#if pr.visivel && pos}
			{@const tam = (r.tam ?? 24) * 1.15}
			{#if r.carimbo}
				{@const larg = medir(r.texto, 'mono', tam, 700) + 28}
				{@const kk = suave.saida(clamp01(pr.p * 1.8))}
				<g transform="translate({pos[0]} {pos[1]}) scale({k * (1 + (1 - kk) * 0.8)}) rotate(-7)" opacity={kk * pr.saida}>
					<rect x={-larg / 2} y={-tam * 0.95} width={larg} height={tam * 1.5} rx="5" fill="rgba(255,250,240,0.9)" stroke={r.cor ?? '#b3261e'} stroke-width="3" />
					<text text-anchor="middle" y={tam * 0.18} font-family={FONTE.mono} font-weight="700" font-size={tam} fill={r.cor ?? '#b3261e'}>{r.texto}</text>
				</g>
			{:else}
				<text
					transform="translate({pos[0]} {pos[1]}) scale({k})"
					text-anchor="middle"
					font-family={FONTE.display}
					font-weight="800"
					font-size={tam}
					fill={r.cor ?? '#1a1410'}
					stroke="rgba(255,250,240,0.92)"
					stroke-width={tam / 5}
					stroke-linejoin="round"
					paint-order="stroke"
					opacity={suave.saida(pr.p) * pr.saida}>{r.texto}</text
				>
			{/if}
		{/if}
	{/each}
</g>
