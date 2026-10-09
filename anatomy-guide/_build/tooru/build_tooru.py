# -*- coding: utf-8 -*-
"""通るシリーズの資料倉庫 → tooru-data.js（描画は tooru.js）。
過去問の数え方：問題文＋選択肢に、項目の「数える語」がすべて出た問題を1問と数える（解説文は数えない）。3問以上を「頻出」。"""
import json, os, re, shutil, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from tooru_data import GROUPS
from PIL import Image

def build(qpath, out_js, fig_out_dir, fig_url, note, chips=None, lead=None):
    Q = json.load(open(qpath, encoding='utf-8'))
    txt = lambda x: x['question'] + ' ' + ' '.join(x['choices'])
    os.makedirs(fig_out_dir, exist_ok=True)
    groups = []
    for g in GROUPS:
        items = []
        for k, (iid, place, verb, what, inote, rx) in enumerate(g['items']):
            n = sum(1 for x in Q if all(re.search(r, txt(x)) for r in rx))
            it = dict(id=iid, place=place, verb=verb, what=what, note=inote, n=n, hot=n >= 3, _k=k)
            if chips and iid in chips: it['chips'] = chips[iid]
            items.append(it)
        items.sort(key=lambda i: (-i['n'], i['_k']))
        for i in items: i.pop('_k')
        figs = []
        for f, cap in g['figs']:
            src = os.path.join(HERE, 'figs', f + '.webp')
            shutil.copyfile(src, os.path.join(fig_out_dir, f + '.webp'))
            w, h = Image.open(src).size
            figs.append(dict(src=fig_url + f + '.webp', w=w, h=h, alt=cap, cap=cap))
        groups.append(dict(id=g['id'], name=g['name'], lead=g['lead'], figs=figs, hot=sum(i['hot'] for i in items),
                           goro=[dict(g=a, dec=b) for a, b in g['goro']], items=items))
    data = dict(lead=lead or '孔・管・すき間・筋を「何が通るか（貫くか）」を一行で。よく出る順に並べ、3問以上出たものに「頻出」。図説はタップで開く。',
                note=note, groups=groups)
    with open(out_js, 'w', encoding='utf-8') as f:
        f.write('/* 自動生成（_build の build_tooru.py）。直接編集しない */\nwindow.TOORU = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    return data
