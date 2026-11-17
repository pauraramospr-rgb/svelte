import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { env } from '$env/dynamic/private';
import { MIGRATIONS } from './schema';

/**
 * Banco SQLite embutido (módulo nativo `node:sqlite`, Node ≥ 22.13).
 * Migrações são aplicadas em ordem e registradas em `schema_migrations`.
 */

let instance: DatabaseSync | null = null;

export function migrate(db: DatabaseSync): void {
	db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)');
	const row = db.prepare('SELECT COALESCE(MAX(version), 0) AS v FROM schema_migrations').get() as { v: number };
	for (let i = row.v; i < MIGRATIONS.length; i++) {
		db.exec('BEGIN');
		try {
			db.exec(MIGRATIONS[i]);
			db.prepare("INSERT INTO schema_migrations (version, applied_at) VALUES (?, datetime('now'))").run(i + 1);
			db.exec('COMMIT');
		} catch (e) {
			db.exec('ROLLBACK');
			throw e;
		}
	}
}

export function openDatabase(path: string): DatabaseSync {
	if (path !== ':memory:') mkdirSync(dirname(resolve(path)), { recursive: true });
	const db = new DatabaseSync(path);
	db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
	migrate(db);
	return db;
}

export function db(): DatabaseSync {
	if (!instance) instance = openDatabase(env.DATABASE_PATH || './data/app.db');
	return instance;
}

/** Para testes: injeta um banco (ex.: em memória). */
export function setDatabase(d: DatabaseSync): void {
	instance = d;
}

let depth = 0;

/** Transação reentrante: chamadas aninhadas usam SAVEPOINT. */
export function tx<T>(fn: () => T): T {
	const d = db();
	const sp = `sp_${depth}`;
	d.exec(depth === 0 ? 'BEGIN' : `SAVEPOINT ${sp}`);
	depth++;
	try {
		const r = fn();
		depth--;
		d.exec(depth === 0 ? 'COMMIT' : `RELEASE ${sp}`);
		return r;
	} catch (e) {
		depth--;
		d.exec(depth === 0 ? 'ROLLBACK' : `ROLLBACK TO ${sp}; RELEASE ${sp}`);
		throw e;
	}
}
