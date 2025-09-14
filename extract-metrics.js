#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function extractMetrics() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Load the font-metrics-extractor page
    await page.goto(`file://${path.resolve(__dirname, 'font-metrics-extractor.html')}`);

    // Wait for the page to load and fonts to be available
    await page.waitForSelector('#extractMetrics');

    // Trigger metrics extraction and wait for completion
    await page.evaluate(() => {
        return new Promise((resolve) => {
            const originalLog = window.log;
            window.log = (msg, type) => {
                originalLog(msg, type);
                if (msg.includes('✓ Font metrics extraction complete')) {
                    resolve();
                }
            };
            document.getElementById('extractMetrics').click();
        });
    });

    // Get the results
    const metrics = await page.evaluate(() => {
        return document.getElementById('resultsOutput').value;
    });

    // Save font-metrics.json
    fs.writeFileSync('font-metrics.json', metrics);
    console.log('✓ Generated font-metrics.json');

    await browser.close();
}

async function generateEmbeddedFonts() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(`file://${path.resolve(__dirname, 'font-metrics-extractor.html')}`);
    await page.waitForSelector('#generateCSS');

    // Trigger CSS generation
    await page.evaluate(() => {
        return new Promise((resolve) => {
            const originalLog = window.log;
            window.log = (msg, type) => {
                originalLog(msg, type);
                if (msg.includes('✓ CSS copied to clipboard')) {
                    resolve();
                }
            };
            document.getElementById('generateCSS').click();
        });
    });

    // Get the CSS results
    const css = await page.evaluate(() => {
        return document.getElementById('resultsOutput').value;
    });

    // Save embedded-fonts.css
    fs.writeFileSync('embedded-fonts.css', css);
    console.log('✓ Generated embedded-fonts.css');

    await browser.close();
}

async function main() {
    const command = process.argv[2];
    try {
        if (command === 'metrics') {
            await extractMetrics();
        } else if (command === 'css') {
            await generateEmbeddedFonts();
        } else {
            await extractMetrics();
            await generateEmbeddedFonts();
        }
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();