/**
 * Utilidades de texto para a Redação.
 * A contagem de linhas é uma ESTIMATIVA: a folha oficial é manuscrita e a largura da linha não
 * é publicada. A plataforma usa ~65 caracteres por linha manuscrita como aproximação didática.
 */
export const CHARS_PER_LINE = 65;

export function estimateLines(text: string): number {
	const paragraphs = text
		.replace(/\r/g, '')
		.split('\n')
		.map((p) => p.trim())
		.filter(Boolean);
	return paragraphs.reduce((sum, p) => sum + Math.max(1, Math.ceil(p.length / CHARS_PER_LINE)), 0);
}

export function wordCount(text: string): number {
	return (text.trim().match(/\S+/g) ?? []).length;
}

export function slugify(s: string): string {
	return s
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}
