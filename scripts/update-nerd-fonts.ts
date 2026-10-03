// Update font-database.json from the Nerd Font directories (fonts/*.NF).
//
// For a font that is already in the database, the axes and the file templates
// are updated from the files on disk. A new font gets a full entry. Its
// category comes from the font it was patched from.
//
// Usage: npm run db:nerd-fonts
import { readdirSync } from 'node:fs';
import { extname, join, parse } from 'node:path';
import type { FontEntry } from '../src/types.ts';
import { FONTS_DIR, FONT_DB_PATH, readFontDatabase, writeJson } from './lib.ts';

const DEFAULT_CATEGORY = 'Technical Specialists';

const WEIGHT_MAP: Record<string, number> = {
    Thin: 100,
    ExtraLight: 200,
    UltraLight: 200,
    Light: 300,
    Regular: 400,
    Book: 400,
    Medium: 500,
    SemiBold: 600,
    DemiBold: 600,
    Bold: 700,
    ExtraBold: 800,
    UltraBold: 800,
    Heavy: 900,
    Black: 900,
};

// First label for each weight, e.g. 200 -> ExtraLight
const WEIGHT_LABELS: Record<number, string> = {};
for (const [label, weight] of Object.entries(WEIGHT_MAP)) WEIGHT_LABELS[weight] ??= label;

function inferAxes(files: string[]): { weights: number[]; styles: string[] } {
    const weights = new Set<number>();
    const styles = new Set(['normal']);
    for (const file of files) {
        // Match *NerdFont-<Weight><Style>.ttf
        const m = file.match(/NerdFont-([A-Za-z]+?)?(Italic|Oblique)?\./);
        if (!m) continue;
        weights.add(WEIGHT_MAP[m[1] ?? 'Regular'] ?? 400);
        if (m[2]) styles.add(m[2].toLowerCase());
    }
    if (weights.size === 0) weights.add(400);
    return {
        weights: [...weights].sort((a, b) => a - b),
        styles: ['normal', 'italic', 'oblique'].filter(style => styles.has(style)),
    };
}

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '');

// Find the database name of the font that a Nerd Font directory was patched from
function resolvePatchedFrom(baseHint: string, dbNames: string[]): string {
    const spaced = baseHint.replaceAll('-', ' ');
    return dbNames.find(name => normalize(name) === normalize(baseHint)) ?? spaced;
}

function buildEntry(dirName: string, files: string[], db: FontEntry[]): FontEntry {
    const base = dirName.slice(0, -'.NF'.length);
    const display = `${base} Nerd Font`;
    const { weights, styles } = inferAxes(files);
    const weightMap: Record<string, string> = {};
    for (const weight of weights) {
        const label = WEIGHT_LABELS[weight] ?? 'Regular';
        weightMap[String(weight)] = weight === 400 ? '-Regular' : `-${label}`;
    }
    // The stem before the first '-' is the prefix, e.g. SeriousShannsNerdFont-Regular.otf -> SeriousShannsNerdFont
    const prefix = parse(files[0]).name.split('-')[0];
    const ext = extname(files[0]).toLowerCase().slice(1);
    const prefer = ext === 'ttf' ? 'ttf' : 'otf';
    const patchedFrom = resolvePatchedFrom(base, db.map(f => f.name));
    const baseFont = db.find(f => f.name === patchedFrom);
    return {
        id: Math.max(0, ...db.map(f => f.id ?? 0)) + 1,
        name: display,
        source: 'embedded',
        ligatures: true,
        icons: true,
        patchedFrom,
        description: `${base} patched with Nerd Font glyphs`,
        css: `"${display}"`,
        homepage: 'https://www.nerdfonts.com/',
        category: baseFont?.category ?? DEFAULT_CATEGORY,
        axes: { weights, styles, widths: ['normal'] },
        variantsMatrix: {
            prefer,
            files: { [prefer]: `fonts/${dirName}/${prefix}{weight|map}{style|map}.${ext}` },
            maps: {
                width: { normal: '' },
                weight: weightMap,
                style: { normal: '', italic: '-Italic', oblique: '-Oblique' },
            },
            cleanup: true,
            rules: { regularOnlyOnBase: true, regularName: '-Regular' },
        },
    };
}

const db = readFontDatabase();
let added = 0;
let updated = 0;
const dirs = readdirSync(FONTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name.endsWith('.NF'))
    .map(d => d.name)
    .sort();
for (const dirName of dirs) {
    const files = readdirSync(join(FONTS_DIR, dirName)).filter(f => /\.(ttf|otf)$/i.test(f)).sort();
    if (files.length === 0) continue;
    const entry = buildEntry(dirName, files, db);
    const existing = db.find(f => f.name === entry.name);
    if (existing) {
        existing.axes = entry.axes;
        existing.variantsMatrix = entry.variantsMatrix;
        updated++;
    } else {
        db.push(entry);
        added++;
        console.log(`Added ${entry.name} (category: ${entry.category})`);
    }
}
writeJson(FONT_DB_PATH, db);
console.log(`Updated font-database.json with Nerd Font entries: ${added} added, ${updated} updated.`);
