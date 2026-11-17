import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './markdown';

describe('renderização segura de Markdown', () => {
	it('escapa HTML bruto', () => {
		const html = renderMarkdown('Olá <script>alert(1)</script> <img src=x onerror=alert(1)>');
		expect(html).not.toContain('<script');
		expect(html).not.toContain('<img');
		expect(html).toContain('&lt;script&gt;');
	});

	it('remove links com protocolos perigosos e marca links externos', () => {
		expect(renderMarkdown('[x](javascript:alert(1))')).not.toContain('href');
		const ext = renderMarkdown('[UERJ](https://www.vestibular.uerj.br)');
		expect(ext).toContain('rel="noopener noreferrer"');
		expect(renderMarkdown('[trilha](/trilha)')).toContain('href="/trilha"');
	});

	it('renderiza listas e tabelas', () => {
		expect(renderMarkdown('- a\n- b')).toContain('<li>a</li>');
		expect(renderMarkdown('|a|b|\n|-|-|\n|1|2|')).toContain('<table>');
	});
});
