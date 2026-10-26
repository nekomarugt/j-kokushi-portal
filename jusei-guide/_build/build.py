# 柔道整復理論 学習資料のビルド（データの元＝content_src.py ／ 出題対応＝../../jusei_kakomon/topics.json 由来の questions.json の topic）
# 生成：../content.js ../deepdive.js ../../jusei-riron/guidelinks.json ../../data/wrong-links.json(jri) ../../map/data.js(jusei)
import json,html,os,collections,re
H=os.path.dirname(os.path.abspath(__file__)); P=os.path.dirname(os.path.dirname(H))
exec(open(H+'/content_src.py').read())
SM={s['id']:s for s in S}
CH=[('general','総論（骨折・脱臼・軟部組織損傷・治療）','すべての各論の土台。骨折と脱臼の固有症状の対比、治る順番、合併症の時間軸、整復・固定・後療法の原則。',['gfx','gdis','gsoft','gtx']),
    ('shoulder','肩・上腕の骨折','鎖骨・肩甲骨・上腕骨近位端・骨幹部。「骨片を引く筋」と「近くを走る神経」をセットで。',['clav','phum','hshaft','scap']),
    ('elbow','肘の骨折','小児に多い顆上・外顆・内側上顆と、肘頭・橈骨近位端。合併症と後遺症の連鎖が出題の中心。',['supra','lcond','mepi','elbowfx']),
    ('hand','前腕・手の骨折','モンテギア/ガレアッチ、橈骨遠位端、舟状骨、中手骨、指骨。転位の向きは付着する筋で決まる。',['forearm','drad','scaph','meta','phal'])]
KEY={'clav':['中央・遠位1/3境界部','胸鎖乳突筋','腕神経叢損傷'],'phum':['外科頚骨折','前内方凸','前外方凸','腋窩神経損傷','骨頭壊死'],'hshaft':['前外方凸','橈骨神経麻痺','偽関節'],
 'supra':['伸展型','後上方','阻血性拘縮','内反肘'],'lcond':['回転転位','外反肘','遅発性尺骨神経麻痺'],'mepi':['前腕屈筋群','尺骨神経'],'elbowfx':['上腕三頭筋','橈骨頚部'],
 'forearm':['橈骨頭の脱臼','後骨間神経','遠位橈尺関節の脱臼','円回内筋付着部'],'drad':['背側・橈側','フォーク状変形','銃剣状変形','掌側','長母指伸筋腱の断裂'],
 'scaph':['腰部','嗅ぎタバコ窩','近位骨片','偽関節'],'meta':['背側凸','ボクサー骨折','長母指外転筋','オーバーラッピングフィンガー'],'phal':['掌側凸','浅指屈筋','伸展位'],'scap':['直達外力'],
 'gfx':['病的骨折','異常可動性','軋轢音','併発症','続発症','後遺症'],'gdis':['弾発性固定','ボタン穴機構','反復性脱臼'],'gsoft':['二関節筋','セドンの分類','ワーラー変性','ティネル徴候'],'gtx':['上下の関節','良肢位','折転帯','麦穂帯']}
QS=json.load(open(P+'/jusei-riron/questions.json')); QM={q['id']:q for q in QS}
def rk(i): a,b=i.split('-'); return (-int(a),int(b))
e=html.escape
chapters=[];secs={};tid2sec={}
for ci,(cid,ct,cin,ids) in enumerate(CH):
    num='%02d'%(ci+1); sl=[]; quiz=[]
    for i,sid in enumerate(ids,1):
        s=SM[sid]; key=num+'-'+str(i); tid2sec[s['tid']]=(key,cid,i,s)
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
        ids_q=sorted([q['id'] for q in QS if q.get('topic')==s['tid']],key=rk)
        link+='<p>この節の過去問（新しい順）：</p><ul>'+''.join('<li><a href="../jusei-riron/?qid=%s">第%s回 問%s：%s</a></li>'%(q,q.split('-')[0],q.split('-')[1],e(QM[q]['question'][:50])) for q in ids_q[:8])+'</ul>'
        boxes.append(dict(kind='link',title='つながりで覚える：解剖・頻出MAP・過去問',html=link))
        for t,b in s['deep']: boxes.append(dict(kind='deep',title='より深く：'+t,html='<p>'+e(b)+'</p>'))
        sec=dict(title=s['title'],anchor=anchor,explanation=expl,question=s['why'][0][0],answer=s['why'][0][1],boxes=boxes)
        if s['fig']: sec['illustrations']=[dict(src='figures/'+s['fig'][0],caption=s['fig'][1])]
        sl.append(sec); quiz+= [dict(q=w[0],a=w[1]) for w in s['why'][1:]]
    chapters.append(dict(id=cid,number=num,title=ct,intro=cin,sections=sl,quiz=quiz))
hdr='// 生成ファイル：_build/build.py が _build/content_src.py から作る。直接編集しない。\n'
open(P+'/jusei-guide/content.js','w').write(hdr+'window.juseiChapters = '+json.dumps(chapters,ensure_ascii=False,indent=1)+';\n')
DD={'general':[dict(title='骨折と脱臼は「症状の向き」が逆',shortcut='骨折は動かない所が動く、脱臼は動く関節が動かない。',mechanism='骨折は骨の連続性が切れるため異常可動性・軋轢音が出る。脱臼は骨頭が関節包・靱帯・筋に引っ張られて異常な位置に留められるため弾発性固定が出る。',folded='脱臼骨折では両方の所見が混ざる。',exam='固有症状と一般症状の区別、骨折と脱臼の症状の取り違えを狙う問題が多い。')],
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
