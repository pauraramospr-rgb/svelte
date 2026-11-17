import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';
import { db } from './db';

export const SESSION_COOKIE = 'sessao';
const SESSION_DAYS = 30;

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

export function hashPassword(password: string): string {
	const salt = randomBytes(16);
	const hash = scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
	return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
	const [algo, saltB64, hashB64] = stored.split('$');
	if (algo !== 'scrypt' || !saltB64 || !hashB64) return false;
	const expected = Buffer.from(hashB64, 'base64');
	const actual = scryptSync(password, Buffer.from(saltB64, 'base64'), expected.length, { N: 16384, r: 8, p: 1 });
	return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** O identificador da sessão é guardado apenas como hash no banco. */
function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

export function createUser(email: string, name: string, password: string): User {
	const res = db()
		.prepare('INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)')
		.run(email.trim().toLowerCase(), name.trim(), hashPassword(password));
	return getUser(Number(res.lastInsertRowid))!;
}

export function getUser(id: number): User | undefined {
	return db().prepare(`SELECT ${USER_COLUMNS} FROM users WHERE id = ?`).get(id) as User | undefined;
}

export function findUserByEmail(email: string): (User & { password_hash: string }) | undefined {
	return db()
		.prepare(`SELECT ${USER_COLUMNS}, password_hash FROM users WHERE email = ?`)
		.get(email.trim().toLowerCase()) as (User & { password_hash: string }) | undefined;
}

export function createSession(userId: number): { token: string; expires: Date } {
	const token = randomBytes(32).toString('base64url');
	const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
	db().prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(hashToken(token), userId, expires.getTime());
	return { token, expires };
}

export function validateSession(token: string | undefined): User | null {
	if (!token) return null;
	const row = db()
		.prepare('SELECT user_id, expires_at FROM sessions WHERE id = ?')
		.get(hashToken(token)) as { user_id: number; expires_at: number } | undefined;
	if (!row) return null;
	if (row.expires_at < Date.now()) {
		db().prepare('DELETE FROM sessions WHERE id = ?').run(hashToken(token));
		return null;
	}
	return getUser(row.user_id) ?? null;
}

export function destroySession(token: string | undefined): void {
	if (token) db().prepare('DELETE FROM sessions WHERE id = ?').run(hashToken(token));
}

export function setSessionCookie(cookies: Cookies, token: string, expires: Date, secure: boolean): void {
	cookies.set(SESSION_COOKIE, token, { path: '/', httpOnly: true, sameSite: 'lax', secure, expires });
}

export function updateProfile(
	userId: number,
	p: Partial<Pick<User, 'name' | 'course_id' | 'level' | 'exam_date' | 'eq_conceito' | 'le_language' | 'weekly_hours'>>
): void {
	const keys = Object.keys(p) as (keyof typeof p)[];
	if (!keys.length) return;
	const sql = `UPDATE users SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`;
	db()
		.prepare(sql)
		.run(...keys.map((k) => (p[k] ?? null) as string | number | null), userId);
}

export function validateEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && email.length <= 200;
}
