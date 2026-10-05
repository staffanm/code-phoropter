export type FontSource = 'system' | 'google' | 'embedded';
export type ThemeMode = 'dark' | 'light';
export type Choice = 'A' | 'B' | 'equal';

export interface VariantsMatrix {
    prefer: string;
    files: Record<string, string>;
    maps: Record<string, Record<string, string>>;
    cleanup?: boolean;
    rules?: { regularOnlyOnBase?: boolean; regularName?: string };
    fallbacks?: Record<string, { weight?: string; style?: string }>;
}

export interface FontAxes {
    weights?: number[];
    styles?: string[];
    widths?: string[];
    [axis: string]: number | number[] | string[] | undefined;
}

export interface FontEntry {
    id: number;
    name: string;
    source: FontSource;
    ligatures: boolean;
    description: string;
    css: string;
    category: string;
    homepage?: string;
    ttf?: string | null;
    otf?: string | null;
    woff2?: string | null;
    axes?: FontAxes;
    variantsMatrix?: VariantsMatrix;
    icons?: boolean;
    patchedFrom?: string;
    comment?: string;
    googleFontsUrl?: string;
    variableFont?: boolean;
    variableAxes?: Record<string, unknown>;
}

export interface TokenStyle {
    color?: string;
    bold?: boolean;
    italic?: boolean;
}
export type TokenColor = string | TokenStyle;

export interface ColorScheme {
    id: number;
    name: string;
    author: string;
    description: string;
    homepage?: string;
    bg: string;
    fg: string;
    keyword: TokenColor;
    string: TokenColor;
    comment: TokenColor;
    function: TokenColor;
    literal: TokenColor;
    variable: TokenColor;
    type: TokenColor;
    operator: TokenColor;
    ghost: TokenColor;
    constant?: TokenColor;
}
export type ColorSchemeDatabase = Record<ThemeMode, ColorScheme[]>;

/** Per font size (px), per width name. */
export type MetricTable = Record<string, Record<string, number>>;
export interface FontMetric {
    avgCharWidth: MetricTable;
    xHeight: MetricTable;
    capHeight: MetricTable;
    monospace: boolean;
    source: FontSource;
    fontName: string;
}

export interface FontFamily {
    description: string;
    fonts: string[];
    representative: string | null;
}
export type FontFamilies = Record<string, FontFamily>;

export interface ComparisonOption {
    font: string;
    fontSize: number;
    fontWeight: number;
    lineHeight: number;
    fontWidth: string;
    letterSpacing: number;
    colorScheme: ColorScheme | null;
}

export interface RoleCandidate {
    type: string;
    font: string;
    weight: number;
    style: string;
    label: string;
}
/** A role is mapped to a font name, or to a font with weight and style. */
export type RoleFont = string | Partial<RoleCandidate>;
export type RoleMapping = Record<string, RoleFont>;

export interface Winners {
    fontFamily?: string;
    font?: string | null;
    colorScheme?: ColorScheme | null;
    size?: number;
    weight?: number;
    lineHeight?: number;
    fontWidth?: string;
    letterSpacing?: number;
    roles: Record<string, RoleCandidate>;
}
export type WinnerKey = Exclude<keyof Winners, 'roles'>;

export interface Stage {
    id: string;
    name: string;
    description: string;
    skippable: boolean;
    minComparisons: number;
    showGrid: boolean;
    useSmartGrouping?: boolean;
    requiresUniqueRoleFonts?: boolean;
}

export interface SimilarityInfo {
    score: number;
    category: string;
    round: number;
}

export interface RoleTest {
    role: string;
    aFont: string;
    bFont: string;
    aWeight?: number;
    aStyle?: string;
    bWeight?: number;
    bStyle?: string;
    aCandidate: RoleCandidate;
    bCandidate: RoleCandidate;
}

export interface Comparison {
    optionA: ComparisonOption;
    optionB: ComparisonOption;
    stage: string;
    pair?: [unknown, unknown];
    similarity?: SimilarityInfo | null;
    roleTest?: RoleTest;
}

/** The final settings shown on the results screen and written to exports. */
export interface Settings {
    fontFamily?: string;
    font: string;
    size: number;
    weight: number;
    lineHeight: number;
    fontWidth: string;
    letterSpacing: number;
    colorScheme: FlatColorScheme;
    roles: Record<string, RoleCandidate>;
}

/** A color scheme with each token reduced to its color string. */
export interface FlatColorScheme {
    name: string;
    bg: string;
    fg: string;
    keyword: string;
    string: string;
    comment: string;
    function: string;
    literal: string;
    variable: string;
    type: string;
    operator: string;
    ghost: string;
}
