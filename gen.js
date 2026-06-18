const fs = require('fs');
const path = require('path');

const files = {
// =========================
// CONFIG
// =========================
"js/config.js": `export const TILE_SIZE = 16;
export const COLS = 200;
export const ROWS = 120;
export const WORLD_WIDTH = COLS * TILE_SIZE;
export const WORLD_HEIGHT = ROWS * TILE_SIZE;
export const TERRAIN = { DAT: 0, NUOC: 1, RUNG: 2, NUI: 3 };
export const COLORS = { [TERRAIN.DAT]: '#2ecc71', [TERRAIN.NUOC]: '#3498db', [TERRAIN.RUNG]: '#27ae60', [TERRAIN.NUI]: '#7f8c8d' };
export const TRIBE_COLORS = ['#e74c3c', '#9b59b6', '#3498db', '#1abc9c', '#f1c40f', '#e67e22', '#ecf0f1', '#ff9ff3', '#00d2d3'];
export const SPATIAL_CHUNK = 10;
export const START_YEAR = 1;
export const MAX_LOGS = 100;
export const SAVE_KEY = 'thePeopleSaveV11';
export const SAVE_VERSION = 11;
export const GAME_SPEEDS = { PAUSE: 0, NORMAL: 1, FAST: 5, VFAST: 10, MAX: 1000 };
`,

// =========================
// DATA
// =========================
"js/data/constants.js": `export const STATES = {
    IDLE: 'idle', WANDERING: 'wandering', SEEKING_FOOD: 'seeking_food', EATING: 'eating',
    RESTING: 'resting', SCARED: 'scared', SEEKING_WOOD: 'seeking_wood', CHOPPING_WOOD: 'chopping_wood',
    BUILDING_HOME: 'building_home', SEEKING_PARTNER: 'seeking_partner', CARING_FAMILY: 'caring_family',
    GATHERING_FOR_TRIBE: 'gathering_for_tribe', PRAYING: 'praying', PREACHING: 'preaching', COMMANDED: 'commanded',
    ATTACKING: 'attacking', DEFENDING: 'defending', FLEEING: 'fleeing', TRAINING: 'training', WORKING_JOB: 'working_job',
    FLEEING_DISASTER: 'fleeing_disaster', REBUILDING: 'rebuilding', TREATING_SICK: 'treating_sick', EVACUATING: 'evacuating', GATHERING_AFTER_DISASTER: 'gathering_after_disaster'
};
export const STATES_TEXT = {
    [STATES.IDLE]: 'Đứng chơi', [STATES.WANDERING]: 'Đi lang thang', [STATES.SEEKING_FOOD]: 'Tìm thức ăn', [STATES.EATING]: 'Đang ăn',
    [STATES.RESTING]: 'Đang nghỉ ngơi', [STATES.SCARED]: 'Sợ hãi', [STATES.SEEKING_WOOD]: 'Tìm gỗ', [STATES.CHOPPING_WOOD]: 'Chặt cây',
    [STATES.BUILDING_HOME]: 'Xây nhà', [STATES.SEEKING_PARTNER]: 'Tìm bạn đời', [STATES.CARING_FAMILY]: 'Chăm sóc gia đình',
    [STATES.GATHERING_FOR_TRIBE]: 'Kiếm tài nguyên', [STATES.PRAYING]: 'Cầu nguyện', [STATES.ATTACKING]: 'Tấn công',
    [STATES.DEFENDING]: 'Phòng thủ', [STATES.FLEEING]: 'Bỏ chạy', [STATES.WORKING_JOB]: 'Đang làm việc', [STATES.FLEEING_DISASTER]: 'Chạy nạn',
    [STATES.REBUILDING]: 'Sửa nhà', [STATES.TREATING_SICK]: 'Chữa bệnh'
};
export const RELATION = { SINGLE: 'Độc thân', SEEKING: 'Tìm bạn đời', PARTNERED: 'Có đôi', FAMILY: 'Có gia đình' };
export const BIOMES = ["Đồng cỏ", "Rừng", "Sa mạc", "Núi", "Đầm lầy", "Tuyết", "Đất chết", "Nước"];
export const BIOME_COLORS = { "Đồng cỏ": "#2ecc71", "Rừng": "#27ae60", "Sa mạc": "#f1c40f", "Núi": "#7f8c8d", "Đầm lầy": "#8e44ad", "Tuyết": "#ecf0f1", "Đất chết": "#95a5a6", "Nước": "#3498db" };
export const SEASONS = ["Xuân", "Hạ", "Thu", "Đông"];
export const AGES = ["Thời kỳ nguyên thủy", "Thời kỳ bộ lạc", "Thời kỳ nông nghiệp", "Thời kỳ vương quốc", "Thời kỳ trung cổ"];
`,

"js/data/names.js": `export const PERSONALITIES = ["Hiền lành", "Tham vọng", "Cứng đầu", "Sợ hãi", "Tò mò", "Lãnh đạo"];
export const REL_NAMES = ["Light of The People", "Order of Dawn", "Faith of the Sky", "Children of the Creator", "The Silent Eye", "Flame Covenant"];
export const TRIBE_NAMES = ["Dawn Tribe", "River Clan", "Stone People", "Sky Village", "Flame Tribe", "Moon Folk", "Iron Camp"];
export const FAMILY_NAMES = ["Dawn", "River", "Stone", "Sky", "Flame", "Wood", "Iron", "Moon"];
export const KINGDOM_NAMES = ["Đế quốc Mặt Trời", "Vương quốc Thép", "Liên bang Tự do", "Cộng hòa Biển Xanh", "Thần quốc Vĩnh Hằng"];
`,

"js/data/jobs.js": `export const JOBS = ["Trẻ em", "Vô nghiệp", "Nông dân", "Thợ săn", "Thợ xây", "Chiến binh", "Thầy tu", "Nhà nghiên cứu", "Thương nhân", "Thợ rèn", "Bác sĩ", "Giáo viên"];
`,

"js/data/doctrines.js": `export const DOCTRINES = ["Hòa bình", "Chinh phục", "Cầu nguyện", "Tri thức", "Sinh tồn", "Sợ hãi"];
export const BELIEFS = ["Vô thần", "Nghi ngờ", "Tin có thần", "Sùng đạo", "Cuồng tín", "Sợ thần"];
`,

"js/data/techTree.js": `export const TECH_TREE = [
    { id: 't_fire', name: 'Lửa', category: 'Sinh tồn', cost: 50, req: [], effectDesc: 'Hồi energy nhanh hơn' },
    { id: 't_stone_tools', name: 'Công cụ đá', category: 'Sinh tồn', cost: 80, req: ['t_fire'], effectDesc: 'Thợ săn và thợ xây làm việc hiệu quả hơn' },
    { id: 't_hunting', name: 'Săn bắn', category: 'Sinh tồn', cost: 120, req: ['t_stone_tools'], effectDesc: 'Tìm thức ăn xa hơn' },
    { id: 't_agriculture', name: 'Trồng trọt', category: 'Sinh tồn', cost: 200, req: ['t_hunting'], effectDesc: 'Mở khóa Farm' },
    { id: 't_wood_house', name: 'Nhà gỗ', category: 'Xây dựng', cost: 100, req: ['t_stone_tools'], effectDesc: 'Nhà bền hơn' },
    { id: 't_language', name: 'Ngôn ngữ', category: 'Xã hội', cost: 80, req: [], effectDesc: 'Tăng tốc độ kết bạn' },
    { id: 't_spear', name: 'Giáo mác', category: 'Quân sự', cost: 100, req: ['t_stone_tools'], effectDesc: 'Tăng damage binh lính' },
    { id: 't_ritual', name: 'Nghi lễ', category: 'Tôn giáo', cost: 100, req: [], effectDesc: 'Tăng Faith' }
];
`,

"js/data/endings.js": `export const ENDINGS = []; // Dành cho version sau
`,

// =========================
// STATE
// =========================
"js/gameState.js": `import { START_YEAR } from './config.js';

export const state = {
    grid: [], envGrid: [], 
    npcs: [], effects: [], foods: [], houses: [], tribes: [], buildings: [], religions: [],
    kingdoms: [], diplomacy: [], wars: [], activeDisasters: [],
    god: { divinePower: 100, reputation: 0, fearLevel: 0, mercyLevel: 0, miracleCount: 0, disasterCount: 0 },
    currentTool: 'dat', isMouseDragging: false,
    selectedNpcId: null, selectedHouseId: null, selectedTribeId: null, selectedRelId: null,
    time: { year: START_YEAR, month: 1, day: 1, frames: 0, framesPerDay: 60, speedMultiplier: 1 },
    climate: { season: "Xuân", globalTemp: 25, globalHum: 50, globalFert: 50, globalPol: 0 },
    historyLogs: [], idCounter: 0, houseIdCounter: 0, tribeIdCounter: 0, buildingIdCounter: 0, relIdCounter: 0, kdIdCounter: 0,
    worldHistory: [], legendaryPersons: [], endingProgress: { faithful:0, silent:0, dead:0, heaven:0, burning:0, gods:0, observer:0 },
    hasEnded: false,
    camera: { x: 0, y: 0, zoom: 1 },
    isCameraDragging: false, camDragStartX: 0, camDragStartY: 0,
    spatialGrid: {}, particles: [], ticks: 0,
    settings: { showGrid: false, showNames: true, showTerritory: true, showEffects: true, pauseOnEnding: true, autoSave: true, sound: false, graphicsQuality: 'High' }
};

export function resetState() {
    state.grid = []; state.envGrid = []; state.npcs = []; state.effects = []; state.foods = []; state.houses = []; state.tribes = []; state.buildings = []; state.religions = []; state.kingdoms = []; state.diplomacy = []; state.wars = []; state.activeDisasters = [];
    state.historyLogs = []; state.worldHistory = []; state.legendaryPersons = []; state.particles = [];
    state.god = { divinePower: 100, reputation: 0, fearLevel: 0, mercyLevel: 0, miracleCount: 0, disasterCount: 0 };
    state.time = { year: START_YEAR, month: 1, day: 1, frames: 0, framesPerDay: 60, speedMultiplier: 1 };
    state.climate = { season: "Xuân", globalTemp: 25, globalHum: 50, globalFert: 50, globalPol: 0 };
    state.idCounter = 0; state.houseIdCounter = 0; state.tribeIdCounter = 0; state.buildingIdCounter = 0; state.relIdCounter = 0; state.kdIdCounter = 0;
    state.ticks = 0; state.hasEnded = false;
    state.selectedNpcId = null; state.selectedHouseId = null; state.selectedTribeId = null; state.selectedRelId = null;
}
`,

// =========================
// ENTITIES
// =========================
"js/entities/npc.js": `import { state } from '../gameState.js';
import { STATES, RELATION } from '../data/constants.js';
import { PERSONALITIES } from '../data/names.js';

export function createNpc(tx, ty) {
    let npc = {
        id: ++state.idCounter, name: "NPC " + state.idCounter,
        x: tx, y: ty, targetX: null, targetY: null,
        health: 100, energy: 100, hunger: 0, age: 16,
        tribeId: null, homeId: null, partnerId: null, childrenIds: [],
        intelligence: 50 + Math.random()*50, bravery: 50 + Math.random()*50,
        faith: 50, fear: 0, devotion: Math.random()*100,
        beliefType: "Vô thần", personality: PERSONALITIES[Math.floor(Math.random() * PERSONALITIES.length)],
        state: STATES.WANDERING, mood: "Bình thường", actionWait: 0,
        relationshipStatus: RELATION.SINGLE, reproductionCooldown: 0, wood: 0,
        job: "Vô nghiệp", isSoldier: false, combatSkill: 10 + Math.random()*40,
        kingdomId: null, isLeader: false, walkCycle: 0
    };
    state.npcs.push(npc);
    return npc;
}
`,

"js/entities/house.js": `export function createHouse() {} // Placeholder
`,
"js/entities/tribe.js": `export function createTribe() {} // Placeholder
`,
"js/entities/kingdom.js": `export function createKingdom() {} // Placeholder
`,
"js/entities/religion.js": `export function createReligion() {} // Placeholder
`,
"js/entities/building.js": `export function createBuilding() {} // Placeholder
`,
"js/entities/effect.js": `export function createEffect() {} // Placeholder
`,

// =========================
// SYSTEMS
// =========================
"js/systems/timeSystem.js": `import { state } from '../gameState.js';

export function advanceDay() {
    state.time.day++; 
    if (state.time.day > 30) { 
        state.time.day = 1; state.time.month++; 
        if (state.time.month > 12) { state.time.month = 1; state.time.year++; } 
    }
    document.getElementById('time-display').innerText = \`Năm \${state.time.year}, Tháng \${state.time.month}, Ngày \${state.time.day}\`;
}
`,

"js/systems/worldSystem.js": `import { state } from '../gameState.js';
import { COLS, ROWS, SPATIAL_CHUNK } from '../config.js';

export function spawnFood() {
    // Tăng giới hạn food từ 150 lên 1000 để tránh chết đói hàng loạt ở max speed
    if (state.foods.length >= 1000) return;
    for (let x=0; x<COLS; x++) { 
        for (let y=0; y<ROWS; y++) { 
            let env = state.envGrid[x][y];
            if ((env.biome === "Đồng cỏ" || env.biome === "Rừng") && env.fertility > 20) {
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
        let key = \`\${cx},\${cy}\`;
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
            let chunk = state.spatialGrid[\`\${cx},\${cy}\`];
            if (chunk) {
                for (let n of chunk) {
                    if (Math.hypot(n.x - x, n.y - y) <= radius) result.push(n);
                }
            }
        }
    }
    return result;
}
`,

"js/systems/historySystem.js": `import { state } from '../gameState.js';

export function logEvent(msg) {
    state.historyLogs.push({ time: \`Năm \${state.time.year}, T\${state.time.month}, N\${state.time.day}\`, msg: msg });
    if (state.historyLogs.length > 100) state.historyLogs.shift();
    let notif = document.createElement('div');
    notif.className = 'notif-msg';
    notif.innerText = msg;
    document.getElementById('notification-area').appendChild(notif);
    setTimeout(() => { if(notif.parentNode) notif.parentNode.removeChild(notif); }, 5000);
}
`,

"js/systems/npcSystem.js": `import { state } from '../gameState.js';
import { determineJob, determineBelief, determineMood, determineState, executeState } from './aiSystem.js';
import { spawnFood } from './worldSystem.js';

export function updateNpcsTick() {
    for (let i = 0; i < state.npcs.length; i++) {
        let npc = state.npcs[i];
        
        if (npc.targetX !== null && npc.targetY !== null) npc.walkCycle += 0.2;
        else npc.walkCycle = 0;
        
        if (npc.actionWait > 0) npc.actionWait--;
        
        if ((state.ticks + i) % 5 === 0) {
            determineState(npc);
            executeState(npc);
        }
    }
}

export function updateDailyLogic() {
    let hasRain = state.effects.some(e=>e.type==='mua');
    if (state.time.frames === 0) { spawnFood(); }
    
    for (let i = 0; i < state.npcs.length; i++) {
        let npc = state.npcs[i];
        npc.age += 1/360; 
        if(npc.reproductionCooldown>0) npc.reproductionCooldown--; 
        
        determineJob(npc);
        determineBelief(npc); 
        determineMood(npc); 
        
        npc.hunger += 1; if(npc.hunger>100) npc.hunger=100;
        if(npc.hunger>=80) npc.health-=3; else if(npc.hunger<30 && npc.energy>50 && npc.health<100) npc.health+=2;
        if(npc.age>=65) npc.health-=0.5;
        
        if(npc.faith > 100) npc.faith = 100; if(npc.fear < 0) npc.fear = 0; if(npc.fear > 100) npc.fear = 100;
        if(npc.energy<0) npc.energy=0; if(npc.health>100) npc.health=100;
        
        if (npc.health <= 0) {
            if (npc.id === state.selectedNpcId) state.selectedNpcId = null;
            if (npc.homeId) { let h = state.houses.find(x=>x.id===npc.homeId); if(h) h.ownerId = null; }
        }
    }
    
    // Remove dead
    state.npcs = state.npcs.filter(n => n.health > 0);
}
`,

"js/systems/aiSystem.js": `import { state } from '../gameState.js';
import { STATES, RELATION, TERRAIN } from '../config.js'; // Wait, TERRAIN is config, STATES is constants. I will fix imports inside functions to use correct path.
// Fixing imports:
import { STATES, RELATION } from '../data/constants.js';
import { TERRAIN, COLS, ROWS } from '../config.js';
import { moveRandom, moveTowards } from '../utils.js';

export function determineBelief(npc) {
    npc.faith -= 0.1;
    if(npc.faith < 0) npc.faith = 0;
    if (npc.fear > 80) npc.beliefType = "Sợ thần";
    else if (npc.devotion > 80 && npc.faith > 80) npc.beliefType = "Cuồng tín";
    else if (npc.faith > 60) npc.beliefType = "Sùng đạo";
    else if (npc.faith > 30) npc.beliefType = "Tin có thần";
    else if (npc.faith > 10) npc.beliefType = "Nghi ngờ";
    else npc.beliefType = "Vô thần";
}

export function determineMood(npc) {
    if (npc.health<30) npc.mood = "Đau yếu"; else if(npc.state===STATES.SCARED || npc.fear>70) npc.mood = "Sợ hãi"; else if(npc.hunger>70) npc.mood = "Đói bụng"; else if(npc.energy<30) npc.mood = "Mệt mỏi"; else if(npc.partnerId) npc.mood = "Hạnh phúc"; else if(npc.health>80 && npc.hunger<30) npc.mood = "Vui vẻ"; else npc.mood = "Bình thường";
}

export function determineJob(npc) {
    if (npc.age < 16) { npc.job = "Trẻ em"; return; }
    if (npc.isSoldier) { npc.job = "Chiến binh"; return; }
    let t = state.tribes.find(tr=>tr.id===npc.tribeId);
    if (!t) { npc.job = "Vô nghiệp"; return; }
    
    if (Math.random() < 0.05 || npc.job === "Vô nghiệp") {
        if (t.foodStorage < 50) npc.job = "Nông dân";
        else if (t.woodStorage < 50) npc.job = "Thợ xây";
        else npc.job = "Thợ xây";
    }
}

export function determineState(npc) {
    if (npc.actionWait > 0 || npc.state === STATES.COMMANDED) return; 

    // effects is not imported but we can use state.effects
    let isScared = state.effects.some(e=>(e.type==='set'||e.type==='bao'||e.type==='plague') && Math.hypot(npc.x*16-e.x, npc.y*16-e.y)<16*6);
    if (isScared) npc.state = STATES.FLEEING_DISASTER;
    else if (npc.state === STATES.EATING || npc.state === STATES.CHOPPING_WOOD || npc.state === STATES.PRAYING) {} 
    else if (npc.hunger > 60) npc.state = STATES.SEEKING_FOOD;
    else if (npc.energy < 25) npc.state = STATES.RESTING;
    else if (npc.age >= 16) { 
        if (npc.job === "Thợ xây" && state.houses.some(h=>h.tribeId===npc.tribeId && h.durability < 100)) npc.state = STATES.REBUILDING;
        else if (npc.beliefType === "Cuồng tín" && Math.random() < 0.1) npc.state = STATES.PRAYING;
        else if (npc.tribeId && npc.wood > 5 && Math.random() < 0.2) npc.state = STATES.GATHERING_FOR_TRIBE;
        else if (!npc.homeId && npc.wood < 10) npc.state = STATES.SEEKING_WOOD;
        else if (!npc.homeId && npc.wood >= 10) npc.state = STATES.BUILDING_HOME;
        else if (npc.homeId && npc.relationshipStatus === RELATION.SINGLE) npc.state = STATES.SEEKING_PARTNER;
        else npc.state = STATES.WANDERING;
    } else npc.state = STATES.WANDERING;
}

export function executeState(npc) {
    if (npc.actionWait > 0) return;

    switch(npc.state) {
        case STATES.SEEKING_FOOD:
            if (npc.tribeId) {
                let t = state.tribes.find(tr=>tr.id===npc.tribeId);
                if (t && t.foodStorage > 0) {
                    if (Math.hypot(npc.x-t.x, npc.y-t.y) <= 2) { t.foodStorage--; npc.hunger-=50; npc.state=STATES.WANDERING; }
                    else moveTowards(npc, t.x, t.y);
                    break;
                }
            }
            let food = state.foods.find(f => Math.hypot(f.x-npc.x, f.y-npc.y) <= 5);
            if (food) {
                if (npc.x === food.x && npc.y === food.y) {
                    let idx = state.foods.indexOf(food); if(idx>-1) state.foods.splice(idx,1);
                    npc.hunger -= 40; npc.state = STATES.EATING; npc.actionWait = 60;
                } else moveTowards(npc, food.x, food.y);
            } else moveRandom(npc);
            break;
        case STATES.SEEKING_WOOD:
            if(state.grid[npc.x][npc.y] === TERRAIN.RUNG) { npc.state = STATES.CHOPPING_WOOD; npc.actionWait = 120; }
            else moveRandom(npc);
            break;
        case STATES.CHOPPING_WOOD:
            npc.wood += 5; state.grid[npc.x][npc.y] = TERRAIN.DAT; state.envGrid[npc.x][npc.y].biome = "Đồng cỏ"; npc.state = STATES.WANDERING;
            break;
        case STATES.BUILDING_HOME:
            if (state.grid[npc.x][npc.y] === TERRAIN.DAT && !state.houses.find(h=>h.x===npc.x&&h.y===npc.y)) {
                state.houses.push({ id: ++state.houseIdCounter, x: npc.x, y: npc.y, ownerId: npc.id, tribeId: npc.tribeId, durability: 100 });
                npc.wood -= 10; npc.homeId = state.houseIdCounter; npc.state = STATES.WANDERING; npc.actionWait = 180;
            } else moveRandom(npc);
            break;
        case STATES.RESTING:
            if (npc.homeId) {
                let h = state.houses.find(x=>x.id===npc.homeId);
                if (h && (npc.x!==h.x || npc.y!==h.y)) moveTowards(npc, h.x, h.y);
                else { npc.energy += 10; if(npc.energy>=100) npc.state = STATES.WANDERING; }
            } else { npc.energy += 5; if(npc.energy>=100) npc.state = STATES.WANDERING; }
            break;
        case STATES.GATHERING_FOR_TRIBE:
            let t = state.tribes.find(tr=>tr.id===npc.tribeId);
            if(t) {
                if(Math.hypot(npc.x-t.x, npc.y-t.y)<=2) { t.woodStorage += npc.wood; npc.wood = 0; npc.state = STATES.WANDERING; }
                else moveTowards(npc, t.x, t.y);
            } else npc.state = STATES.WANDERING;
            break;
        case STATES.WANDERING:
            moveRandom(npc);
            npc.energy -= 1;
            break;
        default: moveRandom(npc); break;
    }
}
`,

"js/systems/tribeSystem.js": `import { state } from '../gameState.js';
import { TRIBE_NAMES } from '../data/names.js';
import { TRIBE_COLORS } from '../config.js';
import { AGES } from '../data/constants.js';
import { logEvent } from './historySystem.js';

export function updateTribeLogic() {
    let allUnaffiliated = state.npcs.filter(n => !n.tribeId);
    let unaffiliatedAdults = allUnaffiliated.filter(n => n.age >= 16);
    if (unaffiliatedAdults.length >= 4) {
        let n = unaffiliatedAdults[0];
        let tId = ++state.tribeIdCounter; let tName = TRIBE_NAMES[Math.floor(Math.random() * TRIBE_NAMES.length)];
        let tribe = { 
            id: tId, name: tName, x: n.x, y: n.y, leaderId: n.id, members: [n.id], houses: [], level: 'Trại nhỏ', foodStorage: 0, woodStorage: 0, maxStorage: 50, faith: 50, culture: 10, foundedYear: state.time.year, color: TRIBE_COLORS[tId % TRIBE_COLORS.length],
            ageLevel: AGES[0], researchPoints: 0, culturePoints: 0, educationLevel: 0, innovationRate: 1.0, unlockedTechs: [], currentResearchId: null
        };
        n.tribeId = tId; state.tribes.push(tribe);
        state.buildings.push({ id: ++state.buildingIdCounter, type: 'campfire', x: n.x, y: n.y, tribeId: tId });
        logEvent(\`Bộ lạc \${tName} đã được thành lập!\`); 
    }
    
    state.tribes.forEach(t => {
        t.population = state.npcs.filter(n=>n.tribeId===t.id).length;
        if (t.population >= 20 && t.level === 'Trại nhỏ') t.level = 'Làng';
        if (t.population >= 50 && t.level === 'Làng') t.level = 'Thị trấn';
        if (t.woodStorage >= 30 && !state.buildings.find(b=>b.tribeId===t.id && b.type==='storage')) {
            t.woodStorage-=30; t.maxStorage=200; state.buildings.push({ id: ++state.buildingIdCounter, type: 'storage', x: t.x+1, y: t.y, tribeId: t.id });
        }
    });
}
`,

"js/systems/kingdomSystem.js": `import { state } from '../gameState.js';
import { KINGDOM_NAMES } from '../data/names.js';
import { logEvent } from './historySystem.js';

export function updateKingdomLogic() {
    state.tribes.forEach(t => {
        if (t.level === 'Thị trấn' && t.population >= 50 && !t.kingdomId) {
            let kId = ++state.kdIdCounter; let kName = KINGDOM_NAMES[kId % KINGDOM_NAMES.length];
            let kingdom = { 
                id: kId, name: kName, tribeIds: [t.id], capitalTribeId: t.id, rulerId: t.leaderId, population: t.population, militaryPower: 0, economyPower: 100, faithPower: t.faith, territory: [], diplomacy: [], foundedYear: state.time.year, governmentType: "Quân chủ", color: t.color,
                ageLevel: t.ageLevel, researchPoints: t.researchPoints, culturePoints: t.culturePoints, educationLevel: t.educationLevel, innovationRate: t.innovationRate, unlockedTechs: [...t.unlockedTechs], currentResearchId: t.currentResearchId
            };
            t.kingdomId = kId; state.kingdoms.push(kingdom);
            logEvent(\`Vương quốc \${kName} đã được khai sinh từ \${t.name}!\`);
        }
    });
    state.kingdoms.forEach(k => {
        let pops = 0; k.tribeIds.forEach(tId => { let t = state.tribes.find(tr=>tr.id===tId); if(t) pops += t.population; });
        k.population = pops;
        k.militaryPower = state.npcs.filter(n => n.kingdomId === k.id && n.isSoldier).length * 10;
    });
}
`,

"js/systems/godPowerSystem.js": `import { state } from '../gameState.js';
import { TILE_SIZE } from '../config.js';
import { getNpcsInRadius } from './worldSystem.js';

export function updateGodLogic() {
    state.god.divinePower += 0.1;
    if(state.god.divinePower > 1000) state.god.divinePower = 1000;
    document.getElementById('dp-val').innerText = Math.floor(state.god.divinePower);
}

export function spawnEffect(type, tx, ty, duration) {
    getNpcsInRadius(tx, ty, 3).forEach(npc => {
        if(type==='bless') { npc.health+=50; npc.energy+=50; npc.mood="Hạnh phúc"; npc.faith+=20; }
        else if(type==='curse') { npc.health-=30; npc.energy-=30; npc.mood="Sợ hãi"; npc.fear+=20; }
        else if(type==='heal') { npc.health=100; npc.sick=false; }
    });
    for(let i=0; i<10; i++) state.particles.push({ x: tx*TILE_SIZE+8, y: ty*TILE_SIZE+8, vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2, life: duration, type });
}
`,

"js/systems/familySystem.js": `export function updateFamilyLogic() {}`,
"js/systems/religionSystem.js": `export function updateReligionLogic() {}`,
"js/systems/technologySystem.js": `export function updateTechnologyLogic() {}`,
"js/systems/environmentSystem.js": `export function updateEnvironmentLogic() {}`,
"js/systems/disasterSystem.js": `export function updateDisasterLogic() {}`,
"js/systems/warSystem.js": `export function updateWarLogic() {}`,

// =========================
// CORE
// =========================
"js/utils.js": `import { state } from './gameState.js';
import { COLS, ROWS } from './config.js';

export function playSound(name) {
    if (state.settings.sound) {
        console.log(\`[SOUND] Playing: \${name}\`);
    }
}

export function moveTowards(npc, tx, ty) {
    npc.targetX = tx; npc.targetY = ty;
    if (npc.x < tx) npc.x++; else if (npc.x > tx) npc.x--;
    if (npc.y < ty) npc.y++; else if (npc.y > ty) npc.y--;
}

export function moveRandom(npc) {
    // TERRAIN.NUOC is 1, NUI is 3. Avoiding cyclical imports using config values if possible.
    let nx = npc.x + (Math.random()<0.5?-1:1);
    let ny = npc.y + (Math.random()<0.5?-1:1);
    if(nx>=0&&nx<COLS&&ny>=0&&ny<ROWS && state.grid[nx][ny]!==1 && state.grid[nx][ny]!==3) { npc.targetX=nx; npc.targetY=ny; npc.x=nx; npc.y=ny; }
}
`,

"js/camera.js": `import { state } from './gameState.js';
import { TILE_SIZE } from './config.js';
import { canvas } from './renderer.js';

export function centerCamera(worldX, worldY) {
    state.camera.x = canvas.width / 2 - worldX * state.camera.zoom;
    state.camera.y = canvas.height / 2 - worldY * state.camera.zoom;
}

export function getWorldPos(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;
    
    let wx = (mouseX - state.camera.x) / state.camera.zoom;
    let wy = (mouseY - state.camera.y) / state.camera.zoom;
    
    return { x: Math.floor(wx / TILE_SIZE), y: Math.floor(wy / TILE_SIZE), wx, wy };
}
`,

"js/saveLoad.js": `import { state } from './gameState.js';
import { SAVE_KEY, SAVE_VERSION } from './config.js';
import { playSound } from './utils.js';
import { logEvent } from './systems/historySystem.js';

export function getSaveData() {
    return JSON.stringify({ ...state, saveVersion: SAVE_VERSION });
}

export function loadSaveData(json) {
    try {
        let data = JSON.parse(json);
        Object.assign(state, data);
        if (!state.saveVersion) state.saveVersion = 10;
        // Apply defaults for missing fields if upgrading
        logEvent("Tải game thành công.");
    } catch(e) { alert("Lỗi khi tải file save!"); }
}

export function saveGame() {
    localStorage.setItem(SAVE_KEY, getSaveData());
    let now = new Date();
    document.getElementById('last-autosave-time').innerText = now.toLocaleTimeString();
    playSound("save");
}
`,

"js/input.js": `import { state } from './gameState.js';
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
        if (e.button === 2 || keys[' ']) { 
            state.isCameraDragging = true;
            state.camDragStartX = e.clientX;
            state.camDragStartY = e.clientY;
        } else if (e.button === 0) {
            state.isMouseDragging = true;
            handleCanvasClick(e, false);
        }
    });
    
    window.addEventListener('mousemove', e => {
        if (state.isCameraDragging) {
            let dx = e.clientX - state.camDragStartX;
            let dy = e.clientY - state.camDragStartY;
            state.camera.x += dx; state.camera.y += dy;
            state.camDragStartX = e.clientX; state.camDragStartY = e.clientY;
        } else if (state.isMouseDragging) {
            handleCanvasClick(e, true);
        }
    });
    
    window.addEventListener('mouseup', e => {
        if (e.button === 2 || keys[' ']) state.isCameraDragging = false;
        if (e.button === 0) state.isMouseDragging = false;
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
`,

"js/ui.js": `import { state } from './gameState.js';
import { STATES_TEXT } from './data/constants.js';
import { centerCamera } from './camera.js';
import { TILE_SIZE } from './config.js';
import { saveGame, loadSaveData, getSaveData } from './saveLoad.js';

export function setupUIEvents() {
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if(e.target.dataset.tool !== 'voice') {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                state.currentTool = e.target.dataset.tool;
            } else {
                if (state.selectedNpcId) {
                    let n = state.npcs.find(x=>x.id===state.selectedNpcId);
                    if(n) {
                        document.getElementById('voice-npc-name').innerText = n.name;
                        document.getElementById('voice-menu').classList.remove('hidden');
                    }
                } else alert("Vui lòng Inspect một NPC trước khi ban thánh chỉ!");
            }
        });
    });

    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.time.speedMultiplier = parseInt(e.target.dataset.speed);
        });
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            e.currentTarget.classList.add('active');
            document.getElementById(e.currentTarget.dataset.target).classList.add('active');
        });
    });

    document.getElementById('btn-sound').addEventListener('click', e => {
        state.settings.sound = !state.settings.sound;
        e.target.innerText = state.settings.sound ? '🔊' : '🔇';
    });
    
    ['grid', 'names', 'territory', 'effects', 'pause-ending', 'autosave', 'debug', 'sound'].forEach(s => {
        let el = document.getElementById(\`set-\${s}\`);
        if(el) {
            el.checked = state.settings[s==='pause-ending'?'pauseOnEnding':(s==='autosave'?'autoSave':(s==='sound'?'sound':(s==='debug'?'showDebug':'show'+s.charAt(0).toUpperCase()+s.slice(1))))];
            el.addEventListener('change', e => {
                if(s==='pause-ending') state.settings.pauseOnEnding = e.target.checked;
                else if(s==='autosave') state.settings.autoSave = e.target.checked;
                else if(s==='sound') { state.settings.sound = e.target.checked; document.getElementById('btn-sound').innerText = state.settings.sound?'🔊':'🔇'; }
                else if(s==='debug') { state.settings.showDebug = e.target.checked; document.getElementById('debug-panel').classList.toggle('hidden', !state.settings.showDebug); }
                else state.settings['show'+s.charAt(0).toUpperCase()+s.slice(1)] = e.target.checked;
            });
        }
    });

    document.getElementById('close-voice').addEventListener('click', () => { document.getElementById('voice-menu').classList.add('hidden'); });
    
    document.getElementById('btn-save').addEventListener('click', saveGame);
    document.getElementById('btn-load').addEventListener('click', () => {
        let s = localStorage.getItem('thePeopleSaveV11');
        if (s) loadSaveData(s); else alert("Không có dữ liệu save.");
    });
    document.getElementById('btn-export').addEventListener('click', () => {
        let blob = new Blob([getSaveData()], {type: "application/json"});
        let url = URL.createObjectURL(blob);
        let a = document.createElement('a'); a.href = url; a.download = "ThePeople_Save.json"; a.click();
    });
    document.getElementById('btn-import').addEventListener('click', () => document.getElementById('file-import').click());
    document.getElementById('file-import').addEventListener('change', e => {
        let file = e.target.files[0];
        if(file) {
            let reader = new FileReader();
            reader.onload = function(evt) { loadSaveData(evt.target.result); };
            reader.readAsText(file);
        }
    });
}

export function inspectObject(tx, ty, wx, wy) {
    let found = null; let desc = "";
    let np = state.npcs.find(n => Math.hypot(n.x - tx, n.y - ty) <= 1);
    if (np) {
        found = np; desc = \`<b>\${np.name}</b> (Tuổi: \${Math.floor(np.age)})<br>Nghề: \${np.job}<br>Máu: \${Math.floor(np.health)}/100<br>Trạng thái: \${STATES_TEXT[np.state]||np.state}<br>Tâm trạng: \${np.mood}\`;
        state.selectedNpcId = np.id;
    } else {
        state.selectedNpcId = null;
        let h = state.houses.find(h => h.x === tx && h.y === ty);
        if (h) { found = h; desc = \`<b>Nhà của \${h.ownerId ? state.npcs.find(n=>n.id===h.ownerId)?.name : 'Vô danh'}</b><br>Độ bền: \${h.durability}/100\`; }
    }
    
    let content = document.getElementById('inspect-content');
    let none = document.getElementById('inspect-none');
    if (found || state.envGrid[tx][ty]) {
        none.classList.add('hidden'); content.classList.remove('hidden');
        if (!found) desc = \`<b>Ô Đất (\${tx}, \${ty})</b><br>Biome: \${state.envGrid[tx][ty].biome}<br>Nhiệt độ: \${Math.floor(state.envGrid[tx][ty].temperature)}°C<br>Độ ẩm: \${Math.floor(state.envGrid[tx][ty].humidity)}%\`;
        content.innerHTML = desc;
    } else {
        none.classList.remove('hidden'); content.classList.add('hidden');
    }
}

// Global hook for inline HTML onclick handlers if any
window.centerCamera = centerCamera;
window.inspectObject = inspectObject;
window.setSelectedNpc = (id) => state.selectedNpcId = id;

export function updateUITabs() {
    document.getElementById('pop-display').innerText = state.npcs.length;
    document.getElementById('speed-val').innerText = state.time.speedMultiplier + 'x';
    
    if (state.ticks % 30 !== 0) return; 
    
    if (document.getElementById('tab-people').classList.contains('active')) {
        let list = document.getElementById('people-list');
        let search = document.getElementById('search-npc').value.toLowerCase();
        let filtered = state.npcs; 
        if (search) filtered = filtered.filter(n => n.name.toLowerCase().includes(search));
        
        list.innerHTML = filtered.slice(0, 50).map(n => \`<li onclick="centerCamera(\${n.x*TILE_SIZE},\${n.y*TILE_SIZE}); setSelectedNpc(\${n.id}); inspectObject(\${n.x},\${n.y},\${n.x},\${n.y})">\${n.name} - \${n.job} (Máu: \${Math.floor(n.health)})</li>\`).join('');
    }
    
    if (document.getElementById('tab-tribe').classList.contains('active')) {
        let list = document.getElementById('tribe-list');
        list.innerHTML = state.tribes.map(t => \`<li>\${t.name} - Pop: \${t.population}</li>\`).join('');
    }
    
    if (document.getElementById('tab-kingdom').classList.contains('active')) {
        document.getElementById('civ-pop').innerText = state.npcs.length;
        let list = document.getElementById('kingdom-list');
        list.innerHTML = state.kingdoms.map(k => \`<li><span style="color:\${k.color}">■</span> \${k.name} - Pop: \${k.population}</li>\`).join('');
    }
}
`,

"js/renderer.js": `import { state } from './gameState.js';
import { TILE_SIZE, COLS, ROWS, COLORS, TERRAIN } from './config.js';
import { updateUITabs } from './ui.js';

export const canvas = document.getElementById('game-canvas');
export const ctx = canvas.getContext('2d');
export const minimapCanvas = document.getElementById('minimap');
export const mCtx = minimapCanvas.getContext('2d');

let patterns = {};

export function createTextures() {
    let createPat = (drawFunc) => {
        let tCan = document.createElement('canvas');
        tCan.width = TILE_SIZE; tCan.height = TILE_SIZE;
        let tCtx = tCan.getContext('2d');
        drawFunc(tCtx);
        return ctx.createPattern(tCan, 'repeat');
    };
    
    patterns[TERRAIN.DAT] = createPat(c => {
        c.fillStyle = '#2ecc71'; c.fillRect(0,0,16,16);
        c.fillStyle = '#27ae60'; c.fillRect(2,2,4,4); c.fillRect(10,8,3,3);
    });
    patterns[TERRAIN.NUOC] = createPat(c => {
        c.fillStyle = '#3498db'; c.fillRect(0,0,16,16);
        c.fillStyle = '#2980b9'; c.fillRect(0,4,16,2); c.fillRect(0,12,16,2);
    });
    patterns[TERRAIN.RUNG] = createPat(c => {
        c.fillStyle = '#2ecc71'; c.fillRect(0,0,16,16);
        c.fillStyle = '#1e8449'; 
        c.beginPath(); c.arc(8, 8, 6, 0, Math.PI*2); c.fill();
        c.fillStyle = '#145a32';
        c.beginPath(); c.arc(12, 12, 4, 0, Math.PI*2); c.fill();
    });
    patterns[TERRAIN.NUI] = createPat(c => {
        c.fillStyle = '#7f8c8d'; c.fillRect(0,0,16,16);
        c.fillStyle = '#95a5a6'; c.beginPath(); c.moveTo(2,16); c.lineTo(8,2); c.lineTo(14,16); c.fill();
        c.fillStyle = '#bdc3c7'; c.beginPath(); c.moveTo(5,9); c.lineTo(8,2); c.lineTo(11,9); c.fill();
    });
}

export function updateParticles() {
    for(let i=state.particles.length-1; i>=0; i--){
        let p = state.particles[i];
        p.x += p.vx; p.y += p.vy; p.life--;
        if(p.life <= 0) state.particles.splice(i, 1);
    }
}

export function draw() {
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    let startCol = Math.max(0, Math.floor((-state.camera.x) / (TILE_SIZE * state.camera.zoom)));
    let startRow = Math.max(0, Math.floor((-state.camera.y) / (TILE_SIZE * state.camera.zoom)));
    let endCol = Math.min(COLS, startCol + Math.ceil(canvas.width / (TILE_SIZE * state.camera.zoom)) + 1);
    let endRow = Math.min(ROWS, startRow + Math.ceil(canvas.height / (TILE_SIZE * state.camera.zoom)) + 1);

    ctx.save();
    ctx.translate(state.camera.x, state.camera.y);
    ctx.scale(state.camera.zoom, state.camera.zoom);

    let visTiles = 0;
    for (let x = startCol; x < endCol; x++) {
        for (let y = startRow; y < endRow; y++) {
            visTiles++;
            let tile = state.grid[x][y];
            ctx.fillStyle = patterns[tile] || COLORS[tile];
            
            if (tile === TERRAIN.NUOC) {
                ctx.save();
                ctx.translate(x*TILE_SIZE, y*TILE_SIZE);
                let offset = Math.sin(state.time.frames * 0.1 + x + y) * 2;
                ctx.translate(offset, 0);
                ctx.fillRect(-offset, 0, TILE_SIZE, TILE_SIZE);
                ctx.restore();
            } else if (tile === TERRAIN.RUNG) {
                ctx.save();
                ctx.translate(x*TILE_SIZE, y*TILE_SIZE);
                let skew = Math.sin(state.time.frames * 0.05 + x) * 0.1;
                ctx.transform(1, 0, skew, 1, 0, 0);
                ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
                ctx.restore();
            } else {
                ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
                if (tile === TERRAIN.NUI) {
                    ctx.fillStyle = 'rgba(0,0,0,0.3)';
                    ctx.beginPath(); ctx.moveTo(x*TILE_SIZE+14, y*TILE_SIZE+16); ctx.lineTo(x*TILE_SIZE+20, y*TILE_SIZE+16); ctx.lineTo(x*TILE_SIZE+16, y*TILE_SIZE+6); ctx.fill();
                }
            }
            
            if (state.settings.showGrid) { ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.strokeRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE); }
            if (state.settings.showTerritory && state.kingdoms.length > 0) {
                let kId = null;
                for(let k of state.kingdoms) { if(k.territory && k.territory.some(pt=>pt.x===x&&pt.y===y)){kId=k.id; break;} }
                if(kId) { let k=state.kingdoms.find(x=>x.id===kId); ctx.fillStyle=k.color; ctx.globalAlpha=0.2; ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE); ctx.globalAlpha=1.0; }
            }
        }
    }
    document.getElementById('dbg-vistiles').innerText = visTiles;

    ctx.fillStyle = '#e74c3c';
    state.foods.forEach(f => {
        if(f.x>=startCol && f.x<endCol && f.y>=startRow && f.y<endRow) {
            ctx.beginPath(); ctx.arc(f.x*TILE_SIZE+8, f.y*TILE_SIZE+8, 3, 0, Math.PI*2); ctx.fill();
        }
    });

    ctx.fillStyle = '#8e44ad';
    state.houses.forEach(h => {
        if(h.x>=startCol && h.x<endCol && h.y>=startRow && h.y<endRow) {
            ctx.fillRect(h.x*TILE_SIZE+2, h.y*TILE_SIZE+2, 12, 12);
        }
    });

    state.npcs.forEach(n => {
        if(n.x>=startCol && n.x<endCol && n.y>=startRow && n.y<endRow) {
            let px = n.x*TILE_SIZE + 8; let py = n.y*TILE_SIZE + 8;
            let walkY = Math.sin(n.walkCycle) * 2;
            
            ctx.fillStyle = n.id === state.selectedNpcId ? '#f1c40f' : (n.isSoldier ? '#e74c3c' : '#dcdde1');
            ctx.beginPath(); ctx.arc(px, py + walkY, 4, 0, Math.PI*2); ctx.fill();
            
            if (state.settings.showNames) {
                ctx.fillStyle = '#fff'; ctx.font = '8px Arial'; ctx.textAlign = 'center';
                ctx.fillText(n.name, px, py - 6 + walkY);
            }
        }
    });
    
    if (state.settings.showEffects) {
        state.particles.forEach(p => {
            ctx.fillStyle = p.type==='bless'?'#f1c40f':p.type==='curse'?'#8e44ad':p.type==='heal'?'#2ecc71':'#fff';
            ctx.fillRect(p.x, p.y, 2, 2);
        });
        state.effects.forEach(e => {
            if (e.type === 'mua') { ctx.fillStyle = 'rgba(52, 152, 219, 0.2)'; ctx.beginPath(); ctx.arc(e.x*TILE_SIZE, e.y*TILE_SIZE, e.radius, 0, Math.PI*2); ctx.fill(); }
            if (e.type === 'bao') { ctx.strokeStyle = 'rgba(236, 240, 241, 0.5)'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(e.x*TILE_SIZE, e.y*TILE_SIZE, e.radius*(e.life%10/10), 0, Math.PI*2); ctx.stroke(); }
            if (e.type === 'plague') { ctx.fillStyle = 'rgba(155, 89, 182, 0.4)'; ctx.beginPath(); ctx.arc(e.x*TILE_SIZE, e.y*TILE_SIZE, e.radius, 0, Math.PI*2); ctx.fill(); }
            if (e.type === 'set' && Math.random()<0.2) { ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; ctx.fillRect(e.x*TILE_SIZE-e.radius, e.y*TILE_SIZE-e.radius, e.radius*2, e.radius*2); }
        });
    }

    ctx.restore();
    
    updateMinimap();
    updateUITabs();
}

function updateMinimap() {
    mCtx.fillStyle = '#1e272e';
    mCtx.fillRect(0, 0, 200, 120);
    mCtx.fillStyle = '#27ae60';
    for (let x=0; x<COLS; x++) {
        for (let y=0; y<ROWS; y++) {
            if (state.grid[x][y] !== TERRAIN.NUOC) mCtx.fillRect(x, y, 1, 1);
        }
    }
    mCtx.fillStyle = '#e74c3c';
    state.tribes.forEach(t => mCtx.fillRect(t.x, t.y, 2, 2));
    
    let vp = document.getElementById('minimap-viewport');
    let sc = 200 / COLS;
    vp.style.left = Math.max(0, -state.camera.x / (TILE_SIZE * state.camera.zoom) * sc) + 'px';
    vp.style.top = Math.max(0, -state.camera.y / (TILE_SIZE * state.camera.zoom) * sc) + 'px';
    vp.style.width = (canvas.width / (TILE_SIZE * state.camera.zoom) * sc) + 'px';
    vp.style.height = (canvas.height / (TILE_SIZE * state.camera.zoom) * sc) + 'px';
}
`,

"js/main.js": `import { state } from './gameState.js';
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
import { saveGame } from './saveLoad.js';
import { centerCamera } from './camera.js';

function resizeCanvas() {
    let mainView = document.getElementById('main-view');
    canvas.width = mainView.clientWidth;
    canvas.height = mainView.clientHeight;
}

function init() {
    resizeCanvas(); window.addEventListener('resize', resizeCanvas);
    createTextures();
    
    for (let x=0; x<COLS; x++) { 
        state.grid[x]=[]; state.envGrid[x]=[]; 
        for (let y=0; y<ROWS; y++) {
            state.grid[x][y]=TERRAIN.NUOC; 
            state.envGrid[x][y]={ temperature: 20, humidity: 80, fertility: 10, pollution: 0, biome: "Nước" };
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
            // Effect logic here for simplicity, or move to system
            if (e.life <= 0) state.effects.splice(j, 1);
        }
        
        updateParticles();
        updateNpcsTick();
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
`
};

for (let [filepath, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, content, 'utf8');
}
console.log("Generated files.");
