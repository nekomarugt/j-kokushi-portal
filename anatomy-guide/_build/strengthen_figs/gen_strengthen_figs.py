"""柔整ガイド「強化バッチ1」用の図（すべて自作SVG）。出力は out/ 。
つながり図(x_*)は3ガイドに同じものを置く。メインの図(p_*,a_*,c_*)は該当ガイドだけ。"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from figlib import *
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')
os.makedirs(OUT, exist_ok=True)
def save(name, s):
    assert len(s) < 14000, (name, len(s))
    open(os.path.join(OUT, name + '.svg'), 'w', encoding='utf-8').write(s)
def fit(s, size, maxw, name):
    assert tw(s, size) <= maxw, f'{name}: 「{s}」{tw(s,size):.0f}>{maxw}'

# ---------- つながり図（上から 解剖→生理→臨床、下にたとえ） ----------
ROWS = [('解剖学', BLUE, BLUEP), ('生理学', GRN, GRNP), ('臨床', RED, REDP)]
def chain(name, title, rows, banner, alt):
    W = 560; b = []
    b.append(t(W / 2, 32, title, 22, DEEP, 'bold', 'middle'))
    y0 = 52; rh = 96; gap = 20
    for i, ((lab, c, f), txt) in enumerate(zip(ROWS, rows)):
        y = y0 + i * (rh + gap)
        b.append(rect(12, y, 536, rh, f, c, 2, 12))
        b.append(rect(12, y, 92, rh, c, c, 2, 12))
        b.append(t(58, y + rh / 2 + 7, lab, 20, '#fff', 'bold', 'middle'))
        for j, ln in enumerate(txt):
            fit(ln, 18, 424, name)
            b.append(t(118, y + 34 + j * 30, ln, 18, INK if j else c, 'bold' if j == 0 else 'normal'))
        if i < 2:
            b.append(arr(58, y + rh + 2, 58, y + rh + gap - 2, MUTED, 3))
    yb = y0 + 3 * (rh + gap) - gap + 18
    bh = 24 + 28 * len(banner)
    b.append(rect(12, yb, 536, bh, YELP, YEL, 2, 12))
    b.append(t(28, yb + 30, 'たとえ', 17, YEL, 'bold'))
    for j, ln in enumerate(banner):
        fit(ln, 18, 500, name)
        b.append(t(28, yb + 30 + 28 * (j + 1) - 4, ln, 18, INK))
    H = yb + bh + 12
    save(name, S(W, H, b, alt))

chain('x_sugar', 'つながり：血糖', [
    ['膵島（ランゲルハンス島）', 'B細胞＝インスリン／A細胞＝グルカゴン'],
    ['インスリンは血糖を下げる', 'グルカゴンは血糖を上げる'],
    ['糖尿病＝血糖が高いまま', '口渇・多飲・多尿']],
    ['血糖＝お財布のお金、細胞＝貯金箱。', 'インスリンは「入れる係」、グルカゴンは「出す係」。'],
    '血糖の解剖・生理・臨床のつながり図')
chain('x_ca', 'つながり：カルシウム', [
    ['上皮小体（副甲状腺）', '甲状腺のうしろにある小さな腺'],
    ['PTHと活性型ビタミンDは血中Caを上げる', 'カルシトニンは骨吸収を抑える'],
    ['Caが低いとテタニー（けいれん）', '腎臓が悪いとCaが下がる']],
    ['血中Ca＝家計簿の残高。減るとPTHが取り立て屋に。', '骨から出す・腎で節約・腸から仕入れる。'],
    'カルシウムの解剖・生理・臨床のつながり図')
chain('x_reflex', 'つながり：反射と上位・下位ニューロン', [
    ['錐体路は延髄の下部で交叉', '反対側の脊髄へ下りる'],
    ['脊髄反射には上から抑えがかかる', '上が壊れると抑えが外れる'],
    ['上位の障害＝腱反射が強まる', 'バビンスキー反射が出る']],
    ['社長（脳）が不在だと、現場（反射）が暴走。', '現場（下位）が倒れると、動けない・反射も出ない。'],
    '反射の解剖・生理・臨床のつながり図')
chain('x_liver', 'つながり：肝臓・胆汁・ビリルビン', [
    ['胆汁は肝臓でつくる', '胆嚢で濃くして貯める'],
    ['ビリルビン＝古い赤血球のカス', '肝臓でくるんで（抱合）胆汁へ'],
    ['処理できない／出口がつまる', 'ビリルビンがたまり黄疸になる']],
    ['肝臓は荷物を箱詰めして発送する所。', '出口の胆道がつまると、荷物が倉庫（血液）にあふれる。'],
    '肝臓と胆汁の解剖・生理・臨床のつながり図')
chain('x_kidney', 'つながり：腎臓のふるい', [
    ['腎小体＝糸球体＋ボーマン嚢', '尿細管へつながる'],
    ['血球や大きなタンパク質は通れない', '必要な物は尿細管で戻す'],
    ['ネフローゼ＝タンパク尿・むくみ', '糖尿病＝戻しきれず尿に糖']],
    ['洗濯物を全部いったん干して（ろ過）、', '要る服だけ取りこむ（再吸収）。'],
    '腎臓の解剖・生理・臨床のつながり図')
chain('x_resp', 'つながり：息の出す力とふくらむ力', [
    ['右の気管支は太く短く垂直', '異物が入りやすい'],
    ['1秒率＝息を一気にはく力', '肺活量＝ふくらむ量'],
    ['閉塞性＝1秒率が低い（COPDなど）', '樽状胸・打診で鼓音']],
    ['閉塞性＝ふくらんだまま戻らない風船。', '拘束性＝かたくてふくらまない風船。'],
    '呼吸の解剖・生理・臨床のつながり図')
chain('x_sens', 'つながり：感覚の通り道', [
    ['後索＝深部感覚（同じ側を上る）', '脊髄視床路＝温痛覚（すぐ反対側へ）'],
    ['Aδ＝速い鋭い痛み', 'C＝遅い鈍い痛み'],
    ['深部感覚が壊れるとロンベルグ陽性', '目を閉じるとふらつく']],
    ['感覚の手紙は道が別々。', '深部の道が壊れても、温痛の道は残ることがある。'],
    '感覚の解剖・生理・臨床のつながり図')
chain('x_eye', 'つながり：目を動かす神経', [
    ['外側直筋＝外転神経、上斜筋＝滑車神経', 'ほかの眼筋と上眼瞼挙筋＝動眼神経'],
    ['瞳孔を縮める＝副交感（動眼神経）', '瞳孔を広げる＝交感'],
    ['眼瞼下垂＝まぶたが下がる', '動眼神経麻痺や重症筋無力症でみられる']],
    ['上斜筋は眼の奥から出て、滑車でUターンして付く。', 'だから名前が「滑車神経」。'],
    '目の筋と神経の解剖・生理・臨床のつながり図')
chain('x_heart', 'つながり：心音', [
    ['房室弁（三尖弁・僧帽弁）', '腱索と乳頭筋で支えられている'],
    ['Ⅰ音＝房室弁が閉じる音', 'Ⅱ音＝動脈弁（半月弁）が閉じる音'],
    ['弁がせまい・もれると雑音', '聴診で気づく']],
    ['Ⅰ音は入口のドア（房室弁）がバタン、', 'Ⅱ音は出口のドア（動脈弁）がバタン。'],
    '心音の解剖・生理・臨床のつながり図')
chain('x_lymph', 'つながり：リンパのゆくえ', [
    ['胸管は腹部・下半身・左上半身の', 'リンパを集めて、左の静脈角へ注ぐ'],
    ['毛細血管で戻りきらない水は', 'リンパ管で回収して静脈へ返す'],
    ['胃癌などは左鎖骨上窩リンパ節へ転移', '（ウィルヒョウ転移）。触診で調べる']],
    ['腹部のゴミ回収トラックの終点は、左の首の付け根。', 'だから腹部の癌が左の鎖骨の上に出てくる。'],
    'リンパの解剖・生理・臨床のつながり図')

# ---------- メインの図 ----------
def p12_islet():
    W, H = 560, 330; b = []
    cards = [('A細胞', 'グルカゴン', '血糖を上げる', RED, REDP, '↑'), ('B細胞', 'インスリン', '血糖を下げる', BLUE, BLUEP, '↓'),
             ('D細胞', 'ソマトスタチン', 'ほかを抑える', GRN, GRNP, '−')]
    for i, (c1, h, e, c, f, ar) in enumerate(cards):
        x = 12 + i * 182
        b.append(rect(x, 14, 172, 210, f, c, 2, 12))
        b.append(t(x + 86, 48, c1, 22, c, 'bold', 'middle'))
        b.append(t(x + 86, 84, h, 19 if len(h) < 7 else 16, INK, 'bold', 'middle'))
        b.append(line(x + 14, 100, x + 158, 100, c, 1.5))
        b.append(t(x + 86, 154, ar, 44, c, 'bold', 'middle'))
        fit(e, 16, 150, 'p12_islet')
        b.append(t(x + 86, 196, e, 16, INK, 'bold', 'middle'))
    b.append(rect(12, 240, 536, 76, YELP, YEL, 2, 12))
    b.append(t(28, 270, '血糖が上がる → B細胞がインスリンを出す', 19, INK, 'bold'))
    b.append(t(28, 300, '血糖が下がる → A細胞がグルカゴンを出す', 19, INK, 'bold'))
    save('p12_islet', S(W, H, b, '膵島のA細胞・B細胞・D細胞とホルモンの働きの図'))
def p13_vitd():
    W, H = 560, 430; b = []
    steps = [('皮膚', '紫外線でビタミンDができる（食べ物からも）', BLUE, BLUEP), ('肝臓', '形を変える（1回目）', GRN, GRNP),
             ('腎臓', 'PTHの働きで活性型になる（2回目）', RED, REDP), ('小腸', '活性型ビタミンDがCaの吸収を高める', YEL, YELP)]
    for i, (n, d, c, f) in enumerate(steps):
        y = 14 + i * 100
        b.append(rect(12, y, 536, 74, f, c, 2, 12)); b.append(rect(12, y, 92, 74, c, c, 2, 12))
        b.append(t(58, y + 46, n, 22, '#fff', 'bold', 'middle'))
        fit(d, 18, 420, 'p13_vitd'); b.append(t(118, y + 44, d, 18, INK, 'bold'))
        if i < 3: b.append(arr(58, y + 76, 58, y + 98, MUTED, 3))
    save('p13_vitd', S(W, H, b, 'ビタミンDが皮膚・肝臓・腎臓を経て活性型になり小腸でCa吸収を高める図'))
def p04_umn():
    W, H = 560, 420; b = []
    b.append(rect(12, 12, 536, 64, WASH, LINE, 2, 12))
    b.append(box(24, 22, 120, 44, '大脳皮質', None, PALE, BLUE, 17)); b.append(arr(146, 44, 196, 44, BLUE, 3))
    b.append(box(198, 22, 140, 44, '脊髄の前角', None, PALE, BLUE, 17)); b.append(arr(340, 44, 390, 44, GRN, 3))
    b.append(box(392, 22, 60, 44, '筋', None, GRNP, GRN, 17)); 
    b.append(pill(170, 90, '上位ニューロン', BLUE, 14)); b.append(pill(320, 90, '下位', GRN, 14))
    hd = [('', 150), ('上位の障害', BLUE), ('下位の障害', GRN)]
    b.append(rect(12, 112, 536, 292, '#fff', LINE, 2, 12))
    rows = [('麻痺のかたち', '痙性（つっぱる）', '弛緩性（だらん）'), ('腱反射', '亢進', '低下・消失'),
            ('バビンスキー反射', '出る', '出ない'), ('筋萎縮', '目立たない', '著しい')]
    for i, (k, u, l) in enumerate(rows):
        y = 164 + i * 58
        b.append(line(24, y - 14, 536, y - 14, LINE, 1.5))
        b.append(t(28, y + 18, k, 17, DEEP, 'bold'))
        b.append(t(330, y + 18, u, 17, RED if i in (1, 2) else INK, 'bold', 'middle'))
        b.append(t(468, y + 18, l, 17, INK, 'bold', 'middle'))
    save('p04_umn', S(W, H, b, '上位運動ニューロン障害と下位運動ニューロン障害の比較表'))
def p08_bile():
    W, H = 560, 330; b = []
    b.append(rect(12, 12, 262, 306, BLUEP, BLUE, 2, 12)); b.append(rect(286, 12, 262, 306, YELP, YEL, 2, 12))
    b.append(t(143, 46, '膵液', 24, BLUE, 'bold', 'middle')); b.append(t(417, 46, '胆汁', 24, YEL, 'bold', 'middle'))
    L = [('膵臓でつくる', 17), ('消化酵素あり', 17), ('アミラーゼ・リパーゼ', 16), ('タンパク質分解酵素', 16), ('＋ 重炭酸', 17), ('酸を中和する', 17)]
    R = [('肝臓でつくる', 17), ('胆嚢で濃くして貯める', 17), ('消化酵素はなし', 17), ('胆汁酸が脂肪を', 16), ('細かくする（乳化）', 16), ('十二指腸へ出る', 17)]
    for i, (s, z) in enumerate(L): b.append(t(143, 96 + i * 36, s, z, RED if i in (1, 4) else INK, 'bold' if i in (1, 4) else 'normal', 'middle'))
    for i, (s, z) in enumerate(R): b.append(t(417, 96 + i * 36, s, z, RED if i == 2 else INK, 'bold' if i == 2 else 'normal', 'middle'))
    save('p08_bile', S(W, H, b, '膵液と胆汁の違いの比較図'))
def p08_bili():
    W, H = 560, 540; b = []
    steps = [('古い赤血球', '脾臓などで壊れる', GRAY, WASH), ('間接ビリルビン', '水にとけにくい。アルブミンと結合して血液で運ぶ', YEL, YELP),
             ('肝臓で抱合', '水にとける形にする', GRN, GRNP), ('直接ビリルビン', '胆汁に入って十二指腸へ', BLUE, BLUEP),
             ('腸内細菌が変化', 'ウロビリノゲンになり、大部分は便の色のもとに', RED, REDP)]
    for i, (n, d, c, f) in enumerate(steps):
        y = 14 + i * 92
        b.append(rect(12, y, 536, 68, f, c, 2, 12))
        b.append(t(28, y + 28, n, 19, c if c != GRAY else DEEP, 'bold'))
        fit(d, 15, 506, 'p08_bili'); b.append(t(28, y + 54, d, 15, INK))
        if i < 4: b.append(arr(280, y + 70, 280, y + 90, MUTED, 3))
    b.append(rect(12, 478, 536, 52, '#fff', BLUE, 2, 12, 'stroke-dasharray="6 4"'))
    fit('腸肝循環：胆汁酸は回腸で再吸収され、肝臓へ戻って再利用される', 16, 510, 'p08_bili')
    b.append(t(28, 510, '腸肝循環：胆汁酸は回腸で再吸収され、肝臓へ戻って再利用される', 16, BLUE, 'bold'))
    save('p08_bili', S(W, H, b, 'ヘモグロビンの分解産物ビリルビンが肝臓・胆汁・腸を通る流れの図'))
def p11_gfr():
    W, H = 560, 380; b = []
    b.append(t(28, 34, '物質', 17, DEEP, 'bold')); b.append(t(200, 34, 'ろ過後のゆくえ', 17, DEEP, 'bold')); b.append(t(430, 34, 'ひとこと', 17, DEEP, 'bold'))
    rows = [('イヌリン', '戻らない・足されない', 'GFRをはかる物差し', BLUE), ('クレアチニン', 'ほぼイヌリンと同じ', 'ふだんのGFRの目安', GRN),
            ('グルコース', '全部戻る', '正常では尿に出ない', YEL), ('アルブミン', 'ほとんどろ過されない', '尿に出たら異常', RED)]
    for i, (n, w, d, c) in enumerate(rows):
        y = 50 + i * 80
        b.append(rect(12, y, 536, 68, '#fff', c, 2, 10)); b.append(rect(12, y, 6, 68, c, c, 0, 0))
        b.append(t(28, y + 40, n, 18, c if c != YEL else '#8a5a00', 'bold'))
        fit(w, 15, 190, 'p11_gfr'); b.append(t(200, y + 40, w, 15, INK))
        fit(d, 15, 150, 'p11_gfr'); b.append(t(398, y + 40, d, 15, INK, 'bold'))
    save('p11_gfr', S(W, H, b, 'イヌリン・クレアチニン・グルコース・アルブミンのろ過後のゆくえの比較図'))
def p07_fev1():
    W, H = 560, 400; b = []
    x0, y0, x1, y1 = 70, 318, 520, 40
    b.append(line(x0, y0, x1, y0, MUTED, 2.5)); b.append(line(x0, y0, x0, y1, MUTED, 2.5))
    b.append(t(x1, y0 + 28, '時間（秒）', 15, MUTED, anchor='end')); b.append(t(x0 - 8, y1 - 8, '吐いた量', 15, MUTED))
    xs = x0 + 112  # 1秒
    b.append(line(xs, y0, xs, y1 + 20, YEL, 2, '6 4')); b.append(t(xs, y0 + 24, '1秒', 15, YEL, 'bold', 'middle'))
    b.append(path(f'M{x0},{y0} C{x0+40},{y0-190} {x0+80},{y0-250} {x0+140},{y0-262} L{x1-20},{y0-266}', BLUE, 4))
    b.append(path(f'M{x0},{y0} C{x0+60},{y0-90} {x0+160},{y0-170} {x0+260},{y0-232} L{x1-20},{y0-250}', RED, 4))
    b.append(t(x1 - 20, y0 - 276, '健常', 16, BLUE, 'bold', 'end')); b.append(t(x1 - 20, y0 - 232, '閉塞性（COPDなど）', 16, RED, 'bold', 'end'))
    b.append(t(x1 - 20, y0 - 60, 'いちばん上＝努力肺活量', 15, INK, anchor='end'))
    b.append(rect(12, 356, 536, 34, YELP, YEL, 2, 8))
    b.append(t(28, 379, '1秒率＝1秒でどれだけ吐けたか ÷ 努力肺活量 × 100', 16, INK, 'bold'))
    save('p07_fev1', S(W, 400, b, '1秒率の考え方と、健常と閉塞性換気障害の呼出曲線の比較図'))
def p14_pain():
    W, H = 560, 350; b = []
    cols = [('一次痛', 'Aδ線維', BLUE, BLUEP, ['速い', '鋭い', '場所がはっきり', '有髄']), ('二次痛', 'C線維', RED, REDP, ['遅い', '鈍い', '場所がはっきりしない', '無髄・ポリモーダル'])]
    for i, (n, f1, c, f, L) in enumerate(cols):
        x = 12 + i * 274
        b.append(rect(x, 12, 262, 258, f, c, 2, 12))
        b.append(t(x + 131, 46, n, 23, c, 'bold', 'middle')); b.append(t(x + 131, 76, f1, 19, INK, 'bold', 'middle'))
        b.append(line(x + 14, 90, x + 248, 90, c, 1.5))
        for j, s in enumerate(L):
            fit(s, 17, 240, 'p14_pain'); b.append(t(x + 131, 124 + j * 36, s, 17, INK, anchor='middle'))
    b.append(rect(12, 282, 536, 56, YELP, YEL, 2, 12))
    b.append(t(28, 306, '痛み・温度は自由神経終末で感じる。', 17, INK, 'bold')); b.append(t(28, 328, '温覚と冷覚は、別々の受容器。', 17, INK, 'bold'))
    save('p14_pain', S(W, H, b, '一次痛(Aδ線維)と二次痛(C線維)の比較図'))
def a_brainstem():
    W, H = 560, 430; b = []
    parts = [('中脳', ['動眼神経（Ⅲ）', '滑車神経（Ⅳ）＝背側から出る'], BLUE, BLUEP), ('橋', ['三叉神経（Ⅴ）', '外転神経（Ⅵ）', '顔面神経（Ⅶ）', '内耳神経（Ⅷ）'], GRN, GRNP),
             ('延髄', ['舌咽神経（Ⅸ）', '迷走神経（Ⅹ）', '舌下神経（Ⅻ）'], RED, REDP)]
    y = 14
    for n, L, c, f in parts:
        h = 40 + 30 * len(L)
        b.append(rect(12, y, 536, h, f, c, 2, 12)); b.append(rect(12, y, 92, h, c, c, 2, 12))
        b.append(t(58, y + h / 2 + 8, n, 22, '#fff', 'bold', 'middle'))
        for j, s in enumerate(L):
            fit(s, 18, 410, 'a_brainstem'); b.append(t(122, y + 34 + 30 * j, s, 18, RED if '背側' in s else INK, 'bold' if '背側' in s else 'normal'))
        y += h + 12
    save('a_brainstem', S(W, 14 + sum(40 + 30 * len(L) + 12 for _, L, _, _ in parts) + 4, b, '脳幹の高さ別に見た脳神経核の位置の図'))
def a_eye():
    W, H = 560, 430; b = []
    cx, cy = 280, 215
    b.append(f'<ellipse cx="{cx}" cy="{cy}" rx="92" ry="64" fill="#fff" stroke="{DEEP}" stroke-width="3"/>')
    b.append(circ(cx, cy, 34, BLUEP, DEEP, 3)); b.append(circ(cx, cy, 14, DEEP, DEEP, 1))
    def lab(x, y, s, c, anchor='middle'):
        return pill(x, y, s, c, 15)
    b.append(arr(cx, cy - 66, cx, cy - 112, BLUE, 3)); b.append(lab(cx, 82, '上直筋（動眼）', BLUE))
    b.append(arr(cx, cy + 66, cx, cy + 112, BLUE, 3)); b.append(lab(cx, 352, '下直筋（動眼）', BLUE))
    b.append(arr(cx - 94, cy, cx - 160, cy, BLUE, 3)); b.append(lab(92, cy, '内側直筋（動眼）', BLUE))
    b.append(arr(cx + 94, cy, cx + 160, cy, GRN, 3)); b.append(lab(470, cy, '外側直筋（外転）', GRN))
    b.append(arr(cx - 60, cy - 50, cx - 130, cy - 100, RED, 3)); b.append(lab(110, 100, '上斜筋（滑車）', RED))
    b.append(arr(cx + 60, cy + 50, cx + 130, cy + 100, BLUE, 3)); b.append(lab(450, 330, '下斜筋（動眼）', BLUE))
    b.append(rect(12, 380, 536, 40, YELP, YEL, 2, 8)); b.append(t(28, 406, '外側直筋＝外転、上斜筋＝滑車、残りと上眼瞼挙筋＝動眼', 15, INK, 'bold'))
    save('a_eye', S(W, 430, b, '眼球に付く6つの筋と支配神経の図'))
def c_hepatitis():
    W, H = 560, 340; b = []
    cols = [('A型', BLUE, BLUEP, ['食べ物・水（経口）', '慢性化しない', '―']), ('B型', RED, REDP, ['血液・体液', '慢性化することがある', '劇症化しやすい']),
            ('C型', GRN, GRNP, ['血液', '慢性化しやすい', '肝細胞癌の原因で最多'])]
    labels = ['うつり方', '慢性化', '覚える点']
    for i, (n, c, f, L) in enumerate(cols):
        x = 12 + i * 182
        b.append(rect(x, 12, 172, 280, f, c, 2, 12)); b.append(t(x + 86, 46, n + '肝炎', 21, c, 'bold', 'middle'))
        b.append(line(x + 14, 60, x + 158, 60, c, 1.5))
        for j, s in enumerate(L):
            y = 86 + j * 70
            b.append(t(x + 86, y, labels[j], 13, MUTED, anchor='middle'))
            z = 16 if tw(s, 16) <= 154 else 14
            fit(s, z, 156, 'c_hepatitis'); b.append(t(x + 86, y + 26, s, z, RED if j == 2 and s != '―' else INK, 'bold', 'middle'))
    b.append(rect(12, 304, 536, 28, YELP, YEL, 2, 8)); b.append(t(28, 324, 'A型は食べ物から。B型・C型は血液から。', 15, INK, 'bold'))
    save('c_hepatitis', S(W, 340, b, 'A型・B型・C型ウイルス性肝炎の比較表'))
def c_interview():
    W, H = 560, 330; b = []
    cols = [('開放型の質問', BLUE, BLUEP, ['自由に答えられる', '「どうなさいましたか？」', '「どのようなことで来ましたか？」'], 'はじめに使う'),
            ('閉鎖型の質問', RED, REDP, ['「はい／いいえ」で答える', '「頭は痛みますか？」', '「熱はありますか？」'], '話を絞るときに使う')]
    for i, (n, c, f, L, u) in enumerate(cols):
        x = 12 + i * 274
        b.append(rect(x, 12, 262, 250, f, c, 2, 12)); b.append(t(x + 131, 46, n, 21, c, 'bold', 'middle'))
        b.append(line(x + 14, 60, x + 248, 60, c, 1.5))
        for j, s in enumerate(L):
            z = 15
            fit(s, z, 244, 'c_interview'); b.append(t(x + 131, 96 + j * 40, s, z, INK, 'bold' if j == 0 else 'normal', 'middle'))
        b.append(pill(x + 131, 236, u, c, 15))
    b.append(rect(12, 276, 536, 40, YELP, YEL, 2, 8)); b.append(t(28, 302, 'まず開放型 → あとで閉鎖型で確かめる', 17, INK, 'bold'))
    save('c_interview', S(W, 330, b, '医療面接の開放型質問と閉鎖型質問の比較図'))

for f in (p12_islet, p13_vitd, p04_umn, p08_bile, p08_bili, p11_gfr, p07_fev1, p14_pain, a_brainstem, a_eye, c_hepatitis, c_interview):
    f()
print('wrote', len(os.listdir(OUT)), 'svg;', 'max bytes', max(os.path.getsize(os.path.join(OUT, x)) for x in os.listdir(OUT)))
