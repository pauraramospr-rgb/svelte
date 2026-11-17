import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { env } from '$env/dynamic/private';

/**
 * Banco SQLite embutido (módulo nativo `node:sqlite`, Node ≥ 22.13).
 * Migrações são aplicadas em ordem e registradas em `schema_migrations`.
 */
const MIGRATIONS: string[] = [
	/* 001 – usuários e sessões */ `
	CREATE TABLE users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		email TEXT NOT NULL UNIQUE COLLATE NOCASE,
		name TEXT NOT NULL,
		password_hash TEXT NOT NULL,
		course_id TEXT,
		level TEXT NOT NULL DEFAULT 'intermediario' CHECK (level IN ('iniciante','intermediario','avancado')),
		exam_date TEXT NOT NULL DEFAULT '2026-11-29',
		eq_conceito TEXT CHECK (eq_conceito IN ('A','B','C','D')),
		le_language TEXT CHECK (le_language IN ('Espanhol','Francês','Inglês')),
		weekly_hours INTEGER NOT NULL DEFAULT 12,
		created_at TEXT NOT NULL DEFAULT (datetime('now'))
	);
	CREATE TABLE sessions (
		id TEXT PRIMARY KEY,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		expires_at INTEGER NOT NULL
	);
	CREATE INDEX sessions_user ON sessions(user_id);
	`,
	/* 002 – questões geradas por IA (inéditas) */ `
	CREATE TABLE generated_questions (
		id TEXT PRIMARY KEY,
		discipline TEXT NOT NULL,
		topic_id TEXT,
		difficulty TEXT NOT NULL,
		payload TEXT NOT NULL,
		created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
		model TEXT NOT NULL,
		created_at TEXT NOT NULL DEFAULT (datetime('now'))
	);
	CREATE INDEX generated_questions_disc ON generated_questions(discipline, topic_id);
	`,
	/* 003 – tentativas de resposta (banco, simulados, trilhas) */ `
	CREATE TABLE simulados (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		kind TEXT NOT NULL CHECK (kind IN ('completo','disciplina')),
		title TEXT NOT NULL,
		config TEXT NOT NULL,
		duration_minutes INTEGER NOT NULL,
		started_at TEXT NOT NULL DEFAULT (datetime('now')),
		finished_at TEXT,
		elapsed_seconds INTEGER,
		result TEXT
	);
	CREATE TABLE simulado_items (
		simulado_id INTEGER NOT NULL REFERENCES simulados(id) ON DELETE CASCADE,
		position INTEGER NOT NULL,
		question_id TEXT NOT NULL,
		discipline TEXT NOT NULL,
		answer TEXT NOT NULL DEFAULT '',
		time_seconds INTEGER NOT NULL DEFAULT 0,
		attempt_id INTEGER,
		PRIMARY KEY (simulado_id, position)
	);
	CREATE TABLE attempts (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		question_id TEXT NOT NULL,
		discipline TEXT NOT NULL,
		topic_ids TEXT NOT NULL DEFAULT '[]',
		answer TEXT NOT NULL,
		credit REAL,
		grading_method TEXT NOT NULL CHECK (grading_method IN ('ia','autoavaliacao','pendente')),
		feedback TEXT,
		time_seconds INTEGER NOT NULL DEFAULT 0,
		simulado_id INTEGER REFERENCES simulados(id) ON DELETE SET NULL,
		created_at TEXT NOT NULL DEFAULT (datetime('now'))
	);
	CREATE INDEX attempts_user ON attempts(user_id, created_at);
	CREATE INDEX attempts_question ON attempts(user_id, question_id);
	`,
	/* 004 – redações */ `
	CREATE TABLE essays (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		theme_id TEXT,
		prompt TEXT NOT NULL,
		title TEXT NOT NULL DEFAULT '',
		body TEXT NOT NULL,
		plan TEXT,
		correction TEXT,
		score REAL,
		created_at TEXT NOT NULL DEFAULT (datetime('now')),
		corrected_at TEXT
	);
	CREATE INDEX essays_user ON essays(user_id, created_at);
	`,
	/* 005 – revisão espaçada por tópico */ `
	CREATE TABLE review_cards (
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		topic_id TEXT NOT NULL,
		discipline TEXT NOT NULL,
		ease REAL NOT NULL DEFAULT 2.5,
		interval_days REAL NOT NULL DEFAULT 0,
		repetitions INTEGER NOT NULL DEFAULT 0,
		lapses INTEGER NOT NULL DEFAULT 0,
		due_at TEXT NOT NULL,
		last_reviewed_at TEXT,
		PRIMARY KEY (user_id, topic_id)
	);
	CREATE INDEX review_due ON review_cards(user_id, due_at);
	CREATE TABLE topic_progress (
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		topic_id TEXT NOT NULL,
		status TEXT NOT NULL CHECK (status IN ('estudando','concluido')),
		updated_at TEXT NOT NULL DEFAULT (datetime('now')),
		PRIMARY KEY (user_id, topic_id)
	);
	`,
	/* 006 – tutor e resumos gerados */ `
	CREATE TABLE chat_threads (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		title TEXT NOT NULL,
		context TEXT,
		created_at TEXT NOT NULL DEFAULT (datetime('now')),
		updated_at TEXT NOT NULL DEFAULT (datetime('now'))
	);
	CREATE TABLE chat_messages (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		thread_id INTEGER NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
		role TEXT NOT NULL CHECK (role IN ('user','assistant')),
		content TEXT NOT NULL,
		created_at TEXT NOT NULL DEFAULT (datetime('now'))
	);
	CREATE INDEX chat_messages_thread ON chat_messages(thread_id, id);
	CREATE TABLE generated_summaries (
		topic_id TEXT NOT NULL,
		level TEXT NOT NULL,
		content TEXT NOT NULL,
		model TEXT NOT NULL,
		created_at TEXT NOT NULL DEFAULT (datetime('now')),
		PRIMARY KEY (topic_id, level)
	);
	`,
	/* 007 – registro de uso de IA (limite por usuário) */ `
	CREATE TABLE ai_usage (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
		task TEXT NOT NULL,
		input_tokens INTEGER NOT NULL DEFAULT 0,
		output_tokens INTEGER NOT NULL DEFAULT 0,
		created_at TEXT NOT NULL DEFAULT (datetime('now'))
	);
	CREATE INDEX ai_usage_user ON ai_usage(user_id, created_at);
	`
];

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
