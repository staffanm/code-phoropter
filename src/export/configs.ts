import type { FlatColorScheme, Settings } from '../types';
import { currentSettings } from './settings';
import { state } from '../state';

// Configuration export templates
interface ConfigFile {
    filename: string;
    content: string;
}

const configTemplates: Record<string, (settings: Settings) => ConfigFile> = {
    vscode: (settings: Settings) => ({
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
    
    vim: (settings: Settings) => ({
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
    
    emacs: (settings: Settings) => ({
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
    
    windowsTerminal: (settings: Settings) => ({
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
    
    putty: (settings: Settings) => ({
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
    
    sublimeText: (settings: Settings) => ({
        filename: 'Preferences.sublime-settings',
        content: `{
    "font_face": "${settings.font}",
    "font_size": ${settings.size},
    "line_padding_top": ${Math.round((settings.lineHeight - 1) * settings.size / 4)},
    "line_padding_bottom": ${Math.round((settings.lineHeight - 1) * settings.size / 4)},
    "color_scheme": "Packages/User/Custom.sublime-color-scheme"
}`
    }),
    
    atom: (settings: Settings) => ({
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
    
    intellij: (settings: Settings) => ({
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
    
    iterm2: (settings: Settings) => ({
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
    
    gnomeTerminal: (settings: Settings) => ({
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
function getVSCodeTheme(colorScheme: FlatColorScheme): string {
    // Map to closest VSCode built-in theme based on background color
    const bg = colorScheme.bg.toLowerCase();
    if (bg === '#ffffff' || bg === '#f8f9fa') return 'Default Light+';
    if (bg === '#1a1a1a' || bg === '#282c34') return 'Dark+';
    if (bg === '#002b36') return 'Solarized Dark';
    return 'Dark+'; // fallback
}


function adjustBrightness(color: string, amount: number) {
    const hex = color.replace('#', '');
    const r = Math.min(255, Math.max(0, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.min(255, Math.max(0, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.min(255, Math.max(0, parseInt(hex.substr(4, 2), 16) + amount));
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}


function rgbToRegistry(color: string) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);  
    const b = parseInt(hex.substr(4, 2), 16);
    return `${r},${g},${b}`;
}


function hexToDecimal(color: string, component: string) {
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


// Download configuration for specific editor
// Installation instructions for each editor
const installationInstructions: Record<string, { title: string; steps: string[] }> = {
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


export function downloadConfig(editor: string): void {
    const results = currentSettings();
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


function showInstallationInstructions(editor: string): void {
    const instructions = installationInstructions[editor];
    if (!instructions) return;
    
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'instruction-modal';
    modal.innerHTML = `
        <div class="instruction-content">
            <div class="instruction-header">
                <h3>${instructions.title}</h3>
                <button class="close-btn" data-action="closeModal">×</button>
            </div>
            <div class="instruction-body">
                <ol>
                    ${instructions.steps.map(step => `<li>${step}</li>`).join('')}
                </ol>
            </div>
            <div class="instruction-footer">
                <button data-action="closeModal">Got it!</button>
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
