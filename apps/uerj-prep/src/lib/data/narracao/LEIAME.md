# Narração gravada (voz do ElevenLabs)

As aulas animadas tocam a narração de dois jeitos:

- **Voz gravada**: um MP3 por cena, com a voz do ElevenLabs escolhida pelo dono do projeto. Toca em qualquer
  aparelho, inclusive no iPhone e no iPad com o modo silencioso ligado e no app do Claude no Android (onde não
  existe voz sintetizada). O player segue o relógio do áudio, de modo que cada animação entra quando a voz
  chega à frase dela.
- **Voz sintetizada do aparelho** (Web Speech API): usada nas cenas que ainda não foram gravadas, ou quando o
  navegador recusa o áudio gravado.

## Arquivos

- `manifesto.json`: uma entrada por cena gravada, com `aula`, `cena`, `hash` (impressão digital do texto falado),
  `arquivo`, `dur`, `marcas` (início de cada frase no áudio, em segundos), `fim` (fim da fala) e `voz`.
- `<aula>/<cena>.mp3`: mono, 22,05 kHz, 40 kbit/s, volume normalizado.

Se o texto de uma cena mudar depois da gravação, o `hash` deixa de bater: a cena volta para a voz sintetizada e
`src/lib/cinema/gravacoes.test.ts` falha avisando que é preciso regravar.

## Como gravar uma aula

Voz: `oSHjab50V5OS5WLcJC5j`. Modelo: `eleven_multilingual_v2` (o mais estável em narração longa; no plano
gratuito todos os modelos custam 1 crédito por caractere). Uma geração por cena, `generations_count` 1, sem
repetir chamadas (cada chamada cobra de novo).

1. Exportar os textos (as mesmas frases e a mesma impressão digital que o player usa):

   ```bash
   EXPORTAR_NARRACAO=<aula> EXPORTAR_DESTINO=/tmp/textos.json npx vitest run src/lib/cinema/narracao-exportar.test.ts
   ```

2. Gerar cada cena no ElevenLabs com o campo `texto` do JSON e baixar o MP3 como `<cena>.mp3` numa pasta própria.
3. Processar (recodifica, acha o início de cada frase pelas pausas e atualiza o manifesto):

   ```bash
   python3 -I scripts/narracao/processar.py --aula <aula> --textos /tmp/textos.json --brutos <pasta>
   ```

   O relatório marca “CONFERIR” quando uma fronteira entre frases caiu numa pausa curta ou longe do esperado.
4. `npx vitest run src/lib/cinema/gravacoes.test.ts` e `npm run build:web` (na versão web, os MP3 ficam embutidos
   na página: cerca de 0,3 MB por minuto de fala).
