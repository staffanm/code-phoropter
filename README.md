# Code Phoropter

> Find your perfect code display settings through systematic A/B testing

Code Phoropter helps developers discover their ideal coding font, size, colors, and spacing through side-by-side comparisons — just like an eye doctor uses a phoropter to find your perfect vision prescription through "better 1 or 2?" tests.

![Phoropter Logo](b00e6c8f-2ff0-47b9-a833-bd9fab5fa2a4.png)

## Features

### 🎯 Systematic Font Selection
- **Tournament-style comparisons**: Side-by-side A/B testing of fonts
- **6 Font categories**: Classic Terminal, Modern Development, Ligature-Enabled, Variable Width, Open Source Favorites, and Unique & Distinctive
- **100+ coding fonts**: Comprehensive database including system, Google Fonts, and premium options
- **Smart similarity scoring**: Progressively refines choices based on your preferences

### 🔍 Comprehensive Testing
- **Font families**: Find your preferred style first
- **Font sizes**: 10px to 24px range testing
- **Font weights**: Light (300) to Bold (700)
- **Line heights**: 1.2 to 2.0 spacing optimization
- **Color schemes**: 50+ light and dark themes with syntax highlighting

### 💾 Export Options
- **Download Package**: ZIP file with font files, configuration, and installation instructions
- **Copy CSS**: Ready-to-use CSS for your projects
- **Editor configs**: VS Code, Sublime Text, Vim, Terminal settings
- **Multi-font support**: Export configurations for different syntax elements
- **Import/Export**: Save and share your preferences

### 🎨 Live Preview
- **Real code samples**: JavaScript, Python, Rust, Go, Java, CSS, HTML, JSON, Markdown, Legal/GDPR, Powerline & Nerd Fonts
- **Custom code**: Test with your own code snippets
- **Ligature preview**: See programming ligatures in action
- **Syntax highlighting**: Accurate keyword, string, comment, and function colors
- **Terminal elements**: Powerline segments, file icons, status bars with Nerd Font glyphs

## Quick Start

1. Open the app
2. Choose a font family that appeals to you
3. Make comparisons using keyboard shortcuts:
   - `A` - Prefer left option
   - `S` - No preference
   - `D` - Prefer right option
4. Complete all rounds of testing
5. Download your package with optimized settings

## Installation

### Option 1: Use Online
Visit [phoropter.org](https://phoropter.org)

### Option 2: Run Locally
```bash
git clone https://github.com/staffanm/code-phoropter.git
cd code-phoropter
npm install
npm run fonts:pull   # optional: download the embedded font files (4 GB) from the server
npm run dev          # then visit the URL that Vite prints
```

Without the `fonts/` directory, the embedded fonts fall back to a placeholder font. System fonts and Google Fonts still work.

## Scripts

| Command | Action |
|---------|--------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check, then build the site into `dist/` |
| `npm run preview` | Serve the built site locally |
| `npm run typecheck` | Run the TypeScript compiler without output |
| `npm run deploy` | Build, then copy `dist/` to the web server |
| `npm run fonts:pull` | Download the `fonts/` directory from the web server |
| `npm run fonts:push` | Upload the `fonts/` directory to the web server. Files that are not in the local directory are deleted on the server. |
| `npm run fonts:generate` | Regenerate `font-metrics.json` and `public/embedded-fonts.css` |
| `npm run fonts:metrics` | Regenerate `font-metrics.json`. With `-- "Font Name"`, print the metrics for one font. |
| `npm run fonts:css` | Regenerate `public/embedded-fonts.css` |
| `npm run fonts:analyze` | Compare the axes in `font-database.json` with the files in `fonts/` |
| `npm run fonts:validate` | Download and validate the fonts that the database references by URL |
| `npm run db:ids` | Show which IDs would change in the databases. With `-- --write`, write them. |
| `npm run db:nerd-fonts` | Update the Nerd Font entries in `font-database.json` from `fonts/*.NF` |

The `fonts/` directory is not in git and is not part of the build output. In development, Vite serves it at `/fonts/`. In production, the web server serves it (see `deploy/`).

## Developer Options

Add query parameters to enable development behavior while testing locally:

- `?dev=1`: Enables both options below.
- `?eagerFonts=1`: Eager‑load all embedded faces (every width × weight × style) at startup. Helpful to catch naming or template issues.
- `?verbose=1`: Print debug logs (progress, pairing, embedded load info) to the console.

Examples:

- `http://localhost:5173/index.html?dev=1`
- `http://localhost:5173/about.html?verbose=1`

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `A` | Prefer left option |
| `S` | No preference |  
| `D` | Prefer right option |
| `R` | Reset/Start Over |
| `T` | Toggle theme |

## How It Works

### Tournament Algorithm
1. **Font Family Selection**: Choose from 6 curated categories
2. **Round-robin comparisons**: Each font faces others in its similarity group
3. **Scoring system**: Wins = 3 points, Ties = 1 point
4. **Progressive refinement**: Size → Weight → Line Height → Colors
5. **Final result**: Your perfectly optimized settings

### Font Detection
- Uses FontDetective library for local font detection
- Checks 20+ common coding fonts on your system
- Provides download links for missing fonts
- Handles commercial, free, and system fonts appropriately

## Font Categories

### Classic Terminal
Traditional terminal and system fonts like Consolas, Monaco, Courier New

### Modern Development  
Contemporary coding fonts like Fira Code, JetBrains Mono, Cascadia Code

### Ligature-Enabled
Fonts with programming ligatures and special symbols (→, ≠, ≤)

### Variable Width
Proportional fonts for unique reading experiences

### Open Source Favorites
Community-driven fonts like Source Code Pro, Hack, Iosevka

### Unique & Distinctive
Fonts with special character like Comic Code, Serious Shanns

## Multi-Font Support

Code Phoropter extends beyond single-font testing to support the advanced multi-font configurations used by modern development environments:

### Font Roles
- **Base Code**: Main monospace font for regular code
- **Comments**: Specialized fonts for comments (often italic)
- **Strings**: Fonts optimized for string literals
- **Keywords**: Fonts for language keywords and operators
- **Ghost Text**: Light fonts for AI suggestions and completions
- **Inlay Hints**: Compact fonts for type annotations
- **Error Text**: High-contrast fonts for error messages
- **Math & Unicode**: Fonts with extensive symbol support
- **Terminal Output**: Terminal-optimized fonts
- **Powerline Segments**: Fonts with powerline glyph support
- **Nerd Font Icons**: Fonts with file type and development icons
- **Status Bar**: Mixed content fonts for IDE status bars

### Supported Environments
- **VS Code**: Different fonts for editor, inlay hints, and terminal
- **JetBrains IDEs**: Separate fonts for code, console, and syntax elements
- **Terminal Emulators**: Powerline and Nerd Font support (iTerm2, Windows Terminal, Kitty)
- **Shell Prompts**: Oh My Zsh, Starship, and Powerline configurations
- **Web Editors**: CodePen, Repl.it, GitHub Codespaces

### Multi-Font Presets
- **VS Code Default Style**: Single font with CSS styling variations
- **Ligature-Focused Setup**: Emphasizes programming ligatures
- **High Contrast & Readability**: Optimized for maximum readability
- **Premium Font Mix**: Uses premium fonts for optimal experience
- **Terminal & Powerline Optimized**: Specialized for terminal work
- **Complete Developer Experience**: Full multi-font development setup

## Package Contents

When you download your configuration package, you get:

```
code-phoropter-[fontname]-config.zip
├── config.css           # Your optimized CSS settings
├── README.txt          # Installation instructions
├── settings.json       # Machine-readable preferences
└── FONT_DOWNLOAD.txt   # Font acquisition instructions
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

Requires JavaScript and modern CSS support.

## Technologies Used

- **TypeScript**: Strict mode, no UI framework
- **Vite**: Dev server and build, with one entry per page (`index.html`, `about.html`, `fonts.html`)
- **FontDetective** (local copy in `src/vendor/`): System font detection
- **highlight.js**: Syntax highlighting (no theme CSS; styling comes from the color schemes)
- **JSZip**: Client-side ZIP generation, loaded on demand
- **webfontloader**: Loads Google Fonts and the embedded fonts on demand
- **JSON Databases**: `font-database.json`, `color-schemes.json`, and `font-metrics.json` are imported by `src/data.ts`

### Source layout

| Path | Contents |
|------|----------|
| `src/entries/` | One entry module per page |
| `src/engine.ts` | The comparison tournament and the per-role tournament |
| `src/stages.ts` | The list of comparison stages |
| `src/state.ts`, `src/data.ts` | Shared app state, and the databases with their lookup tables |
| `src/fonts/` | Font loading, system font detection, categories, similarity |
| `src/ui/` | The comparison screen, font style selector, results, theme, slider, keyboard |
| `src/export/` | Settings string, editor config files, download package |
| `src/pages/` | The About and Font Showcase pages |
| `scripts/` | Font and database maintenance scripts (see Scripts) |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Adding New Fonts
1. Edit `font-database.json` (JSON array of font objects).
2. Include fields such as:
   - `name` (string) — display name
   - `family` (string) — category/family (e.g., "Modern Monos", "System & Classics")
   - `source` ("system" | "google" | "embedded")
   - `ligatures` (boolean)
   - `description` (string)
   - Optional file URLs for embedded fonts: `ttf`, `otf`, `woff2`
   - Optional `homepage`, `css`, and notes
3. For `embedded` fonts, prefer CORS-friendly CDNs (e.g., jsDelivr). You can validate links with `npm run fonts:validate` (writes `font_validation_report.json` and stores files under `fonts/`).
4. Run `npm run fonts:css` to regenerate `public/embedded-fonts.css`.
5. Test font detection and categorization with `npm run dev`.

### Adding Code Samples
1. Add files under the `public/samples/` directory (e.g., `.js`, `.py`, `.rs`, `.txt`).
2. Map the new file in `codeSampleUrls` inside `src/constants.ts`, and add an option to the language select in `index.html`.
3. Keep samples concise and representative; very long files are truncated for display.

### Adding Font Roles (Advanced)
The roles system and presets live in `src/font-roles.ts` and describe multi-font configurations for different syntax elements (comments, strings, keywords, etc.). The current UI focuses on single-font testing; integrating roles into the UI is planned as an advanced mode.

1. Edit `src/font-roles.ts` (`fontRoles`, `fontSuitabilityMatrix`, `multiFontPresets`).
2. Define selectors, requirements, and examples for new roles.
3. Add or adjust presets referencing available fonts in `font-database.json`.


## Acknowledgments

- Font designers and foundries for creating amazing coding fonts
- [FontDetective](https://github.com/wentin/font-detective) for reliable font detection
- [JSZip](https://stuk.github.io/jszip/) for ZIP file generation
- The developer community for font recommendations

## Support

- **Issues**: [GitHub Issues](https://github.com/your-username/code-phoropter/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/code-phoropter/discussions)

---

Made with ❤️ for developers who care about their code display settings
