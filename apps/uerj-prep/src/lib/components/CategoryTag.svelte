<script lang="ts">
	import { CATEGORY_HELP, CATEGORY_LABEL, type InfoCategory } from '$lib/data/official/sources';

	let { category, detail = '' }: { category: InfoCategory; detail?: string } = $props();
</script>

<span class="tag {category}" title={CATEGORY_HELP[category]}>
	<span class="dot" aria-hidden="true"></span>
	{CATEGORY_LABEL[category]}{#if detail}<span class="detail">· {detail}</span>{/if}
</span>

<style>
	.tag {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.75rem;
		font-weight: 700;
		border-radius: 999px;
		padding: 0.12rem 0.6rem;
		border: 1px solid currentColor;
		white-space: nowrap;
		cursor: help;
		background: var(--surface);
	}
	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: currentColor;
	}
	.detail {
		font-weight: 500;
	}
	.oficial {
		color: var(--cat-oficial);
	}
	.analise {
		color: var(--cat-analise);
	}
	.pedagogica {
		color: var(--cat-pedagogica);
	}
	.previsao {
		color: var(--cat-previsao);
	}
	.ia {
		color: var(--cat-ia);
	}
</style>
