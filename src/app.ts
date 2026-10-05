import './vendor/font-detective.js';
import { updateCode } from './code';
import { initData } from './data';
import { ComparisonEngine } from './engine';
import { detectedFonts, filterFontFamilies } from './fonts/detect';
import { generateFontFamilies } from './fonts/families';
import { injectCriticalAboutFonts, loadFonts } from './fonts/loader';
import { state } from './state';
import { hideLoadingScreen, showStartScreen } from './ui/comparison';
import { showFontFamilySelector } from './ui/familySelector';

// Detect the installed system fonts, then show only the fonts that are available
function detectInstalledFonts(): void {
    try {
        FontDetective.all((detectedFontObjects) => {
            detectedFonts.clear();
            detectedFontObjects.forEach(fontObj => detectedFonts.add(fontObj.name));
            state.fontFamilies = filterFontFamilies();
            state.fonts = Object.values(state.fontFamilies).flatMap(family => family.fonts);
            console.log(`Font detection complete: ${state.fonts.length} fonts available`);
            // If the font family selector is visible, re-render it with available fonts
            const selector = document.getElementById('fontFamilySelector');
            if (selector && !selector.classList.contains('hidden')) {
                showFontFamilySelector(true);
            }
        });
    } catch (e) {
        console.error('FontDetective error:', e);
    }
}

// Initialize the main app page
export function init(): void {
    initData();
    state.fontFamiliesOriginal = generateFontFamilies();
    state.fontFamilies = state.fontFamiliesOriginal;
    state.engine = new ComparisonEngine();

    // Every font stack ends with "Redacted Script". Without it, a font that
    // fails to load shows in the browser default font.
    injectCriticalAboutFonts();

    // Load representative fonts first, then show start screen
    loadFonts().then(() => {
        hideLoadingScreen();
        updateCode();
        showStartScreen();
    });

    detectInstalledFonts();
}
