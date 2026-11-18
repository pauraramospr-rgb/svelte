/**
 * Temas em evidência para o Exame Discursivo 2027 (prova em 29/11/2026).
 *
 * Duas camadas, sempre separadas na interface:
 * 1. EVIDÊNCIA (análise de provas anteriores): questões oficiais que partiram de efemérides
 *    ou de notícias do próprio ano — verificáveis no banco oficial.
 * 2. PREVISÃO: efemérides e assuntos de 2025–2026 que PODEM servir de ponto de partida.
 *    As datas são fatos; a possibilidade de cobrança é hipótese, nunca garantia.
 */

/** Questões oficiais que usaram aniversários ou notícias recentes como ponto de partida. */
export const EVIDENCIAS: { id: string; gancho: string }[] = [
	{ id: '2026-HIS-08', gancho: 'Centenário de nascimento de Frantz Fanon (1925–2025)' },
	{ id: '2026-HIS-06', gancho: 'Relação “bicentenária” Brasil–EUA e o tarifaço de 2025' },
	{ id: '2026-HIS-09', gancho: 'Correção da certidão de óbito de Zuzu Angel (2025)' },
	{ id: '2026-HIS-10', gancho: 'Remake da novela “Vale Tudo” (2025) e a redemocratização' },
	{ id: '2024-HIS-10', gancho: '40 anos de fundação do MST (1984–2024)' },
	{ id: '2024-HIS-05', gancho: 'Abolição (1888) e seu centenário (1988)' },
	{ id: '2025-HIS-01', gancho: '500 anos da chegada dos portugueses (exposição de 2000)' },
	{ id: '2020-HIS-07', gancho: 'Moeda do centenário da Independência (1922)' },
	{ id: '2020-HIS-01', gancho: 'Pintura dos 400 anos da chegada de Colombo (1892)' },
	{ id: '2019-HIS-06', gancho: 'Centenário do voto feminino no Reino Unido (1918–2018)' },
	{ id: '2018-HIS-01', gancho: '400 anos de nascimento de Calvino (monumento de 1909)' }
];

export interface TemaEvidencia {
	marco: string;
	data: string;
	disciplinas: string[];
	topicIds: string[];
	porque: string;
	angulos: string[];
}

export const EM_EVIDENCIA: { grupo: string; temas: TemaEvidencia[] }[] = [
	{
		grupo: 'Efemérides de 2026',
		temas: [
			{
				marco: '250 anos da Independência dos Estados Unidos',
				data: '4 de julho de 1776',
				disciplinas: ['HIS'],
				topicIds: ['his-os-colonialismos-em-questao', 'his-formacao-e-consolidacao-do-capitalismo-nos-estados-unidos'],
				porque: 'Efeméride redonda de um tema do programa; a UERJ tratou da relação Brasil–EUA em 2026.',
				angulos: [
					'Iluminismo (Locke), direitos naturais e contrato social na Declaração.',
					'Contradição liberdade × escravidão (três quintos; abolição só em 1865).',
					'Comparação com Haiti (1804), América espanhola e Brasil (independência conservadora); Conjuração Mineira.',
					'Federalismo: da Secessão às disputas entre estados e governo federal sobre imigração (2025).'
				]
			},
			{
				marco: '70 anos da posse de Juscelino Kubitschek e 50 anos de sua morte',
				data: '31 de janeiro de 1956 / 22 de agosto de 1976',
				disciplinas: ['HIS', 'GEO'],
				topicIds: ['his-estado-e-industrializacao-na-america-latina', 'his-as-ditaduras-na-america-latina-e-os-movimentos-de-resistenci', 'geo-espaco-urbano'],
				porque: 'Dupla efeméride somada a um fato novo: em maio de 2026, a CEMDP reconheceu a morte de JK como causada pela ditadura.',
				angulos: [
					'Plano de Metas, indústria automobilística, rodoviarismo e Brasília.',
					'Tripé econômico e a contradição crescimento × inflação e dívida externa.',
					'Cassação (AI-1, 1964), exílio e Frente Ampla (1966–1968).',
					'Memória e revisão: CNV (2014) × CEMDP (2026).'
				]
			},
			{
				marco: '50 anos do golpe na Argentina e da Operação Condor em ação',
				data: '24 de março de 1976 (Condor formalizada em 1975)',
				disciplinas: ['HIS'],
				topicIds: ['his-as-ditaduras-na-america-latina-e-os-movimentos-de-resistenci'],
				porque: 'Item de História muito cobrado nas edições recentes (2025 e 2026).',
				angulos: [
					'Repressão transnacional no Cone Sul; desaparecimentos forçados.',
					'Justiça de transição comparada: Argentina (julgamentos) × Brasil (anistia).',
					'Memória e esquecimento; Mães da Praça de Maio.'
				]
			},
			{
				marco: '80 anos do fim do Tribunal de Nuremberg e da Constituição de 1946',
				data: 'outubro de 1946 / 18 de setembro de 1946',
				disciplinas: ['HIS'],
				topicIds: ['his-a-guerra-em-dois-movimentos', 'his-a-construcao-da-hegemonia-norte-americana', 'his-as-ditaduras-na-america-latina-e-os-movimentos-de-resistenci'],
				porque: 'Origem dos crimes contra a humanidade e da responsabilização de agentes do Estado — base dos debates sobre a anistia brasileira.',
				angulos: [
					'Quem julgou (EUA, Reino Unido, França, URSS) e por quais crimes.',
					'“Cumprir ordens” não exime de responsabilidade; crítica da “justiça dos vencedores”.',
					'Do tribunal à DUDH (1948) e ao Tribunal Penal Internacional (1998).'
				]
			},
			{
				marco: '70 anos de 1956: discurso secreto de Khrushchev, Revolução Húngara e crise de Suez',
				data: '1956',
				disciplinas: ['HIS'],
				topicIds: ['his-guerra-fria', 'his-o-mundo-socialista', 'his-oriente-medio'],
				porque: 'Ano-chave da Guerra Fria e da descolonização (Suez), conteúdos muito classificados pela UERJ.',
				angulos: ['Desestalinização e seus limites (Hungria).', 'Nacionalismo árabe (Nasser) e o fim da hegemonia anglo-francesa.']
			},
			{
				marco: '50 anos do Levante de Soweto',
				data: '16 de junho de 1976',
				disciplinas: ['HIS'],
				topicIds: ['his-africa-asia-e-america-latina-em-um-mundo-bipolar', 'his-a-nova-ordem-em-um-mundo-multipolar'],
				porque: 'O programa destaca conflitos étnico-raciais na África e a crítica ao eurocentrismo.',
				angulos: ['Apartheid, resistência estudantil e o fim do regime (1994).']
			},
			{
				marco: '40 anos do acidente de Chernobyl',
				data: '26 de abril de 1986',
				disciplinas: ['HIS', 'QUI', 'GEO'],
				topicIds: ['his-o-mundo-socialista', 'qui-radioatividade', 'geo-relacao-sociedade-natureza'],
				porque: 'Tema que cruza disciplinas: glasnost e crise soviética, radioatividade (meia-vida) e riscos ambientais.',
				angulos: ['Glasnost e desgaste da URSS.', 'Decaimento radioativo e meia-vida.', 'Energia nuclear e matriz energética.']
			},
			{
				marco: '30 anos do massacre de Eldorado dos Carajás',
				data: '17 de abril de 1996',
				disciplinas: ['HIS', 'GEO'],
				topicIds: ['geo-espaco-rural', 'his-as-ditaduras-na-america-latina-e-os-movimentos-de-resistenci'],
				porque: 'A UERJ cobrou o MST em 2024 e Carajás (Projeto Grande Carajás) em 2025.',
				angulos: ['Concentração fundiária, conflitos no campo e reforma agrária.']
			}
		]
	},
	{
		grupo: 'Fatos de 2025 que podem reaparecer',
		temas: [
			{
				marco: '50 anos das independências de Angola e Moçambique',
				data: '11 de novembro e 25 de junho de 1975',
				disciplinas: ['HIS', 'LPL'],
				topicIds: ['his-africa-asia-e-america-latina-em-um-mundo-bipolar', 'lpl-literatura-e-sociedade'],
				porque: 'Liga a História ao romance indicado, “Luanda, Lisboa, Paraíso”, cuja trama nasce do pós-independência angolano.',
				angulos: ['Revolução dos Cravos e descolonização portuguesa.', 'Guerra civil angolana e Guerra Fria em África.', '“Retornados” e o “retorno às avessas” do romance.']
			},
			{
				marco: 'Imigração e deportações nos EUA; Guarda Nacional em Los Angeles',
				data: 'junho de 2025',
				disciplinas: ['HIS', 'GEO'],
				topicIds: ['his-formacao-e-consolidacao-do-capitalismo-nos-estados-unidos', 'geo-geografia-politica-e-a-geopolitica-do-mundo-contemporaneo'],
				porque: 'A UERJ usou a política externa de Trump em 2026; a imigração é o outro grande eixo do governo.',
				angulos: ['Leis de exclusão (1882, 1924), ICE (2003) e doutrina Bush (2002).', 'Muro com o México; direitos humanos × soberania; federalismo.']
			},
			{
				marco: 'COP30 em Belém',
				data: 'novembro de 2025',
				disciplinas: ['GEO', 'BIO'],
				topicIds: ['geo-relacao-sociedade-natureza', 'bio-bases-da-ecologia'],
				porque: 'Conferência do clima sediada no Brasil, na Amazônia.',
				angulos: ['Mudanças climáticas e desmatamento.', 'Ciclos biogeoquímicos e efeito estufa.']
			},
			{
				marco: '80 anos do fim da Segunda Guerra, da ONU e das bombas atômicas',
				data: '1945',
				disciplinas: ['HIS'],
				topicIds: ['his-a-guerra-em-dois-movimentos', 'his-a-construcao-da-hegemonia-norte-americana'],
				porque: 'A UERJ cobrou testes nucleares e Hiroshima em 2024 (questão 9).',
				angulos: ['Criação da ONU; Nuremberg; início da Guerra Fria.']
			}
		]
	}
];
