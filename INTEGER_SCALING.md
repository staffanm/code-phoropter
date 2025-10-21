# Integer Scaling for Bitmap Fonts

## The Problem: CSS Pixels vs Device Pixels

### CSS Pixels ≠ Device Pixels

On high DPI displays:
- **Retina (2x)**: 1 CSS pixel = 2×2 device pixels = 4 physical pixels
- **4K laptop (1.5x)**: 1 CSS pixel = 1.5×1.5 device pixels
- **4K monitor (2x or 3x)**: Varies by OS/browser settings

### Example: IBM VGA (9×16 bitmap) on Retina Display

```
CSS: 16px font-size
devicePixelRatio: 2
Device pixels: 16 × 2 = 32 pixels

But bitmap is: 9×16 device pixels

Result: Browser scales 9×16 → 18×32
        This is integer scaling! ✓

CSS: 20px font-size
Device pixels: 20 × 2 = 40 pixels
Bitmap scaled: 9×16 → 22.5×40
        This is fractional scaling! Blurry! ✗
```

## Solution 1: Account for devicePixelRatio

### Calculate Integer Multiples Correctly

```javascript
function generateBitmapSizeCandidates(fontData) {
    const nativeSizes = fontData.nativeSizes || [];
    const recommendedSize = fontData.recommendedSize || nativeSizes[0];

    if (!recommendedSize) return nativeSizes;

    // Get device pixel ratio
    const dpr = window.devicePixelRatio || 1;

    // Calculate what CSS sizes produce integer scaling at device level
    const integerScales = [];

    // For each integer scale factor (1x, 2x, 3x, 4x)
    for (let scale = 1; scale <= 4; scale++) {
        // Device pixels needed = native size × scale
        const devicePixels = recommendedSize * scale;

        // CSS pixels = device pixels / dpr
        const cssPixels = devicePixels / dpr;

        // Only include if it's a reasonable CSS size
        if (cssPixels >= 8 && cssPixels <= 48) {
            integerScales.push({
                cssSize: cssPixels,
                scale: scale,
                devicePixels: devicePixels
            });
        }
    }

    // Extract just the CSS sizes
    const sizes = integerScales.map(s => s.cssSize);

    // Also include native sizes directly (for 1x displays)
    const allSizes = [...new Set([...nativeSizes, ...sizes])].sort((a, b) => a - b);

    return allSizes;
}

// Example outputs:
// IBM VGA (16px native) on 1x display:  [16, 32, 48]       (1x, 2x, 3x)
// IBM VGA (16px native) on 2x display:  [8, 16, 24, 32]    (1x, 2x, 3x, 4x device-level)
// IBM VGA (16px native) on 1.5x display: [10.67, 21.33, 32] (fractional CSS, integer device)
```

## Solution 2: Offer Integer Multiples Only

### Simpler Approach: Just Multiply Native Size

```javascript
function generateBitmapSizeCandidates(fontData) {
    const recommendedSize = fontData.recommendedSize;
    if (!recommendedSize) return fontData.nativeSizes || [];

    // Offer 1x, 2x, 3x, 4x of native size
    const multiples = [1, 2, 3, 4];
    const sizes = multiples.map(m => recommendedSize * m);

    // Filter to reasonable range
    return sizes.filter(s => s >= 8 && s <= 64);
}

// Examples:
// IBM VGA (16px):   [16, 32, 48, 64]
// Gallant (19px):   [19, 38, 57]     (76px too large, filtered out)
// GohuFont (11px):  [11, 22, 33, 44]
```

**Advantage**: Simple, always produces integer scaling in CSS pixels
**Works on**: All displays, including fractional DPR

## Solution 3: Visual Size Helper

### Show Effective Size to User

```javascript
function getEffectiveSize(cssSize, fontData) {
    const dpr = window.devicePixelRatio || 1;
    const devicePixels = cssSize * dpr;
    const nativeSize = fontData.recommendedSize;
    const scale = devicePixels / nativeSize;

    return {
        cssSize: cssSize,
        devicePixels: devicePixels,
        scale: scale.toFixed(2),
        isInteger: (scale % 1) === 0
    };
}

// Display in UI:
// "16px (32 device pixels, 2× scale)"      ✓ Integer
// "20px (40 device pixels, 2.5× scale)"    ✗ Fractional
```

## Implementation

### Update generateSizeCandidates()

```javascript
function generateSizeCandidates(fontName) {
    if (!fontName) {
        return [10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 24, 28, 32];
    }

    const cleanName = fontName.split(',')[0].replace(/["']/g, '').trim();
    const db = window.fontDatabase || [];
    const fontData = db.find(f => f.name === cleanName);

    if (fontData && fontData.bitmapFont) {
        // Bitmap font: offer integer multiples
        const recommendedSize = fontData.recommendedSize;

        if (recommendedSize) {
            // Generate 1x, 2x, 3x, 4x multiples
            const sizes = [];
            for (let scale = 1; scale <= 4; scale++) {
                const size = recommendedSize * scale;
                if (size <= 64) {  // Cap at reasonable size
                    sizes.push(size);
                }
            }

            devLog(`Bitmap font ${cleanName}: offering integer multiples of ${recommendedSize}px: ${sizes}`);
            return sizes;
        }

        // Fallback to native sizes if no recommendedSize
        return fontData.nativeSizes || [16];
    }

    // Regular font: full range
    return [10, 11, 12, 13, 14, 15, 16, 17, 18, 20, 22, 24, 28, 32];
}
```

### Add Size Label with Scale Info

```javascript
function formatSizeLabel(size, fontData) {
    if (!fontData || !fontData.bitmapFont) {
        return `${size}px`;
    }

    const dpr = window.devicePixelRatio || 1;
    const devicePixels = Math.round(size * dpr);
    const nativeSize = fontData.recommendedSize;
    const scale = devicePixels / nativeSize;
    const isInteger = (scale % 1) === 0;

    if (isInteger) {
        return `${size}px (${scale}×)`;
    } else {
        return `${size}px (${scale.toFixed(1)}× ⚠️)`;
    }
}

// Usage in UI:
// "16px (1×)"  - Native size
// "32px (2×)"  - Perfect 2x scale
// "24px (1.5× ⚠️)" - Fractional scale warning
```

### Update Size Comparison Stage

In the comparison engine, when generating size comparisons for bitmap fonts:

```javascript
// In ComparisonEngine.generateNextStage() for 'size' stage
if (this.stage === 'size') {
    const fontData = this.getFontData(this.winners.font);

    if (fontData && fontData.bitmapFont) {
        // For bitmap fonts, make size pairs more meaningful
        // Compare adjacent integer scales: 1x vs 2x, 2x vs 3x
        const sizes = this.candidates.size;

        // Pair up: [16, 32], [32, 48], [48, 64]
        const pairs = [];
        for (let i = 0; i < sizes.length - 1; i++) {
            pairs.push([sizes[i], sizes[i + 1]]);
        }

        this.currentPairs = pairs;
        return;
    }
}
```

## CSS: Prevent Browser Scaling Artifacts

### Force Nearest-Neighbor Scaling

```css
.bitmap-font-render {
    /* Prevent antialiasing */
    -webkit-font-smoothing: none;
    -moz-osx-font-smoothing: unset;
    font-smooth: never;

    /* Use pixelated scaling (nearest-neighbor) */
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;

    /* Prevent subpixel rendering */
    transform: translateZ(0);
    backface-visibility: hidden;
}
```

## Testing Integer Scaling

### Manual Test Script

```javascript
// In browser console on bitmap font:
const font = document.querySelector('[data-font="IBM VGA"]');
const code = document.getElementById('codeA');

console.log('Font size (CSS):', code.style.fontSize);
console.log('Device pixel ratio:', window.devicePixelRatio);
console.log('Device pixels:', parseInt(code.style.fontSize) * window.devicePixelRatio);

// Check if integer scale
const cssSize = parseInt(code.style.fontSize);
const nativeSize = 16; // IBM VGA
const dpr = window.devicePixelRatio;
const scale = (cssSize * dpr) / nativeSize;
console.log('Scale factor:', scale);
console.log('Integer scale?', (scale % 1) === 0);
```

### Visual Test

1. Set IBM VGA to 16px on 2x display
2. Screenshot and zoom 400%
3. Pixels should be perfectly crisp squares
4. No blur or interpolation

## Recommended Font Database Format

```json
{
  "name": "IBM VGA",
  "bitmapFont": true,
  "nativeSizes": [8, 16],
  "recommendedSize": 16,
  "integerMultiples": [16, 32, 48, 64],
  "scalingWarning": "Best at 16px, 32px, 48px (integer multiples)",
  "variantsMatrix": {
    "skipSubsetting": true
  }
}
```

## High DPI Considerations

### Problem: Fractional DPR

Some displays have fractional device pixel ratios:
- **1.25x** (125% Windows scaling)
- **1.5x** (150% scaling, common on laptops)
- **2.25x** (rare)

### Solution: Accept Some Fractional Scaling

For 1.5x DPR with 16px native bitmap:
```
16px CSS × 1.5 DPR = 24 device pixels
24 / 16 native = 1.5× scale (fractional)

32px CSS × 1.5 DPR = 48 device pixels
48 / 16 native = 3× scale (integer!) ✓
```

**Strategy**: Offer multiples that work well across common DPR values:
- 1× DPR: 16, 32, 48, 64
- 1.5× DPR: 32, 48 produce integer scales
- 2× DPR: All produce integer scales

## UI Mockup

### Size Selection for Bitmap Fonts

```
┌─────────────────────────────────────────┐
│ Choose Font Size                        │
│                                         │
│ IBM VGA (bitmap font - integer scaling) │
│                                         │
│ ○  16px  (1× - native)          ✓      │
│ ○  32px  (2× scale)             ✓      │
│ ○  48px  (3× scale)             ✓      │
│ ○  64px  (4× scale)             ✓      │
│                                         │
│ ℹ️ Your display: 2× (Retina)           │
│    All sizes use integer scaling        │
└─────────────────────────────────────────┘
```

With fractional DPR:

```
┌─────────────────────────────────────────┐
│ Choose Font Size                        │
│                                         │
│ IBM VGA (bitmap font - integer scaling) │
│                                         │
│ ○  16px  (1.5× scale)           ⚠️     │
│ ○  32px  (3× scale)             ✓      │
│ ○  48px  (4.5× scale)           ⚠️     │
│ ○  64px  (6× scale)             ✓      │
│                                         │
│ ℹ️ Your display: 1.5× DPI              │
│    ✓ = Integer scale (crisp)           │
│    ⚠️ = Fractional scale (slight blur)  │
└─────────────────────────────────────────┘
```

## Conclusion

**Recommended approach**:

1. ✅ Offer integer multiples: `[16, 32, 48, 64]`
2. ✅ Show scale factor in UI: `"32px (2×)"`
3. ✅ Warn about fractional scales on high DPR
4. ✅ Use `image-rendering: pixelated` CSS
5. ✅ Skip subsetting for bitmap fonts

**Works well**:
- 1x displays: Perfect
- 2x Retina: Perfect
- 1.5x laptops: Some sizes perfect, some fractional (acceptable)

**Result**: Clean pixel art rendering at appropriate scales!
