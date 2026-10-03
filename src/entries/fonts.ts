import '../vendor/font-detective.js';
import { initData } from '../data';
import { initDevConfig } from '../dev';
import { injectEmbeddedFontsCss } from '../fonts/loader';
import { generateFontShowcase } from '../pages/showcase';

initDevConfig();
initData();
// The showcase shows 150+ fonts. One stylesheet with all faces is cheaper than loading each font on demand.
injectEmbeddedFontsCss();
generateFontShowcase();
