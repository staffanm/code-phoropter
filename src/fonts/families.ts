import type { FontFamilies, FontFamily, FontSource } from '../types';
import { extractFontNameFromCss } from './detect';
import { data } from '../data';
import { fontSimilarity } from './similarity';

export function generateFontFamilies(): FontFamilies {
    // Normalize legacy DB: map family->category and assign categories
    const families: Record<string, FontFamily & { _repRank?: number }> = {};

    // New canonical categories
    const categoryDescriptions: Record<string, string> = {
        'Typewriter Classics':    'Fonts rooted in the typewriter/early-computing tradition.',
        'Neutral Workhorses':     'No-frills monospace fonts designed for utility.',
        'Humanist Readables':     'Humanist influence for softer, more readable text.',
        'Geometric Moderns':      'Systematic, engineered shapes with geometric rigor.',
        'Expressive Experimentals': 'Distinctive fonts with quirks and character.',
        'Technical Specialists':  'Fonts optimized around a specific coding use-case.'
    };


    // Representative selection priority: google > embedded > system
    const sourceRank: Record<FontSource, number> = { google: 2, embedded: 1, system: 0 };

    // Preferred representatives per category (used as fallback only)
    const preferredRepresentatives: Record<string, string[]> = {
        'Typewriter Classics': ['Courier Prime', 'IBM Plex Mono Serif', 'Courier New'],
        'Neutral Workhorses': ['DejaVu Sans Mono', 'Consolas', 'Inconsolata'],
        'Humanist Readables': ['Source Code Pro', 'Ubuntu Mono', 'Droid Sans Mono'],
        'Geometric Moderns': ['Fira Code', 'JetBrains Mono', 'Space Mono', 'Roboto Mono'],
        'Expressive Experimentals': ['Iosevka', 'Dank Mono', 'Victor Mono', 'Cascadia Code'],
        'Technical Specialists': ['Proggy', 'Monofur', 'PragmataPro', '3270', 'VT323']
    };

    // Quick lookup for source by name using the database
    const nameToSource: Record<string, FontSource> = {};
    data.fontDatabase.forEach(f => { nameToSource[f.name] = f.source; });

    data.fontDatabase.forEach(font => {
        if (font.name === 'M+ 1m') return; // exclude non-monospace
        // All fonts in the database now have categories assigned
        const category = font.category;
        if (!families[category]) {
            families[category] = {
                description: categoryDescriptions[category] || category,
                fonts: [],
                representative: null,
                _repRank: -1
            };
        }

        // Add font to family list for later use
        const cssName = `"${font.name}", "Redacted Script"`;
        families[category].fonts.push(cssName);

        // Choose representative by best available source
        const rank = sourceRank[font.source] ?? 0;
        if (rank > (families[category]._repRank ?? -1)) {
            families[category].representative = cssName;
            families[category]._repRank = rank;
        }
    });

    // Apply preferred representative overrides with web-first bias
    Object.entries(families).forEach(([categoryName, fam]) => {
        const preferred = preferredRepresentatives[categoryName] || [];
        if (preferred.length === 0) return;
        // Extract available font names in this family
        const namesInFamily = fam.fonts.map(extractFontNameFromCss);
        // First try to pick a non-system preferred font for preview reliability
        const webPreferred = preferred.find(n => namesInFamily.includes(n) && nameToSource[n] !== 'system');
        const anyPreferred = webPreferred || preferred.find(n => namesInFamily.includes(n));
        if (anyPreferred) {
            fam.representative = `"${anyPreferred}", "Redacted Script"`;
        }
    });

    // Dynamic selection: maximize distinction between family representatives using fontSimilarity
    try {
        const getName = (cssName: string) => extractFontNameFromCss(cssName) || '';
        const pickOrder = [
            'Sans', 'Serif', 'Slab', 'Compact', 'Retro', 'Playful'
        ].filter(name => families[name]).concat(Object.keys(families).filter(n => !['Sans','Serif','Slab','Compact','Retro','Playful'].includes(n)));

        const selected: Record<string, string> = {};
        const selectedNames: string[] = [];

        // Build candidate lists per category with web-first filtering
        const candidates: Record<string, string[]> = {};
        pickOrder.forEach(fname => {
            const fam = families[fname];
            // Prefer web fonts; allow system only for System & Classics or if no web fonts available
            const names = fam.fonts.map(getName);
            const web = names.filter(n => (nameToSource[n] && nameToSource[n] !== 'system'));
            const sys = names.filter(n => (nameToSource[n] === 'system'));
            const pool = (fname === 'Serif') ? (sys.length ? sys : names) : (web.length ? web : names);
            candidates[fname] = pool;
        });

        // Helper to compute min dissimilarity to already selected
        function minDissim(name: string) {
            if (selectedNames.length === 0) return 100;
            const css = `"${name}", "Redacted Script"`;
            let min = Infinity;
            for (const other of selectedNames) {
                const sim = fontSimilarity.calculate(css, `"${other}", "Redacted Script"`);
                const dis = 100 - sim;
                if (dis < min) min = dis;
            }
            return min;
        }

        // For the first pick of each family: choose the most distinctive against the union of all candidates
        const allCandidateNames = Array.from(new Set(Object.values(candidates).flat()));
        function avgDissimToAll(name: string) {
            const css = `"${name}", "Redacted Script"`;
            let sum = 0;
            let count = 0;
            for (const other of allCandidateNames) {
                if (other === name) continue;
                const sim = fontSimilarity.calculate(css, `"${other}", "Redacted Script"`);
                sum += (100 - sim);
                count++;
            }
            return count ? (sum / count) : 0;
        }

        pickOrder.forEach(fname => {
            const pool = candidates[fname];
            if (!pool || pool.length === 0) return;
            let choice = null;
            if (selectedNames.length === 0) {
                // First selection: maximize average dissimilarity to all
                choice = pool
                    .map(n => ({ n, score: avgDissimToAll(n), source: nameToSource[n] }))
                    // Prefer non-system when scores tie
                    .sort((a, b) => (b.score - a.score) || (Number(a.source === 'system') - Number(b.source === 'system')))[0].n;
            } else {
                // Greedy: maximize minimum dissimilarity to already selected
                choice = pool
                    .map(n => ({ n, score: minDissim(n), source: nameToSource[n] }))
                    .sort((a, b) => (b.score - a.score) || (Number(a.source === 'system') - Number(b.source === 'system')))[0].n;
            }
            selected[fname] = choice;
            selectedNames.push(choice);
        });

        // Apply dynamic representatives
        Object.entries(selected).forEach(([fname, name]) => {
            if (families[fname]) {
                families[fname].representative = `"${name}", "Redacted Script"`;
            }
        });
    } catch (e) {
        console.warn('[DEV] Dynamic representative selection failed:', e);
    }

    // Cleanup helper metadata
    Object.values(families).forEach(f => { delete f._repRank; });
    return families;
}
