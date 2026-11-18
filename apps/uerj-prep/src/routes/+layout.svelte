<script lang="ts">
	import { APP_NAME } from '$lib/brand';
	import '../app.css';
	import { page } from '$app/state';
	import { daysUntil, EXAM_2027 } from '$lib/data/official/exam-2027';
	import logo from '$lib/assets/logo.svg';

	let { data, children } = $props();
	let menuOpen = $state(false);

	const nav = [
		{ href: '/painel', label: 'Painel', icon: '◎' },
		{ href: '/trilha', label: 'Minha trilha', icon: '↗' },
		{ href: '/guia', label: 'Como responder à UERJ', icon: '✓' },
		{ href: '/banco', label: 'Banco de questões', icon: '▤' },
		{ href: '/simulados', label: 'Simulados', icon: '⏱' },
		{ href: '/resumos', label: 'Resumos e mapas mentais', icon: '✎' },
		{ href: '/em-evidencia', label: 'Temas em evidência', icon: '★' },
		{ href: '/redacao', label: 'Laboratório de redação', icon: '¶' },
		{ href: '/obras', label: 'Obras literárias', icon: '❦' },
		{ href: '/tutor', label: 'Professor IA', icon: '✦' },
		{ href: '/revisao', label: 'Revisão e evolução', icon: '↻' },
		{ href: '/fontes', label: 'Fontes e metodologia', icon: '§' }
	];

	const active = (href: string) => page.url.pathname === href || page.url.pathname.startsWith(href + '/');
	const days = $derived(daysUntil(data.user?.examDate ?? EXAM_2027.date));
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
				<span aria-hidden="true">☰</span><span class="sr-only">Menu</span>
			</button>
			<a href="/painel" class="brand"><img src={logo} alt="" width="28" height="28" /> {APP_NAME}</a>
			<span class="countdown" title="Data do Exame Discursivo informada no seu perfil">
				{#if days > 0}<strong>{days}</strong> {days === 1 ? 'dia' : 'dias'} para a prova{:else if days === 0}A prova é hoje!{:else}Prova realizada{/if}
			</span>
		</header>
		<nav id="nav" class:open={menuOpen} aria-label="Principal">
			<a href="/painel" class="brand side"><img src={logo} alt="" width="30" height="30" /> {APP_NAME}</a>
			<ul>
				{#each nav as item (item.href)}
					<li>
						<a href={item.href} class:active={active(item.href)} aria-current={active(item.href) ? 'page' : undefined}>
							<span class="icon" aria-hidden="true">{item.icon}</span>{item.label}
						</a>
					</li>
				{/each}
			</ul>
			<div class="me">
				<a href="/perfil" class:active={active('/perfil')}>
					<strong>{data.user.name}</strong>
					<span class="small muted">{data.user.course ? `${data.user.course.name} (${data.user.course.campus})` : 'Escolha seu curso'}</span>
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
		grid-template-columns: 260px 1fr;
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
		padding: 1rem 0.75rem;
		display: flex;
		flex-direction: column;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 800;
		font-size: 1.15rem;
		color: var(--text);
		text-decoration: none;
		letter-spacing: -0.01em;
	}
	.brand.side {
		padding: 0.25rem 0.6rem 1rem;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	nav li a {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.5rem 0.6rem;
		border-radius: 9px;
		color: var(--text);
		text-decoration: none;
		font-weight: 550;
		font-size: 0.95rem;
	}
	nav li a:hover {
		background: var(--surface-2);
	}
	nav a.active {
		background: var(--primary-soft);
		color: var(--primary);
	}
	.icon {
		width: 1.3rem;
		text-align: center;
		opacity: 0.85;
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
		flex-direction: column;
		text-decoration: none;
		color: var(--text);
		padding: 0.3rem 0.5rem;
		border-radius: 8px;
		min-width: 0;
	}
	.me a span {
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ai-off {
		margin-top: 0.75rem;
	}
	main {
		padding-block: 1.75rem 3rem;
		padding-left: max(2rem, env(safe-area-inset-left, 0px));
		padding-right: max(2rem, env(safe-area-inset-right, 0px));
		max-width: 1180px;
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
	}
	.foot {
		text-align: center;
		padding-block: 1.5rem 2rem;
		padding-left: max(16px, env(safe-area-inset-left, 0px));
		padding-right: max(16px, env(safe-area-inset-right, 0px));
		border-top: 1px solid var(--border);
	}
	@media (max-width: 900px) {
		.shell {
			grid-template-columns: 1fr;
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
		}
		nav.open {
			display: flex;
		}
		.brand.side {
			display: none;
		}
		main {
			padding-block: 1.25rem 2.5rem;
			padding-left: max(16px, env(safe-area-inset-left, 0px));
			padding-right: max(16px, env(safe-area-inset-right, 0px));
		}
	}
</style>
