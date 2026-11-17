/**
 * Estrutura oficial do Exame Discursivo do Vestibular Estadual 2027.
 * Fonte principal: Edital de Convocação (UERJ/DEPSEA, publicado em 2026) e seus anexos.
 * Cada regra registra o item do edital de onde foi transcrita.
 */
import type { SourceId } from './sources';

export type DisciplineCode = 'RED' | 'LPL' | 'MAT' | 'FIS' | 'QUI' | 'BIO' | 'HIS' | 'GEO' | 'LE';

export interface DisciplineInfo {
	code: DisciplineCode;
	name: string;
	short: string;
	/** Número de questões na prova de 2026 (último caderno oficial publicado). */
	questionsIn2026: number | null;
	color: string;
}

export const DISCIPLINES: Record<DisciplineCode, DisciplineInfo> = {
	RED: { code: 'RED', name: 'Redação', short: 'Redação', questionsIn2026: null, color: 'var(--c-red)' },
	LPL: {
		code: 'LPL',
		name: 'Língua Portuguesa e Literaturas',
		short: 'Português',
		questionsIn2026: 10,
		color: 'var(--c-lpl)'
	},
	MAT: { code: 'MAT', name: 'Matemática', short: 'Matemática', questionsIn2026: 10, color: 'var(--c-mat)' },
	FIS: { code: 'FIS', name: 'Física', short: 'Física', questionsIn2026: 10, color: 'var(--c-fis)' },
	QUI: { code: 'QUI', name: 'Química', short: 'Química', questionsIn2026: 10, color: 'var(--c-qui)' },
	BIO: { code: 'BIO', name: 'Biologia', short: 'Biologia', questionsIn2026: 10, color: 'var(--c-bio)' },
	HIS: { code: 'HIS', name: 'História', short: 'História', questionsIn2026: 10, color: 'var(--c-his)' },
	GEO: { code: 'GEO', name: 'Geografia', short: 'Geografia', questionsIn2026: 10, color: 'var(--c-geo)' },
	LE: {
		code: 'LE',
		name: 'Língua Estrangeira (Espanhol, Francês ou Inglês)',
		short: 'Língua Estrangeira',
		questionsIn2026: 10,
		color: 'var(--c-le)'
	}
};

export interface OfficialRule {
	text: string;
	source: SourceId;
	ref: string;
}

export const EXAM_2027 = {
	name: 'Exame Discursivo – Vestibular Estadual 2027',
	date: '2026-11-29',
	startTime: '09:00',
	durationHours: 5,
	pointsPerProva: 20,
	discursiveMax: 80,
	finalMax: 100,
	rules: [
		{
			text: 'O Exame Discursivo, realizado em um único dia, será composto de três provas discursivas: uma prova de Redação, para todos os cursos, e duas provas de disciplinas específicas, de acordo com o curso escolhido, valendo 20 (vinte) pontos cada prova.',
			source: 'edital-2027',
			ref: 'item 4.1'
		},
		{
			text: 'Início às 9 (nove) horas, com duração de 5 (cinco) horas.',
			source: 'edital-2027',
			ref: 'item 4.6'
		},
		{
			text: 'As provas avaliarão as competências/habilidades fundamentais das disciplinas específicas de cada grupo de curso (Anexo 4) e versarão sobre os conteúdos do ensino médio (Anexo 5).',
			source: 'edital-2027',
			ref: 'itens 4.3 e 4.4'
		},
		{
			text: 'É proibida a consulta aos livros de Literatura indicados para as provas de Redação e de Língua Portuguesa e Literaturas durante a realização das provas.',
			source: 'edital-2027',
			ref: 'item 4.5'
		},
		{
			text: 'O Exame Discursivo vale 80 (oitenta) pontos, que correspondem ao somatório da pontuação obtida nas três provas, considerando seus respectivos pesos.',
			source: 'edital-2027',
			ref: 'item 5.1'
		},
		{
			text: 'Dupla correção: dois professores atribuem graus à mesma prova, sem se comunicarem. Se a diferença entre as notas for maior do que 2,0 pontos, um terceiro avaliador, membro da banca de elaboração, recorrige a prova e dá a nota final. A correção é "cega".',
			source: 'edital-2027',
			ref: 'item 5.2'
		},
		{
			text: 'Nota zero na prova: respostas ou redação escritas a lápis ou em local inadequado; qualquer identificação feita pelo candidato na prova.',
			source: 'edital-2027',
			ref: 'item 5.4'
		},
		{
			text: 'Uso de vocabulário de baixo calão (palavrões, xingamentos) implica nota zero em questões da prova discursiva e, na Redação, nota zero e eliminação do candidato.',
			source: 'edital-2027',
			ref: 'item 4.16'
		},
		{
			text: 'Será eliminado o candidato que obtiver zero em qualquer uma das três provas do Exame Discursivo.',
			source: 'edital-2027',
			ref: 'item 5.5'
		},
		{
			text: 'A banca de correção, orientada pela banca de elaboração, define se as respostas efetivamente registradas pelos candidatos receberão pontuação total, parcial ou nula.',
			source: 'edital-2027',
			ref: 'item 4.29.5'
		},
		{
			text: 'O padrão de respostas de cada prova é divulgado a fim de que o candidato possa comparar suas respostas com esse padrão e verificar se ou quanto suas respostas são adequadas ou não.',
			source: 'edital-2027',
			ref: 'item 4.28.1'
		},
		{
			text: 'Resultado final: somatório da pontuação do Exame Discursivo (com pesos) e do Exame de Qualificação, até 100 pontos. Conceito A = 20 pontos; B = 15; C = 10; D = 5.',
			source: 'edital-2027',
			ref: 'itens 6.1 e 6.1.1'
		},
		{
			text: 'Serão eliminados os candidatos que obtiverem, como resultado final, um total menor do que 20 (vinte) pontos.',
			source: 'edital-2027',
			ref: 'item 6.2'
		},
		{
			text: 'Desempate: 1º) maior pontuação no Exame Discursivo; 2º) maior pontuação na específica de peso 2; 3º) maior pontuação na específica de peso 1; 4º) maior número de acertos no Exame de Qualificação; 5º) idade mais elevada.',
			source: 'edital-2027',
			ref: 'item 6.3'
		},
		{
			text: 'O candidato pode verificar padrão de respostas, conteúdo avaliado e comentários das questões na seção "Questões Comentadas" da Revista Eletrônica do Vestibular UERJ.',
			source: 'edital-2027',
			ref: 'item 4.31'
		}
	] satisfies OfficialRule[],
	calendar: [
		{ label: 'Aplicação da prova', date: '2026-11-29' },
		{ label: 'Divulgação da prova e do padrão de respostas', date: '2026-11-29' },
		{ label: 'Divulgação da listagem de notas', date: '2026-12-18' },
		{ label: 'Pedido de revisão de notas', date: '2026-12-19', end: '2026-12-23' },
		{ label: 'Notas da revisão e classificação', date: '2027-01-14' }
	],
	calendarSource: 'anexo1-2027' as SourceId,
	conceitoPoints: { A: 20, B: 15, C: 10, D: 5 } as Record<'A' | 'B' | 'C' | 'D', number>
};

/** Critérios oficiais da Redação 2027 – transcrição literal do Anexo 5. */
export const REDACAO_2027 = {
	book: { title: 'O bem-amado', author: 'Dias Gomes' },
	orientation:
		'No Vestibular Estadual 2027, o tema da Redação tem como base o livro O bem-amado, de Dias Gomes, leitura imprescindível para o exame discursivo. O foco da redação é a discussão de uma questão levantada a partir desse texto teatral, que admite posicionamentos diferentes. Por isso, a prova de Redação dá prioridade à capacidade de argumentação do candidato, entendendo-a como um importante requisito da vida acadêmica, quer pela articulação de informações e ideias, quer pelo exercício de recursos expositivos e persuasivos da linguagem.',
	format:
		'Nessa prova, o candidato deve compor uma redação dissertativo-argumentativa, em prosa, com o mínimo de 20 e o máximo de 30 linhas.',
	aspectsText:
		'Serão avaliados os seguintes aspectos: atendimento à questão-tema; redação do texto no gênero dissertativo, com tese principal claramente explicitada, defendida por meio de argumentos válidos, suficientes e pertinentes; conclusão coerente da argumentação; organização das partes da redação por meio de variados recursos de coesão; uso adequado da norma padrão da língua portuguesa; produção de texto que proporciona leitura fluida.',
	source: 'anexo5-2027' as SourceId,
	minLines: 20,
	maxLines: 30
};

/**
 * Os aspectos avaliados, um a um, como enumerados no Anexo 5 (2027) e detalhados no
 * padrão de respostas da Redação 2026 ("Mais especificamente, o candidato deve: ...").
 * A UERJ NÃO publica a distribuição dos 20 pontos entre os aspectos.
 */
export const REDACAO_ASPECTS = [
	{
		id: 'tema',
		label: 'Atendimento à questão-tema',
		official: 'responder à questão-tema, sem "fugir" dela, no todo ou em parte'
	},
	{
		id: 'genero',
		label: 'Gênero dissertativo-argumentativo',
		official: 'redigir a redação no gênero da proposta, ou seja, na forma dissertativa'
	},
	{ id: 'tese', label: 'Tese principal explícita', official: 'apresentar claramente a sua tese principal' },
	{
		id: 'argumentos',
		label: 'Argumentos válidos, suficientes e pertinentes',
		official: 'construir argumentos válidos, suficientes e pertinentes'
	},
	{
		id: 'conclusao',
		label: 'Conclusão coerente',
		official: 'concluir a argumentação de forma coerente'
	},
	{
		id: 'coesao',
		label: 'Coesão',
		official: 'organizar as partes da redação por meio de recursos de coesão'
	},
	{ id: 'norma', label: 'Norma-padrão', official: 'atender à norma padrão da língua portuguesa' },
	{ id: 'fluidez', label: 'Leitura fluida', official: 'apresentar texto de leitura fluida' }
] as const;

export type RedacaoAspectId = (typeof REDACAO_ASPECTS)[number]['id'];

/** Trecho literal do padrão de respostas da Redação 2026. */
export const PADRAO_REDACAO_2026_EXCERPT =
	'O tema da Redação da UERJ apresenta uma questão-problema que admite, no mínimo, três respostas ou soluções: sim, não e depende. Como se observa, não há uma resposta única à questão proposta. O importante é que a redação apresente os argumentos que sustentem a opinião do candidato. A redação deve ser desenvolvida na forma de uma dissertação argumentativa, lembrando sempre que dissertação é a defesa, através de argumentos, da opinião de quem escreve.';

/** Anexo 4 – Competências / habilidades (verbos de comando, transcritos do quadro oficial). */
export const COMPETENCIAS_2027 = [
	{ group: 'Observar', verbs: ['identificar', 'indicar', 'reconhecer', 'nomear', 'apontar', 'representar graficamente'] },
	{
		group: 'Observar (cont.)',
		verbs: ['calcular', 'descrever', 'discriminar', 'interpretar'],
		notes: ['utilizando procedimentos pessoais ou convencionais', 'utilizando diferentes formas de representações', 'estabelecendo diferenças entre níveis de semelhança']
	},
	{
		group: 'Analisar',
		verbs: ['compor ou decompor', 'explicar', 'exemplificar', 'classificar', 'ordenar', 'fazer antecipações', 'transferir', 'levantar', 'justificar'],
		notes: [
			'compor ou decompor em fatores ou elementos básicos',
			'explicar, exemplificar demonstrando compreender relações já estabelecidas',
			'classificar, ordenar de acordo com um critério',
			'fazer antecipações sobre o resultado de experiências e sobre a continuidade de acontecimentos',
			'transferir conhecimentos estabelecidos anteriormente a situações novas',
			'levantar hipóteses, demonstrando o estabelecimento de relações novas',
			'justificar acontecimentos, resultados de experiências, opiniões, interpretações, decisões'
		]
	},
	{ group: 'Avaliar', verbs: ['criticar', 'julgar'], notes: ['com base em critérios internos ou externos'] },
	{
		group: 'Criar',
		verbs: ['apresentar conclusões', 'fazer generalizações'],
		notes: ['a respeito de ideias, textos, acontecimentos, situações', 'fundamentadas, com produção de novas formas e novos conteúdos']
	}
];

/** Dias até a prova (UTC-3 aproximado pelo calendário civil). */
export function daysUntil(dateIso: string, now = new Date()): number {
	const target = new Date(dateIso + 'T09:00:00-03:00').getTime();
	return Math.ceil((target - now.getTime()) / 86_400_000);
}
