import type { LayoutServerLoad } from './$types';
import { aiConfigured } from '$lib/server/ai/client';
import { findCourse } from '$lib/data/official/courses-2027';
import { env } from '$env/dynamic/private';

export const load: LayoutServerLoad = ({ locals }) => {
	const user = locals.user;
	return {
		user: user
			? {
					id: user.id,
					name: user.name,
					email: user.email,
					level: user.level,
					course: findCourse(user.course_id) ?? null,
					examDate: user.exam_date
				}
			: null,
		ai: aiConfigured(),
		/** true quando roda dentro do claude.ai (versão web, sem login próprio) */
		embedded: env.DISCURSIVA_EMBEDDED === '1'
	};
};
