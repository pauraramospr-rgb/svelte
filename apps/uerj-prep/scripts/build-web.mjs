/**
 * Gera um único arquivo HTML (CSS e JS embutidos) pronto para publicar como página no claude.ai.
 * A página é publicada sem <!doctype>/<html>/<head>/<body>: a plataforma acrescenta o esqueleto.
 * Uso: node scripts/build-web.mjs  →  build-web/discursiva.html
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

execSync('npx vite build --config vite.web.config.ts', { stdio: 'inherit' });

const out = 'build-web';
const html = readFileSync(join(out, 'index.html'), 'utf8');
const assets = readdirSync(join(out, 'assets'));
const js = assets.filter((f) => f.endsWith('.js')).map((f) => readFileSync(join(out, 'assets', f), 'utf8'));
const css = assets.filter((f) => f.endsWith('.css')).map((f) => readFileSync(join(out, 'assets', f), 'utf8'));
if (js.length !== 1) throw new Error(`esperado 1 arquivo JS, encontrados ${js.length}`);

// O JS vai embutido na página, então import.meta.url passa a ser o endereço da própria página, e não o de
// assets/index-*.js. Os MP3 que ficam fora do HTML (voz gratuita) continuam em assets/, publicados ao lado
// da página, assim como os recortes dos cadernos de prova (WEBP): os endereços relativos ganham o prefixo assets/.
const externos = new Set(assets.filter((f) => /\.(mp3|webp)$/.test(f)));
const usados = new Set();
const jsPagina = js[0].replace(/new URL\("([^"/]+\.(?:mp3|webp))",\s*import\.meta\.url\)/g, (_, f) => {
	if (!externos.has(f)) throw new Error(`arquivo referenciado sem cópia em assets/: ${f}`);
	usados.add(f);
	return `new URL("assets/${f}",import.meta.url)`;
});
const soltos = [...externos].filter((f) => !usados.has(f));
if (soltos.length) throw new Error(`arquivos em assets/ que a página não usa: ${soltos.slice(0, 3).join(', ')}`);

const safeJs = jsPagina.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
const safeCss = css.join('\n').replace(/<\/style/gi, '<\\/style');
const brand = readFileSync(new URL('../src/lib/brand.ts', import.meta.url), 'utf8');
const appName = brand.match(/APP_NAME = '([^']+)'/)[1];
const title = `<title>${appName}</title>`;

const page = [
	title,
	'<meta name="claude:viewport-fit-sides" content="cover">',
	'<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
	'<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap">',
	`<style>${safeCss}</style>`,
	'<div id="app"></div>',
	`<script type="module">${safeJs}</script>`
].join('\n');

writeFileSync(join(out, 'discursiva.html'), page);
console.log(`build-web/discursiva.html: ${(page.length / 1024 / 1024).toFixed(2)} MB; ${usados.size} arquivos (MP3 e recortes de caderno) em build-web/assets/`);
