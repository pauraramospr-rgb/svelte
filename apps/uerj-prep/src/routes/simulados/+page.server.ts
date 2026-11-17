import type { PageServerLoad } from './$types';
import { listSimulados } from '$lib/server/simulados';

export const load: PageServerLoad = ({ locals }) => {
	return {
		simulados: listSimulados(locals.user!.id).map((s) => ({
			id: s.id,
			title: s.title,
			kind: s.kind,
			started_at: s.started_at,
			finished_at: s.finished_at,
			elapsed: s.elapsed_seconds,
			result: s.result ? JSON.parse(s.result) : null
		}))
	};
};
