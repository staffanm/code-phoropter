// Font sources are defined in font-database.js

// Dev config and logging
//
// Query parameters for development:
//   ?dev=1         → enables eager font loading + verbose logs
//   ?eagerFonts=1  → eagerly load all embedded faces (width × weight × style)
//   ?verbose=1     → enable debug logging
//
// Use on either index.html or about.html while iterating locally, e.g.:
//   http://localhost:8000/index.html?dev=1
//   http://localhost:8000/about.html?eagerFonts=1
function initDevConfig() {
    try {
        const params = new URLSearchParams(window.location.search || '');
        window.DEV_EAGER_FONTS = params.has('eagerFonts') || params.get('dev') === '1';
        window.DEV_VERBOSE_LOGS = params.has('verbose') || params.get('dev') === '1';
        window.DEV_TOURNAMENT = params.has('devTournament');
        window.DEV_AUTO_TOURNAMENT = params.has('autoTournament');
    } catch {}
    window.DEV_EAGER_FONTS = !!window.DEV_EAGER_FONTS;
    window.DEV_VERBOSE_LOGS = !!window.DEV_VERBOSE_LOGS;
    window.DEV_TOURNAMENT = !!window.DEV_TOURNAMENT;
    window.DEV_AUTO_TOURNAMENT = !!window.DEV_AUTO_TOURNAMENT;
}

function devLog(...args) {
    if (window.DEV_VERBOSE_LOGS) {
        try { console.log(...args); } catch {}
    }
}
    

// Unified WebFont Loader for all fonts (Google + Embedded)
function loadAllFonts() {
    if (typeof WebFont === 'undefined') {
        console.error('WebFont Loader is required but not loaded. Please include vendor/webfont.js');
        return Promise.reject(new Error('WebFont Loader not available'));
    }
    
    const db = window.fontDatabase || [];
    const googleFonts = db.filter(f => f.source === 'google').map(f => f.name);
    const embeddedFonts = db.filter(f => f.source === 'embedded').map(f => f.name);
    
    console.log(`[DEBUG] Loading fonts via unified WebFont Loader: ${googleFonts.length} Google + ${embeddedFonts.length} embedded`);
    console.log(`[DEBUG] Sample embedded fonts:`, embeddedFonts.slice(0, 5));
    
    return new Promise((resolve) => {
        const startTime = Date.now();
        let loadedCount = 0;
        const totalFonts = googleFonts.length + embeddedFonts.length;
        
        if (totalFonts === 0) {
            devLog('No fonts to load via WebFont Loader');
            resolve();
            return;
        }
        
        const loadedFamilies = new Set();
        window.loadedEmbeddedFonts = window.loadedEmbeddedFonts || new Set();
        
        const config = {
            fontactive: function(familyName, fvd) {
                if (!loadedFamilies.has(familyName)) {
                    loadedFamilies.add(familyName);
                    loadedCount++;
                    window.loadedEmbeddedFonts.add(familyName); // Track loaded fonts
                    devLog(`✓ ${familyName} loaded (${loadedCount}/${totalFonts})`);
                }
            },
            fontinactive: function(familyName, fvd) {
                console.log(`[DEBUG] ✗ ${familyName} failed to load (${fvd}) - check embedded-fonts.css`);
            },
            active: function() {
                const elapsed = Date.now() - startTime;
                devLog(`✓ All fonts loaded after ${elapsed}ms`);
                resolve();
            },
            inactive: function() {
                const elapsed = Date.now() - startTime;
                devLog(`⚠️ Some fonts failed to load after ${elapsed}ms`);
                resolve(); // Continue with partial success
            }
        };
        
        // Add Google Fonts
        if (googleFonts.length > 0) {
            config.google = {
                families: googleFonts.map(name => name + ':400,700')
            };
        }
        
        // Add embedded fonts via pregenerated CSS file
        if (embeddedFonts.length > 0) {
            console.log(`[DEBUG] Loading ${embeddedFonts.length} embedded fonts via embedded-fonts.css`);
            
            // Test if CSS file exists
            fetch('embedded-fonts.css', {method: 'HEAD'}).then(response => {
                console.log(`[DEBUG] embedded-fonts.css status: ${response.status}`);
            }).catch(err => {
                console.error(`[DEBUG] embedded-fonts.css not found:`, err);
            });
            
            // Build FVDs for embedded fonts based on their axes (min/max weights + width variants)
            const embeddedFamilies = embeddedFonts.map(fontName => {
                const fontData = db.find(f => f.name === fontName);
                if (!fontData || !fontData.axes) {
                    // No axes = single variant, no FVD needed
                    return fontName;
                }
                
                const axes = fontData.axes;
                const weights = axes.weights || [400];
                const styles = axes.styles || ['normal'];
                const widths = axes.widths || ['normal'];
                
                // Use only min/max weights for efficiency
                const minWeight = Math.min(...weights);
                const maxWeight = Math.max(...weights);
                const testWeights = minWeight === maxWeight ? [minWeight] : [minWeight, maxWeight];
                
                // Build FVD combinations with width variants
                const fvds = [];
                testWeights.forEach(weight => {
                    styles.forEach(style => {
                        widths.forEach(width => {
                            const styleCode = getStyleCode(style);
                            const weightCode = Math.floor(weight / 100).toString(); // 200->2, 800->8
                            const widthCode = getWidthCode(width);
                            
                            // Only add width code if there are multiple widths
                            const fvd = widths.length > 1 ? styleCode + weightCode + widthCode : styleCode + weightCode;
                            fvds.push(fvd);
                        });
                    });
                });
                
                return fontName + ':' + fvds.join(',');
            });
            
            function getStyleCode(style) {
                switch (style) {
                    case 'italic': return 'i';
                    case 'oblique': return 'o';
                    case 'normal': return 'n';
                    default: return 'n';
                }
            }
            
            function getWidthCode(width) {
                switch (width) {
                    case 'ultra-condensed': return 'a';
                    case 'extra-condensed': return 'b';
                    case 'condensed': return 'c';
                    case 'semi-condensed': return 'd';
                    case 'normal': return 'n';
                    case 'semi-expanded': return 'e';
                    case 'expanded': return 'f';
                    case 'extra-expanded': return 'g';
                    case 'ultra-expanded': return 'h';
                    case 'semi-wide': return 'e'; // Monaspace semi-wide maps to semi-expanded
                    case 'wide': return 'f'; // Monaspace wide maps to expanded
                    default: return 'n';
                }
            }
            
            config.custom = {
                families: embeddedFamilies,
                urls: ['embedded-fonts.css']
            };
            console.log(`[DEBUG] Embedded families with FVDs:`, embeddedFamilies);
            console.log(`[DEBUG] WebFont config.custom:`, config.custom);
        } else {
            console.log(`[DEBUG] No embedded fonts found, skipping custom CSS`);
        }
        
        // 15 second timeout
        setTimeout(() => {
            devLog(`⚠️ Font loading timed out after 15s`);
            resolve();
        }, 15000);
        
        WebFont.load(config);
    });
}

// Generate CSS @font-face declarations for embedded fonts (for unified WebFont Loader)
function generateEmbeddedFontCSS(variants = null) {
    const db = window.fontDatabase || [];
    const embedded = db.filter(f => f.source === 'embedded');
    const css = [];
    
    // Default variants if none specified
    const defaultVariants = [
        { weight: 400, style: 'normal', width: 'normal' },
        { weight: 700, style: 'normal', width: 'normal' },
        { weight: 400, style: 'italic', width: 'normal' }
    ];
    const targetVariants = variants || defaultVariants;
    
    function cleanupPath(p) {
        return p
            .replace(/\/{2,}/g,'/')
            .replace(/--+/g,'-')
            .replace(/-\./g,'.')
            .replace(/\/-/g,'/');
    }
    
    function resolveVariantUrl(entry, weight = 400, style = 'normal', width = 'normal') {
        const vm = entry.variantsMatrix;
        if (!vm || !vm.files || !vm.maps) return null;
        
        const maps = vm.maps || {};
        const m = (axis, v) => (maps[axis] && (maps[axis][String(v)] ?? maps[axis][v])) ?? '';
        
        let weightPart = m('weight', weight);
        const stylePart = m('style', style);  
        const widthPart = m('width', width);
        
        const rules = vm.rules || {};
        if (rules.regularOnlyOnBase && String(weight) === '400') {
            const regName = rules.regularName || weightPart || '';
            if (style !== 'normal' || width !== 'normal') {
                weightPart = '';
            } else {
                weightPart = regName;
            }
        }
        
        const values = {
            '{weight|map}': weightPart,
            '{style|map}': stylePart,
            '{width|map}': widthPart,
            '{suffix|map}': (maps.suffix && (maps.suffix[`${weight}:${style}`] || '')) || ''
        };
        
        function fill(tpl) {
            let out = tpl;
            Object.entries(values).forEach(([k, v]) => { out = out.replaceAll(k, v); });
            if (vm.cleanup) out = cleanupPath(out);
            return out;
        }
        
        const order = [vm.prefer, ...Object.keys(vm.files).filter(k => k !== vm.prefer)];
        for (const fmt of order) {
            const tpl = vm.files[fmt];
            if (!tpl) continue;
            const url = fill(tpl);
            const format = (fmt === 'ttf') ? 'truetype' : (fmt === 'otf') ? 'opentype' : fmt;
            return { url, format };
        }
        return null;
    }
    
    function getFormatFromUrl(url) {
        if (url.includes('.woff2')) return 'woff2';
        if (url.includes('.woff')) return 'woff';
        if (url.includes('.ttf')) return 'truetype';
        return 'opentype';
    }
    
    embedded.forEach(font => {
        // Handle regular fonts with direct properties
        if (font.woff2 || font.ttf || font.otf) {
            const url = font.woff2 || font.ttf || font.otf;
            const format = getFormatFromUrl(url);
            
            // Skip archives and ensure CORS-friendly URLs (same logic as loadCustomFonts)
            if (/\.(zip|tar\.gz)$/i.test(url)) return;
            if (/^https?:\/\//i.test(url)) {
                const allow = (
                    url.startsWith('https://cdn.jsdelivr.net/') ||
                    url.startsWith('https://cdn.jsdelivr.net/gh/') ||
                    url.startsWith('https://kabeech.github.io/') ||
                    url.startsWith('https://dtinth.github.io/') ||
                    url.startsWith('https://raw.githubusercontent.com/') ||
                    url.startsWith('https://objects.githubusercontent.com/')
                );
                if (!allow) return;
            }
            
            css.push(`@font-face {
                font-family: "${font.name}";
                src: url("${/^https?:\/\//i.test(url) ? url : encodeURI(url)}") format("${format}");
                font-weight: 400;
                font-style: normal;
                font-display: swap;
            }`);
        }
        
        // Handle variant fonts with variantsMatrix
        if (font.variantsMatrix && font.variantsMatrix.files) {
            targetVariants.forEach(({ weight, style, width }) => {
                const resolved = resolveVariantUrl(font, weight, style, width);
                if (resolved) {
                    const srcUrl = /^https?:\/\//i.test(resolved.url) ? resolved.url : encodeURI(resolved.url);
                    css.push(`@font-face {
                        font-family: "${font.name}";
                        src: url("${srcUrl}") format("${resolved.format}");
                        font-weight: ${weight};
                        font-style: ${style};
                        font-display: swap;
                    }`);
                }
            });
        }
    });
    
    return css.join('\n');
}

// Generic library wait helper (unifies external lib readiness handling)
function waitForLibrary(name, checkFn, onReady, options = {}) {
    const attempts = options.attempts ?? 10;
    const interval = options.interval ?? 500; // ms
    const onTimeout = options.onTimeout ?? (() => console.warn(`[DEV] ${name} not found after waiting ${(attempts*interval)/1000}s`));
    let tries = 0;
    (function poll() {
        if (checkFn()) {
            try { onReady(); } catch (e) { console.error(`[DEV] ${name} onReady error:`, e); }
        } else if (tries++ < attempts) {
            setTimeout(poll, interval);
        } else {
            onTimeout();
        }
    })();
}

// Load databases from JSON if available; fallback to existing globals
async function loadDatabases() {
    async function fetchJSON(path) {
        const res = await fetch(path, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
        return res.json();
    }
    try {
        const [fonts, schemes, metrics] = await Promise.all([
            fetchJSON('font-database.json'),
            fetchJSON('color-schemes.json'),
            fetchJSON('font-metrics.json').catch(() => null) // Optional file
        ]);
        window.fontDatabase = Array.isArray(fonts) ? fonts : (fonts.fonts || []);
        window.colorSchemeDatabase = schemes || {};
        window.fontMetrics = metrics || {};
        console.log(`[DEBUG] Loaded font metrics for ${Object.keys(window.fontMetrics).length} fonts`);
        
        // Load fonts after database is ready
        await loadAllFonts();
        
        return true;
    } catch (e) {
        devLog('[DEV] JSON databases not found; using JS files if present.', e.message);
        if (!window.fontDatabase || !window.colorSchemeDatabase) {
            throw e;
        }
    }
}

// Font availability detection
const detectedFonts = new Set();
const fontCheckCache = new Map();

// Check if a font is available using FontDetective results
function isFontAvailable(fontName) {
    // Check cache first
    if (fontCheckCache.has(fontName)) {
        return fontCheckCache.get(fontName);
    }
    
    // Check if font is in the detected fonts set
    const isAvailable = detectedFonts.has(fontName);
    
    // Cache the result
    fontCheckCache.set(fontName, isAvailable);
    
    return isAvailable;
}

// Detect font-width support for a given font
function detectFontWidthSupport(fontName) {
    const testString = 'MMMMMMMMMM';
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.visibility = 'hidden';
    container.style.fontSize = '48px';
    container.style.fontFamily = fontName;
    container.style.whiteSpace = 'nowrap';
    container.textContent = testString;
    document.body.appendChild(container);
    
    const widthMap = {};
    const supportedWidths = [];
    
    // First measure normal width
    container.style.fontStretch = 'normal';
    const normalWidth = container.offsetWidth;
    widthMap['normal'] = normalWidth;
    
    // Test each width value except normal
    const testWidths = ['ultra-condensed', 'extra-condensed', 'condensed', 'semi-condensed', 'semi-expanded', 'expanded', 'extra-expanded', 'ultra-expanded'];
    
    for (const width of testWidths) {
        container.style.fontStretch = width;
        const measuredWidth = container.offsetWidth;
        
        // If width differs from normal, this width is supported
        if (measuredWidth !== normalWidth) {
            supportedWidths.push(width);
            widthMap[width] = measuredWidth;
        }
    }
    
    document.body.removeChild(container);
    
    // Always include normal as it's the default
    if (!supportedWidths.includes('normal')) {
        supportedWidths.unshift('normal');
    }
    
    console.log(`Font ${fontName} supports ${supportedWidths.length} width values:`, supportedWidths);
    return supportedWidths;
}

// Detect all available system fonts
function detectSystemFonts() {
    console.log('Detecting installed system fonts...');
    const availableFonts = [];
    // Check system fonts as defined in the external database
    const allFontsToCheck = Array.from(new Set(
        (window.fontDatabase || []).filter(f => f.source === 'system').map(f => f.name)
    ));
    
    allFontsToCheck.forEach(fontName => {
        if (isFontAvailable(fontName)) {
            availableFonts.push(fontName);
            detectedFonts.add(fontName);
            console.log(`✓ ${fontName} is installed`);
        } else {
            console.log(`✗ ${fontName} is not installed`);
        }
    });
    
    // Separate non-embeddable fonts that are locally detected
    const nonEmbeddableFonts = availableFonts.filter(font => {
        return ['MonoLisa', 'Operator Mono', 'Dank Mono', 'Comic Code', 
               'Berkeley Mono', 'PragmataPro', 'Input Mono', 'Aptos Mono',
               'SF Mono', 'Monaco', 'Menlo', 'Consolas'].includes(font);
    });
    
    console.log(`🔍 FONT DETECTION SUMMARY:`);
    console.log(`📊 Total system fonts detected: ${availableFonts.length}`);
    console.log(`💰 Non-embeddable/commercial fonts detected: ${nonEmbeddableFonts.length}`);
    if (nonEmbeddableFonts.length > 0) {
        console.log(`💰 Available commercial fonts:`, nonEmbeddableFonts);
    } else {
        console.log('💰 No commercial/non-embeddable fonts detected locally.');
    }
    
    console.log(`Found ${availableFonts.length} of ${allFontsToCheck.length} checked fonts`);
    return availableFonts;
}

// Filter font families to only include available fonts
function filterFontFamilies() {
    const availableSystemFonts = detectSystemFonts();
    
    // Create a filtered version of fontFamilies
    const filteredFamilies = {};
    
    // Fonts that are loaded via web (non-system) are considered available
    const webFonts = new Set(
        (window.fontDatabase || []).filter(f => f.source !== 'system').map(f => f.name)
    );
    
    Object.entries(fontFamiliesOriginal).forEach(([category, data]) => {
        if (category === 'System Fonts' || category === 'System & Classics') {
            // For system fonts category, only include detected fonts
            const availableFontsInCategory = data.fonts.filter(fontString => {
                // Extract the primary font name from the font string
                const match = fontString.match(/"([^"]+)"/);
                if (match) {
                    const fontName = match[1];
                    return detectedFonts.has(fontName);
                }
                return false;
            });
            
            if (availableFontsInCategory.length > 0) {
                filteredFamilies[category] = {
                    ...data,
                    fonts: availableFontsInCategory,
                    description: `${data.description} (${availableFontsInCategory.length}/${data.fonts.length} available)`
                };
            } else {
                console.log('No system fonts detected - category will be hidden');
            }
        } else {
            // For other categories, check each font
            const availableFontsInCategory = data.fonts.filter(fontString => {
                // Extract the primary font name
                const match = fontString.match(/"([^"]+)"/);
                if (match) {
                    const fontName = match[1];
                    
                    // Check if it's a web font (always available)
                    if (webFonts.has(fontName)) {
                        return true;
                    }
                    
                    // Check if it's locally installed
                    if (detectedFonts.has(fontName)) {
                        return true;
                    }
                    
                    // Font is not available
                    return false;
                }
                // Keep entries without quotes (shouldn't happen)
                return true;
            });
            
            if (availableFontsInCategory.length > 0) {
                filteredFamilies[category] = {
                    ...data,
                    fonts: availableFontsInCategory,
                    description: `${data.description} (${availableFontsInCategory.length}/${data.fonts.length} available)`
                };
            }
        }
    });
    
    console.log(`Categories with fonts: ${Object.keys(filteredFamilies).join(', ')}`);
    return filteredFamilies;
}


// (Removed unused fontFamilyCategories definition)

// Generate grouped categories for the start screen (computed after DB load)
let fontFamiliesOriginal;

function generateFontFamilies() {
    // Normalize legacy DB: map family->category and assign categories
    const families = {};

    // Canonical categories
    const categoryDescriptions = {
        'Sans':    'Monospaced sans-serif faces with clean, contemporary forms.',
        'Serif':   'Monospaced faces with true serifs (e.g., Courier variants).',
        'Slab':    'Monospaced slab serifs with blocky terminals.',
        'Playful': 'Handwriting/comic-inspired monos with expressive forms.',
        'Compact': 'Condensed/narrow metrics for dense code displays.',
        'Retro':   'Retro terminal or pixel-emulation aesthetics.'
    };

    // Heuristic category assignment from legacy names and known fonts
    function inferCategory(font) {
        const n = (font.name || '').toLowerCase();
        const legacy = (font.family || '').toLowerCase();
        // Specific well-known mappings
        if (n.includes('slab')) return 'Slab';
        if (/(courier|courier\s*prime)/.test(n)) return 'Serif';
        if (/(comic|hand|handjet)/.test(n)) return 'Playful';
        if (/(3270|vt323|terminus|tty|pixel)/.test(n)) return 'Retro';
        if (/(iosevka|agave|m\+|m plus|input|condensed|semi\s*condensed)/.test(n)) return 'Compact';
        // Corrections
        if (n.includes('space mono')) return 'Sans';
        // Legacy family hints
        if (/retro|terminal/.test(legacy)) return 'Retro';
        if (/compact|scientific/.test(legacy)) return 'Compact';
        if (/distinctive|playful/.test(legacy)) return 'Playful';
        // Default
        return 'Sans';
    }

    // Representative selection priority: google > embedded > system
    const sourceRank = { google: 2, embedded: 1, system: 0 };

    // Preferred representatives per category (used as fallback only)
    const preferredRepresentatives = {
        'Sans': ['JetBrains Mono', 'Fira Code', 'Source Code Pro', 'IBM Plex Mono'],
        'Serif': ['Courier Prime', 'Courier New'],
        'Slab': ['Iosevka Slab', 'Roboto Slab'],
        'Playful': ['Comic Mono', 'Sometype Mono'],
        'Compact': ['Iosevka', 'Agave'],
        'Retro': ['3270', 'VT323', 'Terminus']
    };

    // Quick lookup for source by name using the database
    const nameToSource = {};
    (window.fontDatabase || []).forEach(f => { nameToSource[f.name] = f.source; });

    (window.fontDatabase || []).forEach(font => {
        if (font.name === 'M+ 1m') return; // exclude non-monospace
        // Normalize category in-place for downstream lookups
        font.category = font.category || inferCategory(font);
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
        if (rank > families[category]._repRank) {
            families[category].representative = cssName;
            families[category]._repRank = rank;
        }
    });

    // Apply preferred representative overrides with web-first bias
    Object.entries(families).forEach(([categoryName, fam]) => {
        const preferred = preferredRepresentatives[categoryName] || [];
        if (preferred.length === 0) return;
        // Extract available font names in this family
        const namesInFamily = fam.fonts.map(s => (s.match(/\"([^\"]+)\"/) || [,''])[1]).filter(Boolean);
        // First try to pick a non-system preferred font for preview reliability
        const webPreferred = preferred.find(n => namesInFamily.includes(n) && nameToSource[n] !== 'system');
        const anyPreferred = webPreferred || preferred.find(n => namesInFamily.includes(n));
        if (anyPreferred) {
            fam.representative = `"${anyPreferred}", "Redacted Script"`;
        }
    });

    // Dynamic selection: maximize distinction between family representatives using fontSimilarity
    try {
        const getName = (cssName) => (cssName.match(/\"([^\"]+)\"/) || [,''])[1] || '';
        const pickOrder = [
            'Sans', 'Serif', 'Slab', 'Compact', 'Retro', 'Playful'
        ].filter(name => families[name]).concat(Object.keys(families).filter(n => !['Sans','Serif','Slab','Compact','Retro','Playful'].includes(n)));

        const selected = {};
        const selectedNames = [];

        // Build candidate lists per category with web-first filtering
        const candidates = {};
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
        function minDissim(name) {
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
        function avgDissimToAll(name) {
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
                    .sort((a, b) => (b.score - a.score) || ((a.source === 'system') - (b.source === 'system')))[0].n;
            } else {
                // Greedy: maximize minimum dissimilarity to already selected
                choice = pool
                    .map(n => ({ n, score: minDissim(n), source: nameToSource[n] }))
                    .sort((a, b) => (b.score - a.score) || ((a.source === 'system') - (b.source === 'system')))[0].n;
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

// This will be populated with filtered fonts after detection
let fontFamilies = {};
let fonts = [];

// Convert flat font database to metadata format for about page generation
let fontMetadata = {};

// Color scheme metadata holder (populated after DB load)
let colorSchemeMetadata = {};

// (obsolete table helpers removed)

// Will be computed after DB load
let googleFontFamilies = [];

const fontSizes = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]; // All integer values from 10 to 20
const fontWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900]; // Full weight range from ultra-light to black
const lineHeights = [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0]; // Complete range from 1.0 to 2.0
const fontWidths = ['ultra-condensed', 'extra-condensed', 'condensed', 'semi-condensed', 'normal', 'semi-expanded', 'expanded', 'extra-expanded', 'ultra-expanded']; // All 9 standard font-width values
const letterSpacings = [-1.0, -0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8, 1.0]; // More granular letter spacing options

// Color schemes are defined in color-schemes.js (colorSchemeDatabase)

// Code sample URLs - loading real code from local files
const codeSampleUrls = {
    javascript: './samples/javascript.js',
    python: './samples/python.py',
    rust: './samples/rust.rs',
    go: './samples/go.go',
    java: './samples/Application.java',
    clojure: './samples/clojure.clj',
    css: './samples/styles.css',
    html: './samples/index.html',
    yaml: './samples/config.yml',
    json: './samples/config.json',
    markdown: './README.md',
    legal: './samples/gdpr.txt',
    powerline: './samples/powerline.txt',
    self: './app.js',
    custom: null // Will be set by user input
};

// Color similarity functions
// (removed duplicate color similarity helper set)

// Color similarity functions
// (removed duplicate color similarity helper set)


const STAGES = [
    {
        id: 'fontFamily',
        name: 'Font Style',
        description: 'Choose the font family that best suits your coding style and visual preferences.',
        skippable: false,
        minComparisons: 1,
        showGrid: false  // No grid for font family selection
    },
    {
        id: 'font',
        name: 'Specific Font',
        description: 'Compare specific fonts within your chosen family to find the perfect variant.',
        skippable: true,
        minComparisons: 4,
        showGrid: true  // Show grid to verify monospace consistency
    },
    {
        id: 'colorScheme',
        name: 'Color Scheme',
        description: 'Selecting the right color scheme for your particular display resolution, distance, lighting conditions and aesthetic preferences can improve scannability and legibility significantly.',
        skippable: true,
        minComparisons: 6,
        useSmartGrouping: true,
        showGrid: true  // Show grid to assess readability with colors
    },
    {
        id: 'roleKeywords',
        name: 'Keywords Font',
        description: 'Customize how language keywords (if, for, function, etc.) appear in your code.',
        skippable: true,
        minComparisons: 1,
        showGrid: true  // Show grid to verify alignment with role fonts
    },
    {
        id: 'roleStrings',
        name: 'Strings Font',
        description: 'Optimize the appearance of string literals and text content in your code.',
        skippable: true,
        minComparisons: 1,
        showGrid: true  // Show grid to verify alignment with role fonts
    },
    {
        id: 'roleComments',
        name: 'Comments Font',
        description: 'Fine-tune how comments appear - often benefits from lighter weight or italic styling.',
        skippable: true,
        minComparisons: 1,
        showGrid: true  // Show grid to verify alignment with role fonts
    },
    {
        id: 'roleFunction',
        name: 'Functions Font',
        description: 'Customize the appearance of function names and method calls.',
        skippable: true,
        minComparisons: 1,
        showGrid: true  // Show grid to verify alignment with role fonts
    },
    {
        id: 'roleGhost',
        name: 'AI Suggestions Font',
        description: 'Configure how AI suggestions and ghost text appear in your editor.',
        skippable: true,
        minComparisons: 1,
        showGrid: true  // Show grid to verify alignment with role fonts
    },
    {
        id: 'size',
        name: 'Font Size',
        description: 'Find the optimal font size for comfortable reading and reduced eye strain.',
        skippable: true,
        minComparisons: 3,
        showGrid: true  // Show grid to assess character spacing
    },
    {
        id: 'weight',
        name: 'Font Weight',
        description: 'Adjust the base font weight for better readability and visual hierarchy.',
        skippable: true,
        minComparisons: 4,
        showGrid: true  // Show grid to assess visual density
    },
    {
        id: 'lineHeight',
        name: 'Line Height',
        description: 'Optimize line spacing for improved code readability and visual flow.',
        skippable: true,
        minComparisons: 4,
        showGrid: true  // Show grid to assess vertical alignment
    },
    {
        id: 'fontWidth',
        name: 'Font Width',
        description: 'Adjust character width for better code density and horizontal space usage.',
        skippable: true,
        minComparisons: 3,
        showGrid: true  // Show grid to assess width consistency
    },
    {
        id: 'letterSpacing',
        name: 'Letter Spacing',
        description: 'Fine-tune character spacing for optimal readability and visual comfort.',
        skippable: true,
        minComparisons: 3,
        showGrid: true  // Show grid to assess character spacing
    }
];

// Helper function to get stage by ID
function getStage(id) {
    return STAGES.find(stage => stage.id === id);
}

// Helper function to get stage index
function getStageIndex(id) {
    return STAGES.findIndex(stage => stage.id === id);
}

// Theme mode state (dark|light). Default to dark until UI toggle changes it.
let themeMode = 'dark';
// Current language selection for code samples
let currentLanguage = 'javascript';

// Multi-font roles state
let multiFontMode = false;
let currentRolesPresetKey = null; // key in window.multiFontPresets
let currentRoleCss = '';
let currentRoleMapping = {}; // resolved role -> css font stack
// Role names are not shown in roles panel; use panel summaries on '?'

// Map selected roles to highlight.js selectors (subset that applies to code preview)
const roleToHLJS = {
    comments: ['.hljs-comment'],
    strings: ['.hljs-string'],
    keywords: ['.hljs-keyword', '.hljs-operator'],
    function: ['.hljs-function', '.hljs-title'],
    // Optional mappings for better coverage
    documentation: ['.hljs-meta', '.hljs-doctag'],
    errors: ['.hljs-error'],
    ghost: ['.ghost-text', '.copilot'], // AI suggestions overlay classes if present
    // We intentionally do not map 'base' to avoid overriding A/B font base per panel.
};

// Short labels for compact display
const roleLabels = {
    comments: 'Cmnt',
    strings: 'Str',
    keywords: 'Keyw',
    documentation: 'Doc',
    errors: 'Err',
    ghost: 'Ghst'
};

function getRoleLabel(role) {
    return roleLabels[role] || role;
}

// Role comparison state
let roleCompare = null; // { role, a, b, candidates: [], index }
let roleTournament = null; // tournament engine per-role

function getRoleCandidates(role) {
    const baseFont = engine && engine.winners && engine.winners.font;
    const baseFontName = baseFont ? baseFont.split(',')[0].replace(/"/g, '') : 'monospace';
    
    console.log(`[DEBUG] getRoleCandidates for role: ${role}, base font: ${baseFontName}`);
    
    const candidates = [
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
    
    // Find width-compatible fonts from database
    const db = window.fontDatabase || [];
    let compatibleCount = 0;
    let rejectedCount = 0;
    let metricsAvailable = !!window.fontMetrics && Object.keys(window.fontMetrics).length > 0;
    
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
        const rec = [];
        if (window.fontSuitabilityMatrix) {
            const key1 = `${role}-excellent`;
            const key2 = `${role}-good`;
            if (Array.isArray(window.fontSuitabilityMatrix[key1])) rec.push(...window.fontSuitabilityMatrix[key1]);
            if (Array.isArray(window.fontSuitabilityMatrix[key2])) rec.push(...window.fontSuitabilityMatrix[key2]);
        }
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

function startRoleCompare(role) {
    const candidates = getRoleCandidates(role);
    if (candidates.length < 2) {
        alert('Not enough font candidates available for this role.');
        return;
    }
    // Initialize simple Swiss-style tournament (2 rounds + finals)
    roleTournament = new RoleTournament(role, candidates);
    nextRoleComparePair();
}

async function nextRoleComparePair() {
    if (!roleTournament) return;
    const pair = roleTournament.nextPair();
    if (!pair) {
        const winner = roleTournament.getWinner();
        if (winner) {
            const preset = (window.multiFontPresets || {})[currentRolesPresetKey] || { fonts: {} };
            const newMapping = { ...(preset.fonts || {}) };
            newMapping[roleTournament.role] = winner;
            applyRoleFonts(newMapping);
            renderRolesSummary(newMapping);
        }
        roleCompareEnd();
        return;
    }
    roleCompare = { role: roleTournament.role, a: pair[0], b: pair[1], candidates: roleTournament.candidates, index: roleTournament.state.roundIndex };
    // Prepare view: slice code for this role and preload faces
    try {
        await setRoleSliceInPanels(roleCompare.role);
    } catch {}
    try {
        await preloadFontsForRolePair(roleCompare.role, roleCompare.a, roleCompare.b);
    } catch {}
    applyRoleCompareStyles(roleCompare.role, roleCompare.a, roleCompare.b);
    const bar = document.getElementById('roleCompareBar');
    bar.classList.add('active');
    const roundText = `Round ${roleTournament.state.roundIndex + 1}/${roleTournament.state.totalRounds}`;
    document.getElementById('roleCompareName').textContent = `${roleCompare.role} • ${roundText}`;
    document.getElementById('roleCompareA').textContent = 'Option A';
    document.getElementById('roleCompareB').textContent = 'Option B';
    if (window.DEV_AUTO_TOURNAMENT) {
        setTimeout(() => roleCompareChoose(Math.random() < 0.5 ? 'A' : 'B'), 500);
    }
}

function roleCompareNext() {
    nextRoleComparePair();
}

function applyRoleCompareStyles(role, aFontName, bFontName) {
    const selectors = roleToHLJS[role] || [];
    const aStack = resolveFontCssStack(aFontName);
    const bStack = resolveFontCssStack(bFontName);
    const scopedA = selectors.map(sel => `#panelA ${sel}`).join(', ');
    const scopedB = selectors.map(sel => `#panelB ${sel}`).join(', ');
    const css = `${scopedA} { font-family: ${aStack}; }\n${scopedB} { font-family: ${bStack}; }`;
    let el = document.getElementById('role-compare-style');
    if (!el) {
        el = document.createElement('style');
        el.id = 'role-compare-style';
        document.head.appendChild(el);
    }
    el.textContent = css;
}

function clearRoleCompareStyles() {
    console.log('[DEBUG] clearRoleCompareStyles called');
    const el = document.getElementById('role-compare-style');
    if (el) el.textContent = '';
    
    // Clear visual role highlighting as well
    const codeA = document.getElementById('codeA');
    const codeB = document.getElementById('codeB');
    if (codeA) clearRoleHighlighting(codeA);
    if (codeB) clearRoleHighlighting(codeB);
}

function roleCompareChoose(choice) {
    if (!roleCompare || !roleTournament) return;
    // Record result in tournament
    if (choice === 'A' || choice === 'B' || choice === 'equal') {
        roleTournament.recordResult(roleCompare.a, roleCompare.b, choice);
    }
    // Proceed
    nextRoleComparePair();
}

function roleCompareEnd() {
    clearRoleCompareStyles();
    const bar = document.getElementById('roleCompareBar');
    if (bar) bar.classList.remove('active');
    roleCompare = null;
    roleTournament = null;
    // Restore full code
    updateCode();
}

function resolveFontCssStack(fontName) {
    // Returns a CSS font-family stack string like '"Fira Code", "Redacted Script"'
    if (!fontName) return '"Redacted Script", monospace';
    const source = (window.fontSourceByName && window.fontSourceByName[fontName]) || 'embedded';
    const isSystem = source === 'system';
    const available = !isSystem || isFontAvailable(fontName);
    if (available) return `"${fontName}", "Redacted Script"`;

    // Try fallback: pick another font from same family that's not system or available
    const byName = (window.fontDatabase || []).find(f => f.name === fontName);
    const family = byName?.family;
    if (family) {
        const alt = (window.fontDatabase || []).find(f => f.family === family && (f.source !== 'system' || isFontAvailable(f.name)));
        if (alt) return `"${alt.name}", "Redacted Script"`;
    }
    // Global fallback: any non-system font
    const anyAlt = (window.fontDatabase || []).find(f => f.source !== 'system');
    if (anyAlt) return `"${anyAlt.name}", "Redacted Script"`;
    return 'monospace';
}

function buildRolesCssFromMapping(mapping, scope = '') {
    // mapping: role -> fontName (string). scope can be '#panelA ' etc, unused for MVP
    let css = '';
    currentRoleMapping = {};
    Object.entries(mapping || {}).forEach(([role, name]) => {
        const selectors = roleToHLJS[role];
        if (!selectors || !selectors.length) return; // skip roles not tied to code tokens
        let fontName = name;
        let weight = undefined;
        let style = undefined;
        if (name && typeof name === 'object') {
            console.log('[DEBUG] Processing role object:', role, name);
            fontName = name.font || '';
            weight = name.weight;
            style = name.style;
        }
        console.log('[DEBUG] Before resolveFontCssStack:', role, 'fontName:', fontName, 'type:', typeof fontName);
        const stack = resolveFontCssStack(fontName);
        console.log('[DEBUG] After resolveFontCssStack:', role, 'stack:', stack);
        currentRoleMapping[role] = { font: fontName, stack, weight, style };
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

function applyRoleFonts(mapping) {
    const styleId = 'role-fonts-style';
    const css = buildRolesCssFromMapping(mapping);
    currentRoleCss = css;
    let el = document.getElementById(styleId);
    if (!el) {
        el = document.createElement('style');
        el.id = styleId;
        document.head.appendChild(el);
    }
    el.textContent = css;
}

function populateRolesPresetUI() {
    const select = document.getElementById('rolesPresetSelect');
    if (!select) return;
    select.innerHTML = '';
    const presets = (window.multiFontPresets || {});
    Object.entries(presets).forEach(([key, val]) => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = val.name || key;
        select.appendChild(opt);
    });
    // Pick a reasonable default
    const firstKey = Object.keys(presets)[0] || null;
    if (firstKey) {
        select.value = firstKey;
        currentRolesPresetKey = firstKey;
    }
}

function renderRolesSummary(mapping) {
    const c = document.getElementById('rolesSummary');
    if (!c) return;
    c.innerHTML = '';
    const roles = Object.keys(roleToHLJS);
    roles.forEach(role => {
        const baseMap = (window.multiFontPresets?.[currentRolesPresetKey]?.fonts) || {};
        const entry = mapping?.[role] || baseMap[role] || null;
        const fontName = (entry && typeof entry === 'object') ? entry.font : entry;
        if (!fontName) return;
        const div = document.createElement('div');
        div.className = 'role-item';
        const stack = resolveFontCssStack(fontName);
        const fallbackHint = stack.includes('Redacted Script') ? ' (fallback)' : '';
        const w = (entry && typeof entry === 'object' && entry.weight) ? `, ${entry.weight}` : '';
        const s = (entry && typeof entry === 'object' && entry.style) ? `, ${entry.style}` : '';
        const title = showRoleNames ? `<strong>${fontName}</strong>${fallbackHint}${w}${s}` : '<em>selected</em>';
        div.innerHTML = `${role}: ${title} <button onclick=\"startRoleCompare('${role}')\">Compare</button> <button onclick=\"openRolePicker('${role}')\">Change</button>`;
        c.appendChild(div);
    });
}

function openRolePicker(role) {
    const c = document.getElementById('rolesSummary');
    if (!c) return;
    // Find this role's div (last rendered)
    const items = Array.from(c.getElementsByClassName('role-item'));
    const target = items.find(el => el.textContent.startsWith(role + ':')) || items[0];
    if (!target) return;
    // Build select
    const sel = document.createElement('select');
    sel.style.marginLeft = '8px';
    const baseMap = (window.multiFontPresets?.[currentRolesPresetKey]?.fonts) || {};
    const current = baseMap[role] || null;
    const opts = getRoleCandidates(role);
    // Ensure current (if not in candidates) appears first
    const unique = Array.from(new Set([current, ...opts].filter(Boolean)));
    unique.forEach(name => {
        const o = document.createElement('option');
        o.value = name; o.textContent = name; if (name === current) o.selected = true; sel.appendChild(o);
    });
    sel.onchange = () => {
        const preset = (window.multiFontPresets || {})[currentRolesPresetKey] || { fonts: {} };
        const newMapping = { ...(preset.fonts || {}) };
        newMapping[role] = sel.value;
        applyRoleFonts(newMapping);
        renderRolesSummary(newMapping);
        sel.remove();
    };
    target.appendChild(sel);
    sel.focus();
}

// UI handlers
function toggleMultiFontMode() {
    const panel = document.getElementById('rolesPanel');
    multiFontMode = !!document.getElementById('multiFontToggle')?.checked;
    if (multiFontMode) {
        panel.classList.remove('hidden');
        // Ensure UI is populated and CSS applied
        populateRolesPresetUI();
        applyRolesPreset();
    } else {
        panel.classList.add('hidden');
        applyRoleFonts({}); // clear styles
    }
}

function applyRolesPreset() {
    const select = document.getElementById('rolesPresetSelect');
    if (!select) return;
    currentRolesPresetKey = select.value;
    const preset = (window.multiFontPresets || {})[currentRolesPresetKey];
    if (!preset) return;
    applyRoleFonts(preset.fonts || {});
    renderRolesSummary(preset.fonts || {});
}

function renderRoleFontsInPanels() {
    const a = document.getElementById('roleFontsA');
    const b = document.getElementById('roleFontsB');
    if (!a || !b) return;
    if (!multiFontMode || !currentRoleMapping || !Object.keys(currentRoleMapping).length) {
        a.textContent = '';
        b.textContent = '';
        return;
    }
    // Build compact inline listing using a stable order
    const roleOrder = Object.keys(roleToHLJS || {});
    const items = [];
            roleOrder.forEach(role => {
                const stack = currentRoleMapping[role];
                if (!stack) return;
                const primary = stack.split(',')[0].replace(/"/g, '').trim();
                if (!primary) return;
                items.push(`${getRoleLabel(role)}: ${primary}`);
            });
    const text = items.join('  •  ');
    a.textContent = text;
    b.textContent = text;
}

// Removed toggleRoleInfo; '?' should not affect roles panel

// Tournament-style comparison generator
class ComparisonEngine {
    constructor() {
        this.fontRound = 0; // Track which round we're in for similarity-based pairing
        this.reset();
    }
    
    reset() {
        this.stage = 'fontFamily';
        this.fontRound = 0; // Reset font round counter
        this.candidates = {
            fontFamily: Object.keys(fontFamilies), // Will show all at once, not tournament
            colorScheme: [...((window.colorSchemeDatabase || {})[themeMode] || [])],
            font: [], // Will be populated after family selection
            size: [...fontSizes],
            weight: [...fontWeights],
            lineHeight: [...lineHeights],
            fontWidth: [], // Will be populated dynamically based on font support
            letterSpacing: [...letterSpacings]
        };
        this.currentPairs = [];
        this.winners = {};
        this.fontFamilySelectionMode = true; // New flag for special handling
        this.stageComparisons = {}; // Track comparisons made per stage
        this.colorSchemeGroups = null; // For similarity-based grouping
        this.preferredColorSchemes = []; // Track user's color preferences
        this.currentRoleTournament = null;
        this.currentRolePair = null;
        this.winners.roles = this.winners.roles || {};
        this.generateNextStage();
    }
    
    generateNextStage() {
        const stageIndex = getStageIndex(this.stage);
        
        devLog(`[DEBUG] generateNextStage: stage=${this.stage}, candidates=${this.candidates[this.stage]?.length}, stageIndex=${stageIndex}`);
        
        // Role stages are handled by the role tournament path in getNextComparison.
        // Avoid touching generic candidates for role* stages (no candidate arrays exist).
        if (this.stage && this.stage.startsWith('role')) {
            this.currentPairs = [];
            return;
        }

        if (stageIndex === -1 || this.candidates[this.stage].length <= 1) {
            if (stageIndex < STAGES.length - 1) {
                this.winners[this.stage] = this.candidates[this.stage][0];
                this.stage = STAGES[stageIndex + 1].id;
                
                // Special handling: when font family is chosen, populate fonts from that family
                if (this.stage === 'font' && this.winners.fontFamily) {
                    // Start from all fonts in the chosen family
                    const allFonts = [...fontFamilies[this.winners.fontFamily].fonts]; // CSS strings
                    // Filter: include all web fonts; include system fonts only if actually installed
                    const filtered = allFonts.filter(cssString => {
                        const m = cssString.match(/"([^\"]+)"/);
                        if (!m) return false;
                        const name = m[1];
                        const source = (window.fontSourceByName && window.fontSourceByName[name]) || 'embedded';
                        // Exclude icon-patched fonts from base font tournament
                        if (window.fontIconsByName && window.fontIconsByName[name]) return false;
                        if (source !== 'system') return true; // embeddable (google/embedded) always allowed
                        return isFontAvailable(name); // system only if detected locally
                    });
                    // Fallback: if everything filtered out (e.g., FontDetective not ready), keep only web fonts
                    this.candidates.font = filtered.length > 0 ? filtered : allFonts.filter(cssString => {
                        const m = cssString.match(/"([^\"]+)"/);
                        if (!m) return false;
                        const name = m[1];
                        const source = (window.fontSourceByName && window.fontSourceByName[name]) || 'embedded';
                        if (window.fontIconsByName && window.fontIconsByName[name]) return false;
                        return source !== 'system';
                    });
                    // Remove embedded fonts that failed to load (broken URLs/CORS)
                    if (Array.isArray(this.candidates.font) && this.candidates.font.length) {
                        const before = this.candidates.font.length;
                        this.candidates.font = this.candidates.font.filter(cssString => {
                            const m = cssString.match(/\"([^\"]+)\"/);
                            if (!m) return false;
                            const name = m[1];
                            const source = (window.fontSourceByName && window.fontSourceByName[name]) || 'embedded';
                            if (source === 'embedded') {
                                return !!(window.loadedEmbeddedFonts && window.loadedEmbeddedFonts.has(name));
                            }
                            return true;
                        });
                        const after = this.candidates.font.length;
                        if (after < before) {
                            devLog(`[DEBUG] Filtered out ${before - after} failed embedded fonts`);
                        }
                    }
                    devLog(`[DEBUG] Populated fonts for family '${this.winners.fontFamily}': ${this.candidates.font.length} candidates`);
                }
                
                this.generateNextStage();
            } else {
                this.winners[this.stage] = this.candidates[this.stage][0];
                this.complete = true;
                // After tournament completes (end of last stage), no-op here
            }
            return;
        }
        
        // For font stage, use similarity-based progressive pairing
        if (this.stage === 'font' && this.candidates.font.length > 4) {
            this.fontRound++;
            devLog(`[DEBUG] Font tournament round ${this.fontRound}`);
            
            // Use similarity-based pairing for fonts
            const smartPairs = fontSimilarity.generateProgressivePairs(
                this.candidates[this.stage], 
                this.fontRound
            );
            
            this.currentPairs = [];
            
            if (smartPairs.length > 0) {
                // Use smart pairs
                for (const [fontA, fontB] of smartPairs) {
                    this.currentPairs.push([fontA, fontB]);
                    devLog(`[DEBUG] Smart pair: ${fontSimilarity.calculate(fontA, fontB).toFixed(1)}% similar`);
                }
            } else {
                // Fallback to random pairing if no smart pairs found
                const items = [...this.candidates[this.stage]];
                while (items.length > 1) {
                    const indexA = Math.floor(Math.random() * items.length);
                    const itemA = items.splice(indexA, 1)[0];
                    const indexB = Math.floor(Math.random() * items.length);
                    const itemB = items.splice(indexB, 1)[0];
                    this.currentPairs.push([itemA, itemB]);
                }
                
                // If odd number, the remaining item advances
                if (items.length === 1) {
                    this.currentPairs.push([items[0], null]);
                }
            }
            
            // Mark that we should stop after this round if we have few candidates left
            this.fontRoundComplete = this.candidates.font.length <= 6;
        } else {
            this.currentPairs = [];
            const items = [...this.candidates[this.stage]];
            
            // Create pairs for comparison
            while (items.length > 1) {
                const indexA = Math.floor(Math.random() * items.length);
                const itemA = items.splice(indexA, 1)[0];
                const indexB = Math.floor(Math.random() * items.length);
                const itemB = items.splice(indexB, 1)[0];
                this.currentPairs.push([itemA, itemB]);
            }
            
            // If odd number, the remaining item advances automatically
            if (items.length === 1) {
                this.currentPairs.push([items[0], null]);
            }
        }
    }
    
    getNextComparison() {
        console.log(`[DEBUG] getNextComparison: stage=${this.stage}, complete=${this.complete}, currentPairs=${this.currentPairs.length}`);
        
        if (this.complete) {
            return null;
        }
        
        // Special handling for font family selection - show all at once instead of comparisons
        if (this.stage === 'fontFamily' && this.fontFamilySelectionMode) {
            return { showFontFamilySelector: true };
        }

        // Helper: default scheme by theme
        function getDefaultScheme(mode) {
            const list = (window.colorSchemeDatabase && window.colorSchemeDatabase[mode]) || [];
            const want = mode === 'dark' ? 'Monokai' : 'Catppuccin Latte';
            return list.find(s => s.name === want) || list[0] || null;
        }

        // Role stages integration (handle before generic pairing/round logic)
        const isRoleStage = this.stage && this.stage.startsWith('role');
        const stageToRole = (st) => ({
            roleKeywords: 'keywords', roleStrings: 'strings', roleComments: 'comments', roleFunction: 'function', roleGhost: 'ghost'
        })[st];
        if (isRoleStage) {
            const roleKey = stageToRole(this.stage);
            if (!this.currentRoleTournament || this._roleKey !== roleKey) {
                const cands = getRoleCandidates(roleKey).slice(0, 8);
                this.currentRoleTournament = new RoleTournament(roleKey, cands);
                this._roleKey = roleKey;
            }
            const pair = this.currentRoleTournament.nextPair();
            if (!pair) {
                // Commit winner and advance
                const winner = this.currentRoleTournament.getWinner();
                if (winner) {
                    this.winners.roles[roleKey] = winner;
                    try { applyRoleFonts(this.winners.roles); } catch {}
                }
                this.currentRoleTournament = null;
                // Advance stage
                const idx = getStageIndex(this.stage);
                if (idx >= 0 && idx < STAGES.length - 1) {
                    this.stage = STAGES[idx + 1].id;
                    this.generateNextStage();
                    return this.getNextComparison();
                }
                this.complete = true;
                return null;
            }
            this.currentRolePair = pair;
            const baseOption = {
                font: this.winners.font || (this.winners.fontFamily ? fontFamilies[this.winners.fontFamily].representative : fonts[0]),
                fontSize: this.winners.size || 16,
                fontWeight: this.winners.weight || 400,
                lineHeight: this.winners.lineHeight || 1.5,
                fontWidth: this.winners.fontWidth || 'normal',
                letterSpacing: this.winners.letterSpacing || 0,
                colorScheme: this.winners.colorScheme || getDefaultScheme(themeMode)
            };
            const optionA = { ...baseOption };
            const optionB = { ...baseOption };
            // Apply candidate settings to options
            const candA = pair[0];
            const candB = pair[1];
            
            if (candA && typeof candA === 'object') {
                try { optionA.font = resolveFontCssStack(candA.font); } catch { optionA.font = `"${candA.font}", "Redacted Script"`; }
                optionA.fontWeight = candA.weight || optionA.fontWeight;
                optionA.fontStyle = candA.style || 'normal';
            }
            
            if (candB && typeof candB === 'object') {
                try { optionB.font = resolveFontCssStack(candB.font); } catch { optionB.font = `"${candB.font}", "Redacted Script"`; }
                optionB.fontWeight = candB.weight || optionB.fontWeight;
                optionB.fontStyle = candB.style || 'normal';
            }
            
            return { 
                optionA, 
                optionB, 
                stage: this.stage, 
                roleTest: { 
                    role: roleKey, 
                    aFont: candA?.font || candA, 
                    bFont: candB?.font || candB,
                    aCandidate: candA,
                    bCandidate: candB
                } 
            };
        }
        
        if (this.currentPairs.length === 0) {
            // Round is complete, check what to do next
            if (this.nextRound && this.nextRound.length > 0) {
                console.log(`[DEBUG] Round complete: nextRound=${this.nextRound.length} candidates`);
                
                // Check if we have a winner AND have made minimum comparisons
                const minComparisons = getStage(this.stage)?.minComparisons || 2;
                const comparisons = this.stageComparisons[this.stage] || 0;
                const hasWinner = this.nextRound.length <= 1;
                const hasMinComparisons = comparisons >= minComparisons;
                
                // Get winner name for debug logging
                let winnerName = 'none';
                if (hasWinner && this.nextRound.length > 0) {
                    const winner = this.nextRound[0];
                    if (this.stage === 'colorScheme' && winner && winner.name) {
                        winnerName = winner.name;
                    } else if (this.stage === 'fontFamily') {
                        winnerName = winner;
                    } else if (typeof winner === 'string') {
                        winnerName = winner.replace(/"/g, '').split(',')[0];
                    } else if (winner && winner.font) {
                        winnerName = winner.font;
                    } else {
                        winnerName = String(winner);
                    }
                }
                
                console.log(`[DEBUG] Stage completion check: ${this.stage}, winner=${hasWinner ? winnerName : 'none'}, comparisons=${comparisons}/${minComparisons}, canAdvance=${hasWinner && hasMinComparisons}`);
                
                // If we have a winner AND have made minimum comparisons, move to next stage
                if (hasWinner && hasMinComparisons) {
                    const stageIndex = getStageIndex(this.stage);
                    
                    if (stageIndex < STAGES.length - 1) {
                        this.winners[this.stage] = this.nextRound[0];
                        this.stage = STAGES[stageIndex + 1].id;
                        
                        // Special handling: when font family is chosen, populate fonts from that family
                        if (this.stage === 'font' && this.winners.fontFamily) {
                            this.candidates.font = [...fontFamilies[this.winners.fontFamily].fonts];
                        }
                        
                        this.nextRound = null; // Reset for next stage
                        this.generateNextStage();
                        return this.getNextComparison();
                    } else {
                        this.winners[this.stage] = this.nextRound[0];
                        
                        // If in recompare mode, restore other settings and complete
                        if (this.recompareMode) {
                            Object.assign(this.winners, this.recompareResults);
                            this.winners[this.recompareStage] = this.nextRound[0];
                            this.recompareMode = false;
                        }
                        
                        this.complete = true;
                        return null;
                    }
                } else if (!hasMinComparisons) {
                    // Haven't made minimum comparisons yet - continue with more rounds
                    console.log(`[DEBUG] Need more comparisons in ${this.stage}: ${comparisons}/${minComparisons}`);
                    
                    // For color schemes, use smart similarity-based selection
                    if (this.stage === 'colorScheme' && getStage(this.stage)?.useSmartGrouping && this.preferredColorSchemes.length > 0) {
                        this.candidates[this.stage] = this.getSimilarColorSchemes();
                        console.log(`[DEBUG] Selected similar color schemes: ${this.candidates[this.stage].length} candidates`);
                    } else {
                        // Continue tournament with winners from this round
                        this.candidates[this.stage] = [...this.nextRound];
                    }
                    
                    this.nextRound = [];
                    this.generateNextStage();
                    return this.getNextComparison();
                } else {
                    // Continue tournament with winners from this round
                    this.candidates[this.stage] = [...this.nextRound];
                    this.nextRound = [];
                    this.generateNextStage();
                    return this.getNextComparison();
                }
            } else {
                // No nextRound yet, handle normally (shouldn't happen with new logic)
                this.generateNextStage();
                return this.getNextComparison();
            }
        }
        
        const pair = this.currentPairs[0];
        console.log(`[DEBUG] Getting pair: ${JSON.stringify(pair)}`);
        if (!pair) {
            console.error('[ERROR] No pair found despite currentPairs.length > 0');
            console.error('[ERROR] currentPairs:', this.currentPairs);
            return null;
        }
        if (pair[1] === null) {
            // Auto-advance
            this.candidates[this.stage] = [pair[0], ...this.candidates[this.stage]];
            this.currentPairs.shift();
            return this.getNextComparison();
        }

        // Build comparison options
        const baseOption = {
            font: this.winners.font || (this.winners.fontFamily ? fontFamilies[this.winners.fontFamily].representative : fonts[0]),
            fontSize: this.winners.size || 16,
            fontWeight: this.winners.weight || 400,
            lineHeight: this.winners.lineHeight || 1.5,
            fontWidth: this.winners.fontWidth || 'normal',
            letterSpacing: this.winners.letterSpacing || 0,
            colorScheme: this.winners.colorScheme || getDefaultScheme(themeMode)
        };
        
        const optionA = { ...baseOption };
        const optionB = { ...baseOption };
        
        switch (this.stage) {
            case 'colorScheme':
                optionA.colorScheme = pair[0];
                optionB.colorScheme = pair[1];
                break;
            case 'font':
                optionA.font = pair[0];
                optionB.font = pair[1];
                break;
            case 'size':
                optionA.fontSize = pair[0];
                optionB.fontSize = pair[1];
                break;
            case 'weight':
                optionA.fontWeight = pair[0];
                optionB.fontWeight = pair[1];
                break;
            case 'lineHeight':
                optionA.lineHeight = pair[0];
                optionB.lineHeight = pair[1];
                break;
            case 'fontWidth':
                optionA.fontWidth = pair[0];
                optionB.fontWidth = pair[1];
                break;
            case 'letterSpacing':
                optionA.letterSpacing = pair[0];
                optionB.letterSpacing = pair[1];
                break;
        }
        
        // Check if the two options are actually identical
        if (this.areOptionsIdentical(optionA, optionB)) {
            // Skip this comparison - randomly pick one and continue
            this.candidates[this.stage].push(Math.random() > 0.5 ? pair[0] : pair[1]);
            this.currentPairs.shift();
            return this.getNextComparison();
        }
        
        // Add similarity information for font comparisons
        let similarityInfo = null;
        if (this.stage === 'font') {
            const similarity = fontSimilarity.calculate(pair[0], pair[1]);
            const category = fontSimilarity.categorize(similarity);
            similarityInfo = {
                score: similarity,
                category: category,
                round: this.fontRound
            };
        }
        
        const result = { optionA, optionB, stage: this.stage, pair, similarity: similarityInfo };
        console.log(`[DEBUG] Returning comparison:`, result);
        return result;
    }
    
    // Helper method to check if two options are visually identical
    areOptionsIdentical(optionA, optionB) {
        return optionA.font === optionB.font &&
               optionA.fontSize === optionB.fontSize &&
               optionA.fontWeight === optionB.fontWeight &&
               optionA.lineHeight === optionB.lineHeight &&
               optionA.fontWidth === optionB.fontWidth &&
               optionA.letterSpacing === optionB.letterSpacing &&
               JSON.stringify(optionA.colorScheme) === JSON.stringify(optionB.colorScheme);
    }
    
    // New method to handle font family selection
    selectFontFamily(familyName) {
        this.winners.fontFamily = familyName;
        this.fontFamilySelectionMode = false;
        this.candidates.font = [...fontFamilies[familyName].fonts];
        this.stage = 'font';
        this.generateNextStage();
    }
    
    submitChoice(choice) {
        // Handle role stages
        if (this.stage && this.stage.startsWith('role')) {
            if (this.currentRoleTournament && this.currentRolePair) {
                const [a, b] = this.currentRolePair;
                this.currentRoleTournament.recordResult(a, b, choice === 'equal' ? 'equal' : (choice === 'A' ? 'A' : 'B'));
                // Clear pair; next call to getNextComparison will fetch next
                this.currentRolePair = null;
            }
            return;
        }
        if (this.currentPairs.length === 0) return;
        
        const pair = this.currentPairs.shift();
        console.log(`[DEBUG] submitChoice: stage=${this.stage}, choice=${choice}, remaining pairs=${this.currentPairs.length}, candidates=${this.candidates[this.stage].length}`);
        
        // Track comparisons made in this stage
        this.stageComparisons[this.stage] = (this.stageComparisons[this.stage] || 0) + 1;
        
        // Initialize nextRound array if it doesn't exist
        if (!this.nextRound) {
            this.nextRound = [];
        }
        
        let winner;
        // Add winner to next round, not back to current candidates
        if (choice === 'A') {
            winner = pair[0];
            this.nextRound.push(pair[0]);
        } else if (choice === 'B') {
            winner = pair[1];
            this.nextRound.push(pair[1]);
        } else {
            // Equal preference - randomly advance one
            winner = Math.random() > 0.5 ? pair[0] : pair[1];
            this.nextRound.push(winner);
        }
        
        // For color schemes, track user preferences for similarity-based learning
        if (this.stage === 'colorScheme' && choice !== 'equal') {
            this.preferredColorSchemes.push(winner);
            console.log(`[DEBUG] Color preference learned: ${winner.name}`);
        }
        
        console.log(`[DEBUG] After choice: nextRound=${this.nextRound.length}, remaining pairs=${this.currentPairs.length}, stage comparisons=${this.stageComparisons[this.stage]}`);
    }
    
    getSimilarColorSchemes() {
        // Find schemes similar to user's preferred ones
        const allSchemes = [...((window.colorSchemeDatabase || {})[themeMode] || [])];
        const similarSchemes = new Set();
        
        // Add schemes similar to each preferred scheme
        for (const preferred of this.preferredColorSchemes) {
            for (const scheme of allSchemes) {
                if (scheme === preferred) continue;
                
                const distance = schemeDistance(preferred, scheme);
                if (distance < 100) { // Similarity threshold
                    similarSchemes.add(scheme);
                }
            }
        }
        
        // Convert to array and add some random ones to maintain variety
        let result = [...similarSchemes];
        const remaining = allSchemes.filter(s => !similarSchemes.has(s) && !this.preferredColorSchemes.includes(s));
        
        // Add 2-3 random different schemes to maintain diversity
        while (result.length < 8 && remaining.length > 0) {
            const randomIndex = Math.floor(Math.random() * remaining.length);
            result.push(remaining.splice(randomIndex, 1)[0]);
        }
        
        return result.slice(0, 8); // Limit to reasonable number
    }
    
    getProgress() {
        const stageIndex = getStageIndex(this.stage);
        const totalStages = STAGES.length;
        const baseProgress = (stageIndex / totalStages) * 100;
        
        // Add within-stage progress
        const candidateCount = this.candidates[this.stage] ? this.candidates[this.stage].length : 0;
        const stageItems = candidateCount + this.currentPairs.length;
        const stageProgress = stageItems > 0 ? 
            (1 - (this.currentPairs.length / stageItems)) * (100 / totalStages) : 0;
        
        return Math.min(baseProgress + stageProgress, 95);
    }
}

// Initialize the app
function init() {
    // Load databases first (JSON preferred), then continue
    loadDatabases().then(() => {
        fontFamiliesOriginal = generateFontFamilies();
        fontFamilies = fontFamiliesOriginal;
        googleFontFamilies = Array.from(new Set(
            (window.fontDatabase || [])
                .filter(f => f.source === 'google')
                .map(f => f.name.replace(/\s+/g, '+'))
        ));
        // Build metadata and ID maps for about pages from DB
        fontMetadata = {};
        window.fontSourceByName = {};
        (window.fontDatabase || []).forEach(font => {
            fontMetadata[font.name] = {
                source: font.source,
                ligatures: font.ligatures,
                description: font.description
            };
            window.fontSourceByName[font.name] = font.source;
        });
        colorSchemeMetadata = window.colorSchemeDatabase || {};
        buildIdMaps();
        buildRoleMaps();
        // Build quick lookup for font sources by name
        window.fontSourceByName = {};
        (window.fontDatabase || []).forEach(f => { window.fontSourceByName[f.name] = f.source; });
        // Build quick lookup for font sources and families by name
        window.fontSourceByName = {};
        window.fontCategoryByName = {};
        (window.fontDatabase || []).forEach(f => { 
            window.fontSourceByName[f.name] = f.source; 
            // Normalize final category for lookups
            f.category = f.category || f.family || null;
            window.fontCategoryByName[f.name] = f.category;
        });
        buildIdMaps();
        buildRoleMaps();
        engine = new ComparisonEngine();
        loadFonts();
        updateCode();
        showStartScreen();
    }).catch(err => {
        console.warn('[DEV] Failed to load JSON databases, attempting fallback globals:', err);
        fontFamiliesOriginal = generateFontFamilies();
        fontFamilies = fontFamiliesOriginal;
        googleFontFamilies = Array.from(new Set(
            (window.fontDatabase || [])
                .filter(f => f.source === 'google')
                .map(f => f.name.replace(/\s+/g, '+'))
        ));
        fontMetadata = {};
        (window.fontDatabase || []).forEach(font => {
            fontMetadata[font.name] = {
                source: font.source,
                ligatures: font.ligatures,
                description: font.description
            };
        });
        colorSchemeMetadata = window.colorSchemeDatabase || {};
        buildIdMaps();
        // Build quick lookup for font sources and families by name
        window.fontSourceByName = {};
        window.fontCategoryByName = {};
        (window.fontDatabase || []).forEach(f => { 
            window.fontSourceByName[f.name] = f.source; 
            f.category = f.category || f.family || null;
            window.fontCategoryByName[f.name] = f.category;
        });
        engine = new ComparisonEngine();
        buildIdMaps();
        loadFonts();
        updateCode();
        showStartScreen();
    });
    // Warn if highlight.js not present
    if (!(window.hljs && typeof hljs.highlightElement === 'function')) {
        console.warn('[DEV] highlight.js not detected. Place vendor/highlight.min.js to enable syntax highlighting.');
    }
    // Unify external library readiness handling
    waitForLibrary(
        'FontDetective',
        () => typeof FontDetective !== 'undefined',
        () => {
            try {
                FontDetective.all((detectedFontObjects) => {
                    if (!window.fontDatabase || !fontFamiliesOriginal) {
                        // DB not ready yet; skip filtering until it is
                        return;
                    }
                    detectedFonts.clear();
                    detectedFontObjects.forEach(fontObj => detectedFonts.add(fontObj.name));
                    const filteredFamilies = filterFontFamilies();
                    fontFamilies = filteredFamilies;
                    fonts = Object.values(fontFamilies).flatMap(family => family.fonts);
                    console.log(`Font detection complete: ${fonts.length} fonts available`);
                    // If the font family selector is visible, re-render it with available fonts
                    const selector = document.getElementById('fontFamilySelector');
                    if (selector && !selector.classList.contains('hidden')) {
                        showFontFamilySelector(true);
                    }
                });
            } catch (e) {
                console.error('FontDetective error:', e);
            }
        },
        { attempts: 10, interval: 500, onTimeout: () => console.warn('[DEV] FontDetective not detected; proceeding without system font filtering.') }
    );
    // Note: loadFonts, updateCode, and showStartScreen are called after DB load above
    
    // Give critical fonts time to load before allowing start
    // (No need for extra Start Fresh button - Start Over handles this)
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'a' || e.key === 'A') {
            selectOption('A');
        } else if (e.key === 'd' || e.key === 'D') {
            selectOption('B');
        } else if (e.key === 's' || e.key === 'S') {
            selectOption('equal');
        }
    });
}

// Load all fonts - dynamically loads Google Fonts and custom fonts
function loadFonts() {
    // Use unified WebFont Loader for all fonts
    loadAllFonts().then(() => {
        devLog('All fonts loaded via unified WebFont Loader');
    }).catch(err => {
        console.error('Font loading failed:', err);
    });
    
    // Use original font families initially (before detection) 
    fontFamilies = fontFamiliesOriginal;
    fonts = Object.values(fontFamilies).flatMap(family => family.fonts);
    
    console.log(`Using all fonts: ${fonts.length} fonts from database`);
    
    // Load Material Icons for potential UI enhancements
    const iconsLink = document.createElement('link');
    iconsLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    iconsLink.rel = 'stylesheet';
    document.head.appendChild(iconsLink);
}

// Ensure critical fallback fonts for About samples are present
function injectCriticalAboutFonts() {
    try {
        if (document.getElementById('gf-redacted-style')) return;
        const link = document.createElement('link');
        link.id = 'gf-redacted-style';
        link.href = 'https://fonts.googleapis.com/css2?family=Redacted+Script:wght@400&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    } catch {}
}

// Declare engine reference and global comparison log
let engine;
let comparisons = [];
let currentComparison = 0;

// Cache for loaded code
const codeCache = new Map();

// Load code from URL or cache
async function loadCode(language) {
    // Check cache first
    if (codeCache.has(language)) {
        return codeCache.get(language);
    }
    
    const url = codeSampleUrls[language];
    
    // For file:// protocol or missing URLs, use fallback to avoid CORS issues
    if (!url || window.location.protocol === 'file:') {
        const fallback = (window.textSamples && window.textSamples.buildLoadFallback)
            ? window.textSamples.buildLoadFallback(language)
            : `// ${String(language || 'Code').toUpperCase()} code sample\n// Please use a web server to load actual code samples\nconsole.log('Code Phoropter - Font Testing Application');`;
        codeCache.set(language, fallback);
        return fallback;
    }
    
    try {
        console.log(`Loading code from: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const code = await response.text();
        
        // Truncate very long files by characters (legacy behavior)
        const maxLength = 2000;
        const truncatedCode = code.length > maxLength ? 
            code.substring(0, maxLength) + '\n\n// ... (truncated for display)' : 
            code;
            
        codeCache.set(language, truncatedCode);
        return truncatedCode;
        
    } catch (error) {
        console.warn(`Failed to load code from ${url}:`, error);
        
        // Fallback to simple sample (from text-samples.js)
        const fallback = (window.textSamples && window.textSamples.buildErrorFallback)
            ? window.textSamples.buildErrorFallback(language)
            : `// ${String(language || 'Code').toUpperCase()} code sample (failed to load)\n// Please check that sample files exist\nconsole.log('Code Phoropter - Font Testing Application');`;
        codeCache.set(language, fallback);
        return fallback;
    }
}

// Monospace grid visualization
function createGridOverlay(panelId, font, fontSize) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    
    // Remove existing grid overlay
    const existingOverlay = panel.querySelector('.grid-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    // Create grid overlay
    const overlay = document.createElement('div');
    overlay.className = 'grid-overlay';
    
    const gridLines = document.createElement('div');
    gridLines.className = 'grid-lines';
    gridLines.style.fontFamily = font;
    gridLines.style.fontSize = fontSize + 'px';
    
    // Generate grid pattern - vertical lines every 8 characters
    const gridPattern = '       |'; // 7 spaces + pipe character = 8 char width
    const lines = [];
    
    // Generate enough lines to fill the panel height
    for (let i = 0; i < 30; i++) { // 30 lines should be more than enough
        let line = '';
        // Generate enough repetitions to fill the panel width 
        for (let j = 0; j < 20; j++) { // 20 * 8 = 160 characters wide
            line += gridPattern;
        }
        lines.push(line);
    }
    
    gridLines.textContent = lines.join('\n');
    overlay.appendChild(gridLines);
    
    // Insert as first child so it appears behind content
    panel.insertBefore(overlay, panel.firstChild);
}

// Grid toggle state
let gridVisible = false;

function updateGridOverlays(optionA, optionB, forceVisible = null) {
    const shouldShowGrid = forceVisible !== null ? forceVisible : gridVisible;
    
    if (shouldShowGrid && optionA && optionB) {
        // Use the base font for grid reference
        const baseFont = engine.winners?.font || (engine.winners?.fontFamily ? fontFamilies[engine.winners.fontFamily].representative : fonts[0]);
        const baseFontSize = optionA.fontSize || 16;
        
        console.log(`[DEBUG] Showing grid overlays with base font: ${baseFont} at ${baseFontSize}px`);
        createGridOverlay('panelA', baseFont, baseFontSize);
        createGridOverlay('panelB', baseFont, baseFontSize);
    } else {
        // Remove grid overlays
        console.log(`[DEBUG] Hiding grid overlays`);
        ['panelA', 'panelB'].forEach(panelId => {
            const panel = document.getElementById(panelId);
            const overlay = panel?.querySelector('.grid-overlay');
            if (overlay) {
                overlay.remove();
            }
        });
    }
}

function initializeGridForStage(stage) {
    const stageObj = getStage(stage);
    if (stageObj && typeof stageObj.showGrid === 'boolean') {
        gridVisible = stageObj.showGrid;
        console.log(`[DEBUG] Initialized grid for stage '${stage}': ${gridVisible ? 'ON' : 'OFF'} (default from stage config)`);
    }
}

function toggleGrid() {
    gridVisible = !gridVisible;
    console.log(`[DEBUG] Grid toggle: ${gridVisible ? 'ON' : 'OFF'}`);
    
    // Get current comparison options
    const comparison = engine.getNextComparison();
    if (comparison && comparison.optionA && comparison.optionB) {
        updateGridOverlays(comparison.optionA, comparison.optionB, gridVisible);
    }
    
    // Show temporary feedback
    const status = document.getElementById('status');
    const originalText = status.textContent;
    status.textContent = `Grid overlay: ${gridVisible ? 'ON' : 'OFF'} (press 'g' to toggle)`;
    setTimeout(() => {
        status.textContent = originalText;
    }, 2000);
}

// Update code display with async loading
async function updateCode() {
    const codeA = document.getElementById('codeA');
    const codeB = document.getElementById('codeB');
    
    // Failsafe: Clear any stuck role highlighting
    console.log('[DEBUG] updateCode: Clearing any stuck role highlighting');
    if (codeA) clearRoleHighlighting(codeA);
    if (codeB) clearRoleHighlighting(codeB);
    
    // Show loading state
    codeA.textContent = 'Loading code...';
    codeB.textContent = 'Loading code...';
    
    try {
        const code = await loadCode(currentLanguage);
        
        const lang = mapLanguageForHLJS(currentLanguage);
        setCodeWithHighlight(codeA, code, lang);
        setCodeWithHighlight(codeB, code, lang);
    } catch (error) {
        console.error('Failed to update code:', error);
        codeA.textContent = 'Failed to load code';
        codeB.textContent = 'Failed to load code';
    }
}

// Basic syntax highlighting
// Removed built-in syntax highlighter; using highlight.js instead

function mapLanguageForHLJS(language) {
    switch (language) {
        case 'javascript': return 'javascript';
        case 'python': return 'python';
        case 'rust': return 'rust';
        case 'go': return 'go';
        case 'java': return 'java';
        case 'clojure': return 'clojure';
        case 'css': return 'css';
        case 'html': return 'xml';
        case 'json': return 'json';
        case 'yaml': return 'yaml';
        case 'markdown': return 'markdown';
        case 'legal':
        case 'powerline':
        case 'custom':
        default: return 'plaintext';
    }
}

function setCodeWithHighlight(el, code, lang) {
    el.className = '';
    el.classList.add('hljs');
    if (lang && lang !== 'plaintext') {
        el.classList.add(`language-${lang}`);
    }
    // Reset any prior highlight.js state before re-highlighting
    el.removeAttribute('data-highlighted');
    el.textContent = code;
    if (window.hljs && typeof hljs.highlightElement === 'function') {
        try { hljs.highlightElement(el); } catch {}
    }
    // Process ghost markers after highlighting, to wrap DOM safely
    try { processGhostMarkers(el); } catch (e) { devLog('Ghost processing failed', e); }
}

// Wrap ghost sections and caret markers in code blocks
function processGhostMarkers(codeEl) {
    if (!codeEl || !codeEl.textContent) return;
    const MARK_BEGIN = '<<ghost:begin>>';
    const MARK_END = '<<ghost:end>>';
    const MARK_CARET = '<<ghost:caret>>';
    // Quick check
    const fullText = codeEl.textContent;
    if (!fullText.includes(MARK_BEGIN) && !fullText.includes(MARK_CARET)) return;

    const walker = document.createTreeWalker(codeEl, NodeFilter.SHOW_TEXT, null);
    let node;
    let startBoundary = null; // {node, offset}
    function splitTextNode(n, index) {
        if (index <= 0) return n;
        if (index >= n.nodeValue.length) return n;
        return n.splitText(index);
    }
    function removeMarkerAt(n, index, marker) {
        const val = n.nodeValue;
        n.nodeValue = val.slice(0, index) + val.slice(index + marker.length);
    }
    function insertCaret(n, index) {
        const after = splitTextNode(n, index);
        const caret = document.createElement('span');
        caret.className = 'ghost-caret';
        caret.setAttribute('role', 'img');
        caret.setAttribute('aria-label', 'Cursor');
        after.parentNode.insertBefore(caret, after);
    }
    while ((node = walker.nextNode())) {
        let i = 0;
        // Loop to handle multiple markers in the same text node
        while (node) {
            const text = node.nodeValue || '';
            const nextBegin = text.indexOf(MARK_BEGIN, i);
            const nextEnd = text.indexOf(MARK_END, i);
            const nextCaret = text.indexOf(MARK_CARET, i);
            const minIdx = [nextBegin, nextEnd, nextCaret]
                .filter(idx => idx !== -1)
                .sort((a,b) => a - b)[0];
            if (minIdx === undefined) break;
            // Ensure we operate on current node after potential split
            if (minIdx > 0) {
                node = splitTextNode(node, minIdx);
                i = 0;
                continue;
            }
            // Marker at start of node text
            if (nextBegin === 0) {
                removeMarkerAt(node, 0, MARK_BEGIN);
                startBoundary = { node, offset: 0 };
                i = 0;
                continue;
            }
            if (nextEnd === 0 && startBoundary) {
                // Remove end marker then wrap range
                removeMarkerAt(node, 0, MARK_END);
                const range = document.createRange();
                range.setStart(startBoundary.node, startBoundary.offset);
                range.setEnd(node, 0);
                const span = document.createElement('span');
                span.className = 'ghost-text';
                span.setAttribute('aria-label', 'Ghost suggestion');
                try { range.surroundContents(span); } catch (e) {
                    // Fallback: wrap by cloning contents
                    const contents = range.extractContents();
                    span.appendChild(contents);
                    range.insertNode(span);
                }
                // Strip syntax highlighting classes from ghost text
                stripSyntaxHighlighting(span);
                startBoundary = null;
                i = 0;
                continue;
            }
            if (nextCaret === 0) {
                removeMarkerAt(node, 0, MARK_CARET);
                insertCaret(node, 0);
                i = 0;
                continue;
            }
            // Safety break
            break;
        }
    }
}

// Simple per-role tournament engine
class RoleTournament {
    constructor(role, candidates) {
        this.role = role;
        // Cap and dedupe candidates for speed
        const unique = Array.from(new Set(candidates)).slice(0, 8);
        this.candidates = unique;
        this.scores = Object.fromEntries(unique.map(n => [n, 0]));
        this.state = { phase: 'swiss', roundIndex: 0, totalRounds: Math.min(3, Math.max(2, Math.ceil(unique.length / 2))), finals: null };
        this.pairs = [];
        this._buildSwissPairs();
    }
    _shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
    _buildSwissPairs() {
        const order = this._shuffle(this.candidates);
        this.pairs = [];
        for (let i = 0; i < order.length - 1; i += 2) {
            this.pairs.push([order[i], order[i+1]]);
        }
        if (order.length % 2 === 1) {
            // Bye: last one gets 0.5
            const bye = order[order.length - 1];
            this.scores[bye] += 0.5;
        }
    }
    nextPair() {
        if (this.state.phase === 'finals') {
            const { a, b, aWins, bWins } = this.state.finals;
            if (aWins >= 2 || bWins >= 2) return null;
            return [a, b];
        }
        if (this.pairs.length === 0) {
            // Round complete
            this.state.roundIndex++;
            if (this.state.roundIndex >= this.state.totalRounds) {
                // Move to finals: top 2
                const ranked = Object.entries(this.scores).sort((x,y) => y[1] - x[1]);
                const a = ranked[0]?.[0];
                const b = ranked[1]?.[0];
                if (!a || !b) return null;
                this.state.phase = 'finals';
                this.state.finals = { a, b, aWins: 0, bWins: 0 };
                return [a, b];
            }
            this._buildSwissPairs();
        }
        return this.pairs.shift() || null;
    }
    recordResult(a, b, choice) {
        if (this.state.phase === 'finals') {
            const f = this.state.finals;
            if (choice === 'A') f.aWins++; else if (choice === 'B') f.bWins++; else { f.aWins += 0.5; f.bWins += 0.5; }
            return;
        }
        if (choice === 'A') this.scores[a] += 1;
        else if (choice === 'B') this.scores[b] += 1;
        else { this.scores[a] += 0.5; this.scores[b] += 0.5; }
    }
    getWinner() {
        if (this.state.phase === 'finals' && this.state.finals) {
            const { a, b, aWins, bWins } = this.state.finals;
            if (aWins > bWins) return a;
            if (bWins > aWins) return b;
            // tie-breaker: prefer preset suggestion, else base mapping, else lexical
            const baseMap = (window.multiFontPresets?.[currentRolesPresetKey]?.fonts) || {};
            if (baseMap[this.role] === a) return a;
            if (baseMap[this.role] === b) return b;
            return [a, b].sort()[0];
        }
        // If finals never reached, pick highest score
        const ranked = Object.entries(this.scores).sort((x,y) => y[1] - x[1]);
        return ranked[0]?.[0] || null;
    }
}

// Curated/hueristic slice selection per role
const roleSliceHints = {
    comments: [/\/\//, /\/*|\*\//],
    strings: [/['"`].+['"`]/],
    keywords: [/\b(function|const|let|return|if|else|for|while|switch|case)\b/],
    function: [/\bfunction\b|=>/],
    base: [/./],
    ghost: [/<<ghost:begin>>/]
};

async function setRoleSliceInPanels(role) {
    // Load full code instead of slicing
    const code = await loadCode(currentLanguage);
    const lang = mapLanguageForHLJS(currentLanguage);
    const codeA = document.getElementById('codeA');
    const codeB = document.getElementById('codeB');
    
    // Apply full code with syntax highlighting
    setCodeWithHighlight(codeA, code, lang);
    setCodeWithHighlight(codeB, code, lang);
    
    // Apply role-based visual highlighting
    highlightRoleElements(codeA, role);
    highlightRoleElements(codeB, role);
}

function highlightRoleElements(codeElement, role) {
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

function clearRoleHighlighting(codeElement) {
    console.log('[DEBUG] Clearing role highlighting from element:', codeElement.id);
    codeElement.classList.remove('role-focus-active');
    const targets = codeElement.querySelectorAll('.role-highlight-target');
    targets.forEach(el => {
        el.classList.remove('role-highlight-target');
    });
}

function stripSyntaxHighlighting(element) {
    // Remove all hljs- classes and convert highlighted elements to plain text
    const highlightedElements = element.querySelectorAll('[class*="hljs-"]');
    highlightedElements.forEach(el => {
        // Remove all hljs classes
        const classes = Array.from(el.classList);
        classes.forEach(cls => {
            if (cls.startsWith('hljs-')) {
                el.classList.remove(cls);
            }
        });
        // If no classes left, unwrap the element
        if (el.classList.length === 0) {
            const parent = el.parentNode;
            while (el.firstChild) {
                parent.insertBefore(el.firstChild, el);
            }
            parent.removeChild(el);
        }
    });
}

function extractSliceByRole(code, role, context = 3, maxLines = 40) {
    const lines = code.split(/\r?\n/);
    // Ghost: prefer markers if present
    if (role === 'ghost') {
        let beginIdx = -1, endIdx = -1;
        for (let i = 0; i < lines.length; i++) {
            if (beginIdx === -1 && lines[i].includes('<<ghost:begin>>')) beginIdx = i;
            if (lines[i].includes('<<ghost:end>>')) { endIdx = i; break; }
        }
        if (beginIdx !== -1) {
            const start = Math.max(0, beginIdx - context);
            const end = Math.min(lines.length - 1, (endIdx !== -1 ? endIdx : beginIdx) + context);
            return lines.slice(start, end + 1).join('\n');
        }
    }
    const patterns = roleSliceHints[role] || roleSliceHints.base;
    const idx = lines.findIndex(ln => patterns.some(rx => rx.test(ln)));
    if (idx === -1) {
        return lines.slice(0, Math.min(maxLines, lines.length)).join('\n');
    }
    const start = Math.max(0, idx - context);
    // extend end until we hit a blank line or reach max
    let end = start;
    let count = 0;
    for (let i = start; i < lines.length && count < maxLines; i++, count++) {
        end = i;
        if (/^\s*$/.test(lines[i]) && i > idx) break;
    }
    return lines.slice(start, end + 1).join('\n');
}

// Preload faces for embedded fonts for smoother role compare
async function preloadFontsForRolePair(role, aName, bName) {
    const names = [aName, bName];
    const dbByName = Object.fromEntries((window.fontDatabase || []).map(f => [f.name, f]));
    const attempts = [];
    const preloadCombos = (name) => {
        const entry = dbByName[name];
        if (!entry || entry.source !== 'embedded') return;
        // Baseline
        attempts.push(window.ensureEmbeddedFace(name, 400, 'normal', 'normal'));
        if (role === 'keywords') attempts.push(window.ensureEmbeddedFace(name, 600, 'normal', 'normal'));
        if (role === 'ghost' || role === 'comments') attempts.push(window.ensureEmbeddedFace(name, 400, 'italic', 'normal'));
        if (role === 'ghost') attempts.push(window.ensureEmbeddedFace(name, 300, 'italic', 'normal'));
    };
    names.forEach(preloadCombos);
    try { await Promise.allSettled(attempts); } catch {}
}

// Show next comparison
function showNextComparison() {
    const comparison = engine.getNextComparison();
    console.log('[DEBUG] showNextComparison got:', comparison);
    
    if (!comparison) {
        showResults();
        return;
    }
    
    // Handle font family selector
    if (comparison.showFontFamilySelector) {
        showFontFamilySelector();
        return;
    }
    
    const { optionA, optionB, stage, pair, similarity } = comparison;
    
    // Initialize grid visibility based on stage configuration
    initializeGridForStage(stage);
    // Role stages: set focused slice and apply panel-scoped role fonts
    window.__IN_ROLE_VIEW = window.__IN_ROLE_VIEW || false;
    if (comparison.roleTest) {
        const r = comparison.roleTest;
        if (r.role !== 'base') {
            setRoleSliceInPanels(r.role).then(() => {
                preloadFontsForRolePair(r.role, r.aFont, r.bFont).then(() => {
                    applyRoleCompareStyles(r.role, r.aFont, r.bFont);
                });
            });
        } else {
            clearRoleCompareStyles();
        }
        window.__IN_ROLE_VIEW = true;
    } else {
        if (window.__IN_ROLE_VIEW) {
            clearRoleCompareStyles();
            updateCode();
            window.__IN_ROLE_VIEW = false;
        }
    }
    
    // Check if we have the required properties
    if (!optionA || !optionB) {
        console.error('[ERROR] Invalid comparison object - missing optionA or optionB:', comparison);
        showResults();
        return;
    }
    
    // Hide font family selector if it was showing
    document.getElementById('fontFamilySelector').classList.add('hidden');
    
    // Show/hide skip button for skippable stages
    const skipBtn = document.getElementById('btnSkipStage');
    const currentStage = getStage(stage);
    if (currentStage && currentStage.skippable) {
        skipBtn.style.display = 'block';
    } else {
        skipBtn.style.display = 'none';
    }
    
    // Legacy role skip button (keep hidden now that we use the new skip button)
    const oldSkipBtn = document.getElementById('skipRoleBtn');
    if (oldSkipBtn) {
        oldSkipBtn.classList.add('hidden');
    }
    
    // Hide description section during A/B tests
    document.querySelector('.description-section').classList.add('hidden');
    
    document.querySelector('.comparison-container').style.display = 'flex';
    
    // Update progress
    const progress = engine.getProgress();
    document.getElementById('progressFill').style.width = progress + '%';
    
    // Update status
    const stageNames = {
        fontFamily: 'Font Style',
        colorScheme: 'Color Scheme',
        font: 'Specific Font',
        roleKeywords: 'Keywords Font',
        roleStrings: 'Strings Font',
        roleComments: 'Comments Font',
        roleFunction: 'Functions Font',
        roleGhost: 'AI Suggestions Font',
        size: 'Font Size',
        weight: 'Font Weight',
        lineHeight: 'Line Height',
        fontWidth: 'Font Width',
        letterSpacing: 'Letter Spacing'
    };
    // Update status (similarity info moved to hidden summary)
    const stageObj = getStage(stage);
    const statusText = `Comparing: ${stageObj?.name || stage}`;
    document.getElementById('status').textContent = statusText;
    
    // Show stage description if available
    if (stageObj?.description) {
        // You could add a description element here if you want to display it
    }
    
    // Apply styles and summaries (pass similarity info)
    applyStyles('codeA', 'panelA', optionA, 'summaryA', similarity);
    applyStyles('codeB', 'panelB', optionB, 'summaryB', similarity);
    
    // Update grid overlays (user-controlled via 'g' key)
    updateGridOverlays(optionA, optionB);
}

// Show font family selector
function showFontFamilySelector(keepDescriptionVisible = false) {
    document.querySelector('.comparison-container').style.display = 'none';
    
    // Hide description section during font family selection (unless it's the start screen)
    if (!keepDescriptionVisible) {
        document.querySelector('.description-section').classList.add('hidden');
    }
    
    document.getElementById('fontFamilySelector').classList.remove('hidden');
    
    // Update status
    document.getElementById('status').textContent = 'Choose your preferred font style';
    
    // Populate font families
    const grid = document.getElementById('fontFamiliesGrid');
    grid.innerHTML = '';
    
    const sampleCode = (window.textSamples && window.textSamples.fontFamilyPreviewCode) || '';
    const ligatureText = (window.textSamples && window.textSamples.ligatureSample) || '';
    
    // Helper: pick default preview scheme (Monokai for dark; Catppuccin Latte for light)
    function pickDefaultScheme() {
        const list = (window.colorSchemeDatabase && window.colorSchemeDatabase[themeMode]) || [];
        const want = themeMode === 'dark' ? 'Monokai' : 'Catppuccin Latte';
        return list.find(s => s.name === want) || list[0] || { bg: themeMode==='dark' ? '#1a1a1a' : '#ffffff', fg: themeMode==='dark' ? '#e0e0e0' : '#333' };
    }
    const defaultScheme = pickDefaultScheme();
    function tok(val){ if(!val) return {}; if(typeof val==='string') return {color:val}; return {color:val.color, bold:!!val.bold, italic:!!val.italic}; }
    const tKeyword = tok(defaultScheme.keyword), tString = tok(defaultScheme.string), tComment = tok(defaultScheme.comment), tFunc = tok(defaultScheme.function);

    Object.entries(fontFamilies).forEach(([familyName, familyData], idx) => {
        const option = document.createElement('div');
        option.className = 'font-family-option';
        option.onclick = (e) => {
            // Don't trigger font selection if this was a drag operation
            if (hasDragged) {
                hasDragged = false;
                return;
            }
            selectFontFamily(familyName);
        };
        
        // Create container for side-by-side previews (unified window)
        const previewContainer = document.createElement('div');
        previewContainer.style.display = 'flex';
        previewContainer.style.border = '1px solid rgba(0,0,0,0.2)';
        previewContainer.style.borderRadius = '6px';
        previewContainer.style.overflow = 'hidden';
        previewContainer.style.backgroundColor = 'rgba(0,0,0,0.1)';
        
        // Choose an available preview font from the family
        function pickUsableCssString() {
            const entries = (familyData.fonts || []).slice();
            function primaryName(cssString) {
                const m = cssString.match(/\"([^\"]+)\"/);
                return m ? m[1] : null;
            }
            const score = (name) => {
                const src = (window.fontSourceByName && window.fontSourceByName[name]) || 'embedded';
                if (src === 'google') return 3;
                if (src === 'embedded') return (window.loadedEmbeddedFonts && window.loadedEmbeddedFonts.has(name)) ? 2 : 0;
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
                const src = (window.fontSourceByName && window.fontSourceByName[name]) || 'embedded';
                if (src !== 'system') return css;
            }
            // Last resort: the existing representative
            return familyData.representative;
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
        
        const handleMouseMove = (e) => {
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
        const previews = document.querySelectorAll('.font-family-preview');
        previews.forEach(preview => {
            // Force a reflow to ensure fonts are applied
            preview.style.display = 'none';
            preview.offsetHeight; // Trigger reflow
            preview.style.display = 'block';
        });
    }, 300);
}

// Handle font family selection
function selectFontFamily(familyName) {
    // Hide import section and font family selector since user made choice
    document.getElementById('importSection').classList.add('hidden');
    document.getElementById('fontFamilySelector').classList.add('hidden');
    
    // Enable controls now that tournament has started
    document.getElementById('languageSelect').disabled = false;
    document.getElementById('resetBtn').disabled = false;
    
    engine.selectFontFamily(familyName);
    showNextComparison();
}

// Apply styles to a code panel
function applyStyles(codeId, panelId, option, summaryId, similarity = null) {
    const code = document.getElementById(codeId);
    const panel = document.getElementById(panelId);
    const summary = summaryId ? document.getElementById(summaryId) : null;
    // Ensure embedded face is loaded when using variantsMatrix
    try {
        const m = (option.font || '').match(/\"([^\"]+)\"/);
        const fam = m ? m[1] : null;
        const weight = option.fontWeight || 400;
        const style = 'normal';
        const width = option.fontWidth || 'normal';
        if (fam && typeof window.ensureEmbeddedFace === 'function') {
            window.ensureEmbeddedFace(fam, weight, style, width);
        }
    } catch {}

    code.style.fontFamily = option.font;
    code.style.fontSize = option.fontSize + 'px';
    code.style.fontWeight = option.fontWeight;
    code.style.fontStyle = option.fontStyle || 'normal';
    code.style.lineHeight = option.lineHeight;
    code.style.fontStretch = option.fontWidth || 'normal';
    code.style.letterSpacing = (option.letterSpacing || 0) + 'px';
    
    if (option.colorScheme) {
        panel.style.backgroundColor = option.colorScheme.bg;
        code.style.color = option.colorScheme.fg;

        // Normalize scheme tokens: allow string or object { color, italic, bold, style, weight }
        function normToken(v) {
            if (!v) return {};
            if (typeof v === 'string') return { color: v };
            const o = { color: v.color, background: v.background };
            if (typeof v.weight === 'number') o.weight = v.weight;
            if (typeof v.style === 'string') o.style = v.style;
            if (typeof v.bold === 'boolean' && typeof o.weight === 'undefined') o.weight = v.bold ? 700 : 400;
            if (typeof v.italic === 'boolean' && typeof o.style === 'undefined') o.style = v.italic ? 'italic' : 'normal';
            return o;
        }
        const tok = {
            keyword: normToken(option.colorScheme.keyword),
            string: normToken(option.colorScheme.string),
            comment: normToken(option.colorScheme.comment),
            function: normToken(option.colorScheme.function)
        };

        // Helper to merge role + scheme style for a logical token
        function mergeStyleFor(roleKey, schemeTok) {
            const roleInfo = currentRoleMapping && currentRoleMapping[roleKey];
            const roleWeight = roleInfo && typeof roleInfo === 'object' ? roleInfo.weight : undefined;
            const roleStyle = roleInfo && typeof roleInfo === 'object' ? roleInfo.style : undefined;
            const weight = (typeof roleWeight !== 'undefined') ? roleWeight
                          : (typeof schemeTok.weight !== 'undefined' ? schemeTok.weight : undefined);
            const style  = (typeof schemeTok.style !== 'undefined') ? schemeTok.style
                          : (typeof roleStyle !== 'undefined' ? roleStyle : undefined);
            return { weight, style };
        }

        // Apply colors and optional weight/style per token
        const kws = code.querySelectorAll('.hljs-keyword, .hljs-operator');
        const strs = code.querySelectorAll('.hljs-string, .hljs-attr');
        const cms = code.querySelectorAll('.hljs-comment');
        const fns = code.querySelectorAll('.hljs-function, .hljs-title');

        kws.forEach(el => {
            if (tok.keyword.color) el.style.color = tok.keyword.color;
            const m = mergeStyleFor('keywords', tok.keyword);
            if (typeof m.weight !== 'undefined') el.style.fontWeight = String(m.weight);
            if (typeof m.style  !== 'undefined') el.style.fontStyle  = m.style;
        });
        strs.forEach(el => {
            if (tok.string.color) el.style.color = tok.string.color;
            const m = mergeStyleFor('strings', tok.string);
            if (typeof m.weight !== 'undefined') el.style.fontWeight = String(m.weight);
            if (typeof m.style  !== 'undefined') el.style.fontStyle  = m.style;
        });
        cms.forEach(el => {
            if (tok.comment.color) el.style.color = tok.comment.color;
            const m = mergeStyleFor('comments', tok.comment);
            if (typeof m.weight !== 'undefined') el.style.fontWeight = String(m.weight);
            if (typeof m.style  !== 'undefined') el.style.fontStyle  = m.style;
        });
        fns.forEach(el => {
            if (tok.function.color) el.style.color = tok.function.color;
            const m = mergeStyleFor('function', tok.function);
            if (typeof m.weight !== 'undefined') el.style.fontWeight = String(m.weight);
            if (typeof m.style  !== 'undefined') el.style.fontStyle  = m.style;
        });
    }
    
    // Update summary if provided
    if (summary) {
        const fontName = option.font.split(',')[0].replace(/"/g, '');
        const themeName = option.colorScheme ? option.colorScheme.name : 'Unknown';
        const widthNote = (option.fontWidth && option.fontWidth !== 'normal') ? 
            ` • ${option.fontWidth} (may not be visible)` : '';
        
        let similarityText = '';
        if (similarity && engine.stage === 'font') {
            const categoryText = similarity.category.replace('-', ' ');
            const scoreText = Math.round(similarity.score);
            similarityText = `<br><em>Round ${similarity.round}: ${categoryText} (${scoreText}% similar)</em>`;
        }
        
        // Add role tournament information if we're in a role stage
        let roleStageInfo = '';
        if (engine.stage && engine.stage.startsWith('role')) {
            const stageToRole = {
                roleKeywords: 'keywords', roleStrings: 'strings', roleComments: 'comments', 
                roleFunction: 'function', roleGhost: 'ghost'
            };
            const currentRole = stageToRole[engine.stage];
            if (currentRole) {
                const roleDisplayName = currentRole.charAt(0).toUpperCase() + currentRole.slice(1);
                roleStageInfo = `<br><em>🎯 Testing: ${roleDisplayName} Role</em>`;
            }
        }
        
        // Build multi-line roles info when multi-font mode is active
        let rolesBlock = '';
        if (multiFontMode && currentRoleMapping && Object.keys(currentRoleMapping).length) {
            const roleOrder = Object.keys(roleToHLJS || {});
            const lines = [];
            roleOrder.forEach(role => {
                const info = currentRoleMapping[role];
                if (!info) return;
                const stack = typeof info === 'string' ? info : info.stack;
                const primary = (stack || '').split(',')[0].replace(/\"/g, '').trim();
                if (!primary) return;
                const w = (info && typeof info === 'object' && info.weight) ? `, ${info.weight}` : '';
                const s = (info && typeof info === 'object' && info.style) ? `, ${info.style}` : '';
                lines.push(`${getRoleLabel(role)}: ${primary}${w}${s}`);
            });
            if (lines.length) {
                rolesBlock = `----- Roles ----<br>` + lines.join('<br>');
            }
        }

        summary.innerHTML = `
            <strong>${fontName}</strong><br>
            ${option.fontSize}px • ${option.fontWeight}${widthNote}<br>
            ${option.letterSpacing || 0}px spacing • ${option.lineHeight} line height<br>
            ${themeName}${similarityText}${roleStageInfo}${rolesBlock ? `<br>${rolesBlock}` : ''}
        `;
    }
}

// Handle option selection
function selectOption(choice) {
    const prevFont = engine.winners && engine.winners.font;
    engine.submitChoice(choice);
    comparisons.push(choice);
    // If a base font was just selected and icons-patched variants exist, prompt
    if (engine.winners && engine.winners.font && engine.winners.font !== prevFont) {
        maybePromptPatchedVariant(engine.winners.font);
    }
    showNextComparison();
}

// Skip current role stage
function skipRoleStage() {
    if (engine.stage && engine.stage.startsWith('role')) {
        // Mark the role as not set by skipping its tournament
        engine.currentRoleTournament = null;
        
        // Advance to next stage
        const stageIndex = getStageIndex(engine.stage);
        if (stageIndex >= 0 && stageIndex < STAGES.length - 1) {
            engine.stage = STAGES[stageIndex + 1].id;
            engine.generateNextStage();
            showNextComparison();
        } else {
            // If this was the last stage, complete the process
            engine.complete = true;
            showResults();
        }
    }
}

function skipCurrentStage() {
    const currentStage = getStage(engine.stage);
    
    // Don't allow skipping fontFamily or non-skippable stages
    if (!currentStage || !currentStage.skippable) {
        return;
    }
    
    // For role stages, use existing logic
    if (engine.stage && engine.stage.startsWith('role')) {
        skipRoleStage();
        return;
    }
    
    // For other stages, select current tournament leader or random
    if (engine.currentTournament && engine.currentTournament.candidates) {
        let winner;
        if (engine.currentTournament.scores && engine.currentTournament.scores.length > 0) {
            // Select the current leader
            const bestScore = Math.max(...engine.currentTournament.scores);
            const bestIndex = engine.currentTournament.scores.indexOf(bestScore);
            winner = engine.currentTournament.candidates[bestIndex];
        } else {
            // Random selection if no comparisons yet
            const randomIndex = Math.floor(Math.random() * engine.currentTournament.candidates.length);
            winner = engine.currentTournament.candidates[randomIndex];
        }
        
        // Set the winner and complete the stage
        if (winner) {
            engine.winners[engine.stage] = winner;
        }
    }
    
    // Advance to next stage
    const stageIndex = getStageIndex(engine.stage);
    if (stageIndex >= 0 && stageIndex < STAGES.length - 1) {
        engine.stage = STAGES[stageIndex + 1].id;
        engine.generateNextStage();
        showNextComparison();
    } else {
        // If this was the last stage, complete the process
        engine.complete = true;
        showResults();
    }
}

// Change language
function changeLanguage() {
    const newLanguage = document.getElementById('languageSelect').value;
    
    if (newLanguage === 'custom') {
        showCustomUrlDialog();
        return;
    }
    
    currentLanguage = newLanguage;
    updateCode();
    
    // Reapply current comparison styles after code loads
    setTimeout(() => {
        const comparison = engine.getNextComparison();
        if (comparison && comparison.optionA) {
            applyStyles('codeA', 'panelA', comparison.optionA, null, comparison.similarity);
            applyStyles('codeB', 'panelB', comparison.optionB, null, comparison.similarity);
            updateGridOverlays(comparison.optionA, comparison.optionB);
        }
    }, 100);
}

// Icons/Nerd Font prompt
let iconsPromptedFor = new Set();
function findPatchedVariants(baseName) {
    const db = window.fontDatabase || [];
    return db.filter(f => f.icons === true && f.patchedFrom === baseName).map(f => f.name);
}
function maybePromptPatchedVariant(cssFontString) {
    const m = (cssFontString || '').match(/\"([^\"]+)\"/);
    const baseName = m ? m[1] : null;
    if (!baseName || iconsPromptedFor.has(baseName)) return;
    const variants = findPatchedVariants(baseName);
    if (!variants.length) return;
    iconsPromptedFor.add(baseName);
    const prevLang = currentLanguage;
    // Switch to powerline sample for context
    currentLanguage = 'powerline';
    updateCode();
    // Populate modal options
    const list = variants.map(v => {
        const available = (window.fontSourceByName[v] !== 'system') || isFontAvailable(v);
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
        currentLanguage = prevLang;
        updateCode();
        keepBtn?.removeEventListener('click', onKeep);
        useBtn?.removeEventListener('click', onUse);
    };
    const onKeep = () => { onClose(); };
    const onUse = () => {
        const sel = document.querySelector('input[name="patchedChoice"]:checked');
        const chosen = sel ? sel.value : variants[0];
        // Ensure multi-font mode and set roles
        const toggle = document.getElementById('multiFontToggle');
        if (toggle && !toggle.checked) { toggle.checked = true; }
        multiFontMode = true;
        const mapping = { ...(window.multiFontPresets?.[currentRolesPresetKey]?.fonts || {}) };
        mapping.powerline = chosen;
        mapping.nerdFont = chosen;
        applyRoleFonts(mapping);
        renderRolesSummary(mapping);
        onClose();
    };
    keepBtn?.addEventListener('click', onKeep);
    useBtn?.addEventListener('click', onUse);
}

// Show custom URL input dialog
function showCustomUrlDialog() {
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
            document.getElementById('languageSelect').value = currentLanguage;
            return;
        }
        
        // Set custom URL and load
        console.log(`Setting custom URL: ${cleanUrl}`);
        codeSampleUrls.custom = cleanUrl;
        currentLanguage = 'custom';
        
        // Clear cache for custom to force reload
        codeCache.delete('custom');
        
        console.log(`Loading custom code from: ${codeSampleUrls.custom}`);
        updateCode();
        
        // Update select box to show custom is selected
        const option = document.querySelector('#languageSelect option[value="custom"]');
        if (option) {
            option.text = `Custom (${cleanUrl.split('/').pop() || 'loaded'})`;
        }
    } else {
        // User cancelled, revert selection
        document.getElementById('languageSelect').value = currentLanguage;
    }
}

// Reset test
function resetTest() {
    engine = new ComparisonEngine();
    comparisons = [];
    currentComparison = 0;
    
    // Reset UI to initial state
    document.getElementById('results').classList.add('hidden');
    document.getElementById('fontFamilySelector').classList.remove('hidden');
    document.getElementById('importSection').classList.remove('hidden');
    document.getElementById('progressFill').style.width = '0%';
    
    // Disable controls until tournament starts
    document.getElementById('languageSelect').disabled = true;
    document.getElementById('resetBtn').disabled = true;
    
    updateCode();
    showNextComparison();
}

// Show results
function showResults() {
    const rawResults = engine.winners;
    console.log('Raw engine results:', rawResults);
    
    // Normalize the results to expected format
    const results = {
        fontFamily: rawResults.fontFamily,
        font: rawResults.font || rawResults.fontFamily || 'monospace',
        size: rawResults.size || 16,
        weight: rawResults.weight || 400,
        lineHeight: rawResults.lineHeight || 1.5,
        fontWidth: rawResults.fontWidth || 'normal',
        letterSpacing: rawResults.letterSpacing || 0,
        colorScheme: rawResults.colorScheme || { bg: '#1a1a1a', fg: '#e0e0e0' }
    };
    
    document.getElementById('progressFill').style.width = '100%';
    document.getElementById('status').textContent = 'Complete!';
    
    const resultsDiv = document.getElementById('results');
    resultsDiv.classList.remove('hidden');
    
    const details = document.getElementById('resultDetails');
    const familyName = results.fontFamily || 'Unknown';
    const familyDescription = results.fontFamily && fontFamilies[results.fontFamily] ? fontFamilies[results.fontFamily].description : '';
    details.innerHTML = `
        <div class="results-section">
            <h3>Your Optimal Settings</h3>
            <div class="setting-item">
                <strong>Theme Mode:</strong> ${themeMode === 'dark' ? 'Dark' : 'Light'}
            </div>
            <div class="setting-item">
                <strong>Font Style:</strong> ${familyName}
                <button class="re-compare-btn" onclick="recompareStage('fontFamily')">Re-compare</button>
            </div>
            ${familyDescription ? `<p class="family-description">${familyDescription}</p>` : ''}
            <div class="setting-item">
                <strong>Font:</strong> ${results.font ? results.font.split(',')[0].replace(/['"]/g, '').trim() : 'Not selected'}
                <button class="re-compare-btn" onclick="recompareStage('font')">Re-compare</button>
            </div>
            <div class="setting-item">
                <strong>Font Size:</strong> ${results.size || 'Not selected'}px
                <button class="re-compare-btn" onclick="recompareStage('size')">Re-compare</button>
            </div>
            <div class="setting-item">
                <strong>Font Weight:</strong> ${results.weight || 'Not selected'}
                <button class="re-compare-btn" onclick="recompareStage('weight')">Re-compare</button>
            </div>
            <div class="setting-item">
                <strong>Line Height:</strong> ${results.lineHeight || 'Not selected'}
                <button class="re-compare-btn" onclick="recompareStage('lineHeight')">Re-compare</button>
            </div>
            <div class="setting-item">
                <strong>Font Width:</strong> ${results.fontWidth || 'normal'}
                <button class="re-compare-btn" onclick="recompareStage('fontWidth')">Re-compare</button>
            </div>
            <div class="setting-item">
                <strong>Letter Spacing:</strong> ${results.letterSpacing || 0}px
                <button class="re-compare-btn" onclick="recompareStage('letterSpacing')">Re-compare</button>
            </div>
            <div class="setting-item">
                <strong>Color Scheme:</strong> ${results.colorScheme ? results.colorScheme.name : 'Unknown'}
                <button class="re-compare-btn" onclick="recompareStage('colorScheme')">Re-compare</button>
            </div>
            <p><strong>Total Comparisons:</strong> ${comparisons.length}</p>
            
            <div class="export-section">
                <h4>Export Settings</h4>
                <div class="compact-export">
                    <label>Settings String (save/share):</label>
                    <input type="text" id="settingsString" value="${exportSettings(results)}" readonly onclick="this.select()">
                    <button onclick="copyToClipboard('settingsString')">Copy</button>
                </div>
                
                <div class="export-buttons">
                    <button onclick="downloadConfig('vscode')">VS Code</button>
                    <button onclick="downloadConfig('vim')">Vim</button>
                    <button onclick="downloadConfig('emacs')">Emacs</button>
                    <button onclick="downloadConfig('windowsTerminal')">Windows Terminal</button>
                    <button onclick="downloadConfig('iterm2')">iTerm2</button>
                    <button onclick="downloadConfig('gnomeTerminal')">GNOME Terminal</button>
                    <button onclick="downloadConfig('putty')">PuTTY</button>
                    <button onclick="downloadConfig('sublimeText')">Sublime Text</button>
                    <button onclick="downloadConfig('atom')">Atom</button>
                    <button onclick="downloadConfig('intellij')">IntelliJ/JetBrains</button>
                </div>
            </div>
        </div>
    `;
    
    // Apply final styles to result preview
    const resultCode = document.getElementById('resultCode');
    
    // Load the current language code for results and highlight via highlight.js
    loadCode(currentLanguage).then(code => {
        const lang = mapLanguageForHLJS(currentLanguage);
        setCodeWithHighlight(resultCode, code, lang);
    }).catch(error => {
        console.error('Failed to load code for results:', error);
        resultCode.textContent = 'Failed to load code';
    });
    // Extract just the primary font name, not the fallback stack
    const primaryFont = results.font.split(',')[0].replace(/['"]/g, '').trim();
    resultCode.style.fontFamily = results.font;
    resultCode.style.fontSize = results.size + 'px';
    resultCode.style.fontWeight = results.weight;
    resultCode.style.lineHeight = results.lineHeight;
    resultCode.style.color = results.colorScheme.fg;
    resultCode.parentElement.style.backgroundColor = results.colorScheme.bg;
    
    // Apply syntax colors for highlight.js classes
    const kws = resultCode.querySelectorAll('.hljs-keyword, .hljs-selector-tag, .hljs-meta, .hljs-title');
    const strs = resultCode.querySelectorAll('.hljs-string, .hljs-attr');
    const cms = resultCode.querySelectorAll('.hljs-comment');
    const nums = resultCode.querySelectorAll('.hljs-number, .hljs-literal, .hljs-built_in, .hljs-type');
    kws.forEach(el => el.style.color = results.colorScheme.keyword);
    strs.forEach(el => el.style.color = results.colorScheme.string);
    cms.forEach(el => el.style.color = results.colorScheme.comment);
    nums.forEach(el => el.style.color = results.colorScheme.function);
}

// Configuration export templates
const configTemplates = {
    vscode: (settings) => ({
        filename: 'settings.json',
        content: `{
    "editor.fontFamily": "${settings.font}",
    "editor.fontSize": ${settings.size},
    "editor.fontWeight": "${settings.weight}",
    "editor.fontWidth": "${settings.fontWidth || 'normal'}",
    "editor.letterSpacing": ${settings.letterSpacing || 0},
    "editor.lineHeight": ${settings.lineHeight},
    "workbench.colorTheme": "${getVSCodeTheme(settings.colorScheme)}"
}`
    }),
    
    vim: (settings) => ({
        filename: '.vimrc',
        content: `" Font configuration for GUI Vim (gvim)
set guifont=${settings.font.replace(/\s+/g, '\\ ')}:h${settings.size}:cNORMAL:qDRAFT

" Terminal colors (add to your .vimrc)
set termguicolors
highlight Normal guifg=${settings.colorScheme.fg} guibg=${settings.colorScheme.bg}
highlight Comment guifg=${settings.colorScheme.comment}
highlight String guifg=${settings.colorScheme.string}
highlight Keyword guifg=${settings.colorScheme.keyword}
highlight Function guifg=${settings.colorScheme.function}

" Line spacing (requires GUI Vim)
set linespace=${Math.round((settings.lineHeight - 1) * settings.size)}`
    }),
    
    emacs: (settings) => ({
        filename: 'init.el',
        content: `;;; Font configuration
(set-face-attribute 'default nil
                    :family "${settings.font}"
                    :height ${settings.size * 10}
                    :weight '${settings.weight < 500 ? 'normal' : 'bold'})

;;; Line spacing
(setq-default line-spacing ${Math.round((settings.lineHeight - 1) * settings.size)})

;;; Custom theme colors
(custom-set-faces
 '(default ((t (:foreground "${settings.colorScheme.fg}" :background "${settings.colorScheme.bg}"))))
 '(font-lock-comment-face ((t (:foreground "${settings.colorScheme.comment}"))))
 '(font-lock-string-face ((t (:foreground "${settings.colorScheme.string}"))))
 '(font-lock-keyword-face ((t (:foreground "${settings.colorScheme.keyword}"))))
 '(font-lock-function-name-face ((t (:foreground "${settings.colorScheme.function}")))))`
    }),
    
    windowsTerminal: (settings) => ({
        filename: 'windows-terminal-settings.json',
        content: `{
    "profiles": {
        "defaults": {
            "font": {
                "face": "${settings.font}",
                "size": ${settings.size},
                "weight": "${settings.weight}"
            },
            "colorScheme": "Custom"
        }
    },
    "schemes": [
        {
            "name": "Custom",
            "foreground": "${settings.colorScheme.fg}",
            "background": "${settings.colorScheme.bg}",
            "black": "${settings.colorScheme.bg}",
            "blue": "${settings.colorScheme.keyword}",
            "cyan": "${settings.colorScheme.function}",
            "green": "${settings.colorScheme.string}",
            "purple": "${settings.colorScheme.keyword}",
            "red": "${settings.colorScheme.comment}",
            "white": "${settings.colorScheme.fg}",
            "yellow": "${settings.colorScheme.string}",
            "brightBlack": "${adjustBrightness(settings.colorScheme.bg, 20)}",
            "brightBlue": "${adjustBrightness(settings.colorScheme.keyword, 20)}",
            "brightCyan": "${adjustBrightness(settings.colorScheme.function, 20)}",
            "brightGreen": "${adjustBrightness(settings.colorScheme.string, 20)}",
            "brightPurple": "${adjustBrightness(settings.colorScheme.keyword, 20)}",
            "brightRed": "${adjustBrightness(settings.colorScheme.comment, 20)}",
            "brightWhite": "${adjustBrightness(settings.colorScheme.fg, 20)}",
            "brightYellow": "${adjustBrightness(settings.colorScheme.string, 20)}"
        }
    ]
}`
    }),
    
    putty: (settings) => ({
        filename: 'putty-config.reg',
        content: `Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\\Software\\SimonTatham\\PuTTY\\Sessions\\Default%20Settings]
"Font"="${settings.font}"
"FontHeight"=dword:${settings.size.toString(16).padStart(8, '0')}
"FontIsBold"=dword:${settings.weight >= 600 ? '00000001' : '00000000'}
"Colour0"="${rgbToRegistry(settings.colorScheme.fg)}"
"Colour1"="${rgbToRegistry(settings.colorScheme.fg)}"
"Colour2"="${rgbToRegistry(settings.colorScheme.bg)}"
"Colour3"="${rgbToRegistry(settings.colorScheme.bg)}"
"Colour4"="${rgbToRegistry(settings.colorScheme.bg)}"
"Colour5"="${rgbToRegistry(settings.colorScheme.fg)}"
"Colour6"="${rgbToRegistry(settings.colorScheme.bg)}"
"Colour7"="${rgbToRegistry(settings.colorScheme.fg)}"
"Colour8"="${rgbToRegistry(settings.colorScheme.comment)}"
"Colour9"="${rgbToRegistry(settings.colorScheme.string)}"
"Colour10"="${rgbToRegistry(settings.colorScheme.keyword)}"
"Colour11"="${rgbToRegistry(settings.colorScheme.function)}"
"Colour12"="${rgbToRegistry(settings.colorScheme.keyword)}"
"Colour13"="${rgbToRegistry(settings.colorScheme.string)}"
"Colour14"="${rgbToRegistry(settings.colorScheme.comment)}"
"Colour15"="${rgbToRegistry(settings.colorScheme.fg)}"`
    }),
    
    sublimeText: (settings) => ({
        filename: 'Preferences.sublime-settings',
        content: `{
    "font_face": "${settings.font}",
    "font_size": ${settings.size},
    "line_padding_top": ${Math.round((settings.lineHeight - 1) * settings.size / 4)},
    "line_padding_bottom": ${Math.round((settings.lineHeight - 1) * settings.size / 4)},
    "color_scheme": "Packages/User/Custom.sublime-color-scheme"
}`
    }),
    
    atom: (settings) => ({
        filename: 'styles.less',
        content: `atom-text-editor {
  font-family: "${settings.font}" !important;
  font-size: ${settings.size}px !important;
  font-weight: ${settings.weight} !important;
  line-height: ${settings.lineHeight} !important;
}

atom-text-editor.editor {
  background-color: ${settings.colorScheme.bg} !important;
  color: ${settings.colorScheme.fg} !important;
  
  .syntax--comment {
    color: ${settings.colorScheme.comment} !important;
  }
  
  .syntax--string {
    color: ${settings.colorScheme.string} !important;
  }
  
  .syntax--keyword {
    color: ${settings.colorScheme.keyword} !important;
  }
  
  .syntax--entity.syntax--name.syntax--function {
    color: ${settings.colorScheme.function} !important;
  }
}`
    }),
    
    intellij: (settings) => ({
        filename: 'custom-code-font-theme.icls',
        content: `<scheme name="Custom Code Font Theme" version="142" parent_scheme="Darcula">
  <option name="FONT_FAMILY" value="${settings.font}" />
  <option name="FONT_SIZE" value="${settings.size}" />
  <option name="LINE_SPACING" value="${settings.lineHeight}" />
  
  <colors>
    <option name="CARET_COLOR" value="${settings.colorScheme.fg.substring(1)}" />
    <option name="CARET_ROW_COLOR" value="${adjustBrightness(settings.colorScheme.bg, 10).substring(1)}" />
    <option name="CONSOLE_BACKGROUND_KEY" value="${settings.colorScheme.bg.substring(1)}" />
    <option name="GUTTER_BACKGROUND" value="${settings.colorScheme.bg.substring(1)}" />
    <option name="INDENT_GUIDE" value="${adjustBrightness(settings.colorScheme.fg, -100).substring(1)}" />
    <option name="LINE_NUMBERS_COLOR" value="${adjustBrightness(settings.colorScheme.fg, -50).substring(1)}" />
    <option name="SELECTION_BACKGROUND" value="${adjustBrightness(settings.colorScheme.keyword, -100).substring(1)}" />
    <option name="SELECTION_FOREGROUND" value="${settings.colorScheme.fg.substring(1)}" />
  </colors>
  
  <attributes>
    <option name="DEFAULT_COMMENT">
      <value>
        <option name="FOREGROUND" value="${settings.colorScheme.comment.substring(1)}" />
        <option name="FONT_TYPE" value="2" />
      </value>
    </option>
    <option name="DEFAULT_STRING">
      <value>
        <option name="FOREGROUND" value="${settings.colorScheme.string.substring(1)}" />
      </value>
    </option>
    <option name="DEFAULT_KEYWORD">
      <value>
        <option name="FOREGROUND" value="${settings.colorScheme.keyword.substring(1)}" />
        <option name="FONT_TYPE" value="1" />
      </value>
    </option>
    <option name="DEFAULT_FUNCTION_DECLARATION">
      <value>
        <option name="FOREGROUND" value="${settings.colorScheme.function.substring(1)}" />
      </value>
    </option>
  </attributes>
</scheme>`
    }),
    
    iterm2: (settings) => ({
        filename: 'custom-font-theme.itermcolors',
        content: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Ansi 0 Color</key>
    <dict>
        <key>Color Space</key>
        <string>sRGB</string>
        <key>Red Component</key>
        <real>${hexToDecimal(settings.colorScheme.bg, 'r')}</real>
        <key>Green Component</key>
        <real>${hexToDecimal(settings.colorScheme.bg, 'g')}</real>
        <key>Blue Component</key>
        <real>${hexToDecimal(settings.colorScheme.bg, 'b')}</real>
        <key>Alpha Component</key>
        <real>1</real>
    </dict>
    <key>Ansi 1 Color</key>
    <dict>
        <key>Color Space</key>
        <string>sRGB</string>
        <key>Red Component</key>
        <real>${hexToDecimal(settings.colorScheme.comment, 'r')}</real>
        <key>Green Component</key>
        <real>${hexToDecimal(settings.colorScheme.comment, 'g')}</real>
        <key>Blue Component</key>
        <real>${hexToDecimal(settings.colorScheme.comment, 'b')}</real>
        <key>Alpha Component</key>
        <real>1</real>
    </dict>
    <key>Ansi 2 Color</key>
    <dict>
        <key>Color Space</key>
        <string>sRGB</string>
        <key>Red Component</key>
        <real>${hexToDecimal(settings.colorScheme.string, 'r')}</real>
        <key>Green Component</key>
        <real>${hexToDecimal(settings.colorScheme.string, 'g')}</real>
        <key>Blue Component</key>
        <real>${hexToDecimal(settings.colorScheme.string, 'b')}</real>
        <key>Alpha Component</key>
        <real>1</real>
    </dict>
    <key>Ansi 4 Color</key>
    <dict>
        <key>Color Space</key>
        <string>sRGB</string>
        <key>Red Component</key>
        <real>${hexToDecimal(settings.colorScheme.keyword, 'r')}</real>
        <key>Green Component</key>
        <real>${hexToDecimal(settings.colorScheme.keyword, 'g')}</real>
        <key>Blue Component</key>
        <real>${hexToDecimal(settings.colorScheme.keyword, 'b')}</real>
        <key>Alpha Component</key>
        <real>1</real>
    </dict>
    <key>Ansi 6 Color</key>
    <dict>
        <key>Color Space</key>
        <string>sRGB</string>
        <key>Red Component</key>
        <real>${hexToDecimal(settings.colorScheme.function, 'r')}</real>
        <key>Green Component</key>
        <real>${hexToDecimal(settings.colorScheme.function, 'g')}</real>
        <key>Blue Component</key>
        <real>${hexToDecimal(settings.colorScheme.function, 'b')}</real>
        <key>Alpha Component</key>
        <real>1</real>
    </dict>
    <key>Background Color</key>
    <dict>
        <key>Color Space</key>
        <string>sRGB</string>
        <key>Red Component</key>
        <real>${hexToDecimal(settings.colorScheme.bg, 'r')}</real>
        <key>Green Component</key>
        <real>${hexToDecimal(settings.colorScheme.bg, 'g')}</real>
        <key>Blue Component</key>
        <real>${hexToDecimal(settings.colorScheme.bg, 'b')}</real>
        <key>Alpha Component</key>
        <real>1</real>
    </dict>
    <key>Foreground Color</key>
    <dict>
        <key>Color Space</key>
        <string>sRGB</string>
        <key>Red Component</key>
        <real>${hexToDecimal(settings.colorScheme.fg, 'r')}</real>
        <key>Green Component</key>
        <real>${hexToDecimal(settings.colorScheme.fg, 'g')}</real>
        <key>Blue Component</key>
        <real>${hexToDecimal(settings.colorScheme.fg, 'b')}</real>
        <key>Alpha Component</key>
        <real>1</real>
    </dict>
</dict>
</plist>`
    }),
    
    gnomeTerminal: (settings) => ({
        filename: 'gnome-terminal-profile.dconf',
        content: `# GNOME Terminal profile settings
# To apply: dconf load /org/gnome/terminal/legacy/profiles:/:custom-profile/ < gnome-terminal-profile.dconf

[/]
background-color='${settings.colorScheme.bg}'
foreground-color='${settings.colorScheme.fg}'
font='${settings.font} ${settings.size}'
use-system-font=false
use-theme-colors=false
palette=['${settings.colorScheme.bg}', '${settings.colorScheme.comment}', '${settings.colorScheme.string}', '${adjustBrightness(settings.colorScheme.string, -20)}', '${settings.colorScheme.keyword}', '${adjustBrightness(settings.colorScheme.keyword, 20)}', '${settings.colorScheme.function}', '${settings.colorScheme.fg}', '${adjustBrightness(settings.colorScheme.bg, 40)}', '${adjustBrightness(settings.colorScheme.comment, 20)}', '${adjustBrightness(settings.colorScheme.string, 20)}', '${adjustBrightness(settings.colorScheme.string, 10)}', '${adjustBrightness(settings.colorScheme.keyword, 30)}', '${adjustBrightness(settings.colorScheme.keyword, 40)}', '${adjustBrightness(settings.colorScheme.function, 20)}', '${adjustBrightness(settings.colorScheme.fg, 20)}']
bold-color-same-as-fg=true
cursor-colors-set=true
cursor-background-color='${settings.colorScheme.fg}'
cursor-foreground-color='${settings.colorScheme.bg}'`
    })
};

// Helper functions for config generation
function getVSCodeTheme(colorScheme) {
    // Map to closest VSCode built-in theme based on background color
    const bg = colorScheme.bg.toLowerCase();
    if (bg === '#ffffff' || bg === '#f8f9fa') return 'Default Light+';
    if (bg === '#1a1a1a' || bg === '#282c34') return 'Dark+';
    if (bg === '#002b36') return 'Solarized Dark';
    return 'Dark+'; // fallback
}

function adjustBrightness(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.min(255, Math.max(0, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.min(255, Math.max(0, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.min(255, Math.max(0, parseInt(hex.substr(4, 2), 16) + amount));
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

function rgbToRegistry(color) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);  
    const b = parseInt(hex.substr(4, 2), 16);
    return `${r},${g},${b}`;
}

function hexToDecimal(color, component) {
    const hex = color.replace('#', '');
    let value;
    switch(component) {
        case 'r': value = parseInt(hex.substr(0, 2), 16); break;
        case 'g': value = parseInt(hex.substr(2, 2), 16); break;
        case 'b': value = parseInt(hex.substr(4, 2), 16); break;
        default: return 0;
    }
    return (value / 255).toFixed(6);
}

// Settings serialization
function exportSettings(settings) {
    const primaryFontName = (settings.font || '').split(',')[0].replace(/["']/g, '').trim();
    const fontId = (window.fontIdByName && window.fontIdByName[primaryFontName]) || 0;
    const schemeName = settings.colorScheme && settings.colorScheme.name;
    const schemeId = (window.schemeIdByName && window.schemeIdByName[themeMode] && window.schemeIdByName[themeMode][schemeName]) || 0;
    const size = settings.size|0;
    const weightIdx = Math.round((settings.weight||400)/100);
    const lh10 = Math.round((settings.lineHeight||1.5)*10);
    const fwIdx = Math.max(0, (['ultra-condensed','extra-condensed','condensed','semi-condensed','normal','semi-expanded','expanded','extra-expanded','ultra-expanded']).indexOf(settings.fontWidth||'normal'));
    const ls = Math.max(-128, Math.min(127, Math.round((settings.letterSpacing||0)*10)));
    const rolesMap = (engine && engine.winners && engine.winners.roles) ? engine.winners.roles : {};
    const normalizeRoleEntry = (v) => (typeof v === 'string') ? { font: v } : (v || {});
    const roleEntries = Object.entries(rolesMap)
        .filter(([k,v]) => v)
        .map(([k,v]) => ({ key:k, entry: normalizeRoleEntry(v) }))
        .map(({key,entry}) => ({
            rid: (ROLE_ID_BY_KEY && typeof ROLE_ID_BY_KEY[key] !== 'undefined') ? ROLE_ID_BY_KEY[key] : 0,
            fid: (window.fontIdByName && window.fontIdByName[entry.font]) || 0,
            wi: Math.round(((entry.weight ?? 400))/100),
            sf: (entry.style === 'italic') ? 1 : 0
        }))
        .filter(x => x.rid >= 0);

    // Build binary payload
    const header = [];
    header.push(0x43, 0x50); // 'C','P'
    header.push(0x01); // version
    let flags = 0;
    flags |= (themeMode === 'light') ? 0x01 : 0x00; // bit0 theme
    flags |= (roleEntries.length ? 0x02 : 0x00);        // bit1 roles present
    header.push(flags); // pad bits set later
    const bytes = [];
    const pushU16 = (n) => { bytes.push((n>>>8)&0xff, n&0xff); };
    const pushI8 = (n) => { bytes.push(n & 0xff); };
    const pushU8 = (n) => { bytes.push(n & 0xff); };
    pushU16(fontId);
    pushU8(size);
    pushU8(weightIdx);
    pushU8(lh10);
    pushU8(fwIdx);
    pushI8(ls+128);
    pushU16(schemeId);
    if (roleEntries.length) {
        pushU8(roleEntries.length);
        roleEntries.forEach(({rid,fid,wi,sf}) => { pushU8(rid); pushU16(fid); pushU8(wi); pushU8(sf); });
    }
    // Compute padding for 4-byte alignment
    const payload = new Uint8Array(header.length + bytes.length);
    for (let i=0;i<header.length;i++) payload[i]=header[i];
    for (let i=0;i<bytes.length;i++) payload[header.length+i]=bytes[i];
    let pad = (4 - (payload.length % 4)) % 4;
    payload[3] = payload[3] | (pad << 6); // store pad in flags high bits
    const padded = new Uint8Array(payload.length + pad);
    padded.set(payload);
    // Z85-encode
    return z85Encode(padded);
}

function importSettings(encoded) {
    const bytes = z85Decode(encoded);
    if (bytes[0] !== 0x43 || bytes[1] !== 0x50 || bytes[2] !== 0x01) throw new Error('Invalid header');
    const flags = bytes[3];
    const isLight = !!(flags & 0x01);
    const hasRoles = !!(flags & 0x02);
    const pad = (flags >> 6) & 0x03;
    let off = 4;
    const readU16 = () => { const v = (bytes[off]<<8) | bytes[off+1]; off+=2; return v; };
    const readU8 = () => bytes[off++];
    const fontId = readU16();
    const size = readU8();
    const weightIdx = readU8();
    const lh10 = readU8();
    const fwIdx = readU8();
    const ls = (readU8() - 128) / 10;
    const schemeId = readU16();
    let rolesMapping = null;
    if (hasRoles) {
        const n = readU8();
        rolesMapping = {};
        for (let i=0;i<n;i++) {
            const rid = readU8();
            const fid = readU16();
            const wi = readU8();
            const sf = readU8();
            const rname = (ROLE_KEY_BY_ID && ROLE_KEY_BY_ID[rid]) || `r${rid}`;
            const fname = (window.fontNameById && window.fontNameById[fid]) || null;
            rolesMapping[rname] = fname ? { font: fname, weight: wi*100, style: sf ? 'italic' : 'normal' } : null;
        }
    }
    const fontName = (window.fontNameById && window.fontNameById[fontId]) || '';
    const fontCss = fontName ? `"${fontName}", "Redacted Script"` : settings.font;
    const scheme = (window.schemeById && window.schemeById[isLight?'light':'dark'] && window.schemeById[isLight?'light':'dark'][schemeId]) || null;
    return {
        fontFamily: null,
        font: fontCss,
        size,
        weight: weightIdx*100,
        lineHeight: lh10/10,
        fontWidth: (['ultra-condensed','extra-condensed','condensed','semi-condensed','normal','semi-expanded','expanded','extra-expanded','ultra-expanded'])[fwIdx] || 'normal',
        letterSpacing: ls,
        colorSchemeName: scheme ? scheme.name : null,
        themeMode: isLight ? 'light' : 'dark',
        multiFont: !!rolesMapping,
        rolesPresetKey: null,
        rolesMapping
    };
}

// Copy settings to clipboard
function copySettings() {
    const results = engine.winners;
    
    // Check if the winning font is available locally
    const fontName = results.font.replace(/["']/g, '').split(',')[0].trim();
    const fontAvailable = isFontAvailable(fontName);
    
    // Get download info for the font if needed
    const fontDownloadInfo = !fontAvailable ? getFontDownloadInfo(fontName) : null;
    
    // Add font download instructions if needed
    const fontInstructions = !fontAvailable && fontDownloadInfo ? 
        `/* ⚠️ Font '${fontName}' is not installed on your system */\n/* Download from: ${fontDownloadInfo.url} */\n/* ${fontDownloadInfo.instructions} */\n\n` : '';
    
    // Base settings CSS
    let css = `/* Your optimized code display settings */
${fontInstructions}font-family: ${results.font};
font-size: ${results.size}px;
font-weight: ${results.weight};
line-height: ${results.lineHeight};
background-color: ${results.colorScheme.bg};
color: ${results.colorScheme.fg};

/* Syntax highlighting */
.keyword { color: ${results.colorScheme.keyword}; }
.string { color: ${results.colorScheme.string}; }
.comment { color: ${results.colorScheme.comment}; }
.function { color: ${results.colorScheme.function}; }`;

    // Append multi-font role CSS if enabled
    if (multiFontMode && currentRoleCss) {
        css += `\n\n/* Multi-Font Roles (highlight.js selectors) */\n${currentRoleCss}`;
    }
    
    // Create comprehensive export data
    const exportData = {
        settings: results,
        css: css,
        timestamp: new Date().toISOString(),
        version: '1.0',
        multiFont: !!multiFontMode,
        roles: {
            presetKey: currentRolesPresetKey || null,
            mapping: currentRoleMapping || null
        },
        fontInfo: {
            name: fontName,
            available: fontAvailable,
            downloadUrl: fontDownloadInfo?.url || null,
            downloadInstructions: fontDownloadInfo?.instructions || null
        }
    };
    
    // Add settings data as comment for reimport
    const fullExport = css + `\n\n/* Settings Data (for import): */\n/* ${JSON.stringify(exportData)} */`;
    
    navigator.clipboard.writeText(fullExport).then(() => {
        // Show download prompt if font is missing
        if (!fontAvailable && fontDownloadInfo) {
            const message = `CSS settings copied! \n\nThe font '${fontName}' is not installed on your system.\nWould you like to download it?`;
            if (confirm(message)) {
                window.open(fontDownloadInfo.url, '_blank');
            }
        } else {
            alert('CSS settings copied to clipboard!');
        }
    }).catch(() => {
        alert('Failed to copy to clipboard. Please select and copy manually.');
    });
}

// Generate README.txt content
function generateReadme(fontName, fontInfo, results) {
    // Optional roles block for multi-font mode
    let rolesBlock = '';
    if (engine && engine.winners && engine.winners.roles && Object.keys(engine.winners.roles).length) {
        const roleOrder = Object.keys(roleToHLJS || {});
        const lines = roleOrder
            .map(r => {
                const primary = engine.winners.roles[r];
                return primary ? `${getRoleLabel(r)}: ${primary}` : null;
            })
            .filter(Boolean);
        if (lines.length) {
            rolesBlock = `\n----- Roles ----\n${lines.join('\n')}`;
        }
    }
    return `Code Phoropter - Font Configuration Package
============================================

Font: ${fontName}
Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

INSTALLATION INSTRUCTIONS
========================

1. INSTALL THE FONT
   ${fontInfo.type === 'system' ? 
     `This is a system font that should already be installed on your system.
   If not available, ${fontInfo.instructions}` :
     fontInfo.type === 'commercial' ?
     `This is a commercial font. ${fontInfo.instructions}` :
     `This is a free font. Extract the font files from this package and:
   
   Windows:
   - Right-click on the .ttf/.otf files and select "Install"
   - Or copy files to C:\\Windows\\Fonts\\
   
   macOS:
   - Double-click the .ttf/.otf files and click "Install Font"
   - Or copy files to ~/Library/Fonts/ (user) or /Library/Fonts/ (system)
   
   Linux:
   - Copy files to ~/.fonts/ (user) or /usr/share/fonts/ (system)
   - Run: fc-cache -f -v`}

2. APPLY THE SETTINGS
   Use the settings from config.css in your code editor:
   
   Font Family: ${results.font}
   Font Size: ${results.size}px
   Font Weight: ${results.weight}
   Line Height: ${results.lineHeight}
   Background: ${results.colorScheme.bg}
   Text Color: ${results.colorScheme.fg}${rolesBlock}

3. EDITOR CONFIGURATION
   
   VS Code:
   Add to settings.json:
   {
     "editor.fontFamily": ${results.font},
     "editor.fontSize": ${results.size},
     "editor.fontWeight": "${results.weight}",
     "editor.lineHeight": ${results.lineHeight}
   }
   
   Sublime Text:
   Add to Preferences > Settings:
   {
     "font_face": "${fontName}",
     "font_size": ${results.size},
     "line_padding_top": 1,
     "line_padding_bottom": 1
   }
   
   Vim/NeoVim:
   Add to .vimrc:
   set guifont=${fontName}:h${results.size}
   
   Terminal:
   Configure your terminal to use "${fontName}" at ${results.size}pt

TROUBLESHOOTING
==============

If the font doesn't appear in your editor:
1. Restart your editor after installing the font
2. Check that the font name matches exactly (case-sensitive)
3. Verify the font is properly installed system-wide
4. Some editors require the exact PostScript name of the font

For support, visit: https://github.com/your-repo/code-phoropter

Happy coding with your optimized font settings!
`;
}

// Download font package with configuration
async function downloadFontPackage() {
    const results = engine.winners;
    const fontName = results.font.replace(/["']/g, '').split(',')[0].trim();
    const fontInfo = getFontDownloadInfo(fontName);
    
    if (!fontInfo) {
        alert('Font download information not available for this font.');
        return;
    }
    
    // Create ZIP file
    const zip = new JSZip();
    
    // Add configuration file
    let css = `/* Your optimized code display settings */
/* Generated by Code Phoropter on ${new Date().toLocaleDateString()} */

font-family: ${results.font};
font-size: ${results.size}px;
font-weight: ${results.weight};
line-height: ${results.lineHeight};
background-color: ${results.colorScheme.bg};
color: ${results.colorScheme.fg};

/* Syntax highlighting colors */
.keyword { color: ${results.colorScheme.keyword}; }
.string { color: ${results.colorScheme.string}; }
.comment { color: ${results.colorScheme.comment}; }
.function { color: ${results.colorScheme.function}; }

/* Multi-Font Roles (optional) */
/* Uncomment and adjust if using multiple fonts per syntax role */`;

    if (multiFontMode && currentRoleCss) {
        css += `\n${currentRoleCss}`;
    }

    css += `

/* VS Code settings.json snippet */
/*
{
  "editor.fontFamily": ${results.font},
  "editor.fontSize": ${results.size},
  "editor.fontWeight": "${results.weight}",
  "editor.lineHeight": ${results.lineHeight},
  "workbench.colorTheme": "your-preferred-theme"
}
*/`;
    
    zip.file('config.css', css);
    
    // Add README
    const readme = generateReadme(fontName, fontInfo, results);
    zip.file('README.txt', readme);
    
    // Add settings data for import
    const exportData = {
        settings: results,
        css: css,
        timestamp: new Date().toISOString(),
        version: '1.0',
        multiFont: !!multiFontMode,
        roles: {
            presetKey: currentRolesPresetKey || null,
            mapping: currentRoleMapping || null
        },
        fontInfo: {
            name: fontName,
            downloadUrl: fontInfo?.downloadUrl || null,
            instructions: fontInfo?.instructions || null,
            type: fontInfo?.type || 'unknown'
        }
    };
    zip.file('settings.json', JSON.stringify(exportData, null, 2));
    
    // Try to download font files if available and free
    if (fontInfo.type === 'free' && fontInfo.downloadUrl) {
        try {
            // Show download progress
            const button = event.target;
            const originalText = button.textContent;
            button.textContent = 'Preparing download...';
            button.disabled = true;
            
            // For Google Fonts, we can't directly download, so add instructions
            if (fontInfo.downloadUrl.includes('fonts.google.com/download')) {
                zip.file('FONT_DOWNLOAD.txt', 
                    `Font Download Instructions for ${fontName}
====================================

This package includes your configuration but not the font files themselves.
To get the font files:

1. Visit: ${fontInfo.downloadUrl}
2. Click "Download family" to get a ZIP file
3. Extract the font files (.ttf) from the downloaded ZIP
4. Install the fonts on your system (see README.txt)

The font files should be placed in this same folder if you want 
a complete package for distribution.

Note: Due to browser security restrictions, font files cannot be 
automatically downloaded from Google Fonts.`);
            } else {
                // For other free fonts with direct download links, add placeholder
                zip.file('FONT_DOWNLOAD.txt', 
                    `Font files not included - Download separately from:
${fontInfo.downloadUrl}

Extract font files to this folder after downloading.`);
            }
            
            button.textContent = originalText;
            button.disabled = false;
            
        } catch (error) {
            console.log('Could not automatically include font files:', error);
        }
    } else if (fontInfo.type === 'commercial') {
        zip.file('COMMERCIAL_FONT.txt', 
            `This is a commercial font: ${fontName}
=====================================

Font files are NOT included due to licensing restrictions.
You must purchase and download this font separately.

Purchase from: ${fontInfo.url}
${fontInfo.instructions}

Once purchased and installed, use the config.css settings
in this package with your legally obtained font files.`);
    } else if (fontInfo.type === 'system') {
        zip.file('SYSTEM_FONT.txt', 
            `This is a system font: ${fontName}
===============================

This font should already be installed on your system.
No additional download required.

If the font is missing: ${fontInfo.instructions}

Use the config.css settings in this package.`);
    }
    
    // Generate and download ZIP
    try {
        const content = await zip.generateAsync({type: 'blob'});
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code-phoropter-${fontName.replace(/\s+/g, '-').toLowerCase()}-config.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert(`Font package downloaded! Contains configuration files and installation instructions for ${fontName}.`);
    } catch (error) {
        console.error('Error creating ZIP file:', error);
        alert('Failed to create download package. Please try copying the settings instead.');
    }
}

// Toggle theme mode
function toggleThemeMode() {
    const toggle = document.getElementById('themeToggle');
    const label = document.getElementById('toggleLabel');
    
    if (toggle.checked) {
        themeMode = 'light';
        label.textContent = 'Light Mode';
        document.body.classList.add('light-theme');
    } else {
        themeMode = 'dark';
        label.textContent = 'Dark Mode';
        document.body.classList.remove('light-theme');
    }
    
    // Update color schemes in the current engine instead of resetting
    if (engine.candidates && engine.candidates.colorScheme) {
        engine.candidates.colorScheme = [...((window.colorSchemeDatabase || {})[themeMode] || [])];
    }
    
    // If we're currently in the colorScheme stage, regenerate pairs
    if (engine.stage === 'colorScheme') {
        engine.generateNextStage();
    }
    
    // Update current comparison if one is active
    const comparison = engine.getNextComparison();
    if (comparison && !comparison.showFontFamilySelector) {
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

// Handle '?' key for showing/hiding property summaries
document.addEventListener('keydown', function(e) {
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        document.body.classList.add('show-summaries');
    } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        toggleGrid();
    }
});

document.addEventListener('keyup', function(e) {
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        document.body.classList.remove('show-summaries');
    }
});

// Re-compare specific stage
function recompareStage(stage) {
    // Store current results
    const currentResults = { ...engine.winners };
    
    // Create a new engine just for this single stage
    engine.recompareMode = true;
    engine.recompareStage = stage;
    engine.recompareResults = currentResults;
    
    // Reset only the specified stage
    engine.winners[stage] = null;
    engine.stage = stage;
    engine.stageComparisons[stage] = 0;
    engine.preferredColorSchemes = [];
    engine.complete = false;
    
    // Set up candidates for the specific stage
    switch(stage) {
        case 'fontFamily':
            engine.fontFamilySelectionMode = true;
            break;
        case 'font':
            if (currentResults.fontFamily) {
                engine.candidates.font = [...fontFamilies[currentResults.fontFamily].fonts];
            }
            break;
        case 'size':
            engine.candidates.size = [...fontSizes];
            break;
        case 'weight':
            engine.candidates.weight = [...fontWeights];
            break;
        case 'lineHeight':
            engine.candidates.lineHeight = [...lineHeights];
            break;
        case 'fontWidth':
            // Dynamically populate based on font support
            const selectedFont = engine.currentResults?.fontFamily || 'Consolas';
            const supportedWidths = detectFontWidthSupport(selectedFont);
            engine.candidates.fontWidth = supportedWidths.length > 0 ? supportedWidths : [];
            break;
        case 'letterSpacing':
            engine.candidates.letterSpacing = [...letterSpacings];
            break;
        case 'colorScheme':
            engine.candidates.colorScheme = [...((window.colorSchemeDatabase || {})[themeMode] || [])];
            break;
    }
    
    engine.generateNextStage();
    
    // Hide results and show comparison interface
    document.getElementById('results').classList.add('hidden');
    document.getElementById('progressFill').style.width = '0%';
    showNextComparison();
}

// Download configuration for specific editor
// Installation instructions for each editor
const installationInstructions = {
    vscode: {
        title: 'VS Code Installation',
        steps: [
            'Open VS Code',
            'Press <code>Ctrl+Shift+P</code> (or <code>Cmd+Shift+P</code> on Mac)',
            'Type "Preferences: Open Settings (JSON)"',
            'Add/merge the downloaded settings into your <code>settings.json</code> file',
            'Save the file - changes apply immediately'
        ]
    },
    vim: {
        title: 'Vim Installation',
        steps: [
            'Copy the downloaded <code>.vimrc</code> content',
            'Open your <code>~/.vimrc</code> file (create if it doesn\'t exist)',
            'Add the font configuration lines to your .vimrc',
            'Save and restart Vim or run <code>:source ~/.vimrc</code>',
            'For GUI Vim (gvim): Font changes apply immediately',
            'For terminal Vim: Only colors will work (font controlled by terminal)'
        ]
    },
    emacs: {
        title: 'Emacs Installation',
        steps: [
            'Copy the downloaded <code>init.el</code> content',
            'Open your Emacs configuration file (~/.emacs.d/init.el)',
            'Add the configuration lines to your init file',
            'Save and restart Emacs or evaluate with <code>M-x eval-buffer</code>',
            'Changes will apply to the current session'
        ]
    },
    windowsTerminal: {
        title: 'Windows Terminal Installation',
        steps: [
            'Open Windows Terminal',
            'Press <code>Ctrl+,</code> to open settings',
            'Click "Open JSON file" at the bottom left',
            'Merge the downloaded JSON with your existing settings',
            'Save the file - changes apply immediately to new terminals'
        ]
    },
    iterm2: {
        title: 'iTerm2 Installation',
        steps: [
            'Download the <code>.itermcolors</code> file',
            'In iTerm2, go to <strong>Preferences</strong> → <strong>Profiles</strong> → <strong>Colors</strong>',
            'Click <strong>Color Presets...</strong> → <strong>Import...</strong>',
            'Select the downloaded .itermcolors file',
            'Select the imported preset from the dropdown',
            'Go to <strong>Text</strong> tab to set font family and size manually'
        ]
    },
    gnomeTerminal: {
        title: 'GNOME Terminal Installation',
        steps: [
            'Open Terminal',
            'Go to <strong>Preferences</strong> → <strong>Profiles</strong>',
            'Select your profile or create a new one',
            'In <strong>Text</strong> tab: Set custom font family and size',
            'In <strong>Colors</strong> tab: Use custom colors and set the color values manually',
            'Close preferences - changes apply immediately'
        ]
    },
    putty: {
        title: 'PuTTY Installation',
        steps: [
            'Save the downloaded <code>.reg</code> file',
            'Double-click the .reg file to merge with Windows Registry',
            'Click "Yes" to confirm the registry modification',
            'Open PuTTY - font and color settings will be in Default Settings',
            'Create/modify sessions to use these settings'
        ]
    },
    sublimeText: {
        title: 'Sublime Text Installation',
        steps: [
            'Open Sublime Text',
            'Go to <strong>Preferences</strong> → <strong>Settings</strong>',
            'Add the downloaded settings to your user settings file',
            'Save the settings file',
            'Install color scheme: Go to <strong>Preferences</strong> → <strong>Color Scheme</strong> → <strong>Customize Color Scheme</strong>',
            'Add the color customizations and save'
        ]
    },
    atom: {
        title: 'Atom Installation',
        steps: [
            'Open Atom',
            'Go to <strong>File</strong> → <strong>Config</strong> (or <strong>Atom</strong> → <strong>Config</strong> on Mac)',
            'Add the downloaded configuration to your config.cson file',
            'Save the file',
            'Restart Atom for font changes to take effect',
            'Color changes may require installing a custom syntax theme package'
        ]
    },
    intellij: {
        title: 'IntelliJ/JetBrains Installation',
        steps: [
            'Download the <code>.icls</code> color scheme file',
            'In IntelliJ, go to <strong>File</strong> → <strong>Settings</strong> → <strong>Editor</strong> → <strong>Color Scheme</strong>',
            'Click the gear icon → <strong>Import Scheme</strong> → <strong>IntelliJ IDEA color scheme (.icls)</strong>',
            'Select the downloaded .icls file and import',
            'Go to <strong>Editor</strong> → <strong>Font</strong> to set font family and size manually',
            'Apply and close settings'
        ]
    }
};

function downloadConfig(editor) {
    const results = engine.winners;
    const template = configTemplates[editor];
    if (!template) return;
    
    const config = template(results);
    const blob = new Blob([config.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = config.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show installation instructions after download
    showInstallationInstructions(editor);
}

function showInstallationInstructions(editor) {
    const instructions = installationInstructions[editor];
    if (!instructions) return;
    
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'instruction-modal';
    modal.innerHTML = `
        <div class="instruction-content">
            <div class="instruction-header">
                <h3>${instructions.title}</h3>
                <button class="close-btn" onclick="this.closest('.instruction-modal').remove()">×</button>
            </div>
            <div class="instruction-body">
                <ol>
                    ${instructions.steps.map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
            <div class="instruction-footer">
                <button onclick="this.closest('.instruction-modal').remove()">Got it!</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Auto-remove after 30 seconds
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
        }
    }, 30000);
}

// Copy text to clipboard
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    element.select();
    element.setSelectionRange(0, 99999); // For mobile
    document.execCommand('copy');
    
    // Visual feedback
    const button = element.nextElementSibling;
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    setTimeout(() => {
        button.textContent = originalText;
    }, 1000);
}

// Import settings and start with those preferences
function importAndStart() {
    const importInput = document.getElementById('importSettings');
    const settingsString = importInput.value.trim();
    
    if (!settingsString) {
        alert('Please paste a settings string first');
        return;
    }
    
    try {
        const imported = importSettings(settingsString);
        
        // Set theme mode
        themeMode = imported.themeMode || 'dark';
        document.getElementById('themeToggle').checked = themeMode === 'light';
        document.getElementById('toggleLabel').textContent = themeMode === 'light' ? 'Light Mode' : 'Dark Mode';
        if (themeMode === 'light') {
            document.body.classList.add('light-theme');
        }
        
        // Pre-populate engine with imported settings
        engine = new ComparisonEngine();
        engine.winners = {
            fontFamily: imported.fontFamily,
            font: imported.font,
            size: imported.size,
            weight: imported.weight,
            lineHeight: imported.lineHeight,
            colorScheme: (((window.colorSchemeDatabase || {})[imported.themeMode] || []).find(c => c.name === imported.colorSchemeName)) || (((window.colorSchemeDatabase || {})[imported.themeMode] || [null])[0])
        };
        engine.complete = true;

        // Restore roles if present
        if (imported.multiFont) {
            engine.winners.roles = imported.rolesMapping || {};
            try { applyRoleFonts(engine.winners.roles); } catch {}
        }
        
        // Hide import section and show results
        document.getElementById('importSection').classList.add('hidden');
        showResults();
        
    } catch (e) {
        alert('Invalid settings string: ' + e.message);
    }
}

// Show initial start screen with import option
function showStartScreen() {
    document.querySelector('.description-section').classList.remove('hidden');
    document.getElementById('fontFamilySelector').classList.remove('hidden');
    document.querySelector('.comparison-container').style.display = 'none';
    document.getElementById('status').textContent = 'Import previous settings or choose your preferred font style';
    
    // Populate the font family selector (but keep description/import visible)
    showFontFamilySelector(true); // Pass flag to indicate this is for start screen
}

// Font similarity system - simplified approach for tournament enhancement
// Font metrics compatibility checking
const fontCompatibility = {
    isWidthCompatible(font1, font2, tolerance = 0.02) {
        const metrics1 = window.fontMetrics?.[font1];
        const metrics2 = window.fontMetrics?.[font2];
        
        if (!metrics1 || !metrics2) {
            console.log(`[DEBUG] Missing metrics for width comparison: ${font1}=${!!metrics1}, ${font2}=${!!metrics2}`);
            return false;
        }
        
        if (!metrics1.monospace || !metrics2.monospace) {
            console.log(`[DEBUG] Non-monospace font detected: ${font1}=${metrics1.monospace}, ${font2}=${metrics2.monospace}`);
            return false;
        }
        
        const width1 = metrics1.avgCharWidth?.["16"];
        const width2 = metrics2.avgCharWidth?.["16"];
        
        if (!width1 || !width2) {
            console.log(`[DEBUG] Missing width data: ${font1}=${width1}, ${font2}=${width2}`);
            return false;
        }
        
        const diff = Math.abs(width1 - width2) / width1;
        const compatible = diff <= tolerance;
        
        console.log(`[DEBUG] Width compatibility: ${font1} (${width1.toFixed(2)}px) vs ${font2} (${width2.toFixed(2)}px) = ${(diff*100).toFixed(1)}% diff → ${compatible ? 'COMPATIBLE' : 'REJECTED'}`);
        return compatible;
    },
    
    isXHeightCompatible(font1, font2, tolerance = 0.15) {
        const metrics1 = window.fontMetrics?.[font1];
        const metrics2 = window.fontMetrics?.[font2];
        
        if (!metrics1 || !metrics2) return false;
        
        const xHeight1 = metrics1.xHeight?.["16"];
        const xHeight2 = metrics2.xHeight?.["16"];
        
        if (!xHeight1 || !xHeight2) return true; // Allow if we can't measure
        
        const diff = Math.abs(xHeight1 - xHeight2) / xHeight1;
        const compatible = diff <= tolerance;
        
        console.log(`[DEBUG] xHeight compatibility: ${font1} (${xHeight1.toFixed(2)}px) vs ${font2} (${xHeight2.toFixed(2)}px) = ${(diff*100).toFixed(1)}% diff → ${compatible ? 'COMPATIBLE' : 'REJECTED'}`);
        return compatible;
    },
    
    isCompatible(font1, font2) {
        return this.isWidthCompatible(font1, font2) && this.isXHeightCompatible(font1, font2);
    },
    
    getCompatibleFonts(baseFont) {
        if (!window.fontMetrics || !baseFont) return [];
        
        const compatible = [];
        const db = window.fontDatabase || [];
        
        for (const font of db) {
            if (font.name !== baseFont && this.isCompatible(baseFont, font.name)) {
                compatible.push(font.name);
            }
        }
        
        console.log(`[DEBUG] Found ${compatible.length} fonts compatible with ${baseFont}: ${compatible.slice(0, 3).join(', ')}${compatible.length > 3 ? '...' : ''}`);
        return compatible;
    }
};

const fontSimilarity = {
    // Font characteristics database - simplified for practical implementation
    traits: {
        // Each font gets scores for key distinguishing characteristics (0-10 scale)
        'Fira Code': { width: 6, weight: 4, style: 2, personality: 4, ligatures: 10 },
        'JetBrains Mono': { width: 5, weight: 4, style: 2, personality: 3, ligatures: 10 },
        'Cascadia Code': { width: 5, weight: 4, style: 3, personality: 3, ligatures: 10 },
        'Source Code Pro': { width: 5, weight: 4, style: 2, personality: 2, ligatures: 0 },
        'IBM Plex Mono': { width: 5, weight: 4, style: 3, personality: 3, ligatures: 0 },
        'Roboto Mono': { width: 5, weight: 4, style: 2, personality: 2, ligatures: 0 },
        'Consolas': { width: 5, weight: 4, style: 3, personality: 2, ligatures: 0 },
        'Monaco': { width: 5, weight: 5, style: 2, personality: 3, ligatures: 0 },
        'SF Mono': { width: 5, weight: 4, style: 2, personality: 2, ligatures: 0 },
        'Ubuntu Mono': { width: 6, weight: 4, style: 3, personality: 3, ligatures: 0 },
        'Inconsolata': { width: 5, weight: 4, style: 2, personality: 3, ligatures: 0 },
        'Hack': { width: 5, weight: 4, style: 2, personality: 2, ligatures: 0 },
        'Space Mono': { width: 6, weight: 4, style: 3, personality: 7, ligatures: 0 },
        'Courier Prime': { width: 6, weight: 4, style: 4, personality: 5, ligatures: 0 },
        'Courier New': { width: 6, weight: 4, style: 4, personality: 2, ligatures: 0 },
        'Anonymous Pro': { width: 6, weight: 4, style: 2, personality: 4, ligatures: 0 },
        'VT323': { width: 5, weight: 4, style: 0, personality: 10, ligatures: 0 },
        'Press Start 2P': { width: 8, weight: 6, style: 0, personality: 10, ligatures: 0 },
        'Operator Mono': { width: 5, weight: 3, style: 5, personality: 8, ligatures: 0 },
        'MonoLisa': { width: 5, weight: 4, style: 3, personality: 6, ligatures: 0 },
        'Comic Code': { width: 5, weight: 4, style: 3, personality: 9, ligatures: 0 },
        'Input Mono': { width: 5, weight: 4, style: 3, personality: 5, ligatures: 0 },
        'Go Mono': { width: 6, weight: 4, style: 3, personality: 3, ligatures: 0 },
        'Victor Mono': { width: 5, weight: 3, style: 4, personality: 7, ligatures: 10 },
        'Iosevka': { width: 3, weight: 3, style: 2, personality: 6, ligatures: 10 },
        'Recursive': { width: 5, weight: 4, style: 3, personality: 6, ligatures: 10 },
        'Dank Mono': { width: 5, weight: 4, style: 4, personality: 8, ligatures: 0 },
        'Intel One Mono': { width: 5, weight: 4, style: 2, personality: 3, ligatures: 0 },
        'JuliaMono': { width: 5, weight: 4, style: 3, personality: 5, ligatures: 0 },
        'Monocraft': { width: 5, weight: 4, style: 0, personality: 10, ligatures: 0 },
        'Hasklig': { width: 5, weight: 4, style: 3, personality: 3, ligatures: 10 },
        'Geist Mono': { width: 5, weight: 4, style: 2, personality: 3, ligatures: 0 },
        'Red Hat Mono': { width: 5, weight: 4, style: 2, personality: 3, ligatures: 0 },
        'DM Mono': { width: 5, weight: 3, style: 3, personality: 4, ligatures: 0 },
        'Noto Sans Mono': { width: 5, weight: 4, style: 2, personality: 2, ligatures: 0 },
        'Liberation Mono': { width: 5, weight: 4, style: 3, personality: 2, ligatures: 0 },
        'DejaVu Sans Mono': { width: 5, weight: 4, style: 2, personality: 2, ligatures: 0 },
        'APL2741': { width: 5, weight: 4, style: 0, personality: 10, ligatures: 0 },
        'APL385 Unicode': { width: 5, weight: 4, style: 0, personality: 10, ligatures: 0 },
        '_default': { width: 5, weight: 4, style: 3, personality: 5, ligatures: 0 }
    },
    
    // Calculate similarity between two fonts (0-100, higher = more similar)
    calculate(font1, font2) {
        const extractName = (font) => font.replace(/[\"']/g, '').split(',')[0].trim();
        const name1 = extractName(font1);
        const name2 = extractName(font2);
        
        const traits1 = this.traits[name1] || this.traits._default;
        const traits2 = this.traits[name2] || this.traits._default;
        
        // Calculate weighted distance
        let totalDiff = 0;
        const weights = { width: 1.0, weight: 1.0, style: 0.8, personality: 1.2, ligatures: 1.5 };
        let totalWeight = 0;
        
        for (const [key, weight] of Object.entries(weights)) {
            const diff = Math.abs(traits1[key] - traits2[key]);
            totalDiff += diff * weight;
            totalWeight += weight * 10; // Max diff per dimension is 10
        }
        
        // Convert to similarity score (0-100)
        return Math.max(0, 100 - (totalDiff / totalWeight * 100));
    },
    
    // Group fonts by similarity ranges for progressive tournament
    categorize(similarity) {
        if (similarity >= 80) return 'very-similar';
        if (similarity >= 60) return 'similar';
        if (similarity >= 40) return 'different';
        return 'very-different';
    },
    
    // Generate smart font pairs for tournament progression
    generateProgressivePairs(fonts, round = 1) {
        const pairs = [];
        const maxRounds = 3; // Reduced tournament rounds
        
        // Target similarity based on round (avoid 100% similar forks)
        const targetSimilarities = {
            1: [30, 50],   // Start with moderately similar fonts
            2: [50, 70],   // More similar fonts  
            3: [60, 85]    // Similar fonts (avoid 100% forks)
        };
        
        const [minSim, maxSim] = targetSimilarities[round] || [0, 100];
        
        // Generate all possible pairs and score them
        const scoredPairs = [];
        for (let i = 0; i < fonts.length - 1; i++) {
            for (let j = i + 1; j < fonts.length; j++) {
                const similarity = this.calculate(fonts[i], fonts[j]);
                if (similarity >= minSim && similarity <= maxSim) {
                    scoredPairs.push({
                        pair: [fonts[i], fonts[j]],
                        similarity: similarity,
                        roundFit: round // How well this fits the current round
                    });
                }
            }
        }
        
        // Sort by how well they fit the round's target similarity
        scoredPairs.sort((a, b) => {
            const aDistance = Math.min(
                Math.abs(a.similarity - minSim),
                Math.abs(a.similarity - maxSim)
            );
            const bDistance = Math.min(
                Math.abs(b.similarity - minSim),
                Math.abs(b.similarity - maxSim)
            );
            return aDistance - bDistance;
        });
        
        // Return best pairs for this round
        return scoredPairs.slice(0, Math.min(8, scoredPairs.length)).map(sp => sp.pair);
    }
};

// Helper function to get font download information
function getFontDownloadInfo(fontName) {
    const entry = (window.fontDatabase || []).find(f => (f.name || '').toLowerCase() === (fontName || '').toLowerCase());
    if (entry) {
        const ttf = entry.ttf || null;
        const otf = entry.otf || null;
        const woff2 = entry.woff2 || null;
        const primary = ttf || otf || woff2 || null;
        const homepage = entry.homepage || null;
        const isSystem = entry.source === 'system';
        const hasDownload = Boolean(primary);
        return {
            url: homepage || primary || `https://www.google.com/search?q=${encodeURIComponent(fontName + ' font download')}`,
            downloadUrl: primary,
            instructions: isSystem && !hasDownload
                ? 'Install or purchase this font on your system'
                : 'Download and install the font from the link',
            type: isSystem && !hasDownload ? 'system' : 'free',
            ttf, otf, woff2
        };
    }
    return {
        url: `https://www.google.com/search?q=${encodeURIComponent(fontName + ' font download')}`,
        instructions: 'Search for this font online'
    };
}

// Dynamic About Page Table Generation
function generateAboutPageTables() {
    const fontTableContainer = document.getElementById('fontTableBody');
    const darkSchemesContainer = document.getElementById('darkSchemesTableBody');
    const lightSchemesContainer = document.getElementById('lightSchemesTableBody');
    if (!fontTableContainer || !darkSchemesContainer || !lightSchemesContainer) return;

    const build = (installedNames) => {
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

function generateFontTable(container, installedNames) {
    const sourceLabels = { google: 'Google Fonts', embedded: 'Embedded', system: 'System' };
    const sampleText = 'if(l==1||O[0]){$file+=~l*10}';
    const fonts = (window.fontDatabase || []).slice().sort((a,b) => (a.name||'').localeCompare(b.name||''));
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
function buildTypographicDescription(font) {
    const parts = [];
    const cat = (font.category || font.family || '').toLowerCase();
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

function generateColorSchemeTable(mode, container) {
    const schemes = ((window.colorSchemeDatabase || {})[mode] || []).slice().sort((a,b) => (a.name||'').localeCompare(b.name||''));
    let html = '';
    const sampleCode = `const API_URL = "https://api.io"; // prod\nlet items = [{id: 1, active: true}];\nasync function getData(limit = 10) {}`;
    const getToken = (val) => {
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
        const weight = (tok) => tok.bold ? 'font-weight:600;' : '';
        const italic = (tok) => tok.italic ? 'font-style:italic;' : '';
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

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    initDevConfig();
    if (document.getElementById('app')) {
        // Main app page
        init();
    } else {
        // About page: load databases, then render tables
        loadDatabases()
            .then(() => {
                // Load embedded fonts so samples render in their typefaces
                try { loadCustomFonts(); } catch {}
                generateAboutPageTables();
            })
            .catch(e => console.warn('[About] Failed to load databases:', e));
    }
});


// ID maps for compact settings encoding
function buildIdMaps() {
    try {
        // Helper for 16-bit stable id from name (used if explicit id missing)
        const crc16 = (str) => {
            let h = 0xffff;
            for (let i=0;i<str.length;i++) {
                h ^= str.charCodeAt(i) & 0xff;
                for (let j=0;j<8;j++) {
                    const tmp = h & 1; h >>= 1; if (tmp) h ^= 0xA001;
                }
            }
            return h & 0xffff;
        };

        // Fonts
        const fonts = (window.fontDatabase || []).slice().sort((a,b) => (a.name||'').localeCompare(b.name||''));
        window.fontIdByName = {};
        window.fontNameById = {};
        const used = new Set();
        fonts.forEach((f) => {
            let id = typeof f.id === 'number' ? (f.id & 0xffff) : crc16(f.name || '');
            while (used.has(id)) id = (id + 1) & 0xffff; // resolve rare collisions
            used.add(id);
            window.fontIdByName[f.name] = id;
            window.fontNameById[id] = f.name;
        });

        // Schemes (dark/light)
        const dark = ((window.colorSchemeDatabase || {}).dark || []).slice().sort((a,b) => (a.name||'').localeCompare(b.name||''));
        const light = ((window.colorSchemeDatabase || {}).light || []).slice().sort((a,b) => (a.name||'').localeCompare(b.name||''));
        window.schemeIdByName = { dark: {}, light: {} };
        window.schemeById = { dark: {}, light: {} };
        const usedDark = new Set();
        const usedLight = new Set();
        dark.forEach((s) => {
            let id = typeof s.id === 'number' ? (s.id & 0xffff) : crc16(s.name || '');
            while (usedDark.has(id)) id = (id + 1) & 0xffff;
            usedDark.add(id);
            window.schemeIdByName.dark[s.name] = id;
            window.schemeById.dark[id] = s;
        });
        light.forEach((s) => {
            let id = typeof s.id === 'number' ? (s.id & 0xffff) : crc16(s.name || '');
            while (usedLight.has(id)) id = (id + 1) & 0xffff;
            usedLight.add(id);
            window.schemeIdByName.light[s.name] = id;
            window.schemeById.light[id] = s;
        });
    } catch {}
}

// Z85 encoding/decoding (ZeroMQ)
const Z85_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#";
const Z85_ENC = Z85_CHARS.split('');
const Z85_DEC = (() => { const m = {}; Z85_ENC.forEach((c,i)=>m[c]=i); return m; })();
function z85Encode(bytes) {
    if ((bytes.length % 4) !== 0) throw new Error('Z85 requires length multiple of 4');
    let out = '';
    for (let i=0;i<bytes.length;i+=4) {
        const value = (bytes[i]*0x1000000) + (bytes[i+1]*0x10000) + (bytes[i+2]*0x100) + bytes[i+3];
        let div = value >>> 0;
        const c5 = div % 85; div = (div / 85) >>> 0;
        const c4 = div % 85; div = (div / 85) >>> 0;
        const c3 = div % 85; div = (div / 85) >>> 0;
        const c2 = div % 85; div = (div / 85) >>> 0;
        const c1 = div % 85;
        out += Z85_ENC[c1] + Z85_ENC[c2] + Z85_ENC[c3] + Z85_ENC[c4] + Z85_ENC[c5];
    }
    return out;
}
function z85Decode(str) {
    if ((str.length % 5) !== 0) throw new Error('Invalid Z85 length');
    const out = new Uint8Array((str.length / 5) * 4);
    let j = 0;
    for (let i=0;i<str.length;i+=5) {
        let value = 0;
        for (let k=0;k<5;k++) { value = value * 85 + (Z85_DEC[str[i+k]] ?? 0); }
        out[j+0] = (value >>> 24) & 0xff;
        out[j+1] = (value >>> 16) & 0xff;
        out[j+2] = (value >>> 8) & 0xff;
        out[j+3] = value & 0xff;
        j += 4;
    }
    return out;
}


// Immutable role ID maps sourced from font-roles.js
let ROLE_ID_BY_KEY = {};
let ROLE_KEY_BY_ID = {};
function buildRoleMaps() {
    ROLE_ID_BY_KEY = {};
    ROLE_KEY_BY_ID = {};
    try {
        if (typeof fontRoles === 'object') {
            Object.entries(fontRoles).forEach(([key, meta]) => {
                if (meta && typeof meta.id === 'number') {
                    const id = meta.id & 0xffff;
                    ROLE_ID_BY_KEY[key] = id;
                    ROLE_KEY_BY_ID[id] = key;
                }
            })
        }
    } catch {}
}
