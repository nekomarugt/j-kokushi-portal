#!/usr/bin/env python3
"""Detect typos, number duplicates, and symbol collisions in study guides."""
from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path("/workspace/j-kokushi-portal")
OUT = ROOT / "_qa" / "guide-qa-findings.json"

# Circled / fullwidth / katakana choice markers commonly used
CHOICE_MARKERS = (
    "アィウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン"
    "アイウエオ"
    "①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳"
    "⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽"
    "ⓐⓑⓒⓓⓔ"
)
CIRCLED = list("①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳")
KATA_CHOICE = list("アイウエオカキクケコ")
NUM_HEADING_RE = re.compile(
    r"^(?P<label>"
    r"[第]?[0-9０-９一二三四五六七八九十]+[章節項話部編]?|"
    r"[０-９0-9]+[．.\s　]||"
    r"[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳]|"
    r"[ア-ンＡ-ＺA-Z][．.\s　）)]|"
    r"[（(]?[ア-ン0-9０-９]+[）)]"
    r")"
)

# Numbered item at start of heading/note text
ITEM_NUM_RE = re.compile(
    r"^\s*(?:"
    r"(?P<circled>[①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳])|"
    r"(?P<fw>[０-９]+)[．.、\s　]+|"
    r"(?P<arab>[0-9]+)[．.\)]\s*|"
    r"(?P<kata>[アイウエオカキクケコサシスセソ])[．.、\s　）)]|"
    r"(?P<section>第[0-9０-９一二三四五六七八九十]+[章節])"
    r")"
)

# Within a single string, repeated circled numbers close together often = OCR dupe
INLINE_DUP_CIRCLED = re.compile(
    r"([①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳])([^①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳]{0,40})\1"
)

# Mojibake / broken encoding patterns
MOJIBAKE_RE = re.compile(
    r"(?:Ã.|Â.|â.|ï.»¿|\\u00[0-9a-fA-F]{2}|�|Ã©|â€™|â€)"
)

# Odd character repetitions (same char 4+)
REP_RE = re.compile(r"(.)\1{3,}")

# Common OCR / typo patterns in Japanese medical study materials
KNOWN_TYPO_PATTERNS = [
    (re.compile(r"プライバシ―"), "プライバシー", "長音符がダッシュ(―)になっている"),
    (re.compile(r"プライバシ-"), "プライバシー", "長音符がハイフン"),
    (re.compile(r"があるがとうか"), "があるかどうか", "OCR崩れ"),
    (re.compile(r"があ\s*るがとうか"), "があるかどうか", "OCR崩れ+空白"),
    (re.compile(r"とうか判断"), "どうか判断", "OCR: ど→と"),
    (re.compile(r"感\s+覚"), "感覚", "不要空白"),
    (re.compile(r"診\s+察"), "診察", "不要空白"),
    (re.compile(r"問\s+診"), "問診", "不要空白"),
    (re.compile(r"視\s+診"), "視診", "不要空白"),
    (re.compile(r"触\s+診"), "触診", "不要空白"),
    (re.compile(r"打\s+診"), "打診", "不要空白"),
    (re.compile(r"聴\s+診"), "聴診", "不要空白"),
    (re.compile(r"主\s+訴"), "主訴", "不要空白"),
    (re.compile(r"現\s+病\s*歴"), "現病歴", "不要空白"),
    (re.compile(r"そのも�"), "そのもの", "文字化け"),
    (re.compile(r"そのもの(?![のにをがはへでと])も(?![の])"), None, None),  # skip
]

# Spaces inside common two-kanji medical terms (OCR)
KANJI_SPACE_RE = re.compile(
    r"(?<![ぁ-んァ-ヶ一-龥])([一-龥])\s+([一-龥])(?![ぁ-んァ-ヶ一-龥])"
)

# Em/en dash used as prolonged sound in katakana words
KATA_DASH_RE = re.compile(r"([ァ-ヶ])[―–—ｰ]([ァ-ヶ]?)")


def load_js_json(path: Path, prefix: str):
    text = path.read_text(encoding="utf-8")
    # window.FOO = {...};
    m = re.search(rf"window\.{re.escape(prefix)}\s*=\s*", text)
    if not m:
        raise ValueError(f"prefix {prefix} not in {path}")
    decoder = json.JSONDecoder()
    obj, _end = decoder.raw_decode(text, m.end())
    return obj


def walk_strings(obj, path="$"):
    if isinstance(obj, dict):
        for k, v in obj.items():
            yield from walk_strings(v, f"{path}.{k}")
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            yield from walk_strings(v, f"{path}[{i}]")
    elif isinstance(obj, str):
        yield path, obj


def strip_html(s: str) -> str:
    s = re.sub(r"<[^>]+>", " ", s)
    s = re.sub(r"&nbsp;", " ", s)
    s = re.sub(r"&[a-z]+;", " ", s)
    return s


def parse_physiology_content(path: Path):
    """Parse physiology content.js which is JS object literal, not pure JSON."""
    text = path.read_text(encoding="utf-8")
    # Use a lightweight approach: extract chapters via regex of structure
    chapters = []
    # Split by top-level chapter objects roughly
    # Find each { id: '...', number: '...', title: '...', ... sections: [ ... ] }
    chapter_pat = re.compile(
        r"\{\s*id:\s*'(?P<id>[^']+)'\s*,\s*number:\s*'(?P<number>[^']+)'\s*,\s*title:\s*'(?P<title>[^']+)'",
        re.M,
    )
    matches = list(chapter_pat.finditer(text))
    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        chunk = text[start:end]
        ch = {
            "id": m.group("id"),
            "number": m.group("number"),
            "title": m.group("title"),
            "sections": [],
            "_raw": chunk,
        }
        # sections: title, question, answer, explanation, caption, anchor
        sec_pat = re.compile(
            r"\{\s*title:\s*'(?P<title>(?:\\'|[^'])*)'\s*,\s*anchor:\s*'(?P<anchor>(?:\\'|[^'])*)'",
            re.S,
        )
        for sm in sec_pat.finditer(chunk):
            # get rest of section fields from nearby
            sec_start = sm.start()
            # find matching closing - approximate by next section or chapter end
            sec = {
                "title": sm.group("title").replace("\\'", "'"),
                "anchor": sm.group("anchor").replace("\\'", "'"),
            }
            # pull explanation, question, answer, caption with simple scans from sec_start
            tail = chunk[sec_start : sec_start + 8000]
            for field in ("explanation", "caption", "question", "answer", "image"):
                fm = re.search(
                    rf"{field}:\s*'((?:\\'|[^'])*)'",
                    tail,
                )
                if fm:
                    sec[field] = fm.group(1).replace("\\'", "'").replace("\\n", "\n")
            ch["sections"].append(sec)
        chapters.append(ch)
    return chapters


def parse_physiology_deepdive(path: Path):
    text = path.read_text(encoding="utf-8")
    # Extract per-chapter arrays
    result = {}
    # Find keys like basics: [
    key_pat = re.compile(r"^\s*([a-z0-9-]+):\s*\[", re.M)
    keys = list(key_pat.finditer(text))
    for i, m in enumerate(keys):
        key = m.group(1)
        start = m.end() - 1  # at [
        # bracket match
        depth = 0
        j = start
        while j < len(text):
            c = text[j]
            if c == "[":
                depth += 1
            elif c == "]":
                depth -= 1
                if depth == 0:
                    break
            elif c == "'":
                j += 1
                while j < len(text) and text[j] != "'":
                    if text[j] == "\\":
                        j += 1
                    j += 1
            j += 1
        chunk = text[start : j + 1]
        items = []
        item_pat = re.compile(
            r"title:\s*'((?:\\'|[^'])*)'.*?shortcut:\s*'((?:\\'|[^'])*)'.*?mechanism:\s*'((?:\\'|[^'])*)'.*?folded:\s*'((?:\\'|[^'])*)'.*?exam:\s*'((?:\\'|[^'])*)'",
            re.S,
        )
        for im in item_pat.finditer(chunk):
            items.append(
                {
                    "title": im.group(1).replace("\\'", "'"),
                    "shortcut": im.group(2).replace("\\'", "'"),
                    "mechanism": im.group(3).replace("\\'", "'"),
                    "folded": im.group(4).replace("\\'", "'"),
                    "exam": im.group(5).replace("\\'", "'"),
                }
            )
        result[key] = items
    return result


def detect_heading_number_dupes(headings, scope):
    """Within a scope, detect duplicate numbering labels among sibling headings of same level."""
    issues = []
    # Group consecutive same-level headings under a parent level
    # Simpler: for each level, collect normalized numbers and flag duplicates that appear
    # as siblings (same parent context).
    # We'll track stack of parents.
    stack = []  # (level, label)
    # map parent_key -> list of (num, text, loc)
    by_parent = defaultdict(list)

    def parent_key(stk, level):
        return tuple((lv, lb) for lv, lb in stk if lv < level)

    for idx, (level, text, loc) in enumerate(headings):
        # pop deeper/equal
        while stack and stack[-1][0] >= level:
            stack.pop()
        m = ITEM_NUM_RE.match(text)
        num = None
        if m:
            num = next(g for g in m.groups() if g)
        # also catch patterns like "１．xxx" with fullwidth
        m2 = re.match(r"^\s*([０-９0-9]+)\s*[．.]", text)
        if m2:
            num = m2.group(1)
        m3 = re.match(r"^\s*([①-⑳])", text)
        if m3:
            num = m3.group(1)
        m4 = re.match(r"^\s*([Ａ-ＺA-Zア-ン])[．.、\s　]", text)
        if m4 and not num:
            num = m4.group(1)
        label = num or text[:20]
        if num:
            by_parent[(scope, parent_key(stack, level), level)].append(
                (num, text, loc)
            )
        stack.append((level, label))

    for key, items in by_parent.items():
        seen = defaultdict(list)
        for num, text, loc in items:
            seen[num].append((text, loc))
        for num, locs in seen.items():
            if len(locs) > 1:
                issues.append(
                    {
                        "type": "number_dupe",
                        "scope": scope,
                        "number": num,
                        "count": len(locs),
                        "items": [{"text": t, "loc": l} for t, l in locs],
                    }
                )
    return issues


def detect_inline_symbol_dupes(text, loc, scope):
    issues = []
    plain = strip_html(text)
    # Pattern: same circled number appearing twice with short gap AND second not starting a new clause naturally
    # Flag when marker repeats with little intervening punctuation suggesting OCR echo
    for m in INLINE_DUP_CIRCLED.finditer(plain):
        between = m.group(2)
        # If between has sentence end, might be legitimate reuse in different sentences - still flag for review
        # Strong signal: second immediately after short label like "BMI ②（"
        issues.append(
            {
                "type": "symbol_dupe",
                "scope": scope,
                "marker": m.group(1),
                "snippet": plain[max(0, m.start() - 5) : m.end() + 20],
                "loc": loc,
                "between": between,
            }
        )
    # Also: choice lists with duplicate ア/イ etc.
    # Extract lines that look like choices
    choice_lines = re.findall(
        r"(?:^|[\n；;])\s*([アイウエオ①②③④⑤⑥⑦⑧⑨⑩1-5１-５])[．.、\s　）)]",
        plain,
    )
    if choice_lines:
        counts = defaultdict(int)
        for c in choice_lines:
            counts[c] += 1
        for c, n in counts.items():
            if n > 1:
                issues.append(
                    {
                        "type": "symbol_dupe_choice",
                        "scope": scope,
                        "marker": c,
                        "count": n,
                        "loc": loc,
                        "snippet": plain[:80],
                    }
                )
    return issues


def detect_typo_patterns(text, loc, scope):
    issues = []
    plain = strip_html(text)
    if not plain or not plain.strip():
        if text.strip() == "" or text.strip() == "<p></p>":
            issues.append(
                {
                    "type": "typo_empty",
                    "scope": scope,
                    "loc": loc,
                    "snippet": repr(text[:40]),
                }
            )
        return issues

    if "�" in plain or MOJIBAKE_RE.search(plain):
        issues.append(
            {
                "type": "typo_mojibake",
                "scope": scope,
                "loc": loc,
                "snippet": plain[:120],
            }
        )

    for pat, fix, note in KNOWN_TYPO_PATTERNS:
        if fix is None:
            continue
        if pat.search(plain):
            issues.append(
                {
                    "type": "typo_known",
                    "scope": scope,
                    "loc": loc,
                    "pattern": pat.pattern,
                    "suggested": fix,
                    "note": note,
                    "snippet": plain[max(0, pat.search(plain).start() - 10) : pat.search(plain).end() + 20],
                    "confidence": "high",
                }
            )

    # Katakana with wrong dash
    for m in KATA_DASH_RE.finditer(plain):
        issues.append(
            {
                "type": "typo_kata_dash",
                "scope": scope,
                "loc": loc,
                "snippet": plain[max(0, m.start() - 5) : m.end() + 8],
                "found": m.group(0),
                "suggested": m.group(1) + "ー" + (m.group(2) or ""),
                "confidence": "high",
            }
        )

    # Suspicious mid-word spaces between kanji (OCR) - sample conservatively
    # Only flag when BOTH chars are common and space is single half/full width
    for m in re.finditer(r"([一-龥])[ ]([一-龥])", plain):
        # skip if looks like list formatting "１． 問診"
        start = m.start()
        if start > 0 and plain[start - 1] in "．.、・：:":
            continue
        pair = m.group(1) + m.group(2)
        # known medical compounds often split by OCR
        known = {
            "感覚",
            "診察",
            "問診",
            "視診",
            "触診",
            "打診",
            "聴診",
            "主訴",
            "病歴",
            "現病",
            "既往",
            "血圧",
            "脈拍",
            "体温",
            "呼吸",
            "反射",
            "脊髄",
            "神経",
            "筋肉",
            "関節",
            "脊柱",
            "側弯",
            "坐骨",
            "意識",
            "昏睡",
            "昏迷",
            "傾眠",
            "浮腫",
            "黄疸",
            "貧血",
            "発熱",
            "疼痛",
            "麻痺",
            "痙攣",
            "振戦",
            "歩行",
            "姿勢",
            "体位",
            "体格",
            "栄養",
            "肥満",
            "標準",
            "症状",
            "所見",
            "診断",
            "治療",
            "検査",
            "疾患",
            "障害",
            "症候群",
        }
        # check 2-char and also if forming part of longer
        if pair in known or pair in {k[:2] for k in known if len(k) >= 2}:
            issues.append(
                {
                    "type": "typo_kanji_space",
                    "scope": scope,
                    "loc": loc,
                    "found": m.group(0),
                    "suggested": pair,
                    "snippet": plain[max(0, start - 8) : m.end() + 12],
                    "confidence": "medium",
                }
            )

    # garbled fragments
    garbled = [
        (r"あるがとう", "あるかどう"),
        (r"がとうか", "かどうか"),
        (r"とうか判断できる", "どうか判断できる"),
        (r"あ るが", "あるが"),
        (r"側副部", "側腹部"),  # common OCR? 右側副部→右側腹部
        (r"キュンメル", None),  # medical eponym - leave
    ]
    for pat, fix in garbled:
        if re.search(pat, plain):
            issues.append(
                {
                    "type": "typo_garbled",
                    "scope": scope,
                    "loc": loc,
                    "found": pat,
                    "suggested": fix,
                    "snippet": plain[:150],
                    "confidence": "high" if fix else "review",
                }
            )

    return issues


def analyze_clinical_content():
    issues = []
    path = ROOT / "clinical-guide" / "content.js"
    data = load_js_json(path, "CLINICAL_CONTENT")
    for sec in data["sections"]:
        sid = sec["id"]
        scope = f"clinical-guide/content.js#{sid}"
        headings = []
        for bi, block in enumerate(sec["blocks"]):
            loc = f"{sid}/blocks[{bi}]"
            btype = block.get("type")
            if btype == "heading":
                text = block.get("text", "")
                headings.append((block.get("level", 2), text, loc))
                issues.extend(detect_typo_patterns(text, loc, scope))
                issues.extend(detect_inline_symbol_dupes(text, loc, scope))
            elif btype == "note":
                segs = block.get("segments", [])
                text = "".join(s.get("text", "") for s in segs)
                issues.extend(detect_typo_patterns(text, loc + f"/note:{block.get('id')}", scope))
                issues.extend(detect_inline_symbol_dupes(text, loc + f"/note:{block.get('id')}", scope))
                # numbered notes within section - collect ids
            elif btype == "table":
                for ri, row in enumerate(block.get("rows", [])):
                    for ci, cell in enumerate(row):
                        if isinstance(cell, str):
                            issues.extend(
                                detect_typo_patterns(
                                    cell, f"{loc}/r{ri}c{ci}", scope
                                )
                            )
                        elif isinstance(cell, dict):
                            t = "".join(
                                s.get("text", "") for s in cell.get("segments", [])
                            ) or cell.get("text", "")
                            issues.extend(detect_typo_patterns(t, f"{loc}/r{ri}c{ci}", scope))
            else:
                for pth, s in walk_strings(block, loc):
                    issues.extend(detect_typo_patterns(s, pth, scope))
                    issues.extend(detect_inline_symbol_dupes(s, pth, scope))

        issues.extend(detect_heading_number_dupes(headings, scope))

        # Also detect duplicate note leading numbers within same section
        note_nums = defaultdict(list)
        for bi, block in enumerate(sec["blocks"]):
            if block.get("type") != "note":
                continue
            text = "".join(s.get("text", "") for s in block.get("segments", []))
            m = re.match(r"^\s*([①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳]|[０-９0-9]+[．.)）])", text)
            if m:
                note_nums[m.group(1)].append((text[:60], f"{sid}/blocks[{bi}]/note:{block.get('id')}"))
        # Only flag if same number appears consecutively oddly - actually within a subsection
        # many sections legitimately restart ①. So flag only exact same full leading number
        # appearing more than expected in a row without heading between - handled by scanning
        # consecutive notes between headings.
        current = defaultdict(list)
        for bi, block in enumerate(sec["blocks"]):
            if block.get("type") == "heading":
                # flush
                for num, items in current.items():
                    if len(items) > 1:
                        # same number twice between headings = dupe
                        issues.append(
                            {
                                "type": "number_dupe_notes",
                                "scope": scope,
                                "number": num,
                                "count": len(items),
                                "items": [{"text": t, "loc": l} for t, l in items],
                            }
                        )
                current = defaultdict(list)
                continue
            if block.get("type") == "note":
                text = "".join(s.get("text", "") for s in block.get("segments", []))
                m = re.match(r"^\s*([①②③④⑤⑥⑦⑧⑨⑩])", text)
                if m:
                    current[m.group(1)].append(
                        (text[:70], f"{sid}/blocks[{bi}]/note:{block.get('id')}")
                    )
        for num, items in current.items():
            if len(items) > 1:
                issues.append(
                    {
                        "type": "number_dupe_notes",
                        "scope": scope,
                        "number": num,
                        "count": len(items),
                        "items": [{"text": t, "loc": l} for t, l in items],
                    }
                )

    return issues


def analyze_disease_content():
    issues = []
    path = ROOT / "clinical-guide" / "disease-content.js"
    data = load_js_json(path, "CLINICAL_DISEASE_CONTENT")
    for ch in data["chapters"]:
        cid = ch["id"]
        scope = f"clinical-guide/disease-content.js#{cid}"
        headings = []
        for bi, block in enumerate(ch["blocks"]):
            loc = f"{cid}/blocks[{bi}]"
            btype = block.get("type")
            if btype == "heading":
                text = block.get("text", "")
                headings.append((block.get("level", 2), text, loc))
                issues.extend(detect_typo_patterns(text, loc, scope))
                issues.extend(detect_inline_symbol_dupes(text, loc, scope))
            elif btype == "note":
                text = "".join(s.get("text", "") for s in block.get("segments", []))
                issues.extend(detect_typo_patterns(text, loc + f"/note:{block.get('id')}", scope))
                issues.extend(detect_inline_symbol_dupes(text, loc + f"/note:{block.get('id')}", scope))
            else:
                for pth, s in walk_strings(block, loc):
                    issues.extend(detect_typo_patterns(s, pth, scope))
                    issues.extend(detect_inline_symbol_dupes(s, pth, scope))
        issues.extend(detect_heading_number_dupes(headings, scope))

        # note number dupes between headings
        current = defaultdict(list)
        for bi, block in enumerate(ch["blocks"]):
            if block.get("type") == "heading":
                for num, items in current.items():
                    if len(items) > 1:
                        issues.append(
                            {
                                "type": "number_dupe_notes",
                                "scope": scope,
                                "number": num,
                                "count": len(items),
                                "items": [{"text": t, "loc": l} for t, l in items],
                            }
                        )
                current = defaultdict(list)
                continue
            if block.get("type") == "note":
                text = "".join(s.get("text", "") for s in block.get("segments", []))
                m = re.match(r"^\s*([①②③④⑤⑥⑦⑧⑨⑩])", text)
                if m:
                    current[m.group(1)].append(
                        (text[:70], f"{cid}/blocks[{bi}]/note:{block.get('id')}")
                    )
        for num, items in current.items():
            if len(items) > 1:
                issues.append(
                    {
                        "type": "number_dupe_notes",
                        "scope": scope,
                        "number": num,
                        "count": len(items),
                        "items": [{"text": t, "loc": l} for t, l in items],
                    }
                )
    return issues


def analyze_physiology():
    issues = []
    path = ROOT / "physiology-guide" / "content.js"
    chapters = parse_physiology_content(path)
    # chapter number dupes
    nums = defaultdict(list)
    ids = defaultdict(list)
    for ch in chapters:
        nums[ch["number"]].append(ch["id"])
        ids[ch["id"]].append(ch["number"])
        scope = f"physiology-guide/content.js#{ch['id']}"
        # section title dupes within chapter
        titles = defaultdict(list)
        for si, sec in enumerate(ch["sections"]):
            titles[sec["title"]].append(si)
            loc = f"{ch['id']}/sections[{si}] ({sec['title']})"
            for field in ("title", "anchor", "explanation", "caption", "question", "answer"):
                if field in sec:
                    issues.extend(detect_typo_patterns(sec[field], f"{loc}.{field}", scope))
                    issues.extend(detect_inline_symbol_dupes(sec[field], f"{loc}.{field}", scope))
        for t, idxs in titles.items():
            if len(idxs) > 1:
                issues.append(
                    {
                        "type": "number_dupe",
                        "scope": scope,
                        "number": f"section-title:{t}",
                        "count": len(idxs),
                        "items": [{"text": t, "loc": f"sections[{i}]"} for i in idxs],
                    }
                )
    for n, chs in nums.items():
        if len(chs) > 1:
            issues.append(
                {
                    "type": "number_dupe",
                    "scope": "physiology-guide/content.js",
                    "number": f"chapter:{n}",
                    "count": len(chs),
                    "items": [{"text": c, "loc": c} for c in chs],
                }
            )

    # deepdive
    dd_path = ROOT / "physiology-guide" / "deepdive.js"
    deep = parse_physiology_deepdive(dd_path)
    for key, items in deep.items():
        scope = f"physiology-guide/deepdive.js#{key}"
        titles = defaultdict(list)
        for i, it in enumerate(items):
            titles[it["title"]].append(i)
            loc = f"{key}[{i}]"
            for field in ("title", "shortcut", "mechanism", "folded", "exam"):
                issues.extend(detect_typo_patterns(it[field], f"{loc}.{field}", scope))
        for t, idxs in titles.items():
            if len(idxs) > 1:
                issues.append(
                    {
                        "type": "number_dupe",
                        "scope": scope,
                        "number": f"deepdive-title:{t}",
                        "count": len(idxs),
                        "items": [{"text": t, "loc": f"[{i}]"} for i in idxs],
                    }
                )
    return issues


def analyze_clinical_aux():
    issues = []
    for fname, prefix in [
        ("deepdives.js", None),  # special
        ("explanations.js", "CLINICAL_EXPLANATIONS"),
        ("disease-explanations.js", "CLINICAL_DISEASE_EXPLANATIONS"),
    ]:
        path = ROOT / "clinical-guide" / fname
        text = path.read_text(encoding="utf-8")
        if fname == "deepdives.js":
            # extract string literals roughly
            for m in re.finditer(r"'((?:\\'|[^'])*)'", text):
                s = m.group(1).replace("\\'", "'")
                if len(s) < 8:
                    continue
                issues.extend(
                    detect_typo_patterns(s, f"deepdives.js@{m.start()}", f"clinical-guide/{fname}")
                )
            continue
        # try JSON-ish: convert JS object to JSON is hard; walk string literals
        for m in re.finditer(r"'((?:\\'|[^'])*)'|\"((?:\\\"|[^\"])*)\"", text):
            s = (m.group(1) or m.group(2) or "").encode().decode("unicode_escape") if False else (m.group(1) or m.group(2) or "")
            s = s.replace("\\'", "'").replace('\\"', '"').replace("\\n", "\n")
            if len(s) < 8:
                continue
            issues.extend(
                detect_typo_patterns(s, f"{fname}@{m.start()}", f"clinical-guide/{fname}")
            )
    return issues


def main():
    all_issues = []
    print("Analyzing clinical content...")
    all_issues.extend(analyze_clinical_content())
    print("Analyzing disease content...")
    all_issues.extend(analyze_disease_content())
    print("Analyzing physiology...")
    all_issues.extend(analyze_physiology())
    print("Analyzing clinical aux...")
    all_issues.extend(analyze_clinical_aux())

    # Deduplicate identical issues
    seen = set()
    unique = []
    for iss in all_issues:
        key = json.dumps(iss, ensure_ascii=False, sort_keys=True)
        if key in seen:
            continue
        seen.add(key)
        unique.append(iss)

    by_type = defaultdict(int)
    for iss in unique:
        by_type[iss["type"]] += 1

    OUT.write_text(json.dumps({"counts": dict(by_type), "issues": unique}, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Wrote", OUT)
    print("Counts:", dict(by_type))
    print("Total:", len(unique))
    # Print high priority
    for t in ("number_dupe", "number_dupe_notes", "symbol_dupe", "symbol_dupe_choice", "typo_mojibake", "typo_known", "typo_kata_dash", "typo_garbled"):
        subset = [i for i in unique if i["type"] == t]
        if not subset:
            continue
        print(f"\n===== {t} ({len(subset)}) =====")
        for i in subset[:40]:
            print(json.dumps(i, ensure_ascii=False)[:300])


if __name__ == "__main__":
    main()
