import { selectOption, skipCurrentStage } from './comparison';
import { toggleGrid } from './grid';

function clickToggle(id: string): void {
    document.getElementById(id)?.click();
}

export function initKeyboardShortcuts(): void {
    // Comparison choices
    document.addEventListener('keydown', (e) => {
        if (e.key === 'a' || e.key === 'A') {
            selectOption('A');
        } else if (e.key === 'd' || e.key === 'D') {
            selectOption('B');
        } else if (e.key === 's' || e.key === 'S') {
            selectOption('equal');
        } else if (e.key === 'w' || e.key === 'W') {
            const skipBtn = document.getElementById('btnSkipStage');
            if (skipBtn && skipBtn.style.display !== 'none') {
                skipCurrentStage();
            }
        }
    });

    // Display toggles. Hold '?' to show the property summaries.
    document.addEventListener('keydown', (e) => {
        // Don't intercept keyboard shortcuts with Ctrl/Cmd modifiers
        if (e.ctrlKey || e.metaKey) {
            return;
        }

        if (e.key === '?' || (e.shiftKey && e.key === '/')) {
            e.preventDefault();
            document.body.classList.add('show-summaries');
        } else if (e.key === 'g' || e.key === 'G') {
            e.preventDefault();
            toggleGrid();
        } else if (e.key === 'm' || e.key === 'M') {
            e.preventDefault();
            clickToggle('themeToggle');
        } else if (e.key === 'c' || e.key === 'C') {
            e.preventDefault();
            clickToggle('sliderCompareToggle');
        } else if (e.key === 'f' || e.key === 'F') {
            e.preventDefault();
            clickToggle('uniqueRoleFontsToggle');
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === '?' || (e.shiftKey && e.key === '/')) {
            document.body.classList.remove('show-summaries');
        }
    });
}
