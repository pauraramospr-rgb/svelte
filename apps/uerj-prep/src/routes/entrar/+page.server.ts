import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createSession, findUserByEmail, setSessionCookie, verifyPassword } from '$lib/server/auth';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(303, '/painel');
};

function safeRedirect(target: string | null): string {
	return target && target.startsWith('/') && !target.startsWith('//') ? target : '/painel';
}

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '');
		const password = String(form.get('password') ?? '');
		const user = findUserByEmail(email);
		if (!user || !verifyPassword(password, user.password_hash)) {
			return fail(400, { email, error: 'E-mail ou senha incorretos.' });
		}
		const { token, expires } = createSession(user.id);
		setSessionCookie(cookies, token, expires, url.protocol === 'https:');
		redirect(303, safeRedirect(url.searchParams.get('voltar')));
	}
};
