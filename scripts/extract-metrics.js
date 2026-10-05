#!/usr/bin/env node

import fs from 'node:fs';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer';
import { createServer } from 'vite';

// Generates font-metrics.json and public/embedded-fonts.css.
// Opens font-metrics-extractor.html in headless Chrome through the Vite dev server.
//
// Usage:
//   npm run fonts:generate         metrics and CSS
//   npm run fonts:metrics          metrics for all fonts
//   npm run fonts:metrics -- "Fira Code"   metrics for one font, printed to stdout
//   npm run fonts:css              CSS only

const ROOT = resolve(import.meta.dirname, '..');
const METRICS_PATH = resolve(ROOT, 'font-metrics.json');
const EMBEDDED_CSS_PATH = resolve(ROOT, 'public/embedded-fonts.css');

// Common Puppeteer configuration
function getPuppeteerConfig() {
    const config = {
        headless: true,
        protocolTimeout: 600000 // 10 minutes timeout for slow font loading
    };

    // For now, let's use Linux Chrome with optimizations for font access
    // Windows Chrome integration is tricky in WSL - would need more complex setup
    console.log('Using Linux Chrome with font optimizations');

    // Add args that might help with font loading and performance
    config.args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--font-render-hinting=none',
        '--disable-font-subpixel-positioning',
        '--disable-gpu',
        '--expose-gc', // Enable garbage collection for memory cleanup
        '--memory-pressure-off', // Disable memory pressure throttling
        '--max-old-space-size=4096' // Increase memory limit
    ];

    return config;
}

// Common console log forwarding setup
function setupConsoleForwarding(page) {
    page.on('console', msg => {
        console.log('PAGE LOG:', msg.text());
    });
}

// Start the Vite dev server on a free port. It serves the extractor page and the fonts directory.
async function startServer() {
    const server = await createServer({ root: ROOT, logLevel: 'warn', server: { port: 0, strictPort: false } });
    await server.listen();
    const port = server.httpServer.address().port;
    console.log(`Started Vite dev server on port ${port}`);
    return { server, port };
}

async function extractMetrics() {
    // Start local HTTP server
    const { server, port } = await startServer();

    try {
        console.log('Launching browser...');
        const config = getPuppeteerConfig();
        console.log('Puppeteer config:', config);

        const browser = await puppeteer.launch(config);

        // Log Chrome version and executable path
        const version = await browser.version();
        console.log('Chrome version:', version);
        const page = await browser.newPage();

        // Setup console log forwarding
        setupConsoleForwarding(page);

        // Enable DevTools domains for font inspection
        const client = await page.target().createCDPSession();
        await client.send('DOM.enable');
        await client.send('CSS.enable');

        // Add function to check actual rendered fonts using DevTools Protocol
        await page.exposeFunction('checkActualFont', async (fontSpec, weight, style, expectedFontName) => {
            try {
                // Create a unique ID for this test element
                const testId = 'font-test-' + Math.random().toString(36).substr(2, 9);

                // Create test element and get its nodeId
                const nodeId = await page.evaluate((fontSpec, testId) => {
                    const el = document.createElement('span');
                    el.id = testId;
                    el.textContent = 'Test';
                    el.style.font = fontSpec;
                    el.style.position = 'absolute';
                    el.style.top = '-9999px';
                    document.body.appendChild(el);
                    return testId;
                }, fontSpec, testId);

                // Get DOM document and find our element
                const { root } = await client.send('DOM.getDocument');
                const { nodeId: elementNodeId } = await client.send('DOM.querySelector', {
                    nodeId: root.nodeId,
                    selector: `#${testId}`
                });

                // Get the platform fonts that were actually used
                const { fonts } = await client.send('CSS.getPlatformFontsForNode', {
                    nodeId: elementNodeId
                });

                // Clean up the element
                await page.evaluate((testId) => {
                    const el = document.getElementById(testId);
                    if (el) el.remove();
                }, testId);

                if (fonts && fonts.length > 0) {
                    const actualFont = fonts[0]; // Primary font used
                    console.log(`   Actual rendered font: "${actualFont.familyName}" (${actualFont.isCustomFont ? 'custom' : 'system'})`);

                    if (!actualFont.familyName.includes(expectedFontName.replace(' Nerd Font', ''))) {
                        console.log(`   ⚠️ Font fallback detected! Expected "${expectedFontName}" but got "${actualFont.familyName}"`);
                    }
                } else {
                    console.log(`   Unable to determine actual rendered font`);
                }

            } catch (error) {
                console.log(`   Error checking actual font: ${error.message}`);
            }
        });

        console.log('Loading font-metrics-extractor.html...');
        await page.goto(`http://localhost:${port}/font-metrics-extractor.html`, { waitUntil: 'networkidle0' });

        console.log('Waiting for extract button...');
        await page.waitForSelector('#extractBtn');

        console.log('Waiting for database to auto-load and extract button to be enabled...');
        // Wait for the button to be enabled (database auto-loads on page load)
        await page.waitForFunction(() => {
            const btn = document.getElementById('extractBtn');
            const database = window.fontDatabase;
            return btn && !btn.disabled && database && database.length > 0;
        }, { timeout: 60000, polling: 1000 }); // Wait up to 1 minute, polling every second

        // Check button state before clicking
        const buttonState = await page.evaluate(() => {
            const btn = document.getElementById('extractBtn');
            return {
                exists: !!btn,
                disabled: btn?.disabled,
                text: btn?.textContent,
                onclick: typeof btn?.onclick
            };
        });
        console.log('Extract button enabled and ready:', buttonState);

        // Trigger metrics extraction and wait for completion
        await page.evaluate(() => {
            return new Promise((resolve) => {
                const originalLog = window.log;
                let extractionStarted = false;

                window.log = (msg, type) => {
                    originalLog(msg, type);
                    if (msg.includes('Starting font metrics extraction...')) {
                        extractionStarted = true;
                        console.log('EXTRACTION STARTED DETECTED');
                    }
                    if (msg.includes('Extraction complete!')) {
                        console.log('EXTRACTION COMPLETE DETECTED');
                        resolve();
                    }
                };

                const btn = document.getElementById('extractBtn');
                console.log('About to click extract button...', { disabled: btn.disabled, text: btn.textContent });
                btn.click();
                console.log('Extract button clicked');

                // Timeout after 5 minutes, but check if extraction started
                setTimeout(() => {
                    if (!extractionStarted) {
                        console.log('TIMEOUT: Extraction never started - button click may have failed');
                        resolve();
                    } else {
                        console.log('TIMEOUT: Extraction started but never completed');
                        resolve();
                    }
                }, 300000); // 5 minutes
            });
        });

        console.log('Extraction completed, getting results...');

        // Get the results
        const metrics = await page.evaluate(() => {
            return document.getElementById('resultsOutput').value;
        });

        console.log(`Got metrics data: ${metrics.length} characters`);

        // Save font-metrics.json
        fs.writeFileSync(METRICS_PATH, metrics);
        console.log('✓ Generated font-metrics.json');

        await browser.close();
        console.log('Browser closed');

    } finally {
        // Close the HTTP server
        await server.close();
        console.log('HTTP server closed');
    }
}

async function generateEmbeddedFonts() {
    // Start local HTTP server
    const { server, port } = await startServer();

    try {
        console.log('Launching browser for CSS generation...');
        const browser = await puppeteer.launch(getPuppeteerConfig());
        const page = await browser.newPage();

        // Setup console log forwarding
        setupConsoleForwarding(page);

        console.log('Loading font-metrics-extractor.html for CSS...');
        await page.goto(`http://localhost:${port}/font-metrics-extractor.html`);

    console.log('Waiting for CSS generate button...');
    await page.waitForSelector('#generateCssBtn');
    console.log('CSS button found, checking page state...');

    // Debug what's happening on the page
    const pageState = await page.evaluate(() => {
        const btn = document.getElementById('generateCssBtn');
        return {
            buttonDisabled: btn?.disabled,
            buttonText: btn?.textContent,
            fontDatabaseExists: !!window.fontDatabase,
            fontDatabaseLength: window.fontDatabase?.length || 0,
            hasJQuery: typeof $ !== 'undefined',
            hasHighlightJs: typeof hljs !== 'undefined',
            hasWebFont: typeof WebFont !== 'undefined',
            windowLoaded: document.readyState,
            errors: window.lastError || 'none'
        };
    });

    console.log('Page state:', pageState);

    if (pageState.buttonDisabled) {
        console.log('Button is disabled, waiting for the database to load...');

        // Now wait for either the button to be enabled OR the database to load
        console.log('Waiting for button to be enabled or database to load...');

        // First, let's test if the page is responsive at all
        const testResult = await page.evaluate(() => {
            console.log('Page evaluate is working');
            return 'test successful';
        });
        console.log('Page test result:', testResult);

        try {
            await page.waitForFunction(() => {
                const btn = document.getElementById('generateCssBtn');
                const hasDatabase = window.fontDatabase && window.fontDatabase.length > 0;
                console.log('waitForFunction running - btn disabled:', btn?.disabled, 'hasDB:', hasDatabase);
                return (!btn?.disabled) && hasDatabase;
            }, { timeout: 30000, polling: 1000 }); // Poll every 1 second
        } catch (error) {
            console.log('waitForFunction failed, checking final state...');
            const finalState = await page.evaluate(() => ({
                buttonDisabled: document.getElementById('generateCssBtn')?.disabled,
                hasDB: !!(window.fontDatabase && window.fontDatabase.length > 0),
                dbLength: window.fontDatabase?.length || 0
            }));
            console.log('Final state:', finalState);
            throw error;
        }

        console.log('Button enabled and database loaded, proceeding...');
    }

    console.log('Proceeding with CSS generation...');

    // Check button state before clicking
    const buttonInfo = await page.evaluate(() => {
        const btn = document.getElementById('generateCssBtn');
        return {
            disabled: btn.disabled,
            text: btn.textContent,
            exists: !!btn
        };
    });
    console.log('Button state:', buttonInfo);

    // Trigger CSS generation with enhanced logging
    await page.evaluate(() => {
        return new Promise((resolve) => {
            console.log('Inside page: Setting up log interceptor...');
            const originalLog = window.log;
            let messageCount = 0;

            window.log = (msg, type) => {
                messageCount++;
                console.log(`Inside page: Log message ${messageCount}: "${msg}" (${type})`);
                originalLog(msg, type);

                if (msg.includes('CSS copied to clipboard') || msg.includes('Generated CSS')) {
                    console.log('Inside page: Success message detected, resolving...');
                    resolve();
                }
            };

            console.log('Inside page: About to click button...');
            const btn = document.getElementById('generateCssBtn');
            if (btn && !btn.disabled) {
                btn.click();
                console.log('Inside page: Button clicked successfully');
            } else {
                console.log('Inside page: Button not clickable!', { exists: !!btn, disabled: btn?.disabled });
            }

            // Timeout after 30 seconds
            setTimeout(() => {
                console.log('Inside page: Timeout reached, resolving anyway...');
                resolve();
            }, 30000);
        });
    });

    console.log('CSS generation completed, getting results...');

    // Get the CSS results
    const css = await page.evaluate(() => {
        return document.getElementById('resultsOutput').value;
    });

    console.log(`Got CSS data: ${css.length} characters`);

    // The database lists some faces that have no file, such as a bold italic that the font
    // does not have. The browser shows text in such a face in the fallback font. Without
    // the rule, the browser makes the face from the nearest face that exists.
    let dropped = 0;
    const checked = css.replace(/@font-face\s*\{[^}]*\}\n*/g, rule => {
        const url = rule.match(/url\("([^"]+)"\)/)?.[1];
        if (!url || /^https?:/.test(url) || fs.existsSync(resolve(ROOT, decodeURIComponent(url)))) return rule;
        dropped++;
        return '';
    });
    if (dropped) console.log(`Left out ${dropped} faces that have no file in fonts/`);

    // Save embedded-fonts.css
    fs.writeFileSync(EMBEDDED_CSS_PATH, checked);
    console.log('✓ Generated public/embedded-fonts.css');

        await browser.close();
        console.log('Browser closed for CSS generation');

    } finally {
        // Close the HTTP server
        await server.close();
        console.log('HTTP server closed');
    }
}

async function extractSingleFont(fontName) {
    // Start local HTTP server
    const { server, port } = await startServer();

    try {
        console.log(`Extracting metrics for font: ${fontName}`);
        const browser = await puppeteer.launch(getPuppeteerConfig());
        const page = await browser.newPage();

        // Setup console log forwarding (but suppress routine messages)
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('PAGE LOG:') && (text.includes('success:') || text.includes('warning:') || text.includes('error:'))) {
                console.log(text);
            }
        });

        await page.goto(`http://localhost:${port}/font-metrics-extractor.html`, { waitUntil: 'networkidle0' });

        // Wait for database to load
        await page.waitForFunction(() => {
            return window.fontDatabase && window.fontDatabase.length > 0;
        }, { timeout: 60000 });

        // Extract metrics for single font
        const result = await page.evaluate(async (targetFontName) => {
            const fontDatabase = window.fontDatabase || [];
            const fontInfo = fontDatabase.find(f => f.name === targetFontName);

            if (!fontInfo) {
                return { error: `Font "${targetFontName}" not found in database` };
            }

            try {
                // Use the extractFontMetrics function from the page
                const metrics = await extractFontMetrics(fontInfo);
                return { success: true, fontName: targetFontName, metrics };
            } catch (error) {
                return { error: error.message };
            }
        }, fontName);

        await browser.close();

        // Output results to stdout
        if (result.error) {
            console.error(`Error: ${result.error}`);
            process.exit(1);
        } else {
            console.log(`\nMetrics for ${result.fontName}:`);
            console.log(JSON.stringify(result.metrics, null, 2));
        }

    } finally {
        await server.close();
    }
}

async function main() {
    const command = process.argv[2];
    const fontName = process.argv[3];

    // Check if it's a single font extraction (command is a font name, not 'metrics'/'css')
    if (command && command !== 'metrics' && command !== 'css') {
        console.log(`Starting extract-metrics for single font: ${command}`);
        await extractSingleFont(command);
        return;
    }

    console.log(`Starting extract-metrics with command: ${command || 'both'}`);

    try {
        if (command === 'metrics') {
            if (fontName) {
                console.log(`Running metrics extraction for single font: ${fontName}`);
                await extractSingleFont(fontName);
            } else {
                console.log('Running metrics extraction for all fonts...');
                await extractMetrics();
            }
        } else if (command === 'css') {
            console.log('Running CSS generation only...');
            await generateEmbeddedFonts();
        } else {
            console.log('Running both metrics and CSS generation...');
            await extractMetrics();
            await generateEmbeddedFonts();
        }
        console.log('All operations completed successfully!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();