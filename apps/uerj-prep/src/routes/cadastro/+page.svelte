<script lang="ts">
	import { enhance } from '$app/forms';
	let { form } = $props();
	let busy = $state(false);
</script>

<svelte:head><title>Criar conta · Discursiva</title></svelte:head>

<div class="auth card">
	<h1>Criar conta</h1>
	<p class="muted">Seu progresso, simulados e redações ficam salvos na sua conta.</p>
	<form method="POST" use:enhance={() => { busy = true; return async ({ update }) => { await update(); busy = false; }; }}>
		<div class="field">
			<label for="name">Nome</label>
			<input id="name" name="name" autocomplete="name" required minlength="2" maxlength="80" value={form?.name ?? ''} />
		</div>
		<div class="field">
			<label for="email">E-mail</label>
			<input id="email" name="email" type="email" autocomplete="email" required value={form?.email ?? ''} />
		</div>
		<div class="field">
			<label for="password">Senha</label>
			<input id="password" name="password" type="password" autocomplete="new-password" required minlength="8" />
			<span class="small muted">Mínimo de 8 caracteres.</span>
		</div>
		{#if form?.error}<p class="notice bad" role="alert">{form.error}</p>{/if}
		<button class="btn primary" style="width:100%" disabled={busy}>{busy ? 'Criando…' : 'Criar conta'}</button>
	</form>
	<p class="small muted" style="margin-top:1rem">Já tem conta? <a href="/entrar">Entrar</a></p>
</div>

<style>
	.auth {
		max-width: 420px;
		margin: 3rem auto;
	}
</style>
