// Stamp explicit 16-bit IDs into font-database.json and color-schemes.json.
//
// IDs start at 1 and follow the name order, for fonts and for each of the
// `dark` and `light` scheme lists independently.
//
// Usage:
//   npm run db:ids              dry run, prints a summary
//   npm run db:ids -- --write   write the files
import { FONT_DB_PATH, SCHEMES_PATH, readFontDatabase, readJson, writeJson } from './lib.ts';

interface Named {
    name?: string;
    id?: number;
}

function assignIds(items: Named[], start = 1): number {
    const ordered = [...items].sort((a, b) => (a.name ?? '').toLowerCase() < (b.name ?? '').toLowerCase() ? -1 : 1);
    let changed = 0;
    let nextId = start & 0xffff;
    for (const item of ordered) {
        if (!(item.name ?? '').trim()) continue;
        const id = nextId;
        nextId = (nextId + 1) & 0xffff;
        if (item.id !== id) {
            item.id = id;
            changed++;
        }
    }
    return changed;
}

const fonts = readFontDatabase();
const schemes = readJson<{ dark: Named[]; light: Named[] }>(SCHEMES_PATH);

const summary = {
    fonts_changed: assignIds(fonts),
    dark_changed: assignIds(schemes.dark),
    light_changed: assignIds(schemes.light),
};

if (process.argv.includes('--write')) {
    writeJson(FONT_DB_PATH, fonts);
    writeJson(SCHEMES_PATH, { dark: schemes.dark, light: schemes.light });
    console.log(`Wrote IDs: fonts changed=${summary.fonts_changed}, dark changed=${summary.dark_changed}, light changed=${summary.light_changed}`);
} else {
    console.log(JSON.stringify(summary, null, 2));
}
