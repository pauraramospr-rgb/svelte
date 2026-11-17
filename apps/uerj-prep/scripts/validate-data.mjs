/**
 * Valida as referências oficiais usadas pela plataforma: todos os links para documentos da UERJ
 * (editais, anexos, provas, padrões, questões comentadas) devem responder com sucesso.
 * Uso: npm run data:validate   (requer acesso de rede a www.vestibular.uerj.br e www.revista.vestibular.uerj.br)
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../src/lib/data/', import.meta.url).pathname;
const files = [];
(function walk(d) {
	for (const f of readdirSync(d)) {
		const p = join(d, f);
		if (statSync(p).isDirectory()) walk(p);
		else if (/\.(ts|json|md)$/.test(f) && !f.includes('.test.')) files.push(p);
	}
})(ROOT);

const urls = new Set();
for (const f of files) {
	for (const m of readFileSync(f, 'utf8').matchAll(/https?:\/\/(?:www\.)?(?:revista\.)?vestibular\.uerj\.br\/[^\s"'`)#]+/g)) urls.add(m[0]);
}
console.log(`${urls.size} URLs oficiais encontradas em ${files.length} arquivos de dados`);

const failures = [];
const list = [...urls];
const CONC = 6;
let i = 0;
async function worker() {
	while (i < list.length) {
		const url = list[i++];
		try {
			let res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
			if (res.status === 405 || res.status === 403) res = await fetch(url, { method: 'GET', redirect: 'follow' });
			if (!res.ok) failures.push([url, res.status]);
		} catch (e) {
			failures.push([url, e.cause?.code ?? e.message]);
		}
	}
}
await Promise.all(Array.from({ length: CONC }, worker));
for (const [u, s] of failures) console.log('✗', s, u);
console.log(failures.length ? `${failures.length} referência(s) com problema` : 'Todas as referências oficiais responderam com sucesso.');
process.exit(failures.length ? 1 : 0);
