import { state } from '../gameState.js';
import { KINGDOM_NAMES } from '../data/names.js';
import { logEvent, addWorldEvent } from './historySystem.js';

export function updateKingdomLogic() {
    state.tribes.forEach(t => {
        if (t.level === 'Thị trấn' && t.population >= 50 && !t.kingdomId) {
            let kId = ++state.kdIdCounter; let kName = KINGDOM_NAMES[kId % KINGDOM_NAMES.length];
            let kingdom = { 
                id: kId, name: kName, tribeIds: [t.id], capitalTribeId: t.id, rulerId: t.leaderId, population: t.population, militaryPower: 0, economyPower: 100, faithPower: t.faith, territory: [], diplomacy: [], foundedYear: state.time.year, governmentType: "Quân chủ", color: t.color,
                ageLevel: t.ageLevel, researchPoints: t.researchPoints, culturePoints: t.culturePoints, educationLevel: t.educationLevel, innovationRate: t.innovationRate, unlockedTechs: [...t.unlockedTechs], currentResearchId: t.currentResearchId
            };
            t.kingdomId = kId; state.kingdoms.push(kingdom);
            logEvent(`Vương quốc ${kName} đã được khai sinh từ ${t.name}!`);
            addWorldEvent('Kingdom', 'Historic', `Vương quốc ${kName} ra đời`, `Từ nền tảng của bộ lạc ${t.name}, một vương quốc rộng lớn mang tên ${kName} đã được thành lập.`);
        }
    });
    state.kingdoms.forEach(k => {
        let pops = 0; k.tribeIds.forEach(tId => { let t = state.tribes.find(tr=>tr.id===tId); if(t) pops += t.population; });
        k.population = pops;
        k.militaryPower = state.npcs.filter(n => n.kingdomId === k.id && n.isSoldier).length * 10;
    });
}
