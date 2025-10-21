#!/usr/bin/env python3
"""
Detect bitmap fonts and suggest native sizes.
Analyzes TTF/OTF files to find embedded bitmap strikes.
"""

import sys
import json
from pathlib import Path

def check_for_bitmap_strikes(font_path):
    """Check if a font has embedded bitmap strikes using fonttools."""
    try:
        from fontTools import ttLib
    except ImportError:
        print("Error: fonttools not installed. Install with: pip install fonttools")
        return None

    try:
        font = ttLib.TTFont(font_path)

        # Check for bitmap tables
        bitmap_tables = ['EBLC', 'EBDT', 'bloc', 'bdat', 'CBDT', 'CBLC']
        has_bitmaps = any(table in font for table in bitmap_tables)

        if not has_bitmaps:
            return None

        # Try to extract bitmap sizes
        sizes = []

        # Check EBLC (Embedded Bitmap Location) table for sizes
        if 'EBLC' in font:
            eblc = font['EBLC']
            for strike in eblc.strikes:
                # ppemY is the pixel size
                size = strike['ppemY']
                sizes.append(size)

        # Check CBLC (Color Bitmap Location) table
        elif 'CBLC' in font:
            cblc = font['CBLC']
            for strike in cblc.strikes:
                size = strike['ppemY']
                sizes.append(size)

        # Deduplicate and sort
        sizes = sorted(list(set(sizes)))

        font.close()

        return {
            'has_bitmaps': True,
            'native_sizes': sizes,
            'recommended_size': sizes[-1] if sizes else None  # Largest size
        }

    except Exception as e:
        print(f"Error analyzing {font_path}: {e}")
        return None

def analyze_font_database():
    """Analyze all fonts in font-database.json for bitmap strikes."""

    db_path = Path('font-database.json')
    if not db_path.exists():
        print("Error: font-database.json not found")
        return

    with open(db_path) as f:
        fonts = json.load(f)

    print("Analyzing fonts for embedded bitmaps...")
    print("=" * 60)

    bitmap_fonts = []

    for font in fonts:
        if font.get('source') != 'embedded':
            continue

        name = font['name']

        # Try to find font file
        font_file = None
        if font.get('ttf'):
            font_file = font['ttf']
        elif font.get('variantsMatrix'):
            vm = font['variantsMatrix']
            # Get first file from template
            if 'files' in vm:
                for fmt, template in vm['files'].items():
                    if fmt in ['ttf', 'otf']:
                        # Resolve template for Regular variant
                        font_file = template
                        # Simple template resolution (just remove placeholders)
                        font_file = font_file.replace('{weight|map}', 'Regular')
                        font_file = font_file.replace('{style|map}', '')
                        font_file = font_file.replace('{width|map}', '')
                        font_file = font_file.replace('--', '-')
                        break

        if not font_file or not Path(font_file).exists():
            continue

        # Check for bitmap strikes
        result = check_for_bitmap_strikes(font_file)

        if result and result['has_bitmaps']:
            print(f"\n✓ {name}")
            print(f"  File: {font_file}")
            print(f"  Native sizes: {result['native_sizes']}")
            print(f"  Recommended: {result['recommended_size']}px")

            bitmap_fonts.append({
                'name': name,
                'file': str(font_file),
                'native_sizes': result['native_sizes'],
                'recommended_size': result['recommended_size']
            })

    print("\n" + "=" * 60)
    print(f"Found {len(bitmap_fonts)} bitmap fonts")

    if bitmap_fonts:
        print("\nSuggested font-database.json updates:")
        print("=" * 60)

        for bf in bitmap_fonts:
            print(f"""
{{
  "name": "{bf['name']}",
  "bitmapFont": true,
  "nativeSizes": {json.dumps(bf['native_sizes'])},
  "recommendedSize": {bf['recommended_size']},
  "scalingWarning": "This is a bitmap font. Best at {bf['recommended_size']}px.",
  "variantsMatrix": {{
    ...
    "skipSubsetting": true
  }}
}}
""")

if __name__ == '__main__':
    analyze_font_database()
