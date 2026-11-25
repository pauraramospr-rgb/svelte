/**
 * Reprodução dos cadernos de prova oficiais da UERJ (Exame Discursivo): para cada questão, o bloco impresso
 * (imagem, legenda, texto, tabela e enunciado, sem a área de resposta) e, quando a questão depende dele,
 * o texto-base do caderno, com a numeração de linhas original. Recortes feitos por
 * scripts/caderno/recortar.py a partir dos PDFs dos cadernos (ver caderno/LEIAME.md).
 */
import mapa from './caderno/mapa.json';
import { DISCIPLINES, type DisciplineCode } from './exam-2027';

const URLS = import.meta.glob('./caderno/*.webp', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

export interface PaginaCaderno {
	src: string;
	tipo: 'questao' | 'texto';
	alt: string;
}

const MAPA = mapa as Record<string, string[]>;

/** Recortes do caderno oficial para a questão, na ordem em que devem ser lidos (texto-base antes). */
export function cadernoDaQuestao(id: string): PaginaCaderno[] {
	const arquivos = MAPA[id];
	if (!arquivos) return [];
	const [ano, disc, num] = id.split('-');
	const nome = DISCIPLINES[disc as DisciplineCode]?.name ?? disc;
	return arquivos.flatMap((arq) => {
		const src = URLS[`./caderno/${arq}`];
		if (!src) return [];
		const pagina = /texto-p(\d+)/.exec(arq)?.[1];
		return [
			pagina
				? { src, tipo: 'texto' as const, alt: `Texto-base da prova de ${nome} da UERJ ${ano}, página ${pagina} do caderno oficial` }
				: { src, tipo: 'questao' as const, alt: `Questão ${num} da prova de ${nome} da UERJ ${ano}, como impressa no caderno oficial` }
		];
	});
}

export const QUESTOES_COM_CADERNO = Object.keys(MAPA);
