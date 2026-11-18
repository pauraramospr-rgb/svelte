/**
 * Conteúdo pedagógico escrito pela plataforma (resumos em Markdown com front matter simples).
 * Categoria: interpretação pedagógica. Cada arquivo declara referências e data de revisão.
 */
const files = import.meta.glob('./data/content/resumos/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export interface Resumo {
	topicId: string;
	title: string;
	discipline: string;
	level: string;
	reviewed: string;
	references: string[];
	body: string;
}

function parse(path: string, raw: string): Resumo {
	const topicId = path.split('/').pop()!.replace(/\.md$/, '');
	const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	const meta: Record<string, string> = {};
	const refs: string[] = [];
	let body = raw;
	if (m) {
		body = m[2];
		for (const line of m[1].split('\n')) {
			const r = line.match(/^-\s+(.*)$/);
			if (r) {
				refs.push(r[1].trim());
				continue;
			}
			const kv = line.match(/^(\w+):\s*(.*)$/);
			if (kv) meta[kv[1]] = kv[2].trim();
		}
	}
	return {
		topicId,
		title: meta.title ?? topicId,
		discipline: meta.discipline ?? topicId.split('-')[0].toUpperCase(),
		level: meta.level ?? 'do básico ao avançado',
		reviewed: meta.reviewed ?? '',
		references: refs,
		body: body.trim()
	};
}

export const RESUMOS: Resumo[] = Object.entries(files)
	.map(([p, raw]) => parse(p, raw))
	.sort((a, b) => a.discipline.localeCompare(b.discipline) || a.title.localeCompare(b.title, 'pt-BR'));

export function getResumo(topicId: string): Resumo | undefined {
	return RESUMOS.find((r) => r.topicId === topicId);
}
