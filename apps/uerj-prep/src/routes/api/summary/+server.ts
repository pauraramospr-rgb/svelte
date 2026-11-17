import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateSummary } from '$lib/server/ai/tasks';
import { aiConfigured, model } from '$lib/server/ai/client';
import { aiFailure, bad, readJson } from '$lib/server/http';
import { getTopic } from '$lib/domain/syllabus';
import { db } from '$lib/server/db';

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user!;
	const body = await readJson<{ topicId: string }>(request);
	if (!body || !getTopic(body.topicId)) return bad('Tópico inválido.');
	const cached = db().prepare('SELECT content FROM generated_summaries WHERE topic_id = ? AND level = ?').get(body.topicId, user.level) as
		| { content: string }
		| undefined;
	if (cached) return json({ content: cached.content });
	if (!aiConfigured()) return bad('A IA não está configurada neste servidor.', 503);
	try {
		const content = await generateSummary({ topicId: body.topicId, level: user.level, userId: user.id });
		db()
			.prepare('INSERT OR REPLACE INTO generated_summaries (topic_id, level, content, model) VALUES (?,?,?,?)')
			.run(body.topicId, user.level, content, model());
		return json({ content });
	} catch (e) {
		return aiFailure(e);
	}
};
