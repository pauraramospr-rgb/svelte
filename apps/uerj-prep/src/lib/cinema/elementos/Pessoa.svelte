<svelte:options namespace="svg" />

<script lang="ts">
	import type { Variante } from '../tipos';
	import { FONTE } from '../util';
	import { caberLinha } from '../medida.svelte';

	/** Boneco ilustrado (pés em 0,0; cerca de 240 unidades de altura). Tudo é função de `t`. */
	let {
		v,
		t,
		fala = false,
		falando = false,
		gesto = 'nenhum',
		placa = '',
		andando = false,
		semente = 0,
		vira = false
	}: {
		v: Variante;
		t: number;
		fala?: boolean;
		falando?: boolean;
		gesto?: 'aponta' | 'acena' | 'punho' | 'placa' | 'livro' | 'nenhum';
		placa?: string;
		andando?: boolean;
		semente?: number;
		vira?: boolean;
	} = $props();

	const ESTILO: Record<Variante, { pele: string; cabelo: string; roupa: string; calca: string; detalhe: string; sapato: string }> = {
		professor: { pele: '#c98e62', cabelo: '#2b2118', roupa: '#2f3cd9', calca: '#1f2a44', detalhe: '#ffd84d', sapato: '#2a1f1a' },
		estudante: { pele: '#e5b48c', cabelo: '#4a2f1d', roupa: '#e0533d', calca: '#3b5b8a', detalhe: '#ffffff', sapato: '#f2f2f2' },
		operario: { pele: '#8d5a3b', cabelo: '#1c1512', roupa: '#2f5d8c', calca: '#2f5d8c', detalhe: '#f2c14e', sapato: '#3b2a20' },
		soldado: { pele: '#d8a47c', cabelo: '#2a2a2a', roupa: '#4b5a32', calca: '#3f4c2a', detalhe: '#2e3820', sapato: '#1a1a1a' },
		religioso: { pele: '#e8c19d', cabelo: '#8a8a8a', roupa: '#1f1f24', calca: '#1f1f24', detalhe: '#ffffff', sapato: '#111111' },
		jornalista: { pele: '#b9784f', cabelo: '#3a2a1f', roupa: '#b49a6a', calca: '#5c4a32', detalhe: '#7a1f1f', sapato: '#2b1d14' },
		mulher: { pele: '#a96b45', cabelo: '#24170f', roupa: '#7b3fa0', calca: '#3a2050', detalhe: '#f5c3d8', sapato: '#3a2050' },
		campones: { pele: '#9a6440', cabelo: '#1f1712', roupa: '#b5482f', calca: '#5a4a35', detalhe: '#e9cf8c', sapato: '#3a2a1c' },
		executivo: { pele: '#efc9a6', cabelo: '#5a4a3a', roupa: '#33363d', calca: '#2a2c31', detalhe: '#9b1c2e', sapato: '#111111' },
		marinheiro: { pele: '#c48a5f', cabelo: '#1d1612', roupa: '#f4f4f0', calca: '#f4f4f0', detalhe: '#1f2f5c', sapato: '#111111' },
		politico: { pele: '#e2b48d', cabelo: '#2a241f', roupa: '#1f2f5c', calca: '#1b2848', detalhe: '#c9a227', sapato: '#111111' },
		mae: { pele: '#d9a57d', cabelo: '#6b6b6b', roupa: '#3d3a4f', calca: '#2c2a3a', detalhe: '#ffffff', sapato: '#222222' },
		rei: { pele: '#e8c19d', cabelo: '#6b4a2c', roupa: '#7a1f2b', calca: '#3a1f4a', detalhe: '#d4a017', sapato: '#2a1a10' },
		rainha: { pele: '#efc9a6', cabelo: '#8a5a2c', roupa: '#5a2a7a', calca: '#5a2a7a', detalhe: '#d4a017', sapato: '#2a1a10' },
		burgues: { pele: '#e2b48d', cabelo: '#4a3a2a', roupa: '#2c3e50', calca: '#3a3a3a', detalhe: '#f4f4f0', sapato: '#111111' },
		sansculotte: { pele: '#c98e62', cabelo: '#3a2a1f', roupa: '#2f4f8a', calca: '#e9e2cf', detalhe: '#c0392b', sapato: '#3b2a20' },
		navegador: { pele: '#d9a57d', cabelo: '#3a2a1f', roupa: '#5a3a24', calca: '#3a2a1f', detalhe: '#d4a017', sapato: '#2a1a10' },
		jesuita: { pele: '#e8c19d', cabelo: '#4a3a2a', roupa: '#141418', calca: '#141418', detalhe: '#e8e2d4', sapato: '#111111' },
		indigena: { pele: '#a8714a', cabelo: '#141010', roupa: '#b5622f', calca: '#a8714a', detalhe: '#e9cf8c', sapato: '#a8714a' },
		escravizado: { pele: '#6e4429', cabelo: '#141010', roupa: '#d9cfb8', calca: '#bfb49a', detalhe: '#8a7a5a', sapato: '#6e4429' },
		filosofo: { pele: '#efc9a6', cabelo: '#e8e2d4', roupa: '#2f5d4a', calca: '#3a3a3a', detalhe: '#f4f4f0', sapato: '#111111' },
		'soldado-antigo': { pele: '#e2b48d', cabelo: '#3a2a1f', roupa: '#1f3a7a', calca: '#e9e2cf', detalhe: '#c0392b', sapato: '#111111' },
		guerrilheiro: { pele: '#c48a5f', cabelo: '#1d1612', roupa: '#556b2f', calca: '#4a5a2a', detalhe: '#1a1a1a', sapato: '#2a2a1a' },
		jovem: { pele: '#d9a57d', cabelo: '#5a3a1f', roupa: '#e0a33d', calca: '#3b5b8a', detalhe: '#7b3fa0', sapato: '#f2f2f2' }
	};

	const e = $derived(ESTILO[v]);
	const fase = $derived(t * (andando ? 7 : 0) + semente);
	const perna = $derived(andando ? Math.sin(fase) * 22 : 0);
	const respira = $derived(Math.sin(t * 1.9 + semente) * 1.6);
	const balanca = $derived(andando ? Math.abs(Math.sin(fase)) * -4 : 0);
	const piscando = $derived(((t + semente * 0.37) % 3.9) < 0.13);
	const boca = $derived(fala && falando ? 0.35 + 0.65 * Math.abs(Math.sin(t * 11 + semente)) * (0.6 + 0.4 * Math.sin(t * 3.1)) : 0);

	// Ângulos dos braços (graus; 0 = pendurado para baixo, positivo = para a frente/fora).
	const bracoD = $derived.by(() => {
		if (gesto === 'aponta') return -78 + Math.sin(t * 2) * 3;
		if (gesto === 'acena') return -150 + Math.sin(t * 6) * 16;
		if (gesto === 'punho') return -168 + Math.sin(t * 4) * 6;
		if (gesto === 'placa') return -158;
		if (gesto === 'livro') return -38;
		if (andando) return Math.sin(fase) * -20;
		if (fala && falando) return -12 + Math.sin(t * 2.3) * 8;
		return 6;
	});
	const bracoE = $derived.by(() => {
		if (gesto === 'placa') return 158;
		if (gesto === 'livro') return 38;
		if (andando) return Math.sin(fase) * 20;
		return -6;
	});
</script>

<g class="pessoa">
	<ellipse cx="0" cy="0" rx="44" ry="7" fill="rgba(0,0,0,0.22)" />
	<g transform="translate(0 {balanca})">
		<!-- pernas -->
		<g transform="rotate({perna} 0 -98)">
			<rect x="-21" y="-100" width="17" height="94" rx="8" fill={e.calca} />
			<ellipse cx="-12" cy="-6" rx="13" ry="6.5" fill={e.sapato} />
		</g>
		<g transform="rotate({-perna} 0 -98)">
			<rect x="4" y="-100" width="17" height="94" rx="8" fill={e.calca} />
			<ellipse cx="13" cy="-6" rx="13" ry="6.5" fill={e.sapato} />
		</g>

		<!-- braço de trás -->
		<g transform="rotate({bracoE} -34 -170)">
			<rect x="-42" y="-172" width="15" height="74" rx="7.5" fill={e.roupa} />
			<rect x="-42" y="-172" width="15" height="74" rx="7.5" fill="rgba(0,0,0,0.12)" />
			<circle cx="-34.5" cy="-96" r="8.5" fill={e.pele} />
		</g>

		<!-- tronco -->
		<g transform="translate(0 {respira * 0.4})">
			{#if v === 'religioso' || v === 'jesuita'}
				<path d="M-34,-176 Q0,-188 34,-176 L44,-6 Q0,4 -44,-6 Z" fill={e.roupa} />
			{:else if v === 'rei'}
				<path d="M-46,-176 Q0,-192 46,-176 L58,-4 Q0,6 -58,-4 Z" fill={e.detalhe} opacity="0.9" />
				<path d="M-36,-176 Q0,-188 36,-176 L42,-8 Q0,0 -42,-8 Z" fill={e.roupa} />
				<path d="M-40,-178 Q0,-160 40,-178 L40,-166 Q0,-148 -40,-166 Z" fill="#f4f4f0" />
			{:else if v === 'rainha'}
				<path d="M-30,-176 Q0,-188 30,-176 L58,-4 Q0,8 -58,-4 Z" fill={e.roupa} />
				<path d="M-32,-176 Q0,-160 32,-176" fill="none" stroke={e.detalhe} stroke-width="6" />
			{:else if v === 'burgues' || v === 'filosofo' || v === 'navegador' || v === 'soldado-antigo'}
				<path d="M-35,-176 Q0,-189 35,-176 L40,-60 L22,-40 L-22,-40 L-40,-60 Z" fill={e.roupa} />
				<path d="M-8,-182 L0,-120 L8,-182 Z" fill={e.detalhe} />
				{#if v === 'soldado-antigo'}
					<path d="M-35,-150 L35,-110 M35,-150 L-35,-110" stroke="#f4f4f0" stroke-width="7" />
				{/if}
			{:else if v === 'indigena'}
				<path d="M-35,-176 Q0,-189 35,-176 L37,-100 Q0,-90 -37,-100 Z" fill={e.pele} />
				<path d="M-37,-110 L37,-110 L42,-70 L-42,-70 Z" fill={e.roupa} />
				<path d="M-24,-176 Q0,-150 24,-176" fill="none" stroke={e.detalhe} stroke-width="5" />
			{:else if v === 'mulher'}
				<path d="M-32,-176 Q0,-188 32,-176 L48,-62 Q0,-48 -48,-62 Z" fill={e.roupa} />
			{:else}
				<path d="M-35,-176 Q0,-189 35,-176 L37,-100 Q0,-90 -37,-100 Z" fill={e.roupa} />
			{/if}
			<path d="M8,-182 Q30,-180 35,-176 L37,-100 Q24,-95 10,-94 Z" fill="rgba(0,0,0,0.10)" />
			{#if v === 'professor'}
				<path d="M-9,-183 L0,-160 L9,-183" fill="none" stroke={e.detalhe} stroke-width="7" stroke-linecap="round" />
				<path d="M-2,-162 L3,-126" stroke={e.detalhe} stroke-width="6" stroke-linecap="round" />
			{:else if v === 'executivo' || v === 'politico' || v === 'jornalista'}
				<path d="M-10,-182 L0,-168 L10,-182 Z" fill="#ffffff" />
				<path d="M0,-170 L-5,-150 L0,-122 L5,-150 Z" fill={e.detalhe} />
			{:else if v === 'operario'}
				<rect x="-24" y="-150" width="48" height="26" rx="4" fill="rgba(255,255,255,0.12)" />
				<line x1="-20" y1="-176" x2="-20" y2="-140" stroke={e.detalhe} stroke-width="4" />
				<line x1="20" y1="-176" x2="20" y2="-140" stroke={e.detalhe} stroke-width="4" />
			{:else if v === 'soldado'}
				<rect x="-37" y="-112" width="74" height="9" fill={e.detalhe} />
				<rect x="-6" y="-114" width="12" height="13" fill="#b8a14a" />
				<rect x="-26" y="-160" width="14" height="10" rx="2" fill={e.detalhe} />
				<rect x="12" y="-160" width="14" height="10" rx="2" fill={e.detalhe} />
			{:else if v === 'religioso'}
				<rect x="-7" y="-184" width="14" height="7" fill={e.detalhe} />
			{:else if v === 'marinheiro'}
				<path d="M-20,-182 L0,-150 L20,-182" fill="none" stroke={e.detalhe} stroke-width="8" />
			{:else if v === 'campones'}
				<path d="M-35,-150 H37 M-35,-126 H37 M-14,-182 V-100 M14,-182 V-100" stroke="rgba(0,0,0,0.18)" stroke-width="4" />
			{:else if v === 'estudante'}
				<circle cx="0" cy="-150" r="10" fill="none" stroke={e.detalhe} stroke-width="3.5" />
			{/if}
		</g>

		<!-- pescoço e cabeça -->
		<g transform="translate(0 {respira})">
			<rect x="-7" y="-192" width="14" height="14" fill={e.pele} />
			<rect x="-7" y="-192" width="14" height="14" fill="rgba(0,0,0,0.12)" />
			<circle cx="0" cy="-214" r="29" fill={e.pele} />
			<path d="M10,-240 A29,29 0 0 1 10,-188 A34,34 0 0 0 10,-240 Z" fill="rgba(0,0,0,0.08)" />

			<!-- cabelo e chapéus -->
			{#if v === 'rei'}
				<path d="M-29,-216 Q-32,-248 0,-248 Q32,-248 29,-216 Q22,-236 0,-236 Q-22,-236 -29,-216 Z" fill={e.cabelo} />
				<path d="M-26,-238 L-26,-268 L-13,-252 L0,-272 L13,-252 L26,-268 L26,-238 Z" fill={e.detalhe} stroke="#8a6a10" stroke-width="2" />
			{:else if v === 'rainha'}
				<path d="M-32,-200 Q-38,-250 0,-250 Q38,-250 32,-200 Q30,-176 18,-172 Q26,-214 0,-232 Q-26,-214 -18,-172 Q-30,-176 -32,-200 Z" fill={e.cabelo} />
				<path d="M-20,-244 L-20,-264 L-7,-252 L0,-268 L7,-252 L20,-264 L20,-244 Z" fill={e.detalhe} stroke="#8a6a10" stroke-width="2" />
			{:else if v === 'burgues'}
				<rect x="-24" y="-290" width="48" height="52" rx="3" fill="#1a1a1a" />
				<ellipse cx="0" cy="-238" rx="38" ry="7" fill="#1a1a1a" />
			{:else if v === 'sansculotte'}
				<path d="M-30,-226 Q-26,-262 6,-264 Q30,-262 40,-236 Q28,-246 20,-232 Z" fill={e.detalhe} />
			{:else if v === 'navegador' || v === 'soldado-antigo'}
				<path d="M-46,-232 L0,-262 L46,-232 Q0,-240 -46,-232 Z" fill="#1a1a1a" />
			{:else if v === 'filosofo'}
				<path d="M-33,-200 Q-38,-252 0,-252 Q38,-252 33,-200 Q34,-186 26,-182 Q28,-226 0,-238 Q-28,-226 -26,-182 Q-34,-186 -33,-200 Z" fill={e.cabelo} />
			{:else if v === 'jesuita'}
				<ellipse cx="0" cy="-238" rx="40" ry="8" fill="#141418" />
				<path d="M-24,-240 Q-22,-262 0,-262 Q22,-262 24,-240 Z" fill="#141418" />
			{:else if v === 'guerrilheiro'}
				<path d="M-31,-224 Q-30,-252 4,-252 Q34,-250 36,-230 Q10,-238 -31,-224 Z" fill="#1a1a1a" />
				<circle cx="-14" cy="-240" r="4" fill="#c0392b" />
			{:else if v === 'indigena' || v === 'escravizado'}
				<path d="M-29,-218 Q-31,-246 0,-246 Q31,-246 29,-218 Q20,-232 0,-232 Q-20,-232 -29,-218 Z" fill={e.cabelo} />
			{:else if v === 'jovem'}
				<path d="M-33,-200 Q-40,-252 0,-252 Q40,-252 33,-200 Q32,-172 22,-160 Q28,-222 0,-236 Q-28,-222 -22,-160 Q-32,-172 -33,-200 Z" fill={e.cabelo} />
				<path d="M-34,-226 Q0,-240 34,-226" fill="none" stroke={e.detalhe} stroke-width="6" />
			{:else if v === 'soldado'}
				<path d="M-33,-216 Q-33,-252 0,-254 Q33,-252 33,-216 Z" fill={e.roupa} />
				<rect x="-36" y="-219" width="72" height="7" rx="3.5" fill={e.detalhe} />
			{:else if v === 'operario'}
				<path d="M-30,-222 Q-28,-248 0,-249 Q28,-248 30,-222 Z" fill="#2f5d8c" />
				<path d="M8,-224 L42,-221 Q40,-216 8,-218 Z" fill="#244a71" />
			{:else if v === 'marinheiro'}
				<ellipse cx="0" cy="-241" rx="31" ry="9" fill="#ffffff" />
				<rect x="-25" y="-240" width="50" height="8" fill={e.detalhe} />
			{:else if v === 'campones'}
				<ellipse cx="0" cy="-232" rx="52" ry="9" fill="#e9cf8c" />
				<path d="M-24,-234 Q-22,-260 0,-261 Q22,-260 24,-234 Z" fill="#e1c27a" />
				<rect x="-24" y="-240" width="48" height="5" fill="#b5482f" />
			{:else if v === 'mae'}
				<path d="M-36,-206 Q-40,-252 0,-254 Q40,-252 36,-206 Q30,-182 22,-182 Q28,-210 0,-238 Q-28,-210 -22,-182 Q-30,-182 -36,-206 Z" fill={e.detalhe} />
			{:else if v === 'mulher'}
				<path d="M-32,-200 Q-38,-250 0,-250 Q38,-250 32,-200 Q30,-176 18,-172 Q26,-214 0,-232 Q-26,-214 -18,-172 Q-30,-176 -32,-200 Z" fill={e.cabelo} />
			{:else if v === 'estudante'}
				<path d="M-30,-216 Q-34,-250 0,-249 Q36,-250 31,-214 Q24,-236 0,-236 Q-16,-236 -30,-216 Z" fill={e.cabelo} />
				<path d="M-31,-214 Q-36,-196 -28,-188 L-25,-212 Z" fill={e.cabelo} />
			{:else if v === 'religioso'}
				<path d="M-29,-214 Q-30,-232 -20,-238 Q-12,-226 -28,-206 Z M29,-214 Q30,-232 20,-238 Q12,-226 28,-206 Z" fill={e.cabelo} />
			{:else}
				<path d="M-29,-216 Q-32,-248 0,-248 Q32,-248 29,-216 Q22,-236 0,-236 Q-22,-236 -29,-216 Z" fill={e.cabelo} />
			{/if}

			<!-- rosto -->
			{#if piscando}
				<line x1="-15" y1="-214" x2="-7" y2="-214" stroke="#1a1410" stroke-width="2.5" stroke-linecap="round" />
				<line x1="7" y1="-214" x2="15" y2="-214" stroke="#1a1410" stroke-width="2.5" stroke-linecap="round" />
			{:else}
				<ellipse cx="-11" cy="-214" rx="3.4" ry="4.3" fill="#1a1410" />
				<ellipse cx="11" cy="-214" rx="3.4" ry="4.3" fill="#1a1410" />
			{/if}
			<path d="M-17,-224 Q-11,-228 -5,-224 M5,-224 Q11,-228 17,-224" fill="none" stroke="#1a1410" stroke-width="2.2" stroke-linecap="round" opacity="0.7" />
			{#if v === 'professor' || v === 'jornalista'}
				<circle cx="-11" cy="-214" r="9" fill="none" stroke="#1a1410" stroke-width="2.2" />
				<circle cx="11" cy="-214" r="9" fill="none" stroke="#1a1410" stroke-width="2.2" />
				<line x1="-2" y1="-214" x2="2" y2="-214" stroke="#1a1410" stroke-width="2.2" />
			{/if}
			{#if boca > 0}
				<ellipse cx="0" cy="-198" rx="7" ry={1.6 + 5 * boca} fill="#5a1f1f" />
			{:else}
				<path d="M-7,-200 Q0,-194 7,-200" fill="none" stroke="#5a1f1f" stroke-width="2.4" stroke-linecap="round" />
			{/if}
			<circle cx="-19" cy="-204" r="4.5" fill="#e07a6a" opacity="0.25" />
			<circle cx="19" cy="-204" r="4.5" fill="#e07a6a" opacity="0.25" />
		</g>

		<!-- braço da frente -->
		<g transform="rotate({bracoD} 34 -170)">
			<rect x="27" y="-172" width="15" height="74" rx="7.5" fill={e.roupa} />
			<circle cx="34.5" cy="-96" r="8.5" fill={e.pele} />
			{#if gesto === 'punho'}<circle cx="34.5" cy="-96" r="10" fill={e.pele} />{/if}
		</g>

		{#if gesto === 'placa'}
			<g transform="translate(0 {-318 + Math.sin(t * 3 + semente) * 3})">
				<line x1="0" y1="20" x2="0" y2="62" stroke="#7a5a3a" stroke-width="5" />
				<rect x="-74" y="-30" width="148" height="56" rx="6" fill="#fffaf0" stroke="#3a2a1a" stroke-width="2" />
				<text x="0" y="7" text-anchor="middle" font-family={FONTE.display} font-weight="800" font-size={caberLinha(placa, 132, 'display', 24, 800)} fill="#1a1410" transform={vira ? 'scale(-1 1)' : undefined}>{placa}</text>
			</g>
		{:else if gesto === 'livro'}
			<g transform="translate(0 -128)">
				<path d="M-32,-14 L0,-8 L32,-14 L32,18 L0,24 L-32,18 Z" fill="#fffaf0" stroke="#3a2a1a" stroke-width="2" />
				<line x1="0" y1="-8" x2="0" y2="24" stroke="#3a2a1a" stroke-width="2" />
			</g>
		{:else if v === 'jornalista'}
			<rect x="38" y="-130" width="22" height="28" rx="2" fill="#fffaf0" stroke="#3a2a1a" stroke-width="1.5" transform="rotate({bracoD * 0.3} 34 -170)" />
		{/if}
	</g>
</g>
