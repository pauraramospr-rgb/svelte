/**
 * Testa a versão web (arquivo único) em navegador real, em dois modos:
 *  1) sem claude.ai (armazenamento local, sem IA);
 *  2) com uma simulação das capacidades do claude.ai (db, user e sample).
 * Uso: node scripts/build-web.mjs && node tests/e2e/web.mjs
 */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFileSync, mkdirSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const SHOTS = process.env.SHOTS_DIR ?? 'test-results/web';
mkdirSync(SHOTS, { recursive: true });

// Esqueleto equivalente ao que o claude.ai acrescenta na publicação
const page = readFileSync('build-web/discursiva.html', 'utf8');
const doc = `<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${page}</body></html>`;
const server = createServer((req, res) => {
	res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
	res.end(doc);
}).listen(0);
const BASE = `http://localhost:${server.address().port}/`;

const results = [];
async function step(name, fn) {
	try {
		await fn();
		results.push(['ok', name]);
		console.log('✓', name);
	} catch (e) {
		results.push(['falha', name]);
		console.log('✗', name, '\n   ', e.message.split('\n')[0]);
	}
}
const expect = (c, m) => {
	if (!c) throw new Error(m);
};

// Simulação mínima das capacidades do claude.ai
const FAKE = `
(() => {
  const store = (window.__store = window.__store || JSON.parse(sessionStorage.getItem('fakestore') || '{}'));
  const persist = () => sessionStorage.setItem('fakestore', JSON.stringify(store));
  const snap = (path) => ({ id: path.split('/').pop(), exists: path in store, data: () => store[path], metadata: { fromCache: false, hasPendingWrites: false } });
  const docRef = (path) => ({ id: path.split('/').pop(), path,
    get: async () => snap(path),
    set: async (d) => { store[path] = JSON.parse(JSON.stringify(d)); persist(); },
    update: async (d) => { store[path] = { ...store[path], ...d }; persist(); },
    delete: async () => { delete store[path]; persist(); } });
  const colRef = (path) => ({ path, doc: (id) => docRef(path + '/' + (id || Math.random().toString(36).slice(2))),
    get: async () => { const docs = Object.keys(store).filter(k => k.startsWith(path + '/') && k.split('/').length === path.split('/').length + 1).map(snap); return { docs, size: docs.length, empty: !docs.length }; } });
  const db = { doc: docRef, collection: colRef };
  const user = { id: async () => 'viewer-123', me: async () => ({ id: 'viewer-123', name: 'Ana Souza' }), isOwner: async () => true };
  window.__samples = { push: () => sessionStorage.setItem('samples', String(Number(sessionStorage.getItem('samples') || 0) + 1)) };
  const answerFor = (prompt) => {
    if (prompt.includes('identifiedThesis')) return { identifiedThesis: 'A forma do discurso seduz eleitores.', aspects: ['tema','genero','tese','argumentos','conclusao','coesao','norma','fluidez'].map((id, i) => ({ id, rating: i < 6 ? 'atende' : 'atende_parcialmente', comment: 'ok', evidence: ['A forma do discurso'] })), formal: { isProse: true, hasTitle: true, offensiveLanguage: false, identificationRisk: false, notes: '' }, problems: [{ type: 'coesao', excerpt: 'A forma', explanation: 'Repetição.', rewrite: 'Essa forma' }], strengths: ['Tese clara'], rewriteSuggestions: [], overall: 'Bom texto.', nextSteps: ['Varie conectivos.'] };
    if (prompt.includes('patternRationale')) return { statement: 'Questão inédita gerada no teste.', modelAnswer: 'Resposta-modelo do teste com detalhes suficientes.', explanation: 'Explicação do teste.', skills: ['explicar'], knowledge: ['isomeria'], patternRationale: 'Segue o padrão.', commonMistakes: [] };
    return { credit: 'parcial', summary: 'Acertou parte.', correctPoints: ['ponto certo'], conceptualErrors: [], missingElements: ['faltou justificar'], improvedAnswer: 'Resposta melhorada.', studyTips: ['revise'], confidence: 'alta' };
  };
  const sample = async (input, opts = {}) => {
    window.__samples.push(input);
    const text = 'Olá! Vamos estudar juntos. Qual parte do conteúdo gera dúvida?';
    for (const w of text.match(/.{1,12}/g)) { await new Promise(r => setTimeout(r, 10)); opts.onText?.({ text, delta: w }); }
    return { text, truncated: false, modelTierApplied: 'default' };
  };
  sample.json = async (input) => { window.__samples.push(input); return answerFor(String(input)); };
  window.claude = { use: async (name) => ({ db, user, sample }[name] ?? null) };
})();`;

const browser = await chromium.launch();
const errors = [];

async function flow(label, ctx, withAi) {
	const p = await ctx.newPage();
	p.on('pageerror', (e) => errors.push(`${label}: ${e.message}`));
	await step(`${label}: inicia e abre o painel`, async () => {
		await p.goto(BASE);
		await p.waitForSelector('text=Plano de hoje', { timeout: 20000 });
	});
	await step(`${label}: perfil — curso e pesos do edital`, async () => {
		await p.click('nav a:has-text("Painel")');
		await p.click('.me a');
		await p.waitForSelector('#course');
		await p.selectOption('#course', 'medicina-rio');
		await p.waitForSelector('.notice:has-text("Provas do Exame Discursivo")');
		await p.click('button:has-text("Salvar perfil")');
		await p.waitForSelector('text=Perfil salvo');
	});
	await step(`${label}: trilha e tópico com histórico oficial`, async () => {
		await p.click('nav a:has-text("Minha trilha")');
		await p.waitForSelector('text=Medicina (RIO)');
		await p.click('a.topic:has-text("Hereditariedade")');
		await p.waitForSelector('text=Histórico de cobrança');
		await p.waitForSelector('text=Resumo estratégico');
	});
	await step(`${label}: banco — filtro GET e paginação`, async () => {
		await p.click('nav a:has-text("Banco de questões")');
		await p.selectOption('#fonte', 'oficial');
		await p.selectOption('#disciplina', 'QUI');
		await p.waitForSelector('#topico:not([disabled])');
		await p.click('button:has-text("Filtrar")');
		await p.waitForSelector('text=questões encontradas');
		const t = await p.textContent('ul.list');
		expect(t.includes('UERJ'), 'lista sem questões oficiais');
	});
	await step(`${label}: responder questão (${withAi ? 'correção por IA' : 'autoavaliação'})`, async () => {
		await p.click('ul.list li a >> nth=0');
		await p.waitForSelector('text=Sua resposta');
		await p.fill('textarea', 'Minha resposta de teste com justificativa.');
		if (withAi) {
			await p.click('button:has-text("Corrigir com o professor IA")');
			await p.waitForSelector('text=Pontuação parcial');
		} else {
			await p.click('button:has-text("Comparar com o padrão")');
			await p.waitForSelector('text=Comentário oficial da UERJ');
			await p.click('button:has-text("Parcial")');
			await p.waitForSelector('text=Registrado');
		}
	});
	await step(`${label}: simulado — salvar, encerrar com confirmação na página`, async () => {
		await p.click('nav a:has-text("Simulados")');
		await p.click('a:has-text("Novo simulado")');
		await p.selectOption('#perProva', '3');
		await p.click('button:has-text("Começar simulado")');
		await p.waitForSelector('.timer');
		await p.fill('textarea#resp', 'Resposta da primeira questão.');
		await p.waitForSelector('text=tudo salvo', { timeout: 15000 });
		await p.click('button:has-text("Encerrar e corrigir")');
		await p.click('button:has-text("Sim, encerrar")');
		await p.waitForSelector('text=Resultado estimado');
	});
	await step(`${label}: redação — escrever e ${withAi ? 'corrigir com IA' : 'abrir'}`, async () => {
		await p.click('nav a:has-text("Laboratório de redação")');
		await p.click('a:has-text("Escrever redação")');
		await p.fill('#title', 'Título');
		await p.fill('#body', 'A forma do discurso político pode seduzir eleitores e encobrir a falta de propostas concretas. '.repeat(7));
		await p.click('button:has-text("Enviar para correção")');
		await p.waitForSelector('text=Seu texto');
		if (withAi) await p.waitForSelector('text=Nota estimada', { timeout: 15000 });
	});
	if (withAi) {
		await step(`${label}: gerar questão inédita`, async () => {
			await p.click('nav a:has-text("Minha trilha")');
			await p.click('a[href="?d=QUI"]');
			await p.click('a.topic:has-text("Isomeria")');
			await p.click('button:has-text("Gerar questão inédita")');
			await p.waitForSelector('text=Questão inédita gerada no teste.');
		});
		await step(`${label}: professor IA responde em streaming`, async () => {
			await p.click('nav a:has-text("Professor IA")');
			await p.fill('#msg', 'Me explique isomeria óptica.');
			await p.click('button:has-text("Enviar")');
			await p.waitForSelector('.msg.assistant:has-text("Vamos estudar juntos")');
		});
	}
	await step(`${label}: revisão, obras e fontes`, async () => {
		await p.click('nav a:has-text("Revisão e evolução")');
		await p.waitForSelector('text=Cronograma personalizado');
		await p.click('nav a:has-text("Obras literárias")');
		await p.click('a:has-text("Análise completa") >> nth=0');
		await p.waitForSelector('text=Confira na leitura');
		await p.click('a[href="#personagens"]');
		await p.click('nav a:has-text("Fontes e metodologia")');
		await p.waitForSelector('text=Documentos oficiais utilizados');
		await p.screenshot({ path: `${SHOTS}/${label}-fontes.png` });
	});
	await step(`${label}: guia, temas em evidência e mapa mental`, async () => {
		await p.click('nav a:has-text("Como responder à UERJ")');
		await p.waitForSelector('text=Passo a passo na hora da prova');
		await p.click('nav a:has-text("Temas em evidência")');
		await p.waitForSelector('text=250 anos da Independência dos Estados Unidos');
		await p.click('a:has-text("Estado e industrialização na América Latina") >> nth=0');
		await p.waitForSelector('text=O fio da história');
		await p.click('button:has-text("Mapa mental")');
		await p.waitForSelector('.mm .branch');
		await p.waitForSelector('.mm .timeline li');
		await p.screenshot({ path: `${SHOTS}/${label}-mapa.png` });
	});
	await step(`${label}: estúdio de aulas e apostila completa`, async () => {
		await p.click('nav a:has-text("Estúdio de aulas")');
		await p.click('a:has-text("Abrir roteiro") >> nth=0');
		await p.waitForSelector('.cena');
		const n = await p.locator('.cena').count();
		expect(n >= 40, `cenas: ${n}`);
		await p.click('button[role="tab"]:has-text("Conferência de consistência")');
		await p.waitForSelector('text=Verificações finais');
		await p.click('a:has-text("Apostila completa (base do roteiro)")');
		await p.waitForSelector('.toc a');
		await p.waitForSelector('#mapa-mental');
		await p.screenshot({ path: `${SHOTS}/${label}-apostila.png` });
	});
	await step(`${label}: dados persistem após recarregar`, async () => {
		await p.evaluate(() => new Promise((r) => { document.dispatchEvent(new Event('visibilitychange')); setTimeout(r, 2500); }));
		await p.goto(BASE + '#revisao');
		await p.reload();
		await p.waitForSelector('text=Diagnóstico por tópico', { timeout: 20000 });
		const t = await p.textContent('main');
		expect(t.includes('Hereditariedade') || t.includes('corrigidas'), 'progresso não foi restaurado');
		await p.goto(BASE + '#perfil');
		await p.reload();
		await p.waitForSelector('#course');
		expect((await p.inputValue('#course')) === 'medicina-rio', 'curso não restaurado');
	});
	await step(`${label}: celular sem rolagem horizontal`, async () => {
		await p.setViewportSize({ width: 390, height: 800 });
		for (const name of ['painel', 'banco', 'redacao', 'revisao', 'estudio']) {
			await p.goto(BASE + '#' + name);
			await p.reload();
			await p.waitForSelector('main', { timeout: 20000 });
			await p.waitForTimeout(300);
			const o = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
			expect(o <= 1, `${name}: ${o}px de rolagem horizontal`);
		}
		await p.screenshot({ path: `${SHOTS}/${label}-mobile.png`, fullPage: false });
	});
	return p;
}

// 1) Sem claude.ai
const local = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await flow('local', local, false);

// 2) Com capacidades simuladas
const cloud = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await cloud.addInitScript(FAKE);
const cp = await flow('claude', cloud, true);
await step('claude: banco salvo na área privada do estudante', async () => {
	const keys = await cp.evaluate(() => Object.keys(window.__store));
	expect(keys.includes('data/users/viewer-123/banco'), 'manifesto ausente: ' + keys.join(', '));
	expect(keys.some((k) => /^data\/users\/viewer-123\/banco-[ab]-0$/.test(k)), 'partes ausentes');
	expect(keys.every((k) => k.startsWith('data/users/viewer-123/')), 'dado fora da área privada');
	const prompts = await cp.evaluate(() => Number(sessionStorage.getItem('samples') || 0));
	expect(prompts >= 4, 'IA não foi chamada');
});
await step('sem erros de JavaScript', async () => expect(errors.length === 0, errors.slice(0, 3).join(' | ')));

await browser.close();
server.close();
const failed = results.filter((r) => r[0] !== 'ok').length;
console.log(`\n${results.length - failed}/${results.length} etapas ok`);
process.exit(failed ? 1 : 0);
