import { state } from '../gameState.js';
import { STATES, RELATION } from '../data/constants.js';
import { PERSONALITIES } from '../data/names.js';

export function createNpc(tx, ty) {
    let npc = {
        id: ++state.idCounter, name: "NPC " + state.idCounter,
        x: tx, y: ty, targetX: null, targetY: null,
        health: 100, energy: 100, hunger: 0, age: 16,
        tribeId: null, homeId: null, partnerId: null, childrenIds: [],
        intelligence: 50 + Math.random()*50, bravery: 50 + Math.random()*50,
        faith: 50, fear: 0, devotion: Math.random()*100,
        beliefType: "Vô thần", personality: PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)],
        state: STATES.WANDERING, mood: "Bình thường", actionWait: 0,
        relationshipStatus: RELATION.SINGLE, reproductionCooldown: 0, wood: 0,
        job: "Vô nghiệp", isSoldier: false, combatSkill: 10 + Math.random()*40,
        kingdomId: null, isLeader: false, walkCycle: 0
    };
    state.npcs.push(npc);
    return npc;
}
