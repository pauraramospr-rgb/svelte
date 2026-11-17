import { json } from '@sveltejs/kit';
import { describeAiError } from './ai/client';

export function bad(message: string, status = 400) {
	return json({ error: message }, { status });
}

export function aiFailure(e: unknown) {
	console.error('[ia]', e);
	return json({ error: describeAiError(e) }, { status: 502 });
}

export async function readJson<T>(request: Request): Promise<T | null> {
	try {
		return (await request.json()) as T;
	} catch {
		return null;
	}
}
