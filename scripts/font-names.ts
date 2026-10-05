// Read the names that each font has when it is installed, and write them to font-names.json.
// The exports need them: iTerm2 and MacVim take the PostScript name of a face, and
// most apps select a font width by the family name of that width.
//
// Embedded fonts: reads the files that public/embedded-fonts.css references.
// Google fonts: downloads each face from Google Fonts.
// Fonts that we have no files for: uses the table below.
//
// Usage: npm run fonts:names                  (all fonts)
//        npm run fonts:names -- "Fira Code"   (only the named fonts)
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as fontkit from 'fontkit';
import { ROOT, readFontDatabase, readJson, writeJson } from './lib.ts';
import type { FontEntry } from '../src/types.ts';

interface FontNames {
    /** Per font width: the family name that selects the faces of that width */
    families: Record<string, string>;
    /** Per face ("weight:style:width"): the PostScript name */
    ps: Record<string, string>;
}

const NAMES_PATH = resolve(ROOT, 'font-names.json');
const CSS_PATH = resolve(ROOT, 'public/embedded-fonts.css');

// The fonts that we have no files for. Faces are regular, bold, italic, bold italic.
// A fifth value is the family name of the installed font, when it is not the database name.
const HAND_WRITTEN: Record<string, [string, string?, string?, string?, string?]> = {
    'Andale Mono': ['AndaleMono'],
    'Consolas': ['Consolas', 'Consolas-Bold', 'Consolas-Italic', 'Consolas-BoldItalic'],
    'Droid Sans Mono': ['DroidSansMono'],
    'Courier New': ['CourierNewPSMT', 'CourierNewPS-BoldMT', 'CourierNewPS-ItalicMT', 'CourierNewPS-BoldItalicMT'],
    'Lucida Console': ['LucidaConsole'],
    'Menlo': ['Menlo-Regular', 'Menlo-Bold', 'Menlo-Italic', 'Menlo-BoldItalic'],
    'Monaco': ['Monaco'],
    // Google Fonts has only the variable Recursive. The desktop release has these static families.
    'Recursive Mono Casual': ['RecMonoCasual-Regular', 'RecMonoCasual-Bold', 'RecMonoCasual-Italic', 'RecMonoCasual-BoldItalic', 'Rec Mono Casual'],
    'Recursive Mono Linear': ['RecMonoLinear-Regular', 'RecMonoLinear-Bold', 'RecMonoLinear-Italic', 'RecMonoLinear-BoldItalic', 'Rec Mono Linear'],
    'SF Mono': ['SFMono-Regular', 'SFMono-Bold', 'SFMono-RegularItalic', 'SFMono-BoldItalic'],
};

type Font = fontkit.Font;

function open(source: string | Buffer): Font {
    const font = typeof source === 'string' ? fontkit.openSync(source) : fontkit.create(source);
    return font as Font;
}

function english(font: Font, key: string): string | undefined {
    return (font as unknown as { getName(key: string): string | null }).getName(key) ?? undefined;
}

/** The family name that holds only regular, bold, italic and bold italic (name record 1). */
function legacyFamily(font: Font): string {
    return english(font, 'fontFamily') ?? font.familyName;
}

/** The family name that holds all weights and widths (name record 16, else record 1). */
function fullFamily(font: Font): string {
    return english(font, 'preferredFamily') ?? legacyFamily(font);
}

interface Instance { name?: { en?: string }; nameID: number; coord: number[] }

// The PostScript name of one weight and style of a variable font. The file lists
// its named instances. The name is the family prefix plus the instance name
// without spaces, as Adobe Technical Note 5902 describes.
function instanceName(font: Font, weight: number, style: string): string | undefined {
    const fvar = (font as unknown as { fvar?: { axis: { axisTag: string }[]; instance: Instance[] } }).fvar;
    if (!fvar) return undefined;
    const weightAxis = fvar.axis.findIndex(axis => axis.axisTag === 'wght');
    const label = (instance: Instance) => instance.name?.en
        ?? (instance.nameID === 17 ? english(font, 'preferredSubfamily') : english(font, 'fontSubfamily'))
        ?? 'Regular';
    const hasStyle = (text: string) =>
        style === 'italic' ? /Italic/.test(text) && !/Upright/.test(text)
        : style === 'oblique' ? /Oblique/.test(text)
        : !/Italic|Oblique/.test(text);
    const instance = fvar.instance.find(i => i.coord[weightAxis] === weight && hasStyle(label(i)));
    if (!instance) return undefined;
    const prefix = english(font, '25') ?? fullFamily(font);
    return `${prefix}-${label(instance)}`.replace(/[^A-Za-z0-9-]/g, '');
}

function addFace(names: FontNames, font: Font, weight: number, style: string, width: string, variable = false): void {
    const ps = variable ? instanceName(font, weight, style) : font.postscriptName;
    if (ps) names.ps[`${weight}:${style}:${width}`] = ps;
    // The regular face decides the family name of its width
    const regular = weight === 400 && style === 'normal';
    if (regular || !names.families[width]) {
        // The normal width has the name of the whole family. Another width has a name of its own.
        const family = variable || width === 'normal' ? fullFamily(font) : legacyFamily(font);
        // Without a regular face, the name of another face has its weight at the end
        names.families[width] = regular ? family : family.replace(/ (Thin|Extra ?Light|Light|Medium|Semi ?Bold|Bold|Extra ?Bold|Black|Heavy)$/i, '');
    }
}

// Embedded fonts: every @font-face rule of the generated CSS is one face
async function embeddedNames(database: FontEntry[]): Promise<Record<string, FontNames>> {
    const result: Record<string, FontNames> = {};
    const css = readFileSync(CSS_PATH, 'utf8');
    for (const [, rule] of css.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
        const value = (property: string) => rule.match(new RegExp(`${property}:\\s*([^;]+);`))?.[1].trim();
        const family = value('font-family')?.replace(/"/g, '');
        const url = rule.match(/url\("([^"]+)"\)/)?.[1];
        if (!family || !url) continue;
        // A few fonts are not in fonts/. The CSS has the address of the file.
        const remote = /^https?:/.test(url);
        const path = remote ? url : resolve(ROOT, decodeURIComponent(url));
        if (!remote && !existsSync(path)) continue;

        let font: Font;
        try {
            font = open(remote ? Buffer.from(await (await fetch(url)).arrayBuffer()) : path);
        } catch (error) {
            console.warn(`  Cannot read ${path}: ${(error as Error).message}`);
            continue;
        }
        const names = result[family] ??= { families: {}, ps: {} };
        const width = value('font-stretch') ?? 'normal';
        const weights = (value('font-weight') ?? '400').split(/\s+/).map(Number);
        const style = (value('font-style') ?? 'normal').split(/\s+/)[0];
        if (weights.length === 1) {
            addFace(names, font, weights[0], style, width);
            continue;
        }
        // A weight range: one variable file that holds all weights and styles
        const axes = database.find(f => f.name === family)?.axes;
        for (const weight of axes?.weights ?? []) {
            for (const faceStyle of axes?.styles ?? ['normal']) {
                addFace(names, font, weight, faceStyle, width, true);
            }
        }
    }
    return result;
}

interface GoogleFamily { family: string; fonts: Record<string, unknown> }

// Google fonts: the metadata lists the faces of a family ("400", "700i").
// The CSS API gives a TTF file per face to a client that does not know WOFF2.
async function googleNames(fonts: FontEntry[]): Promise<Record<string, FontNames>> {
    const result: Record<string, FontNames> = {};
    const metadata = await (await fetch('https://fonts.google.com/metadata/fonts')).json() as { familyMetadataList: GoogleFamily[] };
    for (const entry of fonts) {
        const family = metadata.familyMetadataList.find(f => f.family === entry.name);
        if (!family) {
            if (!HAND_WRITTEN[entry.name]) console.warn(`  ${entry.name}: not a Google Fonts family name`);
            continue;
        }
        const faces = Object.keys(family.fonts)
            .map(key => ({ italic: key.endsWith('i') ? 1 : 0, weight: parseInt(key, 10) }))
            .sort((a, b) => a.italic - b.italic || a.weight - b.weight);
        const tuples = faces.map(face => `${face.italic},${face.weight}`).join(';');
        const cssUrl = `https://fonts.googleapis.com/css2?family=${entry.name.replaceAll(' ', '+')}:ital,wght@${tuples}`;
        const css = await (await fetch(cssUrl, { headers: { 'User-Agent': 'curl' } })).text();
        const names: FontNames = { families: {}, ps: {} };
        await Promise.all([...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(async ([, rule]) => {
            const style = rule.match(/font-style:\s*(\w+)/)?.[1] ?? 'normal';
            const weight = Number(rule.match(/font-weight:\s*(\d+)/)?.[1] ?? 400);
            const url = rule.match(/url\(([^)]+)\)/)?.[1];
            if (!url) return;
            const font = open(Buffer.from(await (await fetch(url)).arrayBuffer()));
            addFace(names, font, weight, style, 'normal');
        }));
        if (Object.keys(names.ps).length) result[entry.name] = names;
        console.log(`  ${entry.name}: ${Object.keys(names.ps).length} faces`);
    }
    return result;
}

function handWrittenNames(): Record<string, FontNames> {
    const result: Record<string, FontNames> = {};
    for (const [name, [regular, bold, italic, boldItalic, family]] of Object.entries(HAND_WRITTEN)) {
        const ps: Record<string, string> = { '400:normal:normal': regular };
        if (bold) ps['700:normal:normal'] = bold;
        if (italic) ps['400:italic:normal'] = italic;
        if (boldItalic) ps['700:italic:normal'] = boldItalic;
        result[name] = { families: { normal: family ?? name }, ps };
    }
    return result;
}

const only = process.argv.slice(2);
const database = readFontDatabase();
const wanted = (name: string) => !only.length || only.includes(name);

console.log('Embedded fonts');
const embedded = await embeddedNames(database);
console.log(`  ${Object.keys(embedded).length} fonts`);
console.log('Google fonts');
const google = await googleNames(database.filter(f => f.source === 'google' && wanted(f.name)));

const all: Record<string, FontNames> = existsSync(NAMES_PATH) ? readJson(NAMES_PATH) : {};
for (const [name, names] of Object.entries({ ...handWrittenNames(), ...embedded, ...google })) {
    if (wanted(name)) all[name] = names;
}
const sorted = Object.fromEntries(Object.entries(all).sort(([a], [b]) => a.localeCompare(b)));
writeJson(NAMES_PATH, sorted);

const missing = database.filter(f => !sorted[f.name]).map(f => f.name);
console.log(`Wrote ${Object.keys(sorted).length} fonts to font-names.json`);
if (missing.length) console.log(`No names for: ${[...new Set(missing)].join(', ')}`);
