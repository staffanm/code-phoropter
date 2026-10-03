/** Get an element that the page must contain. */
export function byId<T extends HTMLElement = HTMLElement>(id: string): T {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Missing element #${id}`);
    return el as T;
}

/** Get the first element that matches a selector. The page must contain it. */
export function qs<T extends HTMLElement = HTMLElement>(selector: string): T {
    const el = document.querySelector<T>(selector);
    if (!el) throw new Error(`Missing element ${selector}`);
    return el;
}
