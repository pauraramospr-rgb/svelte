import { callStructured, callText, model } from './client';
import { DISCIPLINES, REDACAO_2027, REDACAO_ASPECTS, PADRAO_REDACAO_2026_EXCERPT, COMPETENCIAS_2027 } from '$lib/data/official/exam-2027';
import type { DisciplineCode } from '$lib/data/official/exam-2027';
import { referenceAnswer, type Question, type NewQuestion, type Difficulty } from '$lib/questions/types';
import { styleExamples } from '../questions';
import { getTopic } from '$lib/domain/syllabus';
import { CREDIT_FROM_LABEL, type CreditLabel } from '$lib/domain/scoring';

const LEVEL_TEXT = {
	iniciante: 'iniciante (precisa de explicações a partir dos fundamentos, com vocabulário acessível)',
	intermediario: 'intermediário (domina o básico; precisa consolidar e ganhar precisão)',
	avancado: 'avançado (busca refinamento, rigor e casos difíceis)'
} as const;
export type Level = keyof typeof LEVEL_TEXT;

const INTEGRITY = `Regras de integridade (obrigatórias):
- Nunca invente dados estatísticos, referências bibliográficas, critérios de correção ou informações sobre o vestibular da UERJ.
- Quando não souber algo com segurança, diga isso explicitamente.
- Não apresente conteúdo produzido por você como oficial da UERJ.
- Escreva em português do Brasil, com norma-padrão.`;

/* ------------------------------------------------------------------ correção de respostas */

export interface AnswerFeedback {
	credit: CreditLabel;
	summary: string;
	correctPoints: string[];
	conceptualErrors: { excerpt: string; problem: string; correction: string }[];
	missingElements: string[];
	improvedAnswer: string;
	studyTips: string[];
	confidence: 'alta' | 'media' | 'baixa';
}

const ANSWER_SCHEMA = {
	type: 'object',
	additionalProperties: false,
	required: ['credit', 'summary', 'correctPoints', 'conceptualErrors', 'missingElements', 'improvedAnswer', 'studyTips', 'confidence'],
	properties: {
		credit: { type: 'string', enum: ['total', 'parcial', 'nula'] },
		summary: { type: 'string' },
		correctPoints: { type: 'array', items: { type: 'string' } },
		conceptualErrors: {
			type: 'array',
			items: {
				type: 'object',
				additionalProperties: false,
				required: ['excerpt', 'problem', 'correction'],
				properties: { excerpt: { type: 'string' }, problem: { type: 'string' }, correction: { type: 'string' } }
			}
		},
		missingElements: { type: 'array', items: { type: 'string' } },
		improvedAnswer: { type: 'string' },
		studyTips: { type: 'array', items: { type: 'string' } },
		confidence: { type: 'string', enum: ['alta', 'media', 'baixa'] }
	}
};

export async function gradeAnswer(q: Question, answer: string, level: Level, userId: number): Promise<AnswerFeedback & { creditValue: number }> {
	const ref = referenceAnswer(q);
	const system = `Você é um professor experiente de ${DISCIPLINES[q.discipline].name}, corretor de provas discursivas no padrão do Exame Discursivo da UERJ.

Metodologia (declarada ao estudante):
- O edital da UERJ (item 4.29.5) prevê que cada resposta recebe pontuação TOTAL, PARCIAL ou NULA. A UERJ não publica a fração exata da pontuação parcial; a plataforma usa 50%.
- Compare a resposta do estudante com a REFERÊNCIA fornecida (comentário/objetivo oficial da UERJ para questões oficiais; resposta-modelo da plataforma para questões inéditas).
- TOTAL: atende a todos os itens pedidos no comando, sem erro conceitual. PARCIAL: atende parte do que foi pedido, ou acerta o essencial com erro/omissão relevante. NULA: não atende ao comando, está conceitualmente errada ou em branco.
- Respostas por outros caminhos válidos devem ser aceitas se corretas e completas.
- Seja específico: cite trechos exatos da resposta do estudante em "excerpt".
- "improvedAnswer": reescreva a resposta do estudante de forma completa e concisa, como seria esperada na prova (2 a 6 frases), sem copiar literalmente a referência.
- Adapte o tom ao nível do estudante: ${LEVEL_TEXT[level]}.
- Se a referência estiver incompleta (ex.: fórmulas ou figuras não transcritas), use seu conhecimento, mas marque "confidence" como "media" ou "baixa".

${INTEGRITY}`;
	const user = `QUESTÃO (${q.source === 'oficial' ? `oficial UERJ ${q.year}, questão ${q.number}` : 'inédita da plataforma'}):
${q.statement}

REFERÊNCIA:
${ref}

RESPOSTA DO ESTUDANTE:
"""
${answer.slice(0, 6000)}
"""`;
	const r = await callStructured<AnswerFeedback>({ task: 'correcao', userId, system, user, schema: ANSWER_SCHEMA, effort: 'medium', maxTokens: 12000 });
	return { ...r, creditValue: CREDIT_FROM_LABEL[r.credit] };
}

/* ------------------------------------------------------------------ correção de redação */

export type AspectRating = 'atende' | 'atende_parcialmente' | 'nao_atende';

export interface EssayCorrection {
	identifiedThesis: string;
	aspects: { id: (typeof REDACAO_ASPECTS)[number]['id']; rating: AspectRating; comment: string; evidence: string[] }[];
	formal: { isProse: boolean; hasTitle: boolean; offensiveLanguage: boolean; identificationRisk: boolean; notes: string };
	problems: { type: 'argumentacao' | 'coesao' | 'coerencia' | 'estrutura' | 'norma' | 'tema'; excerpt: string; explanation: string; rewrite: string }[];
	strengths: string[];
	rewriteSuggestions: { original: string; suggestion: string; why: string }[];
	overall: string;
	nextSteps: string[];
}

const ESSAY_SCHEMA = {
	type: 'object',
	additionalProperties: false,
	required: ['identifiedThesis', 'aspects', 'formal', 'problems', 'strengths', 'rewriteSuggestions', 'overall', 'nextSteps'],
	properties: {
		identifiedThesis: { type: 'string' },
		aspects: {
			type: 'array',
			items: {
				type: 'object',
				additionalProperties: false,
				required: ['id', 'rating', 'comment', 'evidence'],
				properties: {
					id: { type: 'string', enum: REDACAO_ASPECTS.map((a) => a.id) },
					rating: { type: 'string', enum: ['atende', 'atende_parcialmente', 'nao_atende'] },
					comment: { type: 'string' },
					evidence: { type: 'array', items: { type: 'string' } }
				}
			}
		},
		formal: {
			type: 'object',
			additionalProperties: false,
			required: ['isProse', 'hasTitle', 'offensiveLanguage', 'identificationRisk', 'notes'],
			properties: {
				isProse: { type: 'boolean' },
				hasTitle: { type: 'boolean' },
				offensiveLanguage: { type: 'boolean' },
				identificationRisk: { type: 'boolean' },
				notes: { type: 'string' }
			}
		},
		problems: {
			type: 'array',
			items: {
				type: 'object',
				additionalProperties: false,
				required: ['type', 'excerpt', 'explanation', 'rewrite'],
				properties: {
					type: { type: 'string', enum: ['argumentacao', 'coesao', 'coerencia', 'estrutura', 'norma', 'tema'] },
					excerpt: { type: 'string' },
					explanation: { type: 'string' },
					rewrite: { type: 'string' }
				}
			}
		},
		strengths: { type: 'array', items: { type: 'string' } },
		rewriteSuggestions: {
			type: 'array',
			items: {
				type: 'object',
				additionalProperties: false,
				required: ['original', 'suggestion', 'why'],
				properties: { original: { type: 'string' }, suggestion: { type: 'string' }, why: { type: 'string' } }
			}
		},
		overall: { type: 'string' },
		nextSteps: { type: 'array', items: { type: 'string' } }
	}
};

export async function correctEssay(args: { prompt: string; title: string; body: string; level: Level; userId: number }): Promise<EssayCorrection> {
	const aspects = REDACAO_ASPECTS.map((a) => `- ${a.id}: ${a.label} — critério oficial: "${a.official}"`).join('\n');
	const system = `Você é um professor de redação experiente, especializado na prova de Redação do Exame Discursivo da UERJ.

CRITÉRIOS OFICIAIS (Anexo 5 do Edital do Exame Discursivo 2027, transcrição literal):
"${REDACAO_2027.format} ${REDACAO_2027.aspectsText}"

Trecho do padrão de respostas oficial da Redação 2026:
"${PADRAO_REDACAO_2026_EXCERPT}"

Avalie CADA um dos 8 aspectos abaixo (use exatamente estes ids, todos uma vez):
${aspects}

Regras:
- Classifique cada aspecto como "atende", "atende_parcialmente" ou "nao_atende", justificando com trechos LITERAIS do texto em "evidence".
- Não invente critérios além dos oficiais. Não atribua nota numérica: a pontuação é calculada pela plataforma com metodologia própria e declarada.
- Aponte problemas concretos de argumentação, coesão, coerência, estrutura, norma-padrão e adequação ao tema, sempre com o trecho e uma reescrita sugerida.
- "formal.offensiveLanguage": true apenas se houver vocabulário de baixo calão (o edital, item 4.16, prevê nota zero e eliminação). "formal.identificationRisk": true se houver assinatura, nome ou marca que identifique o autor (item 5.4).
- Se o texto não for dissertativo-argumentativo (ex.: narrativa, resumo do livro), indique em "genero".
- Relacione, quando pertinente, o uso (ou ausência) do livro-base indicado na proposta.
- Adapte a linguagem ao nível do estudante: ${LEVEL_TEXT[args.level]}.

${INTEGRITY}`;
	const user = `PROPOSTA / QUESTÃO-TEMA:
${args.prompt}

TÍTULO: ${args.title || '(sem título)'}

REDAÇÃO DO ESTUDANTE:
"""
${args.body.slice(0, 12000)}
"""`;
	return callStructured<EssayCorrection>({ task: 'redacao', userId: args.userId, system, user, schema: ESSAY_SCHEMA, effort: 'high', maxTokens: 20000 });
}

/* ------------------------------------------------------------------ geração de questões inéditas */

const QUESTION_SCHEMA = {
	type: 'object',
	additionalProperties: false,
	required: ['statement', 'modelAnswer', 'explanation', 'skills', 'knowledge', 'patternRationale', 'commonMistakes'],
	properties: {
		statement: { type: 'string' },
		modelAnswer: { type: 'string' },
		explanation: { type: 'string' },
		skills: { type: 'array', items: { type: 'string' } },
		knowledge: { type: 'array', items: { type: 'string' } },
		patternRationale: { type: 'string' },
		commonMistakes: { type: 'array', items: { type: 'string' } }
	}
};

export async function generateQuestion(args: {
	discipline: DisciplineCode;
	topicId?: string;
	difficulty: Difficulty;
	userId: number;
	language?: string | null;
}): Promise<Omit<NewQuestion, 'id' | 'source' | 'origin'>> {
	const topic = args.topicId ? getTopic(args.topicId) : undefined;
	const examples = styleExamples(args.discipline, args.topicId, 3);
	const exText = examples
		.map(
			(e, i) =>
				`EXEMPLO OFICIAL ${i + 1} (UERJ ${e.year}, questão ${e.number}; item do programa: ${e.programItems.join('; ')}):\n${e.statement}\nObjetivo oficial: ${e.objective}`
		)
		.join('\n\n');
	const verbs = COMPETENCIAS_2027.flatMap((c) => c.verbs).join(', ');
	const system = `Você é um elaborador experiente de questões discursivas para o Exame Discursivo da UERJ.
Sua tarefa é criar UMA questão INÉDITA (não copie, não parafraseie questões existentes), no padrão histórico da banca:
- contextualização com situação-problema, dado, texto curto, gráfico descrito em palavras ou caso real plausível; quando usar dados, deixe claro que são ilustrativos se não forem reais verificáveis;
- comando objetivo com verbos de competência do Anexo 4 do edital (${verbs});
- frequentemente dois itens encadeados no mesmo comando ("... Em seguida, ...", "Indique ... e, também, ...");
- resposta que exija raciocínio e justificativa, cabível em poucas linhas;
- conteúdo restrito ao programa oficial (Anexo 5) da disciplina.
Dificuldade pedida: ${args.difficulty}.
Não invente citações atribuídas a autores reais nem dados estatísticos apresentados como reais. Se precisar de texto-base, escreva um texto original e identifique-o como "Texto elaborado para esta questão".
Fórmulas em texto simples (ex.: v = Δs/Δt, x², √2). Não use LaTeX.
Em "patternRationale", explique como a questão segue o padrão dos exemplos oficiais fornecidos (estrutura, comando, contextualização), sem afirmar que seja oficial.
Em "skills", liste verbos/competências do Anexo 4 exigidos; em "knowledge", os itens do programa avaliados.

${INTEGRITY}`;
	const user = `Disciplina: ${DISCIPLINES[args.discipline].name}${args.discipline === 'LE' && args.language ? ` (enunciado e texto-base em ${args.language}; comando em português)` : ''}
Tópico do programa oficial 2027: ${topic ? `${topic.topic.title} — ${topic.topic.subtopics.join('; ')} (unidade: ${topic.unit})` : 'livre, dentro do programa'}

${exText || '(sem exemplos oficiais disponíveis para este tópico)'}`;
	const r = await callStructured<Omit<NewQuestion, 'id' | 'source' | 'origin' | 'discipline' | 'difficulty' | 'topicIds' | 'model'>>({
		task: 'questao_inedita',
		userId: args.userId,
		system,
		user,
		schema: QUESTION_SCHEMA,
		effort: 'high',
		maxTokens: 16000
	});
	return {
		...r,
		discipline: args.discipline,
		difficulty: args.difficulty,
		topicIds: args.topicId ? [args.topicId] : [],
		model: model(),
		language: args.discipline === 'LE' ? (args.language ?? undefined) : undefined
	};
}

/* ------------------------------------------------------------------ resumos sob demanda */

export async function generateSummary(args: { topicId: string; level: Level; userId: number }): Promise<string> {
	const t = getTopic(args.topicId);
	if (!t) throw new Error('Tópico inexistente');
	const examples = styleExamples(t.discipline, args.topicId, 2);
	const exText = examples.map((e) => `- UERJ ${e.year}, questão ${e.number}: ${e.statement.slice(0, 700)}`).join('\n');
	const system = `Você é um professor universitário e autor de material didático para o vestibular da UERJ.
Escreva um resumo estratégico, aprofundado e didático, em Markdown, sobre o tópico indicado, para um estudante de nível ${LEVEL_TEXT[args.level]}.
Use exatamente estas seções (títulos de nível 2):
## Conceitos fundamentais
## Explicação detalhada
## Exemplos práticos
## Fórmulas e aplicações  (omita se não pertinente à disciplina)
## Contexto histórico e científico
## Relações com outros conteúdos
## Como o assunto pode aparecer na prova discursiva
## Exercícios de fixação  (3 exercícios discursivos curtos, com respostas comentadas ao final)
Na seção sobre a prova, baseie-se nos exemplos oficiais fornecidos (cite ano e número) e deixe claro que se trata de possibilidade, não de garantia.
Fórmulas em texto simples, sem LaTeX. Não invente dados, datas ou referências: se citar um fato, ele deve ser amplamente estabelecido.

${INTEGRITY}`;
	const user = `Disciplina: ${DISCIPLINES[t.discipline].name}
Unidade: ${t.unit}
Tópico (programa oficial 2027): ${t.topic.title}
Subtópicos oficiais: ${t.topic.subtopics.join('; ') || '—'}

Questões oficiais relacionadas:
${exText || '(nenhuma classificada neste tópico)'}`;
	return callText({ task: 'resumo', userId: args.userId, system, user, effort: 'medium', maxTokens: 32000 });
}

/* ------------------------------------------------------------------ tutor */

export function tutorSystemPrompt(ctx: {
	name: string;
	level: Level;
	course?: string;
	disciplines?: string[];
	weakTopics?: string[];
	focus?: string;
}): string {
	return `Você é um professor particular experiente que prepara estudantes para o Exame Discursivo da UERJ (Vestibular Estadual 2027).

Estudante: ${ctx.name}. Nível: ${LEVEL_TEXT[ctx.level]}.${ctx.course ? `\nCurso pretendido: ${ctx.course}. Provas: ${ctx.disciplines?.join(', ')}.` : ''}${
		ctx.weakTopics?.length ? `\nTópicos com mais dificuldade registrada na plataforma: ${ctx.weakTopics.join('; ')}.` : ''
	}${ctx.focus ? `\n\nCONTEXTO DESTA CONVERSA:\n${ctx.focus}` : ''}

Como você ensina:
- Priorize a compreensão real: pergunte o que o estudante já sabe, explique a partir dos fundamentos, use exemplos concretos e verifique o entendimento com uma pergunta curta ao final quando fizer sentido.
- Ao resolver questões, mostre o raciocínio passo a passo e, se o estudante pedir apenas a resposta, ofereça antes uma dica que o ajude a chegar sozinho.
- Ao corrigir respostas discursivas, aponte acertos, erros conceituais e o que faltou, e mostre como ficaria uma resposta completa.
- Relacione conteúdos de disciplinas diferentes quando isso ajudar.
- Sugira exercícios complementares adequados ao nível.
- Escreva fórmulas em texto simples (sem LaTeX). Use Markdown leve.

Informações sobre o vestibular (fatos oficiais do edital 2027):
- Exame Discursivo em 29/11/2026, às 9h, com 5 horas de duração; três provas de 20 pontos: Redação (peso 1) e duas específicas do curso (pesos 2 e 1); total de 80 pontos; resultado final soma o conceito do Exame de Qualificação (A=20, B=15, C=10, D=5).
- Redação 2027 baseada em "O bem-amado", de Dias Gomes; prova de Língua Portuguesa e Literaturas baseada em "Luanda, Lisboa, Paraíso", de Djaimilia Pereira de Almeida.
Ao falar do vestibular, diferencie sempre: (1) informação oficial, (2) análise de provas anteriores, (3) interpretação pedagógica, (4) previsão/possibilidade. Para qualquer outra informação sobre o processo seletivo, oriente a conferir www.vestibular.uerj.br.

${INTEGRITY}`;
}
