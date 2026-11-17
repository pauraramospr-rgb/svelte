<script lang="ts">
	import { SOURCES, type SourceId } from '$lib/data/official/sources';

	let { id, ref = '' }: { id: SourceId; ref?: string } = $props();
	const s = $derived(SOURCES[id]);
</script>

<cite class="src">
	Fonte: <a href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a>{#if ref}, {ref}{/if} ({s.publisher}, {s.year}; acesso em
	{new Date(s.accessedAt + 'T12:00:00').toLocaleDateString('pt-BR')}).
</cite>

<style>
	.src {
		display: block;
		font-style: normal;
		font-size: 0.8rem;
		color: var(--muted);
		margin-top: 0.4rem;
	}
</style>
