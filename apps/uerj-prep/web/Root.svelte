<script lang="ts">
	import Layout from '../src/routes/+layout.svelte';
	import { view } from './kit.svelte';

	let { status }: { status: { ready: boolean; mode: string; message: string; error: string } } = $props();
	const Page = $derived(view.component);
</script>

{#if !status.ready}
	<div class="boot" role="status">
		<img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%231d4ed8'/%3E%3Cpath d='M18 44V20h10c8 0 14 5 14 12s-6 12-14 12H18zm6-6h4c5 0 8-2.5 8-6s-3-6-8-6h-4v12z' fill='%23fff'/%3E%3Ccircle cx='48' cy='44' r='4' fill='%23fbbf24'/%3E%3C/svg%3E" alt="" width="56" height="56" />
		<strong>Discursiva</strong>
		<p class="muted">{status.error || status.message}</p>
	</div>
{:else}
	{#if status.mode === 'local'}
		<p class="mode notice warn small">
			Modo local: seu progresso fica salvo apenas neste navegador. Abra esta página no claude.ai, com sua conta, para salvar na nuvem e usar a IA.
		</p>
	{/if}
	<Layout data={view.layoutData as any}>
		{#if view.error}
			<div class="card">
				<h1>{view.error.status === 404 ? 'Página não encontrada' : 'Algo deu errado'}</h1>
				<p>{view.error.message}</p>
				<a class="btn primary" href="/painel">Ir para o painel</a>
			</div>
		{:else if Page}
			{#key view.key}
				<Page data={view.data} form={view.form} />
			{/key}
		{/if}
	</Layout>
{/if}

<style>
	.boot {
		min-height: 80vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
		padding-left: max(16px, env(safe-area-inset-left, 0px));
		padding-right: max(16px, env(safe-area-inset-right, 0px));
		text-align: center;
	}
	.boot strong {
		font-size: 1.4rem;
	}
	.mode {
		margin: 0;
		border-radius: 0;
		text-align: center;
	}
</style>
