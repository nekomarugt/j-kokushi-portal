"""第4〜15章の模式図（手書きSVG）。四角・線・円と日本語ラベルだけで描く。figures.py から読み込まれる。"""
import math
from figures import t, svg, esc, panel, leader, INK, MUTED, BLUE, DEEP, PALE, CYAN, RED, LINE, WASH, BONE

REDP, BLUEP, YEL, YELP, GRN, GRNP, PUR, PURP, GRAY = '#fdecee', '#e4effa', '#b77a00', '#fff4d6', '#2e8b57', '#e5f5ec', '#6a4fb3', '#efeafb', '#9aa9b8'
DEFS = ('<defs>'
        '<marker id="ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#607487"/></marker>'
        '<marker id="ahr" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#cf2634"/></marker>'
        '<marker id="ahb" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#0b5ea8"/></marker>'
        '</defs>')

def tw(s, size):
    return sum(size * (0.58 if ord(c) < 128 else 1.0) for c in s)
def S(W, H, parts, title):
    return svg(W, H, DEFS + ''.join(parts), title)
def box(x, y, w, h, label, sub=None, fill=PALE, stroke=BLUE, size=20, color=DEEP, subsize=16, subcolor=INK, rx=10, sw=2):
    o = [f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>']
    cx = x + w / 2
    if sub:
        o.append(t(cx, y + h / 2 - 3, label, size, color, 'bold', 'middle'))
        o.append(t(cx, y + h / 2 + subsize + 2, sub, subsize, subcolor, anchor='middle'))
    else:
        o.append(t(cx, y + h / 2 + size * 0.36, label, size, color, 'bold', 'middle'))
    return ''.join(o)
def arr(x1, y1, x2, y2, color=MUTED, w=2.5, dash=''):
    m = {MUTED: 'ah', RED: 'ahr', BLUE: 'ahb'}.get(color, 'ah')
    d = f' stroke-dasharray="{dash}"' if dash else ''
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{w}" marker-end="url(#{m})"{d}/>'
def pline(pts, color=MUTED, w=2.5, arrow=True, dash=''):
    m = {MUTED: 'ah', RED: 'ahr', BLUE: 'ahb'}.get(color, 'ah')
    d = f' stroke-dasharray="{dash}"' if dash else ''
    me = f' marker-end="url(#{m})"' if arrow else ''
    return f'<polyline points="{" ".join(f"{a},{b}" for a, b in pts)}" fill="none" stroke="{color}" stroke-width="{w}" stroke-linejoin="round"{me}{d}/>'
def pill(cx, cy, label, fill=RED, size=16, color='#fff'):
    w = tw(label, size) + 18
    return (f'<rect x="{cx - w/2:.1f}" y="{cy - 13}" width="{w:.1f}" height="26" rx="13" fill="{fill}"/>'
            + t(cx, cy + size * 0.36, label, size, color, 'bold', 'middle'))
def lines(x, y, rows, size=17, gap=None, anchor='start'):
    gap = gap or size * 1.45
    o = []
    for i, r in enumerate(rows):
        if isinstance(r, tuple): s, c, wgt = (r + (None,))[:3]
        else: s, c, wgt = r, INK, None
        o.append(t(x, y + i * gap, s, size, c or INK, wgt or 'normal', anchor))
    return ''.join(o)

# ============ 04 上肢 ============
def rotator_cuff():
    W, H = 560, 560
    b = [t(20, 32, '肩甲骨から → 上腕骨の頭のすぐ横へ', 19, MUTED)]
    # humerus side
    b.append(f'<rect x="352" y="56" width="188" height="392" rx="16" fill="{BONE}" stroke="#b9a37a" stroke-width="2"/>')
    b.append(t(446, 82, '上腕骨', 20, '#7a5a1c', 'bold', 'middle'))
    b.append(f'<rect x="366" y="96" width="160" height="236" rx="10" fill="#fff" stroke="{BLUE}" stroke-width="2"/>')
    b.append(t(446, 120, '大結節', 20, DEEP, 'bold', 'middle'))
    for i, s in enumerate(('上', '中', '下')):
        yy = 132 + i * 64
        b.append(f'<rect x="380" y="{yy}" width="132" height="54" rx="8" fill="{PALE}" stroke="{BLUE}" stroke-width="1.5"/>')
        b.append(t(446, yy + 34, s, 20, DEEP, 'bold', 'middle'))
    b.append(box(366, 342, 160, 50, '小結節', fill='#fff', stroke=RED, color=RED))
    b.append(box(366, 402, 160, 38, '小結節稜', fill='#f4f6f8', stroke=GRAY, color=MUTED, size=18))
    ms = [('棘上筋', '肩甲上神経・外転', 159, BLUE), ('棘下筋', '肩甲上神経・外旋', 223, BLUE), ('小円筋', '腋窩神経・外旋', 287, BLUE),
          ('肩甲下筋', '肩甲下神経・内旋', 367, RED)]
    for i, (n, sub, ty, c) in enumerate(ms):
        y = 132 + i * 64 if i < 3 else 342
        b.append(box(20, y, 250, 54 if i < 3 else 50, n, sub, fill=PALE if c == BLUE else REDP, stroke=c, color=DEEP if c == BLUE else RED, size=20))
        b.append(arr(272, ty, 376, ty, c, 2.5))
    b.append(box(20, 402, 250, 38, '大円筋（腱板ではない）', fill='#f4f6f8', stroke=GRAY, color=MUTED, size=17))
    b.append(arr(272, 421, 362, 421, MUTED, 2, '6 4'))
    b.append(t(20, 488, '腱板（ローテーターカフ）＝上の4つ', 20, DEEP, 'bold'))
    b.append(t(20, 518, '大結節に上から「棘上・棘下・小円」、小結節に「肩甲下」', 17, INK))
    b.append(t(20, 544, '青＝大結節（外転・外旋）　赤＝小結節（内旋）', 16, MUTED))
    return S(W, H, b, '回旋筋腱板の4筋と上腕骨への付着の模式図')

def carpals():
    W, H = 560, 560
    b = [t(20, 30, '左手を手のひら側から見た図（模式）', 17, MUTED)]
    b.append(t(24, 60, '← 橈側（親指側）', 18, BLUE, 'bold'))
    b.append(t(536, 60, '尺側（小指側）→', 18, BLUE, 'bold', 'end'))
    cols = [40, 162, 284, 406]; cw = 116
    # metacarpals
    mc = [(48, 'Ⅰ'), (170, 'Ⅱ'), (292, 'Ⅲ'), (404, 'Ⅳ'), (466, 'Ⅴ')]
    for x, r in mc:
        w = 100 if x < 400 else 54
        b.append(f'<rect x="{x}" y="80" width="{w}" height="70" rx="12" fill="#f4f6f8" stroke="{GRAY}" stroke-width="1.5"/>')
        b.append(t(x + w/2, 122, r, 20, MUTED, 'bold', 'middle'))
    b.append(t(280, 172, '中手骨（上）', 15, MUTED, anchor='middle'))
    dist = ['大菱形骨', '小菱形骨', '有頭骨', '有鈎骨']
    prox = ['舟状骨', '月状骨', '三角骨']
    for i, n in enumerate(dist):
        b.append(box(cols[i], 184, cw, 70, n, fill=PALE, stroke=BLUE, size=20))
    for i, n in enumerate(prox):
        b.append(box(cols[i], 264, cw, 70, n, fill='#fff', stroke=DEEP, size=20))
    b.append(f'<circle cx="{cols[3]+62}" cy="300" r="40" fill="{YELP}" stroke="{YEL}" stroke-width="2"/>')
    b.append(t(cols[3]+62, 307, '豆状骨', 19, '#7a4b00', 'bold', 'middle'))
    b.append(t(24, 222, '遠位列', 15, MUTED, anchor='middle', extra='transform="rotate(-90 24 222)"'))
    b.append(t(24, 300, '近位列', 15, MUTED, anchor='middle', extra='transform="rotate(-90 24 300)"'))
    # saddle joint mark
    b.append(f'<ellipse cx="98" cy="167" rx="44" ry="9" fill="none" stroke="{RED}" stroke-width="2.5" stroke-dasharray="5 3"/>')
    # radius / ulna
    b.append(f'<rect x="40" y="360" width="238" height="80" rx="14" fill="{BONE}" stroke="#b9a37a" stroke-width="2"/>')
    b.append(t(159, 408, '橈骨', 21, '#7a5a1c', 'bold', 'middle'))
    b.append(f'<polygon points="290,352 400,352 345,378" fill="{YELP}" stroke="{YEL}" stroke-width="1.5"/>')
    b.append(f'<rect x="300" y="386" width="100" height="54" rx="14" fill="{BONE}" stroke="#b9a37a" stroke-width="2"/>')
    b.append(t(350, 420, '尺骨', 21, '#7a5a1c', 'bold', 'middle'))
    b.append(t(410, 372, '← 関節円板', 15, MUTED))
    b.append(t(20, 474, '覚え方（どちらも親指側から）', 17, MUTED))
    b.append(t(20, 502, '近位：舟・月・三角・豆', 20, DEEP, 'bold'))
    b.append(t(20, 530, '遠位：大・小・有頭・有鈎', 20, BLUE, 'bold'))
    b.append(t(300, 502, '赤の点線＝母指CM関節', 16, RED))
    b.append(t(300, 526, '（鞍関節）', 16, RED))
    return S(W, H, b, '手根骨8個の並びの模式図')

# ============ 05 下肢 ============
def femoral_triangle():
    W, H = 560, 560
    b = [t(20, 30, '右の太ももを前から見た図（模式）', 17, MUTED)]
    b.append(t(24, 62, '← 外側', 18, BLUE, 'bold')); b.append(t(536, 62, '内側 →', 18, BLUE, 'bold', 'end'))
    A, B_, C = (70, 130), (490, 130), (300, 470)
    b.append(f'<polygon points="{A[0]},{A[1]} {B_[0]},{B_[1]} {C[0]},{C[1]}" fill="#fbfdff" stroke="none"/>')
    b.append(f'<line x1="{A[0]}" y1="{A[1]}" x2="{B_[0]}" y2="{B_[1]}" stroke="{DEEP}" stroke-width="6" stroke-linecap="round"/>')
    b.append(f'<line x1="{A[0]}" y1="{A[1]}" x2="{C[0]+18}" y2="{C[1]+40}" stroke="#d98b8b" stroke-width="22" stroke-linecap="round" opacity=".85"/>')
    b.append(f'<line x1="{B_[0]}" y1="{B_[1]}" x2="{C[0]-10}" y2="{C[1]+30}" stroke="#c9a3d6" stroke-width="22" stroke-linecap="round" opacity=".85"/>')
    b.append(t(280, 114, '鼠径靱帯（上の辺）', 19, DEEP, 'bold', 'middle'))
    b.append(t(60, 330, '縫工筋', 20, '#a23b3b', 'bold')); b.append(t(60, 354, '（外側の辺）', 16, MUTED))
    b.append(t(500, 330, '長内転筋', 20, PUR, 'bold', 'end')); b.append(t(500, 354, '（内側の辺）', 16, MUTED, anchor='end'))
    # contents N A V (lateral -> medial)
    for x0, col, lab, w in ((200, '#d9a400', '神経', 7), (268, RED, '動脈', 10), (336, BLUE, '静脈', 12)):
        b.append(f'<path d="M{x0},136 C{x0},260 {300 + (x0-268)*0.25},380 {300 + (x0-268)*0.12},440" fill="none" stroke="{col}" stroke-width="{w}" stroke-linecap="round"/>')
        b.append(pill(x0, 196, lab, col, 18, '#fff' if col != '#d9a400' else '#3d2a00'))
    b.append(t(300, 510, '中身は外側から 神経・動脈・静脈（N・A・V）', 19, INK, 'bold', 'middle'))
    b.append(t(300, 540, '＝内側から 静脈・動脈・神経（V・A・N）', 17, MUTED, anchor='middle'))
    return S(W, H, b, '大腿三角の境界と中身の並びの模式図')

def leg_compartments():
    W, H = 560, 600
    b = [t(20, 30, '右の下腿の輪切り（上から見た模式図）', 17, MUTED)]
    b.append(t(280, 58, '前（すね側）', 17, MUTED, anchor='middle')); b.append(t(280, 392, '後ろ（ふくらはぎ側）', 17, MUTED, anchor='middle'))
    b.append(t(22, 222, '内側', 17, MUTED)); b.append(t(538, 222, '外側', 17, MUTED, anchor='end'))
    cx, cy, rx, ry = 280, 220, 200, 150
    b.append(f'<clipPath id="leg"><ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}"/></clipPath>')
    ant = [(232, 90), (222, 132), (372, 196), (398, 188), (520, -20), (232, -20)]
    lat = [(390, 206), (520, -20), (620, -20), (620, 392), (560, 392)]
    post = [(0, 168), (196, 160), (222, 132), (372, 196), (404, 222), (560, 392), (620, 420), (0, 420)]
    for pts, f in ((ant, '#dcebf8'), (lat, '#e5f5ec'), (post, '#fde4e6')):
        b.append(f'<polygon clip-path="url(#leg)" points="{" ".join(f"{a},{c}" for a, c in pts)}" fill="{f}"/>')
    b.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="none" stroke="{DEEP}" stroke-width="3"/>')
    b.append(f'<line x1="222" y1="132" x2="372" y2="196" stroke="{MUTED}" stroke-width="2.5"/>')
    b.append(f'<line x1="398" y1="188" x2="440" y2="110" stroke="{MUTED}" stroke-width="2.5"/>')
    b.append(f'<line x1="404" y1="222" x2="450" y2="300" stroke="{MUTED}" stroke-width="2.5"/>')
    b.append(f'<polygon points="172,104 244,104 214,166" fill="{BONE}" stroke="#b9a37a" stroke-width="2.5"/>')
    b.append(t(210, 126, '脛骨', 16, '#7a5a1c', 'bold', 'middle'))
    b.append(f'<circle cx="392" cy="206" r="20" fill="{BONE}" stroke="#b9a37a" stroke-width="2.5"/>')
    b.append(t(392, 244, '腓骨', 15, '#7a5a1c', 'bold', 'middle'))
    b.append(t(310, 118, '前群', 21, BLUE, 'bold', 'middle'))
    b.append(t(448, 206, '外側群', 18, GRN, 'bold', 'middle'))
    b.append(t(270, 300, '後群', 21, RED, 'bold', 'middle'))
    rows = [('前群', '深腓骨神経', '前脛骨筋・長趾伸筋など', '背屈', BLUE, '#dcebf8'),
            ('外側群', '浅腓骨神経', '長腓骨筋・短腓骨筋', '底屈・外がえし', GRN, '#e5f5ec'),
            ('後群', '脛骨神経', '下腿三頭筋・後脛骨筋など', '底屈・内がえし', RED, '#fde4e6')]
    for i, (g, n, m, a, c, f) in enumerate(rows):
        y = 410 + i * 60
        b.append(f'<rect x="20" y="{y}" width="520" height="52" rx="10" fill="{f}" stroke="{c}" stroke-width="1.5"/>')
        b.append(t(34, y + 23, g, 19, c, 'bold')); b.append(t(34, y + 45, a, 15, INK))
        b.append(t(170, y + 23, n, 19, DEEP, 'bold')); b.append(t(170, y + 45, m, 15, MUTED))
    return S(W, H, b, '下腿の3つの筋群（前・外側・後）と支配神経の模式図')

def foot_bones():
    W, H = 560, 640
    b = [t(20, 30, '右足を上（足の甲）から見た図（模式）', 17, MUTED)]
    b.append(t(20, 60, '← 母趾側', 16, MUTED)); b.append(t(390, 60, '小趾側 →', 16, MUTED, anchor='end'))
    # metatarsals
    mts = [(160, 55, 96, 248, 'Ⅰ'), (219, 34, 86, 248, 'Ⅱ'), (256, 42, 92, 248, 'Ⅲ'), (302, 34, 104, 340, 'Ⅳ'), (338, 34, 118, 340, 'Ⅴ')]
    for x, w, y0, y1, r in mts:
        b.append(f'<rect x="{x}" y="{y0}" width="{w}" height="{y1 - y0}" rx="12" fill="#f4f6f8" stroke="{GRAY}" stroke-width="1.5"/>')
        b.append(t(x + w/2, y0 + 30, r, 17, MUTED, 'bold', 'middle'))
    b.append(t(20, 170, '中足骨', 17, MUTED, 'bold'))
    # cuneiforms
    for x, w, n in ((160, 55, '内側'), (219, 34, '中間'), (256, 42, '外側')):
        b.append(f'<rect x="{x}" y="252" width="{w}" height="76" rx="6" fill="{PALE}" stroke="{BLUE}" stroke-width="2"/>')
        for k, ch in enumerate(n):
            b.append(t(x + w/2, 284 + k * 20, ch, 15, DEEP, 'bold', 'middle'))
    b.append(t(20, 296, '楔状骨', 17, BLUE, 'bold')); b.append(t(20, 316, '（3個）', 15, MUTED))
    b.append(box(160, 332, 138, 46, '舟状骨', fill=PALE, stroke=BLUE, size=18))
    b.append(box(302, 344, 70, 92, '立方骨', fill=PALE, stroke=BLUE, size=17))
    b.append(box(240, 440, 132, 150, '踵骨', fill='#fff', stroke=DEEP, size=21))
    b.append(box(170, 382, 128, 96, '距骨', fill='#fff', stroke=DEEP, size=21))
    b.append(pline([(150, 380), (300, 380), (300, 438), (382, 438)], RED, 4, False, '9 5'))
    b.append(pline([(150, 250), (300, 250), (300, 341), (382, 341)], BLUE, 4, False, '9 5'))
    lx = 400
    b.append(t(lx, 230, 'リスフラン関節', 17, BLUE, 'bold')); b.append(lines(lx, 254, ['＝楔状骨・立方骨', '　と中足骨の間'], 15))
    b.append(t(lx, 450, 'ショパール関節', 17, RED, 'bold')); b.append(lines(lx, 474, ['＝距舟関節', '　＋踵立方関節'], 15))
    b.append(t(20, 614, '足根骨は7個：距骨・踵骨・舟状骨・立方骨・楔状骨×3', 17, INK, 'bold'))
    return S(W, H, b, '足の骨とショパール関節・リスフラン関節の模式図')

# ============ 06 脈管 ============
def heart_flow():
    W, H = 560, 676
    b = []
    b.append(t(140, 30, '静脈血（酸素が少ない）', 17, BLUE, 'bold', 'middle'))
    b.append(t(420, 30, '動脈血（酸素が多い）', 17, RED, 'bold', 'middle'))
    L = ['大静脈（上・下）', '右心房', '右心室', '肺動脈']
    R = ['大動脈', '左心室', '左心房', '肺静脈']
    ys = [72 + i * 110 for i in range(4)]
    for i in range(4):
        b.append(box(30, ys[i], 220, 54, L[i], fill=BLUEP, stroke=BLUE, size=21))
        b.append(box(310, ys[i], 220, 54, R[i], fill=REDP, stroke=RED, color='#9c1c26', size=21))
    b.append(t(140, 62, '全身から ↓', 15, MUTED, anchor='middle'))
    b.append(t(420, 62, '↑ 全身へ', 15, MUTED, anchor='middle'))
    for i in range(3):
        y1, y2 = ys[i] + 56, ys[i + 1] - 2
        b.append(arr(140, y1, 140, y2, BLUE, 3))
        b.append(arr(420, y2, 420, y1, RED, 3))
    b.append(pill(140, ys[1] + 83, '三尖弁', RED))
    b.append(pill(140, ys[2] + 83, '肺動脈弁', '#7b8da0'))
    b.append(pill(420, ys[1] + 83, '僧帽弁（2尖）', RED))
    b.append(pill(420, ys[0] + 83, '大動脈弁', '#7b8da0'))
    yl = ys[3] + 110
    b.append(box(30, yl, 500, 60, '肺（ガス交換）', '二酸化炭素を出して酸素をもらう', fill='#f3f8fc', stroke=CYAN, size=21))
    b.append(pline([(140, ys[3] + 56), (140, yl - 2)], BLUE, 3))
    b.append(pline([(420, yl - 2), (420, ys[3] + 56)], RED, 3))
    y0 = yl + 96
    b.append(pill(56, y0 - 6, '赤', RED, 15)); b.append(t(80, y0, '房室弁：腱索・乳頭筋あり（三尖弁・僧帽弁）', 16, INK))
    b.append(pill(56, y0 + 26, '灰', '#7b8da0', 15)); b.append(t(80, y0 + 32, '動脈弁（半月弁）：腱索なし', 16, INK))
    return S(W, H, b, '心臓の部屋と弁を血液の流れの順に並べた模式図')

def conduction():
    W, H = 560, 530
    b = []
    steps = [('洞房結節', '右心房・上大静脈の入口付近　ペースメーカー'),
             ('房室結節', '右心房・心房中隔の下部　ここで少し遅らせる'),
             ('ヒス束', '心房から心室へ伝える唯一の道'),
             ('右脚・左脚', '心室中隔を下る'),
             ('プルキンエ線維', '心室の筋全体へ広がる')]
    for i, (n, s) in enumerate(steps):
        y = 20 + i * 96
        fill, st, col = (REDP, RED, '#9c1c26') if i < 2 else (PALE, BLUE, DEEP)
        b.append(box(90, y, 450, 66, n, s, fill=fill, stroke=st, color=col, size=22, subsize=16))
        if i < 4: b.append(arr(315, y + 68, 315, y + 94, MUTED, 3))
    b.append(f'<path d="M78,22 h-12 v160 h12" fill="none" stroke="{RED}" stroke-width="3"/>')
    for k, ch in enumerate('右心房'):
        b.append(t(40, 78 + k * 26, ch, 20, RED, 'bold', 'middle'))
    b.append(f'<path d="M78,214 h-12 v278 h12" fill="none" stroke="{BLUE}" stroke-width="3"/>')
    for k, ch in enumerate('心室へ'):
        b.append(t(40, 330 + k * 26, ch, 20, BLUE, 'bold', 'middle'))
    return S(W, H, b, '刺激伝導系の順番の模式図')

def aorta():
    W, H = 560, 900
    b = [t(20, 28, '前から見た図（向かって左が体の右）', 16, MUTED)]
    # arch
    b.append(f'<path d="M150,300 L150,190 C150,110 290,110 290,190 L290,780" fill="none" stroke="{RED}" stroke-width="22" stroke-linecap="round"/>')
    # arch branches
    for x0, x1, lab, ly in ((180, 110, '①腕頭動脈', 60), (222, 222, '②左総頸動脈', 60), (262, 330, '③左鎖骨下動脈', 96)):
        b.append(f'<line x1="{x0}" y1="140" x2="{x1}" y2="{ly + 12}" stroke="{RED}" stroke-width="9" stroke-linecap="round"/>')
    b.append(t(110, 62, '①腕頭動脈', 17, INK, 'bold', 'middle'))
    b.append(t(222, 48, '②左総頸動脈', 17, INK, 'bold', 'middle'))
    b.append(t(345, 96, '③左鎖骨下動脈', 17, INK, 'bold'))
    b.append(t(20, 150, '大動脈弓', 18, RED, 'bold'))
    b.append(t(20, 174, '（右から①②③）', 15, MUTED))
    b.append(t(20, 260, '上行大動脈', 16, MUTED))
    b.append(t(310, 300, '胸大動脈', 18, RED, 'bold'))
    b.append(t(310, 324, '肋間動脈・気管支動脈・食道動脈', 15, MUTED))
    b.append(f'<line x1="120" y1="380" x2="470" y2="380" stroke="{MUTED}" stroke-width="2" stroke-dasharray="8 6"/>')
    b.append(t(470, 372, '横隔膜', 15, MUTED, anchor='end'))
    b.append(t(310, 404, '腹大動脈', 18, RED, 'bold'))
    br = [(440, 'Th12', '腹腔動脈', '胃・肝・脾へ', 1), (510, 'L1', '上腸間膜動脈', '小腸・大腸の右半分', 1),
          (570, 'L1〜2', '腎動脈（左右）', '', 2), (630, 'L2', '精巣／卵巣動脈', '', 2), (700, 'L3', '下腸間膜動脈', '大腸の左半分', 1)]
    for y, lv, n, s, kind in br:
        b.append(t(80, y + 6, lv, 17, MUTED, 'bold', 'middle'))
        b.append(f'<line x1="300" y1="{y}" x2="360" y2="{y}" stroke="{RED}" stroke-width="7" stroke-linecap="round"/>')
        if kind == 2:
            b.append(f'<line x1="280" y1="{y}" x2="220" y2="{y}" stroke="{RED}" stroke-width="7" stroke-linecap="round"/>')
        b.append(t(372, y + 6, n, 18, DEEP, 'bold'))
        if s: b.append(t(372, y + 28, s, 14.5, MUTED))
    b.append(t(80, 780, 'L4', 17, MUTED, 'bold', 'middle'))
    b.append(f'<path d="M290,776 L236,850 M290,776 L344,850" fill="none" stroke="{RED}" stroke-width="12" stroke-linecap="round"/>')
    b.append(t(372, 800, '左右の総腸骨動脈に', 17, DEEP, 'bold')); b.append(t(372, 824, '分かれる', 17, DEEP, 'bold'))
    b.append(f'<line x1="120" y1="420" x2="120" y2="800" stroke="{LINE}" stroke-width="2"/>')
    b.append(t(80, 420, '高さ', 14, MUTED, anchor='middle'))
    b.append(t(20, 890, '内臓へ行く3本は上から 前腸→中腸→後腸 の順', 16, INK))
    return S(W, H, b, '大動脈弓の3本の枝と腹大動脈の枝の高さの模式図')

def fetal():
    W, H = 560, 806
    b = [t(20, 28, '赤＝胎児だけにある「近道」　（ ）内＝生まれた後の名残', 16, MUTED)]
    def B(x, y, w, n, s=None, hot=False):
        return box(x, y, w, 48 if not s else 58, n, s, fill=REDP if hot else PALE, stroke=RED if hot else BLUE,
                   color='#9c1c26' if hot else DEEP, size=19, subsize=14, subcolor=MUTED)
    b.append(B(180, 44, 200, '胎盤'))
    b.append(B(140, 124, 280, '臍静脈（1本）', '酸素が一番多い（→肝円索）'))
    b.append(B(140, 214, 280, '静脈管', '肝臓を素通り（→静脈管索）', True))
    b.append(B(180, 304, 200, '下大静脈'))
    b.append(B(180, 384, 200, '右心房'))
    b.append(B(20, 474, 230, '右心室'))
    b.append(B(20, 554, 230, '肺動脈'))
    b.append(B(20, 634, 230, '動脈管', '肺動脈→大動脈（→動脈管索）', True))
    b.append(B(310, 464, 230, '卵円孔', '右心房→左心房（→卵円窩）', True))
    b.append(B(310, 554, 230, '左心房→左心室'))
    b.append(B(310, 639, 230, '大動脈'))
    b.append(B(20, 734, 520, '全身 → 臍動脈（2本）→ 胎盤へ', '酸素が一番少ない（→臍動脈索）'))
    for (x1, y1, x2, y2) in ((280, 94, 280, 122), (280, 184, 280, 212), (280, 274, 280, 302), (280, 354, 280, 382),
                             (220, 434, 135, 472), (135, 524, 135, 552), (135, 604, 135, 632), (340, 434, 425, 462), (425, 524, 425, 552),
                             (425, 604, 425, 637), (252, 663, 308, 663), (425, 689, 425, 732)):
        b.append(arr(x1, y1, x2, y2, MUTED, 2.5))
    b.append(t(24, 452, '（肺はまだ使わない）', 14, MUTED))
    return S(W, H, b, '胎児循環の流れと3つの近道の模式図')

# ============ 07 消化器 ============
def duodenum():
    W, H = 560, 600
    b = [t(20, 28, '前から見た図（向かって左が体の右）', 16, MUTED)]
    # pancreas (behind)
    b.append(f'<path d="M300,210 C360,170 450,150 540,140 L545,178 C460,190 390,215 340,260 Z" fill="#f6e3a8" stroke="#c9a640" stroke-width="2"/>')
    b.append(f'<ellipse cx="320" cy="290" rx="78" ry="98" fill="#f6e3a8" stroke="#c9a640" stroke-width="2"/>')
    b.append(t(330, 300, '膵頭', 19, '#7a5a00', 'bold', 'middle'))
    b.append(t(492, 138, '膵体・膵尾 →', 14, '#7a5a00', anchor='middle'))
    # stomach stub
    b.append(f'<path d="M420,70 L520,60 L520,100 L430,110 Z" fill="#fde2d0" stroke="#c7825a" stroke-width="2"/>')
    b.append(t(485, 90, '胃', 17, '#8a4a22', 'bold', 'middle'))
    tube = 'M430,95 L250,100 Q210,100 210,140 L210,410 Q210,450 250,450 L450,450 Q490,450 490,410 L490,260 Q490,230 520,230 L550,230'
    b.append(f'<path d="{tube}" fill="none" stroke="#c7825a" stroke-width="40" stroke-linejoin="round"/>')
    b.append(f'<path d="{tube}" fill="none" stroke="#fde2d0" stroke-width="33" stroke-linejoin="round"/>')
    b.append(f'<line x1="428" y1="80" x2="428" y2="112" stroke="{DEEP}" stroke-width="4"/>')
    b.append(t(410, 136, '幽門', 14, MUTED, anchor='middle'))
    for n, x, y in (('①', 330, 106), ('②', 210, 330), ('③', 350, 456), ('④', 490, 350)):
        b.append(f'<circle cx="{x}" cy="{y}" r="14" fill="#8a4a22"/>'); b.append(t(x, y + 6, n.replace('①','1').replace('②','2').replace('③','3').replace('④','4'), 17, '#fff', 'bold', 'middle'))
    b.append(t(538, 262, '空腸へ', 14, MUTED, anchor='end'))
    # ducts
    b.append(f'<path d="M300,40 L300,120 C295,190 260,250 232,300" fill="none" stroke="{GRN}" stroke-width="7" stroke-linecap="round"/>')
    b.append(t(290, 52, '総胆管', 16, GRN, 'bold', 'end')); b.append(t(290, 72, '（肝臓・胆嚢から）', 13, GRN, anchor='end'))
    b.append(f'<path d="M540,160 C460,175 380,210 340,270 C310,300 270,305 232,305" fill="none" stroke="#b77a00" stroke-width="5" stroke-linecap="round"/>')
    b.append(f'<path d="M320,245 C290,245 260,250 232,258" fill="none" stroke="#b77a00" stroke-width="3.5" stroke-dasharray="6 4"/>')
    b.append(f'<circle cx="230" cy="304" r="9" fill="{RED}"/>'); b.append(f'<circle cx="230" cy="258" r="6" fill="{PUR}"/>')
    b.append(pline([(222, 304), (150, 330)], RED, 2, False)); b.append(pline([(224, 258), (150, 232)], PUR, 2, False))
    b.append(lines(20, 226, [('小十二指腸乳頭', PUR, 'bold'), '＝副膵管'], 15, 20))
    b.append(lines(20, 336, [('大十二指腸乳頭', RED, 'bold'), '（ファーター乳頭）', '＝総胆管＋主膵管', 'オッディ括約筋'], 15, 20))
    b.append(t(20, 506, '1 上部 → 2 下行部 → 3 水平部 → 4 上行部', 18, '#8a4a22', 'bold'))
    b.append(t(20, 532, '→ 十二指腸空腸曲（トライツ靱帯）→ 空腸', 17, INK))
    b.append(t(20, 562, '膵頭を「C」の字に囲む。十二指腸は腹膜後器官', 16, MUTED))
    return S(W, H, b, '十二指腸の4つの部分と乳頭（胆管・膵管の出口）の模式図')

def bile_duct():
    W, H = 560, 560
    b = [t(20, 28, '胆汁（緑）と膵液（黄）の通り道', 17, MUTED)]
    G = dict(fill=GRNP, stroke=GRN, color='#1d5e3a')
    b.append(box(40, 48, 150, 48, '右肝管', size=19, **G)); b.append(box(230, 48, 150, 48, '左肝管', size=19, **G))
    b.append(box(120, 136, 180, 50, '総肝管', size=20, **G))
    b.append(box(370, 136, 170, 76, '胆嚢', '濃縮して貯める', size=20, subsize=15, **G))
    b.append(box(120, 236, 180, 50, '総胆管', size=20, **G))
    b.append(box(370, 236, 170, 50, '胆嚢管', size=19, **G))
    b.append(box(370, 330, 170, 50, '主膵管', size=19, fill=YELP, stroke=YEL, color='#7a4b00'))
    b.append(box(40, 330, 300, 72, '大十二指腸乳頭', '十二指腸の下行部に開く', size=21, subsize=15, fill=REDP, stroke=RED, color='#9c1c26'))
    b.append(arr(115, 98, 170, 134, GRN, 3)); b.append(arr(305, 98, 250, 134, GRN, 3))
    b.append(arr(210, 188, 210, 234, GRN, 3))
    b.append(f'<line x1="455" y1="216" x2="455" y2="232" stroke="{GRN}" stroke-width="3" marker-start="url(#ah)" marker-end="url(#ah)"/>')
    b.append(arr(368, 260, 304, 238, GRN, 3))
    b.append(arr(210, 288, 190, 328, GRN, 3))
    b.append(arr(368, 355, 342, 355, YEL, 3))
    b.append(t(40, 440, '胆汁は肝臓でつくられ、胆嚢で濃くして貯める', 17, INK, 'bold'))
    b.append(t(40, 470, '胆嚢管は十二指腸に直接開かない（総肝管と合流して総胆管）', 15.5, INK))
    b.append(t(40, 500, '出口の弁＝オッディ括約筋', 15.5, INK))
    b.append(t(40, 530, '副膵管は小十二指腸乳頭に開く', 15.5, MUTED))
    return S(W, H, b, '胆汁と膵液の通り道の模式図')

# ============ 08 呼吸器 ============
def lungs():
    W, H = 560, 730
    b = [t(20, 28, '前から見た図（向かって左が右肺）', 16, MUTED)]
    R = 'M232,120 C170,96 70,150 46,300 C34,420 34,510 42,572 C110,556 180,566 236,580 Z'
    Lp = 'M328,120 C390,96 490,150 514,300 C526,420 526,510 518,572 C460,560 400,566 334,580 L334,500 C372,480 372,430 334,410 Z'
    b.append(f'<path d="{R}" fill="#eef6fd" stroke="{BLUE}" stroke-width="3"/>')
    b.append(f'<path d="{Lp}" fill="#eef6fd" stroke="{BLUE}" stroke-width="3"/>')
    # fissures
    b.append(f'<line x1="40" y1="330" x2="200" y2="572" stroke="{DEEP}" stroke-width="3"/>')
    b.append(f'<line x1="60" y1="360" x2="234" y2="330" stroke="{RED}" stroke-width="3"/>')
    b.append(f'<line x1="518" y1="320" x2="370" y2="572" stroke="{DEEP}" stroke-width="3"/>')
    b.append(t(130, 250, '上葉', 22, DEEP, 'bold', 'middle')); b.append(t(160, 440, '中葉', 22, DEEP, 'bold', 'middle')); b.append(t(76, 500, '下葉', 20, DEEP, 'bold', 'middle'))
    b.append(t(440, 300, '上葉', 22, DEEP, 'bold', 'middle')); b.append(t(470, 520, '下葉', 20, DEEP, 'bold', 'middle'))
    b.append(t(92, 344, '水平裂', 15, RED, 'bold')); b.append(t(130, 548, '斜裂', 15, DEEP, 'bold', 'end'))
    b.append(t(430, 548, '斜裂', 15, DEEP, 'bold')); b.append(t(356, 400, '心切痕', 14, MUTED))
    # trachea & bronchi
    b.append(f'<rect x="266" y="40" width="28" height="134" rx="6" fill="#fff" stroke="{CYAN}" stroke-width="3"/>')
    for yy in range(52, 170, 16): b.append(f'<line x1="268" y1="{yy}" x2="292" y2="{yy}" stroke="{CYAN}" stroke-width="2"/>')
    b.append(f'<line x1="276" y1="172" x2="238" y2="250" stroke="{CYAN}" stroke-width="26" stroke-linecap="round"/>')
    b.append(f'<line x1="286" y1="172" x2="378" y2="252" stroke="{CYAN}" stroke-width="17" stroke-linecap="round"/>')
    b.append(t(304, 64, '気管', 16, DEEP, 'bold')); b.append(t(304, 170, '分岐：第4〜5胸椎', 14, MUTED))
    b.append(t(176, 206, '右主気管支', 14, DEEP, 'bold', 'end'))
    b.append(t(394, 262, '左主気管支', 14, DEEP, 'bold'))
    y = 604
    b.append(f'<rect x="20" y="{y}" width="255" height="112" rx="10" fill="{WASH}" stroke="{LINE}" stroke-width="2"/>')
    b.append(f'<rect x="285" y="{y}" width="255" height="112" rx="10" fill="{WASH}" stroke="{LINE}" stroke-width="2"/>')
    b.append(lines(34, y + 28, [('右肺', DEEP, 'bold'), '3葉・10区域', '斜裂＋水平裂', ('主気管支：太・短・垂直', RED, 'bold')], 16, 25))
    b.append(lines(299, y + 28, [('左肺', DEEP, 'bold'), '2葉・8〜9区域', '斜裂のみ・心切痕', '主気管支：細・長・水平寄り'], 16, 25))
    return S(W, H, b, '気管支と左右の肺の葉・裂の模式図')

# ============ 09 泌尿器 ============
def nephron():
    W, H = 560, 760
    b = []
    b.append(f'<rect x="20" y="20" width="520" height="220" rx="12" fill="#fbf3e4" stroke="#e0cfa8" stroke-width="2"/>')
    b.append(f'<rect x="20" y="240" width="520" height="260" rx="12" fill="#f6e2e2" stroke="#e4c2c2" stroke-width="2"/>')
    b.append(t(34, 48, '皮質', 19, '#8a6a2a', 'bold')); b.append(t(34, 272, '髄質（腎錐体）', 19, '#9c4a4a', 'bold'))
    # glomerulus + capsule
    b.append(f'<circle cx="120" cy="140" r="38" fill="#fff" stroke="{BLUE}" stroke-width="3"/>')
    for dx, dy in ((-10, -8), (8, -10), (-6, 9), (10, 7), (0, 0)):
        b.append(f'<circle cx="{120+dx}" cy="{140+dy}" r="9" fill="none" stroke="{RED}" stroke-width="3"/>')
    pct = [(158, 140), (172, 104), (190, 150), (208, 104), (226, 150), (244, 108), (262, 150), (262, 450)]
    b.append(pline(pct, BLUE, 5, False))
    b.append(f'<path d="M262,450 C262,490 312,490 312,450" fill="none" stroke="{BLUE}" stroke-width="5"/>')
    dct = [(312, 450), (312, 200), (330, 172), (348, 206), (366, 172), (384, 204), (402, 176), (430, 176)]
    b.append(pline(dct, BLUE, 5, False))
    b.append(f'<line x1="440" y1="60" x2="440" y2="520" stroke="{GRAY}" stroke-width="14" stroke-linecap="round"/>')
    b.append(f'<polygon points="410,500 470,500 440,540" fill="{GRAY}"/>')
    for x, y in ((287, 330), (287, 390)):
        b.append(f'<line x1="262" y1="{y}" x2="262" y2="{y+16}" stroke="{BLUE}" stroke-width="5" marker-end="url(#ahb)"/>')
    b.append(f'<line x1="312" y1="410" x2="312" y2="390" stroke="{BLUE}" stroke-width="5" marker-end="url(#ahb)"/>')
    b.append(f'<line x1="440" y1="300" x2="440" y2="330" stroke="#fff" stroke-width="4" marker-end="url(#ah)"/>')
    def num(x, y, n, c=DEEP):
        return f'<circle cx="{x}" cy="{y}" r="15" fill="{c}"/>' + t(x, y + 6, n, 17, '#fff', 'bold', 'middle')
    b.append(num(120, 76, '1')); b.append(num(215, 80, '2')); b.append(num(230, 470, '3')); b.append(num(360, 140, '4'))
    b.append(num(478, 120, '5', MUTED))
    b.append(t(440, 570, '腎乳頭 → 腎杯 → 腎盂 → 尿管', 17, MUTED, 'bold', 'middle'))
    y = 600
    rows = [('1', '腎小体＝糸球体＋ボーマン嚢：原尿をこし出す', DEEP), ('2', '近位尿細管（皮質）', DEEP), ('3', 'ヘンレのワナ（髄質へ下りて戻る）', DEEP),
            ('4', '遠位尿細管（皮質）', DEEP), ('5', '集合管（髄質）＝ネフロンに入らない', MUTED)]
    for i, (n, s, c) in enumerate(rows):
        b.append(num(34, y + i * 30 - 6, n, c)); b.append(t(58, y + i * 30, s, 16.5, INK))
    b.append(f'<path d="M548,582 h6 v120 h-6" fill="none" stroke="{BLUE}" stroke-width="2"/>')
    b.append(t(546, 752, 'ネフロン＝1〜4', 15, BLUE, 'bold', 'end'))
    return S(W, H, b, 'ネフロンの各部分と皮質・髄質の位置の模式図')

def kidney_capsule():
    W, H = 560, 520
    b = [t(20, 28, '腎臓を包む膜（内側から）', 17, MUTED)]
    cx, cy = 200, 250
    b.append(f'<ellipse cx="{cx}" cy="{cy}" rx="175" ry="215" fill="#f3f0fb" stroke="{PUR}" stroke-width="3" stroke-dasharray="10 5"/>')
    b.append(f'<ellipse cx="{cx}" cy="{cy+20}" rx="140" ry="175" fill="{YELP}" stroke="#d9b64a" stroke-width="2"/>')
    b.append(f'<path d="M{cx-70},{cy-110} C{cx-120},{cy-60} {cx-120},{cy+120} {cx-60},{cy+170} C{cx},{cy+200} {cx+60},{cy+150} {cx+40},{cy+80} C{cx+20},{cy+50} {cx+20},{cy+10} {cx+40},{cy-20} C{cx+70},{cy-80} {cx+10},{cy-150} {cx-70},{cy-110} Z" fill="#f2c7b8" stroke="#a24d3a" stroke-width="5"/>')
    b.append(t(cx - 40, cy + 40, '腎臓', 22, '#7a2d1f', 'bold', 'middle'))
    b.append(f'<path d="M{cx-60},{cy-150} C{cx-20},{cy-190} {cx+40},{cy-180} {cx+30},{cy-130} C{cx},{cy-120} {cx-40},{cy-125} {cx-60},{cy-150} Z" fill="#f7deb0" stroke="#b77a00" stroke-width="2.5"/>')
    b.append(t(cx - 10, cy - 196, '副腎', 16, '#7a4b00', 'bold', 'middle'))
    items = [(cx + 38, cy + 60, '① 線維被膜', '腎臓にぴったり付く', '#a24d3a', 110), (cx + 120, cy + 120, '② 脂肪被膜', 'クッションの脂肪', '#b78a00', 190),
             (cx + 165, cy - 60, '③ 腎筋膜', '副腎もいっしょに包む', PUR, 330)]
    for x1, y1, n, s, c, ly in items:
        b.append(leader(x1, y1, 390, ly, c)); b.append(t(394, ly - 4, n, 17, c, 'bold')); b.append(t(394, ly + 18, s, 14.5, INK))
    b.append(t(20, 490, '高さ：第12胸椎〜第3腰椎。右腎は肝臓があるので左より低い', 16, INK))
    return S(W, H, b, '腎臓の3つの被膜の模式図')

# ============ 10 生殖器 ============
def sperm_path():
    W, H = 560, 720
    b = []
    steps = [('精巣', '精細管で精子をつくる'), ('精巣上体', '精子をためて成熟させる'), ('精管', '精索の中を上がる（約40〜45cm）'),
             ('鼠径管', '浅鼠径輪 → 深鼠径輪（腹壁を通る）'), ('精管膨大部', '膀胱の後ろ'), ('射精管', '前立腺を貫く'), ('尿道', '前立腺部 → 外へ')]
    for i, (n, s) in enumerate(steps):
        y = 20 + i * 96
        hot = n in ('鼠径管', '射精管')
        b.append(box(20, y, 330, 66, n, s, fill=REDP if hot else PALE, stroke=RED if hot else BLUE, color='#9c1c26' if hot else DEEP, size=21, subsize=15))
        if i < 6: b.append(arr(185, y + 68, 185, y + 94, MUTED, 3))
    b.append(box(380, 404, 160, 80, '精嚢', '果糖・アルカリ性', fill=YELP, stroke=YEL, color='#7a4b00', size=20, subsize=14))
    b.append(box(380, 512, 160, 62, '前立腺', '乳白色の液', fill=YELP, stroke=YEL, color='#7a4b00', size=20, subsize=14))
    b.append(box(380, 594, 160, 62, '尿道球腺', 'アルカリ性の粘液', fill=YELP, stroke=YEL, color='#7a4b00', size=19, subsize=14))
    b.append(arr(378, 446, 356, 484, YEL, 2.5)); b.append(arr(378, 543, 356, 612, YEL, 2.5)); b.append(arr(378, 625, 356, 638, YEL, 2.5))
    b.append(t(460, 390, '液を足す腺', 15, '#7a4b00', 'bold', 'middle'))
    b.append(t(380, 60, '精子がたまる所：', 15, MUTED)); b.append(t(380, 82, '精巣上体・精管膨大部', 15, MUTED))
    b.append(t(380, 110, '（精嚢はためない）', 15, MUTED))
    return S(W, H, b, '精子の通り道（精路）と付属生殖腺の模式図')

def follicle():
    W, H = 560, 560
    b = [t(20, 28, '卵巣の中で卵胞が育つ順番', 17, MUTED)]
    def fol(cx, cy, r, layers, antrum=False):
        o = [f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#fdf1e4" stroke="#c7825a" stroke-width="2"/>']
        if antrum:
            o.append(f'<path d="M{cx - r*0.7},{cy + r*0.1} A{r*0.72},{r*0.72} 0 1 0 {cx + r*0.1},{cy - r*0.7}" fill="#dff0fb" stroke="none"/>')
        oc = max(9, r * 0.28)
        ox, oy = (cx - r * 0.35, cy - r * 0.35) if antrum else (cx, cy)
        o.append(f'<circle cx="{ox}" cy="{oy}" r="{oc}" fill="#fff" stroke="{RED}" stroke-width="2.5"/>')
        o.append(f'<circle cx="{ox}" cy="{oy}" r="3.5" fill="{RED}"/>')
        return ''.join(o)
    st = [('原始卵胞', '扁平な細胞1層', 16, False), ('一次卵胞', '立方〜円柱1層', 24, False), ('二次卵胞', '多層・卵胞腔', 38, True), ('成熟卵胞', 'グラーフ卵胞', 50, True)]
    xs = [60, 170, 300, 460]
    for (n, s, r, a), x in zip(st, xs):
        b.append(fol(x, 130, r, 1, a))
        b.append(t(x, 216, n, 18, DEEP, 'bold', 'middle')); b.append(t(x, 240, s, 14, MUTED, anchor='middle'))
    for x1, x2 in ((82, 140), (200, 256), (344, 404)):
        b.append(arr(x1, 130, x2, 130, MUTED, 2.5))
    b.append(arr(460, 256, 460, 300, MUTED, 3))
    b.append(box(330, 302, 210, 66, '排卵', '卵子が腹膜腔へ→卵管采', fill=REDP, stroke=RED, color='#9c1c26', size=21, subsize=14))
    b.append(arr(328, 335, 272, 335, MUTED, 3))
    b.append(box(40, 302, 230, 66, '黄体', 'プロゲステロンを出す', fill=YELP, stroke=YEL, color='#7a4b00', size=21, subsize=14))
    b.append(arr(155, 370, 155, 412, MUTED, 3))
    b.append(box(40, 414, 230, 58, '白体', '妊娠しなければ', fill='#f4f6f8', stroke=GRAY, color=MUTED, size=20, subsize=14))
    b.append(t(300, 440, '受精は卵管膨大部', 17, DEEP, 'bold'))
    b.append(t(20, 512, 'ほとんどの原始卵胞は育たずに退化する（閉鎖卵胞）', 16, INK))
    b.append(t(20, 540, '赤丸＝卵子（卵母細胞）　水色＝卵胞腔', 15, MUTED))
    return S(W, H, b, '卵胞の成熟から排卵・黄体・白体までの模式図')

# ============ 11 内分泌 ============
def pituitary():
    W, H = 560, 600
    b = []
    b.append(box(90, 20, 380, 64, '視床下部（間脳）', 'ホルモンの司令塔', fill=PURP, stroke=PUR, color=PUR, size=22, subsize=15))
    b.append(t(146, 126, '血管（下垂体門脈）', 15, RED, 'bold', 'end'))
    b.append(t(414, 126, '神経の軸索', 15, BLUE, 'bold'))
    b.append(f'<path d="M180,86 C180,110 150,130 150,160" fill="none" stroke="{RED}" stroke-width="4" marker-end="url(#ahr)"/>')
    b.append(f'<path d="M380,86 C380,110 410,130 410,160" fill="none" stroke="{BLUE}" stroke-width="4" marker-end="url(#ahb)"/>')
    b.append(f'<rect x="20" y="164" width="260" height="336" rx="14" fill="{REDP}" stroke="{RED}" stroke-width="2.5"/>')
    b.append(f'<rect x="300" y="164" width="240" height="336" rx="14" fill="{PALE}" stroke="{BLUE}" stroke-width="2.5"/>')
    b.append(t(150, 198, '前葉（腺下垂体）', 20, '#9c1c26', 'bold', 'middle'))
    b.append(t(420, 198, '後葉（神経下垂体）', 19, DEEP, 'bold', 'middle'))
    fr = ['成長ホルモン', 'プロラクチン', '甲状腺刺激ホルモン', '副腎皮質刺激ホルモン', '卵胞刺激ホルモン', '黄体形成ホルモン']
    b.append(lines(38, 236, fr, 17.5, 42))
    b.append(lines(316, 236, ['バソプレシン', '（抗利尿ホルモン）', 'オキシトシン'], 17.5, 42))
    b.append(t(316, 376, 'つくるのは視床下部、', 14.5, MUTED)); b.append(t(316, 398, '後葉は「出すだけ」', 14.5, MUTED))
    b.append(t(20, 536, '場所：蝶形骨のトルコ鞍の中', 17, INK, 'bold'))
    b.append(t(20, 566, '前葉＝ホルモン6つ　後葉＝2つ', 17, INK))
    return S(W, H, b, '下垂体の前葉と後葉のホルモンと視床下部とのつながりの模式図')

def adrenal():
    W, H = 560, 560
    b = [t(20, 28, '副腎の断面（外側から順に）', 17, MUTED)]
    layers = [('被膜', '#e9e2d4', 200), ('球状帯', '#fde2c4', 184), ('束状帯', '#fbd1a2', 150), ('網状帯', '#f5b97f', 116), ('髄質', '#e6d9f5', 80)]
    cx, cy = 190, 260
    for n, f, r in layers:
        b.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{r * 0.85:.0f}" ry="{r:.0f}" fill="{f}" stroke="#9a7a55" stroke-width="1.5"/>')
    rows = [('球状帯（外）', '鉱質コルチコイド', 'アルドステロン（塩）', 167, 66), ('束状帯（中）', '糖質コルチコイド', 'コルチゾール（糖）', 133, 146),
            ('網状帯（内）', '性ホルモン', 'アンドロゲン（性）', 98, 226), ('髄質', 'カテコールアミン', 'アドレナリンなど', 0, 360)]
    for i, (n, h1, h2, r, ly) in enumerate(rows):
        ty = cy - r if r else cy
        b.append(leader(cx, ty + (8 if r else 0), 330, ly, MUTED))
        b.append(t(334, ly - 6, n, 18, '#7a3b00' if r else PUR, 'bold'))
        b.append(t(334, ly + 16, h1, 14.5, INK)); b.append(t(334, ly + 36, h2, 14.5, MUTED))
    b.append(t(cx, cy + 6, '髄質', 18, PUR, 'bold', 'middle'))
    b.append(f'<path d="M22,{cy-200} v400" stroke="none"/>')
    b.append(t(20, 494, '皮質は外から「球・束・網」＝「塩・糖・性」', 18, DEEP, 'bold'))
    b.append(t(20, 522, '皮質＝中胚葉　髄質＝外胚葉（交感神経の仲間）', 16, INK))
    return S(W, H, b, '副腎の皮質3層と髄質のホルモンの模式図')

# ============ 12 中枢神経 ============
def cortex():
    W, H = 560, 650
    b = [t(20, 28, '左の大脳を横から見た図（模式）', 16, MUTED)]
    b.append(t(20, 150, '← 前', 17, BLUE, 'bold')); b.append(t(540, 150, '後ろ →', 17, BLUE, 'bold', 'end'))
    b.append('<g transform="translate(0,50)">')
    outline = 'M92,250 C88,140 190,72 300,72 C420,72 505,140 505,245 C505,300 478,332 440,342 C405,352 372,362 345,392 C318,418 262,416 226,396 C190,378 178,350 150,338 C112,322 94,296 92,250 Z'
    b.append(f'<clipPath id="br"><path d="{outline}"/></clipPath>')
    b.append(f'<path d="{outline}" fill="#fbf6ef"/>')
    b.append(f'<polygon clip-path="url(#br)" points="286,60 312,60 256,290 230,290" fill="#f7c6c9"/>')
    b.append(f'<polygon clip-path="url(#br)" points="312,60 340,60 284,290 256,290" fill="#cfe2f6"/>')
    b.append(f'<ellipse clip-path="url(#br)" cx="186" cy="292" rx="34" ry="22" fill="#f6d98f"/>')
    b.append(f'<ellipse clip-path="url(#br)" cx="296" cy="318" rx="30" ry="15" fill="#c9e7cf"/>')
    b.append(f'<ellipse clip-path="url(#br)" cx="372" cy="318" rx="34" ry="20" fill="#e3d6f5"/>')
    b.append(f'<ellipse clip-path="url(#br)" cx="505" cy="248" rx="44" ry="56" fill="#ffe0c2"/>')
    b.append(f'<path d="{outline}" fill="none" stroke="{DEEP}" stroke-width="3"/>')
    b.append(f'<line x1="312" y1="74" x2="256" y2="286" stroke="{DEEP}" stroke-width="3.5"/>')
    b.append(f'<path d="M168,318 C230,296 300,282 372,262" fill="none" stroke="{DEEP}" stroke-width="3.5"/>')
    for n, x, y in (('前頭葉', 170, 180), ('頭頂葉', 400, 150), ('後頭葉', 452, 300), ('側頭葉', 300, 372)):
        b.append(t(x, y, n, 18, '#8a7a66', 'bold', 'middle'))
    b.append(t(322, 104, '中心溝', 14, DEEP)); b.append(t(380, 262, '外側溝', 14, DEEP))
    b.append('</g>')
    labs = [((272, 200), (172, 96), (20, 76), '運動野', '中心前回（前頭葉）', RED),
            ((326, 170), (338, 106), (340, 76), '体性感覚野', '中心後回（頭頂葉）', BLUE),
            ((186, 350), (60, 508), (20, 530), '運動性言語野', 'ブローカ野（下前頭回）', '#9a6a00'),
            ((296, 370), (190, 580), (150, 600), '聴覚野', '横側頭回（側頭葉）', GRN),
            ((380, 372), (330, 508), (290, 530), '感覚性言語野', 'ウェルニッケ野（上側頭回の後部）', PUR),
            ((500, 280), (460, 580), (410, 600), '視覚野', '後頭葉（鳥距溝）', '#c0661c')]
    for (x1, y1), (x2, y2), (lx, ly), n, sub, c in labs:
        b.append(leader(x1, y1, x2, y2, c))
        b.append(t(lx, ly, n, 18, c, 'bold')); b.append(t(lx, ly + 22, sub, 14.5, INK))
    b.append(t(540, 28, '言語野はふつう左側', 14, MUTED, anchor='end'))
    return S(W, H, b, '大脳皮質の機能局在（運動野・感覚野・言語野など）の模式図')

def csf():
    W, H = 560, 720
    b = [t(20, 28, '脳脊髄液の流れ（1→10）', 17, MUTED)]
    L = [('脈絡叢でつくる', ''), ('側脳室', '前角は前頭葉に'), ('室間孔', ''), ('第三脳室', '間脳に囲まれる'), ('中脳水道', '中脳の中')]
    R = [('第四脳室', '橋・延髄と小脳の間'), ('正中口・外側口', 'ここから外へ'), ('クモ膜下腔', 'クモ膜と軟膜の間'), ('クモ膜顆粒', ''), ('硬膜静脈洞', '静脈血にもどる')]
    for col, items, x in ((0, L, 20), (1, R, 290)):
        for i, (n, s) in enumerate(items):
            y = 48 + i * 84
            k = col * 5 + i + 1
            b.append(box(x, y, 250, 60, n, s or None, fill=PALE if col == 0 else '#eef7fb', stroke=BLUE if col == 0 else CYAN, size=19, subsize=14))
            b.append(f'<circle cx="{x + 18}" cy="{y + 18}" r="12" fill="{DEEP}"/>' + t(x + 18, y + 23, str(k), 14, '#fff', 'bold', 'middle'))
            if i < 4: b.append(arr(x + 125, y + 62, x + 125, y + 82, MUTED, 2.5))
    b.append(pline([(145, 450), (145, 470), (272, 470), (272, 30), (415, 30), (415, 46)], MUTED, 2.5))
    # meninges
    y0 = 500
    b.append(t(20, y0, '髄膜（外から）', 18, DEEP, 'bold'))
    bands = [('頭蓋骨', BONE, '#7a5a1c'), ('硬膜', '#d9c6e8', PUR), ('クモ膜', '#e8e0f2', PUR), ('クモ膜下腔（髄液・太い動脈）', '#dff0fb', BLUE), ('軟膜（脳にぴったり）', '#f0e8f8', PUR), ('脳', '#fbf6ef', '#8a7a66')]
    for i, (n, f, c) in enumerate(bands):
        y = y0 + 14 + i * 33
        b.append(f'<rect x="20" y="{y}" width="520" height="31" fill="{f}" stroke="#ffffff" stroke-width="1"/>')
        b.append(t(36, y + 22, n, 16.5, c, 'bold'))
    return S(W, H, b, '脳脊髄液の流れと髄膜の層の模式図')

def spinal_cord():
    W, H = 560, 640
    b = [t(20, 28, '脊髄の輪切り（上が背中側・下がおなか側）', 16, MUTED)]
    cx, cy = 210, 250
    b.append(f'<ellipse cx="{cx}" cy="{cy}" rx="150" ry="112" fill="#fdfbf4" stroke="{DEEP}" stroke-width="3"/>')
    half = [(0, -30), (22, -38), (36, -104), (52, -100), (46, -28), (86, -6), (86, 16), (48, 20), (98, 56), (92, 92), (40, 96), (14, 40), (0, 36)]
    pts = [(cx + x, cy + y) for x, y in half] + [(cx - x, cy + y) for x, y in reversed(half)]
    b.append(f'<polygon points="{" ".join(f"{x},{y}" for x, y in pts)}" fill="#c9ced8" stroke="#7b8494" stroke-width="2"/>')
    b.append(f'<circle cx="{cx}" cy="{cy + 2}" r="5" fill="#fff" stroke="#7b8494"/>')
    b.append(f'<polygon points="{cx+86},{cy-6} {cx+86},{cy+16} {cx+46},{cy+20} {cx+46},{cy-28}" fill="#f2b8bd"/>')
    b.append(f'<polygon points="{cx+48},{cy+20} {cx+98},{cy+56} {cx+92},{cy+92} {cx+40},{cy+96} {cx+14},{cy+40}" fill="#f7d7a6"/>')
    b.append(f'<polygon points="{cx+22},{cy-38} {cx+36},{cy-104} {cx+52},{cy-100} {cx+46},{cy-28}" fill="#bcd7f2"/>')
    # roots (right side)
    b.append(f'<path d="M{cx+48},{cy-98} C{cx+110},{cy-140} {cx+170},{cy-110} {cx+200},{cy-80}" fill="none" stroke="{BLUE}" stroke-width="7"/>')
    b.append(f'<ellipse cx="{cx+222}" cy="{cy-62}" rx="30" ry="20" fill="#bcd7f2" stroke="{BLUE}" stroke-width="2.5"/>')
    b.append(f'<path d="M{cx+95},{cy+78} C{cx+160},{cy+90} {cx+220},{cy+40} {cx+262},{cy}" fill="none" stroke="#c0661c" stroke-width="7"/>')
    b.append(f'<path d="M{cx+246},{cy-48} C{cx+262},{cy-30} {cx+262},{cy-10} {cx+262},{cy}" fill="none" stroke="{BLUE}" stroke-width="7"/>')
    b.append(f'<line x1="{cx+262}" y1="{cy}" x2="{cx+330}" y2="{cy+30}" stroke="{PUR}" stroke-width="10" stroke-linecap="round"/>')
    b.append(arr(cx + 150, cy - 118, cx + 100, cy - 128, BLUE, 2.5))
    b.append(arr(cx + 150, cy + 96, cx + 200, cy + 80, '#c0661c', 2.5))
    def num(x, y, n, c):
        return f'<circle cx="{x}" cy="{y}" r="14" fill="{c}"/>' + t(x, y + 6, n, 16, '#fff', 'bold', 'middle')
    b.append(num(cx + 68, cy + 70, '1', '#c0661c')); b.append(num(cx + 42, cy - 70, '2', BLUE)); b.append(num(cx + 110, cy + 4, '3', RED))
    b.append(num(cx + 130, cy - 150, '4', BLUE)); b.append(num(cx + 222, cy - 100, '5', BLUE)); b.append(num(cx + 190, cy + 104, '6', '#c0661c'))
    b.append(num(cx, cy - 80, '7', MUTED)); b.append(num(cx + 330, cy + 60, '8', PUR))
    rows = [('1', '前角：運動神経細胞（骨格筋へ）', '#c0661c'), ('2', '後角：感覚を中継する', BLUE), ('3', '側角：交感神経の節前細胞（T1〜L2だけ）', RED),
            ('4', '後根：感覚が入る（求心性）', BLUE), ('5', '脊髄神経節：後根の途中（椎間孔の中）', BLUE), ('6', '前根：運動・自律が出る（遠心性）', '#c0661c'),
            ('7', '後索：深部感覚・細かい触覚が上る', MUTED), ('8', '脊髄神経（前根＋後根）', PUR)]
    for i, (n, s, c) in enumerate(rows):
        y = 400 + i * 29
        b.append(num(34, y - 6, n, c)); b.append(t(58, y, s, 16, INK))
    return S(W, H, b, '脊髄の断面（前角・後角・側角と前根・後根）の模式図')

def pathways():
    W, H = 560, 640
    b = []
    levels = [('大脳皮質', 110), ('視床', 170), ('中脳', 230), ('橋', 290), ('延髄', 360), ('脊髄', 450)]
    for n, y in levels:
        b.append(f'<line x1="100" y1="{y}" x2="545" y2="{y}" stroke="{LINE}" stroke-width="1.5"/>')
        b.append(t(92, y + 6, n, 16, MUTED, 'bold', 'end'))
    cols = [(190, '錐体路', '運動（下り）', RED), (330, '後索路', '深部感覚・細かい触覚', BLUE), (470, '脊髄視床路', '温度覚・痛覚', GRN)]
    for x, n, s, c in cols:
        b.append(t(x, 34, n, 19, c, 'bold', 'middle')); b.append(t(x, 58, s, 13.5, INK, anchor='middle'))
        b.append(f'<line x1="{x}" y1="80" x2="{x}" y2="500" stroke="{GRAY}" stroke-width="1.5" stroke-dasharray="4 5"/>')
    # 錐体路: left side from cortex down, cross at lower medulla, then right side down
    x = 190
    b.append(f'<polyline points="{x-30},96 {x-30},380 {x+30},404 {x+30},520" fill="none" stroke="{RED}" stroke-width="5" marker-end="url(#ahr)"/>')
    b.append(f'<circle cx="{x}" cy="392" r="10" fill="none" stroke="{RED}" stroke-width="3"/>')
    b.append(t(x - 32, 412, '延髄下部で交叉', 13.5, RED, 'bold', 'end') if False else '')
    # 後索路: enters right at spinal cord, up same side, crosses in medulla, up to thalamus -> cortex
    x = 330
    b.append(f'<polyline points="{x+30},530 {x+30},370 {x-30},346 {x-30},100" fill="none" stroke="{BLUE}" stroke-width="5" marker-end="url(#ahb)"/>')
    b.append(f'<circle cx="{x}" cy="358" r="10" fill="none" stroke="{BLUE}" stroke-width="3"/>')
    # 脊髄視床路: enters right, crosses in cord immediately
    x = 470
    b.append(f'<polyline points="{x+30},530 {x+30},486 {x-30},462 {x-30},100" fill="none" stroke="{GRN}" stroke-width="5" marker-end="url(#ahb)"/>')
    b.append(f'<circle cx="{x}" cy="474" r="10" fill="none" stroke="{GRN}" stroke-width="3"/>')
    for x, c in ((330, BLUE), (470, GRN)):
        b.append(f'<rect x="{x-44}" y="160" width="28" height="20" rx="4" fill="{c}"/>')
    b.append(t(20, 568, '○＝交叉する所', 16, INK, 'bold'))
    b.append(t(20, 594, '錐体路＝延髄の下部　後索路＝延髄　温痛覚＝脊髄', 16, INK))
    b.append(t(20, 620, '感覚はどれも視床（■）で中継されて大脳皮質へ', 15, MUTED))
    return S(W, H, b, '錐体路と感覚の伝導路が交叉する高さの模式図')

# ============ 13 末梢神経 ============
def brachial():
    W, H = 560, 700
    b = [t(20, 28, '右の上腕骨を前から見た図（模式）', 16, MUTED)]
    b.append(t(20, 56, '← 外側', 16, MUTED)); b.append(t(290, 56, '内側 →', 16, MUTED, anchor='end'))
    bone = 'M150,150 C140,120 150,82 190,72 C230,64 262,92 256,128 C252,150 232,160 210,166 L204,480 C230,490 262,500 270,518 C250,532 225,528 205,530 L150,530 C132,528 118,524 108,516 C116,500 136,490 152,482 Z'
    b.append(f'<path d="{bone}" fill="{BONE}" stroke="#b9a37a" stroke-width="2.5"/>')
    b.append(t(200, 118, '上腕骨', 17, '#7a5a1c', 'bold', 'middle'))
    b.append(t(152, 190, '外科頸', 13, '#7a5a1c', anchor='end'))
    b.append(t(246, 552, '内側上顆', 13, '#7a5a1c', anchor='end'))
    O, G, P = '#d9730d', GRN, PUR
    b.append(f'<path d="M285,146 C272,160 262,166 250,170" fill="none" stroke="{O}" stroke-width="6"/>')
    b.append(f'<path d="M250,170 C220,182 190,184 170,178 C148,170 130,158 120,140" fill="none" stroke="{O}" stroke-width="6" stroke-dasharray="8 5"/>')
    b.append(f'<path d="M275,200 C250,220 215,240 200,250" fill="none" stroke="{G}" stroke-width="6"/>')
    b.append(f'<path d="M200,250 L156,410" fill="none" stroke="{G}" stroke-width="6" stroke-dasharray="8 5"/>')
    b.append(f'<path d="M156,410 C140,440 126,480 124,560" fill="none" stroke="{G}" stroke-width="6"/>')
    b.append(f'<path d="M282,210 C278,300 264,420 262,496" fill="none" stroke="{P}" stroke-width="6"/>')
    b.append(f'<path d="M262,496 C262,510 258,522 254,534" fill="none" stroke="{P}" stroke-width="6" stroke-dasharray="6 4"/>')
    b.append(f'<path d="M254,534 C252,560 256,590 262,620" fill="none" stroke="{P}" stroke-width="6"/>')
    b.append(t(20, 640, '点線＝骨の後ろを通る所（骨折でいたみやすい）', 15, MUTED))
    labs = [(125, 142, '腋窩神経', '外科頸の後ろを回る', '→ 三角筋・小円筋', O, 110),
            (175, 330, '橈骨神経', '骨体の後ろ（橈骨神経溝）', '→ 上腕・前腕の伸筋', G, 250),
            (260, 520, '尺骨神経', '内側上顆の後ろ', '→ 手の内在筋の多く', P, 390)]
    for x1, y1, n, s1, s2, c, ly in labs:
        b.append(leader(x1, y1, 310, ly - 6, c))
        b.append(t(314, ly, n, 20, c, 'bold')); b.append(t(314, ly + 24, s1, 15, INK)); b.append(t(314, ly + 46, s2, 15, MUTED))
    b.append(f'<rect x="306" y="500" width="240" height="118" rx="10" fill="{WASH}" stroke="{LINE}" stroke-width="2"/>')
    b.append(lines(318, 526, [('筋皮神経', DEEP, 'bold'), '烏口腕筋を貫く→上腕の屈筋', ('正中神経', DEEP, 'bold'), '肘窩→前腕屈筋の大部分・母指球'], 14.5, 25))
    return S(W, H, b, '腕神経叢の主な枝と上腕骨との位置関係の模式図')

def cranial_nerves():
    W, H = 560, 560
    b = []
    data = [('Ⅰ', '嗅神経', '嗅覚', 'S', 0), ('Ⅱ', '視神経', '視覚', 'S', 0), ('Ⅲ', '動眼神経', '眼球運動・縮瞳', 'M', 1),
            ('Ⅳ', '滑車神経', '上斜筋', 'M', 0), ('Ⅴ', '三叉神経', '顔の感覚・咀嚼筋', 'X', 0), ('Ⅵ', '外転神経', '外側直筋', 'M', 0),
            ('Ⅶ', '顔面神経', '表情筋・味覚前2/3', 'X', 1), ('Ⅷ', '内耳神経', '聴覚・平衡覚', 'S', 0), ('Ⅸ', '舌咽神経', '味覚後1/3・耳下腺', 'X', 1),
            ('Ⅹ', '迷走神経', '喉頭の筋・内臓', 'X', 1), ('Ⅺ', '副神経', '胸鎖乳突筋・僧帽筋', 'M', 0), ('Ⅻ', '舌下神経', '舌を動かす', 'M', 0)]
    C = {'S': (BLUE, BLUEP), 'M': (GRN, GRNP), 'X': (PUR, PURP)}
    for i, (r, n, f, k, ps) in enumerate(data):
        x = 12 + (i % 3) * 182; y = 12 + (i // 3) * 112
        c, fill = C[k]
        b.append(f'<rect x="{x}" y="{y}" width="172" height="102" rx="10" fill="{fill}" stroke="{c}" stroke-width="2"/>')
        b.append(t(x + 12, y + 32, r, 22, c, 'bold')); b.append(t(x + 44, y + 31, n, 19, DEEP, 'bold'))
        b.append(t(x + 12, y + 68, f, 14.5 if len(f) > 9 else 15.5, INK))
        if ps:
            b.append(pill(x + 146, y + 88, '副', RED, 13))
    y = 470
    for i, (k, lab) in enumerate((('S', '感覚だけ'), ('M', '運動（だけ）'), ('X', '運動＋感覚'))):
        c, fill = C[k]; x = 12 + i * 150
        b.append(f'<rect x="{x}" y="{y}" width="26" height="20" rx="4" fill="{fill}" stroke="{c}" stroke-width="2"/>')
        b.append(t(x + 34, y + 16, lab, 15, INK))
    b.append(pill(26, y + 50, '副', RED, 13)); b.append(t(46, y + 56, '副交感神経を含む＝Ⅲ・Ⅶ・Ⅸ・Ⅹ（4つ）', 15, INK))
    return S(W, H, b, '脳神経12対の名前と主な働きの一覧図')

def autonomic():
    W, H = 560, 620
    b = [t(20, 28, '節前ニューロンがどこから出るか', 17, MUTED)]
    segs = [('脳幹', 'Ⅲ・Ⅶ・Ⅸ・Ⅹ', 60, 70, GRN), ('頸髄', 'C1〜C8', 130, 80, None), ('胸髄', 'T1〜T12', 210, 140, RED),
            ('腰髄', 'L1〜L5', 350, 70, None), ('仙髄', 'S1〜S5', 420, 60, None)]
    for n, sub, y, h, c in segs:
        b.append(f'<rect x="40" y="{y}" width="110" height="{h}" rx="8" fill="#f4f6f8" stroke="{GRAY}" stroke-width="1.5"/>')
        b.append(t(95, y + h/2 + 2, n, 18, DEEP, 'bold', 'middle')); b.append(t(95, y + h/2 + 22, sub, 13, MUTED, anchor='middle'))
    b.append(f'<rect x="162" y="210" width="16" height="175" rx="4" fill="{RED}"/>')
    b.append(t(186, 290, '交感神経', 20, RED, 'bold')); b.append(t(186, 314, 'T1〜L2（胸腰系）', 15, RED))
    b.append(f'<rect x="162" y="60" width="16" height="70" rx="4" fill="{GRN}"/>')
    b.append(f'<rect x="162" y="434" width="16" height="34" rx="4" fill="{GRN}"/>')
    b.append(t(186, 90, '副交感神経', 20, GRN, 'bold')); b.append(t(186, 114, '脳幹（頭）', 15, GRN))
    b.append(t(186, 450, '副交感神経', 20, GRN, 'bold')); b.append(t(186, 474, 'S2〜S4（仙）', 15, GRN))
    b.append(t(318, 56, '比べると', 17, DEEP, 'bold'))
    rows = [('神経節', '交感神経幹など', '臓器の近く'), ('代表', '内臓神経', '迷走神経'), ('', '', '骨盤内臓神経'), ('瞳孔', '散大', '縮小')]
    b.append(t(418, 84, '交感', 15, RED, 'bold', 'middle')); b.append(t(505, 84, '副交感', 15, GRN, 'bold', 'middle'))
    for i, (a, s_, p) in enumerate(rows):
        y = 112 + i * 30
        b.append(t(318, y, a, 14, MUTED, 'bold')); b.append(t(418, y, s_, 13, INK, anchor='middle')); b.append(t(505, y, p, 13, INK, anchor='middle'))
    b.append(t(20, 530, '副交感＝「頭と仙骨」（頭仙系）', 18, GRN, 'bold'))
    b.append(t(20, 560, '交感＝「胸と腰」（胸腰系）＝脊髄の側角から出る', 18, RED, 'bold'))
    b.append(t(20, 592, '頸髄と L3〜S1 からは、自律神経の節前線維は出ない', 14.5, MUTED))
    return S(W, H, b, '交感神経と副交感神経が出る場所の模式図')

# ============ 14 感覚器 ============
def eye():
    W, H = 560, 720
    b = [t(20, 28, '右眼を上から見た断面（模式）　上が前', 16, MUTED)]
    cx, cy, r = 280, 280, 150
    def P(rr, deg):
        a = math.radians(deg); return (cx + rr * math.sin(a), cy - rr * math.cos(a))
    A, B_ = P(r, -34), P(r, 34)
    b.append(f'<circle cx="{cx}" cy="{cy}" r="{r-4}" fill="#f7fbff"/>')
    # retina / choroid arcs
    for rr, col, wdt, a0 in ((r - 16, '#e8904a', 6, 46), (r - 8, '#8a5a3c', 6, 40)):
        p0, p1 = P(rr, a0), P(rr, -a0)
        b.append(f'<path d="M{p0[0]:.1f},{p0[1]:.1f} A{rr},{rr} 0 1 1 {p1[0]:.1f},{p1[1]:.1f}" fill="none" stroke="{col}" stroke-width="{wdt}"/>')
    b.append(f'<path d="M{B_[0]:.1f},{B_[1]:.1f} A{r},{r} 0 1 1 {A[0]:.1f},{A[1]:.1f}" fill="none" stroke="#8d9aa8" stroke-width="9"/>')
    b.append(f'<path d="M{A[0]:.1f},{A[1]:.1f} A96,96 0 0 1 {B_[0]:.1f},{B_[1]:.1f}" fill="#eaf6fd" fill-opacity=".6" stroke="{CYAN}" stroke-width="5"/>')
    # ciliary body, iris, lens
    for sgn in (-1, 1):
        x0 = cx + sgn * 104
        b.append(f'<polygon points="{x0:.0f},{cy-110} {x0 - sgn*26:.0f},{cy-118} {x0 - sgn*4:.0f},{cy-80}" fill="#b56a48"/>')
        b.append(f'<line x1="{x0 - sgn*20:.0f}" y1="{cy-118}" x2="{cx + sgn*26}" y2="{cy-118}" stroke="#6a4fb3" stroke-width="7" stroke-linecap="round"/>')
    b.append(f'<ellipse cx="{cx}" cy="{cy-96}" rx="58" ry="22" fill="#fff" stroke="{BLUE}" stroke-width="3"/>')
    # fovea & optic nerve
    fx, fy = P(r - 16, 180)
    b.append(f'<circle cx="{fx:.0f}" cy="{fy:.0f}" r="7" fill="{RED}"/>')
    ox, oy = P(r, 200)
    b.append(f'<path d="M{ox-16:.0f},{oy-10:.0f} L{ox-22:.0f},{oy+80:.0f} L{ox+18:.0f},{oy+80:.0f} L{ox+16:.0f},{oy-6:.0f} Z" fill="#fde9b0" stroke="#b77a00" stroke-width="2.5"/>')
    b.append(f'<line x1="{cx}" y1="60" x2="{fx:.0f}" y2="{fy-10:.0f}" stroke="{RED}" stroke-width="2.5" stroke-dasharray="7 5" marker-end="url(#ahr)"/>')
    b.append(t(cx + 8, 58, '光', 16, RED, 'bold'))
    b.append(t(cx, cy + 40, '硝子体', 20, '#5a7a96', 'bold', 'middle'))
    L = [((cx - 60, 150), (22, 110), '角膜', CYAN), ((cx - 60, cy - 118), (22, 180), '虹彩', PUR), ((cx - 112, cy - 100), (22, 240), '毛様体', '#b56a48'),
         ((P(r, -80)), (22, 330), '強膜', '#6f7d8b'), ((ox - 6, oy + 50), (22, 470), '視神経（乳頭＝盲点）', '#9a6a00')]
    R_ = [((cx + 10, 170), (430, 110), '眼房', CYAN), ((cx + 50, cy - 96), (430, 190), '水晶体', BLUE), ((P(r - 8, 75)), (430, 280), '脈絡膜', '#8a5a3c'),
          ((P(r - 16, 110)), (430, 350), '網膜', '#d9731d'), ((fx + 6, fy), (430, 450), '黄斑（中心窩）', RED)]
    for (x1, y1), (lx, ly), n, c in L:
        b.append(leader(x1, y1, lx + tw(n, 17) + 4 if lx < cx else lx - 4, ly - 6, c)); b.append(t(lx, ly, n, 17, c, 'bold'))
    for (x1, y1), (lx, ly), n, c in R_:
        b.append(leader(x1, y1, lx - 4, ly - 6, c)); b.append(t(lx, ly, n, 17, c, 'bold'))
    y = 550
    b.append(t(20, y, '光の通り道：角膜→眼房→瞳孔→水晶体→硝子体→網膜', 16.5, RED, 'bold'))
    b.append(lines(20, y + 34, [('外膜：角膜・強膜', '#6f7d8b', 'bold'), ('中膜（ぶどう膜）：虹彩・毛様体・脈絡膜', '#8a5a3c', 'bold'), ('内膜：網膜', '#d9731d', 'bold')], 16, 28))
    b.append(t(20, y + 150, '視神経乳頭は黄斑より鼻側。視細胞がないので盲点', 15, MUTED))
    return S(W, H, b, '眼球の構造と光の通り道の模式図')

def ear():
    W, H = 560, 640
    b = []
    cols = [(20, 150, '外耳', '#fdf1e4', '#c7825a'), (180, 170, '中耳', '#eef6fd', BLUE), (360, 180, '内耳', '#f3effb', PUR)]
    for x, w, n, f, c in cols:
        b.append(f'<rect x="{x}" y="20" width="{w}" height="460" rx="12" fill="{f}" stroke="{c}" stroke-width="2"/>')
        b.append(t(x + w/2, 50, n, 21, c, 'bold', 'middle'))
    def bx(x, y, w, n, s=None, c=DEEP, h=None):
        return box(x, y, w, h or (54 if s else 44), n, s, fill='#fff', stroke=c, color=c, size=17, subsize=13, subcolor=MUTED)
    b.append(bx(32, 72, 126, '耳介', c='#8a4a22')); b.append(bx(32, 146, 126, '外耳道', c='#8a4a22'))
    b.append(arr(95, 118, 95, 144, MUTED, 2.5))
    mids = ['鼓膜', 'ツチ骨', 'キヌタ骨', 'アブミ骨']
    for i, n in enumerate(mids):
        b.append(bx(192, 72 + i * 70, 146, n, c=BLUE))
        if i < 3: b.append(arr(265, 118 + i * 70, 265, 140 + i * 70, MUTED, 2.5))
    b.append(pline([(158, 168), (175, 168), (175, 94), (190, 94)], MUTED, 2.5))
    b.append(t(265, 350, '耳小骨', 14, BLUE, anchor='middle'))
    b.append(box(192, 400, 146, 60, '耳管', '咽頭（上咽頭）へ', fill='#fff', stroke=MUTED, color=MUTED, size=17, subsize=13))
    b.append(t(265, 392, '↓', 16, MUTED, anchor='middle'))
    b.append(bx(372, 72, 156, '前庭窓', c=PUR))
    b.append(bx(372, 142, 156, '蝸牛', 'ラセン器（コルチ器）', c=PUR))
    b.append(bx(372, 222, 156, '蝸牛神経', '→ 聴覚野', c=PUR))
    b.append(pline([(338, 304), (355, 304), (355, 94), (370, 94)], MUTED, 2.5))
    b.append(arr(450, 118, 450, 140, MUTED, 2.5)); b.append(arr(450, 198, 450, 220, MUTED, 2.5))
    b.append(f'<line x1="372" y1="296" x2="528" y2="296" stroke="{PUR}" stroke-width="1" stroke-dasharray="4 4"/>')
    b.append(t(450, 322, '平衡覚（前庭器）', 15, PUR, 'bold', 'middle'))
    b.append(box(372, 334, 156, 62, '前庭', '平衡斑：傾き・直線', fill='#fff', stroke=GRN, color=GRN, size=17, subsize=13))
    b.append(box(372, 406, 156, 62, '半規管', '膨大部稜：回転', fill='#fff', stroke=GRN, color=GRN, size=17, subsize=13))
    b.append(t(20, 520, '音の道：外耳道→鼓膜→ツチ→キヌタ→アブミ→前庭窓→蝸牛', 16, INK, 'bold'))
    b.append(t(20, 550, '耳小骨は外から「ツチ・キヌタ・アブミ」', 16, INK))
    b.append(t(20, 580, '耳管は中耳と咽頭をつなぐ（気圧をそろえる）', 16, INK))
    b.append(t(20, 610, '平衡斑は前庭（卵形嚢・球形嚢）、膨大部稜は半規管', 15, MUTED))
    return S(W, H, b, '耳の構造（外耳・中耳・内耳）と音の伝わる順の模式図')

def skin():
    W, H = 560, 640
    b = [t(20, 28, '皮膚の断面（模式）', 16, MUTED)]
    X0, X1 = 20, 330
    ep = [('角質層', '#f2e6d0', 20), ('淡明層', '#f8f0e0', 10), ('顆粒層', '#f0dcc0', 18), ('有棘層', '#f6e7d4', 44), ('基底層', '#e8c9a4', 16)]
    y = 50
    for n, f, h in ep:
        b.append(f'<rect x="{X0}" y="{y}" width="{X1-X0}" height="{h}" fill="{f}"/>')
        y += h
    yb = y
    b.append(f'<rect x="{X0}" y="{yb}" width="{X1-X0}" height="200" fill="#fbe3e3"/>')
    b.append(f'<rect x="{X0}" y="{yb+200}" width="{X1-X0}" height="150" fill="#fff6cf"/>')
    for i in range(5):
        cxp = X0 + 30 + i * 62
        b.append(f'<path d="M{cxp-22},{yb} Q{cxp},{yb-26} {cxp+22},{yb}" fill="#fbe3e3" stroke="none"/>')
    b.append(f'<path d="M{X0},{yb} ' + ' '.join(f'L{X0 + 8 + i*62},{yb} Q{X0+30+i*62},{yb-26} {X0+52+i*62},{yb}' for i in range(5)) + f' L{X1},{yb}" fill="none" stroke="#b98a6a" stroke-width="2"/>')
    for i in range(6):
        b.append(f'<circle cx="{X0+45+i*50}" cy="{yb+250 + (i%2)*40}" r="18" fill="#fff" stroke="#e0c060" stroke-width="1.5"/>')
    # receptors
    b.append(f'<ellipse cx="{X0+92}" cy="{yb-4}" rx="7" ry="11" fill="#fff" stroke="{BLUE}" stroke-width="2.5"/>')
    b.append(f'<rect x="{X0+146}" y="{yb-12}" width="18" height="6" rx="2" fill="{PUR}"/>')
    b.append(f'<path d="M{X0+230},{yb+60} L{X0+230},{yb-8} M{X0+230},{yb-8} L{X0+222},{yb-40} M{X0+230},{yb-8} L{X0+240},{yb-38}" stroke="{RED}" stroke-width="2.5" fill="none"/>')
    for rr in (22, 16, 10, 4):
        b.append(f'<ellipse cx="{X0+170}" cy="{yb+215}" rx="{rr+6}" ry="{rr+14}" fill="none" stroke="{GRN}" stroke-width="2"/>')
    b.append(f'<path d="M{X0+60},{yb+150} q10,-10 20,0 q10,10 0,20 q-10,10 -20,0 q-10,-10 0,-20 M{X0+70},{yb+150} L{X0+70},{50}" fill="none" stroke="{CYAN}" stroke-width="2.5"/>')
    b.append(t(X0 + 70, yb + 196, '汗腺', 14, CYAN, 'bold', 'middle'))
    ly = [60, 84, 108, 136, 166]
    ys = [60, 75, 89, 120, yb - 8]
    for (n, f, h), l, yy in zip(ep, ly, ys):
        b.append(f'<line x1="{X1}" y1="{yy}" x2="{X1+18}" y2="{l-5}" stroke="{MUTED}" stroke-width="1.5"/>')
        b.append(t(X1 + 22, l, n, 15, '#7a5a1c', 'bold'))
    b.append(t(X1 + 120, 60, '← 一番外', 13, MUTED)); b.append(t(X1 + 120, 166, '← 細胞が増える', 13, MUTED))
    b.append(t(542, 150, '表皮', 17, '#7a5a1c', 'bold', 'end') if False else '')
    b.append(t(X0 + 6, yb + 120, '真皮', 18, '#a24d4d', 'bold'))
    b.append(t(X0 + 6, yb + 340, '皮下組織（脂肪）', 16, '#8a6a00', 'bold'))
    b.append(t(X0 + 6, 46, '表皮', 16, '#7a5a1c', 'bold'))
    rows = [('マイスナー小体', '真皮乳頭・触覚', BLUE, 230), ('メルケル盤', '表皮の基底層・触覚', PUR, 290), ('自由神経終末', '痛覚・温度覚', RED, 350), ('パチニ小体', '真皮深層〜皮下・振動や圧', GRN, 410)]
    pts = [(X0 + 99, yb - 4), (X0 + 164, yb - 9), (X0 + 236, yb + 30), (X0 + 196, yb + 215)]
    for (n, s, c, yy), (px, py) in zip(rows, pts):
        b.append(leader(px, py, 344, yy - 6, c)); b.append(t(348, yy, n, 16.5, c, 'bold')); b.append(t(348, yy + 20, s, 13.5, INK))
    b.append(t(20, 580, '表皮は深い方から 基底層→有棘層→顆粒層→（淡明層）→角質層', 15.5, INK, 'bold'))
    b.append(t(20, 608, '淡明層は手のひら・足の裏など厚い皮膚だけ', 14.5, MUTED))
    return S(W, H, b, '皮膚の層と感覚受容器の模式図')

# ============ 15 体表 ============
def pulse():
    W, H = 560, 720
    b = [t(20, 28, '拍動を触れる所（前から見た図・模式）', 16, MUTED)]
    body_c = '#eef3f8'; st = '#9fb3c8'
    b.append(f'<circle cx="280" cy="92" r="46" fill="{body_c}" stroke="{st}" stroke-width="2.5"/>')
    b.append(f'<rect x="262" y="136" width="36" height="30" fill="{body_c}" stroke="{st}" stroke-width="2.5"/>')
    b.append(f'<path d="M210,170 L350,170 L340,380 L220,380 Z" fill="{body_c}" stroke="{st}" stroke-width="2.5"/>')
    b.append(f'<path d="M210,172 L168,290 L150,390" fill="none" stroke="{st}" stroke-width="26" stroke-linecap="round"/>')
    b.append(f'<path d="M350,172 L392,290 L410,390" fill="none" stroke="{st}" stroke-width="26" stroke-linecap="round"/>')
    b.append(f'<path d="M210,172 L168,290 L150,390" fill="none" stroke="{body_c}" stroke-width="21" stroke-linecap="round"/>')
    b.append(f'<path d="M350,172 L392,290 L410,390" fill="none" stroke="{body_c}" stroke-width="21" stroke-linecap="round"/>')
    for x0, x1 in ((248, 236), (312, 324)):
        b.append(f'<path d="M{x0},378 L{x1},540 L{x1 + (4 if x0 < 280 else -4)},650" fill="none" stroke="{st}" stroke-width="34" stroke-linecap="round"/>')
        b.append(f'<path d="M{x0},378 L{x1},540 L{x1 + (4 if x0 < 280 else -4)},650" fill="none" stroke="{body_c}" stroke-width="29" stroke-linecap="round"/>')
    b.append(f'<path d="M318,652 L350,660" stroke="{st}" stroke-width="16" stroke-linecap="round"/>')
    b.append(f'<path d="M242,652 L210,660" stroke="{st}" stroke-width="16" stroke-linecap="round"/>')
    pts = [((240, 96), (20, 80), '浅側頭動脈', '耳の前'), ((258, 124), (20, 132), '顔面動脈', '下あごの縁'),
           ((268, 152), (20, 184), '総頸動脈', '首の横'), ((232, 176), (20, 236), '鎖骨下動脈', '鎖骨の上のくぼみ'),
           ((238, 470), (20, 470), '大腿動脈', '鼠径部（大腿三角）'), ((240, 560), (20, 540), '膝窩動脈', 'ひざの裏'),
           ((252, 638), (20, 620), '後脛骨動脈', '内くるぶしの後ろ')]
    ptsR = [((370, 214), (430, 170), '腋窩動脈', 'わきの下'), ((386, 268), (430, 230), '上腕動脈', '上腕の内側'),
            ((417, 384), (430, 330), '橈骨動脈', '手首・親指側'), ((401, 386), (430, 380), '尺骨動脈', '手首・小指側'), ((340, 658), (430, 640), '足背動脈', '足の甲')]
    for (px, py), (lx, ly), n, s in pts + ptsR:
        left = lx < 280
        b.append(f'<line x1="{px}" y1="{py}" x2="{lx + 118 if left else lx - 4}" y2="{ly - 6}" stroke="{RED}" stroke-width="1.5"/>')
        b.append(f'<circle cx="{px}" cy="{py}" r="6" fill="{RED}"/>')
        b.append(t(lx, ly, n, 16, '#9c1c26', 'bold')); b.append(t(lx, ly + 19, s, 13, INK))
    b.append(t(20, 700, '触れない：椎骨動脈（横突孔の中）・外腸骨動脈・腕頭動脈など', 14.5, MUTED))
    return S(W, H, b, '拍動を触れる動脈の位置の模式図')

FIGS2 = {n: globals()[n] for n in [
    'rotator_cuff', 'carpals', 'femoral_triangle', 'leg_compartments', 'foot_bones',
    'heart_flow', 'conduction', 'aorta', 'fetal', 'duodenum', 'bile_duct', 'lungs',
    'nephron', 'kidney_capsule', 'sperm_path', 'follicle', 'pituitary', 'adrenal',
    'cortex', 'csf', 'spinal_cord', 'pathways', 'brachial', 'cranial_nerves', 'autonomic',
    'eye', 'ear', 'skin', 'pulse']}
