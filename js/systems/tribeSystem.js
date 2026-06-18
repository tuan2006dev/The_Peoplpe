import { state } from '../gameState.js';
import { TRIBE_NAMES } from '../data/names.js';
import { TRIBE_COLORS } from '../config.js';
import { AGES } from '../data/constants.js';
import { logEvent } from './historySystem.js';

export function updateTribeLogic() {
    let allUnaffiliated = state.npcs.filter(n => !n.tribeId);
    let unaffiliatedAdults = allUnaffiliated.filter(n => n.age >= 16);
    if (unaffiliatedAdults.length >= 4) {
        let n = unaffiliatedAdults[0];
        let tId = ++state.tribeIdCounter; let tName = TRIBE_NAMES[Math.floor(Math.random() * TRIBE_NAMES.length)];
        let tribe = { 
            id: tId, name: tName, x: n.x, y: n.y, leaderId: n.id, members: [n.id], houses: [], level: 'Trại nhỏ', foodStorage: 0, woodStorage: 0, maxStorage: 50, faith: 50, culture: 10, foundedYear: state.time.year, color: TRIBE_COLORS[tId % TRIBE_COLORS.length],
            ageLevel: AGES[0], researchPoints: 0, culturePoints: 0, educationLevel: 0, innovationRate: 1.0, unlockedTechs: [], currentResearchId: null
        };
        n.tribeId = tId; state.tribes.push(tribe);
        state.buildings.push({ id: ++state.buildingIdCounter, type: 'campfire', x: n.x, y: n.y, tribeId: tId });
        logEvent(`Bộ lạc ${tName} đã được thành lập!`); 
    }
    
    state.tribes.forEach(t => {
        t.population = state.npcs.filter(n=>n.tribeId===t.id).length;
        if (t.population >= 20 && t.level === 'Trại nhỏ') t.level = 'Làng';
        if (t.population >= 50 && t.level === 'Làng') t.level = 'Thị trấn';
        if (t.woodStorage >= 30 && !state.buildings.find(b=>b.tribeId===t.id && b.type==='storage')) {
            t.woodStorage-=30; t.maxStorage=200; state.buildings.push({ id: ++state.buildingIdCounter, type: 'storage', x: t.x+1, y: t.y, tribeId: t.id });
        }
    });
}
