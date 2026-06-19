import { state } from '../gameState.js';
import { ENTITY_DATA, TIER } from '../data/races.js';
import { COLS, ROWS, TERRAIN } from '../config.js';
import { moveRandom, moveTowards } from '../utils.js';
import { addWorldEvent } from './historySystem.js';

export function spawnNeutral(x, y, raceId) {
    let raceData = ENTITY_DATA.find(r => r.id === raceId);
    if (!raceData) return;
    let n = {
        id: ++state.idCounter,
        raceId: raceId,
        name: raceData.name,
        x: x, y: y,
        health: 100,
        actionWait: 0,
        targetTribeId: null
    };
    state.neutrals.push(n);
    addWorldEvent('Neutral', 'Info', `Thực thể trung lập xuất hiện`, `${raceData.name} đã bắt đầu hành trình của mình trên thế giới.`);
}

export function updateNeutrals() {
    // Random spawn
    if (Math.random() < 0.002 && state.neutrals.length < 5) {
        let allowed = ENTITY_DATA.filter(r => r.tier === TIER.NEUTRAL);
        let r = allowed[Math.floor(Math.random() * allowed.length)];
        let x = Math.floor(Math.random() * COLS);
        let y = Math.floor(Math.random() * ROWS);
        if (state.grid[x] && state.grid[x][y] !== TERRAIN.NUOC || r.terrainAffinity.includes(TERRAIN.NUOC)) {
            spawnNeutral(x, y, r.id);
        }
    }

    state.neutrals.forEach(n => {
        if (n.health <= 0) return;
        if (n.actionWait > 0) { n.actionWait--; return; }

        if (state.tribes.length > 0) {
            if (!n.targetTribeId || !state.tribes.find(t => t.id === n.targetTribeId)) {
                let randomTribe = state.tribes[Math.floor(Math.random() * state.tribes.length)];
                n.targetTribeId = randomTribe.id;
            }

            let targetTribe = state.tribes.find(t => t.id === n.targetTribeId);
            if (targetTribe) {
                let dist = Math.hypot(targetTribe.x - n.x, targetTribe.y - n.y);
                if (dist > 5) {
                    moveTowards(n, targetTribe.x, targetTribe.y);
                } else {
                    // Cung cấp hiệu ứng đặc biệt khi đến làng
                    n.actionWait = 150;
                    if (n.raceId === 'merchant_guild') {
                        targetTribe.foodStorage += 15;
                        targetTribe.woodStorage += 15;
                    } else if (n.raceId === 'scribe') {
                        targetTribe.researchPoints += 10;
                    } else if (n.raceId === 'vintner') {
                        targetTribe.culture += 5;
                    } else if (n.raceId === 'healer') {
                        // Healer hồi phục sức khỏe cho dân làng xung quanh
                        state.npcs.forEach(npc => {
                            if (npc.tribeId === targetTribe.id && npc.health < 100) npc.health += 20;
                        });
                    }
                    n.targetTribeId = null; // Đổi mục tiêu
                }
            }
        } else {
            moveRandom(n);
        }
    });

    // Cleanup dead
    for (let i = state.neutrals.length - 1; i >= 0; i--) {
        if (state.neutrals[i].health <= 0) {
            let n = state.neutrals[i];
            addWorldEvent('Neutral', 'Tragedy', `Cái chết của ${n.name}`, `${n.name} đã bị sát hại nhẫn tâm. Tất cả các bộ lạc lân cận đều nghi ngờ lẫn nhau và đánh mất lòng tin.`);
            
            // Trừng phạt toàn cầu: Các tộc trong bán kính 50 bị giảm điểm quan hệ trầm trọng
            state.tribes.forEach(t1 => {
                if (Math.hypot(t1.x - n.x, t1.y - n.y) <= 50) {
                    state.tribes.forEach(t2 => {
                        if (t1.id !== t2.id && t1.relations[t2.id] !== undefined) {
                            t1.relations[t2.id] -= 30; // Giảm mạnh quan hệ ngoại giao
                        }
                    });
                }
            });

            // Tạm thời log để chuẩn bị spawn Guardian Spirits ở Phase 4
            console.log("Will spawn Guardian Spirits here in Phase 4.");
            state.neutrals.splice(i, 1);
        }
    }
}
