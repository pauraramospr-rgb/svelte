# Narração gravada (ElevenLabs e voz neural gratuita)

As aulas animadas tocam a narração de três jeitos:

- **Voz gravada do ElevenLabs**: um MP3 por cena, com a voz do ElevenLabs escolhida pelo dono do projeto. Toca em qualquer
  aparelho, inclusive no iPhone e no iPad com o modo silencioso ligado e no app do Claude no Android (onde não
  existe voz sintetizada). O player segue o relógio do áudio, de modo que cada animação entra quando a voz
  chega à frase dela.
- **Voz neural gratuita** (Piper, voz masculina “cadu”, modelo CC0): as demais aulas, enquanto não há créditos do
  ElevenLabs para elas. Também é áudio gravado em arquivo, então toca em qualquer aparelho.
- **Voz sintetizada do aparelho** (Web Speech API): usada nas cenas que ainda não foram gravadas, ou quando o
  navegador recusa o áudio gravado.

## Arquivos

- `manifesto.json`: uma entrada por cena gravada, com `aula`, `cena`, `hash` (impressão digital do texto falado),
  `arquivo`, `inicio` (onde a cena começa dentro do arquivo), `dur`, `marcas` (início de cada frase, contado do
  começo da cena), `fim` (fim da fala) e `voz`.
- ElevenLabs: `<aula>/<cena>.mp3`, um arquivo por cena (mono, 22,05 kHz, 40 kbit/s), embutido na versão web.
- Voz gratuita: `<aula>/parte-<n>.mp3`, um arquivo por parte da aula (mono, 22,05 kHz, 24 kbit/s, taxa constante para
  a busca ser exata). Na versão web, esses arquivos ficam fora do HTML (são mais de 150 MB) e são publicados ao lado
  da página, em `assets/`; o `vite.web.config.ts` separa só eles.

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

## Como gerar a voz gratuita (Piper)

Requer `pip install piper-tts` (num ambiente virtual) e o modelo `pt_BR-cadu-medium` (`.onnx` e `.onnx.json`,
de https://huggingface.co/rhasspy/piper-voices, licença CC0). Cada frase é sintetizada separadamente, então as
marcas de sincronia são exatas; cenas já gravadas com o ElevenLabs (texto atual) são mantidas.

```bash
EXPORTAR_NARRACAO=todas EXPORTAR_DESTINO=/tmp/todas.json npx vitest run src/lib/cinema/narracao-exportar.test.ts
python -I scripts/narracao/piper.py --textos /tmp/todas.json --modelo /caminho/pt_BR-cadu-medium.onnx [--aulas id1,id2]
```

A cadu fala no ritmo natural (`--ritmo 1.0`, o padrão) e recebe +1 dB (`--ganho 1`) sob um limitador de picos em
-1 dBFS; ela é mais lenta e mais baixa que a faber, usada antes. Depois de mudar o texto de uma cena, rode de
novo para a aula dela (`--aulas`). Na publicação da versão web, os
MP3 de `build-web/assets/` vão no mapa `files` (no máximo 255 arquivos e 64 MB por publicação; o limite total da
página é 511 arquivos e 256 MB). Ao regravar, os nomes dos MP3 mudam (levam a impressão digital do
conteúdo): remova os antigos da página publicada (`null` no mapa `files`) para não passar desse limite.
