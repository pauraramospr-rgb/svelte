import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createSimulado, defaultConfig } from '$lib/server/simulados';
import { DISCIPLINES, type DisciplineCode } from '$lib/data/official/exam-2027';
import { findCourse } from '$lib/data/official/courses-2027';
import { TEMAS_2027 } from '$lib/data/content/redacao-temas';
import { REDACAO_HISTORY } from '$lib/data/official/redacao-history';

export const load: PageServerLoad = ({ locals }) => {
	return {
		course: findCourse(locals.user!.course_id) ?? null,
		disciplines: Object.values(DISCIPLINES).filter((d) => d.code !== 'RED'),
		temas: TEMAS_2027.map((t) => ({ id: t.id, question: t.question })),
		oficiais: REDACAO_HISTORY.filter((r) => r.book).map((r) => ({ id: `oficial-${r.edition}`, question: `${r.edition}: ${r.question} (${r.book})` }))
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const user = locals.user!;
		const f = await request.formData();
		const kind = String(f.get('kind')) as 'completo' | 'disciplina';
		const discipline = String(f.get('discipline') ?? '') as DisciplineCode;
		const perProva = Math.min(10, Math.max(1, Number(f.get('perProva')) || 10));
		const mix = String(f.get('mix') ?? 'misto') as 'oficial' | 'inedita' | 'misto';
		const theme = String(f.get('theme') ?? '');
		const duration = Math.min(300, Math.max(10, Number(f.get('duration')) || 0));
		if (!['completo', 'disciplina'].includes(kind) || !['oficial', 'inedita', 'misto'].includes(mix)) return fail(400, { error: 'Opções inválidas.' });
		if (kind === 'disciplina' && !(discipline in DISCIPLINES)) return fail(400, { error: 'Escolha a disciplina.' });
		const cfg = defaultConfig(user, kind, discipline);
		if (!cfg) return fail(400, { error: 'Escolha seu curso no perfil para fazer o simulado completo.' });
		cfg.perProva = perProva;
		cfg.mix = mix;
		if (theme) cfg.themeId = theme;
		const minutes = duration || (kind === 'completo' ? 300 : perProva * 15);
		const id = createSimulado(user, cfg, minutes);
		redirect(303, `/simulados/${id}`);
	}
};
