import type { Settings } from '../types';
import { byId } from '../dom';
import { loadCode, mapLanguageForHLJS, setCodeWithHighlight } from '../code';
import { currentSettings, exportSettings } from '../export/settings';
import { isFontAvailable } from '../fonts/detect';
import { getFontDownloadInfo } from '../fonts/similarity';
import { resolveFontCssStack, roleToHLJS } from '../roles';
import { state } from '../state';

// Show results
function generateRolesSection(results: Settings): string {
    const roles = results.roles;
    const baseFont = results.font.split(',')[0].replace(/['"]/g, '').trim();

    if (Object.keys(roles).length === 0) {
        return ''; // No roles configured
    }

    const roleLabelsDisplay: Record<string, string> = {
        comments: 'Comments',
        strings: 'Strings',
        literals: 'Literals',
        keywords: 'Keywords',
        function: 'Functions',
        variable: 'Variables',
        type: 'Types/Classes',
        operator: 'Operators',
        ghost: 'AI Suggestions'
    };

    let html = '<div class="roles-section"><h4>Role Styles</h4>';

    for (const [roleKey, roleData] of Object.entries(roles)) {
        if (!roleData) continue;

        const label = roleLabelsDisplay[roleKey] || roleKey;
        const font = roleData.font ? roleData.font.replace(/['"]/g, '').trim() : baseFont;
        const weight = roleData.weight || 400;
        const style = roleData.style || 'normal';

        // Only show font if different from base (normalize both for comparison)
        const normalizedFont = font.replace(/['"]/g, '').trim();
        const normalizedBase = baseFont.replace(/['"]/g, '').trim();
        const fontDifferent = normalizedFont !== normalizedBase;

        const parts: (string | number)[] = [];
        if (fontDifferent) parts.push(font);
        parts.push(weight);
        if (style !== 'normal') parts.push(style.charAt(0).toUpperCase() + style.slice(1));

        const roleDetails = parts.join(' • ');

        html += `
            <div class="setting-item role-item">
                <strong>${label}:</strong> ${roleDetails}
            </div>
        `;
    }

    html += '</div>';
    return html;
}


// Apply the base settings to the preview code block
function styleResultCode(resultCode: HTMLElement, results: Settings): void {
    resultCode.style.fontFamily = results.font;
    resultCode.style.fontSize = results.size + 'px';
    resultCode.style.fontWeight = String(results.weight);
    resultCode.style.lineHeight = String(results.lineHeight);
    resultCode.style.color = results.colorScheme.fg;
    if (resultCode.parentElement) {
        resultCode.parentElement.style.backgroundColor = results.colorScheme.bg;
    }

    // Apply full role-based styling to result preview
    applyResultPreviewStyling(resultCode, results);
}

function showResultPreview(language: string): void {
    const resultCode = byId('resultCode');
    loadCode(language).then(code => {
        setCodeWithHighlight(resultCode, code, mapLanguageForHLJS(language));
        // Apply styling AFTER code is loaded and highlighted
        styleResultCode(resultCode, currentSettings());
    }).catch(error => {
        console.error('Failed to load code for results:', error);
        resultCode.textContent = 'Failed to load code';
    });
}

export function showResults(): void {
    const results = currentSettings();
    console.log('Engine results:', results);

    byId('progressFill').style.width = '100%';
    byId('status').textContent = 'Complete!';
    
    byId('results').classList.remove('hidden');

    const details = byId('resultDetails');
    const familyName = results.fontFamily || 'Unknown';
    details.innerHTML = `
        <div class="results-layout">
            <div class="results-columns">
                <div class="results-settings">
                    <h3>Your Optimal Settings</h3>
                    <div class="setting-item">
                        <strong>Font Style:</strong> ${familyName}
                        <button class="re-compare-btn" data-action="recompareStage" data-arg="fontFamily">Re-compare</button>
                    </div>
                    <div class="setting-item">
                        <strong>Font:</strong> ${results.font.split(',')[0].replace(/['"]/g, '').trim()}
                        <button class="re-compare-btn" data-action="recompareStage" data-arg="font">Re-compare</button>
                    </div>
                    <div class="setting-item">
                        <strong>Font Size:</strong> ${results.size || 'Not selected'}px
                        <button class="re-compare-btn" data-action="recompareStage" data-arg="size">Re-compare</button>
                    </div>
                    <div class="setting-item">
                        <strong>Font Weight:</strong> ${results.weight || 'Not selected'}
                        <button class="re-compare-btn" data-action="recompareStage" data-arg="weight">Re-compare</button>
                    </div>
                    <div class="setting-item">
                        <strong>Line Height:</strong> ${results.lineHeight || 'Not selected'}
                        <button class="re-compare-btn" data-action="recompareStage" data-arg="lineHeight">Re-compare</button>
                    </div>
                    <div class="setting-item">
                        <strong>Font Width:</strong> ${results.fontWidth || 'normal'}
                        <button class="re-compare-btn" data-action="recompareStage" data-arg="fontWidth">Re-compare</button>
                    </div>
                    <div class="setting-item">
                        <strong>Letter Spacing:</strong> ${results.letterSpacing || 0}px
                        <button class="re-compare-btn" data-action="recompareStage" data-arg="letterSpacing">Re-compare</button>
                    </div>
                    <div class="setting-item">
                        <strong>Color Scheme:</strong> ${results.colorScheme.name}
                        <button class="re-compare-btn" data-action="recompareStage" data-arg="colorScheme">Re-compare</button>
                    </div>
                    ${generateRolesSection(results)}
                    <p><strong>Total Comparisons:</strong> ${state.comparisonCount}</p>
                </div>

                <div class="results-preview-container" id="resultsPreviewContainer">
                    <div class="result-preview-header">
                        <h3>Preview with your settings:</h3>
                        <select id="resultLanguageSelect" data-action="changeResultLanguage">
                            <option value="javascript">JavaScript (React)</option>
                            <option value="python">Python (Async)</option>
                            <option value="rust">Rust (Cache)</option>
                            <option value="go">Go (Web Service)</option>
                            <option value="java">Java (Spring Boot)</option>
                            <option value="cpp">C++ (LRU Cache)</option>
                            <option value="csharp">C# (Web API)</option>
                            <option value="php">PHP (Auth Service)</option>
                            <option value="clojure">Clojure (Ring)</option>
                            <option value="css">CSS (Normalize)</option>
                            <option value="html">HTML (Boilerplate)</option>
                            <option value="json">JSON (VS Code)</option>
                            <option value="markdown">Markdown (Unicode Scripts)</option>
                        </select>
                    </div>
                    <pre><code id="resultCode"></code></pre>
                </div>
            </div>

            <div class="export-section">
                <h4>Export Settings</h4>
                <div class="compact-export">
                    <label>Settings String (save/share):</label>
                    <input type="text" id="settingsString" value="${exportSettings(results)}" readonly data-action="selectText">
                    <button data-action="copyToClipboard" data-arg="settingsString">Copy</button>
                </div>

                <div class="export-buttons">
                    <button data-action="downloadConfig" data-arg="vscode">VS Code</button>
                    <button data-action="downloadConfig" data-arg="vim">Vim</button>
                    <button data-action="downloadConfig" data-arg="emacs">Emacs</button>
                    <button data-action="downloadConfig" data-arg="windowsTerminal">Windows Terminal</button>
                    <button data-action="downloadConfig" data-arg="iterm2">iTerm2</button>
                    <button data-action="downloadConfig" data-arg="gnomeTerminal">GNOME Terminal</button>
                    <button data-action="downloadConfig" data-arg="putty">PuTTY</button>
                    <button data-action="downloadConfig" data-arg="sublimeText">Sublime Text</button>
                    <button data-action="downloadConfig" data-arg="atom">Atom</button>
                    <button data-action="downloadConfig" data-arg="intellij">IntelliJ/JetBrains</button>
                </div>
            </div>
        </div>
    `;

    showResultPreview(state.currentLanguage);

    // Set the language selector to match current language
    byId<HTMLSelectElement>('resultLanguageSelect').value = state.currentLanguage;
}


// Apply full role-based styling to result preview
function applyResultPreviewStyling(codeElement: HTMLElement, results: Settings): void {
    const scheme: Record<string, string> = { ...results.colorScheme };
    const roles = results.roles;

    // Apply styling for each role
    for (const [roleKey, selectors] of Object.entries(roleToHLJS)) {
        const elements = codeElement.querySelectorAll<HTMLElement>(selectors.join(', '));
        const roleData = roles[roleKey];
        const colorKey = roleKey === 'function' ? 'function' : roleKey.replace(/s$/, ''); // keywords -> keyword

        elements.forEach(el => {
            // Apply color
            if (scheme[colorKey]) {
                el.style.color = scheme[colorKey];
            }

            // Apply role font/weight/style if available
            if (roleData) {
                if (roleData.font) {
                    el.style.fontFamily = resolveFontCssStack(roleData.font);
                }
                if (roleData.weight) {
                    el.style.fontWeight = String(roleData.weight);
                }
                if (roleData.style) {
                    el.style.fontStyle = roleData.style;
                }
            }
        });
    }

    // Handle numbers/literals
    codeElement.querySelectorAll<HTMLElement>('.hljs-number, .hljs-literal, .hljs-built_in, .hljs-type').forEach(el => {
        el.style.color = scheme.function;
    });
}


// Change language in result preview
export function changeResultLanguage(): void {
    showResultPreview(byId<HTMLSelectElement>('resultLanguageSelect').value);
}


// Copy settings to clipboard
export function copySettings(): void {
    const results = currentSettings();
    
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

    // Append role CSS if roles are set
    if (state.currentRoleCss) {
        css += `\n\n/* Multi-Font Roles (highlight.js selectors) */\n${state.currentRoleCss}`;
    }
    
    // Create comprehensive export data
    const exportData = {
        settings: results,
        css: css,
        timestamp: new Date().toISOString(),
        version: '1.0',
        multiFont: !!state.currentRoleCss,
        roles: {
            mapping: state.currentRoleMapping
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


// Copy text to clipboard
export function copyToClipboard(elementId: string) {
    const element = byId<HTMLInputElement>(elementId);
    element.select();
    element.setSelectionRange(0, 99999); // For mobile
    document.execCommand('copy');
    
    // Visual feedback
    const button = element.nextElementSibling;
    if (!button) return;
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    setTimeout(() => {
        button.textContent = originalText;
    }, 1000);
}
