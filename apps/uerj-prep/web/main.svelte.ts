import { mount } from 'svelte';
import Root from './Root.svelte';
import { initCapabilities, viewerIdentity, caps } from './platform';
import { claudePersistence, localPersistence } from './persist';
import { openBrowserDatabase, flushNow } from './shims/db';
import { ensureLocalUser } from './shims/auth';
import { installGlobalHandlers, initialPath, navigate, reload, setCurrentUser } from './kit.svelte';

const status = $state({ ready: false, mode: 'claude', message: 'Carregando seus dados…', error: '' });

mount(Root, { target: document.getElementById('app')!, props: { status } });

async function boot() {
	installGlobalHandlers();
	await initCapabilities(() => {
		if (status.ready) reload();
	});
	const me = await viewerIdentity();
	const persistence = caps.db && me.id ? claudePersistence(caps.db, me.id) : localPersistence();
	status.mode = persistence.kind;
	await openBrowserDatabase(persistence);
	const user = ensureLocalUser(me.name);
	setCurrentUser(user.id);
	await navigate(initialPath(), { replace: true });
	status.ready = true;
	const save = () => void flushNow();
	document.addEventListener('visibilitychange', () => document.visibilityState === 'hidden' && save());
	window.addEventListener('pagehide', save);
}

boot().catch((e) => {
	console.error(e);
	status.error = 'Não foi possível iniciar a plataforma. Recarregue a página.';
});
