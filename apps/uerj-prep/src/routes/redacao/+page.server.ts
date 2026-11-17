import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = ({ locals }) => {
	const essays = db()
		.prepare('SELECT id, title, prompt, score, created_at, corrected_at FROM essays WHERE user_id = ? ORDER BY id DESC')
		.all(locals.user!.id) as { id: number; title: string; prompt: string; score: number | null; created_at: string; corrected_at: string | null }[];
	return { essays };
};
