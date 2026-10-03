import { extractFontNameFromCss } from '../fonts/detect';
import type { ColorScheme, RoleCandidate, TokenColor, TokenStyle } from '../types';
import hljs from '../highlight';
import { byId, qs } from '../dom';
import { data } from '../data';
import { textSamples } from '../text-samples';
import { ComparisonEngine } from '../engine';
import { importSettings } from '../export/settings';
import { isFontAvailable } from '../fonts/detect';
import { loadFont, loadedFonts } from '../fonts/loader';
import { applyRoleFonts } from '../roles';
import { state } from '../state';
import { showNextComparison } from './comparison';
import { showResults } from './results';

// Show font family selector
export function showFontFamilySelector(keepDescriptionVisible = false) {
    qs('.comparison-container').style.display = 'none';
    
    // Hide description section during font family selection (unless it's the start screen)
    if (!keepDescriptionVisible) {
        qs('.description-section').classList.add('hidden');
    }
    
    byId('fontFamilySelector').classList.remove('hidden');
    
    // Update status
    byId('status').textContent = 'Choose your preferred font style';
    
    // Populate font families
    const grid = byId('fontFamiliesGrid');
    grid.innerHTML = '';
    
    const sampleCode = (textSamples && textSamples.fontFamilyPreviewCode) || '';
    const ligatureText = (textSamples && textSamples.ligatureSample) || '';
    
    // Helper: pick default preview scheme (Monokai for dark; Catppuccin Latte for light)
    function pickDefaultScheme(): Partial<ColorScheme> & Pick<ColorScheme, 'bg' | 'fg'> {
        const list = data.colorSchemeDatabase[state.themeMode] || [];
        const want = state.themeMode === 'dark' ? 'Monokai' : 'Catppuccin Latte';
        return list.find(s => s.name === want) || list[0] || { bg: state.themeMode==='dark' ? '#1a1a1a' : '#ffffff', fg: state.themeMode==='dark' ? '#e0e0e0' : '#333' };
    }
    const defaultScheme = pickDefaultScheme();
    function tok(val: TokenColor | undefined): TokenStyle { if(!val) return {}; if(typeof val==='string') return {color:val}; return {color:val.color, bold:!!val.bold, italic:!!val.italic}; }
    const tKeyword = tok(defaultScheme.keyword), tString = tok(defaultScheme.string), tComment = tok(defaultScheme.comment), tFunc = tok(defaultScheme.function);

    Object.entries(state.fontFamilies).forEach(([familyName, familyData], idx) => {
        const option = document.createElement('div');
        option.className = 'font-family-option';
        option.onclick = (e) => {
            // Don't trigger font selection if this was a drag operation
            if (hasDragged) {
                hasDragged = false;
                return;
            }
            selectFontFamily(familyName, familyData.representative);
        };
        
        // Create container for side-by-side previews (unified window)
        const previewContainer = document.createElement('div');
        previewContainer.style.display = 'flex';
        previewContainer.style.border = '1px solid rgba(0,0,0,0.2)';
        previewContainer.style.borderRadius = '6px';
        previewContainer.style.overflow = 'hidden';
        previewContainer.style.backgroundColor = 'rgba(0,0,0,0.1)';
        
        // Choose an available preview font from the family
        function pickUsableCssString(): string {
            const entries = (familyData.fonts || []).slice();
            const primaryName = extractFontNameFromCss;
            const score = (name: string) => {
                const src = data.fontSourceByName[name] || 'embedded';
                const isLoaded = loadedFonts.has(name);
                if (src === 'google') return isLoaded ? 3 : 0;
                if (src === 'embedded') return isLoaded ? 2 : 0;
                if (src === 'system') return isFontAvailable(name) ? 1 : -1;
                return 0;
            };
            // Pick highest score; if tie, keep existing order
            let best = null, bestScore = -1;
            for (const css of entries) {
                const name = primaryName(css);
                if (!name) continue;
                const s = score(name);
                if (s > bestScore) { best = css; bestScore = s; }
            }
            if (best) return best;
            // Fallback: prefer any non-system font in the family (even if not loaded yet)
            for (const css of entries) {
                const name = primaryName(css);
                if (!name) continue;
                const src = (data.fontSourceByName && data.fontSourceByName[name]) || 'embedded';
                if (src !== 'system') return css;
            }
            // Last resort: the existing representative
            return familyData.representative || 'monospace';
        }
        const previewCss = pickUsableCssString();

        // Create the main preview element
        const preview = document.createElement('pre');
        preview.className = 'font-family-preview';
        preview.style.fontFamily = previewCss;
        preview.style.fontSize = '12px';
        preview.style.lineHeight = '1.5';
        preview.style.flex = '1';
        preview.style.margin = '0';
        preview.style.padding = '12px';
        preview.style.backgroundColor = defaultScheme.bg || 'transparent';
        preview.style.border = 'none';
        // Syntax-highlight the sample inline (highlight.js required)
        const prevId = `fam-prev-${idx}`;
        preview.id = prevId;
        const marked = hljs.highlight(sampleCode, { language: 'javascript' }).value;
        preview.classList.add('hljs','language-javascript');
        preview.innerHTML = `<code class="hljs language-javascript">${marked}</code>`;
        // Inject a scoped style so the preview uses the default scheme colors
        const style = document.createElement('style');
        const numberTok = tFunc; // use function color
        const literalTok = tKeyword; // use keyword color
        const paramsTok = { color: defaultScheme.fg || '#ccc' };
        style.textContent = `#${prevId} { color:${defaultScheme.fg || '#ccc'}; }\n`+
          `#${prevId} .hljs-keyword{ color:${tKeyword.color || defaultScheme.fg}; ${tKeyword.bold?'font-weight:600;':''}${tKeyword.italic?'font-style:italic;':''} }\n`+
          `#${prevId} .hljs-string{ color:${tString.color || defaultScheme.fg}; ${tString.bold?'font-weight:600;':''}${tString.italic?'font-style:italic;':''} }\n`+
          `#${prevId} .hljs-comment{ color:${tComment.color || defaultScheme.fg}; ${tComment.bold?'font-weight:600;':''}${tComment.italic?'font-style:italic;':''} }\n`+
          `#${prevId} .hljs-function, #${prevId} .hljs-title{ color:${tFunc.color || defaultScheme.fg}; ${tFunc.bold?'font-weight:600;':''}${tFunc.italic?'font-style:italic;':''} }\n`+
          `#${prevId} .hljs-number{ color:${numberTok.color || defaultScheme.fg}; ${numberTok.bold?'font-weight:600;':''}${numberTok.italic?'font-style:italic;':''} }\n`+
          `#${prevId} .hljs-literal{ color:${literalTok.color || defaultScheme.fg}; ${literalTok.bold?'font-weight:600;':''}${literalTok.italic?'font-style:italic;':''} }\n`+
          `#${prevId} .hljs-params{ color:${paramsTok.color}; }`;
        document.head.appendChild(style);
        
        // Create draggable divider
        const divider = document.createElement('div');
        divider.className = 'preview-divider';
        divider.style.width = '2px';
        divider.style.backgroundColor = 'rgba(127,127,127,0.3)'
        divider.style.cursor = 'col-resize';
        divider.style.flexShrink = '0';
        divider.style.position = 'relative';
        divider.style.zIndex = '10';
        
        // Add drag functionality
        let isDragging = false;
        let hasDragged = false;
        let startX = 0;
        let startWidths = { preview: 0, ligature: 0 };
        
        divider.addEventListener('mousedown', (e) => {
            isDragging = true;
            hasDragged = false;
            startX = e.clientX;
            startWidths.preview = preview.offsetWidth;
            startWidths.ligature = ligaturePreview.offsetWidth;
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            e.preventDefault();
            e.stopPropagation();
        });
        
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const deltaX = e.clientX - startX;
            
            // Mark as dragged if moved more than 3 pixels
            if (Math.abs(deltaX) > 3) {
                hasDragged = true;
            }
            
            const newPreviewWidth = startWidths.preview + deltaX;
            const newLigatureWidth = startWidths.ligature - deltaX;
            
            // Prevent panels from getting too small
            if (newPreviewWidth > 100 && newLigatureWidth > 60) {
                preview.style.width = newPreviewWidth + 'px';
                preview.style.flex = 'none';
                ligaturePreview.style.width = newLigatureWidth + 'px';
            }
        };
        
        const handleMouseUp = () => {
            isDragging = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        // Create the ligature close-up preview
        const ligaturePreview = document.createElement('div');
        ligaturePreview.className = 'ligature-preview';
        ligaturePreview.style.fontFamily = previewCss;
        ligaturePreview.style.fontSize = '30px';
        ligaturePreview.style.lineHeight = '1.0';
        ligaturePreview.style.padding = '0';
        ligaturePreview.style.backgroundColor = 'transparent';
        ligaturePreview.style.flexShrink = '0';
        ligaturePreview.style.width = '120px';
        ligaturePreview.style.display = 'flex';
        ligaturePreview.style.alignItems = 'center';
        ligaturePreview.style.justifyContent = 'center';
        ligaturePreview.style.whiteSpace = 'nowrap';
        ligaturePreview.style.overflow = 'clip';
        ligaturePreview.textContent = ligatureText;
        
        previewContainer.appendChild(preview);
        previewContainer.appendChild(divider);
        previewContainer.appendChild(ligaturePreview);
        
        option.innerHTML = `
            <div class="font-family-name">${familyName}</div>
            <div class="font-family-description">${familyData.description}</div>
        `;
        option.appendChild(previewContainer);
        
        grid.appendChild(option);
    });
    
    // Give fonts a moment to load and then refresh display
    setTimeout(() => {
        const previews = document.querySelectorAll<HTMLElement>('.font-family-preview');
        previews.forEach(preview => {
            // Force a reflow to ensure fonts are applied
            preview.style.display = 'none';
            preview.offsetHeight; // Trigger reflow
            preview.style.display = 'block';
        });
    }, 300);
}


// Handle font family selection
export function selectFontFamily(categoryName: string, representativeFont: string | null = null): void {
    // Extract font name from CSS family name for loading
    const fontCss = representativeFont || categoryName;
    const fontName = extractFontNameFromCss(fontCss) || fontCss;

    // Show loading indicator for this font
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'font-loading-indicator';
    loadingIndicator.textContent = `Loading ${fontName}...`;
    loadingIndicator.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px; border-radius: 8px; z-index: 1000;';
    document.body.appendChild(loadingIndicator);

    // Load the selected font before proceeding. Continue even if the font fails to load.
    loadFont(fontName)
        .catch(err => console.warn(`Failed to load font ${fontName}, continuing anyway:`, err))
        .then(() => {
            document.body.removeChild(loadingIndicator);

            // Hide import section and font family selector since user made choice
            byId('importSection').classList.add('hidden');
            byId('fontFamilySelector').classList.add('hidden');

            // Enable controls now that tournament has started
            byId<HTMLSelectElement>('languageSelect').disabled = false;
            byId<HTMLButtonElement>('resetBtn').disabled = false;

            state.engine.selectFontFamily(categoryName);
            showNextComparison();
        });
}


// Import settings and start with those preferences
export function importAndStart() {
    const importInput = byId<HTMLInputElement>('importSettings');
    const settingsString = importInput.value.trim();
    
    if (!settingsString) {
        alert('Please paste a settings string first');
        return;
    }
    
    try {
        const imported = importSettings(settingsString);
        
        // Set theme mode
        state.themeMode = imported.themeMode;
        byId<HTMLInputElement>('themeToggle').checked = state.themeMode === 'light';
        byId('toggleLabel').textContent = state.themeMode === 'light' ? 'Light Mode' : 'Dark Mode';
        if (state.themeMode === 'light') {
            document.body.classList.add('light-theme');
        }
        
        // Pre-populate engine with imported settings
        state.engine = new ComparisonEngine();
        state.engine.winners = {
            font: imported.font,
            size: imported.size,
            weight: imported.weight,
            lineHeight: imported.lineHeight,
            fontWidth: imported.fontWidth,
            letterSpacing: imported.letterSpacing,
            colorScheme: imported.colorScheme,
            roles: imported.rolesMapping || {}
        };
        state.engine.complete = true;

        // Restore roles if present
        if (imported.rolesMapping) {
            applyRoleFonts(state.engine.winners.roles);
        }
        
        // Hide import section and show results
        byId('importSection').classList.add('hidden');
        showResults();
        
    } catch (e) {
        alert('Invalid settings string: ' + (e instanceof Error ? e.message : e));
    }
}


// Generate random settings respecting current mode and available fonts
export function feelingLucky() {
    try {
        // Helper to pick random element from array
        const randomPick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

        // Get available fonts (excluding unavailable system fonts)
        const db = data.fontDatabase;
        const iconFonts = data.fontIconsByName;
        const availableFonts = db
            .filter(f => {
                if (!f.name) return false;
                // Exclude icon fonts
                if (iconFonts[f.name]) return false;
                // Exclude unavailable system fonts
                if (f.source === 'system' && !isFontAvailable(f.name)) return false;
                return true;
            })
            .map(f => f.name);

        if (availableFonts.length === 0) {
            alert('No fonts available. Please wait for fonts to load.');
            return;
        }

        // Pick random font
        const randomFont = randomPick(availableFonts);

        // Get color schemes for current theme mode
        const schemes = data.colorSchemeDatabase[state.themeMode] || [];
        const randomScheme = schemes.length > 0 ? randomPick(schemes) : null;

        // Random size (14-20px)
        const sizes = [14, 15, 16, 17, 18, 19, 20];
        const randomSize = randomPick(sizes);

        // Random weight
        const weights = [300, 400, 500, 600, 700];
        const randomWeight = randomPick(weights);

        // Random line height (1.3-1.8)
        const lineHeights = [1.3, 1.4, 1.5, 1.6, 1.7, 1.8];
        const randomLineHeight = randomPick(lineHeights);

        // Random letter spacing (-0.5 to 1)
        const letterSpacings = [-0.5, -0.25, 0, 0.25, 0.5, 0.75, 1];
        const randomLetterSpacing = randomPick(letterSpacings);

        // Font width (normal, condensed, expanded)
        const widths = ['normal', 'condensed', 'expanded'];
        const randomWidth = randomPick(widths);

        // Generate random role settings
        const roles: Record<string, RoleCandidate> = {};
        const roleKeys = ['comments', 'strings', 'literals', 'keywords', 'function', 'variable', 'type', 'operator', 'ghost'];
        const roleWeights = [300, 400, 600, 700];
        const roleStyles = ['normal', 'italic'];

        for (const roleKey of roleKeys) {
            const useUniqueFont = state.uniqueRoleFontsEnabled && Math.random() > 0.5;
            const roleFont = useUniqueFont ? randomPick(availableFonts) : randomFont;
            roles[roleKey] = {
                type: 'random',
                label: roleFont,
                font: roleFont,
                weight: randomPick(roleWeights),
                style: randomPick(roleStyles)
            };
        }

        // Create engine with random settings
        state.engine = new ComparisonEngine();
        state.engine.winners = {
            font: randomFont,
            size: randomSize,
            weight: randomWeight,
            lineHeight: randomLineHeight,
            letterSpacing: randomLetterSpacing,
            fontWidth: randomWidth,
            colorScheme: randomScheme,
            roles: roles
        };
        state.engine.complete = true;

        // Apply role fonts
        applyRoleFonts(roles);

        // Hide start screen and show results
        byId('fontFamilySelector').classList.add('hidden');
        byId('importSection').classList.add('hidden');
        showResults();

        console.log('[LUCKY] Generated random settings:', state.engine.winners);

    } catch (e) {
        console.error('Error in feelingLucky:', e);
        alert('Failed to generate random settings: ' + (e instanceof Error ? e.message : e));
    }
}
