import type { ComparisonEngine } from './engine';
import type { FontFamilies, RoleMapping, ThemeMode } from './types';

/** Mutable state shared by the app modules. */
export const state = {
    // Categories from the database, before system font detection
    fontFamiliesOriginal: {} as FontFamilies,
    // Categories filtered to the fonts that are available
    fontFamilies: {} as FontFamilies,
    fonts: [] as string[],

    themeMode: 'dark' as ThemeMode,
    sliderCompareMode: false,
    sliderPosition: 50, // percentage (50 = center)
    // Enables font selection stages for roles
    uniqueRoleFontsEnabled: false,
    currentLanguage: 'javascript',

    currentRoleCss: '',
    currentRoleMapping: {} as Record<string, { font: string; stack: string; weight?: number; style?: string }>,
    inRoleView: false,

    engine: null as unknown as ComparisonEngine,
    comparisonCount: 0,
    gridVisible: false,
    currentNotifiedStage: null as string | null,
    iconsPromptedFor: new Set<string>(),

    ROLE_ID_BY_KEY: {} as Record<string, number>,
    ROLE_KEY_BY_ID: {} as Record<number, string>,
};

export type { RoleMapping };
