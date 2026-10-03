import { data } from './data';
import { byId } from './dom';
import type { RoleCandidate, RoleMapping } from './types';
import { fontSuitabilityMatrix } from './font-roles';
import { loadCode, mapLanguageForHLJS, setCodeWithHighlight } from './code';
import { isFontAvailable } from './fonts/detect';
import { fontCompatibility } from './fonts/similarity';
import { state } from './state';

// Map selected roles to highlight.js selectors (subset that applies to code preview)
export const roleToHLJS: Record<string, string[]> = {
    comments: ['.hljs-comment', '.hljs-doctag', '.hljs-meta .hljs-string'],
    strings: ['.hljs-string', '.hljs-template-variable'],
    literals: ['.hljs-number', '.hljs-literal', '.hljs-regexp', '.hljs-symbol'],
    keywords: ['.hljs-keyword', '.hljs-built_in', '.hljs-selector-tag'],
    function: ['.hljs-function .hljs-title', '.hljs-title.function'],
    variable: ['.hljs-variable', '.hljs-name', '.hljs-attr', '.hljs-attribute'],
    type: ['.hljs-type', '.hljs-class .hljs-title', '.hljs-title.class', '.hljs-params'],
    operator: ['.hljs-operator', '.hljs-punctuation'],
    ghost: ['.ghost-text', '.copilot'], // AI suggestions overlay classes if present
};


// Short labels for compact display
export const roleLabels: Record<string, string> = {
    comments: 'Comment',
    strings: 'String',
    literals: 'Literal',
    keywords: 'Keyword',
    function: 'Function',
    variable: 'Variable',
    type: 'Type/Class',
    operator: 'Operator',
    ghost: 'Ghost'
};


export function getRoleLabel(role: string) {
    return roleLabels[role] || role;
}
 // tournament engine per-role

export function getRoleCandidates(role: string, stageId: string): RoleCandidate[] {
    const baseFont = state.engine && state.engine.winners && state.engine.winners.font;
    const baseFontName = baseFont ? baseFont.split(',')[0].replace(/"/g, '') : 'monospace';

    // For role* stages (weight/style only), return only base font variations
    // For roleFont* stages, return compatible alternative fonts
    const isWeightStyleStage = stageId && stageId.startsWith('role') && !stageId.startsWith('roleFont');

    console.log(`[DEBUG] getRoleCandidates for role: ${role}, stage: ${stageId}, base font: ${baseFontName}, isWeightStyleStage: ${isWeightStyleStage}`);

    const candidates: RoleCandidate[] = [
        // Base font variations (always compatible with itself)
        { type: 'weight', font: baseFontName, weight: 400, style: 'normal', label: 'Base weight (400)' },
        { type: 'weight', font: baseFontName, weight: 600, style: 'normal', label: 'Semibold (600)' },
        { type: 'weight', font: baseFontName, weight: 700, style: 'normal', label: 'Bold (700)' },
        { type: 'style', font: baseFontName, weight: 400, style: 'italic', label: 'Italic' },
    ];

    // Add role-specific variations
    if (role === 'comments') {
        candidates.push(
            { type: 'style', font: baseFontName, weight: 300, style: 'italic', label: 'Light italic' },
            { type: 'weight', font: baseFontName, weight: 300, style: 'normal', label: 'Light' }
        );
    }

    // For weight/style stages, only return base font variations
    if (isWeightStyleStage) {
        console.log(`[DEBUG] Weight/style stage - returning ${candidates.length} base font variations`);
        return candidates;
    }

    // For roleFont* stages, add compatible alternative fonts
    const db = data.fontDatabase || [];
    let compatibleCount = 0;
    let rejectedCount = 0;
    let metricsAvailable = !!data.fontMetrics && Object.keys(data.fontMetrics).length > 0;

    if (metricsAvailable) {
        console.log(`[DEBUG] Font metrics available for compatibility checking`);

        // Get compatible fonts using metrics
        const compatibleFonts = fontCompatibility.getCompatibleFonts(baseFontName);

        // Add compatible alternatives (limit to prevent too many comparisons)
        compatibleFonts.slice(0, 4).forEach(fontName => {
            candidates.push({
                type: 'alternative',
                font: fontName,
                weight: 400,
                style: 'normal',
                label: fontName
            });
            compatibleCount++;
        });

        rejectedCount = db.length - compatibleFonts.length - 1; // -1 for base font

    } else {
        console.log(`[DEBUG] No font metrics available, using legacy font selection`);

        // Fallback to legacy behavior when no metrics are available
        const rec: string[] = [];
        const matrix: Record<string, string[]> = fontSuitabilityMatrix;
        const key1 = `${role}-excellent`;
        const key2 = `${role}-good`;
        rec.push(...(matrix[key1] ?? []));
        rec.push(...(matrix[key2] ?? []));
        const nonSystem = db.filter(f => f.source !== 'system').map(f => f.name);
        const fontPool = Array.from(new Set([...rec, ...nonSystem]));

        // Add limited alternatives (no metrics checking)
        fontPool.slice(0, 3).forEach(fontName => {
            if (fontName !== baseFontName) {
                candidates.push({
                    type: 'font',
                    font: fontName,
                    weight: 400,
                    style: 'normal', 
                    label: fontName 
                });
                compatibleCount++;
            }
        });
    }
    
    console.log(`[DEBUG] Role candidates summary:`);
    console.log(`  - Total candidates: ${candidates.length}`);
    console.log(`  - Base font variations: ${candidates.filter(c => c.font === baseFontName).length}`);
    console.log(`  - Compatible alternatives: ${compatibleCount}`);
    if (metricsAvailable) {
        console.log(`  - Rejected (incompatible): ${rejectedCount}`);
        console.log(`  - Metrics checking: enabled`);
    } else {
        console.log(`  - Metrics checking: disabled (no font-metrics.json)`);
    }
    
    return candidates.slice(0, 8); // Limit total candidates
}


export function applyRoleCompareStyles(role: string, aFontName: string, bFontName: string, aWeight?: number, aStyle?: string, bWeight?: number, bStyle?: string) {
    console.log('[DEBUG] applyRoleCompareStyles called:', { role, aFontName, bFontName, aWeight, aStyle, bWeight, bStyle });
    const selectors = roleToHLJS[role] || [];
    const aStack = resolveFontCssStack(aFontName);
    const bStack = resolveFontCssStack(bFontName);
    console.log('[DEBUG] Font stacks:', { aStack, bStack });
    const scopedA = selectors.map(sel => `#panelA ${sel}`).join(', ');
    const scopedB = selectors.map(sel => `#panelB ${sel}`).join(', ');

    // Build CSS with font-family, font-weight, and font-style
    let cssA = `${scopedA} { font-family: ${aStack};`;
    if (aWeight) cssA += ` font-weight: ${aWeight};`;
    if (aStyle && aStyle !== 'normal') cssA += ` font-style: ${aStyle};`;
    cssA += ' }';

    let cssB = `${scopedB} { font-family: ${bStack};`;
    if (bWeight) cssB += ` font-weight: ${bWeight};`;
    if (bStyle && bStyle !== 'normal') cssB += ` font-style: ${bStyle};`;
    cssB += ' }';

    const css = `${cssA}\n${cssB}`;
    console.log('[DEBUG] Generated CSS:', css);

    let el = document.getElementById('role-compare-style');
    if (!el) {
        el = document.createElement('style');
        el.id = 'role-compare-style';
        document.head.appendChild(el);
    }
    el.textContent = css;
}


export function clearRoleCompareStyles() {
    console.log('[DEBUG] clearRoleCompareStyles called');
    const el = document.getElementById('role-compare-style');
    if (el) el.textContent = '';
    
    // Clear visual role highlighting as well
    const codeA = document.getElementById('codeA');
    const codeB = document.getElementById('codeB');
    if (codeA) clearRoleHighlighting(codeA);
    if (codeB) clearRoleHighlighting(codeB);
}


export function resolveFontCssStack(fontName: string): string {
    // Returns a CSS font-family stack string like '"Fira Code", "Redacted Script"'
    if (!fontName) return '"Redacted Script", monospace';
    const source = (data.fontSourceByName && data.fontSourceByName[fontName]) || 'embedded';
    const isSystem = source === 'system';
    const available = !isSystem || isFontAvailable(fontName);
    if (available) return `"${fontName}", "Redacted Script"`;

    // Global fallback: any non-system font
    const anyAlt = data.fontDatabase.find(f => f.source !== 'system');
    if (anyAlt) return `"${anyAlt.name}", "Redacted Script"`;
    return 'monospace';
}


export function buildRolesCssFromMapping(mapping: RoleMapping, scope = ''): string {
    // mapping: role -> fontName (string). scope can be '#panelA ' etc, unused for MVP
    let css = '';
    state.currentRoleMapping = {};
    Object.entries(mapping || {}).forEach(([role, name]) => {
        const selectors = roleToHLJS[role];
        if (!selectors || !selectors.length) return; // skip roles not tied to code tokens
        const fontName = typeof name === 'string' ? name : (name.font || '');
        const weight = typeof name === 'string' ? undefined : name.weight;
        const style = typeof name === 'string' ? undefined : name.style;
        const stack = resolveFontCssStack(fontName);
        state.currentRoleMapping[role] = { font: fontName, stack, weight, style };
        const selectorList = selectors.map(sel => `${scope}${sel}`).join(', ');
        css += `${selectorList} { font-family: ${stack};`;
        if (typeof weight !== 'undefined') css += ` font-weight: ${weight};`;
        if (typeof style !== 'undefined') css += ` font-style: ${style};`;
        css += ` }\n`;
        // Keep keyword emphasis if not explicitly set
        if (role === 'keywords' && typeof weight === 'undefined') css += `${selectorList} { font-weight: 600; }\n`;
    });
    return css;
}


export function applyRoleFonts(mapping: RoleMapping) {
    const styleId = 'role-fonts-style';
    const css = buildRolesCssFromMapping(mapping);
    state.currentRoleCss = css;
    let el = document.getElementById(styleId);
    if (!el) {
        el = document.createElement('style');
        el.id = styleId;
        document.head.appendChild(el);
    }
    el.textContent = css;
}


export async function setRoleSliceInPanels(role: string) {
    // Load full code instead of slicing
    const code = await loadCode(state.currentLanguage);
    const lang = mapLanguageForHLJS(state.currentLanguage);
    const codeA = byId('codeA');
    const codeB = byId('codeB');
    
    // Apply full code with syntax highlighting
    setCodeWithHighlight(codeA, code, lang);
    setCodeWithHighlight(codeB, code, lang);
    
    // Apply role-based visual highlighting
    highlightRoleElements(codeA, role);
    highlightRoleElements(codeB, role);
}


export function highlightRoleElements(codeElement: HTMLElement, role: string) {
    // Clear any existing role highlighting
    clearRoleHighlighting(codeElement);
    
    // Get the CSS selectors for this role
    const selectors = roleToHLJS[role];
    if (!selectors || !Array.isArray(selectors)) return;
    
    console.log('[DEBUG] Adding role highlighting to element:', codeElement.id, 'for role:', role);
    // Add the focus class to the container
    codeElement.classList.add('role-focus-active');
    
    // Find and mark target elements
    selectors.forEach(selector => {
        const elements = codeElement.querySelectorAll(selector);
        elements.forEach(el => {
            el.classList.add('role-highlight-target');
        });
    });
}


export function clearRoleHighlighting(codeElement: HTMLElement) {
    console.log('[DEBUG] Clearing role highlighting from element:', codeElement.id);
    codeElement.classList.remove('role-focus-active');
    const targets = codeElement.querySelectorAll('.role-highlight-target');
    targets.forEach(el => {
        el.classList.remove('role-highlight-target');
    });
}
