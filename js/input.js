import { state } from './gameState.js';
import { canvas } from './renderer.js';
import { getWorldPos, centerCamera } from './camera.js';
import { COLS, ROWS, TERRAIN, WORLD_WIDTH, WORLD_HEIGHT } from './config.js';
import { playSound } from './utils.js';
import { createNpc } from './entities/npc.js';
import { spawnEffect } from './systems/godPowerSystem.js';
import { inspectObject } from './ui.js';

export const keys = {};

export function setupInput() {
    window.addEventListener('keydown', e => keys[e.key] = true);
    window.addEventListener('keyup', e => keys[e.key] = false);
    
    canvas.addEventListener('mousedown', e => {
        if (e.button === 2 || e.button === 1 || keys[' ']) { 
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
        
        if (state.camera.zoom < 0.2) state.camera.zoom = 0.2;
        if (state.camera.zoom > 3) state.camera.zoom = 3;
        
        state.camera.x = mouseX - worldX * state.camera.zoom;
        state.camera.y = mouseY - worldY * state.camera.zoom;
    }, {passive: false});
    
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    
    setInterval(() => {
        let speed = 10 / state.camera.zoom;
        if (keys['w'] || keys['W']) state.camera.y += speed * state.camera.zoom;
        if (keys['s'] || keys['S']) state.camera.y -= speed * state.camera.zoom;
        if (keys['a'] || keys['A']) state.camera.x += speed * state.camera.zoom;
        if (keys['d'] || keys['D']) state.camera.x -= speed * state.camera.zoom;
    }, 16);
    
    document.getElementById('btn-reset-cam').addEventListener('click', () => {
        centerCamera(WORLD_WIDTH/2, WORLD_HEIGHT/2);
    });
}

function handleCanvasClick(e, isDrag = false) {
    let { x, y, wx, wy } = getWorldPos(e);
    if (x<0 || x>=COLS || y<0 || y>=ROWS) return;
    
    let isInspectTab = document.querySelector('.tab-btn[data-target="tab-inspect"]').classList.contains('active');
    if (isInspectTab && !isDrag) {
        inspectObject(x, y, wx, wy);
    }

    if (state.god.divinePower < 1 && ['bless','curse','heal','fertile','purify','mua','set','bao','plague','volcano','meteor'].includes(state.currentTool)) return;

    if (state.currentTool === 'dat') { state.grid[x][y] = TERRAIN.DAT; state.envGrid[x][y].biome = "Đồng cỏ"; }
    else if (state.currentTool === 'nuoc') { state.grid[x][y] = TERRAIN.NUOC; state.envGrid[x][y].biome = "Nước"; }
    else if (state.currentTool === 'rung') { state.grid[x][y] = TERRAIN.RUNG; state.envGrid[x][y].biome = "Rừng"; }
    else if (state.currentTool === 'nui') { state.grid[x][y] = TERRAIN.NUI; state.envGrid[x][y].biome = "Núi"; }
    else if (state.currentTool === 'xoa') {
        let nIdx = state.npcs.findIndex(n => Math.abs(n.x - x) <= 1 && Math.abs(n.y - y) <= 1);
        if (nIdx !== -1) state.npcs.splice(nIdx, 1);
        let hIdx = state.houses.findIndex(h => h.x === x && h.y === y);
        if (hIdx !== -1) state.houses.splice(hIdx, 1);
        let bIdx = state.buildings.findIndex(b => b.x === x && b.y === y);
        if (bIdx !== -1) state.buildings.splice(bIdx, 1);
        let fIdx = state.foods.findIndex(f => f.x === x && f.y === y);
        if (fIdx !== -1) state.foods.splice(fIdx, 1);
    }
    else if (state.currentTool === 'nguoi' && !isDrag) {
        if (state.grid[x][y] !== TERRAIN.NUOC && state.grid[x][y] !== TERRAIN.NUI) {
            createNpc(x, y);
            playSound("create_person");
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
