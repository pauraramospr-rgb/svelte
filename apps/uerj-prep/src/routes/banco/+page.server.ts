import type { PageServerLoad } from './$types';
import { listQuestions, officialYears } from '$lib/server/questions';
import { DISCIPLINES, type DisciplineCode } from '$lib/data/official/exam-2027';
import { topicsOf } from '$lib/domain/syllabus';
import { db } from '$lib/server/db';
import type { Difficulty } from '$lib/questions/types';

const PAGE = 20;

export const load: PageServerLoad = ({ url, locals }) => {
	const sp = url.searchParams;
	const source = (sp.get('fonte') ?? '') as '' | 'oficial' | 'inedita';
	const discipline = (sp.get('disciplina') ?? '') as DisciplineCode | '';
	const topicId = sp.get('topico') ?? '';
	const year = Number(sp.get('ano')) || undefined;
	const difficulty = (sp.get('dificuldade') ?? '') as Difficulty | '';
	const q = sp.get('q') ?? '';
	const page = Math.max(1, Number(sp.get('p')) || 1);
	const all = listQuestions({ source, discipline, topicId: topicId || undefined, year, difficulty, q: q || undefined });
	all.sort((a, b) => {
		const ya = a.source === 'oficial' ? a.year : 9999;
		const yb = b.source === 'oficial' ? b.year : 9999;
		return yb - ya || a.discipline.localeCompare(b.discipline) || a.id.localeCompare(b.id);
	});
	const answered = new Map(
		(db().prepare('SELECT question_id, MAX(credit) AS best FROM attempts WHERE user_id = ? GROUP BY question_id').all(locals.user!.id) as { question_id: string; best: number | null }[]).map(
			(r) => [r.question_id, r.best]
		)
	);
	const items = all.slice((page - 1) * PAGE, page * PAGE).map((x) => ({
		id: x.id,
		source: x.source,
		discipline: x.discipline,
		label: x.source === 'oficial' ? `UERJ ${x.year} · Q${String(x.number).padStart(2, '0')}${x.language ? ' · ' + x.language : ''}` : `Inédita · ${({ facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' } as const)[x.difficulty]}${x.book ? ' · ' + x.book : ''}`,
		statement: x.statement.slice(0, 280),
		hasGraphic: x.source === 'oficial' && x.hasGraphic,
		answered: answered.has(x.id),
		best: answered.get(x.id) ?? null
	}));
	return {
		items,
		total: all.length,
		page,
		pages: Math.max(1, Math.ceil(all.length / PAGE)),
		filters: { source, discipline, topicId, year: year ?? '', difficulty, q },
		years: officialYears(),
		disciplines: Object.values(DISCIPLINES).filter((d) => d.code !== 'RED'),
		topics: discipline ? topicsOf(discipline).map((t) => ({ id: t.id, title: t.title })) : []
	};
};
