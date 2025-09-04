// Font roles system for multi-font syntax highlighting support
// This extends Code Phoropter to test different fonts for different syntax elements

const fontRoles = {
    'base': {
        id: 0,
        name: 'Base Code',
        description: 'Main monospace font for regular code',
        cssSelector: 'code, .token:not(.comment):not(.string):not(.keyword)',
        requirements: ['monospace', 'ligatures-optional'],
        examples: ['const x = 42;', 'function getName() {', 'return value;'],
        recommendedCategories: ['Clean & Modern', 'Classic Terminal', 'Ligature-Enabled']
    },
    'comments': {
        id: 3,
        name: 'Comments',
        description: 'Font for comments and documentation',
        cssSelector: '.token.comment, .comment',
        requirements: ['monospace', 'italic-support'],
        examples: ['// This is a comment', '/* Block comment */', '# Python comment'],
        recommendedCategories: ['Ligature-Enabled', 'Distinctive'],
        preferredStyles: ['italic', 'lighter-weight']
    },
    'strings': {
        id: 2,
        name: 'Strings & Literals',
        description: 'Font for string literals and text content',
        cssSelector: '.token.string, .string',
        requirements: ['monospace', 'unicode-support'],
        examples: ['"Hello world"', "'single quotes'", '`template ${string}`'],
        recommendedCategories: ['Clean & Modern', 'Distinctive'],
        preferredStyles: ['regular', 'slightly-condensed']
    },
    'keywords': {
        id: 1,
        name: 'Keywords & Operators',
        description: 'Font for language keywords and operators',
        cssSelector: '.token.keyword, .keyword, .token.operator',
        requirements: ['monospace', 'bold-support'],
        examples: ['function', 'const', 'return', '=>', '==='],
        recommendedCategories: ['Clean & Modern', 'Ligature-Enabled'],
        preferredStyles: ['bold', 'medium-weight']
    },
    'function': {
        id: 4,
        name: 'Function Names',
        description: 'Font for function/method identifiers and titles',
        cssSelector: '.hljs-function, .hljs-title',
        requirements: ['monospace', 'clear-identifiers'],
        examples: ['function fetchData() {', 'getUserName()', 'class MyService'],
        recommendedCategories: ['Clean & Modern', 'Ligature-Enabled'],
        preferredStyles: ['regular', 'medium-weight']
    },
    'ghost': {
        id: 5,
        name: 'Ghost Text (AI Suggestions)',
        description: 'Font for AI completions and suggestions',
        cssSelector: '.ghost-text, .suggestion, .copilot',
        requirements: ['monospace', 'italic-support', 'light-weight'],
        examples: ['// AI suggested completion', '.forEach(item => {', 'console.log(item);'],
        recommendedCategories: ['Ligature-Enabled', 'Clean & Modern'],
        preferredStyles: ['italic', 'light-weight', 'muted']
    },
    'inlayHints': {
        name: 'Inlay Hints',
        description: 'Font for type annotations and parameter hints',
        cssSelector: '.inlay-hint, .type-annotation',
        requirements: ['monospace', 'small-size-readable'],
        examples: [': string', ': Promise<T>', '(param: number)'],
        recommendedCategories: ['Clean & Modern', 'Classic Terminal'],
        preferredStyles: ['regular', 'condensed', 'smaller-size']
    },
    'errors': {
        name: 'Error Text',
        description: 'Font for error messages and diagnostics',
        cssSelector: '.error-text, .diagnostic, .squiggle',
        requirements: ['monospace', 'bold-support'],
        examples: ['TypeError: Cannot read property', 'Syntax error on line 42', 'Warning: Unused variable'],
        recommendedCategories: ['Clean & Modern', 'Classic Terminal'],
        preferredStyles: ['medium-weight', 'readable-at-small-sizes']
    },
    'math': {
        name: 'Math & Unicode',
        description: 'Font for mathematical symbols and special characters',
        cssSelector: '.math, .unicode-symbol',
        requirements: ['monospace', 'extensive-unicode', 'math-symbols'],
        examples: ['α β γ δ', '∑ ∫ ∂ ∇', '≤ ≥ ≠ ≈', '→ ← ↑ ↓'],
        recommendedCategories: ['Ligature-Enabled', 'Distinctive'],
        preferredStyles: ['regular', 'symbol-optimized']
    },
    'terminal': {
        name: 'Terminal Output',
        description: 'Font for console and terminal text',
        cssSelector: '.terminal, .console, .stdout',
        requirements: ['monospace', 'high-contrast'],
        examples: ['$ npm install', '> Building project...', 'ERROR: Build failed'],
        recommendedCategories: ['Classic Terminal', 'System Fonts'],
        preferredStyles: ['regular', 'high-contrast']
    },
    'powerline': {
        name: 'Powerline Segments',
        description: 'Font for powerline status bar segments with special glyphs',
        cssSelector: '.powerline, .status-bar, .prompt',
        requirements: ['monospace', 'powerline-glyphs', 'consistent-width'],
        examples: [' master  ~/code ', '  15:42:30 ', ' 🔋 85% '],
        glyphExamples: [
            '  (branch)', '  (ahead)', '  (behind)',
            '  (staged)', '  (unstaged)', '  (untracked)',
            '  (stash)', '  (tag)', '  (remote)'
        ],
        recommendedCategories: ['Classic Terminal', 'Ligature-Enabled'],
        preferredStyles: ['regular', 'powerline-patched']
    },
    'nerdFont': {
        name: 'Nerd Font Icons',
        description: 'Font for file type icons and development symbols',
        cssSelector: '.file-icon, .nerd-font, .dev-icon',
        requirements: ['monospace', 'nerd-font-glyphs', 'icon-alignment'],
        examples: ['  index.js', '  package.json', '  README.md'],
        glyphExamples: [
            '  JavaScript', '  TypeScript', '  Python',
            '  Rust', '  Go', '  Java', '  C++',
            '  HTML', '  CSS', '  JSON', '  Markdown',
            '  Git', '  Docker', '  Kubernetes'
        ],
        recommendedCategories: ['Classic Terminal', 'System Fonts'],
        preferredStyles: ['regular', 'nerd-font-patched']
    },
    'statusBar': {
        name: 'Status Bar Elements',
        description: 'Font for IDE status bar with mixed text and icons',
        cssSelector: '.status-bar, .info-bar, .editor-status',
        requirements: ['monospace', 'mixed-content-support', 'small-size-readable'],
        examples: ['Ln 42, Col 8', ' TypeScript', '  4 problems'],
        glyphExamples: [
            '  (errors)', '  (warnings)', '  (info)',
            '  (git)', '  (branch)', '  (sync)',
            '  (extensions)', '  (settings)'
        ],
        recommendedCategories: ['Clean & Modern', 'System Fonts'],
        preferredStyles: ['regular', 'condensed']
    },
    'documentation': {
        name: 'Documentation',
        description: 'Font for markdown in docstrings and documentation',
        cssSelector: '.docstring, .markdown-in-code',
        requirements: ['monospace-optional', 'markdown-friendly'],
        examples: ['**bold text**', '*italic text*', '`inline code`'],
        recommendedCategories: ['Distinctive', 'Clean & Modern'],
        preferredStyles: ['regular', 'markdown-optimized']
    }
};

// Font suitability matrix - which fonts work well for which roles
const fontSuitabilityMatrix = {
    // Fonts particularly good for comments (italic support)
    'comments-excellent': ['Victor Mono', 'Cascadia Code', 'JetBrains Mono', 'Operator Mono', 'Dank Mono'],
    'comments-good': ['Fira Code', 'Iosevka', 'Comic Code', 'Recursive'],
    
    // Fonts great for ghost text (light, italic)
    'ghost-excellent': ['Victor Mono', 'Operator Mono', 'Dank Mono', 'JetBrains Mono'],
    'ghost-good': ['Cascadia Code', 'Iosevka', 'Fira Code'],
    
    // Fonts with excellent Unicode/math support
    'math-excellent': ['JuliaMono', 'Iosevka', 'DejaVu Sans Mono', 'Noto Sans Mono'],
    'math-good': ['Source Code Pro', 'Liberation Mono', 'APL2741'],
    
    // Fonts optimized for terminal use
    'terminal-excellent': ['Consolas', 'Monaco', 'Menlo', 'SF Mono', 'Terminus'],
    'terminal-good': ['Ubuntu Mono', 'Liberation Mono', 'Anonymous Pro'],
    
    // Fonts that work well at small sizes (inlay hints)
    'small-size-excellent': ['Consolas', 'SF Mono', 'Monaco', 'Source Code Pro'],
    'small-size-good': ['IBM Plex Mono', 'Roboto Mono', 'Intel One Mono'],
    
    // Fonts with excellent powerline glyph support
    'powerline-excellent': ['Cascadia Code', 'JetBrains Mono', 'Fira Code', 'Hack', 'Meslo LG'],
    'powerline-good': ['Source Code Pro', 'Ubuntu Mono', 'Inconsolata', 'Liberation Mono'],
    
    // Fonts with Nerd Font icon support (patched versions)
    'nerd-font-excellent': ['Hack Nerd Font', 'JetBrains Mono Nerd Font', 'Fira Code Nerd Font', 'Cascadia Code Nerd Font'],
    'nerd-font-good': ['Source Code Pro Nerd Font', 'Ubuntu Mono Nerd Font', 'Inconsolata Nerd Font'],
    
    // Fonts that handle mixed content well (text + icons)
    'mixed-content-excellent': ['JetBrains Mono', 'Cascadia Code', 'SF Mono', 'Consolas'],
    'mixed-content-good': ['Source Code Pro', 'IBM Plex Mono', 'Roboto Mono']
};

// Multi-font configuration presets
const multiFontPresets = {
    'vscode-default': {
        name: 'VS Code Default Style',
        description: 'Mimics VS Code\'s multi-font approach',
        fonts: {
            base: 'Consolas',
            comments: 'Consolas', // italic via CSS
            strings: 'Consolas',
            keywords: 'Consolas', // bold via CSS
            ghost: 'Consolas', // italic + light via CSS
            inlayHints: 'Consolas', // smaller size via CSS
            errors: 'Consolas',
            math: 'Consolas',
            terminal: 'Consolas',
            documentation: 'Consolas'
        }
    },
    'ligature-focused': {
        name: 'Ligature-Focused Setup',
        description: 'Emphasizes programming ligatures for operators',
        fonts: {
            base: 'Fira Code',
            comments: 'Victor Mono', // cursive italics
            strings: 'Fira Code',
            keywords: 'Fira Code', // bold
            ghost: 'Victor Mono', // light cursive
            inlayHints: 'Source Code Pro', // clean and small
            errors: 'Fira Code',
            math: 'JuliaMono', // excellent Unicode
            terminal: 'Monaco',
            documentation: 'Victor Mono'
        }
    },
    'contrast-optimized': {
        name: 'High Contrast & Readability',
        description: 'Optimizes different elements for maximum readability',
        fonts: {
            base: 'JetBrains Mono',
            comments: 'Operator Mono', // italic serif-like
            strings: 'IBM Plex Mono', // clean sans-serif
            keywords: 'JetBrains Mono', // bold
            ghost: 'Operator Mono', // light italic
            inlayHints: 'SF Mono', // system optimized
            errors: 'Consolas', // high contrast
            math: 'DejaVu Sans Mono', // excellent Unicode
            terminal: 'Menlo',
            documentation: 'IBM Plex Mono'
        }
    },
    'premium-mixed': {
        name: 'Premium Font Mix',
        description: 'Uses premium fonts for optimal experience',
        fonts: {
            base: 'MonoLisa',
            comments: 'Dank Mono', // beautiful italics
            strings: 'Berkeley Mono',
            keywords: 'MonoLisa', // bold
            ghost: 'Dank Mono', // light italic
            inlayHints: 'PragmataPro', // condensed
            errors: 'MonoLisa',
            math: 'JuliaMono',
            terminal: 'Berkeley Mono',
            documentation: 'Comic Code' // playful for docs
        }
    },
    'minimalist': {
        name: 'Single Font, Multiple Weights',
        description: 'Uses one font family with different weights and styles',
        fonts: {
            base: 'Recursive',
            comments: 'Recursive', // italic
            strings: 'Recursive',
            keywords: 'Recursive', // bold
            ghost: 'Recursive', // light italic
            inlayHints: 'Recursive', // condensed
            errors: 'Recursive', // medium
            math: 'Recursive',
            terminal: 'Recursive',
            documentation: 'Recursive',
            powerline: 'Recursive',
            nerdFont: 'Recursive',
            statusBar: 'Recursive'
        }
    },
    'terminal-powerline': {
        name: 'Terminal & Powerline Optimized',
        description: 'Specialized setup for terminal work with powerline and nerd fonts',
        fonts: {
            base: 'JetBrains Mono',
            comments: 'JetBrains Mono', // italic
            strings: 'JetBrains Mono',
            keywords: 'JetBrains Mono', // bold
            ghost: 'JetBrains Mono', // light
            inlayHints: 'Cascadia Code', // compact
            errors: 'Consolas', // high contrast
            math: 'JuliaMono', // Unicode symbols
            terminal: 'Hack Nerd Font', // full nerd font support
            documentation: 'JetBrains Mono',
            powerline: 'Hack Nerd Font', // powerline glyphs
            nerdFont: 'Hack Nerd Font', // file icons
            statusBar: 'Cascadia Code' // mixed content
        }
    },
    'developer-complete': {
        name: 'Complete Developer Experience',
        description: 'Full multi-font setup covering all development scenarios',
        fonts: {
            base: 'Fira Code',
            comments: 'Victor Mono', // beautiful italics
            strings: 'IBM Plex Mono', // clean strings
            keywords: 'Fira Code', // ligatures for operators
            ghost: 'Operator Mono', // elegant suggestions
            inlayHints: 'SF Mono', // system optimized
            errors: 'Monaco', // high readability
            math: 'JuliaMono', // comprehensive Unicode
            terminal: 'Cascadia Code Nerd Font', // modern terminal
            documentation: 'Source Code Pro', // clean docs
            powerline: 'JetBrains Mono Nerd Font', // powerline segments
            nerdFont: 'Fira Code Nerd Font', // file type icons
            statusBar: 'Consolas' // status information
        }
    }
    ,
    'monaspace': {
        name: 'Monaspace Mix',
        description: 'Neon for base, Radon for comments, Xenon for docs, Krypton for ghost',
        fonts: {
            base: { font: 'Monaspace Neon', weight: 400, style: 'normal' },
            comments: { font: 'Monaspace Radon', weight: 400, style: 'italic' },
            documentation: { font: 'Monaspace Xenon', weight: 400, style: 'normal' },
            ghost: { font: 'Monaspace Krypton', weight: 300, style: 'italic' }
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { fontRoles, fontSuitabilityMatrix, multiFontPresets };
} else {
    window.fontRoles = fontRoles;
    window.fontSuitabilityMatrix = fontSuitabilityMatrix;
    window.multiFontPresets = multiFontPresets;
}
