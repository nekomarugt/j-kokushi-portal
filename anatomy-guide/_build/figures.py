"""手書きの模式図（SVG）。python3 figures.py または build.py で figures/*.svg を書き出す。
AI生成画像や教科書の図は使わず、四角・線・円と日本語ラベルだけで描いている。"""
import math, os
HERE = os.path.dirname(os.path.abspath(__file__))
OUTDIR = os.path.join(HERE, '..', 'figures')
FONT = "'BIZ UDPGothic','Hiragino Kaku Gothic ProN','Yu Gothic','Noto Sans CJK JP','Noto Sans JP',sans-serif"
INK, MUTED, BLUE, DEEP, PALE, CYAN, RED, LINE, WASH = '#142638', '#607487', '#0b5ea8', '#073b6a', '#eaf4fc', '#28a9c7', '#cf2634', '#d8e4ee', '#f3f8fc'
BONE, COMPACT, MARROW = '#f7efdc', '#e6d6b4', '#f6d98f'

def esc(s): return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
def t(x, y, s, size=21, fill=INK, weight='normal', anchor='start', extra=''):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" font-weight="{weight}" text-anchor="{anchor}" {extra}>{esc(s)}</text>'
def svg(w, h, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-label="{esc(title)}" font-family="{FONT}">'
            f'<title>{esc(title)}</title><rect width="{w}" height="{h}" fill="#ffffff"/>{body}</svg>')
def panel(x, y, w, h):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="{WASH}" stroke="{LINE}" stroke-width="2"/>'
def cell(x, y, w, h, fill='#ffffff'):
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{fill}" stroke="{BLUE}" stroke-width="1.6"/>'
def nuc(cx, cy, rx, ry):
    return f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx}" ry="{ry}" fill="{DEEP}" opacity=".78"/>'
def leader(x1, y1, x2, y2, color=MUTED):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="1.8"/><circle cx="{x1}" cy="{y1}" r="3.5" fill="{color}"/>'

# ---------- 1. 上皮組織 ----------
def epithelium():
    W, PW, PH = 560, 270, 212
    body = []
    def squamous(bx, base):
        o = []
        for i in range(4):
            o.append(cell(bx + i*60, base-16, 60, 16)); o.append(nuc(bx + i*60 + 30, base-8, 13, 4.5))
        return o
    def cuboidal(bx, base):
        o = []
        for i in range(6):
            o.append(cell(bx + i*40, base-40, 40, 40)); o.append(nuc(bx + i*40 + 20, base-20, 8, 8))
        return o
    def columnar(bx, base):
        o = []
        for i in range(8):
            o.append(cell(bx + i*30, base-82, 30, 82)); o.append(nuc(bx + i*30 + 15, base-20, 7, 11))
        return o
    def pseudo(bx, base):
        o, x = [], bx
        for i in range(5):
            o.append(cell(x, base-82, 28, 82)); o.append(nuc(x+14, base-52, 7, 10))
            for k in range(4):
                cx = x + 4 + k*6.5
                o.append(f'<line x1="{cx:.1f}" y1="{base-82}" x2="{cx:.1f}" y2="{base-93}" stroke="{CYAN}" stroke-width="2"/>')
            x += 28
            o.append(cell(x, base-34, 20, 34, '#f1f7fc')); o.append(nuc(x+10, base-16, 6, 7))
            x += 20
        return o
    def stratified(bx, base):
        o = []
        for i in range(8): o.append(cell(bx+i*30, base-20, 30, 20)); o.append(nuc(bx+i*30+15, base-10, 6, 6))
        for i in range(6): o.append(cell(bx+i*40, base-40, 40, 20)); o.append(nuc(bx+i*40+20, base-30, 7, 5.5))
        for i in range(5): o.append(cell(bx+i*48, base-58, 48, 18)); o.append(nuc(bx+i*48+24, base-49, 9, 4))
        for i in range(4): o.append(cell(bx+i*60, base-67, 60, 9, '#f6fafd')); o.append(nuc(bx+i*60+30, base-62.5, 12, 2.5))
        return o
    def transitional(bx, base):
        o = []
        for i in range(8): o.append(cell(bx+i*30, base-18, 30, 18)); o.append(nuc(bx+i*30+15, base-9, 6, 5.5))
        for i in range(6): o.append(cell(bx+i*40, base-42, 40, 24)); o.append(nuc(bx+i*40+20, base-30, 7, 6.5))
        for i in range(4):
            x0 = bx + i*60
            o.append(f'<path d="M{x0},{base-42} L{x0},{base-60} Q{x0+30},{base-86} {x0+60},{base-60} L{x0+60},{base-42} Z" fill="#ffffff" stroke="{BLUE}" stroke-width="1.6"/>')
            o.append(nuc(x0+22, base-58, 6.5, 6.5)); o.append(nuc(x0+40, base-58, 6.5, 6.5))
        return o
    items = [
        ('単層扁平上皮', squamous, '血管の内皮・肺胞・胸膜', 'うすい → 物を通す'),
        ('単層立方上皮', cuboidal, '甲状腺の濾胞・尿細管', 'さいころ形 → 分泌・吸収'),
        ('単層円柱上皮', columnar, '胃・小腸・大腸・胆嚢', '背が高い → 吸収・分泌'),
        ('多列線毛円柱上皮', pseudo, '気管・気管支・鼻腔', '線毛でごみを外へ運ぶ'),
        ('重層扁平上皮', stratified, '皮膚・口・食道・肛門', '何層も → こすれに強い'),
        ('移行上皮', transitional, '腎盂・尿管・膀胱', '形が変わる → のび縮み'),
    ]
    for k, (name, fn, place, job) in enumerate(items):
        x = 5 + (k % 2) * 280; y = 8 + (k // 2) * (PH + 10)
        body.append(panel(x, y, PW, PH))
        body.append(t(x+14, y+32, name, 23, DEEP, 'bold'))
        base = y + 140
        body += fn(x + 15, base)
        body.append(f'<line x1="{x+12}" y1="{base+2}" x2="{x+258}" y2="{base+2}" stroke="{MUTED}" stroke-width="4"/>')
        body.append(t(x+14, y+172, place, 19.5, INK, 'bold'))
        body.append(t(x+14, y+199, job, 19, RED if k >= 4 else BLUE))
    H = 8 + 3*(PH+10)
    body.append(t(W-10, H+8, '下の灰色の線＝基底膜', 16, MUTED, anchor='end'))
    return svg(W, H+18, ''.join(body), '上皮組織の種類と代表的な場所の模式図')

# ---------- 2. 細胞小器官 ----------
def organelles():
    W, H = 560, 770
    b = []
    b.append(f'<ellipse cx="280" cy="250" rx="262" ry="222" fill="#fbfdff" stroke="{BLUE}" stroke-width="4"/>')
    # rough ER arcs around the nucleus (right side) with ribosome dots
    ncx, ncy = 190, 250
    for r in (92, 108, 124):
        a0, a1 = math.radians(-65), math.radians(65)
        p0 = (ncx + r*math.cos(a0), ncy + r*math.sin(a0)); p1 = (ncx + r*math.cos(a1), ncy + r*math.sin(a1))
        b.append(f'<path d="M{p0[0]:.1f},{p0[1]:.1f} A{r},{r} 0 0 1 {p1[0]:.1f},{p1[1]:.1f}" fill="none" stroke="{CYAN}" stroke-width="5" stroke-linecap="round"/>')
        for deg in range(-60, 61, 12):
            a = math.radians(deg)
            b.append(f'<circle cx="{ncx + (r+5)*math.cos(a):.1f}" cy="{ncy + (r+5)*math.sin(a):.1f}" r="2.6" fill="{DEEP}"/>')
    # nucleus (double membrane)
    b.append(f'<circle cx="{ncx}" cy="{ncy}" r="76" fill="{PALE}" stroke="{DEEP}" stroke-width="3"/>')
    b.append(f'<circle cx="{ncx}" cy="{ncy}" r="69" fill="none" stroke="{DEEP}" stroke-width="2"/>')
    b.append(f'<circle cx="{ncx+10}" cy="{ncy-8}" r="20" fill="#8fb8dc"/>')
    # mitochondria
    def mito(cx, cy, rx, ry):
        o = [f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="#fde9d7" stroke="#c0661c" stroke-width="3"/>',
             f'<ellipse cx="{cx}" cy="{cy}" rx="{rx-6}" ry="{ry-6}" fill="none" stroke="#c0661c" stroke-width="1.6"/>']
        pts = []; n = 7
        for i in range(n+1):
            x = cx - (rx-10) + i*(2*(rx-10)/n)
            y = cy + (ry-9 if i % 2 else -(ry-9))
            pts.append(f'{x:.1f},{y:.1f}')
        o.append(f'<polyline points="{" ".join(pts)}" fill="none" stroke="#c0661c" stroke-width="2"/>')
        return o
    b += mito(405, 140, 56, 28); b += mito(425, 395, 44, 23)
    # golgi
    for i, dy in enumerate((0, 16, 32, 48)):
        w = 70 - abs(i-1.5)*8
        b.append(f'<path d="M{440-w},{255+dy} Q440,{235+dy} {440+w},{255+dy}" fill="none" stroke="#6a4fb3" stroke-width="7" stroke-linecap="round"/>')
    for (cx, cy) in ((372, 318), (505, 318), (395, 335)):
        b.append(f'<circle cx="{cx}" cy="{cy}" r="7" fill="#e7e0f7" stroke="#6a4fb3" stroke-width="2"/>')
    # smooth ER (tubes, no dots)
    for dy in (0, 20):
        b.append(f'<path d="M150,{405+dy} q20,-14 40,0 t40,0 t40,0" fill="none" stroke="{CYAN}" stroke-width="7" stroke-linecap="round" opacity=".7"/>')
    # lysosome
    b.append(f'<circle cx="320" cy="385" r="20" fill="#f8dcdf" stroke="{RED}" stroke-width="3"/>')
    for (dx, dy) in ((-7, -5), (6, -7), (0, 6), (8, 5), (-8, 7)):
        b.append(f'<circle cx="{320+dx}" cy="{385+dy}" r="2.5" fill="{RED}"/>')
    # free ribosomes
    for (x, y) in ((95, 360), (110, 375), (300, 120), (315, 105), (495, 200), (480, 215), (250, 440), (90, 170)):
        b.append(f'<circle cx="{x}" cy="{y}" r="3" fill="{DEEP}"/>')
    # number markers
    def mark(x, y, n):
        return f'<circle cx="{x}" cy="{y}" r="15" fill="{BLUE}"/>' + t(x, y+7, str(n), 19, '#ffffff', 'bold', 'middle')
    b += [mark(150, 220, 1), mark(405, 96, 2), mark(305, 160, 3), mark(135, 392, 4), mark(440, 214, 5), mark(355, 370, 6), mark(80, 385, 7)]
    b.append(t(492, 470, '細胞膜', 18, BLUE, anchor='middle'))
    lines = [('1', '核', 'DNA（設計図）が入る。核膜は二重膜'),
             ('2', 'ミトコンドリア', 'ATPをつくる。二重膜'),
             ('3', '粗面小胞体', 'リボソーム付き → タンパク質合成'),
             ('4', '滑面小胞体', '脂質の合成・Ca²⁺の貯蔵'),
             ('5', 'ゴルジ装置', 'タンパク質の加工・分泌'),
             ('6', 'リソソーム', '分解酵素で不要物を分解'),
             ('7', 'リボソーム（点）', 'タンパク質をつくる')]
    y = 512
    for n, name, job in lines:
        b.append(mark(24, y-7, n))
        b.append(f'<text x="48" y="{y}" font-size="20.5" fill="{INK}"><tspan font-weight="bold" fill="{DEEP}">{esc(name)}</tspan>：{esc(job)}</text>')
        y += 37
    return svg(W, 760, ''.join(b), '細胞小器官とそのはたらきの模式図')

# ---------- 3. 関節の形 ----------
def joints():
    W, PW, PH = 560, 270, 222
    b = []
    SOCK = '#c9d8e6'
    def ball(cx, y):
        return [f'<path d="M{cx-46},{y+92} A46,46 0 0 0 {cx+46},{y+92} L{cx+34},{y+92} A34,34 0 0 1 {cx-34},{y+92} Z" fill="{SOCK}" stroke="{MUTED}" stroke-width="2"/>',
                f'<rect x="{cx-50}" y="{y+128}" width="100" height="10" fill="{SOCK}"/>',
                f'<rect x="{cx-11}" y="{y+42}" width="22" height="30" fill="{PALE}" stroke="{BLUE}" stroke-width="2"/>',
                f'<circle cx="{cx}" cy="{y+94}" r="30" fill="{PALE}" stroke="{BLUE}" stroke-width="2.5"/>']
    def hinge(cx, y):
        return [f'<path d="M{cx-58},{y+88} L{cx-58},{y+132} L{cx+58},{y+132} L{cx+58},{y+88} L{cx+50},{y+88} Q{cx+50},{y+124} {cx},{y+124} L{cx},{y+124} Q{cx-50},{y+124} {cx-50},{y+88} Z" fill="{SOCK}" stroke="{MUTED}" stroke-width="2"/>',
                f'<rect x="{cx-11}" y="{y+42}" width="22" height="34" fill="{PALE}" stroke="{BLUE}" stroke-width="2"/>',
                f'<rect x="{cx-48}" y="{y+72}" width="96" height="44" rx="22" fill="{PALE}" stroke="{BLUE}" stroke-width="2.5"/>',
                f'<line x1="{cx-62}" y1="{y+94}" x2="{cx+62}" y2="{y+94}" stroke="{RED}" stroke-width="2" stroke-dasharray="5 4"/>']
    def pivot(cx, y):
        return [f'<rect x="{cx-15}" y="{y+44}" width="30" height="96" rx="6" fill="{PALE}" stroke="{BLUE}" stroke-width="2.5"/>',
                f'<path d="M{cx-44},{y+100} A44,15 0 0 0 {cx+44},{y+100}" fill="none" stroke="{MUTED}" stroke-width="9"/>',
                f'<path d="M{cx-44},{y+100} A44,15 0 0 1 {cx+44},{y+100}" fill="none" stroke="{MUTED}" stroke-width="9" opacity=".45"/>',
                f'<path d="M{cx-34},{y+62} A34,11 0 0 0 {cx+30},{y+66}" fill="none" stroke="{RED}" stroke-width="2.5"/>',
                f'<path d="M{cx+30},{y+66} l-11,-2 l6,9 z" fill="{RED}"/>']
    def ellip(cx, y):
        return [f'<path d="M{cx-56},{y+92} A56,34 0 0 0 {cx+56},{y+92} L{cx+44},{y+92} A44,24 0 0 1 {cx-44},{y+92} Z" fill="{SOCK}" stroke="{MUTED}" stroke-width="2"/>',
                f'<rect x="{cx-60}" y="{y+124}" width="120" height="10" fill="{SOCK}"/>',
                f'<rect x="{cx-11}" y="{y+42}" width="22" height="34" fill="{PALE}" stroke="{BLUE}" stroke-width="2"/>',
                f'<ellipse cx="{cx}" cy="{y+93}" rx="42" ry="22" fill="{PALE}" stroke="{BLUE}" stroke-width="2.5"/>']
    def saddle(cx, y):
        return [f'<path d="M{cx-52},{y+136} L{cx-52},{y+104} Q{cx},{y+72} {cx+52},{y+104} L{cx+52},{y+136} Z" fill="{SOCK}" stroke="{MUTED}" stroke-width="2"/>',
                f'<path d="M{cx-52},{y+44} L{cx-52},{y+94} Q{cx},{y+62} {cx+52},{y+94} L{cx+52},{y+44} Z" fill="{PALE}" stroke="{BLUE}" stroke-width="2.5"/>',
                f'<ellipse cx="{cx}" cy="{y+72}" rx="20" ry="7" fill="none" stroke="{BLUE}" stroke-width="1.5" stroke-dasharray="3 3"/>']
    def plane(cx, y):
        return [f'<rect x="{cx-55}" y="{y+96}" width="110" height="36" fill="{SOCK}" stroke="{MUTED}" stroke-width="2"/>',
                f'<rect x="{cx-45}" y="{y+56}" width="110" height="36" fill="{PALE}" stroke="{BLUE}" stroke-width="2.5"/>',
                f'<path d="M{cx-70},{y+50} h32 M{cx+72},{y+50} h-32" stroke="{RED}" stroke-width="2.5"/>',
                f'<path d="M{cx-72},{y+50} l10,-6 v12 z M{cx+74},{y+50} l-10,-6 v12 z" fill="{RED}"/>']
    items = [('球関節', '多軸', ball, '肩関節', '深いもの＝臼状関節（股関節）'),
             ('蝶番関節', '1軸', hinge, '腕尺関節・指節間関節', 'ドアのように1方向'),
             ('車軸関節', '1軸', pivot, '上橈尺関節・下橈尺関節', '正中環軸関節（首を回す）'),
             ('楕円関節', '2軸', ellip, '橈骨手根関節', '前後と左右に動く'),
             ('鞍関節', '2軸', saddle, '母指の手根中手関節', '親指が向き合える'),
             ('平面関節', 'すべるだけ', plane, '椎間関節・肩鎖関節', '少しずれるだけ')]
    for k, (name, ax, fn, ex, note) in enumerate(items):
        x = 5 + (k % 2) * 280; y = 8 + (k // 2) * (PH + 10)
        b.append(panel(x, y, PW, PH))
        b.append(f'<text x="{x+14}" y="{y+32}" font-size="23" font-weight="bold" fill="{DEEP}">{esc(name)}<tspan font-size="18" fill="{MUTED}" font-weight="normal">（{esc(ax)}）</tspan></text>')
        b += fn(x + 135, y)
        b.append(t(x+14, y+168, ex, 19.5, RED, 'bold'))
        b.append(t(x+14, y+197, note, 18, INK))
    H = 8 + 3*(PH+10)
    return svg(W, H, ''.join(b), '関節の形による分類の模式図')

# ---------- 4. 骨の構造 ----------
def bone():
    W, H = 560, 1040
    b = [f'<defs><pattern id="spongy" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="{COMPACT}"/><circle cx="7" cy="7" r="4.6" fill="#fffaf0"/></pattern></defs>']
    outer = ("M95,190 C95,170 65,170 65,140 L65,110 Q65,55 130,55 Q195,55 195,110 L195,140 C195,170 165,170 165,190 "
             "L165,560 C165,580 195,580 195,610 L195,640 Q195,695 130,695 Q65,695 65,640 L65,610 C65,580 95,580 95,560 Z")
    b.append(f'<path d="{outer}" fill="{COMPACT}" stroke="{DEEP}" stroke-width="2.5"/>')
    b.append('<path d="M76,112 Q76,68 130,68 Q184,68 184,112 L184,140 C184,165 152,168 150,205 L110,205 C108,168 76,165 76,140 Z" fill="url(#spongy)"/>')
    b.append('<path d="M76,638 Q76,682 130,682 Q184,682 184,638 L184,610 C184,585 152,582 150,545 L110,545 C108,582 76,585 76,610 Z" fill="url(#spongy)"/>')
    b.append(f'<rect x="110" y="205" width="40" height="340" fill="{MARROW}"/>')
    b.append(f'<path d="M70,112 Q70,60 130,60 Q190,60 190,112" fill="none" stroke="#7cc3dd" stroke-width="10"/>')
    b.append(f'<path d="M70,638 Q70,690 130,690 Q190,690 190,638" fill="none" stroke="#7cc3dd" stroke-width="10"/>')
    for yy in (160, 590):
        b.append(f'<line x1="68" y1="{yy}" x2="192" y2="{yy}" stroke="{RED}" stroke-width="4" stroke-dasharray="8 5"/>')
    peri_l = "M58,118 L58,140 C58,176 88,176 88,195 L88,555 C88,574 58,574 58,610 L58,632"
    peri_r = "M202,118 L202,140 C202,176 172,176 172,195 L172,555 C172,574 202,574 202,610 L202,632"
    for p in (peri_l, peri_r):
        b.append(f'<path d="{p}" fill="none" stroke="{CYAN}" stroke-width="4"/>')
    # brackets 骨端・骨幹
    b.append(f'<path d="M36,58 h-8 v130 h8" fill="none" stroke="{MUTED}" stroke-width="2"/>')
    b.append(t(16, 116, '骨', 18, MUTED, anchor='middle')); b.append(t(16, 138, '端', 18, MUTED, anchor='middle'))
    b.append(f'<path d="M36,200 h-8 v350 h8" fill="none" stroke="{MUTED}" stroke-width="2"/>')
    b.append(t(16, 366, '骨', 18, MUTED, anchor='middle')); b.append(t(16, 388, '幹', 18, MUTED, anchor='middle'))
    labs = [((178, 72), 70, '関節軟骨（硝子軟骨）', BLUE, '関節面をおおう'),
            ((150, 120), 140, '海綿質', INK, '骨端の中のスポンジ状'),
            ((188, 160), 212, '骨端軟骨（大人は骨端線）', RED, '→ 骨が長くなる所'),
            ((172, 290), 290, '骨膜', CYAN, '→ 骨が太くなる所'),
            ((158, 370), 372, '緻密質', INK, '表面のかたい層'),
            ((130, 450), 452, '骨髄（骨髄腔）', '#a36b00', '血液をつくる')]
    for (px, py), ly, name, col, sub in labs:
        b.append(leader(px, py, 238, ly - 7))
        b.append(t(244, ly, name, 21, col, 'bold'))
        b.append(t(244, ly + 26, sub, 18, INK))
    b.append(t(244, 560, '骨膜は関節軟骨の所にはない', 17, MUTED))
    # close-up of compact bone
    y0 = 740
    b.append(f'<line x1="10" y1="{y0-28}" x2="550" y2="{y0-28}" stroke="{LINE}" stroke-width="2"/>')
    b.append(t(20, y0, '緻密質を拡大すると', 22, DEEP, 'bold'))
    top, bot = y0 + 50, y0 + 200
    b.append(f'<rect x="40" y="{top}" width="18" height="{bot-top}" fill="{CYAN}" opacity=".55"/>')
    b.append(t(49, bot + 30, '骨膜', 18, CYAN, 'bold', 'middle'))
    for cx in (150, 290, 430):
        b.append(f'<rect x="{cx-58}" y="{top}" width="116" height="{bot-top}" fill="{COMPACT}" stroke="{DEEP}" stroke-width="1.5"/>')
        for dx in (18, 34, 48):
            for sgn in (-1, 1):
                b.append(f'<line x1="{cx+sgn*dx}" y1="{top}" x2="{cx+sgn*dx}" y2="{bot}" stroke="#bfa678" stroke-width="1.5"/>')
        for rx, ry in ((58, 17), (46, 13.5), (32, 9.5), (18, 5.5)):
            b.append(f'<ellipse cx="{cx}" cy="{top}" rx="{rx}" ry="{ry}" fill="{COMPACT if rx == 58 else "none"}" stroke="#a88d5c" stroke-width="1.5"/>')
        b.append(f'<rect x="{cx-6}" y="{top}" width="12" height="{bot-top}" fill="{BLUE}"/>')
        b.append(f'<ellipse cx="{cx}" cy="{top}" rx="6" ry="2.5" fill="{DEEP}"/>')
    fy = (top + bot) // 2 + 20
    b.append(f'<rect x="58" y="{fy-6}" width="378" height="12" fill="{RED}" opacity=".85"/>')
    b.append(leader(290, top + 30, 350, y0 + 22, BLUE))
    b.append(t(356, y0 + 28, 'ハバース管（たて）', 20, BLUE, 'bold'))
    b.append(leader(220, fy, 250, bot + 22, RED))
    b.append(t(150, bot + 50, 'フォルクマン管（よこ）', 20, RED, 'bold'))
    b.append(t(150, bot + 76, 'ハバース管どうし・骨膜をつなぐ血管の通り道', 17.5, INK))
    return svg(W, H, ''.join(b), '長骨の構造と緻密質の拡大の模式図')

# ---------- 5. 縫合と泉門 ----------
def fontanelle():
    W, H = 560, 680
    cx, cy, rx, ry = 280, 310, 190, 250
    b = [f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{BONE}" stroke="{DEEP}" stroke-width="3"/>']
    b.append(t(cx, 36, '▲ 前（顔の側）', 19, MUTED, anchor='middle'))
    b.append(t(cx, 590, '▼ 後ろ', 19, MUTED, anchor='middle'))
    ey = lambda y: rx * math.sqrt(1 - ((y - cy) / ry) ** 2)
    yc = 245; xl, xr = cx - ey(yc), cx + ey(yc)
    b.append(f'<path d="M{xl:.1f},{yc} Q{cx},{yc-66} {xr:.1f},{yc}" fill="none" stroke="{BLUE}" stroke-width="4"/>')
    ly = 510; lxl, lxr = cx - ey(ly), cx + ey(ly)
    b.append(f'<path d="M{lxl:.1f},{ly} L{cx},{452} L{lxr:.1f},{ly}" fill="none" stroke="{BLUE}" stroke-width="4"/>')
    b.append(f'<line x1="{cx}" y1="270" x2="{cx}" y2="435" stroke="{BLUE}" stroke-width="4"/>')
    b.append(f'<path d="M{cx},160 L{cx+40},212 L{cx},272 L{cx-40},212 Z" fill="#ffffff" stroke="{RED}" stroke-width="3.5"/>')
    b.append(f'<path d="M{cx},432 L{cx+22},462 L{cx-22},462 Z" fill="#ffffff" stroke="{RED}" stroke-width="3.5"/>')
    b.append(t(cx, 118, '前頭骨', 24, INK, 'bold', 'middle'))
    b.append(t(180, 360, '頭頂骨', 24, INK, 'bold', 'middle'))
    b.append(t(380, 360, '頭頂骨', 24, INK, 'bold', 'middle'))
    b.append(t(cx, 535, '後頭骨', 24, INK, 'bold', 'middle'))
    b.append(t(150, 236, '冠状縫合', 20, BLUE, 'bold', 'middle'))
    b.append(t(cx + 10, 322, '矢状', 18, BLUE, 'bold'))
    b.append(t(cx + 10, 344, '縫合', 18, BLUE, 'bold'))
    b.append(t(395, 470, 'ラムダ縫合', 20, BLUE, 'bold', 'middle'))
    b.append(leader(cx + 40, 212, 470, 178, RED)); b.append(t(476, 186, '大泉門', 22, RED, 'bold'))
    b.append(leader(cx + 22, 455, 460, 420, RED)); b.append(t(466, 428, '小泉門', 22, RED, 'bold'))
    b.append(t(20, 632, '大泉門＝ひし形。生後1年半〜2年で閉じる', 20.5, INK))
    b.append(t(20, 664, '小泉門＝三角形。生後まもなく（数か月以内）閉じる', 20.5, INK))
    return svg(W, H, ''.join(b), '新生児の頭蓋を上から見た縫合と泉門の模式図')

# ---------- 6. 脊柱 ----------
def spine():
    W, H = 560, 960
    b = []
    col = 150
    groups = [('頸椎', 7, 22, 46, '#cfe8f5', -16), ('胸椎', 12, 23, 56, '#e3eefa', 22), ('腰椎', 5, 33, 72, '#c7dcf0', -18)]
    y = 58; spans = []
    for name, n, h, w, fill, bulge in groups:
        y_start = y
        total = n * (h + 3)
        for i in range(n):
            mid = (i + .5) / n
            off = bulge * math.sin(math.pi * mid)
            b.append(f'<rect x="{col + off - w/2:.1f}" y="{y:.1f}" width="{w}" height="{h}" rx="5" fill="{fill}" stroke="{BLUE}" stroke-width="1.8"/>')
            y += h + 3
        spans.append((name, n, y_start, y - 3))
        y += 4
    ys = y
    b.append(f'<path d="M{col-38},{ys} L{col+42},{ys} L{col+34},{ys+50} L{col+10},{ys+92} L{col-2},{ys+92} L{col-26},{ys+40} Z" fill="{BONE}" stroke="{DEEP}" stroke-width="2"/>')
    for k in range(1, 5):
        yy = ys + k * 18
        b.append(f'<line x1="{col-30+k*5}" y1="{yy}" x2="{col+36-k*4}" y2="{yy}" stroke="#c7b58c" stroke-width="1.5"/>')
    yco = ys + 96
    b.append(f'<path d="M{col-6},{yco} L{col+14},{yco} L{col+8},{yco+34} L{col+2},{yco+34} Z" fill="{BONE}" stroke="{DEEP}" stroke-width="2"/>')
    spans.append(('仙骨', 1, ys, ys + 92)); spans.append(('尾骨', 1, yco, yco + 34))
    info = {'頸椎': ('7個', '横突孔がある', '1番＝環椎・2番＝軸椎・7番＝隆椎'),
            '胸椎': ('12個', '肋骨と関節する（肋骨窩）', ''),
            '腰椎': ('5個', '一番大きい', '肋骨突起・乳頭突起'),
            '仙骨': ('1個', '5個がくっついた骨', ''),
            '尾骨': ('1個', '3〜5個がくっついた骨', '')}
    for name, n, y1, y2 in spans:
        cnt, l1, l2 = info[name]
        b.append(f'<path d="M232,{y1+2} h8 v{y2-y1-4} h-8" fill="none" stroke="{MUTED}" stroke-width="2"/>')
        ymid = (y1 + y2) / 2
        top_y = ymid - (14 if l2 else 2)
        b.append(f'<text x="252" y="{top_y:.0f}" font-size="23" font-weight="bold" fill="{DEEP}">{esc(name)} <tspan fill="{RED}">{esc(cnt)}</tspan></text>')
        b.append(t(252, top_y + 26, l1, 18.5, INK))
        if l2: b.append(t(252, top_y + 50, l2, 17, MUTED))
    b.append(t(20, 32, '← 前（おなか側）', 17, MUTED))
    b.append(t(210, 32, '後ろ（せなか側）→', 17, MUTED))
    for (yy, lab) in ((140, '前弯'), (330, '後弯'), (590, '前弯'), (790, '後弯')):
        b.append(t(22, yy, lab, 17, MUTED))
    b.append(t(20, H - 42, '合計26個（7＋12＋5＋1＋1）', 23, RED, 'bold'))
    b.append(t(20, H - 12, '覚え方：首7・胸12・腰5 ＝「朝7時・昼12時・夕方5時」', 18, INK))
    return svg(W, H, ''.join(b), '脊柱の骨の数と特徴の模式図（横から見た図）')

FIGS = {'epithelium': epithelium, 'organelles': organelles, 'joints': joints, 'bone': bone, 'fontanelle': fontanelle, 'spine': spine}

def write_all():
    os.makedirs(OUTDIR, exist_ok=True)
    for name, fn in FIGS.items():
        with open(os.path.join(OUTDIR, name + '.svg'), 'w') as f:
            f.write(fn())

def FIG(name, alt, caption):
    s = FIGS[name]()
    import re
    w, h = re.search(r'viewBox="0 0 (\d+) (\d+)"', s).groups()
    return (f'<figure class="fig"><a href="figures/{name}.svg" target="_blank" rel="noopener">'
            f'<img src="figures/{name}.svg" width="{w}" height="{h}" alt="{alt}" loading="lazy"></a>'
            f'<figcaption><strong>ひとことポイント</strong>　{caption}<small class="fig-zoom">（図をタップすると拡大）</small></figcaption></figure>')

if __name__ == '__main__':
    write_all(); print('wrote', list(FIGS))
