#!/usr/bin/env python3
"""
Generate font subsets for preview mode using only glyphs from code samples.
Reduces font file sizes by 90-95% for faster initial loading.

Requirements:
  pip install fonttools brotli

Usage:
  python3 tools/subset_fonts.py [--dry-run] [--font FONTNAME]
"""

import os
import sys
import json
import subprocess
import argparse
from pathlib import Path

def check_dependencies():
    """Check if required tools are installed."""
    try:
        import fontTools
        print("✓ fonttools installed")
    except ImportError:
        print("✗ fonttools not installed. Install with:")
        print("  pip install fonttools brotli")
        return False

    # Check for pyftsubset
    result = subprocess.run(['pyftsubset', '--help'],
                          capture_output=True,
                          text=True)
    if result.returncode != 0:
        print("✗ pyftsubset not found. Install with:")
        print("  pip install fonttools")
        return False

    print("✓ pyftsubset available")
    return True

def load_glyph_data():
    """Load the analyzed glyph data from JSON."""
    json_path = Path('tools/subset-glyphs.json')
    if not json_path.exists():
        print("Error: subset-glyphs.json not found")
        print("Run: python3 tools/analyze_glyphs.py first")
        sys.exit(1)

    with open(json_path) as f:
        return json.load(f)

def load_font_database():
    """Load font database to find embedded fonts."""
    db_path = Path('font-database.json')
    if not db_path.exists():
        print("Error: font-database.json not found")
        sys.exit(1)

    with open(db_path) as f:
        return json.load(f)

def resolve_font_file(font_data):
    """Resolve the font file path from font database entry."""
    if not font_data.get('variantsMatrix'):
        # Old format: direct file paths
        for ext in ['woff2', 'woff', 'ttf', 'otf']:
            if font_data.get(ext):
                return font_data[ext]
        return None

    # New format: variantsMatrix template
    vm = font_data['variantsMatrix']
    files = vm.get('files', {})
    maps = vm.get('maps', {})

    # Get Regular weight file (400)
    prefer = vm.get('prefer', 'woff2')
    template = files.get(prefer) or files.get('ttf') or files.get('otf')

    if not template:
        return None

    # Resolve template for Regular variant
    weight_map = maps.get('weight', {})
    style_map = maps.get('style', {})
    width_map = maps.get('width', {})

    weight_part = weight_map.get('400', weight_map.get(400, ''))
    style_part = style_map.get('normal', '')
    width_part = width_map.get('normal', '')

    # Handle regularOnlyOnBase rule
    rules = vm.get('rules', {})
    if rules.get('regularOnlyOnBase'):
        weight_part = rules.get('regularName', weight_part)

    # Replace template variables
    path = template
    path = path.replace('{weight|map}', weight_part)
    path = path.replace('{style|map}', style_part)
    path = path.replace('{width|map}', width_part)
    path = path.replace('{suffix|map}', '')

    # Clean up
    path = path.replace('//', '/').replace('--', '-').replace('-.', '.').replace('/-', '/')

    return path

def subset_font(input_file, output_file, unicodes_param, dry_run=False):
    """Run pyftsubset on a font file."""
    input_path = Path(input_file)

    if not input_path.exists():
        print(f"  ✗ Input file not found: {input_file}")
        return False

    output_path = Path(output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Determine output format
    if output_file.endswith('.woff2'):
        flavor = 'woff2'
    elif output_file.endswith('.woff'):
        flavor = 'woff'
    else:
        flavor = None

    # Build pyftsubset command
    cmd = [
        'pyftsubset',
        str(input_path),
        f'--unicodes={unicodes_param}',
        '--layout-features=*',  # Keep ALL layout features (ligatures, etc.)
        '--glyph-names',        # Keep glyph names
        '--legacy-kern',        # Keep legacy kerning
        '--notdef-outline',     # Keep .notdef glyph
        '--no-hinting',         # Remove hinting (reduces size, browsers handle it)
        f'--output-file={output_path}',
    ]

    if flavor:
        cmd.append(f'--flavor={flavor}')

    if dry_run:
        print(f"  [DRY RUN] Would run: {' '.join(cmd[:3])} ...")
        return True

    print(f"  Running pyftsubset...")
    result = subprocess.run(cmd, capture_output=True, text=True)

    if result.returncode != 0:
        print(f"  ✗ pyftsubset failed:")
        print(f"    {result.stderr}")
        return False

    # Check file sizes
    input_size = input_path.stat().st_size
    output_size = output_path.stat().st_size
    reduction = (1 - output_size / input_size) * 100

    print(f"  ✓ Subset created: {output_path.name}")
    print(f"    Input:  {input_size:>10,} bytes")
    print(f"    Output: {output_size:>10,} bytes")
    print(f"    Reduction: {reduction:>6.1f}%")

    return True

def main():
    parser = argparse.ArgumentParser(description='Generate font subsets for preview mode')
    parser.add_argument('--dry-run', action='store_true',
                       help='Show what would be done without actually subsetting')
    parser.add_argument('--font', type=str,
                       help='Only subset this specific font')
    parser.add_argument('--skip-check', action='store_true',
                       help='Skip dependency check')
    args = parser.parse_args()

    print("="*70)
    print("FONT SUBSETTING FOR CODE PHOROPTER")
    print("="*70)
    print()

    # Check dependencies
    if not args.skip_check and not check_dependencies():
        print("\nInstall dependencies with:")
        print("  pip install fonttools brotli")
        sys.exit(1)

    print()

    # Load data
    glyph_data = load_glyph_data()
    font_db = load_font_database()

    unicodes_param = glyph_data['unicodes_param']
    print(f"Unicode ranges loaded: {len(glyph_data['unicode_ranges'])} ranges, {glyph_data['total_chars']} characters")
    print()

    # Filter to embedded fonts only
    embedded_fonts = [f for f in font_db if f.get('source') == 'embedded']
    print(f"Found {len(embedded_fonts)} embedded fonts")

    if args.font:
        embedded_fonts = [f for f in embedded_fonts if f.get('name') == args.font]
        if not embedded_fonts:
            print(f"Error: Font '{args.font}' not found")
            sys.exit(1)
        print(f"Filtering to: {args.font}")

    print()

    # Process each font
    success_count = 0
    skip_count = 0
    fail_count = 0

    for font in embedded_fonts:
        name = font['name']
        print(f"Processing: {name}")

        # Resolve font file path
        input_file = resolve_font_file(font)
        if not input_file:
            print(f"  ⏭️  Skipped: Could not resolve font file path")
            skip_count += 1
            continue

        # Check if file exists
        if not Path(input_file).exists():
            print(f"  ⏭️  Skipped: File not found ({input_file})")
            skip_count += 1
            continue

        # Determine output path
        input_path = Path(input_file)
        output_dir = input_path.parent

        # Create subset filename: Font-Regular.woff2 -> Font-Regular.subset.woff2
        name_parts = input_path.stem.split('.')
        if name_parts[-1] == 'subset':
            # Already a subset, skip
            print(f"  ⏭️  Skipped: Already a subset file")
            skip_count += 1
            continue

        output_name = f"{input_path.stem}.subset{input_path.suffix}"
        output_file = output_dir / output_name

        # Subset the font
        if subset_font(input_file, output_file, unicodes_param, dry_run=args.dry_run):
            success_count += 1
        else:
            fail_count += 1

        print()

    # Summary
    print("="*70)
    print("SUMMARY")
    print("="*70)
    print(f"✓ Successfully subset: {success_count} fonts")
    print(f"⏭️  Skipped: {skip_count} fonts")
    if fail_count > 0:
        print(f"✗ Failed: {fail_count} fonts")
    print()

    if args.dry_run:
        print("This was a dry run. Use without --dry-run to actually generate subsets.")
    else:
        print("Subset fonts created with '.subset' suffix (e.g., Font-Regular.subset.woff2)")
        print("Update app.js to use these for preview mode.")

if __name__ == '__main__':
    main()
