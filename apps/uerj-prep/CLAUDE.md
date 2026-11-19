# Plataforma de preparação para o Exame Discursivo da UERJ — orientações do projeto

## Princípio de trabalho

> “Pra ter sucesso, tem que sentir raiva da mediocridade.” — lema pedido pelo dono do projeto.

Sempre buscar o melhor: entregar acabado, conferido e com fonte; quando algo estiver “bom”, procurar o que ainda falta.

## Regras editoriais (não negociáveis)

- Separar sempre: informação oficial · análise de provas anteriores · interpretação pedagógica · previsão · gerado por IA (`src/lib/data/official/sources.ts`).
- Nunca apresentar questão inédita como oficial; nunca inventar dados, datas, critérios de correção ou referências. Na dúvida, omitir ou mandar para “Confira na leitura”.
- Conferir fatos novos em fontes confiáveis (documentos oficiais, órgãos públicos, universidades, grandes jornais) e citá-las no front matter do resumo (com URL quando houver).
- Não é possível assistir a vídeos: indicar videoaulas por busca (`src/lib/data/content/aprofundar.ts`), sem afirmar o que dizem.

## Padrão dos resumos (`src/lib/data/content/resumos/*.md`)

- História: `Em uma frase` → `O fio da história` → `Explicação detalhada` com `### 1. Antes` … `### 7. Importância e o depois`, em **texto corrido** e com `> **Ligação com a próxima etapa:**` ao fim de cada etapa → `Linha do tempo` → `Conceitos fundamentais` → `Aprofundamento e conexões` → `Como o assunto pode aparecer…` (com resposta-modelo) → `Erros que custam pontos` → `Exercícios de fixação` → `Mapa mental`.
- Demais disciplinas: `Em uma frase`, explicação em ordem lógica (Biologia: o que é → para que serve → como funciona → por que acontece), exemplos, aprofundamento, prova, erros, exercícios, `Mapa mental`.
- `## Mapa mental`: `> recorte`, depois ramos `### Nome` com **uma frase explicativa** (sem marcador) e 3–5 tópicos em frases; `### Linha do tempo` com `- **ano**: fato`. Os testes (`src/lib/mindmap.test.ts`, `src/lib/data/data.test.ts`) verificam esse formato.

## Produção nível 3 e aulas animadas

Para apostilas aprofundadas, questões comentadas e roteiros de aulas animadas, seguir **`src/lib/data/producao/_diretrizes.md`** (briefing do dono do projeto) e o diagnóstico da banca em `src/lib/data/producao/_diagnostico.md`. Cada projeto fica em `src/lib/data/producao/<tópico>/` (`apostila.md` + `aula.md`) e aparece na plataforma em “Apostila completa” (tópico) e no “Estúdio de aulas”.

## Nome da plataforma

O nome fica só em `src/lib/brand.ts` (`APP_NAME`). Para renomear, troque ali, rode os testes e republique.

## Verificar e publicar

```bash
npm run check && npx vitest run
npm run build && PORT=4173 node build &   BASE_URL=http://localhost:4173 node tests/e2e/smoke.mjs
npm run build:web && npm run test:web      # versão do claude.ai
```

A versão web (`build-web/discursiva.html`) é publicada como Artifact no mesmo endereço. Trabalhar na branch `claude/uerj-prep-platform-09wwxs`.
