import type { ColorScheme, RoleCandidate, Settings, ThemeMode, TokenColor } from '../types';
import { data } from '../data';
import { state } from '../state';

// Settings serialization
const FONT_WIDTHS = ['ultra-condensed', 'extra-condensed', 'condensed', 'semi-condensed', 'normal', 'semi-expanded', 'expanded', 'extra-expanded', 'ultra-expanded'];

export interface ImportedSettings {
    font: string | null;
    size: number;
    weight: number;
    lineHeight: number;
    fontWidth: string;
    letterSpacing: number;
    colorScheme: ColorScheme | null;
    themeMode: ThemeMode;
    rolesMapping: Record<string, RoleCandidate> | null;
}

function tokenColor(token: TokenColor | undefined, fallback: string): string {
    if (!token) return fallback;
    return typeof token === 'string' ? token : (token.color || fallback);
}

/** The winners of the engine, with defaults for the stages that have no winner. */
export function currentSettings(): Settings {
    const winners = state.engine.winners;
    const scheme = winners.colorScheme;
    const fg = scheme?.fg || '#e0e0e0';
    return {
        fontFamily: winners.fontFamily,
        font: winners.font || winners.fontFamily || 'monospace',
        size: winners.size || 16,
        weight: winners.weight || 400,
        lineHeight: winners.lineHeight || 1.5,
        fontWidth: winners.fontWidth || 'normal',
        letterSpacing: winners.letterSpacing || 0,
        colorScheme: {
            name: scheme?.name || 'Unknown',
            bg: scheme?.bg || '#1a1a1a',
            fg,
            keyword: tokenColor(scheme?.keyword, fg),
            string: tokenColor(scheme?.string, fg),
            comment: tokenColor(scheme?.comment, fg),
            function: tokenColor(scheme?.function, fg),
            literal: tokenColor(scheme?.literal, fg),
            variable: tokenColor(scheme?.variable, fg),
            type: tokenColor(scheme?.type, fg),
            operator: tokenColor(scheme?.operator, fg),
            ghost: tokenColor(scheme?.ghost, fg)
        },
        roles: winners.roles
    };
}

export function exportSettings(settings: Settings): string {
    const primaryFontName = (settings.font || '').split(',')[0].replace(/["']/g, '').trim();
    const fontId = data.fontIdByName[primaryFontName] || 0;
    const schemeName = settings.colorScheme && settings.colorScheme.name;
    const schemeId = data.schemeIdByName[state.themeMode][schemeName] || 0;
    const size = settings.size|0;
    const weightIdx = Math.round((settings.weight||400)/100);
    const lh10 = Math.round((settings.lineHeight||1.5)*10);
    const fwIdx = Math.max(0, FONT_WIDTHS.indexOf(settings.fontWidth||'normal'));
    const ls = Math.max(-128, Math.min(127, Math.round((settings.letterSpacing||0)*10)));
    const rolesMap = state.engine.winners.roles;
    const roleEntries = Object.entries(rolesMap)
        .map(([key, entry]) => ({
            rid: state.ROLE_ID_BY_KEY[key] ?? 0,
            fid: data.fontIdByName[entry.font] || 0,
            wi: Math.round(((entry.weight ?? 400))/100),
            sf: (entry.style === 'italic') ? 1 : 0
        }))
        .filter(x => x.rid >= 0);

    // Build binary payload
    const header: number[] = [];
    header.push(0x43, 0x50); // 'C','P'
    header.push(0x01); // version
    let flags = 0;
    flags |= (state.themeMode === 'light') ? 0x01 : 0x00; // bit0 theme
    flags |= (roleEntries.length ? 0x02 : 0x00);        // bit1 roles present
    header.push(flags); // pad bits set later
    const bytes: number[] = [];
    const pushU16 = (n: number) => { bytes.push((n>>>8)&0xff, n&0xff); };
    const pushI8 = (n: number) => { bytes.push(n & 0xff); };
    const pushU8 = (n: number) => { bytes.push(n & 0xff); };
    pushU16(fontId);
    pushU8(size);
    pushU8(weightIdx);
    pushU8(lh10);
    pushU8(fwIdx);
    pushI8(ls+128);
    pushU16(schemeId);
    if (roleEntries.length) {
        pushU8(roleEntries.length);
        roleEntries.forEach(({rid,fid,wi,sf}) => { pushU8(rid); pushU16(fid); pushU8(wi); pushU8(sf); });
    }
    // Compute padding for 4-byte alignment
    const payload = new Uint8Array(header.length + bytes.length);
    for (let i=0;i<header.length;i++) payload[i]=header[i];
    for (let i=0;i<bytes.length;i++) payload[header.length+i]=bytes[i];
    let pad = (4 - (payload.length % 4)) % 4;
    payload[3] = payload[3] | (pad << 6); // store pad in flags high bits
    const padded = new Uint8Array(payload.length + pad);
    padded.set(payload);
    // Z85-encode
    return z85Encode(padded);
}


export function importSettings(encoded: string): ImportedSettings {
    const bytes = z85Decode(encoded);
    if (bytes[0] !== 0x43 || bytes[1] !== 0x50 || bytes[2] !== 0x01) throw new Error('Invalid header');
    const flags = bytes[3];
    const isLight = !!(flags & 0x01);
    const hasRoles = !!(flags & 0x02);
    let off = 4;
    const readU16 = () => { const v = (bytes[off]<<8) | bytes[off+1]; off+=2; return v; };
    const readU8 = () => bytes[off++];
    const fontId = readU16();
    const size = readU8();
    const weightIdx = readU8();
    const lh10 = readU8();
    const fwIdx = readU8();
    const ls = (readU8() - 128) / 10;
    const schemeId = readU16();
    let rolesMapping: Record<string, RoleCandidate> | null = null;
    if (hasRoles) {
        const n = readU8();
        rolesMapping = {};
        for (let i=0;i<n;i++) {
            const rid = readU8();
            const fid = readU16();
            const wi = readU8();
            const sf = readU8();
            const rname = state.ROLE_KEY_BY_ID[rid] || `r${rid}`;
            const fname = data.fontNameById[fid];
            const style = sf ? 'italic' : 'normal';
            // Roles with a font that is not in the database are dropped
            if (fname) rolesMapping[rname] = { type: 'imported', font: fname, weight: wi*100, style, label: fname };
        }
    }
    const themeMode: ThemeMode = isLight ? 'light' : 'dark';
    const fontName = data.fontNameById[fontId];
    const schemes = data.colorSchemeDatabase[themeMode];
    return {
        font: fontName ? `"${fontName}", "Redacted Script"` : null,
        size,
        weight: weightIdx*100,
        lineHeight: lh10/10,
        fontWidth: FONT_WIDTHS[fwIdx] || 'normal',
        letterSpacing: ls,
        colorScheme: data.schemeById[themeMode][schemeId] || schemes[0] || null,
        themeMode,
        rolesMapping
    };
}


// Z85 encoding/decoding (ZeroMQ)
const Z85_CHARS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-:+=^!/*?&<>()[]{}@%$#";

const Z85_ENC = Z85_CHARS.split('');

const Z85_DEC = (() => { const m: Record<string, number> = {}; Z85_ENC.forEach((c,i)=>m[c]=i); return m; })();

function z85Encode(bytes: Uint8Array | number[]) {
    if ((bytes.length % 4) !== 0) throw new Error('Z85 requires length multiple of 4');
    let out = '';
    for (let i=0;i<bytes.length;i+=4) {
        const value = (bytes[i]*0x1000000) + (bytes[i+1]*0x10000) + (bytes[i+2]*0x100) + bytes[i+3];
        let div = value >>> 0;
        const c5 = div % 85; div = (div / 85) >>> 0;
        const c4 = div % 85; div = (div / 85) >>> 0;
        const c3 = div % 85; div = (div / 85) >>> 0;
        const c2 = div % 85; div = (div / 85) >>> 0;
        const c1 = div % 85;
        out += Z85_ENC[c1] + Z85_ENC[c2] + Z85_ENC[c3] + Z85_ENC[c4] + Z85_ENC[c5];
    }
    return out;
}

function z85Decode(str: string) {
    if ((str.length % 5) !== 0) throw new Error('Invalid Z85 length');
    const out = new Uint8Array((str.length / 5) * 4);
    let j = 0;
    for (let i=0;i<str.length;i+=5) {
        let value = 0;
        for (let k=0;k<5;k++) { value = value * 85 + (Z85_DEC[str[i+k]] ?? 0); }
        out[j+0] = (value >>> 24) & 0xff;
        out[j+1] = (value >>> 16) & 0xff;
        out[j+2] = (value >>> 8) & 0xff;
        out[j+3] = value & 0xff;
        j += 4;
    }
    return out;
}
