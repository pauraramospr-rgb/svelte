/**
 * Narração com a voz sintetizada do próprio aparelho (Web Speech API).
 * Escolhe a melhor voz em português do Brasil disponível; tudo protegido para SSR e navegadores sem suporte.
 */

export interface OpcaoVoz {
	id: string;
	nome: string;
	lang: string;
	natural: boolean;
}

const PREFERIDAS = [/natural|neural|online/i, /francisca|thalita|antonio|brenda|donato|leila|manuela/i, /google portugu[eê]s do brasil/i, /luciana|felipe|fernanda|joana|daniel/i];

export function temVoz(): boolean {
	return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

function todas(): SpeechSynthesisVoice[] {
	if (!temVoz()) return [];
	try {
		return window.speechSynthesis.getVoices();
	} catch {
		return [];
	}
}

function pontuar(v: SpeechSynthesisVoice): number {
	let p = 0;
	const lang = v.lang.replace('_', '-').toLowerCase();
	if (lang === 'pt-br') p += 100;
	else if (lang.startsWith('pt')) p += 40;
	else return -1;
	PREFERIDAS.forEach((re, i) => {
		if (re.test(v.name)) p += 40 - i * 8;
	});
	if (!v.localService) p += 4;
	return p;
}

/** Quantas vozes o navegador lista. Alguns apps (WebViews) não listam nenhuma e ainda assim falam com a voz padrão do sistema. */
export function totalDeVozes(): number {
	return todas().length;
}

/** Vozes em português, da melhor para a pior. */
export function vozesPortugues(): OpcaoVoz[] {
	return todas()
		.map((v) => ({ v, p: pontuar(v) }))
		.filter((x) => x.p >= 0)
		.sort((a, b) => b.p - a.p)
		.map(({ v }) => ({ id: v.voiceURI || v.name, nome: v.name, lang: v.lang, natural: /natural|neural|online/i.test(v.name) }));
}

/** Avisa quando a lista de vozes muda (alguns navegadores carregam as vozes depois). */
export function aoMudarVozes(fn: () => void): () => void {
	if (!temVoz()) return () => {};
	const s = window.speechSynthesis;
	const h = () => fn();
	s.addEventListener?.('voiceschanged', h);
	const t = setTimeout(fn, 400);
	return () => {
		s.removeEventListener?.('voiceschanged', h);
		clearTimeout(t);
	};
}

let atual: SpeechSynthesisUtterance | null = null;
let manter: ReturnType<typeof setInterval> | null = null;

export interface Fala {
	cancelar(): void;
}

/**
 * Fala uma frase. `aoTerminar` é chamado uma única vez (fim, erro ou cancelamento).
 * `aoLimite` recebe o índice do caractere falado, quando o navegador informa.
 */
export function falar(
	texto: string,
	opcoes: { vozId?: string; ritmo?: number; aoTerminar: () => void; aoLimite?: (char: number) => void; aoComecar?: () => void }
): Fala {
	if (!temVoz()) {
		opcoes.aoTerminar();
		return { cancelar() {} };
	}
	const s = window.speechSynthesis;
	const u = new SpeechSynthesisUtterance(texto);
	const voz = todas().find((v) => (v.voiceURI || v.name) === opcoes.vozId);
	if (voz) {
		u.voice = voz;
		u.lang = voz.lang;
	} else u.lang = 'pt-BR';
	u.rate = opcoes.ritmo ?? 1;
	u.pitch = 1;
	let feito = false;
	const terminar = () => {
		if (feito) return;
		feito = true;
		if (manter) clearInterval(manter);
		manter = null;
		opcoes.aoTerminar();
	};
	u.onend = terminar;
	u.onerror = terminar;
	u.onstart = () => opcoes.aoComecar?.();
	u.onboundary = (ev) => opcoes.aoLimite?.(ev.charIndex);
	atual = u;
	try {
		// Falas curtas (o player divide frases longas) dispensam o contorno de pausar/retomar, que causava engasgos.
		s.speak(u);
	} catch {
		terminar();
	}
	return {
		cancelar() {
			feito = true;
			if (manter) clearInterval(manter);
			manter = null;
			try {
				if (atual === u) s.cancel();
			} catch {
				/* nada */
			}
		}
	};
}

export function calar() {
	if (!temVoz()) return;
	try {
		window.speechSynthesis.cancel();
	} catch {
		/* nada */
	}
	if (manter) clearInterval(manter);
	manter = null;
}

/** Destrava a síntese de voz dentro de um gesto do usuário (necessário no iOS). */
export function destravar() {
	if (!temVoz()) return;
	try {
		const u = new SpeechSynthesisUtterance(' ');
		u.volume = 0;
		window.speechSynthesis.speak(u);
	} catch {
		/* nada */
	}
}
