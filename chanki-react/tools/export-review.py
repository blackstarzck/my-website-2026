# -*- coding: utf-8 -*-
"""내가(Claude가) 작성한 콘텐츠를 검토용 문서로 뽑는다.

data/nodes.ts 의 서술 필드는 이력서의 사실(기간·스택·프로젝트명)을 빼면
대부분 생성 시점에 내가 써넣은 것이다. 어느 문장이 근거 있는 사실이고
어느 문장이 내 창작인지 사람이 직접 판단할 수 있도록 전부 나열한다.

각 항목에는 실제 노출 여부를 붙인다 — 값이 있다고 방문자가 보는 것은 아니다.
안 보이는 문장을 검토하느라 시간을 쓰지 않도록.

    node tools/probe-visibility.mjs   # 먼저 (pnpm dev 가 떠 있어야 함)
    py tools/export-review.py

이미 표시(k/e/x)된 항목과 그 아래 메모는 다시 뽑아도 그대로 남는다.
"""
import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
    os.path.dirname(ROOT), "docs", "content-review.md")

src = io.open(os.path.join(ROOT, "data", "nodes.ts"), encoding="utf-8").read()
k = src.index("NODES: ContentNode[] = [") + len("NODES: ContentNode[] = ")
NODES = json.loads(src[k:src.rindex("]") + 1])

# ── 노출 측정 결과 ──────────────────────────────────────────────────────
VIS_PATH = os.path.join(ROOT, "tools", ".visibility.json")
VIS = json.load(io.open(VIS_PATH, encoding="utf-8")) if os.path.exists(VIS_PATH) else {}

# ── 도달 경로: engine/legacy.ts 의 라우팅 규칙에서 유도 ──────────────────
# 849행:  if (isArea || id === ENTRY_ID) setFieldFocus(id); else openPage(id)
# 즉 리전 노드(AREAS)와 진입 노드는 눌러도 페이지가 열리지 않는다.
reg = io.open(os.path.join(ROOT, "data", "regions.ts"), encoding="utf-8").read()
AREAS = set(json.loads(re.search(r"AREAS[^=]*=\s*new Set\((\[[^\]]*\])\)", reg, re.S).group(1)))
site = io.open(os.path.join(ROOT, "data", "site.ts"), encoding="utf-8").read()
ENTRY_ID = re.search(r"ENTRY_ID\s*=\s*'([^']+)'", site).group(1)


def reach_of(nid):
    if nid == ENTRY_ID:
        return "워드마크로만 진입"
    if nid in AREAS:
        return "페이지 없음 (눌러도 지도 포커스만)"
    return "노드 페이지"


def place(nid, field, idx=None):
    """이 값이 화면 어디에 그려지는지. 측정 결과가 없으면 미상."""
    v = (VIS.get(nid) or {}).get("fields", {}).get(field)
    if isinstance(v, list):
        v = v[idx] if idx is not None and idx < len(v) else None
    if v is None:
        return "미상"
    if v == "none":
        return "렌더 안 됨"
    if v == "dive":
        return "상세 접기 안 (버튼을 눌러야 보임)"
    if v == "gallery":
        return "영역 갤러리 (지도에서 이 영역을 누르면)"
    return "페이지 본문"


def note(nid, field, idx=None):
    """이 값이 방문자에게 보이는가.

    페이지를 강제로 열면(__open) 모든 필드가 렌더되므로 "페이지에 있다"가
    "보인다"를 뜻하지 않는다. 리전 노드는 페이지가 열리지 않으므로 갤러리가
    유일한 노출 경로다. 그 경로는 engine/legacy.ts 에서 확인했다.

      909행  const desc = `...${esc(n.body || n.sum || '')}...`  → body 우선
      937행  갤러리 innerHTML 에 desc 삽입
      842행  갤러리 카드 부제는 일반 노드용 — 영역 카드는 "영역 · 리전명"

    따라서 리전 노드는 body 만 보이고 sum 은 어디에도 쓰이지 않는다.
    """
    r = reach_of(nid)
    p = place(nid, field, idx)
    if r.startswith("페이지 없음"):
        if field == "body":
            return "보임 · 영역 갤러리 (지도에서 이 영역을 누르면)"
        return "**안 보임** — " + r + ", 갤러리는 body 만 씀"
    if p == "렌더 안 됨":
        return "**안 보임** — 어느 화면에도 그려지지 않음"
    if r == "워드마크로만 진입":
        return "보임 (워드마크 → 소개) · " + p
    return "보임 · " + p


# ── 기존 표시 보존 ──────────────────────────────────────────────────────
# 번호가 아니라 인용된 문장으로 대조한다. 항목이 삭제되면 뒤 번호가 전부
# 당겨지므로, 번호를 키로 쓰면 표시가 엉뚱한 항목에 붙는다.
def key_of(text):
    return re.sub(r"\s+", " ", str(text)).strip()[:60]


prev_mark, prev_memo = {}, {}
if os.path.exists(OUT):
    old = io.open(OUT, encoding="utf-8").read().split("\n")
    pending_mark, cur_key = None, None
    for ln in old:
        m = re.match(r"^- \[(.)\] \*\*(\d{3})\*\*", ln)
        if m:
            pending_mark = m.group(1) if m.group(1).strip() else None
            cur_key = None
            continue
        if pending_mark is not None and ln.lstrip().startswith(">"):
            cur_key = key_of(ln.lstrip()[1:])
            prev_mark[cur_key] = pending_mark
            pending_mark = None
            continue
        if ln.lstrip().startswith(">"):
            cur_key = key_of(ln.lstrip()[1:])
            continue
        # 인용도 헤더도 아닌 들여쓴 줄 = 사용자가 적은 메모
        if cur_key and ln.startswith("  ") and ln.strip():
            prev_memo.setdefault(cur_key, []).append(ln.rstrip())
        elif ln.startswith("#") or ln.startswith("---"):
            cur_key, pending_mark = None, None

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
    ("sum", "sum · 한 줄 요약", "카드와 페이지 제목에 크게 노출된다."),
    ("body", "body · 본문", "노드 페이지 본문. 분량이 가장 크다."),
]
NODE_FIELDS = {"sum", "body"}


def items(key):
    out = []
    for n in NODES:
        if key in NODE_FIELDS:
            if n.get(key):
                out.append((n, n[key], None))
            continue
        pj = n.get("project") or {}
        v = pj.get(key)
        if not v:
            continue
        if key == "skills":
            LV = {"core": "능숙", "grew": "성장", "first": "첫 도입"}
            for i, sk in enumerate(v):
                name = sk[0] if isinstance(sk, list) else str(sk)
                lv = (sk[1] if isinstance(sk, list) and len(sk) > 1 else "core") or "core"
                out.append((n, "%s — **%s**" % (name, LV.get(lv, lv)), i))
        elif isinstance(v, list):
            for i, one in enumerate(v):
                out.append((n, one, i))
        else:
            out.append((n, v, None))
    return out


counts = {key: len(items(key)) for key, _, _ in TIERS}
total = sum(counts.values())

lines = [
    "# 콘텐츠 검토 — 내가 쓴 문장 전부",
    "",
    "`data/nodes.ts` 의 서술 필드를 전부 나열한다. 이력서에서 온 **기간·스택·프로젝트 사실**을",
    "제외하면 아래 문장들은 콘텐츠 생성 시점에 Claude 가 써넣은 것이다.",
    "",
    "각 항목의 `[ ]` 를 다음 중 하나로 바꿔 표시하면 된다.",
    "",
    "- `[k]` **유지** — 사실과 맞다",
    "- `[e]` **수정** — 항목 아래에 고칠 문장을 적는다",
    "- `[x]` **삭제** — 이 필드를 비운다",
    "",
    "표시가 끝나면 이 파일을 그대로 두고 알려주면 반영한다. 다시 뽑아도 표시와 메모는 남는다.",
    "",
    "## 노출 여부에 대해",
    "",
    "항목마다 화면에 실제로 보이는지 붙였다. 값이 있다고 방문자가 보는 것은 아니다.",
    "",
    "- **보임 · 페이지 본문** — 노드 페이지를 열면 바로 보인다",
    "- **보임 · 상세 접기 안** — `프로젝트 자세히 보기` 를 눌러야 보인다",
    "- **안 보임** — 어떤 경로로도 방문자에게 닿지 않는다. 검토가 아니라 삭제하거나",
    "  노출 경로를 만드는 것이 맞는 판단이다",
    "",
    "필드 위치는 브라우저로 30개 노드를 실측했다(`tools/probe-visibility.mjs`).",
    "도달 경로는 `engine/legacy.ts:849` 의 라우팅 규칙에서 유도했다 — 리전 노드",
    "(%s)와 진입 노드는 눌러도 페이지가 열리지 않는다." % ", ".join("`%s`" % a for a in sorted(AREAS)),
    "",
    "---",
    "",
    "## 목차",
    "",
]
for key, label, _ in TIERS:
    lines.append("- [%s](#%s) — %d건" % (label, key, counts[key]))

# 안 보이는 항목 수를 먼저 알려 준다
hidden = 0
for key, _, _ in TIERS:
    for n, _v, idx in items(key):
        if note(n["id"], key, idx).startswith("**안 보임**"):
            hidden += 1
lines += ["", "**합계 %d건** · 그중 방문자에게 **안 보이는 항목 %d건**" % (total, hidden), "", "---", ""]

def skills_context():
    """skills 는 69건이라 하나씩 보기 어렵다. 판단에 필요한 맥락을 앞에 둔다."""
    import collections

    LV = {"core": "능숙", "grew": "성장", "first": "첫 도입"}
    dist = collections.Counter()
    byname = collections.defaultdict(list)
    for n in NODES:
        for sk in ((n.get("project") or {}).get("skills") or []):
            name = sk[0] if isinstance(sk, list) else str(sk)
            lv = (sk[1] if isinstance(sk, list) and len(sk) > 1 else "core") or "core"
            dist[lv] += 1
            byname[name].append((n["id"], lv))

    out = ["### 판정 분포", ""]
    out.append("| 판정 | 건수 | 화면에 뜨는 툴팁 |")
    out.append("|---|---|---|")
    for lv, tip in (("core", "자신 있게 다뤘습니다"),
                    ("grew", "이 프로젝트에서 더 깊어졌습니다"),
                    ("first", "이 프로젝트에서 처음 썼습니다")):
        out.append("| %s | %d | %s |" % (LV[lv], dist[lv], tip))
    total_sk = sum(dist.values())
    pct = round(dist["first"] * 100 / total_sk) if total_sk else 0
    out += ["",
            "`첫 도입` 이 %d%%다. 안전하게 잡느라 낮춰 매긴 경향이 있으니 "
            "실제보다 저평가된 것이 있으면 올리는 편이 낫다." % pct,
            ""]

    multi = {k: v for k, v in byname.items() if len(v) > 1}
    if multi:
        out += ["### 같은 기술이 여러 노드에 나올 때", "",
                "판정이 갈리는 것이 반드시 모순은 아니다 — 레벨은 프로젝트 기준이라",
                "처음 쓴 프로젝트와 지금의 숙련도가 다를 수 있다.", "",
                "| 기술 | 노드별 판정 |", "|---|---|"]
        for name in sorted(multi):
            uses = ", ".join("`%s`=%s" % (nid, LV[lv]) for nid, lv in multi[name])
            flag = " ⚠️" if len({lv for _, lv in multi[name]}) > 1 else ""
            out.append("| %s%s | %s |" % (name, flag, uses))
        out.append("")

    out += ["### 진입 노드 주의", "",
            "레벨 툴팁이 \"이 프로젝트에서~\" 인데 `%s` 는 프로젝트가 아니라" % ENTRY_ID,
            "경력 전체를 요약하는 노드다. 거기 붙은 항목들은 문구가 맞지 않는다.",
            "문구를 고칠지 그 항목들을 뺄지 정해야 한다.", ""]
    return out


num = 0
for key, label, why in TIERS:
    rows = items(key)
    lines += ['<a id="%s"></a>' % key, "", "## %s" % label, "", "> %s" % why, "",
              "**%d건**" % len(rows), ""]
    if key == "skills":
        lines += [""] + skills_context()
    cur_id = None
    for n, val, idx in rows:
        if n["id"] != cur_id:
            cur_id = n["id"]
            lines += ["", "### `%s` · %s" % (n["id"], n["name"]),
                      "", "_%s_" % reach_of(n["id"]), ""]
        num += 1
        text = str(val).replace("\n", " ").strip()
        kk = key_of(text)
        mark = prev_mark.get(kk, " ")
        lines.append("- [%s] **%03d** — %s" % (mark, num, note(n["id"], key, idx)))
        lines.append("  > %s" % text)
        for memo in prev_memo.get(kk, []):
            lines.append(memo)
        lines.append("")
    lines += ["---", ""]

os.makedirs(os.path.dirname(OUT), exist_ok=True)
io.open(OUT, "w", encoding="utf-8", newline="\n").write("\n".join(lines))
print("  %s" % OUT)
print("  항목 %d건 (안 보임 %d건) / 보존한 표시 %d건, 메모 %d건"
      % (num, hidden, len(prev_mark), len(prev_memo)))
