// Elements declare their handler with data-action="name" and an optional data-arg="value".
// One delegated listener runs the handler. Checkboxes and selects run it on "change", other elements on "click".
type ActionHandler = (arg: string, element: HTMLElement) => void;

const actions = new Map<string, ActionHandler>();

export function registerActions(handlers: Record<string, ActionHandler>): void {
    Object.entries(handlers).forEach(([name, handler]) => actions.set(name, handler));
}

function usesChangeEvent(element: HTMLElement): boolean {
    return element instanceof HTMLSelectElement
        || (element instanceof HTMLInputElement && element.type === 'checkbox');
}

function dispatch(event: Event): void {
    if (!(event.target instanceof Element)) return;
    const element = event.target.closest<HTMLElement>('[data-action]');
    if (!element) return;
    if (usesChangeEvent(element) !== (event.type === 'change')) return;
    actions.get(element.dataset.action ?? '')?.(element.dataset.arg ?? '', element);
}

export function initActions(): void {
    document.addEventListener('click', dispatch);
    document.addEventListener('change', dispatch);
}
