"""Extrai questões do Exame Discursivo a partir dos PDFs oficiais de "Questões Comentadas"
da Revista do Vestibular UERJ (https://www.revista.vestibular.uerj.br/questao/).

Para cada questão são extraídos: disciplina, número, enunciado (texto), classificação oficial
(item/subitem do programa), objetivo e comentário oficial. Elementos gráficos (figuras, gráficos,
tabelas) não são reproduzíveis em texto: são sinalizados e a página do PDF original é registrada.

Uso:
  python3 -I questoes_comentadas.py <saida_questoes.json> <saida_itens.json> ANO:arquivo.pdf:URL [...]
Requer pdftotext/pdfinfo (poppler-utils).
"""
import json
import re
import subprocess
import sys
import unicodedata

DISC = [('lingua portuguesa', 'LPL'), ('redacao', 'RED'), ('biologia', 'BIO'), ('fisica', 'FIS'),
        ('geografia', 'GEO'), ('historia', 'HIS'), ('matematica', 'MAT'), ('quimica', 'QUI'),
        ('espanhol', 'ESP'), ('frances', 'FRA'), ('ingles', 'ING'), ('lingua estrangeira', 'LE'),
        ('linguas estrangeiras', 'LE')]
FIG_HINTS = re.compile(r'(Adaptado de|figura|gráfico|esquema|tabela|imagem|ilustra|Observe|charge|mapa|fotografia|quadro)', re.I)


def norm(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if unicodedata.category(c) != 'Mn').strip()


def pages(pdf):
    n = int(re.search(r'Pages:\s+(\d+)', subprocess.run(['pdfinfo', pdf], capture_output=True, text=True).stdout).group(1))
    cur = None
    for p in range(1, n + 1):
        t = subprocess.run(['pdftotext', '-f', str(p), '-l', str(p), pdf, '-'], capture_output=True, text=True).stdout
        lines = [l.strip() for l in t.splitlines()]
        nonempty = [l for l in lines if l]
        hdr = None
        for l in nonempty[:4] + nonempty[-4:]:
            nl = norm(l)
            for k, code in DISC:
                if nl == k or (nl.startswith(k) and len(nl) < len(k) + 30):
                    hdr = code
                    break
            if hdr:
                break
        if hdr:
            cur = hdr
        yield p, cur, lines


def is_noise(l, year):
    return bool(re.match(rf'^(Vestibular Estadual {year}|Exame Discursivo|\d{{1,3}}|Rascunho|RASCUNHO)$', l)) or \
        norm(l) in {k for k, _ in DISC}


def clean_statement(lines):
    """Une linhas em parágrafos e substitui blocos de rótulos de figuras por um marcador."""
    out, buf, labels = [], [], []

    def flush_labels():
        nonlocal labels
        if len(labels) >= 2:
            out.append('[Elemento gráfico — consulte a prova original]')
        elif labels:
            buf.append(labels[0])
        labels = []

    for l in lines:
        if not l:
            flush_labels()
            if buf:
                out.append(' '.join(buf))
                buf = []
            continue
        short = len(l) < 32 and not re.search(r'[.:;?!)]$', l) and not l.startswith('Adaptado de')
        if short:
            labels.append(l)
            continue
        flush_labels()
        buf.append(l)
    flush_labels()
    if buf:
        out.append(' '.join(buf))
    text = '\n\n'.join(x for x in out if x)
    text = re.sub(r'(\[Elemento gráfico — consulte a prova original\]\s*){2,}', '[Elemento gráfico — consulte a prova original]\n\n', text)
    text = re.sub(r'-\s(?=[a-zà-ú])', '', text)  # hifenização de quebra de linha
    return text.strip()


def parse(year, pdf, url):
    seq = []
    for p, d, lines in pages(pdf):
        for l in lines:
            seq.append((p, d, l))
    qs = []
    i = 0
    while i < len(seq):
        p, d, l = seq[i]
        inline = re.match(r'^(?:QUESTÃO|Questão)\s+(\d{2})$', l)
        if inline or re.match(r'^(QUESTÃO|Questão)$', l):
            # número na mesma linha ou na próxima linha não vazia
            j = i if inline else i + 1
            while not inline and j < len(seq) and not seq[j][2]:
                j += 1
            m = inline or (re.match(r'^(\d{2})$', seq[j][2]) if j < len(seq) else None)
            if not m:
                i += 1
                continue
            num = int(m.group(1))
            start_page, disc = seq[j][0], seq[j][1]
            k = j + 1
            stmt = []
            while k < len(seq) and not re.match(r'^(COMENTÁRIO|Comentário)$', seq[k][2]) and not re.match(r'^(QUESTÃO|Questão)(\s+\d{2})?$', seq[k][2]):
                if not is_noise(seq[k][2], year):
                    stmt.append(seq[k][2])
                k += 1
            if k >= len(seq) or not re.match(r'^(COMENTÁRIO|Comentário)$', seq[k][2]):
                i = k
                continue
            k += 1
            com = []
            while k < len(seq) and not re.match(r'^(QUESTÃO|Questão)(\s+\d{2})?$', seq[k][2]) and not re.match(r'^CADERNO DE PROVA$', seq[k][2]):
                if not is_noise(seq[k][2], year):
                    com.append(seq[k][2])
                k += 1
            items, subs, obj, body = [], [], [], []
            mode = None
            for c in com:
                mi = re.match(r'^Item do programa\s*\d*\s*:+\s*(.*)$', c, re.I)
                ms = re.match(r'^Subite(?:m|ns) do programa\s*\d*\s*:+\s*(.*)$', c, re.I)
                mo = re.match(r'^Objetivos?\s*:\s*(.*)$', c)
                if mi:
                    items.append(mi.group(1).strip(' .;')); mode = 'item'
                elif ms:
                    subs.append(ms.group(1).strip(' .;')); mode = 'sub'
                elif mo:
                    obj.append(mo.group(1)); mode = 'obj' if not mo.group(1).rstrip().endswith('.') else 'body'
                elif mode == 'obj':
                    if c:
                        obj.append(c)
                        if c.rstrip().endswith('.'):
                            mode = 'body'
                    else:
                        mode = 'body'
                elif mode in ('item', 'sub') and c and c[:1].islower():
                    (items if mode == 'item' else subs)[-1] += ' ' + c.strip(' .;')
                else:
                    if mode in ('item', 'sub') and c:
                        mode = 'body'
                    body.append(c)
            objective = ' '.join(obj).strip()
            statement = clean_statement(stmt)
            commentary = clean_statement(body)
            qs.append({
                'id': f'{year}-{disc}-{num:02d}',
                'year': year,
                'exam': 'Exame Discursivo',
                'discipline': disc,
                'number': num,
                'statement': statement,
                'hasGraphic': ('[Elemento gráfico' in statement) or bool(FIG_HINTS.search(statement)),
                'programItems': items,
                'programSubitems': subs,
                'objective': objective,
                'officialCommentary': commentary,
                'commentaryHasFormulas': bool(re.search(r'(a seguir|tem-se|seguinte forma|abaixo|indicad[oa]s? a seguir)\s*:\s*($|\n)', commentary)) or commentary.endswith(':'),
                'sourceUrl': f'{url}#page={start_page}',
                'sourcePage': start_page,
            })
            i = k
            continue
        i += 1
    return qs


def main():
    out_q, out_items = sys.argv[1], sys.argv[2]
    allq = []
    for spec in sys.argv[3:]:
        year, pdf, url = spec.split(':', 2)
        qs = parse(int(year), pdf, url)
        print(year, len(qs), {d: sum(1 for q in qs if q['discipline'] == d) for d in sorted({q['discipline'] or '?' for q in qs})})
        allq += qs
    # ids únicos
    seen = {}
    for q in allq:
        if q['id'] in seen:
            seen[q['id']] += 1
            q['id'] += f"-{seen[q['id']]}"
        else:
            seen[q['id']] = 1
    json.dump(allq, open(out_q, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    json.dump([{'year': q['year'], 'disc': q['discipline'], 'items': q['programItems']} for q in allq],
              open(out_items, 'w', encoding='utf-8'), ensure_ascii=False)


if __name__ == '__main__':
    main()
