<script lang="ts">
	import type { Question } from '$lib/questions/types';
	import Feedback from './Feedback.svelte';
	import Reference from './Reference.svelte';
	import { onMount } from 'svelte';

	let { q, ai }: { q: Question; ai: boolean } = $props();

	let answer = $state('');
	let seconds = $state(0);
	let running = $state(true);
	let busy = $state(false);
	let error = $state('');
	let attemptId = $state<number | null>(null);
	let feedback = $state<any>(null);
	let showRef = $state(false);
	let selfCredit = $state<string | null>(null);

	onMount(() => {
		const t = setInterval(() => running && seconds++, 1000);
		return () => clearInterval(t);
	});

	const mmss = $derived(`${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`);

	async function submit(mode: 'ia' | 'auto') {
		error = '';
		if (answer.trim().length < 3) {
			error = 'Escreva sua resposta antes de enviar.';
			return;
		}
		busy = true;
		running = false;
		try {
			const res = await fetch('/api/answer', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ questionId: q.id, answer, timeSeconds: seconds, mode })
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error ?? 'Falha ao enviar.');
			attemptId = data.attemptId;
			feedback = data.feedback ?? null;
			showRef = true;
		} catch (e) {
			error = (e as Error).message;
			running = true;
		} finally {
			busy = false;
		}
	}

	async function selfGrade(credit: 'total' | 'parcial' | 'nula') {
		if (!attemptId) return;
		const res = await fetch('/api/answer/self', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ attemptId, credit })
		});
		if (res.ok) selfCredit = credit;
	}
</script>

<div class="panel card">
	<div class="spread">
		<label for="ans-{q.id}">Sua resposta</label>
		<span class="pill" aria-label="Tempo">{mmss}</span>
	</div>
	<textarea id="ans-{q.id}" class="pautado" bind:value={answer} disabled={attemptId !== null} placeholder="Responda como na prova: completo, objetivo e justificado."></textarea>
	{#if error}<p class="notice bad small" role="alert">{error}</p>{/if}
	{#if attemptId === null}
		<div class="row" style="margin-top:0.6rem">
			<button class="btn primary" disabled={busy || !ai} onclick={() => submit('ia')} title={ai ? '' : 'IA não configurada no servidor'}>
				{busy ? 'Corrigindo…' : 'Corrigir com o professor IA'}
			</button>
			<button class="btn" disabled={busy} onclick={() => submit('auto')}>Comparar com o padrão e autoavaliar</button>
		</div>
		{#if busy}<p class="small muted" role="status">A correção detalhada pode levar alguns segundos…</p>{/if}
	{/if}
</div>

{#if feedback}<Feedback fb={feedback} />{/if}

{#if showRef}
	<Reference {q} />
	{#if !feedback}
		<div class="card">
			<h3>Autoavaliação</h3>
			<p class="small muted">Compare sua resposta com a referência acima e registre a pontuação, como faria a banca (edital, item 4.29.5). Isso alimenta sua revisão espaçada.</p>
			<div class="row">
				{#each [['total', 'Total — respondi tudo corretamente'], ['parcial', 'Parcial — acertei parte'], ['nula', 'Nula — não acertei']] as [c, l] (c)}
					<button class="btn" class:primary={selfCredit === c} onclick={() => selfGrade(c as 'total')}>{l}</button>
				{/each}
			</div>
			{#if selfCredit}<p class="notice ok small" role="status">Registrado. A próxima revisão deste tópico foi agendada.</p>{/if}
		</div>
	{/if}
	<p class="row"><a class="btn small" href="/tutor?questao={encodeURIComponent(q.id)}">Discutir esta questão com o professor IA</a></p>
{/if}

<style>
	.panel {
		margin-top: 1rem;
	}
</style>
