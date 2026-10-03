export {};

interface DetectedFont {
    name: string;
}

declare global {
    // The vendored script attaches itself to `window`.
    const FontDetective: {
        all(callback: (fonts: DetectedFont[]) => void): void;
        each(callback: (font: DetectedFont) => void): void;
        preload(): void;
    };
}
