<svelte:options namespace="svg" />

<script lang="ts">
	import type { Item } from '../tipos';
	import type { Cronograma } from '../tempo';
	import { clamp01, progresso, suave } from '../tempo';
	import { FONTE } from '../util';
	import { caberLinha, encaixar } from '../medida.svelte';

	/**
	 * Diagramas de explicação: número em destaque, gráfico de barras, pirâmide social,
	 * causas/consequências (setas para um centro) e o quadro do “Momento UERJ”.
	 */
	let {
		tipo,
		w,
		h,
		titulo = '',
		valor = '',
		legenda = '',
		itens = [],
		sentido = 'entra',
		cor = '#b3261e',
		p,
		crono,
		t
	}: {
		tipo: 'numero' | 'grafico' | 'piramide' | 'causas' | 'uerj';
		w: number;
		h: number;
		titulo?: string;
		valor?: string;
		legenda?: string;
		itens?: (Item & { valor?: number })[];
		sentido?: 'entra' | 'sai';
		cor?: string;
		p: number;
		crono: Cronograma;
		t: number;
	} = $props();

	const e = $derived(suave.saida(clamp01(p)));
	// número
	const tamValor = $derived(tipo === 'numero' ? caberLinha(valor, w - 40, 'display', Math.min(220, h * 0.55), 800) : 0);
	const leg = $derived(tipo === 'numero' ? encaixar(legenda, w - 60, h - tamValor - 40, 'corpo', 34, 600, 1.25, 14) : null);
	// gráfico
	const maximo = $derived(Math.max(1, ...itens.map((i) => i.valor ?? 0)));
	const larguraRotulo = $derived(w * 0.34);
	const linhaG = $derived(tipo === 'grafico' ? (h - (titulo ? 70 : 10)) / Math.max(1, itens.length) : 0);
	// pirâmide / causas / uerj
	const tit = $derived(titulo ? encaixar(titulo, w - 40, 80, 'display', 32, 800, 1.15, 15) : null);
	const nivelAlt = $derived(tipo === 'piramide' ? (h - (tit ? tit.altura + 20 : 0)) / Math.max(1, itens.length) : 0);
	const caixaCausa = $derived(tipo === 'causas' ? { w: w * 0.44, h: Math.min(130, (h - 16 * (itens.length - 1)) / Math.max(1, itens.length)) } : { w: 0, h: 0 });
	const centroCausa = $derived(sentido === 'entra' ? { x: w * 0.68, y: 0, w: w * 0.32, h } : { x: 0, y: 0, w: w * 0.32, h });
	const uerjParte = $derived(tipo === 'uerj' ? (h - 96) / Math.max(1, itens.length) : 0);
</script>

<g class="diagrama {tipo}">
	{#if tipo === 'numero'}
		<rect x="8" y="10" width={w} height={h} rx="22" fill="rgba(0,0,0,0.3)" />
		<rect width={w} height={h} rx="22" fill="#fffaf0" />
		<rect width={w} height="12" rx="6" fill={cor} />
		<text x={w / 2} y={30 + tamValor * 0.88} text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size={tamValor} fill={cor} transform="translate({w / 2} {h / 3}) scale({0.7 + 0.3 * e}) translate({-w / 2} {-h / 3})">{valor}</text>
		{#if leg}
			{#each leg.linhas as l, i (i)}
				<text x={w / 2} y={50 + tamValor + leg.tam * (0.9 + i * 1.25)} text-anchor="middle" font-family={FONTE.corpo} font-weight="600" font-size={leg.tam} fill="#1a1410" opacity={clamp01(p * 2 - 0.6)}>{l}</text>
			{/each}
		{/if}
	{:else if tipo === 'grafico'}
		<rect x="-20" y="-20" width={w + 40} height={h + 40} rx="20" fill="#fffaf0" />
		{#if tit}
			<text x="0" y={tit.tam} font-family={FONTE.display} font-weight="800" font-size={tit.tam} fill="#1a1410">{tit.linhas[0]}</text>
		{/if}
		{#each itens as it, i (i)}
			{@const ip = progresso(it.a, crono, t)}
			{#if ip.visivel}
				{@const y0 = (titulo ? 70 : 10) + i * linhaG}
				{@const alt = Math.min(56, linhaG * 0.62)}
				{@const rot = encaixar(it.rotulo ?? '', larguraRotulo - 16, linhaG - 6, 'corpo', 24, 700, 1.15, 11)}
				{@const comp = ((w - larguraRotulo - 120) * (it.valor ?? 0)) / maximo}
				<g opacity={ip.saida}>
					{#each rot.linhas as l, j (j)}
						<text x={larguraRotulo - 16} y={y0 + linhaG / 2 - (rot.linhas.length * rot.tam * 1.15) / 2 + rot.tam * (0.9 + j * 1.15)} text-anchor="end" font-family={FONTE.corpo} font-weight="700" font-size={rot.tam} fill="#1a1410">{l}</text>
					{/each}
					<rect x={larguraRotulo} y={y0 + (linhaG - alt) / 2} width={Math.max(2, comp * suave.saida(ip.p))} height={alt} rx="6" fill={cor} />
					<text x={larguraRotulo + comp * suave.saida(ip.p) + 12} y={y0 + linhaG / 2 + 9} font-family={FONTE.mono} font-weight="700" font-size="24" fill="#1a1410" opacity={clamp01(ip.p * 2 - 1)}>{it.texto}</text>
				</g>
			{/if}
		{/each}
	{:else if tipo === 'piramide'}
		{#if tit}
			{#each tit.linhas as l, j (j)}
				<text x={w / 2} y={tit.tam * (0.9 + j * 1.15)} text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size={tit.tam} fill="#fffaf0" stroke="#1a1410" stroke-width="5" paint-order="stroke">{l}</text>
			{/each}
		{/if}
		{#each itens as it, i (i)}
			{@const ip = progresso(it.a, crono, t)}
			{#if ip.visivel}
				{@const y0 = (tit ? tit.altura + 20 : 0) + i * nivelAlt}
				{@const topo = (w * (i + 0.15)) / (itens.length + 0.15)}
				{@const base = (w * (i + 1.15)) / (itens.length + 0.15)}
				{@const meio = (topo + base) / 2}
				{@const txt = encaixar(it.texto, meio * 0.86, nivelAlt - 12, 'display', 30, 800, 1.12, 11)}
				{@const cores = ['#b45309', '#2f3cd9', '#0f766e', '#7c3aed', '#b3261e', '#1f2f5c']}
				<g opacity={clamp01(ip.p * 1.6) * ip.saida} transform="translate(0 {(1 - suave.saida(ip.p)) * -24})">
					<path d="M{(w - topo) / 2},{y0} L{(w + topo) / 2},{y0} L{(w + base) / 2},{y0 + nivelAlt - 6} L{(w - base) / 2},{y0 + nivelAlt - 6} Z" fill={cores[i % cores.length]} />
					{#each txt.linhas as l, j (j)}
						<text x={w / 2} y={y0 + (nivelAlt - 6) / 2 - (txt.linhas.length * txt.tam * 1.12) / 2 + txt.tam * (0.88 + j * 1.12)} text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size={txt.tam} fill="#fffaf0">{l}</text>
					{/each}
				</g>
			{/if}
		{/each}
	{:else if tipo === 'causas'}
		{@const centro = encaixar(titulo, centroCausa.w - 40, centroCausa.h - 40, 'display', 40, 800, 1.12, 14)}
		<g opacity={e}>
			<rect x={centroCausa.x} y={(h - Math.min(h, centro.altura + 70)) / 2} width={centroCausa.w} height={Math.min(h, centro.altura + 70)} rx="22" fill={cor} />
			{#each centro.linhas as l, j (j)}
				<text x={centroCausa.x + centroCausa.w / 2} y={h / 2 - centro.altura / 2 + centro.tam * (0.88 + j * 1.12)} text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size={centro.tam} fill="#fffaf0">{l}</text>
			{/each}
		</g>
		{#each itens as it, i (i)}
			{@const ip = progresso(it.a, crono, t)}
			{#if ip.visivel}
				{@const passo = (h - caixaCausa.h) / Math.max(1, itens.length - 1)}
				{@const y0 = itens.length === 1 ? (h - caixaCausa.h) / 2 : i * passo}
				{@const x0 = sentido === 'entra' ? 0 : w - caixaCausa.w}
				{@const txt = encaixar(it.texto, caixaCausa.w - 36, caixaCausa.h - 24, 'corpo', 26, 700, 1.2, 11)}
				{@const ax = sentido === 'entra' ? caixaCausa.w + 8 : centroCausa.w + 8}
				{@const bx = sentido === 'entra' ? centroCausa.x - 14 : x0 - 14}
				{@const ay = sentido === 'entra' ? y0 + caixaCausa.h / 2 : h / 2}
				{@const by = sentido === 'entra' ? h / 2 : y0 + caixaCausa.h / 2}
				{@const kk = suave.entradaSaida(clamp01(ip.p * 1.4))}
				<g opacity={ip.saida}>
					<g opacity={clamp01(ip.p * 2)} transform="translate({(1 - suave.saida(ip.p)) * (sentido === 'entra' ? -30 : 30)} 0)">
						<rect x={x0} y={y0} width={caixaCausa.w} height={caixaCausa.h} rx="14" fill="#fffaf0" />
						<rect x={x0} y={y0} width="8" height={caixaCausa.h} rx="4" fill={cor} />
						{#each txt.linhas as l, j (j)}
							<text x={x0 + 22} y={y0 + caixaCausa.h / 2 - (txt.linhas.length * txt.tam * 1.2) / 2 + txt.tam * (0.9 + j * 1.2)} font-family={FONTE.corpo} font-weight="700" font-size={txt.tam} fill="#1a1410">{l}</text>
						{/each}
					</g>
					<line x1={ax} y1={ay} x2={ax + (bx - ax) * kk} y2={ay + (by - ay) * kk} stroke="#ffd84d" stroke-width="5" stroke-linecap="round" />
					{#if kk > 0.95}
						<path d="M0,0 L-16,-9 L-16,9 Z" fill="#ffd84d" transform="translate({bx} {by}) rotate({(Math.atan2(by - ay, bx - ax) * 180) / Math.PI})" />
					{/if}
				</g>
			{/if}
		{/each}
	{:else if tipo === 'uerj'}
		<rect x="-10" y="-10" width={w + 20} height={h + 20} rx="18" fill="#203a2e" stroke="#6b4a2c" stroke-width="12" />
		<text x="24" y="44" font-family={FONTE.mono} font-weight="700" font-size="22" fill="#ffd84d" letter-spacing="2">MOMENTO UERJ</text>
		<text x="24" y="82" font-family={FONTE.display} font-weight="800" font-size={caberLinha(titulo, w - 300, 'display', 32, 800)} fill="#f3efe6">{titulo}</text>
		<g transform="translate({w - 150} 46) rotate(-6)">
			<rect x="-112" y="-26" width="224" height="46" rx="5" fill="rgba(255,250,240,0.9)" stroke="#b3261e" stroke-width="3" />
			<text text-anchor="middle" y="6" font-family={FONTE.mono} font-weight="700" font-size="20" fill="#b3261e">QUESTÃO OFICIAL</text>
		</g>
		{#each itens as it, i (i)}
			{@const ip = progresso(it.a, crono, t)}
			{#if ip.visivel}
				{@const y0 = 100 + i * uerjParte}
				{@const rot = it.rotulo ? it.rotulo.toUpperCase() : ''}
				{@const txt = encaixar(it.texto, w - 60, uerjParte - (rot ? 38 : 14), 'corpo', 27, 600, 1.25, 11)}
				<g opacity={clamp01(ip.p * 1.6) * ip.saida} transform="translate(0 {(1 - suave.saida(ip.p)) * 18})">
					{#if rot}
						<text x="26" y={y0 + 24} font-family={FONTE.mono} font-weight="700" font-size="18" fill="#ffd84d" letter-spacing="2">{rot}</text>
					{/if}
					{#each txt.linhas as l, j (j)}
						<text x="26" y={y0 + (rot ? 34 : 4) + txt.tam * (0.92 + j * 1.25)} font-family={FONTE.corpo} font-weight="600" font-size={txt.tam} fill="#f3efe6">{l}</text>
					{/each}
				</g>
			{/if}
		{/each}
	{/if}
</g>
