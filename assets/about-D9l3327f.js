import{h as e,n as t,p as n,r,t as i,y as a}from"./loader-ChK8SR_h.js";import{t as o}from"./highlight-C9litwEU.js";function s(){let e=document.getElementById(`fontTableBody`),t=document.getElementById(`darkSchemesTableBody`),n=document.getElementById(`lightSchemesTableBody`);if(!e||!t||!n)return;let a=a=>{try{r(),i()}catch{}u(e,a),l(),f(`dark`,t),f(`light`,n)};if(typeof FontDetective<`u`&&FontDetective.all)try{FontDetective.all(e=>{let t=new Set(e.map(e=>e.name));a(t)})}catch{a(new Set)}else a(new Set)}var c=`if(l==1||O[0]){$file+=~l*10}`;async function l(){let e=document.getElementById(`fontLoadFill`),t=document.getElementById(`fontLoadStatus`);if(!e||!t)return;let r=n.fontDatabase.filter(e=>e.source!==`system`),i=0,a=0,o=()=>{e.style.width=`${(i+a)/r.length*100}%`,t.textContent=`Loaded ${i} out of ${r.length} fonts${a?` (${a} failed)`:``}`};o();let s=[...document.querySelectorAll(`link[rel="stylesheet"]`)];await Promise.all(s.map(e=>e.sheet||new Promise(t=>{e.addEventListener(`load`,t),e.addEventListener(`error`,t)}))),r.forEach(e=>{document.fonts.load(`16px "${e.name}"`,c).then(e=>{e.length?i++:a++},()=>{a++}).then(o)})}function u(e,t){let r={google:`Google Fonts`,embedded:`Embedded`,system:`System`},i=c,a=n.fontDatabase.slice().sort((e,t)=>(e.name||``).localeCompare(t.name||``)),o=``;a.forEach(e=>{let n=e.ligatures?`✓`:`✗`,a=e.description||d(e),s=e.homepage?`<a href="${e.homepage}" target="_blank" rel="noopener noreferrer">${e.name}</a>`:e.name,c=``;c=e.source===`system`?t&&t.has(e.name)?`<span class="sample-code" style="font-family:'${e.name}', 'Redacted Script'">${i}</span>`:`System font not available`:`<span class="sample-code" style="font-family:'${e.name}', 'Redacted Script'">${i}</span>`,o+=`<tr>
            <td>${s}</td>
            <td><span class="font-source ${e.source}">${r[e.source]||e.source}</span></td>
            <td>${n}</td>
            <td>${a}</td>
            <td>${c}</td>
        </tr>`});let s=a.length;o+=`<tr>
        <td><strong>Total: ${s} fonts</strong></td>
        <td colspan="4">Includes system, embedded, and Google fonts</td>
    </tr>`,e.innerHTML=o}function d(e){let t=[],n=e.category.toLowerCase();n.includes(`serif`)?t.push(`monospaced serif`):n.includes(`slab`)?t.push(`slab‑serif mono`):n.includes(`retro`)?t.push(`retro/terminal mono`):n.includes(`compact`)?t.push(`condensed mono`):n.includes(`playful`)?t.push(`playful, handwriting‑inspired mono`):t.push(`monospaced sans‑serif`),e.ligatures&&t.push(`programming ligatures`),e.axes&&(e.axes.widths||e.axes.weights||e.axes.styles)&&t.push(`multiple styles`);let r=(e.name||``).toLowerCase();return r.includes(`space mono`)&&t.push(`geometric shapes, wide counters`),r.includes(`iosevka`)&&t.push(`narrow proportions`),(r.includes(`vt323`)||r.includes(`3270`)||r.includes(`terminus`))&&t.push(`pixel/CRT aesthetics`),t.join(` • `)}function f(e,t){let r=(n.colorSchemeDatabase[e]||[]).slice().sort((e,t)=>e.name.localeCompare(t.name)),i=``,a=e=>e?typeof e==`string`?{color:e}:{color:e.color,bold:!!e.bold,italic:!!e.italic}:{};r.forEach((t,n)=>{let r=t.homepage?`<a href="${t.homepage}" target="_blank">${t.author}</a>`:t.author||``,s=`scheme-${e}-${n}`,c=o.highlight(`const API_URL = "https://api.io"; // prod
let items = [{id: 1, active: true}];
async function getData(limit = 10) {}`,{language:`javascript`}).value,l=a(t.keyword),u=a(t.string),d=a(t.comment),f=a(t.function),p=t.fg||`#ccd`,m=t.bg||(e===`dark`?`#111`:`#fff`),h=e=>e.bold?`font-weight:600;`:``,g=e=>e.italic?`font-style:italic;`:``,_=f,v=l,y={color:p},b=`${`
<style>
  #${s} { background:${m}; color:${p}; }
  #${s} .hljs-keyword { color:${l.color||p}; ${h(l)}${g(l)} }
  #${s} .hljs-string { color:${u.color||p}; ${h(u)}${g(u)} }
  #${s} .hljs-comment { color:${d.color||p}; ${h(d)}${g(d)} }
  #${s} .hljs-function, #${s} .hljs-title { color:${f.color||p}; ${h(f)}${g(f)} }
  #${s} .hljs-number { color:${_.color||p}; ${h(_)}${g(_)} }
  #${s} .hljs-literal { color:${v.color||p}; ${h(v)}${g(v)} }
  #${s} .hljs-params { color:${y.color}; }
</style>`}<pre class="scheme-sample"><code id="${s}" class="hljs language-javascript">${c}</code></pre>`;i+=`<tr>
            <td>${t.name}</td>
            <td>${r}</td>
            <td>${t.description||``}</td>
            <td>${b}</td>
        </tr>`}),t.innerHTML=i}window.matchMedia(`(prefers-color-scheme: dark)`).matches&&document.body.classList.add(`dark-mode`),a(),e(),t(),s();