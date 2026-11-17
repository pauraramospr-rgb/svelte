import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { officialQuestions } from '$lib/server/questions';
import { INCIDENCE } from '$lib/domain/syllabus';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.user) redirect(303, '/painel');
	return { officialCount: officialQuestions().length, years: INCIDENCE.years };
};
