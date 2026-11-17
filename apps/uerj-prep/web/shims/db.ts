/**
 * Substituto de '$lib/server/db' no navegador: SQLite (sql.js, build asm.js — sem WebAssembly
 * nem eval) com a mesma API mínima do `node:sqlite` usada pelo código do servidor.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import initSqlJs from 'sql.js/dist/sql-asm-memory-growth.js';
import { MIGRATIONS } from '../../src/lib/server/schema';
import type { Persistence } from '../persist';

type Param = string | number | null | Uint8Array;

function norm(params: unknown[]): Param[] {
	return params.map((p) => (p === undefined ? null : typeof p === 'boolean' ? (p ? 1 : 0) : typeof p === 'bigint' ? Number(p) : (p as Param)));
}

class Statement {
	constructor(
		private raw: any,
		private sql: string,
		private onWrite: () => void
	) {}
	get(...params: unknown[]): Record<string, unknown> | undefined {
		const s = this.raw.prepare(this.sql);
		try {
			s.bind(norm(params));
			return s.step() ? (s.getAsObject() as Record<string, unknown>) : undefined;
		} finally {
			s.free();
		}
	}
	all(...params: unknown[]): Record<string, unknown>[] {
		const s = this.raw.prepare(this.sql);
		try {
			s.bind(norm(params));
			const rows: Record<string, unknown>[] = [];
			while (s.step()) rows.push(s.getAsObject() as Record<string, unknown>);
			return rows;
		} finally {
			s.free();
		}
	}
	run(...params: unknown[]): { changes: number; lastInsertRowid: number } {
		this.raw.run(this.sql, norm(params));
		const changes = this.raw.getRowsModified();
		const id = this.raw.exec('SELECT last_insert_rowid() AS id')[0]?.values?.[0]?.[0] ?? 0;
		this.onWrite();
		return { changes, lastInsertRowid: Number(id) };
	}
}

export class BrowserDatabase {
	constructor(
		public raw: any,
		private onWrite: () => void
	) {}
	prepare(sql: string) {
		return new Statement(this.raw, sql, this.onWrite);
	}
	exec(sql: string) {
		this.raw.exec(sql);
		if (!/^\s*(SELECT|PRAGMA)/i.test(sql)) this.onWrite();
	}
}

let instance: BrowserDatabase | null = null;
let persistence: Persistence | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let depth = 0;
export const saveState = { pending: false, lastError: '' as string, lastSavedAt: null as Date | null };

function scheduleSave() {
	if (!persistence) return;
	saveState.pending = true;
	if (timer) clearTimeout(timer);
	timer = setTimeout(flushNow, 1500);
}

export async function flushNow(): Promise<void> {
	if (!instance || !persistence || depth > 0) return;
	if (timer) {
		clearTimeout(timer);
		timer = null;
	}
	if (!saveState.pending) return;
	saveState.pending = false;
	try {
		const bytes: Uint8Array = instance.raw.export();
		instance.raw.exec('PRAGMA foreign_keys = ON;');
		await persistence.save(bytes);
		saveState.lastError = '';
		saveState.lastSavedAt = new Date();
	} catch (e: any) {
		saveState.pending = true;
		saveState.lastError = e?.message ?? String(e);
	}
}

export function migrate(d: BrowserDatabase): void {
	d.raw.exec('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)');
	const row = d.prepare('SELECT COALESCE(MAX(version), 0) AS v FROM schema_migrations').get() as { v: number };
	for (let i = row.v; i < MIGRATIONS.length; i++) {
		d.raw.exec('BEGIN');
		try {
			d.raw.exec(MIGRATIONS[i]);
			d.raw.run("INSERT INTO schema_migrations (version, applied_at) VALUES (?, datetime('now'))", [i + 1]);
			d.raw.exec('COMMIT');
		} catch (e) {
			d.raw.exec('ROLLBACK');
			throw e;
		}
	}
}

/** Abre o banco a partir dos bytes salvos (ou vazio) e liga a persistência. */
export async function openBrowserDatabase(p: Persistence): Promise<BrowserDatabase> {
	const SQL = await initSqlJs();
	let bytes: Uint8Array | null = null;
	try {
		bytes = await p.load();
	} catch (e) {
		console.warn('Não foi possível ler os dados salvos; começando um banco novo.', e);
	}
	const raw = bytes ? new SQL.Database(bytes) : new SQL.Database();
	raw.exec('PRAGMA foreign_keys = ON;');
	persistence = p;
	instance = new BrowserDatabase(raw, scheduleSave);
	migrate(instance);
	return instance;
}

export function db(): BrowserDatabase {
	if (!instance) throw new Error('Banco ainda não carregado');
	return instance;
}

export function setDatabase(d: BrowserDatabase) {
	instance = d;
}

export function openDatabase(): never {
	throw new Error('openDatabase não é usado no navegador');
}

/** Transação reentrante (mesma semântica do servidor). */
export function tx<T>(fn: () => T): T {
	const d = db();
	const sp = `sp_${depth}`;
	d.raw.exec(depth === 0 ? 'BEGIN' : `SAVEPOINT ${sp}`);
	depth++;
	try {
		const r = fn();
		depth--;
		d.raw.exec(depth === 0 ? 'COMMIT' : `RELEASE ${sp}`);
		if (depth === 0) scheduleSave();
		return r;
	} catch (e) {
		depth--;
		d.raw.exec(depth === 0 ? 'ROLLBACK' : `ROLLBACK TO ${sp}; RELEASE ${sp}`);
		throw e;
	}
}
