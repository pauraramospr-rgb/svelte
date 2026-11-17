"""Converte o Anexo 5 (Conteúdos Programáticos) do Edital do Exame Discursivo em JSON estruturado.

Uso: python3 -I parse_syllabus.py <anexo5.txt (pdftotext sem -layout)> <saida.json>
Fonte: https://www.vestibular.uerj.br/anexos/273/Manual_2fase_2027_Anexo_5.pdf
"""
import json
import re
import sys
import unicodedata

DISCIPLINES = {
    'REDAÇÃO': ('RED', 'Redação'),
    'BIOLOGIA': ('BIO', 'Biologia'),
    'FÍSICA': ('FIS', 'Física'),
    'GEOGRAFIA': ('GEO', 'Geografia'),
    'HISTÓRIA': ('HIS', 'História'),
    'LÍNGUA ESTRANGEIRA': ('LE', 'Língua Estrangeira'),
    'LÍNGUA PORTUGUESA E LITERATURAS': ('LPL', 'Língua Portuguesa e Literaturas'),
    'MATEMÁTICA': ('MAT', 'Matemática'),
    'QUÍMICA': ('QUI', 'Química'),
}
NOISE = re.compile(r'^(VESTIBULAR ESTADUAL \d{4}|EXAME DISCURSIVO|MANUAL DO CANDIDATO|ANEXO 5|\d{1,2}|ANEXO 5 CONTEÚDOS PROGRAMÁTICOS|CONTEÚDOS PROGRAMÁTICOS)$')


def slug(s):
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')[:60]


def main(src, dst):
    lines = [l.strip() for l in open(src, encoding='utf-8').read().splitlines()]
    lines = [l for l in lines if l and not NOISE.match(l)]
    out = []
    cur = None
    mode = None
    unit = None
    para = []
    seen_ids = set()

    def flush_para():
        nonlocal para
        if para and cur is not None:
            cur['orientacao'].append(' '.join(para))
        para = []

    i = 0
    while i < len(lines):
        l = lines[i]
        if l in DISCIPLINES:
            flush_para()
            code, name = DISCIPLINES[l]
            cur = {'code': code, 'name': name, 'orientacao': [], 'units': []}
            out.append(cur)
            mode = None
            unit = None
        elif l == 'ORIENTAÇÃO GERAL':
            mode = 'orient'
        elif l == 'PROGRAMA':
            flush_para()
            mode = 'prog'
        elif mode == 'orient':
            para.append(l)
            # paragraph ends at a line ending with '.' followed by a capitalized line
            if l.endswith('.') and (i + 1 < len(lines)) and lines[i + 1][:1].isupper():
                flush_para()
        elif mode == 'prog':
            if _is_unit(lines, i):
                unit = {'name': l.lstrip('• ').strip(), 'topics': []}
                cur['units'].append(unit)
            elif l.startswith('•'):
                text = l[1:].strip()
                while i + 1 < len(lines) and not lines[i + 1].startswith('•') and lines[i + 1] not in DISCIPLINES and not _is_unit(lines, i + 1):
                    i += 1
                    sep = '' if text.endswith('-') else ' '
                    text = (text[:-1] if text.endswith('-') and not text.endswith(' -') else text) + sep + lines[i]
                title, _, rest = text.partition(':')
                subs = [s.strip(' .') for s in re.split(r';', rest) if s.strip(' .')] if rest else []
                if unit is None:
                    unit = {'name': 'Programa', 'topics': []}
                    cur['units'].append(unit)
                tid = f"{cur['code'].lower()}-{slug(title)}"
                if tid in seen_ids:
                    tid = f"{tid}-{slug(unit['name'])[:20]}"
                seen_ids.add(tid)
                unit['topics'].append({
                    'id': tid,
                    'title': title.strip(),
                    'subtopics': subs,
                })
            else:
                print('AVISO: linha ignorada no programa:', l, file=sys.stderr)
        i += 1
    flush_para()
    # Unidades sem tópicos (linhas de quebra de título) são fundidas com a seguinte
    for d in out:
        merged = []
        for u in d['units']:
            if merged and not merged[-1]['topics']:
                merged[-1]['name'] += ' ' + u['name']
                merged[-1]['topics'] = u['topics']
            else:
                merged.append(u)
        d['units'] = merged
    json.dump(out, open(dst, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for d in out:
        print(d['code'], len(d['orientacao']), [(u['name'], len(u['topics'])) for u in d['units']])


# Títulos de unidade conforme o Anexo 5 (2027). Uma lista explícita evita confundir
# linhas de continuação com títulos (a extração de PDF não preserva a formatação).
UNITS = [
    'Seres vivos', 'Vírus, células e tecidos', 'Bases da genética',
    'Bioquímica e fisiologia de animais e vegetais', 'Saúde e bem-estar do homem',
    'Fenômenos mecânicos', 'Fenômenos térmicos', 'Fenômenos eletromagnéticos', 'Fenômenos ondulatórios',
    'Natureza, meio ambiente e representações do espaço', 'Trabalho, tecnologia e a produção social do espaço',
    'Redes, fluxos e os recortes espaciais regionais da industrialização', 'Política, estado e gestão do território',
    'Construção da modernidade ocidental (séculos XV-XVI)', 'Consolidação e crise do Antigo Regime (séculos XVII-XVIII)',
    'O longo século XIX (1815-1914)', 'O tempo da Guerra Total (1914-1945)',
    'Da Guerra Fria ao mundo do tempo presente (1945-2026)',
    'Dimensão linguístico-textual', 'Dimensão pragmático-discursiva', 'Dimensão literária',
    'Língua portuguesa: estrutura, funcionamento e significação', 'Literatura: contexto, temas e formas',
    'Aritmética', 'Álgebra', 'Geometria e trigonometria', 'Probabilidade e estatística', 'Geometria analítica',
    'Elemento químico', 'Ligações químicas', 'Funções da química inorgânica', 'Cálculos químicos', 'Soluções',
    'Termoquímica', 'Cinética química e equilíbrio químico', 'Eletroquímica', 'Química orgânica', 'Reações orgânicas',
]


def _is_unit(lines, j):
    return lines[j].lstrip('• ').strip() in UNITS


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
