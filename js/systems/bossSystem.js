import { state } from '../gameState.js';
import { ENTITY_DATA, TIER } from '../data/races.js';
import { COLS, ROWS, TERRAIN } from '../config.js';
import { moveTowards } from '../utils.js';
import { addWorldEvent } from './historySystem.js';

export function spawnBoss(x, y, raceId) {
    if (state.bossTracking.activeBosses.includes(raceId)) return; 
    
    let raceData = ENTITY_DATA.find(r => r.id === raceId);
    if (!raceData) return;
    
    let b = {
        id: ++state.idCounter,
        raceId: raceId,
        name: raceData.name,
        x: x, y: y,
        health: 5000,
        energy: 1000,
        actionWait: 0,
        awakeningCountdown: 10,
        specialSkillCooldown: 0,
        targetId: null
    };
    state.bosses.push(b);
    state.bossTracking.activeBosses.push(raceId);
    state.bossTracking.lastBossSpawnYear = state.time.year;
    addWorldEvent('Boss', 'Danger', `BOSS THỨC TỈNH: ${raceData.name}`, `Sức mạnh cổ đại đang trỗi dậy! Thảm họa toàn cầu sắp ập đến!`);
    
    // UI Warning
    let uiAlert = document.createElement('div');
    uiAlert.style.position = 'absolute';
    uiAlert.style.top = '20%';
    uiAlert.style.left = '50%';
    uiAlert.style.transform = 'translate(-50%, -50%)';
    uiAlert.style.padding = '20px';
    uiAlert.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
    uiAlert.style.color = 'white';
    uiAlert.style.fontSize = '24px';
    uiAlert.style.fontWeight = 'bold';
    uiAlert.style.borderRadius = '10px';
    uiAlert.style.zIndex = '9999';
    uiAlert.style.pointerEvents = 'none';
    uiAlert.style.animation = 'pulse 1s infinite';
    uiAlert.innerText = `CẢNH BÁO: ${raceData.name.toUpperCase()} ĐANG THỨC TỈNH!`;
    document.body.appendChild(uiAlert);
    setTimeout(() => uiAlert.remove(), 5000);
}

export function checkBossAwakeningConditions() {
    if (state.ticks % 600 !== 0) return; // Chỉ kiểm tra mỗi 10 ngày thay vì mỗi nửa ngày
    
    // Yêu cầu: Game phải đạt tối thiểu Năm 50 thì mới bắt đầu spawn Boss
    if (state.time.year < 50) return;
    
    // Yêu cầu: Ít nhất 10 năm mới có 1 Boss xuất hiện
    if (!state.bossTracking.lastBossSpawnYear) state.bossTracking.lastBossSpawnYear = 0;
    if (state.time.year - state.bossTracking.lastBossSpawnYear < 10) return;
    
    // Thêm tỉ lệ ngẫu nhiên (chỉ 5% cơ hội thức tỉnh khi thỏa điều kiện)
    if (Math.random() > 0.05) return;

    function getResourcePos(resId) {
        let resList = state.resources.filter(r => r.id === resId);
        if (resList.length > 0) {
            let res = resList[Math.floor(Math.random() * resList.length)];
            return { x: res.x, y: res.y };
        }
        return { x: COLS/2, y: ROWS/2 };
    }

    // 1. Leviathan (Map > 70% water)
    let waterCount = 0; let totalCells = COLS * ROWS;
    for(let x=0; x<COLS; x++) {
        for(let y=0; y<ROWS; y++) {
            if(state.grid[x] && state.grid[x][y] === TERRAIN.NUOC) waterCount++;
        }
    }
    if (waterCount / totalCells > 0.7) {
        state.bossTracking.waterTicks++;
        if (state.bossTracking.waterTicks >= 50 && !state.bossTracking.activeBosses.includes('leviathan')) {
            spawnBoss(COLS/2, ROWS/2, 'leviathan');
        }
    } else {
        state.bossTracking.waterTicks = 0;
    }

    // 2. Titan Đá (10 núi lửa phun)
    if (state.bossTracking.volcanoEruptions >= 10 && !state.bossTracking.activeBosses.includes('titan')) {
        spawnBoss(COLS/2, ROWS/2, 'titan');
    }

    // 3. Kraken Vĩ Đại (>100 xác chết dưới biển)
    if (state.bossTracking.waterCorpses >= 100 && !state.bossTracking.activeBosses.includes('kraken_elder')) {
        spawnBoss(10, 10, 'kraken_elder');
    }

    // 4. Băng Sương Cự Thú (Nhiệt độ cực thấp, không có boss băng nên dùng dire_bear tạm)
    if (state.climate.globalTemp < -20 && !state.bossTracking.activeBosses.includes('dire_bear')) {
        spawnBoss(COLS/2, ROWS/2, 'dire_bear');
    }

    // 5. Ent Cổ Thụ (Rừng bị chặt > 50)
    if (state.bossTracking.forestsChopped > 50 && !state.bossTracking.activeBosses.includes('fae_king')) {
        let pos = getResourcePos('hardwood');
        spawnBoss(pos.x, pos.y, 'fae_king');
    }

    // 6. Thực Thể Hư Không (> 1000 phép thuật được cast)
    let totalSpells = state.god.miracleCount + state.god.disasterCount;
    if (totalSpells >= 1000 && !state.bossTracking.activeBosses.includes('void_wyrm')) {
        let pos = getResourcePos('uranium');
        spawnBoss(pos.x, pos.y, 'void_wyrm');
    }

    // 7. Death Knight (Đã chết > 500)
    if (state.bossTracking.waterCorpses + state.deadNpcs.length >= 500 && !state.bossTracking.activeBosses.includes('death_knight')) {
        spawnBoss(COLS/2, ROWS/2, 'death_knight');
    }

    // 8. Tộc quá mạnh: Dân số > 100 hoặc lãnh thổ > 50% đất liền
    state.tribes.forEach(t => {
        let pop = state.npcs.filter(n => n.tribeId === t.id && n.health > 0).length;
        let territoryCount = t.territoryTiles ? t.territoryTiles.length : 0;
        let totalLand = 0;
        for(let x=0; x<COLS; x++) {
            for(let y=0; y<ROWS; y++) {
                if(state.grid[x] && state.grid[x][y] !== TERRAIN.NUOC) totalLand++;
            }
        }
        if (pop > 100 || (totalLand > 0 && territoryCount / totalLand > 0.5)) {
            if (!state.bossTracking.activeBosses.includes('troll_king')) {
                spawnBoss(t.x, t.y, 'troll_king');
            } else if (!state.bossTracking.activeBosses.includes('alpha_wolf')) {
                spawnBoss(t.x, t.y, 'alpha_wolf');
            }
        }
    });
}

export function updateBosses() {
    checkBossAwakeningConditions();

    state.bosses.forEach(b => {
        if (b.health <= 0) return;
        
        if (b.awakeningCountdown > 0) {
            b.awakeningCountdown -= 0.1;
            state.particles.push({x: b.x*16+8, y: b.y*16+8, vx: Math.random()*2-1, vy: Math.random()*2-1, life: 30, type: 'magic', color: '#ff0000'});
            return;
        }

        if (b.actionWait > 0) { b.actionWait--; return; }

        let target = state.npcs.find(n => n.id === b.targetId);
        if (!target || target.health <= 0) {
            let targets = state.npcs.filter(n => n.health > 0);
            if (targets.length > 0) {
                if (b.raceId === 'kraken_elder' || b.raceId === 'leviathan' || b.raceId === 'dragon_turtle' || b.raceId === 'sea_serpent') {
                    // Ưu tiên NPC ở ven bờ (gần nước)
                    targets.sort((a,c) => {
                        let aNearWater = 0, cNearWater = 0;
                        for(let dx=-2;dx<=2;dx++) for(let dy=-2;dy<=2;dy++){
                            let ax = Math.round(a.x)+dx, ay = Math.round(a.y)+dy;
                            if(ax>=0&&ax<COLS&&ay>=0&&ay<ROWS&&state.grid[ax]&&state.grid[ax][ay]===1) aNearWater++;
                            let cx = Math.round(c.x)+dx, cy = Math.round(c.y)+dy;
                            if(cx>=0&&cx<COLS&&cy>=0&&cy<ROWS&&state.grid[cx]&&state.grid[cx][cy]===1) cNearWater++;
                        }
                        let distA = Math.hypot(a.x-b.x, a.y-b.y);
                        let distC = Math.hypot(c.x-b.x, c.y-b.y);
                        // Trọng số ưu tiên gần bờ (trừ điểm nếu gần nước để sort lên đầu)
                        let scoreA = distA - (aNearWater>0 ? 50 : 0);
                        let scoreC = distC - (cNearWater>0 ? 50 : 0);
                        return scoreA - scoreC;
                    });
                } else {
                    targets.sort((a,c) => Math.hypot(a.x-b.x, a.y-b.y) - Math.hypot(c.x-b.x, c.y-b.y));
                }
                b.targetId = targets[0].id;
                target = targets[0];
            }
        }

        if (target) {
            let dist = Math.hypot(target.x - b.x, target.y - b.y);
            if (dist <= 3) {
                target.health -= 150; 
                b.actionWait = 10;
                for(let i=0; i<10; i++) state.particles.push({x: target.x * 16 + 8, y: target.y * 16 + 8, vx: Math.random()*4-2, vy: Math.random()*4-2, life: 50, type: 'smoke', color: '#000000'});
            } else {
                moveTowards(b, target.x, target.y);
            }
        }
        
        // Special Skills
        if (b.specialSkillCooldown > 0) b.specialSkillCooldown--;
        if (b.specialSkillCooldown <= 0) {
            b.specialSkillCooldown = 600; 
            if (b.raceId === 'leviathan') {
                addWorldEvent('Boss Skill', 'Danger', `Sóng Thần của Leviathan`, `Sức mạnh của Leviathan tạo ra một cơn sóng thần kinh hoàng!`);
                state.npcs.forEach(n => {
                    let cx = Math.floor(n.x); let cy = Math.floor(n.y);
                    if (state.grid[cx] && state.grid[cx][cy] === TERRAIN.NUOC) n.health -= 50;
                });
            } else if (b.raceId === 'titan') {
                addWorldEvent('Boss Skill', 'Danger', `Động Đất của Titan`, `Bước chân của Titan làm rung chuyển mặt đất, phá hủy các công trình!`);
                for(let i=0; i<5; i++) {
                    if (state.houses.length > 0) {
                        let idx = Math.floor(Math.random() * state.houses.length);
                        let h = state.houses[idx];
                        state.npcs.forEach(n => { if (n.homeId === h.id) n.homeId = null; });
                        state.houses.splice(idx, 1);
                    }
                }
            } else if (b.raceId === 'void_wyrm') {
                addWorldEvent('Boss Skill', 'Danger', `Lỗ Đen của Thực Thể Hư Không`, `Hư Không nuốt chửng sự sống!`);
                state.npcs.forEach(n => { if (Math.hypot(n.x - b.x, n.y - b.y) <= 15) n.health -= 50; });
            }
        }
    });

    for (let i = state.bosses.length - 1; i >= 0; i--) {
        if (state.bosses[i].health <= 0) {
            let b = state.bosses[i];
            addWorldEvent('Boss', 'Victory', `BOSS ĐÃ BỊ ĐÁNH BẠI`, `Sức mạnh vĩ đại của ${b.name} đã chấm dứt!`);
            
            state.effects.push({ type: 'item', x: b.x * 16, y: b.y * 16, life: 3600, itemName: `Trái Tim ${b.name}` });
            
            state.npcs.forEach(n => {
                n.health = 100; n.energy = 100;
                n.combatSkill += 20; 
            });
            
            state.bossTracking.activeBosses = state.bossTracking.activeBosses.filter(id => id !== b.raceId);
            state.bosses.splice(i, 1);
        }
    }
}
