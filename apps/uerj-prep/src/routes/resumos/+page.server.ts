import type { PageServerLoad } from './$types';
import { RESUMOS } from '$lib/content';
import { SYLLABUS, topicStats, incidenceBand } from '$lib/domain/syllabus';
import { db } from '$lib/server/db';

export const load: PageServerLoad = ({ locals }) => {
	const generated = new Set(
		(db().prepare('SELECT DISTINCT topic_id FROM generated_summaries WHERE level = ?').all(locals.user!.level) as { topic_id: string }[]).map((r) => r.topic_id)
	);
	const editorial = new Set(RESUMOS.map((r) => r.topicId));
	return {
		disciplines: SYLLABUS.filter((d) => d.code !== 'RED').map((d) => ({
			code: d.code,
			name: d.name,
			topics: d.units.flatMap((u) =>
				u.topics.map((t) => {
					const s = topicStats(t.id);
					return { id: t.id, title: t.title, unit: u.name, editorial: editorial.has(t.id), generated: generated.has(t.id), band: incidenceBand(s), editions: s.editions };
				})
			)
		})),
		editorialCount: RESUMOS.length
	};
};
