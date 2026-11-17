/**
 * Gerador de cronograma personalizado (interpretação pedagógica da plataforma).
 *
 * Prioridade de cada tópico = peso da disciplina no curso (edital) ×
 *   (0,4 + incidência histórica normalizada, de 0 a 1) × (0,5 + necessidade),
 * onde necessidade = 1 − domínio (média de crédito nas tentativas) ou 0,6 se nunca praticado.
 * Revisões vencidas recebem bônus. Cada bloco agendado reduz pela metade a prioridade do
 * tópico, distribuindo o estudo. A Redação recebe um bloco de escrita a cada 3 dias.
 */
export interface PlannerTopic {
	id: string;
	discipline: string;
	title: string;
	incidence: number; // 0–1 (normalizada dentro da disciplina)
	mastery: number | null; // 0–1, null = nunca praticado
	due: boolean;
}

export interface PlannerInput {
	today: Date;
	examDate: Date;
	weeklyHours: number;
	disciplines: { code: string; weight: number }[];
	topics: PlannerTopic[];
	maxDays?: number;
}

export interface PlanBlock {
	discipline: string;
	topicId: string | null;
	title: string;
	activity: string;
	minutes: number;
}

export interface PlanDay {
	date: string; // YYYY-MM-DD
	blocks: PlanBlock[];
	note?: string;
}

const BLOCK_MIN = 50;

export function topicPriority(t: PlannerTopic, weight: number): number {
	const need = t.mastery === null ? 0.6 : 1 - t.mastery;
	return weight * (0.4 + t.incidence) * (0.5 + need) * (t.due ? 1.5 : 1);
}

function activityFor(t: PlannerTopic): string {
	if (t.due) return 'Revisão espaçada: refaça questões do tópico sem consultar o resumo';
	if (t.mastery === null) return 'Estudo: leia o resumo e resolva 2 questões oficiais';
	if (t.mastery < 0.6) return 'Reforço: revise os erros com o tutor e resolva questões novas';
	return 'Consolidação: questão inédita de nível difícil';
}

export function isoDate(d: Date): string {
	return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function planSchedule(input: PlannerInput): PlanDay[] {
	const { today, examDate, weeklyHours, disciplines, topics } = input;
	const msDay = 86_400_000;
	const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
	const exam = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());
	let days = Math.round((exam.getTime() - start.getTime()) / msDay);
	if (days <= 0) days = 28; // prova já ocorreu: plano de 4 semanas para a próxima edição
	days = Math.min(days, input.maxDays ?? 42);

	const blocksPerDay = Math.max(1, Math.round((weeklyHours * 60) / 7 / BLOCK_MIN));
	const weightOf = new Map(disciplines.map((d) => [d.code, d.weight]));
	const pool = topics
		.filter((t) => weightOf.has(t.discipline) && t.discipline !== 'RED')
		.map((t) => ({ t, p: topicPriority(t, weightOf.get(t.discipline)!) }));

	const plan: PlanDay[] = [];
	for (let i = 0; i < days; i++) {
		const date = new Date(start.getTime() + i * msDay);
		const blocks: PlanBlock[] = [];
		const daysLeft = days - i;
		if (daysLeft === 1 && days > 1) {
			plan.push({
				date: isoDate(date),
				blocks: [
					{ discipline: 'RED', topicId: null, title: 'Releitura de anotações sobre o livro da Redação', activity: 'Revisão leve', minutes: BLOCK_MIN }
				],
				note: 'Véspera da prova: revisão leve, descanso e conferência dos documentos exigidos (edital, item 4.7).'
			});
			continue;
		}
		let slots = blocksPerDay;
		if (weightOf.has('RED') && i % 3 === 0) {
			blocks.push({
				discipline: 'RED',
				topicId: null,
				title: 'Redação dissertativo-argumentativa (20–30 linhas)',
				activity: 'Escreva no Laboratório de Redação em até 1h e envie para correção',
				minutes: 60
			});
			slots -= 1;
		}
		for (let s = 0; s < slots && pool.length; s++) {
			pool.sort((a, b) => b.p - a.p);
			// evita repetir o mesmo tópico no mesmo dia
			const pick = pool.find((x) => !blocks.some((b) => b.topicId === x.t.id)) ?? pool[0];
			blocks.push({ discipline: pick.t.discipline, topicId: pick.t.id, title: pick.t.title, activity: activityFor(pick.t), minutes: BLOCK_MIN });
			pick.p *= 0.5;
			pick.t = { ...pick.t, due: false };
		}
		plan.push({ date: isoDate(date), blocks });
	}
	return plan;
}
