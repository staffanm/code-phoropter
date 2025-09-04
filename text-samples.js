// Centralized text samples used by the app UI
// Keeps app.js free of inline display samples

(function(){
  window.textSamples = {
    // Short preview for the font-family selection cards
    fontFamilyPreviewCode: "function calculate(n) {\n  const result = n * 2;\n  return result;\n}",

    // Close-up ligature sample text
    ligatureSample: "*fi->0;",

    // Fallbacks for when loading code samples fails or local file serving isn't used
    buildLoadFallback: (language) => `// ${String(language || 'Code').toUpperCase()} code sample\n// Please use a web server to load actual code samples\nconsole.log('Code Phoropter - Font Testing Application');`,
    buildErrorFallback: (language) => `// ${String(language || 'Code').toUpperCase()} code sample (failed to load)\n// Please check that sample files exist\nconsole.log('Code Phoropter - Font Testing Application');`
  };
})();

