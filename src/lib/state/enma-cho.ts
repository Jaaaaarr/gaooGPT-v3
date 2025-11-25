export interface EnmaCho {
    patienceTokens: number; // Starts at 3
    angerLevel: number; // 0-100
    activeInterrogation: string | null;
    lastAxiomViolated: string | null;
}

export const initialEnmaCho: EnmaCho = {
    patienceTokens: 3,
    angerLevel: 0,
    activeInterrogation: null,
    lastAxiomViolated: null,
};
