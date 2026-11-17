/**
 * Propostas de redação PLAUSÍVEIS para 2027 (categoria: previsão / possibilidade).
 *
 * Fundamentação (verificável): o Anexo 5 do edital 2027 informa que o tema terá como base
 * "O bem-amado", de Dias Gomes, e que a discussão partirá de "uma questão levantada a partir
 * desse texto teatral, que admite posicionamentos diferentes". O histórico 2018–2026 mostra
 * propostas formuladas como pergunta ligada a dilemas sociais/éticos do livro.
 *
 * Nenhuma destas propostas é oficial. Os textos motivadores foram escritos pela plataforma.
 * Os repertórios citam apenas obras e normas amplamente documentadas.
 */
export interface RedacaoTema {
	id: string;
	question: string;
	link: string; // ligação com a peça
	recortes: { title: string; text: string }[];
	motivadores: { title: string; text: string }[];
	repertorio: { ref: string; use: string }[];
	caminhos: { posicao: 'Sim' | 'Não' | 'Depende'; tese: string; argumentos: string[] }[];
	armadilhas: string[];
}

export const TEMAS_2027: RedacaoTema[] = [
	{
		id: 'forma-conteudo-discurso',
		question: 'Na política, a forma do discurso importa mais do que o seu conteúdo?',
		link: 'Odorico Paraguaçu se impõe pela fala: seu modo de discursar, cheio de palavras inventadas e falsa erudição (o chamado “odoriquês”), impressiona o eleitorado de Sucupira mesmo quando nada diz de concreto.',
		recortes: [
			{ title: 'Retórica e manipulação', text: 'Discutir como recursos de linguagem podem seduzir o público e encobrir a falta de propostas, e quais condições tornam o eleitor vulnerável a isso.' },
			{ title: 'Comunicação e democracia', text: 'Discutir se uma boa comunicação é condição legítima da política democrática — e onde termina a persuasão e começa a manipulação.' },
			{ title: 'Educação e leitura crítica', text: 'Discutir o papel da formação do cidadão para distinguir eloquência de consistência.' }
		],
		motivadores: [
			{
				title: 'Texto I — elaborado para esta proposta',
				text: 'Em Sucupira, o prefeito discursa como quem toca uma banda de música: o povo nem sempre entende as palavras, mas acompanha o ritmo. Quando a promessa falha, o discurso muda de melodia, e o aplauso continua.'
			},
			{
				title: 'Texto II — elaborado para esta proposta',
				text: 'Nas redes, uma frase curta e marcante pode circular mais do que um programa de governo inteiro. A forma viaja depressa; o conteúdo exige tempo de leitura.'
			}
		],
		repertorio: [
			{ ref: 'George Orwell, ensaio “A política e a língua inglesa” (1946)', use: 'Crítica à linguagem política vaga e eufemística, que “defende o indefensável”.' },
			{ ref: 'Aristóteles, “Retórica”', use: 'Os três meios de persuasão — ethos, pathos e logos — permitem discutir o equilíbrio entre forma e argumento.' },
			{ ref: 'Palavra do ano “pós-verdade” (Dicionários Oxford, 2016)', use: 'Ilustra contextos em que apelos emocionais pesam mais do que fatos na formação da opinião pública.' }
		],
		caminhos: [
			{
				posicao: 'Sim',
				tese: 'Na prática política, a forma do discurso frequentemente se sobrepõe ao conteúdo, como mostra Odorico, o que exige do eleitor desconfiança crítica.',
				argumentos: ['A emoção mobiliza mais rapidamente do que a análise de propostas.', 'Em Sucupira, a eloquência vazia de Odorico garante apoio mesmo diante de promessas absurdas.']
			},
			{
				posicao: 'Não',
				tese: 'O conteúdo deve prevalecer, e a sátira de Dias Gomes funciona justamente como denúncia de uma política que se reduz à forma.',
				argumentos: ['Discursos sem substância cobram seu preço quando a realidade se impõe (o cemitério sem uso).', 'Instituições de controle e imprensa livre expõem a distância entre fala e ação.']
			},
			{
				posicao: 'Depende',
				tese: 'Forma e conteúdo só se equilibram quando há cidadãos capazes de ler criticamente o discurso político.',
				argumentos: ['A educação para a leitura crítica reduz o poder da retórica vazia.', 'Boa comunicação é legítima quando torna compreensível uma proposta real.']
			}
		],
		armadilhas: ['Resumir a peça em vez de discutir a questão.', 'Tratar o “odoriquês” apenas como piada, sem relacioná-lo à manipulação.', 'Não declarar claramente a tese.']
	},
	{
		id: 'obras-utilidade-simbolo',
		question: 'Uma obra pública deve ser avaliada mais por sua utilidade social do que por seu valor simbólico para quem a realiza?',
		link: 'O cemitério prometido por Odorico torna-se obsessão: construído, precisa ser “inaugurado” por um defunto. A obra serve mais à imagem do prefeito do que às necessidades da cidade.',
		recortes: [
			{ title: 'Obras eleitoreiras', text: 'Discutir obras planejadas para render votos ou prestígio, e não para resolver problemas prioritários.' },
			{ title: 'Prioridades do orçamento', text: 'Discutir como escolher entre obras visíveis e serviços essenciais menos “inauguráveis” (saneamento, saúde, educação).' }
		],
		motivadores: [
			{ title: 'Texto I — elaborado para esta proposta', text: 'A placa de inauguração costuma ser maior do que a explicação de para que serve a obra.' },
			{ title: 'Texto II — elaborado para esta proposta', text: 'Canos sob a terra não rendem fotografia. Ainda assim, é deles que depende a saúde de uma cidade inteira.' }
		],
		repertorio: [
			{ ref: 'Constituição Federal de 1988, art. 37', use: 'Princípios da administração pública: legalidade, impessoalidade, moralidade, publicidade e eficiência.' },
			{ ref: 'Lei de Responsabilidade Fiscal (Lei Complementar nº 101/2000)', use: 'Normas de responsabilidade na gestão fiscal: planejamento e transparência nos gastos.' },
			{ ref: 'Victor Nunes Leal, “Coronelismo, enxada e voto” (1949)', use: 'Relações de troca entre poder local e eleitorado no Brasil, que ajudam a entender obras como moeda política.' }
		],
		caminhos: [
			{ posicao: 'Sim', tese: 'A utilidade social deve ser o critério central, pois o recurso público pertence à coletividade.', argumentos: ['Princípio da impessoalidade (art. 37).', 'O cemitério de Sucupira expõe o absurdo de uma obra pensada para a vaidade do governante.'] },
			{ posicao: 'Não', tese: 'O valor simbólico também importa, desde que esteja a serviço da comunidade, e não do governante.', argumentos: ['Monumentos e espaços culturais constroem memória coletiva.', 'O problema na peça não é o símbolo, mas sua apropriação pessoal.'] },
			{ posicao: 'Depende', tese: 'O simbólico só é legítimo depois de atendidas as necessidades básicas.', argumentos: ['Hierarquia de prioridades no orçamento.', 'Transparência permite à população julgar cada caso.'] }
		],
		armadilhas: ['Fugir para uma discussão genérica sobre corrupção sem tratar do critério de avaliação.', 'Esquecer de relacionar o argumento com a peça (proposta baseada no livro).']
	},
	{
		id: 'publico-privado',
		question: 'É possível separar os interesses pessoais de um governante dos interesses públicos?',
		link: 'Odorico confunde o município consigo mesmo: usa o cargo para satisfazer desejos pessoais, garantir prestígio e manipular aliados.',
		recortes: [
			{ title: 'Patrimonialismo', text: 'Discutir a tradição de tratar o Estado como extensão da vida privada de quem governa.' },
			{ title: 'Mecanismos de controle', text: 'Discutir o papel das instituições, da imprensa e do eleitor para impor limites ao governante.' }
		],
		motivadores: [
			{ title: 'Texto I — elaborado para esta proposta', text: 'Quando o governante diz “minha cidade”, pode estar falando de afeto — ou de posse.' },
			{ title: 'Texto II — elaborado para esta proposta', text: 'Toda pessoa que governa tem interesses próprios. A pergunta é quem vigia a fronteira entre eles e o bem comum.' }
		],
		repertorio: [
			{ ref: 'Sérgio Buarque de Holanda, “Raízes do Brasil” (1936)', use: 'O conceito de “homem cordial” e a dificuldade histórica de separar o público do privado.' },
			{ ref: 'Raymundo Faoro, “Os donos do poder” (1958)', use: 'Análise do patrimonialismo na formação do Estado brasileiro.' },
			{ ref: 'Lei de Acesso à Informação (Lei nº 12.527/2011)', use: 'Instrumento de transparência que permite ao cidadão fiscalizar a administração.' }
		],
		caminhos: [
			{ posicao: 'Sim', tese: 'A separação é possível quando há instituições fortes e transparência.', argumentos: ['Controles institucionais e acesso à informação.', 'A peça mostra o contrário justamente em um lugar sem contrapesos.'] },
			{ posicao: 'Não', tese: 'A separação completa é ilusória: o desafio é limitar, não eliminar, os interesses pessoais.', argumentos: ['Todo agente político tem ambições.', 'Odorico ilustra como a ambição pessoal contamina decisões coletivas.'] },
			{ posicao: 'Depende', tese: 'Depende da participação dos cidadãos e da vigilância da imprensa.', argumentos: ['Neco Pedreira e o jornal de oposição na peça.', 'Eleitor informado como contrapeso.'] }
		],
		armadilhas: ['Generalizar (“todo político é corrupto”) sem argumentação.', 'Ignorar a dimensão histórica e institucional.']
	},
	{
		id: 'humor-critica',
		question: 'O humor é uma forma eficaz de crítica política?',
		link: 'Dias Gomes escolheu a farsa para retratar o coronelismo e a demagogia: o riso diante de Odorico torna a crítica mais acessível — mas também pode suavizá-la.',
		recortes: [
			{ title: 'Sátira e consciência crítica', text: 'Discutir se o riso aproxima o público da reflexão ou se o distrai dela.' },
			{ title: 'Humor e poder', text: 'Discutir por que regimes autoritários frequentemente censuram a sátira.' }
		],
		motivadores: [
			{ title: 'Texto I — elaborado para esta proposta', text: 'Rimos de Odorico porque ele é exagerado. Talvez rir seja a forma de perceber que o exagero não está tão longe de nós.' },
			{ title: 'Texto II — elaborado para esta proposta', text: 'A piada abre a porta; a reflexão precisa entrar por ela.' }
		],
		repertorio: [
			{ ref: 'Gil Vicente, “Auto da barca do inferno”', use: 'Tradição da sátira teatral de costumes e de figuras de poder.' },
			{ ref: 'Henri Bergson, “O riso” (1900)', use: 'O riso como “castigo” social de comportamentos rígidos e automáticos.' },
			{ ref: 'Charges e humor gráfico na imprensa', use: 'A tradição da caricatura política como comentário crítico.' }
		],
		caminhos: [
			{ posicao: 'Sim', tese: 'O humor é eficaz porque desarma defesas e torna visíveis contradições do poder.', argumentos: ['A farsa de Dias Gomes alcançou grande público.', 'O riso expõe o ridículo da autoridade.'] },
			{ posicao: 'Não', tese: 'O humor pode banalizar abusos e transformar a indignação em entretenimento.', argumentos: ['O público pode rir de Odorico sem reconhecer práticas semelhantes à sua volta.', 'A crítica exige continuidade além da piada.'] },
			{ posicao: 'Depende', tese: 'O humor é eficaz quando acompanhado de contexto e leitura crítica.', argumentos: ['A mesma sátira pode conscientizar ou anestesiar, conforme a recepção.', 'Papel da escola e da imprensa.'] }
		],
		armadilhas: ['Discutir humor em geral sem focar na crítica política.', 'Afirmar dados históricos sem segurança.']
	},
	{
		id: 'imprensa-oposicao',
		question: 'A imprensa de oposição é indispensável à democracia, mesmo quando defende interesses próprios?',
		link: 'Neco Pedreira, dono do jornal “A Trombeta”, faz oposição a Odorico. Sua atuação revela tanto a importância da imprensa crítica quanto os interesses que também a movem.',
		recortes: [
			{ title: 'Liberdade de imprensa', text: 'Discutir o papel da imprensa livre como contrapeso ao poder.' },
			{ title: 'Interesses da imprensa', text: 'Discutir como avaliar uma imprensa que fiscaliza o poder, mas também tem interesses políticos e econômicos.' }
		],
		motivadores: [
			{ title: 'Texto I — elaborado para esta proposta', text: 'Um jornal que só elogia é um panfleto; um jornal que só ataca também pode ser.' },
			{ title: 'Texto II — elaborado para esta proposta', text: 'A pluralidade de vozes não garante a verdade, mas torna a mentira mais difícil.' }
		],
		repertorio: [
			{ ref: 'Constituição Federal de 1988, art. 5º, IX, e art. 220', use: 'Liberdade de expressão e de comunicação, vedada a censura.' },
			{ ref: 'Hannah Arendt, “Verdade e política” (1967)', use: 'A relação conflituosa entre verdade factual e poder político.' },
			{ ref: 'Alexis de Tocqueville, “A democracia na América”', use: 'A imprensa como instrumento de liberdade e de controle do poder.' }
		],
		caminhos: [
			{ posicao: 'Sim', tese: 'A imprensa de oposição é indispensável, pois a pluralidade de vozes limita abusos, mesmo que cada veículo tenha interesses.', argumentos: ['Contrapeso ao poder local na peça.', 'Garantia constitucional da liberdade de imprensa.'] },
			{ posicao: 'Não', tese: 'Uma imprensa movida apenas por interesses próprios pode desinformar e enfraquecer a democracia.', argumentos: ['Oposição sistemática não é sinônimo de jornalismo.', 'Desinformação corrói a confiança pública.'] },
			{ posicao: 'Depende', tese: 'É indispensável desde que submetida ao compromisso com os fatos e à crítica do público.', argumentos: ['Diversidade de veículos e checagem.', 'Leitor crítico como parte do sistema democrático.'] }
		],
		armadilhas: ['Confundir opinião com informação.', 'Esquecer a peça como ponto de partida.']
	}
];

export function getTema(id: string): RedacaoTema | undefined {
	return TEMAS_2027.find((t) => t.id === id);
}
