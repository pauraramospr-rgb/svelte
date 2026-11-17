import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { aiConfigured, streamChat, describeAiError } from '$lib/server/ai/client';
import { bad, readJson } from '$lib/server/http';
import { buildSystem, contextText, getThread, type TutorContext } from '$lib/server/tutor';

const MAX_HISTORY = 30;

export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user!;
	if (!aiConfigured()) return bad('A IA não está configurada neste servidor.', 503);
	const body = await readJson<{ threadId?: number; message: string; context?: TutorContext }>(request);
	const message = body?.message?.trim().slice(0, 6000) ?? '';
	if (!message) return bad('Mensagem vazia.');

	let threadId = body?.threadId;
	let focus: string | undefined;
	if (threadId) {
		const t = getThread(user.id, threadId);
		if (!t) return bad('Conversa não encontrada.', 404);
		focus = t.context ?? undefined;
	} else {
		const ctx = body?.context ? contextText(user, body.context) : null;
		focus = ctx?.text;
		const title = (ctx?.label ? `${ctx.label} — ` : '') + message.slice(0, 60);
		threadId = Number(db().prepare('INSERT INTO chat_threads (user_id, title, context) VALUES (?,?,?)').run(user.id, title, focus ?? null).lastInsertRowid);
	}
	db().prepare("INSERT INTO chat_messages (thread_id, role, content) VALUES (?, 'user', ?)").run(threadId, message);
	db().prepare("UPDATE chat_threads SET updated_at = datetime('now') WHERE id = ?").run(threadId);
	const history = getThread(user.id, threadId)!.messages.slice(-MAX_HISTORY);
	// A API exige que a conversa comece com uma mensagem do usuário.
	while (history.length && history[0].role !== 'user') history.shift();

	let stream: ReadableStream<Uint8Array>;
	try {
		stream = streamChat({
			userId: user.id,
			system: buildSystem(user, focus),
			messages: history,
			onComplete: (text) => {
				if (text.trim()) db().prepare("INSERT INTO chat_messages (thread_id, role, content) VALUES (?, 'assistant', ?)").run(threadId, text);
			}
		});
	} catch (e) {
		return bad(describeAiError(e), 429);
	}
	return new Response(stream, {
		headers: { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-cache', 'x-thread-id': String(threadId) }
	});
};
