import { state } from './gameState.js';
import { COLS, ROWS, TERRAIN, TILE_SIZE } from './config.js';
import { createTextures, draw, updateParticles, canvas } from './renderer.js';
import { setupInput } from './input.js';
import { setupUIEvents } from './ui.js';
import { logEvent } from './systems/historySystem.js';
import { advanceDay } from './systems/timeSystem.js';
import { updateDailyLogic, updateNpcsTick } from './systems/npcSystem.js';
import { rebuildSpatialGrid } from './systems/worldSystem.js';
import { updateTribeLogic } from './systems/tribeSystem.js';
import { updateKingdomLogic } from './systems/kingdomSystem.js';
import { updateGodLogic } from './systems/godPowerSystem.js';
import { updateRoutine } from './systems/routineSystem.js';
import { updateRelationships } from './systems/relationshipSystem.js';
import { updatePossessionTick } from './systems/possessionSystem.js';
import { saveGame } from './saveLoad.js';
import { centerCamera } from './camera.js';

function resizeCanvas() {
    let mainView = document.getElementById('main-view');
    
    let centerWorldX = (canvas.width / 2 - state.camera.x) / state.camera.zoom;
    let centerWorldY = (canvas.height / 2 - state.camera.y) / state.camera.zoom;
    
    canvas.width = mainView.clientWidth;
    canvas.height = mainView.clientHeight;
    
    if (!isNaN(centerWorldX) && !isNaN(centerWorldY) && canvas.width > 0) {
        state.camera.x = canvas.width / 2 - centerWorldX * state.camera.zoom;
        state.camera.y = canvas.height / 2 - centerWorldY * state.camera.zoom;
    }
}

function init() {
    resizeCanvas(); window.addEventListener('resize', resizeCanvas);
    let mainView = document.getElementById('main-view');
    if (window.ResizeObserver) new ResizeObserver(resizeCanvas).observe(mainView);
    createTextures();
    
    for (let x=0; x<COLS; x++) { 
        state.grid[x]=[]; state.envGrid[x]=[]; state.territoryGrid[x]=[];
        for (let y=0; y<ROWS; y++) {
            state.grid[x][y]=TERRAIN.NUOC; 
            state.envGrid[x][y]={ temperature: 20, humidity: 80, fertility: 10, pollution: 0, biome: "Nước" };
            state.territoryGrid[x][y]=null;
        } 
    }
    
    let centerX = COLS/2, centerY = ROWS/2;
    centerCamera(centerX * TILE_SIZE, centerY * TILE_SIZE);
    
    logEvent("Thế giới nước đã được tạo ra. Hãy tự vẽ các hòn đảo của riêng bạn!");
    setupInput();
    setupUIEvents();
    
    setInterval(() => {
        if (state.settings.autoSave && !state.hasEnded) { saveGame(); }
    }, 60000);
    
    requestAnimationFrame(gameLoop);
}

let lastTime = 0;
function gameLoop(timestamp) {
    let dt = timestamp - lastTime; lastTime = timestamp;
    if (dt > 100) dt = 16;
    
    let loops = state.time.speedMultiplier === 1000 ? 50 : state.time.speedMultiplier; 
    
    let t0 = performance.now();
    for(let i=0; i<loops; i++) {
        state.ticks++;
        state.time.frames++;
        
        if (state.ticks % 5 === 0) rebuildSpatialGrid();
        
        if (state.time.frames >= state.time.framesPerDay) {
            state.time.frames = 0; advanceDay(); 
            updateDailyLogic(); updateTribeLogic(); updateKingdomLogic(); updateGodLogic();
        }
        
        for (let j = state.effects.length - 1; j >= 0; j--) {
            let e = state.effects[j]; e.life--;
            if (e.life <= 0) state.effects.splice(j, 1);
        }
        
        updateRoutine();
        updateRelationships();
        updateParticles();
        updateNpcsTick();
        updatePossessionTick();
    }
    let t1 = performance.now();
    
    let t2 = performance.now();
    draw(); 
    let t3 = performance.now();
    
    if (state.settings.showDebug) {
        document.getElementById('dbg-fps').innerText = Math.round(1000/dt);
        document.getElementById('dbg-time').innerText = state.time.speedMultiplier;
        document.getElementById('dbg-npcs').innerText = state.npcs.length;
        document.getElementById('dbg-houses').innerText = state.houses.length;
        document.getElementById('dbg-tribes').innerText = state.tribes.length;
        document.getElementById('dbg-kingdoms').innerText = state.kingdoms.length;
        document.getElementById('dbg-effects').innerText = state.effects.length;
        document.getElementById('dbg-particles').innerText = state.particles.length;
        document.getElementById('dbg-camx').innerText = Math.round(state.camera.x);
        document.getElementById('dbg-camy').innerText = Math.round(state.camera.y);
        document.getElementById('dbg-camz').innerText = state.camera.zoom.toFixed(2);
        document.getElementById('dbg-updtime').innerText = (t1-t0).toFixed(1);
        document.getElementById('dbg-rentime').innerText = (t3-t2).toFixed(1);
    }
    
    requestAnimationFrame(gameLoop);
}

// Start game
init();
