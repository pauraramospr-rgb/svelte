import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { estimateLines } from '$lib/domain/text';

export const load: PageServerLoad = ({ params, locals }) => {
	const e = db()
		.prepare('SELECT id, prompt, title, body, plan, correction, score, created_at, corrected_at FROM essays WHERE id = ? AND user_id = ?')
		.get(Number(params.id), locals.user!.id) as
		| { id: number; prompt: string; title: string; body: string; plan: string | null; correction: string | null; score: number | null; created_at: string; corrected_at: string | null }
		| undefined;
	if (!e) error(404, 'Redação não encontrada.');
	return { essay: { ...e, correction: e.correction ? JSON.parse(e.correction) : null, lines: estimateLines(e.body) } };
};
