// Mock DOM
global.document = {
    createElement: () => ({ classList: { add: () => {} } }),
    getElementById: () => ({ appendChild: () => {}, prepend: () => {} })
};

import { state } from './js/gameState.js';
import { updateResearchLogic } from './js/systems/researchSystem.js';
import { TECHNOLOGY_TREE, ERAS } from './js/data/technologyTree.js';

// Setup Mock State
state.ticks = 0;
state.time = { year: 1 };
state.tribes = [
    { id: 1, kingdomId: 1, name: "Tribe 1" }
];
state.kingdoms = [
    {
        id: 1,
        name: "Test Kingdom",
        tribeIds: [1],
        technologies: [],
        currentResearch: null,
        researchPoints: 0,
        scienceOutput: 0,
        researchSpeed: 1.0,
        breakthroughs: 0,
        currentEra: ERAS.STONE
    }
];
state.npcs = [
    { id: 1, tribeId: 1, job: "Nghiên cứu viên", traits: ["Genius"] },
    { id: 2, tribeId: 1, job: "Học giả", traits: [] }
];

console.log("Initial Era:", state.kingdoms[0].currentEra);

for(let i=0; i<1000; i++) {
    state.ticks++;
    updateResearchLogic();
    if (state.kingdoms[0].technologies.length > 0 && i % 100 === 0) {
        console.log(`Tick ${i}: RP=${state.kingdoms[0].researchPoints}, Output=${state.kingdoms[0].scienceOutput}`);
        console.log("Techs:", state.kingdoms[0].technologies);
        console.log("Current Era:", state.kingdoms[0].currentEra);
    }
}

console.log("Final Techs:", state.kingdoms[0].technologies);
console.log("Final Era:", state.kingdoms[0].currentEra);
