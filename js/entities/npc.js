import { state } from '../gameState.js';
import { STATES, RELATION } from '../data/constants.js';
import { PERSONALITIES, FIRST_NAMES } from '../data/names.js';
import { addWorldEvent } from '../systems/historySystem.js';

export function createNpc(tx, ty, fatherId = null, motherId = null, forcedRaceId = null) {
    let baseName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    let npc = {
        id: ++state.idCounter, name: `${baseName} ${state.idCounter}`,
        x: tx, y: ty, targetX: null, targetY: null,
        health: 100, energy: 100, hunger: 0, age: fatherId ? 0 : 16,
        tribeId: null, homeId: null, partnerId: null, childrenIds: [],
        fatherId: fatherId, motherId: motherId,
        gender: ['Nam', 'Nữ'][Math.floor(Math.random()*2)],
        // --- Version 14 Traits & Race ---
        raceId: forcedRaceId ? forcedRaceId : (fatherId ? (state.npcs.find(n=>n.id===fatherId)?.raceId || 'human') : ['human', 'elf', 'orc', 'dwarf', 'goblin', 'merfolk'][Math.floor(Math.random()*6)]),
        traits: [],
        
        intelligence: 50 + Math.random()*50, bravery: 50 + Math.random()*50,
        faith: 50, fear: 0, devotion: Math.random()*100,
        beliefType: "Vô thần", personality: PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)],
        state: STATES.WANDERING, mood: "Bình thường", actionWait: 0,
        relationshipStatus: RELATION.SINGLE, reproductionCooldown: 0, wood: 0,
        job: "Vô nghiệp", isSoldier: false, combatSkill: 10 + Math.random()*40,
        kingdomId: null, isLeader: false, walkCycle: 0,
        
        // --- Version 12 Deep Sim ---
        ambition: Math.random()*100, kindness: Math.random()*100,
        courage: Math.random()*100, greed: Math.random()*100, loyalty: 50 + Math.random()*50,
        trauma: 0, happiness: 50 + Math.random()*50,
        lifeGoal: null, currentPlan: null,
        memories: [], relationships: [], dailyRoutine: null, personalLog: [],
        favorite: false, lifeStory: "",
        
        // --- Version 13 Possession ---
        inventory: { foodCarried: 0, wood: 0, rareMaterial: 0, tool: null, weapon: null, medicine: 0 },
        quests: []
    };
    
    // Assign traits if new
    if (!fatherId) {
        if (Math.random() < 0.3) {
            let possibleTraits = ['Khỏe mạnh', 'Yếu ớt', 'Siêng năng', 'Lười biếng', 'Thông minh', 'Ngốc nghếch', 'Genius', 'Inventor', 'Visionary'];
            npc.traits.push(possibleTraits[Math.floor(Math.random()*possibleTraits.length)]);
            
            if (npc.traits.includes('Khỏe mạnh')) npc.health = 120;
            if (npc.traits.includes('Yếu ớt')) npc.health = 80;
            if (npc.traits.includes('Thông minh')) npc.intelligence += 20;
            if (npc.traits.includes('Ngốc nghếch')) npc.intelligence -= 20;
        }
    }

    // --- Hệ thống NPC Huyền Thoại (Chronicle & Lore) ---
    if (Math.random() < 0.01) {
        npc.traits.push('chosenByFate');
        npc.traits.push('heroic');
        npc.health = 300;
        npc.energy = 100;
        npc.intelligence += 50;
        npc.bravery += 50;
        npc.combatSkill += 50;
        npc.favorite = true; // Auto-favorite for player visibility
        npc.lifeStory = [`[Năm ${state.time.year}] Bầu trời chớp sáng dị thường báo hiệu sự ra đời của ${npc.name}.`];
        addWorldEvent('Legendary', 'Legendary', 'Huyền thoại giáng thế', `Biên niên sử ghi lại: ${npc.name} mang trong mình định mệnh vĩ đại đã giáng trần tại lục địa.`);
    }

    state.npcs.push(npc);
    return npc;
}
