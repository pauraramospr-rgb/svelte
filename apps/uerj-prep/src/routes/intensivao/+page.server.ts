import type { PageServerLoad } from './$types';
import { aulasDoIntensivao, GRUPOS_INTENSIVAO } from '$lib/intensivao';

export const load: PageServerLoad = () => ({ aulas: aulasDoIntensivao(), grupos: [...GRUPOS_INTENSIVAO] });
