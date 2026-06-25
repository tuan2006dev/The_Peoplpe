import { state } from './gameState.js';
import { canvas, invalidateTerrain } from './renderer.js';
import { getWorldPos, centerCamera } from './camera.js';
import { COLS, ROWS, TERRAIN, WORLD_WIDTH, WORLD_HEIGHT } from './config.js';
import { playSound } from './utils.js';
import { createNpc } from './entities/npc.js';
import { spawnEffect } from './systems/godPowerSystem.js';
import { spawnResourceOnTile } from './systems/ecosystemSystem.js';
import { inspectObject } from './ui.js';

export const keys = {};

export function setupInput() {
    window.addEventListener('keydown', e => {
        keys[e.key] = true;
        let k = e.key.toLowerCase();
        if (state.possession.active) {
            if (['w', 'a', 's', 'd'].includes(k)) state.possession.keys[k] = true;
            if (k === 'escape') {
                import('./systems/possessionSystem.js').then(m => m.exitPossession());
            }
            if (k === 'e') {
                import('./systems/possessionSystem.js').then(m => m.handleInteract());
            }
            if (k === 'q') {
                import('./systems/possessionSystem.js').then(m => m.handleQuickAction());
            }
        }
    });
    window.addEventListener('keyup', e => {
        keys[e.key] = false;
        let k = e.key.toLowerCase();
        if (state.possession.active) {
            if (['w', 'a', 's', 'd'].includes(k)) state.possession.keys[k] = false;
        }
    });
    
    canvas.addEventListener('mousedown', e => {
        if (e.button === 2) {
            if (state.possession.active) {
                let { x, y } = getWorldPos(e);
                state.possession.targetX = x;
                state.possession.targetY = y;
            } else {
                state.isCameraDragging = true;
                state.camDragStartX = e.clientX;
                state.camDragStartY = e.clientY;
            }
        } else if (e.button === 1 || keys[' ']) { 
            state.isCameraDragging = true;
            state.camDragStartX = e.clientX;
            state.camDragStartY = e.clientY;
        } else if (e.button === 0) {
            state.isMouseDragging = true;
            handleCanvasClick(e, false);
        }
    });
    
    let minimap = document.getElementById('minimap-container');
    if (minimap) {
        minimap.addEventListener('mousedown', e => {
            if (e.button === 0) {
                state.isMinimapDragging = true;
                handleMinimapClick(e);
            }
        });
    }
    
    window.addEventListener('mousemove', e => {
        let { x, y } = getWorldPos(e);
        state.hoverX = x; state.hoverY = y;

        if (state.isCameraDragging) {
            let dx = e.clientX - state.camDragStartX;
            let dy = e.clientY - state.camDragStartY;
            state.camera.x += dx; state.camera.y += dy;
            state.camDragStartX = e.clientX; state.camDragStartY = e.clientY;
        } else if (state.isMouseDragging) {
            handleCanvasClick(e, true);
        } else if (state.isMinimapDragging) {
            handleMinimapClick(e);
        }
    });
    
    window.addEventListener('mouseup', e => {
        if (e.button === 2 || e.button === 1 || keys[' ']) state.isCameraDragging = false;
        if (e.button === 0) {
            state.isMouseDragging = false;
            state.isMinimapDragging = false;
        }
    });
    
    canvas.addEventListener('wheel', e => {
        e.preventDefault();
        let mouseX = e.clientX - canvas.getBoundingClientRect().left;
        let mouseY = e.clientY - canvas.getBoundingClientRect().top;
        let worldX = (mouseX - state.camera.x) / state.camera.zoom;
        let worldY = (mouseY - state.camera.y) / state.camera.zoom;
        
        let zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        state.camera.zoom *= zoomFactor;
        
        if (state.camera.zoom < 0.3) state.camera.zoom = 0.3;
        if (state.camera.zoom > 3) state.camera.zoom = 3;
        
        state.camera.x = mouseX - worldX * state.camera.zoom;
        state.camera.y = mouseY - worldY * state.camera.zoom;
    }, {passive: false});
    
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    
    setInterval(() => {
        if (!state.possession.active) {
            let speed = 10 / state.camera.zoom;
            if (keys['w'] || keys['W']) state.camera.y += speed * state.camera.zoom;
            if (keys['s'] || keys['S']) state.camera.y -= speed * state.camera.zoom;
            if (keys['a'] || keys['A']) state.camera.x += speed * state.camera.zoom;
            if (keys['d'] || keys['D']) state.camera.x -= speed * state.camera.zoom;
        }
    }, 16);
    
    document.getElementById('btn-reset-cam').addEventListener('click', () => {
        centerCamera(WORLD_WIDTH/2, WORLD_HEIGHT/2);
    });
}

function handleCanvasClick(e, isDrag = false) {
    let { x, y, wx, wy } = getWorldPos(e);
    if (x<0 || x>=COLS || y<0 || y>=ROWS) return;
    
    if (!state.currentTool && !isDrag) {
        // Auto-switch to inspect tab if no tool selected
        let inspectBtn = document.querySelector('.tab-btn[data-target="tab-inspect"]');
        if (inspectBtn) inspectBtn.click();
        inspectObject(x, y, wx, wy);
        return; 
    }

    if (state.god.divinePower < 1 && ['bless','curse','heal','fertile','purify','mua','set','bao','plague','volcano','meteor'].includes(state.currentTool)) return;

    let brushSize = parseInt(document.getElementById('brush-size') ? document.getElementById('brush-size').value : 1);
    
    let applyTerrain = (tx, ty, terrainType, biomeName) => {
        if (tx >= 0 && tx < COLS && ty >= 0 && ty < ROWS) {
            state.grid[tx][ty] = terrainType;
            state.envGrid[tx][ty].biome = biomeName;
            
            // Xóa tài nguyên cũ trên ô đó nếu có
            let resIdx = state.resources.findIndex(r => r.x === tx && r.y === ty);
            if (resIdx !== -1) state.resources.splice(resIdx, 1);
            
            // Tỷ lệ sinh tài nguyên cao hơn khi vẽ tay (x3 = 6%)
            spawnResourceOnTile(tx, ty, biomeName, 3.0);

            if (biomeName === 'Đồng cỏ') state.envGrid[tx][ty].fertility = 50;
            else if (biomeName === 'Rừng') state.envGrid[tx][ty].fertility = 80;
            else if (biomeName === 'Đầm lầy') state.envGrid[tx][ty].fertility = 30;
            else if (biomeName === 'Nước') state.envGrid[tx][ty].fertility = 10;
            else state.envGrid[tx][ty].fertility = 0;
            invalidateTerrain();
        }
    };

    let brushApply = (terrainType, biomeName) => {
        for(let i = -Math.floor(brushSize/2); i <= Math.floor(brushSize/2); i++) {
            for(let j = -Math.floor(brushSize/2); j <= Math.floor(brushSize/2); j++) {
                if (Math.hypot(i, j) <= brushSize/2) applyTerrain(x + i, y + j, terrainType, biomeName);
            }
        }
    };

    if (state.currentTool === 'dat') brushApply(TERRAIN.DAT, "Đồng bằng");
    else if (state.currentTool === 'nuoc') brushApply(TERRAIN.NUOC, "Vùng nước nông");
    else if (state.currentTool === 'rung') brushApply(TERRAIN.RUNG, "Rừng già");
    else if (state.currentTool === 'nui') brushApply(TERRAIN.NUI, "Núi đá");
    else if (state.currentTool === 'cat') brushApply(TERRAIN.CAT, "Sa mạc");
    else if (state.currentTool === 'tuyet') brushApply(TERRAIN.TUYET, "Băng nguyên");
    else if (state.currentTool === 'damlay') brushApply(TERRAIN.DAM_LAY, "Đầm lầy");
    else if (state.currentTool === 'volcanoland') brushApply(TERRAIN.NUI, "Núi lửa");
    else if (state.currentTool === 'raise') {
        for(let i = -Math.floor(brushSize/2); i <= Math.floor(brushSize/2); i++) {
            for(let j = -Math.floor(brushSize/2); j <= Math.floor(brushSize/2); j++) {
                if (Math.hypot(i, j) <= brushSize/2) {
                    let tx = x + i, ty = y + j;
                    if(tx>=0&&tx<COLS&&ty>=0&&ty<ROWS) {
                        if(state.grid[tx][ty]===TERRAIN.NUOC) applyTerrain(tx, ty, TERRAIN.DAT, "Bãi biển");
                        else if(state.grid[tx][ty]===TERRAIN.DAT || state.grid[tx][ty]===TERRAIN.RUNG || state.grid[tx][ty]===TERRAIN.CAT || state.grid[tx][ty]===TERRAIN.DAM_LAY) applyTerrain(tx, ty, TERRAIN.NUI, "Đồi cỏ");
                    }
                }
            }
        }
    }
    else if (state.currentTool === 'lower') {
        for(let i = -Math.floor(brushSize/2); i <= Math.floor(brushSize/2); i++) {
            for(let j = -Math.floor(brushSize/2); j <= Math.floor(brushSize/2); j++) {
                if (Math.hypot(i, j) <= brushSize/2) {
                    let tx = x + i, ty = y + j;
                    if(tx>=0&&tx<COLS&&ty>=0&&ty<ROWS) {
                        if(state.grid[tx][ty]===TERRAIN.NUI) applyTerrain(tx, ty, TERRAIN.DAT, "Đất hoang");
                        else if(state.grid[tx][ty]===TERRAIN.DAT || state.grid[tx][ty]===TERRAIN.RUNG || state.grid[tx][ty]===TERRAIN.CAT || state.grid[tx][ty]===TERRAIN.DAM_LAY) applyTerrain(tx, ty, TERRAIN.NUOC, "Vùng nước nông");
                    }
                }
            }
        }
    }
    else if (state.currentTool === 'xoa') {
        for(let i = -Math.floor(brushSize/2); i <= Math.floor(brushSize/2); i++) {
            for(let j = -Math.floor(brushSize/2); j <= Math.floor(brushSize/2); j++) {
                if (Math.hypot(i, j) <= brushSize/2) {
                    let tx = x + i, ty = y + j;
                    let nIdx = state.npcs.findIndex(n => Math.abs(n.x - tx) <= 1 && Math.abs(n.y - ty) <= 1);
                    if (nIdx !== -1) state.npcs.splice(nIdx, 1);
                    let hIdx = state.houses.findIndex(h => h.x === tx && h.y === ty);
                    if (hIdx !== -1) state.houses.splice(hIdx, 1);
                    let bIdx = state.buildings.findIndex(b => b.x === tx && b.y === ty);
                    if (bIdx !== -1) state.buildings.splice(bIdx, 1);
                    let fIdx = state.foods.findIndex(f => f.x === tx && f.y === ty);
                    if (fIdx !== -1) state.foods.splice(fIdx, 1);
                }
            }
        }
    }
    else if (state.currentTool === 'nguoi' && !isDrag) {
        if (state.grid[x][y] !== TERRAIN.NUOC && state.grid[x][y] !== TERRAIN.NUI) {
            let raceSel = document.getElementById('spawn-race-select');
            let race = raceSel ? raceSel.value : 'random';
            if (race && race.startsWith('boss_')) {
                let bossId = race.replace('boss_', '');
                import('./systems/bossSystem.js').then(m => m.spawnBoss(x, y, bossId));
                playSound("create_person");
            } else {
                createNpc(x, y, null, null, race === 'random' ? null : race);
                playSound("create_person");
            }
        }
    }
    else if (state.currentTool === 'bless' && !isDrag) { state.god.divinePower-=5; spawnEffect('bless', x, y, 30); playSound("bless"); }
    else if (state.currentTool === 'curse' && !isDrag) { state.god.divinePower-=5; spawnEffect('curse', x, y, 30); playSound("curse"); }
    else if (state.currentTool === 'heal' && !isDrag) { state.god.divinePower-=10; spawnEffect('heal', x, y, 30); playSound("heal"); }
    else if (state.currentTool === 'fertile' && !isDrag) { state.god.divinePower-=20; spawnEffect('fertile', wx, wy, 120); playSound("fertile"); }
    else if (state.currentTool === 'mua' && !isDrag) { state.god.divinePower-=10; state.effects.push({type:'mua', x:wx, y:wy, radius:100, life:300}); playSound("rain"); }
    else if (state.currentTool === 'set' && !isDrag) { state.god.divinePower-=5; state.effects.push({type:'set', x:wx, y:wy, radius:30, life:10}); playSound("lightning"); }
    else if (state.currentTool === 'bao' && !isDrag) { state.god.divinePower-=50; state.effects.push({type:'bao', x:wx, y:wy, radius:150, life:500}); playSound("storm"); }
    else if (state.currentTool === 'plague' && !isDrag) { state.god.divinePower-=30; state.effects.push({type:'plague', x:wx, y:wy, radius:80, life:400}); playSound("plague"); }
    else if (state.currentTool === 'volcano' && !isDrag) { state.god.divinePower-=100; state.activeDisasters.push({type:'volcano', x, y, life:100}); playSound("volcano"); }
}

function handleMinimapClick(e) {
    let minimap = document.getElementById('minimap-container');
    let rect = minimap.getBoundingClientRect();
    let mx = e.clientX - rect.left;
    let my = e.clientY - rect.top;
    
    if (mx < 0) mx = 0; if (mx > rect.width) mx = rect.width;
    if (my < 0) my = 0; if (my > rect.height) my = rect.height;
    
    let worldX = (mx / 200) * WORLD_WIDTH;
    let worldY = (my / 120) * WORLD_HEIGHT;
    centerCamera(worldX, worldY);
}
