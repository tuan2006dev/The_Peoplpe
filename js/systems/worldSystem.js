import { state } from '../gameState.js';
import { COLS, ROWS, SPATIAL_CHUNK } from '../config.js';

export function spawnFood() {
    // Tăng giới hạn food từ 150 lên 1000 để tránh chết đói hàng loạt ở max speed
    if (state.foods.length >= 1000) return;
    for (let x=0; x<COLS; x++) { 
        for (let y=0; y<ROWS; y++) { 
            let env = state.envGrid[x][y];
            if ((env.biome === "Đồng cỏ" || env.biome === "Rừng") && env.fertility >= 10) {
                // Tăng tỷ lệ mọc food x10 so với bản cũ
                if (Math.random() < 0.005 && !state.foods.find(f=>f.x===x&&f.y===y)) state.foods.push({x,y});
            }
        } 
    }
}

export function rebuildSpatialGrid() {
    state.spatialGrid = {};
    state.npcs.forEach(n => {
        let cx = Math.floor(n.x / SPATIAL_CHUNK);
        let cy = Math.floor(n.y / SPATIAL_CHUNK);
        let key = `${cx},${cy}`;
        if (!state.spatialGrid[key]) state.spatialGrid[key] = [];
        state.spatialGrid[key].push(n);
    });
}

export function getNpcsInRadius(x, y, radius) {
    let result = [];
    let startCx = Math.floor((x - radius) / SPATIAL_CHUNK);
    let endCx = Math.floor((x + radius) / SPATIAL_CHUNK);
    let startCy = Math.floor((y - radius) / SPATIAL_CHUNK);
    let endCy = Math.floor((y + radius) / SPATIAL_CHUNK);
    
    for (let cx = startCx; cx <= endCx; cx++) {
        for (let cy = startCy; cy <= endCy; cy++) {
            let chunk = state.spatialGrid[`${cx},${cy}`];
            if (chunk) {
                for (let n of chunk) {
                    if (Math.hypot(n.x - x, n.y - y) <= radius) result.push(n);
                }
            }
        }
    }
    return result;
}
