<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	let { form } = $props();
	let busy = $state(false);
</script>

<svelte:head><title>Entrar · {APP_NAME}</title></svelte:head>

<div class="auth card">
	<h1>Entrar</h1>
	<p class="muted">Continue sua preparação para o Exame Discursivo da UERJ.</p>
	<form method="POST" use:enhance={() => { busy = true; return async ({ update }) => { await update(); busy = false; }; }}>
		<div class="field">
			<label for="email">E-mail</label>
			<input id="email" name="email" type="email" autocomplete="email" required value={form?.email ?? ''} />
		</div>
		<div class="field">
			<label for="password">Senha</label>
			<input id="password" name="password" type="password" autocomplete="current-password" required />
		</div>
		{#if form?.error}<p class="notice bad" role="alert">{form.error}</p>{/if}
		<button class="btn primary" style="width:100%" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
	</form>
	<p class="small muted" style="margin-top:1rem">Ainda não tem conta? <a href="/cadastro{page.url.search}">Criar conta gratuita</a></p>
</div>

<style>
	.auth {
		max-width: 420px;
		margin: 3rem auto;
	}
</style>
