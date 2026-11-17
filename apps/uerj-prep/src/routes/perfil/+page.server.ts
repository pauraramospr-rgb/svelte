import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { COURSES_2027, findCourse } from '$lib/data/official/courses-2027';
import { updateProfile } from '$lib/server/auth';

export const load: PageServerLoad = ({ locals }) => {
	return { profile: locals.user!, courses: COURSES_2027 };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const f = await request.formData();
		const courseId = String(f.get('course_id') ?? '');
		const level = String(f.get('level') ?? '');
		const examDate = String(f.get('exam_date') ?? '');
		const eq = String(f.get('eq_conceito') ?? '');
		const le = String(f.get('le_language') ?? '');
		const hours = Number(f.get('weekly_hours') ?? 12);
		const name = String(f.get('name') ?? '').trim();
		if (courseId && !findCourse(courseId)) return fail(400, { error: 'Curso inválido.' });
		if (!['iniciante', 'intermediario', 'avancado'].includes(level)) return fail(400, { error: 'Nível inválido.' });
		if (!/^\d{4}-\d{2}-\d{2}$/.test(examDate)) return fail(400, { error: 'Data inválida.' });
		if (eq && !['A', 'B', 'C', 'D'].includes(eq)) return fail(400, { error: 'Conceito inválido.' });
		if (le && !['Espanhol', 'Francês', 'Inglês'].includes(le)) return fail(400, { error: 'Língua inválida.' });
		if (!Number.isFinite(hours) || hours < 1 || hours > 80) return fail(400, { error: 'Horas semanais entre 1 e 80.' });
		if (name.length < 2) return fail(400, { error: 'Informe seu nome.' });
		updateProfile(locals.user!.id, {
			name,
			course_id: courseId || null,
			level: level as 'iniciante',
			exam_date: examDate,
			eq_conceito: (eq || null) as 'A' | null,
			le_language: (le || null) as 'Inglês' | null,
			weekly_hours: Math.round(hours)
		});
		return { saved: true };
	}
};
