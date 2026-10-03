import { byId } from '../dom';
import { state } from '../state';

// Toggle slider compare mode
export function toggleSliderCompare() {
    const toggle = byId<HTMLInputElement>('sliderCompareToggle');
    const container = byId('comparisonContainer');
    const divider = byId('sliderDivider');

    state.sliderCompareMode = toggle.checked;

    if (state.sliderCompareMode) {
        container.classList.add('slider-compare-mode');
        divider.style.display = 'block';
        updateSliderPosition(state.sliderPosition);
    } else {
        container.classList.remove('slider-compare-mode');
        divider.style.display = 'none';
        // Reset panel B clipping
        const panelB = byId('panelB');
        panelB.style.clipPath = '';
    }
}


// The area that the two stacked panels cover in slider compare mode.
// The stylesheet sets its size, which depends on the screen width.
function panelArea(): DOMRect {
    return byId('panelA').getBoundingClientRect();
}

// Update slider divider position and panel clipping
export function updateSliderPosition(percentage: number) {
    state.sliderPosition = Math.max(5, Math.min(95, percentage)); // Enforce 5%-95% limits

    const container = byId('comparisonContainer');
    const divider = byId('sliderDivider');
    const panelB = byId('panelB');

    if (state.sliderCompareMode) {
        // Position divider within the panel area
        const panel = panelArea();
        const containerLeft = container.getBoundingClientRect().left;
        divider.style.left = `${panel.left - containerLeft + (state.sliderPosition / 100) * panel.width}px`;

        // Clip panel B to show only the right portion from the divider
        panelB.style.clipPath = `inset(0 0 0 ${state.sliderPosition}%)`;
    }
}


// Initialize scroll synchronization between panels
export function initScrollSync() {
    const codeA = document.getElementById('codeA');
    const codeB = document.getElementById('codeB');

    if (!codeA || !codeB) return;

    let isScrollingSynced = false; // Flag to prevent infinite loops

    function syncScroll(sourceElement: HTMLElement, targetElement: HTMLElement) {
        if (isScrollingSynced) return; // Prevent recursive calls

        isScrollingSynced = true;

        // Get the scrollable parent (the <pre> element)
        const sourceScrollable = sourceElement.closest('pre');
        const targetScrollable = targetElement.closest('pre');

        if (sourceScrollable && targetScrollable) {
            targetScrollable.scrollTop = sourceScrollable.scrollTop;
            targetScrollable.scrollLeft = sourceScrollable.scrollLeft;
        }

        // Reset flag after a short delay to allow for smooth scrolling
        setTimeout(() => {
            isScrollingSynced = false;
        }, 10);
    }

    // Add scroll listeners to the pre elements containing the code
    const preA = codeA.closest('pre');
    const preB = codeB.closest('pre');

    if (preA && preB) {
        preA.addEventListener('scroll', () => {
            syncScroll(codeA, codeB);
        });

        preB.addEventListener('scroll', () => {
            syncScroll(codeB, codeA);
        });
    }
}


// Initialize slider divider drag functionality
export function initSliderDivider() {
    const divider = byId('sliderDivider');
    const container = byId('comparisonContainer');
    let isDragging = false;
    let dragOffset = 0;

    // Mouse events
    divider.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);

    // Touch events
    divider.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', endDrag);

    // The panel area changes with the window size and the screen orientation
    window.addEventListener('resize', () => updateSliderPosition(state.sliderPosition));

    // Double-click to reset to center
    divider.addEventListener('dblclick', function(e) {
        e.preventDefault();
        updateSliderPosition(50);
    });

    function clientXOf(e: MouseEvent | TouchEvent): number {
        return 'touches' in e ? e.touches[0].clientX : e.clientX;
    }

    function startDrag(e: MouseEvent | TouchEvent) {
        if (!state.sliderCompareMode) return;

        isDragging = true;
        const panel = panelArea();
        const currentPos = ((state.sliderPosition / 100) * panel.width) + panel.left;
        dragOffset = clientXOf(e) - currentPos;

        e.preventDefault();
        document.body.style.cursor = 'ew-resize';
        divider.classList.add('dragging');
    }

    function drag(e: MouseEvent | TouchEvent) {
        if (!isDragging || !state.sliderCompareMode) return;

        // Calculate position within the panel area
        const panel = panelArea();
        const containerLeft = container.getBoundingClientRect().left;
        const relativeX = clientXOf(e) - dragOffset - panel.left;
        const percentage = Math.max(5, Math.min(95, (relativeX / panel.width) * 100));

        // Update position and clipping immediately without going through updateSliderPosition
        state.sliderPosition = percentage;
        const dividerLeft = panel.left - containerLeft + (percentage / 100) * panel.width;
        divider.style.left = `${dividerLeft}px`;

        // Update clipping with optimized clip-path (using requestAnimationFrame for smooth updates)
        requestAnimationFrame(() => {
            const panelB = byId('panelB');
            panelB.style.clipPath = `inset(0 0 0 ${percentage}%)`;
        });

        e.preventDefault();
    }

    function endDrag(e: Event) {
        if (!isDragging) return;

        isDragging = false;
        document.body.style.cursor = '';
        divider.classList.remove('dragging');
        e.preventDefault();
    }
}
