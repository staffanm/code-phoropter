import { isComparison, type Candidate } from '../engine';
import type { Choice, ComparisonOption, SimilarityInfo, TokenColor } from '../types';
import { byId, qs } from '../dom';
import { data } from '../data';
import { multiFontPresets } from '../font-roles';
import { codeCache, updateCode } from '../code';
import { codeSampleUrls, fontSizes, fontWeights, letterSpacings, lineHeights } from '../constants';
import { ComparisonEngine } from '../engine';
import { detectFontWidthSupport, extractFontNameFromCss, isFontAvailable } from '../fonts/detect';
import { loadFont, loadedFonts } from '../fonts/loader';
import { applyRoleCompareStyles, applyRoleFonts, clearRoleCompareStyles, getRoleLabel, roleToHLJS, setRoleSliceInPanels } from '../roles';
import { STAGES, getStage, getStageIndex, logStageOutcome, stageToRoleKey } from '../stages';
import { state } from '../state';
import { showFontFamilySelector } from './familySelector';
import { initializeGridForStage, updateGridOverlays } from './grid';
import { showResults } from './results';

// Hide loading screen and show main app
export function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const app = byId('app');

    if (loadingScreen && app) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            app.classList.remove('hidden');
        }, 500);
    }
}


// Show next comparison
export function showNextComparison(): void {
    const engine = state.engine;
    const comparison = engine.getNextComparison();

    if (!comparison) {
        // If in recompare mode, restore full results and return to results screen
        if (engine.recompareMode && engine.recompareStage && engine.recompareResults) {
            // Merge the recompared stage winner back into full results
            const stageWinner = engine.getWinner(engine.recompareStage);
            engine.winners = { ...engine.recompareResults };
            engine.setWinner(engine.recompareStage, stageWinner as Candidate | null | undefined);

            // Clear recompare mode
            engine.recompareMode = false;
            engine.recompareStage = null;
            engine.recompareResults = null;
            engine.complete = true;
        }

        showResults();
        return;
    }

    // Handle font family selector
    if (!isComparison(comparison)) {
        showFontFamilySelector();
        return;
    }

    // Clear any animation classes and focus from previous comparison
    for (const panel of [byId('panelA'), byId('panelB')]) {
        panel.classList.remove('winner', 'loser');
        panel.blur();
    }

    const { optionA, optionB, stage, similarity, roleTest } = comparison;

    if (stage === 'font') {
        const unavailable = [optionA, optionB].filter(opt => {
            const fontName = extractFontNameFromCss(opt.font);
            if (!fontName) return false;
            const source = data.fontSourceByName[fontName] || 'embedded';
            return source === 'system' && !isFontAvailable(fontName);
        });

        if (unavailable.length > 0) {
            unavailable.forEach(opt => {
                console.log(`[INFO] Removing unavailable system font from comparisons: ${extractFontNameFromCss(opt.font)}`);
                engine.disqualifyFont(opt.font);
            });
            requestAnimationFrame(() => showNextComparison());
            return;
        }
    }

    // Initialize grid visibility based on stage configuration
    initializeGridForStage(stage);
    // Role stages: show the code and apply panel-scoped role fonts
    const roleSetupPromise = (async () => {
        if (roleTest) {
            if (roleTest.role !== 'base') {
                await setRoleSliceInPanels(roleTest.role);
                applyRoleCompareStyles(roleTest.role, roleTest.aFont, roleTest.bFont, roleTest.aWeight, roleTest.aStyle, roleTest.bWeight, roleTest.bStyle);
            } else {
                clearRoleCompareStyles();
            }
            state.inRoleView = true;
        } else if (state.inRoleView) {
            clearRoleCompareStyles();
            await updateCode();
            state.inRoleView = false;
        }
    })();

    // Hide font family selector if it was showing
    byId('fontFamilySelector').classList.add('hidden');

    // Show/hide skip button for skippable stages
    const stageObj = getStage(stage);
    byId('btnSkipStage').style.display = stageObj?.skippable ? 'block' : 'none';

    // Hide description section during A/B tests
    qs('.description-section').classList.add('hidden');

    qs('.comparison-container').style.display = 'flex';

    // Update progress
    byId('progressFill').style.width = engine.getProgress() + '%';

    // Update status (similarity info moved to hidden summary)
    byId('status').textContent = `Comparing: ${stageObj?.name || stage}`;

    // Show stage notification for first comparison in each stage
    showStageNotification(stageObj?.name, stageObj?.description);

    // Apply styles and summaries (pass similarity info and role info)
    // Wait for role setup to complete before applying styles
    const roleInfoA = roleTest ? { role: roleTest.role, font: roleTest.aFont, weight: roleTest.aWeight, style: roleTest.aStyle } : null;
    const roleInfoB = roleTest ? { role: roleTest.role, font: roleTest.bFont, weight: roleTest.bWeight, style: roleTest.bStyle } : null;

    roleSetupPromise.then(() => {
        applyStyles('codeA', 'panelA', optionA, 'summaryA', similarity, roleInfoA);
        applyStyles('codeB', 'panelB', optionB, 'summaryB', similarity, roleInfoB);

        // Update grid overlays (user-controlled via 'g' key)
        updateGridOverlays(optionA, optionB);
    });
}

interface RoleInfo {
    role: string;
    font: string;
    weight?: number;
    style?: string;
}

interface NormalizedToken {
    color?: string;
    weight?: number;
    style?: string;
}

// Normalize scheme tokens: allow string or object { color, italic, bold }
function normToken(v: TokenColor | undefined): NormalizedToken {
    if (!v) return {};
    if (typeof v === 'string') return { color: v };
    const o: NormalizedToken = { color: v.color };
    if (typeof v.bold === 'boolean') o.weight = v.bold ? 700 : 400;
    if (typeof v.italic === 'boolean') o.style = v.italic ? 'italic' : 'normal';
    return o;
}

// Merge role + scheme style for a logical token
function mergeStyleFor(roleKey: string, schemeTok: NormalizedToken): { weight?: number; style?: string } {
    const roleInfo = state.currentRoleMapping[roleKey];
    return {
        weight: roleInfo?.weight ?? schemeTok.weight,
        style: schemeTok.style ?? roleInfo?.style
    };
}

// Apply styles to a code panel
export function applyStyles(codeId: string, panelId: string, option: ComparisonOption, summaryId: string | null, similarity: SimilarityInfo | null = null, roleInfo: RoleInfo | null = null): void {
    const code = byId(codeId);
    const panel = byId(panelId);
    const summary = summaryId ? document.getElementById(summaryId) : null;

    // Extract font name and ensure it's loaded
    const fontName = extractFontNameFromCss(option.font);

    if (fontName && !loadedFonts.has(fontName)) {
        // Add subtle loading indicator on panel
        panel.style.filter = 'blur(1px)';
        panel.style.transition = 'filter 0.3s ease';

        // Load font asynchronously. Remove the blur even if loading failed.
        loadFont(fontName)
            .catch(err => console.warn(`Failed to load font ${fontName} for panel:`, err))
            .then(() => { panel.style.filter = 'none'; });
    }

    code.style.fontFamily = option.font;
    code.style.fontSize = option.fontSize + 'px';
    code.style.fontWeight = String(option.fontWeight);
    code.style.fontStyle = 'normal';
    code.style.lineHeight = String(option.lineHeight);
    code.style.fontStretch = option.fontWidth || 'normal';
    code.style.letterSpacing = (option.letterSpacing || 0) + 'px';

    if (option.colorScheme) {
        panel.style.backgroundColor = option.colorScheme.bg;
        code.style.color = option.colorScheme.fg;

        const tok = {
            keyword: normToken(option.colorScheme.keyword),
            string: normToken(option.colorScheme.string),
            comment: normToken(option.colorScheme.comment),
            function: normToken(option.colorScheme.function)
        };

        // Apply colors and optional weight/style per token.
        // During role stages, skip applying weight/style inline for the role being tested
        // since applyRoleCompareStyles handles it via CSS
        const testingRole = roleInfo?.role;
        const applyToken = (selector: string, roleKey: string, token: NormalizedToken) => {
            code.querySelectorAll<HTMLElement>(selector).forEach(el => {
                if (token.color) el.style.color = token.color;
                if (testingRole !== roleKey) {
                    const m = mergeStyleFor(roleKey, token);
                    if (typeof m.weight !== 'undefined') el.style.fontWeight = String(m.weight);
                    if (typeof m.style !== 'undefined') el.style.fontStyle = m.style;
                }
            });
        };
        applyToken('.hljs-keyword, .hljs-operator', 'keywords', tok.keyword);
        applyToken('.hljs-string, .hljs-attr', 'strings', tok.string);
        applyToken('.hljs-comment', 'comments', tok.comment);
        applyToken('.hljs-function, .hljs-title', 'function', tok.function);
    }

    // Update summary if provided
    if (summary) {
        const baseFontName = option.font.split(',')[0].replace(/"/g, '');
        const themeName = option.colorScheme ? option.colorScheme.name : 'Unknown';
        const widthNote = (option.fontWidth && option.fontWidth !== 'normal') ?
            ` • ${option.fontWidth} (may not be visible)` : '';

        let similarityText = '';
        if (similarity && state.engine.stage === 'font') {
            const categoryText = similarity.category.replace('-', ' ');
            const scoreText = Math.round(similarity.score);
            similarityText = `<br><em>Round ${similarity.round}: ${categoryText} (${scoreText}% similar)</em>`;
        }

        // Build summary differently for role stages vs normal stages
        if (roleInfo && roleInfo.font) {
            // Role stage: Show base font, then role-specific comparison
            const roleName = stageToRoleKey(state.engine.stage);
            const roleDisplayName = roleName ? (roleName.charAt(0).toUpperCase() + roleName.slice(1)) : 'Role';

            // Build role comparison line
            const roleFontParts: (string | number)[] = [roleInfo.font];
            if (roleInfo.weight) roleFontParts.push(roleInfo.weight);
            if (roleInfo.style && roleInfo.style !== 'normal') {
                roleFontParts.push(roleInfo.style.charAt(0).toUpperCase() + roleInfo.style.slice(1));
            }
            const roleComparison = roleFontParts.join(' • ');

            summary.innerHTML = `
                <strong>${baseFontName}</strong><br>
                ${option.fontSize}px • ${option.fontWeight}${widthNote}<br>
                ${option.letterSpacing || 0}px spacing • ${option.lineHeight} line height<br>
                ${themeName}<br>
                <strong>${roleDisplayName}: ${roleComparison}</strong>
            `;
        } else {
            summary.innerHTML = `
                <strong>${baseFontName}</strong><br>
                ${option.fontSize}px • ${option.fontWeight}${widthNote}<br>
                ${option.letterSpacing || 0}px spacing • ${option.lineHeight} line height<br>
                ${themeName}${similarityText}
            `;
        }
    }
}

export function showStageNotification(stageName: string | undefined, stageDescription: string | undefined) {
    // Don't show notification for font family selection
    if (!stageName || stageName === 'fontFamily') return;

    // Only show once per stage
    if (state.currentNotifiedStage === stageName) return;
    state.currentNotifiedStage = stageName;

    const notification = byId('stageNotification');

    // Build notification HTML with description if available
    let html = `<div class="stage-notification-title">Now comparing: ${stageName}</div>`;
    if (stageDescription) {
        html += `<div class="stage-notification-description">${stageDescription}</div>`;
    }
    notification.innerHTML = html;

    notification.style.animation = 'stage-notify 5s ease-out';

    // Reset animation
    notification.addEventListener('animationend', () => {
        notification.style.animation = '';
    }, { once: true });
}


// Handle option selection
export function selectOption(choice: Choice): void {
    // Trigger selection animations
    const panelA = byId('panelA');
    const panelB = byId('panelB');

    // Remove any existing animation classes
    panelA.classList.remove('winner', 'loser');
    panelB.classList.remove('winner', 'loser');

    // Apply animation classes based on choice
    if (choice === 'A') {
        panelA.classList.add('winner');
        panelB.classList.add('loser');
    } else if (choice === 'B') {
        panelB.classList.add('winner');
        panelA.classList.add('loser');
    } else if (choice === 'equal') {
        // Both are "losers" for no preference
        panelA.classList.add('loser');
        panelB.classList.add('loser');
    }

    // Wait for animation to complete before proceeding
    setTimeout(() => {
        const prevFont = state.engine.winners && state.engine.winners.font;
        state.engine.submitChoice(choice);
        state.comparisonCount++;
        // If a base font was just selected and icons-patched variants exist, prompt
        if (state.engine.winners && state.engine.winners.font && state.engine.winners.font !== prevFont) {
            maybePromptPatchedVariant(state.engine.winners.font);
        }
        showNextComparison();
    }, 400); // Animation duration
}


// Skip current role stage
export function skipRoleStage() {
    if (state.engine.stage && state.engine.stage.startsWith('role')) {
        const stageId = state.engine.stage;
        const roleKey = stageToRoleKey(stageId);
        const comparisons = state.engine.stageComparisons?.[stageId] || 0;
        const winnerValue = roleKey && state.engine.winners && state.engine.winners.roles ? state.engine.winners.roles[roleKey] : null;

        // Mark the role as not set by skipping its tournament
        state.engine.currentRoleTournament = null;

        logStageOutcome(stageId, winnerValue || null, comparisons, { reason: 'skipped' });

        // Advance to next stage
        const stageIndex = getStageIndex(stageId);
        if (stageIndex >= 0 && stageIndex < STAGES.length - 1) {
            state.engine.stage = STAGES[stageIndex + 1].id;
            state.engine.generateNextStage();
            showNextComparison();
        } else {
            // If this was the last stage, complete the process
            state.engine.complete = true;
            showResults();
        }
    }
}


export function skipCurrentStage() {
    const currentStage = getStage(state.engine.stage);
    
    // Don't allow skipping fontFamily or non-skippable stages
    if (!currentStage || !currentStage.skippable) {
        return;
    }
    
    // For role stages, use existing logic
    if (state.engine.stage && state.engine.stage.startsWith('role')) {
        skipRoleStage();
        return;
    }
    
    // For other stages, keep the winner if there is one, else take the first candidate
    const stageId = state.engine.stage;
    let winnerValue = state.engine.getWinner(stageId);
    if (!winnerValue) {
        const candidates = state.engine.candidates[stageId];
        if (Array.isArray(candidates) && candidates.length > 0) {
            winnerValue = candidates[0];
            state.engine.setWinner(stageId, winnerValue);
        }
    }
    const comparisons = state.engine.stageComparisons?.[stageId] || 0;
    logStageOutcome(stageId, winnerValue || null, comparisons, { reason: 'skipped' });
    
    // Advance to next stage
    const stageIndex = getStageIndex(stageId);
    if (stageIndex >= 0 && stageIndex < STAGES.length - 1) {
        state.engine.stage = STAGES[stageIndex + 1].id;
        state.engine.generateNextStage();
        showNextComparison();
    } else {
        // If this was the last stage, complete the process
        state.engine.complete = true;
        showResults();
    }
}


// Change language
export function changeLanguage() {
    const newLanguage = byId<HTMLSelectElement>('languageSelect').value;
    
    if (newLanguage === 'custom') {
        showCustomUrlDialog();
        return;
    }
    
    state.currentLanguage = newLanguage;
    updateCode();
    
    // Reapply current comparison styles after code loads
    setTimeout(() => {
        const comparison = state.engine.getNextComparison();
        if (isComparison(comparison)) {
            applyStyles('codeA', 'panelA', comparison.optionA, null, comparison.similarity);
            applyStyles('codeB', 'panelB', comparison.optionB, null, comparison.similarity);
            updateGridOverlays(comparison.optionA, comparison.optionB);
        }
    }, 100);
}

export function findPatchedVariants(baseName: string) {
    return data.fontDatabase.filter(f => f.icons === true && f.patchedFrom === baseName).map(f => f.name);
}

export function maybePromptPatchedVariant(cssFontString: string) {
    const baseName = extractFontNameFromCss(cssFontString);
    if (!baseName || state.iconsPromptedFor.has(baseName)) return;
    const variants = findPatchedVariants(baseName);
    if (!variants.length) return;
    state.iconsPromptedFor.add(baseName);
    const prevLang = state.currentLanguage;
    // Switch to powerline sample for context
    state.currentLanguage = 'powerline';
    updateCode();
    // Populate modal options
    const list = variants.map(v => {
        const available = (data.fontSourceByName[v] !== 'system') || isFontAvailable(v);
        return `<div><label><input type="radio" name="patchedChoice" value="${v}" ${available ? 'checked' : ''}> ${v} ${available ? '' : '<span style="opacity:.7">(not installed)</span>'}</label></div>`;
    }).join('');
    const opts = document.getElementById('iconsOptions');
    if (opts) opts.innerHTML = `<div style="margin-bottom:8px;">Base: <strong>${baseName}</strong></div>${list}`;
    const modal = document.getElementById('iconsModal');
    if (modal) modal.classList.remove('hidden');
    // Wire actions
    const keepBtn = document.getElementById('iconsKeepBaseBtn');
    const useBtn = document.getElementById('iconsUsePatchedBtn');
    const onClose = () => {
        if (modal) modal.classList.add('hidden');
        state.currentLanguage = prevLang;
        updateCode();
        keepBtn?.removeEventListener('click', onKeep);
        useBtn?.removeEventListener('click', onUse);
    };
    const onKeep = () => { onClose(); };
    const onUse = () => {
        const sel = document.querySelector<HTMLInputElement>('input[name="patchedChoice"]:checked');
        const chosen = sel ? sel.value : variants[0];
        applyRoleFonts({ powerline: chosen, nerdFont: chosen });
        onClose();
    };
    keepBtn?.addEventListener('click', onKeep);
    useBtn?.addEventListener('click', onUse);
}


// Show custom URL input dialog
export function showCustomUrlDialog() {
    const url = prompt(
        'Enter URL to load code from:\n\n' +
        'Examples:\n' +
        '• GitHub raw file: https://raw.githubusercontent.com/user/repo/main/file.js\n' +
        '• Gist raw: https://gist.githubusercontent.com/user/id/raw/file.js\n' +
        '• Any public text file URL\n\n' +
        'URL:'
    );
    
    if (url && url.trim()) {
        const cleanUrl = url.trim();
        
        // Validate URL format
        try {
            new URL(cleanUrl);
        } catch {
            alert('Invalid URL format. Please enter a valid URL.');
            byId<HTMLSelectElement>('languageSelect').value = state.currentLanguage;
            return;
        }
        
        // Set custom URL and load
        console.log(`Setting custom URL: ${cleanUrl}`);
        codeSampleUrls.custom = cleanUrl;
        state.currentLanguage = 'custom';
        
        // Clear cache for custom to force reload
        codeCache.delete('custom');
        
        console.log(`Loading custom code from: ${codeSampleUrls.custom}`);
        updateCode();
        
        // Update select box to show custom is selected
        const option = document.querySelector<HTMLOptionElement>('#languageSelect option[value="custom"]');
        if (option) {
            option.text = `Custom (${cleanUrl.split('/').pop() || 'loaded'})`;
        }
    } else {
        // User cancelled, revert selection
        byId<HTMLSelectElement>('languageSelect').value = state.currentLanguage;
    }
}


// Reset test
export function resetTest() {
    state.engine = new ComparisonEngine();
    state.comparisonCount = 0;
    
    // Reset UI to initial state
    byId('results').classList.add('hidden');
    byId('fontFamilySelector').classList.remove('hidden');
    byId('importSection').classList.remove('hidden');
    byId('progressFill').style.width = '0%';
    
    // Disable controls until tournament starts
    byId<HTMLSelectElement>('languageSelect').disabled = true;
    byId<HTMLButtonElement>('resetBtn').disabled = true;
    
    updateCode();
    showNextComparison();
}


// Re-compare specific stage
export function recompareStage(stage: string) {
    // Store current results
    const currentResults = { ...state.engine.winners };
    
    // Create a new engine just for this single stage
    state.engine.recompareMode = true;
    state.engine.recompareStage = stage;
    state.engine.recompareResults = currentResults;
    
    // Reset only the specified stage
    state.engine.setWinner(stage, null);
    state.engine.stage = stage;
    state.engine.stageComparisons[stage] = 0;
    state.engine.preferredColorSchemes = [];
    state.engine.complete = false;
    
    // Set up candidates for the specific stage
    switch(stage) {
        case 'fontFamily':
            state.engine.fontFamilySelectionMode = true;
            break;
        case 'font':
            if (currentResults.fontFamily) {
                state.engine.prepareFontCandidates(currentResults.fontFamily);
            }
            break;
        case 'size':
            state.engine.candidates.size = [...fontSizes];
            break;
        case 'weight':
            state.engine.candidates.weight = [...fontWeights];
            break;
        case 'lineHeight':
            state.engine.candidates.lineHeight = [...lineHeights];
            break;
        case 'fontWidth': {
            // Dynamically populate based on font support
            const selectedFont = extractFontNameFromCss(currentResults.font) || currentResults.font || 'Consolas';
            const supportedWidths = detectFontWidthSupport(selectedFont);
            state.engine.candidates.fontWidth = supportedWidths;
            break;
        }
        case 'letterSpacing':
            state.engine.candidates.letterSpacing = [...letterSpacings];
            break;
        case 'colorScheme':
            state.engine.candidates.colorScheme = [...(data.colorSchemeDatabase[state.themeMode] || [])];
            break;
    }
    
    state.engine.generateNextStage();
    
    // Hide results and show comparison interface
    byId('results').classList.add('hidden');
    byId('progressFill').style.width = '0%';
    showNextComparison();
}


// Show initial start screen with import option
export function showStartScreen() {
    qs('.description-section').classList.remove('hidden');
    byId('fontFamilySelector').classList.remove('hidden');
    qs('.comparison-container').style.display = 'none';
    byId('status').textContent = 'Import previous settings or choose your preferred font style';
    
    // Populate the font family selector (but keep description/import visible)
    showFontFamilySelector(true); // Pass flag to indicate this is for start screen
}
