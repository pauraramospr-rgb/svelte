<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	import '../app.css';
	import { page } from '$app/state';
	import { daysUntil, EXAM_2027 } from '$lib/data/official/exam-2027';
	import logo from '$lib/assets/logo.svg';
	import Icon, { type IconName } from '$lib/components/Icon.svelte';

	let { data, children } = $props();
	let menuOpen = $state(false);

	const groups: { label: string; items: { href: string; label: string; icon: IconName }[] }[] = [
		{
			label: 'Estudar',
			items: [
				{ href: '/painel', label: 'Painel', icon: 'home' },
				{ href: '/trilha', label: 'Minha trilha', icon: 'route' },
				{ href: '/resumos', label: 'Resumos e mapas mentais', icon: 'book' },
				{ href: '/em-evidencia', label: 'Temas em evidência', icon: 'star' }
			]
		},
		{
			label: 'Praticar',
			items: [
				{ href: '/banco', label: 'Banco de questões', icon: 'list' },
				{ href: '/simulados', label: 'Simulados', icon: 'timer' },
				{ href: '/redacao', label: 'Laboratório de redação', icon: 'pen' }
			]
		},
		{
			label: 'Guias',
			items: [
				{ href: '/guia', label: 'Como responder à UERJ', icon: 'check' },
				{ href: '/obras', label: 'Obras literárias', icon: 'library' },
				{ href: '/aulas', label: 'Aulas animadas', icon: 'play' },
				{ href: '/tutor', label: 'Professor IA', icon: 'sparkles' }
			]
		},
		{
			label: 'Progresso',
			items: [
				{ href: '/revisao', label: 'Revisão e evolução', icon: 'chart' },
				{ href: '/fontes', label: 'Fontes e metodologia', icon: 'info' },
				{ href: '/estudio', label: 'Estúdio de aulas', icon: 'film' }
			]
		}
	];

	const active = (href: string) => page.url.pathname === href || page.url.pathname.startsWith(href + '/');
	const examDate = $derived(data.user?.examDate ?? EXAM_2027.date);
	const days = $derived(daysUntil(examDate));
	const examLabel = $derived(new Date(examDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', ''));
	$effect(() => {
		page.url.pathname;
		menuOpen = false;
	});
</script>

<a class="skip" href="#conteudo">Pular para o conteúdo</a>

{#if data.user}
	<div class="shell">
		<header class="topbar">
			<button class="btn ghost menu" aria-expanded={menuOpen} aria-controls="nav" onclick={() => (menuOpen = !menuOpen)}>
				<Icon name="menu" size={22} /><span class="sr-only">Menu</span>
			</button>
			<a href="/painel" class="brand"><img src={logo} alt="" width="28" height="28" /> {APP_NAME}</a>
			<span class="countdown" title="Data do Exame Discursivo informada no seu perfil">
				{#if days > 0}<strong class="num">{days}</strong> {days === 1 ? 'dia' : 'dias'}{:else if days === 0}É hoje!{:else}Prova feita{/if}
			</span>
		</header>
		<nav id="nav" class:open={menuOpen} aria-label="Principal">
			<a href="/painel" class="brand side"><img src={logo} alt="" width="32" height="32" /> <span>{APP_NAME}</span></a>
			<a class="exam" href="/revisao#cronograma" title="Contagem regressiva para o Exame Discursivo">
				<span class="eyebrow">Exame Discursivo</span>
				{#if days > 0}
					<span class="big num">{days}</span>
					<span class="small">{days === 1 ? 'dia' : 'dias'} · {examLabel}, 9h</span>
				{:else if days === 0}
					<span class="big">Hoje</span><span class="small">Boa prova!</span>
				{:else}
					<span class="big">Feita</span><span class="small">Prova realizada</span>
				{/if}
			</a>
			{#each groups as g (g.label)}
				<div class="group">
					<span class="eyebrow">{g.label}</span>
					<ul>
						{#each g.items as item (item.href)}
							<li>
								<a href={item.href} class:active={active(item.href)} aria-current={active(item.href) ? 'page' : undefined}>
									<Icon name={item.icon} size={19} /><span>{item.label}</span>
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
			<div class="me">
				<a href="/perfil" class:active={active('/perfil')}>
					<span class="avatar" aria-hidden="true">{(data.user.name || '?').trim().charAt(0).toUpperCase()}</span>
					<span class="who">
						<strong>{data.user.name}</strong>
						<span class="small muted">{data.user.course ? `${data.user.course.name} (${data.user.course.campus})` : 'Escolha seu curso'}</span>
					</span>
				</a>
				{#if !data.embedded}<form method="POST" action="/sair"><button class="btn small ghost">Sair</button></form>{/if}
			</div>
			{#if !data.ai}
				{#if data.embedded}
					<p class="notice warn small ai-off">Os recursos de IA aparecem quando a página é aberta no claude.ai com acesso ao Claude permitido. O restante funciona normalmente.</p>
				{:else}
					<p class="notice warn small ai-off">IA desativada neste servidor: configure <code>ANTHROPIC_API_KEY</code>. O restante da plataforma funciona normalmente.</p>
				{/if}
			{/if}
		</nav>
		<main id="conteudo">
			{@render children()}
		</main>
	</div>
{:else}
	<main id="conteudo" class="public">
		{@render children()}
	</main>
{/if}

<footer class="foot small muted">
	Plataforma independente de estudos, <strong>sem vínculo com a UERJ</strong>. Informações oficiais são reproduzidas com fonte e devem ser conferidas
	em <a href="https://www.vestibular.uerj.br" target="_blank" rel="noopener noreferrer">www.vestibular.uerj.br</a>. <a href="/fontes">Fontes e metodologia</a> ·
	<a href="/sobre">Sobre</a>
</footer>

<style>
	.skip {
		position: absolute;
		left: -999px;
		top: 0;
		background: var(--primary);
		color: var(--primary-contrast);
		padding: 0.5rem 1rem;
		z-index: 100;
	}
	.skip:focus {
		left: 0.5rem;
	}
	.shell {
		display: grid;
		grid-template-columns: 280px minmax(0, 1fr);
		min-height: 100vh;
	}
	.topbar {
		display: none;
	}
	nav {
		position: sticky;
		top: 0;
		height: 100vh;
		overflow-y: auto;
		background: var(--surface);
		border-right: 1px solid var(--border);
		padding: 1.1rem 0.85rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}
	nav > * {
		flex: none;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		font-family: var(--display);
		font-weight: 800;
		font-size: 1.25rem;
		color: var(--text);
		text-decoration: none;
		letter-spacing: -0.02em;
	}
	.brand.side {
		padding: 0.2rem 0.55rem 0.1rem;
	}
	/* Cartão da contagem regressiva: folha pautada em tinta escura com o número grifado. */
	.exam {
		display: grid;
		gap: 0.05rem;
		text-decoration: none;
		color: var(--ink-text);
		background-color: var(--ink-panel);
		background-image: linear-gradient(to bottom, transparent 23px, rgb(255 255 255 / 7%) 23px);
		background-size: 100% 24px;
		border-radius: 14px;
		padding: 0.8rem 0.95rem 0.85rem;
		position: relative;
		overflow: hidden;
	}
	.exam:hover {
		color: var(--ink-text);
		background-color: var(--ink-panel-2);
	}
	.exam .eyebrow {
		color: var(--ink-muted);
		margin: 0;
	}
	.exam .big {
		font-size: 2.3rem;
		font-weight: 700;
		line-height: 1.05;
		color: var(--mark);
	}
	.exam .small {
		color: var(--ink-muted);
	}
	.group .eyebrow {
		padding: 0 0.65rem;
		margin-bottom: 0.25rem;
		font-size: 0.68rem;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 2px;
	}
	nav li a {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		padding: 0.48rem 0.65rem;
		border-radius: 10px;
		color: var(--text);
		text-decoration: none;
		font-weight: 550;
		font-size: 0.94rem;
	}
	nav li a :global(.icon) {
		color: var(--muted);
	}
	nav li a:hover {
		background: var(--surface-2);
	}
	nav li a.active {
		background: var(--primary-soft);
		color: var(--primary);
		font-weight: 650;
	}
	nav li a.active :global(.icon) {
		color: var(--primary);
	}
	nav li a.active span {
		background: linear-gradient(transparent 60%, var(--mark-soft) 60%, var(--mark-soft) 95%, transparent 95%);
	}
	.me {
		margin-top: auto;
		border-top: 1px solid var(--border);
		padding-top: 0.75rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.me a {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		text-decoration: none;
		color: var(--text);
		padding: 0.35rem 0.45rem;
		border-radius: 10px;
		min-width: 0;
	}
	.me a:hover,
	.me a.active {
		background: var(--surface-2);
	}
	.avatar {
		display: grid;
		place-items: center;
		width: 34px;
		height: 34px;
		border-radius: 50%;
		background: var(--primary);
		color: var(--primary-contrast);
		font-family: var(--display);
		font-weight: 700;
		flex: none;
	}
	.who {
		display: grid;
		min-width: 0;
		line-height: 1.3;
	}
	.who > * {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.ai-off {
		margin: 0;
	}
	main {
		padding-block: 2rem 3.5rem;
		padding-left: max(2.25rem, env(safe-area-inset-left, 0px));
		padding-right: max(2.25rem, env(safe-area-inset-right, 0px));
		max-width: 1200px;
		width: 100%;
		min-width: 0;
	}
	main.public {
		margin: 0 auto;
	}
	.countdown {
		margin-left: auto;
		font-size: 0.85rem;
		color: var(--muted);
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: 999px;
		padding: 0.15rem 0.7rem;
	}
	.countdown strong {
		color: var(--primary);
	}
	.foot {
		text-align: center;
		padding-block: 1.5rem 2rem;
		padding-left: max(16px, env(safe-area-inset-left, 0px));
		padding-right: max(16px, env(safe-area-inset-right, 0px));
		border-top: 1px solid var(--border);
		background: var(--surface);
	}
	@media (max-width: 980px) {
		.shell {
			grid-template-columns: minmax(0, 1fr);
		}
		.topbar {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			position: sticky;
			top: env(safe-area-inset-top, 0px);
			z-index: 20;
			background: var(--surface);
			border-bottom: 1px solid var(--border);
			padding-block: 0.5rem;
			padding-left: max(16px, env(safe-area-inset-left, 0px));
			padding-right: max(16px, env(safe-area-inset-right, 0px));
		}
		nav {
			display: none;
			position: fixed;
			inset: 57px 0 0 0;
			height: auto;
			z-index: 30;
			border-right: 0;
			padding-left: max(16px, env(safe-area-inset-left, 0px));
			padding-right: max(16px, env(safe-area-inset-right, 0px));
		}
		nav.open {
			display: flex;
		}
		.brand.side,
		.exam {
			display: none;
		}
		main {
			padding-block: 1.25rem 2.5rem;
			padding-left: max(16px, env(safe-area-inset-left, 0px));
			padding-right: max(16px, env(safe-area-inset-right, 0px));
		}
	}
</style>
