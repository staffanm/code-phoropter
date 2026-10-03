import { ColorScheme, FontEntry, ThemeMode, TokenColor, TokenStyle } from '../types';
import hljs from '../highlight';
import { data } from '../data';
import { injectCriticalAboutFonts, injectGoogleFontsFromDatabase } from '../fonts/loader';

export function generateAboutPageTables() {
    const fontTableContainer = document.getElementById('fontTableBody');
    const darkSchemesContainer = document.getElementById('darkSchemesTableBody');
    const lightSchemesContainer = document.getElementById('lightSchemesTableBody');
    if (!fontTableContainer || !darkSchemesContainer || !lightSchemesContainer) return;

    const build = (installedNames: Set<string>) => {
        // Inject Google Fonts CSS so samples can render GF families
        try {
            injectGoogleFontsFromDatabase();
            injectCriticalAboutFonts();
        } catch {}
        generateFontTable(fontTableContainer, installedNames);
        generateColorSchemeTable('dark', darkSchemesContainer);
        generateColorSchemeTable('light', lightSchemesContainer);
    };

    // Try to use FontDetective if available
    if (typeof FontDetective !== 'undefined' && FontDetective.all) {
        try {
            FontDetective.all((detected) => {
                const names = new Set(detected.map(f => f.name));
                build(names);
            });
        } catch {
            build(new Set());
        }
    } else {
        build(new Set());
    }
}


export function generateFontTable(container: HTMLElement, installedNames: Set<string>) {
    const sourceLabels = { google: 'Google Fonts', embedded: 'Embedded', system: 'System' };
    const sampleText = 'if(l==1||O[0]){$file+=~l*10}';
    const fonts = data.fontDatabase.slice().sort((a,b) => (a.name||'').localeCompare(b.name||''));
    let html = '';
    fonts.forEach(font => {
        const ligatureIcon = font.ligatures ? '✓' : '✗';
        const description = font.description || buildTypographicDescription(font);
        const nameCell = font.homepage ? `<a href="${font.homepage}" target="_blank" rel="noopener noreferrer">${font.name}</a>` : font.name;
        let sampleCell = '';
        if (font.source === 'system') {
            const available = installedNames && installedNames.has(font.name);
            sampleCell = available
                ? `<span class="sample-code" style="font-family:'${font.name}', 'Redacted Script'">${sampleText}</span>`
                : 'System font not available';
        } else {
            sampleCell = `<span class="sample-code" style="font-family:'${font.name}', 'Redacted Script'">${sampleText}</span>`;
        }
        html += `<tr>
            <td>${nameCell}</td>
            <td><span class="font-source ${font.source}">${sourceLabels[font.source] || font.source}</span></td>
            <td>${ligatureIcon}</td>
            <td>${description}</td>
            <td>${sampleCell}</td>
        </tr>`;
    });
    const totalFonts = fonts.length;
    html += `<tr>
        <td><strong>Total: ${totalFonts} fonts</strong></td>
        <td colspan="4">Includes system, embedded, and Google fonts</td>
    </tr>`;
    container.innerHTML = html;
}


// Build a typographic-focused description from heuristics
export function buildTypographicDescription(font: FontEntry) {
    const parts = [];
    const cat = font.category.toLowerCase();
    if (cat.includes('serif')) parts.push('monospaced serif');
    else if (cat.includes('slab')) parts.push('slab‑serif mono');
    else if (cat.includes('retro')) parts.push('retro/terminal mono');
    else if (cat.includes('compact')) parts.push('condensed mono');
    else if (cat.includes('playful')) parts.push('playful, handwriting‑inspired mono');
    else parts.push('monospaced sans‑serif');

    if (font.ligatures) parts.push('programming ligatures');
    if (font.axes && (font.axes.widths || font.axes.weights || font.axes.styles)) parts.push('multiple styles');

    // Name-based nuance
    const n = (font.name || '').toLowerCase();
    if (n.includes('space mono')) parts.push('geometric shapes, wide counters');
    if (n.includes('iosevka')) parts.push('narrow proportions');
    if (n.includes('vt323') || n.includes('3270') || n.includes('terminus')) parts.push('pixel/CRT aesthetics');

    return parts.join(' • ');
}


export function generateColorSchemeTable(mode: ThemeMode, container: HTMLElement) {
    const schemes = (data.colorSchemeDatabase[mode] || []).slice().sort((a, b) => a.name.localeCompare(b.name));
    let html = '';
    const sampleCode = `const API_URL = "https://api.io"; // prod\nlet items = [{id: 1, active: true}];\nasync function getData(limit = 10) {}`;
    const getToken = (val: TokenColor | undefined): TokenStyle => {
        if (!val) return {};
        if (typeof val === 'string') return { color: val };
        return { color: val.color, bold: !!val.bold, italic: !!val.italic };
    };
    schemes.forEach((scheme, idx) => {
        const homepageLink = scheme.homepage ? `<a href="${scheme.homepage}" target="_blank">${scheme.author}</a>` : (scheme.author || '');
        const id = `scheme-${mode}-${idx}`;
        // Build highlighted HTML once (constructing the HTML in the table) — highlight.js required
        const highlighted = hljs.highlight(sampleCode, { language: 'javascript' }).value;
        const keyword = getToken(scheme.keyword);
        const string = getToken(scheme.string);
        const comment = getToken(scheme.comment);
        const fn = getToken(scheme.function);
        const fg = scheme.fg || '#ccd';
        const bg = scheme.bg || (mode === 'dark' ? '#111' : '#fff');
        // Scoped CSS so it won't leak
        const weight = (tok: TokenStyle) => tok.bold ? 'font-weight:600;' : '';
        const italic = (tok: TokenStyle) => tok.italic ? 'font-style:italic;' : '';
        // Derive additional tokens from existing scheme fields
        const numberTok = fn; // use function color for numbers
        const literalTok = keyword; // use keyword color for literals (true/false/null)
        const paramsTok = { color: fg };
        const styleBlock = `
<style>
  #${id} { background:${bg}; color:${fg}; }
  #${id} .hljs-keyword { color:${keyword.color || fg}; ${weight(keyword)}${italic(keyword)} }
  #${id} .hljs-string { color:${string.color || fg}; ${weight(string)}${italic(string)} }
  #${id} .hljs-comment { color:${comment.color || fg}; ${weight(comment)}${italic(comment)} }
  #${id} .hljs-function, #${id} .hljs-title { color:${fn.color || fg}; ${weight(fn)}${italic(fn)} }
  #${id} .hljs-number { color:${numberTok.color || fg}; ${weight(numberTok)}${italic(numberTok)} }
  #${id} .hljs-literal { color:${literalTok.color || fg}; ${weight(literalTok)}${italic(literalTok)} }
  #${id} .hljs-params { color:${paramsTok.color}; }
</style>`;
        const sampleCell = `${styleBlock}<pre class="scheme-sample"><code id="${id}" class="hljs language-javascript">${highlighted}</code></pre>`;
        html += `<tr>
            <td>${scheme.name}</td>
            <td>${homepageLink}</td>
            <td>${scheme.description || ''}</td>
            <td>${sampleCell}</td>
        </tr>`;
    });
    container.innerHTML = html;
}
