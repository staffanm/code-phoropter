// Query parameters for development:
//   ?dev=1         → enables eager font loading + verbose logs
//   ?eagerFonts=1  → eagerly load all embedded faces (width × weight × style)
//   ?verbose=1     → enable debug logging
export const dev = {
    eagerFonts: false,
    verboseLogs: false,
    tournament: false,
    autoTournament: false,
};

export function initDevConfig(): void {
    const params = new URLSearchParams(window.location.search || '');
    dev.eagerFonts = params.has('eagerFonts') || params.get('dev') === '1';
    dev.verboseLogs = params.has('verbose') || params.get('dev') === '1';
    dev.tournament = params.has('devTournament');
    dev.autoTournament = params.has('autoTournament');
}

export function devLog(...args: unknown[]): void {
    if (dev.verboseLogs) console.log(...args);
}
