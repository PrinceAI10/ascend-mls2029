#!/usr/bin/env python3
"""
ASCEND content validator ("agent").

Run this against App.js any time content is added or edited. It checks two
things automatically and prints a report - it does NOT auto-fix content
(that still needs a human/AI writer, since notes are long-form prose), but
it tells you exactly which topics and questions need attention.

Usage:
    python3 validate_ascend.py /path/to/App.js

Checks:
  1. 10/10/30 rule - every topic object (const T_XXX = {...}) must have
     exactly 10 items in `note`, 10 in `theory`, and 30 in `mcqs`.
  2. PASSCO answer/explanation consistency - for every MCQ in PAST_PAPERS,
     flags cases where the explanation (w) doesn't mention the marked
     correct option's text but does mention a different option's text.
     This is a heuristic (skips aggregate options like "All of the above"
     and "NOT true" style questions to cut down on false positives) - it
     catches self-contradicting explanations, not every possible content
     error. Treat its output as a shortlist to manually review, not a
     guaranteed list of true errors.
"""
import re
import json
import sys


def count_items(block, key):
    m = re.search(r'\b' + key + r':\s*\[', block)
    if not m:
        return None
    idx = m.end() - 1
    depth = 0
    j = idx
    in_str = None
    while j < len(block):
        c = block[j]
        if in_str:
            if c == '\\':
                j += 2
                continue
            if c == in_str:
                in_str = None
        else:
            if c in '"\'`':
                in_str = c
            elif c == '[':
                depth += 1
            elif c == ']':
                depth -= 1
                if depth == 0:
                    arr_text = block[idx:j + 1]
                    break
        j += 1
    else:
        return None
    depth2 = 0
    count = 0
    in_str2 = None
    k = 0
    while k < len(arr_text):
        c = arr_text[k]
        if in_str2:
            if c == '\\':
                k += 2
                continue
            if c == in_str2:
                in_str2 = None
        else:
            if c in '"\'`':
                in_str2 = c
            elif c == '{':
                if depth2 == 0:
                    count += 1
                depth2 += 1
            elif c == '}':
                depth2 -= 1
        k += 1
    return count


def check_10_10_30(text):
    starts = [(m.start(), m.group(1)) for m in re.finditer(r'^const (T_[A-Z_0-9]+) = \{', text, re.M)]
    starts.append((len(text), None))
    violations = []
    for i in range(len(starts) - 1):
        s, name = starts[i]
        e = starts[i + 1][0]
        block = text[s:e]
        n = count_items(block, 'note')
        t = count_items(block, 'theory')
        mc = count_items(block, 'mcqs')
        flags = []
        if n != 10:
            flags.append(f"note={n} (want 10)")
        if t != 10:
            flags.append(f"theory={t} (want 10)")
        if mc != 30:
            flags.append(f"mcqs={mc} (want 30)")
        if flags:
            line = text[:s].count('\n') + 1
            violations.append((name, line, flags))
    return violations, len(starts) - 1


AGG_WORDS = ["all of", "all the above", "none of", "a, b", "only a",
             "a and b", "a and c", "b and c", "only b"]

ITEM_RE = re.compile(
    r'\{\s*q:\s*(".*?"|`[\s\S]*?`)\s*,\s*o:\s*\[(.*?)\]\s*,\s*a:\s*(\d+)\s*,\s*w:\s*(".*?"|`[\s\S]*?`)\s*(?:,\s*flag:\s*\w+\s*)?\}',
    re.S
)


def parse_str(s):
    s = s.strip()
    if s.startswith('"') and s.endswith('"'):
        try:
            return json.loads(s)
        except Exception:
            return s[1:-1]
    if s.startswith('`') and s.endswith('`'):
        return s[1:-1]
    return s


def parse_opts(o_str):
    opts = re.findall(r'"((?:[^"\\]|\\.)*)"', o_str)
    return [json.loads('"' + o + '"') for o in opts]


def check_passco_consistency(text):
    if 'const PAST_PAPERS = [' not in text:
        return [], 0
    start = text.index('const PAST_PAPERS = [')
    end = text.index('\n];', start) + 3
    block = text[start:end]

    items = list(ITEM_RE.finditer(block))
    suspicious = []
    for m in items:
        qtext = parse_str(m.group(1))
        opts = parse_opts(m.group(2))
        a = int(m.group(3))
        w = parse_str(m.group(4))
        if a >= len(opts):
            suspicious.append((qtext, opts, a, w, "a-index out of range"))
            continue
        correct = opts[a].strip().lower()
        if any(ag in correct for ag in AGG_WORDS):
            continue
        wl = w.lower()
        correct_in_w = correct in wl
        other_hits = []
        for i, o in enumerate(opts):
            if i == a:
                continue
            ol = o.strip().lower()
            if any(ag in ol for ag in AGG_WORDS):
                continue
            if len(ol) > 3 and ol in wl:
                other_hits.append(o)
        if not correct_in_w and other_hits:
            suspicious.append((qtext, opts, a, w, other_hits))
    return suspicious, len(items)


def main():
    if len(sys.argv) != 2:
        print("Usage: python3 validate_ascend.py /path/to/App.js")
        sys.exit(1)
    with open(sys.argv[1], encoding='utf-8') as f:
        text = f.read()

    print("=" * 60)
    print("1) 10/10/30 CHECK")
    print("=" * 60)
    violations, total = check_10_10_30(text)
    if violations:
        for name, line, flags in violations:
            print(f"  {name:30s} (line ~{line}): {', '.join(flags)}")
        print(f"\n  {len(violations)} / {total} topics need fixing.")
    else:
        print(f"  All {total} topics pass (10 notes / 10 theory / 30 mcqs).")

    print()
    print("=" * 60)
    print("2) PASSCO ANSWER/EXPLANATION CONSISTENCY CHECK (heuristic)")
    print("=" * 60)
    suspicious, total_q = check_passco_consistency(text)
    if suspicious:
        for qtext, opts, a, w, other in suspicious:
            print(f"  Q: {qtext}")
            print(f"     Options: {opts}")
            print(f"     Marked correct: {opts[a] if a < len(opts) else 'OUT OF RANGE'}")
            print(f"     Explanation: {w}")
            print(f"     Flag: {other}")
            print()
        print(f"  {len(suspicious)} / {total_q} PASSCO questions flagged for manual review.")
    else:
        print(f"  No self-contradicting explanations found across {total_q} PASSCO questions.")
    print()
    print("NOTE: check #2 is a heuristic text-matcher, not a subject-matter check.")
    print("It only catches cases where the explanation contradicts its own answer key.")
    print("It cannot verify whether an answer is scientifically/factually correct.")


if __name__ == "__main__":
    main()
