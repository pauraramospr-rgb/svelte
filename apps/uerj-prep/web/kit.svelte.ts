/**
 * Emulador mínimo do SvelteKit no navegador: executa os MESMOS arquivos de rota do servidor
 * (+page.server.ts, +layout.server.ts, +server.ts) e renderiza os mesmos +page.svelte.
 * Navegação interna (links "/…" e "?…"), formulários (GET e POST com actions), fetch para
 * "/api/…" e o estado `page` de '$app/state' são resolvidos aqui.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Component } from 'svelte';
import { nav } from './shims/app-state.svelte';
import { ActionFailure, HttpError, Redirect } from './shims/kit';
import { getUser } from './shims/auth';

const ORIGIN = 'https://discursiva.app';

const pages = import.meta.glob('../src/routes/**/+page.svelte', { eager: true, import: 'default' }) as Record<string, Component<any>>;
const servers = import.meta.glob(['../src/routes/**/+page.server.ts', '!../src/routes/entrar/**', '!../src/routes/cadastro/**', '!../src/routes/sair/**'], {
	eager: true
}) as Record<string, { load?: (e: any) => any; actions?: Record<string, (e: any) => any> }>;
const layoutServer = import.meta.glob('../src/routes/+layout.server.ts', { eager: true }) as Record<string, { load: (e: any) => any }>;
const apis = import.meta.glob('../src/routes/api/**/+server.ts', { eager: true }) as Record<string, Record<string, (e: any) => Promise<Response>>>;

interface RouteDef {
	id: string;
	regex: RegExp;
	keys: string[];
	score: number;
	file: string;
}

function routeOf(file: string, suffix: string): RouteDef {
	const id = file.replace('../src/routes', '').replace(suffix, '') || '/';
	const segs = id.split('/').filter(Boolean);
	const keys: string[] = [];
	const pattern = segs
		.map((s) => {
			const m = s.match(/^\[(\w+)\]$/);
			if (m) {
				keys.push(m[1]);
				return '/([^/]+)';
			}
			return '/' + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		})
		.join('');
	return { id, regex: new RegExp(`^${pattern || '/'}/?$`), keys, score: segs.filter((s) => !s.startsWith('[')).length * 10 + segs.length, file };
}

const EXCLUDED = /\/(entrar|cadastro|sair)\//;
const pageRoutes = Object.keys(pages)
	.filter((f) => !EXCLUDED.test(f))
	.map((f) => routeOf(f, '/+page.svelte'))
	.sort((a, b) => b.score - a.score);
const apiRoutes = Object.keys(apis)
	.map((f) => routeOf(f, '/+server.ts'))
	.sort((a, b) => b.score - a.score);

function match(list: RouteDef[], pathname: string): { route: RouteDef; params: Record<string, string> } | null {
	for (const route of list) {
		const m = pathname.match(route.regex);
		if (m) return { route, params: Object.fromEntries(route.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])) };
	}
	return null;
}

export type ActionResult =
	| { type: 'success'; status: number; data?: any }
	| { type: 'failure'; status: number; data?: any }
	| { type: 'redirect'; status: number; location: string }
	| { type: 'error'; status: number; error: { message: string } };

export const view = $state({
	component: null as Component<any> | null,
	data: {} as Record<string, any>,
	form: null as any,
	layoutData: {} as Record<string, any>,
	error: null as { status: number; message: string } | null,
	key: 0
});

let userId = 0;
export function setCurrentUser(id: number) {
	userId = id;
}

function locals() {
	return { user: getUser(userId) ?? null };
}

function event(url: URL, params: Record<string, string>, extra: Record<string, unknown> = {}) {
	return {
		url,
		params,
		locals: locals(),
		route: { id: null },
		cookies: { get: () => undefined, set: () => {}, delete: () => {} },
		setHeaders: () => {},
		depends: () => {},
		parent: async () => ({}),
		...extra
	};
}

let navCounter = 0;

/** Executa os loads (layout + página) para a URL e atualiza a tela. */
async function render(url: URL, opts: { keepForm?: boolean; newKey?: boolean } = {}): Promise<void> {
	const m = match(pageRoutes, url.pathname);
	nav.url = url;
	nav.params = m?.params ?? {};
	try {
		const layout = Object.values(layoutServer)[0];
		const layoutData = layout ? await layout.load(event(url, nav.params)) : {};
		if (!m) throw new HttpError(404, { message: 'Página não encontrada.' });
		const serverFile = m.route.file.replace('+page.svelte', '+page.server.ts');
		const mod = servers[serverFile];
		const pageData = mod?.load ? ((await mod.load(event(url, m.params))) ?? {}) : {};
		view.layoutData = layoutData;
		view.data = { ...layoutData, ...pageData };
		view.component = pages[m.route.file];
		view.error = null;
		if (!opts.keepForm) {
			view.form = null;
			nav.form = null;
		}
		if (opts.newKey) view.key = ++navCounter;
	} catch (e) {
		if (e instanceof Redirect) return navigate(e.location, { replace: true });
		if (e instanceof HttpError) {
			view.error = { status: e.status, message: e.body.message };
			view.key = ++navCounter;
			return;
		}
		console.error(e);
		view.error = { status: 500, message: 'Erro inesperado ao abrir esta página.' };
		view.key = ++navCounter;
	}
}

function toUrl(href: string): URL {
	return new URL(href, nav.url.href.startsWith(ORIGIN) ? nav.url : new URL('/painel', ORIGIN));
}

function section(url: URL): string {
	return url.pathname.split('/').filter(Boolean)[0] ?? 'painel';
}

export async function navigate(href: string, opts: { replace?: boolean; noScroll?: boolean; push?: boolean } = {}): Promise<void> {
	const url = toUrl(href);
	await render(url, { newKey: true });
	if (opts.push !== false) {
		try {
			const state = { href: url.pathname + url.search };
			if (opts.replace) history.replaceState(state, '', '#' + section(url));
			else history.pushState(state, '', '#' + section(url));
		} catch {
			/* histórico indisponível no quadro do artifact */
		}
	}
	if (!opts.noScroll) window.scrollTo(0, 0);
}

/** Equivalente a invalidateAll(): roda os loads de novo sem trocar de página. */
export function reload(opts: { keepForm?: boolean } = { keepForm: true }): Promise<void> {
	return render(nav.url, opts);
}

export async function submitForm(form: HTMLFormElement, formData: FormData, submitter?: HTMLElement | null): Promise<ActionResult> {
	const attr = submitter?.getAttribute('formaction') ?? form.getAttribute('action') ?? '';
	const url = attr ? toUrl(attr) : new URL(nav.url.href);
	const name = url.search.startsWith('?/') ? url.search.slice(2) : 'default';
	const m = match(pageRoutes, url.pathname);
	const mod = m ? servers[m.route.file.replace('+page.svelte', '+page.server.ts')] : undefined;
	const fn = mod?.actions?.[name];
	if (!m || !fn) return { type: 'error', status: 404, error: { message: 'Ação não encontrada.' } };
	const request = new Request(new URL(url.pathname, ORIGIN).href, { method: 'POST', body: formData });
	try {
		const out = await fn(event(url, m.params, { request }));
		if (out instanceof ActionFailure) return { type: 'failure', status: out.status, data: out.data };
		return { type: 'success', status: 200, data: out ?? undefined };
	} catch (e) {
		if (e instanceof Redirect) return { type: 'redirect', status: e.status, location: e.location };
		if (e instanceof HttpError) return { type: 'error', status: e.status, error: e.body };
		console.error(e);
		return { type: 'error', status: 500, error: { message: 'Erro inesperado ao enviar o formulário.' } };
	}
}

export async function applyActionResult(result: ActionResult): Promise<void> {
	if (result.type === 'redirect') return navigate(result.location);
	if (result.type === 'error') {
		view.error = { status: result.status, message: result.error.message };
		return;
	}
	view.form = result.data ?? null;
	nav.form = view.form;
	await reload({ keepForm: true });
}

/** fetch('/api/…') é atendido pelos mesmos handlers +server.ts, aqui no navegador. */
async function handleApi(url: URL, init?: RequestInit): Promise<Response> {
	const m = match(apiRoutes, url.pathname);
	const method = (init?.method ?? 'GET').toUpperCase();
	const handler = m ? apis[m.route.file]?.[method] : undefined;
	if (!m || !handler) return new Response(JSON.stringify({ error: 'Rota não encontrada.' }), { status: 404, headers: { 'content-type': 'application/json' } });
	const request = new Request(url.href, init);
	try {
		return await handler(event(url, m.params, { request }));
	} catch (e) {
		if (e instanceof HttpError) return new Response(JSON.stringify({ error: e.body.message }), { status: e.status, headers: { 'content-type': 'application/json' } });
		console.error(e);
		return new Response(JSON.stringify({ error: 'Erro inesperado.' }), { status: 500, headers: { 'content-type': 'application/json' } });
	}
}

export function installGlobalHandlers(): void {
	const realFetch = globalThis.fetch.bind(globalThis);
	globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
		const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
		if (raw.startsWith('/api/') || raw.startsWith(ORIGIN + '/api/')) return handleApi(new URL(raw, ORIGIN), init);
		return realFetch(input as RequestInfo, init);
	};

	document.addEventListener('click', (e) => {
		if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
		const a = (e.target as Element | null)?.closest?.('a');
		if (!a) return;
		const href = a.getAttribute('href');
		if (!href || a.target === '_blank' || a.hasAttribute('download')) return;
		if (href.startsWith('#')) {
			// âncoras dentro da página
			e.preventDefault();
			document.getElementById(decodeURIComponent(href.slice(1)))?.scrollIntoView({ behavior: 'smooth' });
			return;
		}
		if (href.startsWith('/') && !href.startsWith('//')) {
			e.preventDefault();
			const [path, hash] = href.split('#');
			navigate(path).then(() => hash && document.getElementById(hash)?.scrollIntoView());
		} else if (href.startsWith('?')) {
			e.preventDefault();
			navigate(nav.url.pathname + href);
		}
	});

	document.addEventListener('submit', async (e) => {
		if (e.defaultPrevented) return;
		const form = e.target as HTMLFormElement;
		e.preventDefault();
		const submitter = (e as SubmitEvent).submitter as HTMLElement | null;
		const formData = new FormData(form, submitter ?? undefined);
		if ((form.getAttribute('method') ?? 'GET').toUpperCase() === 'GET') {
			const target = toUrl(form.getAttribute('action') || nav.url.pathname);
			const qs = new URLSearchParams();
			for (const [k, v] of formData) if (typeof v === 'string') qs.append(k, v);
			return navigate(target.pathname + (qs.toString() ? '?' + qs : ''));
		}
		const result = await submitForm(form, formData, submitter);
		await applyActionResult(result);
	});

	window.addEventListener('popstate', (e) => {
		const href = (e.state as { href?: string } | null)?.href;
		if (href) navigate(href, { push: false });
	});
}

export function initialPath(): string {
	const name = location.hash.replace(/^#/, '');
	if (name && /^[a-z0-9-]+$/.test(name) && match(pageRoutes, '/' + name)) return '/' + name;
	return '/painel';
}
