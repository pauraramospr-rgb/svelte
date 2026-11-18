"""Gera o acervo inicial de questões INÉDITAS (não oficiais), elaboradas com IA para a plataforma.
Cada questão traz resposta-modelo, resolução, habilidades (Anexo 4), conhecimentos (Anexo 5)
e a justificativa de aderência ao padrão UERJ. Saída: src/lib/data/content/questoes-ineditas.json
"""
import json, sys

M = 'Claude (acervo inicial da plataforma)'
Q = []

def q(id, discipline, topics, difficulty, statement, model_answer, explanation, skills, knowledge, rationale, mistakes, **extra):
    Q.append(dict(id=id, discipline=discipline, topicIds=topics, difficulty=difficulty, statement=statement,
                  modelAnswer=model_answer, explanation=explanation, skills=skills, knowledge=knowledge,
                  patternRationale=rationale, commonMistakes=mistakes, model=M, **extra))

# ---------------- MATEMÁTICA
q('ined-mat-01', 'MAT', ['mat-numeros-reais'], 'medio',
  'Uma loja aumentou em 25% o preço de um produto. Semanas depois, anunciou uma liquidação com 20% de desconto sobre o novo preço. Um cliente afirmou que, com a liquidação, o produto voltou a custar exatamente o preço original.\n\nVerifique se a afirmação do cliente está correta, justificando com cálculos. Em seguida, determine o desconto percentual que deveria ter sido aplicado sobre o preço aumentado para que o preço final ficasse 10% abaixo do preço original.',
  'A afirmação está correta: sendo P o preço original, o preço final é P × 1,25 × 0,80 = P × 1,00 = P. Para um preço final de 0,9P, o desconto d deve satisfazer 1,25 × (1 − d) = 0,9, logo 1 − d = 0,72 e d = 28%.',
  'Aumentos e descontos sucessivos se compõem multiplicando os fatores. Aumento de 25% → fator 1,25; desconto de 20% → fator 0,80. O produto 1,25 × 0,80 = 1 mostra que o preço volta ao original. Na segunda parte, iguala-se o preço final desejado (0,9P) ao preço aumentado com desconto d: 1,25P(1 − d) = 0,9P.',
  ['calcular', 'justificar'], ['números reais: porcentagens', 'razões e proporções'],
  'Segue o padrão das questões de Aritmética da UERJ (ex.: 2025, questão 1; 2026, questão 2): situação de consumo, cálculo percentual curto e dois comandos encadeados com exigência de desenvolvimento.',
  ['Somar e subtrair porcentagens (25% − 20% = 5%).', 'Aplicar o desconto sobre o preço original em vez do preço aumentado.'])

q('ined-mat-02', 'MAT', ['mat-probabilidades', 'mat-nocoes-de-conjuntos'], 'medio',
  'Em uma turma de 40 estudantes que se preparam para o vestibular, 24 estudam Biologia, 18 estudam Química e 10 estudam as duas disciplinas.\n\nEscolhendo-se ao acaso um estudante dessa turma, calcule a probabilidade de que ele não estude nenhuma dessas duas disciplinas. Em seguida, sabendo que o estudante escolhido estuda Química, calcule a probabilidade de que ele também estude Biologia.',
  'Estudam ao menos uma das disciplinas 24 + 18 − 10 = 32 estudantes; logo, 8 não estudam nenhuma: P = 8/40 = 1/5 = 20%. Dado que estuda Química (18 estudantes), 10 também estudam Biologia: P = 10/18 = 5/9 ≈ 55,6%.',
  'Pelo princípio da inclusão-exclusão, n(B ∪ Q) = n(B) + n(Q) − n(B ∩ Q). A probabilidade condicional restringe o espaço amostral aos que estudam Química: P(B | Q) = n(B ∩ Q)/n(Q).',
  ['calcular', 'interpretar'], ['noções de conjuntos: operações', 'probabilidades: probabilidade condicional'],
  'Combina conjuntos e probabilidade condicional em contexto escolar, como questões de Probabilidade e estatística do Exame Discursivo, com resposta numérica e justificativa.',
  ['Esquecer de subtrair a interseção (contar 42 estudantes).', 'Usar 40 como denominador na probabilidade condicional.'])

q('ined-mat-03', 'MAT', ['mat-figuras-no-plano'], 'dificil',
  'Um terreno municipal tem a forma de um triângulo retângulo cujos catetos medem 30 m e 40 m. A prefeitura pretende construir nele uma praça circular com a maior área possível, totalmente contida no terreno.\n\nCalcule o raio dessa praça. Em seguida, considerando π = 3, calcule a porcentagem da área do terreno que será ocupada pela praça.',
  'A hipotenusa mede 50 m (30² + 40² = 50²). O maior círculo contido no triângulo é o inscrito, de raio r = (30 + 40 − 50)/2 = 10 m. Área do terreno = 30 × 40 / 2 = 600 m²; área da praça = 3 × 10² = 300 m². A praça ocupa 300/600 = 50% do terreno.',
  'Em um triângulo retângulo de catetos b e c e hipotenusa a, o raio da circunferência inscrita é r = (b + c − a)/2. Também se obtém r pela relação área = semiperímetro × r: 600 = 60 × r ⇒ r = 10 m.',
  ['calcular', 'transferir conhecimentos a situações novas'], ['figuras no plano: relações métricas, circunferências e círculos, área'],
  'Questões de Geometria da UERJ costumam partir de um espaço real (ex.: 2026, questão 5, estacionamento triangular no campus Maracanã) e pedir duas medidas encadeadas.',
  ['Usar a hipotenusa como diâmetro (círculo circunscrito, que não cabe no terreno).', 'Esquecer de dividir por 2 a área do triângulo.'])

# ---------------- FÍSICA
q('ined-fis-01', 'FIS', ['fis-conservacao-de-energia'], 'medio',
  'Um carrinho de montanha-russa parte do repouso no ponto mais alto de uma rampa, a 20 m de altura em relação ao solo, e desce até o ponto mais baixo do trajeto, ao nível do solo. Em seguida, sobe um segundo morro. Despreze atritos e a resistência do ar e considere g = 10 m/s².\n\nCalcule a velocidade do carrinho no ponto mais baixo. Determine, também, a altura do topo do segundo morro, sabendo que o carrinho passa por esse topo com velocidade de 10 m/s.',
  'Pela conservação da energia mecânica: m·g·h = m·v²/2 ⇒ v = √(2·10·20) = 20 m/s. No topo do segundo morro: m·g·20 = m·g·h₂ + m·10²/2 ⇒ 200 = 10·h₂ + 50 ⇒ h₂ = 15 m.',
  'Sem forças dissipativas, a energia mecânica (cinética + potencial gravitacional) se conserva. A massa se cancela. A energia potencial perdida na descida vira cinética; no segundo morro, parte dela volta a ser potencial.',
  ['calcular', 'explicar'], ['conservação de energia: energia cinética, energia potencial gravitacional'],
  'Contexto cotidiano e sistema ideal declarado no enunciado, como prevê o programa de Física da UERJ (“os sistemas físicos serão assumidos ideais… salvo considerações em contrário”).',
  ['Usar v = g·t sem conhecer o tempo.', 'Esquecer a energia cinética no topo do segundo morro.'])

q('ined-fis-02', 'FIS', ['fis-calorimetria', 'fis-interacao-termica'], 'medio',
  'Em uma garrafa térmica ideal, misturam-se 200 g de água a 80 °C com 300 g de água a 20 °C.\n\nDetermine a temperatura de equilíbrio térmico da mistura. Em seguida, calcule a massa de gelo a 0 °C que deveria ser acrescentada a essa mistura, já em equilíbrio, para que todo o sistema terminasse com água líquida a 0 °C.\nDados: calor específico da água = 1 cal/g·°C; calor latente de fusão do gelo = 80 cal/g.',
  'Equilíbrio: 200·1·(θ − 80) + 300·1·(θ − 20) = 0 ⇒ 500θ = 22000 ⇒ θ = 44 °C. Para levar 500 g de água de 44 °C a 0 °C, ela cede 500·1·44 = 22000 cal, que fundem m = 22000/80 = 275 g de gelo.',
  'Em sistema isolado, a soma dos calores trocados é nula. Na segunda etapa, o calor sensível cedido pela água é integralmente usado como calor latente para fundir o gelo, sem variação da temperatura do gelo (que já está a 0 °C).',
  ['calcular'], ['calorimetria: calor sensível, calor latente', 'interação térmica: equilíbrio térmico'],
  'Retoma a estrutura de questões oficiais de calorimetria (ex.: 2024, questão 5, banheira como calorímetro ideal) com uma segunda etapa envolvendo mudança de estado.',
  ['Fazer média simples das temperaturas (50 °C).', 'Esquecer que o gelo só funde, sem aquecer.'])

# ---------------- QUÍMICA
q('ined-qui-01', 'QUI', ['qui-unidades-de-concentracao'], 'medio',
  'O soro fisiológico é uma solução aquosa de cloreto de sódio (NaCl) a 0,9% (m/v), isto é, 0,9 g de soluto em cada 100 mL de solução.\n\nCalcule a concentração dessa solução em g/L e em mol/L. Em seguida, calcule o volume de água que deve ser adicionado a 100 mL de uma solução de NaCl a 1,8% (m/v) para obter soro fisiológico.\nMassas molares: Na = 23 g/mol; Cl = 35,5 g/mol.',
  '0,9 g/100 mL = 9 g/L. Massa molar do NaCl = 58,5 g/mol, logo 9/58,5 ≈ 0,15 mol/L (0,154 mol/L). Na diluição, C₁V₁ = C₂V₂: 1,8 × 100 = 0,9 × V₂ ⇒ V₂ = 200 mL; deve-se adicionar 100 mL de água.',
  'Porcentagem m/v indica massa de soluto em 100 mL. A concentração em quantidade de matéria é a concentração em g/L dividida pela massa molar. Na diluição, a quantidade de soluto não muda.',
  ['calcular'], ['unidades de concentração: porcentagem, g/L, quantidade de matéria; diluição'],
  'Questões de Soluções na UERJ costumam partir de um produto de uso cotidiano e pedir conversões de unidades em sequência.',
  ['Responder que o volume final (200 mL) é o volume de água adicionado.', 'Dividir 0,9 por 58,5 sem converter para litro.'])

q('ined-qui-02', 'QUI', ['qui-isomeria', 'qui-funcoes-da-quimica-organica'], 'dificil',
  'O ácido lático, cuja fórmula estrutural condensada é CH₃–CH(OH)–COOH, é produzido na fermentação realizada por algumas bactérias e também nos músculos em condições de baixa disponibilidade de oxigênio.\n\nNomeie as duas funções orgânicas oxigenadas presentes nessa molécula e escreva sua fórmula molecular. Em seguida, indique o tipo de isomeria espacial apresentado pelo ácido lático, justificando sua resposta com base na estrutura da molécula.',
  'Funções: álcool (grupo –OH ligado a carbono saturado) e ácido carboxílico (–COOH). Fórmula molecular: C₃H₆O₃. Apresenta isomeria óptica, pois o carbono 2 é quiral (assimétrico): está ligado a quatro grupos diferentes (H, OH, CH₃ e COOH), o que origina dois enantiômeros.',
  'Um carbono quiral, com quatro ligantes diferentes, torna a molécula não sobreponível à sua imagem especular. A contagem de átomos: 3 C; 6 H (3 do CH₃, 1 do CH, 1 do OH, 1 do COOH); 3 O.',
  ['nomear', 'justificar'], ['funções da química orgânica', 'isomeria espacial (óptica)'],
  'Como em questões oficiais de Química Orgânica (ex.: 2026, questão 3), combina reconhecimento de funções, fórmula e tipo de isomeria em um contexto biológico.',
  ['Indicar isomeria geométrica (não há dupla ligação C=C).', 'Esquecer o hidrogênio do grupo –OH na fórmula molecular.'])

# ---------------- BIOLOGIA
q('ined-bio-01', 'BIO', ['bio-bases-da-ecologia'], 'medio',
  'Em um lago, a introdução de uma espécie exótica de peixe predador causou forte redução da população de pequenos peixes que se alimentavam principalmente de zooplâncton.\n\nExplique o que tende a ocorrer, em seguida, com as populações de zooplâncton e de fitoplâncton desse lago. Indique, também, uma consequência provável dessas alterações para a transparência da água.',
  'Com menos peixes zooplanctívoros, a predação sobre o zooplâncton diminui e sua população tende a aumentar. O zooplâncton, mais numeroso, consome mais fitoplâncton, cuja população tende a diminuir. Com menos fitoplâncton em suspensão, a água tende a ficar mais transparente.',
  'Trata-se de uma cascata trófica: a alteração no topo da cadeia alimentar se propaga pelos níveis inferiores, alternando aumentos e reduções populacionais.',
  ['explicar', 'fazer antecipações sobre a continuidade de acontecimentos'], ['bases da ecologia: cadeias e teias alimentares, relações ecológicas, desequilíbrio ecológico'],
  'Segue o padrão de Biologia da UERJ de “resolver problemas a partir de temas atuais” e interpretar relações entre populações (ex.: 2025, questão sobre estratégias ecológicas).',
  ['Afirmar que o fitoplâncton aumenta por haver menos peixes.', 'Responder apenas sobre o peixe introduzido, sem seguir a cadeia.'])

q('ined-bio-02', 'BIO', ['bio-hereditariedade'], 'medio',
  'O daltonismo do tipo vermelho-verde é uma condição determinada por um alelo recessivo ligado ao cromossomo X. Uma mulher de visão normal, cujo pai é daltônico, tem filhos com um homem de visão normal.\n\nCalcule a probabilidade de esse casal ter uma criança do sexo masculino e daltônica. Em seguida, explique por que nenhuma filha desse casal será daltônica.',
  'A mulher é portadora (XᴰXᵈ), pois recebeu o Xᵈ do pai daltônico; o homem é XᴰY. A probabilidade de um menino daltônico (XᵈY) é 1/2 (menino) × 1/2 (receber Xᵈ da mãe) = 1/4. As filhas recebem sempre o Xᴰ do pai, que tem visão normal; por isso, no máximo serão portadoras (XᴰXᵈ), nunca daltônicas.',
  'Na herança ligada ao X, o pai transmite seu único X a todas as filhas e o Y a todos os filhos. O alelo recessivo só se manifesta em mulheres homozigotas (XᵈXᵈ).',
  ['calcular', 'explicar'], ['hereditariedade: herança ligada ao sexo; probabilidade'],
  'Questões oficiais recentes trataram de herança ligada ao sexo (2024, gatas tricolores; 2026, sistema ZW em aves), sempre pedindo explicação do mecanismo além do cálculo.',
  ['Responder 1/2 (probabilidade entre os meninos, não entre todos os filhos).', 'Supor que a mulher é homozigota normal.'])

# ---------------- GEOGRAFIA
q('ined-geo-01', 'GEO', ['geo-relacao-sociedade-natureza', 'geo-espaco-urbano'], 'medio',
  'Texto elaborado para esta questão:\n“Em dias de verão, termômetros instalados em bairros densamente construídos de grandes cidades costumam registrar temperaturas mais altas do que os instalados em parques e em áreas arborizadas da mesma cidade.”\n\nO fenômeno descrito é conhecido como ilha de calor. Apresente duas causas desse fenômeno relacionadas à forma de ocupação do espaço urbano. Em seguida, indique uma medida de planejamento urbano capaz de atenuá-lo.',
  'Causas: (1) substituição da vegetação e do solo por superfícies impermeáveis e de materiais que absorvem e retêm calor, como asfalto e concreto; (2) concentração de edifícios, que dificulta a circulação do ar, e emissão de calor por veículos e atividades humanas. Medida: ampliar áreas verdes e a arborização (parques, telhados verdes) ou aumentar a permeabilidade do solo.',
  'A ilha de calor resulta das propriedades térmicas dos materiais urbanos, da redução da evapotranspiração (menos vegetação) e da produção de calor antrópico.',
  ['explicar', 'apresentar conclusões'], ['relação sociedade-natureza: impactos socioambientais', 'espaço urbano'],
  'Geografia da UERJ privilegia a relação entre processos sociais e formas espaciais, com textos curtos e pedidos de causas e medidas.',
  ['Confundir ilha de calor com efeito estufa global.', 'Citar causas sem relação com a ocupação urbana.'])

q('ined-geo-02', 'GEO', ['geo-dimensao-demografica-da-producao-do-espaco'], 'medio',
  'Nas últimas décadas, a pirâmide etária brasileira apresentou estreitamento da base e alargamento do topo.\n\nExplique dois fatores responsáveis por essa transformação. Em seguida, indique uma consequência desse processo para as políticas públicas.',
  'Fatores: (1) queda da taxa de fecundidade, associada à urbanização, à maior inserção feminina no mercado de trabalho e ao acesso a métodos contraceptivos — reduz a proporção de crianças (base); (2) aumento da expectativa de vida, por avanços na saúde e no saneamento — amplia a proporção de idosos (topo). Consequência: maior demanda sobre a previdência social e os serviços de saúde voltados a idosos.',
  'A transição demográfica brasileira levou ao envelhecimento da população: menos nascimentos e maior longevidade.',
  ['explicar', 'interpretar'], ['dimensão demográfica: estrutura populacional, teorias demográficas e políticas populacionais'],
  'Item frequente na classificação oficial (dimensão demográfica), com leitura de gráfico ou dado populacional e pedido de explicação.',
  ['Atribuir o estreitamento da base apenas à mortalidade infantil.', 'Citar consequência sem relação com o envelhecimento.'])

# ---------------- HISTÓRIA
q('ined-his-01', 'HIS', ['his-as-ditaduras-na-america-latina-e-os-movimentos-de-resistenci'], 'medio',
  'Texto elaborado para esta questão:\n“Entre as décadas de 1960 e 1980, Brasil, Chile, Argentina e Uruguai, entre outros países, viveram sob regimes ditatoriais com forte participação das Forças Armadas. Em nome da segurança nacional, governos perseguiram opositores e restringiram liberdades.”\n\nApresente duas características comuns a esses regimes. Em seguida, explique a relação entre essas ditaduras e o contexto internacional da Guerra Fria.',
  'Características: repressão política (censura, prisões, tortura e desaparecimentos de opositores); restrição ou supressão de direitos civis e de eleições diretas; adoção da Doutrina de Segurança Nacional. Relação com a Guerra Fria: os regimes se apresentavam como defesa contra o comunismo e contaram com o apoio ou a aprovação dos Estados Unidos, preocupados em evitar novas experiências como a Revolução Cubana; houve ainda cooperação repressiva entre as ditaduras do Cone Sul (Operação Condor).',
  'O anticomunismo e a lógica bipolar justificaram golpes e a repressão, inserindo a América Latina na zona de influência estadunidense.',
  ['identificar', 'explicar'], ['as ditaduras na América Latina: repressão política, transições democráticas', 'Guerra Fria'],
  'Tópico de alta incidência na classificação oficial; a UERJ costuma pedir características do período e sua articulação com o contexto internacional.',
  ['Descrever apenas o caso brasileiro.', 'Não estabelecer a relação com o anticomunismo e os EUA.'])

q('ined-his-02', 'HIS', ['his-a-revolucao-industrial'], 'facil',
  'A Revolução Industrial, iniciada na Inglaterra no século XVIII, transformou profundamente a produção e a vida social.\n\nExplique duas transformações nas relações de trabalho provocadas pela industrialização. Em seguida, aponte um impacto ambiental desse processo.',
  'Transformações: (1) generalização do trabalho assalariado e perda do controle do trabalhador sobre os meios de produção e o ritmo de trabalho; (2) disciplina fabril e divisão do trabalho, com longas jornadas e emprego de mulheres e crianças em condições precárias. Impacto ambiental: poluição do ar e da água, decorrente da queima de carvão e dos resíduos industriais, e crescimento urbano insalubre.',
  'A fábrica mecanizada concentrou trabalhadores e impôs novos ritmos; a energia do carvão e a urbanização acelerada trouxeram poluição e degradação ambiental.',
  ['explicar', 'apontar'], ['a Revolução Industrial: transformações nos mundos do trabalho; contradições entre progresso técnico e impactos ambientais'],
  'O programa oficial de 2027 cita explicitamente “contradições entre progresso técnico e impactos ambientais”, combinação típica de dois comandos em uma questão.',
  ['Citar invenções técnicas sem relacioná-las às relações de trabalho.', 'Confundir com a Segunda Revolução Industrial (eletricidade e petróleo).'])

# ---------------- LÍNGUA PORTUGUESA
q('ined-lpl-01', 'LPL', ['lpl-a-oracao-e-o-periodo', 'lpl-coesao-textual'], 'facil',
  'Texto elaborado para esta questão:\n“Embora a cidade tenha crescido muito nas últimas décadas, o centro histórico perdeu moradores.”\n\nIdentifique a relação de sentido estabelecida pela conjunção “embora” no período acima. Em seguida, reescreva o período com uma conjunção coordenativa, mantendo o sentido original e fazendo as alterações necessárias.',
  'A conjunção “embora” estabelece relação de concessão. Reescrita possível: “A cidade cresceu muito nas últimas décadas, mas o centro histórico perdeu moradores.” (conjunção coordenativa adversativa; o verbo passa do subjuntivo “tenha crescido” para o indicativo “cresceu”).',
  'Concessivas e adversativas exprimem contraste; na concessiva, o fato é admitido mas não impede o outro. Ao trocar a subordinada concessiva pela coordenada adversativa, ajusta-se o modo verbal.',
  ['identificar', 'compor ou decompor'], ['a oração e o período: coordenação e subordinação', 'coesão textual'],
  'A UERJ cobra com frequência relações de sentido entre orações e reescritas com manutenção de sentido (itens “a oração e o período” e “coesão”).',
  ['Classificar como causa ou condição.', 'Manter “tenha crescido” após “mas”, gerando inadequação.'])

q('ined-lpl-02', 'LPL', ['lpl-formas-de-enunciacao'], 'medio',
  'Texto elaborado para esta questão:\nO médico olhou os exames e disse ao paciente: “Volte amanhã com o resultado da nova análise.”\n\nTransponha a fala do médico para o discurso indireto. Em seguida, explique duas alterações gramaticais necessárias nessa transposição.',
  'Discurso indireto: “O médico olhou os exames e disse ao paciente que voltasse no dia seguinte com o resultado da nova análise.” Alterações: (1) o imperativo “volte” passa ao pretérito imperfeito do subjuntivo “voltasse”, introduzido pela conjunção integrante “que”; (2) o advérbio “amanhã” passa a “no dia seguinte”, pois o ponto de referência temporal deixa de ser o momento da fala do médico.',
  'Na passagem ao discurso indireto, a fala é subordinada ao verbo de elocução; ajustam-se tempo e modo verbais, pronomes e advérbios de tempo e lugar.',
  ['compor ou decompor', 'explicar'], ['formas de enunciação: discurso direto e discurso indireto'],
  'O item “formas de enunciação” aparece na classificação oficial de Língua Portuguesa; questões pedem identificação e transformação de discursos.',
  ['Manter o imperativo (“disse que volte amanhã”).', 'Não ajustar o advérbio de tempo.'])

# ---------------- OBRA: Luanda, Lisboa, Paraíso (LPL 2027)
B1 = 'Luanda, Lisboa, Paraíso'
q('ined-llp-01', 'LPL', ['lpl-recursos-expressivos-da-criacao-estetica'], 'medio',
  'O título do romance Luanda, Lisboa, Paraíso, de Djaimilia Pereira de Almeida, enumera três lugares que marcam o percurso de Cartola de Sousa e de seu filho Aquiles.\n\nCom base na leitura do romance, explique a relação entre o terceiro nome do título e as condições de vida dos personagens nesse lugar. Em seguida, nomeie a figura de linguagem construída por esse contraste.',
  'Paraíso é o nome de um bairro de lata da periferia de Lisboa, onde pai e filho passam a viver depois de esgotados os recursos na cidade. O nome evoca felicidade e plenitude, mas o lugar é marcado por pobreza, doença e exclusão. O contraste entre o nome e a realidade constitui ironia.',
  'A ironia (por antífrase ou de situação) evidencia a distância entre a promessa associada à migração e a experiência real dos personagens.',
  ['explicar', 'nomear'], ['recursos expressivos: figuras de linguagem', 'elementos da narrativa: espaço'],
  'Reproduz a estrutura da questão oficial 2026/1 (explicar um recurso — metonímia — e uma ironia a partir do espaço do romance indicado).',
  ['Responder “metáfora”.', 'Descrever o bairro sem relacioná-lo ao nome.'], book=B1)

q('ined-llp-02', 'LPL', ['lpl-procedimentos-de-intertextualidade', 'lpl-recursos-expressivos-da-criacao-estetica'], 'medio',
  'No romance Luanda, Lisboa, Paraíso, o filho de Cartola de Sousa, Aquiles, nasceu com uma malformação no calcanhar, motivo da viagem a Lisboa em busca de tratamento.\n\nExplique a relação entre o nome do personagem e sua condição física. Em seguida, nomeie o procedimento de intertextualidade presente nessa escolha e indique um efeito de sentido que ele produz na narrativa.',
  'O nome remete ao herói grego Aquiles, cujo único ponto vulnerável era o calcanhar. O procedimento é a alusão. O efeito é transformar a deficiência física em símbolo de vulnerabilidade — do personagem e de sua família de imigrantes —, conferindo à trajetória um tom trágico e irônico (o herói invencível torna-se um jovem frágil e dependente de tratamento).',
  'A alusão é uma referência indireta a outro texto ou tradição; aqui, ela dialoga com a mitologia para ampliar o sentido do drama individual.',
  ['explicar', 'nomear'], ['procedimentos de intertextualidade: alusão', 'recursos expressivos'],
  'Itens de intertextualidade e recursos expressivos aplicados à obra indicada estão entre os mais classificados pela UERJ em Língua Portuguesa e Literaturas.',
  ['Chamar o procedimento de paródia sem justificar.', 'Explicar o mito sem relacioná-lo ao personagem.'], book=B1)

q('ined-llp-03', 'LPL', ['lpl-literatura-e-sociedade'], 'dificil',
  'Em Luanda, Lisboa, Paraíso, Cartola e Aquiles não são tratados como portugueses em Lisboa e, com o passar dos anos, deixam também de se sentir angolanos.\n\nRelacione essa situação ao contexto histórico das relações entre Portugal e Angola após 1975. Em seguida, explique o sentido de “limbo” que pode ser atribuído à experiência desses personagens.',
  'Após a independência de Angola (1975), em meio à guerra civil e à precariedade de serviços como a saúde, muitos angolanos migraram para a antiga metrópole, onde enfrentaram preconceito, trabalho precário e moradia nas periferias. O “limbo” é a condição de quem não pertence plenamente a nenhum dos dois lugares: excluídos em Portugal e afastados de Angola, os personagens vivem uma identidade suspensa, entre a terra de origem e a de chegada.',
  'A questão articula literatura e contexto sociohistórico, como pede o programa (“Literatura e sociedade: contextos sócio-históricos de produção e recepção dos textos”).',
  ['estabelecer relações', 'explicar'], ['literatura e sociedade', 'contexto pós-colonial'],
  'O programa de 2027 dá destaque a “Literatura e sociedade”; a UERJ costuma pedir a relação entre a obra e seu contexto.',
  ['Tratar o tema apenas como saudade, sem o contexto histórico.', 'Ignorar que a viagem ocorre depois da independência (o início do romance, com o batismo de Aquiles, remonta ao tempo colonial).'], book=B1)

# Aprofundamento (trechos citados para estudo, identificados por capítulo; questões NÃO oficiais)
T1 = 'Texto (cap. 1):\n“O pai, com o menino apoiado na anca, agarrou no calcanhar com a mão para que não se visse. Comeu-se e bebeu-se como se faria se o calcanhar do bebé fosse perfeito.”\n\n'
T1b = 'Texto (cap. 1):\n“O pai deu-lhe um nome helénico, tentando resolver o destino com a tradição. “Vale mais nascer grego em terra de troianos do que nascer gazela em terra de leões”, alvitrou ao erguer o menino no dia em que Aquiles foi baptizado.”\n\n'
T2 = 'Texto (cap. 2):\n“Ela não sabia quem era nem onde estava. A sua memória tinha ficado presa ao Império como uma renda esgarçada a um alfinete. Talvez sonhasse que Cartola a levava a passear num Ford pela marginal ou que era hora de se encontrar com as amigas saindo de casa aperaltada: a única negra fula de luvas de renda e saltos agulha admitida no Hotel da Ponte Branca.”\n\n'
T6 = 'Texto (cap. 6):\n“Ao ver-se ao espelho, sentia-se um boneco em que ninguém pegaria, uma marioneta que tivessem desmontado para ver como funcionava, sem paciência nem engenho para voltarem a pôr como estava.\nNo hospital, depois da hora das visitas, acontecia-lhe olhar pela janela para os automóveis estacionados. Enfermeiros de bata num ir-e-vir conversavam e fumavam cigarros, visão que o fazia sentir preso num corpo errado com vista para uma moldura do mundo aberta por uma pena que o humilhava.”\n\n'
T53 = 'Texto (cap. 53):\n“Iuri era o menino que eles não tinham sido. Os olhos grandes, a ingenuidade diluída na fome e no medo de ser abandonado eram para Pepe e Cartola o aceno da nova infância aberta pela amizade entre eles. Não tinham querido ser meninos de novo, através de Iuri, mas meninos pela segunda vez, sem saberem que o desejo de uma segunda infância era sinal de que a vida os reunira adoentados, esquecidos daquilo que os distinguia. (…)\nMorto Iuri, Cartola e Pepe estavam obrigados a lidar com o horizonte aberto de um livro por escrever.”\n\n'

q('ined-llp-04', 'LPL', ['lpl-a-oracao-e-o-periodo', 'lpl-recursos-expressivos-da-criacao-estetica'], 'dificil',
  T1 + 'Na segunda frase do trecho, o narrador não identifica quem comeu e bebeu na festa de batismo de Aquiles.\n\nClassifique o sujeito das formas verbais “Comeu-se” e “bebeu-se”, justificando com base na estrutura dessas orações. Em seguida, explique de que modo a comparação introduzida por “como se” contribui para a construção de um sentido irônico no episódio.',
  'O sujeito é indeterminado: os verbos “comer” e “beber” estão empregados sem objeto direto e acompanhados do pronome “se”, que funciona como índice de indeterminação do sujeito (não há termo que possa ser sujeito paciente). A comparação “como se faria se o calcanhar do bebé fosse perfeito”, com o imperfeito do subjuntivo, apresenta uma hipótese contrária à realidade: todos celebram como se não houvesse malformação. A ironia está no contraste entre a alegria da festa e o defeito que o pai acabara de esconder com a mão: a comunidade participa de um fingimento coletivo de normalidade.',
  'Índice de indeterminação: “se” + verbo sem objeto direto (intransitivo, transitivo indireto ou de ligação). Pronome apassivador: “se” + verbo transitivo direto com sujeito paciente. A conjunção “como se” introduz comparação hipotética; o subjuntivo (“fosse”) marca a irrealidade. O sentido irônico nasce da distância entre o que se diz/faz e o que se sabe.',
  ['classificar', 'justificar', 'explicar'], ['a oração e o período: sujeito; vozes verbais', 'recursos expressivos: ironia'],
  'Combina análise sintática e efeito de sentido, como a UERJ fez em 2026 (função gramatical e valor semântico de expressões do romance indicado).',
  ['Classificar o “se” como pronome apassivador (não há sujeito paciente).', 'Apontar “sujeito oculto” sem justificar.', 'Descrever a festa sem explicar onde está a ironia.'], book=B1)

q('ined-llp-05', 'LPL', ['lpl-elementos-da-narrativa-selecionada', 'lpl-recursos-expressivos-da-criacao-estetica'], 'dificil',
  T1b + 'O brinde de Cartola no batismo do filho pode ser lido como índice narrativo, isto é, como um elemento que antecipa sentidos desenvolvidos ao longo do romance.\n\nExplique o sentido do brinde no momento em que é pronunciado. Em seguida, relacione as duas imagens contrapostas no brinde à experiência de Aquiles em Lisboa.',
  'No batismo, o brinde expressa um desejo do pai: que o filho, apesar do calcanhar malformado, seja forte como um guerreiro grego, mesmo cercado de inimigos (“grego em terra de troianos”), e não uma presa indefesa (“gazela em terra de leões”). Em Lisboa, as duas imagens se cumprem de modo irônico: Aquiles será de fato um estrangeiro em terra alheia, como o grego entre troianos, mas viverá a vulnerabilidade da gazela — submetido a cirurgias malsucedidas, à pobreza e à exclusão. O desejo de força anuncia, pelo avesso, a fragilidade.',
  'Índice narrativo é um detalhe que prepara sentidos posteriores. O brinde contrapõe duas situações por meio de uma comparação de superioridade (“vale mais… do que…”). A leitura completa exige o sentido imediato (desejo do pai) e a relação com o enredo (ironia trágica).',
  ['explicar', 'estabelecer relações'], ['elementos da narrativa: índices narrativos', 'recursos expressivos: comparação, ironia', 'intertextualidade: alusão'],
  'Questões oficiais de Literatura pedem com frequência a relação entre um fragmento e o enredo do romance (ex.: 2026, questão 1, sobre a cidade de Calpe como elemento estruturante).',
  ['Explicar apenas o mito de Aquiles, sem tratar do brinde.', 'Ler as imagens isoladamente, sem relacioná-las a Lisboa.', 'Confundir troianos e gregos.'], book=B1)

q('ined-llp-06', 'LPL', ['lpl-coesao-textual', 'lpl-recursos-expressivos-da-criacao-estetica'], 'medio',
  T2 + 'A palavra “renda” aparece duas vezes no fragmento.\n\nIdentifique o procedimento de coesão textual que relaciona essas duas ocorrências. Em seguida, explique o que a retomada dessa palavra sugere sobre a relação entre a memória de Glória e o seu passado no tempo colonial.',
  'O procedimento é a repetição (coesão lexical por reiteração da mesma palavra). A primeira ocorrência está na comparação que descreve a memória (“como uma renda esgarçada a um alfinete”); a segunda, nas “luvas de renda” da Glória jovem. A retomada sugere que a memória da personagem é feita do mesmo tecido da elegância que ela exibia no tempo colonial — mas agora gasta, desfiada, presa a um único ponto: o Império. O passado de prestígio (ser admitida no hotel) sobrevive como lembrança frágil e alienante.',
  'A repetição é um mecanismo de coesão previsto no programa (“Coesão textual: … repetição”). O efeito de sentido decorre da passagem do uso literal (luvas de renda) ao figurado (memória como renda esgarçada).',
  ['identificar', 'explicar'], ['coesão textual: repetição', 'recursos expressivos: comparação'],
  'Segue a combinação frequente na UERJ entre um mecanismo linguístico nomeado e sua função na construção do sentido literário.',
  ['Responder “sinonímia”.', 'Explicar a comparação sem relacioná-la às luvas de renda.'], book=B1)

q('ined-llp-07', 'LPL', ['lpl-elementos-da-narrativa-selecionada', 'lpl-formas-de-enunciacao'], 'medio',
  T2 + 'No terceiro período do fragmento, o narrador descreve aquilo com que Glória talvez sonhasse.\n\nTranscreva a palavra que marca a incerteza do narrador quanto ao que se passa na mente da personagem. Em seguida, explique o que esse recurso revela sobre o foco narrativo do romance.',
  'A palavra é “Talvez”. Ela indica que o narrador, embora em terceira pessoa e próxima das personagens, não afirma conhecer com certeza a interioridade de Glória: apenas supõe. O foco narrativo, portanto, não é o de uma onisciência absoluta; é uma onisciência relativizada, que respeita a opacidade da personagem doente — cuja consciência está confusa (“não sabia quem era nem onde estava”).',
  '“Talvez” é advérbio de dúvida, marca de modalização do enunciado. O emprego do subjuntivo (“sonhasse”) reforça a hipótese. A questão liga um item de enunciação a um elemento da narrativa (foco narrativo).',
  ['transcrever', 'explicar'], ['formas de enunciação: marcas de opinião/modalização', 'elementos da narrativa: narrador e foco narrativo'],
  'Semelhante à questão oficial 2026/2, que pediu a transcrição de formas linguísticas e a explicação do efeito produzido no relato.',
  ['Transcrever “sonhasse” (a forma verbal acompanha, mas a marca de incerteza é o advérbio).', 'Afirmar que o narrador é personagem (1ª pessoa).'], book=B1)

q('ined-llp-08', 'LPL', ['lpl-recursos-expressivos-da-criacao-estetica', 'lpl-a-oracao-e-o-periodo'], 'dificil',
  T6 + 'No primeiro parágrafo, Aquiles se vê ao espelho depois das cirurgias.\n\nNomeie a figura de linguagem presente em “sentia-se um boneco” e explique o efeito de sentido que ela produz em relação ao corpo do personagem. Em seguida, classifique o sujeito de “tivessem desmontado” e explique por que essa escolha é expressiva no contexto.',
  'A figura é a metáfora: o corpo de Aquiles é identificado a um boneco (e, em seguida, a uma marioneta), sem conectivo comparativo. O efeito é a coisificação: o rapaz se percebe como objeto manipulado, desmontado e mal remontado pelas cirurgias e pelos olhares alheios. O sujeito de “tivessem desmontado” é indeterminado (verbo na 3ª pessoa do plural sem referente expresso). A escolha é expressiva porque as mãos que intervêm no corpo de Aquiles permanecem anônimas: ele sofre a ação de um sistema impessoal, sem rosto, o que reforça sua passividade e solidão.',
  'Metáfora × comparação: na comparação há conectivo (“como”); na metáfora, a identificação é direta. Sujeito indeterminado pode ocorrer com verbo na 3ª pessoa do plural sem referente no contexto.',
  ['nomear', 'explicar', 'classificar'], ['recursos expressivos: metáfora', 'a oração e o período: sujeito indeterminado'],
  'Questões oficiais costumam combinar o reconhecimento de um recurso com o seu efeito (“Explique… o efeito que o uso dessas formas produz”).',
  ['Responder “comparação”.', 'Classificar o sujeito como oculto (“eles”) sem perceber a indeterminação.', 'Não explicar o efeito.'], book=B1)

q('ined-llp-09', 'LPL', ['lpl-o-significado-lexical-e-suas-relacoes', 'lpl-recursos-expressivos-da-criacao-estetica'], 'medio',
  T6 + 'No segundo parágrafo, o narrador afirma que a visão dos enfermeiros fazia Aquiles sentir-se “preso num corpo errado com vista para uma moldura do mundo aberta por uma pena que o humilhava”.\n\nExplique o sentido da expressão “moldura do mundo” no contexto. Em seguida, identifique o sentido da palavra “pena” nesse trecho e o fenômeno semântico que permite a essa palavra assumir diferentes significados.',
  '“Moldura do mundo” é a janela do hospital: o mundo aparece para Aquiles enquadrado, visto de fora, como um quadro do qual ele não participa — os outros vão e vêm, ele permanece imóvel. “Pena”, no trecho, significa compaixão, piedade (a piedade dos outros o humilha). O fenômeno é a polissemia: uma mesma palavra com vários sentidos relacionados (pena como compaixão, castigo, pluma), definidos pelo contexto.',
  'Polissemia (uma palavra, vários sentidos) é item explícito do programa (“O significado lexical e suas relações”). A imagem da moldura é uma metáfora da exclusão: a vida acontece fora do quadro do personagem.',
  ['explicar', 'identificar'], ['o significado lexical: polissemia, conotação', 'recursos expressivos: metáfora'],
  'A UERJ pede sentido contextual de palavras e o nome do fenômeno semântico envolvido.',
  ['Confundir polissemia com homonímia.', 'Dizer que “pena” significa “castigo”.', 'Explicar “moldura” literalmente, sem relacioná-la à imobilidade de Aquiles.'], book=B1)

q('ined-llp-10', 'LPL', ['lpl-coesao-textual', 'lpl-o-significado-lexical-e-suas-relacoes'], 'dificil',
  T53 + 'No terceiro período, o narrador distingue “ser meninos de novo” de ser “meninos pela segunda vez”.\n\nExplique a diferença de sentido entre essas duas expressões no contexto. Em seguida, identifique a relação estabelecida pela conjunção “mas” nesse período.',
  '“Ser meninos de novo” seria repetir a própria infância, voltar a ela; ser “meninos pela segunda vez” é viver uma infância nova, diferente da que tiveram — a infância que a vida lhes negou e que Iuri parecia oferecer (“o menino que eles não tinham sido”). A conjunção “mas” não opõe ideias incompatíveis: ela retifica, isto é, corrige e precisa a afirmação anterior (não isto, mas aquilo).',
  'Retificação é mecanismo de coesão previsto no programa. Em estruturas “não… mas…”, o “mas” substitui a informação negada por outra mais precisa.',
  ['explicar', 'identificar'], ['coesão textual: retificação', 'significado lexical'],
  'Exige leitura fina de um contraste semântico e o nome do mecanismo coesivo, como em questões oficiais que pedem a relação lógica estabelecida por conectivos.',
  ['Tratar as expressões como sinônimas.', 'Classificar o “mas” apenas como “adversativo” sem explicar a retificação.'], book=B1)

q('ined-llp-11', 'LPL', ['lpl-elementos-da-narrativa-selecionada', 'lpl-a-oracao-e-o-periodo'], 'dificil',
  T53 + 'O último período do fragmento encerra o episódio da morte de Iuri com uma imagem ligada à escrita.\n\nIdentifique o procedimento narrativo presente na imagem do “livro por escrever” e explique seu sentido no contexto do romance. Em seguida, reescreva “Morto Iuri” sob a forma de uma oração desenvolvida, mantendo o valor circunstancial da oração reduzida.',
  'O procedimento é a metaficção (a ficção que alude ao próprio processo de criação): a vida de Cartola e Pepe é comparada a um livro ainda não escrito. Sem Iuri, a amizade fica inconclusa e o futuro, aberto e incerto; o romance recusa um desfecho consolador — o que dialoga com a abertura do livro, em que o narrador discute por onde uma história pode começar. Reescrita possível: “Depois que Iuri morreu” (valor temporal) ou “Como Iuri morreu” (valor causal).',
  '“Morto Iuri” é oração subordinada adverbial reduzida de particípio. A metaficção é item do programa de 2027 (“Elementos da narrativa selecionada: … metaficção”).',
  ['identificar', 'explicar', 'reescrever'], ['elementos da narrativa: metaficção', 'a oração e o período: orações reduzidas'],
  'A UERJ cobrou metalinguagem/metaficção em 2026 (questão 4) e reescrita com manutenção de sentido em várias edições.',
  ['Chamar o recurso de “metáfora” apenas, sem perceber a reflexão sobre a escrita.', 'Reescrever alterando o sentido (ex.: “Embora Iuri tenha morrido”).'], book=B1)

q('ined-llp-12', 'LPL', ['lpl-literatura-e-sociedade', 'lpl-elementos-da-narrativa-selecionada'], 'medio',
  'Em Luanda, Lisboa, Paraíso, Cartola de Sousa era parteiro em Luanda. Em Portugal, depois de anos de tratamentos do filho e de dinheiro escasso, passa a trabalhar na construção civil e vai morar num bairro de lata da periferia de Lisboa.\n\nExplique o que essa mudança de ocupação revela sobre a experiência do imigrante africano na antiga metrópole. Em seguida, relacione essa experiência ao contexto histórico de Portugal após a descolonização.',
  'A mudança de parteiro (profissão de saber e prestígio em Luanda) para operário da construção civil revela perda de reconhecimento profissional e rebaixamento social: em Portugal, o saber de Cartola não conta, e ele é absorvido pelos trabalhos mais precários. Após a descolonização (1974–1975), Portugal recebeu imigrantes vindos das ex-colônias, que muitas vezes ocuparam empregos mal remunerados — em especial na construção civil, em expansão nos anos 1980 — e moraram em bairros de barracas nas periferias. O romance mostra que a independência não desfez a hierarquia colonial: o ex-colonizado chega à ex-metrópole como estrangeiro pobre.',
  'A questão articula construção do personagem e contexto sócio-histórico (“Literatura e sociedade”), sem exigir dados que o romance não fornece.',
  ['explicar', 'estabelecer relações'], ['literatura e sociedade: contexto sócio-histórico', 'elementos da narrativa: construção dos personagens'],
  'Reproduz a articulação entre obra e contexto que o programa destaca e que a UERJ pede ao relacionar romances a processos históricos.',
  ['Descrever o enredo sem explicar o rebaixamento social.', 'Situar a imigração antes da independência.', 'Usar dados numéricos que não pode confirmar.'], book=B1)

q('ined-llp-13', 'LPL', ['lpl-unidade-e-diversidade-da-lingua-portuguesa'], 'facil',
  T6 + 'Djaimilia Pereira de Almeida, nascida em Luanda e criada em Portugal, escreve em português europeu.\n\nTranscreva do fragmento duas marcas — lexicais ou sintáticas — dessa variedade do português, indicando, para cada uma, a forma equivalente mais comum no português do Brasil. Em seguida, nomeie o tipo de variação linguística exemplificado.',
  'Exemplos possíveis: “bata” (no Brasil, “jaleco”); “ver-se ao espelho” (no Brasil, “ver-se no espelho”); “acontecia-lhe olhar” (ênclise, frequente em Portugal; no Brasil, a próclise é mais comum na fala: “lhe acontecia”); “em que ninguém pegaria” (regência lusitana de “pegar em”, no sentido de segurar; no Brasil, “que ninguém pegaria”). Trata-se de variação regional (diatópica) — no caso, entre variedades nacionais da mesma língua.',
  'O programa inclui “Unidade e diversidade da língua portuguesa: … variação regional”. A resposta deve apresentar a forma lusitana, a correspondente brasileira e o nome da variação.',
  ['transcrever', 'indicar', 'nomear'], ['unidade e diversidade da língua portuguesa: variação regional'],
  'Questão de base linguística a partir do romance indicado, no formato “transcreva + nomeie”.',
  ['Apontar como “erro” a forma lusitana.', 'Chamar a variação de social ou histórica.'], book=B1)

q('ined-llp-14', 'LPL', ['lpl-literatura-e-sociedade', 'lpl-elementos-da-narrativa-selecionada'], 'medio',
  'Em Luanda, Lisboa, Paraíso, Cartola, angolano, torna-se amigo de Pepe, taberneiro de origem galega, no bairro do Paraíso. A amizade entre os dois velhos é um dos eixos afetivos da segunda parte do romance.\n\nExplique por que a origem de Pepe amplia o tema da exclusão no romance. Em seguida, explique a importância dessa amizade para a construção do espaço do Paraíso na narrativa.',
  'Pepe também é um deslocado: galego em Portugal, vive à margem, como Cartola. A amizade une dois estrangeiros pobres e mostra que a exclusão no romance não é apenas racial, mas também social e ligada à condição de migrante — embora Cartola, negro e africano, carregue ainda o peso do racismo colonial. Quanto ao espaço, a amizade faz do Paraíso não só o lugar da marginalização (o nome irônico de um bairro de lata), mas também o lugar possível do afeto, da solidariedade e do cuidado — a taberna e a barraca de Pepe tornam-se refúgio.',
  'O personagem secundário amplia sentidos do tema central; o espaço é construído também pelas relações que nele se formam (os espaços não são apenas cenários).',
  ['explicar'], ['elementos da narrativa: personagens e espaço', 'literatura e sociedade'],
  'Questões de Literatura da UERJ exploram a função de personagens e espaços na construção do sentido do romance.',
  ['Tratar Pepe como português “de origem” sem perceber a condição de migrante.', 'Descrever o Paraíso só como lugar de miséria, ignorando os laços afetivos.'], book=B1)

# ---------------- OBRA: O bem-amado (Redação 2027) — leitura
B2 = 'O bem-amado'
q('ined-ba-01', 'LPL', ['lpl-recursos-expressivos-da-criacao-estetica'], 'medio',
  'Na peça O bem-amado, de Dias Gomes, o prefeito Odorico Paraguaçu é eleito com a promessa de construir um cemitério em Sucupira e passa a precisar de um morto para inaugurá-lo.\n\nExplique a ironia presente no desfecho da peça. Em seguida, relacione essa ironia à crítica política que a obra realiza.',
  'No desfecho, o próprio Odorico é morto (por Zeca Diabo) e se torna o primeiro defunto do cemitério: a promessa se cumpre pelo avesso, o que caracteriza ironia de situação. A ironia expõe a crítica a uma política que instrumentaliza a vida e a morte e transforma obras públicas em promoção pessoal: o governante que manipulou a cidade acaba “inaugurando” a obra com o próprio corpo e ainda é transformado em mártir.',
  'A farsa usa o exagero e a reviravolta final para revelar o absurdo de práticas políticas reais, como o coronelismo e a demagogia.',
  ['explicar', 'estabelecer relações'], ['recursos expressivos: ironia', 'literatura e sociedade'],
  'Questão de leitura da obra-base da Redação 2027, útil para formar repertório; não reproduz questão oficial.',
  ['Resumir o enredo sem explicar a ironia.', 'Atribuir à peça episódios exclusivos da novela.'], book=B2)

q('ined-ba-02', 'LPL', ['lpl-criacao-e-adocao-de-palavras', 'lpl-recursos-expressivos-da-criacao-estetica'], 'medio',
  'O modo de falar de Odorico Paraguaçu, em O bem-amado, é marcado por palavras inventadas e por termos rebuscados usados de forma inadequada.\n\nNomeie o processo de criação de palavras característico da fala de Odorico. Em seguida, explique como essa linguagem contribui para a caracterização do personagem e para a crítica política da peça.',
  'O processo é o neologismo (sobretudo neologismos formados por derivação e composição). A fala pomposa e cheia de palavras inventadas caracteriza Odorico como vaidoso, demagogo e vazio: a forma grandiloquente impressiona o eleitorado e encobre a falta de conteúdo. Assim, a linguagem é instrumento da crítica à manipulação do discurso político.',
  'No texto teatral, sem narrador, o personagem se constrói pelo que diz e pelo modo como diz; o humor do “odoriquês” é também denúncia.',
  ['nomear', 'explicar'], ['criação e adoção de palavras: neologismo', 'recursos expressivos'],
  'Relaciona um item do programa de Língua Portuguesa (neologismo) à obra-base da Redação, articulação útil também para argumentar na Redação.',
  ['Confundir neologismo com estrangeirismo.', 'Tratar o “odoriquês” apenas como piada, sem função crítica.'], book=B2)

# ---------------- LÍNGUA ESTRANGEIRA (Inglês)
q('ined-le-ing-01', 'LE', ['le-fatores-de-coesao'], 'medio',
  'Texto elaborado para esta questão:\n“Many cities are turning old industrial areas into parks and cultural centers. These projects often attract tourists and new businesses. However, they can also raise rents, forcing long-time residents to move elsewhere. Planners, therefore, face a difficult choice.”\n\nIndique a que se refere a expressão “These projects”. Em seguida, explique a relação de sentido estabelecida por “However” e por “therefore” no texto. (Responda em português.)',
  '“These projects” retoma a transformação de antigas áreas industriais em parques e centros culturais (referência anafórica). “However” estabelece oposição/contraste: apesar dos benefícios (turistas e negócios), os projetos podem elevar aluguéis e expulsar moradores antigos. “Therefore” indica conclusão/consequência: por causa desses efeitos contraditórios, os planejadores enfrentam uma escolha difícil.',
  'Os elementos de coesão retomam referentes (anáfora) e marcam relações lógicas (contraste, conclusão) que organizam a argumentação do texto.',
  ['identificar', 'explicar'], ['fatores de coesão: referenciação, conectores lógicos'],
  'A classificação oficial mostra “fatores de coesão” entre os itens mais cobrados em Língua Estrangeira; as respostas são sempre em português.',
  ['Traduzir as palavras sem explicar a relação lógica.', 'Indicar como referente apenas “parks”.'], language='Inglês')

json.dump(Q, open(sys.argv[1], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(Q), 'questões inéditas')
