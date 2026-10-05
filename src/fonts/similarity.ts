import { data } from '../data';

interface FontTraits {
    width: number;
    weight: number;
    style: number;
    personality: number;
    ligatures: number;
}

// Font similarity system - simplified approach for tournament enhancement
// Font metrics compatibility checking
export const fontCompatibility = {
    _resolveMetric(value: unknown): number | null {
        if (value == null) return null;
        if (typeof value === 'number') {
            return Number.isFinite(value) ? value : null;
        }
        if (typeof value === 'string') {
            const parsed = parseFloat(value);
            return Number.isFinite(parsed) ? parsed : null;
        }
        if (typeof value === 'object') {
            const table = value as Record<string, unknown>;
            if (table.normal != null) {
                const normal = this._resolveMetric(table.normal);
                if (normal != null) return normal;
            }
            for (const nested of Object.values(table)) {
                const resolved = this._resolveMetric(nested);
                if (resolved != null) return resolved;
            }
        }
        return null;
    },

    isWidthCompatible(font1: string, font2: string, tolerance = 0.02) {
        const metrics1 = data.fontMetrics?.[font1];
        const metrics2 = data.fontMetrics?.[font2];
        
        if (!metrics1 || !metrics2) {
            console.log(`[DEBUG] Missing metrics for width comparison: ${font1}=${!!metrics1}, ${font2}=${!!metrics2}`);
            return false;
        }
        
        if (!metrics1.monospace || !metrics2.monospace) {
            console.log(`[DEBUG] Non-monospace font detected: ${font1}=${metrics1.monospace}, ${font2}=${metrics2.monospace}`);
            return false;
        }
        
        const width1 = this._resolveMetric(metrics1.avgCharWidth?.["16"]);
        const width2 = this._resolveMetric(metrics2.avgCharWidth?.["16"]);
        
        if (!width1 || !width2) {
            console.log(`[DEBUG] Missing width data: ${font1}=${width1}, ${font2}=${width2}`);
            return false;
        }
        
        const diff = Math.abs(width1 - width2) / width1;
        const compatible = diff <= tolerance;

        // console.log(`[DEBUG] Width compatibility: ${font1} (${width1.toFixed(2)}px) vs ${font2} (${width2.toFixed(2)}px) = ${(diff*100).toFixed(1)}% diff → ${compatible ? 'COMPATIBLE' : 'REJECTED'}`);
        return compatible;
    },
    
    isXHeightCompatible(font1: string, font2: string, tolerance = 0.15) {
        const metrics1 = data.fontMetrics?.[font1];
        const metrics2 = data.fontMetrics?.[font2];
        
        if (!metrics1 || !metrics2) return false;
        
        const xHeight1 = this._resolveMetric(metrics1.xHeight?.["16"]);
        const xHeight2 = this._resolveMetric(metrics2.xHeight?.["16"]);
        
        if (!xHeight1 || !xHeight2) return true; // Allow if we can't measure
        
        const diff = Math.abs(xHeight1 - xHeight2) / xHeight1;
        const compatible = diff <= tolerance;

        // console.log(`[DEBUG] xHeight compatibility: ${font1} (${xHeight1.toFixed(2)}px) vs ${font2} (${xHeight2.toFixed(2)}px) = ${(diff*100).toFixed(1)}% diff → ${compatible ? 'COMPATIBLE' : 'REJECTED'}`);
        return compatible;
    },
    
    isCompatible(font1: string, font2: string) {
        return this.isWidthCompatible(font1, font2) && this.isXHeightCompatible(font1, font2);
    },
    
    getCompatibleFonts(baseFont: string) {
        if (!data.fontMetrics || !baseFont) return [];
        
        const compatible: string[] = [];
        const db = data.fontDatabase;
        
        for (const font of db) {
            if (font.name !== baseFont && this.isCompatible(baseFont, font.name)) {
                compatible.push(font.name);
            }
        }
        
        console.log(`[DEBUG] Found ${compatible.length} fonts compatible with ${baseFont}: ${compatible.slice(0, 3).join(', ')}${compatible.length > 3 ? '...' : ''}`);
        return compatible;
    }
};


export const fontSimilarity = {
    // Font characteristics database - simplified for practical implementation
    traits: {
        // Each font gets scores for key distinguishing characteristics (0-10 scale)
        'Fira Code': { width: 6, weight: 4, style: 2, personality: 4, ligatures: 10 },
        'JetBrains Mono': { width: 5, weight: 4, style: 2, personality: 3, ligatures: 10 },
        'Cascadia Code': { width: 5, weight: 4, style: 3, personality: 3, ligatures: 10 },
        'Source Code Pro': { width: 5, weight: 4, style: 2, personality: 2, ligatures: 0 },
        'IBM Plex Mono': { width: 5, weight: 4, style: 3, personality: 3, ligatures: 0 },
        'Roboto Mono': { width: 5, weight: 4, style: 2, personality: 2, ligatures: 0 },
        'Consolas': { width: 5, weight: 4, style: 3, personality: 2, ligatures: 0 },
        'Monaco': { width: 5, weight: 5, style: 2, personality: 3, ligatures: 0 },
        'SF Mono': { width: 5, weight: 4, style: 2, personality: 2, ligatures: 0 },
        'Ubuntu Mono': { width: 6, weight: 4, style: 3, personality: 3, ligatures: 0 },
        'Inconsolata': { width: 5, weight: 4, style: 2, personality: 3, ligatures: 0 },
        'Hack': { width: 5, weight: 4, style: 2, personality: 2, ligatures: 0 },
        'Space Mono': { width: 6, weight: 4, style: 3, personality: 7, ligatures: 0 },
        'Courier Prime': { width: 6, weight: 4, style: 4, personality: 5, ligatures: 0 },
        'Courier New': { width: 6, weight: 4, style: 4, personality: 2, ligatures: 0 },
        'Anonymous Pro': { width: 6, weight: 4, style: 2, personality: 4, ligatures: 0 },
        'VT323': { width: 5, weight: 4, style: 0, personality: 10, ligatures: 0 },
        'Press Start 2P': { width: 8, weight: 6, style: 0, personality: 10, ligatures: 0 },
        'Operator Mono': { width: 5, weight: 3, style: 5, personality: 8, ligatures: 0 },
        'MonoLisa': { width: 5, weight: 4, style: 3, personality: 6, ligatures: 0 },
        'Comic Code': { width: 5, weight: 4, style: 3, personality: 9, ligatures: 0 },
        'Input Mono': { width: 5, weight: 4, style: 3, personality: 5, ligatures: 0 },
        'Go Mono': { width: 6, weight: 4, style: 3, personality: 3, ligatures: 0 },
        'Victor Mono': { width: 5, weight: 3, style: 4, personality: 7, ligatures: 10 },
        'Iosevka': { width: 3, weight: 3, style: 2, personality: 6, ligatures: 10 },
        'Recursive': { width: 5, weight: 4, style: 3, personality: 6, ligatures: 10 },
        'Dank Mono': { width: 5, weight: 4, style: 4, personality: 8, ligatures: 0 },
        'Intel One Mono': { width: 5, weight: 4, style: 2, personality: 3, ligatures: 0 },
        'JuliaMono': { width: 5, weight: 4, style: 3, personality: 5, ligatures: 0 },
        'Monocraft': { width: 5, weight: 4, style: 0, personality: 10, ligatures: 0 },
        'Hasklig': { width: 5, weight: 4, style: 3, personality: 3, ligatures: 10 },
        'Geist Mono': { width: 5, weight: 4, style: 2, personality: 3, ligatures: 0 },
        'Red Hat Mono': { width: 5, weight: 4, style: 2, personality: 3, ligatures: 0 },
        'DM Mono': { width: 5, weight: 3, style: 3, personality: 4, ligatures: 0 },
        'Noto Sans Mono': { width: 5, weight: 4, style: 2, personality: 2, ligatures: 0 },
        'Liberation Mono': { width: 5, weight: 4, style: 3, personality: 2, ligatures: 0 },
        'DejaVu Sans Mono': { width: 5, weight: 4, style: 2, personality: 2, ligatures: 0 },
        'APL2741': { width: 5, weight: 4, style: 0, personality: 10, ligatures: 0 },
        'APL385 Unicode': { width: 5, weight: 4, style: 0, personality: 10, ligatures: 0 },
        '_default': { width: 5, weight: 4, style: 3, personality: 5, ligatures: 0 }
    } as Record<string, FontTraits>,
    
    // Calculate similarity between two fonts (0-100, higher = more similar)
    calculate(font1: string, font2: string) {
        const extractName = (font: string) => font.replace(/[\"']/g, '').split(',')[0].trim();
        const name1 = extractName(font1);
        const name2 = extractName(font2);
        
        const traits1 = this.traits[name1] || this.traits._default;
        const traits2 = this.traits[name2] || this.traits._default;
        
        // Calculate weighted distance
        let totalDiff = 0;
        const weights: FontTraits = { width: 1.0, weight: 1.0, style: 0.8, personality: 1.2, ligatures: 1.5 };
        let totalWeight = 0;
        
        for (const [key, weight] of Object.entries(weights) as [keyof FontTraits, number][]) {
            const diff = Math.abs(traits1[key] - traits2[key]);
            totalDiff += diff * weight;
            totalWeight += weight * 10; // Max diff per dimension is 10
        }
        
        // Convert to similarity score (0-100)
        return Math.max(0, 100 - (totalDiff / totalWeight * 100));
    },
    
    // Group fonts by similarity ranges for progressive tournament
    categorize(similarity: number) {
        if (similarity >= 80) return 'very-similar';
        if (similarity >= 60) return 'similar';
        if (similarity >= 40) return 'different';
        return 'very-different';
    },
    
    // Generate smart font pairs for tournament progression
    generateProgressivePairs(fonts: string[], round = 1) {
        const pairs = [];
        const maxRounds = 3; // Reduced tournament rounds
        
        // Target similarity based on round (avoid 100% similar forks)
        const targetSimilarities: Record<number, [number, number]> = {
            1: [30, 50],   // Start with moderately similar fonts
            2: [50, 70],   // More similar fonts  
            3: [60, 85]    // Similar fonts (avoid 100% forks)
        };
        
        const [minSim, maxSim] = targetSimilarities[round] || [0, 100];
        
        // Generate all possible pairs and score them
        const scoredPairs = [];
        for (let i = 0; i < fonts.length - 1; i++) {
            for (let j = i + 1; j < fonts.length; j++) {
                const similarity = this.calculate(fonts[i], fonts[j]);
                if (similarity >= minSim && similarity <= maxSim) {
                    scoredPairs.push({
                        pair: [fonts[i], fonts[j]],
                        similarity: similarity,
                        roundFit: round // How well this fits the current round
                    });
                }
            }
        }
        
        // Sort by how well they fit the round's target similarity
        scoredPairs.sort((a, b) => {
            const aDistance = Math.min(
                Math.abs(a.similarity - minSim),
                Math.abs(a.similarity - maxSim)
            );
            const bDistance = Math.min(
                Math.abs(b.similarity - minSim),
                Math.abs(b.similarity - maxSim)
            );
            return aDistance - bDistance;
        });
        
        // Return best pairs for this round
        return scoredPairs.slice(0, Math.min(8, scoredPairs.length)).map(sp => sp.pair);
    }
};


// Helper function to get font download information
export interface FontDownloadInfo {
    url: string;
    instructions: string;
    downloadUrl?: string | null;
    type?: 'system' | 'free';
    ttf?: string | null;
    otf?: string | null;
    woff2?: string | null;
}

export function getFontDownloadInfo(fontName: string): FontDownloadInfo {
    const entry = data.fontDatabase.find(f => (f.name || '').toLowerCase() === (fontName || '').toLowerCase());
    if (entry) {
        const ttf = entry.ttf || null;
        const otf = entry.otf || null;
        const woff2 = entry.woff2 || null;
        const primary = ttf || otf || woff2 || null;
        const homepage = entry.homepage || null;
        const isSystem = entry.source === 'system';
        const hasDownload = Boolean(primary);
        return {
            url: homepage || primary || `https://www.google.com/search?q=${encodeURIComponent(fontName + ' font download')}`,
            downloadUrl: primary,
            instructions: isSystem && !hasDownload
                ? 'Install or purchase this font on your system'
                : 'Download and install the font from the link',
            type: isSystem && !hasDownload ? 'system' : 'free',
            ttf, otf, woff2
        };
    }
    return {
        url: `https://www.google.com/search?q=${encodeURIComponent(fontName + ' font download')}`,
        instructions: 'Search for this font online'
    };
}
