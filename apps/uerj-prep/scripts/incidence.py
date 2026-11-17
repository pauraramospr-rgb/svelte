"""Calcula a incidência histórica dos itens do programa nas provas do Exame Discursivo.

Entrada: items.json gerado por questoes_comentadas.py (classificação OFICIAL de cada questão,
publicada pela UERJ na seção "Questões Comentadas" da Revista do Vestibular).
Saída: src/lib/data/analysis/incidence.json

A classificação ("Item do programa") é da própria UERJ. O mapeamento para os tópicos do
programa de 2027 é feito por correspondência de nomes; itens que não correspondem a nenhum
tópico atual são mantidos em "unmatched" para transparência.
"""
import json
import re
import sys
import unicodedata
from collections import defaultdict


def norm(s):
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = re.sub(r'[^a-z0-9 ]+', ' ', s)
    return ' '.join(s.split())


STOP = {'de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'as', 'os', 'em', 'na', 'no', 'nas', 'nos', 'seus', 'suas', 'sua', 'seu', 'com', 'para', 'por'}


def tokens(s):
    return {t for t in norm(s).split() if t not in STOP and len(t) > 2}


# Correspondências explícitas para grafias divergentes e nomes de programas anteriores.
ALIASES = {
    'eletromagnestismo': 'fis-eletromagnetismo',
    'propriedades dos fuidos': 'fis-propriedades-dos-fluidos',
    'fenomenos eletromagneticos': 'fis-eletromagnetismo',
    'fatores de coeencia': 'le-fatores-de-coerencia',
    'tipos de modalidade': 'le-modalizacao',
    'usos do verbo': 'le-uso-do-verbo',
    'tipologia textual': 'le-tipologias-textuais',
    'procedimentos de coesao e coerencia': 'le-fatores-de-coesao',
    'formas de articulacao de ideias': 'le-fatores-de-coesao',
    'sucessoes': 'mat-progressoes',
    'sistemas de equacoes': 'mat-sistemas-de-equacao',
    'figura no plano': 'mat-figuras-no-plano',
    'solidos sem arestas': 'mat-figuras-tridimensionais',
    'solidos com arestas': 'mat-figuras-tridimensionais',
    'probabilidade e binomio de newton': 'mat-probabilidades',
    'fatores de coerencia': 'lpl-coerencia-textual',
    'fatores de coesao': 'lpl-coesao-textual',
    'coerencia e coesao textuais': 'lpl-coesao-textual',
    'tipologias textuais': 'lpl-generos',
    # Questões sobre a obra literária indicada no ano correspondem, no programa de 2027,
    # ao tópico "Elementos da narrativa selecionada".
    'o crime do padre amaro': 'lpl-elementos-da-narrativa-selecionada',
}


# Itens de programas anteriores sem equivalente no programa de 2027.
NO_MATCH = {'o texto poetico e seus elementos', 'generos literarios'}


def main(items_path, syllabus_path, out_path):
    items = json.load(open(items_path, encoding='utf-8'))
    syl = json.load(open(syllabus_path, encoding='utf-8'))
    topics = {}
    for d in syl:
        code = d['code']
        for u in d['units']:
            for t in u['topics']:
                topics.setdefault(code, []).append((t, u['name']))

    valid = {t['id'] for c in topics.values() for t, _ in c}
    for v in ALIASES.values():
        assert v in valid, f'alias inválido: {v}'

    def match(code, item):
        n = norm(item)
        if n in NO_MATCH:
            return None
        if n in ALIASES and ALIASES[n].startswith(code.lower() + '-'):
            return ALIASES[n]
        cands = topics.get(code, [])
        for t, _ in cands:
            if norm(t['title']) == n:
                return t['id']
        for t, _ in cands:
            if norm(t['title']).startswith(n) or n.startswith(norm(t['title'])):
                return t['id']
        for t, _ in cands:
            for s in t['subtopics']:
                if norm(s) == n:
                    return t['id']
        best, score = None, 0.0
        it = tokens(item)
        if not it:
            return None
        for t, _ in cands:
            tt = tokens(t['title'] + ' ' + ' '.join(t['subtopics']))
            sc = len(it & tt) / len(it)
            if sc > score:
                best, score = t['id'], sc
        return best if score >= 0.6 else None

    years = sorted({q['year'] for q in items})
    counts = defaultdict(lambda: defaultdict(int))  # topic -> year -> n
    totals = defaultdict(lambda: defaultdict(int))  # disc -> year -> n questions
    unmatched = defaultdict(lambda: defaultdict(int))
    for q in items:
        disc = q['disc']
        if disc in ('ESP', 'FRA', 'ING'):
            disc = 'LE'
        if disc in (None, 'RED') or not q['items']:
            continue
        totals[disc][q['year']] += 1
        seen = set()
        for it in q['items']:
            tid = match(disc, it)
            if tid:
                if tid not in seen:
                    counts[tid][q['year']] += 1
                    seen.add(tid)
            else:
                unmatched[disc][it] += 1
    out = {
        'source': 'UERJ – Revista do Vestibular, seção "Questões Comentadas" (Exame Discursivo)',
        'sourceUrl': 'https://www.revista.vestibular.uerj.br/questao/',
        'years': years,
        'note': 'Contagem do número de questões, por edição, cuja classificação oficial (Item do programa) corresponde ao tópico do programa de 2027. Uma questão pode abordar mais de um tópico. Em Língua Estrangeira, as provas de Espanhol, Francês e Inglês são somadas. Frequência passada não garante cobrança futura.',
        'questionsPerDiscipline': {d: dict(v) for d, v in totals.items()},
        'topics': {tid: dict(v) for tid, v in counts.items()},
        'unmatched': {d: dict(sorted(v.items(), key=lambda x: -x[1])) for d, v in unmatched.items()},
    }
    json.dump(out, open(out_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    tot = sum(sum(v.values()) for v in totals.values())
    um = sum(sum(v.values()) for v in unmatched.values())
    print('questões classificadas:', tot, 'itens sem correspondência:', um)
    for d, v in unmatched.items():
        print(d, list(v.items())[:12])
    if '--annotate' in sys.argv:
        # Anota o banco de questões oficiais com os tópicos do programa de 2027.
        qpath, opath = sys.argv[sys.argv.index('--annotate') + 1: sys.argv.index('--annotate') + 3]
        qs = json.load(open(qpath, encoding='utf-8'))
        kept = []
        for q in qs:
            disc = q['discipline']
            if disc in ('ESP', 'FRA', 'ING'):
                q['language'] = {'ESP': 'Espanhol', 'FRA': 'Francês', 'ING': 'Inglês'}[disc]
                q['discipline'] = disc = 'LE'
            if disc in (None, 'RED') or len(q['statement']) < 40:
                continue
            tids = []
            for it in q['programItems']:
                tid = match(disc, it)
                if tid and tid not in tids:
                    tids.append(tid)
            q['topicIds'] = tids
            q['transcription'] = 'automatica'
            q['requiresBaseText'] = disc == 'LE'
            q['formulaRisk'] = disc in ('MAT', 'FIS', 'QUI')
            kept.append(q)
        json.dump(kept, open(opath, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
        print('banco oficial:', len(kept), 'questões;', sum(1 for q in kept if not q['topicIds']), 'sem tópico 2027')
    if '--audit' in sys.argv:
        seen = set()
        for q in items:
            disc = 'LE' if q['disc'] in ('ESP', 'FRA', 'ING') else q['disc']
            for it in q['items']:
                if (disc, it) in seen or disc in (None, 'RED'):
                    continue
                seen.add((disc, it))
                print(f'{disc}\t{it}\t->\t{match(disc, it)}')


if __name__ == '__main__':
    main(*sys.argv[1:4])
