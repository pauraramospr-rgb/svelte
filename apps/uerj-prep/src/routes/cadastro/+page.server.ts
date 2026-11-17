import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createSession, createUser, findUserByEmail, setSessionCookie, validateEmail } from '$lib/server/auth';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(303, '/painel');
};

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const email = String(form.get('email') ?? '').trim();
		const password = String(form.get('password') ?? '');
		if (name.length < 2 || name.length > 80) return fail(400, { name, email, error: 'Informe seu nome (2 a 80 caracteres).' });
		if (!validateEmail(email)) return fail(400, { name, email, error: 'Informe um e-mail válido.' });
		if (password.length < 8) return fail(400, { name, email, error: 'A senha deve ter ao menos 8 caracteres.' });
		if (findUserByEmail(email)) return fail(400, { name, email, error: 'Já existe uma conta com este e-mail.' });
		const user = createUser(email, name, password);
		const { token, expires } = createSession(user.id);
		setSessionCookie(cookies, token, expires, url.protocol === 'https:');
		redirect(303, '/perfil?boas-vindas=1');
	}
};
