"""一般臨床医学の資料に「はり灸で出る」閉じた箱を入れる（何度実行しても同じ結果）。
元データ: tools/hk_clinical_boxes.json（はり灸ポータルの共通倉庫 tools/clinical_wh から書き出したもの。
           はり灸のみの病気・詳しい所だけ。柔整の本文は書き換えない）
"""
import json, os, re
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
G = R + "/clinical-guide/"
HK = "https://nekomarugt.github.io/hari-kyu-portal/"
BOX = json.load(open(R + "/tools/hk_clinical_boxes.json"))
# 柔整の資料での置き場所（倉庫の jz が空・総論の節は、ここで決める）
WHERE = {"S1-14": "neurology:機能性疾患", "S2-04": "g:auscultation:３．心臓の聴診", "S1-10": "hk_extra:", "S2-09": "hk_extra:", "S3-02": "hk_extra:"}
GROUP = [("運動器（はり灸の臨床医学各論）", "K12"), ("皮膚・眼・耳鼻・乳腺", "K13"), ("精神・心身医学", "K14"), ("女性疾患", "K7"),
         ("感染症・神経・そのほか", "K1|K2|K3|K6|K10|K11|K16"), ("総論（症候・診察・検査・治療）", "S")]
def conv(h):
    h = h.replace('class="g-list"', 'class="mb-list"').replace('class="g-tblw"', 'class="mb-tblw"').replace('class="g-tbl"', 'class="mb-tbl"')
    h = h.replace('class="g-one"', 'class="mb-one"').replace('class="g-links"', 'class="mb-links"').replace('class="g-h4"', 'class="mb-h4"')
    h = h.replace('href="figures/k_cervical_root.svg"', 'href="./hk/k_cervical_root.svg"').replace('src="figures/k_cervical_root.svg"', 'src="./hk/k_cervical_root.svg"')
    h = re.sub(r'href="\.\./(anatomy|physiology)/', lambda m: f'target="_blank" rel="noopener" href="{HK}guide/{m.group(1)}/', h)
    h = h.replace('href="https://nekomarugt.github.io/j-kokushi-portal/clinical-guide/#', 'href="#').replace('href="https://nekomarugt.github.io/j-kokushi-portal/jusei-guide/#', 'href="../jusei-guide/#')
    h = h.replace('詳しくは総論「ホルネル症候群と肺癌の局所症状」。', '').replace("柔整の資料（一般臨床「関節リウマチ」）と共通", "柔整の資料（一般臨床「関節リウマチ」）と同じ")
    h = h.replace("柔整の資料で見る", "柔整の資料で見る（共通）").replace("柔整の資料と共通（上の「関節炎」の節にリンク）", "柔整の資料と同じ（「関節炎」の箱のリンク）")
    h = h.replace('loading="lazy" decoding="async" ', '')
    return h
def box(e):
    t = f'はり灸で出る：{e["t"]}' + (f'（はり灸の過去問{e["np"]}問）' if e["np"] else "（はり灸の出題基準）")
    return {"type": "box", "kind": "hk", "id": "hk-" + e["id"], "title": t, "html": conv(e["html"]) + f'<p class="mb-hkq"><a href="{HK}guide/{"souron" if e["id"][0] == "S" else "kakuron"}/#{e["id"]}" target="_blank" rel="noopener">はり灸の学習資料で見る（{e["id"]}）</a></p>'}
def load(f):
    s = open(G + f).read(); i = s.index("="); return s[:i + 1], json.loads(s[i + 1:].rstrip().rstrip(";"))
def save(f, pre, d): open(G + f, "w").write(pre + json.dumps(d, ensure_ascii=False, separators=(",", ":")) + ";\n")
def clean(blocks): return [b for b in blocks if not (b.get("type") == "box" and str(b.get("id", "")).startswith("hk-"))]
def insert_after_heading(blocks, text, newb):
    idx = [i for i, b in enumerate(blocks) if b.get("type") == "heading" and b.get("text") == text]
    if not idx: return False
    i = idx[0]; lv = blocks[i]["level"]; j = i + 1
    while j < len(blocks) and not (blocks[j].get("type") == "heading" and blocks[j]["level"] <= lv): j += 1
    blocks[j:j] = newb; return True
pre_d, D = load("disease-content.js"); pre_g, Gc = load("content.js")
D["chapters"] = [c for c in D["chapters"] if c["id"] != "hk_extra"]
for c in D["chapters"]: c["blocks"] = clean(c["blocks"])
for s in Gc["sections"]: s["blocks"] = clean(s["blocks"])
chap = {c["id"]: c for c in D["chapters"]}; gsec = {s["id"]: s for s in Gc["sections"]}
extra = []; placed = {}
for e in BOX:
    jz = WHERE.get(e["id"], e["jz"]) or "hk_extra:"
    b = box(e)
    if jz.startswith("g:"):
        _, sid, hd = jz.split(":", 2); ok = insert_after_heading(gsec[sid]["blocks"], hd, [b])
    elif jz.startswith("hk_extra"): ok = False
    else:
        cid, hd = jz.split(":", 1); ok = insert_after_heading(chap[cid]["blocks"], hd, [b]) if hd else False
        if ok and e["id"] == "S1-06":   # 腕神経叢の下位の損傷とホルネル（柔整理論で出る）は本文に1行
            m = {"type": "box", "kind": "main", "id": "hk-S1-06-main", "html": '<ul class="mb-list"><li>腕神経叢の下位（C8・T1）の引き抜き損傷では、同じ側に<span class="answer">ホルネル症候群</span>（眼瞼下垂・縮瞳・眼球陥凹）を伴うことがある（柔整理論で出題）。</li></ul>'}
            bl = chap[cid]["blocks"]; h = next(i for i, x in enumerate(bl) if x.get("type") == "heading" and x.get("text") == hd)
            k = next(i for i in range(h + 1, len(bl)) if str(bl[i].get("id", "")).startswith("hk-")); bl.insert(k, m)
    if not ok: extra.append((e, b))
    placed[e["id"]] = jz if ok else "hk_extra"
def note(i, t): return {"type": "note", "id": i, "segments": [{"text": t, "answer": False}]}
def ingroup(i, pat):
    dai = i.split("-")[0]
    return dai[0] == "S" if pat == "S" else dai in pat.split("|")
blocks = [{"type": "heading", "level": 1, "text": "この章について"},
          note("hk-n-intro", "はり師・きゅう師の国家試験（臨床医学総論・各論）で出る分野のうち、柔整の一般臨床医学の資料にない所を、閉じた箱にまとめた章です。柔整の試験対策としては読まなくてかまいません。"),
          {"type": "box", "kind": "main", "id": "hk-intro", "html": '<ul class="mb-list"><li>箱の中の赤字は「赤字を隠す」で隠せます。くわしくは<a href="' + HK + 'guide/kakuron/" target="_blank" rel="noopener">はり灸の学習資料</a>へ。</li></ul>'}]
for name, pat in GROUP:
    items = [b for e, b in extra if ingroup(e["id"], pat)]
    if items: blocks += [{"type": "heading", "level": 1, "text": name}, note("hk-n-" + pat[:3], f"柔整の一般臨床医学の資料では扱っていない所です。下の箱（{len(items)}項目）を開いて読みます。")] + items
left = [b for e, b in extra if not any(ingroup(e["id"], p) for _, p in GROUP)]
assert not left, [b["id"] for b in left]
D["chapters"].append({"id": "hk_extra", "title": "はり灸で出る分野", "summary": "運動器・皮膚・眼・耳鼻・精神など（閉じた箱）", "source": "はり灸ポータルの共通倉庫", "blocks": blocks})
save("disease-content.js", pre_d, D); save("content.js", pre_g, Gc)
print("boxes", len(BOX), "in place", sum(1 for v in placed.values() if v != "hk_extra"), "extra chapter", len(extra))
