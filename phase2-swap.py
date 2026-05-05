#!/usr/bin/env python3
"""
phase2-swap.py — Lovable AI Gateway → aiChat/aiEmbed adapter swap

Run from the repo root:
    python3 phase2-swap.py            # dry run, prints diffs
    python3 phase2-swap.py --apply    # writes the changes
"""
from __future__ import annotations
import argparse
import difflib
import sys
from pathlib import Path

CHAT_FILES = [
    "supabase/functions/bubbles-orchestrator/index.ts",
    "supabase/functions/generate-business-plan/index.ts",
    "supabase/functions/store-ops-agent/index.ts",
]

EMBED_FILES = [
    "supabase/functions/bubbles-voice-chat/index.ts",
    "supabase/functions/seed-behavioral-knowledge/index.ts",
    "supabase/functions/seed-bubbles-knowledge/index.ts",
    "supabase/functions/seed-rag-content/index.ts",
]

MODEL_MAP = {
    "google/gemini-3-flash-preview": "claude-haiku-4-5",
    "google/gemini-2.5-flash": "claude-haiku-4-5",
    "google/gemini-1.5-pro": "claude-sonnet-4-5",
    "google/gemini-2.5-pro": "claude-sonnet-4-5",
}

CHAT_IMPORT = 'import { aiChat } from "../_shared/ai-gateway.ts";'
EMBED_IMPORT = 'import { aiEmbed } from "../_shared/ai-gateway.ts";'

CHAT_URL = "https://ai.gateway.lovable.dev/v1/chat/completions"
EMBED_URL = "https://ai.gateway.lovable.dev/v1/embeddings"


def find_balanced(s, start, open_ch="(", close_ch=")"):
    depth = 0
    i = start
    n = len(s)
    in_str = None
    while i < n:
        ch = s[i]
        if in_str:
            if ch == "\\":
                i += 2
                continue
            if ch == in_str:
                in_str = None
            i += 1
            continue
        if ch in ("'", '"', "`"):
            in_str = ch
            i += 1
            continue
        if ch == open_ch:
            depth += 1
        elif ch == close_ch:
            depth -= 1
            if depth == 0:
                return i + 1
        i += 1
    raise ValueError(f"Unbalanced {open_ch}{close_ch}")


def find_fetch_call(content, gateway_url, search_from=0):
    needles = [f'"{gateway_url}"', f"'{gateway_url}'"]
    idx = -1
    for n in needles:
        i = content.find(n, search_from)
        if i != -1 and (idx == -1 or i < idx):
            idx = i
    if idx == -1:
        return None
    fetch_start = content.rfind("fetch(", 0, idx)
    if fetch_start == -1:
        return None
    open_paren = fetch_start + len("fetch")
    if content[open_paren] != "(":
        return None
    end = find_balanced(content, open_paren, "(", ")")
    return fetch_start, end


def extract_body_object(fetch_expr):
    js_marker = "JSON.stringify("
    i = fetch_expr.find(js_marker)
    if i == -1:
        return None
    paren_open = i + len(js_marker) - 1
    paren_end = find_balanced(fetch_expr, paren_open, "(", ")")
    return fetch_expr[paren_open + 1 : paren_end - 1].strip()


def extract_input_expr(body):
    n = len(body)
    i = 0
    while i < n:
        if body[i:i + 6] == "input:":
            j = i + 6
            while j < n and body[j] in " \t\n":
                j += 1
            start = j
            db = bk = bp = 0
            in_str = None
            while j < n:
                ch = body[j]
                if in_str:
                    if ch == "\\":
                        j += 2
                        continue
                    if ch == in_str:
                        in_str = None
                    j += 1
                    continue
                if ch in ("'", '"', "`"):
                    in_str = ch
                elif ch == "{": db += 1
                elif ch == "}":
                    if db == 0: break
                    db -= 1
                elif ch == "[": bk += 1
                elif ch == "]": bk -= 1
                elif ch == "(": bp += 1
                elif ch == ")": bp -= 1
                elif ch == "," and db == 0 and bk == 0 and bp == 0:
                    break
                j += 1
            return body[start:j].strip().rstrip(",").strip()
        i += 1
    return None


def remap_model(body):
    out = body
    for old, new in MODEL_MAP.items():
        out = out.replace(f'"{old}"', f'"{new}"').replace(f"'{old}'", f"'{new}'")
    return out


def add_import(content, import_line):
    """Insert an import line after the LAST complete top-level import statement.
    Handles multi-line imports like `import { a, b, c } from "x"`."""
    if import_line in content:
        return content
    # Find each complete import statement (start line through line ending with `;`)
    lines = content.splitlines(keepends=True)
    in_import = False
    last_end = -1  # line index where the last import statement ends
    for i, ln in enumerate(lines):
        stripped = ln.lstrip()
        if not in_import and stripped.startswith("import "):
            in_import = True
        if in_import:
            # An import ends on a line that contains `;` (top-level — not inside a brace)
            # For our purposes, lines ending with `;` (after stripping whitespace + newline) suffice.
            if ln.rstrip().endswith(";"):
                last_end = i
                in_import = False
    if last_end == -1:
        return import_line + "\n" + content
    lines.insert(last_end + 1, import_line + "\n")
    return "".join(lines)


def swap_chat(content):
    count = 0
    cursor = 0
    out = []
    while True:
        found = find_fetch_call(content, CHAT_URL, cursor)
        if not found:
            out.append(content[cursor:])
            break
        start, end = found
        out.append(content[cursor:start])
        fetch_expr = content[start:end]
        body = extract_body_object(fetch_expr)
        if body is None:
            out.append(fetch_expr)
        else:
            out.append(f"aiChat({remap_model(body)})")
            count += 1
        cursor = end
    new = "".join(out)
    if count > 0:
        new = add_import(new, CHAT_IMPORT)
    return new, count


def swap_embed(content):
    count = 0
    cursor = 0
    out = []
    while True:
        found = find_fetch_call(content, EMBED_URL, cursor)
        if not found:
            out.append(content[cursor:])
            break
        start, end = found
        out.append(content[cursor:start])
        fetch_expr = content[start:end]
        body = extract_body_object(fetch_expr)
        if body is None:
            out.append(fetch_expr)
            cursor = end
            continue
        inp = extract_input_expr(body)
        if inp is None:
            out.append(fetch_expr)
            cursor = end
            continue
        out.append(f"aiEmbed({inp})")
        count += 1
        cursor = end
    new = "".join(out)
    if count > 0:
        new = add_import(new, EMBED_IMPORT)
    return new, count


def process_file(path, mode, apply_changes):
    if not path.exists():
        print(f"  WARN {path.name} not found")
        return 0
    original = path.read_text()
    if mode == "chat":
        new_content, count = swap_chat(original)
    else:
        new_content, count = swap_embed(original)
    rel = path.relative_to(path.parents[3])
    if count == 0:
        print(f"  - {rel}: no matches")
        return 0
    if apply_changes:
        path.write_text(new_content)
        print(f"  OK {rel}: {count} swap(s) applied")
    else:
        print(f"\n--- {rel} ({count} swap(s)) ---")
        diff = difflib.unified_diff(
            original.splitlines(keepends=True),
            new_content.splitlines(keepends=True),
            fromfile=path.name, tofile=path.name + " (after)", n=2,
        )
        sys.stdout.writelines(diff)
    return count


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--apply", action="store_true")
    p.add_argument("--root", default=".")
    args = p.parse_args()
    root = Path(args.root).resolve()
    if not (root / "supabase" / "functions").exists():
        sys.exit(f"ERROR: {root}/supabase/functions missing. Run from repo root.")
    adapter = root / "supabase" / "functions" / "_shared" / "ai-gateway.ts"
    if not adapter.exists():
        sys.exit(f"ERROR: {adapter} missing. Drop in ai-gateway.ts first.")
    print(f"{'APPLY' if args.apply else 'DRY RUN'} -- root: {root}\n")
    print("=== Chat completions -> aiChat ===")
    chat = sum(process_file(root / f, "chat", args.apply) for f in CHAT_FILES)
    print("\n=== Embeddings -> aiEmbed ===")
    emb = sum(process_file(root / f, "embed", args.apply) for f in EMBED_FILES)
    print(f"\nSummary: {chat} chat swaps, {emb} embed swaps")
    if not args.apply:
        print("\nRe-run with --apply to write changes.")


if __name__ == "__main__":
    main()
