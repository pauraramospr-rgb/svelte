import type { Actions, PageServerLoad } from './$types';
import { contextText, getThread, listThreads, type TutorContext } from '$lib/server/tutor';
import { db } from '$lib/server/db';

export const load: PageServerLoad = ({ locals, url }) => {
	const user = locals.user!;
	const sp = url.searchParams;
	let context: TutorContext | null = null;
	if (sp.get('questao')) context = { kind: 'questao', id: sp.get('questao')! };
	else if (sp.get('topico')) context = { kind: 'topico', id: sp.get('topico')! };
	else if (sp.get('obra')) context = { kind: 'obra', id: sp.get('obra')! };
	else if (sp.get('redacao')) context = { kind: 'redacao', id: sp.get('redacao')! };
	const ctx = contextText(user, context);
	const threadId = Number(sp.get('conversa')) || null;
	return {
		threads: listThreads(user.id),
		thread: threadId ? getThread(user.id, threadId) : null,
		context: ctx ? { ...context!, label: ctx.label } : null
	};
};

export const actions: Actions = {
	apagar: async ({ request, locals }) => {
		const id = Number((await request.formData()).get('id'));
		db().prepare('DELETE FROM chat_threads WHERE id = ? AND user_id = ?').run(id, locals.user!.id);
		return { ok: true };
	}
};
