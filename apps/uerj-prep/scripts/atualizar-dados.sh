#!/usr/bin/env bash
# Regenera os dados oficiais a partir dos documentos publicados pela UERJ.
# Requer: curl, python3, pdftotext/pdfinfo (poppler-utils) e acesso a vestibular.uerj.br.
# Uso: scripts/atualizar-dados.sh            (a partir da pasta apps/uerj-prep)
# Para uma nova edição: atualize as URLs abaixo, a lista ALIASES em incidence.py se necessário,
# e os arquivos TypeScript em src/lib/data/official/ (edital, cursos, obras, calendário).
set -euo pipefail
cd "$(dirname "$0")/.."
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
REV=https://www.revista.vestibular.uerj.br/arquivos/pdf/questao

echo "→ Programa oficial (Anexo 5 do Exame Discursivo 2027)"
curl -sfL -o "$TMP/anexo5.pdf" https://www.vestibular.uerj.br/anexos/273/Manual_2fase_2027_Anexo_5.pdf
pdftotext "$TMP/anexo5.pdf" "$TMP/anexo5.txt"
python3 -I scripts/parse_syllabus.py "$TMP/anexo5.txt" src/lib/data/official/syllabus-2027.json

echo "→ Questões Comentadas (Exame Discursivo)"
SPECS=()
for pair in 2026:55 2025:50 2024:46 2020:37 2019:34 2018:31 2017:28; do
	year=${pair%%:*}; id=${pair##*:}
	curl -sfL -o "$TMP/qc$id.pdf" "$REV/$id.pdf"
	SPECS+=("$year:$TMP/qc$id.pdf:$REV/$id.pdf")
done
python3 -I scripts/questoes_comentadas.py "$TMP/questoes.json" "$TMP/itens.json" "${SPECS[@]}"

echo "→ Incidência histórica e banco de questões oficiais"
python3 -I scripts/incidence.py "$TMP/itens.json" src/lib/data/official/syllabus-2027.json src/lib/data/analysis/incidence.json \
	--annotate "$TMP/questoes.json" src/lib/data/official/questions-official.json

echo "→ Acervo de questões inéditas"
python3 -I scripts/build_ineditas.py src/lib/data/content/questoes-ineditas.json

echo "Concluído. Rode 'npm test' e 'npm run data:validate' para conferir."
