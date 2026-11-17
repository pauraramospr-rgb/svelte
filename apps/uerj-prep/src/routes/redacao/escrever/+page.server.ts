import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { TEMAS_2027, getTema } from '$lib/data/content/redacao-temas';
import { REDACAO_HISTORY } from '$lib/data/official/redacao-history';
import { db } from '$lib/server/db';

function promptFor(themeId: string, custom: string): string | null {
	const t = getTema(themeId);
	if (t) return `${t.question} (base: O bem-amado, de Dias Gomes — proposta plausível, não oficial)`;
	const h = REDACAO_HISTORY.find((r) => `oficial-${r.edition}` === themeId);
	if (h) return `${h.question} (proposta oficial UERJ ${h.edition}; base: ${h.book ?? 'textos da prova'})`;
	if (themeId === 'livre' && custom.trim().length >= 10) return custom.trim().slice(0, 600);
	return null;
}

export const load: PageServerLoad = ({ url }) => {
	return {
		tema: url.searchParams.get('tema') ?? TEMAS_2027[0].id,
		plano: url.searchParams.get('plano') ?? '',
		temas: TEMAS_2027.map((t) => ({ id: t.id, question: t.question })),
		oficiais: REDACAO_HISTORY.map((r) => ({ id: `oficial-${r.edition}`, question: `${r.edition} — ${r.question}`, book: r.book }))
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const f = await request.formData();
		const themeId = String(f.get('tema') ?? '');
		const custom = String(f.get('custom') ?? '');
		const title = String(f.get('title') ?? '').trim().slice(0, 150);
		const body = String(f.get('body') ?? '').trim();
		const plan = String(f.get('plan') ?? '').trim().slice(0, 4000);
		const prompt = promptFor(themeId, custom);
		if (!prompt) return fail(400, { error: 'Escolha uma proposta (ou escreva a sua, com ao menos 10 caracteres).', title, body });
		if (body.length < 200) return fail(400, { error: 'Sua redação está muito curta. A prova exige de 20 a 30 linhas.', title, body });
		if (body.length > 12000) return fail(400, { error: 'Texto longo demais.', title, body });
		const res = db()
			.prepare('INSERT INTO essays (user_id, theme_id, prompt, title, body, plan) VALUES (?,?,?,?,?,?)')
			.run(locals.user!.id, themeId, prompt, title, body, plan || null);
		redirect(303, `/redacao/${res.lastInsertRowid}?corrigir=1`);
	}
};
