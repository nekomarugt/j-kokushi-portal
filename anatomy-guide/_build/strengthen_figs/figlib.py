"""生理学ガイド用の図ヘルパー（解剖学ガイドと同じ見た目）。四角・線・円と日本語ラベルだけで描く。"""
import math
FONT = "'BIZ UDPGothic','Hiragino Kaku Gothic ProN','Yu Gothic','Noto Sans CJK JP','Noto Sans JP',sans-serif"
INK, MUTED, BLUE, DEEP, PALE, CYAN, RED, LINE, WASH = '#142638', '#607487', '#0b5ea8', '#073b6a', '#eaf4fc', '#28a9c7', '#cf2634', '#d8e4ee', '#f3f8fc'
REDP, BLUEP, YEL, YELP, GRN, GRNP, PUR, PURP, GRAY = '#fdecee', '#e4effa', '#b77a00', '#fff4d6', '#2e8b57', '#e5f5ec', '#6a4fb3', '#efeafb', '#9aa9b8'
BONE = '#f7efdc'
DEFS = ('<defs>'
        '<marker id="ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#607487"/></marker>'
        '<marker id="ahr" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#cf2634"/></marker>'
        '<marker id="ahb" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#0b5ea8"/></marker>'
        '<marker id="ahg" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="#2e8b57"/></marker>'
        '</defs>')
MK = {MUTED: 'ah', RED: 'ahr', BLUE: 'ahb', GRN: 'ahg'}

def esc(s): return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
def t(x, y, s, size=21, fill=INK, weight='normal', anchor='start', extra=''):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" font-weight="{weight}" text-anchor="{anchor}" {extra}>{esc(s)}</text>'
def svg(w, h, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-label="{esc(title)}" font-family="{FONT}">'
            f'<title>{esc(title)}</title><rect width="{w}" height="{h}" fill="#ffffff"/>{body}</svg>')
def panel(x, y, w, h, fill=WASH):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="{fill}" stroke="{LINE}" stroke-width="2"/>'
def rect(x, y, w, h, fill='#fff', stroke=BLUE, sw=2, rx=0, extra=''):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>'
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
    d = f' stroke-dasharray="{dash}"' if dash else ''
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{w}" marker-end="url(#{MK.get(color, "ah")})"{d}/>'
def line(x1, y1, x2, y2, color=MUTED, w=2, dash=''):
    d = f' stroke-dasharray="{dash}"' if dash else ''
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{w}"{d}/>'
def pline(pts, color=MUTED, w=2.5, arrow=True, dash='', fill='none'):
    d = f' stroke-dasharray="{dash}"' if dash else ''
    me = f' marker-end="url(#{MK.get(color, "ah")})"' if arrow else ''
    return f'<polyline points="{" ".join(f"{a:.1f},{b:.1f}" for a, b in pts)}" fill="{fill}" stroke="{color}" stroke-width="{w}" stroke-linejoin="round" stroke-linecap="round"{me}{d}/>'
def path(d, color=MUTED, w=2.5, fill='none', arrow=False, dash=''):
    me = f' marker-end="url(#{MK.get(color, "ah")})"' if arrow else ''
    ds = f' stroke-dasharray="{dash}"' if dash else ''
    return f'<path d="{d}" fill="{fill}" stroke="{color}" stroke-width="{w}" stroke-linejoin="round" stroke-linecap="round"{me}{ds}/>'
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
def circ(cx, cy, r, fill='#fff', stroke=BLUE, sw=2):
    return f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def leader(x1, y1, x2, y2, color=MUTED):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="1.8"/><circle cx="{x1}" cy="{y1}" r="3.5" fill="{color}"/>'
