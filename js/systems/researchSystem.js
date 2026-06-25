import { state } from '../gameState.js';
import { TECHNOLOGY_TREE, ERAS, getTechById } from '../data/technologyTree.js';
import { addWorldEvent, logEvent } from './historySystem.js';

export function updateResearchLogic() {
    // Run every 10 ticks to save performance
    if (state.ticks % 10 !== 0) return;

    state.kingdoms.forEach(kingdom => {
        // Init research state if missing
        if (!kingdom.technologies) kingdom.technologies = [];
        if (kingdom.currentResearch === undefined) kingdom.currentResearch = null;
        if (typeof kingdom.researchPoints !== 'number') kingdom.researchPoints = 0;
        if (typeof kingdom.scienceOutput !== 'number') kingdom.scienceOutput = 0;
        if (typeof kingdom.researchSpeed !== 'number') kingdom.researchSpeed = 1.0;
        if (typeof kingdom.breakthroughs !== 'number') kingdom.breakthroughs = 0;
        if (!kingdom.currentEra) kingdom.currentEra = ERAS.STONE;

        // Calculate Science Output from NPC Jobs & Traits
        let scienceGain = 0;
        let hasVisionary = false;
        let hasGenius = false;
        
        state.npcs.forEach(n => {
            let tribe = state.tribes.find(t => t.id === n.tribeId);
            if (tribe && tribe.kingdomId === kingdom.id) {
                // Job contributions
                if (n.job === 'Học giả') scienceGain += 2;
                if (n.job === 'Nhà khoa học') scienceGain += 5;
                if (n.job === 'Nghiên cứu viên') scienceGain += 8;
                if (n.job === 'Giáo viên') scienceGain += 1;
                
                // Trait contributions
                if (n.traits && n.traits.includes('Genius')) {
                    scienceGain += 10;
                    hasGenius = true;
                }
                if (n.traits && n.traits.includes('Inventor')) {
                    scienceGain += 5;
                }
                if (n.traits && n.traits.includes('Visionary')) {
                    hasVisionary = true;
                }
            }
        });

        kingdom.scienceOutput = scienceGain * kingdom.researchSpeed;
        
        // Breakthrough Mechanics
        if ((hasGenius || hasVisionary) && kingdom.currentResearch && Math.random() < 0.005) {
            kingdom.breakthroughs++;
            let boost = 500 * (kingdom.currentEra === ERAS.STONE ? 1 : 5);
            kingdom.researchPoints += boost;
            logEvent(`ĐỘT PHÁ KHOA HỌC: Vương quốc ${kingdom.name} vừa có một bước tiến nhảy vọt! (+${boost} RP)`);
            addWorldEvent('Technology', 'Historic', `Đột phá khoa học tại ${kingdom.name}`, `Năm ${state.time.year}: Một vĩ nhân tại ${kingdom.name} đã tạo ra một phát minh mang tính thời đại.`);
        }

        // Apply science to current research
        if (kingdom.currentResearch) {
            kingdom.researchPoints += kingdom.scienceOutput;

            let currentTech = getTechById(kingdom.currentResearch);
            if (currentTech && kingdom.researchPoints >= currentTech.cost) {
                // Tech Unlocked!
                kingdom.technologies.push(currentTech.id);
                kingdom.researchPoints -= currentTech.cost;
                kingdom.currentResearch = null;

                logEvent(`Vương quốc ${kingdom.name} đã khám phá ra: ${currentTech.name}!`);
                addWorldEvent('Technology', 'Historic', `Phát minh ${currentTech.name}`, `Năm ${state.time.year}: Vương quốc ${kingdom.name} đã phát hiện ra ${currentTech.name}.`);

                // Apply unlocks
                if (currentTech.unlocks.includes("Faster Research") || currentTech.unlocks.includes("Research Bonus")) {
                    kingdom.researchSpeed += 0.5;
                }
                
                // Tech Spread - give bonus to trading partners/allies
                spreadTechnology(kingdom, currentTech);
            }
        }

        // Auto-select next research if idle
        if (!kingdom.currentResearch) {
            let availableTechs = TECHNOLOGY_TREE.filter(tech => {
                // Not already researched
                if (kingdom.technologies.includes(tech.id)) return false;
                // Check era - Can only research tech of current era, OR if all tech of current era is done, next era
                // Actually, let's keep it simple: can research if all prerequisites are met
                let reqsMet = tech.prerequisites.every(req => kingdom.technologies.includes(req));
                if (!reqsMet) return false;
                
                // Cannot research tech from future eras unless current era matches or we are ready to advance
                let eraKeys = Object.values(ERAS);
                let currentEraIndex = eraKeys.indexOf(kingdom.currentEra);
                let techEraIndex = eraKeys.indexOf(tech.era);
                
                // Can only research current era, or next era if we've met the requirements to advance
                if (techEraIndex > currentEraIndex + 1) return false;
                return true;
            });

            if (availableTechs.length > 0) {
                // Pick the cheapest one first to simulate progressive learning
                availableTechs.sort((a, b) => a.cost - b.cost);
                kingdom.currentResearch = availableTechs[0].id;
            }
        }

        // Check Era Progression
        checkEraProgression(kingdom);
    });
}

function spreadTechnology(sourceKingdom, tech) {
    // Look at diplomacy
    if (!sourceKingdom.diplomacy) return;
    for (let targetId in sourceKingdom.diplomacy) {
        let relation = sourceKingdom.diplomacy[targetId];
        if (relation === 'alliance' || relation === 'trade') {
            let targetTribe = state.tribes.find(t => t.id === parseInt(targetId));
            if (targetTribe && targetTribe.kingdomId) {
                let targetKingdom = state.kingdoms.find(k => k.id === targetTribe.kingdomId);
                if (targetKingdom && !targetKingdom.technologies.includes(tech.id)) {
                    // Small chance to passively gain research points towards this tech
                    if (Math.random() < 0.2) {
                        targetKingdom.researchPoints += 50;
                        if (!targetKingdom.currentResearch) {
                            targetKingdom.currentResearch = tech.id;
                        }
                    }
                }
            }
        }
    }
}

function checkEraProgression(kingdom) {
    let eraKeys = Object.values(ERAS);
    let currentIndex = eraKeys.indexOf(kingdom.currentEra);
    
    if (currentIndex < eraKeys.length - 1) {
        let nextEra = eraKeys[currentIndex + 1];
        
        // To advance to nextEra, kingdom must have researched ALL technologies of the currentEra
        // Or specific key technologies. Let's say they must research all techs of the currentEra.
        let currentEraTechs = TECHNOLOGY_TREE.filter(t => t.era === kingdom.currentEra);
        let hasAllCurrentEraTechs = currentEraTechs.every(t => kingdom.technologies.includes(t.id));
        
        if (hasAllCurrentEraTechs) {
            kingdom.currentEra = nextEra;
            logEvent(`🌟 Vương quốc ${kingdom.name} đã bước sang ${nextEra}!`);
            addWorldEvent('Civilization', 'Legendary', `Kỷ nguyên mới: ${nextEra}`, `Năm ${state.time.year}: Bằng những tiến bộ vượt bậc về khoa học, ${kingdom.name} chính thức vươn mình vào ${nextEra}.`);
        }
    }
}
