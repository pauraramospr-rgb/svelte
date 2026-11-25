<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import QuestionView from '$lib/components/QuestionView.svelte';
	import Reference from '$lib/components/Reference.svelte';
	import Feedback from '$lib/components/Feedback.svelte';
	import DisciplineBadge from '$lib/components/DisciplineBadge.svelte';
	import CategoryTag from '$lib/components/CategoryTag.svelte';
	import { estimateLines } from '$lib/domain/text';

	let { data } = $props();

	// ---------- modo prova
	let current = $state(0);
	let answers = $state<string[]>([]);
	let times = $state<number[]>([]);
	// O relógio já nasce com o tempo que falta (no servidor e no navegador): começar em zero mostrava
	// 0:00:00 em vermelho e o aviso “Encerrar e enviar todas as respostas?” até o primeiro segundo passar.
	const segundosRestantes = () => Math.max(0, Math.round((new Date(data.sim.deadline).getTime() - Date.now()) / 1000));
	let remaining = $state(segundosRestantes());
	let saveState = $state<'salvo' | 'salvando' | 'erro'>('salvo');
	let finishForm: HTMLFormElement | undefined = $state();
	let confirming = $state(false);
	const dirty = new Set<number>();

	$effect.pre(() => {
		if (!answers.length) {
			answers = data.items.map((i) => i.answer);
			times = data.items.map((i) => i.time);
		}
	});

	async function flush() {
		if (!dirty.size) return;
		saveState = 'salvando';
		const positions = [...dirty];
		dirty.clear();
		try {
			for (const idx of positions) {
				const res = await fetch(`/api/simulados/${data.sim.id}/save`, {
					method: 'POST',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ position: data.items[idx].position, answer: answers[idx], timeSeconds: times[idx] })
				});
				if (!res.ok) throw new Error();
			}
			saveState = 'salvo';
		} catch {
			saveState = 'erro';
			positions.forEach((p) => dirty.add(p));
		}
	}

	onMount(() => {
		if (data.sim.finished) return;
		const tick = setInterval(() => {
			remaining = segundosRestantes();
			times[current] = (times[current] ?? 0) + 1;
			if (times[current] % 15 === 0) dirty.add(current);
			if (remaining === 0) {
				clearInterval(tick);
				flush().then(() => finishForm?.requestSubmit());
			}
		}, 1000);
		const autosave = setInterval(flush, 4000);
		const beforeUnload = () => void flush();
		window.addEventListener('beforeunload', beforeUnload);
		return () => {
			clearInterval(tick);
			clearInterval(autosave);
			window.removeEventListener('beforeunload', beforeUnload);
			flush();
		};
	});

	const hms = (s: number) => `${Math.floor(s / 3600)}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
	const item = $derived(data.items[current]);

	// ---------- modo resultado
	let grading = $state<string>('');
	let gradeError = $state('');
	let openRef = $state<Record<number, boolean>>({});

	async function gradeOne(attemptId: number) {
		const res = await fetch(`/api/attempts/${attemptId}/grade`, { method: 'POST' });
		const out = await res.json();
		if (!res.ok) throw new Error(out.error);
	}
	async function gradeAll() {
		gradeError = '';
		const pending = data.items.filter((i) => i.kind === 'questao' && i.attempt && i.attempt.credit === null);
		let n = 0;
		try {
			for (const it of pending) {
				n++;
				grading = `Corrigindo ${n} de ${pending.length}…`;
				if (it.kind === 'questao' && it.attempt) await gradeOne(it.attempt.id);
			}
			const essayItem = data.items.find((i) => i.kind === 'redacao' && i.essay && i.essay.score === null);
			if (essayItem && essayItem.kind === 'redacao' && essayItem.essay) {
				grading = 'Corrigindo a redação…';
				const res = await fetch(`/api/essays/${essayItem.essay.id}/correct`, { method: 'POST' });
				if (!res.ok) throw new Error((await res.json()).error);
			}
		} catch (e) {
			gradeError = (e as Error).message;
		}
		grading = '';
		await invalidateAll();
	}
	async function selfGrade(attemptId: number, credit: 'total' | 'parcial' | 'nula') {
		await fetch('/api/answer/self', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ attemptId, credit }) });
		await invalidateAll();
	}
	const creditText = (c: number | null) => (c === null ? 'pendente' : c >= 0.99 ? 'total' : c > 0 ? 'parcial' : 'nula');
	const pending = $derived(data.items.filter((i) => (i.kind === 'questao' && i.attempt?.credit === null) || (i.kind === 'redacao' && i.essay && i.essay.score === null)).length);
</script>

<svelte:head><title>{data.sim.title} · {APP_NAME}</title></svelte:head>

<p class="small"><a href="/simulados">← Simulados</a></p>

{#if !data.sim.finished}
	<div class="exam-head card">
		<div>
			<h1 style="margin:0">{data.sim.title}</h1>
			<span class="small muted">Respostas salvas automaticamente · {saveState === 'salvo' ? 'tudo salvo' : saveState === 'salvando' ? 'salvando…' : 'falha ao salvar — tentando de novo'}</span>
		</div>
		<div class="timer" class:low={remaining < 600} role="timer" aria-live="off">{hms(remaining)}</div>
		<form method="POST" action="?/finish" bind:this={finishForm} onsubmit={() => flush()} class="row">
			{#if confirming || remaining === 0}
				<span class="small">Encerrar e enviar todas as respostas?</span>
				<button class="btn primary">Sim, encerrar</button>
				<button type="button" class="btn" onclick={() => (confirming = false)}>Continuar a prova</button>
			{:else}
				<button type="button" class="btn primary" onclick={() => (confirming = true)}>Encerrar e corrigir</button>
			{/if}
		</form>
	</div>

	<nav class="qnav" aria-label="Questões">
		{#each data.items as it, i (it.position)}
			<button class="qbtn" class:cur={i === current} class:done={answers[i]?.trim()} onclick={() => { flush(); current = i; }} title={it.discipline}>
				{it.kind === 'redacao' ? 'R' : it.position}
			</button>
		{/each}
	</nav>

	<div class="card">
		{#if item.kind === 'redacao'}
			<div class="row"><DisciplineBadge code="RED" />{#if item.prompt}<CategoryTag category={item.prompt.title.startsWith('Proposta oficial') ? 'oficial' : 'previsao'} detail={item.prompt.title} />{/if}</div>
			{#each item.motivadores as m, i (i)}
				<blockquote class="mot"><strong class="small">{m.title}</strong><br />{m.text}</blockquote>
			{/each}
			<p class="statement">
				A partir da leitura de <em>{item.prompt?.book}</em>, escreva uma redação dissertativo-argumentativa, em prosa, com 20 a 30 linhas, em que discuta a seguinte questão:
				<strong>{item.prompt?.question}</strong>
			</p>
			<p class="small muted">Escreva o título na primeira linha. Estimativa: {estimateLines(answers[current] ?? '')} linhas (aproximação de ~65 caracteres por linha manuscrita).</p>
		{:else}
			<QuestionView q={item.q} />
		{/if}
		<label for="resp" class="sr-only">Resposta</label>
		<textarea id="resp" class="answer pautado" bind:value={answers[current]} oninput={() => dirty.add(current)} placeholder={item.kind === 'redacao' ? 'Título\n\nSeu texto…' : 'Desenvolvimento e resposta'}></textarea>
		<div class="spread" style="margin-top:0.6rem">
			<button class="btn" disabled={current === 0} onclick={() => { flush(); current--; }}>← Anterior</button>
			<span class="small muted">{current + 1} de {data.items.length} · tempo nesta questão: {Math.floor((times[current] ?? 0) / 60)} min</span>
			<button class="btn" disabled={current === data.items.length - 1} onclick={() => { flush(); current++; }}>Próxima →</button>
		</div>
	</div>
{:else}
	<h1>{data.sim.title}</h1>
	<p class="muted">Concluído em {Math.round((data.sim.elapsed ?? 0) / 60)} de {data.sim.duration} minutos.</p>

	{#if data.result}
		<section class="card">
			<div class="spread">
				<h2>Resultado estimado</h2>
				<CategoryTag category="pedagogica" detail="metodologia da plataforma" />
			</div>
			<div class="grid cols-3">
				{#each data.result.provas as p (p.discipline)}
					<div class="score">
						<DisciplineBadge code={p.discipline} />
						<strong>{p.points.toFixed(1)}<small>/20</small></strong>
						<span class="small muted">peso {p.weight} · {p.graded}/{p.total} corrigida(s)</span>
					</div>
				{/each}
			</div>
			<p style="margin-top:0.8rem">
				{#if data.sim.kind === 'completo'}
					<strong>Exame Discursivo: {data.result.discursive.toFixed(1)} de 80 pontos</strong>
					{#if data.result.final !== null} · resultado final estimado com o conceito do Exame de Qualificação: <strong>{data.result.final.toFixed(1)} de 100</strong>{/if}
				{:else}
					<strong>{data.result.discursive.toFixed(1)} de 20 pontos</strong>
				{/if}
				{#if !data.result.complete}<span class="pill">correção incompleta</span>{/if}
			</p>
			{#each data.result.reasons as r, i (i)}<p class="notice bad small">{r}</p>{/each}
			<p class="small muted">
				Oficial: cada prova vale 20 pontos, com pesos 2, 1 e 1, totalizando 80; o resultado final soma o conceito do Exame de Qualificação (edital, itens 4.1, 5.1 e 6.1).
				Estimativa da plataforma: os 20 pontos de cada prova divididos igualmente entre as questões; crédito parcial = 50%; Redação pela grade de 8 aspectos de igual peso.
				A UERJ não divulga esses valores.
			</p>
			{#if pending > 0}
				<div class="row">
					<button class="btn primary" disabled={!data.ai || grading !== ''} onclick={gradeAll}>{grading || `Corrigir ${pending} pendente(s) com IA`}</button>
					<span class="small muted">ou faça a autoavaliação de cada questão abaixo, comparando com o comentário oficial.</span>
				</div>
			{/if}
			{#if gradeError}<p class="notice bad small" role="alert">{gradeError}</p>{/if}
		</section>
	{/if}

	{#each data.items as it (it.position)}
		<section class="card item">
			{#if it.kind === 'redacao'}
				<div class="spread"><h3>Redação</h3>{#if it.essay}<a class="btn small" href="/redacao/{it.essay.id}">{it.essay.score !== null ? `Ver correção (${it.essay.score.toFixed(1)}/20)` : 'Abrir redação'}</a>{/if}</div>
				<p class="small muted">{it.prompt?.question}</p>
				{#if !it.answer.trim()}<p class="notice bad small">Redação em branco: no exame real, nota zero elimina o candidato (edital, item 5.5).</p>{/if}
			{:else}
				<div class="spread">
					<h3>Questão {it.position}</h3>
					<span class="credit {creditText(it.attempt?.credit ?? null)}">{creditText(it.attempt?.credit ?? null)}</span>
				</div>
				<QuestionView q={it.q} compact />
				<p class="small"><strong>Sua resposta</strong> · {Math.round(it.time / 60)} min</p>
				<blockquote class="statement ans">{it.answer || '(em branco)'}</blockquote>
				{#if it.topics.length}<p class="small muted">Tópicos: {it.topics.join(' · ')}</p>{/if}
				{#if it.attempt?.feedback}<Feedback fb={it.attempt.feedback} />{/if}
				<div class="row">
					<button class="btn small" onclick={() => (openRef[it.position] = !openRef[it.position])}>{openRef[it.position] ? 'Ocultar' : 'Ver'} {it.q.source === 'oficial' ? 'comentário oficial' : 'resposta-modelo'}</button>
					{#if it.attempt && it.attempt.credit === null}
						<span class="small muted">Autoavaliar:</span>
						<button class="btn small" onclick={() => selfGrade(it.attempt!.id, 'total')}>Total</button>
						<button class="btn small" onclick={() => selfGrade(it.attempt!.id, 'parcial')}>Parcial</button>
						<button class="btn small" onclick={() => selfGrade(it.attempt!.id, 'nula')}>Nula</button>
					{/if}
					<a class="btn small ghost" href="/banco/{it.q.id}">Abrir no banco</a>
				</div>
				{#if openRef[it.position]}<Reference q={it.q} />{/if}
			{/if}
		</section>
	{/each}
{/if}

<style>
	.exam-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		position: sticky;
		top: 0.5rem;
		z-index: 5;
	}
	.timer {
		font-variant-numeric: tabular-nums;
		font-size: 1.6rem;
		font-weight: 800;
	}
	.timer.low {
		color: var(--bad);
	}
	.qnav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin: 1rem 0;
	}
	.qbtn {
		width: 38px;
		height: 38px;
		border-radius: 8px;
		border: 1px solid var(--border);
		background: var(--surface);
		color: var(--text);
		font-weight: 700;
		cursor: pointer;
	}
	.qbtn.done {
		background: var(--ok-soft);
		border-color: var(--ok);
	}
	.qbtn.cur {
		outline: 2px solid var(--primary);
	}
	.answer {
		min-height: 260px;
		margin-top: 1rem;
	}
	.mot {
		margin: 0.5rem 0;
		padding: 0.6rem 0.9rem;
		background: var(--surface-2);
		border-radius: 8px;
	}
	.score {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.score strong {
		font-size: 1.8rem;
	}
	.credit {
		font-weight: 700;
		text-transform: uppercase;
		font-size: 0.8rem;
	}
	.credit.total {
		color: var(--ok);
	}
	.credit.parcial {
		color: var(--warn);
	}
	.credit.nula {
		color: var(--bad);
	}
	.credit.pendente {
		color: var(--muted);
	}
	.ans {
		background: var(--surface-2);
		padding: 0.6rem 0.8rem;
		border-radius: 8px;
		margin: 0.3rem 0 0.6rem;
		font-size: 0.95rem;
	}
	.item {
		margin-top: 1rem;
	}
</style>
