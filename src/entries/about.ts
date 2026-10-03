import '../vendor/font-detective.js';
import { initData } from '../data';
import { initDevConfig } from '../dev';
import { injectEmbeddedFontsCss } from '../fonts/loader';
import { generateAboutPageTables } from '../pages/aboutTables';

// Apply theme based on system preference
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.body.classList.add('dark-mode');
}

initDevConfig();
initData();
// The tables show many fonts. One stylesheet with all faces is cheaper than loading each font on demand.
injectEmbeddedFontsCss();
generateAboutPageTables();
