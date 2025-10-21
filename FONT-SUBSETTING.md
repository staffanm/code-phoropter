# Font Subsetting for Code Phoropter

This document explains the font subsetting system that dramatically reduces initial page load times by creating lightweight preview versions of fonts.

## Problem

Code Phoropter includes 100+ fonts, many with 20-50 variants each. For example:
- **Iosevka**: 54 variants (weights × styles × widths) = ~100MB total
- **Monaspace fonts**: 42 variants each × 5 families = ~200MB total

When a user previews fonts, they don't need all 40,000 glyphs per font - they only need the ~500 characters used in code samples.

## Solution

### Two-Tier Loading Strategy

1. **Preview Mode** (default):
   - Loads ONLY Regular weight variant
   - Uses `.subset` font files containing only glyphs from code samples
   - **Result**: 95% reduction in initial downloads

2. **Full Mode** (after user finalizes choice):
   - Loads all variants with all glyphs
   - Used when exporting settings or downloading font package

### File Size Impact

**Example: Iosevka Regular**
- Full font: ~2,000 KB (40,000+ glyphs)
- Subset font: ~100 KB (534 glyphs from samples)
- **Reduction**: 95%

**For 10 fonts browsed**:
- Before: ~20 MB downloaded
- After: ~1 MB downloaded
- **95% less bandwidth**

## How It Works

### 1. Glyph Analysis

The `analyze_glyphs.py` script reads all files in `samples/` and extracts unique characters:

```bash
make subset-analyze
```

This generates:
- `tools/subset-glyphs.txt` - Human-readable list of characters
- `tools/subset-glyphs.json` - Machine-readable data for subsetting

**Current results** (from actual samples):
- **534 unique characters** across all samples
- Includes: Basic Latin, programming symbols, box drawing, Nerd Font icons, international scripts

### 2. Font Subsetting

The `subset_fonts.py` script creates subset versions using `pyftsubset`:

```bash
make subset-fonts
```

For each embedded font, it:
1. Finds the Regular variant file
2. Creates a subset with only the 534 glyphs from samples
3. Saves as `FontName-Regular.subset.woff2`

**Example output**:
```
Processing: Fira Code
  Input:  2,143,052 bytes
  Output:   102,384 bytes
  Reduction:  95.2%
```

### 3. Automatic Fallback

The JavaScript code automatically handles subset availability:

```javascript
// In preview mode, tries:
fonts/FiraCode/FiraCode-Regular.subset.woff2

// If not found (404), browser falls back to:
fonts/FiraCode/FiraCode-Regular.woff2
```

**No errors if subsets don't exist** - the system gracefully degrades to full fonts.

## Setup

### Install Dependencies

```bash
pip install fonttools brotli
```

### Generate Subsets

```bash
# See what would be subset without doing it
make subset-dry-run

# Actually generate subsets
make subset-fonts
```

### Deploy to VPS

After generating subsets locally, rsync both full fonts and subsets to your VPS:

```bash
rsync -avz --progress fonts/ user@vps:/path/to/code-phoropter/fonts/
```

The subsets will be used automatically for previews, with full fonts loaded when needed.

## Google Fonts Support

Google Fonts are automatically optimized using their API's built-in subsetting:

```javascript
// Code Phoropter uses Google Fonts API which automatically subsets
// based on the text rendered on the page
https://fonts.googleapis.com/css2?family=Fira+Code&text=ABC123...
```

The browser only downloads glyphs actually used.

## File Organization

```
fonts/
  FiraCode/
    FiraCode-Regular.woff2          # Full font (2MB)
    FiraCode-Regular.subset.woff2   # Preview subset (100KB)
    FiraCode-Bold.woff2              # Full font
    FiraCode-Bold.subset.woff2       # Preview subset
  Iosevka/
    Iosevka-Regular.ttf              # Full font
    Iosevka-Regular.subset.ttf       # Preview subset
    ...
```

## Glyph Coverage

The subset includes characters from all code samples in `samples/`:

### Programming Characters (94 chars)
- ASCII printable: `a-z A-Z 0-9 !@#$%^&*()_+-={}[]|\\:;"'<>,.?/~`
- Common ligatures: `->`, `=>`, `!=`, `===`, `<=`, `>=`, `||`, `&&`

### International Scripts
- **Arabic** (40 chars): For markdown.md multilingual samples
- **Chinese/Japanese** (36 chars CJK): Unicode demonstrations
- **Korean** (36 chars Hangul): Multilingual support
- **Greek, Cyrillic, Hebrew, Thai, Devanagari**: Various scripts

### Special Symbols
- **Nerd Font icons** (40 chars, Private Use Area): From powerline.txt
- **Box drawing** (22 chars): Terminal UI characters `┌┐└┘├┤─│`
- **Powerline symbols**: Arrows, triangles, branch indicators

## Makefile Targets

```bash
make help              # Show available commands
make subset-analyze    # Extract glyphs from samples
make subset-fonts      # Generate all font subsets
make subset-dry-run    # Preview what would be subset
make clean-subsets     # Remove all .subset.* files
```

## Performance Metrics

### Before Subsetting
- **Initial load**: 174KB CSS + potential download of hundreds of font files
- **Browsing 10 fonts**: ~20MB downloaded
- **Mobile/slow connection**: 10-30 seconds initial load

### After Subsetting
- **Initial load**: Dynamic CSS injection + only subsets
- **Browsing 10 fonts**: ~1MB downloaded
- **Mobile/slow connection**: 1-3 seconds initial load

### Combined with Lazy Variant Loading
1. **First optimization** (lazy variants): 536 files → 22 files
2. **Second optimization** (subsetting): 22 × 2MB → 22 × 100KB
3. **Total**: ~1GB preview → ~2MB preview (99.8% reduction!)

## Adding New Samples

When you add new code samples to `samples/`, regenerate subsets:

```bash
# 1. Analyze new samples
make subset-analyze

# 2. Check what changed
cat tools/subset-glyphs.txt

# 3. Regenerate subsets if new glyphs were added
make subset-fonts

# 4. Deploy to VPS
rsync -avz fonts/ user@vps:/path/to/fonts/
```

## Troubleshooting

### Subset files not being used

Check browser console for 404 errors. If you see:
```
GET fonts/FiraCode/FiraCode-Regular.subset.woff2 404 (Not Found)
```

The browser will automatically fall back to the full font. Generate subsets with `make subset-fonts`.

### pyftsubset not found

```bash
pip install fonttools brotli
```

### Font rendering issues

Subsets include ALL layout features (ligatures, kerning). If you see rendering problems:

1. Check `tools/subset-glyphs.json` to ensure required glyphs are included
2. Add missing glyphs to `samples/` files
3. Regenerate: `make subset-fonts`

## Technical Details

### Subsetting Command

The script runs `pyftsubset` with these parameters:

```bash
pyftsubset font.woff2 \
  --unicodes="0020-007E,2190-21FF,E000-F8FF,..." \
  --layout-features="*" \           # Keep ALL features (ligatures, etc.)
  --glyph-names \                   # Keep glyph names for debugging
  --legacy-kern \                   # Keep kerning tables
  --notdef-outline \                # Keep .notdef glyph
  --no-hinting \                    # Remove hints (browsers handle it)
  --flavor=woff2 \                  # Output format
  --output-file=font.subset.woff2
```

### CSS Generation

Preview mode automatically uses subsets:

```javascript
// Preview mode (default)
generateFontFaceCSS(fontData, { previewMode: true })
// → generates: src: url("font.subset.woff2")

// Full mode (after user finalizes)
generateFontFaceCSS(fontData, { previewMode: false })
// → generates: src: url("font.woff2")
```

## Future Enhancements

Potential improvements:

1. **Dynamic subsetting**: Generate subsets on-the-fly based on actual text being rendered
2. **Progressive enhancement**: Start with subset, seamlessly upgrade to full font in background
3. **Variable font subsetting**: Subset variable fonts to specific weight/width ranges
4. **WOFF2 compression**: Already using WOFF2 which provides ~30% better compression than WOFF

## Credits

- Font subsetting powered by [fonttools](https://github.com/fonttools/fonttools)
- Glyph analysis from actual code samples in `samples/`
- Inspired by Google Fonts' automatic subsetting
