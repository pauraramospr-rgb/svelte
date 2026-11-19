/**
 * Trilha ambiente e efeitos sonoros sintetizados na hora (Web Audio): nenhum arquivo de áudio é baixado.
 * A trilha é um tapete de acordes suaves que abaixa sozinho enquanto o professor fala.
 */
import type { Fundo } from './tipos';

type Humor = 'claro' | 'sombrio' | 'tenso';

const ACORDES: Record<Humor, number[][]> = {
	// Notas em Hz. Progressões lentas, em registro médio-grave, para não brigar com a voz.
	claro: [
		[130.81, 196.0, 329.63],
		[110.0, 164.81, 261.63],
		[87.31, 130.81, 220.0],
		[98.0, 146.83, 246.94]
	],
	sombrio: [
		[110.0, 164.81, 261.63],
		[87.31, 130.81, 207.65],
		[98.0, 146.83, 233.08],
		[82.41, 123.47, 196.0]
	],
	tenso: [
		[73.42, 110.0, 174.61],
		[77.78, 116.54, 185.0],
		[73.42, 110.0, 164.81],
		[69.3, 103.83, 164.81]
	]
};

export function humorDe(fundo: Fundo): Humor {
	if (fundo === 'chumbo' || fundo === 'noite') return 'tenso';
	if (fundo === 'arquivo' || fundo === 'tribunal' || fundo === 'mapa') return 'sombrio';
	return 'claro';
}

export class Trilha {
	private ctx: AudioContext | null = null;
	private mestre: GainNode | null = null;
	private musica: GainNode | null = null;
	private filtro: BiquadFilterNode | null = null;
	private vozes: { osc: OscillatorNode[]; ganho: GainNode }[] = [];
	private humor: Humor = 'sombrio';
	private passo = 0;
	private relogio: ReturnType<typeof setInterval> | null = null;
	musicaLigada = true;
	efeitosLigados = true;

	/** Precisa ser chamado dentro de um clique (política de áudio dos navegadores). */
	iniciar() {
		if (typeof window === 'undefined') return;
		try {
			if (!this.ctx) {
				const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
				if (!AC) return;
				this.ctx = new AC();
				this.mestre = this.ctx.createGain();
				this.mestre.gain.value = 0.9;
				this.mestre.connect(this.ctx.destination);
				this.filtro = this.ctx.createBiquadFilter();
				this.filtro.type = 'lowpass';
				this.filtro.frequency.value = 900;
				this.filtro.Q.value = 0.6;
				this.musica = this.ctx.createGain();
				this.musica.gain.value = 0;
				this.filtro.connect(this.musica);
				this.musica.connect(this.mestre);
			}
			void this.ctx.resume();
			if (!this.relogio) {
				this.tocarAcorde();
				this.relogio = setInterval(() => this.tocarAcorde(), 7000);
			}
			this.ajustarMusica(false);
		} catch {
			this.ctx = null;
		}
	}

	pausar() {
		if (this.relogio) clearInterval(this.relogio);
		this.relogio = null;
		this.ajustarMusica(false, 0);
	}

	encerrar() {
		this.pausar();
		try {
			void this.ctx?.close();
		} catch {
			/* nada */
		}
		this.ctx = null;
		this.vozes = [];
	}

	definirHumor(fundo: Fundo) {
		const h = humorDe(fundo);
		if (h === this.humor) return;
		this.humor = h;
		if (this.filtro && this.ctx) this.filtro.frequency.setTargetAtTime(h === 'claro' ? 1300 : h === 'sombrio' ? 900 : 650, this.ctx.currentTime, 1.5);
	}

	/** Abaixa a música enquanto há narração. */
	ajustarMusica(falando: boolean, forcar?: number) {
		if (!this.ctx || !this.musica) return;
		const alvo = forcar ?? (this.musicaLigada ? (falando ? 0.05 : 0.11) : 0);
		this.musica.gain.setTargetAtTime(alvo, this.ctx.currentTime, 0.6);
	}

	private tocarAcorde() {
		if (!this.ctx || !this.filtro) return;
		const ctx = this.ctx;
		const agora = ctx.currentTime;
		for (const v of this.vozes) {
			v.ganho.gain.setTargetAtTime(0, agora, 1.2);
			v.osc.forEach((o) => o.stop(agora + 5));
		}
		this.vozes = [];
		const acorde = ACORDES[this.humor][this.passo++ % 4];
		const ganho = ctx.createGain();
		ganho.gain.value = 0;
		ganho.gain.setTargetAtTime(0.22, agora, 1.4);
		ganho.connect(this.filtro);
		const osc: OscillatorNode[] = [];
		for (const f of acorde) {
			for (const [tipo, desafina] of [
				['triangle', 0],
				['sawtooth', 6]
			] as const) {
				const o = ctx.createOscillator();
				o.type = tipo;
				o.frequency.value = f;
				o.detune.value = desafina;
				const g = ctx.createGain();
				g.gain.value = tipo === 'sawtooth' ? 0.12 : 0.3;
				o.connect(g);
				g.connect(ganho);
				o.start(agora);
				osc.push(o);
			}
		}
		this.vozes.push({ osc, ganho });
	}

	private ruido(duracao: number): AudioBufferSourceNode | null {
		if (!this.ctx) return null;
		const n = Math.floor(this.ctx.sampleRate * duracao);
		const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
		const d = buf.getChannelData(0);
		for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
		const src = this.ctx.createBufferSource();
		src.buffer = buf;
		return src;
	}

	/** Efeitos curtos: carimbo (baque), máquina de escrever (teclas) e passagem (sopro). */
	efeito(nome: 'carimbo' | 'maquina' | 'passagem', duracao = 1) {
		if (!this.ctx || !this.mestre || !this.efeitosLigados) return;
		const ctx = this.ctx;
		const agora = ctx.currentTime;
		try {
			if (nome === 'carimbo') {
				const o = ctx.createOscillator();
				o.frequency.setValueAtTime(140, agora);
				o.frequency.exponentialRampToValueAtTime(45, agora + 0.18);
				const g = ctx.createGain();
				g.gain.setValueAtTime(0.5, agora);
				g.gain.exponentialRampToValueAtTime(0.001, agora + 0.25);
				o.connect(g);
				g.connect(this.mestre);
				o.start(agora);
				o.stop(agora + 0.3);
				const r = this.ruido(0.12);
				if (r) {
					const f = ctx.createBiquadFilter();
					f.type = 'lowpass';
					f.frequency.value = 700;
					const gr = ctx.createGain();
					gr.gain.setValueAtTime(0.35, agora);
					gr.gain.exponentialRampToValueAtTime(0.001, agora + 0.12);
					r.connect(f);
					f.connect(gr);
					gr.connect(this.mestre);
					r.start(agora);
				}
			} else if (nome === 'maquina') {
				const toques = Math.min(60, Math.floor(duracao / 0.085));
				for (let i = 0; i < toques; i++) {
					const quando = agora + i * 0.085 + Math.random() * 0.03;
					const r = this.ruido(0.03);
					if (!r) break;
					const f = ctx.createBiquadFilter();
					f.type = 'bandpass';
					f.frequency.value = 2400 + Math.random() * 1500;
					const g = ctx.createGain();
					g.gain.setValueAtTime(0.0001, quando);
					g.gain.exponentialRampToValueAtTime(0.16, quando + 0.004);
					g.gain.exponentialRampToValueAtTime(0.0001, quando + 0.03);
					r.connect(f);
					f.connect(g);
					g.connect(this.mestre);
					r.start(quando);
				}
			} else {
				const r = this.ruido(0.9);
				if (!r) return;
				const f = ctx.createBiquadFilter();
				f.type = 'bandpass';
				f.Q.value = 0.8;
				f.frequency.setValueAtTime(300, agora);
				f.frequency.exponentialRampToValueAtTime(2600, agora + 0.6);
				const g = ctx.createGain();
				g.gain.setValueAtTime(0.0001, agora);
				g.gain.exponentialRampToValueAtTime(0.09, agora + 0.25);
				g.gain.exponentialRampToValueAtTime(0.0001, agora + 0.85);
				r.connect(f);
				f.connect(g);
				g.connect(this.mestre);
				r.start(agora);
			}
		} catch {
			/* sem som, sem problema */
		}
	}
}
