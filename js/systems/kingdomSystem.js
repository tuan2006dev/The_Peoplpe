import { state } from '../gameState.js';
import { KINGDOM_NAMES } from '../data/names.js';
import { logEvent, addWorldEvent } from './historySystem.js';

export function updateKingdomLogic() {
    state.tribes.forEach(t => {
        if (t.level === 'Thị trấn' && t.population >= 50 && !t.kingdomId) {
            let kId = ++state.kdIdCounter; let kName = KINGDOM_NAMES[kId % KINGDOM_NAMES.length];
            let kingdom = { 
                id: kId, name: kName, tribeIds: [t.id], capitalTribeId: t.id, rulerId: t.leaderId, population: t.population, militaryPower: 0, economyPower: 100, faithPower: t.faith, territory: [], diplomacy: [], foundedYear: state.time.year, governmentType: "Quân chủ", color: t.color,
                ageLevel: t.ageLevel, researchPoints: 0, culturePoints: t.culturePoints, educationLevel: t.educationLevel, innovationRate: t.innovationRate, unlockedTechs: [...t.unlockedTechs], currentResearchId: t.currentResearchId,
                civilizationLevel: 1, currentEra: "Stone Age", eraProgress: 0, technologyScore: 0, cultureScore: 0, scienceScore: 0, industrialScore: 0, educationScore: 0
            };
            t.kingdomId = kId; state.kingdoms.push(kingdom);
            logEvent(`Vương quốc ${kName} đã được khai sinh từ ${t.name}!`);
            addWorldEvent('Kingdom', 'Historic', `Vương quốc ${kName} ra đời`, `Từ nền tảng của bộ lạc ${t.name}, một vương quốc rộng lớn mang tên ${kName} đã được thành lập.`);
        }
    });
    state.kingdoms.forEach(k => {
        k.tribeIds = k.tribeIds.filter(tId => state.tribes.some(t => t.id === tId));
        let pops = 0;
        k.tribeIds.forEach(tId => {
            let t = state.tribes.find(tr => tr.id === tId);
            if (t) pops += t.population;
        });
        k.population = pops;
        k.militaryPower = state.npcs.filter(n => n.kingdomId === k.id && n.isSoldier && n.health > 0).length * 10;
    });

    for (let i = state.kingdoms.length - 1; i >= 0; i--) {
        let k = state.kingdoms[i];
        if (k.population === 0 || k.tribeIds.length === 0) {
            state.tribes.forEach(t => { if (t.kingdomId === k.id) t.kingdomId = null; });
            state.npcs.forEach(n => { if (n.kingdomId === k.id) n.kingdomId = null; });
            state.kingdoms.splice(i, 1);
        }
    }
}
