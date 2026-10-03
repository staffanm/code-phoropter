import type { Choice, ColorScheme, Comparison, ComparisonOption, RoleCandidate, ThemeMode, Winners } from './types';
import { data } from './data';
import { multiFontPresets } from './font-roles';
import { fontSizes, fontWeights, letterSpacings, lineHeights } from './constants';
import { devLog } from './dev';
import { partitionFontCandidates } from './fonts/detect';
import { fontSimilarity } from './fonts/similarity';
import { applyRoleFonts, getRoleCandidates } from './roles';
import { STAGES, getNextValidStageIndex, getStage, getStageIndex, logStageOutcome, stageToRoleKey } from './stages';
import { state } from './state';

// Removed toggleRoleInfo; '?' should not affect roles panel

// Tournament-style comparison generator
/** True when the engine returned a pair of options to compare. */
export function isComparison(next: Comparison | { showFontFamilySelector: true } | null): next is Comparison {
    return !!next && 'optionA' in next;
}

export type Candidate = string | number | ColorScheme;
type Pair = [Candidate, Candidate | null];

export class ComparisonEngine {
    stage = 'fontFamily';
    fontRound = 0; // Which round we are in for similarity-based pairing
    fontRoundComplete = false;
    candidates: Record<string, Candidate[]> = {};
    currentPairs: Pair[] = [];
    nextRound: Candidate[] | null = null;
    winners: Winners = { roles: {} };
    fontFamilySelectionMode = true;
    stageComparisons: Record<string, number> = {}; // Comparisons made per stage
    preferredColorSchemes: ColorScheme[] = []; // The user's color preferences
    currentRoleTournament: RoleTournament | null = null;
    currentRolePair: [RoleCandidate, RoleCandidate] | null = null;
    complete = false;
    recompareMode = false;
    recompareStage: string | null = null;
    recompareResults: Winners | null = null;
    private roleKey: string | null = null;

    constructor() {
        this.reset();
    }

    /** Store the winner of a stage. Role stages store their winners in `winners.roles`. */
    setWinner(stage: string, value: Candidate | null | undefined): void {
        (this.winners as unknown as Record<string, unknown>)[stage] = value;
    }

    getWinner(stage: string): Candidate | RoleCandidate | null | undefined {
        return (this.winners as unknown as Record<string, Candidate | null | undefined>)[stage];
    }

    reset(): void {
        this.stage = 'fontFamily';
        this.fontRound = 0; // Reset font round counter
        this.candidates = {
            fontFamily: Object.keys(state.fontFamilies), // Will show all at once, not tournament
            colorScheme: [...(data.colorSchemeDatabase[state.themeMode] || [])],
            font: [], // Will be populated after family selection
            size: [...fontSizes],
            weight: [...fontWeights],
            lineHeight: [...lineHeights],
            fontWidth: [], // Will be populated dynamically based on font support
            letterSpacing: [...letterSpacings]
        };
        this.currentPairs = [];
        this.winners = { roles: {} };
        this.fontFamilySelectionMode = true; // New flag for special handling
        this.stageComparisons = {}; // Track comparisons made per stage
        this.preferredColorSchemes = []; // Track user's color preferences
        this.currentRoleTournament = null;
        this.currentRolePair = null;
        this.generateNextStage();
    }

    prepareFontCandidates(familyName = this.winners.fontFamily): void {
        if (!familyName) return;
        const family = state.fontFamilies[familyName];
        if (!family || !Array.isArray(family.fonts)) return;

        const partition = partitionFontCandidates(family.fonts);
        const preferred = partition.available.length > 0 ? partition.available : partition.webOnly;
        const fallback = preferred.length > 0 ? preferred : partition.usable;
        this.candidates.font = fallback.map(meta => meta.css);

        devLog(`[DEBUG] Prepared fonts for family '${familyName}': ${this.candidates.font.length} candidates`);
    }

    disqualifyFont(cssString: string): void {
        if (!cssString) return;

        const stripFrom = (arr: (Candidate | Pair)[]) => {
            for (let i = arr.length - 1; i >= 0; i--) {
                const entry = arr[i];
                if (entry === cssString) {
                    arr.splice(i, 1);
                } else if (Array.isArray(entry) && (entry[0] === cssString || entry[1] === cssString)) {
                    arr.splice(i, 1);
                }
            }
        };

        stripFrom(this.candidates.font);
        stripFrom(this.currentPairs);
        if (Array.isArray(this.nextRound)) {
            this.nextRound = this.nextRound.filter(item => item !== cssString);
        }
        if (this.winners.font === cssString) {
            this.winners.font = null;
        }
    }
    
    generateNextStage(): void {
        const stageIndex = getStageIndex(this.stage);
        
        devLog(`[DEBUG] generateNextStage: stage=${this.stage}, candidates=${this.candidates[this.stage]?.length}, stageIndex=${stageIndex}`);
        
        // Role stages are handled by the role tournament path in getNextComparison.
        // Avoid touching generic candidates for role* stages (no candidate arrays exist).
        if (this.stage && this.stage.startsWith('role')) {
            this.currentPairs = [];
            return;
        }

        if (stageIndex === -1 || this.candidates[this.stage].length <= 1) {
            const nextIndex = getNextValidStageIndex(stageIndex);
            if (nextIndex < STAGES.length) {
                this.setWinner(this.stage, this.candidates[this.stage][0]);
                this.stage = STAGES[nextIndex].id;
                
                if (this.stage === 'font' && this.winners.fontFamily) {
                    this.prepareFontCandidates(this.winners.fontFamily);
                }

                this.generateNextStage();
            } else {
                this.setWinner(this.stage, this.candidates[this.stage][0]);
                this.complete = true;
                // After tournament completes (end of last stage), no-op here
            }
            return;
        }
        
        // For font stage, use similarity-based progressive pairing
        if (this.stage === 'font' && this.candidates.font.length > 4) {
            this.fontRound++;
            devLog(`[DEBUG] Font tournament round ${this.fontRound}`);
            
            // Use similarity-based pairing for fonts
            const smartPairs = fontSimilarity.generateProgressivePairs(
                this.candidates[this.stage] as string[],
                this.fontRound
            );
            
            this.currentPairs = [];
            
            if (smartPairs.length > 0) {
                // Use smart pairs
                for (const [fontA, fontB] of smartPairs) {
                    this.currentPairs.push([fontA, fontB]);
                    devLog(`[DEBUG] Smart pair: ${fontSimilarity.calculate(fontA, fontB).toFixed(1)}% similar`);
                }
            } else {
                // Fallback to random pairing if no smart pairs found
                const items = [...this.candidates[this.stage]];
                while (items.length > 1) {
                    const indexA = Math.floor(Math.random() * items.length);
                    const itemA = items.splice(indexA, 1)[0];
                    const indexB = Math.floor(Math.random() * items.length);
                    const itemB = items.splice(indexB, 1)[0];
                    this.currentPairs.push([itemA, itemB]);
                }
                
                // If odd number, the remaining item advances
                if (items.length === 1) {
                    this.currentPairs.push([items[0], null]);
                }
            }
            
            // Mark that we should stop after this round if we have few candidates left
            this.fontRoundComplete = this.candidates.font.length <= 6;
        } else {
            this.currentPairs = [];
            const items = [...this.candidates[this.stage]];
            
            // Create pairs for comparison
            while (items.length > 1) {
                const indexA = Math.floor(Math.random() * items.length);
                const itemA = items.splice(indexA, 1)[0];
                const indexB = Math.floor(Math.random() * items.length);
                const itemB = items.splice(indexB, 1)[0];
                this.currentPairs.push([itemA, itemB]);
            }
            
            // If odd number, the remaining item advances automatically
            if (items.length === 1) {
                this.currentPairs.push([items[0], null]);
            }
        }
    }
    
    getNextComparison(): Comparison | { showFontFamilySelector: true } | null {
        console.log(`[DEBUG] getNextComparison: stage=${this.stage}, complete=${this.complete}, currentPairs=${this.currentPairs.length}`);
        
        if (this.complete) {
            return null;
        }
        
        // Special handling for font family selection - show all at once instead of comparisons
        if (this.stage === 'fontFamily' && this.fontFamilySelectionMode) {
            return { showFontFamilySelector: true };
        }

        // Helper: default scheme by theme
        function getDefaultScheme(mode: ThemeMode): ColorScheme | null {
            const list = data.colorSchemeDatabase[mode] || [];
            const want = mode === 'dark' ? 'Monokai' : 'Catppuccin Latte';
            return list.find(s => s.name === want) || list[0] || null;
        }

        // Role stages integration (handle before generic pairing/round logic)
        const isRoleStage = this.stage && this.stage.startsWith('role');
        if (isRoleStage) {
            const roleKey = stageToRoleKey(this.stage) ?? this.stage;
            if (!this.currentRoleTournament || this.roleKey !== roleKey) {
                const cands = getRoleCandidates(roleKey, this.stage).slice(0, 8);
                this.currentRoleTournament = new RoleTournament(roleKey, cands);
                this.roleKey = roleKey;
            }
            const pair = this.currentRoleTournament.nextPair();
            if (!pair) {
                // Commit winner and advance
                const winner = this.currentRoleTournament.getWinner();
                if (winner) {
                    this.winners.roles[roleKey] = winner;
                    try { applyRoleFonts(this.winners.roles); } catch {}
                }
                const stageId = this.stage;
                const comparisons = this.stageComparisons?.[stageId];
                logStageOutcome(stageId, winner || null, comparisons, { reason: 'completed' });
                this.currentRoleTournament = null;
                // Advance stage
                const idx = getStageIndex(this.stage);
                const nextIndex = getNextValidStageIndex(idx);
                if (idx >= 0 && nextIndex < STAGES.length) {
                    this.stage = STAGES[nextIndex].id;
                    this.generateNextStage();
                    return this.getNextComparison();
                }
                this.complete = true;
                return null;
            }
            this.currentRolePair = pair;
            const baseOption: ComparisonOption = {
                font: this.winners.font || (this.winners.fontFamily ? state.fontFamilies[this.winners.fontFamily].representative : null) || state.fonts[0],
                fontSize: this.winners.size || 16,
                fontWeight: this.winners.weight || 400,
                lineHeight: this.winners.lineHeight || 1.5,
                fontWidth: this.winners.fontWidth || 'normal',
                letterSpacing: this.winners.letterSpacing || 0,
                colorScheme: this.winners.colorScheme || getDefaultScheme(state.themeMode)
            };
            console.log('[DEBUG] Role stage baseOption colorScheme:', baseOption.colorScheme?.name);
            const optionA = { ...baseOption };
            const optionB = { ...baseOption };
            console.log('[DEBUG] After spread - optionA colorScheme:', optionA.colorScheme?.name, 'optionB colorScheme:', optionB.colorScheme?.name);

            // Get candidate info
            const candA = pair[0];
            const candB = pair[1];

            // For role stages, DO NOT modify optionA/optionB
            // The role fonts will be applied via CSS in applyRoleCompareStyles
            // Only pass the candidate info to roleTest

            return {
                optionA,
                optionB,
                stage: this.stage,
                roleTest: {
                    role: roleKey,
                    aFont: candA.font,
                    bFont: candB.font,
                    aWeight: candA.weight,
                    aStyle: candA.style,
                    bWeight: candB.weight,
                    bStyle: candB.style,
                    aCandidate: candA,
                    bCandidate: candB
                }
            };
        }
        
        if (this.currentPairs.length === 0) {
            // Round is complete, check what to do next
            if (this.nextRound && this.nextRound.length > 0) {
                console.log(`[DEBUG] Round complete: nextRound=${this.nextRound.length} candidates`);
                
                // Check if we have a winner AND have made minimum comparisons
                const minComparisons = getStage(this.stage)?.minComparisons || 2;
                const comparisons = this.stageComparisons[this.stage] || 0;
                const hasWinner = this.nextRound.length <= 1;
                const hasMinComparisons = comparisons >= minComparisons;
                
                // Get winner name for debug logging
                let winnerName = 'none';
                if (hasWinner && this.nextRound.length > 0) {
                    const winner = this.nextRound[0];
                    if (typeof winner === 'object') {
                        winnerName = winner.name;
                    } else if (typeof winner === 'string' && this.stage !== 'fontFamily') {
                        winnerName = winner.replace(/"/g, '').split(',')[0];
                    } else {
                        winnerName = String(winner);
                    }
                }
                
                console.log(`[DEBUG] Stage completion check: ${this.stage}, winner=${hasWinner ? winnerName : 'none'}, comparisons=${comparisons}/${minComparisons}, canAdvance=${hasWinner && hasMinComparisons}`);
                
                // If we have a winner AND have made minimum comparisons, move to next stage
                if (hasWinner && hasMinComparisons) {
                    const stageIndex = getStageIndex(this.stage);
                    const stageId = this.stage;
                    const winnerValue = this.nextRound && this.nextRound.length > 0 ? this.nextRound[0] : null;
                    logStageOutcome(stageId, winnerValue, comparisons, { reason: 'completed' });
                    const nextIndex = getNextValidStageIndex(stageIndex);
                    if (nextIndex < STAGES.length) {
                        this.setWinner(stageId, winnerValue);
                        this.stage = STAGES[nextIndex].id;
                        
                        // Special handling: when font family is chosen, populate fonts from that family
                        if (this.stage === 'font' && this.winners.fontFamily) {
                            this.prepareFontCandidates(this.winners.fontFamily);
                        }
                        
                        this.nextRound = null; // Reset for next stage
                        this.generateNextStage();
                        return this.getNextComparison();
                    } else {
                        this.setWinner(stageId, winnerValue);
                        
                        // If in recompare mode, restore other settings and complete
                        if (this.recompareMode) {
                            Object.assign(this.winners, this.recompareResults);
                            if (this.recompareStage) this.setWinner(this.recompareStage, winnerValue);
                            this.recompareMode = false;
                        }
                        
                        this.complete = true;
                        return null;
                    }
                } else if (!hasMinComparisons) {
                    // Haven't made minimum comparisons yet - continue with more rounds
                    console.log(`[DEBUG] Need more comparisons in ${this.stage}: ${comparisons}/${minComparisons}`);
                    
                    // For color schemes, use smart similarity-based selection
                    if (this.stage === 'colorScheme' && getStage(this.stage)?.useSmartGrouping && this.preferredColorSchemes.length > 0) {
                        this.candidates[this.stage] = this.getSimilarColorSchemes();
                        console.log(`[DEBUG] Selected similar color schemes: ${this.candidates[this.stage].length} candidates`);
                    } else {
                        // Continue tournament with winners from this round
                        this.candidates[this.stage] = [...this.nextRound];
                    }
                    
                    this.nextRound = [];
                    this.generateNextStage();
                    return this.getNextComparison();
                } else {
                    // Continue tournament with winners from this round
                    this.candidates[this.stage] = [...this.nextRound];
                    this.nextRound = [];
                    this.generateNextStage();
                    return this.getNextComparison();
                }
            } else {
                // No nextRound yet, handle normally (shouldn't happen with new logic)
                this.generateNextStage();
                return this.getNextComparison();
            }
        }
        
        const pair = this.currentPairs[0];
        console.log(`[DEBUG] Getting pair: ${JSON.stringify(pair)}`);
        if (!pair) {
            console.error('[ERROR] No pair found despite currentPairs.length > 0');
            console.error('[ERROR] currentPairs:', this.currentPairs);
            return null;
        }
        if (pair[1] === null) {
            // Auto-advance
            this.candidates[this.stage] = [pair[0], ...this.candidates[this.stage]];
            this.currentPairs.shift();
            return this.getNextComparison();
        }

        // Build comparison options
        const baseOption: ComparisonOption = {
            font: this.winners.font || (this.winners.fontFamily ? state.fontFamilies[this.winners.fontFamily].representative : null) || state.fonts[0],
            fontSize: this.winners.size || 16,
            fontWeight: this.winners.weight || 400,
            lineHeight: this.winners.lineHeight || 1.5,
            fontWidth: this.winners.fontWidth || 'normal',
            letterSpacing: this.winners.letterSpacing || 0,
            colorScheme: this.winners.colorScheme || getDefaultScheme(state.themeMode)
        };
        
        const optionA = { ...baseOption };
        const optionB = { ...baseOption };
        
        switch (this.stage) {
            case 'colorScheme':
                optionA.colorScheme = pair[0] as ColorScheme;
                optionB.colorScheme = pair[1] as ColorScheme;
                break;
            case 'font':
                optionA.font = pair[0] as string;
                optionB.font = pair[1] as string;
                break;
            case 'size':
                optionA.fontSize = pair[0] as number;
                optionB.fontSize = pair[1] as number;
                break;
            case 'weight':
                optionA.fontWeight = pair[0] as number;
                optionB.fontWeight = pair[1] as number;
                break;
            case 'lineHeight':
                optionA.lineHeight = pair[0] as number;
                optionB.lineHeight = pair[1] as number;
                break;
            case 'fontWidth':
                optionA.fontWidth = pair[0] as string;
                optionB.fontWidth = pair[1] as string;
                break;
            case 'letterSpacing':
                optionA.letterSpacing = pair[0] as number;
                optionB.letterSpacing = pair[1] as number;
                break;
        }
        
        // Check if the two options are actually identical
        if (this.areOptionsIdentical(optionA, optionB)) {
            // Skip this comparison - randomly pick one and continue
            this.candidates[this.stage].push(Math.random() > 0.5 ? pair[0] : pair[1]);
            this.currentPairs.shift();
            return this.getNextComparison();
        }
        
        // Add similarity information for font comparisons
        let similarityInfo = null;
        if (this.stage === 'font') {
            const similarity = fontSimilarity.calculate(pair[0] as string, pair[1] as string);
            const category = fontSimilarity.categorize(similarity);
            similarityInfo = {
                score: similarity,
                category: category,
                round: this.fontRound
            };
        }
        
        const result = { optionA, optionB, stage: this.stage, pair, similarity: similarityInfo };
        return result;
    }
    
    // Helper method to check if two options are visually identical
    areOptionsIdentical(optionA: ComparisonOption, optionB: ComparisonOption): boolean {
        return optionA.font === optionB.font &&
               optionA.fontSize === optionB.fontSize &&
               optionA.fontWeight === optionB.fontWeight &&
               optionA.lineHeight === optionB.lineHeight &&
               optionA.fontWidth === optionB.fontWidth &&
               optionA.letterSpacing === optionB.letterSpacing &&
               JSON.stringify(optionA.colorScheme) === JSON.stringify(optionB.colorScheme);
    }
    
    // New method to handle font family selection
    selectFontFamily(familyName: string): void {
        this.winners.fontFamily = familyName;
        this.fontFamilySelectionMode = false;
        this.stage = 'font';
        this.prepareFontCandidates(familyName);
        this.generateNextStage();
    }
    
    submitChoice(choice: Choice): void {
        // Handle role stages
        if (this.stage && this.stage.startsWith('role')) {
            if (this.currentRoleTournament && this.currentRolePair) {
                const [a, b] = this.currentRolePair;
                this.currentRoleTournament.recordResult(a, b, choice === 'equal' ? 'equal' : (choice === 'A' ? 'A' : 'B'));
                // Clear pair; next call to getNextComparison will fetch next
                this.currentRolePair = null;
            }
            return;
        }
        if (this.currentPairs.length === 0) return;
        
        const pair = this.currentPairs.shift() as [Candidate, Candidate];
        console.log(`[DEBUG] submitChoice: stage=${this.stage}, choice=${choice}, remaining pairs=${this.currentPairs.length}, candidates=${this.candidates[this.stage].length}`);
        
        // Track comparisons made in this stage
        this.stageComparisons[this.stage] = (this.stageComparisons[this.stage] || 0) + 1;
        
        // Initialize nextRound array if it doesn't exist
        if (!this.nextRound) {
            this.nextRound = [];
        }
        
        let winner: Candidate;
        // Add winner to next round, not back to current candidates
        if (choice === 'A') {
            winner = pair[0];
            this.nextRound.push(pair[0]);
        } else if (choice === 'B') {
            winner = pair[1];
            this.nextRound.push(pair[1]);
        } else {
            // Equal preference - randomly advance one
            winner = Math.random() > 0.5 ? pair[0] : pair[1];
            this.nextRound.push(winner);
        }
        
        // For color schemes, track user preferences for similarity-based learning
        if (this.stage === 'colorScheme' && choice !== 'equal') {
            const scheme = winner as ColorScheme;
            this.preferredColorSchemes.push(scheme);
            console.log(`[DEBUG] Color preference learned: ${scheme.name}`);
        }
        
        console.log(`[DEBUG] After choice: nextRound=${this.nextRound.length}, remaining pairs=${this.currentPairs.length}, stage comparisons=${this.stageComparisons[this.stage]}`);
    }
    
    getSimilarColorSchemes(): ColorScheme[] {
        // Find schemes similar to user's preferred ones
        const allSchemes = [...(data.colorSchemeDatabase[state.themeMode] || [])];
        const similarSchemes = new Set<ColorScheme>();
        
        // Add schemes similar to each preferred scheme
        for (const preferred of this.preferredColorSchemes) {
            for (const scheme of allSchemes) {
                if (scheme === preferred) continue;
                
                const distance = schemeDistance(preferred, scheme);
                if (distance < 100) { // Similarity threshold
                    similarSchemes.add(scheme);
                }
            }
        }
        
        // Convert to array and add some random ones to maintain variety
        let result = [...similarSchemes];
        const remaining = allSchemes.filter(s => !similarSchemes.has(s) && !this.preferredColorSchemes.includes(s));
        
        // Add 2-3 random different schemes to maintain diversity
        while (result.length < 8 && remaining.length > 0) {
            const randomIndex = Math.floor(Math.random() * remaining.length);
            result.push(remaining.splice(randomIndex, 1)[0]);
        }
        
        return result.slice(0, 8); // Limit to reasonable number
    }
    
    getProgress(): number {
        const stageIndex = getStageIndex(this.stage);
        const totalStages = STAGES.length;
        const baseProgress = (stageIndex / totalStages) * 100;
        
        // Add within-stage progress
        const candidateCount = this.candidates[this.stage] ? this.candidates[this.stage].length : 0;
        const stageItems = candidateCount + this.currentPairs.length;
        const stageProgress = stageItems > 0 ? 
            (1 - (this.currentPairs.length / stageItems)) * (100 / totalStages) : 0;
        
        return Math.min(baseProgress + stageProgress, 95);
    }
}


function hexToRgb(hex: string): [number, number, number] {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const n = parseInt(full.slice(0, 6), 16) || 0;
    return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

function colorDistance(a: string, b: string): number {
    const [r1, g1, b1] = hexToRgb(a);
    const [r2, g2, b2] = hexToRgb(b);
    return Math.hypot(r1 - r2, g1 - g2, b1 - b2);
}

// Distance between two color schemes: RGB distance of the backgrounds plus RGB distance of the foregrounds
function schemeDistance(a: ColorScheme, b: ColorScheme): number {
    return colorDistance(a.bg, b.bg) + colorDistance(a.fg, b.fg);
}

// Simple per-role tournament engine
interface TournamentState {
    phase: 'swiss' | 'finals';
    roundIndex: number;
    totalRounds: number;
    finals: { a: RoleCandidate; b: RoleCandidate; aWins: number; bWins: number } | null;
}

export class RoleTournament {
    role: string;
    candidates: RoleCandidate[];
    scores: Map<RoleCandidate, number>;
    state: TournamentState;
    pairs: [RoleCandidate, RoleCandidate][] = [];

    constructor(role: string, candidates: RoleCandidate[]) {
        this.role = role;
        // Cap and dedupe candidates for speed
        const unique = Array.from(new Set(candidates)).slice(0, 8);
        this.candidates = unique;
        this.scores = new Map(unique.map(c => [c, 0]));
        this.state = { phase: 'swiss', roundIndex: 0, totalRounds: Math.min(3, Math.max(2, Math.ceil(unique.length / 2))), finals: null };
        this.buildSwissPairs();
    }

    private addScore(candidate: RoleCandidate, points: number): void {
        this.scores.set(candidate, (this.scores.get(candidate) ?? 0) + points);
    }

    private ranked(): RoleCandidate[] {
        return [...this.scores.entries()].sort((x, y) => y[1] - x[1]).map(([candidate]) => candidate);
    }

    private buildSwissPairs(): void {
        const order = [...this.candidates];
        for (let i = order.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [order[i], order[j]] = [order[j], order[i]];
        }
        this.pairs = [];
        for (let i = 0; i < order.length - 1; i += 2) {
            this.pairs.push([order[i], order[i + 1]]);
        }
        if (order.length % 2 === 1) {
            // Bye: last one gets 0.5
            this.addScore(order[order.length - 1], 0.5);
        }
    }

    nextPair(): [RoleCandidate, RoleCandidate] | null {
        if (this.state.finals) {
            const { a, b, aWins, bWins } = this.state.finals;
            if (aWins >= 2 || bWins >= 2) return null;
            return [a, b];
        }
        if (this.pairs.length === 0) {
            // Round complete
            this.state.roundIndex++;
            if (this.state.roundIndex >= this.state.totalRounds) {
                // Move to finals: top 2
                const [a, b] = this.ranked();
                if (!a || !b) return null;
                this.state.phase = 'finals';
                this.state.finals = { a, b, aWins: 0, bWins: 0 };
                return [a, b];
            }
            this.buildSwissPairs();
        }
        return this.pairs.shift() || null;
    }

    recordResult(a: RoleCandidate, b: RoleCandidate, choice: Choice): void {
        const f = this.state.finals;
        if (f) {
            if (choice === 'A') f.aWins++; else if (choice === 'B') f.bWins++; else { f.aWins += 0.5; f.bWins += 0.5; }
            return;
        }
        if (choice === 'A') this.addScore(a, 1);
        else if (choice === 'B') this.addScore(b, 1);
        else { this.addScore(a, 0.5); this.addScore(b, 0.5); }
    }

    getWinner(): RoleCandidate | null {
        if (this.state.finals) {
            const { a, b, aWins, bWins } = this.state.finals;
            return bWins > aWins ? b : a;
        }
        // If finals never reached, pick highest score
        return this.ranked()[0] || null;
    }
}
