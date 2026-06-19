import { state } from '../gameState.js';
import { ENTITY_DATA, TIER } from '../data/races.js';
import { COLS, ROWS, TERRAIN } from '../config.js';
import { moveRandom, moveTowards } from '../utils.js';
import { RESOURCES } from '../data/resources.js';

export function spawnResource(x, y, resId, amount) {
    let resData = Object.values(RESOURCES).find(r => r.id === resId);
    if (!resData) return;
    
    // Kiểm tra xem vị trí này đã có tài nguyên chưa
    let existing = state.resources.find(r => r.x === x && r.y === y);
    if (existing) {
        if (existing.id === resId) existing.amount += amount;
        return;
    }
    
    state.resources.push({
        id: resId,
        x: x, y: y,
        amount: amount,
        maxAmount: amount, // Dùng để tái tạo
        name: resData.name,
        emoji: resData.emoji,
        type: resData.type,
        renewable: resData.renewable
    });
}

export function spawnResourceOnTile(x, y, biome, chanceMultiplier = 1.0) {
    let rawResources = Object.values(RESOURCES).filter(r => r.raw);
    
    // Tỷ lệ cơ bản là 2%, có thể nhân lên nếu vẽ bằng tay
    if (Math.random() < 0.02 * chanceMultiplier) { 
        let possibleRes = rawResources.filter(r => r.biomes.includes(biome));
        
        if (possibleRes.length > 0) {
            let chosen = possibleRes[Math.floor(Math.random() * possibleRes.length)];
            
            let spawnChance = 1.0;
            if (chosen.renewable === 'Hiếm') spawnChance = 0.2;
            if (chosen.renewable === 'Rất hiếm') spawnChance = 0.05;
            if (chosen.renewable === 'Cực kỳ hiếm' || chosen.renewable === 'Cực hiếm') spawnChance = 0.01;
            
            if (Math.random() < spawnChance) {
                let amount = 100 + Math.floor(Math.random() * 400); // 100 - 500 unit
                spawnResource(x, y, chosen.id, amount);
            }
        }
    }
}

export function initResources() {
    for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS; y++) {
            if (state.envGrid[x] && state.envGrid[x][y]) {
                spawnResourceOnTile(x, y, state.envGrid[x][y].biome, 1.0);
            }
        }
    }
}

export function spawnAnimal(x, y, raceId) {
    let raceData = ENTITY_DATA.find(r => r.id === raceId);
    if (!raceData) return;
    let a = {
        id: ++state.idCounter,
        raceId: raceId,
        name: raceData.name,
        x: x, y: y,
        health: 50,
        energy: 100,
        hunger: 0,
        actionWait: 0,
        gender: Math.random() < 0.5 ? 'male' : 'female',
        reproductionCooldown: 0
    };
    state.animals.push(a);
}

export function updateEcosystem() {
    // Tái tạo tài nguyên theo thời gian và mùa vụ
    if (state.ticks % 100 === 0) {
        let seasonMultiplier = 1.0;
        if (state.climate && state.climate.season === 'Đông') seasonMultiplier = 0.1;
        if (state.climate && state.climate.season === 'Xuân') seasonMultiplier = 1.5;
        
        state.resources.forEach(r => {
            if ((r.renewable === 'Có' || r.renewable === 'Chậm') && r.amount < r.maxAmount) {
                let regenAmt = r.renewable === 'Có' ? 5 : 1;
                regenAmt = Math.max(1, Math.floor(regenAmt * seasonMultiplier));
                r.amount = Math.min(r.maxAmount, r.amount + regenAmt);
            }
        });
    }

    if (Math.random() < 0.05 && state.animals.length < 30) {
        let allowed = ENTITY_DATA.filter(r => r.tier === TIER.ANIMAL);
        let r = allowed[Math.floor(Math.random() * allowed.length)];
        let x = Math.floor(Math.random() * COLS);
        let y = Math.floor(Math.random() * ROWS);
        if (state.grid[x] && state.grid[x][y] !== TERRAIN.NUOC || r.terrainAffinity.includes(TERRAIN.NUOC)) {
            spawnAnimal(x, y, r.id);
            spawnAnimal(x + (Math.random()*2-1), y + (Math.random()*2-1), r.id);
            state.animals[state.animals.length-1].gender = state.animals[state.animals.length-2].gender === 'male' ? 'female' : 'male';
        }
    }

    state.animals.forEach(a => {
        if (a.health <= 0) return;
        if (a.actionWait > 0) { a.actionWait--; return; }

        let raceData = ENTITY_DATA.find(r => r.id === a.raceId);
        if (!raceData) return;

        a.hunger += 0.5;
        if (a.hunger > 100) a.health -= 2;
        if (a.reproductionCooldown > 0) a.reproductionCooldown--;

        // Reproduction
        if (state.ticks % 15 === 0 && a.gender === 'female' && a.reproductionCooldown <= 0 && a.hunger < 50) {
            let mate = state.animals.find(m => m.raceId === a.raceId && m.gender === 'male' && m.health > 0 && Math.hypot(m.x - a.x, m.y - a.y) <= 2);
            if (mate) {
                let repChance = 0.3;
                let nearCamp = false;
                let nearbyHouses = state.houses.filter(h => Math.hypot(h.x - a.x, h.y - a.y) <= 5);
                if (nearbyHouses.length > 0) {
                    for (let h of nearbyHouses) {
                        let t = state.tribes.find(tr => tr.id === h.tribeId);
                        if (t && t.foodStorage > 0) {
                            nearCamp = true;
                            t.foodStorage -= 1; // Tiêu thụ 1 food của trại
                            break;
                        }
                    }
                }
                if (nearCamp) repChance = 0.8; // Boost sinh sản nếu ở gần chuồng trại có thức ăn

                if (Math.random() < repChance) {
                    spawnAnimal(a.x, a.y, a.raceId);
                    a.reproductionCooldown = 300;
                    mate.reproductionCooldown = 300;
                }
            }
        }

        // Predator Logic
        if (a.raceId === 'giant_crab') {
            if (a.hunger > 40) {
                let preys = state.animals.filter(p => p.id !== a.id && p.health > 0 && Math.hypot(p.x - a.x, p.y - a.y) <= 8 && (p.raceId === 'salmon' || p.raceId === 'duck'));
                if (preys.length > 0) {
                    let prey = preys[0];
                    if (Math.hypot(prey.x - a.x, prey.y - a.y) <= 1) {
                        prey.health -= 20; a.actionWait = 15;
                        if (prey.health <= 0) a.hunger -= 50;
                    } else {
                        moveTowards(a, prey.x, prey.y);
                        return;
                    }
                } else if (a.hunger > 80) {
                    // Chết đói / di cư nhanh nếu cạn kiệt mồi
                    a.health -= 5;
                    moveRandom(a);
                    a.actionWait = 0; // Di chuyển liên tục để tìm thức ăn (di cư)
                    return;
                }
            }
        } else {
            // Orc & Goblin săn thú hoang
            let predator = state.npcs.find(n => (n.raceId === 'orc' || n.raceId === 'goblin') && Math.hypot(n.x - a.x, n.y - a.y) <= 5 && n.health > 0);
            if (predator) {
                if (Math.hypot(predator.x - a.x, predator.y - a.y) <= 1.5) {
                    a.health -= 15;
                    predator.actionWait = 10;
                    if (a.health <= 0 && predator.inventory) {
                        predator.inventory.foodCarried += 10; 
                    }
                }
                // Flee
                let dx = a.x - predator.x; let dy = a.y - predator.y;
                let dist = Math.hypot(dx, dy);
                if (dist > 0) {
                    moveTowards(a, a.x + (dx/dist)*2, a.y + (dy/dist)*2);
                    a.actionWait = 5;
                    return;
                }
            }
        }

        let validTerrain = raceData.terrainAffinity;
        let cx = Math.floor(a.x); let cy = Math.floor(a.y);
        if (state.grid[cx] && validTerrain.length > 0 && !validTerrain.includes(state.grid[cx][cy])) {
            moveRandom(a);
        } else {
            if (a.hunger > 30) {
                if (state.grid[cx] && (state.grid[cx][cy] === TERRAIN.DAT || state.grid[cx][cy] === TERRAIN.RUNG)) {
                    a.hunger -= 10; a.actionWait = 30;
                } else { moveRandom(a); }
            } else { moveRandom(a); }
        }
    });

    for (let i = state.animals.length - 1; i >= 0; i--) {
        if (state.animals[i].health <= 0) state.animals.splice(i, 1);
    }
}
