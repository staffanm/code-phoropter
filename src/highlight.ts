// highlight.js with the languages that the code samples use.
// No theme CSS on purpose: the color schemes style the tokens.
import hljs from 'highlight.js/lib/common';
import clojure from 'highlight.js/lib/languages/clojure';

hljs.registerLanguage('clojure', clojure);

export default hljs;
