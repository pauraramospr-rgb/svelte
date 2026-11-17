/**
 * Persistência do banco SQLite do estudante.
 * - No claude.ai: na área PRIVADA do estudante (`data/users/<id>/…` do db do artifact),
 *   em partes de até ~180 mil caracteres, alternando duas "fatias" (A/B) para nunca deixar
 *   uma cópia pela metade: grava todas as partes da fatia livre e só então troca o manifesto.
 * - Fora do claude.ai: no localStorage do navegador.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
const CHUNK = 180_000;

export interface Persistence {
	kind: 'claude' | 'local' | 'memory';
	load(): Promise<Uint8Array | null>;
	save(bytes: Uint8Array): Promise<void>;
}

function toBase64(bytes: Uint8Array): string {
	let s = '';
	const step = 0x8000;
	for (let i = 0; i < bytes.length; i += step) s += String.fromCharCode(...bytes.subarray(i, i + step));
	return btoa(s);
}

function fromBase64(b64: string): Uint8Array {
	const s = atob(b64);
	const out = new Uint8Array(s.length);
	for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
	return out;
}

export function claudePersistence(db: any, uid: string): Persistence {
	const col = db.collection('data/users/' + uid);
	let chain: Promise<unknown> = Promise.resolve();
	return {
		kind: 'claude',
		async load() {
			const meta = await col.doc('banco').get();
			if (!meta.exists) return null;
			const m = meta.data() as { slot: string; parts: number };
			const parts: string[] = [];
			for (let i = 0; i < m.parts; i++) {
				const d = await col.doc(`banco-${m.slot}-${i}`).get();
				if (!d.exists) throw new Error('parte ausente');
				parts.push((d.data() as { data: string }).data);
			}
			return fromBase64(parts.join(''));
		},
		save(bytes) {
			// uma gravação por vez (exigência do db do artifact)
			chain = chain.then(async () => {
				const meta = await col.doc('banco').get();
				const current = meta.exists ? (meta.data() as { slot: string }).slot : 'b';
				const slot = current === 'a' ? 'b' : 'a';
				const b64 = toBase64(bytes);
				const n = Math.max(1, Math.ceil(b64.length / CHUNK));
				for (let i = 0; i < n; i++) await col.doc(`banco-${slot}-${i}`).set({ data: b64.slice(i * CHUNK, (i + 1) * CHUNK) });
				await col.doc('banco').set({ slot, parts: n, bytes: bytes.length, savedAt: new Date().toISOString(), schema: 1 });
			});
			return chain as Promise<void>;
		}
	};
}

export function localPersistence(key = 'discursiva:banco'): Persistence {
	return {
		kind: 'local',
		async load() {
			try {
				const v = localStorage.getItem(key);
				return v ? fromBase64(v) : null;
			} catch {
				return null;
			}
		},
		async save(bytes) {
			try {
				localStorage.setItem(key, toBase64(bytes));
			} catch {
				/* armazenamento indisponível ou cheio: segue só na memória */
			}
		}
	};
}
