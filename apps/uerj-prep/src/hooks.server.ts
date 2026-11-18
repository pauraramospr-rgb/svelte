import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE, validateSession } from '$lib/server/auth';

/** Rotas acessíveis sem login. */
const PUBLIC = [/^\/$/, /^\/entrar/, /^\/cadastro/, /^\/fontes/, /^\/sobre/, /^\/obras/, /^\/guia/, /^\/em-evidencia/, /^\/favicon/];

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = validateSession(event.cookies.get(SESSION_COOKIE));
	const path = event.url.pathname;
	if (!event.locals.user && !PUBLIC.some((r) => r.test(path))) {
		if (path.startsWith('/api/')) {
			return new Response(JSON.stringify({ error: 'Faça login para continuar.' }), {
				status: 401,
				headers: { 'content-type': 'application/json' }
			});
		}
		redirect(303, `/entrar?voltar=${encodeURIComponent(path + event.url.search)}`);
	}
	const response = await resolve(event);
	response.headers.set('x-content-type-options', 'nosniff');
	response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
	response.headers.set('x-frame-options', 'DENY');
	return response;
};
