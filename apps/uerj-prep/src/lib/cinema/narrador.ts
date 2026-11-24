/**
 * Toca a narração gravada num único elemento <audio>, reaproveitado a aula inteira.
 *
 * Por que um elemento só: iPhone, iPad e Android só deixam um elemento de áudio tocar sozinho depois
 * que ele recebeu um `play()` dentro de um toque do aluno. O primeiro toque em “Tocar” destrava este
 * elemento (com um instante de silêncio); depois disso as cenas seguintes tocam sem novo toque.
 * Áudio de mídia toca mesmo com o modo silencioso do iPhone/iPad ligado, ao contrário da voz sintetizada.
 */
const arquivos = import.meta.glob('../data/narracao/**/*.mp3', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

/** Endereço do MP3 de uma gravação (na versão web, o próprio arquivo embutido). */
export function urlDaGravacao(arquivo: string): string | undefined {
	return arquivos[`../data/narracao/${arquivo}`];
}

let silencio = '';

/** Um vigésimo de segundo de silêncio em WAV, só para destravar o elemento no primeiro toque. */
function wavSilencio(): string {
	if (silencio) return silencio;
	const amostras = 1102;
	const b = new Uint8Array(44 + amostras * 2);
	const v = new DataView(b.buffer);
	const txt = (o: number, s: string) => {
		for (let i = 0; i < s.length; i++) b[o + i] = s.charCodeAt(i);
	};
	txt(0, 'RIFF');
	v.setUint32(4, 36 + amostras * 2, true);
	txt(8, 'WAVE');
	txt(12, 'fmt ');
	v.setUint32(16, 16, true);
	v.setUint16(20, 1, true);
	v.setUint16(22, 1, true);
	v.setUint32(24, 22050, true);
	v.setUint32(28, 44100, true);
	v.setUint16(32, 2, true);
	v.setUint16(34, 16, true);
	txt(36, 'data');
	v.setUint32(40, amostras * 2, true);
	let s = '';
	for (const x of b) s += String.fromCharCode(x);
	silencio = 'data:audio/wav;base64,' + btoa(s);
	return silencio;
}

/** Converte um endereço data: em blob: (alguns navegadores tocam um e recusam o outro). */
function dataParaBlob(url: string): string | null {
	try {
		const virgula = url.indexOf(',');
		const cabeca = url.slice(5, virgula);
		if (!cabeca.endsWith(';base64')) return null;
		const bin = atob(url.slice(virgula + 1));
		const bytes = new Uint8Array(bin.length);
		for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
		return URL.createObjectURL(new Blob([bytes], { type: cabeca.split(';')[0] || 'audio/mpeg' }));
	} catch {
		return null;
	}
}

/** Pede ao iOS (Safari 16.4+) que trate a página como reprodução de mídia, e não como som de toque. */
export function sessaoDeReproducao() {
	try {
		const s = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
		if (s && s.type !== 'playback') s.type = 'playback';
	} catch {
		/* indisponível */
	}
}

export class Narrador {
	readonly el: HTMLAudioElement;
	/** Gravação pedida pela cena (endereço original); vazio quando o elemento não tem gravação. */
	private pedido = '';
	/** Cópias em blob: das gravações que o navegador recusou como data:. */
	private blobDe = new Map<string, string>();
	private destravado = false;
	private posPendente: number | null = null;
	private quer = false;
	/** Muda a cada troca de fonte: erros que chegam atrasados, de uma fonte antiga, são ignorados. */
	private geracao = 0;
	private tratada = -1;
	/** Este arquivo gravado não toca neste navegador (o player volta para a voz sintetizada nas cenas dele). */
	aoFalhar: (url: string) => void = () => {};
	/** O navegador recusou tocar sem um toque do aluno (o player pausa e pede um toque). */
	aoBloquear: () => void = () => {};
	/** A gravação chegou ao fim. */
	aoAcabar: () => void = () => {};

	constructor() {
		const el = new Audio();
		el.preload = 'auto';
		el.setAttribute('playsinline', '');
		el.setAttribute('webkit-playsinline', '');
		el.addEventListener('error', () => {
			if (el.error) this.erro();
		});
		el.addEventListener('ended', () => {
			if (this.pedido) this.aoAcabar();
		});
		el.addEventListener('loadedmetadata', () => {
			const p = this.posPendente;
			this.posPendente = null;
			if (p !== null && Math.abs(el.currentTime - p) > 0.25) {
				try {
					el.currentTime = p;
				} catch {
					/* nada */
				}
			}
		});
		this.el = el;
	}

	/** O elemento está com a gravação `url` (e não com o silêncio de destravar). */
	usando(url: string): boolean {
		return !!url && this.pedido === url;
	}

	/**
	 * Chamar dentro do toque do aluno. O `play()` feito durante o toque libera o elemento para sempre
	 * (WebKit e Chromium registram a liberação na chamada, mesmo que o som seja trocado logo depois).
	 */
	destravar() {
		if (this.destravado) return;
		this.destravado = true;
		if (this.pedido) {
			// Já há uma gravação carregada: o próprio `tocar` que vem a seguir no toque a libera.
			return;
		}
		this.definirFonte(wavSilencio());
		this.iniciar();
	}

	private definirFonte(src: string) {
		this.geracao++;
		this.el.src = src;
	}

	private iniciar() {
		const geracao = this.geracao;
		let p: Promise<void> | undefined;
		try {
			p = this.el.play();
		} catch {
			p = undefined;
		}
		p?.catch((e: unknown) => {
			if (geracao !== this.geracao) return;
			const nome = (e as { name?: string })?.name;
			if (nome === 'AbortError' || !this.pedido) return;
			if (nome === 'NotAllowedError') {
				if (this.quer) this.aoBloquear();
				return;
			}
			// Formato ou endereço recusado (o evento 'error' pode chegar também; erro() trata uma vez só).
			this.erro();
		});
	}

	private buscar(pos: number) {
		this.posPendente = pos;
		try {
			this.el.currentTime = pos;
		} catch {
			/* aplica-se em loadedmetadata */
		}
	}

	private carregar(url: string) {
		this.pedido = url;
		this.definirFonte(this.blobDe.get(url) ?? url);
	}

	/**
	 * Toca a gravação `url` a partir de `pos` (s, no arquivo). Ao (re)começar, sempre ajusta a posição:
	 * várias cenas podem dividir o mesmo arquivo. `buscar` força o salto mesmo se já estiver tocando.
	 */
	tocar(url: string, pos: number, ritmo: number, buscar = false) {
		this.quer = true;
		if (this.pedido !== url) {
			this.carregar(url);
			buscar = true;
		}
		const limite = buscar ? 0.12 : this.el.paused ? 0.25 : Infinity;
		if (Math.abs(this.el.currentTime - pos) > limite) this.buscar(pos);
		this.el.defaultPlaybackRate = ritmo;
		if (this.el.playbackRate !== ritmo) this.el.playbackRate = ritmo;
		if (this.el.paused) this.iniciar();
	}

	/** Deixa a gravação carregando antes da hora de tocar (só depois do primeiro toque). */
	preparar(url: string, pos = 0) {
		if (!this.destravado || (this.pedido && !this.el.paused)) return;
		if (this.pedido !== url) this.carregar(url);
		if (Math.abs(this.el.currentTime - pos) > 0.25) this.buscar(pos);
	}

	pausar() {
		this.quer = false;
		// O silêncio de destravar termina sozinho: interrompê-lo poderia desfazer a liberação.
		if (this.pedido && !this.el.paused) this.el.pause();
	}

	private erro() {
		const url = this.pedido;
		if (!url || this.tratada === this.geracao) return; // silêncio de destravar, ou erro já tratado
		this.tratada = this.geracao;
		if (url.startsWith('data:') && !this.blobDe.has(url)) {
			const blob = dataParaBlob(url);
			if (blob) {
				this.blobDe.set(url, blob);
				const pos = this.posPendente ?? this.el.currentTime ?? 0;
				this.definirFonte(blob);
				this.buscar(pos);
				if (this.quer) this.iniciar();
				return;
			}
		}
		// Nenhuma forma de tocar esta gravação: silencia o elemento e avisa o player.
		this.pedido = '';
		this.quer = false;
		try {
			this.el.pause();
			this.el.removeAttribute('src');
			this.geracao++;
			this.el.load();
		} catch {
			/* nada */
		}
		this.aoFalhar(url);
	}

	encerrar() {
		this.quer = false;
		this.pedido = '';
		try {
			this.el.pause();
			this.el.removeAttribute('src');
			this.el.load();
		} catch {
			/* nada */
		}
		for (const b of this.blobDe.values()) URL.revokeObjectURL(b);
		this.blobDe.clear();
	}
}
