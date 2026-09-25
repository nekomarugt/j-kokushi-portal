import json, re, sys, collections, os
sys.path.insert(0, os.path.dirname(__file__))
from ch01_05 import CH as A
from ch06_10 import CH as B
from ch11_15 import CH as C
import figures
figures.write_all()  # 図解SVG（figures/*.svg）を書き出す
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
OUT = REPO + '/anatomy-guide'
KIJUN_SRC = 'https://www.zaijusei.com/doc/syutudai_kijun_2020.pdf'
MAJOR = {'1':'人体解剖学概説','2':'運動器系','3':'脈管系（循環器系）','4':'消化器系','5':'呼吸器系','6':'泌尿器系','7':'生殖器系','8':'内分泌器系','9':'神経系','10':'感覚器系','11':'体表解剖'}
MID = {
'1-A':'解剖学用語','1-B':'細胞','1-C':'組織','1-D':'器官系','1-E':'人体の発生',
'2-A':'骨','2-B':'骨の連結','2-C':'筋','2-D':'頭部','2-E':'頸部','2-F':'体幹','2-G':'上肢','2-H':'下肢',
'3-A':'概説','3-B':'心臓','3-C':'動脈','3-D':'静脈','3-E':'リンパ系','3-F':'胎児循環',
'4-A':'概説','4-B':'口腔','4-C':'咽頭','4-D':'食道','4-E':'胃','4-F':'小腸','4-G':'大腸','4-H':'肝臓','4-I':'膵臓','4-J':'腹膜',
'5-A':'概説','5-B':'鼻','5-C':'喉頭','5-D':'気管および気管支','5-E':'肺','5-F':'胸膜','5-G':'縦隔',
'6-A':'概説','6-B':'腎臓','6-C':'尿管','6-D':'膀胱','6-E':'尿道',
'7-A':'概説','7-B':'男性生殖器','7-C':'女性生殖器',
'8-A':'概説','8-B':'下垂体','8-C':'上皮小体（副甲状腺）','8-D':'甲状腺','8-E':'副腎','8-F':'膵臓','8-G':'精巣','8-H':'卵巣','8-I':'松果体',
'9-A':'概説（分類・髄膜）','9-B':'脳','9-C':'脊髄','9-D':'伝導路','9-E':'脳神経','9-F':'脊髄神経','9-G':'自律神経',
'10-A':'外皮','10-B':'視覚器','10-C':'聴覚器・平衡覚器','10-D':'味覚器','10-E':'嗅覚器',
'11-A':'体表区分','11-B':'骨格','11-C':'筋','11-D':'脈管','11-E':'神経','11-F':'顔面','11-G':'外皮','11-H':'生体計測',
'11-Z':'（出題基準に明記なし：画像）'}
q = json.load(open(REPO + '/anatomy/questions.json'))
qid = lambda x: f"{x['exam']}-{x['number']}"
qmap = {qid(x): x for x in q}
tag = {}
for line in open(os.path.join(HERE, 'tagmap.txt')):
    e, rest = line.strip().split(':', 1)
    for p in rest.split('|'):
        n, c = p.split(); tag[f"{e}-{n}"] = c
assert set(tag) == set(qmap), 'tag mismatch'
chapters = A + B + C
def conv(s):
    return re.sub(r'\[\[(.+?)\]\]', r'<span class="answer">\1</span>', s)
errors = []
qpoints = collections.defaultdict(list)
total_points = 0
for ch in chapters:
    for p in ch['points']:
        for i in p['qs']:
            if i not in qmap: errors.append(f"{ch['id']} {p['title']}: unknown {i}")
        if len(set(p['qs'])) != len(p['qs']): errors.append(f"dup in {p['title']}")
    # priority order: most past questions first (stable)
    ch['points'].sort(key=lambda p: -len(p['qs']))
    for idx, p in enumerate(ch['points']):
        p['id'] = f"{ch['id']}-{idx+1}"
        p['no'] = f"{ch['number']}-{idx+1:02d}"
        p['anchor'] = conv(p['anchor'])
        p['freq'] = len(p['qs'])
        p['qs'] = sorted(p['qs'], key=lambda s: tuple(map(int, s.split('-'))))
        for i in p['qs']:
            qpoints[i].append(p['id'])
        total_points += 1
    # 中項目 counts
    cnt = collections.Counter(tag[i] for i in qmap if tag[i] in ch['subs'] or (tag[i]=='11-Z' and ch['id']=='surface'))
    ch['kijun'] = [{'code': s, 'name': MID[s], 'count': cnt.get(s, 0)} for s in ch['subs'] + (['11-Z'] if ch['id']=='surface' else [])]
    ch['majorName'] = MAJOR[ch['major']]
    ch['total'] = sum(cnt.values())
    ch['quiz'] = [{'q': a, 'a': b} for a, b in ch['quiz']]
uncovered = [i for i in qmap if i not in qpoints]
if errors or uncovered:
    print('ERRORS', errors); print('UNCOVERED', uncovered); sys.exit(1)
pt_by_id = {p['id']: (ch, p) for ch in chapters for p in ch['points']}
chapter_of_code = {}
for ch in chapters:
    for s in ch['subs']: chapter_of_code[s] = ch['id']
chapter_of_code['11-Z'] = 'surface'
index = {}
for x in q:
    i = qid(x)
    index[i] = {
        'exam': x['exam'], 'number': x['number'], 'year': x.get('fiscalYear'),
        'q': x['question'], 'answer': ' / '.join(x['choices'][a] for a in x['answers']),
        'code': tag[i], 'mid': MID[tag[i]], 'major': MAJOR[tag[i].split('-')[0]],
        'chapter': chapter_of_code[tag[i]], 'points': qpoints[i]}
os.makedirs(OUT + '/data', exist_ok=True)
meta = {'kijunSource': KIJUN_SRC, 'kijunEdition': '柔道整復師国家試験出題基準 2022年版（第30回〜適用、公益財団法人 柔道整復研修試験財団）',
        'questionCount': len(q), 'exams': f"第{min(x['exam'] for x in q)}〜{max(x['exam'] for x in q)}回", 'pointCount': total_points}
with open(OUT + '/content.js', 'w') as f:
    f.write('// 自動生成: _build/build.py から生成（手で直す場合は _build/src/*.py を編集して再生成）\n')
    f.write('window.anatomyGuideMeta = ' + json.dumps(meta, ensure_ascii=False) + ';\n')
    f.write('window.anatomyChapters = ' + json.dumps(chapters, ensure_ascii=False, indent=1) + ';\n')
with open(OUT + '/qindex.js', 'w') as f:
    f.write('// 自動生成: 過去問→出題基準→ポイントの逆引きデータ\n')
    f.write('window.anatomyQIndex = ' + json.dumps(index, ensure_ascii=False) + ';\n')
tags_out = {'source': 'anatomy/questions.json', 'kijun': meta['kijunEdition'], 'kijunUrl': KIJUN_SRC,
            'note': 'code = 大項目番号-中項目記号。11-Z は出題基準に明記のない画像（CT値）問題。1問につき主たる中項目を1つ付与。',
            'tags': {i: {'code': tag[i], 'major': MAJOR[tag[i].split('-')[0]], 'mid': MID[tag[i]], 'points': qpoints[i]} for i in sorted(tag, key=lambda s: tuple(map(int, s.split('-'))))}}
json.dump(tags_out, open(OUT + '/data/question-tags.json', 'w'), ensure_ascii=False, indent=1)
freq = collections.Counter(tag.values())
kj = [{'major': k, 'name': v, 'count': sum(c for code, c in freq.items() if code.split('-')[0] == k),
       'mids': [{'code': c, 'name': MID[c], 'count': freq.get(c, 0)} for c in MID if c.split('-')[0] == k]} for k, v in MAJOR.items()]
json.dump({'source': KIJUN_SRC, 'edition': meta['kijunEdition'], 'frequency': kj}, open(OUT + '/data/kijun-frequency.json', 'w'), ensure_ascii=False, indent=1)
print('chapters', len(chapters), 'points', total_points, 'questions', len(q), 'all covered')
for ch in chapters: print(ch['number'], ch['title'], ch['total'], len(ch['points']))
print('multi-point questions', sum(1 for v in qpoints.values() if len(v) > 1))
