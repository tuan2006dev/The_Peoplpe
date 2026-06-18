import { state } from './gameState.js';
import { COLS, ROWS } from './config.js';

export function playSound(name) {
    if (state.settings.sound) {
        console.log(`[SOUND] Playing: ${name}`);
    }
}

export function moveTowards(npc, tx, ty) {
    npc.targetX = tx; npc.targetY = ty;
    if (npc.x < tx) npc.x++; else if (npc.x > tx) npc.x--;
    if (npc.y < ty) npc.y++; else if (npc.y > ty) npc.y--;
    
    if (state.grid[npc.x] && state.grid[npc.x][npc.y] === 1) npc.isSailing = true;
    else npc.isSailing = false;
}

export function moveRandom(npc) {
    let nx = npc.x + (Math.random()<0.5?-1:1);
    let ny = npc.y + (Math.random()<0.5?-1:1);
    let canMoveWater = npc.kingdomId !== null;
    
    if(nx>=0&&nx<COLS&&ny>=0&&ny<ROWS && state.grid[nx][ny]!==3) { 
        if (state.grid[nx][ny]===1 && !canMoveWater) return;
        
        npc.targetX=nx; npc.targetY=ny; npc.x=nx; npc.y=ny; 
        
        if (state.grid[nx][ny]===1) npc.isSailing = true;
        else npc.isSailing = false;
    }
}
