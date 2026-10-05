import WebFont from 'webfontloader';
import { data, findFont } from '../data';
import { devLog } from '../dev';
import { extractFontNameFromCss } from './detect';
import { state } from '../state';

const EMBEDDED_FONTS_CSS = `${import.meta.env.BASE_URL}embedded-fonts.css`;

// Track which fonts are loaded to avoid duplicate loading
export const loadedFonts = new Set<string>();
const pendingFontLoads = new Map<string, Promise<void>>();

// Load a specific font on-demand
export function loadFont(fontName: string): Promise<void> {
    if (loadedFonts.has(fontName)) {
        return Promise.resolve();
    }

    const pending = pendingFontLoads.get(fontName);
    if (pending) {
        return pending;
    }

    const fontData = findFont(fontName);
    if (!fontData) {
        console.warn(`Font not found in database: ${fontName}`);
        return Promise.reject(new Error(`Font not found: ${fontName}`));
    }

    const promise = new Promise<void>((resolve, reject) => {
        const config: WebFont.Config = {
            fontactive(familyName) {
                console.log(`✓ Font loaded: ${familyName}`);
                loadedFonts.add(familyName);
                resolve();
            },
            fontinactive(familyName, fvd) {
                console.log(`✗ Font failed to load: ${familyName} (${fvd})`);
                reject(new Error(`Font failed to load: ${familyName}`));
            },
            active: () => resolve(),
            inactive: () => reject(new Error(`Font loading timeout: ${fontName}`))
        };

        if (fontData.source === 'google') {
            // Check if font has custom Google Fonts URL with axis specifications
            if (fontData.googleFontsUrl) {
                config.custom = {
                    families: [fontName],
                    urls: [fontData.googleFontsUrl]
                };

                // Apply general axis settings if defined
                const axisSettings = Object.entries(fontData.axes ?? {})
                    .filter(([, value]) => typeof value === 'number')
                    .map(([axis, value]) => `"${axis}" ${value}`);
                if (axisSettings.length > 0) {
                    const styleEl = document.createElement('style');
                    styleEl.textContent = `
                        [style*="${fontName}"] {
                            font-variation-settings: ${axisSettings.join(', ')};
                        }
                    `;
                    document.head.appendChild(styleEl);
                }
            } else {
                config.google = {
                    families: [fontName + ':400,700']
                };
            }
        } else if (fontData.source === 'embedded') {
            // Only the regular face (n4) is requested here. The browser loads
            // the other faces from embedded-fonts.css when a style needs them.
            config.custom = {
                families: [fontData.axes ? `${fontName}:n4` : fontName],
                urls: [EMBEDDED_FONTS_CSS]
            };
        }

        WebFont.load(config);
    });

    // Store promise to avoid duplicate requests
    pendingFontLoads.set(fontName, promise);
    promise.finally(() => pendingFontLoads.delete(fontName)).catch(() => {});

    return promise;
}

// Load initial fonts - only loads representative fonts for front page
export function loadFonts(): Promise<void> {
    const representatives = Object.values(state.fontFamiliesOriginal)
        .map(family => family.representative && extractFontNameFromCss(family.representative))
        .filter((name): name is string => !!name);

    console.log(`Loading representative fonts for front page: ${representatives.join(', ')}`);

    // Use original font families initially (before detection)
    state.fontFamilies = state.fontFamiliesOriginal;
    state.fonts = Object.values(state.fontFamilies).flatMap(family => family.fonts);

    console.log(`Font database contains: ${state.fonts.length} total fonts`);

    // Load Material Icons for potential UI enhancements
    const iconsLink = document.createElement('link');
    iconsLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    iconsLink.rel = 'stylesheet';
    document.head.appendChild(iconsLink);

    return Promise.all(representatives.map(fontName => loadFont(fontName)))
        .then(() => {
            devLog(`✓ Representative fonts loaded: ${representatives.length} fonts`);
        })
        .catch(err => {
            // Continue even if some fonts fail
            console.error('Representative font loading failed:', err);
        });
}

// Load the stylesheet with the @font-face rules for all embedded fonts
export function injectEmbeddedFontsCss(): void {
    const link = document.createElement('link');
    link.href = EMBEDDED_FONTS_CSS;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
}

// Inject Google Fonts CSS for all fonts marked as "google" source
export function injectGoogleFontsFromDatabase(): void {
    try {
        if (document.getElementById('gf-database-style')) return;

        const db = data.fontDatabase || [];
        const googleFonts = db.filter(f => f.source === 'google');

        if (googleFonts.length === 0) return;

        // Handle fonts with custom Google Fonts URLs first
        const customUrlFonts = googleFonts.filter(f => f.googleFontsUrl);
        customUrlFonts.forEach((font, index) => {
            const existingLink = document.getElementById(`gf-custom-${index}`);
            if (!existingLink) {
                const link = document.createElement('link');
                link.id = `gf-custom-${index}`;
                link.href = font.googleFontsUrl ?? '';
                link.rel = 'stylesheet';
                document.head.appendChild(link);
            }
        });

        // Handle remaining fonts with standard Google Fonts API
        const standardFonts = googleFonts.filter(f => !f.googleFontsUrl);
        if (standardFonts.length === 0) {
            console.log(`[Font Loading] Injected ${customUrlFonts.length} custom Google Fonts`);
            return;
        }

        // Build Google Fonts URL with all standard font families
        const families = standardFonts.map(font => {
            // Convert font name to Google Fonts format (spaces become +)
            const family = font.name.replace(/\s/g, '+');

            // Add weight and style specifications if available
            let spec = family;
            if (font.axes && (font.axes.weights || font.axes.styles)) {
                const weights = font.axes.weights || [400];
                const styles = font.axes.styles || ['normal'];

                // Create weight:style combinations
                const variants: string[] = [];
                styles.forEach(style => {
                    weights.forEach(weight => {
                        if (style === 'italic') {
                            variants.push(`1,${weight}`);
                        } else {
                            variants.push(`0,${weight}`);
                        }
                    });
                });

                if (variants.length > 0) {
                    spec = `${family}:ital,wght@${variants.join(';')}`;
                }
            }

            return spec;
        }).join('&family=');

        const link = document.createElement('link');
        link.id = 'gf-database-style';
        link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        console.log(`[Font Loading] Injected Google Fonts CSS for ${standardFonts.length} standard + ${customUrlFonts.length} custom fonts`);
    } catch (e) {
        console.warn('[Font Loading] Failed to inject Google Fonts:', e);
    }
}


// Load the placeholder font that shows when a font fails to load
export function injectCriticalAboutFonts(): void {
    try {
        if (document.getElementById('gf-redacted-style')) return;
        const link = document.createElement('link');
        link.id = 'gf-redacted-style';
        link.href = 'https://fonts.googleapis.com/css2?family=Redacted+Script:wght@400&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    } catch {}
}
