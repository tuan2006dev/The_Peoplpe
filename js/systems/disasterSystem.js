import { state } from '../gameState.js';
import { TERRAIN } from '../config.js';
import { addWorldEvent, logEvent } from './historySystem.js';

export function updateDisasterLogic() {
    if (!state.activeDisasters || state.activeDisasters.length === 0) return;

    for (let i = state.activeDisasters.length - 1; i >= 0; i--) {
        const disaster = state.activeDisasters[i];
        disaster.life--;

        if (disaster.type === 'volcano') _processVolcano(disaster);
        else if (disaster.type === 'plague') _processPlague(disaster);
        else if (disaster.type === 'meteor') _processMeteor(disaster);

        if (disaster.life <= 0) {
            state.activeDisasters.splice(i, 1);
        }
    }

    // Xử lý NPC bị bệnh (plague lây lan)
    _processSickNpcs();
}

function _processVolcano(disaster) {
    // Mỗi 5 ticks: phun tro tàn phá xung quanh
    if (disaster.life % 5 !== 0) return;
    const radius = 3;

    // Phá nhà trong bán kính
    for (let i = state.houses.length - 1; i >= 0; i--) {
        const h = state.houses[i];
        if (Math.hypot(h.x - disaster.x, h.y - disaster.y) <= radius) {
            if (Math.random() < 0.2) {
                state.npcs.forEach(n => { if (n.homeId === h.id) n.homeId = null; });
                state.houses.splice(i, 1);
                logEvent(`Núi lửa phá hủy một căn nhà tại (${h.x}, ${h.y})!`);
            }
        }
    }

    // Gây sát thương NPC
    state.npcs.forEach(npc => {
        if (Math.hypot(npc.x - disaster.x, npc.y - disaster.y) <= radius) {
            npc.health -= 8;
            npc.state = 'fleeing_disaster';
        }
    });

    // Biến đất thành Núi (đất chết) ở tâm
    if (disaster.life % 20 === 0 && Math.random() < 0.3) {
        const tx = disaster.x + Math.floor(Math.random() * 3 - 1);
        const ty = disaster.y + Math.floor(Math.random() * 3 - 1);
        if (tx >= 0 && tx < state.grid.length && ty >= 0 && ty < state.grid[0].length) {
            state.grid[tx][ty] = TERRAIN.NUI;
            if (state.envGrid[tx] && state.envGrid[tx][ty]) {
                state.envGrid[tx][ty].biome = 'Núi';
                state.envGrid[tx][ty].fertility = 0;
            }
            // Xóa food tại ô đó
            state.foods = state.foods.filter(f => !(f.x === tx && f.y === ty));
        }
    }

    // Sự kiện lịch sử khi mới phun (life gần max)
    if (disaster.life === 95) {
        state.bossTracking.volcanoEruptions++;
        addWorldEvent('Disaster', 'Historic', `🌋 Núi lửa phun trào tại (${disaster.x}, ${disaster.y})`,
            'Một ngọn núi lửa bùng phát dữ dội, thiêu đốt mọi thứ xung quanh!');
    }
}

function _processPlague(disaster) {
    if (disaster.life === disaster.maxLife || (disaster.maxLife === undefined && disaster.life === 399)) {
        disaster.maxLife = disaster.life;
    }
    if (disaster.life % 30 !== 0) return;

    state.npcs.forEach(npc => {
        if (Math.hypot(npc.x - disaster.x, npc.y - disaster.y) <= disaster.radius / 16) {
            if (npc.plagueImmunity) return;
            if (Math.random() < 0.4) {
                npc.sick = true;
            }
        }
    });

    if (disaster.life === (disaster.maxLife || 399) - 1) {
        addWorldEvent('Disaster', 'Important', `☠️ Dịch bệnh bùng phát`,
            'Một loại dịch bệnh nguy hiểm xuất hiện, đang nhanh chóng lan rộng qua đám đông!');
    }
}

function _processMeteor(disaster) {
    // Thiên thạch: tác động tức thì khi mới xuất hiện
    if (disaster.triggered) return;
    disaster.triggered = true;

    const impactRadius = 5;
    addWorldEvent('Disaster', 'Legendary', `☄️ Thiên thạch va chạm!`,
        `Một thiên thạch khổng lồ đã lao xuống tại (${disaster.x}, ${disaster.y}), tạo ra hố sâu và phá hủy mọi thứ xung quanh!`);

    // Giết toàn bộ NPC trong bán kính
    state.npcs.forEach(npc => {
        if (Math.hypot(npc.x - disaster.x, npc.y - disaster.y) <= impactRadius) {
            npc.health = -100;
        }
    });

    // Phá nhà
    state.houses = state.houses.filter(h => {
        if (Math.hypot(h.x - disaster.x, h.y - disaster.y) <= impactRadius) {
            state.npcs.forEach(n => { if (n.homeId === h.id) n.homeId = null; });
            return false;
        }
        return true;
    });

    // Tạo hố: biến đất trong bán kính thành đất chết
    for (let dx = -impactRadius; dx <= impactRadius; dx++) {
        for (let dy = -impactRadius; dy <= impactRadius; dy++) {
            if (Math.hypot(dx, dy) <= impactRadius) {
                const tx = disaster.x + dx, ty = disaster.y + dy;
                if (tx >= 0 && tx < state.grid.length && ty >= 0 && ty < state.grid[0].length) {
                    state.grid[tx][ty] = TERRAIN.NUI;
                    if (state.envGrid[tx] && state.envGrid[tx][ty]) {
                        state.envGrid[tx][ty].biome = 'Đất chết';
                        state.envGrid[tx][ty].fertility = 0;
                    }
                }
            }
        }
    }
    state.foods = state.foods.filter(f =>
        Math.hypot(f.x - disaster.x, f.y - disaster.y) > impactRadius
    );
}

// Xử lý NPC bị bệnh plague
function _processSickNpcs() {
    if (state.ticks % 10 !== 0) return;
    state.npcs.forEach(npc => {
        if (!npc.sick) return;
        npc.health -= 2; // Mất máu từ từ
        // Lây cho người gần
        if (Math.random() < 0.05) {
            const nearby = state.npcs.find(n =>
                n.id !== npc.id && !n.sick && !n.plagueImmunity && Math.hypot(n.x - npc.x, n.y - npc.y) <= 2
            );
            if (nearby) nearby.sick = true;
        }
        if (Math.random() < 0.1) {
            npc.sick = false;
            npc.plagueImmunity = true;
        }
    });
}