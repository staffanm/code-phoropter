#!/usr/bin/env python3
"""
Analyze all code samples to extract unique glyphs used.
Generates unicode ranges for font subsetting.
"""

import os
import sys
import json
from pathlib import Path
from collections import Counter

def analyze_samples(samples_dir='samples'):
    """Read all sample files and extract unique characters."""
    samples_path = Path(samples_dir)

    if not samples_path.exists():
        print(f"Error: {samples_dir} directory not found")
        sys.exit(1)

    all_chars = set()
    file_chars = {}

    # Read all sample files
    for sample_file in samples_path.glob('*'):
        if sample_file.is_file():
            try:
                content = sample_file.read_text(encoding='utf-8')
                chars = set(content)
                all_chars.update(chars)
                file_chars[sample_file.name] = chars
                print(f"✓ Read {sample_file.name}: {len(chars)} unique chars")
            except Exception as e:
                print(f"✗ Error reading {sample_file.name}: {e}")

    return all_chars, file_chars

def chars_to_unicode_ranges(chars):
    """Convert set of characters to unicode range strings."""
    # Sort by codepoint
    codepoints = sorted([ord(c) for c in chars])

    # Group into ranges
    ranges = []
    if not codepoints:
        return ranges

    start = codepoints[0]
    end = codepoints[0]

    for cp in codepoints[1:]:
        if cp == end + 1:
            # Consecutive, extend range
            end = cp
        else:
            # Gap, save current range and start new one
            ranges.append((start, end))
            start = cp
            end = cp

    # Add final range
    ranges.append((start, end))

    return ranges

def format_unicode_list(ranges):
    """Format ranges as comma-separated unicode list for pyftsubset."""
    parts = []
    for start, end in ranges:
        if start == end:
            parts.append(f"U+{start:04X}")
        else:
            parts.append(f"U+{start:04X}-{end:04X}")
    return ','.join(parts)

def format_unicodes_param(ranges):
    """Format ranges for pyftsubset --unicodes parameter."""
    parts = []
    for start, end in ranges:
        if start == end:
            parts.append(f"{start:04X}")
        else:
            parts.append(f"{start:04X}-{end:04X}")
    return ','.join(parts)

def analyze_by_category(chars):
    """Categorize characters by Unicode block."""
    categories = {
        'Basic Latin': (0x0000, 0x007F),
        'Latin-1 Supplement': (0x0080, 0x00FF),
        'Latin Extended-A': (0x0100, 0x017F),
        'Latin Extended-B': (0x0180, 0x024F),
        'Greek and Coptic': (0x0370, 0x03FF),
        'Cyrillic': (0x0400, 0x04FF),
        'Hebrew': (0x0590, 0x05FF),
        'Arabic': (0x0600, 0x06FF),
        'Devanagari': (0x0900, 0x097F),
        'Bengali': (0x0980, 0x09FF),
        'Thai': (0x0E00, 0x0E7F),
        'Tibetan': (0x0F00, 0x0FFF),
        'Georgian': (0x10A0, 0x10FF),
        'Hangul Jamo': (0x1100, 0x11FF),
        'Latin Extended Additional': (0x1E00, 0x1EFF),
        'General Punctuation': (0x2000, 0x206F),
        'Currency Symbols': (0x20A0, 0x20CF),
        'Letterlike Symbols': (0x2100, 0x214F),
        'Number Forms': (0x2150, 0x218F),
        'Arrows': (0x2190, 0x21FF),
        'Mathematical Operators': (0x2200, 0x22FF),
        'Box Drawing': (0x2500, 0x257F),
        'Block Elements': (0x2580, 0x259F),
        'Geometric Shapes': (0x25A0, 0x25FF),
        'Miscellaneous Symbols': (0x2600, 0x26FF),
        'Dingbats': (0x2700, 0x27BF),
        'CJK Symbols and Punctuation': (0x3000, 0x303F),
        'Hiragana': (0x3040, 0x309F),
        'Katakana': (0x30A0, 0x30FF),
        'Hangul Compatibility Jamo': (0x3130, 0x318F),
        'CJK Unified Ideographs': (0x4E00, 0x9FFF),
        'Hangul Syllables': (0xAC00, 0xD7AF),
        'Private Use Area': (0xE000, 0xF8FF),  # Nerd Fonts!
        'Alphabetic Presentation Forms': (0xFB00, 0xFB4F),
        'Halfwidth and Fullwidth Forms': (0xFF00, 0xFFFF),
    }

    categorized = {cat: [] for cat in categories}
    categorized['Other'] = []

    for char in chars:
        cp = ord(char)
        found = False
        for cat, (start, end) in categories.items():
            if start <= cp <= end:
                categorized[cat].append(char)
                found = True
                break
        if not found:
            categorized['Other'].append(char)

    return {k: v for k, v in categorized.items() if v}

def main():
    print("="*60)
    print("GLYPH ANALYSIS FOR FONT SUBSETTING")
    print("="*60)
    print()

    # Analyze samples
    all_chars, file_chars = analyze_samples('samples')

    print()
    print(f"Total unique characters: {len(all_chars)}")
    print()

    # Categorize
    categories = analyze_by_category(all_chars)
    print("Character distribution by Unicode block:")
    for cat, chars in sorted(categories.items(), key=lambda x: len(x[1]), reverse=True):
        print(f"  {cat:<30} {len(chars):>5} chars")

    print()

    # Generate ranges
    ranges = chars_to_unicode_ranges(all_chars)
    print(f"Unicode ranges: {len(ranges)} ranges")

    # Format for pyftsubset
    unicode_list = format_unicode_list(ranges)
    unicodes_param = format_unicodes_param(ranges)

    # Save to file
    output_file = 'tools/subset-glyphs.txt'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Unique glyphs from code samples\n")
        f.write(f"# Total characters: {len(all_chars)}\n")
        f.write(f"# Generated from samples/ directory\n\n")

        f.write("# Sorted characters:\n")
        for char in sorted(all_chars, key=ord):
            cp = ord(char)
            if 32 <= cp <= 126:  # Printable ASCII
                f.write(f"{char} ")
            elif char == '\n':
                f.write("\\n ")
            elif char == '\t':
                f.write("\\t ")
            else:
                f.write(f"U+{cp:04X} ")
        f.write("\n\n")

        f.write("# Unicode ranges (CSS unicode-range format):\n")
        f.write(unicode_list)
        f.write("\n\n")

        f.write("# For pyftsubset --unicodes parameter:\n")
        f.write(unicodes_param)
        f.write("\n")

    print(f"✓ Saved glyph data to {output_file}")

    # Create JSON for programmatic use
    json_output = {
        'total_chars': len(all_chars),
        'unicode_ranges': ranges,
        'unicode_list': unicode_list,
        'unicodes_param': unicodes_param,
        'categories': {k: len(v) for k, v in categories.items()},
        'codepoints': [ord(c) for c in all_chars]
    }

    json_file = 'tools/subset-glyphs.json'
    with open(json_file, 'w') as f:
        json.dump(json_output, f, indent=2)

    print(f"✓ Saved JSON data to {json_file}")

    # Print sample commands
    print()
    print("="*60)
    print("SAMPLE PYFTSUBSET COMMAND:")
    print("="*60)
    print(f"""
pyftsubset input-font.ttf \\
  --unicodes="{unicodes_param[:100]}..." \\
  --layout-features="*" \\
  --flavor=woff2 \\
  --output-file=output-font.subset.woff2
    """)

    print()
    print("For Google Fonts unicode-range parameter:")
    print(f"  {unicode_list[:100]}...")

if __name__ == '__main__':
    main()
