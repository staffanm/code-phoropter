import { byId } from './dom';
import hljs from './highlight';
import { textSamples } from './text-samples';
import { codeSampleUrls } from './constants';
import { devLog } from './dev';
import { clearRoleHighlighting } from './roles';
import { state } from './state';

// Cache for loaded code
export const codeCache = new Map<string, string>();


// Load code from URL or cache
export async function loadCode(language: string): Promise<string> {
    // Check cache first
    if (codeCache.has(language)) {
        return codeCache.get(language) as string;
    }
    
    const url = codeSampleUrls[language];
    
    if (!url) {
        const fallback = textSamples.buildLoadFallback(language);
        codeCache.set(language, fallback);
        return fallback;
    }
    
    try {
        console.log(`Loading code from: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const code = await response.text();

        // No truncation - display full file
        codeCache.set(language, code);
        return code;
        
    } catch (error) {
        console.warn(`Failed to load code from ${url}:`, error);
        
        // Fallback to simple sample (from text-samples.js)
        const fallback = textSamples.buildErrorFallback(language);
        codeCache.set(language, fallback);
        return fallback;
    }
}


// Update code display with async loading
export async function updateCode() {
    const codeA = byId('codeA');
    const codeB = byId('codeB');
    
    // Failsafe: Clear any stuck role highlighting
    console.log('[DEBUG] updateCode: Clearing any stuck role highlighting');
    clearRoleHighlighting(codeA);
    clearRoleHighlighting(codeB);
    
    // Show loading state
    codeA.textContent = 'Loading code...';
    codeB.textContent = 'Loading code...';
    
    try {
        const code = await loadCode(state.currentLanguage);
        
        const lang = mapLanguageForHLJS(state.currentLanguage);
        setCodeWithHighlight(codeA, code, lang);
        setCodeWithHighlight(codeB, code, lang);
    } catch (error) {
        console.error('Failed to update code:', error);
        codeA.textContent = 'Failed to load code';
        codeB.textContent = 'Failed to load code';
    }
}


// Basic syntax highlighting
// Removed built-in syntax highlighter; using highlight.js instead

export function mapLanguageForHLJS(language: string) {
    switch (language) {
        case 'javascript': return 'javascript';
        case 'python': return 'python';
        case 'rust': return 'rust';
        case 'go': return 'go';
        case 'java': return 'java';
        case 'cpp': return 'cpp';
        case 'csharp': return 'csharp';
        case 'php': return 'php';
        case 'clojure': return 'clojure';
        case 'css': return 'css';
        case 'html': return 'xml';
        case 'json': return 'json';
        case 'yaml': return 'yaml';
        case 'markdown': return 'markdown';
        case 'legal':
        case 'powerline':
        case 'custom':
        default: return 'plaintext';
    }
}


export function setCodeWithHighlight(el: HTMLElement, code: string, lang: string) {
    el.className = '';
    el.classList.add('hljs');
    if (lang && lang !== 'plaintext') {
        el.classList.add(`language-${lang}`);
    }
    // Reset any prior highlight.js state before re-highlighting
    el.removeAttribute('data-highlighted');
    el.textContent = code;
    try { hljs.highlightElement(el); } catch {}
    // Process ghost markers after highlighting, now that DOM is structured
    try { processGhostMarkers(el); } catch (e) { devLog('Ghost processing failed', e); }
}


// Wrap ghost sections and caret markers in code blocks
export function processGhostMarkers(codeEl: HTMLElement) {
    if (!codeEl || !codeEl.textContent) return;
    const MARK_BEGIN = '__GHOST_BEGIN__';
    const MARK_END = '__GHOST_END__';
    const MARK_CARET = '__GHOST_CARET__';
    // Quick check
    const fullText = codeEl.textContent;
    if (!fullText.includes(MARK_BEGIN) && !fullText.includes(MARK_CARET)) return;

    const walker = document.createTreeWalker(codeEl, NodeFilter.SHOW_TEXT, null);
    let node: Text | null;
    let startBoundary: { node: Text; offset: number } | null = null;
    function splitTextNode(n: Text, index: number) {
        if (index <= 0) return n;
        if (index >= n.data.length) return n;
        return n.splitText(index);
    }
    function removeMarkerAt(n: Text, index: number, marker: string) {
        const val = n.data;
        n.data = val.slice(0, index) + val.slice(index + marker.length);
    }
    function insertCaret(n: Text, index: number) {
        const after = splitTextNode(n, index);
        const caret = document.createElement('span');
        caret.className = 'ghost-caret';
        caret.setAttribute('role', 'img');
        caret.setAttribute('aria-label', 'Cursor');
        after.parentNode?.insertBefore(caret, after);
    }
    while ((node = walker.nextNode() as Text | null)) {
        let i = 0;
        // Loop to handle multiple markers in the same text node
        while (node) {
            const text: string = node.data;
            const nextBegin = text.indexOf(MARK_BEGIN, i);
            const nextEnd = text.indexOf(MARK_END, i);
            const nextCaret = text.indexOf(MARK_CARET, i);
            const minIdx = [nextBegin, nextEnd, nextCaret]
                .filter(idx => idx !== -1)
                .sort((a,b) => a - b)[0];
            if (minIdx === undefined) break;
            // Ensure we operate on current node after potential split
            if (minIdx > 0) {
                node = splitTextNode(node, minIdx);
                i = 0;
                continue;
            }
            // Marker at start of node text
            if (nextBegin === 0) {
                removeMarkerAt(node, 0, MARK_BEGIN);
                startBoundary = { node, offset: 0 };
                i = 0;
                continue;
            }
            if (nextEnd === 0) {
                if (startBoundary) {
                    // Remove end marker then wrap range
                    removeMarkerAt(node, 0, MARK_END);
                    const range = document.createRange();
                    range.setStart(startBoundary.node, startBoundary.offset);
                    range.setEnd(node, 0);
                    const span = document.createElement('span');
                    span.className = 'ghost-text';
                    span.setAttribute('aria-label', 'Ghost suggestion');
                    try { range.surroundContents(span); } catch (e) {
                        // Fallback: wrap by cloning contents
                        const contents = range.extractContents();
                        span.appendChild(contents);
                        range.insertNode(span);
                    }
                    // Strip syntax highlighting classes from ghost text
                    stripSyntaxHighlighting(span);
                    startBoundary = null;
                } else {
                    // Orphaned end marker - just remove it
                    removeMarkerAt(node, 0, MARK_END);
                }
                i = 0;
                continue;
            }
            if (nextCaret === 0) {
                removeMarkerAt(node, 0, MARK_CARET);
                insertCaret(node, 0);
                i = 0;
                continue;
            }
            // Safety break
            break;
        }
    }
}


export function stripSyntaxHighlighting(element: HTMLElement) {
    // Remove all hljs- classes and convert highlighted elements to plain text
    const highlightedElements = element.querySelectorAll('[class*="hljs-"]');
    highlightedElements.forEach(el => {
        // Remove all hljs classes
        const classes = Array.from(el.classList);
        classes.forEach(cls => {
            if (cls.startsWith('hljs-')) {
                el.classList.remove(cls);
            }
        });
        // If no classes left, unwrap the element
        if (el.classList.length === 0) {
            const parent = el.parentNode as Node;
            while (el.firstChild) {
                parent.insertBefore(el.firstChild, el);
            }
            parent.removeChild(el);
        }
    });
}
