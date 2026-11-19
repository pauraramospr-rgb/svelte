import type { Animacao, Camera, Momento } from './tipos';

/** Divide a narração em frases (a unidade de sincronia entre voz, legenda e animação). */
export function frases(narracao: string): string[] {
	const limpo = narracao.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\s+/g, ' ').trim();
	// Quebra depois de . ! ? … (ou aspas/parênteses que os fecham) seguidos de espaço e de letra maiúscula, número ou aspas.
	const partes = limpo.split(/(?<=[.!?…][”"’)]?)\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9“"(])/u);
	return partes.map((p) => p.trim()).filter(Boolean);
}

/** Duração estimada de uma frase falada (cerca de 14,5 caracteres por segundo, mais uma pausa). */
export function duracaoFala(frase: string, ritmo = 1): number {
	return (frase.length / 14.5 + 0.45) / ritmo;
}

export interface Cronograma {
	frases: string[];
	inicios: number[];
	duracoes: number[];
	total: number;
}

/** Linha do tempo de uma cena: início de cada frase e duração total (com respiro final). */
export function cronograma(narracao: string, ritmo = 1, respiro = 1.2): Cronograma {
	const fs = frases(narracao);
	const duracoes = fs.map((f) => duracaoFala(f, ritmo));
	const inicios: number[] = [];
	let t = 0.8;
	for (const d of duracoes) {
		inicios.push(t);
		t += d;
	}
	return { frases: fs, inicios, duracoes, total: t + respiro };
}

export function instante(m: Momento, c: Cronograma): number {
	const s = Math.max(0, Math.min(m.s, c.inicios.length - 1));
	return (c.inicios[s] ?? 0) + (m.f ? m.f * (c.duracoes[s] ?? 0) : 0) + (m.d ?? 0);
}

export const suave = {
	linear: (x: number) => x,
	saida: (x: number) => 1 - Math.pow(1 - x, 3),
	entradaSaida: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
	elastico: (x: number) => {
		const c1 = 1.70158;
		const c3 = c1 + 1;
		return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
	}
};

export function clamp01(x: number): number {
	return x < 0 ? 0 : x > 1 ? 1 : x;
}

/** Progresso de entrada (0→1) e de saída (1→0) de um elemento no instante t. */
export function progresso(a: Animacao, c: Cronograma, t: number): { p: number; visivel: boolean; saida: number } {
	const ini = instante(a, c);
	const dur = a.dur ?? 0.7;
	const p = clamp01((t - ini) / dur);
	let saida = 1;
	if (a.sai) {
		const ts = instante(a.sai, c);
		saida = 1 - clamp01((t - ts) / (a.sai.dur ?? 0.6));
	}
	return { p, visivel: t >= ini && saida > 0, saida };
}

/** Interpola a câmera entre os quadros-chave. */
export function cameraEm(cams: Camera[] | undefined, c: Cronograma, t: number): { x: number; y: number; z: number } {
	const padrao = { x: 800, y: 450, z: 1 };
	if (!cams?.length) return padrao;
	let atual = { x: cams[0].x, y: cams[0].y, z: cams[0].z };
	for (const k of cams) {
		const ini = instante(k, c);
		if (t < ini) break;
		const p = suave.entradaSaida(clamp01((t - ini) / (k.dur ?? 2.2)));
		atual = { x: atual.x + (k.x - atual.x) * p, y: atual.y + (k.y - atual.y) * p, z: atual.z + (k.z - atual.z) * p };
	}
	return atual;
}

export function formatarTempo(seg: number): string {
	const s = Math.max(0, Math.floor(seg));
	return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
