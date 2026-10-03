
export const fontSizes = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
 // All integer values from 10 to 20
export const fontWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900];
 // Full weight range from ultra-light to black
export const lineHeights = [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0];
 // All 9 standard font-width values
export const letterSpacings = [-1.0, -0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8, 1.0];
 // More granular letter spacing options

// Color schemes are defined in color-schemes.js (colorSchemeDatabase)

// Code sample URLs - loading real code from local files
export const codeSampleUrls: Record<string, string | null> = {
    javascript: `${import.meta.env.BASE_URL}samples/javascript.js`,
    python: `${import.meta.env.BASE_URL}samples/python.py`,
    rust: `${import.meta.env.BASE_URL}samples/rust.rs`,
    go: `${import.meta.env.BASE_URL}samples/go.go`,
    java: `${import.meta.env.BASE_URL}samples/Application.java`,
    cpp: `${import.meta.env.BASE_URL}samples/cpp.cpp`,
    csharp: `${import.meta.env.BASE_URL}samples/csharp.cs`,
    php: `${import.meta.env.BASE_URL}samples/php.php`,
    clojure: `${import.meta.env.BASE_URL}samples/clojure.clj`,
    css: `${import.meta.env.BASE_URL}samples/styles.css`,
    html: `${import.meta.env.BASE_URL}samples/index.html`,
    yaml: `${import.meta.env.BASE_URL}samples/config.yml`,
    json: `${import.meta.env.BASE_URL}samples/config.json`,
    markdown: `${import.meta.env.BASE_URL}samples/markdown.md`,
    legal: `${import.meta.env.BASE_URL}samples/gdpr.txt`,
    powerline: `${import.meta.env.BASE_URL}samples/powerline.txt`,
    custom: null // Will be set by user input
};
