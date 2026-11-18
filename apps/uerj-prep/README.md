# Discursiva — preparação para o Exame Discursivo da UERJ

Plataforma web de estudos para o **Exame Discursivo do Vestibular Estadual da UERJ** (edição 2027, prova em 29/11/2026), com trilhas por curso, banco de questões oficiais e inéditas, simulados, resumos, laboratório de redação, biblioteca de obras, professor com IA e revisão espaçada.

> Projeto independente, **sem vínculo com a UERJ**. Informações oficiais são reproduzidas com fonte e data de acesso; em caso de divergência, vale o documento publicado em <https://www.vestibular.uerj.br>.

## Princípio editorial: o que é oficial e o que não é

Todo conteúdo exibido carrega uma etiqueta de categoria:

| Categoria | O que significa | Exemplos na plataforma |
|---|---|---|
| **Informação oficial** | Transcrito de documento da UERJ, com fonte, item e ano | Regras do edital 2027, quadro de cursos, programa (Anexo 5), critérios da Redação, obras indicadas, provas e comentários oficiais |
| **Análise de provas anteriores** | Calculado a partir de provas e classificações oficiais | Incidência de cada tópico 2017–2026; padrões dos temas de Redação |
| **Interpretação pedagógica** | Elaborado pela plataforma | Resumos editoriais, análises de obras, cronograma, metodologias de estimativa |
| **Previsão / possibilidade** | Hipótese de cobrança, nunca garantia | Propostas de Redação plausíveis para 2027 |
| **Gerado por IA** | Produzido pelo modelo sob demanda | Questões inéditas, resumos sob demanda, correções e respostas do tutor |

Questões inéditas **nunca** são apresentadas como oficiais. Onde a UERJ não publica um critério (ex.: valor de cada questão, fração do crédito parcial, peso de cada aspecto da Redação), a plataforma declara explicitamente a metodologia própria que usa.

## Funcionalidades (mapeadas aos requisitos)

1. **Preparação por carreira** — os 83 cursos do edital 2027 (item 4.2) com as duas específicas e seus pesos; trilha organizada pelas unidades do programa oficial, dos fundamentos ao avançado, com progresso por tópico (`/perfil`, `/trilha`).
2. **Banco de questões** (`/banco`)
   - **Oficiais**: 650 questões do Exame Discursivo (2017–2020 e 2024–2026) extraídas dos documentos “Questões Comentadas” da UERJ, com ano, disciplina, classificação oficial (item/subitem do programa), objetivo e comentário da banca (resolução oficial).
   - **Inéditas**: acervo inicial de 32 questões elaboradas com IA no padrão da banca (14 sobre *Luanda, Lisboa, Paraíso*) (resposta-modelo, resolução, habilidades do Anexo 4, conhecimentos do Anexo 5, dificuldade, erros comuns) e geração sob demanda por tópico e dificuldade.
3. **Simulados** (`/simulados`) — prova completa do curso (Redação + 2 específicas, até 5 h) ou por disciplina; cronômetro com encerramento automático, salvamento contínuo, correção comentada (IA ou autoavaliação pelo comentário oficial), nota estimada com os pesos do edital e o conceito do Exame de Qualificação; tempo por questão; dificuldades alimentam a revisão.
4. **Resumos estratégicos e mapas mentais** (`/resumos`, `/trilha/[tópico]`) — 13 resumos editoriais aprofundados (“nível UERJ”: conceitos, explicação detalhada, exemplos, fórmulas ou linha do tempo, contexto, aprofundamento, relações, como aparece na prova com exemplos oficiais e resposta-modelo comentada, erros que custam pontos e exercícios com respostas), incluindo quatro de História sobre os 250 anos da independência dos EUA, EUA/imigração/doutrina Bush, JK (70 anos) e ditaduras/Operação Condor/memória/Nuremberg/CEMDP; resumos por IA no mesmo formato para os demais tópicos. Os resumos de História contam o assunto em ordem fixa (antes, causas, como começou, etapas, desfecho, consequências, importância e depois), e cada resumo tem um **mapa mental** escrito: caixas numeradas com tópicos explicativos ao redor do tema e linha do tempo (resumos por IA seguem o mesmo formato).
5. **Como responder à UERJ** (`/guia`) — critérios oficiais de correção, estatística dos verbos de comando nas 650 questões oficiais, o que os comentários da banca revelam (com links às questões), passo a passo, o que cada verbo pede, dicas por disciplina e checklist.
6. **Temas em evidência** (`/em-evidencia`) — questões oficiais que partiram de efemérides (análise) e efemérides de 2025–2026 que podem servir de ponto de partida (previsão).
7. **Laboratório de redação** (`/redacao`) — critérios oficiais (Anexo 5 e padrão de respostas 2026), histórico de temas 2017–2026, cinco propostas plausíveis sobre *O bem-amado* com textos motivadores originais, recortes, repertório e caminhos “sim / não / depende”, exercício de planejamento, editor com contagem estimada de linhas e correção detalhada por aspecto com trechos, problemas (argumentação, coesão, coerência, estrutura, norma, tema) e reescritas.
8. **Biblioteca de obras** (`/obras`) — lista oficial 2027 e listas de 2019–2026 separadas; análises completas de *O bem-amado* (Redação) e *Luanda, Lisboa, Paraíso* (Língua Portuguesa e Literaturas): resumo, linha do tempo, contexto, personagens (incluindo Pepe e Iuri), espaços, elementos da narrativa ou do texto teatral, trechos comentados por capítulo, gramática a partir da obra (mapeada ao programa), temas, símbolos, linguagem, interpretações, relações, abordagens, questões inéditas e “Confira na leitura”.
9. **Professor IA** (`/tutor`) — chat em streaming com histórico, adaptado ao nível, ao curso e às dificuldades registradas; pode ser aberto a partir de uma questão, tópico, obra ou redação.
10. **Revisão inteligente** (`/revisao`) — repetição espaçada por tópico (SM-2), índice de erro, dificuldades persistentes, exercícios recomendados, evolução semanal e cronograma até a prova.
11. **Fundamentação** (`/fontes`) — documentos oficiais com links e data de acesso, regras do edital com item, links de todas as provas e padrões, e as metodologias.
12. **Interface** — responsiva (testada em 375 px), tema claro/escuro automático, navegação por teclado.

## Arquitetura

- **SvelteKit 2 + Svelte 5** (runes), renderização no servidor, `adapter-node`.
- **SQLite** com o módulo nativo `node:sqlite` (sem dependências nativas), migrações versionadas (`src/lib/server/db.ts`).
- **Autenticação** própria: senhas com `scrypt`, sessões em cookie `httpOnly`/`SameSite=Lax` e token armazenado só como hash SHA-256; verificação de origem (CSRF) do SvelteKit.
- **IA**: SDK oficial `@anthropic-ai/sdk`, modelo `claude-opus-5-5`:
  - correção de respostas e de redações e geração de questões com **saída estruturada** (JSON Schema);
  - tutor e resumos via **streaming**;
  - **fallback no servidor** em caso de recusa (`fallbacks: "default"`, beta `server-side-fallback-2026-07-01`), desativável com `ANTHROPIC_SERVER_FALLBACK=off`;
  - limite diário por usuário (`AI_DAILY_LIMIT`, padrão 120) e registro de tokens;
  - questões oficiais do mesmo tópico são enviadas como referência de estilo para as inéditas.
- **Dados**: `src/lib/data/official` (dados oficiais), `src/lib/data/analysis` (incidência), `src/lib/data/content` (conteúdo pedagógico). A lógica pura (pontuação, SRS, cronograma, redação) fica em `src/lib/domain`.

```
src/
  lib/
    data/official/   edital 2027, cursos, obras, temas de Redação, provas anteriores, programa, banco oficial
    data/analysis/   incidência histórica por tópico
    data/content/    resumos (.md), obras, propostas de Redação, questões inéditas
    domain/          pontuação, revisão espaçada, cronograma, Redação, textos
    server/          banco, autenticação, IA, progresso, simulados, tutor
    components/      componentes de interface
  routes/            páginas e endpoints (/api/*)
scripts/             extração e validação dos dados oficiais
tests/e2e/           teste ponta a ponta com navegador real
```

## Como executar

Requisitos: **Node.js 22.13+** (para `node:sqlite`).

```bash
cd apps/uerj-prep
npm install
cp .env.example .env        # defina ANTHROPIC_API_KEY para os recursos de IA
npm run dev                 # http://localhost:5173
```

Produção:

```bash
npm run build
ORIGIN=https://seu-dominio PORT=3000 DATABASE_PATH=./data/app.db \
  node --disable-warning=ExperimentalWarning build
```

Sem `ANTHROPIC_API_KEY`, tudo funciona exceto os recursos de IA: as questões podem ser autoavaliadas comparando com o comentário oficial ou a resposta-modelo.

| Variável | Uso |
|---|---|
| `ANTHROPIC_API_KEY` | Chave da API da Anthropic (obrigatória para IA) |
| `ANTHROPIC_MODEL` | Modelo (padrão `claude-opus-5-5`) |
| `ANTHROPIC_SERVER_FALLBACK` | `off` desativa o fallback no servidor |
| `AI_DAILY_LIMIT` | Solicitações de IA por usuário a cada 24 h (padrão 120) |
| `DATABASE_PATH` | Arquivo SQLite (padrão `./data/app.db`) |
| `ORIGIN` | URL pública (exigida pelo adapter-node atrás de proxy) |

## Versão publicada no claude.ai (sem servidor)

A mesma plataforma também roda inteiramente no navegador, publicada como página (Artifact) no claude.ai:

- as mesmas telas, carregamentos, ações e APIs de `src/routes` são executados no navegador por um pequeno emulador do SvelteKit (`web/kit.svelte.ts`);
- o banco SQLite roda com `sql.js` (build asm.js) e é salvo na área **privada** de cada estudante no armazenamento do artifact (`data/users/<id>/`), com gravação alternada em duas fatias para nunca deixar cópia pela metade; fora do claude.ai, usa o `localStorage`;
- não há login próprio: a identidade vem do claude.ai;
- a IA usa a capacidade `sample` (o Claude da conta de quem usa a página), sem chave de API.

```bash
npm run build:web     # gera build-web/discursiva.html (arquivo único)
npm run test:web      # testa em navegador real: modo local e com as capacidades do claude.ai simuladas
```

Os módulos que dependem de Node são trocados por adaptadores em `web/shims` (banco, autenticação, cliente de IA, `$app/*`, `@sveltejs/kit`).

## Testes e verificação

```bash
npm run check            # tipos (svelte-check)
npm test                 # 45 testes: pontuação, SRS, cronograma, Redação, sanitização de Markdown,
                         # integridade dos dados, mapa mental, verbos de comando, banco, autenticação, simulados e API
                         # (servidor local que imita a API da Anthropic em streaming)
npm run build && PORT=4173 node build &
BASE_URL=http://localhost:4173 npm run test:e2e   # 17 etapas em navegador real (Playwright)
npm run data:validate    # confere se todos os links oficiais citados respondem
```

Em ambientes com proxy, use `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=<bundle> npm run data:validate`.

## Proveniência dos dados oficiais

| Dado | Fonte |
|---|---|
| Estrutura, pontuação, regras e cursos/pesos | Edital do Exame Discursivo 2027 (itens 4–6) |
| Calendário | Anexo 1 (versão de 16/11/2026) |
| Programa por disciplina | Anexo 5 — Conteúdos Programáticos 2027 |
| Competências (verbos de comando) | Anexo 4 |
| Obras 2024–2027 | Anexo 3 (1ª fase) e Anexo 5 (2ª fase) de cada edição; 2019–2020: Anexo 6; 2021–2023: propostas de Redação |
| Temas de Redação 2017–2026 | Cadernos de prova oficiais |
| Questões oficiais e classificação por tópico | “Questões Comentadas” da Revista do Vestibular UERJ |

Todos foram obtidos em 17/11/2026. Para atualizar (nova edição), ajuste as URLs em `scripts/atualizar-dados.sh` e os arquivos de `src/lib/data/official/`, rode o script, `npm test` e `npm run data:validate`.

## Limitações conhecidas (declaradas também na interface)

- **Transcrição automática**: figuras, gráficos, tabelas e fórmulas das questões oficiais não são reproduzidos em texto; frações e expoentes podem perder a formatação. Cada questão indica a página do PDF oficial. Em Língua Estrangeira, os textos-base ficam no caderno oficial.
- **Cobertura**: cerca de 93% das questões das edições analisadas foram extraídas; 2014–2016 têm formato diferente e não entraram; 2021–2023 tiveram Exame Único (sem provas discursivas por disciplina).
- **Estimativas de nota**: a UERJ não divulga o valor de cada questão, a fração do crédito parcial nem os pesos dos aspectos da Redação; as notas da plataforma são estimativas com metodologia declarada.
- **Linhas da Redação**: a contagem é aproximada (~65 caracteres por linha manuscrita).
- **Conteúdo por IA** (correções, inéditas, resumos sob demanda, tutor) pode conter imprecisões e não substitui a leitura das obras nem a orientação de professores.
