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

const safeJs = js[0].replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
const safeCss = css.join('\n').replace(/<\/style/gi, '<\\/style');
const title = html.match(/<title>[\s\S]*?<\/title>/)[0];

const page = [
	title,
	'<meta name="claude:viewport-fit-sides" content="cover">',
	'<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
	'<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">',
	`<style>${safeCss}</style>`,
	'<div id="app"></div>',
	`<script type="module">${safeJs}</script>`
].join('\n');

writeFileSync(join(out, 'discursiva.html'), page);
console.log(`build-web/discursiva.html: ${(page.length / 1024 / 1024).toFixed(2)} MB`);
