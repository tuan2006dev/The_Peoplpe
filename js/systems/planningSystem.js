import { state } from '../gameState.js';
import { STATES, ROUTINES } from '../data/constants.js';

export function updatePlanning(npc) {
    if (npc.actionWait > 0) return; // Busy
    
    // Sometimes rethink the plan
    if (npc.currentPlan && Math.random() > 0.1 && npc.state !== STATES.IDLE && npc.state !== STATES.WANDERING) return;
    
    let options = [
        { state: STATES.SEEKING_FOOD, score: getFoodScore(npc) },
        { state: STATES.RESTING, score: getRestScore(npc) },
        { state: STATES.WANDERING, score: getWanderScore(npc) },
        { state: STATES.SEEKING_WOOD, score: getWorkScore(npc) },
        { state: STATES.SEEKING_PARTNER, score: getPartnerScore(npc) },
        { state: STATES.CARING_FAMILY, score: getFamilyScore(npc) },
        { state: STATES.PRAYING, score: getPrayScore(npc) }
    ];
    
    // Sort by descending score
    options.sort((a, b) => b.score - a.score);
    
    let bestPlan = options[0].state;
    
    if (npc.currentPlan !== bestPlan) {
        npc.currentPlan = bestPlan;
        npc.state = bestPlan;
    }
}

function getFoodScore(npc) {
    let score = npc.hunger; // 0 to 100
    if (npc.hunger > 80) score += 50; // Critical
    return score;
}

function getRestScore(npc) {
    let score = 100 - npc.energy; // 0 to 100
    if (npc.dailyRoutine === ROUTINES.NIGHT) score += 40;
    if (npc.energy < 20) score += 50; // Exhausted
    return score;
}

function getWanderScore(npc) {
    let score = 10;
    if (npc.lifeGoal === "Khám phá thế giới") score += 30;
    if (npc.happiness > 80) score += 10; // Happy people wander
    return score;
}

function getWorkScore(npc) {
    let score = 0;
    if (npc.dailyRoutine === ROUTINES.MORNING || npc.dailyRoutine === ROUTINES.NOON) score += 30;
    if (npc.ambition > 70) score += 20;
    if (npc.job === "Thợ mộc" || npc.job === "Thợ xây") score += 40;
    if (npc.kingdomId) score += 20; // Kingdoms demand resources
    if (npc.wood < 5) score += 20;
    return score;
}

function getPartnerScore(npc) {
    if (npc.age < 16) return 0;
    if (npc.partnerId !== null) return 0; // Already partnered
    if (npc.reproductionCooldown > 0) return 0;
    
    let score = 20;
    if (npc.lifeGoal === "Có gia đình lớn") score += 40;
    if (npc.dailyRoutine === ROUTINES.AFTERNOON || npc.dailyRoutine === ROUTINES.EVENING) score += 20;
    if (npc.happiness > 60) score += 10;
    
    return score;
}

function getFamilyScore(npc) {
    if (npc.partnerId === null) return 0;
    let score = 10;
    if (npc.dailyRoutine === ROUTINES.AFTERNOON || npc.dailyRoutine === ROUTINES.EVENING) score += 30;
    if (npc.lifeGoal === "Có gia đình lớn") score += 40;
    if (npc.reproductionCooldown <= 0 && npc.age >= 18 && npc.age < 50) score += 50; // Ready to have a child
    return score;
}

function getPrayScore(npc) {
    let score = npc.faith / 2;
    if (npc.dailyRoutine === ROUTINES.EVENING) score += 20;
    if (npc.trauma > 60) score += 30; // Seek comfort in prayer
    if (npc.lifeGoal === "Phụng sự thần") score += 50;
    if (npc.fear > 70) score += 40; // Pray out of fear
    return score;
}
