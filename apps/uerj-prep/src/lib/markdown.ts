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

export function renderMarkdown(src: string): string {
	return md.parse(src ?? '', { async: false }) as string;
}
