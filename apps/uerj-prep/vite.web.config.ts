/**
 * Build da versão que roda inteiramente no navegador (publicada como página no claude.ai).
 * Reaproveita as rotas e a lógica do servidor, trocando por adaptadores (web/shims) os módulos
 * que dependem de Node: banco (node:sqlite → sql.js), autenticação e cliente da API de IA.
 */
import { defineConfig, type Plugin } from 'vite';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const r = (p: string) => resolve(fileURLToPath(new URL('.', import.meta.url)), p);

const REDIRECTS: Record<string, string> = {
	[r('src/lib/server/db.ts')]: r('web/shims/db.ts'),
	[r('src/lib/server/auth.ts')]: r('web/shims/auth.ts'),
	[r('src/lib/server/ai/client.ts')]: r('web/shims/ai-client.ts')
};

function redirectServerModules(): Plugin {
	return {
		name: 'discursiva-web-redirects',
		enforce: 'pre',
		async resolveId(source, importer, options) {
			if (!importer) return null;
			const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
			if (resolved && REDIRECTS[resolved.id]) return REDIRECTS[resolved.id];
			return null;
		}
	};
}

export default defineConfig({
	root: r('web'),
	base: './',
	plugins: [redirectServerModules(), svelte({ preprocess: vitePreprocess(), configFile: false })],
	resolve: {
		alias: [
			{ find: '$env/dynamic/private', replacement: r('web/shims/env.ts') },
			{ find: '$app/state', replacement: r('web/shims/app-state.svelte.ts') },
			{ find: '$app/navigation', replacement: r('web/shims/app-navigation.ts') },
			{ find: '$app/forms', replacement: r('web/shims/app-forms.ts') },
			{ find: /^@sveltejs\/kit$/, replacement: r('web/shims/kit.ts') },
			{ find: '$lib', replacement: r('src/lib') }
		]
	},
	build: {
		outDir: r('build-web'),
		emptyOutDir: true,
		cssCodeSplit: false,
		assetsInlineLimit: 100_000_000,
		chunkSizeWarningLimit: 10_000,
		rollupOptions: { output: { inlineDynamicImports: true } }
	}
});
