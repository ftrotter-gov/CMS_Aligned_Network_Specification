#!/usr/bin/env python3
"""Verify that can-spec.md and index.html stay structurally in sync.

The spec is maintained as two hand-edited files: the Markdown source
(can-spec.md) and the rendered, hand-styled HTML (index.html). There is no
generator, so the two drift apart whenever an edit lands in one but not the
other. That drift is invisible to prose review and to a normal diff -- it only
shows up when you compare the two files' *structure* against each other.

This script does exactly that. It extracts the ordered list of section and
subsection headings from each file, normalizes away cosmetic differences
(e.g. the HTML renders "and" as "&" in titles), and fails if they disagree.
As an advisory (non-fatal) signal it also tallies RFC 2119 keyword usage in
the body of each file.

Run:  python3 tools/check_spec_sync.py
Exit: 0 when the structures match, 1 when they drift.
"""

from __future__ import annotations

import html
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
MD_PATH = REPO_ROOT / "can-spec.md"
HTML_PATH = REPO_ROOT / "index.html"

# RFC 2119 keywords, longest-first so "MUST NOT" is matched before "MUST".
KEYWORDS = [
    "MUST NOT", "SHALL NOT", "SHOULD NOT",
    "MUST", "SHALL", "SHOULD", "MAY",
    "REQUIRED", "RECOMMENDED", "OPTIONAL",
]


def normalize_title(text: str) -> str:
    """Reduce a heading to a comparable core, tolerating cosmetic differences.

    Strips inline tags/markdown, decodes HTML entities, folds "&" to "and"
    (the HTML uses "&" where the Markdown spells out "and"), lowercases, and
    drops all remaining punctuation -- so "Fees and Economics",
    "Fees &amp; Economics", and "Appendix A · Open Questions" all compare equal
    to their Markdown counterparts.
    """
    text = re.sub(r"<[^>]+>", "", text)          # strip HTML tags
    text = html.unescape(text)                    # &amp; -> &, &mdash; -> —
    text = text.replace("&", " and ")             # HTML "&"  ==  Markdown "and"
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", " ", text)        # punctuation/em-dash -> space
    return re.sub(r"\s+", " ", text).strip()


class Heading:
    """A heading reduced to its comparable identity: level + number + title."""

    __slots__ = ("level", "number", "title")

    def __init__(self, level: int, number: str | None, title: str):
        self.level = level
        self.number = number  # "3", "3.1", "17", or None for unnumbered
        self.title = normalize_title(title)

    def key(self) -> tuple:
        return (self.level, self.number, self.title)

    def __repr__(self) -> str:
        num = self.number or "-"
        return f"h{self.level} [{num}] {self.title}"


def _split_number(raw: str) -> tuple[str | None, str]:
    """Split a leading section number ("3", "3.1", "17") off a heading body."""
    m = re.match(r"^(\d+(?:\.\d+)?)\.?\s+(.*)$", raw.strip())
    if m:
        return m.group(1), m.group(2)
    return None, raw.strip()


def parse_markdown(text: str) -> list[Heading]:
    headings: list[Heading] = []
    for line in text.splitlines():
        m = re.match(r"^(#{2,3})\s+(.*)$", line)
        if not m:
            continue
        level = len(m.group(1))
        number, title = _split_number(m.group(2))
        headings.append(Heading(level, number, title))
    return headings


def parse_html(text: str) -> list[Heading]:
    """Parse headings inside <main> only, ignoring the <aside> "On this page" nav."""
    main = re.search(r"<main\b[^>]*>(.*)</main>", text, re.DOTALL)
    body = main.group(1) if main else text
    headings: list[Heading] = []
    for level, inner in re.findall(r"<h([23])\b[^>]*>(.*?)</h\1>", body, re.DOTALL):
        level = int(level)
        anchor = re.search(r'<span class="section-anchor">([^<]+)</span>(.*)', inner, re.DOTALL)
        if anchor:  # numbered top-level section: <span class="section-anchor">N</span>Title
            number, title = anchor.group(1).strip(), anchor.group(2)
        else:
            number, title = _split_number(re.sub(r"<[^>]+>", "", inner))
        headings.append(Heading(level, number, title))
    return headings


def count_keywords(text: str, *, within_main: bool) -> dict[str, int]:
    if within_main:
        main = re.search(r"<main\b[^>]*>(.*)</main>", text, re.DOTALL)
        text = main.group(1) if main else text
    plain = re.sub(r"<[^>]+>", "", text)  # no-op for Markdown, strips tags for HTML
    counts = {kw: 0 for kw in KEYWORDS}
    pattern = re.compile(r"\b(" + "|".join(KEYWORDS) + r")\b")
    for match in pattern.finditer(plain):
        counts[match.group(1)] += 1
    return counts


def main() -> int:
    if not MD_PATH.exists() or not HTML_PATH.exists():
        print(f"error: expected both {MD_PATH.name} and {HTML_PATH.name} at repo root")
        return 1

    md_headings = parse_markdown(MD_PATH.read_text(encoding="utf-8"))
    html_headings = parse_html(HTML_PATH.read_text(encoding="utf-8"))

    md_keys = [h.key() for h in md_headings]
    html_keys = [h.key() for h in html_headings]
    md_set, html_set = set(md_keys), set(html_keys)

    only_md = [h for h in md_headings if h.key() not in html_set]
    only_html = [h for h in html_headings if h.key() not in md_set]

    ok = True

    if only_md or only_html:
        ok = False
        print("✗ STRUCTURE DRIFT — headings differ between can-spec.md and index.html\n")
        if only_md:
            print("  Present in can-spec.md but not matched in index.html:")
            for h in only_md:
                print(f"    - {h}")
        if only_html:
            print("\n  Present in index.html but not matched in can-spec.md:")
            for h in only_html:
                print(f"    - {h}")
        print(
            "\n  A heading appearing on both sides at a different level or number "
            "means\n  one file was edited and the other lagged. Fix whichever is wrong."
        )
    elif md_keys != html_keys:
        ok = False
        print("✗ ORDER DRIFT — the same headings appear in a different order.\n")
        for i, (a, b) in enumerate(zip(md_keys, html_keys)):
            if a != b:
                print(f"  First divergence at position {i}:")
                print(f"    can-spec.md: {md_headings[i]}")
                print(f"    index.html : {html_headings[i]}")
                break

    if ok:
        print(f"✓ STRUCTURE — {len(md_keys)} headings match between can-spec.md and index.html")

    # Advisory only: keyword tallies are a soft signal, never a build failure.
    md_kw = count_keywords(MD_PATH.read_text(encoding="utf-8"), within_main=False)
    html_kw = count_keywords(HTML_PATH.read_text(encoding="utf-8"), within_main=True)
    diffs = {kw: (md_kw[kw], html_kw[kw]) for kw in KEYWORDS if md_kw[kw] != html_kw[kw]}
    if diffs:
        print("\n⚠ ADVISORY — RFC 2119 keyword counts differ (review, not a failure):")
        for kw, (m, h) in diffs.items():
            print(f"    {kw:<12} can-spec.md={m:<3} index.html={h}")
        print("    (Some skew is normal — keyword styling differs. Large gaps suggest")
        print("     a normative sentence landed in one file but not the other.)")

    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
