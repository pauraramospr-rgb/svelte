#!/usr/bin/env python3
"""
Narração gravada com a voz neural gratuita Piper (código aberto, modelos CC0) — ver src/lib/data/narracao/LEIAME.md.

Diferente do ElevenLabs (uma geração por cena e alinhamento pelas pausas), aqui cada FRASE é sintetizada
separadamente, então o início de cada frase é exato. As cenas de uma mesma parte da aula ficam num único
MP3 (`<aula>/parte-<n>.mp3`), e o manifesto guarda onde cada cena começa dentro do arquivo (`inicio`).
Um arquivo por parte mantém o total de arquivos dentro do limite da página publicada.

Requer o pacote `piper-tts` e um modelo de voz (.onnx + .onnx.json). Uso (com -I; o modelo baixado fica
numa pasta própria):
  python -I scripts/narracao/piper.py --textos todas.json --modelo pt_BR-faber-medium.onnx [--aulas a,b] [--jobs 4]

O JSON de textos vem de: EXPORTAR_NARRACAO=todas EXPORTAR_DESTINO=todas.json npx vitest run src/lib/cinema/narracao-exportar.test.ts
Cenas que já têm gravação do ElevenLabs no manifesto (com o texto atual) são mantidas e não são regeradas.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
import wave
from multiprocessing import Pool

RAIZ = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
PASTA = os.path.join(RAIZ, 'src', 'lib', 'data', 'narracao')

ENTRADA = 0.15        # silêncio no começo de cada cena (s)
PAUSA_FRASE = 0.42    # pausa depois de cada frase (s)
PAUSA_INTERNA = 0.22  # pausa entre períodos que o Piper separa dentro de uma frase (s)
PAUSA_CENA = 0.6      # silêncio extra no fim de cada cena (s)
RITMO = 1.08          # length_scale: um pouco mais devagar que o padrão, para soar didático
TAXA_MP3 = '24k'

# Pronúncias: o fonetizador soletra a maioria das siglas corretamente; estas são lidas como palavra.
PRONUNCIA = [(re.compile(r'\bUERJ\b'), 'Uérj')]

_voz = None
_config = None


def _iniciar(modelo):
    global _voz, _config
    import onnxruntime
    # Um núcleo por processo: os processos em paralelo não disputam os mesmos núcleos.
    original = onnxruntime.SessionOptions

    def opcoes():
        o = original()
        o.intra_op_num_threads = 1
        o.inter_op_num_threads = 1
        return o
    onnxruntime.SessionOptions = opcoes
    from piper import PiperVoice, SynthesisConfig
    _voz = PiperVoice.load(modelo)
    _config = SynthesisConfig(length_scale=RITMO)


def _silencio(seg, taxa):
    return b'\x00\x00' * int(round(seg * taxa))


def _aparar(audio, taxa, margem=0.03, limiar=350):
    """Tira o silêncio do começo e do fim de um trecho, para a marca da frase cair no início da voz."""
    import numpy as np
    x = np.frombuffer(audio, dtype=np.int16)
    voz = np.flatnonzero(np.abs(x) > limiar)
    if not len(voz):
        return audio
    m = int(margem * taxa)
    return x[max(0, voz[0] - m):min(len(x), voz[-1] + m)].tobytes()


def _falar(texto):
    """Áudio (int16 mono) de uma frase, sem silêncio nas pontas, e a taxa de amostragem."""
    for rx, troca in PRONUNCIA:
        texto = rx.sub(troca, texto)
    pedacos, taxa = [], 22050
    for k, ch in enumerate(_voz.synthesize(texto, syn_config=_config)):
        taxa = ch.sample_rate
        if k:
            pedacos.append(_silencio(PAUSA_INTERNA, taxa))
        pedacos.append(_aparar(ch.audio_int16_bytes, taxa))
    return b''.join(pedacos), taxa


def _parte(args):
    """Gera o MP3 de uma parte e devolve as entradas do manifesto das suas cenas."""
    aula, parte, cenas, voz_nome = args
    blocos, entradas, pos, taxa = [], [], 0.0, 22050
    for c in cenas:
        inicio_cena = pos
        blocos.append(_silencio(ENTRADA, taxa))
        pos += ENTRADA
        marcas = []
        fim = 0.0
        for f in c['frases']:
            audio, taxa = _falar(f)
            marcas.append(round(pos - inicio_cena, 3))
            blocos.append(audio)
            pos += len(audio) / 2 / taxa
            fim = pos - inicio_cena
            blocos.append(_silencio(PAUSA_FRASE, taxa))
            pos += PAUSA_FRASE
        blocos.append(_silencio(PAUSA_CENA, taxa))
        pos += PAUSA_CENA
        entradas.append({'aula': aula, 'cena': c['cena'], 'hash': c['hash'], 'arquivo': f'{aula}/parte-{parte}.mp3',
                         'inicio': round(inicio_cena, 3), 'dur': round(pos - inicio_cena, 3), 'marcas': marcas,
                         'fim': round(fim, 3), 'voz': voz_nome})
    destino = os.path.join(PASTA, aula, f'parte-{parte}.mp3')
    os.makedirs(os.path.dirname(destino), exist_ok=True)
    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
        caminho_wav = tmp.name
    try:
        with wave.open(caminho_wav, 'wb') as wf:
            wf.setnchannels(1)
            wf.setsampwidth(2)
            wf.setframerate(taxa)
            wf.writeframes(b''.join(blocos))
        # O Piper entrega cerca de -15 LUFS com picos no máximo: ganho fixo de -3 dB (sem compressão
        # dinâmica, que mexeria nos silêncios); mono, 22,05 kHz, taxa constante (busca exata no arquivo).
        r = subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', caminho_wav,
                            '-af', 'volume=-3dB', '-ac', '1', '-ar', '22050',
                            '-c:a', 'libmp3lame', '-b:a', TAXA_MP3, destino], capture_output=True, text=True)
        if r.returncode:
            raise RuntimeError(r.stderr[-500:])
    finally:
        os.unlink(caminho_wav)
    return entradas


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--textos', required=True)
    ap.add_argument('--modelo', required=True)
    ap.add_argument('--aulas', default='', help='só estas aulas (separadas por vírgula)')
    ap.add_argument('--jobs', type=int, default=os.cpu_count() or 2)
    ap.add_argument('--voz', default='Piper · faber (voz neural gratuita, CC0)')
    args = ap.parse_args()

    with open(args.textos, encoding='utf-8') as f:
        aulas = json.load(f)
    so = set(filter(None, args.aulas.split(',')))
    arq_manifesto = os.path.join(PASTA, 'manifesto.json')
    with open(arq_manifesto, encoding='utf-8') as f:
        manifesto = json.load(f)
    # Cenas com gravação do ElevenLabs válida (mesmo texto) ficam como estão.
    eleven = {(e['aula'], e['cena'], e['hash']) for e in manifesto if not e.get('voz', '').startswith('Piper')}

    tarefas = []
    for a in aulas:
        if so and a['aula'] not in so:
            continue
        partes = {}
        for c in a['cenas']:
            if (a['aula'], c['cena'], c['hash']) in eleven:
                continue
            partes.setdefault(c['parte'], []).append(c)
        for parte, cenas in sorted(partes.items()):
            tarefas.append((a['aula'], parte, cenas, args.voz))
    print(f'{len(tarefas)} partes para gerar', flush=True)

    novas = []
    with Pool(args.jobs, initializer=_iniciar, initargs=(args.modelo,)) as pool:
        for k, entradas in enumerate(pool.imap_unordered(_parte, tarefas), 1):
            novas.extend(entradas)
            if k % 20 == 0 or k == len(tarefas):
                print(f'  {k}/{len(tarefas)} partes', flush=True)

    geradas = {(e['aula'], e['cena']) for e in novas}
    aulas_geradas = {e['aula'] for e in novas}
    # Remove as entradas Piper antigas das aulas regeradas (e as das cenas regeradas), mantém o resto.
    manifesto = [e for e in manifesto if (e['aula'], e['cena']) not in geradas and not (e['aula'] in aulas_geradas and e.get('voz', '').startswith('Piper'))]
    manifesto.extend(novas)

    def chave(e):
        return (e['aula'], [int(x) for x in e['cena'].split('.')])
    manifesto.sort(key=chave)
    with open(arq_manifesto, 'w', encoding='utf-8') as f:
        f.write('[\n' + ',\n'.join('\t' + json.dumps(e, ensure_ascii=False) for e in manifesto) + '\n]\n')
    print(f'manifesto: {len(manifesto)} cenas gravadas', flush=True)


if __name__ == '__main__':
    sys.exit(main())
