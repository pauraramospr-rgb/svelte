<svelte:options namespace="svg" />

<script lang="ts">
	import type { NomeProp } from '../tipos';
	import { FONTE } from '../util';
	import { caberLinha, encaixar } from '../medida.svelte';

	/** Objetos de cena desenhados em estilo chapado. Base em (0,0), cerca de 220 unidades de largura. */
	let { nome, cor, rotulo = '', anima = false, vivo, tl }: { nome: NomeProp; cor?: string; rotulo?: string; anima?: boolean; vivo: number; tl: number } = $props();

	const giro = $derived(anima ? (vivo * 40) % 360 : 0);
	const onda = $derived(anima ? Math.sin(vivo * 2) * 4 : 0);
	const fechar = $derived(Math.min(1, Math.max(0, (tl - 0.5) / 0.35)));
	const apagadas = $derived(anima ? Math.floor(Math.max(0, tl - 1) / 2.6) : 0);
	/** Rótulo encaixado no espaço que cada objeto tem para texto. */
	const enc = $derived.by(() => {
		switch (nome) {
			case 'jornal':
				return encaixar(rotulo, 270, 96, 'display', 32, 800, 1.1, 11);
			case 'livro':
				return encaixar(rotulo, 128, 130, 'serifa', 24, 700, 1.15, 9);
			case 'maquina':
				return encaixar(rotulo, 166, 110, 'maquina', 22, 700, 1.2, 9);
			case 'tv':
				return encaixar(rotulo, 186, 136, 'display', 26, 800, 1.15, 9);
			case 'celular':
				return encaixar(rotulo, 104, 190, 'corpo', 18, 700, 1.2, 8);
			case 'cartaz':
				return encaixar(rotulo, 250, 130, 'display', 38, 800, 1.1, 11);
			case 'bandeira':
				return encaixar(rotulo, 170, 96, 'display', 30, 800, 1.1, 9);
			case 'pergaminho':
				return encaixar(rotulo, 196, 150, 'serifa', 26, 700, 1.2, 9);
			default:
				return encaixar(rotulo, 200, 70, 'display', 30, 800, 1.1, 9);
		}
	});
	const rot = $derived(enc.linhas);
</script>

<g class="prop">
	<ellipse cx="0" cy="2" rx="120" ry="12" fill="rgba(0,0,0,0.22)" />
	{#if nome === 'radio'}
		<rect x="-120" y="-170" width="240" height="160" rx="24" fill={cor ?? '#6b4226'} />
		<rect x="-120" y="-170" width="240" height="160" rx="24" fill="none" stroke="#3e2614" stroke-width="5" />
		<circle cx="-50" cy="-90" r="50" fill="#d9c7a0" />
		{#each { length: 6 } as _, i (i)}<line x1="-92" x2="-8" y1={-120 + i * 12} y2={-120 + i * 12} stroke="#a58e64" stroke-width="3" />{/each}
		<rect x="18" y="-140" width="84" height="40" rx="6" fill="#f2e2b0" />
		<line x1={30 + ((vivo * 9) % 60)} x2={30 + ((vivo * 9) % 60)} y1="-136" y2="-104" stroke="#b3261e" stroke-width="3" />
		<circle cx="38" cy="-58" r="14" fill="#2b1a0e" />
		<circle cx="84" cy="-58" r="14" fill="#2b1a0e" />
		{#if anima}
			{#each { length: 4 } as _, i (i)}
				{@const r = 60 + ((vivo * 70 + i * 55) % 220)}
				<path d="M{120 + r * 0.2},{-150 - r * 0.6} A{r},{r} 0 0 1 {120 + r * 0.2},{-30 + r * 0.6 - 120}" fill="none" stroke="#ffd84d" stroke-width="5" opacity={Math.max(0, 1 - r / 280)} />
			{/each}
		{/if}
	{:else if nome === 'tanque'}
		<rect x="-130" y="-60" width="260" height="56" rx="28" fill="#2e3324" />
		{#each { length: 6 } as _, i (i)}<circle cx={-100 + i * 40} cy="-32" r="17" fill="#5b6248" stroke="#2e3324" stroke-width="4" />{/each}
		<path d="M-120,-60 L-100,-112 L110,-112 L128,-60 Z" fill={cor ?? '#5b6b3a'} />
		<path d="M-50,-112 Q-46,-160 10,-162 Q62,-160 66,-112 Z" fill="#4c5a30" />
		<rect x="60" y="-148" width="150" height="14" rx="5" fill="#3f4a28" />
		<circle cx="0" cy="-138" r="9" fill="#d4a017" opacity="0.8" />
	{:else if nome === 'navio'}
		<g transform="translate(0 {onda})">
			<path d="M-200,-60 L200,-60 L160,0 L-170,0 Z" fill={cor ?? '#5d6d7e'} />
			<rect x="-90" y="-110" width="150" height="50" fill="#7f8c99" />
			<rect x="-50" y="-150" width="70" height="40" fill="#95a2ae" />
			<line x1="-15" y1="-150" x2="-15" y2="-215" stroke="#3b4652" stroke-width="6" />
			<line x1="-45" y1="-195" x2="15" y2="-195" stroke="#3b4652" stroke-width="4" />
			<rect x="90" y="-80" width="50" height="20" rx="4" fill="#4b5966" />
			<line x1="140" y1="-74" x2="195" y2="-88" stroke="#4b5966" stroke-width="7" />
			{#each { length: 5 } as _, i (i)}<circle cx={-160 + i * 30} cy="-34" r="5" fill="#dfe6ec" />{/each}
		</g>
		<path d="M-240,6 Q-200,-6 -160,6 T-80,6 T0,6 T80,6 T160,6 T240,6" fill="none" stroke="#9cc3df" stroke-width="5" transform="translate({anima ? (vivo * 30) % 80 - 40 : 0} 0)" />
	{:else if nome === 'caminhao'}
		<rect x="-150" y="-140" width="190" height="110" rx="10" fill={cor ?? '#5b6b3a'} />
		<path d="M-150,-140 Q-55,-180 40,-140" fill="#6c7c48" />
		<path d="M44,-110 L110,-110 L140,-70 L140,-30 L44,-30 Z" fill="#4c5a30" />
		<rect x="70" y="-102" width="36" height="28" rx="4" fill="#cfe3ff" />
		<circle cx="-100" cy="-22" r="24" fill="#222" /><circle cx="-100" cy="-22" r="9" fill="#888" />
		<circle cx="90" cy="-22" r="24" fill="#222" /><circle cx="90" cy="-22" r="9" fill="#888" />
	{:else if nome === 'congresso'}
		<rect x="-260" y="-40" width="520" height="40" fill="#e9e4d8" />
		<rect x="-260" y="-48" width="520" height="10" fill="#cfc8b6" />
		<path d="M-210,-48 Q-150,-118 -90,-48 Z" fill="#f4f1e8" stroke="#bdb5a1" stroke-width="3" />
		<rect x="140" y="-62" width="20" height="14" fill="#cfc8b6" />
		<path d="M70,-96 Q150,-10 230,-96 Z" fill="#f4f1e8" stroke="#bdb5a1" stroke-width="3" />
		{#each [-30, 18] as tx, j (j)}
			<rect x={tx} y="-300" width="38" height="252" fill="#dcd6c6" stroke="#b7ae98" stroke-width="2" />
			{#each { length: 11 } as _, i (i)}
				{@const idx = j * 11 + i}
				<rect x={tx + 6} y={-290 + i * 22} width="26" height="12" fill={idx < 22 - apagadas ? '#ffd86b' : '#3a3f4a'} opacity="0.9" />
			{/each}
		{/each}
		<rect x="-30" y="-232" width="86" height="12" fill="#cfc8b6" />
	{:else if nome === 'palacio'}
		<rect x="-250" y="-30" width="500" height="30" fill="#e3ddd0" />
		<rect x="-230" y="-140" width="460" height="110" fill="#f4f1e8" />
		<rect x="-240" y="-152" width="480" height="14" fill="#d8d1c0" />
		{#each { length: 9 } as _, i (i)}<path d="M{-210 + i * 52},-30 Q{-200 + i * 52},-85 {-210 + i * 52},-138" fill="none" stroke="#c9c1ae" stroke-width="8" />{/each}
		<rect x="-30" y="-110" width="60" height="80" fill="#9c8f74" />
	{:else if nome === 'calendario'}
		<rect x="-110" y="-230" width="220" height="230" rx="14" fill="#fffaf0" stroke="#3a2a1a" stroke-width="4" />
		<rect x="-110" y="-230" width="220" height="62" rx="14" fill={cor ?? '#b3261e'} />
		<rect x="-110" y="-186" width="220" height="18" fill={cor ?? '#b3261e'} />
		<circle cx="-50" cy="-236" r="10" fill="#3a2a1a" /><circle cx="50" cy="-236" r="10" fill="#3a2a1a" />
		{@const [dia, ano] = rotulo.split('|')}
		<text x="0" y="-186" text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size="30" fill="#fff">{ano ?? ''}</text>
		<text x="0" y="-60" text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size={Math.min(62, 190 / (dia.length * 0.6))} fill="#1a1410">{dia}</text>
	{:else if nome === 'jornal'}
		<rect x="-150" y="-240" width="300" height="240" fill="#f4f0e4" stroke="#8a826e" stroke-width="2" />
		<text x="0" y="-206" text-anchor="middle" font-family={FONTE.serifa} font-weight="700" font-size="26" fill="#1a1410" letter-spacing="2">O DIÁRIO</text>
		<line x1="-136" x2="136" y1="-194" y2="-194" stroke="#1a1410" stroke-width="2" />
		{#each rot as l, i (i)}
			<text x="0" y={-160 + enc.tam * 0.9 + i * enc.tam * 1.1} text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size={enc.tam} fill="#1a1410">{l}</text>
		{/each}
		{#each { length: 7 } as _, i (i)}
			<rect x="-136" y={-104 + i * 14 + rot.length * 8} width="128" height="6" fill="#b6ae99" />
			<rect x="8" y={-104 + i * 14 + rot.length * 8} width="128" height="6" fill="#b6ae99" />
		{/each}
	{:else if nome === 'cadeado'}
		<path d="M-44,{-128 + (1 - fechar) * -40} L-44,{-178 + (1 - fechar) * -40} A44,44 0 0 1 44,{-178 + (1 - fechar) * -40} L44,{-128 + (1 - fechar) * -40}" fill="none" stroke="#8b8f96" stroke-width="18" />
		<rect x="-72" y="-140" width="144" height="128" rx="16" fill={cor ?? '#d4a017'} />
		<circle cx="0" cy="-86" r="15" fill="#3a2a10" />
		<rect x="-6" y="-80" width="12" height="34" rx="4" fill="#3a2a10" />
	{:else if nome === 'balanca'}
		<rect x="-8" y="-210" width="16" height="200" fill="#8a6a45" />
		<rect x="-60" y="-20" width="120" height="16" rx="6" fill="#8a6a45" />
		<line x1="-110" y1="-200" x2="110" y2="-200" stroke="#8a6a45" stroke-width="10" />
		<path d="M-150,-120 Q-110,-90 -70,-120 Z M70,-120 Q110,-90 150,-120 Z" fill="#c9a227" />
		<line x1="-110" y1="-200" x2="-150" y2="-120" stroke="#8a6a45" stroke-width="3" /><line x1="-110" y1="-200" x2="-70" y2="-120" stroke="#8a6a45" stroke-width="3" />
		<line x1="110" y1="-200" x2="150" y2="-120" stroke="#8a6a45" stroke-width="3" /><line x1="110" y1="-200" x2="70" y2="-120" stroke="#8a6a45" stroke-width="3" />
	{:else if nome === 'urna'}
		<rect x="-110" y="-170" width="220" height="170" rx="10" fill={cor ?? '#e9e4d8'} stroke="#3a2a1a" stroke-width="4" />
		<rect x="-60" y="-178" width="120" height="16" rx="5" fill="#3a2a1a" />
		<text x="0" y="-74" text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size={caberLinha(rotulo || 'VOTO', 190, 'display', 36, 800)} fill="#1a1410">{rotulo || 'VOTO'}</text>
		<g transform="translate(0 {-200 - Math.max(0, 1 - tl / 1.2) * -60})" opacity={tl < 1.2 ? 1 : 0}>
			<rect x="-36" y="-60" width="72" height="60" fill="#fffaf0" stroke="#3a2a1a" stroke-width="3" />
		</g>
	{:else if nome === 'fabrica'}
		<path d="M-200,0 L-200,-120 L-130,-170 L-130,-120 L-60,-170 L-60,-120 L10,-170 L10,-120 L200,-120 L200,0 Z" fill={cor ?? '#7a4a3a'} />
		<rect x="120" y="-260" width="34" height="140" fill="#5c372b" />
		<rect x="60" y="-230" width="30" height="110" fill="#5c372b" />
		{#each { length: 4 } as _, i (i)}<rect x={-180 + i * 90} y="-90" width="50" height="40" fill="#ffd86b" opacity="0.75" />{/each}
		{#each { length: 5 } as _, i (i)}
			{@const s = (vivo * 0.5 + i * 0.2) % 1}
			<circle cx={137 + s * 60} cy={-270 - s * 120} r={14 + s * 30} fill="#c9c9c9" opacity={0.6 * (1 - s)} />
		{/each}
	{:else if nome === 'igreja'}
		<rect x="-120" y="-180" width="240" height="180" fill={cor ?? '#efe7d6'} stroke="#b5a98c" stroke-width="3" />
		<path d="M-140,-180 L0,-260 L140,-180 Z" fill="#c8b48a" />
		<rect x="-40" y="-330" width="80" height="80" fill="#efe7d6" stroke="#b5a98c" stroke-width="3" />
		<line x1="0" y1="-330" x2="0" y2="-386" stroke="#6b5a3a" stroke-width="7" /><line x1="-18" y1="-366" x2="18" y2="-366" stroke="#6b5a3a" stroke-width="7" />
		<path d="M-34,0 L-34,-80 Q0,-120 34,-80 L34,0 Z" fill="#6b4a2c" />
		<circle cx="0" cy="-290" r="20" fill="#d9c08a" />
	{:else if nome === 'livro'}
		<path d="M-150,-40 L0,-20 L150,-40 L150,-200 L0,-180 L-150,-200 Z" fill="#fffaf0" stroke="#3a2a1a" stroke-width="3" />
		<line x1="0" y1="-180" x2="0" y2="-20" stroke="#3a2a1a" stroke-width="3" />
		<path d="M-150,-40 L0,-20 L150,-40 L150,-28 L0,-8 L-150,-28 Z" fill={cor ?? '#8a3b2a'} />
		{#each rot as l, i (i)}
			<text x="-75" y={-172 + enc.tam * (1 + i * 1.15)} text-anchor="middle" font-family={FONTE.serifa} font-weight="700" font-size={enc.tam} fill="#1a1410">{l}</text>
		{/each}
		{#each { length: 6 } as _, i (i)}<rect x="22" y={-160 + i * 20} width="110" height="6" fill="#c8bea6" />{/each}
	{:else if nome === 'maquina'}
		<path d="M-150,0 L-130,-90 L130,-90 L150,0 Z" fill={cor ?? '#2f3a2f'} />
		<rect x="-110" y="-120" width="220" height="34" rx="12" fill="#1f271f" />
		<rect x="-90" y="-240" width="180" height="130" fill="#fffaf0" stroke="#b8ad94" stroke-width="2" />
		{#each rot as l, i (i)}
			<text x="0" y={-226 + enc.tam * (1 + i * 1.2)} text-anchor="middle" font-family={FONTE.maquina} font-weight="700" font-size={enc.tam} fill="#1a1410">{l}</text>
		{/each}
		{#each { length: 3 } as _, r (r)}
			{#each { length: 9 } as _, i (i)}<circle cx={-104 + i * 26 + r * 6} cy={-66 + r * 20} r="8" fill="#e9e4d8" />{/each}
		{/each}
	{:else if nome === 'cratera'}
		{#each { length: 6 } as _, i (i)}
			<ellipse cx="0" cy={-90 + i * 12} rx={260 - i * 40} ry={110 - i * 18} fill={i % 2 ? '#8a5a35' : '#9c6a40'} />
		{/each}
		{#each { length: 40 } as _, i (i)}
			{@const ang = i * 0.61}
			{@const rr = 0.35 + (i % 5) * 0.12}
			<circle cx={Math.cos(ang + (anima ? vivo * 0.05 : 0)) * 210 * rr} cy={-90 + Math.sin(ang) * 80 * rr} r="3.4" fill="#2a1a10" />
		{/each}
	{:else if nome === 'estrada'}
		<path d="M-60,-260 L60,-260 L260,0 L-260,0 Z" fill="#8a6a45" />
		<path d="M-30,-260 L30,-260 L170,0 L-170,0 Z" fill="#a67c52" />
		{#each { length: 6 } as _, i (i)}
			{@const s = ((i / 6 + (anima ? vivo * 0.25 : 0)) % 1)}
			<rect x={-4 - s * 6} y={-260 + s * s * 260} width={8 + s * 12} height={10 + s * 26} fill="#f2e2b0" />
		{/each}
	{:else if nome === 'arvore'}
		<rect x="-12" y="-150" width="24" height="150" fill="#5a3d24" />
		<circle cx="0" cy="-190" r="80" fill={cor ?? '#2f6f4f'} />
		<circle cx="-50" cy="-150" r="50" fill="#2a6045" />
		<circle cx="50" cy="-160" r="54" fill="#357a57" />
	{:else if nome === 'estadio'}
		<ellipse cx="0" cy="-60" rx="250" ry="70" fill="#d9d2c0" />
		<ellipse cx="0" cy="-70" rx="210" ry="48" fill="#3f8a4a" />
		<ellipse cx="0" cy="-70" rx="60" ry="14" fill="none" stroke="#fff" stroke-width="3" />
		<path d="M-250,-60 L-250,-10 Q0,40 250,-10 L250,-60 Q0,10 -250,-60 Z" fill="#b9b19c" />
		{#each [-220, 220] as x (x)}<line x1={x} y1="-60" x2={x} y2="-220" stroke="#666" stroke-width="7" /><rect x={x - 26} y="-240" width="52" height="24" fill="#fff6c8" />{/each}
	{:else if nome === 'microfone'}
		<rect x="-6" y="-170" width="12" height="160" fill="#555" />
		<ellipse cx="0" cy="-10" rx="60" ry="12" fill="#444" />
		<rect x="-36" y="-260" width="72" height="100" rx="30" fill={cor ?? '#9aa0a6'} stroke="#555" stroke-width="5" />
		{#each { length: 5 } as _, i (i)}<line x1="-30" x2="30" y1={-240 + i * 16} y2={-240 + i * 16} stroke="#666" stroke-width="3" />{/each}
	{:else if nome === 'carro'}
		<path d="M-170,-40 L-150,-90 L-80,-100 L-40,-150 L80,-150 L120,-100 L170,-90 L180,-40 Z" fill={cor ?? '#a83232'} />
		<path d="M-30,-140 L70,-140 L100,-102 L-56,-102 Z" fill="#cfe3ff" />
		<circle cx="-100" cy="-36" r="30" fill="#222" /><circle cx="-100" cy="-36" r="12" fill="#999" />
		<circle cx="110" cy="-36" r="30" fill="#222" /><circle cx="110" cy="-36" r="12" fill="#999" />
	{:else if nome === 'aviao'}
		<g transform="translate(0 {onda - 120})">
			<path d="M-200,0 Q-180,-30 -100,-30 L160,-30 Q210,-20 210,0 Q210,20 160,22 L-100,22 Q-180,22 -200,0 Z" fill={cor ?? '#dfe6ec'} />
			<path d="M-20,-10 L-90,-110 L-50,-110 L60,-10 Z" fill="#b5c2cc" />
			<path d="M-160,-24 L-200,-90 L-170,-90 L-120,-24 Z" fill="#b5c2cc" />
			{#each { length: 8 } as _, i (i)}<circle cx={-60 + i * 26} cy="-8" r="6" fill="#5d6d7e" />{/each}
		</g>
	{:else if nome === 'engrenagem'}
		<g transform="translate(0 -120) rotate({giro})">
			{#each { length: 10 } as _, i (i)}<rect x="-16" y="-118" width="32" height="40" rx="5" fill={cor ?? '#8a8f98'} transform="rotate({i * 36})" />{/each}
			<circle r="88" fill={cor ?? '#8a8f98'} />
			<circle r="34" fill="#2b2f36" />
		</g>
	{:else if nome === 'lupa'}
		<g transform="rotate(-20) translate(0 -150)">
			<circle r="80" fill="rgba(200,230,255,0.25)" stroke={cor ?? '#3a2a1a'} stroke-width="16" />
			<rect x="-12" y="86" width="24" height="120" rx="10" fill="#6b4226" />
		</g>
	{:else if nome === 'pilha'}
		{#each { length: 9 } as _, i (i)}
			<rect x={-130 + (i % 2) * 8} y={-24 - i * 22} width="260" height="20" fill={i % 2 ? '#fffaf0' : '#efe6d2'} stroke="#b8ad94" stroke-width="2" transform="rotate({(i % 3) - 1} 0 {-14 - i * 22})" />
		{/each}
	{:else if nome === 'barril'}
		<rect x="-80" y="-200" width="160" height="200" rx="18" fill={cor ?? '#1f2f5c'} />
		<rect x="-80" y="-150" width="160" height="10" fill="#14203f" /><rect x="-80" y="-60" width="160" height="10" fill="#14203f" />
		<text x="0" y="-96" text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size={caberLinha(rotulo || 'PETRÓLEO', 140, 'display', 26, 800)} fill="#ffd84d">{rotulo || 'PETRÓLEO'}</text>
	{:else if nome === 'bolo'}
		<rect x="-150" y="-80" width="300" height="80" rx="10" fill="#c98b5b" />
		<rect x="-110" y="-150" width="220" height="70" rx="10" fill="#d9a06b" />
		<path d="M-150,-80 Q-120,-60 -90,-80 T-30,-80 T30,-80 T90,-80 T150,-80" fill="#fff3e0" stroke="#fff3e0" stroke-width="6" />
		<rect x="-14" y="-200" width="10" height="50" fill="#e0533d" />
		<path d="M-9,-214 Q0,-200 -9,-200 Q-18,-200 -9,-214 Z" fill="#ffd84d" opacity={0.7 + 0.3 * Math.sin(vivo * 9)} />
	{:else if nome === 'trem'}
		<rect x="-220" y="-130" width="170" height="100" rx="8" fill={cor ?? '#2f5d8c'} />
		<rect x="-40" y="-110" width="260" height="80" rx="8" fill="#8a3b2a" />
		{#each { length: 4 } as _, i (i)}<rect x={-20 + i * 60} y="-98" width="40" height="30" fill="#ffd86b" opacity="0.8" />{/each}
		{#each [-190, -90, 0, 160] as x (x)}<circle cx={x} cy="-22" r="18" fill="#222" />{/each}
		<rect x="-200" y="-170" width="30" height="40" fill="#1f3d5c" />
	{:else if nome === 'tv'}
		<rect x="-150" y="-230" width="300" height="210" rx="22" fill={cor ?? '#6b4226'} />
		<rect x="-128" y="-210" width="210" height="160" rx="18" fill="#203030" />
		<rect x="-128" y="-210" width="210" height="160" rx="18" fill="url(#cin-tela)" opacity="0.6" />
		{#each rot as l, i (i)}
			<text x="-23" y={-130 - (rot.length * enc.tam * 1.15) / 2 + enc.tam * (0.9 + i * 1.15)} text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size={enc.tam} fill="#e9fff4">{l}</text>
		{/each}
		<circle cx="116" cy="-170" r="12" fill="#2b1a0e" /><circle cx="116" cy="-130" r="12" fill="#2b1a0e" />
		<line x1="-70" y1="-20" x2="-100" y2="0" stroke="#2b1a0e" stroke-width="8" /><line x1="70" y1="-20" x2="100" y2="0" stroke="#2b1a0e" stroke-width="8" />
		<line x1="-30" y1="-230" x2="-80" y2="-300" stroke="#555" stroke-width="5" /><line x1="30" y1="-230" x2="80" y2="-300" stroke="#555" stroke-width="5" />
	{:else if nome === 'celular'}
		<rect x="-70" y="-260" width="140" height="260" rx="20" fill="#1c1f26" />
		<rect x="-60" y="-240" width="120" height="216" rx="10" fill={cor ?? '#eef0ff'} />
		{#each rot as l, i (i)}
			<text x="0" y={-214 + enc.tam * (1 + i * 1.2)} text-anchor="middle" font-family={FONTE.corpo} font-weight="700" font-size={enc.tam} fill="#1a1410">{l}</text>
		{/each}
	{:else if nome === 'caravela'}
		<g transform="translate(0 {onda})">
			<path d="M-170,-70 Q-150,-10 -20,-8 L120,-8 Q170,-30 190,-80 L130,-72 L-120,-72 Z" fill={cor ?? '#7a4a2a'} />
			<path d="M-170,-70 L-120,-72 L-110,-96 L-176,-100 Z" fill="#6b3f22" />
			<rect x="-128" y="-82" width="250" height="10" fill="#5a3a1f" />
			<line x1="-60" y1="-80" x2="-60" y2="-300" stroke="#4a2f1a" stroke-width="8" />
			<line x1="50" y1="-80" x2="50" y2="-260" stroke="#4a2f1a" stroke-width="7" />
			<path d="M-60,-290 Q-10,-240 -60,-150 Q-120,-220 -60,-290 Z" fill="#f4ecd8" stroke="#c9b991" stroke-width="2" transform="translate({Math.sin(vivo * 1.4) * 2} 0)" />
			<path d="M-60,-270 L-60,-170 M-90,-220 L-30,-220" stroke="#b3261e" stroke-width="10" />
			<path d="M50,-250 L120,-110 L50,-110 Z" fill="#f4ecd8" stroke="#c9b991" stroke-width="2" />
			<path d="M-60,-300 L-30,-292 L-60,-284 Z" fill="#b3261e" />
		</g>
		<path d="M-240,4 Q-200,-8 -160,4 T-80,4 T0,4 T80,4 T160,4 T240,4" fill="none" stroke="#9cc3df" stroke-width="5" transform="translate({anima ? (vivo * 30) % 80 - 40 : 0} 0)" />
	{:else if nome === 'coroa'}
		<g transform="translate(0 -40)">
			<path d="M-110,0 L-120,-110 L-60,-60 L0,-140 L60,-60 L120,-110 L110,0 Z" fill={cor ?? '#d4a017'} stroke="#8a6a10" stroke-width="5" />
			<rect x="-112" y="-10" width="224" height="30" rx="6" fill="#b8860b" />
			<circle cx="0" cy="-150" r="12" fill="#b3261e" /><circle cx="-120" cy="-118" r="10" fill="#2f5d8c" /><circle cx="120" cy="-118" r="10" fill="#2f5d8c" />
			<circle cx="-50" cy="5" r="8" fill="#b3261e" /><circle cx="0" cy="5" r="8" fill="#2f6f4f" /><circle cx="50" cy="5" r="8" fill="#b3261e" />
		</g>
	{:else if nome === 'trono'}
		<path d="M-80,0 L-80,-120 L80,-120 L80,0 Z" fill="#7a1f2b" />
		<path d="M-70,-120 L-70,-300 Q0,-340 70,-300 L70,-120 Z" fill={cor ?? '#9b2335'} stroke="#d4a017" stroke-width="8" />
		<rect x="-100" y="-140" width="40" height="140" rx="8" fill="#d4a017" /><rect x="60" y="-140" width="40" height="140" rx="8" fill="#d4a017" />
		<circle cx="0" cy="-300" r="16" fill="#d4a017" />
	{:else if nome === 'canhao'}
		<rect x="-40" y="-130" width="200" height="54" rx="26" fill={cor ?? '#3a3f47'} transform="rotate(-14 -40 -103)" />
		<circle cx="-40" cy="-40" r="40" fill="#5a3a1f" stroke="#2a1a10" stroke-width="8" /><circle cx="-40" cy="-40" r="8" fill="#2a1a10" />
		<path d="M-120,-20 L40,-70 L40,-40 L-110,0 Z" fill="#6b4226" />
		{#each { length: 3 } as _, i (i)}<circle cx={-150 - i * 30} cy={-14 - (i % 2) * 22} r="14" fill="#2a2a2a" />{/each}
	{:else if nome === 'bandeira'}
		<line x1="-90" y1="0" x2="-90" y2="-300" stroke="#5a3a1f" stroke-width="8" />
		<path d="M-90,-296 Q{-20 + Math.sin(vivo * 3) * 8},-320 {90},-292 L90,-176 Q{-20 + Math.sin(vivo * 3 + 1) * 8},-200 -90,-176 Z" fill={cor ?? '#b3261e'} />
		{#each rot as l, i (i)}
			<text x="0" y={-236 - (rot.length * enc.tam * 1.1) / 2 + enc.tam * (0.9 + i * 1.1)} text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size={enc.tam} fill="#fffaf0">{l}</text>
		{/each}
	{:else if nome === 'guilhotina'}
		<rect x="-90" y="-20" width="180" height="20" fill="#5a3a1f" />
		<rect x="-70" y="-330" width="20" height="310" fill="#6b4226" /><rect x="50" y="-330" width="20" height="310" fill="#6b4226" />
		<rect x="-80" y="-345" width="160" height="22" fill="#5a3a1f" />
		<path d="M-50,-300 L50,-280 L50,-240 L-50,-240 Z" fill="#b8c2cc" stroke="#6b7680" stroke-width="3" />
		<rect x="-50" y="-110" width="100" height="30" rx="6" fill="#5a3a1f" />
	{:else if nome === 'fortaleza'}
		<rect x="-200" y="-200" width="400" height="200" fill={cor ?? '#8a8478'} />
		{#each [-200, -80, 40] as x (x)}<rect x={x} y="-280" width="160" height="80" fill="#7a7468" />{#each { length: 4 } as _, i (i)}<rect x={x + 8 + i * 40} y="-300" width="24" height="24" fill="#7a7468" />{/each}{/each}
		<path d="M-40,0 L-40,-90 Q0,-130 40,-90 L40,0 Z" fill="#3a2a1a" />
		{#each { length: 3 } as _, i (i)}<rect x={-170 + i * 140} y="-160" width="22" height="40" fill="#2a2420" />{/each}
	{:else if nome === 'vapor'}
		<rect x="-160" y="-150" width="200" height="130" rx="10" fill={cor ?? '#3a3f47'} />
		<rect x="-130" y="-260" width="44" height="110" fill="#2a2e34" />
		<circle cx="110" cy="-80" r="70" fill="none" stroke="#5a5f66" stroke-width="16" />
		<circle cx="110" cy="-80" r="12" fill="#5a5f66" />
		<line x1="110" y1="-80" x2={110 + Math.cos(vivo * 3) * 62} y2={-80 + Math.sin(vivo * 3) * 62} stroke="#5a5f66" stroke-width="10" />
		<line x1="40" y1="-90" x2={110 + Math.cos(vivo * 3) * 40} y2={-80 + Math.sin(vivo * 3) * 40} stroke="#8a8f98" stroke-width="10" />
		<rect x="-160" y="-20" width="330" height="20" fill="#2a2e34" />
		{#each { length: 5 } as _, i (i)}
			{@const s = (vivo * 0.6 + i * 0.2) % 1}
			<circle cx={-108 + s * 40} cy={-270 - s * 130} r={14 + s * 34} fill="#d0d0d0" opacity={0.6 * (1 - s)} />
		{/each}
	{:else if nome === 'engenho'}
		<rect x="-200" y="-140" width="400" height="140" fill={cor ?? '#9c6a40'} />
		<path d="M-220,-140 L0,-230 L220,-140 Z" fill="#7a4a2a" />
		<circle cx="-90" cy="-60" r="56" fill="#5a3a1f" stroke="#3a2412" stroke-width="8" />
		<g transform="translate(-90 -60) rotate({(vivo * 30) % 360})">{#each { length: 6 } as _, i (i)}<line x1="0" y1="0" x2="50" y2="0" stroke="#3a2412" stroke-width="7" transform="rotate({i * 60})" />{/each}</g>
		<rect x="40" y="-110" width="120" height="60" fill="#e9d7a8" />
		<rect x="140" y="-300" width="30" height="160" fill="#7a4a2a" />
		{#each { length: 4 } as _, i (i)}
			{@const s = (vivo * 0.5 + i * 0.25) % 1}
			<circle cx={155 + s * 30} cy={-310 - s * 110} r={12 + s * 26} fill="#cfcfcf" opacity={0.55 * (1 - s)} />
		{/each}
	{:else if nome === 'cana'}
		{#each { length: 9 } as _, i (i)}
			{@const x = -160 + i * 40}
			{@const bal = Math.sin(vivo * 1.5 + i) * 4}
			<path d="M{x},0 L{x + bal},-260" stroke="#6b8e23" stroke-width="10" />
			{#each { length: 5 } as _, j (j)}<line x1={x + bal * (j / 5)} y1={-40 - j * 46} x2={x + bal * (j / 5) + 3} y2={-44 - j * 46} stroke="#4a6a12" stroke-width="12" />{/each}
			<path d="M{x + bal},-250 Q{x + 40},-290 {x + 60},-250 M{x + bal},-230 Q{x - 40},-280 {x - 54},-226" fill="none" stroke="#7fb03a" stroke-width="6" />
		{/each}
	{:else if nome === 'cafe'}
		{#each [-110, 0, 110] as x, i (x)}
			<rect x={x - 6} y="-120" width="12" height="120" fill="#5a3a1f" />
			<ellipse cx={x} cy="-150" rx="58" ry="70" fill={cor ?? '#2f6f3f'} />
			{#each { length: 7 } as _, j (j)}<circle cx={x - 30 + ((j * 23 + i * 7) % 60)} cy={-190 + ((j * 31) % 90)} r="7" fill="#b3261e" />{/each}
		{/each}
		<path d="M-200,0 L-170,-60 L-110,-60 L-90,0 Z" fill="#c9b07a" />
		<text x="-145" y="-22" text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size="18" fill="#5a3a1f">CAFÉ</text>
	{:else if nome === 'ouro'}
		{#each [[-80, 0], [40, 0], [-20, -50]] as [x, y], i (i)}
			<path d="M{x - 60},{y} L{x - 44},{y - 44} L{x + 44},{y - 44} L{x + 60},{y} Z" fill={cor ?? '#d4a017'} stroke="#8a6a10" stroke-width="4" />
			<path d="M{x - 40},{y - 40} L{x + 30},{y - 40}" stroke="#fff3c4" stroke-width="5" opacity={0.5 + 0.5 * Math.sin(vivo * 3 + i)} />
		{/each}
	{:else if nome === 'moedas'}
		{#each { length: 7 } as _, i (i)}
			<ellipse cx={-60 + (i % 3) * 60} cy={-14 - Math.floor(i / 3) * 22} rx="46" ry="14" fill={cor ?? '#d4a017'} stroke="#8a6a10" stroke-width="3" />
		{/each}
		<circle cx="100" cy="-110" r="56" fill="#e0b52a" stroke="#8a6a10" stroke-width="5" />
		<text x="100" y="-96" text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size="44" fill="#8a6a10">$</text>
	{:else if nome === 'pergaminho'}
		<rect x="-130" y="-260" width="260" height="230" fill="#f1e2bd" />
		<ellipse cx="-130" cy="-145" rx="18" ry="118" fill="#d8c08c" /><ellipse cx="130" cy="-145" rx="18" ry="118" fill="#d8c08c" />
		{#each rot as l, i (i)}
			<text x="0" y={-150 - (rot.length * enc.tam * 1.2) / 2 + enc.tam * (0.9 + i * 1.2)} text-anchor="middle" font-family={FONTE.serifa} font-weight="700" font-size={enc.tam} fill="#3a2a10">{l}</text>
		{/each}
	{:else if nome === 'bussola'}
		<circle cx="0" cy="-120" r="110" fill="#b8860b" />
		<circle cx="0" cy="-120" r="92" fill="#f4ecd8" />
		<g transform="translate(0 -120) rotate({Math.sin(vivo * 0.8) * 14})">
			<path d="M0,-80 L16,0 L0,80 L-16,0 Z" fill="#b3261e" />
			<path d="M0,0 L16,0 L0,80 L-16,0 Z" fill="#2a2a2a" />
		</g>
		<text x="0" y="-180" text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size="24" fill="#1a1410">N</text>
	{:else if nome === 'especiarias'}
		{#each [[-120, '#b5482f'], [0, '#d4a017'], [120, '#6b4226']] as [x, c], i (i)}
			<path d="M{Number(x) - 60},0 L{Number(x) - 70},-110 Q{x},-150 {Number(x) + 70},-110 L{Number(x) + 60},0 Z" fill="#c9b07a" stroke="#8a6a3a" stroke-width="3" />
			<ellipse cx={x} cy="-112" rx="62" ry="20" fill={String(c)} />
			{#each { length: 6 } as _, j (j)}<circle cx={Number(x) - 36 + j * 14} cy={-120 + (j % 2) * 8} r="6" fill={String(c)} stroke="rgba(0,0,0,0.2)" />{/each}
		{/each}
	{:else if nome === 'mesquita'}
		<rect x="-170" y="-150" width="340" height="150" fill={cor ?? '#e9e2cf'} />
		<path d="M-110,-150 Q0,-330 110,-150 Z" fill="#2f6f8a" />
		<rect x="-210" y="-330" width="34" height="330" fill="#e9e2cf" /><path d="M-216,-330 L-193,-380 L-170,-330 Z" fill="#2f6f8a" />
		<rect x="176" y="-330" width="34" height="330" fill="#e9e2cf" /><path d="M170,-330 L193,-380 L216,-330 Z" fill="#2f6f8a" />
		<path d="M-40,0 L-40,-80 Q0,-120 40,-80 L40,0 Z" fill="#6b4a2c" />
	{:else if nome === 'muro'}
		{#each { length: 5 } as _, i (i)}
			<rect x={-250 + i * 100} y="-260" width="96" height="260" fill={cor ?? '#9aa0a6'} stroke="#6b7076" stroke-width="3" />
		{/each}
		<path d="M-250,-260 Q0,-290 250,-260" fill="none" stroke="#555" stroke-width="10" />
		{#each rot as l, i (i)}
			<text x="0" y={-140 + i * enc.tam * 1.1} text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size={enc.tam} fill="#b3261e" opacity="0.85">{l}</text>
		{/each}
	{:else if nome === 'foguete'}
		<g transform="translate(0 {anima ? -Math.min(160, tl * tl * 18) : 0})">
			<path d="M0,-330 Q50,-260 46,-120 L-46,-120 Q-50,-260 0,-330 Z" fill={cor ?? '#e9e9ef'} stroke="#8a8f98" stroke-width="3" />
			<circle cx="0" cy="-230" r="20" fill="#2f5d8c" />
			<path d="M-46,-160 L-90,-90 L-46,-120 Z M46,-160 L90,-90 L46,-120 Z" fill="#b3261e" />
			<path d="M-30,-120 Q0,{-40 + Math.sin(vivo * 20) * 12} 30,-120 Z" fill="#ffb347" />
		</g>
	{:else if nome === 'satelite'}
		<g transform="translate(0 -160) rotate({Math.sin(vivo * 0.6) * 10})">
			<circle r="46" fill={cor ?? '#c0c4cc'} stroke="#6b7076" stroke-width="4" />
			{#each [[60, -40], [60, 40], [-60, -40], [-60, 40]] as [x, y], i (i)}<line x1="0" y1="0" x2={x * 2.4} y2={y * 2.4} stroke="#8a8f98" stroke-width="4" />{/each}
		</g>
	{:else if nome === 'explosao'}
		{@const k = Math.min(1, tl / 2.5)}
		<rect x="-26" y={-120 - 140 * k} width="52" height={120 + 140 * k} fill="#9a8a7a" opacity="0.9" />
		<ellipse cx="0" cy={-260 * k - 90} rx={60 + 120 * k} ry={40 + 70 * k} fill="#b8a898" />
		<ellipse cx="0" cy={-260 * k - 90} rx={40 + 80 * k} ry={26 + 44 * k} fill="#d8c8b8" />
		<ellipse cx="0" cy="-10" rx={80 + 140 * k} ry="26" fill="#a89888" />
	{:else if nome === 'trincheira'}
		<path d="M-260,0 L-260,-60 Q-130,-90 0,-60 Q130,-90 260,-60 L260,0 Z" fill="#6b5a3a" />
		<path d="M-260,-60 Q-130,-90 0,-60 Q130,-90 260,-60" fill="none" stroke="#4a3f2a" stroke-width="6" />
		{#each { length: 7 } as _, i (i)}
			<line x1={-230 + i * 76} y1="-70" x2={-230 + i * 76} y2="-130" stroke="#3a3a3a" stroke-width="5" />
		{/each}
		<path d="M-230,-110 Q-192,-130 -154,-110 T-78,-110 T-2,-110 T74,-110 T150,-110 T226,-110" fill="none" stroke="#5a5a5a" stroke-width="3" />
		<path d="M-230,-90 Q-192,-110 -154,-90 T-78,-90 T-2,-90 T74,-90 T150,-90 T226,-90" fill="none" stroke="#5a5a5a" stroke-width="3" />
	{:else if nome === 'computador'}
		<rect x="-150" y="-260" width="300" height="190" rx="14" fill="#1c1f26" />
		<rect x="-136" y="-246" width="272" height="162" rx="6" fill={cor ?? '#1f4e8a'} />
		{#each { length: 4 } as _, i (i)}<rect x="-110" y={-226 + i * 34} width={180 - (i % 2) * 60} height="14" rx="4" fill="#cfe3ff" opacity="0.8" />{/each}
		<path d="M-40,-70 L40,-70 L60,-20 L-60,-20 Z" fill="#3a3f47" />
		<rect x="-180" y="-20" width="360" height="20" rx="6" fill="#2a2e34" />
	{:else if nome === 'conteiner'}
		<path d="M-260,-40 L260,-40 L220,0 L-230,0 Z" fill="#2f3f4f" />
		{#each { length: 5 } as _, i (i)}
			{#each { length: 2 } as _, j (j)}
				<rect x={-200 + i * 80} y={-90 - j * 50} width="76" height="48" fill={['#b3261e', '#2f5d8c', '#d4a017', '#2f6f4f', '#7b3fa0'][(i + j) % 5]} stroke="#1a1a1a" stroke-width="2" />
			{/each}
		{/each}
		<rect x="190" y="-160" width="50" height="120" fill="#dfe6ec" />
	{:else if nome === 'globo'}
		<circle cx="0" cy="-150" r="130" fill="#2f6f9a" />
		<g transform="translate(0 -150)">
			<path d="M-70,-80 Q-20,-110 20,-70 Q-10,-30 -60,-40 Z M10,-10 Q60,-30 80,20 Q50,70 20,40 Z M-90,20 Q-60,10 -40,50 Q-70,80 -95,50 Z" fill="#7fb36a" transform="rotate({(vivo * 8) % 360})" />
			<ellipse rx="130" ry="40" fill="none" stroke="#cfe3ff" stroke-width="2" opacity="0.5" />
			<ellipse rx="40" ry="130" fill="none" stroke="#cfe3ff" stroke-width="2" opacity="0.5" />
		</g>
		<rect x="-14" y="-20" width="28" height="20" fill="#6b4226" />
		<rect x="-80" y="-4" width="160" height="12" rx="4" fill="#5a3a1f" />
	{:else if nome === 'pena'}
		<rect x="-120" y="-60" width="200" height="60" rx="6" fill="#f4ecd8" />
		<path d="M-90,-36 L40,-36 M-90,-20 L20,-20" stroke="#8a7a5a" stroke-width="4" />
		<path d="M60,-60 Q120,-260 200,-300 Q150,-190 70,-60 Z" fill={cor ?? '#f4f4f0'} stroke="#c9b991" stroke-width="3" />
		<path d="M66,-58 L180,-280" stroke="#c9b991" stroke-width="3" />
		<rect x="110" y="-60" width="70" height="60" rx="10" fill="#1a1a2a" />
	{:else if nome === 'lampada'}
		<path d="M-70,-200 Q-70,-300 0,-300 Q70,-300 70,-200 Q70,-150 36,-110 L-36,-110 Q-70,-150 -70,-200 Z" fill={cor ?? '#ffe08a'} opacity={0.85 + 0.15 * Math.sin(vivo * 4)} />
		<rect x="-36" y="-110" width="72" height="56" rx="8" fill="#8a8f98" />
		<path d="M-20,-200 L-10,-160 L0,-200 L10,-160 L20,-200" fill="none" stroke="#b8860b" stroke-width="4" />
		<circle cx="0" cy="-210" r="140" fill="url(#cin-brilho)" opacity="0.5" />
	{:else if nome === 'cartaz'}
		<line x1="0" y1="0" x2="0" y2="-150" stroke="#6b4a2c" stroke-width="10" />
		<rect x="-140" y="-300" width="280" height="160" rx="8" fill="#fffaf0" stroke="#3a2a1a" stroke-width="4" />
		{#each rot as l, i (i)}
			<text x="0" y={-220 - (rot.length * enc.tam * 1.1) / 2 + enc.tam * (0.9 + i * 1.1)} text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size={enc.tam} fill="#b3261e">{l}</text>
		{/each}
	{/if}
</g>
