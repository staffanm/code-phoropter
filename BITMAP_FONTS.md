# Bitmap Font Support for Code Phoropter

## Problem Statement

Some fonts are nominally scalable TTF/OTF but contain embedded bitmaps designed for specific pixel sizes (e.g., IBM VGA 9×16, Sun Gallant 12×22). These fonts:
- Look terrible when scaled
- Have no weight/width variants
- Shouldn't be subset (may lose bitmap data)
- Need to render at exact pixel sizes

## Proposed Solution

### 1. Font Database Metadata

Add bitmap font flags to `font-database.json`:

```json
{
  "name": "IBM VGA",
  "source": "embedded",
  "bitmapFont": true,
  "nativeSizes": [8, 16],
  "recommendedSize": 16,
  "scalingWarning": "This is a bitmap font designed for 16px. Other sizes will look pixelated.",
  "axes": {
    "weights": [400],
    "styles": ["normal"],
    "widths": ["normal"]
  },
  "variantsMatrix": {
    "prefer": "ttf",
    "files": {
      "ttf": "fonts/IBMVGA/vga.ttf"
    },
    "skipSubsetting": true
  }
}
```

**New fields:**
- `bitmapFont: true` - Flags font as bitmap-based
- `nativeSizes: [8, 16]` - Pixel sizes with embedded bitmaps
- `recommendedSize: 16` - Best size for display
- `scalingWarning` - User-facing message
- `skipSubsetting: true` - Don't subset this font

### 2. Skip Subsetting for Bitmap Fonts

Update `tools/subset_fonts.py`:

```python
def subset_font(input_file, output_file, unicodes_param, dry_run=False):
    """Run pyftsubset on a font file."""
    input_path = Path(input_file)

    # NEW: Check if font should be skipped
    if font_data.get('bitmapFont') or font_data.get('variantsMatrix', {}).get('skipSubsetting'):
        print(f"  ⏭️  Skipped: Bitmap font (subsetting disabled)")
        return True  # Not an error, just skipped

    # ... rest of subsetting logic
```

### 3. Lock Font Sizes in UI

Update `app.js` to restrict size selection:

```javascript
// Generate size candidates based on font type
function generateSizeCandidates(fontName) {
    const db = window.fontDatabase || [];
    const fontData = db.find(f => f.name === fontName);

    if (fontData && fontData.bitmapFont && fontData.nativeSizes) {
        // Bitmap font: only offer native sizes
        devLog(`Bitmap font detected: ${fontName}, native sizes: ${fontData.nativeSizes}`);
        return fontData.nativeSizes;
    }

    // Regular font: full range
    return [10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 24, 28, 32];
}

// In ComparisonEngine.reset()
this.candidates = {
    // ...
    size: generateSizeCandidates(this.winners.font),
    // ...
};
```

### 4. Skip Irrelevant Stages

Bitmap fonts don't have weight/width variants:

```javascript
// In ComparisonEngine.generateNextStage()
function getNextValidStageIndex(currentIndex) {
    const fontName = engine.winners.font?.split(',')[0].replace(/["']/g, '').trim();
    const fontData = (window.fontDatabase || []).find(f => f.name === fontName);
    const isBitmap = fontData?.bitmapFont;

    let nextIndex = currentIndex + 1;

    while (nextIndex < STAGES.length) {
        const stage = STAGES[nextIndex];

        // Skip weight/width stages for bitmap fonts
        if (isBitmap && (stage.id === 'weight' || stage.id === 'fontWidth')) {
            nextIndex++;
            continue;
        }

        return nextIndex;
    }

    return STAGES.length; // No more stages
}
```

### 5. Visual Indicators in UI

Show bitmap font warnings:

```javascript
function showBitmapFontWarning(fontData) {
    if (!fontData.bitmapFont) return;

    const warning = document.createElement('div');
    warning.className = 'bitmap-font-warning';
    warning.innerHTML = `
        <strong>⚠️ Bitmap Font Detected</strong>
        <p>${fontData.scalingWarning || 'This font contains embedded bitmaps.'}</p>
        <p>Best at: ${fontData.recommendedSize}px</p>
    `;

    document.querySelector('.comparison-container').prepend(warning);
}
```

```css
/* style.css */
.bitmap-font-warning {
    background: #fff3cd;
    border: 2px solid #ffc107;
    border-radius: 4px;
    padding: 12px;
    margin-bottom: 16px;
    font-size: 14px;
}

.bitmap-font-warning strong {
    display: block;
    margin-bottom: 4px;
    color: #856404;
}

.bitmap-font-warning p {
    margin: 4px 0;
    color: #856404;
}
```

### 6. Disable Browser Interpolation

Force crisp rendering for bitmap fonts:

```javascript
function applyStyleToPanel(panel, code, option) {
    // ... existing code ...

    // NEW: For bitmap fonts, disable interpolation
    const fontName = option.font?.split(',')[0].replace(/["']/g, '').trim();
    const fontData = (window.fontDatabase || []).find(f => f.name === fontName);

    if (fontData?.bitmapFont) {
        code.style.imageRendering = 'pixelated';
        code.style.fontSmooth = 'never';
        code.style.webkitFontSmoothing = 'none';
        code.style.mozOsxFontSmoothing = 'unset';

        // Lock to native size if not already at one
        if (fontData.nativeSizes && !fontData.nativeSizes.includes(option.fontSize)) {
            option.fontSize = fontData.recommendedSize;
        }
    }
}
```

### 7. Update Font Database

Add bitmap fonts to `font-database.json`:

```json
[
  {
    "name": "IBM VGA",
    "source": "embedded",
    "bitmapFont": true,
    "nativeSizes": [8, 16],
    "recommendedSize": 16,
    "scalingWarning": "IBM VGA font is a 9×16 pixel bitmap font. It looks best at 16px.",
    "description": "The classic IBM VGA text mode font (Code Page 437) from PC/AT era systems.",
    "homepage": "https://int10h.org/oldschool-pc-fonts/",
    "ligatures": false,
    "axes": {
      "weights": [400],
      "styles": ["normal"],
      "widths": ["normal"]
    },
    "variantsMatrix": {
      "prefer": "ttf",
      "files": {
        "ttf": "fonts/IBMVGA/PxPlus_IBM_VGA8.ttf"
      },
      "skipSubsetting": true
    },
    "category": "Retro/Bitmap",
    "id": 999
  },
  {
    "name": "Sun Gallant",
    "source": "embedded",
    "bitmapFont": true,
    "nativeSizes": [12, 19],
    "recommendedSize": 19,
    "scalingWarning": "Sun Gallant is a 12×22 pixel bitmap font from Sun workstations. Best at 19px.",
    "description": "The classic Sun OpenBoot/OpenFirmware console font.",
    "homepage": "https://github.com/NanoBillion/gallant",
    "ligatures": false,
    "axes": {
      "weights": [400],
      "styles": ["normal"],
      "widths": ["normal"]
    },
    "variantsMatrix": {
      "prefer": "ttf",
      "files": {
        "ttf": "fonts/Gallant/gallant12x22.ttf"
      },
      "skipSubsetting": true
    },
    "category": "Retro/Bitmap",
    "id": 1000
  }
]
```

## Implementation Checklist

- [ ] Add `bitmapFont`, `nativeSizes`, `recommendedSize` fields to schema
- [ ] Update `subset_fonts.py` to skip bitmap fonts
- [ ] Add `generateSizeCandidates()` to lock sizes
- [ ] Modify `getNextValidStageIndex()` to skip weight/width stages
- [ ] Add bitmap font warning UI
- [ ] Add CSS for crisp pixel rendering
- [ ] Create "Retro/Bitmap" font category
- [ ] Add IBM VGA, Gallant, Terminus, Tamzen to database
- [ ] Document bitmap font support in README

## Testing

1. Add IBM VGA to database with `bitmapFont: true`
2. Select IBM VGA in phoropter
3. Verify: Size stage only shows [8, 16]
4. Verify: Weight/width stages are skipped
5. Verify: Warning message appears
6. Verify: Font renders crisp at 16px
7. Verify: No .subset file created

## CSS Rendering Techniques

Different approaches for crisp bitmap rendering:

```css
/* Option 1: Pixelated (best for retro look) */
.bitmap-font {
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
}

/* Option 2: No antialiasing */
.bitmap-font {
    -webkit-font-smoothing: none;
    -moz-osx-font-smoothing: unset;
    font-smooth: never;
}

/* Option 3: Both */
.bitmap-font {
    image-rendering: pixelated;
    -webkit-font-smoothing: none;
}
```

## Known Bitmap Fonts to Add

**Classic Terminal Fonts:**
- IBM VGA (9×16) - https://int10h.org/oldschool-pc-fonts/
- Sun Gallant (12×22) - https://github.com/NanoBillion/gallant
- Terminus (multiple sizes) - https://terminus-font.sourceforge.net/
- Tamzen (multiple sizes) - https://github.com/sunaku/tamzen-font
- Tamsyn (multiple sizes) - http://www.fial.com/~scott/tamsyn-font/
- Dina (8×16, 9×18, 10×20) - https://www.dcmembers.com/jibsen/download/61/
- GohuFont (11×11, 14×14) - https://font.gohu.org/

**Pixel Art Fonts:**
- Proggy (various sizes) - https://www.proggyfonts.net/
- Scientifica (11px) - https://github.com/nerdypepper/scientifica
- Cozette (13px) - https://github.com/slavfox/Cozette

## Fallback Behavior

If bitmap font detection fails:

1. Font still works (just scaled poorly)
2. User can manually select native size
3. Subsetting might work or might not (graceful degradation)
4. No blocking errors

## Future Enhancements

1. **Auto-detect bitmap fonts**: Analyze TTF to detect embedded bitmaps
2. **Multiple bitmap sizes**: Allow switching between 8px/16px for VGA
3. **Bitmap preview**: Show actual pixel grid at native size
4. **Export helper**: "This font looks best at 16px in your terminal"
