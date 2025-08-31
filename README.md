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
- **Import/Export**: Save and share your preferences

### 🎨 Live Preview
- **Real code samples**: JavaScript, Python, Rust, Go, Java, CSS, HTML, JSON, Markdown
- **Custom code**: Test with your own code snippets
- **Ligature preview**: See programming ligatures in action
- **Syntax highlighting**: Accurate keyword, string, comment, and function colors

## Quick Start

1. **Open the app** in your browser
2. **Choose a font family** that appeals to you
3. **Make comparisons** using keyboard shortcuts:
   - `A` - Prefer left option
   - `S` - No preference
   - `D` - Prefer right option
4. **Complete all rounds** of testing
5. **Download your package** with optimized settings

## Installation

### Option 1: Use Online
Visit the hosted version at [your-url-here]

### Option 2: Run Locally
```bash
# Clone the repository
git clone https://github.com/your-username/code-phoropter.git
cd code-phoropter

# Open in browser
open index.html
# or
python -m http.server 8000  # Then visit http://localhost:8000
```

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

- **Vanilla JavaScript**: No framework dependencies
- **CSS3**: Modern layouts with flexbox/grid
- **FontDetective**: Reliable font detection
- **JSZip**: Client-side ZIP generation
- **Google Fonts API**: Web font loading

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Adding New Fonts
1. Edit `fontFamiliesOriginal` in `app.js`
2. Add to appropriate category
3. Include download URL if available
4. Test font loading

### Adding Code Samples
1. Edit `codeSamples` in `app.js`
2. Follow existing format for syntax highlighting
3. Keep samples concise and representative

## License

MIT License - see LICENSE file for details

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