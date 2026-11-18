/**
 * Guia "Como responder à UERJ" (categoria: interpretação pedagógica), construído a partir
 * do edital 2027 (critérios oficiais), do Anexo 4 (competências) e da leitura dos
 * comentários oficiais das Questões Comentadas. A UERJ não divulga uma "fórmula" de
 * resposta nem o peso de cada parte de um comando: o que segue é método, não regra oficial.
 */

/** O que os comentários oficiais da banca revelam (com a questão que exemplifica). */
export const PADROES: { title: string; text: string; exemplo: string; id: string }[] = [
	{
		title: 'Conceito primeiro, aplicação depois',
		text: 'O comentário oficial costuma começar definindo o conceito cobrado e só então mostrá-lo no texto ou no dado. A resposta ideal faz o mesmo em miniatura: nomeia com o termo técnico e demonstra.',
		exemplo: 'Em 2026, sobre metalinguagem, a banca define o procedimento (“possibilidade de refletirem sobre si mesmas”) e depois mostra o narrador discutindo a palavra “desaparecimento”.',
		id: '2026-LPL-04'
	},
	{
		title: 'A banca lista alternativas, mas cobra precisão',
		text: 'Quando o comando pede “cite uma ação” ou “duas ações”, o padrão de resposta aceita vários exemplos — basta um correto e específico por item pedido. O que não se aceita é exemplo vago, fora do período ou de outra natureza.',
		exemplo: 'Em 2026, sobre Brasil–EUA, o padrão lista dezenas de aproximações e afastamentos possíveis (Doutrina Monroe, Barão do Rio Branco, Segunda Guerra, Política Externa Independente…).',
		id: '2026-HIS-06'
	},
	{
		title: 'O comando delimita a análise',
		text: 'A banca registra o que não vale. Se o comando pede função sintática, a classe gramatical não pontua; se pede atentados da extrema direita, a tortura nos porões é outro assunto.',
		exemplo: '“Note-se que a análise solicitada é a da função de determinados termos” (2026); “É importante não confundir atos condenáveis como a tortura de presos políticos […] com atentados a bomba” (2025).',
		id: '2026-LPL-03'
	},
	{
		title: 'Vocabulário do conteúdo, não paráfrase do texto-base',
		text: 'As respostas esperadas usam os conceitos da disciplina e os termos da época. Repetir o texto-base com outras palavras não demonstra conhecimento.',
		exemplo: 'Em 2026, a justificativa da repressão aparece com os termos do regime: “subversivos”, “terroristas”, “inimigos internos”, “segurança nacional”.',
		id: '2026-HIS-09'
	},
	{
		title: 'Nas exatas, o caminho aparece',
		text: 'O comentário mostra o raciocínio e a conta, não só o número. Equação, substituição e resultado com unidade (ou porcentagem) tornam a resposta verificável.',
		exemplo: 'Em 2026, a banca resolve: 0,4 × 11,5% = 4,6% das exportações brasileiras.',
		id: '2026-MAT-02'
	},
	{
		title: 'Passado e presente, texto e contexto',
		text: 'Em História, a questão costuma ligar um documento ou notícia atual a um processo histórico; em Literatura, um trecho ao enredo e ao contexto. A resposta completa faz a ponte nos dois sentidos.',
		exemplo: 'Em 2026, a carta de Zuzu Angel (1975) e a correção de sua certidão de óbito (2025) são lidas em “conjunturas políticas distintas”.',
		id: '2026-HIS-09'
	}
];

export const PASSOS: { title: string; text: string }[] = [
	{ title: 'Leia o comando antes do texto-base', text: 'Sublinhe os verbos (identifique, explique, cite…) e as quantidades (“dois”, “uma”, “em seguida”). Você vai ler o texto já sabendo o que procurar.' },
	{ title: 'Quebre o comando em partes', text: 'Numere mentalmente: (A) identifique…; (B) explique… A maioria das questões oficiais tem dois ou mais comandos — cada parte é avaliada.' },
	{ title: 'Reconheça o tipo de verbo', text: 'Verbos de “observar” (identificar, indicar, nomear, apontar, transcrever) pedem resposta exata e curta. Verbos de “analisar” (explicar, justificar, classificar, relacionar) pedem conceito + razão + efeito. “Avaliar” e “criar” pedem posição com critério.' },
	{ title: 'Volte ao texto-base e localize a prova', text: 'Encontre o trecho, o dado do gráfico, o elemento da imagem que sustenta sua resposta. A UERJ quase sempre quer que você use o material dado.' },
	{ title: 'Planeje uma frase por comando', text: 'No rascunho, escreva o núcleo de cada parte: o termo técnico, o exemplo, a relação. Só depois redija.' },
	{ title: 'Responda na ordem do comando, retomando suas palavras', text: '“A figura de linguagem é a comparação. Ela sugere que…”. Retomar o enunciado mostra ao corretor onde está cada resposta.' },
	{ title: 'Seja específico', text: 'Nome técnico + exemplo concreto + relação explicada. “A Petrobras (1953), no governo Vargas” vale mais que “medidas nacionalistas”.' },
	{ title: 'Mostre o raciocínio (exatas)', text: 'Fórmula, substituição, resultado com unidade. Se errar uma conta, o raciocínio correto ainda pode ser reconhecido pela banca.' },
	{ title: 'Revise contra o comando', text: 'Respondi todas as partes? Na quantidade pedida? O termo técnico está certo? A norma padrão está correta? Escrevi a caneta e no espaço certo (item 5.4 do edital)?' },
	{ title: 'Corte o que sobra', text: 'Informação a mais não soma ponto, e uma afirmação errada pode contradizer a correta. Na dúvida entre dois exemplos, fique com o mais seguro.' }
];

/** Fórmulas de resposta por verbo de comando. */
export const VERBOS: { verbo: string; espera: string; modelo: string }[] = [
	{ verbo: 'Identifique / indique / nomeie / aponte', espera: 'O elemento exato, com o termo técnico.', modelo: '“O recurso expressivo é a metonímia.”' },
	{ verbo: 'Transcreva', espera: 'Cópia fiel do trecho, entre aspas, sem alterar nada (na língua pedida, em LE).', modelo: '“com reverente temor”' },
	{ verbo: 'Cite / apresente', espera: 'Um exemplo específico e pertinente por item pedido, situado no tempo ou no texto.', modelo: '“Uma medida foi a criação da Petrobras, em 1953.”' },
	{ verbo: 'Explique', espera: 'Causa, mecanismo ou efeito: o porquê, não só o quê.', modelo: '“Calpe pode ser lida como metonímia porque representa, como parte, o todo da humanidade…”' },
	{ verbo: 'Justifique', espera: 'Razão fundamentada em dado, texto ou conceito.', modelo: '“A afirmação está correta, pois 1,25 × 0,80 = 1.”' },
	{ verbo: 'Classifique', espera: 'A categoria e o critério que a define.', modelo: '“Oração subordinada adverbial final, pois expressa finalidade.”' },
	{ verbo: 'Calcule / determine', espera: 'Equação, cálculo e resultado com unidade.', modelo: '“v = Δs/Δt = 120/2 = 60 km/h.”' },
	{ verbo: 'Relacione / estabeleça relação', espera: 'Os dois elementos e o vínculo entre eles, explicitado por um conector.', modelo: '“A abertura dos portos (1808) relaciona-se à transferência da Corte, pois…”' },
	{ verbo: 'Compare / diferencie', espera: 'Um critério comum e a diferença em relação a ele.', modelo: '“Quanto à escravidão, os EUA a mantiveram, enquanto o Haiti a aboliu.”' },
	{ verbo: 'Reescreva', espera: 'A nova versão mantendo o sentido e respeitando a norma, alterando só o que foi pedido.', modelo: '“Morto Iuri” → “Depois que Iuri morreu”.' }
];

export const DISCIPLINAS: { code: string; dicas: string[] }[] = [
	{
		code: 'LPL',
		dicas: [
			'Nomeie o recurso ou a função com o termo do programa (Anexo 5) e mostre-o no trecho.',
			'Ao transcrever, copie exatamente — pontuação incluída.',
			'Gramática sempre com sentido: classificação + valor semântico + efeito no texto.',
			'Leia o livro indicado (consulta proibida na prova): a UERJ pergunta sobre enredo, personagens e trechos.'
		]
	},
	{
		code: 'HIS',
		dicas: [
			'Situe no tempo (datas, governos, períodos) e use conceitos (descolonização, nacional-estatismo, justiça de transição).',
			'Faça a ponte entre o documento/notícia e o processo histórico.',
			'Prefira exemplos que você domina com segurança; a banca aceita alternativas, não imprecisões.'
		]
	},
	{
		code: 'GEO',
		dicas: ['Leia mapas, gráficos e tabelas citando os dados.', 'Explique o processo espacial (causa → consequência) e use escala e localização corretas.']
	},
	{
		code: 'BIO',
		dicas: ['Nomeie estruturas e processos com precisão e explique a relação estrutura–função.', 'Em experimentos, identifique variável, controle e conclusão.']
	},
	{
		code: 'QUI',
		dicas: ['Escreva fórmulas, equações balanceadas e nomes oficiais quando pedidos (“nomeie”, “escreva” são muito frequentes).', 'Mostre cálculos estequiométricos com unidades.']
	},
	{
		code: 'FIS',
		dicas: ['Parta da lei física, substitua com unidades no SI e confira a ordem de grandeza.', '“Considere” no enunciado traz dados e aproximações que devem ser usados.']
	},
	{
		code: 'MAT',
		dicas: ['“Calcule” domina a prova: registre o raciocínio, não só o resultado.', 'Defina incógnitas e confira se a resposta responde exatamente à pergunta (unidade, porcentagem, arredondamento).']
	},
	{
		code: 'LE',
		dicas: [
			'Os comandos são em português, e as explicações também; transcreva na língua estrangeira apenas quando o comando pedir (ex.: “Transcreva, em espanhol…”).',
			'Coesão (referentes, conectores) e sentido de expressões estão entre os itens mais cobrados.'
		]
	}
];

export const CHECKLIST: string[] = [
	'Respondi a todas as partes do comando, na ordem?',
	'Respeitei as quantidades pedidas (“um”, “dois”, “uma de cada”)?',
	'Usei o termo técnico correto (conceito, classificação, nome da lei ou do processo)?',
	'Apoiei a resposta no texto-base, no dado ou na imagem?',
	'Expliquei o porquê quando o comando pediu “explique” ou “justifique”?',
	'Situei no tempo/espaço (História, Geografia) ou mostrei o cálculo com unidade (exatas)?',
	'Evitei informação a mais que possa estar errada?',
	'Escrevi com norma padrão, letra legível, a caneta e no espaço da questão?',
	'Não me identifiquei e não usei vocabulário inadequado (itens 5.4 e 4.16 do edital)?'
];

/** Palestras sobre os livros do Exame Discursivo divulgadas para a edição 2027. */
export const PALESTRAS: { livro: string; quem: string; quando: string }[] = [
	{ livro: 'O bem-amado (Redação)', quem: 'Eleonora Ziller', quando: '12/11/2026, 15h, Auditório 11 (UERJ, campus Maracanã)' },
	{ livro: 'Luanda, Lisboa, Paraíso (Língua Portuguesa e Literaturas)', quem: 'Marcelo Brandão Mattos', quando: '19/11/2026, 15h, Auditório 11 (UERJ, campus Maracanã)' }
];
