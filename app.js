// Font source configurations - handling multiple font sources
const fontSources = {
    // Google Fonts (loaded via Google Fonts API)
    googleFonts: [
        'Fira+Code:wght@300;400;500;600;700',
        'JetBrains+Mono:wght@300;400;500;600;700',
        'Victor+Mono:wght@300;400;500;600;700',
        'Recursive:wght@300;400;500;600;700&MONO=1',
        'Source+Code+Pro:wght@300;400;500;600;700',
        'IBM+Plex+Mono:wght@300;400;500;600;700',
        'Roboto+Mono:wght@300;400;500;600;700',
        'Red+Hat+Mono:wght@300;400;500;600;700',
        'DM+Mono:wght@300;400;500',
        'Geist+Mono:wght@100;200;300;400;500;600;700;800;900',
        'Martian+Mono:wght@300;400;500;600;700',
        'Ubuntu+Mono:wght@400;700',
        'Inconsolata:wght@200;300;400;500;600;700;800;900',
        'Anonymous+Pro:wght@400;700',
        'Oxygen+Mono:wght@400',
        'PT+Mono:wght@400',
        'Overpass+Mono:wght@300;400;500;600;700;800',
        'Cousine:wght@400;700',
        'Fira+Mono:wght@400;500;700',
        'Space+Mono:wght@400;700',
        'Courier+Prime:wght@400;700',
        'Sometype+Mono:wght@400;500;600;700',
        'Spline+Sans+Mono:wght@300;400;500;600;700',
        'B612+Mono:wght@400;700',
        'Noto+Sans+Mono:wght@300;400;500;600;700;800;900',
        'Share+Tech+Mono:wght@400',
        'Nova+Mono:wght@400',
        'Cutive+Mono:wght@400',
        'Nanum+Gothic+Coding:wght@400;700',
        'Lekton:wght@400;700',
        'VT323:wght@400',
        'Major+Mono+Display:wght@400',
        'Press+Start+2P:wght@400'
    ],
    
    // Custom font sources (loaded via @font-face)
    customFonts: [
        {
            name: 'Hack',
            url: 'https://cdn.jsdelivr.net/npm/hack-font@3/build/web/fonts/hack-regular-subset.woff2',
            weight: 400
        },
        {
            name: 'Cascadia Code',
            url: 'https://cdn.jsdelivr.net/npm/@fontsource/cascadia-code@5.0.0/files/cascadia-code-latin-400-normal.woff2',
            weight: 400
        },
        {
            name: 'Cascadia Mono',
            url: 'https://cdn.jsdelivr.net/npm/@fontsource/cascadia-mono@5.0.0/files/cascadia-mono-latin-400-normal.woff2',
            weight: 400
        },
        {
            name: 'Iosevka',
            url: 'https://cdn.jsdelivr.net/npm/@fontsource/iosevka@5.0.0/files/iosevka-latin-400-normal.woff2',
            weight: 400
        },
        {
            name: 'Hasklig',
            url: 'https://cdn.jsdelivr.net/gh/i-tu/Hasklig/woff/Hasklig-Regular.woff',
            weight: 400
        },
        {
            name: 'Fantasque Sans Mono',
            url: 'https://cdn.jsdelivr.net/gh/belluzj/fantasque-sans/fonts-woff/FantasqueSansMono-Regular.woff',
            weight: 400
        },
        {
            name: 'Mononoki',
            url: 'https://cdn.jsdelivr.net/gh/madmalik/mononoki/export/mononoki-Regular.woff2',
            weight: 400
        },
        {
            name: 'Go Mono',
            url: 'https://cdn.jsdelivr.net/gh/golang/image/font/gofont/ttfs/Go-Mono.ttf',
            weight: 400
        },
        {
            name: 'JuliaMono',
            url: 'https://cdn.jsdelivr.net/gh/cormullion/juliamono/webfonts/JuliaMono-Regular.woff2',
            weight: 400
        },
        {
            name: 'Intel One Mono',
            url: 'https://cdn.jsdelivr.net/gh/intel/intel-one-mono@main/fonts/woff2/IntelOneMono-Regular.woff2',
            weight: 400
        },
        {
            name: 'Liberation Mono',
            url: 'https://cdn.jsdelivr.net/gh/liberationfonts/liberation-fonts/src/LiberationMono-Regular.ttf',
            weight: 400
        },
        {
            name: 'Serious Shanns',
            url: 'https://kabeech.github.io/serious-shanns/fonts/serious-shanns-regular.woff2',
            weight: 400,
            fallbackUrl: 'https://kabeech.github.io/serious-shanns/fonts/serious-shanns-regular.ttf'
        },
        {
            name: 'Monocraft',
            url: 'https://cdn.jsdelivr.net/gh/IdreesInc/Monocraft/dist/Monocraft.otf',
            weight: 400
        },
        {
            name: 'Agave',
            url: 'https://cdn.jsdelivr.net/gh/agarick/agave/dist/Agave-Regular.ttf',
            weight: 400
        },
        {
            name: 'Office Code Pro',
            url: 'https://cdn.jsdelivr.net/gh/nathco/Office-Code-Pro/Fonts/Office%20Code%20Pro/OTF/OfficeCodePro-Regular.otf',
            weight: 400
        },
        {
            name: 'Hermit',
            url: 'https://pcaro.es/d/otf/Hermit-Regular.otf',
            weight: 400
        },
        {
            name: '3270',
            url: 'https://cdn.jsdelivr.net/gh/rbanffy/3270font/build/3270-Regular.woff2',
            weight: 400
        }
    ],
    
    // System fonts to check for local availability (non-embeddable only)
    systemFonts: [
        'Aptos Mono', 'Consolas', 'SF Mono', 'Monaco', 'Menlo',
        'Courier New', 'Lucida Console', 'Andale Mono', 'DejaVu Sans Mono',
        'Meslo LG', 'Input Mono', 'Operator Mono', 'Dank Mono',
        'MonoLisa', 'Berkeley Mono', 'Commit Mono', 'Comic Code',
        'PragmataPro', 'APL2741', 'APL385 Unicode'
    ]
};

// Helper function to load custom fonts via @font-face
function loadCustomFonts() {
    const style = document.createElement('style');
    let css = '';
    
    fontSources.customFonts.forEach(font => {
        css += `
            @font-face {
                font-family: '${font.name}';
                src: url('${font.fallbackUrl || font.url}') format('${font.url.endsWith('.woff2') ? 'woff2' : font.url.endsWith('.woff') ? 'woff' : font.url.endsWith('.ttf') ? 'truetype' : 'opentype'}');
                font-weight: ${font.weight || 400};
                font-style: normal;
                font-display: swap;
            }
        `;
    });
    
    style.textContent = css;
    document.head.appendChild(style);
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

// Detect all available system fonts
function detectSystemFonts() {
    console.log('Detecting installed system fonts...');
    const availableFonts = [];
    
    // Also check some common programming fonts that might be locally installed
    const additionalFontsToCheck = [
        'Hack', 'Cascadia Code', 'Cascadia Mono', 'JetBrains Mono',
        'Fira Code', 'Source Code Pro', 'Iosevka', 'Hasklig',
        'Victor Mono', 'Fantasque Sans Mono', 'Mononoki', 'Go Mono',
        'JuliaMono', 'Intel One Mono', 'Liberation Mono', 'DejaVu Sans Mono'
    ];
    
    // Combine system fonts with additional fonts to check
    const allFontsToCheck = [...new Set([...fontSources.systemFonts, ...additionalFontsToCheck])];
    
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
    }
    
    console.log(`Found ${availableFonts.length} of ${allFontsToCheck.length} checked fonts`);
    return availableFonts;
}

// Filter font families to only include available fonts
function filterFontFamilies() {
    const availableSystemFonts = detectSystemFonts();
    
    // Create a filtered version of fontFamilies
    const filteredFamilies = {};
    
    // List of fonts that are loaded via CDN or Google Fonts (always available)
    const webFonts = new Set([
        ...fontSources.googleFonts.map(f => f.split(':')[0].replace(/\+/g, ' ')),
        ...fontSources.customFonts.map(f => f.name)
    ]);
    
    Object.entries(fontFamiliesOriginal).forEach(([category, data]) => {
        if (category === 'System Fonts') {
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
                    description: `${data.description} (${availableFontsInCategory.length} available)`
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
                    description: data.description + (availableFontsInCategory.length < data.fonts.length ? 
                        ` (${availableFontsInCategory.length}/${data.fonts.length} available)` : '')
                };
            }
        }
    });
    
    console.log(`Categories with fonts: ${Object.keys(filteredFamilies).join(', ')}`);
    return filteredFamilies;
}

// Configuration options - Top coding fonts organized by family
// Using Comic Sans MS as fallback to make it obvious when fonts don't load
const fontFamiliesOriginal = {
    'System Fonts': {
        description: 'Pre-installed system and commercial fonts (must be installed locally)',
        fonts: [
            '"Aptos Mono", "Consolas", monospace',
            '"Consolas", monospace',
            '"SF Mono", "Monaco", monospace',
            '"Monaco", monospace',
            '"Menlo", monospace',
            '"Cascadia Code", "Consolas", monospace',
            '"Cascadia Mono", "Consolas", monospace',
            '"Courier New", monospace',
            '"Lucida Console", monospace',
            '"Andale Mono", monospace',
            '"DejaVu Sans Mono", monospace',
            '"Droid Sans Mono", monospace',
            '"Hack", monospace',
            '"Meslo LG", monospace',
            '"Input Mono", monospace',
            '"Operator Mono", monospace',
            '"Dank Mono", monospace',
            '"MonoLisa", monospace',
            '"Berkeley Mono", monospace',
            '"Commit Mono", monospace',
            '"Comic Code", monospace',
            '"PragmataPro", monospace'
        ],
        representative: '"Consolas", monospace'
    },
    'Ligature-Enabled': {
        description: 'Fonts with programming ligatures and specialized symbols',
        fonts: [
            '"Fira Code", "Comic Sans MS", cursive',
            '"JetBrains Mono", "Comic Sans MS", cursive',
            '"Victor Mono", "Comic Sans MS", cursive',
            '"Recursive", "Comic Sans MS", cursive',
            '"Cascadia Code", "Consolas", monospace',
            '"Iosevka", "Comic Sans MS", cursive',
            '"Hasklig", "Comic Sans MS", cursive',
            '"MonoLisa", monospace',
            '"Dank Mono", monospace',
            '"Comic Code", monospace',
            '"PragmataPro", monospace',
            '"Operator Mono", monospace',
            '"APL2741", "Comic Sans MS", cursive',
            '"APL385 Unicode", "Comic Sans MS", cursive',
            '"JuliaMono", "Comic Sans MS", cursive'
        ],
        representative: '"Fira Code", "Comic Sans MS", cursive'
    },
    'Clean & Modern': {
        description: 'Contemporary fonts with clean lines',
        fonts: [
            '"Source Code Pro", "Comic Sans MS", cursive',
            '"IBM Plex Mono", "Comic Sans MS", cursive',
            '"Roboto Mono", "Comic Sans MS", cursive',
            '"Red Hat Mono", "Comic Sans MS", cursive',
            '"DM Mono", "Comic Sans MS", cursive',
            '"Geist Mono", "Comic Sans MS", cursive',
            '"Martian Mono", "Comic Sans MS", cursive',
            '"Chivo Mono", "Comic Sans MS", cursive',
            '"Kode Mono", "Comic Sans MS", cursive',
            '"Intel One Mono", "Comic Sans MS", cursive',
            '"Monaspace Argon", "Comic Sans MS", cursive',
            '"Monaspace Krypton", "Comic Sans MS", cursive',
            '"Monaspace Neon", "Comic Sans MS", cursive',
            '"Monaspace Radon", "Comic Sans MS", cursive',
            '"Monaspace Xenon", "Comic Sans MS", cursive',
            '"Zed Mono", "Comic Sans MS", cursive',
            '"Sudo", "Comic Sans MS", cursive',
            '"Maple Mono", "Comic Sans MS", cursive',
            '"League Mono", "Comic Sans MS", cursive',
            '"Agave", "Comic Sans MS", cursive'
        ],
        representative: '"Source Code Pro", "Comic Sans MS", cursive'
    },
    'Classic Terminal': {
        description: 'Traditional terminal, system, and retro fonts',
        fonts: [
            '"Ubuntu Mono", "Comic Sans MS", cursive',
            '"Inconsolata", "Comic Sans MS", cursive',
            '"Anonymous Pro", "Comic Sans MS", cursive',
            '"Oxygen Mono", "Comic Sans MS", cursive',
            '"PT Mono", "Comic Sans MS", cursive',
            '"Overpass Mono", "Comic Sans MS", cursive',
            '"Cousine", "Comic Sans MS", cursive',
            '"Fira Mono", "Comic Sans MS", cursive',
            '"Liberation Mono", "Comic Sans MS", cursive',
            '"Go Mono", "Comic Sans MS", cursive',
            '"Terminus", "Comic Sans MS", cursive',
            '"Hermit", "Comic Sans MS", cursive',
            '"Mononoki", "Comic Sans MS", cursive',
            '"Office Code Pro", "Comic Sans MS", cursive',
            '"Fantasque Sans Mono", "Comic Sans MS", cursive',
            '"3270", "Comic Sans MS", cursive',
            '"Anka/Coder", "Comic Sans MS", cursive',
            '"ProFont", "Comic Sans MS", cursive',
            '"Envy Code R", "Comic Sans MS", cursive',
            '"VT323", "Comic Sans MS", cursive',
            '"Major Mono Display", "Comic Sans MS", cursive',
            '"Syne Mono", "Comic Sans MS", cursive',
            '"Xanh Mono", "Comic Sans MS", cursive',
            '"Press Start 2P", "Comic Sans MS", cursive',
            '"Perfect DOS VGA 437", "Comic Sans MS", cursive',
            '"IBM VGA 9x16", "Comic Sans MS", cursive',
            '"PxPlus IBM VGA 8x16", "Comic Sans MS", cursive',
            '"Pixel Operator", "Comic Sans MS", cursive',
            '"Monocraft", "Comic Sans MS", cursive',
            '"Bedstead", "Comic Sans MS", cursive',
            '"GohuFont", "Comic Sans MS", cursive',
            '"Proggy Vector", "Comic Sans MS", cursive',
            '"Spleen", "Comic Sans MS", cursive',
            '"Tamzen", "Comic Sans MS", cursive',
            '"Fixedsys", monospace'
        ],
        representative: '"Ubuntu Mono", "Comic Sans MS", cursive'
    },
    'Distinctive': {
        description: 'Fonts with unique character',
        fonts: [
            '"Space Mono", "Comic Sans MS", cursive',
            '"Courier Prime", "Comic Sans MS", cursive',
            '"Courier Prime Code", "Comic Sans MS", cursive',
            '"Azeret Mono", "Comic Sans MS", cursive',
            '"Fragment Mono", "Comic Sans MS", cursive',
            '"Sometype Mono", "Comic Sans MS", cursive',
            '"Spline Sans Mono", "Comic Sans MS", cursive',
            '"B612 Mono", "Comic Sans MS", cursive',
            '"Sax Mono", "Comic Sans MS", cursive',
            '"Code New Roman", "Comic Sans MS", cursive',
            '"JuliaMono", "Comic Sans MS", cursive',
            '"Input Mono", monospace',
            '"Cartograph CF", monospace',
            '"Aperçu Mono", monospace',
            '"Triplicate Code", monospace'
        ],
        representative: '"Space Mono", "Comic Sans MS", cursive'
    },
    'Wide & Readable': {
        description: 'Fonts optimized for extended reading',
        fonts: [
            '"Noto Sans Mono", "Comic Sans MS", cursive',
            '"Share Tech Mono", "Comic Sans MS", cursive',
            '"Nova Mono", "Comic Sans MS", cursive',
            '"Cutive Mono", "Comic Sans MS", cursive',
            '"Nanum Gothic Coding", "Comic Sans MS", cursive',
            '"Lekton", "Comic Sans MS", cursive',
            '"Latin Modern Mono", "Comic Sans MS", cursive',
            '"Luxi Mono", "Comic Sans MS", cursive',
            '"NotCourierSans", "Comic Sans MS", cursive',
            '"Sarasa Mono", "Comic Sans MS", cursive',
            '"UDEV Gothic", "Comic Sans MS", cursive',
            '"LXGW WenKai Mono", "Comic Sans MS", cursive',
            '"Iosevka Term", "Comic Sans MS", cursive'
        ],
        representative: '"Noto Sans Mono", "Comic Sans MS", cursive'
    },
};

// This will be populated with filtered fonts after detection
let fontFamilies = fontFamiliesOriginal;
let fonts = [];

// Google Fonts list for backward compatibility (using fontSources.googleFonts)
const googleFontFamilies = fontSources.googleFonts;

const fontSizes = [12, 14, 16, 18]; // Reduced to 4 strategic sizes
const fontWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900]; // Full weight range from ultra-light to black
const lineHeights = [1.3, 1.4, 1.5, 1.6]; // Reduced to 4 practical line heights
const fontStretches = ['ultra-condensed', 'condensed', 'normal', 'semi-expanded', 'expanded']; // 5 stretch options
const letterSpacings = [-1.0, -0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8, 1.0]; // More granular letter spacing options

const colorSchemes = {
    dark: [
        // Popular dark themes
        { name: 'Monokai', bg: '#272822', fg: '#f8f8f2', keyword: '#f92672', string: '#e6db74', comment: '#75715e', function: '#66d9ef' },
        { name: 'Dracula', bg: '#282a36', fg: '#f8f8f2', keyword: '#ff79c6', string: '#f1fa8c', comment: '#6272a4', function: '#50fa7b' },
        { name: 'One Dark', bg: '#282c34', fg: '#abb2bf', keyword: '#c678dd', string: '#98c379', comment: '#5c6370', function: '#61afef' },
        { name: 'Solarized Dark', bg: '#002b36', fg: '#839496', keyword: '#b58900', string: '#2aa198', comment: '#586e75', function: '#268bd2' },
        { name: 'Tomorrow Night', bg: '#1d1f21', fg: '#c5c8c6', keyword: '#b294bb', string: '#b5bd68', comment: '#969896', function: '#81a2be' },
        { name: 'GitHub Dark', bg: '#0d1117', fg: '#c9d1d9', keyword: '#ff7b72', string: '#a5d6ff', comment: '#8b949e', function: '#d2a8ff' },
        { name: 'Nord', bg: '#2e3440', fg: '#d8dee9', keyword: '#81a1c1', string: '#a3be8c', comment: '#616e88', function: '#88c0d0' },
        { name: 'Gruvbox Dark', bg: '#282828', fg: '#ebdbb2', keyword: '#fb4934', string: '#b8bb26', comment: '#928374', function: '#83a598' },
        { name: 'Material Theme', bg: '#263238', fg: '#eeffff', keyword: '#c792ea', string: '#c3e88d', comment: '#546e7a', function: '#82aaff' },
        { name: 'Atom One Dark', bg: '#282c34', fg: '#abb2bf', keyword: '#c678dd', string: '#98c379', comment: '#5c6370', function: '#61afef' },
        { name: 'Palenight', bg: '#292d3e', fg: '#a6accd', keyword: '#c792ea', string: '#c3e88d', comment: '#676e95', function: '#82aaff' },
        { name: 'Synthwave 84', bg: '#262335', fg: '#ff7edb', keyword: '#fede5d', string: '#ff8b39', comment: '#495495', function: '#36f9f6' },
        { name: 'Tokyo Night', bg: '#1a1b26', fg: '#a9b1d6', keyword: '#bb9af7', string: '#9ece6a', comment: '#565f89', function: '#7aa2f7' },
        { name: 'Cobalt2', bg: '#193549', fg: '#ffc600', keyword: '#ff9d00', string: '#0088ff', comment: '#0088ff', function: '#ff628c' },
        { name: 'Night Owl', bg: '#011627', fg: '#d6deeb', keyword: '#c792ea', string: '#ecc48d', comment: '#637777', function: '#82aaff' },
        { name: 'Shades of Purple', bg: '#2d2b55', fg: '#a599e9', keyword: '#ff628c', string: '#a5ff90', comment: '#b362ff', function: '#fad000' },
        { name: 'Ayu Dark', bg: '#0a0e14', fg: '#b3b1ad', keyword: '#ff8f40', string: '#c2d94c', comment: '#626a73', function: '#ffb454' },
        { name: 'Horizon', bg: '#1c1e26', fg: '#fadad1', keyword: '#f43e5c', string: '#fab795', comment: '#6c6f93', function: '#25b0bc' },
        { name: 'City Lights', bg: '#1d252c', fg: '#a0b3c5', keyword: '#5ec4ff', string: '#8bd49c', comment: '#41505e', function: '#e27e8d' },
        { name: 'Moonlight', bg: '#222436', fg: '#c8d3f5', keyword: '#ff757f', string: '#c3e88d', comment: '#7a88cf', function: '#82aaff' },
        { name: 'Panda', bg: '#292a2b', fg: '#e6e6e6', keyword: '#ff2c6d', string: '#19f9d8', comment: '#676b79', function: '#ffb86c' },
        { name: 'Winter is Coming', bg: '#011627', fg: '#d6deeb', keyword: '#91dacd', string: '#ecc48d', comment: '#637777', function: '#82aaff' },
        { name: 'Andromeda', bg: '#262a33', fg: '#d5ced9', keyword: '#ee5d43', string: '#96e072', comment: '#5f6167', function: '#ffe66d' },
        { name: 'Material Ocean', bg: '#0f111a', fg: '#a6accd', keyword: '#c792ea', string: '#c3e88d', comment: '#464b5d', function: '#82aaff' },
        { name: 'Slack Dark', bg: '#222222', fg: '#e6e6e6', keyword: '#6699cc', string: '#99cc99', comment: '#999999', function: '#cc99cc' }
    ],
    light: [
        // Popular light themes
        { name: 'GitHub Light', bg: '#ffffff', fg: '#24292e', keyword: '#d73a49', string: '#032f62', comment: '#6a737d', function: '#6f42c1' },
        { name: 'Solarized Light', bg: '#fdf6e3', fg: '#657b83', keyword: '#859900', string: '#2aa198', comment: '#93a1a1', function: '#268bd2' },
        { name: 'Atom One Light', bg: '#fafafa', fg: '#383a42', keyword: '#a626a4', string: '#50a14f', comment: '#a0a1a7', function: '#4078f2' },
        { name: 'Tomorrow', bg: '#ffffff', fg: '#4d4d4c', keyword: '#8959a8', string: '#718c00', comment: '#8e908c', function: '#4271ae' },
        { name: 'Material Light', bg: '#fafafa', fg: '#90a4ae', keyword: '#7c4dff', string: '#91b859', comment: '#ccd7da', function: '#39adb5' },
        { name: 'Quiet Light', bg: '#f5f5f5', fg: '#333333', keyword: '#4b69c6', string: '#448c27', comment: '#aaaaaa', function: '#aa3731' },
        { name: 'Eclipse', bg: '#ffffff', fg: '#000000', keyword: '#7f0055', string: '#2a00ff', comment: '#3f7f5f', function: '#000000' },
        { name: 'IntelliJ Light', bg: '#ffffff', fg: '#000000', keyword: '#0033b3', string: '#067d17', comment: '#8c8c8c', function: '#00627a' },
        { name: 'VS Light', bg: '#ffffff', fg: '#000000', keyword: '#0000ff', string: '#a31515', comment: '#008000', function: '#795e26' },
        { name: 'XCode Light', bg: '#ffffff', fg: '#000000', keyword: '#aa0d91', string: '#d12f1b', comment: '#5d6c79', function: '#3900a0' },
        { name: 'Paper', bg: '#f2eede', fg: '#0f0f0f', keyword: '#8b008b', string: '#008b8b', comment: '#5f5f5f', function: '#4169e1' },
        { name: 'Gruvbox Light', bg: '#fbf1c7', fg: '#3c3836', keyword: '#9d0006', string: '#79740e', comment: '#928374', function: '#076678' },
        { name: 'Spring', bg: '#ffffff', fg: '#000000', keyword: '#268bd2', string: '#859900', comment: '#93a1a1', function: '#b58900' },
        { name: 'Slack Light', bg: '#ffffff', fg: '#2c2d30', keyword: '#0576b9', string: '#a0a0a0', comment: '#505050', function: '#d73a49' },
        { name: 'Ayu Light', bg: '#fafafa', fg: '#575f66', keyword: '#ff6a00', string: '#86b300', comment: '#abb0b6', function: '#f07171' },
        { name: 'Winter is Coming Light', bg: '#ffffff', fg: '#000000', keyword: '#236ebf', string: '#022c7d', comment: '#357b42', function: '#a44185' },
        { name: 'Nord Light', bg: '#e5e9f0', fg: '#2e3440', keyword: '#5e81ac', string: '#a3be8c', comment: '#4c566a', function: '#88c0d0' },
        { name: 'One Light', bg: '#fafafa', fg: '#383a42', keyword: '#a626a4', string: '#50a14f', comment: '#a0a1a7', function: '#4078f2' },
        { name: 'Serendipity Light', bg: '#f8f8f8', fg: '#323232', keyword: '#c42775', string: '#379a37', comment: '#969896', function: '#0083d8' },
        { name: 'Hopscotch', bg: '#ffffff', fg: '#5c545b', keyword: '#c85e7c', string: '#8fc13e', comment: '#989498', function: '#1290bf' },
        { name: 'Kuroir', bg: '#e8e2b7', fg: '#363636', keyword: '#a55000', string: '#009900', comment: '#949494', function: '#cd3700' },
        { name: 'Monochrome Light', bg: '#ffffff', fg: '#000000', keyword: '#000000', string: '#000000', comment: '#808080', function: '#000000' },
        { name: 'Twilight Light', bg: '#f8f8f8', fg: '#464b50', keyword: '#aa73c2', string: '#8f9d6a', comment: '#5f5a60', function: '#cda869' },
        { name: 'Dawn', bg: '#f9f9f9', fg: '#575279', keyword: '#b4637a', string: '#286983', comment: '#9893a5', function: '#907aa9' },
        { name: 'Catppuccin Latte', bg: '#eff1f5', fg: '#4c4f69', keyword: '#8839ef', string: '#40a02b', comment: '#9ca0b0', function: '#1e66f5' }
    ]
};

// Code sample URLs - loading real code from files and external sources
const codeSampleUrls = {
    javascript: './samples/javascript.js',
    python: './samples/python.py',
    rust: './samples/rust.rs',
    go: './samples/go.go',
    java: 'https://raw.githubusercontent.com/spring-projects/spring-boot/main/spring-boot-project/spring-boot/src/main/java/org/springframework/boot/SpringApplication.java',
    css: 'https://raw.githubusercontent.com/necolas/normalize.css/master/normalize.css',
    html: 'https://raw.githubusercontent.com/h5bp/html5-boilerplate/main/src/index.html',
    yaml: 'https://raw.githubusercontent.com/kubernetes/kubernetes/master/api/openapi-spec/swagger.json',
    json: 'https://raw.githubusercontent.com/microsoft/vscode/main/package.json',
    markdown: 'https://raw.githubusercontent.com/microsoft/vscode/main/README.md',
    legal: null, // Use fallback sample (GDPR text)
    self: './app.js',
    custom: null // Will be set by user input
};

// Fallback code samples (used if URL loading fails)
const fallbackCodeSamples = {
    javascript: `// Advanced async data pipeline with error handling
class DataPipeline {
    constructor(options = {}) {
        this.transforms = [];
        this.errorHandler = options.onError || 
            (err => console.error(err));
        this.cache = new Map();
        this.metrics = { processed: 0, errors: 0, cached: 0 };
    }
    pipe(...transforms) {
        this.transforms.push(
            ...transforms.filter(fn => typeof fn === 'function')
        );
        return this;
    }
    async process(data, options = {}) {
        const key = options.cacheKey || JSON.stringify(data);
        if (!options.skipCache && this.cache.has(key)) {
            this.metrics.cached++;
            return this.cache.get(key);
        }
        try {
            const result = await this.transforms.reduce(
                async (acc, transform) => {
                    const prev = await acc;
                    return transform.call(this, prev, 
                        { ...options, metrics: this.metrics });
                }, Promise.resolve(data)
            );
            this.cache.set(key, result);
            this.metrics.processed++;
            return result;
        } catch (error) {
            this.metrics.errors++;
            this.errorHandler(error);
            throw error;
        }
    }
}

// Factory pattern with complex type inference
const createProcessor = (config = {}) => {
    const { mode = 'parallel', maxConcurrency = 10, 
            timeout = 5000 } = config;
    return mode === 'parallel' 
        ? async (items) => Promise.all(
            items.map(async (item, i) => ({
                ...item,
                processed: true,
                timestamp: Date.now(),
                index: i,
                metadata: { mode, timeout }
            }))
        )
        : async (items) => items.reduce(
            async (chain, item, i) => {
                const acc = await chain;
                return [...acc, { ...item, processed: true, 
                                  index: i }];
            }, Promise.resolve([])
        );
};

// Usage with arrow functions and destructuring
const pipeline = new DataPipeline({ 
    onError: e => console.warn('Pipeline:', e) 
})
    .pipe(data => data.filter(({ active }) => active))
    .pipe(async items => Promise.all(
        items.map(async ({ id, ...rest }) => ({
            id: \`proc_\${id}\`,
            ...rest,
            tags: [...(rest.tags || []), 'processed']
        }))
    ))
    .pipe(items => items.sort(
        (a, b) => (b.priority || 0) - (a.priority || 0)
    ));

// Recursive binary tree traversal with async nodes
const traverseAsync = async (node, depth = 0) => {
    if (!node) return [];
    const [left, right] = await Promise.all([
        node.left ? traverseAsync(node.left, depth + 1) : [],
        node.right ? traverseAsync(node.right, depth + 1) : []
    ]);
    return [...left, { value: node.value, depth }, ...right];
};`,

    python: `# Advanced decorator with metadata and async support
from functools import wraps
from typing import TypeVar, Callable, Any, Optional, Dict
import asyncio
import time

def performance_monitor(threshold: float = 1.0, 
                       cache_results: bool = True):
    """Decorator factory for monitoring performance"""
    cache: Dict[str, Any] = {}
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            cache_key = str(args) + ":" + str(kwargs) \\
                       if cache_results else None
            if cache_key in cache:
                return cache[cache_key]
            start = time.perf_counter()
            try:
                result = await func(*args, **kwargs)
                elapsed = time.perf_counter() - start
                if elapsed > threshold:
                    print(f"Warning: {func.__name__} "
                          f"took {elapsed:.3f}s")
                if cache_key:
                    cache[cache_key] = result
                return result
            except Exception as e:
                print(f"Error in {func.__name__}: {e}")
                raise
        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            cache_key = str(args) + ":" + str(kwargs) \\
                       if cache_results else None
            if cache_key in cache:
                return cache[cache_key]
            start = time.perf_counter()
            result = func(*args, **kwargs)
            if cache_results and cache_key:
                cache[cache_key] = result
            return result
        return async_wrapper if asyncio.iscoroutinefunction(func) \\
               else sync_wrapper
    return decorator

class DataProcessor:
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.transforms = []
        self._cache = {}
    def add_transform(self, 
                     func: Callable[[Any], Any]) -> 'DataProcessor':
        self.transforms.append(func)
        return self
    @performance_monitor(threshold=0.5)
    async def process_batch(self, items: list) -> list:
        results = []
        for item in items:
            result = item
            for transform in self.transforms:
                if asyncio.iscoroutinefunction(transform):
                    result = await transform(result)
                else:
                    result = transform(result)
            results.append(result)
        return results
    def __repr__(self) -> str:
        return (f"<DataProcessor "
                f"transforms={len(self.transforms)} "
                f"config={self.config}>")

# Complex list comprehension with nested conditions
processor = DataProcessor({'mode': 'async', 'batch_size': 100})
data = [
    {'id': i, 'value': i**2, 
     'tags': ['even'] if i % 2 == 0 else ['odd']} 
    for i in range(10) if i % 3 != 0
]
filtered = [
    item for item in data 
    if any(tag in ['even', 'prime'] 
           for tag in item.get('tags', [])) 
    and item['value'] > 5
]

# Async context manager with cleanup
class AsyncResource:
    async def __aenter__(self):
        self.connection = await self._connect()
        return self
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.connection.close()
        if exc_type:
            print(f"Error: {exc_val}")
        return False`,

    java: `public class QuickSort {
    // Main quicksort method
    public static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            // Find partition index
            int pi = partition(arr, low, high);
            
            // Recursively sort elements
            quickSort(arr, low, pi - 1);
            quickSort(arr, pi + 1, high);
        }
    }
    
    private static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = (low - 1); // Index of smaller element
        
        for (int j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                // Swap elements
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        
        // Swap pivot element
        int temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        
        return i + 1;
    }
}`,

    rust: `use std::collections::HashMap;

// Define a simple cache structure
pub struct LRUCache<K, V> {
    capacity: usize,
    cache: HashMap<K, V>,
    order: Vec<K>,
}

impl<K: Clone + Eq + std::hash::Hash, V> LRUCache<K, V> {
    pub fn new(capacity: usize) -> Self {
        LRUCache {
            capacity,
            cache: HashMap::new(),
            order: Vec::new(),
        }
    }
    
    pub fn get(&mut self, key: &K) -> Option<&V> {
        if let Some(value) = self.cache.get(key) {
            // Update access order
            self.update_order(key.clone());
            Some(value)
        } else {
            None
        }
    }
    
    fn update_order(&mut self, key: K) {
        self.order.retain(|k| k != &key);
        self.order.push(key);
    }
}`,

    go: `package main

import (
    "fmt"
    "sync"
    "time"
)

// Worker pool implementation
func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
    defer wg.Done()
    
    for job := range jobs {
        fmt.Printf("Worker %d processing job %d\\n", id, job)
        time.Sleep(time.Second) // Simulate work
        results <- job * 2
    }
}

func main() {
    const numJobs = 10
    const numWorkers = 3
    
    jobs := make(chan int, numJobs)
    results := make(chan int, numJobs)
    
    var wg sync.WaitGroup
    
    // Start workers
    for w := 1; w <= numWorkers; w++ {
        wg.Add(1)
        go worker(w, jobs, results, &wg)
    }
    
    // Send jobs
    for j := 1; j <= numJobs; j++ {
        jobs <- j
    }
    close(jobs)
    
    // Wait and collect results
    go func() {
        wg.Wait()
        close(results)
    }()
}`,

    self: `// This is the actual code of this application!
const fonts = [
    'Fira Code, monospace',
    'JetBrains Mono, monospace',
    'Source Code Pro, monospace',
    'Cascadia Code, monospace',
    'IBM Plex Mono, monospace'
];

function createComparison(optionA, optionB) {
    const codeA = document.getElementById('codeA');
    const codeB = document.getElementById('codeB');
    
    // Apply styles to panel A
    codeA.style.fontFamily = optionA.font;
    codeA.style.fontSize = optionA.fontSize + 'px';
    codeA.style.fontWeight = optionA.fontWeight;
    codeA.style.lineHeight = optionA.lineHeight;
    
    // Apply styles to panel B
    codeB.style.fontFamily = optionB.font;
    codeB.style.fontSize = optionB.fontSize + 'px';
    codeB.style.fontWeight = optionB.fontWeight;
    codeB.style.lineHeight = optionB.lineHeight;
    
    return { optionA, optionB };
}`,

    css: `/* Advanced CSS with modern features and animations */
@import url('https://fonts.googleapis.com/css2?family=Inter');

:root {
    --primary: hsl(250, 60%, 60%);
    --secondary: hsl(280, 60%, 50%);
    --accent: hsl(200, 80%, 50%);
    --bg-dark: hsl(220, 20%, 10%);
    --text-light: hsl(220, 20%, 90%);
    --spacing-unit: clamp(1rem, 2vw, 1.5rem);
    --transition: cubic-bezier(0.4, 0, 0.2, 1);
}

@layer components {
    .card {
        container-type: inline-size;
        background: linear-gradient(
            135deg,
            hsl(250 60% 20% / 0.8),
            hsl(280 60% 15% / 0.9)
        );
        backdrop-filter: blur(10px) saturate(180%);
        border: 1px solid hsl(250 60% 50% / 0.2);
        border-radius: 0.75rem;
        padding: var(--spacing-unit);
        transition: transform 300ms var(--transition),
                    box-shadow 300ms var(--transition);
    }
    
    .card:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 10px 30px -10px hsl(250 60% 40% / 0.5),
                    0 20px 40px -20px hsl(280 60% 30% / 0.3);
    }
    
    @container (min-width: 400px) {
        .card__content {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: var(--spacing-unit);
            align-items: center;
        }
    }
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(-100%) scale(0.8);
    }
    to {
        opacity: 1;
        transform: translateX(0) scale(1);
    }
}

.animated-element {
    animation: slideIn 600ms var(--transition) forwards;
    animation-timeline: view();
    animation-range: entry 20% cover 40%;
}

/* The infamous CSS rules that shouldn't exist */
.clearfix::after {
    content: "";
    display: table;
    clear: both;
    /* This selector has a specificity of 0,0,1,1 */
    /* (not that anyone's counting in 2024) */
}

@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}

@supports (backdrop-filter: blur(10px)) {
    .glass {
        background: hsl(250 60% 20% / 0.3);
        backdrop-filter: blur(20px) saturate(200%);
    }
}`,

    html: `<!-- Modern HTML5 with semantic markup and accessibility -->
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" 
          content="width=device-width, initial-scale=1.0">
    <meta name="description" 
          content="Interactive code font selector">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="dns-prefetch" href="https://cdn.example.com">
    <title>Code Font Optimizer</title>
</head>
<body>
    <header role="banner" class="site-header">
        <nav aria-label="Main navigation">
            <ul role="list" class="nav-list">
                <li><a href="#features" 
                       aria-current="page">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><button aria-expanded="false" 
                            aria-controls="menu"
                            class="menu-toggle">
                    <span class="sr-only">Menu</span>
                    <svg aria-hidden="true" width="24" height="24">
                        <use href="#icon-menu"></use>
                    </svg>
                </button></li>
            </ul>
        </nav>
    </header>
    
    <main id="main" tabindex="-1">
        <article class="content" 
                 itemscope 
                 itemtype="https://schema.org/Article">
            <header>
                <h1 itemprop="headline">
                    Finding Your Perfect Code Font
                </h1>
                <time datetime="2024-01-15" 
                      itemprop="datePublished">
                    January 15, 2024
                </time>
            </header>
            
            <section aria-labelledby="intro">
                <h2 id="intro">Introduction</h2>
                <p>Choosing the right monospace font can 
                   significantly impact your coding experience.</p>
                
                <!-- The classic lorem pixelsum generator -->
                <figure role="img" 
                        aria-labelledby="fig-caption">
                    <picture>
                        <source srcset="image.avif" type="image/avif">
                        <source srcset="image.webp" type="image/webp">
                        <img src="placekitten.com/800/450" 
                             alt="Font comparison chart"
                             loading="lazy"
                             decoding="async"
                             width="800" 
                             height="450">
                    </picture>
                    <figcaption id="fig-caption">
                        Comparison of popular coding fonts
                        <small>(placeholder cats not included)</small>
                    </figcaption>
                </figure>
            </section>
            
            <template id="card-template">
                <div class="card" role="article">
                    <slot name="content"></slot>
                </div>
            </template>
        </article>
    </main>
</body>
</html>`,

    yaml: `# Kubernetes deployment with advanced configurations
apiVersion: apps/v1
kind: Deployment
metadata:
  name: code-optimizer
  namespace: production
  labels:
    app: optimizer
    version: v2.1.0
    team: platform
  annotations:
    deployment.kubernetes.io/revision: "3"
    prometheus.io/scrape: "true"
    prometheus.io/port: "9090"
spec:
  replicas: 3
  revisionHistoryLimit: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: optimizer
      tier: backend
  template:
    metadata:
      labels:
        app: optimizer
        tier: backend
        version: v2.1.0
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/path: "/metrics"
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            - labelSelector:
                matchExpressions:
                  - key: app
                    operator: In
                    values: [optimizer]
              topologyKey: kubernetes.io/hostname
      containers:
        - name: optimizer
          image: registry.io/optimizer:2.1.0
          imagePullPolicy: IfNotPresent
          ports:
            - containerPort: 8080
              protocol: TCP
              name: http
            - containerPort: 9090
              protocol: TCP
              name: metrics
          env:
            - name: NODE_ENV
              value: production
            - name: LOG_LEVEL
              value: info
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: db-secret
                  key: password
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 5
          volumeMounts:
            - name: config
              mountPath: /etc/config
              readOnly: true
      volumes:
        - name: config
          configMap:
            name: optimizer-config
            items:
              - key: app.yaml
                path: app.yaml
      tolerations:
        - key: "node.kubernetes.io/not-ready"
          operator: "Exists"
          effect: "NoExecute"
          tolerationSeconds: 418  # I'm a teapot`,

    json: `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/font-config.schema.json",
  "title": "Font Configuration Schema",
  "description": "Defines font preferences and settings",
  "type": "object",
  "required": ["version", "preferences", "themes"],
  "properties": {
    "version": {
      "type": "string",
      "pattern": "^\\\\d+\\\\.\\\\d+\\\\.\\\\d+$",
      "examples": ["1.0.0", "2.1.3"]
    },
    "preferences": {
      "type": "object",
      "properties": {
        "fontFamily": {
          "type": "string",
          "enum": [
            "Fira Code",
            "JetBrains Mono",
            "Source Code Pro",
            "IBM Plex Mono"
          ]
        },
        "fontSize": {
          "type": "number",
          "minimum": 10,
          "maximum": 24,
          "multipleOf": 0.5
        },
        "lineHeight": {
          "type": "number",
          "minimum": 1.0,
          "maximum": 2.0
        },
        "ligatures": {
          "type": "boolean",
          "default": true
        },
        "antialiasing": {
          "type": "string",
          "enum": ["none", "grayscale", "subpixel"],
          "default": "subpixel"
        }
      },
      "additionalProperties": false
    },
    "themes": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "object",
        "required": ["name", "colors"],
        "properties": {
          "name": {
            "type": "string",
            "minLength": 1,
            "maxLength": 50
          },
          "isDark": {
            "type": "boolean"
          },
          "colors": {
            "type": "object",
            "properties": {
              "background": {
                "$ref": "#/$defs/color"
              },
              "foreground": {
                "$ref": "#/$defs/color"
              },
              "keywords": {
                "$ref": "#/$defs/color"
              },
              "strings": {
                "$ref": "#/$defs/color"
              },
              "comments": {
                "$ref": "#/$defs/color"
              },
              "functions": {
                "$ref": "#/$defs/color"
              }
            },
            "required": [
              "background",
              "foreground", 
              "keywords",
              "strings"
            ]
          },
          "metadata": {
            "type": "object",
            "properties": {
              "created": {
                "type": "string",
                "format": "date-time"
              },
              "author": {
                "type": "string"
              },
              "tags": {
                "type": "array",
                "items": {
                  "type": "string"
                },
                "uniqueItems": true
              }
            }
          }
        }
      }
    },
    "experimental": {
      "type": "object",
      "properties": {
        "cursorAnimation": {
          "type": "boolean"
        },
        "semanticHighlighting": {
          "type": "boolean"
        }
      }
    }
  },
  "$defs": {
    "color": {
      "type": "string",
      "pattern": "^#[0-9A-Fa-f]{6}$",
      "examples": ["#FF0000", "#C0FFEE", "#BADA55"]
    }
  },
  "examples": [{
    "version": "4.0.4",
    "preferences": {
      "fontFamily": "Comic Sans MS",
      "fontSize": 13.37,
      "lineHeight": 1.618
    },
    "themes": [{
      "name": "Retro Terminal",
      "isDark": true,
      "colors": {
        "background": "#0D0208",
        "foreground": "#00FF41",
        "keywords": "#FACADE",
        "strings": "#DECADE"
      }
    }]
  }]
}`,

    markdown: `# Advanced Markdown Documentation

## Table of Contents
- [Introduction](#introduction)
- [Code Examples](#code-examples)
- [Mathematical Formulas](#mathematical-formulas)
- [Tables and Diagrams](#tables-and-diagrams)

## Introduction

This document demonstrates **advanced** _Markdown_ features 
including ~~strikethrough~~, ==highlights==, and footnotes[^1].

> "The best code is no code at all" - Jeff Atwood[^2]
> 
> Every line of code is a potential bug.

### Task Lists

- [x] Choose font family (Comic Sans unironically)
- [x] Set font size to 13.37px
- [ ] Achieve 100% test coverage (LOL)
- [ ] Fix that one bug from 2019

## Code Examples

\\\`\\\`\\\`javascript
// The infamous "banana" problem in JS
console.log("b" + "a" + + "a" + "a"); // -> "baNaNa"

// The WAT pyramid of doom
Array(16).join("wat" - 1) + " Batman!";
\\\`\\\`\\\`

Inline code like \\\`rm -rf /\\\` should be used with caution.

## Mathematical Formulas

The golden ratio $$\\phi = \\frac{1 + \\sqrt{5}}{2} \\approx 1.618$$

Euler's identity: $$e^{i\\pi} + 1 = 0$$

Drake equation (simplified):
$$N = R_* \\cdot f_p \\cdot n_e \\cdot f_l \\cdot f_i \\cdot f_c \\cdot L$$

## Tables and Diagrams

| Font | Ligatures | Rating | Secret Power |
|:-----|:---------:|-------:|:------------|
| Fira Code | ✅ | 9/10 | Transforms => into arrows |
| Comic Sans | ❌ | 11/10 | Triggers developers |
| Wingdings | ❓ | ???/10 | 🕈︎✋︎■︎♑︎♎︎♓︎■︎♑︎⬧︎ |

### ASCII Art Diagram

\\\`\\\`\\\`
    ┌─────────┐
    │ Parser  │──────➤ "Reticulating Splines"
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │  AST    │──────➤ Abstract Syntax 🌳
    └────┬────┘
         │
         ▼
    ┌─────────┐
    │ Output  │──────➤ 💩 (usually)
    └─────────┘
\\\`\\\`\\\`

## Links and References

- [RFC 2324][rfc] - Hyper Text Coffee Pot Control Protocol
- [XKCD 927](https://xkcd.com/927/) - Standards
- [This link is definitely not suspicious](https://youtu.be/dQw4w9WgXcQ)

### Definition Lists

Monospace
:   A font where i, m, and W are somehow the same width

Kerning
:   The art of making "rn" look like "m" in the wrong font

Ligature
:   When != becomes ≠ and you question reality

---

<details>
<summary>Spoiler Alert (click to reveal)</summary>

The real treasure was the fonts we compared along the way.

</details>

## Footnotes

[^1]: This is definitely a real footnote and not just 
      procrastination.

[^2]: Also known as the "404 Developer Not Found" principle.

[rfc]: https://datatracker.ietf.org/doc/html/rfc2324

<!-- Hidden comment: If you're reading this, you've gone 
     too deep into the source. The exit is Alt+F4 -->`,

    legal: `REGULATION (EU) 2016/679 OF THE EUROPEAN PARLIAMENT AND OF THE
COUNCIL of 27 April 2016 on the protection of natural persons with
regard to the processing of personal data and on the free movement
of such data, and repealing Directive 95/46/EC (General Data
Protection Regulation)

Article 1
Subject-matter and objectives

    1. This Regulation lays down rules relating to the protection
       of natural persons with regard to the processing of personal
       data and rules relating to the free movement of personal
       data.

    2. This Regulation protects fundamental rights and freedoms of
       natural persons and in particular their right to the
       protection of personal data.

    3. The free movement of personal data within the Union shall
       be neither restricted nor prohibited due to reasons
       connected with the protection of natural persons with
       regard to the processing of personal data.

Article 2
Material scope

    1. This Regulation applies to the processing of personal data
       wholly or partly by automated means and to the processing
       other than by automated means of personal data which make
       part of a filing system or are intended to make part of a
       filing system.

    2. This Regulation does not apply to the processing of
       personal data:

       (a) in the course of an activity which falls outside the
           scope of Union law;

       (b) by the Member States when carrying out activities
           which fall within the scope of Chapter 2 of Title V of
           the Treaty on European Union;

       (c) by a natural person in the course of a purely personal
           or household activity;

       (d) by competent authorities concerning the prevention,
           investigation, detection or prosecution of criminal
           offences or the execution of criminal penalties,
           including the safeguarding against and the prevention
           of threats to public security.`
};

// Color similarity functions
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function colorDistance(color1, color2) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    if (!c1 || !c2) return 1000; // Max distance for invalid colors
    
    // Use weighted Euclidean distance (emphasize perceived brightness differences)
    return Math.sqrt(
        0.3 * Math.pow(c1.r - c2.r, 2) +
        0.59 * Math.pow(c1.g - c2.g, 2) +
        0.11 * Math.pow(c1.b - c2.b, 2)
    );
}

function schemeDistance(scheme1, scheme2) {
    // Calculate average distance across all color properties
    const properties = ['bg', 'fg', 'keyword', 'string', 'comment', 'function'];
    const distances = properties.map(prop => colorDistance(scheme1[prop], scheme2[prop]));
    return distances.reduce((sum, d) => sum + d, 0) / distances.length;
}

function groupSimilarSchemes(schemes, threshold = 80) {
    // Group schemes by similarity
    const groups = [];
    const used = new Set();
    
    for (let i = 0; i < schemes.length; i++) {
        if (used.has(i)) continue;
        
        const group = [schemes[i]];
        used.add(i);
        
        for (let j = i + 1; j < schemes.length; j++) {
            if (used.has(j)) continue;
            
            if (schemeDistance(schemes[i], schemes[j]) < threshold) {
                group.push(schemes[j]);
                used.add(j);
            }
        }
        
        groups.push(group);
    }
    
    return groups;
}

// State management
let currentLanguage = 'javascript';
let comparisons = [];
let currentComparison = 0;
let preferences = {
    fonts: {},
    sizes: {},
    weights: {},
    lineHeights: {},
    colorSchemes: {}
};

// Tournament stage order
const STAGES = ['fontFamily', 'font', 'colorScheme', 'size', 'weight', 'lineHeight', 'fontStretch', 'letterSpacing'];

// Stage configuration - minimum comparisons before advancing
const stageConfig = {
    fontFamily: { minComparisons: 1 }, // Always just selection
    colorScheme: { minComparisons: 6, useSmartGrouping: true }, // After font selection
    font: { minComparisons: 4 }, // Allow more font comparisons
    size: { minComparisons: 3 },
    weight: { minComparisons: 4 }, // More weight comparisons
    lineHeight: { minComparisons: 4 }, // More line height comparisons
    fontStretch: { minComparisons: 3 }, // New font stretch comparisons
    letterSpacing: { minComparisons: 3 } // New letter spacing comparisons
};
let themeMode = 'dark'; // 'dark' or 'light' - user's selection

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
            colorScheme: [...colorSchemes[themeMode]], // Moved to 2nd position
            font: [], // Will be populated after family selection
            size: [...fontSizes],
            weight: [...fontWeights],
            lineHeight: [...lineHeights],
            fontStretch: [...fontStretches],
            letterSpacing: [...letterSpacings]
        };
        this.currentPairs = [];
        this.winners = {};
        this.fontFamilySelectionMode = true; // New flag for special handling
        this.stageComparisons = {}; // Track comparisons made per stage
        this.colorSchemeGroups = null; // For similarity-based grouping
        this.preferredColorSchemes = []; // Track user's color preferences
        this.generateNextStage();
    }
    
    generateNextStage() {
        const stageIndex = STAGES.indexOf(this.stage);
        
        console.log(`[DEBUG] generateNextStage: stage=${this.stage}, candidates=${this.candidates[this.stage]?.length}, stageIndex=${stageIndex}`);
        
        if (stageIndex === -1 || this.candidates[this.stage].length <= 1) {
            if (stageIndex < STAGES.length - 1) {
                this.winners[this.stage] = this.candidates[this.stage][0];
                this.stage = STAGES[stageIndex + 1];
                
                // Special handling: when font family is chosen, populate fonts from that family
                if (this.stage === 'font' && this.winners.fontFamily) {
                    this.candidates.font = [...fontFamilies[this.winners.fontFamily].fonts];
                }
                
                this.generateNextStage();
            } else {
                this.winners[this.stage] = this.candidates[this.stage][0];
                this.complete = true;
            }
            return;
        }
        
        // For font stage, use similarity-based progressive pairing
        if (this.stage === 'font' && this.candidates.font.length > 4) {
            this.fontRound++;
            console.log(`[DEBUG] Font tournament round ${this.fontRound}`);
            
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
                    console.log(`[DEBUG] Smart pair: ${fontSimilarity.calculate(fontA, fontB).toFixed(1)}% similar`);
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
        
        if (this.currentPairs.length === 0) {
            // Round is complete, check what to do next
            if (this.nextRound && this.nextRound.length > 0) {
                console.log(`[DEBUG] Round complete: nextRound=${this.nextRound.length} candidates`);
                
                // Check if we have a winner AND have made minimum comparisons
                const minComparisons = stageConfig[this.stage]?.minComparisons || 2;
                const comparisons = this.stageComparisons[this.stage] || 0;
                const hasWinner = this.nextRound.length <= 1;
                const hasMinComparisons = comparisons >= minComparisons;
                
                console.log(`[DEBUG] Stage completion check: ${this.stage}, winner=${hasWinner}, comparisons=${comparisons}/${minComparisons}, canAdvance=${hasWinner && hasMinComparisons}`);
                
                // If we have a winner AND have made minimum comparisons, move to next stage
                if (hasWinner && hasMinComparisons) {
                    const stageIndex = STAGES.indexOf(this.stage);
                    
                    if (stageIndex < STAGES.length - 1) {
                        this.winners[this.stage] = this.nextRound[0];
                        this.stage = STAGES[stageIndex + 1];
                        
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
                    if (this.stage === 'colorScheme' && stageConfig[this.stage].useSmartGrouping && this.preferredColorSchemes.length > 0) {
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
            fontStretch: this.winners.fontStretch || 'normal',
            letterSpacing: this.winners.letterSpacing || 0,
            colorScheme: this.winners.colorScheme || colorSchemes[themeMode][0]
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
            case 'fontStretch':
                optionA.fontStretch = pair[0];
                optionB.fontStretch = pair[1];
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
               optionA.fontStretch === optionB.fontStretch &&
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
        const allSchemes = [...colorSchemes[themeMode]];
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
        const stageIndex = STAGES.indexOf(this.stage);
        const totalStages = STAGES.length;
        const baseProgress = (stageIndex / totalStages) * 100;
        
        // Add within-stage progress
        const stageItems = this.candidates[this.stage].length + this.currentPairs.length;
        const stageProgress = stageItems > 0 ? 
            (1 - (this.currentPairs.length / stageItems)) * (100 / totalStages) : 0;
        
        return Math.min(baseProgress + stageProgress, 95);
    }
}

let engine = new ComparisonEngine();

// Initialize the app
function init() {
    loadFonts();
    updateCode();
    
    // Show start screen with both import and font family options
    showStartScreen();
    
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
    // Load custom fonts via @font-face
    loadCustomFonts();
    
    // Use original font families initially (before detection) 
    fontFamilies = fontFamiliesOriginal;
    fonts = Object.values(fontFamilies).flatMap(family => family.fonts);
    
    // Font detection with FontDetective.all()
    function startFontDetection(attempts = 0) {
        if (typeof FontDetective !== 'undefined') {
            try {
                console.log('Running font detection...');
                
                // Use FontDetective.all() to get all detected fonts
                FontDetective.all((detectedFontObjects) => {
                    console.log(`FontDetective detected ${detectedFontObjects.length} fonts`);
                    
                    // Clear and populate detectedFonts set
                    detectedFonts.clear();
                    detectedFontObjects.forEach(fontObj => {
                        detectedFonts.add(fontObj.name);
                        console.log(`✓ ${fontObj.name} is installed`);
                    });
                    
                    // Now filter font families
                    const filteredFamilies = filterFontFamilies();
                    fontFamilies = filteredFamilies;
                    fonts = Object.values(fontFamilies).flatMap(family => family.fonts);
                    console.log(`Font detection complete: ${fonts.length} fonts available`);
                });
                
            } catch (error) {
                console.error('❌ Font detection failed:', error.message);
                document.getElementById('status').textContent = 'Font detection error';
                document.getElementById('status').style.color = 'red';
                console.warn('⚠️  Proceeding with all fonts (not filtered by availability)');
            }
        } else if (attempts < 10) {
            // Wait up to 5 seconds for FontDetective to load
            console.log(`Waiting for FontDetective library... (attempt ${attempts + 1}/10)`);
            setTimeout(() => startFontDetection(attempts + 1), 500);
        } else {
            console.error('❌ FontDetective library failed to load after 5 seconds');
            document.getElementById('status').textContent = 'Font detection unavailable - library failed to load';
            document.getElementById('status').style.color = 'orange';
            console.warn('⚠️  Proceeding with all fonts (not filtered by availability)');
        }
    }
    
    // Start font detection after a brief delay
    setTimeout(() => startFontDetection(), 500);
    
    console.log(`Using all fonts: ${fonts.length} fonts loaded`);
    
    // Load critical Google fonts first (representatives from each family)
    const criticalFonts = [
        'Fira+Code:wght@400;500;600',
        'Source+Code+Pro:wght@400;500;600', 
        'Ubuntu+Mono:wght@400;700',
        'Space+Mono:wght@400;700',
        'Noto+Sans+Mono:wght@400;500;600',
        'VT323:wght@400'
    ];
    
    // Load critical fonts immediately
    const criticalLink = document.createElement('link');
    criticalLink.href = `https://fonts.googleapis.com/css2?family=${criticalFonts.join('&family=')}&display=swap`;
    criticalLink.rel = 'stylesheet';
    document.head.appendChild(criticalLink);
    
    // Split remaining fonts into chunks to avoid URL length limits (2048 chars)
    const chunkSize = 10;
    const chunks = [];
    
    for (let i = 0; i < googleFontFamilies.length; i += chunkSize) {
        chunks.push(googleFontFamilies.slice(i, i + chunkSize));
    }
    
    // Load each chunk as a separate stylesheet with delay
    chunks.forEach((chunk, index) => {
        const link = document.createElement('link');
        const families = chunk.join('&family=');
        link.href = `https://fonts.googleapis.com/css2?family=${families}&display=swap`;
        link.rel = 'stylesheet';
        // Add a small delay between loads to be nice to Google's servers
        setTimeout(() => {
            document.head.appendChild(link);
        }, index * 200 + 500);
    });
    
    // Also load Material Icons for potential UI enhancements
    const iconsLink = document.createElement('link');
    iconsLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    iconsLink.rel = 'stylesheet';
    document.head.appendChild(iconsLink);
}

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
        const fallback = fallbackCodeSamples[language] || fallbackCodeSamples.javascript;
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
        
        // Truncate very long files for better comparison
        const maxLength = 2000;
        const truncatedCode = code.length > maxLength ? 
            code.substring(0, maxLength) + '\n\n// ... (truncated for display)' : 
            code;
            
        codeCache.set(language, truncatedCode);
        return truncatedCode;
        
    } catch (error) {
        console.warn(`Failed to load code from ${url}:`, error);
        
        // Fallback to embedded samples
        const fallback = fallbackCodeSamples[language] || fallbackCodeSamples.javascript;
        codeCache.set(language, fallback);
        return fallback;
    }
}

// Update code display with async loading
async function updateCode() {
    const codeA = document.getElementById('codeA');
    const codeB = document.getElementById('codeB');
    
    // Show loading state
    codeA.innerHTML = '<div class="loading">Loading code...</div>';
    codeB.innerHTML = '<div class="loading">Loading code...</div>';
    
    try {
        const code = await loadCode(currentLanguage);
        
        // Simple syntax highlighting
        const highlighted = highlightCode(code, currentLanguage);
        codeA.innerHTML = highlighted;
        codeB.innerHTML = highlighted;
    } catch (error) {
        console.error('Failed to update code:', error);
        codeA.innerHTML = '<div class="error">Failed to load code</div>';
        codeB.innerHTML = '<div class="error">Failed to load code</div>';
    }
}

// Basic syntax highlighting
function highlightCode(code, language) {
    // Skip syntax highlighting for legal text
    if (language === 'legal') {
        return code
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
    
    // This is a very basic syntax highlighter
    // First escape HTML
    let highlighted = code
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    // Keywords
    const keywords = {
        javascript: ['function', 'const', 'let', 'var', 'if', 'else', 'while', 'for', 'return', 'class', 'import', 'export', 'default', 'new'],
        python: ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'return', 'import', 'from', 'as', 'in', 'and', 'or', 'not'],
        java: ['public', 'private', 'class', 'static', 'void', 'int', 'if', 'else', 'for', 'while', 'return', 'new', 'import', 'package'],
        rust: ['fn', 'pub', 'struct', 'impl', 'use', 'let', 'mut', 'if', 'else', 'for', 'while', 'return', 'self', 'Self'],
        go: ['func', 'package', 'import', 'var', 'const', 'type', 'struct', 'interface', 'if', 'else', 'for', 'range', 'return', 'defer', 'go', 'chan', 'make']
    };
    
    const languageKeywords = keywords[language] || keywords.javascript;
    
    // Store tokens to prevent overlapping replacements
    const tokens = [];
    let tempCode = highlighted;
    
    // First pass: identify and replace with placeholders
    // Comments (do these first as they can contain strings/keywords)
    tempCode = tempCode.replace(/(\/\/[^\n]*)/g, (match) => {
        tokens.push(`<span class="comment">${match}</span>`);
        return `__TOKEN_${tokens.length - 1}__`;
    });
    tempCode = tempCode.replace(/(#[^\n]*)/g, (match) => {
        tokens.push(`<span class="comment">${match}</span>`);
        return `__TOKEN_${tokens.length - 1}__`;
    });
    tempCode = tempCode.replace(/(\/\*[\s\S]*?\*\/)/g, (match) => {
        tokens.push(`<span class="comment">${match}</span>`);
        return `__TOKEN_${tokens.length - 1}__`;
    });
    
    // Strings (do these before keywords as they can contain keyword text)
    tempCode = tempCode.replace(/(["'])([^"']*)\1/g, (match) => {
        tokens.push(`<span class="string">${match}</span>`);
        return `__TOKEN_${tokens.length - 1}__`;
    });
    
    // Keywords
    languageKeywords.forEach(keyword => {
        const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
        tempCode = tempCode.replace(regex, (match) => {
            tokens.push(`<span class="keyword">${match}</span>`);
            return `__TOKEN_${tokens.length - 1}__`;
        });
    });
    
    // Numbers
    tempCode = tempCode.replace(/\b(\d+)\b/g, (match) => {
        tokens.push(`<span class="number">${match}</span>`);
        return `__TOKEN_${tokens.length - 1}__`;
    });
    
    // Replace tokens back
    tokens.forEach((token, index) => {
        tempCode = tempCode.replace(`__TOKEN_${index}__`, token);
    });
    
    return tempCode;
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
    
    // Check if we have the required properties
    if (!optionA || !optionB) {
        console.error('[ERROR] Invalid comparison object - missing optionA or optionB:', comparison);
        showResults();
        return;
    }
    
    // Hide font family selector if it was showing
    document.getElementById('fontFamilySelector').classList.add('hidden');
    
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
        size: 'Font Size',
        weight: 'Font Weight',
        lineHeight: 'Line Height',
        fontStretch: 'Font Stretch',
        letterSpacing: 'Letter Spacing'
    };
    // Update status (similarity info moved to hidden summary)
    const statusText = `Comparing: ${stageNames[stage]}`;
    document.getElementById('status').textContent = statusText;
    
    // Update comparison count
    document.getElementById('comparisonCount').textContent = `Comparison ${comparisons.length + 1}`;
    
    // Apply styles and summaries (pass similarity info)
    applyStyles('codeA', 'panelA', optionA, 'summaryA', similarity);
    applyStyles('codeB', 'panelB', optionB, 'summaryB', similarity);
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
    
    const sampleCode = `function calculate(n) {
    const result = n * 2;
    return result; // => ${8}
}`;
    const ligatureText = '*fi->0;';
    
    Object.entries(fontFamilies).forEach(([familyName, familyData]) => {
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
        
        // Create the main preview element
        const preview = document.createElement('pre');
        preview.className = 'font-family-preview';
        preview.style.fontFamily = familyData.representative;
        preview.style.fontSize = '13px';
        preview.style.lineHeight = '1.5';
        preview.style.flex = '1';
        preview.style.margin = '0';
        preview.style.padding = '12px';
        preview.style.backgroundColor = 'transparent';
        preview.style.border = 'none';
        preview.textContent = sampleCode;
        
        // Create draggable divider
        const divider = document.createElement('div');
        divider.className = 'preview-divider';
        divider.style.width = '4px';
        divider.style.backgroundColor = 'rgba(0,0,0,0.3)';
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
        ligaturePreview.style.fontFamily = familyData.representative;
        ligaturePreview.style.fontSize = '32px';
        ligaturePreview.style.lineHeight = '1.0';
        ligaturePreview.style.textAlign = 'center';
        ligaturePreview.style.padding = '12px';
        ligaturePreview.style.backgroundColor = 'transparent';
        ligaturePreview.style.flexShrink = '0';
        ligaturePreview.style.width = '100px';
        ligaturePreview.style.display = 'flex';
        ligaturePreview.style.alignItems = 'center';
        ligaturePreview.style.justifyContent = 'center';
        ligaturePreview.style.whiteSpace = 'nowrap';
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
        const previews = document.querySelectorAll('.font-family-preview, .ligature-preview');
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
    
    code.style.fontFamily = option.font;
    code.style.fontSize = option.fontSize + 'px';
    code.style.fontWeight = option.fontWeight;
    code.style.lineHeight = option.lineHeight;
    code.style.fontStretch = option.fontStretch || 'normal';
    code.style.letterSpacing = (option.letterSpacing || 0) + 'px';
    
    if (option.colorScheme) {
        panel.style.backgroundColor = option.colorScheme.bg;
        code.style.color = option.colorScheme.fg;
        
        // Apply syntax highlighting colors
        const keywords = code.querySelectorAll('.keyword');
        const strings = code.querySelectorAll('.string');
        const comments = code.querySelectorAll('.comment');
        const numbers = code.querySelectorAll('.number');
        
        keywords.forEach(el => el.style.color = option.colorScheme.keyword);
        strings.forEach(el => el.style.color = option.colorScheme.string);
        comments.forEach(el => el.style.color = option.colorScheme.comment);
        numbers.forEach(el => el.style.color = option.colorScheme.function);
    }
    
    // Update summary if provided
    if (summary) {
        const fontName = option.font.split(',')[0].replace(/"/g, '');
        const themeName = option.colorScheme ? option.colorScheme.name : 'Unknown';
        const stretchNote = (option.fontStretch && option.fontStretch !== 'normal') ? 
            ` • ${option.fontStretch} (may not be visible)` : '';
        
        let similarityText = '';
        if (similarity && engine.stage === 'font') {
            const categoryText = similarity.category.replace('-', ' ');
            const scoreText = Math.round(similarity.score);
            similarityText = `<br><em>Round ${similarity.round}: ${categoryText} (${scoreText}% similar)</em>`;
        }
        
        summary.innerHTML = `
            <strong>${fontName}</strong><br>
            ${option.fontSize}px • ${option.fontWeight}${stretchNote}<br>
            ${option.letterSpacing || 0}px spacing • ${option.lineHeight} line height<br>
            ${themeName}${similarityText}
        `;
    }
}

// Handle option selection
function selectOption(choice) {
    engine.submitChoice(choice);
    comparisons.push(choice);
    showNextComparison();
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
        }
    }, 100);
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
        fontStretch: rawResults.fontStretch || 'normal',
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
                <strong>Font Stretch:</strong> ${results.fontStretch || 'normal'}
                <button class="re-compare-btn" onclick="recompareStage('fontStretch')">Re-compare</button>
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
    
    // Load the current language code for results
    loadCode(currentLanguage).then(code => {
        resultCode.innerHTML = highlightCode(code, currentLanguage);
    }).catch(error => {
        console.error('Failed to load code for results:', error);
        resultCode.innerHTML = '<div class="error">Failed to load code</div>';
    });
    // Extract just the primary font name, not the fallback stack
    const primaryFont = results.font.split(',')[0].replace(/['"]/g, '').trim();
    resultCode.style.fontFamily = results.font;
    resultCode.style.fontSize = results.size + 'px';
    resultCode.style.fontWeight = results.weight;
    resultCode.style.lineHeight = results.lineHeight;
    resultCode.style.color = results.colorScheme.fg;
    resultCode.parentElement.style.backgroundColor = results.colorScheme.bg;
    
    // Apply syntax colors
    const keywords = resultCode.querySelectorAll('.keyword');
    const strings = resultCode.querySelectorAll('.string');
    const comments = resultCode.querySelectorAll('.comment');
    const numbers = resultCode.querySelectorAll('.number');
    
    keywords.forEach(el => el.style.color = results.colorScheme.keyword);
    strings.forEach(el => el.style.color = results.colorScheme.string);
    comments.forEach(el => el.style.color = results.colorScheme.comment);
    numbers.forEach(el => el.style.color = results.colorScheme.function);
}

// Configuration export templates
const configTemplates = {
    vscode: (settings) => ({
        filename: 'settings.json',
        content: `{
    "editor.fontFamily": "${settings.font}",
    "editor.fontSize": ${settings.size},
    "editor.fontWeight": "${settings.weight}",
    "editor.fontStretch": "${settings.fontStretch || 'normal'}",
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
    const compact = {
        f: settings.fontFamily,
        s: settings.font,
        z: settings.size,
        w: settings.weight,
        l: settings.lineHeight,
        st: settings.fontStretch || 'normal',
        sp: settings.letterSpacing || 0,
        c: settings.colorScheme.name,
        t: themeMode
    };
    return btoa(JSON.stringify(compact));
}

function importSettings(encoded) {
    try {
        const compact = JSON.parse(atob(encoded));
        return {
            fontFamily: compact.f,
            font: compact.s,
            size: compact.z,
            weight: compact.w,
            lineHeight: compact.l,
            fontStretch: compact.st || 'normal',
            letterSpacing: compact.sp || 0,
            colorSchemeName: compact.c,
            themeMode: compact.t
        };
    } catch (e) {
        throw new Error('Invalid settings string');
    }
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
    
    const css = `/* Your optimized code display settings */
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
    
    // Create comprehensive export data
    const exportData = {
        settings: results,
        css: css,
        timestamp: new Date().toISOString(),
        version: '1.0',
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
   Text Color: ${results.colorScheme.fg}

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
    const css = `/* Your optimized code display settings */
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
        engine.candidates.colorScheme = [...colorSchemes[themeMode]];
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
    }
}

// Handle '?' key for showing/hiding property summaries
document.addEventListener('keydown', function(e) {
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        document.body.classList.add('show-summaries');
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
        case 'fontStretch':
            engine.candidates.fontStretch = [...fontStretches];
            break;
        case 'letterSpacing':
            engine.candidates.letterSpacing = [...letterSpacings];
            break;
        case 'colorScheme':
            engine.candidates.colorScheme = [...colorSchemes[themeMode]];
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
            colorScheme: colorSchemes[imported.themeMode].find(c => c.name === imported.colorSchemeName) || colorSchemes[imported.themeMode][0]
        };
        engine.complete = true;
        
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
    const downloadLinks = {
        // Google Fonts with direct TTF download links
        'Fira Code': {
            url: 'https://fonts.google.com/specimen/Fira+Code',
            downloadUrl: 'https://fonts.google.com/download?family=Fira%20Code',
            instructions: 'Download from Google Fonts and install locally',
            type: 'free'
        },
        'JetBrains Mono': {
            url: 'https://www.jetbrains.com/lp/mono/',
            downloadUrl: 'https://download.jetbrains.com/fonts/JetBrainsMono-2.304.zip',
            instructions: 'Download from JetBrains and install locally',
            type: 'free'
        },
        'Source Code Pro': {
            url: 'https://fonts.google.com/specimen/Source+Code+Pro',
            downloadUrl: 'https://fonts.google.com/download?family=Source%20Code%20Pro',
            instructions: 'Download from Google Fonts and install locally',
            type: 'free'
        },
        'Cascadia Code': {
            url: 'https://github.com/microsoft/cascadia-code/releases',
            downloadUrl: 'https://github.com/microsoft/cascadia-code/releases/latest/download/CascadiaCode.zip',
            instructions: 'Download from GitHub releases and install',
            type: 'free'
        },
        'Cascadia Mono': {
            url: 'https://github.com/microsoft/cascadia-code/releases',
            downloadUrl: 'https://github.com/microsoft/cascadia-code/releases/latest/download/CascadiaCode.zip',
            instructions: 'Download from GitHub releases and install (includes Cascadia Mono)',
            type: 'free'
        },
        'Hack': {
            url: 'https://github.com/source-foundry/Hack/releases',
            downloadUrl: 'https://github.com/source-foundry/Hack/releases/download/v3.003/Hack-v3.003-ttf.zip',
            instructions: 'Download from GitHub releases and install',
            type: 'free'
        },
        'Iosevka': {
            url: 'https://github.com/be5invis/Iosevka/releases',
            downloadUrl: 'https://github.com/be5invis/Iosevka/releases/latest',
            instructions: 'Download from GitHub releases and install (choose variant)',
            type: 'free'
        },
        'Hasklig': {
            url: 'https://github.com/i-tu/Hasklig/releases',
            downloadUrl: 'https://github.com/i-tu/Hasklig/releases/latest',
            instructions: 'Download from GitHub releases and install',
            type: 'free'
        },
        'Victor Mono': {
            url: 'https://rubjo.github.io/victor-mono/',
            downloadUrl: 'https://fonts.google.com/download?family=Victor%20Mono',
            instructions: 'Download from Google Fonts and install locally',
            type: 'free'
        },
        'Geist Mono': {
            url: 'https://fonts.google.com/specimen/Geist+Mono',
            downloadUrl: 'https://fonts.google.com/download?family=Geist%20Mono',
            instructions: 'Download from Google Fonts and install locally',
            type: 'free'
        },
        'MonoLisa': {
            url: 'https://www.monolisa.dev/',
            instructions: 'Commercial font - purchase from official site',
            type: 'commercial'
        },
        'Operator Mono': {
            url: 'https://www.typography.com/fonts/operator/styles',
            instructions: 'Commercial font - purchase from Hoefler&Co',
            type: 'commercial'
        },
        'Dank Mono': {
            url: 'https://dank.sh/',
            instructions: 'Commercial font - purchase from official site',
            type: 'commercial'
        },
        'Comic Code': {
            url: 'https://tosche.net/fonts/comic-code',
            instructions: 'Commercial font - purchase from Toshi Omagari',
            type: 'commercial'
        },
        'Berkeley Mono': {
            url: 'https://berkeleygraphics.com/typefaces/berkeley-mono/',
            instructions: 'Commercial font - purchase from Berkeley Graphics',
            type: 'commercial'
        },
        'PragmataPro': {
            url: 'https://fsd.it/shop/fonts/pragmatapro/',
            instructions: 'Commercial font - purchase from Fabrizio Schiavi Design',
            type: 'commercial'
        },
        'Input Mono': {
            url: 'https://input.djr.com/download/',
            downloadUrl: 'https://input.djr.com/build/?family=InputMono&variant=InputMono-Regular&size=14&lineHeight=1.2&a=0&g=0&i=0&l=0&zero=0&asterisk=0&braces=0&preset=default&customize=please',
            instructions: 'Free for personal use - download from DJR',
            type: 'free'
        },
        'SF Mono': {
            url: 'https://developer.apple.com/fonts/',
            instructions: 'Available with Xcode or macOS Terminal',
            type: 'system'
        },
        'Monaco': {
            url: 'https://developer.apple.com/fonts/',
            instructions: 'Pre-installed on macOS',
            type: 'system'
        },
        'Consolas': {
            url: 'https://docs.microsoft.com/en-us/typography/font-list/consolas',
            instructions: 'Pre-installed on Windows Vista and later',
            type: 'system'
        },
        'Aptos Mono': {
            url: 'https://www.microsoft.com/en-us/microsoft-365/blog/2023/07/13/aptos-default-font/',
            instructions: 'Pre-installed on Windows 11 and Microsoft 365',
            type: 'system'
        },
        'Menlo': {
            url: 'https://developer.apple.com/fonts/',
            instructions: 'Pre-installed on macOS',
            type: 'system'
        },
        'DejaVu Sans Mono': {
            url: 'https://dejavu-fonts.github.io/',
            downloadUrl: 'https://github.com/dejavu-fonts/dejavu-fonts/releases/latest/download/dejavu-fonts-ttf-2.37.zip',
            instructions: 'Download from DejaVu Fonts project',
            type: 'free'
        },
        'Liberation Mono': {
            url: 'https://github.com/liberationfonts/liberation-fonts/releases',
            downloadUrl: 'https://github.com/liberationfonts/liberation-fonts/releases/latest/download/liberation-fonts-ttf-2.1.5.tar.gz',
            instructions: 'Download from GitHub releases',
            type: 'free'
        },
        'Serious Shanns': {
            url: 'https://kabeech.github.io/serious-shanns/',
            instructions: 'Download from official site and install'
        },
        'Intel One Mono': {
            url: 'https://github.com/intel/intel-one-mono/releases',
            instructions: 'Download from GitHub releases and install'
        },
        'Geist Mono': {
            url: 'https://vercel.com/font',
            instructions: 'Download from Vercel and install'
        },
        'JuliaMono': {
            url: 'https://juliamono.netlify.app/',
            instructions: 'Download from official site and install'
        },
        'Monocraft': {
            url: 'https://github.com/IdreesInc/Monocraft/releases',
            instructions: 'Download from GitHub releases and install'
        },
        // Add more fonts from the CSV data
        'IBM Plex Mono': {
            url: 'https://fonts.google.com/specimen/IBM+Plex+Mono',
            instructions: 'Download from Google Fonts and install locally'
        },
        'Roboto Mono': {
            url: 'https://fonts.google.com/specimen/Roboto+Mono',
            instructions: 'Download from Google Fonts and install locally'
        },
        'Ubuntu Mono': {
            url: 'https://fonts.google.com/specimen/Ubuntu+Mono',
            instructions: 'Download from Google Fonts and install locally'
        },
        'Space Mono': {
            url: 'https://fonts.google.com/specimen/Space+Mono',
            instructions: 'Download from Google Fonts and install locally'
        },
        'Inconsolata': {
            url: 'https://fonts.google.com/specimen/Inconsolata',
            instructions: 'Download from Google Fonts and install locally'
        }
    };
    
    // Check for exact match first
    if (downloadLinks[fontName]) {
        return downloadLinks[fontName];
    }
    
    // Check for partial matches
    for (const [key, value] of Object.entries(downloadLinks)) {
        if (fontName.toLowerCase().includes(key.toLowerCase()) || 
            key.toLowerCase().includes(fontName.toLowerCase())) {
            return value;
        }
    }
    
    // Default fallback for unknown fonts
    return {
        url: `https://www.google.com/search?q=${encodeURIComponent(fontName + ' font download')}`,
        instructions: 'Search for this font online'
    };
}

// Start the app
init();