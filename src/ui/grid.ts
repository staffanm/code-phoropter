import { isComparison } from '../engine';
import type { ComparisonOption } from '../types';
import { byId } from '../dom';
import { getStage } from '../stages';
import { state } from '../state';

// Monospace grid visualization
export function createGridOverlay(panelId: string, font: string, fontSize: number) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    
    // Remove existing grid overlay
    const existingOverlay = panel.querySelector('.grid-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
    
    // Create grid overlay
    const overlay = document.createElement('div');
    overlay.className = 'grid-overlay';
    
    const gridLines = document.createElement('div');
    gridLines.className = 'grid-lines';
    gridLines.style.fontFamily = font;
    gridLines.style.fontSize = fontSize + 'px';
    
    // Generate grid pattern - vertical lines every 8 characters
    const gridPattern = '       |'; // 7 spaces + pipe character = 8 char width
    const lines = [];
    
    // Generate enough lines to fill the panel height
    for (let i = 0; i < 30; i++) { // 30 lines should be more than enough
        let line = '';
        // Generate enough repetitions to fill the panel width 
        for (let j = 0; j < 20; j++) { // 20 * 8 = 160 characters wide
            line += gridPattern;
        }
        lines.push(line);
    }
    
    gridLines.textContent = lines.join('\n');
    overlay.appendChild(gridLines);
    
    // Insert as first child so it appears behind content
    panel.insertBefore(overlay, panel.firstChild);
}


export function updateGridOverlays(optionA: ComparisonOption | null, optionB: ComparisonOption | null, forceVisible: boolean | null = null): void {
    const shouldShowGrid = forceVisible !== null ? forceVisible : state.gridVisible;
    
    if (shouldShowGrid && optionA && optionB) {
        // Use the base font for grid reference
        const baseFont = state.engine.winners?.font || (state.engine.winners?.fontFamily ? state.fontFamilies[state.engine.winners.fontFamily].representative : null) || state.fonts[0];
        const baseFontSize = optionA.fontSize || 16;
        
        // console.log(`[DEBUG] Showing grid overlays with base font: ${baseFont} at ${baseFontSize}px`);
        createGridOverlay('panelA', baseFont, baseFontSize);
        createGridOverlay('panelB', baseFont, baseFontSize);
    } else {
        // Remove grid overlays
        console.log(`[DEBUG] Hiding grid overlays`);
        ['panelA', 'panelB'].forEach(panelId => {
            const panel = document.getElementById(panelId);
            const overlay = panel?.querySelector('.grid-overlay');
            if (overlay) {
                overlay.remove();
            }
        });
    }
}


export function initializeGridForStage(stage: string) {
    const stageObj = getStage(stage);
    if (stageObj && typeof stageObj.showGrid === 'boolean') {
        state.gridVisible = stageObj.showGrid;
    }
}


export function toggleGrid() {
    state.gridVisible = !state.gridVisible;
    console.log(`[DEBUG] Grid toggle: ${state.gridVisible ? 'ON' : 'OFF'}`);
    
    // Get current comparison options
    const comparison = state.engine.getNextComparison();
    if (isComparison(comparison)) {
        updateGridOverlays(comparison.optionA, comparison.optionB, state.gridVisible);
    }
    
    // Show temporary feedback
    const status = byId('status');
    const originalText = status.textContent;
    status.textContent = `Grid overlay: ${state.gridVisible ? 'ON' : 'OFF'} (press 'g' to toggle)`;
    setTimeout(() => {
        status.textContent = originalText;
    }, 2000);
}
