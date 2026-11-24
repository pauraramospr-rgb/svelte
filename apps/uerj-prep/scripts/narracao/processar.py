#!/usr/bin/env python3
"""
Processa a narração gravada (ElevenLabs) de uma aula — ver src/lib/data/narracao/LEIAME.md.

Para cada cena:
  1. recodifica o MP3 bruto (mono, 22,05 kHz, 40 kbit/s, volume normalizado) em
     src/lib/data/narracao/<aula>/<cena>.mp3;
  2. acha o início de cada frase pelas pausas da fala (ffmpeg silencedetect) e um alinhamento por
     programação dinâmica: as N-1 fronteiras entre frases caem em pausas, na ordem, com durações
     proporcionais ao tamanho de cada frase;
  3. atualiza src/lib/data/narracao/manifesto.json.

Uso (rode com -I; os MP3 baixados ficam numa pasta própria):
  python3 -I scripts/narracao/processar.py --aula <id> --textos textos.json --brutos <pasta> [--cenas 1.1,1.2]
"""
import argparse
import json
import os
import re
import subprocess
import sys

RAIZ = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
PASTA = os.path.join(RAIZ, 'src', 'lib', 'data', 'narracao')


def rodar(args):
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f'falhou: {" ".join(args)}\n{r.stderr[-800:]}')
    return r


def duracao(arq):
    r = rodar(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', arq])
    return float(r.stdout.strip())


def silencios(arq, abaixo=20.0, minimo=0.1):
    """Pausas da fala: trechos de pelo menos `minimo` s com energia `abaixo` dB sob o nível típico da fala.

    O limiar é relativo ao próprio arquivo (percentil 90 da energia), porque o ruído de respiração e a
    reverberação variam de voz para voz; um limiar fixo quebrava as pausas reais em pedaços."""
    import numpy as np
    sr = 16000
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', arq, '-ac', '1', '-ar', str(sr), '-f', 's16le', '-'], capture_output=True)
    if r.returncode != 0:
        sys.exit(f'falhou ao decodificar {arq}')
    x = np.frombuffer(r.stdout, dtype=np.int16).astype(np.float64) / 32768.0
    janela, passo = int(0.02 * sr), int(0.01 * sr)
    n = max(1, 1 + (len(x) - janela) // passo)
    energia = np.array([np.mean(x[i * passo:i * passo + janela] ** 2) for i in range(n)])
    db = 10 * np.log10(energia + 1e-12)
    nivel = np.percentile(db, 90)
    mudo = db < nivel - abaixo
    out, ini = [], None
    for i, m in enumerate(mudo):
        t = i * passo / sr
        if m and ini is None:
            ini = t
        elif not m and ini is not None:
            if t - ini >= minimo:
                out.append((ini, t))
            ini = None
    if ini is not None:
        out.append((ini, None))
    # junta pausas separadas por um estalo de menos de 40 ms
    juntas = []
    for a, b in out:
        if juntas and juntas[-1][1] is not None and a - juntas[-1][1] < 0.04:
            juntas[-1] = (juntas[-1][0], b)
        else:
            juntas.append((a, b))
    if juntas and juntas[0][0] <= 0.02:
        juntas[0] = (0.0, juntas[0][1])
    return juntas


def recodificar(bruto, final):
    os.makedirs(os.path.dirname(final), exist_ok=True)
    rodar(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', bruto, '-af', 'loudnorm=I=-17:TP=-1.5:LRA=11',
           '-ac', '1', '-ar', '22050', '-c:a', 'libmp3lame', '-b:a', '40k', final])


def alinhar(frases, sil, dur):
    """Devolve (marcas, fim, relatório). marcas[i] = início da frase i no áudio."""
    n = len(frases)
    onset, fim, cand = 0.0, dur, []
    for a, b in sil:
        if a <= 0.05:
            onset = dur if b is None else b
        elif b is None or b >= dur - 0.15:
            fim = a
        else:
            cand.append((a, b))
    if n == 1:
        return [round(max(0.0, onset - 0.04), 3)], round(fim, 3), []
    pesos = [len(f) + 6 for f in frases]
    taxa = (fim - onset) / sum(pesos)
    INF = float('inf')

    def trecho(t0, t1, peso):
        esp = peso * taxa
        return ((t1 - t0 - esp) / (0.25 * esp + 0.8)) ** 2

    def pausa(j):
        a, b = cand[j]
        return 3.0 * max(0.0, 0.45 - (b - a)) / 0.45

    M = len(cand)
    if M < n - 1:
        sys.exit(f'só {M} pausas para {n - 1} fronteiras entre frases')
    melhor = [[INF] * M for _ in range(n - 1)]
    antes = [[-1] * M for _ in range(n - 1)]
    for j in range(M):
        melhor[0][j] = trecho(onset, cand[j][1], pesos[0]) + pausa(j)
    for k in range(1, n - 1):
        for j in range(k, M):
            cp = pausa(j)
            for i in range(k - 1, j):
                if melhor[k - 1][i] == INF:
                    continue
                c = melhor[k - 1][i] + trecho(cand[i][1], cand[j][1], pesos[k]) + cp
                if c < melhor[k][j]:
                    melhor[k][j] = c
                    antes[k][j] = i
    total, jj = INF, -1
    for j in range(M):
        if melhor[n - 2][j] < INF:
            c = melhor[n - 2][j] + trecho(cand[j][1], fim, pesos[n - 1])
            if c < total:
                total, jj = c, j
    escolha = [0] * (n - 1)
    k, j = n - 2, jj
    while k >= 0:
        escolha[k] = j
        j = antes[k][j]
        k -= 1
    marcas = [max(0.0, onset - 0.04)] + [max(0.0, cand[j][1] - 0.04) for j in escolha]
    rel = []
    acum = onset
    for k, j in enumerate(escolha):
        acum += pesos[k] * taxa
        a, b = cand[j]
        rel.append({'fronteira': k + 1, 'esperado': round(acum, 2), 'pausa': [round(a, 2), round(b, 2)], 'duracao_pausa': round(b - a, 2)})
    longas = sum(1 for a, b in cand if b - a >= 0.3)
    return [round(m, 3) for m in marcas], round(fim, 3), {'custo': round(total, 2), 'pausas_longas': longas, 'fronteiras': rel}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--aula', required=True)
    ap.add_argument('--textos', required=True, help='JSON gerado por narracao-exportar.test.ts')
    ap.add_argument('--brutos', required=True, help='pasta com <cena>.mp3 baixados do ElevenLabs')
    ap.add_argument('--cenas', default='', help='só estas cenas (separadas por vírgula)')
    ap.add_argument('--voz', default='ElevenLabs')
    args = ap.parse_args()

    with open(args.textos, encoding='utf-8') as f:
        dados = json.load(f)
    if dados['aula'] != args.aula:
        sys.exit('o JSON de textos é de outra aula')
    so = set(filter(None, args.cenas.split(',')))
    manifesto_arq = os.path.join(PASTA, 'manifesto.json')
    with open(manifesto_arq, encoding='utf-8') as f:
        manifesto = json.load(f)

    for c in dados['cenas']:
        if so and c['cena'] not in so:
            continue
        bruto = os.path.join(args.brutos, f"{c['cena']}.mp3")
        if not os.path.exists(bruto):
            print(f"· {c['cena']}: sem gravação bruta, pulada")
            continue
        rel = f"{args.aula}/{c['cena']}.mp3"
        final = os.path.join(PASTA, rel)
        recodificar(bruto, final)
        dur = duracao(final)
        marcas, fim, info = alinhar(c['frases'], silencios(final), dur)
        alertas = [r for r in (info['fronteiras'] if info else []) if r['duracao_pausa'] < 0.2 or abs(r['pausa'][1] - r['esperado']) > 3.5]
        # ritmo de cada frase (caracteres por segundo): fora de 11–21 indica fronteira no lugar errado
        limites = marcas + [fim]
        ritmos = [round(len(f) / max(0.3, limites[i + 1] - limites[i]), 1) for i, f in enumerate(c['frases'])]
        estranhos = [(i, r) for i, r in enumerate(ritmos) if r < 11 or r > 21]
        if estranhos:
            alertas.append({'ritmos_estranhos': estranhos, 'ritmos': ritmos})
        print(f"✓ {c['cena']}: {dur:.1f} s, {len(marcas)} frases, {info['pausas_longas'] if info else 0} pausas longas, custo {info['custo'] if info else 0}" + (f" — CONFERIR {len(alertas)}" if alertas else ''))
        for r in alertas:
            print('   ', r)
        manifesto = [e for e in manifesto if not (e['aula'] == args.aula and e['cena'] == c['cena'])]
        manifesto.append({'aula': args.aula, 'cena': c['cena'], 'hash': c['hash'], 'arquivo': rel, 'dur': round(dur, 3), 'marcas': marcas, 'fim': fim, 'voz': args.voz})

    def chave(e):
        return (e['aula'], [int(x) for x in e['cena'].split('.')])
    manifesto.sort(key=chave)
    with open(manifesto_arq, 'w', encoding='utf-8') as f:
        f.write('[\n' + ',\n'.join('\t' + json.dumps(e, ensure_ascii=False) for e in manifesto) + '\n]\n')


if __name__ == '__main__':
    main()
