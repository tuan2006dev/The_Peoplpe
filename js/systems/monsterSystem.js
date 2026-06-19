import { state } from '../gameState.js';
import { ENTITY_DATA, TIER } from '../data/races.js';
import { COLS, ROWS, TERRAIN } from '../config.js';
import { moveRandom, moveTowards } from '../utils.js';
import { addWorldEvent } from './historySystem.js';

export function spawnMonster(x, y, raceId) {
    let raceData = ENTITY_DATA.find(r => r.id === raceId);
    if (!raceData) return;
    let m = {
        id: ++state.idCounter,
        raceId: raceId,
        name: raceData.name,
        x: x, y: y,
        spawnX: x, spawnY: y,
        health: 500,
        actionWait: 0,
        targetId: null,
        huntCooldown: 0
    };
    state.monsters.push(m);
    addWorldEvent('Monster', 'Danger', `Quái vật xuất hiện`, `Một con ${raceData.name} hung tợn đã xuất hiện tại vùng hoang dã để bảo vệ lãnh thổ của nó.`);
}

export function updateMonsters() {
    // Random spawn periodically if few monsters exist
    if (Math.random() < 0.001 && state.monsters.length < 5) {
        let allowed = ENTITY_DATA.filter(r => r.tier === TIER.MONSTER);
        let r = allowed[Math.floor(Math.random() * allowed.length)];
        let x = Math.floor(Math.random() * COLS);
        let y = Math.floor(Math.random() * ROWS);
        if (state.grid[x] && state.grid[x][y] !== TERRAIN.NUOC || r.terrainAffinity.includes(TERRAIN.NUOC)) {
            spawnMonster(x, y, r.id);
        }
    }

    state.monsters.forEach(m => {
        if (m.health <= 0) return;
        if (m.actionWait > 0) { m.actionWait--; return; }
        
        if (m.huntCooldown > 0) m.huntCooldown--;
        
        if (m.targetId) {
            let target = state.npcs.find(n => n.id === m.targetId);
            // If target is invalid or dead, clear
            if (target && target.health > 0) {
                let dist = Math.hypot(target.x - m.x, target.y - m.y);
                if (dist <= 2) {
                    target.health -= 30; // Monster heavy attack
                    m.actionWait = 40;
                    state.particles.push({x: target.x * 16 + 8, y: target.y * 16 + 8, vx: Math.random()*2-1, vy: Math.random()*2-1, life: 30, type: 'blood', color: '#e74c3c'});
                    if (target.health <= 0) m.targetId = null;
                } else if (dist < 15) {
                    moveTowards(m, target.x, target.y);
                } else {
                    m.targetId = null; // target escaped
                }
            } else {
                m.targetId = null;
            }
        } else {
            if (m.huntCooldown <= 0) {
                // Hunt for nearest weakest NPC
                let targets = state.npcs.filter(n => Math.hypot(n.x - m.x, n.y - m.y) <= 15 && n.health > 0);
                if (targets.length > 0) {
                    targets.sort((a, b) => a.health - b.health);
                    m.targetId = targets[0].id;
                    m.huntCooldown = 200; 
                }
            }
            
            if (!m.targetId) {
                if (Math.hypot(m.x - m.spawnX, m.y - m.spawnY) > 20) {
                    // Return to territory
                    moveTowards(m, m.spawnX, m.spawnY);
                } else {
                    moveRandom(m); // Wander within territory
                }
            }
        }
    });

    for (let i = state.monsters.length - 1; i >= 0; i--) {
        if (state.monsters[i].health <= 0) {
            let m = state.monsters[i];
            addWorldEvent('Monster', 'Victory', `Quái vật bị tiêu diệt`, `${m.name} đã bị đánh bại, rớt ra những nguyên liệu quý giá.`);
            // Drop rare item effect on map
            state.effects.push({ type: 'item', x: m.x * 16, y: m.y * 16, life: 1800, itemName: 'Vật phẩm Huyền thoại' });
            state.monsters.splice(i, 1);
        }
    }
}
