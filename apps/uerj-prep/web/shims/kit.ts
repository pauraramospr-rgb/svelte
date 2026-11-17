/** Substituto de '@sveltejs/kit' para a versão que roda no navegador. */
export class HttpError {
	constructor(
		public status: number,
		public body: { message: string }
	) {}
}
export class Redirect {
	constructor(
		public status: number,
		public location: string
	) {}
}
export class ActionFailure<T = Record<string, unknown>> {
	readonly type = 'failure';
	constructor(
		public status: number,
		public data: T
	) {}
}

export function error(status: number, message: string | { message: string }): never {
	throw new HttpError(status, typeof message === 'string' ? { message } : message);
}

export function redirect(status: number, location: string | URL): never {
	throw new Redirect(status, String(location));
}

export function fail<T extends Record<string, unknown>>(status: number, data?: T): ActionFailure<T> {
	return new ActionFailure(status, (data ?? {}) as T);
}

export function json(data: unknown, init?: ResponseInit): Response {
	const headers = new Headers(init?.headers);
	if (!headers.has('content-type')) headers.set('content-type', 'application/json');
	return new Response(JSON.stringify(data), { ...init, headers });
}

export function isRedirect(e: unknown): e is Redirect {
	return e instanceof Redirect;
}
export function isHttpError(e: unknown): e is HttpError {
	return e instanceof HttpError;
}

// Tipos usados apenas em anotações (apagados na compilação).
export type Handle = unknown;
export type Cookies = unknown;
export type Actions = unknown;
