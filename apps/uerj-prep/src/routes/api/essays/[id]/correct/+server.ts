import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { correctEssay } from '$lib/server/ai/tasks';
import { aiConfigured } from '$lib/server/ai/client';
import { aiFailure, bad } from '$lib/server/http';
import { essayScore } from '$lib/domain/essay';

export const POST: RequestHandler = async ({ params, locals }) => {
	const user = locals.user!;
	if (!aiConfigured()) return bad('A IA não está configurada neste servidor.', 503);
	const e = db().prepare('SELECT id, prompt, title, body FROM essays WHERE id = ? AND user_id = ?').get(Number(params.id), user.id) as
		| { id: number; prompt: string; title: string; body: string }
		| undefined;
	if (!e) return bad('Redação não encontrada.', 404);
	if (e.body.trim().length < 200) return bad('Texto curto demais para correção (mínimo de ~200 caracteres).');
	try {
		const c = await correctEssay({ prompt: e.prompt, title: e.title, body: e.body, level: user.level, userId: user.id });
		const { score, zeroReason } = essayScore(c.aspects, c.formal);
		db()
			.prepare("UPDATE essays SET correction = ?, score = ?, corrected_at = datetime('now') WHERE id = ?")
			.run(JSON.stringify({ ...c, zeroReason }), score, e.id);
		return json({ ok: true, score });
	} catch (err) {
		return aiFailure(err);
	}
};
