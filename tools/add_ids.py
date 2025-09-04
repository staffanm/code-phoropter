#!/usr/bin/env python3
"""
Stamp explicit 16-bit IDs into font-database.json and color-schemes.json.

Rules:
- Fonts: Assign id in 0..65535. Prefer existing `id` if present. Otherwise CRC16(name),
  resolve collisions by incrementing.
- Color schemes: Do the same for each scheme in `dark` and `light` arrays independently.

Usage:
  python tools/add_ids.py --write
  python tools/add_ids.py            # dry run, prints summary to stdout
"""
import json, sys, re, os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FONTS_PATH = ROOT / 'font-database.json'
SCHEMES_PATH = ROOT / 'color-schemes.json'

def assign_ids(items, name_key='name', existing_key='id', start=1):
    """Assign monotonically increasing 16-bit IDs, stable by name.
    IDs start at `start` (default 1) and increment by 1.
    """
    # Work on a copy of indices sorted by name for stable assignment
    ordered = sorted(range(len(items)), key=lambda i: (items[i].get(name_key) or '').lower())
    changed = 0
    next_id = start & 0xFFFF
    for idx in ordered:
        it = items[idx]
        name = (it.get(name_key) or '').strip()
        if not name:
            continue
        idv = next_id
        next_id = (next_id + 1) & 0xFFFF
        if it.get(existing_key) != idv:
            it[existing_key] = idv
            changed += 1
    return changed

def main():
    write = '--write' in sys.argv

    # Fonts
    fonts = json.loads(FONTS_PATH.read_text(encoding='utf-8'))
    if not isinstance(fonts, list):
        fonts = fonts.get('fonts', [])
    changed_fonts = assign_ids(fonts, 'name', 'id')

    # Schemes
    schemes = json.loads(SCHEMES_PATH.read_text(encoding='utf-8'))
    dark = schemes.get('dark', [])
    light = schemes.get('light', [])
    changed_dark = assign_ids(dark, 'name', 'id')
    changed_light = assign_ids(light, 'name', 'id')

    if write:
        # Write back fonts
        if isinstance(json.loads(FONTS_PATH.read_text(encoding='utf-8')), list):
            FONTS_PATH.write_text(json.dumps(fonts, ensure_ascii=False, indent=2), encoding='utf-8')
        else:
            FONTS_PATH.write_text(json.dumps({'fonts': fonts}, ensure_ascii=False, indent=2), encoding='utf-8')
        # Write back schemes
        SCHEMES_PATH.write_text(json.dumps({'dark': dark, 'light': light}, ensure_ascii=False, indent=2), encoding='utf-8')
        print(f"Wrote IDs: fonts changed={changed_fonts}, dark changed={changed_dark}, light changed={changed_light}")
    else:
        print(json.dumps({
            'fonts_changed': changed_fonts,
            'dark_changed': changed_dark,
            'light_changed': changed_light
        }, indent=2))

if __name__ == '__main__':
    main()
