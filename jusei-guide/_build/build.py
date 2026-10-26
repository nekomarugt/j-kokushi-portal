# 柔道整復理論 学習資料のビルド（データの元＝content_src.py ／ 出題対応＝../../jusei_kakomon/topics.json 由来の questions.json の topic）
# 生成：../content.js ../deepdive.js ../../jusei-riron/guidelinks.json ../../data/wrong-links.json(jri) ../../map/data.js(jusei)
import json,html,os,collections,re
H=os.path.dirname(os.path.abspath(__file__)); P=os.path.dirname(os.path.dirname(H))
exec(open(H+'/content_src.py').read())
SM={s['id']:s for s in S}
CH=[('general','総論（骨折・脱臼・軟部組織損傷・治療）','すべての各論の土台。骨折と脱臼の固有症状の対比、治る順番、合併症の時間軸、整復・固定・後療法の原則。',['gfx','gdis','gsoft','gtx']),
    ('shoulder','肩・上腕の骨折','鎖骨・肩甲骨・上腕骨近位端・骨幹部。「骨片を引く筋」と「近くを走る神経」をセットで。',['clav','phum','hshaft','scap']),
    ('elbow','肘の骨折','小児に多い顆上・外顆・内側上顆と、肘頭・橈骨近位端。合併症と後遺症の連鎖が出題の中心。',['supra','lcond','mepi','elbowfx']),
    ('hand','前腕・手の骨折','モンテギア/ガレアッチ、橈骨遠位端、舟状骨、中手骨、指骨。転位の向きは付着する筋で決まる。',['forearm','drad','scaph','meta','phal'])
    ,('dislocation','脱臼（各論）','肩・肘・肩鎖・胸鎖・手指・股・膝蓋骨・顎関節。脱臼の向きと肢位、合併する神経損傷、整復を妨げるものをセットで。',['dshoulder','delbow','dac','dhand','dhip','dpatella','dtmj'])
    ,('soft','軟部組織損傷（各論）','膝の靱帯・半月板を中心に、足関節・大腿下腿の筋、肩・肘・手の軟部組織損傷。検査法は「何を引き出すか」で覚える。',['sknee','sankle','sthigh','src','selbow','swrist'])
    ,('lower','下肢の骨折','大腿骨近位部・骨幹部・遠位部と膝蓋骨、下腿骨、果部、足部。高齢者の転倒と、スポーツの疲労骨折。',['fprox','fshaft','fdist','ftib','fankle','ffoot'])
    ,('trunk','頭部・体幹の損傷','頭部・顔面の骨折、肋骨・胸骨骨折、脊椎・骨盤骨折、頚部・腰部の軟部組織損傷。命に関わる合併損傷を見逃さない。',['tskull','trib','tspine','tneck'])]
KEY={'clav':['中央・遠位1/3境界部','胸鎖乳突筋','腕神経叢損傷'],'phum':['外科頚骨折','前内方凸','前外方凸','腋窩神経損傷','骨頭壊死'],'hshaft':['前外方凸','橈骨神経麻痺','偽関節'],
 'supra':['伸展型','後上方','阻血性拘縮','内反肘'],'lcond':['回転転位','外反肘','遅発性尺骨神経麻痺'],'mepi':['前腕屈筋群','尺骨神経'],'elbowfx':['上腕三頭筋','橈骨頚部'],
 'forearm':['橈骨頭の脱臼','後骨間神経','遠位橈尺関節の脱臼','円回内筋付着部'],'drad':['背側・橈側','フォーク状変形','銃剣状変形','掌側','長母指伸筋腱の断裂'],
 'scaph':['腰部','嗅ぎタバコ窩','近位骨片','偽関節'],'meta':['背側凸','ボクサー骨折','長母指外転筋','オーバーラッピングフィンガー'],'phal':['掌側凸','浅指屈筋','伸展位'],'scap':['直達外力'],
 'gfx':['病的骨折','異常可動性','軋轢音','併発症','続発症','後遺症'],'gdis':['弾発性固定','ボタン穴機構','反復性脱臼'],'gsoft':['二関節筋','セドンの分類','ワーラー変性','ティネル徴候'],'gtx':['上下の関節','良肢位','折転帯','麦穂帯'],
 'dshoulder':['烏口下脱臼','三角筋のふくらみが消えて','腋窩神経損傷','バンカート損傷','ヒル・サックス損傷'],'delbow':['後方脱臼','輪状靱帯','回内位'],'dac':['烏口鎖骨靱帯','ピアノキー症状','後方脱臼'],'dhand':['掌側板','ボタン穴機構','正中神経'],'dhip':['屈曲・内転・内旋位','坐骨神経損傷','大腿骨頭壊死'],'dpatella':['外側脱臼','アプリヘンションテスト','内側膝蓋大腿靱帯'],'dtmj':['前方脱臼','開口位','口内法'],
 'sknee':['前方引き出しテスト','後方落ち込み','外反ストレステスト','不幸の三徴','ロッキング'],'sankle':['前距腓靱帯','トンプソンテスト'],'sthigh':['大腿二頭筋長頭','骨化性筋炎','コンパートメント症候群'],'src':['棘上筋腱','ドロップアームテスト','ヤーガソンテスト'],'selbow':['離断性骨軟骨炎','短橈側手根伸筋','トムセンテスト'],'swrist':['長母指外転筋と短母指伸筋','フィンケルシュタインテスト'],
 'fprox':['骨頭への血流が絶たれやすく','出血が多い','短縮し外旋位'],'fshaft':['腸腰筋','中殿筋・小殿筋','内転筋群','出血性ショック'],'fdist':['腓腹筋','膝窩動脈','横骨折'],'ftib':['開放骨折','疾走型','跳躍型'],'fankle':['両果骨折','三果骨折'],'ffoot':['脊椎（胸腰椎移行部）の圧迫骨折','骨壊死','短腓骨筋','ジョーンズ骨折','行軍骨折'],
 'tskull':['髄液漏','バトル徴候','吹き抜け骨折'],'trib':['介達痛','気胸・血胸','動揺胸郭・奇異呼吸'],'tspine':['胸腰椎移行部','脊髄損傷','出血性ショック','上前腸骨棘','下前腸骨棘','坐骨結節'],'tneck':['スパーリングテスト','SLRテスト','FNSテスト']}
QS=json.load(open(P+'/jusei-riron/questions.json')); QM={q['id']:q for q in QS}
def rk(i): a,b=i.split('-'); return (-int(a),int(b))
e=html.escape
CH=[c for c in CH if all(i in SM for i in c[3])]
chapters=[];secs={};tid2sec={}
for ci,(cid,ct,cin,ids) in enumerate(CH):
    num='%02d'%(ci+1); sl=[]; quiz=[]
    for i,sid in enumerate(ids,1):
        s=SM[sid]; key=num+'-'+str(i); [tid2sec.__setitem__(t,(key,cid,i,s)) for t in s['tid'].split('|')]
        secs[key]=dict(t=s['title'],c=cid,cn=ct,i=i)
        pts=[]
        for p in s['points']:
            x=e(p)
            for k in KEY.get(sid,[]): x=x.replace(e(k),'<span class="answer">'+e(k)+'</span>',1)
            pts.append('<li>'+x+'</li>')
        anchor='<p>'+e(s['lead'])+'</p><ul>'+''.join(pts)+'</ul>'
        expl='なぜ？　'+'　'.join(w[0]+' → '+w[1] for w in s['why'])
        boxes=[]
        link='<p>'+''.join('<a href="%s">%s →</a>　'%(u,e(n)) for n,u in s['conn'])+'<a href="../map/#jusei">頻出MAPで位置を見る →</a></p>'
        if s['old']: link+='<p>用語メモ：'+e(s['old'])+'</p>'
        ids_q=sorted([q['id'] for q in QS if q.get('topic') in s['tid'].split('|')],key=rk)
        link+='<p>この節の過去問（新しい順）：</p><ul>'+''.join('<li><a href="../jusei-riron/?qid=%s">第%s回 問%s：%s</a></li>'%(q,q.split('-')[0],q.split('-')[1],e(QM[q]['question'][:50])) for q in ids_q[:8])+'</ul>'
        boxes.append(dict(kind='link',title='つながりで覚える：解剖・頻出MAP・過去問',html=link))
        for t,b in s['deep']: boxes.append(dict(kind='deep',title='より深く：'+t,html='<p>'+e(b)+'</p>'))
        sec=dict(title=s['title'],anchor=anchor,explanation=expl,question=s['why'][0][0],answer=s['why'][0][1],boxes=boxes)
        if s['fig']: sec['illustrations']=[dict(src='figures/'+s['fig'][0],caption=s['fig'][1])]
        sl.append(sec); quiz+= [dict(q=w[0],a=w[1]) for w in s['why'][1:]]
    chapters.append(dict(id=cid,number=num,title=ct,intro=cin,sections=sl,quiz=quiz))
hdr='// 生成ファイル：_build/build.py が _build/content_src.py から作る。直接編集しない。\n'
open(P+'/jusei-guide/content.js','w').write(hdr+'window.juseiChapters = '+json.dumps(chapters,ensure_ascii=False,indent=1)+';\n')
DD={'trunk':[dict(title='頭部・体幹は「まず命に関わるものを除外」',shortcut='意識・呼吸・出血・麻痺を先に確認する。',mechanism='頭部・胸部・骨盤・脊椎の損傷は、脳・肺・大血管・脊髄といった重要な臓器の損傷を伴うことがある。骨折そのものより合併損傷が命を左右する。',folded='受傷直後は症状が軽く、時間が経ってから悪化するものもある（頭蓋内出血など）。',exam='合併症の組合せ、医療機関へつなぐべきサインが問われる。')],
 'lower':[dict(title='下肢の骨折は「血流」と「全身」で考える',shortcut='頚部・距骨・脛骨下部は血流が乏しく治りにくい。大腿は出血が多い。',mechanism='骨癒合には骨片への血流が欠かせない。関節包内や筋に覆われない部位は血流が乏しい。一方、筋の厚い大腿は出血が多く、全身状態に影響する。',folded='高齢者では骨折そのものより、寝たきりによる全身の合併症が生命予後を左右する。',exam='治りにくい骨折・合併症の組合せがよく問われる。')],
 'soft':[dict(title='検査法は「何を引き出すか」で覚える',shortcut='引き出し＝前後のずれ、ストレス＝内外反のずれ、ねじり＝半月板。',mechanism='靱帯はそれぞれ決まった向きのずれを止めている。検査はその向きに力をかけ、ずれ（不安定性）や痛みが出るかを見る。',folded='痛みや筋の緊張が強い急性期は、陰性に出ることがある。',exam='「〇〇損傷で陽性になる検査はどれか」型で毎年のように出る。')],
 'dislocation':[dict(title='脱臼の肢位は「外れた骨頭を周りが押さえる向き」',shortcut='肩前方＝軽い外転・内旋、股後方＝屈曲・内転・内旋、肘後方＝軽い屈曲。',mechanism='外れた骨頭は、緊張した関節包・靱帯・筋によって一定の位置に固定される。そのため脱臼の向きごとに決まった肢位で弾発性固定になる。',folded='骨折を合併すると典型的な肢位にならないことがある。',exam='「脱臼の向き」と「肢位」「合併する神経損傷」の組合せが繰り返し出る。')],
 'general':[dict(title='骨折と脱臼は「症状の向き」が逆',shortcut='骨折は動かない所が動く、脱臼は動く関節が動かない。',mechanism='骨折は骨の連続性が切れるため異常可動性・軋轢音が出る。脱臼は骨頭が関節包・靱帯・筋に引っ張られて異常な位置に留められるため弾発性固定が出る。',folded='脱臼骨折では両方の所見が混ざる。',exam='固有症状と一般症状の区別、骨折と脱臼の症状の取り違えを狙う問題が多い。')],
 'shoulder':[dict(title='鎖骨骨折の転位は「3つの力」で説明できる',shortcut='近位骨片は上、遠位骨片は下・前内方・短縮。',mechanism='近位骨片には胸鎖乳突筋の上向きの牽引、遠位骨片には上肢の重さと大胸筋などの前内方への牽引がかかる。鎖骨という支柱が切れたため、肩は下・内・前へ落ちる。',folded='遠位端部の骨折は烏口鎖骨靱帯との位置関係で安定性が変わるため、定型的転位の説明はそのまま当てはまらない。',exam='転位の向きと「作用する筋」の組合せ、来所時の姿勢が繰り返し問われる。')],
 'elbow':[dict(title='顆上骨折と肘関節後方脱臼の見分け',shortcut='骨折は軋轢音・異常可動性、脱臼は弾発性固定。',mechanism='顆上骨折は関節より近位で骨が切れるため、上腕骨内側上顆・外側上顆・肘頭の位置関係は保たれる。脱臼では関節の位置関係そのものが崩れる。',folded='腫脹が強いと触診での判定は難しく、X線で確認する。',exam='ヒューター線・三角の関係、症状の組合せとして出る。')],
 'hand':[dict(title='骨片の向きは「付着する筋」で決まる',shortcut='中手骨は背側凸、基節骨は掌側凸、中節骨は浅指屈筋付着部の前後で反転。',mechanism='骨折部をまたいで付く筋が、どちらの骨片をどちら向きに引くかで変形の凸の向きが決まる。骨間筋・虫様筋はMP関節を屈曲させ、浅指屈筋は中節骨に付く。',folded='実際には受傷時の外力の向きも転位に影響する。',exam='「骨折部が背側凸になるのはどれか」型で問われる。')]}
open(P+'/jusei-guide/deepdive.js','w').write(hdr+'window.juseiDeepDives = '+json.dumps(DD,ensure_ascii=False,indent=1)+';\n')
gl=dict(note='柔道整復理論の過去問↔学習資料(jusei-guide)の対応。topics.json（キーワード自動判定）による主節のみ。キーは 回-問題番号。',
  chapters=[dict(id=c[0],n='%02d'%(i+1),t=c[1]) for i,c in enumerate(CH)],sections=secs,
  map={q['id']:[tid2sec[q['topic']][0]] for q in QS if q.get('topic') in tid2sec})
json.dump(gl,open(P+'/jusei-riron/guidelinks.json','w'),ensure_ascii=False,separators=(',',':'))
wl=json.load(open(P+'/data/wrong-links.json'))
wl['jri']={q:['../jusei-guide/#lesson-%s-%d'%(tid2sec[QM[q]['topic']][1],tid2sec[QM[q]['topic']][2]),tid2sec[QM[q]['topic']][3]['title']] for q in gl['map']}
json.dump(wl,open(P+'/data/wrong-links.json','w'),ensure_ascii=False,separators=(',',':'))
src=open(P+'/map/data.js').read(); pre=src[:src.index('=')+1]; D=json.loads(src[src.index('=')+1:].rstrip().rstrip(';'))
for m in D['jusei']['majors']:
    for r in m['rows']:
        t=r['id'].replace('-',':',1)
        r['r']='../jusei-guide/#lesson-%s-%d'%(tid2sec[t][1],tid2sec[t][2]) if t in tid2sec else ''
open(P+'/map/data.js','w').write(pre+json.dumps(D,ensure_ascii=False,separators=(',',':'))+';\n')
print(len(gl['map']),'questions linked')
