import { state } from '../gameState.js';
import { MEMORY_TYPES, LIFE_GOALS } from '../data/constants.js';

export function addMemory(npc, type, title, description, emotionalImpact, relatedNpcId = null) {
    if (!npc) return;
    if (!npc.memories) npc.memories = [];
    
    let memory = {
        id: state.idCounter++,
        type: type,
        title: title,
        description: description,
        year: state.time.year,
        month: state.time.month,
        day: state.time.day,
        emotionalImpact: emotionalImpact,
        relatedNpcId: relatedNpcId,
        importance: Math.abs(emotionalImpact)
    };
    
    npc.memories.push(memory);
    
    // Sort by importance, keep top 20
    npc.memories.sort((a, b) => b.importance - a.importance);
    if (npc.memories.length > 20) npc.memories.pop();
    
    // Apply emotional impact
    npc.happiness = Math.max(0, Math.min(100, npc.happiness + emotionalImpact));
    
    if (emotionalImpact < -20) {
        npc.trauma += Math.abs(emotionalImpact) / 2;
        if (npc.trauma > 100) npc.trauma = 100;
    }
    
    if (type === MEMORY_TYPES.MIRACLE) {
        npc.faith = Math.min(100, npc.faith + 20);
    } else if (type === MEMORY_TYPES.DISASTER) {
        npc.fear = Math.min(100, npc.fear + 30);
        npc.trauma += 10;
    }
    
    addPersonalLog(npc, title);
}

export function addPersonalLog(npc, text) {
    if (!npc.personalLog) npc.personalLog = [];
    npc.personalLog.unshift(`[Năm ${state.time.year}] ${text}`);
    if (npc.personalLog.length > 30) npc.personalLog.pop();
}

export function generateLifeGoal(npc) {
    if (!npc.lifeGoal) {
        let options = LIFE_GOALS.slice();
        if (npc.ambition > 70) options = ["Trở thành thủ lĩnh", "Giàu có", "Trở thành chiến binh", "Khám phá thế giới"];
        else if (npc.kindness > 70) options = ["Sống yên bình", "Có gia đình lớn", "Trở thành nhà nghiên cứu"];
        else if (npc.trauma > 50) options = ["Trả thù", "Phụng sự thần", "Sống yên bình"];
        
        npc.lifeGoal = options[Math.floor(Math.random() * options.length)];
    }
}
