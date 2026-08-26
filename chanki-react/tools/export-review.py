# -*- coding: utf-8 -*-
"""내가(Claude가) 작성한 콘텐츠를 검토용 문서로 뽑는다.

data/nodes.ts 의 서술 필드는 이력서의 사실(기간·스택·프로젝트명)을 빼면
대부분 생성 시점에 내가 써넣은 것이다. 어느 문장이 근거 있는 사실이고
어느 문장이 내 창작인지 사람이 직접 판단할 수 있도록 전부 나열한다.

위험도 순으로 묶는다 — 사실 검증이 불가능한 1인칭 회고가 가장 위에 온다.

    py tools/export-review.py [출력경로]
"""
import io
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
    os.path.dirname(ROOT), "docs", "content-review.md")

src = io.open(os.path.join(ROOT, "data", "nodes.ts"), encoding="utf-8").read()
k = src.index("NODES: ContentNode[] = [") + len("NODES: ContentNode[] = ")
NODES = json.loads(src[k:src.rindex("]") + 1])
BY_ID = {n["id"]: n for n in NODES}

# (필드키, 표시명, 왜 위험한지) — 위에 올수록 먼저 봐야 한다
TIERS = [
    ("story", "story · 개인 회고",
     "사실 검증이 불가능한 1인칭 회고. 전적으로 창작이므로 직접 쓰거나 지우는 편이 안전하다."),
    ("impact", "impact · 성과 주장",
     "실제 성과와 다를 수 있다. 면접에서 근거를 요구받는 문장이다."),
    ("skills", "skills · 숙련도 판정",
     "core(능숙)·grew(성장)·first(첫 도입) 판정은 추정이다. 과대·과소 모두 가능하다."),
    ("objectives", "objectives · 목표 항목", "프로젝트 목표를 내가 정리한 것이다."),
    ("impacts", "impacts · 성과 항목", "성과를 항목으로 쪼갠 것이다. impact 와 같은 위험."),
    ("scope", "scope · 범위 서술", "기술 범위 서술. 스택 자체는 이력서 기반이나 문장은 창작이다."),
    ("sum", "sum · 한 줄 요약", "카드에 노출되는 요약문."),
    ("body", "body · 본문", "노드 페이지 본문. 분량이 가장 크다."),
]

NODE_FIELDS = {"sum", "body"}


def items(key):
    """(노드, 값) 목록. skills 는 [이름, 레벨] 쌍을 문자열로 편다."""
    out = []
    for n in NODES:
        if key in NODE_FIELDS:
            v = n.get(key)
            if v:
                out.append((n, v))
            continue
        pj = n.get("project") or {}
        v = pj.get(key)
        if not v:
            continue
        if key == "skills":
            LV = {"core": "능숙", "grew": "성장", "first": "첫 도입"}
            for sk in v:
                name = sk[0] if isinstance(sk, list) else str(sk)
                lv = (sk[1] if isinstance(sk, list) and len(sk) > 1 else "core") or "core"
                out.append((n, "%s — **%s**" % (name, LV.get(lv, lv))))
        elif isinstance(v, list):
            for one in v:
                out.append((n, one))
        else:
            out.append((n, v))
    return out


lines = [
    "# 콘텐츠 검토 — 내가 쓴 문장 전부",
    "",
    "`data/nodes.ts` 의 서술 필드를 전부 나열한다. 이력서에서 온 **기간·스택·프로젝트 사실**을",
    "제외하면 아래 문장들은 콘텐츠 생성 시점에 Claude 가 써넣은 것이다.",
    "",
    "각 항목의 `[ ]` 를 다음 중 하나로 바꿔 표시하면 된다.",
    "",
    "- `[k]` **유지** — 사실과 맞다",
    "- `[e]` **수정** — 아래에 고칠 문장을 적는다",
    "- `[x]` **삭제** — 이 필드를 비운다",
    "",
    "표시가 끝나면 이 파일을 그대로 두고 알려주면 반영한다.",
    "",
    "---",
    "",
    "## 목차",
    "",
]

counts = {key: len(items(key)) for key, _, _ in TIERS}
total = sum(counts.values())
for key, label, _ in TIERS:
    lines.append("- [%s](#%s) — %d건" % (label, key, counts[key]))
lines += ["", "**합계 %d건**" % total, "", "---", ""]

num = 0
for key, label, why in TIERS:
    rows = items(key)
    lines += ['<a id="%s"></a>' % key, "", "## %s" % label, "",
              "> %s" % why, "", "**%d건**" % len(rows), ""]
    cur = None
    for n, val in rows:
        if n["id"] != cur:
            cur = n["id"]
            lines += ["", "### `%s` · %s" % (n["id"], n["name"]), ""]
        num += 1
        text = str(val).replace("\n", " ").strip()
        lines.append("- [ ] **%03d**" % num)
        lines.append("  > %s" % text)
        lines.append("")
    lines += ["---", ""]

os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write("\n".join(lines))
print("  %s" % OUT)
print("  항목 %d건 / %d줄" % (num, len(lines)))
