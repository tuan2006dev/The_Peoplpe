import { state } from './gameState.js';
import { COLS, ROWS } from './config.js';

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
        if (dist <= speed) {
            npc.x = tx; npc.y = ty;
        } else {
            npc.x += (dx/dist) * speed;
            npc.y += (dy/dist) * speed;
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
    let canMoveWater = npc.kingdomId !== null;
    
    if(nx>=0&&nx<COLS&&ny>=0&&ny<ROWS && state.grid[nx] && state.grid[nx][ny]!==3) { 
        if (state.grid[nx][ny]===1 && !canMoveWater) return;
        moveTowards(npc, nx, ny);
    }
}
