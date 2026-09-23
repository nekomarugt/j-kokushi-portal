#!/usr/bin/env python3
"""Apply high-confidence QA fixes to clinical/physiology study guides."""
from __future__ import annotations

import json
import re
from copy import deepcopy
from pathlib import Path

ROOT = Path("/workspace/j-kokushi-portal")
LOG = []  # list of dicts for report


def log(file, loc, before, after, kind, note=""):
    LOG.append(
        {
            "file": file,
            "loc": loc,
            "before": before,
            "after": after,
            "kind": kind,
            "note": note,
            "fixed": before != after,
        }
    )


def load_js_json(path: Path, prefix: str):
    text = path.read_text(encoding="utf-8")
    m = re.search(rf"window\.{re.escape(prefix)}\s*=\s*", text)
    if not m:
        raise ValueError(prefix)
    obj, end = json.JSONDecoder().raw_decode(text, m.end())
    suffix = text[end:]  # usually ";\n"
    prefix_text = text[: m.end()]
    return obj, prefix_text, suffix


def dump_js_json(path: Path, prefix_text: str, obj, suffix: str):
    # Compact JSON like original (no spaces) to keep file style close
    body = json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
    path.write_text(prefix_text + body + suffix, encoding="utf-8")


def join_segments(segs):
    return "".join(s.get("text", "") for s in segs)


def replace_in_segments(segs, old, new, file, loc, kind, note=""):
    """Replace first occurrence spanning segments if needed; simple per-segment first."""
    full = join_segments(segs)
    if old not in full:
        return False
    # Prefer per-segment replace when old is wholly in one segment
    for s in segs:
        if old in s.get("text", ""):
            before = s["text"]
            s["text"] = before.replace(old, new, 1)
            log(file, loc, before, s["text"], kind, note)
            return True
    # Span across segments: rebuild
    new_full = full.replace(old, new, 1)
    # put everything into first segment, clear others' matching span — too risky.
    # Fall back: replace character-wise by concatenating into first and adjusting
    # Safer approach: if old appears when joined, do sequential eat
    remaining_old = old
    remaining_new = new
    replaced = False
    for s in segs:
        t = s.get("text", "")
        if not remaining_old:
            break
        # find overlap of remaining_old prefix with t
        if remaining_old.startswith(t) and t:
            # whole segment is part of old
            if not replaced:
                s["text"] = remaining_new
                remaining_new = ""
                replaced = True
            else:
                s["text"] = ""
            remaining_old = remaining_old[len(t) :]
        elif t.find(remaining_old) >= 0:
            before = t
            s["text"] = t.replace(remaining_old, remaining_new, 1)
            log(file, loc, before, s["text"], kind, note)
            return True
        elif any(remaining_old.startswith(t[i:]) for i in range(len(t)) if t[i:]):
            # partial at end
            for i in range(len(t)):
                suf = t[i:]
                if remaining_old.startswith(suf) and suf:
                    if not replaced:
                        s["text"] = t[:i] + remaining_new
                        remaining_new = ""
                        replaced = True
                    else:
                        s["text"] = t[:i]
                    remaining_old = remaining_old[len(suf) :]
                    break
    if replaced or old not in join_segments(segs):
        log(file, loc, old, new, kind, note + " (multi-segment)")
        return True
    return False


def replace_in_text_field(obj, key, old, new, file, loc, kind, note=""):
    if key not in obj:
        return False
    if old not in obj[key]:
        return False
    before = obj[key]
    obj[key] = before.replace(old, new, 1)
    log(file, loc, before, obj[key], kind, note)
    return True


def fix_clinical_content():
    path = ROOT / "clinical-guide" / "content.js"
    data, prefix_text, suffix = load_js_json(path, "CLINICAL_CONTENT")
    file = "clinical-guide/content.js"

    # Global string replacements on headings and note texts
    typo_repls = [
        ("プライバシ―", "プライバシー", "typo", "長音符修正"),
        ("主 訴", "主訴", "typo", "OCR空白"),
        ("感 覚", "感覚", "typo", "OCR空白"),
        ("があ るがとうか判断できる", "があるかどうか判断できる", "typo", "OCR崩れ"),
        ("肥 満度", "肥満度", "typo", "OCR空白"),
        ("橈骨神 経麻痺", "橈骨神経麻痺", "typo", "OCR空白"),
        ("神 経・", "神経・", "typo", "OCR空白"),
        ("神経麻 痺", "神経麻痺", "typo", "OCR空白"),
        ("洞性不 整脈", "洞性不整脈", "typo", "OCR空白"),
        ("脈拍 数", "脈拍数", "typo", "OCR空白"),
        ("右側副部", "右側腹部", "typo", "誤字（側腹部）"),
        ("診察 の意義", "診察の意義", "typo", "OCR空白"),
        ("１ ０ ． 胸部の視診", "１０．胸部の視診", "typo", "OCR番号空白"),
        ("１ １ ． 腹部の視診", "１１．腹部の視診", "typo", "OCR番号空白"),
        ("１ ２ ． 四肢の視診", "１２．四肢の視診", "typo", "OCR番号空白"),
        ("２ ． 問診の内容", "２．問診の内容", "typo", "OCR空白"),
        ("８ ． 頭部・顔面の視診", "８．頭部・顔面の視診", "typo", "OCR空白"),
        ("ベル現象 と は？", "ベル現象とは？", "typo", "OCR空白"),
        ("ヘバーデン 結 節", "ヘバーデン結節", "typo", "OCR空白"),
        ("尖 足", "尖足", "typo", "OCR空白"),
        ("踵 足", "踵足", "typo", "OCR空白"),
        ("ど のように", "どのように", "typo", "OCR空白"),
    ]

    for sec in data["sections"]:
        sid = sec["id"]
        for bi, block in enumerate(sec["blocks"]):
            loc = f"{sid}/blocks[{bi}]"
            if block.get("type") == "heading":
                for old, new, kind, note in typo_repls:
                    if old in block.get("text", ""):
                        before = block["text"]
                        block["text"] = before.replace(old, new)
                        log(file, loc, before, block["text"], kind, note)
            elif block.get("type") == "note":
                segs = block.get("segments", [])
                full = join_segments(segs)
                for old, new, kind, note in typo_repls:
                    if old in full:
                        replace_in_segments(
                            segs, old, new, file, loc + f"/note:{block.get('id')}", kind, note
                        )
                        full = join_segments(segs)
            elif block.get("type") == "table":
                for ri, row in enumerate(block.get("rows", [])):
                    for ci, cell in enumerate(row):
                        cloc = f"{loc}/r{ri}c{ci}"
                        if isinstance(cell, str):
                            for old, new, kind, note in typo_repls:
                                if old in cell:
                                    before = cell
                                    row[ci] = cell.replace(old, new)
                                    log(file, cloc, before, row[ci], kind, note)
                                    cell = row[ci]
                        elif isinstance(cell, list):
                            # segments list
                            full = join_segments(cell)
                            for old, new, kind, note in typo_repls:
                                if old in full:
                                    replace_in_segments(cell, old, new, file, cloc, kind, note)
                                    full = join_segments(cell)
                        elif isinstance(cell, dict):
                            if "text" in cell:
                                for old, new, kind, note in typo_repls:
                                    if old in cell["text"]:
                                        before = cell["text"]
                                        cell["text"] = before.replace(old, new)
                                        log(file, cloc, before, cell["text"], kind, note)
                            if "segments" in cell:
                                full = join_segments(cell["segments"])
                                for old, new, kind, note in typo_repls:
                                    if old in full:
                                        replace_in_segments(
                                            cell["segments"], old, new, file, cloc, kind, note
                                        )

    # --- Number / structure fixes ---
    intro = next(s for s in data["sections"] if s["id"] == "intro")
    # blocks[15] １． 問診の意義と方法 → （１）問診の意義と方法
    b15 = intro["blocks"][15]
    assert "問診の意義と方法" in b15["text"]
    before = b15["text"]
    b15["text"] = "（１）問診の意義と方法"
    log(file, "intro/blocks[15]", before, b15["text"], "number_dupe", "同章内の「１．」重複を解消")

    # inspection: fix ③末梢性麻痺とは？ ②下位 → ③下位
    insp = next(s for s in data["sections"] if s["id"] == "inspection")
    for bi, block in enumerate(insp["blocks"]):
        if block.get("type") != "note":
            continue
        full = join_segments(block.get("segments", []))
        if full.startswith("③末梢性麻痺とは？") and "②下位" in full:
            replace_in_segments(
                block["segments"],
                "②下位",
                "③下位",
                file,
                f"inspection/blocks[{bi}]/note:{block.get('id')}",
                "symbol_dupe",
                "穴埋め番号が設問③なのに答が②になっていた",
            )

    # inspection: insert クローヌス heading; strip trailing marker from prior note
    # Find n161 and n162
    idx_n161 = None
    idx_n162 = None
    for bi, block in enumerate(insp["blocks"]):
        if block.get("type") == "note" and block.get("id") == "n161":
            idx_n161 = bi
        if block.get("type") == "note" and block.get("id") == "n162":
            idx_n162 = bi
    assert idx_n161 is not None and idx_n162 == idx_n161 + 1
    segs = insp["blocks"][idx_n161]["segments"]
    full = join_segments(segs)
    if "…クローヌス…" in full or "...クローヌス..." in full:
        replace_in_segments(
            segs,
            " / …クローヌス…" if " / …クローヌス…" in full else "…クローヌス…",
            "",
            file,
            f"inspection/blocks[{idx_n161}]/note:n161",
            "number_dupe",
            "クローヌス見出しが本文末尾に混入していたため除去",
        )
        # also try without slash variant
        full2 = join_segments(segs)
        if "…クローヌス…" in full2:
            replace_in_segments(
                segs,
                "…クローヌス…",
                "",
                file,
                f"inspection/blocks[{idx_n161}]/note:n161",
                "number_dupe",
                "クローヌス見出し混入の除去",
            )
    heading = {"type": "heading", "level": 3, "text": "……クローヌス……"}
    insp["blocks"].insert(idx_n162, heading)
    log(
        file,
        f"inspection/blocks[{idx_n162}] (inserted)",
        "(なし)",
        "……クローヌス……",
        "number_dupe",
        "トーヌス節とクローヌス節の番号再掲を見出し分離で解消",
    )

    # inspection: facial nerve signs — insert heading before 額のしわ (n112) and renumber
    idx_n112 = next(
        i
        for i, b in enumerate(insp["blocks"])
        if b.get("type") == "note" and b.get("id") == "n112"
    )
    insp["blocks"].insert(
        idx_n112, {"type": "heading", "level": 3, "text": "……顔面神経麻痺の徴候……"}
    )
    log(
        file,
        f"inspection/blocks[{idx_n112}] (inserted)",
        "(なし)",
        "……顔面神経麻痺の徴候……",
        "number_dupe",
        "眼所見と顔面麻痺所見の番号衝突を見出し分離",
    )
    # renumber n112..n115: ②→①, ③→②, ④→③, ⑤→④
    renum = {"n112": ("②", "①"), "n113": ("③", "②"), "n114": ("④", "③"), "n115": ("⑤", "④")}
    for bi, block in enumerate(insp["blocks"]):
        nid = block.get("id")
        if nid in renum and block.get("type") == "note":
            old, new = renum[nid]
            segs = block["segments"]
            full = join_segments(segs)
            if full.startswith(old):
                # only replace leading marker
                replace_in_segments(
                    segs,
                    old,
                    new,
                    file,
                    f"inspection/blocks[{bi}]/note:{nid}",
                    "number_dupe",
                    "顔面麻痺所見の番号を①から振り直し",
                )

    # symptoms: second ② (n292) → ③ (ブルジンスキー対側の説明)
    sym = next(s for s in data["sections"] if s["id"] == "symptoms")
    for bi, block in enumerate(sym["blocks"]):
        if block.get("id") == "n292":
            segs = block["segments"]
            full = join_segments(segs)
            if full.startswith("②"):
                replace_in_segments(
                    segs,
                    "②",
                    "③",
                    file,
                    f"symptoms/blocks[{bi}]/note:n292",
                    "number_dupe",
                    "髄膜刺激検査の項目番号重複（ブルジンスキー説明）",
                )

    dump_js_json(path, prefix_text, data, suffix)
    # validate
    load_js_json(path, "CLINICAL_CONTENT")
    print("clinical content OK", path.stat().st_size)


def fix_disease_content():
    path = ROOT / "clinical-guide" / "disease-content.js"
    data, prefix_text, suffix = load_js_json(path, "CLINICAL_DISEASE_CONTENT")
    file = "clinical-guide/disease-content.js"

    typo_repls = [
        ("X腺", "X線", "typo", "OCR誤字（X線）"),
        ("ａ．急性ａ．・", "ａ．急性・", "typo", "記号重複「ａ．」"),
        ("治 療", "治療", "typo", "OCR空白"),
    ]

    def apply_typos_to_blocks(blocks, scope):
        for bi, block in enumerate(blocks):
            loc = f"{scope}/blocks[{bi}]"
            if block.get("type") == "heading":
                for old, new, kind, note in typo_repls:
                    if old in block.get("text", ""):
                        before = block["text"]
                        block["text"] = before.replace(old, new)
                        log(file, loc, before, block["text"], kind, note)
            elif block.get("type") == "note":
                segs = block.get("segments", [])
                full = join_segments(segs)
                for old, new, kind, note in typo_repls:
                    if old in full:
                        replace_in_segments(
                            segs, old, new, file, loc + f"/note:{block.get('id')}", kind, note
                        )
                        full = join_segments(segs)
            elif block.get("type") == "table":
                for ri, row in enumerate(block.get("rows", [])):
                    for ci, cell in enumerate(row):
                        cloc = f"{loc}/r{ri}c{ci}"
                        if isinstance(cell, str):
                            for old, new, kind, note in typo_repls:
                                if old in cell:
                                    before = cell
                                    row[ci] = cell.replace(old, new)
                                    log(file, cloc, before, row[ci], kind, note)
                                    cell = row[ci]
                        elif isinstance(cell, list):
                            full = join_segments(cell)
                            for old, new, kind, note in typo_repls:
                                if old in full:
                                    replace_in_segments(cell, old, new, file, cloc, kind, note)
                                    full = join_segments(cell)
                        elif isinstance(cell, dict) and "text" in cell:
                            for old, new, kind, note in typo_repls:
                                if old in cell["text"]:
                                    before = cell["text"]
                                    cell["text"] = before.replace(old, new)
                                    log(file, cloc, before, cell["text"], kind, note)

    for ch in data["chapters"]:
        apply_typos_to_blocks(ch["blocks"], ch["id"])

    def renumber_note(ch_id, note_id, old_prefix, new_prefix, note):
        ch = next(c for c in data["chapters"] if c["id"] == ch_id)
        for bi, block in enumerate(ch["blocks"]):
            if block.get("type") == "note" and block.get("id") == note_id:
                segs = block["segments"]
                full = join_segments(segs)
                if not full.startswith(old_prefix):
                    raise AssertionError(f"{ch_id}/{note_id} expected start {old_prefix}: {full[:40]}")
                replace_in_segments(
                    segs,
                    old_prefix,
                    new_prefix,
                    file,
                    f"{ch_id}/blocks[{bi}]/note:{note_id}",
                    "number_dupe",
                    note,
                )
                return
        raise AssertionError(f"note {note_id} not found in {ch_id}")

    # cardiovascular 心筋梗塞: ③症状→④, ④検査→⑤, ⑤治療→⑥, ⑥経過→⑦
    # Apply from highest number first to avoid double-replacing
    renumber_note("cardiovascular", "n53", "⑥", "⑦", "心筋梗塞の番号繰り下げ")
    # wait - need to check note ids. From earlier: blocks 63=③症状 n50, 64=④ n?, ...
    # Let me look up by content instead

    def renumber_by_startswith(ch_id, startswith, new_prefix, note, occurrence=0):
        ch = next(c for c in data["chapters"] if c["id"] == ch_id)
        hits = []
        for bi, block in enumerate(ch["blocks"]):
            if block.get("type") != "note":
                continue
            full = join_segments(block["segments"])
            if full.startswith(startswith):
                hits.append((bi, block))
        if occurrence >= len(hits):
            raise AssertionError(f"no hit {ch_id} {startswith} #{occurrence}: hits={len(hits)}")
        bi, block = hits[occurrence]
        old_prefix = startswith[:1] if startswith[0] in "①②③④⑤⑥⑦⑧⑨⑩" else startswith
        # replace only the leading circled number
        lead = re.match(r"^[①②③④⑤⑥⑦⑧⑨⑩]", join_segments(block["segments"]))
        if not lead:
            raise AssertionError("no lead")
        replace_in_segments(
            block["segments"],
            lead.group(0),
            new_prefix,
            file,
            f"{ch_id}/blocks[{bi}]/note:{block.get('id')}",
            "number_dupe",
            note,
        )

    # 心筋梗塞 section: find notes after heading 心筋梗塞
    ch = next(c for c in data["chapters"] if c["id"] == "cardiovascular")
    # blocks 63-66 from earlier analysis
    # 63: ③症状 → ④
    # 64: ④検査 → ⑤
    # 65: ⑤治療 → ⑥
    # 66: ⑥経過 → ⑦
    # Do from ⑥ down
    for bi in [66, 65, 64, 63]:
        block = ch["blocks"][bi]
        full = join_segments(block["segments"])
        mapping = {66: ("⑥", "⑦"), 65: ("⑤", "⑥"), 64: ("④", "⑤"), 63: ("③", "④")}
        old, new = mapping[bi]
        assert full.startswith(old), (bi, full[:30])
        replace_in_segments(
            block["segments"],
            old,
            new,
            file,
            f"cardiovascular/blocks[{bi}]/note:{block.get('id')}",
            "number_dupe",
            "心筋梗塞：③が危険因子と症状で重複していた",
        )

    # digestive 潰瘍性大腸炎: ④予後 → ⑤
    ch = next(c for c in data["chapters"] if c["id"] == "digestive")
    for bi, block in enumerate(ch["blocks"]):
        if block.get("type") == "note" and join_segments(block["segments"]).startswith("④予後"):
            replace_in_segments(
                block["segments"],
                "④",
                "⑤",
                file,
                f"digestive/blocks[{bi}]/note:{block.get('id')}",
                "number_dupe",
                "潰瘍性大腸炎：④検査と④予後の重複",
            )
            break

    # metabolic 糖尿病: ⑥治療 → ⑦
    ch = next(c for c in data["chapters"] if c["id"] == "metabolic")
    for bi, block in enumerate(ch["blocks"]):
        full = join_segments(block.get("segments", [])) if block.get("type") == "note" else ""
        if full.startswith("⑥治療での注意点"):
            replace_in_segments(
                block["segments"],
                "⑥",
                "⑦",
                file,
                f"metabolic/blocks[{bi}]/note:{block.get('id')}",
                "number_dupe",
                "糖尿病：⑥合併症と⑥治療の重複",
            )
            break

    # metabolic 壊血症: ①症状 → ②
    for bi, block in enumerate(ch["blocks"]):
        full = join_segments(block.get("segments", [])) if block.get("type") == "note" else ""
        if full.startswith("①症状　出血傾向"):
            replace_in_segments(
                block["segments"],
                "①",
                "②",
                file,
                f"metabolic/blocks[{bi}]/note:{block.get('id')}",
                "number_dupe",
                "壊血症：①原因と①症状の重複",
            )
            break

    # metabolic くる病: ③くる病→④, ④骨軟化症→⑤, ⑤検査→⑥ (from high)
    # Find indices
    rickets = []
    for bi, block in enumerate(ch["blocks"]):
        if block.get("type") != "note":
            continue
        full = join_segments(block["segments"])
        if full.startswith("③くる病") or full.startswith("④骨軟化症") or (
            full.startswith("⑤検査") and bi > 50
        ):
            rickets.append((bi, full[:20]))
    # expect three in order near 58
    for bi, block in enumerate(ch["blocks"]):
        if block.get("type") != "note":
            continue
        full = join_segments(block["segments"])
        if full.startswith("⑤検査　血液：血清リン"):
            replace_in_segments(
                block["segments"], "⑤", "⑥", file,
                f"metabolic/blocks[{bi}]/note:{block.get('id')}",
                "number_dupe", "くる病・骨軟化症の番号繰り下げ",
            )
    for bi, block in enumerate(ch["blocks"]):
        if block.get("type") != "note":
            continue
        full = join_segments(block["segments"])
        if full.startswith("④骨軟化症"):
            replace_in_segments(
                block["segments"], "④", "⑤", file,
                f"metabolic/blocks[{bi}]/note:{block.get('id')}",
                "number_dupe", "くる病・骨軟化症の番号繰り下げ",
            )
    for bi, block in enumerate(ch["blocks"]):
        if block.get("type") != "note":
            continue
        full = join_segments(block["segments"])
        if full.startswith("③くる病"):
            replace_in_segments(
                block["segments"], "③", "④", file,
                f"metabolic/blocks[{bi}]/note:{block.get('id')}",
                "number_dupe", "くる病・骨軟化症：③病態と③くる病の重複",
            )

    # hematology 溶血性貧血: ②症状→③, ③検査→④, ④治療→⑤ (from high); leave ②の作用
    ch = next(c for c in data["chapters"] if c["id"] == "hematology")
    # find 溶血性貧血 heading then renumber
    in_hemolytic = False
    targets = []
    for bi, block in enumerate(ch["blocks"]):
        if block.get("type") == "heading" and block.get("text") == "溶血性貧血":
            in_hemolytic = True
            continue
        if in_hemolytic and block.get("type") == "heading":
            break
        if in_hemolytic and block.get("type") == "note":
            full = join_segments(block["segments"])
            if full.startswith("②症状") or full.startswith("③検査") or full.startswith("④治療"):
                targets.append(bi)
    # process high to low
    for bi in sorted(targets, reverse=True):
        block = ch["blocks"][bi]
        full = join_segments(block["segments"])
        lead = full[0]
        mapping = {"④": "⑤", "③": "④", "②": "③"}
        replace_in_segments(
            block["segments"],
            lead,
            mapping[lead],
            file,
            f"hematology/blocks[{bi}]/note:{block.get('id')}",
            "number_dupe",
            "溶血性貧血：②分類と②症状の重複ほか",
        )

    # neurology アルツハイマー: after diagnostic ①②③, ①病態→④, ②分類→⑤
    ch = next(c for c in data["chapters"] if c["id"] == "neurology")
    for bi, block in enumerate(ch["blocks"]):
        if block.get("type") != "note":
            continue
        full = join_segments(block["segments"])
        if full.startswith("②分類　若年性"):
            replace_in_segments(
                block["segments"], "②", "⑤", file,
                f"neurology/blocks[{bi}]/note:{block.get('id')}",
                "number_dupe", "アルツハイマー型：診断基準の後の項目番号重複",
            )
        if full.startswith("①病態：アミロイド"):
            replace_in_segments(
                block["segments"], "①", "④", file,
                f"neurology/blocks[{bi}]/note:{block.get('id')}",
                "number_dupe", "アルツハイマー型：診断基準の後の項目番号重複",
            )

    # neurology パーキンソン: ②好発→③, ③症状→④, ④治療→⑤
    in_pd = False
    pd_targets = []
    for bi, block in enumerate(ch["blocks"]):
        if block.get("type") == "heading" and block.get("text") == "パーキンソン病":
            in_pd = True
            continue
        if in_pd and block.get("type") == "heading":
            break
        if in_pd and block.get("type") == "note":
            full = join_segments(block["segments"])
            if full.startswith("②好発") or full.startswith("③症状") or full.startswith("④治療"):
                pd_targets.append(bi)
    for bi in sorted(pd_targets, reverse=True):
        block = ch["blocks"][bi]
        full = join_segments(block["segments"])
        mapping = {"④": "⑤", "③": "④", "②": "③"}
        replace_in_segments(
            block["segments"],
            full[0],
            mapping[full[0]],
            file,
            f"neurology/blocks[{bi}]/note:{block.get('id')}",
            "number_dupe",
            "パーキンソン病：②病態と②好発の重複ほか",
        )

    # neurology ALS: ③比較的保たれやすい→④, ④経過→⑤
    in_als = False
    for bi, block in enumerate(ch["blocks"]):
        if block.get("type") == "heading" and "筋萎縮性側索硬化症" in block.get("text", ""):
            in_als = True
            continue
        if in_als and block.get("type") == "heading":
            break
        if in_als and block.get("type") == "note":
            full = join_segments(block["segments"])
            if full.startswith("④経過"):
                replace_in_segments(
                    block["segments"], "④", "⑤", file,
                    f"neurology/blocks[{bi}]/note:{block.get('id')}",
                    "number_dupe", "ALS番号繰り下げ",
                )
    for bi, block in enumerate(ch["blocks"]):
        if block.get("type") != "note":
            continue
        full = join_segments(block["segments"])
        if full.startswith("③比較的保たれやすい"):
            replace_in_segments(
                block["segments"], "③", "④", file,
                f"neurology/blocks[{bi}]/note:{block.get('id')}",
                "number_dupe", "ALS：③症状と③保たれやすい機能の重複",
            )

    # renal 前立腺肥大症: ③治療 → ④
    ch = next(c for c in data["chapters"] if c["id"] == "renal")
    in_bph = False
    for bi, block in enumerate(ch["blocks"]):
        if block.get("type") == "heading" and block.get("text") == "前立腺肥大症":
            in_bph = True
            continue
        if in_bph and block.get("type") == "heading":
            break
        if in_bph and block.get("type") == "note":
            full = join_segments(block["segments"])
            if full.startswith("③治療"):
                replace_in_segments(
                    block["segments"], "③", "④", file,
                    f"renal/blocks[{bi}]/note:{block.get('id')}",
                    "number_dupe", "前立腺肥大症：③診断と③治療の重複",
                )

    dump_js_json(path, prefix_text, data, suffix)
    load_js_json(path, "CLINICAL_DISEASE_CONTENT")
    print("disease content OK", path.stat().st_size)


def main():
    fix_clinical_content()
    fix_disease_content()
    out = ROOT / "_qa" / "applied-fixes.json"
    out.write_text(json.dumps(LOG, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Logged {len(LOG)} fix records to {out}")
    fixed = sum(1 for x in LOG if x["fixed"])
    print(f"fixed={fixed}")


if __name__ == "__main__":
    main()
