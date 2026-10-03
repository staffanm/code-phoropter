import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { FontEntry } from '../src/types.ts';

export const ROOT = resolve(import.meta.dirname, '..');
export const FONTS_DIR = resolve(ROOT, 'fonts');
export const FONT_DB_PATH = resolve(ROOT, 'font-database.json');
export const SCHEMES_PATH = resolve(ROOT, 'color-schemes.json');

export function readJson<T>(path: string): T {
    return JSON.parse(readFileSync(path, 'utf8')) as T;
}

export function writeJson(path: string, value: unknown): void {
    writeFileSync(path, JSON.stringify(value, null, 2));
}

export function readFontDatabase(): FontEntry[] {
    return readJson<FontEntry[]>(FONT_DB_PATH);
}
