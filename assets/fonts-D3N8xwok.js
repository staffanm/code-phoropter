import{h as e,n as t,p as n,r,t as i,y as a}from"./loader-ChK8SR_h.js";import{t as o}from"./dom-DfIiZW0k.js";function s(){let e=document.getElementById(`fontGrid`),t=document.getElementById(`fontLoadingMessage`);if(o(`fontLoadingProgress`),!e)return;let n=n=>{try{r(),i()}catch{}t&&(t.style.display=`none`),e.style.display=`grid`,c(e,n)};if(typeof FontDetective<`u`&&FontDetective.all)try{FontDetective.all(e=>{let t=new Set(e.map(e=>e.name));n(t)})}catch{n(new Set)}else n(new Set)}function c(e,t){let r=n.fontDatabase.filter(e=>!e.patchedFrom).slice().sort((e,t)=>(e.name||``).localeCompare(t.name||``)),i=``;r.forEach((e,n)=>{let r=!0;if(e.source===`system`&&(r=t&&t.has(e.name)),r){let t=`font-${n}`,r=e.axes||{},a=r.weights||[400],o=r.styles||[`normal`],s=r.widths||[`normal`],c=``;if(a.length>1){let e=a.includes(400)?a.indexOf(400):0,n=a[e];c+=`
                    <div class="axis-control">
                        <span class="axis-label">Weight</span>
                        <div class="axis-control-content">
                            <div class="axis-value">${n}</div>
                            <input type="range" id="${t}-weight" class="axis-slider"
                                   min="0" max="${a.length-1}" value="${e}" step="1"
                                   data-font-id="${t}" data-axis="weight" data-weight-options='${JSON.stringify(a)}'
                                   data-choice-count="${a.length}">
                        </div>
                    </div>
                `}if(s.length>1){let e=s.includes(`normal`)?s.indexOf(`normal`):0,n=s[e];c+=`
                    <div class="axis-control">
                        <span class="axis-label">Width</span>
                        <div class="axis-control-content">
                            <div class="axis-value">${n}</div>
                            <input type="range" id="${t}-width" class="axis-slider"
                                   min="0" max="${s.length-1}" value="${e}" step="1"
                                   data-font-id="${t}" data-axis="width" data-width-options='${JSON.stringify(s)}'
                                   data-choice-count="${s.length}">
                        </div>
                    </div>
                `}if(o.length>1){let e=[`normal`,`italic`,`oblique`].filter(e=>o.includes(e));c+=`
                    <div class="axis-control axis-control-style">
                        <span class="axis-label">Style</span>
                        <div class="axis-control-content">
                            <div class="axis-value">${e[0]}</div>
                            <input type="range" id="${t}-style" class="axis-slider axis-slider-style"
                                   min="0" max="${e.length-1}" value="0" step="1"
                                   data-font-id="${t}" data-axis="style" data-style-options='${JSON.stringify(e)}'
                                   data-choice-count="${e.length}">
                        </div>
                    </div>
                `}let l=a.includes(400)?400:a[0],u=o[0],d={condensed:75,"semi-condensed":87.5,normal:100,"semi-wide":112.5,wide:125,expanded:150}[s.includes(`normal`)?`normal`:s[0]]||100,f=e.homepage?`<a href="${e.homepage}" target="_blank" rel="noopener noreferrer" class="font-homepage-link" title="Visit ${e.name} homepage">↗</a>`:``;i+=`
                <div class="font-showcase-item" data-font-index="${n}">
                    <div class="font-header">
                        <h3 class="font-name">${e.name}${f}</h3>
                        ${c?`<div class="font-controls">${c}</div>`:``}
                    </div>
                    <pre class="font-sample" id="${t}-sample"
                         style="font-family: '${e.name}', 'Redacted Script', monospace; font-weight: ${l}; font-style: ${u}; font-stretch: ${d}%;">async function processData(items: Item[]) {
  const results = await Promise.all(items.map(item =>
    fetch(\`/api/\${item.id}\`).then(res => res.json())));
  return results.filter(r => r.status === 'OK');
}</pre>
                </div>
            `}}),e.innerHTML=i,l()}function l(){let e={condensed:75,"semi-condensed":87.5,normal:100,"semi-wide":112.5,wide:125,expanded:150},t=(e,t)=>{document.querySelectorAll(`.axis-slider[data-axis="${e}"]`).forEach(n=>{n.addEventListener(`input`,()=>{let r=JSON.parse(n.dataset[`${e}Options`]||`[]`),i=String(r[parseInt(n.value)]),a=document.getElementById(`${n.dataset.fontId}-sample`),o=n.parentElement?.querySelector(`.axis-value`);a&&t(a,i),o&&(o.textContent=i)})})};t(`weight`,(e,t)=>{e.style.fontWeight=t}),t(`width`,(t,n)=>{t.style.fontStretch=`${e[n]||100}%`}),t(`style`,(e,t)=>{e.style.fontStyle=t})}a(),e(),t(),s();