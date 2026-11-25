# Recortes dos cadernos de prova oficiais (Exame Discursivo da UERJ)

Imagens das questões oficiais **como foram impressas** nos cadernos da UERJ — figuras, legendas, textos de apoio,
tabelas e a numeração de linhas original —, exibidas no banco de questões e nos simulados no lugar da transcrição
automática (que continua disponível em “Enunciado em texto”).

## O que há aqui

- `AAAA-DISC-NN.webp`: o bloco impresso da questão NN (sem a área de resposta).
- `AAAA-DISC-texto-pP.webp`: a página P do caderno com o texto-base de que a questão depende.
- `mapa.json`: para cada questão, os recortes na ordem de leitura (texto-base antes, questão por último).

Cobertura: História e Língua Portuguesa e Literaturas, Vestibulares Estaduais 2024, 2025 e 2026 (56 questões —
todas as desses anos que estão no banco). As provas de 2017 a 2020 continuam com o enunciado transcrito e o link
para a fonte oficial: os cadernos desses anos não estavam acessíveis (o site da UERJ não respondeu durante a
produção).

## Fonte

Cadernos oficiais do Exame Discursivo da UERJ (DEPSEA), na cópia publicada pelo Estratégia Vestibulares, que
reproduz os PDFs distribuídos pela universidade:

- 2026: <https://vestibulares.estrategia.com/portal/noticias/vestibular-uerj-2026-confira-os-cadernos-de-prova-e-o-padrao-de-respostas-do-exame-discursivo/>
  (PDFs `2025/11/Historiauerjcaderno.pdf` e `2025/11/LPLuerjcaderno.pdf`)
- 2025: <https://vestibulares.estrategia.com/portal/noticias/uerj-2025-cadernos-de-prova-padroes-de-resposta-exame-discursivo/>
  (PDFs `2024/12/uerj-historia.pdf` e `2024/12/uerj-portugues.pdf`)
- 2024: <https://vestibulares.estrategia.com/portal/enem-e-vestibulares/vestibulares/vestibular-uerj-provas-anteriores-com-gabaritos-completos/>
  (PDFs `2023/12/uerj-historia.pdf` e `2023/12/uerj-portugues-e-literatura.pdf`)

Os PDFs foram baixados de `cdn.blog.estrategiavestibulares.com.br/vestibulares/wp-content/uploads/…`, o endereço
de arquivos dessas páginas.

## Como os recortes foram feitos

`scripts/caderno/recortar.py` (Python, `pdftotext -bbox-layout` e `pdftoppm` a 150 dpi; saída em WEBP q84):
localiza o rótulo “Questão NN”, detecta as caixas de resposta pelas linhas horizontais longas e recorta o que
fica entre o rótulo e a caixa; páginas sem rótulo de questão são tratadas como texto-base das questões seguintes.

Ajustes manuais conferidos página a página:

- Língua Portuguesa 2024: a questão 7 usa o texto da página 10; a questão 8, o da página 12.
- Língua Portuguesa 2026: as questões 5 a 10 não dependem de texto-base de outra página (a associação
  automática foi desfeita).
- Língua Portuguesa 2025: questões 1–4 → página 3; 5–6 → página 8; 7–9 → página 10; 10 → página 14.

As questões 3, 4, 9 e 10 de Língua Portuguesa 2024 não estão no banco (não constam das questões comentadas
usadas na base oficial) e, por isso, não têm recorte publicado.

O teste `src/lib/data/simulados-aulas.test.ts` confere que todas as questões de História e de Língua Portuguesa
de 2024 a 2026 têm recorte, que os arquivos existem e que a questão vem depois do texto-base.
