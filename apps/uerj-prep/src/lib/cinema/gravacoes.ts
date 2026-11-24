/**
 * Narração gravada: a voz do ElevenLabs escolhida pelo dono do projeto, tocada como arquivo de áudio.
 * Funciona em qualquer aparelho, inclusive no iPhone e no iPad com o modo silencioso ligado e no app do
 * Android, onde a voz sintetizada do navegador falha ou não existe.
 *
 * Cada cena gravada tem um MP3 em `src/lib/data/narracao/<aula>/<cena>.mp3` e uma entrada no
 * `manifesto.json` com o instante em que cada frase começa. A impressão digital do texto garante que
 * a gravação corresponde à narração atual: se o roteiro mudar, a cena volta para a voz sintetizada até
 * ser regravada (os testes avisam). Como gravar: `src/lib/data/narracao/LEIAME.md`.
 */
import manifesto from '../data/narracao/manifesto.json';
import { cronograma, frases, type Cronograma } from './tempo';

export interface EntradaGravacao {
	aula: string;
	cena: string;
	/** Impressão digital do texto falado (ver `impressao`). */
	hash: string;
	/** Caminho dentro de `src/lib/data/narracao/`. */
	arquivo: string;
	/** Duração do arquivo, em segundos. */
	dur: number;
	/** Instante (s) em que cada frase começa no áudio. */
	marcas: number[];
	/** Fim da fala (s): depois disso só há silêncio. */
	fim: number;
	/** Nome da voz, para exibir. */
	voz: string;
}

export type Gravacao = Omit<EntradaGravacao, 'aula' | 'cena' | 'hash'>;

/** Atraso entre o começo da cena e o começo do áudio: a cena “respira” antes da voz. */
export const ENTRADA_AUDIO = 0.6;
/** Pausa depois da última frase antes de passar para a próxima cena. */
export const RESPIRO_GRAVADO = 1.1;

/** Impressão digital (FNV-1a de 32 bits) do texto falado, frase a frase. */
export function impressao(narracao: string): string {
	const texto = frases(narracao).join('\n');
	let h = 0x811c9dc5;
	for (let i = 0; i < texto.length; i++) {
		h ^= texto.charCodeAt(i);
		h = Math.imul(h, 0x01000193) >>> 0;
	}
	return h.toString(16).padStart(8, '0');
}

/** Texto enviado ao ElevenLabs: as frases da cena, na ordem, sem marcas de destaque. */
export function textoParaGravar(narracao: string): string {
	return frases(narracao).join(' ');
}

export const ENTRADAS = manifesto as EntradaGravacao[];

/** A gravação vale para este texto? (mesma impressão digital e mesmo número de frases) */
export function gravacaoValida(e: EntradaGravacao | undefined, narracao: string): Gravacao | undefined {
	if (!e || !narracao) return undefined;
	if (e.hash !== impressao(narracao) || e.marcas.length !== frases(narracao).length) return undefined;
	return { arquivo: e.arquivo, dur: e.dur, marcas: e.marcas, fim: e.fim, voz: e.voz };
}

/** Gravação válida da cena, se houver. */
export function gravacaoDe(aula: string, cena: string, narracao: string): Gravacao | undefined {
	return gravacaoValida(
		ENTRADAS.find((x) => x.aula === aula && x.cena === cena),
		narracao
	);
}

/** Duração da cena: pela gravação, quando houver; senão, pela estimativa da voz sintetizada. */
export function duracaoDaCena(aula: string, cena: { id: string; narracao: string }): number {
	const g = gravacaoDe(aula, cena.id, cena.narracao);
	return g ? cronogramaGravado(cena.narracao, g).total : cronograma(cena.narracao).total;
}

/** Linha do tempo da cena pelo áudio gravado: cada frase começa quando a voz a começa. */
export function cronogramaGravado(narracao: string, g: Gravacao): Cronograma {
	const fs = frases(narracao);
	const inicios = g.marcas.map((m) => ENTRADA_AUDIO + m);
	const fimFala = ENTRADA_AUDIO + g.fim;
	const duracoes = inicios.map((ini, i) => Math.max(0.2, (i + 1 < inicios.length ? inicios[i + 1] : fimFala) - ini));
	const total = ENTRADA_AUDIO + Math.max(g.dur + 0.3, g.fim + RESPIRO_GRAVADO);
	return { frases: fs, inicios, duracoes, total };
}
