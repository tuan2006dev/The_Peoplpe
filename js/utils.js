import { state } from './gameState.js';
import { COLS, ROWS } from './config.js';
import { ENTITY_DATA } from './data/races.js';
import { BIOME_EFFECTS } from './data/constants.js';
import { RESOURCES, RESOURCE_GROUPS } from './data/resources.js';

export function getTribeFood(t) {
    if (!t.inventory) return t.foodStorage || 0;
    let total = 0;
    for (let k in t.inventory) {
        if (RESOURCES[k] && RESOURCES[k].group === RESOURCE_GROUPS.FOOD) total += t.inventory[k];
    }
    return total;
}

export function consumeTribeFood(t, amount) {
    if (!t.inventory) {
        if (t.foodStorage >= amount) { t.foodStorage -= amount; return true; }
        return false;
    }
    let needed = amount;
    // Consume processed food first, then raw
    let foods = Object.values(RESOURCES).filter(r => r.group === RESOURCE_GROUPS.FOOD).sort((a,b) => (a.raw===b.raw?0:a.raw?1:-1));
    for (let f of foods) {
        if (t.inventory[f.id] > 0) {
            let take = Math.min(t.inventory[f.id], needed);
            t.inventory[f.id] -= take;
            needed -= take;
            if (needed <= 0) return true;
        }
    }
    return false; // Not enough
}

export function getTribeWood(t) {
    if (!t.inventory) return t.woodStorage || 0;
    return (t.inventory['timber'] || 0) + (t.inventory['hardwood'] || 0) + (t.inventory['planks'] || 0);
}

export function consumeTribeWood(t, amount) {
    if (!t.inventory) {
        if (t.woodStorage >= amount) { t.woodStorage -= amount; return true; }
        return false;
    }
    let needed = amount;
    let woods = ['planks', 'timber', 'hardwood'];
    for (let w of woods) {
        if (t.inventory[w] > 0) {
            let take = Math.min(t.inventory[w], needed);
            t.inventory[w] -= take;
            needed -= take;
            if (needed <= 0) return true;
        }
    }
    return false;
}

export function addTribeResource(t, resId, amount) {
    if (!t.inventory) t.inventory = {};
    if (t.inventory[resId] === undefined) t.inventory[resId] = 0;
    t.inventory[resId] += amount;
}

export function playSound(name) {
    if (state.settings.sound) {
        console.log(`[SOUND] Playing: ${name}`);
    }
}

export function moveTowards(npc, tx, ty) {
    npc.targetX = tx; npc.targetY = ty;
    let dx = tx - npc.x; let dy = ty - npc.y;
    let dist = Math.hypot(dx, dy);
    
    if (dist > 0) {
        let speed = 0.05; // Tốc độ di chuyển mỗi tick
        let nx_round = Math.round(npc.x), ny_round = Math.round(npc.y);
        if (nx_round>=0 && nx_round<COLS && ny_round>=0 && ny_round<ROWS && state.envGrid[nx_round] && state.envGrid[nx_round][ny_round]) {
            let biome = state.envGrid[nx_round][ny_round].biome;
            if(BIOME_EFFECTS && BIOME_EFFECTS[biome]) {
                speed *= BIOME_EFFECTS[biome].speedMod;
            }
        }

        if (dist <= speed) {
            npc.x = tx; npc.y = ty;
        } else {
            let nextX = npc.x + (dx/dist) * speed;
            let nextY = npc.y + (dy/dist) * speed;
            let nX_r = Math.round(nextX), nY_r = Math.round(nextY);
            
            // Logic Nước Sâu và Thuyền
            let raceData = npc.raceId ? ENTITY_DATA.find(r => r.id === npc.raceId) : null;
            let validTerrain = raceData ? raceData.terrainAffinity : null;
            let isLandRace = !validTerrain || !validTerrain.includes(1);
            
            if (isLandRace && isDeepWater(nX_r, nY_r)) {
                if (npc.hasShip) {
                    npc.x = nextX; npc.y = nextY;
                } else if (npc.tribeId) {
                    let t = state.tribes.find(tr=>tr.id === npc.tribeId);
                    if (t && t.woodStorage >= 5) {
                        t.woodStorage -= 5;
                        npc.hasShip = true;
                        npc.x = nextX; npc.y = nextY;
                        if (state.particles) state.particles.push({x: npc.x*16, y: npc.y*16, vx:0, vy:0, life:30, type:'smoke', color:'#8b4513'}); // Hiệu ứng đóng thuyền
                    }
                }
                // Nếu không có thuyền và không đủ gỗ -> Không đi được
            } else {
                npc.x = nextX; npc.y = nextY;
                if (!isDeepWater(nX_r, nY_r) && isLandRace) npc.hasShip = false; // Bỏ thuyền khi vào bờ
            }
        }
    }
    
    let nx = Math.round(npc.x), ny = Math.round(npc.y);
    if (nx>=0 && nx<COLS && ny>=0 && ny<ROWS && state.grid[nx] && state.grid[nx][ny] === 1) npc.isSailing = true;
    else npc.isSailing = false;
}

export function moveRandom(npc) {
    if (npc.targetX !== null && npc.targetY !== null) {
        let dist = Math.hypot(npc.targetX - npc.x, npc.targetY - npc.y);
        if (dist > 0.05) {
            moveTowards(npc, npc.targetX, npc.targetY);
            return;
        }
    }
    
    let nx = Math.round(npc.x) + (Math.random()<0.5?-1:1);
    let ny = Math.round(npc.y) + (Math.random()<0.5?-1:1);
    
    // Migration: prefer preferred biome
    if (BIOME_EFFECTS && npc.raceId) {
        let bestScore = -1;
        let bx = nx, by = ny;
        for(let dx=-1; dx<=1; dx++) {
            for(let dy=-1; dy<=1; dy++) {
                let tx = Math.round(npc.x)+dx, ty = Math.round(npc.y)+dy;
                if(tx>=0&&tx<COLS&&ty>=0&&ty<ROWS && state.envGrid[tx] && state.envGrid[tx][ty]) {
                    let b = state.envGrid[tx][ty].biome;
                    let score = Math.random(); 
                    if(BIOME_EFFECTS[b] && BIOME_EFFECTS[b].preferredTribes.includes(npc.raceId)) score += 2;
                    if(score > bestScore) { bestScore = score; bx = tx; by = ty; }
                }
            }
        }
        nx = bx; ny = by;
    }
    let canMoveWater = npc.kingdomId !== null;
    
    let raceData = npc.raceId ? ENTITY_DATA.find(r => r.id === npc.raceId) : null;
    let validTerrain = raceData ? raceData.terrainAffinity : null;
    let isLandRace = !validTerrain || !validTerrain.includes(1);

    if(nx>=0&&nx<COLS&&ny>=0&&ny<ROWS && state.grid[nx] && state.grid[nx][ny]!==3) { 
        let targetTerrain = state.grid[nx][ny];
        
        // Terrain Affinity
        if (validTerrain && validTerrain.length > 0 && !validTerrain.includes(targetTerrain) && targetTerrain !== 1) return;

        // Nếu là nước
        if (targetTerrain === 1) {
            if (isLandRace) {
                if (isDeepWater(nx, ny)) {
                    if (!npc.hasShip) {
                        let t = state.tribes.find(tr=>tr.id === npc.tribeId);
                        if (!t || t.woodStorage < 5) return; // Không đóng được thuyền -> chặn di chuyển
                    }
                }
            }
        }
        
        moveTowards(npc, nx, ny);
    }
}

export function isDeepWater(x, y) {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
    if (state.grid[x] && state.grid[x][y] !== 1) return false; // Không phải nước
    
    // Kiểm tra trong bán kính 3 ô xem có bờ không
    for (let dx = -3; dx <= 3; dx++) {
        for (let dy = -3; dy <= 3; dy++) {
            let tx = x + dx;
            let ty = y + dy;
            if (tx >= 0 && tx < COLS && ty >= 0 && ty < ROWS) {
                if (state.grid[tx] && state.grid[tx][ty] !== 1) {
                    return false; // Có đất gần đó -> Nước nông
                }
            }
        }
    }
    return true; // Không có đất trong bán kính 3 ô -> Nước sâu
}
