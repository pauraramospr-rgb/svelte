<script lang="ts">
	import { DISCIPLINES, type DisciplineCode } from '$lib/data/official/exam-2027';

	let { code, long = false }: { code: string; long?: boolean } = $props();
	const d = $derived(DISCIPLINES[code as DisciplineCode]);
</script>

{#if d}
	<span class="pill" style="color: {d.color}; border-color: color-mix(in srgb, {d.color} 45%, transparent)">
		<span class="disc-dot" style="background: {d.color}"></span>
		{long ? d.name : d.short}
	</span>
{/if}
