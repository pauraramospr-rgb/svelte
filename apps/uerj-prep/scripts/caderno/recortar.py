"""Recorta dos cadernos oficiais da UERJ (Exame Discursivo) o bloco impresso de cada questão — figuras,
legendas, textos, tabelas e enunciado, sem a área de resposta — e as páginas de texto-base de que as questões
dependem. Resultado em src/lib/data/official/caderno/ (ver o LEIAME.md dessa pasta: fontes e ajustes manuais).

Uso (PDF baixado é dado não confiável: rode com -I, numa pasta só para ele):
    python3 -I scripts/caderno/recortar.py <caderno.pdf> <ano> <HIS|LPL> <pasta_saida>

Requer pdftotext e pdftoppm (poppler-utils) e Pillow. Imprime um JSON {questao: [arquivos...]} com os recortes
de cada questão, texto-base antes; confira a associação texto → questão antes de copiar para mapa.json."""
import json, os, re, subprocess, sys, html
from PIL import Image

DPI = 150

def palavras(pdf, p):
    out = subprocess.run(['pdftotext', '-bbox-layout', '-f', str(p), '-l', str(p), pdf, '-'], capture_output=True, text=True).stdout
    pg = re.search(r'<page width="([\d.]+)" height="([\d.]+)"', out)
    W, H = float(pg.group(1)), float(pg.group(2))
    ws = [(float(a), float(b), float(c), float(d), html.unescape(t)) for a, b, c, d, t in
          re.findall(r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)</word>', out)]
    return W, H, ws

def render(pdf, p, pasta):
    base = os.path.join(pasta, f'_p{p}')
    subprocess.run(['pdftoppm', '-r', str(DPI), '-f', str(p), '-l', str(p), '-singlefile', '-png', pdf, base], check=True)
    return Image.open(base + '.png').convert('L'), base + '.png'

def linhas_longas(img):
    """Linhas horizontais (bordas e pautas das caixas de resposta): maior trecho escuro contínuo > 55% da largura."""
    w, h = img.size
    px = img.load()
    ys = []
    for y in range(h):
        run = best = 0
        for x in range(0, w, 2):
            if px[x, y] < 140:
                run += 2
                best = max(best, run)
            else:
                run = 0
        if best > 0.55 * w:
            ys.append(y)
    return ys

def caixas(ys):
    grupos, atual = [], []
    for y in ys:
        if atual and y - atual[-1] > 90:
            grupos.append(atual)
            atual = []
        atual.append(y)
    if atual:
        grupos.append(atual)
    # caixa de resposta: várias pautas próximas (as linhas de 1–3 px contam como uma)
    res = []
    for g in grupos:
        distintas = [g[0]] + [b for a, b in zip(g, g[1:]) if b - a > 4]
        if len(distintas) >= 3:
            res.append((g[0], g[-1]))
    return res

def aparar(img, y0, y1, margem=14):
    w = img.size[0]
    reg = img.crop((0, max(0, y0), w, y1))
    bw = reg.point(lambda v: 255 if v < 235 else 0)
    box = bw.getbbox()
    if not box:
        return None
    x0, a, x1, b = box
    return (max(0, x0 - margem), max(0, y0 + a - margem), min(w, x1 + margem), min(img.size[1], y0 + b + margem))

def main():
    pdf, ano, disc, pasta = sys.argv[1:5]
    os.makedirs(pasta, exist_ok=True)
    npag = int(re.search(r'Pages:\s+(\d+)', subprocess.run(['pdfinfo', pdf], capture_output=True, text=True).stdout).group(1))
    esc = DPI / 72
    saida, texto_atual = {}, []
    for p in range(3, npag + 1):
        W, H, ws = palavras(pdf, p)
        if len(ws) < 8:
            continue
        cab = max([w[3] for w in ws if w[3] < 0.07 * H] or [0.05 * H])
        rod = min([w[1] for w in ws if w[1] > 0.93 * H] or [0.95 * H])
        img, png = render(pdf, p, pasta)
        top, bot = int((cab + 6) * esc), int((rod - 4) * esc)
        bx = [b for b in caixas(linhas_longas(img)) if top < b[0] < bot]
        # segmentos de conteúdo entre as caixas de resposta
        cortes, y = [], top
        for a, b in bx:
            cortes.append((y, a - 6))
            y = b + 6
        cortes.append((y, bot))
        rot = [w for w in ws if re.fullmatch(r'quest[ãa]o', w[4], re.I)]
        # Texto impresso acima do rótulo "Questão" (trecho compartilhado): vira um recorte próprio.
        partidos = []
        for y0, y1 in cortes:
            lab = sorted(w[1] * esc for w in rot if y0 <= w[1] * esc <= y1)
            if lab and lab[0] - y0 > 70 and any(w[3] * esc < lab[0] - 10 and w[1] * esc > y0 for w in ws if cab < w[1] < rod):
                partidos += [(y0, int(lab[0]) - 8), (int(lab[0]) - 8, y1)]
            else:
                partidos.append((y0, y1))
        for y0, y1 in partidos:
            if y1 - y0 < 30:
                continue
            dentro = [w for w in ws if y0 <= w[1] * esc <= y1]
            if not [w for w in dentro if w[1] > cab and w[3] < rod]:
                continue
            lab = [w for w in rot if y0 <= w[1] * esc <= y1]
            caixa = aparar(img, y0, y1)
            if not caixa:
                continue
            recorte = Image.open(png).convert('RGB').crop(caixa)
            if lab:
                num = None
                for w in sorted(dentro, key=lambda w: (w[1], w[0])):
                    if re.fullmatch(r'\d{2}', w[4]) and abs(w[0] - lab[0][0]) < 40 and w[1] >= lab[0][1] - 2:
                        num = int(w[4])
                        break
                if num is None:
                    print(f'p{p}: rótulo sem número', file=sys.stderr)
                    continue
                nome = f'{ano}-{disc}-{num:02d}.webp'
                recorte.save(os.path.join(pasta, nome), 'WEBP', quality=84, method=6)
                ords = sorted(dentro, key=lambda w: (w[1], w[0]))
                proprio = any(re.fullmatch(r'TEXTO|FRAGMENTO|EPÍLOGO|Epílogo', w[4]) or (re.fullmatch(r'CAPÍTULO|Capítulo', w[4]) and i + 1 < len(ords) and re.fullmatch(r'\d+', ords[i + 1][4])) for i, w in enumerate(ords))
                saida[f'{ano}-{disc}-{num:02d}'] = ([] if proprio else list(texto_atual)) + [nome]
            else:
                nome = f'{ano}-{disc}-texto-p{p}.webp' if not os.path.exists(os.path.join(pasta, f'{ano}-{disc}-texto-p{p}.webp')) else f'{ano}-{disc}-texto-p{p}b.webp'
                recorte.save(os.path.join(pasta, nome), 'WEBP', quality=84, method=6)
                # página só de texto: vale para as questões seguintes, até o próximo texto
                if not texto_atual or not texto_atual[-1].startswith((f'{ano}-{disc}-texto-p{p - 1}.', f'{ano}-{disc}-texto-p{p - 1}b.')):
                    texto_atual = []
                texto_atual.append(nome)
        os.remove(png)
    print(json.dumps(saida, ensure_ascii=False))

main()
