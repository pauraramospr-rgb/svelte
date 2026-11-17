/**
 * Biblioteca de obras – análises da plataforma (categoria: interpretação pedagógica).
 *
 * Política editorial: só afirmamos fatos de enredo e de contexto confirmados em mais de uma
 * fonte de referência (ver `referencias`). Detalhes que variam entre edições/adaptações ou que
 * não pudemos confirmar aparecem em "Confira na leitura". As análises não substituem a leitura
 * integral, que a UERJ declara "imprescindível" (Anexo 5, 2027).
 */
import type { SourceId } from '$lib/data/official/sources';

export interface Obra {
	slug: string;
	title: string;
	author: string;
	edition: number;
	exam: string;
	officialNote: string;
	officialSource: SourceId;
	genre: string;
	ficha: { label: string; value: string }[];
	resumo: { title: string; text: string }[];
	contexto: { historico: string[]; literario: string[] };
	personagens: { name: string; text: string }[];
	temas: { title: string; text: string }[];
	simbolos: { title: string; text: string }[];
	linguagem: string[];
	interpretacoes: string[];
	relacoes: string[];
	abordagens: { title: string; text: string }[];
	confiraNaLeitura: string[];
	referencias: string[];
}

export const OBRAS: Obra[] = [
	{
		slug: 'o-bem-amado',
		title: 'O bem-amado',
		author: 'Dias Gomes',
		edition: 2027,
		exam: 'Redação (Exame Discursivo 2027)',
		officialNote:
			'“No Vestibular Estadual 2027, o tema da Redação tem como base o livro O bem-amado, de Dias Gomes, leitura imprescindível para o exame discursivo. O foco da redação é a discussão de uma questão levantada a partir desse texto teatral, que admite posicionamentos diferentes.” É proibida a consulta ao livro durante a prova (edital, item 4.5).',
		officialSource: 'anexo5-2027',
		genre: 'Texto teatral — comédia/farsa de crítica política',
		ficha: [
			{ label: 'Autor', value: 'Alfredo de Freitas Dias Gomes (Salvador, 1922 – São Paulo, 1999), dramaturgo e autor de telenovelas' },
			{ label: 'Escrita', value: '1962, com o título “Odorico, o Bem-Amado, ou Os Mistérios do Amor e da Morte”' },
			{ label: 'Gênero', value: 'Dramático: farsa de crítica sociopolítica, organizada em quadros' },
			{ label: 'Espaço', value: 'Sucupira, cidade fictícia do litoral baiano' },
			{ label: 'Adaptações', value: 'Telenovela da TV Globo (1973), seriado (anos 1980) e filme (2010)' }
		],
		resumo: [
			{
				title: 'A promessa',
				text: 'Em Sucupira, cidade pequena do litoral baiano que não tem cemitério, Odorico Paraguaçu se elege prefeito com uma promessa insólita: construir um cemitério. O slogan associado à campanha — “Vote em um homem sério e ganhe um cemitério” — resume o tom de farsa: a obra pública que deveria servir à cidade torna-se a marca pessoal do político.'
			},
			{
				title: 'O cemitério sem defunto',
				text: 'O cemitério é construído, mas não pode ser inaugurado: ninguém morre em Sucupira. A obra, que consumiu recursos de áreas como saneamento, educação e saúde, torna-se uma obsessão de Odorico, que passa a precisar de um morto para dar sentido à própria promessa e capitalizar politicamente a inauguração.'
			},
			{
				title: 'A busca por um morto',
				text: 'Para conseguir um “defunto”, Odorico recorre a manobras cada vez mais absurdas. Traz de volta à cidade Zeca Diabo, antigo cangaceiro e matador, e o nomeia delegado na esperança de que ele mate alguém. Zeca Diabo, porém, chega convertido — devoto de Padre Cícero, o “Padim Ciço” — e se recusa a matar. Odorico também manipula seu secretário, Dirceu Borboleta, para atirar no jornalista de oposição Neco Pedreira, dono do jornal “A Trombeta”.'
			},
			{
				title: 'O desfecho',
				text: 'A ironia final fecha a farsa: Odorico é morto por Zeca Diabo e se torna o primeiro “defunto” do cemitério que prometera. O político que manipulou a morte para obter prestígio acaba inaugurando, ele mesmo, a obra — e é transformado em mártir pela cidade.'
			}
		],
		contexto: {
			historico: [
				'A peça foi escrita em 1962, durante a experiência democrática iniciada em 1946 e pouco antes do golpe de 1964. O período é marcado pelo populismo e por intensos debates sobre reformas sociais.',
				'Odorico é lido como caricatura do coronelismo e da demagogia: práticas de mandonismo local, troca de favores e uso do poder público para fins pessoais, analisadas por Victor Nunes Leal em “Coronelismo, enxada e voto” (1949).',
				'A história de Dias Gomes com a censura é posterior e conhecida sobretudo pela televisão: a novela “Roque Santeiro” foi proibida em 1975 e só foi ao ar em 1985.'
			],
			literario: [
				'Dias Gomes integra a dramaturgia brasileira de crítica social das décadas de 1950–60, ao lado de autores como Gianfrancesco Guarnieri e Oduvaldo Vianna Filho. Sua peça “O pagador de promessas” (1960) deu origem ao filme de Anselmo Duarte premiado com a Palma de Ouro em Cannes (1962).',
				'“O bem-amado” dialoga com a tradição da comédia de costumes brasileira (de Martins Pena em diante) e da sátira política, mas radicaliza o exagero típico da farsa: situações absurdas e personagens caricatos revelam, pelo riso, mecanismos reais de poder.',
				'Como texto teatral, constrói sentido por diálogos e rubricas, sem narrador: o leitor conhece Odorico pelo que ele diz e faz — e, sobretudo, pelo modo como fala.'
			]
		},
		personagens: [
			{ name: 'Odorico Paraguaçu', text: 'Prefeito de Sucupira. Demagogo, vaidoso e manipulador, fala por meio de um discurso empolado, cheio de palavras inventadas e falsa erudição. Encarna, em escala provinciana, o político que confunde o público com o privado.' },
			{ name: 'Dorotéia e Judicéia (irmãs Cajazeiras)', text: 'Apoiadoras fervorosas de Odorico, com quem o prefeito mantém casos amorosos. Ajudam a compor a crítica moral e o retrato da devoção acrítica ao líder.' },
			{ name: 'Dulcinéia', text: 'Esposa de Dirceu Borboleta e amante de Odorico, que foi padrinho do casamento do casal. Seu envolvimento expõe a hipocrisia do prefeito.' },
			{ name: 'Dirceu Borboleta', text: 'Secretário de Odorico, submisso e facilmente manipulável. É usado pelo prefeito em seus planos contra o jornalista de oposição.' },
			{ name: 'Neco Pedreira', text: 'Jornalista de oposição, dono do jornal “A Trombeta”. Representa a imprensa como contrapeso ao poder local — também movida por interesses próprios.' },
			{ name: 'Zeca Diabo', text: 'Ex-cangaceiro e matador, devoto de Padre Cícero. Trazido por Odorico como “fazedor de defuntos” e nomeado delegado, recusa-se a voltar a matar — até o desfecho, quando mata o próprio Odorico.' }
		],
		temas: [
			{ title: 'Demagogia e manipulação da linguagem', text: 'O poder de Odorico se apoia na fala: o discurso grandiloquente impressiona e encobre a falta de conteúdo. A peça convida a pensar a relação entre forma e substância no discurso político.' },
			{ title: 'Patrimonialismo: público × privado', text: 'A obra pública (o cemitério) serve à vaidade pessoal; recursos coletivos são desviados; o cargo é usado para satisfazer desejos e vinganças.' },
			{ title: 'A morte como capital político', text: 'Na lógica absurda de Odorico, um morto é necessário para a inauguração: a vida humana se torna meio para o prestígio — crítica radical à instrumentalização das pessoas pela política.' },
			{ title: 'Imprensa e oposição', text: 'O conflito entre Odorico e Neco Pedreira mostra a imprensa como fiscal do poder, mas também como ator com interesses.' },
			{ title: 'Religiosidade, violência e redenção', text: 'Zeca Diabo, o matador convertido, articula fé popular, violência sertaneja e a possibilidade (frustrada) de redenção.' },
			{ title: 'O riso como crítica', text: 'A farsa torna suportável — e evidente — o retrato do coronelismo: o exagero faz o leitor rir e, ao mesmo tempo, reconhecer práticas reais.' }
		],
		simbolos: [
			{ title: 'O cemitério', text: 'Símbolo da obra pública inútil e eleitoreira; também metáfora de uma política que vive da morte (simbólica e literal) e de uma cidade parada no tempo.' },
			{ title: 'O título', text: '“Bem-amado” é irônico: o amor da população é fabricado pelo discurso e pela manipulação; no final, Odorico é “amado” como mártir, o que reforça a ironia.' },
			{ title: 'Sucupira', text: 'Cidade fictícia que funciona como microcosmo: em escala reduzida, condensa práticas da política brasileira. O nome tornou-se, no uso corrente, referência irônica a cenários políticos provincianos.' },
			{ title: 'A inauguração final', text: 'Odorico inaugura o cemitério como defunto: a promessa se cumpre pelo avesso, ironia estrutural típica da farsa.' }
		],
		linguagem: [
			'O “odoriquês”: o modo de falar de Odorico caracteriza o personagem. Ele cria palavras (neologismos, sobretudo por derivação e composição), usa termos rebuscados de forma inadequada e encadeia frases pomposas que pouco dizem.',
			'Os neologismos e os equívocos vocabulares produzem humor e, ao mesmo tempo, revelam a função manipuladora do discurso: a forma impressiona o eleitorado e encobre o vazio de conteúdo.',
			'O texto teatral se organiza por diálogos e rubricas; o humor nasce do exagero, do contraste entre a solenidade da fala e a mesquinhez das intenções, e da ironia dramática (o público percebe o que os personagens não admitem).',
			'Registros diferentes convivem: a fala pomposa do prefeito, a fala popular da cidade, o discurso religioso de Zeca Diabo e a retórica jornalística de Neco Pedreira.'
		],
		interpretacoes: [
			'Leitura sociopolítica: a peça é frequentemente interpretada como caricatura do coronelismo e da demagogia na política brasileira; Odorico seria a encarnação, em escala local, de figuras autoritárias e populistas.',
			'Leitura linguística: estudos sobre a obra destacam a construção do personagem pela linguagem — os neologismos de Odorico como recurso de caracterização e de crítica.',
			'Leitura sobre o riso: o humor não suaviza a crítica, mas a torna acessível; a farsa expõe, pelo exagero, o absurdo de práticas naturalizadas.',
			'Leitura atualizadora: Odorico e Sucupira seguem sendo referências lembradas no comentário político, o que mostra a atualidade da sátira.'
		],
		relacoes: [
			'Coronelismo e mandonismo local no Nordeste e no Brasil republicano.',
			'Uso eleitoral de obras públicas e prioridades orçamentárias.',
			'Liberdade de imprensa e papel da oposição na democracia.',
			'Linguagem política, retórica e manipulação (tema caro à Redação, que prioriza a argumentação).',
			'Religiosidade popular nordestina (Padre Cícero) e o imaginário do cangaço.'
		],
		abordagens: [
			{ title: 'Para a Redação', text: 'A proposta tende a partir de uma questão ética ou social levantada pela peça (histórico 2018–2026). Prepare-se para discutir política e linguagem, público e privado, obras públicas, imprensa e humor, sempre usando a peça como ponto de partida, sem resumi-la.' },
			{ title: 'Uso da obra no texto', text: 'Cite episódios e personagens como evidência dos argumentos (ex.: o cemitério como obra eleitoreira; o discurso de Odorico como manipulação). Evite resumo e paráfrase longa: a banca avalia a argumentação.' },
			{ title: 'Atualização', text: 'Relacione a peça aos “dias atuais”, como fez a proposta de 2026 — mas com exemplos seguros e gerais, sem dados que você não possa confirmar.' }
		],
		confiraNaLeitura: [
			'A divisão da peça em quadros e as indicações de cena (rubricas) da sua edição.',
			'Exemplos concretos de neologismos de Odorico (anote-os com a página): a grafia varia entre edições e resumos.',
			'Os parentescos e relações entre as irmãs Cajazeiras e Dulcinéia: há diferenças entre a peça e as adaptações para TV.',
			'As motivações do desfecho (por que Zeca Diabo mata Odorico) tal como aparecem no texto teatral.',
			'Personagens e episódios que existem apenas na novela de 1973 ou no seriado não devem ser usados como se fossem da peça.'
		],
		referencias: [
			'DIAS GOMES. O bem-amado. Texto teatral escrito em 1962 (consulte a edição indicada por sua escola).',
			'UERJ/DEPSEA. Edital do Exame Discursivo 2027, Anexo 5 – Conteúdos Programáticos (Redação).',
			'LEAL, Victor Nunes. Coronelismo, enxada e voto (1949).'
		]
	},
	{
		slug: 'luanda-lisboa-paraiso',
		title: 'Luanda, Lisboa, Paraíso',
		author: 'Djaimilia Pereira de Almeida',
		edition: 2027,
		exam: 'Língua Portuguesa e Literaturas (Exame Discursivo 2027)',
		officialNote:
			'“O romance Luanda, Lisboa, Paraíso, da escritora da literatura portuguesa contemporânea Djaimilia Pereira de Almeida, é o livro indicado para esse exame. Sua leitura é imprescindível para responder às questões da prova.” É proibida a consulta ao livro durante a prova (edital, item 4.5).',
		officialSource: 'anexo5-2027',
		genre: 'Romance — literatura portuguesa contemporânea',
		ficha: [
			{ label: 'Autora', value: 'Djaimilia Pereira de Almeida (Luanda, 1982), criada em Portugal' },
			{ label: 'Publicação', value: '2018, em Portugal; no Brasil, pela editora Todavia' },
			{ label: 'Prêmios', value: 'Prêmio Oceanos; Prémio Literário Fundação Inês de Castro (2018)' },
			{ label: 'Tempo da ação', value: 'A partir da década de 1980' },
			{ label: 'Espaços', value: 'Luanda; Lisboa; Paraíso, bairro de lata (favela) ficcional na Margem Sul do Tejo' }
		],
		resumo: [
			{
				title: 'Partida',
				text: 'Cartola de Sousa, parteiro em um hospital de Luanda, viaja para Lisboa nos anos 1980 com o filho Aquiles, adolescente nascido com uma malformação no calcanhar. O objetivo é o tratamento do pé do rapaz em Portugal. Em Luanda ficam a esposa, Glória, doente, e a filha, Justina.'
			},
			{
				title: 'Lisboa',
				text: 'Em Lisboa, pai e filho enfrentam a precariedade e o preconceito reservados aos imigrantes vindos da antiga colônia. Moram numa pensão enquanto o dinheiro permite; com a falta de recursos, a vida se degrada e o tratamento de Aquiles se arrasta.'
			},
			{
				title: 'Paraíso',
				text: 'Sem condições de permanecer na pensão, mudam-se para o Paraíso, um bairro de lata na margem sul do Tejo. O nome do lugar contrasta com a miséria, a doença e o isolamento — e também com os laços de afeto e de solidariedade que ali se formam.'
			},
			{
				title: 'Entre dois mundos',
				text: 'O romance acompanha a lenta erosão das expectativas: os personagens não são tratados como portugueses, mas, com o tempo, também deixam de se sentir angolanos. O livro constrói, com ternura e dureza, a experiência de um limbo — geográfico, social e afetivo.'
			}
		],
		contexto: {
			historico: [
				'Angola tornou-se independente de Portugal em 1975, em meio a conflito armado; a guerra civil angolana se estendeu de 1975 a 2002. As décadas de 1980 e 1990 foram marcadas por instabilidade e precariedade de serviços, inclusive de saúde.',
				'Em Portugal, a Revolução de 25 de Abril de 1974 encerrou a ditadura do Estado Novo e abriu o processo de descolonização. Nas décadas seguintes, imigrantes vindos das ex-colônias africanas ocuparam, muitas vezes, os trabalhos mais precários e as periferias de Lisboa, incluindo bairros de construções improvisadas.',
				'A relação entre ex-metrópole e ex-colônia — feita de proximidade linguística e de desigualdade — é o pano de fundo da experiência de Cartola e Aquiles.'
			],
			literario: [
				'Djaimilia Pereira de Almeida é uma das vozes de destaque da literatura portuguesa contemporânea; sua obra aborda identidade, raça, migração e pertencimento (seu livro de estreia, “Esse cabelo”, é de 2015).',
				'O romance dialoga com a produção literária pós-colonial em língua portuguesa — que revisita os efeitos do colonialismo a partir das experiências de quem os viveu.',
				'Análise de provas anteriores: desde 2019, os livros indicados para a prova de Língua Portuguesa e Literaturas foram de autores portugueses ou africanos de língua portuguesa (Eça de Queirós, Mia Couto, Camilo Castelo Branco, José Saramago, Pepetela e, agora, Djaimilia Pereira de Almeida).'
			]
		},
		personagens: [
			{ name: 'Cartola de Sousa', text: 'Pai, parteiro em Luanda. Parte para Lisboa movido pela esperança de curar o filho; sua trajetória é de perda gradual de status, de recursos e de ilusões, mas também de persistência e afeto.' },
			{ name: 'Aquiles', text: 'Filho de Cartola, nascido com malformação no calcanhar. Seu crescimento em Lisboa, entre hospitais e precariedade, acompanha a passagem da adolescência à vida adulta longe da família.' },
			{ name: 'Glória', text: 'Esposa de Cartola, doente, permanece em Luanda. A distância e a comunicação com o marido marcam a dimensão afetiva do romance.' },
			{ name: 'Justina', text: 'Filha do casal, fica em Luanda com a mãe.' },
			{ name: 'Pepe', text: 'Personagem do período português da narrativa; observe na leitura o papel da convivência e da solidariedade na relação com Cartola.' }
		],
		temas: [
			{ title: 'Imigração e não pertencimento', text: 'O limbo identitário: não ser reconhecido como português e deixar, aos poucos, de se reconhecer como angolano.' },
			{ title: 'Pós-colonialismo', text: 'A relação desigual entre antiga metrópole e antiga colônia, vivida no corpo e no cotidiano de quem migra.' },
			{ title: 'Doença, corpo e fragilidade', text: 'O pé de Aquiles e a doença de Glória ligam o drama familiar à precariedade dos sistemas de saúde e à vulnerabilidade social.' },
			{ title: 'Paternidade e afeto', text: 'A relação entre pai e filho, feita de cuidado, frustração e ternura, sustenta a narrativa.' },
			{ title: 'Pobreza urbana e periferia', text: 'A queda da pensão ao bairro de lata expõe a geografia da exclusão nas margens de Lisboa.' },
			{ title: 'Esperança e desilusão', text: 'A viagem movida pela promessa de cura se transforma em longa espera; o título encena essa trajetória.' }
		],
		simbolos: [
			{ title: 'O título em três lugares', text: 'Luanda (origem), Lisboa (promessa) e Paraíso (destino) formam uma trajetória; o nome “Paraíso” para um bairro de lata é fortemente irônico — uma leitura recorrente vê nele o desmentido das expectativas das duas cidades.' },
			{ title: 'Aquiles e o calcanhar', text: 'O nome do filho alude ao mito grego de Aquiles, cujo ponto vulnerável era o calcanhar: a alusão (intertextualidade) faz da fragilidade física um símbolo da vulnerabilidade da família e dos imigrantes.' },
			{ title: 'A travessia', text: 'A viagem para a antiga metrópole inverte, em certo sentido, o movimento colonial — mas sem inverter a desigualdade.' }
		],
		linguagem: [
			'Prosa de grande densidade poética e frases cuidadosamente construídas, que combinam lirismo e crueza no tratamento da pobreza e da doença.',
			'O programa oficial de 2027 destaca, em Literatura, “Gêneros textuais: carta, diário, memória” e “Hibridismo: intergenericidade na construção narrativa”, além de metaficção e verossimilhança: observe como esses recursos aparecem no romance (análise do programa oficial).',
			'Atenção ao foco narrativo, à construção do tempo (passagem dos anos, memória da terra natal) e à representação dos espaços (Luanda, a pensão, o bairro).',
			'Recursos expressivos a mapear: ironia (a começar pelo título), alusão mitológica (Aquiles), metáforas do corpo e da casa.'
		],
		interpretacoes: [
			'Leitura pós-colonial: o romance como relato da experiência do colonizado na ex-metrópole, sem idealizações.',
			'Leitura do afeto: a crítica jornalística destacou o equilíbrio entre doença e miséria e “um pouco de ternura” na relação entre pai e filho.',
			'Leitura do limbo: os personagens ficam entre dois lugares e nenhum — tema central para discutir identidade e pertencimento.'
		],
		relacoes: [
			'Descolonização portuguesa (1974–1975) e guerra civil angolana (1975–2002).',
			'Imigração africana em Portugal e periferias urbanas.',
			'Diálogo com outras obras pós-coloniais em língua portuguesa já indicadas pela UERJ (Mia Couto, Pepetela).',
			'Mitologia grega (Aquiles) e intertextualidade.'
		],
		abordagens: [
			{ title: 'Elementos da narrativa', text: 'Prepare respostas sobre enredo, construção dos personagens, narrador e foco narrativo, tempo e espaço — itens explícitos do programa (“Elementos da narrativa selecionada”).' },
			{ title: 'Recursos expressivos', text: 'Historicamente, “recursos expressivos da criação estética” e “elementos da narrativa” foram os itens mais cobrados em Língua Portuguesa e Literaturas (análise da classificação oficial 2017–2026).' },
			{ title: 'Literatura e sociedade', text: 'Relacione o romance a seu contexto de produção e às experiências de migração e pós-colonialismo.' },
			{ title: 'Gêneros e hibridismo', text: 'Observe a presença de cartas, memórias ou outros gêneros dentro do romance e o efeito disso na narrativa.' }
		],
		confiraNaLeitura: [
			'A idade exata de Aquiles e o ano da viagem (as fontes falam em adolescente de cerca de 14 anos e em década de 1980).',
			'Quem é Pepe e qual é seu papel na trama; outros personagens do bairro.',
			'Se e como há cartas entre Cartola e Glória e o que elas revelam.',
			'O desfecho do romance e o destino de cada personagem.',
			'Trechos que você usaria para ilustrar ironia, alusão e os elementos da narrativa (anote páginas).'
		],
		referencias: [
			'ALMEIDA, Djaimilia Pereira de. Luanda, Lisboa, Paraíso. Romance publicado em Portugal em 2018; edição brasileira: Todavia.',
			'UERJ/DEPSEA. Edital do Exame Discursivo 2027, Anexo 5 – Conteúdos Programáticos (Língua Portuguesa e Literaturas).'
		]
	}
];

export function getObra(slug: string): Obra | undefined {
	return OBRAS.find((o) => o.slug === slug);
}
