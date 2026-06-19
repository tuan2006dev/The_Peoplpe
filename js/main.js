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
import { updateDiplomacy } from './systems/diplomacySystem.js';
import { updateMonsters } from './systems/monsterSystem.js';
import { updateNeutrals } from './systems/neutralSystem.js';
import { updateEcosystem, initResources } from './systems/ecosystemSystem.js';
import { updateSpirits } from './systems/spiritSystem.js';
import { updateBosses } from './systems/bossSystem.js';
import { updateGodLogic } from './systems/godPowerSystem.js';
import { updateTechnologyLogic } from './systems/technologySystem.js';
import { updateTradeLogic } from './systems/tradeSystem.js';
import { updateWarLogic } from './systems/warSystem.js';
import { updateReligionLogic } from './systems/religionSystem.js';
import { updateDisasterLogic } from './systems/disasterSystem.js';
import { updateEnvironmentLogic } from './systems/environmentSystem.js';
import { updateFamilyLogic } from './systems/familySystem.js';
import { updateRoutine } from './systems/routineSystem.js';
import { updateRelationships } from './systems/relationshipSystem.js';
import { updatePossessionTick } from './systems/possessionSystem.js';
import { saveGame } from './saveLoad.js';
import { centerCamera } from './camera.js';
import { initTutorial, updateTutorialTick } from './ui/tutorial.js';
import { runAutomatedTest } from './tests/automatedTest.js';

window.runAutomatedTest = runAutomatedTest;

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

    // Generate map with 15 biomes
function _generateMapContent() {
    function noise(nx, ny) {
        return (Math.sin(nx * 10) + Math.cos(ny * 10) + Math.sin((nx + ny) * 5) + 3) / 6;
    }
    
    for (let x=0; x<COLS; x++) { 
        state.grid[x]=[]; state.envGrid[x]=[]; state.territoryGrid[x]=[];
        for (let y=0; y<ROWS; y++) {
            let nx = x/COLS - 0.5, ny = y/ROWS - 0.5;
            let d = Math.hypot(nx, ny) * 2; // distance from center (0 to 1.4)
            let height = noise(nx*2, ny*2) + noise(nx*4, ny*4)*0.5 + noise(nx*8, ny*8)*0.25;
            height = height / 1.75; // normalize to 0-1
            height -= d * 0.3; // Make it an island
            
            let moisture = noise(nx*3 + 10, ny*3 + 10);
            let heat = 1.0 - Math.abs(ny * 2); // Equator is hot
            
            let biome = "Vùng nước sâu";
            let terrainType = TERRAIN.NUOC;
            
            if (height < 0.2) biome = "Vực thẳm";
            else if (height < 0.3) biome = "Vùng nước sâu";
            else if (height < 0.4) { biome = moisture > 0.6 ? "Rạn san hô" : "Vùng nước nông"; }
            else if (height < 0.45) { biome = moisture > 0.6 ? "Rừng ngập mặn" : "Bãi biển"; terrainType = TERRAIN.DAT; }
            else if (height > 0.75) { 
                terrainType = TERRAIN.NUI;
                if (heat < 0.3) biome = "Băng nguyên";
                else if (heat > 0.8 && moisture < 0.4) biome = "Núi lửa";
                else biome = "Núi đá";
            }
            else {
                terrainType = TERRAIN.DAT;
                if (heat < 0.3) biome = "Băng nguyên";
                else if (heat > 0.7 && moisture < 0.4) biome = "Sa mạc";
                else if (heat > 0.6 && moisture > 0.6) { biome = "Rừng già"; terrainType = TERRAIN.RUNG; }
                else if (moisture < 0.3) biome = "Đất hoang";
                else if (moisture > 0.5) biome = "Đồng bằng";
                else biome = "Đồi cỏ";
                
                if (terrainType === TERRAIN.DAT && biome === "Rừng già") terrainType = TERRAIN.RUNG;
            }
            
            state.grid[x][y] = terrainType;
            state.envGrid[x][y] = { temperature: heat * 40, humidity: moisture * 100, fertility: 50, pollution: 0, biome: biome };
            state.territoryGrid[x][y] = null;
        } 
    }
}

export function generateRandomMap() {
    state.npcs = []; state.houses = []; state.tribes = []; state.kingdoms = []; state.deadNpcs = []; state.religions = [];
    state.bossTracking = { activeBosses: [], waterCorpses: 0, corruptedTiles: 0 };
    _generateMapContent();
    let centerX = COLS/2, centerY = ROWS/2;
    centerCamera(centerX * TILE_SIZE, centerY * TILE_SIZE);
    
    // Xóa bớt tài nguyên cũ và sinh lại
    state.resources = [];
    initResources();
    logEvent("Một thế giới mới vừa được hình thành ngẫu nhiên!");
}

export function clearMapToWater() {
    state.npcs = []; state.houses = []; state.tribes = []; state.kingdoms = []; state.deadNpcs = []; state.religions = [];
    state.bossTracking = { activeBosses: [], waterCorpses: 0, corruptedTiles: 0 };
    for (let x=0; x<COLS; x++) {
        for (let y=0; y<ROWS; y++) {
            state.grid[x][y] = TERRAIN.NUOC;
            state.envGrid[x][y] = { temperature: 20, humidity: 100, fertility: 0, pollution: 0, biome: "Vùng nước sâu" };
            state.territoryGrid[x][y] = null;
        }
    }
    state.resources = [];
    logEvent("Thế giới đã bị nhấn chìm vào Biển Cả! Hãy tự vẽ lục địa của riêng bạn.");
}

function init() {
    resizeCanvas(); window.addEventListener('resize', resizeCanvas);
    let mainView = document.getElementById('main-view');
    if (window.ResizeObserver) new ResizeObserver(resizeCanvas).observe(mainView);
    createTextures();
    
    _generateMapContent();
    
    let centerX = COLS/2, centerY = ROWS/2;
    centerCamera(centerX * TILE_SIZE, centerY * TILE_SIZE);
    
    initResources(); // Sinh tài nguyên rải rác trên bản đồ
    
    logEvent("Thế giới nước đã được tạo ra. Hãy tự vẽ các hòn đảo của riêng bạn!");
    setupInput();
    setupUIEvents();
    initTutorial();
    
    setInterval(() => {
        if (state.settings.autoSave && !state.hasEnded) { saveGame(); }
    }, 60000);
    
    requestAnimationFrame(gameLoop);
}

export function doOneTick() {
    state.ticks++;
    state.time.frames++;
    
    if (state.ticks % 5 === 0) rebuildSpatialGrid();
    
    if (state.time.frames >= state.time.framesPerDay) {
        state.time.frames = 0; advanceDay(); 
        updateDailyLogic(); updateTribeLogic(); updateKingdomLogic(); updateGodLogic();
        updateTechnologyLogic(); updateTradeLogic(); updateWarLogic(); updateReligionLogic();
        updateDisasterLogic(); updateEnvironmentLogic(); updateFamilyLogic();
    }
    
    updateDiplomacy();
    updateMonsters();
    updateNeutrals();
    updateEcosystem();
    updateSpirits();
    updateBosses();
    
    for (let j = state.effects.length - 1; j >= 0; j--) {
        let e = state.effects[j]; e.life--;
        if (e.life <= 0) state.effects.splice(j, 1);
    }
    
    updateRoutine();
    updateRelationships();
    updateParticles();
    updateTutorialTick();

    if (state.possession && state.possession.active) updatePossessionTick();
    updateNpcsTick();
}

let lastTime = 0;
let fpsUpdateCounter = 0;
let fpsDisplayElem = null;
function gameLoop(timestamp) {
    let dt = timestamp - lastTime; lastTime = timestamp;
    if (dt > 100) dt = 16;
    
    let loops = state.time.speedMultiplier === 1000 ? 50 : state.time.speedMultiplier; 
    
    let t0 = performance.now();
    for(let i=0; i<loops; i++) {
        doOneTick();
    }
    let t1 = performance.now();
    
    let t2 = performance.now();
    draw(); 
    let t3 = performance.now();
    
    fpsUpdateCounter++;
    if (fpsUpdateCounter > 15) {
        if (!fpsDisplayElem) fpsDisplayElem = document.getElementById('fps-display');
        if (fpsDisplayElem) fpsDisplayElem.innerText = Math.round(1000/dt) + " FPS";
        fpsUpdateCounter = 0;
    }
    
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
