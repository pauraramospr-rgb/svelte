import { Marked, type Tokens } from 'marked';

/**
 * Renderização segura de Markdown (conteúdo da plataforma e respostas da IA):
 * - HTML bruto é escapado (nunca interpretado);
 * - links só com http(s) ou caminhos relativos, abertos em nova aba quando externos.
 */
function escapeHtml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const md = new Marked({
	gfm: true,
	breaks: false,
	renderer: {
		html(token: Tokens.HTML | Tokens.Tag) {
			return escapeHtml(token.text);
		},
		link(token: Tokens.Link) {
			const href = token.href ?? '';
			const text = this.parser.parseInline(token.tokens);
			const safe = /^(https?:\/\/|\/|#)/i.test(href);
			if (!safe) return text;
			const external = /^https?:\/\//i.test(href);
			return `<a href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`;
		},
		image(token: Tokens.Image) {
			return escapeHtml(token.text || '');
		}
	}
});

/** Tabelas largas rolam dentro do próprio contêiner (a página nunca rola para o lado). */
function wrapTables(html: string): string {
	return html.replace(/<table>/g, '<div class="table-wrap"><table>').replace(/<\/table>/g, '</table></div>');
}

export function renderMarkdown(src: string): string {
	return wrapTables(md.parse(src ?? '', { async: false }) as string);
}

export interface TocItem {
	level: number;
	id: string;
	text: string;
}

export function slugify(s: string): string {
	return (
		s
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '')
			.slice(0, 80) || 'secao'
	);
}

/**
 * Documento longo (apostila): mesmas regras de segurança de `renderMarkdown`, com `id` em cada
 * título e o sumário correspondente, para navegação por âncoras.
 */
export function renderDocument(src: string): { html: string; toc: TocItem[] } {
	const seen = new Map<string, number>();
	const toc: TocItem[] = [];
	const doc = new Marked({ gfm: true, breaks: false });
	doc.use({
		renderer: {
			html(token: Tokens.HTML | Tokens.Tag) {
				return escapeHtml(token.text);
			},
			link(token: Tokens.Link) {
				const href = token.href ?? '';
				const text = this.parser.parseInline(token.tokens);
				const safe = /^(https?:\/\/|\/|#)/i.test(href);
				if (!safe) return text;
				const external = /^https?:\/\//i.test(href);
				return `<a href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`;
			},
			image(token: Tokens.Image) {
				return escapeHtml(token.text || '');
			},
			heading(token: Tokens.Heading) {
				const inner = this.parser.parseInline(token.tokens);
				const plain = token.text.replace(/[*_`]/g, '').trim();
				let id = slugify(plain);
				const n = seen.get(id) ?? 0;
				seen.set(id, n + 1);
				if (n) id = `${id}-${n + 1}`;
				toc.push({ level: token.depth, id, text: plain });
				return `<h${token.depth} id="${id}">${inner}</h${token.depth}>\n`;
			}
		}
	});
	const html = wrapTables(doc.parse(src ?? '', { async: false }) as string);
	return { html, toc };
}
