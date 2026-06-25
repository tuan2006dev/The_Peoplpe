import fs from 'fs';

// Mock DOM
global.window = {};
global.document = {
    createElement: () => ({ style: {}, appendChild: () => {}, remove: () => {} }),
    body: { appendChild: () => {} },
    getElementById: (id) => ({ innerText: '', style: {}, classList: { add: () => {}, remove: () => {} }, appendChild: () => {}, getContext: () => ({}) }),
    querySelector: () => ({ classList: { contains: () => false } }),
    querySelectorAll: () => []
};
global.alert = console.log;

import { state } from './js/gameState.js';
import { COLS, ROWS, TERRAIN } from './js/config.js';
import { createNpc } from './js/entities/npc.js';
import { updateCivilizationLogic } from './js/systems/civilizationSystem.js';
import { advanceDay } from './js/systems/timeSystem.js';

let report = [];
function log(msg) { console.log(msg); report.push(msg); }

async function runEraTest() {
    log("=== BẮT ĐẦU TEST CƠ CHẾ THỜI KÌ (ERAS) ===");
    
    // 1. Khởi tạo map
    for (let x=0; x<COLS; x++) { 
        state.grid[x]=[]; state.envGrid[x]=[]; state.territoryGrid[x]=[];
        for (let y=0; y<ROWS; y++) {
            state.grid[x][y] = TERRAIN.DAT; 
            state.envGrid[x][y] = { temperature: 25, humidity: 50, fertility: 50, biome: "Đồng bằng" };
            state.territoryGrid[x][y] = null;
        }
    }
    
    // 2. Ép tạo Kingdom nhanh
    state.kingdoms.push({
        id: 1,
        name: "Test Kingdom",
        color: "#ff0000",
        territory: [],
        capital: { x: 10, y: 10 },
        population: 10,
        militaryPower: 0,
        resources: { wood: 1000, stone: 1000, food: 1000, gold: 1000 },
        civilizationLevel: 1,
        currentEra: "Stone Age",
        eraProgress: 0,
        technologyScore: 0,
        cultureScore: 0,
        scienceScore: 0,
        industrialScore: 0,
        educationScore: 0,
        researchPoints: 0
    });
    
    state.tribes.push({
        id: 1,
        name: "Test Tribe",
        kingdomId: 1,
        population: 10,
        members: []
    });
    
    // Tạo 500 NPC với các job khác nhau
    const jobs = ['Học giả', 'Nhà khoa học', 'Kỹ sư', 'Giáo viên', 'Công nhân'];
    for(let i=0; i<500; i++) {
        let n = createNpc(10, 10);
        n.tribeId = 1;
        n.job = jobs[i % jobs.length];
    }
    
    let k = state.kingdoms[0];
    log(`Vương quốc khởi tạo với Thời đại: ${k.currentEra}`);
    
    function simulateTicksUntilNextEra(maxTicks) {
        let startEra = k.currentEra;
        for(let i=0; i<maxTicks; i++) {
            state.ticks++;
            state.time.frames++;
            if (state.time.frames >= state.time.framesPerDay) {
                state.time.frames = 0; 
                advanceDay(); 
            }
            updateCivilizationLogic();
            
            if (k.currentEra !== startEra) {
                log(`[PASS] Sau ${i} ticks, vương quốc đã tiến vào: ${k.currentEra}`);
                return true;
            }
        }
        return false;
    }
    
    // 3. Vòng lặp mô phỏng nâng cấp qua các thời kì
    for (let i = 0; i < 9; i++) {
        let currentEra = k.currentEra;
        log(`\n--- Đang ở thời kỳ: ${currentEra} ---`);
        
        // Cấp tài nguyên cực lớn để thỏa mãn tất cả requirements của các thời kỳ sau này
        k.population = 10000;
        k.industrialScore += 2000;
        k.scienceScore += 2000;
        k.technologyScore += 2000;
        k.educationScore += 2000;
        k.researchPoints += 5000; // Buff RP mỗi step cho nhanh
        
        // Chạy tối đa 500 ticks để chờ nó up level
        let advanced = simulateTicksUntilNextEra(500);
        
        if (!advanced) {
            log(`[FAIL] Mắc kẹt tại: ${k.currentEra}. Era Progress: ${k.eraProgress}%, RP: ${k.researchPoints}`);
            break; // Stop if it gets stuck
        }
        
        if (k.currentEra === "Space Age") {
            log("\n[SUCCESS] Đã đạt thời kỳ tối cao (Space Age)!");
            break;
        }
    }

    log("\n=== TEST HOÀN TẤT ===");
    fs.writeFileSync('test_era_report.txt', report.join('\n'));
    process.exit(0); // Add exit to prevent hanging from timers or imports
}

runEraTest();
