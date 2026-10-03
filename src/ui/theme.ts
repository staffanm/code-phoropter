import { isComparison } from '../engine';
import { byId } from '../dom';
import { data } from '../data';
import { state } from '../state';
import { applyStyles } from './comparison';
import { showFontFamilySelector } from './familySelector';
import { updateGridOverlays } from './grid';

// Toggle theme mode
export function toggleThemeMode() {
    const toggle = byId<HTMLInputElement>('themeToggle');

    if (toggle.checked) {
        // Dark mode is ON (toggle checked = dark mode active)
        state.themeMode = 'dark';
        document.body.classList.remove('light-theme');
    } else {
        // Dark mode is OFF (toggle unchecked = light mode active)
        state.themeMode = 'light';
        document.body.classList.add('light-theme');
    }

    // Label always stays "Dark Mode" - it describes what the toggle controls

    // Update color schemes in the current engine instead of resetting
    if (state.engine.candidates && state.engine.candidates.colorScheme) {
        state.engine.candidates.colorScheme = [...(data.colorSchemeDatabase[state.themeMode] || [])];
    }

    // If we're currently in the colorScheme stage, regenerate pairs
    if (state.engine.stage === 'colorScheme') {
        state.engine.generateNextStage();
    }
    
    // Update current comparison if one is active
    const comparison = state.engine.getNextComparison();
    if (isComparison(comparison)) {
        applyStyles('codeA', 'panelA', comparison.optionA, 'summaryA', comparison.similarity);
        applyStyles('codeB', 'panelB', comparison.optionB, 'summaryB', comparison.similarity);
        updateGridOverlays(comparison.optionA, comparison.optionB);
    }
    // If the start font family selector is visible, re-render it to apply new default scheme
    const selectorEl = document.getElementById('fontFamilySelector');
    if (selectorEl && !selectorEl.classList.contains('hidden')) {
        showFontFamilySelector(true);
    }
}


// Toggle unique role fonts mode
export function toggleUniqueRoleFonts() {
    const toggle = byId<HTMLInputElement>('uniqueRoleFontsToggle');
    state.uniqueRoleFontsEnabled = toggle.checked;
    console.log(`[DEBUG] Unique Role Fonts toggle: ${state.uniqueRoleFontsEnabled ? 'enabled' : 'disabled'}`);
}
