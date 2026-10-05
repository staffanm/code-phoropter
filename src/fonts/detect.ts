import type { FontFamilies, FontSource } from '../types';
import { data, findFont } from '../data';
import { state } from '../state';

// Font availability detection
export const detectedFonts = new Set<string>();

export const fontCheckCache = new Map<string, boolean>();


// Check if a font is available using FontDetective results
export function isFontAvailable(fontName: string): boolean {
    // Check cache first
    if (fontCheckCache.has(fontName)) {
        return fontCheckCache.get(fontName) as boolean;
    }
    
    // Check if font is in the detected fonts set
    const isAvailable = detectedFonts.has(fontName);
    
    // Cache the result
    fontCheckCache.set(fontName, isAvailable);
    
    return isAvailable;
}


export function extractFontNameFromCss(cssString: string | null | undefined): string | null {
    if (!cssString || typeof cssString !== 'string') return null;
    const match = cssString.match(/"([^\"]+)"/);
    return match ? match[1] : null;
}


interface PartitionOptions {
    allowIcons?: boolean;
    allowPatchedVariants?: boolean;
    allowUninstalledSystem?: boolean;
}

interface FontCandidateMeta {
    css: string;
    name: string;
    source: FontSource;
    patchedFrom: string | null;
    hasOriginal: boolean;
    isIcon: boolean;
    isSystem: boolean;
    isSystemAvailable: boolean;
}

export function partitionFontCandidates(cssStrings: string[], options: PartitionOptions = {}) {
    const {
        allowIcons = false,
        allowPatchedVariants = false,
        allowUninstalledSystem = false
    } = options;

    const database = data.fontDatabase;
    const metas: FontCandidateMeta[] = [];

    cssStrings.forEach(cssString => {
        const name = extractFontNameFromCss(cssString);
        if (!name) return;

        const entry = findFont(name);
        const source = data.fontSourceByName[name] || entry?.source || 'embedded';
        const patchedFrom = entry?.patchedFrom || null;
        const hasOriginal = !!(patchedFrom && database.some(f => f.name === patchedFrom));
        const isSystem = source === 'system';

        metas.push({
            css: cssString,
            name,
            source,
            patchedFrom,
            hasOriginal,
            isIcon: !!data.fontIconsByName[name],
            isSystem,
            isSystemAvailable: !isSystem || isFontAvailable(name)
        });
    });

    const usable = metas.filter(meta => {
        if (!allowIcons && meta.isIcon) return false;
        if (!allowPatchedVariants && meta.patchedFrom && meta.hasOriginal) return false;
        return true;
    });

    const available = usable.filter(meta => allowUninstalledSystem || !meta.isSystem || meta.isSystemAvailable);

    const webOnly = usable.filter(meta => meta.source !== 'system');

    return { usable, available, webOnly };
}

// Detect font-width support for a given font
export function detectFontWidthSupport(fontName: string) {
    const testString = 'MMMMMMMMMM';
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.visibility = 'hidden';
    container.style.fontSize = '48px';
    container.style.fontFamily = fontName;
    container.style.whiteSpace = 'nowrap';
    container.textContent = testString;
    document.body.appendChild(container);
    
    const widthMap: Record<string, number> = {};
    const supportedWidths: string[] = [];
    
    // First measure normal width
    container.style.fontStretch = 'normal';
    const normalWidth = container.offsetWidth;
    widthMap['normal'] = normalWidth;
    
    // Test each width value except normal
    const testWidths = ['ultra-condensed', 'extra-condensed', 'condensed', 'semi-condensed', 'semi-expanded', 'expanded', 'extra-expanded', 'ultra-expanded'];
    
    for (const width of testWidths) {
        container.style.fontStretch = width;
        const measuredWidth = container.offsetWidth;
        
        // If width differs from normal, this width is supported
        if (measuredWidth !== normalWidth) {
            supportedWidths.push(width);
            widthMap[width] = measuredWidth;
        }
    }
    
    document.body.removeChild(container);
    
    // Always include normal as it's the default
    if (!supportedWidths.includes('normal')) {
        supportedWidths.unshift('normal');
    }
    
    console.log(`Font ${fontName} supports ${supportedWidths.length} width values:`, supportedWidths);
    return supportedWidths;
}


// Detect all available system fonts
export function detectSystemFonts() {
    console.log('Detecting installed system fonts...');
    const availableFonts: string[] = [];
    // Check system fonts as defined in the external database
    const allFontsToCheck = Array.from(new Set(
        data.fontDatabase.filter(f => f.source === 'system').map(f => f.name)
    ));
    
    allFontsToCheck.forEach(fontName => {
        if (isFontAvailable(fontName)) {
            availableFonts.push(fontName);
            detectedFonts.add(fontName);
            console.log(`✓ ${fontName} is installed`);
        } else {
            console.log(`✗ ${fontName} is not installed`);
        }
    });
    
    // Separate non-embeddable fonts that are locally detected
    const nonEmbeddableFonts = availableFonts.filter(font => {
        return ['MonoLisa', 'Operator Mono', 'Dank Mono', 'Comic Code', 
               'Berkeley Mono', 'PragmataPro', 'Input Mono', 'Aptos Mono',
               'SF Mono', 'Monaco', 'Menlo', 'Consolas'].includes(font);
    });
    
    console.log(`🔍 FONT DETECTION SUMMARY:`);
    console.log(`📊 Total system fonts detected: ${availableFonts.length}`);
    console.log(`💰 Non-embeddable/commercial fonts detected: ${nonEmbeddableFonts.length}`);
    if (nonEmbeddableFonts.length > 0) {
        console.log(`💰 Available commercial fonts:`, nonEmbeddableFonts);
    } else {
        console.log('💰 No commercial/non-embeddable fonts detected locally.');
    }
    
    console.log(`Found ${availableFonts.length} of ${allFontsToCheck.length} checked fonts`);
    return availableFonts;
}


// Filter font families to only include available fonts
export function filterFontFamilies() {
    detectSystemFonts();

    const filteredFamilies: FontFamilies = {};

    Object.entries(state.fontFamiliesOriginal).forEach(([category, data]) => {
        const partition = partitionFontCandidates(data.fonts);

        if (category === 'System Fonts' || category === 'System & Classics') {
            const systemOnly = partition.available.filter(meta => meta.isSystem);
            if (systemOnly.length > 0) {
                filteredFamilies[category] = {
                    ...data,
                    fonts: systemOnly.map(meta => meta.css),
                    description: `${data.description} (${systemOnly.length}/${data.fonts.length} available)`
                };
            } else {
                console.log('No system fonts detected - category will be hidden');
            }
            return;
        }

        if (partition.available.length > 0) {
            filteredFamilies[category] = {
                ...data,
                fonts: partition.available.map(meta => meta.css),
                description: `${data.description} (${partition.available.length}/${data.fonts.length} available)`
            };
        }
    });
    
    console.log(`Categories with fonts: ${Object.keys(filteredFamilies).join(', ')}`);
    return filteredFamilies;
}
