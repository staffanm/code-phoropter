// Validate and download the fonts that font-database.json references by URL.
// Checks each URL, saves the file under fonts/, and validates the file format.
// Writes a detailed report to font_validation_report.json.
//
// Usage: npm run fonts:validate
import { mkdirSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { FONTS_DIR, ROOT, readFontDatabase } from './lib.ts';

type Format = 'ttf' | 'otf' | 'woff2';
type Status = 'SUCCESS' | 'NOT_FOUND' | 'HTTP_ERROR' | 'INVALID_FORMAT' | 'TIMEOUT' | 'ERROR';

interface Result {
    url: string;
    font: string;
    format: Format;
    status: Status;
    message: string;
    file_path: string | null;
}

// File signatures (magic numbers) for font formats
const FILE_SIGNATURES: Record<Format, Buffer[]> = {
    woff2: [Buffer.from('wOF2')],
    ttf: [Buffer.from([0x00, 0x01, 0x00, 0x00]), Buffer.from('true'), Buffer.from('typ1')],
    otf: [Buffer.from('OTTO')],
};

function hasSignature(content: Buffer, format: Format): boolean {
    return FILE_SIGNATURES[format].some(signature => content.subarray(0, signature.length).equals(signature));
}

// Download a font file and validate its format
async function downloadFont(url: string, destDir: string, fontName: string, format: Format): Promise<Result> {
    const result = (status: Status, message: string, file_path: string | null = null): Result => {
        console.log(`    ${status === 'SUCCESS' ? '✅' : '❌'} ${message}`);
        return { url, font: fontName, format, status, message, file_path };
    };

    console.log(`  Checking ${format.toUpperCase()}: ${url}`);
    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            signal: AbortSignal.timeout(10_000),
        });
        if (response.status === 404) return result('NOT_FOUND', '404 Not Found');
        if (response.status !== 200) return result('HTTP_ERROR', `HTTP ${response.status}`);

        const content = Buffer.from(await response.arrayBuffer());
        if (!hasSignature(content, format)) {
            return result('INVALID_FORMAT', `File is not a valid ${format.toUpperCase()} (wrong magic number)`);
        }

        const filename = /\.(ttf|otf|woff|woff2)$/.test(url)
            ? basename(new URL(url).pathname)
            : `${fontName.replaceAll(' ', '_')}.${format}`;
        mkdirSync(destDir, { recursive: true });
        const filePath = join(destDir, filename);
        writeFileSync(filePath, content);
        return result('SUCCESS', `Downloaded successfully (${content.length.toLocaleString('en-US')} bytes)`, filePath);
    } catch (error) {
        if (error instanceof Error && error.name === 'TimeoutError') return result('TIMEOUT', 'Request timed out');
        return result('ERROR', error instanceof Error ? error.message : String(error));
    }
}

const fonts = readFontDatabase();
console.log(`Loaded ${fonts.length} fonts from database\n`);

const results = {
    total_fonts: fonts.length,
    embedded_fonts: 0,
    successful_downloads: [] as Result[],
    not_found_404: [] as Result[],
    invalid_format: [] as Result[],
    other_errors: [] as Result[],
    skipped: [] as { font: string; url: string; reason: string }[],
};

for (const font of fonts) {
    if (font.source !== 'embedded') continue;
    results.embedded_fonts++;
    console.log(`\n${font.name}:`);

    const fontDir = join(FONTS_DIR, font.name.toLowerCase().replaceAll(' ', '-').replaceAll('/', '-'));

    for (const format of ['ttf', 'otf', 'woff2'] as const) {
        const url = font[format];
        // Only remote URLs can be downloaded. Paths under fonts/ are local files.
        if (!url || !/^https?:\/\//.test(url)) continue;

        // Skip GitHub release zips and archives
        if (url.endsWith('.zip') || url.endsWith('.tar.gz')) {
            console.log(`  Skipping ${format.toUpperCase()}: Archive file (not direct font)`);
            results.skipped.push({ font: font.name, url, reason: 'Archive file' });
            continue;
        }

        const result = await downloadFont(url, fontDir, font.name, format);
        if (result.status === 'SUCCESS') results.successful_downloads.push(result);
        else if (result.status === 'NOT_FOUND') results.not_found_404.push(result);
        else if (result.status === 'INVALID_FORMAT') results.invalid_format.push(result);
        else results.other_errors.push(result);

        // Small delay to be polite to servers
        await sleep(500);
    }
}

console.log(`\n${'='.repeat(60)}\nVALIDATION SUMMARY\n${'='.repeat(60)}`);
console.log(`\nTotal fonts in database: ${results.total_fonts}`);
console.log(`Embedded fonts to check: ${results.embedded_fonts}`);

const section = <T>(title: string, items: T[], line: (item: T) => string) => {
    if (items.length === 0) return;
    console.log(`\n${title}: ${items.length}`);
    items.forEach(item => console.log(`  - ${line(item)}`));
};
section('✅ Successfully downloaded', results.successful_downloads, r => `${r.font} (${r.format})`);
section('❌ 404 Not Found', results.not_found_404, r => `${r.font} (${r.format}): ${r.url}`);
section('❌ Invalid file format', results.invalid_format, r => `${r.font} (${r.format}): ${r.message}\n    URL: ${r.url}`);
section('⚠️ Other errors', results.other_errors, r => `${r.font} (${r.format}): ${r.message}`);
section('⏭️ Skipped', results.skipped, r => `${r.font}: ${r.reason}`);

const reportPath = join(ROOT, 'font_validation_report.json');
writeFileSync(reportPath, JSON.stringify(results, null, 2));
console.log(`\nDetailed report saved to: ${reportPath}`);
