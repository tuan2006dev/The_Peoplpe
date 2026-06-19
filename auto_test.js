import fs from 'fs';

// Mock DOM
global.window = {};
global.document = {
    createElement: () => ({ style: {}, appendChild: () => {}, remove: () => {} }),
    body: { appendChild: () => {} },
    getElementById: (id) => ({ innerText: '', style: {}, classList: { add: () => {}, remove: () => {} }, appendChild: () => {} }),
    querySelector: () => ({ classList: { contains: () => false } }),
    querySelectorAll: () => []
};
global.alert = console.log;

import { state } from './js/gameState.js';
import { COLS, ROWS, TERRAIN } from './js/config.js';
import { createNpc } from './js/entities/npc.js';

import { updateDailyLogic, updateNpcsTick } from './js/systems/npcSystem.js';
import { updateTribeLogic } from './js/systems/tribeSystem.js';
import { updateKingdomLogic } from './js/systems/kingdomSystem.js';
import { updateDiplomacy } from './js/systems/diplomacySystem.js';
import { updateMonsters } from './js/systems/monsterSystem.js';
import { updateNeutrals } from './js/systems/neutralSystem.js';
import { updateEcosystem } from './js/systems/ecosystemSystem.js';
import { updateSpirits, registerDeath } from './js/systems/spiritSystem.js';
import { updateBosses } from './js/systems/bossSystem.js';
import { advanceDay } from './js/systems/timeSystem.js';

let report = [];
function log(msg) { console.log(msg); report.push(msg); }

async function runAutoTest() {
    log("=== BẮT ĐẦU AUTO TEST TOÀN DIỆN ===");
    
    // 1. Khởi tạo map
    for (let x=0; x<COLS; x++) { 
        state.grid[x]=[]; state.envGrid[x]=[]; state.territoryGrid[x]=[];
        for (let y=0; y<ROWS; y++) {
            state.grid[x][y] = TERRAIN.DAT; 
            state.envGrid[x][y] = { temperature: 25, humidity: 50, fertility: 50, biome: "Đồng bằng" };
            state.territoryGrid[x][y] = null;
        }
    }
    log("Map đã khởi tạo với " + (COLS*ROWS) + " ô Đất.");

    // 2. Sinh ra NPC
    for(let i=0; i<40; i++) {
        let n = createNpc(10 + i%5, 10 + Math.floor(i/5));
        if (i%2 === 1) {
            n.partnerId = state.npcs[i-1].id;
            state.npcs[i-1].partnerId = n.id;
        }
        if (i < 10) {
            state.houses.push({ id: ++state.houseIdCounter, x: n.x, y: n.y, ownerId: n.id, tribeId: null, durability: 100 });
            n.homeId = state.houseIdCounter;
        }
    }
    log("Đã spawn 40 NPC, cấp nhà và ghép đôi để tạo điều kiện lập Bộ lạc.");
    
    function simulateTicks(ticksToRun) {
        for(let i=0; i<ticksToRun; i++) {
            state.ticks++;
            state.time.frames++;
            if (state.time.frames >= state.time.framesPerDay) {
                state.time.frames = 0; advanceDay(); 
                updateDailyLogic(); updateTribeLogic(); updateKingdomLogic(); 
            }
            updateNpcsTick();
            updateDiplomacy(); updateMonsters(); updateNeutrals(); updateEcosystem(); updateSpirits(); updateBosses();
        }
    }

    log("Chạy mô phỏng 3000 ticks để quan sát sự hình thành Bộ lạc...");
    simulateTicks(3000);
    log(`- Số NPC sống sót: ${state.npcs.length}`);
    log(`- Số Bộ lạc (Tribes): ${state.tribes.length}`);
    if (state.tribes.length > 0) log(`[PASS] Cơ chế AI sinh tồn và lập Bộ lạc hoạt động tốt.`); else log(`[FAIL] Không có Bộ lạc nào được lập.`);

    log("Kiểm tra Cơ chế Ngoại giao (Diplomacy)...");
    simulateTicks(500);
    if (state.tribes.length > 0) {
        let diplomacyCount = Object.keys(state.tribes[0].relations || {}).length;
        log(`- Số mối quan hệ ngoại giao đã được thiết lập: ${diplomacyCount}`);
        if (diplomacyCount > 0) log(`[PASS] Các bộ lạc nhận thức được nhau và có quan hệ.`);
    }

    log("Kiểm tra Thảm họa tự nhiên & Boss Titan Đá...");
    for(let i=0; i<10; i++) state.bossTracking.volcanoEruptions++;
    simulateTicks(100);
    let titan = state.bosses.find(b => b.raceId === 'titan');
    if (titan) log(`[PASS] Boss Titan Đá đã thức tỉnh sau 10 lần núi lửa phun trào.`);
    else log(`[FAIL] Boss Titan Đá không thức tỉnh.`);

    log("Kiểm tra Quái vật Thần Thoại (Tier 3) & Lữ Khách Trung Lập (Tier 4)...");
    simulateTicks(2000);
    log(`- Số lượng Quái vật bảo vệ lãnh thổ: ${state.monsters.length}`);
    log(`- Số lượng Thực thể Trung Lập (Thương nhân/Học giả): ${state.neutrals.length}`);
    if (state.monsters.length > 0) log(`[PASS] Hệ thống spawn Quái vật hoạt động.`);
    if (state.neutrals.length > 0) log(`[PASS] Hệ thống Thực thể Trung lập lang thang hoạt động.`);

    log("Kiểm tra Hệ sinh thái Động vật (Tier 5)...");
    log(`- Số lượng Động vật: ${state.animals.length}`);
    if (state.animals.length > 0) log(`[PASS] Động vật hoang dã tự động sinh sôi trên bản đồ.`);

    log("Kiểm tra Hệ thống Tâm linh (Tier 6)...");
    // Giết 15 NPC tại cùng 1 vị trí để trigger ghost
    for(let i=0; i<15; i++) registerDeath(50, 50);
    simulateTicks(30);
    let ghost = state.spirits.find(s => s.raceId === 'ghost');
    if (ghost) log(`[PASS] Oán khí tụ tập -> Linh hồn (Ghost) đã xuất hiện.`);
    else log(`[FAIL] Linh hồn không xuất hiện.`);

    log("Kiểm tra Boss Thực Thể Hư Không (Tier 7) khi spam phép...");
    state.god.miracleCount = 500; state.god.disasterCount = 501;
    simulateTicks(100);
    let voidWyrm = state.bosses.find(b => b.raceId === 'void_wyrm');
    if (voidWyrm) log(`[PASS] Thực Thể Hư Không đã xé rách không gian xuất hiện.`);
    else log(`[FAIL] Thực Thể Hư Không không thức tỉnh.`);

    log("=== TEST HOÀN TẤT ===");
    fs.writeFileSync('test_report.txt', report.join('\n'));
}

runAutoTest();
