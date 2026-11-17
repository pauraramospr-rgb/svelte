/**
 * Acesso às capacidades do claude.ai (`window.claude.use`). Fora do claude.ai (arquivo aberto
 * localmente, testes), tudo resolve `null` e a plataforma usa o armazenamento do navegador.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Capabilities {
	db: any | null;
	user: any | null;
	sample: any | null;
}

export const caps: Capabilities = { db: null, user: null, sample: null };

function use(name: string, timeoutMs: number): Promise<any | null> {
	const claude = (globalThis as any).claude;
	if (!claude?.use) return Promise.resolve(null);
	return Promise.race([
		Promise.resolve(claude.use(name)).catch(() => null),
		new Promise((r) => setTimeout(() => r(null), timeoutMs))
	]);
}

/** Resolve db e user antes de abrir os dados; sample pode chegar depois (callback). */
export async function initCapabilities(onSample: () => void): Promise<Capabilities> {
	const [db, user] = await Promise.all([use('db', 12000), use('user', 12000)]);
	caps.db = db;
	caps.user = user;
	use('sample', 15000).then((s) => {
		caps.sample = s;
		if (s) onSample();
	});
	return caps;
}

export async function viewerIdentity(): Promise<{ id: string | null; name: string }> {
	if (!caps.user) return { id: null, name: '' };
	try {
		const id = await caps.user.id();
		const me = await caps.user.me();
		return { id: id ?? null, name: me?.name || '' };
	} catch {
		return { id: null, name: '' };
	}
}
