/** Substituto de '$app/navigation'. */
import { navigate, reload } from '../kit.svelte';

export function goto(href: string | URL, opts: { replaceState?: boolean; noScroll?: boolean; invalidateAll?: boolean } = {}) {
	return navigate(String(href), { replace: opts.replaceState, noScroll: opts.noScroll });
}

export function invalidateAll() {
	return reload();
}

export function invalidate() {
	return reload();
}
