import { byId } from '../dom';
import { data } from '../data';
import { injectCriticalAboutFonts, injectGoogleFontsFromDatabase } from '../fonts/loader';

// Dynamic About Page Table Generation
// Generate font showcase page
export function generateFontShowcase(): void {
    const fontGrid = document.getElementById('fontGrid');
    const loadingMessage = document.getElementById('fontLoadingMessage');
    const progressElement = byId('fontLoadingProgress');

    if (!fontGrid) return;

    const build = (installedNames: Set<string>) => {
        try {
            injectGoogleFontsFromDatabase();
            injectCriticalAboutFonts();
        } catch {}

        if (loadingMessage) loadingMessage.style.display = 'none';
        fontGrid.style.display = 'grid';
        generateFontGrid(fontGrid, installedNames);
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


function generateFontGrid(container: HTMLElement, installedNames: Set<string>) {
    const sampleText = `async function processData(items: Item[]) {
  const results = await Promise.all(items.map(item =>
    fetch(\`/api/\${item.id}\`).then(res => res.json())));
  return results.filter(r => r.status === 'OK');
}`;

    const fonts = data.fontDatabase
        .filter(font => !font.patchedFrom) // Filter out nerd fonts/patched fonts
        .slice()
        .sort((a,b) => (a.name||'').localeCompare(b.name||''));
    let html = '';

    fonts.forEach((font, index) => {
        let isAvailable = true;

        if (font.source === 'system') {
            isAvailable = installedNames && installedNames.has(font.name);
        }

        if (isAvailable) {
            const fontId = `font-${index}`;
            const axes = font.axes || {};
            const weights = axes.weights || [400];
            const styles = axes.styles || ['normal'];
            const widths = axes.widths || ['normal'];

            // Generate axis controls HTML
            let controlsHtml = '';

            // Weight slider (if multiple weights)
            if (weights.length > 1) {
                const defaultWeightIndex = weights.includes(400) ? weights.indexOf(400) : 0;
                const defaultWeight = weights[defaultWeightIndex];
                controlsHtml += `
                    <div class="axis-control">
                        <span class="axis-label">Weight</span>
                        <div class="axis-control-content">
                            <div class="axis-value">${defaultWeight}</div>
                            <input type="range" id="${fontId}-weight" class="axis-slider"
                                   min="0" max="${weights.length - 1}" value="${defaultWeightIndex}" step="1"
                                   data-font-id="${fontId}" data-axis="weight" data-weight-options='${JSON.stringify(weights)}'
                                   data-choice-count="${weights.length}">
                        </div>
                    </div>
                `;
            }

            // Width slider (if multiple widths)
            if (widths.length > 1) {
                const defaultWidthIndex = widths.includes('normal') ? widths.indexOf('normal') : 0;
                const defaultWidth = widths[defaultWidthIndex];
                controlsHtml += `
                    <div class="axis-control">
                        <span class="axis-label">Width</span>
                        <div class="axis-control-content">
                            <div class="axis-value">${defaultWidth}</div>
                            <input type="range" id="${fontId}-width" class="axis-slider"
                                   min="0" max="${widths.length - 1}" value="${defaultWidthIndex}" step="1"
                                   data-font-id="${fontId}" data-axis="width" data-width-options='${JSON.stringify(widths)}'
                                   data-choice-count="${widths.length}">
                        </div>
                    </div>
                `;
            }

            // Style slider (if multiple styles) - always use slider for consistency
            if (styles.length > 1) {
                const styleOrder = ['normal', 'italic', 'oblique'].filter(s => styles.includes(s));
                controlsHtml += `
                    <div class="axis-control axis-control-style">
                        <span class="axis-label">Style</span>
                        <div class="axis-control-content">
                            <div class="axis-value">${styleOrder[0]}</div>
                            <input type="range" id="${fontId}-style" class="axis-slider axis-slider-style"
                                   min="0" max="${styleOrder.length - 1}" value="0" step="1"
                                   data-font-id="${fontId}" data-axis="style" data-style-options='${JSON.stringify(styleOrder)}'
                                   data-choice-count="${styleOrder.length}">
                        </div>
                    </div>
                `;
            }

            // Default font style
            const defaultWeight = weights.includes(400) ? 400 : weights[0];
            const defaultStyle = styles[0];
            const defaultWidth = widths.includes('normal') ? 'normal' : widths[0];
            const defaultWidthPercent = { 'condensed': 75, 'semi-condensed': 87.5, 'normal': 100, 'semi-wide': 112.5, 'wide': 125, 'expanded': 150 }[defaultWidth] || 100;

            // Generate homepage link if available
            const homepageLink = font.homepage ? `<a href="${font.homepage}" target="_blank" rel="noopener noreferrer" class="font-homepage-link" title="Visit ${font.name} homepage">↗</a>` : '';

            html += `
                <div class="font-showcase-item" data-font-index="${index}">
                    <div class="font-header">
                        <h3 class="font-name">${font.name}${homepageLink}</h3>
                        ${controlsHtml ? `<div class="font-controls">${controlsHtml}</div>` : ''}
                    </div>
                    <pre class="font-sample" id="${fontId}-sample"
                         style="font-family: '${font.name}', 'Redacted Script', monospace; font-weight: ${defaultWeight}; font-style: ${defaultStyle}; font-stretch: ${defaultWidthPercent}%;">${sampleText}</pre>
                </div>
            `;
        }
    });

    container.innerHTML = html;

    // Add event listeners for axis controls
    setupAxisControls();
}


// Setup event listeners for font axis controls
function setupAxisControls(): void {
    // Map width names to CSS font-stretch values
    const widthMap: Record<string, number> = {
        'condensed': 75, 'semi-condensed': 87.5, 'normal': 100,
        'semi-wide': 112.5, 'wide': 125, 'expanded': 150
    };

    // Each slider selects one value from the list of options for its axis
    const setup = (axis: string, apply: (sample: HTMLElement, value: string) => void) => {
        document.querySelectorAll<HTMLInputElement>(`.axis-slider[data-axis="${axis}"]`).forEach(slider => {
            slider.addEventListener('input', () => {
                const options: (string | number)[] = JSON.parse(slider.dataset[`${axis}Options`] || '[]');
                const value = String(options[parseInt(slider.value)]);
                const sample = document.getElementById(`${slider.dataset.fontId}-sample`);
                const valueDisplay = slider.parentElement?.querySelector('.axis-value');

                if (sample) apply(sample, value);
                if (valueDisplay) valueDisplay.textContent = value;
            });
        });
    };

    setup('weight', (sample, weight) => { sample.style.fontWeight = weight; });
    setup('width', (sample, widthName) => { sample.style.fontStretch = `${widthMap[widthName] || 100}%`; });
    setup('style', (sample, style) => { sample.style.fontStyle = style; });
}
