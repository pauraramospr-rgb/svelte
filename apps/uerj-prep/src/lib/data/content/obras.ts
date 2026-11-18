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
	/** Seções de aprofundamento (opcionais). */
	linhaDoTempo?: { quando: string; fato: string }[];
	espacos?: { lugar: string; funcao: string; naObra: string }[];
	elementos?: { elemento: string; conceito: string; naObra: string }[];
	trechos?: Trecho[];
	gramatica?: { item: string; programa: string; exemplo: string; analise: string }[];
}

/** Trecho curto citado para estudo (Lei 9.610/98, art. 46, III), com leitura comentada. */
export interface Trecho {
	ref: string;
	texto: string;
	leitura: string;
	recursos: { nome: string; comentario: string }[];
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
		],
		linhaDoTempo: [
			{ quando: '1946–1964', fato: 'Experiência democrática da República de 1946: eleições, populismo, debate sobre reformas sociais — e permanência do mandonismo local no interior.' },
			{ quando: '1962', fato: 'Dias Gomes escreve a peça, com o título “Odorico, o Bem-Amado, ou Os Mistérios do Amor e da Morte”.' },
			{ quando: '1964', fato: 'Golpe civil-militar; começa a ditadura (1964–1985), com censura crescente à produção cultural.' },
			{ quando: '1973', fato: 'A telenovela “O Bem-Amado” (TV Globo) leva Odorico ao grande público — foi a primeira novela em cores da TV brasileira.' },
			{ quando: '1975', fato: 'A censura proíbe a novela “Roque Santeiro”, de Dias Gomes, que só iria ao ar em 1985.' },
			{ quando: '1980–1984', fato: 'Seriado “O Bem-Amado” na TV Globo.' },
			{ quando: '2010', fato: 'Filme “O bem-amado”, dirigido por Guel Arraes.' },
			{ quando: '2027', fato: 'A peça é a base da Redação do Vestibular Estadual da UERJ.' }
		],
		elementos: [
			{ elemento: 'Texto dramático', conceito: 'Escrito para ser encenado: não há narrador; a história se constrói por diálogos e rubricas.', naObra: 'Conhecemos Odorico pelo que ele diz e faz — e, sobretudo, pelo modo como fala (o “odoriquês”).' },
			{ elemento: 'Rubricas', conceito: 'Indicações do autor sobre cenário, gestos, entonação e movimentação.', naObra: 'Observe na sua edição como as rubricas caracterizam Sucupira e reforçam o ridículo das situações.' },
			{ elemento: 'Personagens-tipo', conceito: 'Personagens construídos a partir de um traço social reconhecível, levado à caricatura.', naObra: 'O político demagogo (Odorico), o matador convertido (Zeca Diabo), as apoiadoras devotas (irmãs Cajazeiras), o jornalista de oposição (Neco Pedreira), o subalterno manipulável (Dirceu Borboleta).' },
			{ elemento: 'Conflito', conceito: 'Choque de vontades ou de forças que move a ação.', naObra: 'Odorico × a realidade (ninguém morre em Sucupira); Odorico × a oposição (Neco Pedreira); Odorico × Zeca Diabo, que se recusa a matar.' },
			{ elemento: 'Clímax e desfecho', conceito: 'Ponto de maior tensão e resolução do conflito.', naObra: 'A obsessão por um defunto chega ao extremo e se resolve pelo avesso: Odorico morre e inaugura o próprio cemitério.' },
			{ elemento: 'Espaço', conceito: 'Lugar da ação; no teatro, sugerido por cenário e falas.', naObra: 'Sucupira, microcosmo da política brasileira em escala provinciana.' },
			{ elemento: 'Farsa', conceito: 'Gênero cômico de exagero, situações absurdas e caricatura, que provoca riso e crítica.', naObra: 'Um cemitério sem mortos, um matador nomeado delegado, um prefeito que precisa de um cadáver: o absurdo revela práticas reais.' },
			{ elemento: 'Ironia dramática', conceito: 'O público percebe o que os personagens não admitem ou não sabem.', naObra: 'A plateia vê a vaidade e a manipulação sob o discurso solene de Odorico.' }
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
			{ label: 'Autora', value: 'Djaimilia Pereira de Almeida (Luanda, 1982), criada em Portugal. Estreou com “Esse cabelo” (2015); publicou depois, entre outros, “A visão das plantas” (2019).' },
			{ label: 'Publicação', value: '2018, em Portugal (Companhia das Letras); no Brasil, pela Todavia (2019)' },
			{ label: 'Prêmios', value: 'Prêmio Oceanos (2019); prêmios literários da Fundação Inês de Castro e da Fundação Eça de Queiroz (2018)' },
			{ label: 'Narrador', value: 'Terceira pessoa, que se aproxima da consciência das personagens e às vezes apenas supõe o que elas sentem (“Talvez sonhasse…”)' },
			{ label: 'Tempo da ação', value: 'Do período colonial (nascimento e batismo de Aquiles) aos anos que se seguem à viagem para Lisboa, em meados da década de 1980 (resenhas indicam 1984)' },
			{ label: 'Espaços', value: 'Luanda; Lisboa (pensão, hospital); Paraíso, bairro de lata na periferia de Lisboa' },
			{ label: 'Variedade linguística', value: 'Português europeu (vocabulário, colocação pronominal e regências lusitanas) — atenção ao item “Unidade e diversidade da língua portuguesa” do programa' }
		],
		resumo: [
			{
				title: 'O calcanhar e o batismo (Angola, tempo colonial)',
				text: 'O romance começa por um corpo: o calcanhar esquerdo de Aquiles, filho mais novo de Cartola de Sousa, nasceu malformado. No batismo, o pai dá ao menino um nome “helénico”, “tentando resolver o destino com a tradição”, e ergue um brinde: vale mais nascer grego em terra de troianos do que gazela em terra de leões. Na festa, Cartola esconde com a mão o calcanhar do bebê, e todos comem e bebem como se o pé fosse perfeito. A cena funciona como índice de tudo o que vem depois: a família enfrenta a vulnerabilidade disfarçando-a, resistindo e seguindo adiante.'
			},
			{
				title: 'Glória e Justina: a família que fica',
				text: 'Glória, mulher de Cartola, está doente e imobilizada em Luanda. Sua memória ficou “presa ao Império”: ela revive a juventude elegante do tempo colonial, quando era admitida em espaços reservados aos brancos. A filha, Justina, fica para cuidar da mãe e adia a própria vida. A partir daí, Luanda existe para pai e filho como lembrança, notícia e promessa de regresso sempre adiada.'
			},
			{
				title: 'A viagem (meados dos anos 1980)',
				text: 'Sem tratamento possível em Angola — país recém-independente e em guerra civil —, Cartola parte com Aquiles, ainda antes dos 15 anos, para tratar o calcanhar em Lisboa. A viagem, pensada como temporária, apoia-se numa imagem idealizada da antiga metrópole, formada no tempo colonial: Portugal como lugar de medicina, cultura e reconhecimento.'
			},
			{
				title: 'Lisboa: hospital, pensão e espera',
				text: 'Em Lisboa a promessa se desfaz em espera. Aquiles passa por quatro operações — a primeira “correu tão mal quanto as três que se seguiram” —, longas convalescenças e a humilhação de se ver como um corpo desmontado. O dinheiro acaba, o retorno se adia, e Cartola perde o lugar social que tinha em Luanda.'
			},
			{
				title: 'O Paraíso',
				text: 'Pai e filho vão viver no Paraíso, bairro de lata da periferia de Lisboa. Cartola, que em Luanda era parteiro, passa a trabalhar na construção civil: quem ajudava a trazer vidas ao mundo agora ergue paredes alheias. No bairro, Cartola faz amizade com Pepe, taberneiro galego — outro deslocado —, e os dois velhos constroem uma convivência feita de copos, silêncios e cuidado.'
			},
			{
				title: 'As perdas',
				text: 'A barraca em que vivem arde numa noite (o incêndio é registrado por resenhas e estudos acadêmicos), e pai e filho passam a depender da solidariedade de Pepe. Iuri, menino do bairro em quem Cartola e Pepe veem “o aceno da nova infância”, morre de forma violenta (cap. 53). A morte do menino impede qualquer solução consoladora: a amizade dos dois velhos permanece “inconclusa”.'
			},
			{
				title: 'Um livro por escrever',
				text: 'O romance recusa a redenção. O futuro aparece como “o horizonte aberto de um livro por escrever”: pai e filho terminam num limbo — não são reconhecidos como portugueses e se afastam, cada vez mais, de Angola. O título resume a trajetória e a sua ironia: de Luanda (origem) a Lisboa (promessa) e, por fim, ao “Paraíso” (exclusão).'
			}
		],
		contexto: {
			historico: [
				'Colonialismo português em Angola: até 1961 vigorou o Estatuto do Indigenato, regime jurídico que separava os “indígenas” dos “assimilados” — africanos que, por adotarem língua, costumes e modos de vida considerados “civilizados”, recebiam direitos restritos e um reconhecimento sempre condicional. A memória de Glória (“a única negra […] admitida no Hotel da Ponte Branca”) é lida à luz dessa assimilação excludente.',
				'A guerra de libertação começou em 1961. Depois da Revolução dos Cravos (25 de abril de 1974), que derrubou a ditadura do Estado Novo em Portugal, Angola tornou-se independente em 11 de novembro de 1975. Seguiu-se a guerra civil (1975–2002), entre o MPLA e a UNITA, atravessada pela Guerra Fria (Cuba e URSS de um lado; EUA e África do Sul do outro) — contexto da precariedade de serviços, inclusive de saúde, que motiva a viagem.',
				'Com a descolonização, cerca de meio milhão de portugueses deixaram as ex-colônias e foram para Portugal — os chamados “retornados”. O romance inverte esse movimento: quem “retorna” é um africano, para uma metrópole que nunca foi sua. Daí a leitura crítica do livro como “retorno às avessas”.',
				'Portugal nos anos 1980: o país se modernizava (entrou na Comunidade Econômica Europeia em 1986), e a construção civil e as obras públicas absorveram mão de obra imigrante, sobretudo africana. Muitos desses trabalhadores viveram em bairros de barracas nas periferias de Lisboa — realidade que o Programa Especial de Realojamento (1993) tentaria erradicar.'
			],
			literario: [
				'Djaimilia Pereira de Almeida nasceu em Luanda e cresceu em Portugal. Sua obra trata de identidade, raça, migração, corpo e pertencimento; em “Esse cabelo” (2015), por exemplo, a história de um cabelo crespo vira reflexão sobre identidade e herança colonial.',
				'O romance integra uma linha da literatura portuguesa contemporânea que revisita o império e a descolonização. A comparação com “O retorno” (2011), de Dulce Maria Cardoso — sobre uma família de retornados —, é frequente nos estudos acadêmicos: os dois livros narram deslocamentos em sentidos opostos.',
				'Realismo sem melodrama: o lirismo da prosa não suaviza a miséria, a doença e a morte. A morte de Iuri, por exemplo, impede a idealização da amizade entre Cartola e Pepe e preserva a verossimilhança e o tom trágico do livro.',
				'Análise de provas anteriores: desde 2019, os livros indicados para a prova de Língua Portuguesa e Literaturas foram de autores portugueses ou africanos de língua portuguesa (Eça de Queirós, Mia Couto, Camilo Castelo Branco, José Saramago, Pepetela e, agora, Djaimilia Pereira de Almeida). Em 2026, com “O quase fim do mundo”, de Pepetela, a UERJ cobrou metonímia e ironia estruturantes do enredo, marcas de enunciação, função sintática e valor semântico de expressões e metalinguagem/metaficção — o mesmo tipo de leitura que este romance permite.'
			]
		},
		personagens: [
			{
				name: 'Cartola de Sousa',
				text: 'Pai de Aquiles e de Justina, marido de Glória; parteiro em Luanda. É um protagonista redondo: muda ao longo do romance. Parte movido pela esperança de curar o filho e por uma imagem idealizada de Portugal, herdada do tempo colonial. Em Lisboa, perde o reconhecimento profissional e vira trabalhador da construção civil, mas conserva o orgulho — o mesmo gesto do batismo, quando esconde o calcanhar do filho “para que não se visse”. Sua amizade com Pepe mostra a vida afetiva que resiste à precariedade. Leitura possível: o nome evoca a cartola, chapéu de cerimônia europeu, signo de uma elegância “à metrópole” que Lisboa desmente.'
			},
			{
				name: 'Aquiles',
				text: 'Filho mais novo, nascido com o calcanhar esquerdo malformado. Viaja antes dos 15 anos e cresce entre hospitais, quatro operações e longas convalescenças. Seu corpo é o motor do enredo e o lugar onde a narrativa inscreve a vulnerabilidade: diante do espelho, sente-se “um boneco em que ninguém pegaria”. A passagem da adolescência à vida adulta, como jovem negro angolano em Portugal, permite discutir racismo, estigma e construção da identidade. O nome cria ironia trágica: o herói quase invencível do mito torna-se um rapaz frágil.'
			},
			{
				name: 'Glória',
				text: 'Mulher de Cartola. Doente e imobilizada em Luanda, “não sabia quem era nem onde estava”: sua memória ficou “presa ao Império”. Ela encarna a assimilação colonial — a ilusão de pertencer a uma ordem que só a admitia como exceção — e a memória que não se atualiza. É também a figura da espera, à distância.'
			},
			{
				name: 'Justina',
				text: 'Filha do casal. Fica em Luanda cuidando da mãe e adia os próprios projetos. Representa o cuidado familiar, frequentemente feminino e invisível, que sustenta a viagem masculina: enquanto pai e filho partem, as mulheres ficam.'
			},
			{
				name: 'Pepe',
				text: 'Taberneiro português de origem galega, morador do Paraíso. É outro deslocado — a Galiza tem longa tradição de emigração para Portugal —, e por isso a amizade com Cartola junta dois homens à margem. Sua taberna e sua barraca tornam-se refúgio depois do incêndio. A relação entre os dois velhos amplia os sentidos de amizade, cuidado, pertencimento, precariedade e exclusão.'
			},
			{
				name: 'Iuri',
				text: 'Menino do Paraíso, de “olhos grandes” e “ingenuidade diluída na fome e no medo de ser abandonado”. Para Cartola e Pepe, é “o menino que eles não tinham sido” — a chance de uma “segunda infância”. Sua morte (cap. 53) concentra a violência que atinge a infância na periferia e impede o desfecho idealizado da amizade.'
			}
		],
		temas: [
			{ title: 'Deslocamento e limbo identitário', text: 'Pai e filho não são reconhecidos como portugueses e, com o tempo, deixam também de se sentir angolanos. A identidade fica suspensa entre a terra de origem e a de chegada — nem uma nem outra.' },
			{ title: 'Pós-colonialismo e “retorno às avessas”', text: 'A antiga metrópole recebe o ex-colonizado como estrangeiro pobre. A proximidade da língua e da história comum não elimina a desigualdade herdada do império.' },
			{ title: 'Corpo, doença e vulnerabilidade', text: 'Três corpos organizam o livro: o calcanhar malformado de Aquiles, o corpo imobilizado de Glória e o corpo “despedaçado” de Iuri. Neles se inscrevem a fragilidade individual e a violência social.' },
			{ title: 'Trabalho, classe e perda de status', text: 'De parteiro a operário da construção civil: a migração rebaixa Cartola e mostra como o reconhecimento profissional depende do lugar onde se vive.' },
			{ title: 'Racismo e exclusão urbana', text: 'O bairro de lata, o trabalho precário e o olhar dos outros revelam a exclusão racial e social dos imigrantes africanos na periferia de Lisboa.' },
			{ title: 'Família, cuidado e gênero', text: 'Os homens partem; Glória e Justina ficam. O cuidado de quem fica sustenta a viagem e custa a vida adiada de Justina.' },
			{ title: 'Amizade e solidariedade entre deslocados', text: 'Cartola e Pepe, angolano e galego, constroem uma amizade tardia e terna, sem idealização: ela se forma na margem e é ferida pela perda.' },
			{ title: 'Memória e espera', text: 'A memória de Glória presa ao Império, as lembranças de Luanda e o regresso sempre adiado fazem do tempo uma experiência de espera e de desgaste.' }
		],
		simbolos: [
			{ title: 'O calcanhar', text: 'Abre o romance (“pode começar por um calcanhar”) e põe a narrativa em movimento. Símbolo da vulnerabilidade da família e dos imigrantes; também parte que representa o todo da condição de Aquiles (leitura metonímica).' },
			{ title: 'O nome Aquiles', text: 'Alusão ao herói grego da guerra de Troia, cantado na Ilíada; a lenda do calcanhar vulnerável vem de tradição posterior a Homero. A intertextualidade gera ironia trágica: o semideus quase invencível vira um menino frágil, ferido desde o nascimento.' },
			{ title: '“Paraíso”', text: 'O nome de um bairro de lata é ironia (antífrase): evoca plenitude e designa a exclusão. Ao mesmo tempo, é ali que surgem os laços de afeto com Pepe e Iuri — o “paraíso” possível e precário.' },
			{ title: 'O título como itinerário', text: 'Três nomes em enumeração, sem conjunção (assíndeto), traçam um percurso que, em vez de ascender, desce: origem → promessa → margem. Terminar em “Paraíso” intensifica a ironia.' },
			{ title: 'A renda', text: 'A memória de Glória está presa ao Império “como uma renda esgarçada a um alfinete”, e logo depois ela aparece de “luvas de renda”: a mesma palavra liga a elegância assimilada do passado à sua forma gasta e frágil no presente.' },
			{ title: 'O espelho, o boneco e a marioneta', text: 'No hospital, Aquiles se vê como objeto desmontado: imagens de coisificação do corpo submetido à medicina e ao olhar alheio.' },
			{ title: 'A janela do hospital', text: '“Uma moldura do mundo”: o mundo visto de fora, onde os outros vão e vêm (o “ir-e-vir” dos enfermeiros), enquanto Aquiles permanece imóvel.' },
			{ title: 'O fogo', text: 'O incêndio da barraca destrói o pouco que pai e filho tinham e os obriga a depender da solidariedade de Pepe.' },
			{ title: 'O livro por escrever', text: 'Imagem metaficcional do fim: a vida dos personagens comparada a um livro inacabado. O romance reflete sobre a própria forma e recusa um fechamento consolador.' }
		],
		linguagem: [
			'Prosa lírica e precisa, de frases longas, subordinação e imagens inesperadas (comparações como “renda esgarçada a um alfinete” e “jogo de damas deitado ao ar”). O lirismo convive com a crueza: a beleza da frase não suaviza a dor, torna-a mais nítida.',
			'Metaficção e metalinguagem: o narrador comenta como uma história pode começar (cap. 1) e encerra a amizade de Cartola e Pepe com a imagem de “um livro por escrever” (cap. 53). O programa de 2027 inclui “metaficção” entre os elementos da narrativa.',
			'Narrador que modaliza: em vez de afirmar tudo, às vezes apenas supõe (“Talvez sonhasse…”). A onisciência é relativizada, e a interioridade da personagem permanece em parte inacessível.',
			'Vocabulário técnico-médico (“pinos intramedulares”, “enxerto de tecido muscular”, “convalescença”) contrasta com o vocabulário afetivo e produz efeito de frieza e coisificação do corpo.',
			'Português europeu: vocabulário (“bata”, “bebé”, “anca”, “aperaltada”), colocação pronominal enclítica (“deu-lhe”, “comeu-se”, “acontecia-lhe”, “ver-se ao espelho”), regências (“agarrou no calcanhar”, “em que ninguém pegaria”) e o mais-que-perfeito simples (“reunira”). A grafia pode variar conforme a edição (ex.: “baptizado”), mas a sintaxe e o léxico lusitanos permanecem.',
			'Ironia e humor amargo: “Comeu-se e bebeu-se como se faria se o calcanhar do bebé fosse perfeito” — a frase registra a festa e, ao mesmo tempo, o fingimento coletivo.'
		],
		interpretacoes: [
			'Leitura pós-colonial (“retorno às avessas”): o romance narra a experiência do ex-colonizado na ex-metrópole, sem idealizações, e mostra que o fim do império não desfez as hierarquias que ele criou.',
			'O corpo como arquivo da história: o calcanhar de Aquiles, a doença de Glória e a morte de Iuri tornam visível, em corpos concretos, a violência social e histórica.',
			'Anti-épico: o nome de um herói da Ilíada é dado a um menino frágil; em vez da guerra gloriosa, a pequena luta cotidiana de imigrantes pobres.',
			'Realismo sem melodrama: a morte de Iuri frustra a redenção afetiva, preserva a verossimilhança e mantém o pacto trágico do livro.',
			'Os espaços como agentes: Luanda, Lisboa e Paraíso não são cenários neutros; participam da transformação das personagens.',
			'Afetos masculinos e cuidado: a crítica destaca a ternura entre pai e filho e entre os dois velhos, numa narrativa em que o afeto convive com a miséria e a doença.'
		],
		relacoes: [
			'História: Estatuto do Indigenato e assimilação; guerra de libertação (1961–1974); Revolução dos Cravos (1974); independência de Angola (1975); guerra civil (1975–2002) e Guerra Fria em África — item “África, Ásia e América Latina em um mundo bipolar”.',
			'Geografia: migrações internacionais, segregação socioespacial e habitação precária nas periferias metropolitanas — item “espaço urbano”.',
			'Atualidade: racismo estrutural, xenofobia e direitos de imigrantes na Europa.',
			'Literatura: “O retorno”, de Dulce Maria Cardoso; Pepetela e Mia Couto (obras já indicadas pela UERJ); o mito de Aquiles e a Ilíada.',
			'Língua portuguesa: variação entre português europeu e brasileiro — item “Unidade e diversidade da língua portuguesa”.'
		],
		abordagens: [
			{ title: 'Elementos da narrativa', text: 'Prepare-se para explicar enredo, construção dos personagens, narrador e foco narrativo, índices narrativos, tempo, espaço, metaficção e verossimilhança — todos citados no programa (“Elementos da narrativa selecionada”). Use as tabelas abaixo.' },
			{ title: 'Recursos expressivos', text: 'Historicamente, “recursos expressivos da criação estética” e “elementos da narrativa” foram os itens mais classificados em Língua Portuguesa e Literaturas (2017–2026). Treine: comparação, metáfora, metonímia, ironia, personificação, alusão.' },
			{ title: 'Gramática a serviço do sentido', text: 'A UERJ pede função sintática, classe de palavras, valor semântico e processo de formação — sempre ligados ao efeito no texto (em 2026: adjuntos adverbiais de modo e seu valor semântico). Veja a seção “Gramática a partir da obra”.' },
			{ title: 'Literatura e sociedade', text: 'Relacione o romance ao colonialismo, à descolonização, à imigração e ao racismo — com datas e conceitos, sem transformar a resposta em aula de História.' },
			{ title: 'Gêneros e hibridismo', text: 'Observe se há cartas, memórias ou outros gêneros dentro do romance e o efeito disso na narrativa (itens “Gêneros textuais” e “Hibridismo” do programa).' }
		],
		confiraNaLeitura: [
			'O ano exato da viagem e a idade de Aquiles na partida (resenhas indicam 1984; material didático indica que ele viaja antes de completar 15 anos).',
			'A localização do Paraíso: as fontes falam em bairro de lata da periferia/arredores de Lisboa.',
			'A ordem dos acontecimentos no Paraíso (incêndio da barraca, convivência na taberna de Pepe, morte de Iuri).',
			'O destino de Pepe na parte final: resenhas e trabalhos acadêmicos registram sua morte, mas divergem quanto às circunstâncias.',
			'Se há cartas entre Lisboa e Luanda e o que revelam (gêneros textuais: carta, memória).',
			'O destino de Glória e de Justina.',
			'As páginas dos trechos que você usaria: a paginação muda entre a edição portuguesa e a brasileira (os trechos abaixo são identificados por capítulo).'
		],
		referencias: [
			'ALMEIDA, Djaimilia Pereira de. Luanda, Lisboa, Paraíso. Lisboa: Companhia das Letras, 2018; São Paulo: Todavia, 2019.',
			'UERJ/DEPSEA. Edital do Exame Discursivo 2027, Anexo 5 – Conteúdos Programáticos (Língua Portuguesa e Literaturas).',
			'UERJ. Questões Comentadas – Exame Discursivo 2026, Língua Portuguesa e Literaturas (padrão de cobrança sobre o romance indicado).',
			'Artigo “Um ‘retorno’ às avessas: Djaimilia Pereira de Almeida em Luanda, Lisboa, Paraíso”, revista Metamorfoses (UFRJ).',
			'CARDOSO, Dulce Maria. O retorno (2011) — para comparação.',
			'Material de análise e simulado sobre o romance (Alfacem Global Academy), cedido por estudante e usado para conferir personagens e trechos; as análises desta página são da plataforma.'
		],
		linhaDoTempo: [
			{ quando: 'Tempo colonial', fato: 'Nascimento e batismo de Aquiles, com o calcanhar esquerdo malformado; juventude de Glória “admitida” em espaços de brancos.' },
			{ quando: '1961–1975', fato: 'Guerra de libertação; Revolução dos Cravos (1974); independência de Angola (11/11/1975).' },
			{ quando: '1975–2002', fato: 'Guerra civil angolana — pano de fundo da falta de tratamento em Luanda.' },
			{ quando: 'Meados dos anos 1980', fato: 'Cartola e Aquiles partem para Lisboa (resenhas indicam 1984); Glória e Justina ficam.' },
			{ quando: 'Anos em Lisboa', fato: 'Quatro operações e longas convalescenças; o dinheiro acaba; o retorno é adiado.' },
			{ quando: 'Paraíso', fato: 'Vida no bairro de lata; Cartola na construção civil; amizade com Pepe; incêndio da barraca; morte de Iuri (cap. 53).' },
			{ quando: 'Desfecho', fato: 'Sem redenção: “o horizonte aberto de um livro por escrever” (confira o destino de cada personagem).' }
		],
		espacos: [
			{ lugar: 'Luanda', funcao: 'Origem, família e memória', naObra: 'Lugar deixado por Cartola e Aquiles, onde ficam Glória e Justina; liga o presente ao passado colonial e ao país em guerra.' },
			{ lugar: 'Lisboa', funcao: 'Expectativa e desilusão', naObra: 'A “metrópole” idealizada, procurada como lugar de tratamento, revela-se espaço de anonimato, espera e exclusão (pensão, hospital).' },
			{ lugar: 'O hospital', funcao: 'Imobilidade e coisificação', naObra: 'Pela janela, Aquiles vê o “ir-e-vir” dos enfermeiros enquanto se sente “preso num corpo errado”.' },
			{ lugar: 'Paraíso', funcao: 'Marginalização social e geográfica — e afeto possível', naObra: 'Bairro de lata da periferia onde pai e filho passam a viver; o nome é irônico; ali surgem os laços com Pepe e Iuri.' },
			{ lugar: 'A taberna de Pepe', funcao: 'Refúgio e solidariedade', naObra: 'Espaço da amizade dos dois velhos; depois do incêndio, abrigo de pai e filho.' }
		],
		elementos: [
			{ elemento: 'Enredo', conceito: 'Organização dos acontecimentos: situação inicial, conflito, complicações, clímax e desfecho.', naObra: 'Viagem para tratamento → permanência forçada → degradação (dinheiro, trabalho, moradia) → perdas (incêndio, morte de Iuri) → desfecho aberto.' },
			{ elemento: 'Personagens', conceito: 'Redondas (complexas, mudam) × planas (traço dominante); protagonista e secundárias.', naObra: 'Cartola e Aquiles são protagonistas redondos; Pepe e Iuri ampliam o drama; Glória e Justina representam a família que fica.' },
			{ elemento: 'Narrador e foco narrativo', conceito: 'Quem conta (1ª ou 3ª pessoa) e a perspectiva pela qual os fatos são apresentados.', naObra: 'Narrador em 3ª pessoa, próximo da interioridade das personagens, que às vezes apenas supõe (“Talvez sonhasse”).' },
			{ elemento: 'Índices narrativos', conceito: 'Detalhes que antecipam ou sugerem sentidos desenvolvidos depois.', naObra: 'O calcanhar escondido no batismo; o nome Aquiles; o brinde “grego em terra de troianos”.' },
			{ elemento: 'Tempo', conceito: 'Cronológico (sucessão dos fatos) × psicológico (vivência interior); analepses (retornos ao passado).', naObra: 'Do tempo colonial aos anos em Lisboa; a memória de Glória presa ao Império; o “tempo roubado pela convalescença”.' },
			{ elemento: 'Espaço', conceito: 'Físico, social e psicológico; o espaço pode caracterizar e transformar personagens.', naObra: 'Luanda, Lisboa e Paraíso têm funções distintas (ver tabela de espaços).' },
			{ elemento: 'Metaficção', conceito: 'O texto reflete sobre o próprio processo de criação ficcional.', naObra: '“Se uma história se parece com o corpo de um animal, então pode começar por um calcanhar.” / “um livro por escrever”.' },
			{ elemento: 'Verossimilhança', conceito: 'Coerência interna que faz o mundo narrado parecer possível.', naObra: 'A morte de Iuri impede um final idealizado e mantém o pacto realista e trágico.' }
		],
		trechos: [
			{
				ref: 'Capítulo 1 — abertura',
				texto: 'Se uma história se parece com o corpo de um animal, então pode começar por um calcanhar.',
				leitura: 'A primeira frase fala da própria narrativa: o narrador escolhe começar pela parte “menor” e frágil do corpo — e é essa fragilidade que vai mover toda a história.',
				recursos: [
					{ nome: 'Comparação (símile)', comentario: 'A história é aproximada do corpo de um animal por uma relação explícita (“se parece com”).' },
					{ nome: 'Metalinguagem / metaficção', comentario: 'O narrador comenta como uma história pode começar — reflexão sobre a própria construção ficcional.' },
					{ nome: 'Período composto', comentario: 'Oração subordinada adverbial condicional (“Se uma história se parece…”) + oração principal (“então pode começar…”); “então” reforça a relação de consequência lógica.' },
					{ nome: 'Índice narrativo', comentario: 'O calcanhar remete à condição de Aquiles e, pela alusão ao mito, à vulnerabilidade.' }
				]
			},
			{
				ref: 'Capítulo 1 — o batismo',
				texto: '“Vale mais nascer grego em terra de troianos do que nascer gazela em terra de leões”, alvitrou ao erguer o menino no dia em que Aquiles foi baptizado. […] O pai, com o menino apoiado na anca, agarrou no calcanhar com a mão para que não se visse. Comeu-se e bebeu-se como se faria se o calcanhar do bebé fosse perfeito.',
				leitura: 'O brinde de Cartola deseja ao filho a força do guerreiro, mesmo em terra inimiga — e antecipa, com ironia, o destino do rapaz: estrangeiro em terra alheia e, ao mesmo tempo, frágil como a presa. O gesto de esconder o calcanhar e a festa que finge normalidade mostram a relação da família com o estigma.',
				recursos: [
					{ nome: 'Discurso direto + verbo de elocução', comentario: '“alvitrou” (= propôs, sugeriu) introduz a fala; a escolha de um verbo raro dá solenidade ao brinde.' },
					{ nome: 'Comparação entre orações', comentario: '“Vale mais [nascer grego…] do que [nascer gazela…]”: as orações de infinitivo funcionam como sujeito de “vale”; “do que” introduz o segundo termo da comparação.' },
					{ nome: 'Oração subordinada adverbial final', comentario: '“para que não se visse”: finalidade; o “se” é pronome apassivador (= “para que não fosse visto”, o calcanhar).' },
					{ nome: 'Sujeito indeterminado', comentario: '“Comeu-se e bebeu-se”: verbos sem objeto + “se” (índice de indeterminação do sujeito) — a coletividade anônima participa do fingimento.' },
					{ nome: 'Hipótese irreal e ironia', comentario: '“como se faria se o calcanhar […] fosse perfeito”: o imperfeito do subjuntivo marca uma condição contrária à realidade.' }
				]
			},
			{
				ref: 'Capítulo 2 — Glória',
				texto: 'Ela não sabia quem era nem onde estava. A sua memória tinha ficado presa ao Império como uma renda esgarçada a um alfinete. Talvez sonhasse que Cartola a levava a passear num Ford pela marginal ou que era hora de se encontrar com as amigas saindo de casa aperaltada: a única negra fula de luvas de renda e saltos agulha admitida no Hotel da Ponte Branca.',
				leitura: 'A doença apaga o presente de Glória e a devolve ao passado colonial, lembrado como glória pessoal. Mas a lembrança é a de uma exceção — “a única […] admitida” —, o que revela a regra de exclusão racial da ordem colonial e a fragilidade da assimilação.',
				recursos: [
					{ nome: 'Comparação', comentario: '“como uma renda esgarçada a um alfinete”: memória frágil, desfiada, presa a um único ponto (o Império).' },
					{ nome: 'Coesão por repetição lexical', comentario: '“renda” reaparece em “luvas de renda”: a imagem da memória nasce do próprio objeto da elegância assimilada.' },
					{ nome: 'Modalização do narrador', comentario: '“Talvez” marca hipótese: o narrador não afirma o que Glória sonha; a interioridade dela permanece inacessível.' },
					{ nome: 'Subjuntivo × indicativo', comentario: '“talvez sonhasse” (incerteza, exigida por “talvez” anteposto) × “levava” (cena imaginada apresentada como vívida e habitual).' },
					{ nome: 'Aposto', comentario: '“a única negra fula […] admitida no Hotel da Ponte Branca” explica e especifica quem era Glória naquela cena.' },
					{ nome: 'Orações substantivas', comentario: '“quem era” e “onde estava”: orações subordinadas substantivas objetivas diretas (interrogativas indiretas), coordenadas por “nem”.' }
				]
			},
			{
				ref: 'Capítulo 6 — Aquiles no hospital',
				texto: 'A primeira operação de Aquiles correu tão mal quanto as três que se seguiram. […] Ao ver-se ao espelho, sentia-se um boneco em que ninguém pegaria, uma marioneta que tivessem desmontado para ver como funcionava […]. Enfermeiros de bata num ir-e-vir conversavam e fumavam cigarros, visão que o fazia sentir preso num corpo errado com vista para uma moldura do mundo aberta por uma pena que o humilhava.',
				leitura: 'O corpo de Aquiles é tratado como objeto — desmontado, consertado com parafusos e pinos —, e ele mesmo passa a se ver assim. A janela mostra o movimento dos outros e acentua a sua imobilidade; a compaixão alheia, em vez de consolar, humilha.',
				recursos: [
					{ nome: 'Correlação comparativa', comentario: '“tão mal quanto as três que se seguiram”: oração comparativa (verbo elíptico); revela que foram quatro operações, todas malsucedidas.' },
					{ nome: 'Metáfora e coisificação', comentario: '“sentia-se um boneco”, “uma marioneta”: o corpo como objeto manipulado por outros.' },
					{ nome: 'Sujeito indeterminado', comentario: '“que tivessem desmontado”: 3ª pessoa do plural sem referente — as mãos que intervêm no corpo são anônimas.' },
					{ nome: 'Derivação imprópria', comentario: '“ir-e-vir”, precedido de artigo (“num” = em + um), passa a substantivo: o movimento dos outros contrasta com a paralisia de Aquiles.' },
					{ nome: 'Polissemia', comentario: '“pena” = compaixão (e não castigo ou pluma): a piedade alheia humilha.' },
					{ nome: 'Variação regional', comentario: '“bata” (jaleco, no Brasil), “ver-se ao espelho”, “em que ninguém pegaria” (regência lusitana de “pegar em”).' }
				]
			},
			{
				ref: 'Capítulo 53 — Iuri',
				texto: 'Iuri era o menino que eles não tinham sido. […] Não tinham querido ser meninos de novo, através de Iuri, mas meninos pela segunda vez, sem saberem que o desejo de uma segunda infância era sinal de que a vida os reunira adoentados, esquecidos daquilo que os distinguia. […] Morto Iuri, Cartola e Pepe estavam obrigados a lidar com o horizonte aberto de um livro por escrever.',
				leitura: 'Os dois velhos projetam em Iuri não a repetição da própria infância, mas uma infância nova, que a vida lhes negou. A morte do menino frustra essa promessa e deixa a amizade “inconclusa”; o narrador fecha o episódio com uma imagem metaficcional.',
				recursos: [
					{ nome: 'Oração adjetiva', comentario: '“que eles não tinham sido”: o relativo “que” retoma “o menino” e funciona como predicativo dentro da oração (eles não tinham sido o menino).' },
					{ nome: 'Retificação', comentario: '“não… de novo, […] mas… pela segunda vez”: o “mas” corrige a ideia — não repetir a infância, e sim viver outra.' },
					{ nome: 'Infinitivo flexionado', comentario: '“sem saberem”: o infinitivo concorda com o sujeito (Cartola e Pepe).' },
					{ nome: 'Mais-que-perfeito simples e predicativo do objeto', comentario: '“a vida os reunira adoentados, esquecidos…”: ação anterior a outra passada; “adoentados” e “esquecidos” caracterizam o objeto “os”.' },
					{ nome: 'Oração reduzida de particípio', comentario: '“Morto Iuri”: valor temporal/causal (= depois que / como Iuri morreu).' },
					{ nome: 'Metaficção', comentario: '“um livro por escrever” (= ainda não escrito): a vida dos personagens como narrativa aberta.' }
				]
			}
		],
		gramatica: [
			{ item: 'Sujeito indeterminado com “se”', programa: 'A oração e o período', exemplo: '“Comeu-se e bebeu-se…” (cap. 1)', analise: 'Verbos sem objeto direto + “se” = índice de indeterminação do sujeito. Efeito: a coletividade anônima finge normalidade.' },
			{ item: 'Pronome apassivador', programa: 'Sintaxe do nome e do verbo (vozes verbais)', exemplo: '“para que não se visse” (cap. 1)', analise: 'Voz passiva sintética: “para que [o calcanhar] não fosse visto”. A oração é adverbial final.' },
			{ item: 'Orações de infinitivo como sujeito', programa: 'A oração e o período', exemplo: '“Vale mais nascer grego em terra de troianos do que nascer gazela…”', analise: '“nascer grego…” é oração subordinada substantiva subjetiva reduzida de infinitivo; “do que…” introduz a comparação.' },
			{ item: 'Interrogativas indiretas', programa: 'A oração e o período', exemplo: '“Ela não sabia quem era nem onde estava.” (cap. 2)', analise: 'Orações subordinadas substantivas objetivas diretas, coordenadas pela conjunção aditiva negativa “nem”.' },
			{ item: '“Talvez” + subjuntivo', programa: 'Morfologia do verbo (modo)', exemplo: '“Talvez sonhasse que Cartola a levava…”', analise: 'O advérbio de dúvida anteposto exige subjuntivo (hipótese); “levava” (indicativo) dá à cena sonhada estatuto de realidade vívida.' },
			{ item: 'Aposto', programa: 'A oração e o período (termos acessórios)', exemplo: '“…aperaltada: a única negra fula […] admitida no Hotel da Ponte Branca.”', analise: 'O segmento após os dois-pontos explica e especifica a personagem (Glória). Sentido: o privilégio individual confirma a regra de exclusão.' },
			{ item: 'Correlação comparativa', programa: 'A oração e o período (correlação)', exemplo: '“correu tão mal quanto as três que se seguiram” (cap. 6)', analise: 'Oração subordinada adverbial comparativa com verbo elíptico; “que se seguiram” é oração adjetiva restritiva.' },
			{ item: 'Locução verbal com gerúndio', programa: 'Sintaxe do nome e do verbo (gerúndio)', exemplo: '“e ele foi ficando um homem” (cap. 6)', analise: 'Ir + gerúndio expressa aspecto gradual: o crescimento acontece aos poucos, em paralelo às cirurgias.' },
			{ item: 'Formação de palavras', programa: 'Estrutura, derivação e composição', exemplo: '“intramedulares” (cap. 6)', analise: 'Prefixo intra- + radical medul- (de medula) + sufixo -ar + desinência de plural -es. Não é parassíntese, pois “medular” existe sozinha.' },
			{ item: 'Derivação imprópria', programa: 'Classificação, significação e uso das palavras', exemplo: '“num ir-e-vir” (cap. 6)', analise: 'A sequência verbal vira substantivo ao receber determinante (“um”).' },
			{ item: 'Particípio com valor passivo', programa: 'Sintaxe do nome e do verbo (particípio; vozes)', exemplo: '“o tempo roubado pela convalescença” (cap. 6)', analise: 'Oração adjetiva reduzida de particípio, de sentido passivo (= que fora roubado); “pela convalescença” é agente da passiva. Há também personificação.' },
			{ item: 'Polissemia', programa: 'O significado lexical e suas relações', exemplo: '“uma pena que o humilhava” (cap. 6)', analise: '“Pena” = compaixão; o contexto desfaz a ambiguidade com “castigo” e “pluma”.' },
			{ item: 'Coesão: retificação', programa: 'Coesão textual', exemplo: '“não… de novo, […] mas… pela segunda vez” (cap. 53)', analise: 'O “mas” não opõe ideias contrárias: corrige e precisa o sentido (não repetição, e sim outra infância).' },
			{ item: 'Infinitivo flexionado', programa: 'Sintaxe do nome e do verbo (infinitivo)', exemplo: '“sem saberem”; “para voltarem a pôr” (caps. 53 e 6)', analise: 'O infinitivo concorda com o sujeito plural — marca típica e muito cobrada da norma padrão.' },
			{ item: 'Variação regional', programa: 'Unidade e diversidade da língua portuguesa', exemplo: '“bata”, “bebé”, “anca”, “agarrou no calcanhar”, “ver-se ao espelho”', analise: 'Marcas lexicais e sintáticas do português europeu: um mesmo idioma, normas diferentes.' }
		]
	}
];

export function getObra(slug: string): Obra | undefined {
	return OBRAS.find((o) => o.slug === slug);
}
