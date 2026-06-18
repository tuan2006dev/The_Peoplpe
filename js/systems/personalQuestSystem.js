import { state } from '../gameState.js';
import { TERRAIN } from '../config.js';
import { addMemory } from './memorySystem.js';

export function checkPersonalQuestsTick() {
    if (!state.possession.active) return;
    let npc = state.npcs.find(n => n.id === state.possession.npcId);
    if (!npc) return;

    if (!npc.quests) npc.quests = [];

    // Assign a new quest if they don't have an active one
    let activeQuest = npc.quests.find(q => q.status === 'active');
    if (!activeQuest) {
        if (Math.random() < 0.05) {
            generateQuest(npc);
        }
    } else {
        // Check completion
        let isComplete = false;
        switch(activeQuest.type) {
            case 'find_food':
                if (npc.inventory.foodCarried >= activeQuest.targetAmount) isComplete = true;
                break;
            case 'build_house':
                if (npc.homeId) isComplete = true;
                break;
            case 'pray':
                if (npc.state === 'praying') {
                    activeQuest.progress = (activeQuest.progress || 0) + 1;
                    if (activeQuest.progress >= 30) isComplete = true;
                }
                break;
            case 'chop_wood':
                if (npc.inventory.wood >= activeQuest.targetAmount) isComplete = true;
                break;
        }

        if (isComplete) {
            activeQuest.status = 'completed';
            npc.happiness += 20;
            if (npc.happiness > 100) npc.happiness = 100;
            addMemory(npc, 'Quest', 'Hoàn thành nhiệm vụ', `Đã hoàn thành: ${activeQuest.title}`, 20, null);
            import('./memorySystem.js').then(m => m.addPersonalLog(npc, `Cảm thấy thỏa mãn vì đã hoàn thành mục tiêu: ${activeQuest.title}`));
        }
    }
}

function generateQuest(npc) {
    let types = ['find_food', 'build_house', 'pray', 'chop_wood'];
    // Filter impossible ones
    if (npc.homeId) types = types.filter(t => t !== 'build_house');

    if (types.length === 0) return;
    
    let type = types[Math.floor(Math.random() * types.length)];
    let quest = { type: type, status: 'active', progress: 0 };
    
    switch(type) {
        case 'find_food':
            quest.title = "Tìm thức ăn";
            quest.targetAmount = (npc.inventory.foodCarried || 0) + 10;
            quest.objective = `Thu thập ${quest.targetAmount} đơn vị thức ăn`;
            break;
        case 'build_house':
            quest.title = "Dựng nhà";
            quest.objective = `Xây dựng một ngôi nhà để ở`;
            break;
        case 'pray':
            quest.title = "Cầu nguyện Thần linh";
            quest.objective = `Dành thời gian cầu nguyện`;
            break;
        case 'chop_wood':
            quest.title = "Kiếm củi";
            quest.targetAmount = (npc.inventory.wood || 0) + 15;
            quest.objective = `Thu thập ${quest.targetAmount} gỗ`;
            break;
    }
    
    npc.quests.push(quest);
}
