import { state } from '../gameState.js';
import { updateDialoguePanel } from '../ui/dialoguePanel.js';
import { addMemory } from './memorySystem.js';

export function openDialogue(initiator, target) {
    if (!initiator || !target) return;
    
    // Calculate available options based on relationship
    let rel = initiator.relationships.find(r => r.targetNpcId === target.id);
    let affection = rel ? rel.affection : 0;
    
    let options = [];
    options.push({ id: 'greet', text: '👋 Chào hỏi', outcome: () => doDialogue(initiator, target, 'greet') });
    
    if (affection < 20) {
        options.push({ id: 'befriend', text: '🤝 Làm quen', outcome: () => doDialogue(initiator, target, 'befriend') });
    } else {
        options.push({ id: 'gossip', text: '🗣️ Tán gẫu', outcome: () => doDialogue(initiator, target, 'gossip') });
        if (initiator.relationshipStatus === 'Độc thân' && target.relationshipStatus === 'Độc thân') {
            options.push({ id: 'confess', text: '❤️ Tỏ tình', outcome: () => doDialogue(initiator, target, 'confess') });
        }
    }
    
    options.push({ id: 'threaten', text: '😠 Đe dọa', outcome: () => doDialogue(initiator, target, 'threaten') });
    
    if (initiator.faith >= 50) {
        options.push({ id: 'preach', text: '🙏 Truyền đạo', outcome: () => doDialogue(initiator, target, 'preach') });
    }

    if (initiator.tribeId && !target.tribeId) {
        options.push({ id: 'recruit', text: '⛺ Mời vào bộ lạc', outcome: () => doDialogue(initiator, target, 'recruit') });
    }

    // Pass data to UI
    document.getElementById('dialogue-panel').classList.remove('hidden');
    updateDialoguePanel(initiator, target, options);
}

function doDialogue(initiator, target, type) {
    let rel = initiator.relationships.find(r => r.targetNpcId === target.id);
    if (!rel) {
        rel = { targetNpcId: target.id, type: 'Người lạ', affection: 0 };
        initiator.relationships.push(rel);
    }
    
    let targetRel = target.relationships.find(r => r.targetNpcId === initiator.id);
    if (!targetRel) {
        targetRel = { targetNpcId: initiator.id, type: 'Người lạ', affection: 0 };
        target.relationships.push(targetRel);
    }

    let successMsg = "";
    let impact = 0;

    switch(type) {
        case 'greet':
            impact = 5;
            successMsg = `${target.name} mỉm cười chào lại.`;
            break;
        case 'befriend':
            if (Math.random() * 100 < target.kindness + initiator.courage/2) {
                impact = 15;
                successMsg = `${target.name} rất vui được làm quen với bạn.`;
                rel.type = 'Bạn bè'; targetRel.type = 'Bạn bè';
            } else {
                impact = -5;
                successMsg = `${target.name} tỏ vẻ e ngại và lùi lại.`;
            }
            break;
        case 'gossip':
            impact = 10;
            successMsg = `Hai người đã có một cuộc trò chuyện thú vị.`;
            break;
        case 'confess':
            if (rel.affection > 50 && Math.random() * 100 < target.kindness) {
                impact = 50;
                successMsg = `${target.name} đỏ mặt và đồng ý!`;
                initiator.partnerId = target.id;
                target.partnerId = initiator.id;
                initiator.relationshipStatus = 'Có đôi';
                target.relationshipStatus = 'Có đôi';
                rel.type = 'Vợ/Chồng'; targetRel.type = 'Vợ/Chồng';
            } else {
                impact = -20;
                successMsg = `${target.name} xin lỗi và từ chối lời tỏ tình.`;
            }
            break;
        case 'threaten':
            impact = -30;
            successMsg = `${target.name} sợ hãi và tức giận.`;
            target.fear += 10;
            if (target.fear > 100) target.fear = 100;
            break;
        case 'preach':
            if (Math.random() * 100 < target.intelligence + initiator.loyalty) {
                target.faith += 20;
                if (target.faith > 100) target.faith = 100;
                impact = 10;
                successMsg = `${target.name} đã lắng nghe và thêm phần kính trọng Thần linh.`;
            } else {
                impact = -10;
                successMsg = `${target.name} không tin những gì bạn nói.`;
            }
            break;
        case 'recruit':
            if (rel.affection > 30) {
                target.tribeId = initiator.tribeId;
                impact = 20;
                successMsg = `${target.name} đồng ý gia nhập bộ lạc!`;
            } else {
                impact = -5;
                successMsg = `${target.name} chưa đủ tin tưởng để gia nhập.`;
            }
            break;
    }

    rel.affection += impact;
    targetRel.affection += impact;
    
    // Add memory for major impacts
    if (Math.abs(impact) >= 20) {
        addMemory(initiator, type, 'Trò chuyện đáng nhớ', successMsg, impact > 0 ? 10 : -10, target.id);
        addMemory(target, type, 'Trò chuyện đáng nhớ', `Với ${initiator.name}: ${successMsg}`, impact > 0 ? 10 : -10, initiator.id);
    }
    
    // Log
    import('./memorySystem.js').then(m => m.addPersonalLog(initiator, `Nói chuyện với ${target.name}: ${successMsg}`));
    
    // Close dialogue after 1 choice
    document.getElementById('dialogue-panel').classList.add('hidden');
}
