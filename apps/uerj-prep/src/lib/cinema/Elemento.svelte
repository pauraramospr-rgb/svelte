<svelte:options namespace="svg" />

<script lang="ts">
	import type { Elemento } from './tipos';
	import type { Cronograma } from './tempo';
	import { clamp01, instante, progresso, suave } from './tempo';
	import { FONTE, larguraTexto, linhasPara } from './util';
	import Pessoa from './elementos/Pessoa.svelte';
	import Prop from './elementos/Prop.svelte';
	import Mapa from './elementos/Mapa.svelte';
	import Doc from './elementos/Doc.svelte';
	import Retrato from './elementos/Retrato.svelte';
	import Balanca from './elementos/Balanca.svelte';
	import Multidao from './elementos/Multidao.svelte';

	let { el, crono, t, vivo, falando, indice }: { el: Elemento; crono: Cronograma; t: number; vivo: number; falando: boolean; indice: number } = $props();

	const uid = $props.id();

	/** Cor clara (como o dourado): o carimbo ganha fundo escuro para continuar legível. */
	function claro(cor: string): boolean {
		const h = cor.replace('#', '');
		if (h.length !== 6) return false;
		const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
		return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.55;
	}
	const pr = $derived(progresso(el.a, crono, t));
	const inicio = $derived(instante(el.a, crono));
	/** Segundos desde que o elemento entrou. */
	const tl = $derived(Math.max(0, t - inicio));
	const fx = $derived(el.a.fx ?? (el.k === 'seta' || el.k === 'linha' ? 'draw' : el.k === 'carimbo' ? 'pop' : 'fade'));
	const e = $derived(fx === 'pop' ? suave.elastico(pr.p) : suave.saida(pr.p));

	const ancora = $derived.by((): [number, number] => {
		if ('x' in el && 'y' in el && typeof el.x === 'number') {
			if (el.k === 'tabela' || el.k === 'tarja' || el.k === 'linha') return [el.x + el.w / 2, el.y];
			return [el.x, el.y];
		}
		if (el.k === 'seta') return el.para;
		return [800, 450];
	});

	const transformacao = $derived.by(() => {
		const [ax, ay] = ancora;
		switch (fx) {
			case 'up':
				return `translate(0 ${(1 - e) * 46})`;
			case 'down':
				return `translate(0 ${(e - 1) * 46})`;
			case 'left':
				return `translate(${(e - 1) * 90} 0)`;
			case 'right':
				return `translate(${(1 - e) * 90} 0)`;
			case 'pop':
				return `translate(${ax} ${ay}) scale(${0.55 + 0.45 * e}) translate(${-ax} ${-ay})`;
			case 'zoom':
				return `translate(${ax} ${ay}) scale(${1.35 - 0.35 * e}) translate(${-ax} ${-ay})`;
			default:
				return '';
		}
	});
	const opacidade = $derived(
		(fx === 'none' || fx === 'wipe' ? 1 : fx === 'draw' || fx === 'type' ? clamp01(pr.p * 5) : clamp01(pr.p * 1.4)) * pr.saida
	);

	/** Caixa usada no efeito de cortina (wipe): [esquerda, largura]. */
	const caixa = $derived.by((): [number, number] => {
		if (el.k === 'doc' || el.k === 'cartao') return [el.k === 'doc' ? el.x - el.w / 2 : el.x, el.w];
		if (el.k === 'tarja' || el.k === 'tabela' || el.k === 'linha') return [el.x, el.w];
		if (el.k === 'texto') {
			const larg = el.larg ?? 1200;
			return [el.alinhar === 'middle' ? el.x - larg / 2 : el.alinhar === 'end' ? el.x - larg : el.x, larg];
		}
		return [-300, 2200];
	});

	// Deslocamento genérico (carros, navios, lupas…).
	const desloc = $derived.by(() => {
		if (!el.mov) return '';
		const fim = instante(el.mov.ate, crono);
		const k = suave.entradaSaida(clamp01((t - inicio) / Math.max(0.1, fim - inicio)));
		return `translate(${el.mov.dx * k} ${(el.mov.dy ?? 0) * k})`;
	});

	// Pessoa que anda: posição ao longo do tempo.
	const passo = $derived.by(() => {
		if (el.k !== 'pessoa' || !el.anda) return { dx: 0, andando: false };
		const fim = instante(el.anda.ate, crono);
		const k = clamp01((t - inicio) / Math.max(0.1, fim - inicio));
		return { dx: el.anda.dx * suave.entradaSaida(k), andando: k > 0 && k < 1 };
	});
</script>

{#if pr.visivel}
	<g class="el el-{el.k}" opacity={opacidade} transform="{transformacao} {desloc}" clip-path={fx === 'wipe' ? `url(#${uid}-wipe)` : undefined}>
		{#if fx === 'wipe'}
			<clipPath id="{uid}-wipe">
				<rect x={caixa[0] - 40} y="-400" width={(caixa[1] + 80) * suave.entradaSaida(pr.p)} height="1800" />
			</clipPath>
		{/if}

		{#if el.k === 'titulo'}
			{@const tam = el.tam ?? 84}
			{@const linhas = linhasPara(el.texto, 1380, tam, 'display')}
			{@const anc = el.alinhar ?? 'middle'}
			{#each linhas as l, i (i)}
				<text
					x={el.x}
					y={el.y + i * tam * 1.05}
					text-anchor={anc}
					font-family={FONTE.display}
					font-weight="800"
					font-size={tam}
					letter-spacing={(1 - e) * tam * 0.25}
					fill={el.cor ?? '#fffaf0'}
					style="text-shadow: 0 4px 24px rgba(0,0,0,.45)">{l}</text
				>
			{/each}
			{#if el.sub}
				{@const y = el.y + (linhas.length - 1) * tam * 1.05 + tam * 0.72}
				{@const larg = Math.min(900, larguraTexto(el.sub, tam * 0.34, 'corpo') + 40)}
				<line
					x1={anc === 'middle' ? el.x - (larg / 2) * e : el.x}
					x2={anc === 'middle' ? el.x + (larg / 2) * e : el.x + larg * e}
					y1={y - tam * 0.34}
					y2={y - tam * 0.34}
					stroke={el.cor ?? '#fffaf0'}
					stroke-width="2"
					opacity="0.6"
				/>
				<text x={el.x} y={y + 6} text-anchor={anc} font-family={FONTE.corpo} font-weight="600" font-size={tam * 0.34} letter-spacing="3" fill={el.cor ?? '#fffaf0'} opacity={0.9 * clamp01(pr.p * 2 - 0.5)}
					>{el.sub}</text
				>
			{/if}
		{:else if el.k === 'texto'}
			{@const tam = el.tam ?? 34}
			{@const fonte = el.fonte ?? 'corpo'}
			{@const linhas = linhasPara(el.texto, el.larg ?? 1200, tam, fonte)}
			{@const total = linhas.reduce((s, l) => s + l.length, 0)}
			{@const mostrar = fx === 'type' ? Math.floor(total * clamp01(pr.p)) : total}
			{@const anc = el.alinhar ?? 'start'}
			{#if el.caixa}
				{@const larg = Math.max(...linhas.map((l) => larguraTexto(l, tam, fonte))) + 48}
				<rect
					x={anc === 'middle' ? el.x - larg / 2 : anc === 'end' ? el.x - larg + 24 : el.x - 24}
					y={el.y - tam * 1.05}
					width={larg}
					height={linhas.length * tam * 1.28 + tam * 0.55}
					rx="10"
					fill={el.caixa}
				/>
			{/if}
			{#each linhas as l, i (i)}
				{@const antes = linhas.slice(0, i).reduce((s, x) => s + x.length, 0)}
				{@const parte = l.slice(0, Math.max(0, mostrar - antes))}
				{#if parte}
					<text
						x={el.x}
						y={el.y + i * tam * 1.28}
						text-anchor={anc}
						font-family={FONTE[fonte]}
						font-weight={el.peso ?? (fonte === 'display' ? 800 : 600)}
						font-style={el.italico ? 'italic' : 'normal'}
						font-size={tam}
						fill={el.cor ?? '#fffaf0'}>{parte}</text
					>
				{/if}
			{/each}
		{:else if el.k === 'carimbo'}
			{@const tam = el.tam ?? 44}
			{@const larg = larguraTexto(el.texto, tam, 'mono') + 50}
			<g transform="translate({el.x} {el.y}) rotate({el.rot ?? -8}) scale({fx === 'pop' ? 1 + (1 - clamp01(pr.p * 2.2)) * 1.1 : 1})" filter="url(#cin-gasto)">
				<rect x={-larg / 2} y={-tam * 0.95} width={larg} height={tam * 1.6} rx="6" fill={claro(el.cor ?? '#b3261e') ? 'rgba(18,14,10,0.82)' : 'rgba(255,250,240,0.86)'} stroke={el.cor ?? '#b3261e'} stroke-width="5" />
				<rect x={-larg / 2 + 8} y={-tam * 0.95 + 8} width={larg - 16} height={tam * 1.6 - 16} rx="4" fill="none" stroke={el.cor ?? '#b3261e'} stroke-width="2" />
				<text x="0" y={tam * 0.2} text-anchor="middle" font-family={FONTE.mono} font-weight="700" font-size={tam} fill={el.cor ?? '#b3261e'} letter-spacing="2">{el.texto}</text>
			</g>
		{:else if el.k === 'doc'}
			<g transform="translate({el.x} {el.y}) rotate({el.rot ?? 0})">
				<Doc titulo={el.titulo} linhas={el.linhas} barras={el.barras} destaque={el.destaque} w={el.w} h={el.h} p={pr.p} digitar={fx === 'type'} {vivo} semente={indice} tam={el.tam} />
			</g>
		{:else if el.k === 'mapa'}
			<Mapa estilo={el.estilo} paises={el.paises} rotulos={el.rotulos} pinta={el.pinta} cidades={el.cidades} {crono} {t} {vivo} />
		{:else if el.k === 'seta'}
			{@const [x1, y1] = el.de}
			{@const [x2, y2] = el.para}
			{@const mx = (x1 + x2) / 2 - (y2 - y1) * (el.curva ?? 0)}
			{@const my = (y1 + y2) / 2 + (x2 - x1) * (el.curva ?? 0)}
			{@const ang = Math.atan2(y2 - my, x2 - mx)}
			{@const esp = el.espessura ?? 7}
			{@const k = fx === 'draw' ? suave.entradaSaida(pr.p) : 1}
			{@const cor = el.cor ?? '#b3261e'}
			{#if el.tracejada}
				<mask id="{uid}-m">
					<path d="M{x1},{y1} Q{mx},{my} {x2},{y2}" fill="none" stroke="#fff" stroke-width={esp + 6} pathLength="1" stroke-dasharray="1 1" stroke-dashoffset={1 - k} />
				</mask>
				<path d="M{x1},{y1} Q{mx},{my} {x2},{y2}" fill="none" stroke={cor} stroke-width={esp} stroke-dasharray="{esp * 2.4} {esp * 1.8}" stroke-linecap="round" mask="url(#{uid}-m)" />
			{:else}
				<path d="M{x1},{y1} Q{mx},{my} {x2},{y2}" fill="none" stroke={cor} stroke-width={esp} stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset={1 - k} />
			{/if}
			{#if k > 0.9}
				<path
					d="M0,0 L{-esp * 3.4},{-esp * 2} L{-esp * 3.4},{esp * 2} Z"
					fill={cor}
					transform="translate({x2} {y2}) rotate({(ang * 180) / Math.PI})"
					opacity={clamp01((k - 0.9) * 10)}
				/>
			{/if}
			{#if el.texto}
				{@const larg = larguraTexto(el.texto, 26, 'display') + 28}
				<g opacity={clamp01(k * 2 - 1)}>
					<rect x={mx - larg / 2} y={my - 50} width={larg} height="44" rx="10" fill="rgba(10,12,20,0.78)" />
					<text x={mx} y={my - 19} text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size="26" fill={cor}>{el.texto}</text>
				</g>
			{/if}
		{:else if el.k === 'cartao'}
			{@const cor = el.cor ?? '#2f3cd9'}
			{@const tit = linhasPara(el.titulo, el.w - 56, 30, 'display')}
			{@const txt = linhasPara(el.texto ?? '', el.w - 56, 23, 'corpo')}
			<g transform="translate({el.x} {el.y})">
				<rect x="8" y="12" width={el.w} height={el.h} rx="18" fill="rgba(0,0,0,0.3)" filter="url(#cin-desfoque)" />
				<rect width={el.w} height={el.h} rx="18" fill="#fffaf0" />
				<rect width="12" height={el.h} rx="6" fill={cor} />
				{#if el.icone}
					<text x={el.w - 28} y="46" text-anchor="end" font-family={FONTE.mono} font-weight="700" font-size="20" fill={cor} letter-spacing="2">{el.icone}</text>
				{/if}
				{#each tit as l, i (i)}
					<text x="34" y={50 + i * 34} font-family={FONTE.display} font-weight="800" font-size="30" fill="#1a1410">{l}</text>
				{/each}
				{#each txt as l, i (i)}
					<text x="34" y={62 + tit.length * 34 + i * 31} font-family={FONTE.corpo} font-weight="500" font-size="23" fill="#3a3226">{l}</text>
				{/each}
			</g>
		{:else if el.k === 'pessoa'}
			{@const esc = el.esc ?? 1}
			<g transform="translate({el.x + passo.dx} {el.y}) scale({el.vira ? -esc : esc} {esc})">
				<Pessoa v={el.v} t={vivo} fala={el.fala} {falando} gesto={el.gesto} placa={el.placa} andando={passo.andando} semente={indice * 1.7} />
			</g>
		{:else if el.k === 'multidao'}
			<g transform="translate({el.x} {el.y})">
				<Multidao w={el.w} fileiras={el.fileiras} n={el.n} marcha={el.marcha} cores={el.cores} placas={el.placas} {vivo} {tl} />
			</g>
		{:else if el.k === 'prop'}
			<g transform="translate({el.x} {el.y}) rotate({el.rot ?? 0}) scale({el.esc ?? 1})">
				<Prop nome={el.nome} cor={el.cor} rotulo={el.rotulo} anima={el.anima} {vivo} {tl} />
			</g>
		{:else if el.k === 'linha'}
			{@const cor = el.cor ?? '#fffaf0'}
			{@const passoX = el.w / Math.max(1, el.itens.length)}
			<line x1={el.x} y1={el.y} x2={el.x + el.w * (fx === 'draw' ? suave.entradaSaida(pr.p) : 1)} y2={el.y} stroke={cor} stroke-width="4" opacity="0.85" />
			{#each el.itens as item, i (i)}
				{@const ip = progresso(item.a, crono, t)}
				{#if ip.visivel}
					{@const ie = suave.elastico(ip.p)}
					{@const cx = el.x + passoX * (i + 0.5)}
					<g opacity={clamp01(ip.p * 2) * ip.saida}>
						<circle {cx} cy={el.y} r={11 * ie} fill="#b3261e" stroke={cor} stroke-width="3" />
						<text x={cx} y={el.y - 26} text-anchor="middle" font-family={FONTE.mono} font-weight="700" font-size="30" fill={cor}>{item.rotulo}</text>
						{#each linhasPara(item.texto, passoX - 16, 21, 'corpo') as l, j (j)}
							<text x={cx} y={el.y + 44 + j * 25} text-anchor="middle" font-family={FONTE.corpo} font-weight="600" font-size="21" fill={cor} opacity="0.92">{l}</text>
						{/each}
					</g>
				{/if}
			{/each}
		{:else if el.k === 'tabela'}
			{@const col = el.w / el.colunas.length}
			<g transform="translate({el.x} {el.y})">
				<rect width={el.w} height="58" rx="10" fill="#1a1410" />
				{#each el.colunas as c, i (i)}
					<text x={col * i + col / 2} y="38" text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size="25" fill="#fffaf0">{c}</text>
				{/each}
				{#each el.linhas as linha, r (r)}
					{@const rp = progresso(linha.a, crono, t)}
					{#if rp.visivel}
						<g opacity={clamp01(rp.p * 1.5) * rp.saida} transform="translate({(1 - suave.saida(rp.p)) * -30} {70 + r * 92})">
							<rect width={el.w} height="84" rx="10" fill={r % 2 ? '#f3ead8' : '#fffaf0'} />
							{#each linha.celulas as cel, i (i)}
								{#each linhasPara(cel, col - 24, 22, 'corpo').slice(0, 3) as l, j (j)}
									<text x={col * i + col / 2} y={30 + j * 25} text-anchor="middle" font-family={FONTE.corpo} font-weight={i === 0 ? 800 : 500} font-size="22" fill="#1a1410">{l}</text>
								{/each}
							{/each}
						</g>
					{/if}
				{/each}
			</g>
		{:else if el.k === 'retrato'}
			<g transform="translate({el.x} {el.y}) scale({el.esc ?? 1})">
				<Retrato nome={el.nome} legenda={el.legenda} v={el.v} />
			</g>
		{:else if el.k === 'balanca'}
			<g transform="translate({el.x} {el.y}) scale({el.esc ?? 1})">
				<Balanca esq={el.esq} dir={el.dir} pende={el.pende} {crono} {t} />
			</g>
		{:else if el.k === 'tarja'}
			<rect
				x={el.x}
				y={el.y}
				width={el.w * (fx === 'fade' ? 1 : suave.entradaSaida(pr.p))}
				height={el.h}
				fill={el.cor ?? '#0b0b0b'}
				transform={el.rot ? `rotate(${el.rot} ${el.x + el.w / 2} ${el.y + el.h / 2})` : undefined}
			/>
		{:else if el.k === 'sombra'}
			<rect x="-400" y="-300" width="2400" height="1500" fill={el.cor ?? '#0b0d12'} opacity={(el.opac ?? 0.7) * suave.entradaSaida(pr.p)} />
		{:else if el.k === 'brilho'}
			<circle cx={el.x} cy={el.y} r={el.r} fill="url(#cin-brilho)" opacity={0.75 + 0.25 * Math.sin(vivo * 1.6 + indice)} style="mix-blend-mode: screen" />
		{/if}
	</g>
{/if}
