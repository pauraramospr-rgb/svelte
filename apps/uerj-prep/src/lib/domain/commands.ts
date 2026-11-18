/**
 * Verbos de comando nas questões oficiais (categoria: análise de provas anteriores).
 * Conta, para cada questão, os verbos no imperativo presentes no enunciado.
 */
export const COMMAND_VERBS = [
	'indique',
	'identifique',
	'explique',
	'apresente',
	'aponte',
	'calcule',
	'nomeie',
	'determine',
	'cite',
	'justifique',
	'escreva',
	'transcreva',
	'descreva',
	'destaque',
	'reescreva',
	'classifique',
	'relacione',
	'estabeleça',
	'exemplifique',
	'compare',
	'diferencie',
	'defina',
	'caracterize',
	'demonstre',
	'mencione',
	'analise',
	'interprete',
	'reconheça'
] as const;

export interface CommandStats {
	total: number;
	multi: number;
	verbs: { verb: string; count: number }[];
	byDiscipline: Record<string, { questions: number; verbs: { verb: string; count: number }[] }>;
}

const RE = new Map(COMMAND_VERBS.map((v) => [v, new RegExp(`(^|[^\\p{L}])${v}(?![\\p{L}])`, 'iu')]));

export function commandsIn(statement: string): string[] {
	return COMMAND_VERBS.filter((v) => RE.get(v)!.test(statement));
}

export function commandStats(questions: { discipline: string; statement: string }[]): CommandStats {
	const all = new Map<string, number>();
	const by: Record<string, { questions: number; counts: Map<string, number> }> = {};
	let multi = 0;
	for (const q of questions) {
		const found = commandsIn(q.statement);
		if (found.length >= 2) multi++;
		const d = (by[q.discipline] ??= { questions: 0, counts: new Map() });
		d.questions++;
		for (const v of found) {
			all.set(v, (all.get(v) ?? 0) + 1);
			d.counts.set(v, (d.counts.get(v) ?? 0) + 1);
		}
	}
	const sort = (m: Map<string, number>) => [...m].map(([verb, count]) => ({ verb, count })).sort((a, b) => b.count - a.count || a.verb.localeCompare(b.verb));
	return {
		total: questions.length,
		multi,
		verbs: sort(all),
		byDiscipline: Object.fromEntries(Object.entries(by).map(([k, v]) => [k, { questions: v.questions, verbs: sort(v.counts).slice(0, 5) }]))
	};
}
