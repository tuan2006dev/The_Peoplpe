import { state } from '../gameState.js';
import { TRIBE_NAMES } from '../data/names.js';
import { TRIBE_COLORS } from '../config.js';
import { AGES } from '../data/constants.js';
import { logEvent, addWorldEvent } from './historySystem.js';

export function updateTribeLogic() {
    let allUnaffiliated = state.npcs.filter(n => !n.tribeId);
    let potentialLeaders = allUnaffiliated.filter(n => n.age >= 16 && n.partnerId);
    
    for (let leader of potentialLeaders) {
        // Find nearby unaffiliated people (radius 15)
        let nearbyGroup = allUnaffiliated.filter(n => Math.hypot(n.x - leader.x, n.y - leader.y) <= 15);
        let nearbyHouses = state.houses.filter(h => h.tribeId === null && Math.hypot(h.x - leader.x, h.y - leader.y) <= 15);
        
        if (nearbyGroup.length >= 5 && nearbyHouses.length >= 4) {
            let tId = ++state.tribeIdCounter; 
            let tName = TRIBE_NAMES[Math.floor(Math.random() * TRIBE_NAMES.length)];
            let membersIds = nearbyGroup.map(n => n.id);
            
            let lx = Math.round(leader.x);
            let ly = Math.round(leader.y);
            
            let tribe = { 
                id: tId, name: tName, x: lx, y: ly, leaderId: leader.id, members: membersIds, houses: [], level: 'Trại nhỏ', foodStorage: 0, woodStorage: 0, maxStorage: 50, faith: 50, culture: 10, foundedYear: state.time.year, color: TRIBE_COLORS[tId % TRIBE_COLORS.length], radius: 10,
                ageLevel: AGES[0], researchPoints: 0, culturePoints: 0, educationLevel: 0, innovationRate: 1.0, unlockedTechs: [], currentResearchId: null, diplomacy: {}, warCooldowns: {},
                territoryTiles: [{x: lx, y: ly}], borderQueue: [{x: lx, y: ly}],
                raceId: leader.raceId
            };
            
            if(state.territoryGrid[lx] && state.territoryGrid[lx][ly] === null) state.territoryGrid[lx][ly] = tId;
            
            nearbyGroup.forEach(n => n.tribeId = tId);
            nearbyHouses.forEach(h => {
                h.tribeId = tId;
                if(state.territoryGrid[h.x] && state.territoryGrid[h.x][h.y] === null) {
                    state.territoryGrid[h.x][h.y] = tId;
                    tribe.territoryTiles.push({x: h.x, y: h.y});
                    tribe.borderQueue.push({x: h.x, y: h.y});
                }
            });
            state.tribes.push(tribe);
            state.buildings.push({ id: ++state.buildingIdCounter, type: 'campfire', x: leader.x, y: leader.y, tribeId: tId });
            
            logEvent(`Bộ lạc ${tName} đã được thành lập từ ${nearbyHouses.length} lều cỏ!`); 
            addWorldEvent('Tribe', 'Historic', `Bộ lạc ${tName} được thành lập`, `Gia đình của ${leader.name} đã quy tụ ${nearbyGroup.length} người lang thang lại và lập nên bộ lạc ${tName} dựa trên ${nearbyHouses.length} căn lều cỏ liền kề.`);
            break; // Chỉ lập 1 bộ lạc mỗi tick để tránh trùng lặp nhóm
        }
    }
    
    state.tribes.forEach(t => {
        if (!t.radius) t.radius = 10;
        if (!t.color) t.color = TRIBE_COLORS[t.id % TRIBE_COLORS.length];
        if (!t.diplomacy) { t.diplomacy = {}; t.warCooldowns = {}; }
        if (!t.territoryTiles) { 
            t.territoryTiles = [{x: t.x, y: t.y}]; 
            t.borderQueue = [{x: t.x, y: t.y}]; 
            if(state.territoryGrid[t.x] && state.territoryGrid[t.x][t.y] === null) state.territoryGrid[t.x][t.y] = t.id;
        }
        
        t.population = state.npcs.filter(n=>n.tribeId===t.id).length;
        if (t.population >= 20 && t.level === 'Trại nhỏ') { t.level = 'Làng'; t.radius = 15; }
        if (t.population >= 50 && t.level === 'Làng') { t.level = 'Thị trấn'; t.radius = 25; }
        if (t.woodStorage >= 30 && !state.buildings.find(b=>b.tribeId===t.id && b.type==='storage')) {
            t.woodStorage-=30; t.maxStorage=200; state.buildings.push({ id: ++state.buildingIdCounter, type: 'storage', x: t.x+1, y: t.y, tribeId: t.id });
        }
        
        // Removed old war cooldowns in favor of diplomacySystem.js
    });

    // Territory Expansion using Flood Fill (Throttled)
    if (state.ticks % 10 === 0) {
        import('../config.js').then(cfg => {
            state.tribes.forEach(t => {
                let targetArea = Math.max(10, t.population * 8); // 1 pop = 8 tiles
                if (t.territoryTiles.length < targetArea && t.borderQueue.length > 0) {
                    // Try to expand 3 tiles per tick if possible
                    for(let step=0; step<3; step++) {
                        if(t.borderQueue.length === 0) break;
                        let cell = t.borderQueue.shift();
                        let neighbors = [ {x: cell.x+1, y: cell.y}, {x: cell.x-1, y: cell.y}, {x: cell.x, y: cell.y+1}, {x: cell.x, y: cell.y-1} ];
                        let stillHasSpace = false;
                        
                        for (let nb of neighbors) {
                            if (nb.x>=0 && nb.x<cfg.COLS && nb.y>=0 && nb.y<cfg.ROWS && state.grid[nb.x][nb.y] !== cfg.TERRAIN.NUOC) {
                                let ownerId = state.territoryGrid[nb.x][nb.y];
                                if (ownerId === null) {
                                    state.territoryGrid[nb.x][nb.y] = t.id;
                                    t.territoryTiles.push(nb);
                                    t.borderQueue.push(nb);
                                    stillHasSpace = true;
                                } else if (ownerId !== t.id) {
                                    // Hit another tribe's border
                                    if (t.relations && t.relations[ownerId] !== undefined) {
                                        let otherTribe = state.tribes.find(tr => tr.id === ownerId);
                                        if (otherTribe) {
                                            // Xung đột biên giới làm giảm quan hệ
                                            t.relations[ownerId] -= 2;
                                            otherTribe.relations[t.id] -= 2;
                                        }
                                    }
                                }
                            }
                        }
                        if (stillHasSpace) t.borderQueue.push(cell); // re-queue if it might have more open neighbors
                    }
                }
            });
        });
    }
}
