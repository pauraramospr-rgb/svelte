/**
 * Questões-tema oficiais da Redação da UERJ (2017–2026), transcritas dos cadernos de prova.
 * Fonte: www.vestibular.uerj.br (seções "Provas e Padrões de Resposta" de cada edição).
 */
export interface RedacaoHistoryItem {
	edition: number;
	exam: 'Exame Discursivo' | 'Exame Único';
	book: string | null;
	question: string;
	provaUrl: string;
	padraoUrl?: string;
}

export const REDACAO_HISTORY: RedacaoHistoryItem[] = [
	{
		edition: 2026,
		exam: 'Exame Discursivo',
		book: 'Hamlet, de William Shakespeare',
		question: 'É possível, nos dias atuais, ser fiel a si mesmo, como aconselha Polônio?',
		provaUrl: 'https://www.vestibular.uerj.br/anexos/263/provas/Redacao.pdf',
		padraoUrl: 'https://www.vestibular.uerj.br/anexos/263/padroes/Redacao.pdf'
	},
	{
		edition: 2025,
		exam: 'Exame Discursivo',
		book: 'O conto da aia, de Margaret Atwood',
		question: 'O governo de uma nação pode exercer controle sobre o corpo feminino com base em princípios religiosos?',
		provaUrl: 'https://www.vestibular.uerj.br/anexos/253/provas/Redacao.pdf',
		padraoUrl: 'https://www.vestibular.uerj.br/anexos/253/padroes/Redacao.pdf'
	},
	{
		edition: 2024,
		exam: 'Exame Discursivo',
		book: 'O menino do pijama listrado, de John Boyne',
		question: 'Qual seria, para você, a moral da história narrada em O menino do pijama listrado?',
		provaUrl: 'https://www.vestibular.uerj.br/anexos/243/prova/Redacao.pdf',
		padraoUrl: 'https://www.vestibular.uerj.br/anexos/243/prova/redacao_1.pdf'
	},
	{
		edition: 2023,
		exam: 'Exame Único',
		book: 'Não me abandone jamais, de Kazuo Ishiguro',
		question: 'A capacidade de se opor a um destino socialmente estabelecido fortalece nossa humanidade?',
		provaUrl: 'https://www.vestibular.uerj.br/anexos/233/redacao_vestibular_2023.pdf',
		padraoUrl: 'https://www.vestibular.uerj.br/anexos/233/padrao_resposta_2023.pdf'
	},
	{
		edition: 2022,
		exam: 'Exame Único',
		book: 'Uma janela em Copacabana, de Luiz Alfredo Garcia-Roza',
		question: 'O princípio “certeza não é verdade” deve orientar as pessoas na condução de suas vidas públicas e privadas?',
		provaUrl: 'https://www.vestibular.uerj.br/anexos/223/redacao_2022.pdf',
		padraoUrl: 'https://www.vestibular.uerj.br/anexos/223/padrao_redacao_2022.pdf'
	},
	{
		edition: 2021,
		exam: 'Exame Único',
		book: '1984, de George Orwell',
		question: 'A mentira programada é uma arma política válida para conquistar o poder e sustentá-lo?',
		provaUrl: 'https://www.vestibular.uerj.br/wp-content/uploads/2021/07/Exame_Unico_Redacao.pdf'
	},
	{
		edition: 2020,
		exam: 'Exame Discursivo',
		book: 'Vidas Secas, de Graciliano Ramos',
		question: 'O que leva pessoas, em condições semelhantes às de Fabiano, a se considerarem inferiores às demais?',
		provaUrl: 'https://www.vestibular.uerj.br/2020_ED_Redacao.pdf',
		padraoUrl: 'https://www.vestibular.uerj.br/2020_ED_PR_Redacao.pdf'
	},
	{
		edition: 2019,
		exam: 'Exame Discursivo',
		book: 'O seminarista, de Rubem Fonseca',
		question: 'É justificável cometer um crime para vingar outro crime?',
		provaUrl: 'https://www.vestibular.uerj.br/wp-content/uploads/2019/02/2019_ED_Redacao.pdf',
		padraoUrl: 'https://www.vestibular.uerj.br/wp-content/uploads/2019/02/2019_ED_PR_Redacao.pdf'
	},
	{
		edition: 2018,
		exam: 'Exame Discursivo',
		book: 'Dom Casmurro, de Machado de Assis',
		question: 'A verdade pode ser estabelecida com base em uma única perspectiva?',
		provaUrl: 'https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2018_ED_Redacao.pdf',
		padraoUrl: 'https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2018_ED_PR_Redacao.pdf'
	},
	{
		edition: 2017,
		exam: 'Exame Discursivo',
		book: null,
		question: 'Cidade maravilhosa – para quem? (com base em imagem e textos da própria prova)',
		provaUrl: 'https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2017_ED_LPI_Redacao.pdf',
		padraoUrl: 'https://www.vestibular.uerj.br/wp-content/uploads/2019/03/2017_ED_PR_LPI_Redacao.pdf'
	}
];

/**
 * Padrões observados no histórico acima (categoria: análise de provas anteriores).
 * Cada observação pode ser conferida diretamente na lista.
 */
export const REDACAO_PATTERNS = [
	'Desde 2018, todas as propostas partiram de um livro indicado previamente pela UERJ.',
	'A questão-tema é sempre formulada como pergunta que admite posicionamentos diferentes (o padrão de 2026 cita, no mínimo, "sim, não e depende").',
	'A proposta articula o livro a uma questão social ou ética mais ampla, muitas vezes explicitamente ligada aos "dias atuais" (2026) ou ao cotidiano (2018).',
	'O formato exigido se manteve: texto dissertativo-argumentativo, em prosa, de 20 a 30 linhas.',
	'A proposta de 2026 exigiu também um título — verifique sempre as instruções do próprio caderno.'
];
