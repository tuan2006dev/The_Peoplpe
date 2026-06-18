import { state } from '../gameState.js';
import { determineJob, determineBelief, determineMood, determineState, executeState } from './aiSystem.js';
import { spawnFood } from './worldSystem.js';

export function updateNpcsTick() {
    for (let i = 0; i < state.npcs.length; i++) {
        let npc = state.npcs[i];
        
        if (npc.targetX !== null && npc.targetY !== null) npc.walkCycle += 0.2;
        else npc.walkCycle = 0;
        
        if (npc.actionWait > 0) npc.actionWait--;
        
        if ((state.ticks + i) % 5 === 0) {
            determineState(npc);
            executeState(npc);
        }
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
        
        npc.hunger += 1; if(npc.hunger>100) npc.hunger=100;
        if(npc.hunger>=80) npc.health-=3; else if(npc.hunger<30 && npc.energy>50 && npc.health<100) npc.health+=2;
        if(npc.age>=65) npc.health-=0.5;
        
        if(npc.faith > 100) npc.faith = 100; if(npc.fear < 0) npc.fear = 0; if(npc.fear > 100) npc.fear = 100;
        if(npc.energy<0) npc.energy=0; if(npc.health>100) npc.health=100;
        
        if (npc.health <= 0) {
            if (npc.id === state.selectedNpcId) state.selectedNpcId = null;
            if (npc.homeId) { let h = state.houses.find(x=>x.id===npc.homeId); if(h) h.ownerId = null; }
        }
    }
    
    // Remove dead
    state.npcs = state.npcs.filter(n => n.health > 0);
}
