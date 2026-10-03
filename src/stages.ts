import type { ColorScheme, RoleCandidate, Stage } from './types';

type StageWinner = string | number | ColorScheme | RoleCandidate | null | undefined;
import { extractFontNameFromCss } from './fonts/detect';
import { state } from './state';

// Color similarity functions
// (removed duplicate color similarity helper set)

// Color similarity functions
// (removed duplicate color similarity helper set)


export const STAGES: Stage[] = [
    {
        id: 'fontFamily',
        name: 'Font Style',
        description: 'Choose the font family that best suits your coding style and visual preferences.',
        skippable: false,
        minComparisons: 1,
        showGrid: false  // No grid for font family selection
    },
    {
        id: 'font',
        name: 'Specific Font',
        description: 'Compare specific fonts within your chosen family to find the perfect variant.',
        skippable: true,
        minComparisons: 4,
        showGrid: true  // Show grid to verify monospace consistency
    },
    {
        id: 'colorScheme',
        name: 'Color Scheme',
        description: 'Selecting the right color scheme for your particular display resolution, distance, lighting conditions and aesthetic preferences can improve scannability and legibility significantly.',
        skippable: true,
        minComparisons: 6,
        useSmartGrouping: true,
        showGrid: true  // Show grid to assess readability with colors
    },
    {
        id: 'size',
        name: 'Font Size',
        description: 'Find the optimal font size for comfortable reading and reduced eye strain.',
        skippable: true,
        minComparisons: 3,
        showGrid: true  // Show grid to assess character spacing
    },
    {
        id: 'weight',
        name: 'Font Weight',
        description: 'Adjust the base font weight for better readability and visual hierarchy.',
        skippable: true,
        minComparisons: 4,
        showGrid: true  // Show grid to assess visual density
    },
    {
        id: 'lineHeight',
        name: 'Line Height',
        description: 'Optimize line spacing for improved code readability and visual flow.',
        skippable: true,
        minComparisons: 4,
        showGrid: true  // Show grid to assess vertical alignment
    },
    {
        id: 'fontWidth',
        name: 'Font Width',
        description: 'Adjust character width for better code density and horizontal space usage.',
        skippable: true,
        minComparisons: 3,
        showGrid: true  // Show grid to assess width consistency
    },
    {
        id: 'letterSpacing',
        name: 'Letter Spacing',
        description: 'Fine-tune character spacing for optimal readability and visual comfort.',
        skippable: true,
        minComparisons: 3,
        showGrid: true  // Show grid to assess character spacing
    },
    {
        id: 'roleComments',
        name: 'Comments Weight/Style',
        description: 'Choose the weight and style for comments - often benefits from lighter or italic styling.',
        skippable: true,
        minComparisons: 1,
        showGrid: true
    },
    {
        id: 'roleStrings',
        name: 'Strings Weight/Style',
        description: 'Choose the weight and style for string literals.',
        skippable: true,
        minComparisons: 1,
        showGrid: true
    },
    {
        id: 'roleLiterals',
        name: 'Literals Weight/Style',
        description: 'Choose the weight and style for numeric and other literals.',
        skippable: true,
        minComparisons: 1,
        showGrid: true
    },
    {
        id: 'roleKeywords',
        name: 'Keywords Weight/Style',
        description: 'Choose the weight and style for language keywords (if, while, return, class).',
        skippable: true,
        minComparisons: 1,
        showGrid: true
    },
    {
        id: 'roleFunction',
        name: 'Function Names Weight/Style',
        description: 'Choose the weight and style for function and method names.',
        skippable: true,
        minComparisons: 1,
        showGrid: true
    },
    {
        id: 'roleVariable',
        name: 'Variable Names Weight/Style',
        description: 'Choose the weight and style for variable names.',
        skippable: true,
        minComparisons: 1,
        showGrid: true
    },
    {
        id: 'roleType',
        name: 'Type/Class Names Weight/Style',
        description: 'Choose the weight and style for type and class names.',
        skippable: true,
        minComparisons: 1,
        showGrid: true
    },
    {
        id: 'roleOperator',
        name: 'Operators Weight/Style',
        description: 'Choose the weight and style for arithmetic and logical operators.',
        skippable: true,
        minComparisons: 1,
        showGrid: true
    },
    {
        id: 'roleGhost',
        name: 'AI Suggestions Weight/Style',
        description: 'Choose the weight and style for AI suggestions and ghost text.',
        skippable: true,
        minComparisons: 1,
        showGrid: true
    },
    {
        id: 'roleFontComments',
        name: 'Comments Font',
        description: 'Choose a unique font for comments.',
        skippable: true,
        minComparisons: 1,
        showGrid: true,
        requiresUniqueRoleFonts: true
    },
    {
        id: 'roleFontStrings',
        name: 'Strings Font',
        description: 'Choose a unique font for string literals.',
        skippable: true,
        minComparisons: 1,
        showGrid: true,
        requiresUniqueRoleFonts: true
    },
    {
        id: 'roleFontLiterals',
        name: 'Literals Font',
        description: 'Choose a unique font for numeric and other literals.',
        skippable: true,
        minComparisons: 1,
        showGrid: true,
        requiresUniqueRoleFonts: true
    },
    {
        id: 'roleFontKeywords',
        name: 'Keywords Font',
        description: 'Choose a unique font for language keywords.',
        skippable: true,
        minComparisons: 1,
        showGrid: true,
        requiresUniqueRoleFonts: true
    },
    {
        id: 'roleFontFunction',
        name: 'Function Names Font',
        description: 'Choose a unique font for function and method names.',
        skippable: true,
        minComparisons: 1,
        showGrid: true,
        requiresUniqueRoleFonts: true
    },
    {
        id: 'roleFontVariable',
        name: 'Variable Names Font',
        description: 'Choose a unique font for variable names.',
        skippable: true,
        minComparisons: 1,
        showGrid: true,
        requiresUniqueRoleFonts: true
    },
    {
        id: 'roleFontType',
        name: 'Type/Class Names Font',
        description: 'Choose a unique font for type and class names.',
        skippable: true,
        minComparisons: 1,
        showGrid: true,
        requiresUniqueRoleFonts: true
    },
    {
        id: 'roleFontOperator',
        name: 'Operators Font',
        description: 'Choose a unique font for operators.',
        skippable: true,
        minComparisons: 1,
        showGrid: true,
        requiresUniqueRoleFonts: true
    },
    {
        id: 'roleFontGhost',
        name: 'AI Suggestions Font',
        description: 'Choose a unique font for AI suggestions.',
        skippable: true,
        minComparisons: 1,
        showGrid: true,
        requiresUniqueRoleFonts: true
    }
];


export const ROLE_STAGE_TO_KEY: Record<string, string> = {
    roleComments: 'comments',
    roleStrings: 'strings',
    roleLiterals: 'literals',
    roleKeywords: 'keywords',
    roleFunction: 'function',
    roleVariable: 'variable',
    roleType: 'type',
    roleOperator: 'operator',
    roleGhost: 'ghost',
    // Font stages
    roleFontComments: 'comments',
    roleFontStrings: 'strings',
    roleFontLiterals: 'literals',
    roleFontKeywords: 'keywords',
    roleFontFunction: 'function',
    roleFontVariable: 'variable',
    roleFontType: 'type',
    roleFontOperator: 'operator',
    roleFontGhost: 'ghost'
};


// Helper function to get stage by ID
export function getStage(id: string): Stage | undefined {
    return STAGES.find(stage => stage.id === id);
}


// Helper function to get stage index
export function getStageIndex(id: string) {
    return STAGES.findIndex(stage => stage.id === id);
}


export function stageToRoleKey(stageId: string): string | null {
    return ROLE_STAGE_TO_KEY[stageId] || null;
}


export function formatStageWinner(_stageId: string, winner: StageWinner): string {
    if (winner == null) return 'none';
    if (typeof winner === 'string') {
        const fontName = extractFontNameFromCss(winner);
        return fontName ? `"${fontName}"` : winner;
    }
    if (typeof winner === 'number') {
        return `${winner}`;
    }
    if ('name' in winner) return `"${winner.name}"`;

    // Role candidates have font, weight, and style
    const parts: (string | number)[] = [winner.font];
    if (winner.weight) parts.push(winner.weight);
    if (winner.style && winner.style !== 'normal') parts.push(winner.style);
    return `"${parts.join(' • ')}"`;
}


export function getNextValidStageIndex(currentIndex: number) {
    // Skip stages that require uniqueRoleFonts toggle if it's disabled
    let nextIndex = currentIndex + 1;
    while (nextIndex < STAGES.length) {
        const stage = STAGES[nextIndex];
        if (stage.requiresUniqueRoleFonts && !state.uniqueRoleFontsEnabled) {
            nextIndex++;
            continue;
        }
        return nextIndex;
    }
    return nextIndex; // Return past end if no valid stage found
}


export function logStageOutcome(stageId: string, winner: StageWinner, comparisons: number | undefined, { reason = 'completed' } = {}): void {
    if (!stageId) return;
    const stageMeta = getStage(stageId);
    const label = stageMeta ? stageMeta.name : stageId;
    const winnerLabel = formatStageWinner(stageId, winner);
    let comparisonsText = 'comparisons n/a';
    if (typeof comparisons === 'number' && Number.isFinite(comparisons)) {
        comparisonsText = `${comparisons} comparison${comparisons === 1 ? '' : 's'}`;
    }
    const prefix = reason === 'skipped' ? '[STAGE] Skipped' : '[STAGE] Completed';
    console.log(`${prefix} ${label} → ${winnerLabel} (${comparisonsText})`);
}
