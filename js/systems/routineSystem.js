import { state } from '../gameState.js';
import { ROUTINES } from '../data/constants.js';

export function updateRoutine() {
    let hour = Math.floor((state.time.frames / state.time.framesPerDay) * 24);
    
    let currentRoutine = ROUTINES.NIGHT;
    if (hour >= 6 && hour < 11) currentRoutine = ROUTINES.MORNING;
    else if (hour >= 11 && hour < 14) currentRoutine = ROUTINES.NOON;
    else if (hour >= 14 && hour < 18) currentRoutine = ROUTINES.AFTERNOON;
    else if (hour >= 18 && hour < 22) currentRoutine = ROUTINES.EVENING;

    state.npcs.forEach(npc => {
        if (!npc.dailyRoutine) npc.dailyRoutine = currentRoutine;
        
        // If routine changes, they might rethink their plan
        if (npc.dailyRoutine !== currentRoutine) {
            npc.dailyRoutine = currentRoutine;
            npc.currentPlan = null; // Force replan
        }
    });
}
