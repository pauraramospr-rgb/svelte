<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import Markdown from '$lib/components/Markdown.svelte';
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import { tick } from 'svelte';

	let { data } = $props();
	let messages = $state<{ role: 'user' | 'assistant'; content: string }[]>([]);
	let threadId = $state<number | null>(null);
	let input = $state('');
	let busy = $state(false);
	let error = $state('');
	let log: HTMLDivElement | undefined = $state();

	$effect.pre(() => {
		messages = data.thread?.messages ? [...data.thread.messages] : [];
		threadId = data.thread?.id ?? null;
	});

	const suggestions = $derived(
		data.context?.kind === 'questao'
			? ['Me dê uma dica para começar, sem a resposta.', 'Onde errei na minha resposta?', 'Explique o conceito por trás desta questão.']
			: data.context?.kind === 'obra'
				? ['Quais temas da obra podem virar questão de prova?', 'Explique o contexto histórico da obra.', 'Faça 3 perguntas para eu testar minha leitura.']
				: data.context?.kind === 'redacao'
					? ['Como melhorar minha tese?', 'Reescreva meu primeiro parágrafo explicando as mudanças.', 'Que repertório eu poderia usar?']
					: ['Explique estequiometria do zero, com exemplos.', 'Monte 3 exercícios de funções para eu praticar.', 'Relacione a Revolução Industrial com a urbanização (Geografia).']
	);

	async function scroll() {
		await tick();
		log?.scrollTo({ top: log.scrollHeight, behavior: 'smooth' });
	}

	async function send(text = input) {
		const msg = text.trim();
		if (!msg || busy) return;
		error = '';
		input = '';
		messages.push({ role: 'user', content: msg });
		messages.push({ role: 'assistant', content: '' });
		busy = true;
		scroll();
		try {
			const res = await fetch('/api/tutor', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ threadId, message: msg, context: threadId ? undefined : data.context ? { kind: data.context.kind, id: data.context.id } : undefined })
			});
			if (!res.ok || !res.body) throw new Error((await res.json().catch(() => ({}))).error ?? 'Falha ao contatar o professor IA.');
			const newId = Number(res.headers.get('x-thread-id'));
			const reader = res.body.getReader();
			const dec = new TextDecoder();
			let buf = '';
			for (;;) {
				const { done, value } = await reader.read();
				if (done) break;
				buf += dec.decode(value, { stream: true });
				const parts = buf.split('\n\n');
				buf = parts.pop() ?? '';
				for (const p of parts) {
					if (!p.startsWith('data: ')) continue;
					const ev = JSON.parse(p.slice(6));
					if (ev.delta) {
						messages[messages.length - 1].content += ev.delta;
						scroll();
					} else if (ev.error) throw new Error(ev.error);
				}
			}
			if (!threadId && newId) {
				threadId = newId;
				goto(`/tutor?conversa=${newId}`, { replaceState: true, noScroll: true, keepFocus: true, invalidateAll: true });
			}
		} catch (e) {
			error = (e as Error).message;
			if (!messages[messages.length - 1].content) messages.pop();
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Professor IA · {APP_NAME}</title></svelte:head>

<div class="tutor">
	<aside class="card threads">
		<a class="btn primary small" href="/tutor" style="width:100%">Nova conversa</a>
		<ul>
			{#each data.threads as t (t.id)}
				<li class:sel={t.id === threadId}>
					<a href="/tutor?conversa={t.id}">{t.title}</a>
					<form method="POST" action="?/apagar" use:enhance><input type="hidden" name="id" value={t.id} /><button class="btn ghost small" title="Apagar conversa" aria-label="Apagar conversa">×</button></form>
				</li>
			{:else}
				<li class="small muted">Suas conversas aparecerão aqui.</li>
			{/each}
		</ul>
	</aside>

	<section class="card chat">
		<div class="spread">
			<h1 style="margin:0">Professor IA</h1>
			<CategoryTag category="ia" />
		</div>
		{#if data.context && !threadId}<p class="notice info small">Contexto desta conversa: <strong>{data.context.label}</strong></p>{/if}
		{#if !data.ai}<p class="notice warn">O professor IA não está disponível: o servidor não tem a chave da API configurada.</p>{/if}

		<div class="log" bind:this={log} aria-live="polite">
			{#if !messages.length}
				<div class="intro muted">
					<p>Pergunte qualquer conteúdo do programa, peça uma resolução passo a passo, cole uma resposta discursiva para correção ou peça exercícios. As explicações se adaptam ao seu nível e ao seu curso.</p>
					<p class="small">O professor responde com base em conhecimento geral e nos dados oficiais desta plataforma; ao falar do vestibular, ele separa informação oficial, análise e previsão. Confira sempre o edital.</p>
				</div>
			{/if}
			{#each messages as m, i (i)}
				<div class="msg {m.role}">
					{#if m.role === 'assistant'}
						{#if m.content}<Markdown source={m.content} />{:else}<span class="typing">pensando…</span>{/if}
					{:else}
						<p>{m.content}</p>
					{/if}
				</div>
			{/each}
		</div>

		{#if error}<p class="notice bad small" role="alert">{error}</p>{/if}
		{#if !messages.length}
			<div class="row sugg">{#each suggestions as s (s)}<button class="btn small" disabled={!data.ai || busy} onclick={() => send(s)}>{s}</button>{/each}</div>
		{/if}
		<form class="composer" onsubmit={(e) => { e.preventDefault(); send(); }}>
			<label for="msg" class="sr-only">Mensagem</label>
			<textarea id="msg" bind:value={input} rows="3" placeholder="Escreva sua pergunta…" onkeydown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}></textarea>
			<button class="btn primary" disabled={!data.ai || busy || !input.trim()}>{busy ? '…' : 'Enviar'}</button>
		</form>
	</section>
</div>

<style>
	.tutor {
		display: grid;
		grid-template-columns: 240px 1fr;
		gap: 1rem;
		align-items: start;
	}
	.tutor > .card + .card {
		margin-top: 0;
	}
	.threads ul {
		list-style: none;
		padding: 0;
		margin: 0.8rem 0 0;
		max-height: 70vh;
		overflow-y: auto;
	}
	.threads li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.3rem;
		border-radius: 8px;
		padding: 0.2rem 0.3rem;
		font-size: 0.88rem;
	}
	.threads li.sel {
		background: var(--primary-soft);
	}
	.threads li a {
		color: var(--text);
		text-decoration: none;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.chat {
		display: flex;
		flex-direction: column;
		min-height: 75vh;
	}
	.log {
		flex: 1;
		overflow-y: auto;
		max-height: 60vh;
		margin: 0.8rem 0;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}
	.msg {
		max-width: 88%;
		padding: 0.6rem 0.9rem;
		border-radius: 12px;
	}
	.msg p {
		margin: 0;
		white-space: pre-wrap;
	}
	.msg.user {
		align-self: flex-end;
		background: var(--primary);
		color: var(--primary-contrast);
	}
	.msg.assistant {
		align-self: flex-start;
		background: var(--surface-2);
	}
	.typing {
		color: var(--muted);
		font-style: italic;
	}
	.composer {
		display: flex;
		gap: 0.5rem;
		align-items: flex-end;
	}
	.composer textarea {
		min-height: 64px;
	}
	.sugg {
		margin-bottom: 0.6rem;
	}
	@media (max-width: 900px) {
		.tutor {
			grid-template-columns: 1fr;
		}
		.threads ul {
			max-height: 160px;
		}
	}
</style>
