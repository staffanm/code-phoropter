#!/usr/bin/env python3
import json
import os
from pathlib import Path
import re

def parse_font_filename(filename):
    """Extract weight, style, and width info from font filename"""
    filename = filename.replace('.ttf', '').replace('.otf', '')

    # Common patterns
    has_italic = bool(re.search(r'(Italic|Oblique|It|Slant)', filename, re.IGNORECASE))

    # Weight patterns (order matters - check longer patterns first)
    weight_patterns = {
        'ExtraLight': 200,
        'ExtraBold': 800,
        'SemiBold': 600,
        'DemiBold': 600,
        'UltraLight': 100,
        'Thin': 100,
        'Light': 300,
        'Regular': 400,
        'Normal': 400,
        'Medium': 500,
        'Bold': 700,
        'Black': 900,
        'Heavy': 900,
    }

    weight = 400  # default
    for pattern, value in weight_patterns.items():
        if re.search(pattern, filename, re.IGNORECASE):
            weight = value
            break

    # Width patterns
    width_patterns = {
        'Condensed': 75,
        'SemiCondensed': 87.5,
        'Expanded': 125,
        'SemiExpanded': 112.5,
    }

    width = None
    for pattern, value in width_patterns.items():
        if re.search(pattern, filename, re.IGNORECASE):
            width = value
            break

    return {
        'weight': weight,
        'italic': has_italic,
        'width': width
    }

def analyze_font_files(font_dir):
    """Analyze all font files in a directory"""
    files_info = {
        'weights': set(),
        'has_italic': False,
        'has_bold_italic': False,
        'widths': set(),
        'files': []
    }

    if not os.path.exists(font_dir):
        return None

    for file in os.listdir(font_dir):
        if file.endswith(('.ttf', '.otf')):
            info = parse_font_filename(file)
            files_info['files'].append(file)
            files_info['weights'].add(info['weight'])

            if info['italic']:
                files_info['has_italic'] = True
                if info['weight'] >= 700:
                    files_info['has_bold_italic'] = True

            if info['width']:
                files_info['widths'].add(info['width'])

    return files_info

def main():
    # Load font database
    with open('/home/staffan/repos/code-phoropter/font-database.json', 'r') as f:
        db = json.load(f)

    fonts_dir = Path('/home/staffan/repos/code-phoropter/fonts')
    discrepancies = []

    for font_data in db:
        if font_data.get('source') != 'embedded':
            continue

        font_name = font_data.get('name')
        # Get declared axes
        axes = font_data.get('axes', {})
        declared_weights = axes.get('weights', [])
        declared_styles = axes.get('styles', [])
        declared_widths = axes.get('widths', [])

        # Find font directory - use variantsMatrix files path if available
        font_dir = None

        # First try to use the variantsMatrix path
        variants = font_data.get('variantsMatrix', {})
        if variants and 'files' in variants:
            files_config = variants['files']
            # Get the first file path and extract directory
            for fmt, path in files_config.items():
                if path:
                    # Extract directory from path like "fonts/0xProto.NF/..."
                    parts = path.split('/')
                    if len(parts) >= 2 and parts[0] == 'fonts':
                        dir_name = parts[1]
                        test_dir = fonts_dir / dir_name
                        if test_dir.exists():
                            font_dir = test_dir
                            break

        # Fallback to name-based matching
        if not font_dir:
            possible_dirs = [
                fonts_dir / font_name,
                fonts_dir / font_name.replace(' ', ''),
                fonts_dir / f"{font_name}.NF",
                fonts_dir / f"{font_name.replace(' ', '')}.NF",
            ]

            for d in possible_dirs:
                if d.exists():
                    font_dir = d
                    break

        if not font_dir:
            # Try to find it by searching
            for d in fonts_dir.iterdir():
                if d.is_dir() and font_name.lower().replace(' ', '') in d.name.lower().replace(' ', ''):
                    font_dir = d
                    break

        if not font_dir:
            discrepancies.append({
                'font': font_name,
                'issue': 'DIRECTORY_NOT_FOUND',
                'declared': axes,
                'actual': None
            })
            continue

        # Analyze actual files
        actual = analyze_font_files(str(font_dir))

        if not actual or not actual['files']:
            discrepancies.append({
                'font': font_name,
                'issue': 'NO_FONT_FILES',
                'directory': str(font_dir),
                'declared': axes,
                'actual': None
            })
            continue

        # Compare and find discrepancies
        issues = []

        # Check styles
        has_italic_declared = 'italic' in declared_styles
        has_italic_files = actual['has_italic']

        if has_italic_files and not has_italic_declared:
            issues.append('MISSING_ITALIC_IN_AXES')
        elif has_italic_declared and not has_italic_files:
            issues.append('ITALIC_DECLARED_BUT_NO_FILES')

        # Check bold italic
        has_bold_italic_files = actual['has_bold_italic']
        if has_bold_italic_files and not has_italic_declared:
            issues.append('MISSING_BOLD_ITALIC_IN_AXES')

        # Check weights
        actual_weights = sorted(actual['weights'])
        if set(declared_weights) != set(actual_weights):
            issues.append('WEIGHT_MISMATCH')

        # Check widths - declared widths are often strings like "normal", "condensed"
        # while actual widths are numeric values like 75, 100
        # We need to convert or skip this comparison if they're in different formats
        actual_widths = sorted(actual['widths']) if actual['widths'] else []

        # Check if declared widths contains string values
        has_string_widths = declared_widths and isinstance(declared_widths[0], str) if declared_widths else False

        if has_string_widths:
            # If declared widths are strings like "normal", "condensed"
            # we can't compare directly with numeric widths
            # Only flag if there are actual numeric widths found
            if actual_widths:
                # They have width variants (condensed, etc) but declared as strings
                # This is not necessarily an error - skip this check
                pass
            # If no actual widths found, that's fine for string declarations
        else:
            # Numeric width comparison
            if actual_widths and not declared_widths:
                issues.append('WIDTHS_NOT_DECLARED')
            elif declared_widths and not actual_widths:
                issues.append('WIDTHS_DECLARED_BUT_NO_FILES')
            elif set(declared_widths) != set(actual_widths):
                issues.append('WIDTH_MISMATCH')

        if issues:
            discrepancies.append({
                'font': font_name,
                'directory': str(font_dir),
                'issues': issues,
                'declared': {
                    'weights': declared_weights,
                    'styles': declared_styles,
                    'widths': declared_widths
                },
                'actual': {
                    'weights': actual_weights,
                    'has_italic': has_italic_files,
                    'has_bold_italic': has_bold_italic_files,
                    'widths': actual_widths,
                    'files': actual['files']
                }
            })

    # Print report
    print(f"FONT DATABASE ANALYSIS REPORT")
    print(f"=" * 80)
    print(f"Total embedded fonts: {len([f for f in db if f.get('source') == 'embedded'])}")
    print(f"Fonts with discrepancies: {len(discrepancies)}")
    print(f"=" * 80)
    print()

    for d in discrepancies:
        print(f"\n{'=' * 80}")
        print(f"FONT: {d['font']}")
        print(f"{'=' * 80}")

        if 'issues' in d:
            print(f"Directory: {d['directory']}")
            print(f"\nIssues: {', '.join(d['issues'])}")

            print(f"\nDECLARED IN AXES:")
            print(f"  Weights: {d['declared']['weights']}")
            print(f"  Styles: {d['declared']['styles']}")
            print(f"  Widths: {d['declared']['widths']}")

            print(f"\nACTUAL FILES:")
            print(f"  Weights found: {d['actual']['weights']}")
            print(f"  Has italic: {d['actual']['has_italic']}")
            print(f"  Has bold italic: {d['actual']['has_bold_italic']}")
            print(f"  Widths found: {d['actual']['widths']}")
            print(f"  Files ({len(d['actual']['files'])}):")
            for f in sorted(d['actual']['files']):
                print(f"    - {f}")
        else:
            print(f"Issue: {d['issue']}")
            if d.get('directory'):
                print(f"Directory: {d['directory']}")
            print(f"Declared axes: {d['declared']}")

    print(f"\n{'=' * 80}")
    print(f"END OF REPORT")
    print(f"{'=' * 80}")

if __name__ == '__main__':
    main()
