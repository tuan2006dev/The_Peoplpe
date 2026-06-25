import { state } from '../gameState.js';
import { determineJob, determineBelief, determineMood, determineState, executeState } from './aiSystem.js';
import { spawnFood } from './worldSystem.js';
import { generateLifeGoal } from './memorySystem.js';
import { SEASON_HUNGER_MULTIPLIER } from './environmentSystem.js';

export function updateNpcsTick() {
    for (let i = 0; i < state.npcs.length; i++) {
        let npc = state.npcs[i];
        
        // Smooth walking animation scaling
        if (npc.targetX !== null && npc.targetY !== null && (npc.x !== npc.targetX || Math.hypot(npc.targetX - npc.x, npc.targetY - npc.y) > 0.1)) {
            npc.walkCycle += 0.2;
        } else {
            npc.walkCycle = 0;
            npc.targetX = null; npc.targetY = null;
        }
        
        if (npc.actionWait > 0) npc.actionWait--;
        
        if (!npc.lifeGoal) generateLifeGoal(npc);
        
        if ((state.ticks + i) % 5 === 0) {
            determineState(npc);
        }
        
        // Execute state EVERY tick for smooth movement
        executeState(npc);
    }
}

export function updateDailyLogic() {
    let hasRain = state.effects.some(e=>e.type==='mua');
    if (state.time.frames === 0) { spawnFood(); }
    
    for (let i = 0; i < state.npcs.length; i++) {
        let npc = state.npcs[i];
        npc.age += 1/360; 
        if(npc.reproductionCooldown>0) npc.reproductionCooldown--; 
        
        determineJob(npc);
        determineBelief(npc); 
        determineMood(npc); 
        
        const hungerRate = (SEASON_HUNGER_MULTIPLIER[state.climate.season] || 1.0) * 0.2;
        npc.hunger += hungerRate; if(npc.hunger>100) npc.hunger=100;
        if(npc.hunger>=80) npc.health-=3; else if(npc.hunger<30 && npc.energy>50 && npc.health<100) npc.health+=2;
        if(npc.age>=65) npc.health-=0.5;
        
        if(npc.faith > 100) npc.faith = 100; if(npc.fear < 0) npc.fear = 0; if(npc.fear > 100) npc.fear = 100;
        if(npc.energy<0) npc.energy=0; if(npc.health>100) npc.health=100;
        
        if (npc.health <= 0) {
            let cx = Math.floor(npc.x); let cy = Math.floor(npc.y);
            if (state.grid[cx] && state.grid[cx][cy] === 1) state.bossTracking.waterCorpses++;

            if (npc.id === state.selectedNpcId) state.selectedNpcId = null;
            if (npc.homeId) { let h = state.houses.find(x=>x.id===npc.homeId); if(h) h.ownerId = null; }
            state.deadNpcs.push(npc);
            
            import('./spiritSystem.js').then(s => s.registerDeath(npc.x, npc.y));
            
            import('./memorySystem.js').then(m => {
                let p = npc.partnerId ? state.npcs.find(x=>x.id===npc.partnerId) : null;
                if(p) m.addMemory(p, 'Death', 'Mất người thân', `${npc.name} đã qua đời.`, -40, npc.id);
            });
        }
    }
    
    // Remove dead
    state.npcs = state.npcs.filter(n => n.health > 0);
    
    // Garbage collect deadNpcs (keep only favorites and recent ones to prevent memory leak)
    if (state.deadNpcs.length > 200) {
        state.deadNpcs = state.deadNpcs.filter(n => n.favorite || state.deadNpcs.indexOf(n) > state.deadNpcs.length - 100);
    }
}
