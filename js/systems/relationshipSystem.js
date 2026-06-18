import { state } from '../gameState.js';
import { RELATION_TYPES } from '../data/constants.js';

export function addRelationship(npc1, npc2Id, type, affection, trust, fear, respect) {
    if (!npc1 || !npc2Id || npc1.id === npc2Id) return;
    if (!npc1.relationships) npc1.relationships = [];
    
    let rel = npc1.relationships.find(r => r.targetNpcId === npc2Id);
    if (rel) {
        rel.affection = Math.min(100, Math.max(-100, rel.affection + affection));
        rel.trust = Math.min(100, Math.max(-100, rel.trust + trust));
        rel.fear = Math.min(100, Math.max(0, rel.fear + fear));
        rel.respect = Math.min(100, Math.max(-100, rel.respect + respect));
        if (type) rel.type = type;
    } else {
        npc1.relationships.push({
            targetNpcId: npc2Id,
            type: type || RELATION_TYPES.FRIEND,
            affection: Math.min(100, Math.max(-100, affection)),
            trust: Math.min(100, Math.max(-100, trust)),
            fear: Math.min(100, Math.max(0, fear)),
            respect: Math.min(100, Math.max(-100, respect)),
            rivalry: 0
        });
    }
}

export function updateRelationships() {
    // Process periodically to save performance
    if (state.ticks % 100 !== 0) return;
    
    state.npcs.forEach(npc => {
        if (!npc.relationships) return;
        
        // Decay some negative stats naturally
        npc.relationships.forEach(r => {
            if (r.fear > 0) r.fear -= 1;
            if (r.rivalry > 0) r.rivalry -= 1;
        });
        
        // Increase affection for nearby NPCs
        let nearby = state.npcs.filter(n => n.id !== npc.id && Math.abs(n.x - npc.x) < 5 && Math.abs(n.y - npc.y) < 5);
        nearby.forEach(n => {
            let isSameFamily = npc.homeId !== null && npc.homeId === n.homeId;
            let isSameTribe = npc.tribeId !== null && npc.tribeId === n.tribeId;
            
            if (isSameFamily) {
                addRelationship(npc, n.id, null, 1, 1, 0, 0);
            } else if (isSameTribe) {
                addRelationship(npc, n.id, null, 0.5, 0.5, 0, 0);
            } else {
                // Not same tribe, might increase rivalry if competing for food
                addRelationship(npc, n.id, null, -1, -1, 0, 0);
                let rel = npc.relationships.find(r => r.targetNpcId === n.id);
                if (rel) rel.rivalry = Math.min(100, rel.rivalry + 2);
            }
        });
    });
}
