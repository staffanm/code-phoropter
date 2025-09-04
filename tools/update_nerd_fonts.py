#!/usr/bin/env python3
import json
import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FONTS_DIR = ROOT / 'fonts'
DB_PATH = ROOT / 'font-database.json'

WEIGHT_MAP = {
    'Thin': 100,
    'ExtraLight': 200,
    'UltraLight': 200,
    'Light': 300,
    'Regular': 400,
    'Book': 400,
    'Medium': 500,
    'SemiBold': 600,
    'DemiBold': 600,
    'Bold': 700,
    'ExtraBold': 800,
    'UltraBold': 800,
    'Heavy': 900,
    'Black': 900,
}

def infer_axes(files):
    weights = set()
    styles = set(['normal'])
    for f in files:
        name = f.name
        # Match *NerdFont-<Weight><Style>.ttf
        m = re.search(r'NerdFont-([A-Za-z]+)(Italic|Oblique)?', name)
        if not m:
            continue
        wlabel = m.group(1)
        slabel = m.group(2)
        w = WEIGHT_MAP.get(wlabel, 400)
        weights.add(w)
        if slabel == 'Italic':
            styles.add('italic')
        elif slabel == 'Oblique':
            styles.add('oblique')
    if not weights:
        weights.add(400)
    return sorted(weights), sorted(styles)

def weight_revmap():
    rev = {}
    for k,v in WEIGHT_MAP.items():
        rev.setdefault(v, k)
    return rev

def normalize(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", s.lower())

def detect_prefix(files):
    # Use stem before first '-' as prefix, e.g., SeriousShannsNerdFont-Regular.otf -> SeriousShannsNerdFont
    return files[0].stem.split('-')[0]

def resolve_patched_from(base_hint: str, db_names):
    cand = normalize(base_hint)
    best = None
    for name in db_names:
        if normalize(name) == cand:
            return name
    # try replacing hyphens with space
    alt = base_hint.replace('-', ' ')
    for name in db_names:
        if normalize(name) == normalize(alt):
            return name
    # fallback: title-case/space
    return alt

def build_entry(dirpath: Path, files, db_names):
    base = dirpath.name[:-3]  # strip .NF
    display = f"{base} Nerd Font"
    weights, styles = infer_axes(files)
    revw = weight_revmap()
    weight_map = {}
    for w in weights:
        label = revw.get(w, 'Regular')
        # Normalize label capitalization
        if label == 'Book':
            label = 'Regular'
        suffix = f"-{label}"
        # Default 400 behaviour handled by rules; put -Regular, resolver will drop where needed
        weight_map[str(w)] = suffix if w != 400 else '-Regular'
    style_map = {'normal': '', 'italic': '-Italic', 'oblique': '-Oblique'}
    width_map = {'normal': ''}
    # Build entry
    nf_prefix = detect_prefix(files)
    patched_from = resolve_patched_from(base, db_names)
    # detect extension (ttf/otf)
    ext = files[0].suffix.lower().lstrip('.')
    prefer = 'ttf' if ext == 'ttf' else 'otf'
    entry = {
        'name': display,
        'family': 'Terminal & Retro',
        'source': 'embedded',
        'ligatures': True,
        'icons': True,
        'patchedFrom': patched_from,
        'description': f'{base} patched with Nerd Font glyphs',
        'css': f'"{display}"',
        'homepage': 'https://www.nerdfonts.com/',
        'axes': {
            'weights': weights,
            'styles': styles,
            'widths': ['normal']
        },
        'variantsMatrix': {
            'prefer': prefer,
            'files': {
                prefer: f"fonts/{dirpath.name}/{nf_prefix}{{weight|map}}{{style|map}}.{ext}"
            },
            'maps': {
                'width': width_map,
                'weight': weight_map,
                'style': style_map
            },
            'cleanup': True,
            'rules': { 'regularOnlyOnBase': True, 'regularName': '-Regular' }
        }
    }
    return entry

def main():
    db = json.loads(DB_PATH.read_text())
    by_name = {e['name']: i for i,e in enumerate(db)}
    db_names = [e['name'] for e in db]
    # Scan .NF directories
    for d in sorted(FONTS_DIR.glob('*.NF')):
        files = sorted(list(d.glob('*.ttf')) + list(d.glob('*.otf')))
        if not files:
            continue
        entry = build_entry(d, files, db_names)
        if entry['name'] in by_name:
            db[by_name[entry['name']]] = entry
        else:
            db.append(entry)
            by_name[entry['name']] = len(db)-1
    DB_PATH.write_text(json.dumps(db, indent=2))
    print('Updated font-database.json with Nerd Font entries.')

if __name__ == '__main__':
    main()
