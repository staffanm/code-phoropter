import { init } from '../app';
import { initDevConfig } from '../dev';
import { downloadConfig } from '../export/configs';
import { downloadFontPackage } from '../export/package';
import type { Choice } from '../types';
import { initActions, registerActions } from '../ui/actions';
import { changeLanguage, recompareStage, resetTest, selectOption, skipCurrentStage } from '../ui/comparison';
import { feelingLucky, importAndStart } from '../ui/familySelector';
import { initKeyboardShortcuts } from '../ui/keyboard';
import { changeResultLanguage, copySettings, copyToClipboard } from '../ui/results';
import { initScrollSync, initSliderDivider, toggleSliderCompare } from '../ui/slider';
import { toggleThemeMode, toggleUniqueRoleFonts } from '../ui/theme';

registerActions({
    selectOption: choice => selectOption(choice as Choice),
    skipCurrentStage,
    importAndStart,
    feelingLucky,
    toggleThemeMode,
    toggleSliderCompare,
    toggleUniqueRoleFonts,
    changeLanguage,
    resetTest,
    copySettings,
    downloadFontPackage: () => { void downloadFontPackage(); },
    recompareStage,
    changeResultLanguage,
    copyToClipboard,
    downloadConfig: (editor) => { void downloadConfig(editor); },
    selectText: (_arg, element) => (element as HTMLInputElement).select(),
    closeModal: (_arg, element) => element.closest('.instruction-modal')?.remove(),
});

initDevConfig();
initActions();
initKeyboardShortcuts();
init();
initSliderDivider();
initScrollSync();
