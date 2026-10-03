import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import type { Connect, Plugin } from 'vite';
import { defineConfig } from 'vite';

const FONTS_DIR = resolve(import.meta.dirname, 'fonts');

const MIME_TYPES: Record<string, string> = {
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
};

// Serve the fonts directory at /fonts/ in dev and preview.
// The directory is 4 GB and not in git, so it is not part of the build output.
// In production the web server serves it (see deploy/phoropter.org.nginx).
function serveFonts(): Plugin {
    const middleware: Connect.NextHandleFunction = (req, res, next) => {
        const url = decodeURIComponent((req.url ?? '').split('?')[0]);
        if (!url.startsWith('/fonts/')) return next();
        const file = normalize(join(FONTS_DIR, url.slice('/fonts/'.length)));
        if (!file.startsWith(FONTS_DIR) || !existsSync(file) || !statSync(file).isFile()) {
            res.statusCode = 404;
            res.end('Font not found');
            return;
        }
        res.setHeader('Content-Type', MIME_TYPES[extname(file)] ?? 'application/octet-stream');
        res.setHeader('Cache-Control', 'max-age=3600');
        createReadStream(file).pipe(res);
    };
    return {
        name: 'serve-fonts',
        configureServer(server) { server.middlewares.use(middleware); },
        configurePreviewServer(server) { server.middlewares.use(middleware); },
    };
}

export default defineConfig({
    plugins: [serveFonts()],
    build: {
        rollupOptions: {
            input: {
                main: resolve(import.meta.dirname, 'index.html'),
                about: resolve(import.meta.dirname, 'about.html'),
                fonts: resolve(import.meta.dirname, 'fonts.html'),
            },
        },
    },
});
