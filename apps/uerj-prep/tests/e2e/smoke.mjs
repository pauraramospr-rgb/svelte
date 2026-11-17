/**
 * Teste ponta a ponta (navegador real) contra o servidor de produção.
 * Uso: npm run build && PORT=4173 node build &  BASE_URL=http://localhost:4173 node tests/e2e/smoke.mjs
 * Requer Playwright disponível no ambiente (require('playwright')).
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const BASE = process.env.BASE_URL ?? 'http://localhost:4173';
const SHOTS = process.env.SHOTS_DIR ?? 'test-results';
mkdirSync(SHOTS, { recursive: true });

const results = [];
async function step(name, fn) {
	try {
		await fn();
		results.push(['ok', name]);
		console.log('✓', name);
	} catch (e) {
		results.push(['falha', name, e.message]);
		console.log('✗', name, '\n   ', e.message.split('\n')[0]);
	}
}
const expect = (cond, msg) => {
	if (!cond) throw new Error(msg);
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const email = `e2e-${Date.now()}@example.com`;

await step('página inicial pública', async () => {
	await page.goto(BASE + '/');
	expect((await page.textContent('h1')).includes('Exame Discursivo'), 'título ausente');
	await page.screenshot({ path: `${SHOTS}/01-home.png`, fullPage: true });
});

await step('cadastro e redirecionamento ao perfil', async () => {
	await page.goto(BASE + '/cadastro');
	await page.fill('#name', 'Estudante Teste');
	await page.fill('#email', email);
	await page.fill('#password', 'senhaforte123');
	await page.click('button:has-text("Criar conta")');
	await page.waitForURL('**/perfil**');
});

await step('escolha de curso mostra disciplinas e pesos do edital', async () => {
	await page.fill('#filtro', 'Direito');
	await page.selectOption('#course', 'direito-rio');
	const t = await page.textContent('.notice:has-text("Provas do Exame Discursivo")');
	expect(t.includes('Língua Portuguesa e Literaturas') && t.includes('peso 2'), 'pesos não exibidos');
	await page.click('button:has-text("Salvar perfil")');
	await page.waitForSelector('text=Perfil salvo');
});

await step('painel com plano do dia', async () => {
	await page.goto(BASE + '/painel');
	await page.waitForSelector('text=Plano de hoje');
	await page.screenshot({ path: `${SHOTS}/02-painel.png`, fullPage: true });
});

await step('trilha por curso e página de tópico com incidência oficial', async () => {
	await page.goto(BASE + '/trilha?d=LPL');
	await page.click('a.topic:has-text("Recursos expressivos")');
	await page.waitForSelector('text=Histórico de cobrança');
	await page.waitForSelector('text=Resumo estratégico');
	await page.screenshot({ path: `${SHOTS}/03-topico.png`, fullPage: true });
});

await step('banco: filtrar e responder questão oficial com autoavaliação', async () => {
	await page.goto(BASE + '/banco?fonte=oficial&disciplina=MAT&ano=2025');
	await page.click('ul.list li a >> nth=1');
	await page.waitForSelector('text=Sua resposta');
	await page.fill('textarea', 'Resposta de teste com o desenvolvimento do cálculo.');
	await page.click('button:has-text("Comparar com o padrão")');
	await page.waitForSelector('text=Comentário oficial da UERJ');
	await page.click('button:has-text("Parcial")');
	await page.waitForSelector('text=Registrado');
	await page.screenshot({ path: `${SHOTS}/04-questao.png`, fullPage: true });
});

await step('questão inédita é identificada como não oficial', async () => {
	await page.goto(BASE + '/banco/ined-llp-01');
	await page.waitForSelector('text=Questão inédita · não oficial');
});

await step('simulado completo: responder, salvar automaticamente e encerrar', async () => {
	await page.goto(BASE + '/simulados/novo');
	await page.selectOption('#perProva', '3');
	await page.fill('#duration', '30');
	await page.click('button:has-text("Começar simulado")');
	await page.waitForSelector('.timer');
	await page.fill('textarea#resp', 'Minha resposta para a primeira questão.');
	await page.waitForTimeout(4500);
	await page.waitForSelector('text=tudo salvo');
	page.once('dialog', (d) => d.accept());
	await page.click('button:has-text("Encerrar e corrigir")');
	await page.waitForSelector('text=Resultado estimado');
	await page.screenshot({ path: `${SHOTS}/05-simulado.png`, fullPage: true });
});

await step('laboratório de redação: critérios oficiais, histórico e escrita', async () => {
	await page.goto(BASE + '/redacao');
	await page.waitForSelector('text=O que a UERJ avalia');
	await page.waitForSelector('text=Hamlet, de William Shakespeare');
	await page.goto(BASE + '/redacao/escrever');
	await page.fill('#title', 'Título de teste');
	await page.fill('#body', 'A forma do discurso político pode seduzir eleitores e encobrir a falta de propostas. '.repeat(8));
	await page.waitForSelector('text=linhas (estimativa)');
	await page.click('button:has-text("Enviar para correção")');
	await page.waitForURL('**/redacao/*');
	await page.waitForSelector('text=Seu texto');
});

await step('biblioteca de obras (2027 e listas antigas)', async () => {
	await page.goto(BASE + '/obras');
	await page.waitForSelector('text=Luanda, Lisboa, Paraíso');
	await page.waitForSelector('text=Listas de edições anteriores');
	await page.goto(BASE + '/obras/o-bem-amado');
	await page.waitForSelector('text=Confira na leitura');
	await page.screenshot({ path: `${SHOTS}/06-obra.png`, fullPage: true });
});

await step('revisão: diagnóstico e cronograma', async () => {
	await page.goto(BASE + '/revisao');
	await page.waitForSelector('text=Cronograma personalizado');
	await page.waitForSelector('text=Diagnóstico por tópico');
	await page.screenshot({ path: `${SHOTS}/07-revisao.png`, fullPage: true });
});

await step('professor IA informa quando a chave não está configurada', async () => {
	await page.goto(BASE + '/tutor');
	await page.waitForSelector('text=Professor IA');
});

await step('layout responsivo em celular sem rolagem horizontal', async () => {
	const m = await browser.newContext({ viewport: { width: 375, height: 800 }, storageState: await ctx.storageState() });
	const p = await m.newPage();
	for (const path of ['/painel', '/banco', '/redacao', '/obras/luanda-lisboa-paraiso', '/revisao']) {
		await p.goto(BASE + path);
		const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
		expect(overflow <= 1, `${path}: rolagem horizontal de ${overflow}px`);
	}
	await p.goto(BASE + '/painel');
	await p.click('button.menu');
	await p.waitForSelector('nav.open');
	await p.screenshot({ path: `${SHOTS}/08-mobile-menu.png` });
	await m.close();
});

await step('sem erros de JavaScript nas páginas', async () => {
	expect(errors.length === 0, errors.join(' | '));
});

await browser.close();
const failed = results.filter((r) => r[0] !== 'ok');
console.log(`\n${results.length - failed.length}/${results.length} etapas ok`);
process.exit(failed.length ? 1 : 0);
