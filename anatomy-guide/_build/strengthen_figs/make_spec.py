# -*- coding: utf-8 -*-
"""強化バッチ1の文章を作り、3ガイド用の boxmap.json を出す。[[語]] は答えの赤字。"""
import json, os, re, shutil
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
def conv(s): return re.sub(r'\[\[(.+?)\]\]', r'<span class="answer">\1</span>', s)
def esc(s): return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')
def svg_title(name):
    s = open(os.path.join(OUT, name + '.svg'), encoding='utf-8').read()
    return re.search(r'<title>([^<]*)</title>', s).group(1)
def fig_plain(name):
    return (f'<figure class="mb-fig"><a href="figures/{name}.svg" target="_blank" rel="noopener"><img src="figures/{name}.svg" alt="{esc(svg_title(name))}" '
            f'loading="lazy" decoding="async" width="560"></a></figure>')
def fig_main(name, cap):
    return (f'<figure class="fig fig-diagram"><a href="figures/{name}.svg" target="_blank" rel="noopener"><img src="figures/{name}.svg" alt="{esc(svg_title(name))}" '
            f'loading="lazy" decoding="async" width="560"></a><figcaption><strong>ひとことポイント</strong>　{conv(esc(cap).replace("&lt;","<"))}<small class="fig-zoom">（図をタップすると拡大）</small></figcaption></figure>')
def ul(items): return '<ul class="mb-list">' + ''.join(f'<li>{conv(i)}</li>' for i in items) + '</ul>'

PH_CH = {'01':'basics','02':'muscle','03':'nerve','04':'motor','05':'blood','06':'circulation','07':'respiration','08':'digestion','09':'metabolism','10':'temperature','11':'urine','12':'endocrine','13':'reproduction-bone','14':'sensation','15':'aging'}
def url(g, ref):
    if g == 'phys':
        n, i = ref.split('-'); return f'../physiology-guide/#lesson-{PH_CH[n]}-{i}'
    if g == 'anat': return f'../anatomy-guide/#{ref}'
    u, i = ref.split(':'); return f'../clinical-guide/#sec-{u}-{i}'
GN = {'phys': '生理学', 'anat': '解剖学', 'clin': '一般臨床'}

# ---- つながりで覚える ----
LINK = {
 'sugar': dict(t='血糖（膵臓・インスリン・糖尿病）', fig='x_sugar',
   one='膵島の[[B細胞]]が[[インスリン]]を出す。足りない・効かないと[[糖尿病]]になる。',
   why='血糖が高いと、尿にもブドウ糖が出る。ブドウ糖は水を引っぱるので尿がふえ（多尿）、のどが渇く（多飲）。',
   aid='貯金箱：インスリンは「入れる係」、グルカゴンは「出す係」。1型＝入れる係がいない。2型＝入れる係の力が落ちている。',
   refs={'phys': ('12-5', '膵臓のホルモン'), 'anat': ('endocrine-6', '膵島'), 'clin': ('metabolic:1', '糖尿病')}),
 'ca': dict(t='カルシウム（上皮小体・ビタミンD・腎臓）', fig='x_ca',
   one='[[上皮小体]]（副甲状腺）のホルモン[[PTH]]が、血中の[[カルシウム]]を上げる。',
   why='Caが低いと神経・筋が興奮しやすくなり、[[テタニー]]が出る。腎臓は活性型ビタミンDをつくる所なので、腎臓が弱るとCaを吸えず低くなる。',
   aid='家計簿：残高（血中Ca）が減ると、PTHが取り立て屋になる。骨から出す・腎で節約・腸から仕入れる。',
   refs={'phys': ('13-4', 'カルシウム代謝'), 'anat': ('endocrine-4', '甲状腺と上皮小体'), 'clin': ('renal:3', '慢性腎臓病（CKD）')}),
 'reflex': dict(t='反射（上位・下位ニューロン）', fig='x_reflex',
   one='脳（上位）が壊れると、反射の[[抑え]]が外れて[[腱反射が強く]]なる。',
   why='脊髄の反射には、上から「やりすぎるな」と抑えがかかっている。下位（前角・末梢神経）が壊れると反射の道が切れて、弱くなる・なくなる。',
   aid='社長（脳）が不在だと、現場（反射）が暴走。現場が倒れると、仕事そのものができない。',
   refs={'phys': ('04-4', '複雑な反射と上位中枢'), 'anat': ('cns-7', '錐体路'), 'clin': ('reflex:3', '深部反射')}),
 'liver': dict(t='肝臓・胆汁・黄疸', fig='x_liver',
   one='古い赤血球のカス（[[ビリルビン]]）を、[[肝臓]]が処理して[[胆汁]]に出す。',
   why='肝臓が悪い、または出口の胆道がつまると、ビリルビンが血液にたまり、皮膚や白目が黄色くなる（[[黄疸]]）。',
   aid='宅配便：肝臓は荷物を箱詰めして発送する所。出口がつまると、荷物が倉庫（血液）にあふれる。',
   refs={'phys': ('08-3', '膵液と胆汁'), 'anat': ('digestive-8', '肝臓と胆道'), 'clin': ('digestive:1', '肝炎・胆石（腹痛の部位別）')}),
 'kidney': dict(t='腎臓のふるい（糸球体・ネフローゼ）', fig='x_kidney',
   one='[[糸球体]]は「ふるい」。ふるいが破れる病気が[[ネフローゼ症候群]]。',
   why='戻す力（再吸収）には上限がある。血糖が高すぎると戻しきれずに尿へ出て、水も一緒に出る。',
   aid='洗濯：全部いったん干して（ろ過）、要る服だけ取りこむ（再吸収）。',
   refs={'phys': ('11-1', '糸球体ろ過'), 'anat': ('urinary-3', 'ネフロンと腎小体'), 'clin': ('renal:6', 'ネフローゼ症候群')}),
 'resp': dict(t='呼吸（1秒率・閉塞性・拘束性）', fig='x_resp',
   one='[[1秒率]]が低い＝息を速くはけない（[[閉塞性]]）。肺活量が低い＝ふくらまない（[[拘束性]]）。',
   why='気道がせまいと空気がはき切れず、肺がふくらんだままになる。だから樽状胸になり、打診で鼓音になる。',
   aid='風船：閉塞性＝ふくらんだまま戻らない風船。拘束性＝かたくてふくらまない風船。',
   refs={'phys': ('07-2', '肺気量'), 'anat': ('respiratory-1', '右主気管支'), 'clin': ('respiratory:4', '慢性閉塞性肺疾患（COPD）')}),
 'sens': dict(t='感覚の通り道（深部感覚・ロンベルグ）', fig='x_sens',
   one='[[深部感覚]]の道（後索）が壊れると、[[ロンベルグ]]試験が陽性になる。',
   why='深部感覚が壊れても、ふだんは目で足の位置を見て補っている。目を閉じると補えず、ふらつく。',
   aid='手紙：感覚の手紙は道が別々。深部の道と温痛の道は、別々に壊れる。',
   refs={'phys': ('14-2', '痛覚・温度覚・深部感覚'), 'anat': ('cns-8', '感覚の伝導路'), 'clin': ('sensation:1', '感覚検査の意義')}),
 'eye': dict(t='目を動かす神経（眼筋・瞳孔・眼瞼下垂）', fig='x_eye',
   one='[[上斜筋]]は[[滑車神経]]、[[外側直筋]]は[[外転神経]]、残りは[[動眼神経]]。',
   why='上斜筋は眼の奥から出て、滑車でUターンして付く。だから名前が「滑車神経」。',
   aid='「外は外転、上斜は滑車、残りは動眼」と3つに分けて覚える。',
   refs={'phys': ('03-6', '自律神経（瞳孔）'), 'anat': ('sensory-1', '眼筋と神経支配'), 'clin': ('inspection:8', '頭部・顔面の視診')}),
 'heart': dict(t='心音（弁が閉じる音）', fig='x_heart',
   one='心音は、弁が閉じる音。[[Ⅰ音]]＝房室弁、[[Ⅱ音]]＝動脈弁。',
   why='弁が閉じるとき、血液がぶつかって振動し、音になる。弁がせまい・もれると、ふつうと違う音（雑音）が混ざる。',
   aid='ドア：Ⅰ音は入口のドア（房室弁）がバタン、Ⅱ音は出口のドア（動脈弁）がバタン。',
   refs={'phys': ('06-4', '心周期'), 'anat': ('vascular-1', '心臓の部屋と弁'), 'clin': ('auscultation:3', '心臓の聴診')}),
 'lymph': dict(t='リンパのゆくえ（胸管・リンパ節）', fig='x_lymph',
   one='腹部のリンパは[[胸管]]を通って、[[左]]の首の付け根の静脈（静脈角）に注ぐ。',
   why='胃癌などがリンパに乗って運ばれると、終点の近くの[[左鎖骨上窩リンパ節]]にあらわれる（ウィルヒョウ転移）。',
   aid='ゴミ回収：腹部のゴミ回収トラックの終点は、左の首の付け根。',
   refs={'phys': ('06-5', '血管と毛細血管交換'), 'anat': ('vascular-7', 'リンパの流れ'), 'clin': ('palpation:1', '触診（リンパ節）')}),
}
# 置く場所（ガイド別）。無いものは置かない
PLACE = {
 'phys': {'sugar': '12-5', 'ca': '13-4', 'reflex': '04-4', 'kidney': '11-1', 'resp': '07-2', 'sens': '14-2', 'heart': '06-4', 'lymph': '06-5'},
 'anat': {'sugar': 'endocrine-6', 'ca': 'endocrine-4', 'reflex': 'cns-7', 'liver': 'digestive-8', 'kidney': 'urinary-3', 'resp': 'respiratory-1', 'sens': 'cns-8', 'eye': 'sensory-1', 'heart': 'vascular-1', 'lymph': 'vascular-7'},
 'clin': {'sugar': 'metabolic:1', 'ca': 'renal:3', 'reflex': 'reflex:3', 'liver': 'digestive:1', 'kidney': 'renal:6', 'resp': 'respiratory:4', 'sens': 'sensation:1', 'eye': 'inspection:8', 'heart': 'auscultation:3', 'lymph': 'palpation:1'},
}
def link_box(g, k):
    d = LINK[k]
    links = ''.join(f'<a href="{url(gg, r[0])}">{GN[gg]}：{r[1]}</a>' for gg, r in d['refs'].items() if gg != g)
    html = ('<div class="mb">'
            f'<p><span class="mb-k">つながり</span>{conv(d["one"])}</p>' + fig_plain(d['fig']) +
            f'<p><span class="mb-k">なぜ</span>{conv(d["why"])}</p>'
            f'<p><span class="mb-k">覚え方</span>{conv(d["aid"])}</p>'
            f'<p class="mb-go"><span class="mb-k">ほかの科目</span>{links}</p></div>')
    return dict(kind='link', title='つながりで覚える：' + d['t'], html=html)

# ---- メイン（図＋2〜3行）と「より深く」 ----
MAIN = {'phys': {}, 'anat': {}, 'clin': {}}
DEEP = {'phys': {}, 'anat': {}, 'clin': {}}
def deep(title, html): return dict(kind='deep', title='より深く：' + title, html='<div class="mb">' + html + '</div>')
MAIN['phys']['12-5'] = ul(['膵臓は、消化液（膵液）とホルモンの両方をつくる。', '血糖が上がると、[[インスリン]]が出る。', '血糖が下がると、[[グルカゴン]]が出る。']) + fig_main('p12_islet', '下げるホルモンは1つ（インスリン）、上げるホルモンは何種類もある。なぜ？ 低血糖は脳のエネルギー切れに直結するので、上げる側を多く用意して守っているから。')
MAIN['phys']['04-4'] = ul(['上位ニューロン＝大脳皮質から脊髄の前角まで（[[錐体路]]）。下位＝前角から筋まで。', '上位が壊れると、抑えが外れて[[腱反射が強く]]なる。', '錐体路は、脊髄の前角でニューロンをかえて筋へ行く。']) + fig_main('p04_umn', '上位は「つっぱる・反射が強い」、下位は「だらん・反射が弱い」。なぜ？ 上位が壊れると反射へのブレーキが外れ、下位が壊れると反射の道そのものが切れるから。')
DEEP['phys']['04-4'] = [deep('運動野・陽性支持反射・除脳固縮', ul([
    '一次運動野は[[中心前回]]にある。[[第Ⅴ層]]が発達している。',
    '[[陽性支持反射]]は脊髄反射。足の裏を押されると肢がのびて、体をささえる。',
    '除脳固縮：脳幹で上からのつながりが切れると、手足の伸筋が強くつっぱる。',
    '脊髄で一側の錐体路が切れると、同じ側の随意運動が障害される（交叉より下）。脳の障害は反対側。']))]
MAIN['phys']['08-3'] = ul(['膵液：消化酵素と[[重炭酸]]（酸を中和）。', '胆汁：消化酵素はなし。脂肪を細かくする（[[乳化]]）。', '胆汁は肝臓でつくり、胆嚢で濃くして貯める。']) + fig_main('p08_bile', '膵液は「消化する」、胆汁は「脂肪を細かくして消化を助ける」。なぜ胆汁に酵素がなくてよい？ 胆汁酸が脂肪を小さな粒にすると、膵液のリパーゼが働ける面積がふえるから。')
DEEP['phys']['08-3'] = [deep('ビリルビンの流れと腸肝循環', '<p>古い赤血球のカス（ビリルビン）が、便の色になるまでの流れ。</p>' + fig_plain('p08_bili') + ul(['[[間接ビリルビン]]を[[直接ビリルビン]]に変えるのは肝臓。', '胆汁酸はほとんど再吸収されて、肝臓へ戻る（腸肝循環）。']))]
MAIN['phys']['11-1'] = ul(['[[イヌリン]]はろ過されたあと、戻らず足されもしない。だからGFRの物差しになる。', '[[クレアチニン]]もほぼ同じ動きで、ふだんの目安に使う。', '大きなタンパク質や血球は、ふつう尿に出ない。']) + fig_main('p11_gfr', '正常なら、グルコースはろ過されても全部戻り、尿に出ない。なぜ？ 近位尿細管の輸送体がブドウ糖を回収するが、血糖が高すぎると回収が追いつかず尿に出る（糖尿）。')
MAIN['phys']['07-2'] = ul(['力いっぱい一気に吐いて、1秒で吐けた量（1秒量）を見る。', '[[1秒率]]＝1秒量 ÷ 努力肺活量 × 100。', '[[閉塞性]]（喘息・COPD）では1秒率が下がる。肺活量が下がるのは[[拘束性]]。']) + fig_main('p07_fev1', '気道がせまい閉塞性では、吐き出すのに時間がかかるので1秒率が下がる。なぜ？ せまい管から出す空気は、勢いよく吐いても出る速さが限られるから。')
MAIN['phys']['14-2'] = ul(['痛み・温度は[[自由神経終末]]で感じる。', '温覚と冷覚は、別々の受容器。']) + fig_main('p14_pain', '速い痛みはAδ、遅い痛みはC。なぜ2種類ある？ 速い痛みで素早く危険を知らせ、遅い痛みで「傷ついている」ことを続けて知らせるから。')
DEEP['phys']['13-4'] = [deep('ビタミンDが活性型になるまで', '<p>ビタミンDは、皮膚・肝臓・腎臓を回ってはじめて「活性型」になる。</p>' + fig_plain('p13_vitd') + ul(['腎臓で活性型にするのを促すのが[[PTH]]。', '活性型ビタミンDは、小腸でのCaの吸収を高める。']))]
MAIN['anat']['pns-4'] = ul(['神経の番号は、ほぼ上から順に出る（Ⅲ・Ⅳ＝中脳、Ⅴ〜Ⅷ＝橋、Ⅸ〜Ⅻ＝延髄）。', '背側から出るのは[[滑車神経]]だけ。']) + fig_main('a_brainstem', '番号が小さいほど脳幹の上、大きいほど下。なぜ覚えやすい？ 数字が増えるほど脳幹の下の高さになる、というおおまかな対応があるから。')
MAIN['anat']['sensory-1'] = ul(['[[外側直筋]]＝外転神経、[[上斜筋]]＝滑車神経、残りの眼筋＝[[動眼神経]]。', '上眼瞼挙筋は動眼神経。まぶたに付く筋で、眼球には付かない。']) + fig_main('a_eye', '外は外転、上斜は滑車、残りは動眼。なぜ上斜筋が滑車神経？ 上斜筋は眼の奥から出て、滑車でUターンしてから眼球に付くから。')
MAIN['clin']['digestive:1'] = ul(['肝炎は「うつり方」で分ける。[[A型は食べ物]]、[[B型・C型は血液]]。', '右の季肋部の痛みは、肝臓や胆嚢（胆石症・胆嚢炎）を考える。']) + fig_main('c_hepatitis', 'B型は劇症化しやすく、C型は肝細胞癌の原因で最多。なぜ慢性化が大事？ 慢性の肝炎が長く続くと、肝硬変や肝癌に進みやすいから。')
DEEP['clin']['digestive:1'] = [deep('B型肝炎の検査と胆石', ul(['[[HBs抗原]]＝いまB型ウイルスがいるしるし。急性期は抗原が陽性。', '[[HBs抗体]]＝免疫ができたしるし（治ったあと・ワクチン後）。', '胆石症は、右の季肋部〜心窩部に発作的な痛み（疝痛）が出る。']))]
MAIN['clin']['intro:3'] = ul(['はじめは[[開放型]]（「どうなさいましたか？」）で聞く。', 'あとで[[閉鎖型]]（はい／いいえ）で確かめる。', '話をさえぎらず、決めつけずに聞く。']) + fig_main('c_interview', 'はじめに開放型で聞くと、患者さんが自分の言葉で話せる。なぜ閉鎖型を先にしない？ 先に決めつけた質問をすると、大事な訴えを聞きもらすから。')
DEEP['clin']['intro:3'] = [deep('医療面接のコツ', ul(['うなずきやあいづちで、話しやすくする。', '難しい専門用語は、やさしい言葉に言いかえる。', '厳しい態度や、自分の思い込みで決めつけるのは良くない。', '医療面接で聞くのは自覚症状（本人の訴え）。他覚所見は診察で確認する。']))]
DEEP['clin']['inspection:1'] = [deep('その姿勢になる理由', ul([
    '[[起坐位]]：横になると、心臓や肺の負担がふえて息苦しいので、体を起こして座る。',
    '[[マン・ウェルニッケ姿勢]]：片麻痺（上位ニューロンの障害）で、麻痺側の腕は曲がり、足首は足底側へ曲がる。',
    '[[パーキンソン病]]の前かがみ：姿勢を直す反射が弱く、筋がかたくなるので、体が前に曲がる。',
    '坐骨神経痛の側弯：痛みがやわらぐ姿勢になる。',
    'エビ姿勢（疝痛）：体を丸めると、痛みがやわらぐ。']))]

def build():
    res = {'phys': {}, 'anat': {}, 'clin': {}}
    for g in res:
        for k, loc in PLACE[g].items():
            res[g].setdefault(loc, dict(main='', boxes=[]))['boxes'].append(link_box(g, k))
        for loc, m in MAIN[g].items(): res[g].setdefault(loc, dict(main='', boxes=[]))['main'] = m
        for loc, bl in DEEP[g].items(): res[g].setdefault(loc, dict(main='', boxes=[]))['boxes'] = bl + res[g].setdefault(loc, dict(main='', boxes=[]))['boxes']
    return res
if __name__ == '__main__':
    res = build()
    for g, d in res.items():
        json.dump(d, open(os.path.join(HERE, f'boxmap_{g}.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print(g, 'places', len(d), 'main', sum(1 for v in d.values() if v['main']), 'boxes', sum(len(v['boxes']) for v in d.values()),
              'deep', sum(1 for v in d.values() for b in v['boxes'] if b['kind'] == 'deep'), 'link', sum(1 for v in d.values() for b in v['boxes'] if b['kind'] == 'link'))
