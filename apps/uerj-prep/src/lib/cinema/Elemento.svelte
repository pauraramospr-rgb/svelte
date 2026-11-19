<svelte:options namespace="svg" />

<script lang="ts">
	import type { Elemento } from './tipos';
	import type { Cronograma } from './tempo';
	import { clamp01, instante, progresso, suave } from './tempo';
	import { FONTE } from './util';
	import { caberLinha, encaixar, medir } from './medida.svelte';
	import Pessoa from './elementos/Pessoa.svelte';
	import Prop from './elementos/Prop.svelte';
	import Mapa from './elementos/Mapa.svelte';
	import Mundo from './elementos/Mundo.svelte';
	import Doc from './elementos/Doc.svelte';
	import Retrato from './elementos/Retrato.svelte';
	import Balanca from './elementos/Balanca.svelte';
	import Multidao from './elementos/Multidao.svelte';
	import Cartao from './elementos/Cartao.svelte';
	import Lista from './elementos/Lista.svelte';
	import Linha from './elementos/Linha.svelte';
	import Tabela from './elementos/Tabela.svelte';
	import Diagrama from './elementos/Diagrama.svelte';

	let {
		el,
		crono,
		t,
		vivo,
		falando,
		indice,
		cam = { x: 800, y: 450, z: 1 }
	}: { el: Elemento; crono: Cronograma; t: number; vivo: number; falando: boolean; indice: number; cam?: { x: number; y: number; z: number } } = $props();

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

	/** Centro do elemento (para os efeitos de escala). */
	const ancora = $derived.by((): [number, number] => {
		if ('w' in el && 'h' in el && typeof el.w === 'number' && typeof el.h === 'number' && el.k !== 'doc') return [el.x + el.w / 2, el.y + el.h / 2];
		if ('x' in el && 'y' in el && typeof el.x === 'number') {
			if ((el.k === 'tabela' || el.k === 'tarja' || el.k === 'linha') && 'w' in el) return [el.x + el.w / 2, el.y];
			return [el.x, el.y];
		}
		if (el.k === 'seta') return el.para;
		return [800, 450];
	});

	const transformacao = $derived.by(() => {
		const [ax, ay] = ancora;
		switch (fx) {
			case 'up':
				return `translate(0 ${(1 - e) * 40})`;
			case 'down':
				return `translate(0 ${(e - 1) * 40})`;
			case 'left':
				return `translate(${(e - 1) * 70} 0)`;
			case 'right':
				return `translate(${(1 - e) * 70} 0)`;
			case 'pop':
				return `translate(${ax} ${ay}) scale(${0.6 + 0.4 * e}) translate(${-ax} ${-ay})`;
			case 'zoom':
				return `translate(${ax} ${ay}) scale(${1.25 - 0.25 * e}) translate(${-ax} ${-ay})`;
			default:
				return '';
		}
	});
	const opacidade = $derived(
		(fx === 'none' || fx === 'wipe' ? 1 : fx === 'draw' || fx === 'type' ? clamp01(pr.p * 5) : clamp01(pr.p * 1.4)) * pr.saida
	);

	/** Caixa usada no efeito de cortina (wipe): [esquerda, largura]. */
	const caixa = $derived.by((): [number, number] => {
		if (el.k === 'doc') return [el.x - el.w / 2, el.w];
		if ('w' in el && typeof el.w === 'number' && 'x' in el && typeof el.x === 'number') return [el.x, el.w];
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
			{@const larg = el.larg ?? 1360}
			{@const enc = encaixar(el.texto, larg, 260, 'display', el.tam ?? 84, 800, 1.06, 28)}
			{@const anc = el.alinhar ?? 'middle'}
			{#each enc.linhas as l, i (i)}
				<text x={el.x} y={el.y + i * enc.tam * 1.06} text-anchor={anc} font-family={FONTE.display} font-weight="800" font-size={enc.tam} letter-spacing={(1 - e) * enc.tam * 0.18} fill={el.cor ?? '#fffaf0'}
					>{l}</text
				>
			{/each}
			{#if el.sub}
				{@const y = el.y + (enc.linhas.length - 1) * enc.tam * 1.06 + enc.tam * 0.72}
				{@const tamSub = caberLinha(el.sub, larg, 'corpo', enc.tam * 0.36, 600)}
				{@const lsub = Math.min(larg, medir(el.sub, 'corpo', tamSub, 600) + 40)}
				<line
					x1={anc === 'middle' ? el.x - (lsub / 2) * e : el.x}
					x2={anc === 'middle' ? el.x + (lsub / 2) * e : el.x + lsub * e}
					y1={y - tamSub}
					y2={y - tamSub}
					stroke={el.cor ?? '#fffaf0'}
					stroke-width="2"
					opacity="0.6"
				/>
				<text x={el.x} y={y + 8} text-anchor={anc} font-family={FONTE.corpo} font-weight="600" font-size={tamSub} letter-spacing="2" fill={el.cor ?? '#fffaf0'} opacity={0.9 * clamp01(pr.p * 2 - 0.5)}
					>{el.sub}</text
				>
			{/if}
		{:else if el.k === 'texto'}
			{@const fonte = el.fonte ?? 'corpo'}
			{@const peso = el.peso ?? (fonte === 'display' ? 800 : 600)}
			{@const enc = encaixar(el.texto, el.larg ?? 1200, el.alt ?? 400, fonte, el.tam ?? 34, peso, 1.28, 12)}
			{@const total = enc.linhas.reduce((s, l) => s + l.length, 0)}
			{@const mostrar = fx === 'type' ? Math.floor(total * clamp01(pr.p)) : total}
			{@const anc = el.alinhar ?? 'start'}
			{#if el.caixa}
				{@const larg = enc.largura + 48}
				<rect
					x={anc === 'middle' ? el.x - larg / 2 : anc === 'end' ? el.x - larg + 24 : el.x - 24}
					y={el.y - enc.tam * 1.05}
					width={larg}
					height={enc.linhas.length * enc.tam * 1.28 + enc.tam * 0.6}
					rx="12"
					fill={el.caixa}
				/>
			{/if}
			{#each enc.linhas as l, i (i)}
				{@const antes = enc.linhas.slice(0, i).reduce((s, x) => s + x.length, 0)}
				{@const parte = l.slice(0, Math.max(0, mostrar - antes))}
				{#if parte}
					<text
						x={el.x}
						y={el.y + i * enc.tam * 1.28}
						text-anchor={anc}
						font-family={FONTE[fonte]}
						font-weight={peso}
						font-style={el.italico ? 'italic' : 'normal'}
						font-size={enc.tam}
						fill={el.cor ?? '#fffaf0'}>{parte}</text
					>
				{/if}
			{/each}
		{:else if el.k === 'carimbo'}
			{@const tam = el.larg ? caberLinha(el.texto, el.larg - 50, 'mono', el.tam ?? 44, 700) : (el.tam ?? 44)}
			{@const larg = medir(el.texto, 'mono', tam, 700) + 50}
			{@const cor = el.cor ?? '#b3261e'}
			<g transform="translate({el.x} {el.y}) rotate({el.rot ?? -8}) scale({fx === 'pop' ? 1 + (1 - clamp01(pr.p * 2.2)) * 0.9 : 1})">
				<rect x={-larg / 2} y={-tam * 0.95} width={larg} height={tam * 1.6} rx="6" fill={claro(cor) ? 'rgba(18,14,10,0.86)' : 'rgba(255,250,240,0.9)'} stroke={cor} stroke-width="5" />
				<rect x={-larg / 2 + 8} y={-tam * 0.95 + 8} width={larg - 16} height={tam * 1.6 - 16} rx="4" fill="none" stroke={cor} stroke-width="2" />
				<text x="0" y={tam * 0.2} text-anchor="middle" font-family={FONTE.mono} font-weight="700" font-size={tam} fill={cor}>{el.texto}</text>
			</g>
		{:else if el.k === 'doc'}
			<g transform="translate({el.x} {el.y}) rotate({el.rot ?? 0})">
				<Doc titulo={el.titulo} linhas={el.linhas} barras={el.barras} destaque={el.destaque} w={el.w} h={el.h} p={pr.p} digitar={fx === 'type'} {vivo} semente={indice} tam={el.tam} />
			</g>
		{:else if el.k === 'mapa'}
			<Mapa estilo={el.estilo} paises={el.paises} rotulos={el.rotulos} pinta={el.pinta} cidades={el.cidades} {crono} {t} {vivo} />
		{:else if el.k === 'mundo'}
			<Mundo pinta={el.pinta} marcas={el.marcas} rotas={el.rotas} rotulos={el.rotulos} {crono} {t} {vivo} {cam} />
		{:else if el.k === 'seta'}
			{@const [x1, y1] = el.de}
			{@const [x2, y2] = el.para}
			{@const mx = (x1 + x2) / 2 - (y2 - y1) * (el.curva ?? 0)}
			{@const my = (y1 + y2) / 2 + (x2 - x1) * (el.curva ?? 0)}
			{@const ang = Math.atan2(y2 - my, x2 - mx)}
			{@const esp = el.espessura ?? 7}
			{@const k = fx === 'draw' ? suave.entradaSaida(pr.p) : 1}
			{@const cor = el.cor ?? '#b3261e'}
			<path d="M{x1},{y1} Q{mx},{my} {x2},{y2}" fill="none" stroke={cor} stroke-width={esp} stroke-linecap="round" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset={1 - k} />
			{#if k > 0.9}
				<path d="M0,0 L{-esp * 3.4},{-esp * 2} L{-esp * 3.4},{esp * 2} Z" fill={cor} transform="translate({x2} {y2}) rotate({(ang * 180) / Math.PI})" opacity={clamp01((k - 0.9) * 10)} />
			{/if}
			{#if el.texto}
				{@const tam = caberLinha(el.texto, 520, 'display', 26, 800)}
				{@const larg = medir(el.texto, 'display', tam, 800) + 28}
				<g opacity={clamp01(k * 2 - 1)}>
					<rect x={mx - larg / 2} y={my - 50} width={larg} height="44" rx="10" fill="rgba(10,12,20,0.8)" />
					<text x={mx} y={my - 19} text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size={tam} fill={cor}>{el.texto}</text>
				</g>
			{/if}
		{:else if el.k === 'cartao'}
			<g transform="translate({el.x} {el.y})">
				<Cartao w={el.w} h={el.h} titulo={el.titulo} texto={el.texto} cor={el.cor} icone={el.icone} escuro={el.escuro} />
			</g>
		{:else if el.k === 'citacao'}
			<g transform="translate({el.x} {el.y})">
				<Cartao w={el.w} h={el.h} titulo={el.texto} fonte={el.fonte} cor={el.cor ?? '#7c3aed'} citacao />
			</g>
		{:else if el.k === 'lista'}
			<g transform="translate({el.x} {el.y})">
				<Lista w={el.w} h={el.h} titulo={el.titulo} itens={el.itens} cor={el.cor} escuro={el.escuro} numerada={el.numerada} {crono} {t} />
			</g>
		{:else if el.k === 'numero'}
			<g transform="translate({el.x} {el.y})">
				<Diagrama tipo="numero" w={el.w} h={el.h} valor={el.valor} legenda={el.legenda} cor={el.cor} p={pr.p} {crono} {t} />
			</g>
		{:else if el.k === 'grafico'}
			<g transform="translate({el.x} {el.y})">
				<Diagrama tipo="grafico" w={el.w} h={el.h} titulo={el.titulo} itens={el.barras} cor={el.cor ?? '#2f3cd9'} p={pr.p} {crono} {t} />
			</g>
		{:else if el.k === 'piramide'}
			<g transform="translate({el.x} {el.y})">
				<Diagrama tipo="piramide" w={el.w} h={el.h} titulo={el.titulo} itens={el.niveis} p={pr.p} {crono} {t} />
			</g>
		{:else if el.k === 'causas'}
			<g transform="translate({el.x} {el.y})">
				<Diagrama tipo="causas" w={el.w} h={el.h} titulo={el.centro} itens={el.itens} sentido={el.sentido} cor={el.cor ?? '#b3261e'} p={pr.p} {crono} {t} />
			</g>
		{:else if el.k === 'uerj'}
			<g transform="translate({el.x} {el.y})">
				<Diagrama tipo="uerj" w={el.w} h={el.h} titulo={el.titulo} itens={el.partes} p={pr.p} {crono} {t} />
			</g>
		{:else if el.k === 'pessoa'}
			{@const esc = el.esc ?? 1}
			<g transform="translate({el.x + passo.dx} {el.y}) scale({el.vira ? -esc : esc} {esc})">
				<Pessoa v={el.v} t={vivo} fala={el.fala} {falando} gesto={el.gesto} placa={el.placa} andando={passo.andando} semente={indice * 1.7} vira={el.vira} />
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
			<g transform="translate({el.x} {el.y})">
				<Linha w={el.w} h={el.h ?? 220} itens={el.itens} cor={el.cor} vertical={el.vertical} p={pr.p} {crono} {t} />
			</g>
		{:else if el.k === 'tabela'}
			<g transform="translate({el.x} {el.y})">
				<Tabela w={el.w} h={el.h} colunas={el.colunas} linhas={el.linhas} {crono} {t} />
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
			<circle cx={el.x} cy={el.y} r={el.r} fill="url(#cin-brilho)" opacity={0.75 + 0.25 * Math.sin(vivo * 1.6 + indice)} />
		{/if}
	</g>
{/if}
