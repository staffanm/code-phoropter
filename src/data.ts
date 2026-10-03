import colorSchemesJson from '../color-schemes.json';
import fontDatabaseJson from '../font-database.json';
import fontMetricsJson from '../font-metrics.json';
import { fontRoles } from './font-roles';
import { state } from './state';
import type { ColorScheme, ColorSchemeDatabase, FontEntry, FontMetric, FontSource, ThemeMode } from './types';

type SchemeIdMaps = Record<ThemeMode, Record<string, number>>;
type SchemeByIdMaps = Record<ThemeMode, Record<number, ColorScheme>>;

/** The JSON databases and the lookup tables that are built from them. */
export const data = {
    fontDatabase: fontDatabaseJson as unknown as FontEntry[],
    colorSchemeDatabase: colorSchemesJson as unknown as ColorSchemeDatabase,
    fontMetrics: fontMetricsJson as unknown as Record<string, FontMetric>,

    fontSourceByName: {} as Record<string, FontSource>,
    fontCategoryByName: {} as Record<string, string>,
    // Never populated by the original app. Kept so that icon filtering behaves as before.
    fontIconsByName: {} as Record<string, boolean>,

    // ID maps for compact settings encoding
    fontIdByName: {} as Record<string, number>,
    fontNameById: {} as Record<number, string>,
    schemeIdByName: { dark: {}, light: {} } as SchemeIdMaps,
    schemeById: { dark: {}, light: {} } as SchemeByIdMaps,
};

export function findFont(name: string): FontEntry | undefined {
    return data.fontDatabase.find(f => f.name === name);
}

/** Build the lookup tables. Call once before any other module uses `data`. */
export function initData(): void {
    data.fontDatabase.forEach(f => {
        data.fontSourceByName[f.name] = f.source;
        data.fontCategoryByName[f.name] = f.category;
    });
    buildIdMaps();
    buildRoleMaps();
}

// 16-bit stable id from name (used if explicit id missing)
function crc16(str: string): number {
    let h = 0xffff;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i) & 0xff;
        for (let j = 0; j < 8; j++) {
            const tmp = h & 1; h >>= 1; if (tmp) h ^= 0xA001;
        }
    }
    return h & 0xffff;
}

function assignIds<T extends { id?: number; name: string }>(items: T[], assign: (item: T, id: number) => void): void {
    const used = new Set<number>();
    items.slice().sort((a, b) => a.name.localeCompare(b.name)).forEach(item => {
        let id = typeof item.id === 'number' ? (item.id & 0xffff) : crc16(item.name);
        while (used.has(id)) id = (id + 1) & 0xffff; // resolve rare collisions
        used.add(id);
        assign(item, id);
    });
}

function buildIdMaps(): void {
    assignIds(data.fontDatabase, (f, id) => {
        data.fontIdByName[f.name] = id;
        data.fontNameById[id] = f.name;
    });
    (['dark', 'light'] as const).forEach(mode => {
        assignIds(data.colorSchemeDatabase[mode] || [], (s, id) => {
            data.schemeIdByName[mode][s.name] = id;
            data.schemeById[mode][id] = s;
        });
    });
}

// IDs for the roles that have a comparison stage but no entry in font-roles.ts
const STAGE_ROLE_IDS: Record<string, number> = { literals: 6, variable: 7, type: 8, operator: 9 };

// Immutable role ID maps for the settings string
function buildRoleMaps(): void {
    state.ROLE_ID_BY_KEY = {};
    state.ROLE_KEY_BY_ID = {};
    const add = (key: string, id: number) => {
        state.ROLE_ID_BY_KEY[key] = id;
        state.ROLE_KEY_BY_ID[id] = key;
    };
    (Object.entries(fontRoles) as [string, { id?: number }][]).forEach(([key, meta]) => {
        if (typeof meta.id === 'number') add(key, meta.id & 0xffff);
    });
    Object.entries(STAGE_ROLE_IDS).forEach(([key, id]) => add(key, id));
}
