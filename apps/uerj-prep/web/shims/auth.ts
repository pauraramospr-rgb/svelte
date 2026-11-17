/**
 * Substituto de '$lib/server/auth' no navegador. Não há senha nem sessão: a identidade vem do
 * claude.ai e o banco já é privado de cada estudante; existe uma única linha em `users`.
 */
import { db } from './db';

export interface User {
	id: number;
	email: string;
	name: string;
	course_id: string | null;
	level: 'iniciante' | 'intermediario' | 'avancado';
	exam_date: string;
	eq_conceito: 'A' | 'B' | 'C' | 'D' | null;
	le_language: 'Espanhol' | 'Francês' | 'Inglês' | null;
	weekly_hours: number;
	created_at: string;
}

const USER_COLUMNS = 'id, email, name, course_id, level, exam_date, eq_conceito, le_language, weekly_hours, created_at';

export function getUser(id: number): User | undefined {
	return db().prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`).get(id) as User | undefined;
}

/** Garante o registro do estudante; o nome vem do claude.ai quando disponível. */
export function ensureLocalUser(name: string): User {
	const row = db().prepare('SELECT id FROM users ORDER BY id LIMIT 1').get() as { id: number } | undefined;
	if (!row) {
		db()
			.prepare("INSERT INTO users (email, name, password_hash) VALUES ('estudante@discursiva.local', ?, 'claude')")
			.run(name || 'Estudante');
		return getUser((db().prepare('SELECT id FROM users ORDER BY id LIMIT 1').get() as { id: number }).id)!;
	}
	const u = getUser(row.id)!;
	if (name && u.name === 'Estudante') db().prepare('UPDATE users SET name = ? WHERE id = ?').run(name, u.id);
	return getUser(row.id)!;
}

export function updateProfile(
	userId: number,
	p: Partial<Pick<User, 'name' | 'course_id' | 'level' | 'exam_date' | 'eq_conceito' | 'le_language' | 'weekly_hours'>>
): void {
	const keys = Object.keys(p) as (keyof typeof p)[];
	if (!keys.length) return;
	db()
		.prepare(`UPDATE users SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`)
		.run(...keys.map((k) => (p[k] ?? null) as string | number | null), userId);
}

export const SESSION_COOKIE = 'sessao';
export function validateSession(): null {
	return null;
}
export function destroySession(): void {}
