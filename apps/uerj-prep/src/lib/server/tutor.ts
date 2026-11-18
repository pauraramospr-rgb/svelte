import { db } from './db';
import type { User } from './auth';
import { getQuestion } from './questions';
import { getTopic } from '$lib/domain/syllabus';
import { getObra } from '$lib/data/content/obras';
import { findCourse, courseDisciplines } from '$lib/data/official/courses-2027';
import { DISCIPLINES } from '$lib/data/official/exam-2027';
import { referenceAnswer } from '$lib/questions/types';
import { topicPerformance } from './progress';
import { tutorSystemPrompt } from './ai/tasks';

export interface TutorContext {
	kind: 'questao' | 'topico' | 'obra' | 'redacao';
	id: string;
}

/** Texto de contexto injetado no prompt do tutor (questão, tópico, obra ou redação). */
export function contextText(user: User, ctx: TutorContext | null): { label: string; text: string } | null {
	if (!ctx) return null;
	if (ctx.kind === 'questao') {
		const q = getQuestion(ctx.id);
		if (!q) return null;
		const last = db()
			.prepare('SELECT answer FROM attempts WHERE user_id = ? AND question_id = ? ORDER BY id DESC LIMIT 1')
			.get(user.id, q.id) as { answer: string } | undefined;
		return {
			label: q.source === 'oficial' ? `Questão UERJ ${q.year} nº ${q.number} (${DISCIPLINES[q.discipline].short})` : `Questão inédita (${DISCIPLINES[q.discipline].short})`,
			text: `O estudante quer discutir esta questão (${q.source === 'oficial' ? 'oficial da UERJ' : 'inédita, criada pela plataforma'}):\n${q.statement}\n\n${referenceAnswer(q)}${
				last ? `\n\nÚltima resposta do estudante:\n${last.answer}` : ''
			}\n\nNão entregue a resposta pronta de início: guie o raciocínio.`
		};
	}
	if (ctx.kind === 'topico') {
		const t = getTopic(ctx.id);
		if (!t) return null;
		return { label: `Tópico: ${t.topic.title}`, text: `Tópico do programa oficial 2027 (${DISCIPLINES[t.discipline].name}, unidade “${t.unit}”): ${t.topic.title}. Subtópicos: ${t.topic.subtopics.join('; ')}.` };
	}
	if (ctx.kind === 'obra') {
		const o = getObra(ctx.id);
		if (!o) return null;
		return {
			label: `Obra: ${o.title}`,
			text: `O estudante quer estudar a obra “${o.title}”, de ${o.author} (${o.exam}). Resumo de referência da plataforma:\n${o.resumo.map((r) => `${r.title}: ${r.text}`).join('\n')}\nPersonagens: ${o.personagens.map((p) => `${p.name} — ${p.text}`).join('\n')}\n${o.trechos ? `Trechos que a plataforma comenta (citações exatas): ${o.trechos.map((t) => `${t.ref}: ${t.texto}`).join('\n')}\n` : ''}Pontos que variam entre edições/adaptações e devem ser conferidos no livro: ${o.confiraNaLeitura.join(' ')}\nSe o estudante perguntar detalhes do enredo que você não puder garantir, diga isso e oriente a conferir no texto.`
		};
	}
	if (ctx.kind === 'redacao') {
		const e = db().prepare('SELECT prompt, title, body, correction FROM essays WHERE id = ? AND user_id = ?').get(Number(ctx.id), user.id) as
			| { prompt: string; title: string; body: string; correction: string | null }
			| undefined;
		if (!e) return null;
		return {
			label: `Redação: ${e.title || 'sem título'}`,
			text: `Redação do estudante (proposta: ${e.prompt}).\nTítulo: ${e.title}\n${e.body}\n\nCorreção registrada: ${e.correction ?? '(ainda não corrigida)'}`
		};
	}
	return null;
}

export function buildSystem(user: User, focus: string | undefined): string {
	const course = findCourse(user.course_id);
	const weak = topicPerformance(user.id)
		.filter((p) => p.graded > 0 && (p.avgCredit ?? 1) < 0.6)
		.slice(0, 6)
		.map((p) => p.title);
	return tutorSystemPrompt({
		name: user.name.split(' ')[0],
		level: user.level,
		course: course ? `${course.name} (${course.campus})` : undefined,
		disciplines: course ? courseDisciplines(course).map((d) => `${DISCIPLINES[d.code].name} (peso ${d.weight})`) : undefined,
		weakTopics: weak,
		focus
	});
}

export function listThreads(userId: number) {
	return db().prepare('SELECT id, title, updated_at FROM chat_threads WHERE user_id = ? ORDER BY updated_at DESC LIMIT 50').all(userId) as {
		id: number;
		title: string;
		updated_at: string;
	}[];
}

export function getThread(userId: number, id: number) {
	const t = db().prepare('SELECT id, title, context FROM chat_threads WHERE id = ? AND user_id = ?').get(id, userId) as
		| { id: number; title: string; context: string | null }
		| undefined;
	if (!t) return null;
	const messages = db().prepare('SELECT role, content FROM chat_messages WHERE thread_id = ? ORDER BY id').all(id) as { role: 'user' | 'assistant'; content: string }[];
	return { ...t, messages };
}
