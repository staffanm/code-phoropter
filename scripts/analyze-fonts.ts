// Compare the axes that font-database.json declares for each embedded font
// with the font files in the fonts directory, and print a report.
//
// Usage: npm run fonts:analyze
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { FontEntry } from '../src/types.ts';
import { FONTS_DIR, readFontDatabase } from './lib.ts';

// Order matters: longer patterns first
const WEIGHT_PATTERNS: [RegExp, number][] = [
    [/ExtraLight/i, 200],
    [/ExtraBold/i, 800],
    [/SemiBold/i, 600],
    [/DemiBold/i, 600],
    [/UltraLight/i, 100],
    [/Thin/i, 100],
    [/Light/i, 300],
    [/Regular/i, 400],
    [/Normal/i, 400],
    [/Medium/i, 500],
    [/Bold/i, 700],
    [/Black/i, 900],
    [/Heavy/i, 900],
];

const WIDTH_PATTERNS: [RegExp, number][] = [
    [/Condensed/i, 75],
    [/SemiCondensed/i, 87.5],
    [/Expanded/i, 125],
    [/SemiExpanded/i, 112.5],
];

interface ActualFiles {
    weights: number[];
    hasItalic: boolean;
    hasBoldItalic: boolean;
    widths: number[];
    files: string[];
}

// Extract weight, style, and width info from a font filename
function parseFontFilename(filename: string) {
    const stem = filename.replace('.ttf', '').replace('.otf', '');
    return {
        weight: WEIGHT_PATTERNS.find(([pattern]) => pattern.test(stem))?.[1] ?? 400,
        italic: /(Italic|Oblique|It|Slant)/i.test(stem),
        width: WIDTH_PATTERNS.find(([pattern]) => pattern.test(stem))?.[1] ?? null,
    };
}

function analyzeFontFiles(dir: string): ActualFiles {
    const weights = new Set<number>();
    const widths = new Set<number>();
    const actual: ActualFiles = { weights: [], hasItalic: false, hasBoldItalic: false, widths: [], files: [] };
    for (const file of readdirSync(dir)) {
        if (!/\.(ttf|otf)$/.test(file)) continue;
        const info = parseFontFilename(file);
        actual.files.push(file);
        weights.add(info.weight);
        if (info.italic) {
            actual.hasItalic = true;
            if (info.weight >= 700) actual.hasBoldItalic = true;
        }
        if (info.width) widths.add(info.width);
    }
    actual.weights = [...weights].sort((a, b) => a - b);
    actual.widths = [...widths].sort((a, b) => a - b);
    actual.files.sort();
    return actual;
}

const isDir = (path: string) => existsSync(path) && statSync(path).isDirectory();

function findFontDir(font: FontEntry): string | null {
    // First use the directory in the variantsMatrix paths, like "fonts/0xProto.NF/..."
    for (const path of Object.values(font.variantsMatrix?.files ?? {})) {
        const parts = path.split('/');
        if (parts.length >= 2 && parts[0] === 'fonts' && isDir(join(FONTS_DIR, parts[1]))) {
            return join(FONTS_DIR, parts[1]);
        }
    }
    // Then match on the name
    const compact = font.name.replaceAll(' ', '');
    for (const name of [font.name, compact, `${font.name}.NF`, `${compact}.NF`]) {
        if (isDir(join(FONTS_DIR, name))) return join(FONTS_DIR, name);
    }
    const found = readdirSync(FONTS_DIR).find(d =>
        isDir(join(FONTS_DIR, d)) && d.toLowerCase().replaceAll(' ', '').includes(compact.toLowerCase()));
    return found ? join(FONTS_DIR, found) : null;
}

const sameSet = (a: unknown[], b: unknown[]) => a.length === new Set([...a, ...b]).size && new Set(a).size === new Set(b).size;

function findIssues(font: FontEntry, actual: ActualFiles): string[] {
    const issues: string[] = [];
    const declaredWeights = font.axes?.weights ?? [];
    const declaredItalic = (font.axes?.styles ?? []).includes('italic');
    const declaredWidths: unknown[] = font.axes?.widths ?? [];

    if (actual.hasItalic && !declaredItalic) issues.push('MISSING_ITALIC_IN_AXES');
    else if (declaredItalic && !actual.hasItalic) issues.push('ITALIC_DECLARED_BUT_NO_FILES');
    if (actual.hasBoldItalic && !declaredItalic) issues.push('MISSING_BOLD_ITALIC_IN_AXES');
    if (!sameSet(declaredWeights, actual.weights)) issues.push('WEIGHT_MISMATCH');

    // Declared widths are usually names like "normal" and "condensed". The widths
    // from the filenames are numbers, so only numeric declarations are compared.
    if (typeof declaredWidths[0] !== 'string') {
        if (actual.widths.length && !declaredWidths.length) issues.push('WIDTHS_NOT_DECLARED');
        else if (declaredWidths.length && !actual.widths.length) issues.push('WIDTHS_DECLARED_BUT_NO_FILES');
        else if (!sameSet(declaredWidths, actual.widths)) issues.push('WIDTH_MISMATCH');
    }
    return issues;
}

const LINE = '='.repeat(80);
const embedded = readFontDatabase().filter(f => f.source === 'embedded');
const reports: string[] = [];

for (const font of embedded) {
    const header = `\n${LINE}\nFONT: ${font.name}\n${LINE}`;
    const dir = findFontDir(font);
    if (!dir) {
        reports.push(`${header}\nIssue: DIRECTORY_NOT_FOUND\nDeclared axes: ${JSON.stringify(font.axes ?? {})}`);
        continue;
    }
    const actual = analyzeFontFiles(dir);
    if (actual.files.length === 0) {
        reports.push(`${header}\nIssue: NO_FONT_FILES\nDirectory: ${dir}\nDeclared axes: ${JSON.stringify(font.axes ?? {})}`);
        continue;
    }
    const issues = findIssues(font, actual);
    if (issues.length === 0) continue;
    reports.push([
        header,
        `Directory: ${dir}`,
        `\nIssues: ${issues.join(', ')}`,
        '\nDECLARED IN AXES:',
        `  Weights: ${JSON.stringify(font.axes?.weights ?? [])}`,
        `  Styles: ${JSON.stringify(font.axes?.styles ?? [])}`,
        `  Widths: ${JSON.stringify(font.axes?.widths ?? [])}`,
        '\nACTUAL FILES:',
        `  Weights found: ${JSON.stringify(actual.weights)}`,
        `  Has italic: ${actual.hasItalic}`,
        `  Has bold italic: ${actual.hasBoldItalic}`,
        `  Widths found: ${JSON.stringify(actual.widths)}`,
        `  Files (${actual.files.length}):`,
        ...actual.files.map(f => `    - ${f}`),
    ].join('\n'));
}

console.log('FONT DATABASE ANALYSIS REPORT');
console.log(LINE);
console.log(`Total embedded fonts: ${embedded.length}`);
console.log(`Fonts with discrepancies: ${reports.length}`);
console.log(LINE);
console.log(reports.join('\n'));
console.log(`\n${LINE}\nEND OF REPORT\n${LINE}`);
