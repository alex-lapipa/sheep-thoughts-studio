#!/usr/bin/env python3
"""
phase3-ogimage-swap.py — Swap Lovable AI Gateway image-gen calls to the
ai-gateway aiImage() adapter across the 16 og-* functions.

The og-* functions follow a near-identical pattern: fetch a Gemini-2.5-flash
image-preview chat completion through ai.gateway.lovable.dev, then unpack
data.choices[0].message.images[0].image_url.url. The new path returns a
ready-to-use { dataUrl, mimeType } from aiImage(prompt).
"""
import re
import sys
from pathlib import Path

ROOT = Path("/home/claude/sheep-thoughts-studio")
FUNCS_DIR = ROOT / "supabase" / "functions"

# All og-*-image functions that still call ai.gateway.lovable.dev directly.
TARGETS = [
    "og-home-image", "og-about-image", "og-faq-image", "og-facts-image",
    "og-explains-image", "og-achievements-image", "og-privacy-image",
    "og-shipping-image", "og-contact-image", "og-collections-image",
    "og-product-image", "og-badge-image", "og-talk-image", "og-dach-image",
    "og-francophone-image", "og-gaelic-image",
]

# Pattern: the apiKey lookup + the fetch block + the unpack line.
# We collapse it all into a single aiImage call.
APIKEY_LOOKUP_PATTERN = re.compile(
    r"(\s*)const apiKey = Deno\.env\.get\(['\"]LOVABLE_API_KEY['\"]\);\s*\n"
    r"\s*if \(!apiKey\) \{\s*\n"
    r"\s*throw new Error\(['\"]LOVABLE_API_KEY not configured['\"]\);\s*\n"
    r"\s*\}\s*\n",
    re.MULTILINE,
)

FETCH_BLOCK_PATTERN = re.compile(
    r"(\s*)const response = await fetch\(['\"]https://ai\.gateway\.lovable\.dev/v1/chat/completions['\"], \{[\s\S]*?\}\);\s*\n"
    r"\s*\n?"
    r"\s*if \(!response\.ok\) \{[\s\S]*?\}\s*\n"
    r"\s*\n?"
    r"\s*const data = await response\.json\(\);\s*\n"
    r"\s*const imageData = data\.choices\?\.\[0\]\?\.message\?\.images\?\.\[0\]\?\.image_url\?\.url;\s*\n",
    re.MULTILINE,
)

IMPORT_LINE = 'import { aiImage } from "../_shared/ai-gateway.ts";\n'


def patch_file(path: Path) -> tuple[bool, str]:
    src = path.read_text(encoding="utf-8")
    original = src

    # 1. Add import at the very top if not already present.
    if "_shared/ai-gateway" not in src:
        # Insert the import right after the file's first import or as line 1.
        first_import_match = re.search(r'^import .*?from .*?;\n', src, re.MULTILINE)
        if first_import_match:
            insert_at = first_import_match.end()
            src = src[:insert_at] + IMPORT_LINE + src[insert_at:]
        else:
            src = IMPORT_LINE + src

    # 2. Remove the apiKey lookup block.
    src = APIKEY_LOOKUP_PATTERN.sub("\n", src, count=1)

    # 3. Replace the fetch + unpack block with a single aiImage call.
    def fetch_replacement(m: re.Match) -> str:
        indent = m.group(1)
        return (
            f"{indent}const result = await aiImage(prompt, {{ size: '1792x1024' }});\n"
            f"{indent}const imageData = result.dataUrl;\n"
        )

    src, count = FETCH_BLOCK_PATTERN.subn(fetch_replacement, src, count=1)

    if count == 0:
        return (False, "fetch block pattern did not match")
    if src == original:
        return (False, "no changes applied (file may already be patched)")

    path.write_text(src, encoding="utf-8")
    return (True, "ok")


def main() -> int:
    apply = "--apply" in sys.argv
    failures = []
    successes = []
    for fn in TARGETS:
        path = FUNCS_DIR / fn / "index.ts"
        if not path.exists():
            failures.append((fn, "file not found"))
            continue

        if apply:
            ok, msg = patch_file(path)
            if ok:
                successes.append(fn)
            else:
                failures.append((fn, msg))
        else:
            # Dry run: just report whether the patterns would match.
            src = path.read_text(encoding="utf-8")
            apikey_hit = bool(APIKEY_LOOKUP_PATTERN.search(src))
            fetch_hit = bool(FETCH_BLOCK_PATTERN.search(src))
            print(f"  - {fn}: apikey={apikey_hit} fetch={fetch_hit}")

    if apply:
        print(f"\n✅ Patched: {len(successes)}  ❌ Skipped: {len(failures)}")
        for fn in successes:
            print(f"  ✓ {fn}")
        for fn, why in failures:
            print(f"  ✗ {fn}: {why}")
    else:
        print(f"\nDry run complete. Re-run with --apply to write.")
    return 0 if not failures else 1


if __name__ == "__main__":
    sys.exit(main())
