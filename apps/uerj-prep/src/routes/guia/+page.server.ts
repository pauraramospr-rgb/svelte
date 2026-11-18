import type { PageServerLoad } from './$types';
import { officialQuestions } from '$lib/server/questions';
import { commandStats } from '$lib/domain/commands';
import { PADROES } from '$lib/data/content/guia';

export const load: PageServerLoad = () => {
	const official = officialQuestions();
	const byId = new Map(official.map((q) => [q.id, q]));
	return {
		stats: commandStats(official),
		years: [...new Set(official.map((q) => q.year))].sort(),
		padroes: PADROES.map((p) => {
			const q = byId.get(p.id);
			return { ...p, ref: q ? `UERJ ${q.year} · ${q.discipline} · Q${String(q.number).padStart(2, '0')}` : p.id };
		})
	};
};
