import { state } from '../gameState.js';
import { STATES, RELATION, BIOME_EFFECTS } from '../data/constants.js';
import { TERRAIN, COLS, ROWS } from '../config.js';
import { moveRandom, moveTowards, getTribeFood, getTribeWood, consumeTribeFood, consumeTribeWood, addTribeResource, getTribeHousingCap } from '../utils.js';
import { updatePlanning } from './planningSystem.js';
import { ENTITY_DATA } from '../data/races.js';
import { RESOURCES, RESOURCE_GROUPS } from '../data/resources.js';
import { invalidateTerrain } from '../renderer.js';

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
        let k = t.kingdomId ? state.kingdoms.find(kd=>kd.id===t.kingdomId) : null;
        let eraLevel = k ? (k.civilizationLevel || 1) : 1;
        let pop = Math.max(t.population, 1);
        let foodRatio = getTribeFood(t) / (pop * 2);
        let woodRatio = getTribeWood(t) / (pop * 1.5);
        
        if (foodRatio < woodRatio && foodRatio < 0.7) {
            if (Math.random() < 0.35 || npc.job === "Vô nghiệp") npc.job = "Nông dân";
        } else if (woodRatio < 0.7) {
            if (Math.random() < 0.35 || npc.job === "Vô nghiệp") npc.job = "Thợ mộc";
        } else if (foodRatio >= 0.7 && woodRatio >= 0.7) {
            if ((npc.job === "Nông dân" || npc.job === "Thợ mộc") && Math.random() < 0.85) return;

            let possibleJobs = ["Thợ xây"];
            if (eraLevel >= 2) possibleJobs.push("Thương nhân");
            if (eraLevel >= 3) possibleJobs.push("Thợ rèn");
            if (eraLevel >= 4) possibleJobs.push("Tu sĩ");
            if (eraLevel >= 5) possibleJobs.push("Học giả", "Nhà khoa học");
            if (eraLevel >= 6) possibleJobs.push("Kỹ sư", "Công nhân");
            if (eraLevel >= 7) possibleJobs.push("Bác sĩ", "Giáo viên");
            if (eraLevel >= 8) possibleJobs.push("Lập trình viên", "Nghiên cứu viên");
            if (eraLevel >= 9) possibleJobs.push("Phi hành gia", "Kỹ sư vũ trụ");
            
            npc.job = possibleJobs[Math.floor(Math.random() * possibleJobs.length)];
        }
    }
}

export function determineState(npc) {
    if (npc.actionWait > 0 || npc.state === STATES.COMMANDED) return;

    let isScared = state.effects.some(e=>(e.type==='set'||e.type==='bao'||e.type==='plague') && Math.hypot(npc.x*16-e.x, npc.y*16-e.y)<16*6);
    if (isScared) { npc.state = STATES.FLEEING_DISASTER; return; }
    
    if (npc.state === STATES.EATING || npc.state === STATES.CHOPPING_WOOD || npc.state === STATES.PRAYING) return; 
    
    // Check for enemies
    if (npc.tribeId) {
        let t = state.tribes.find(tr => tr.id === npc.tribeId);
        if (t) {
            let isAtWar = (otherTribeId) => {
                return (t.diplomaticStatus && t.diplomaticStatus[otherTribeId] === 'war')
                    || (t.diplomacy && t.diplomacy[otherTribeId] === 'war');
            };
            let enemyNear = state.npcs.find(n => n.id !== npc.id && n.tribeId && isAtWar(n.tribeId) && Math.hypot(n.x - npc.x, n.y - npc.y) <= 8 && n.health > 0);
            
            // Aggression affect behavior
            let raceData = npc.raceId ? ENTITY_DATA.find(r => r.id === npc.raceId) : null;
            let aggro = raceData ? raceData.baseStats.aggression : 5;
            
            // Nếu aggression cao, có thể tấn công cả người lạ chưa có quan hệ ngoại giao (neutral) nếu ở gần
            if (!enemyNear && aggro >= 8) {
                enemyNear = state.npcs.find(n => n.id !== npc.id && n.tribeId && n.tribeId !== npc.tribeId && Math.hypot(n.x - npc.x, n.y - npc.y) <= 5 && n.health > 0);
            }

            if (enemyNear) {
                npc.state = STATES.ATTACKING;
                npc.targetEnemyId = enemyNear.id;
                return;
            }
        }
        // Thêm: Merfolk hỗ trợ Elf/Human đánh boss hoặc quái vật biển
        if (npc.raceId === 'merfolk') {
            // Tìm boss đang tấn công Elf/Human
            let allyUnderAttack = state.npcs.find(n => (n.raceId === 'elf' || n.raceId === 'human') && n.health > 0 && n.health < 100 && Math.hypot(n.x - npc.x, n.y - npc.y) <= 20);
            if (allyUnderAttack) {
                // Giả định boss/kẻ địch ở gần ally
                let bossNear = state.bosses.find(b => Math.hypot(b.x - allyUnderAttack.x, b.y - allyUnderAttack.y) <= 5);
                if (bossNear) {
                    npc.state = STATES.ATTACKING;
                    npc.targetBossId = bossNear.id;
                    return;
                }
            }
        }
    }
    
    updatePlanning(npc);
}

export function executeState(npc) {
    if (npc.actionWait > 0) return;

    switch(npc.state) {
        case STATES.SEEKING_FOOD:
            if (npc.tribeId) {
                let t = state.tribes.find(tr=>tr.id===npc.tribeId);
                if (t && getTribeFood(t) > 0) {
                    if (Math.hypot(npc.x-t.x, npc.y-t.y) <= 2) { consumeTribeFood(t, 1); npc.hunger=0; npc.actionWait = 10; npc.state=STATES.WANDERING; }
                    else moveTowards(npc, t.x, t.y);
                    break;
                }
            }
            let food = state.resources.find(f => Math.hypot(f.x-npc.x, f.y-npc.y) <= 20 && f.amount > 0 && RESOURCES[f.id] && RESOURCES[f.id].group === RESOURCE_GROUPS.FOOD);
            if (food) {
                if (Math.hypot(food.x - npc.x, food.y - npc.y) <= 0.5) {
                    food.amount -= 1;
                    if (food.amount <= 0 && food.renewable !== 'Có') { let idx = state.resources.indexOf(food); if(idx>-1) state.resources.splice(idx,1); }
                    npc.hunger = 0; npc.state = STATES.EATING; npc.actionWait = 10;
                } else moveTowards(npc, food.x, food.y);
            } else {
                // Orc săn bắt khi đói
                if (npc.raceId === 'orc') {
                    let prey = state.npcs.find(n => n.id !== npc.id && n.health > 0 && (n.raceId === 'merfolk' || n.tier === 5) && Math.hypot(n.x - npc.x, n.y - npc.y) <= 15);
                    if (prey) {
                        npc.state = STATES.ATTACKING;
                        npc.targetEnemyId = prey.id;
                        break;
                    }
                }
                moveRandom(npc);
            }
            break;
        case STATES.SEEKING_WOOD:
            let wx = Math.round(npc.x); let wy = Math.round(npc.y);
            if (wx>=0 && wx<COLS && wy>=0 && wy<ROWS && state.grid[wx][wy] === TERRAIN.RUNG) { 
                npc.state = STATES.CHOPPING_WOOD; npc.actionWait = 120; 
            } else {
                // Find nearest wood within radius 20
                let foundWood = false;
                let minDist = 999;
                let targetWX = -1, targetWY = -1;
                for (let r = 1; r <= 20; r++) {
                    for (let dx = -r; dx <= r; dx++) {
                        for (let dy = -r; dy <= r; dy++) {
                            if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
                            let cx = wx + dx; let cy = wy + dy;
                            if (cx>=0 && cx<COLS && cy>=0 && cy<ROWS && state.grid[cx][cy] === TERRAIN.RUNG) {
                                let dist = Math.hypot(dx, dy);
                                if (dist < minDist) { minDist = dist; targetWX = cx; targetWY = cy; foundWood = true; }
                            }
                        }
                    }
                    if (foundWood) break; // found nearest in this radius ring
                }
                if (foundWood) {
                    moveTowards(npc, targetWX, targetWY);
                } else {
                    moveRandom(npc); // Only wander if no forest nearby
                }
            }
            break;
        case STATES.CHOPPING_WOOD:
            let cx = Math.round(npc.x); let cy = Math.round(npc.y);
            let raceDataChop = npc.raceId ? ENTITY_DATA.find(r => r.id === npc.raceId) : null;
            let chopAmount = (raceDataChop && raceDataChop.id === 'dwarf') ? 8 : 5; // Dwarf bonus
            npc.wood += chopAmount; 
            
            if(cx>=0 && cx<COLS && cy>=0 && cy<ROWS) {
                if (state.grid[cx][cy] === TERRAIN.RUNG) {
                    state.bossTracking.forestsChopped++;
                    // Elf/Dryad ghét việc chặt rừng
                    if (npc.tribeId) {
                        state.tribes.forEach(t => {
                            if ((t.raceId === 'elf' || t.raceId === 'dryad') && t.id !== npc.tribeId) {
                                if (t.relations && t.relations[npc.tribeId] !== undefined) {
                                    t.relations[npc.tribeId] -= 0.5;
                                }
                            }
                        });
                    }
                }
                state.grid[cx][cy] = TERRAIN.DAT; state.envGrid[cx][cy].biome = "Đồng cỏ"; 
                invalidateTerrain();
            }
            npc.state = npc.tribeId ? STATES.GATHERING_FOR_TRIBE : STATES.WANDERING;
            if (npc.tribeId && npc.job === "Thợ mộc") npc.state = STATES.GATHERING_FOR_TRIBE;
            break;
        case STATES.BUILDING_HOME:
            let bt = state.tribes.find(tr=>tr.id===npc.tribeId);
            if (bt) {
                if (npc.wood < 10) {
                    if (getTribeWood(bt) >= 10) {
                        if(Math.hypot(npc.x-bt.x, npc.y-bt.y)<=2) { consumeTribeWood(bt, 10); npc.wood += 10; }
                        else moveTowards(npc, bt.x, bt.y);
                    } else { npc.state = STATES.WANDERING; } // Kho hết gỗ
                } else {
                    let distToTribe = Math.hypot(npc.x - bt.x, npc.y - bt.y);
                    if (distToTribe > 5) {
                        moveTowards(npc, bt.x, bt.y);
                    } else {
                        let bx = Math.round(npc.x); let by = Math.round(npc.y);
                        // Tìm ô đất trống trong lãnh thổ để xây
                        if (bx>=0 && bx<COLS && by>=0 && by<ROWS && state.grid[bx][by] === TERRAIN.DAT && !state.houses.find(h=>h.x===bx&&h.y===by) && state.territoryGrid[bx][by] === bt.id) {
                            let raceData = npc.raceId ? ENTITY_DATA.find(r => r.id === npc.raceId) : null;
                            let tier = raceData ? raceData.tier : 2;
                            let houseType = 'Lều cỏ';
                            
                            if (tier === 1) { // EMPIRE
                                houseType = 'Nhà đá';
                                if (npc.job === 'Trưởng làng' || npc.job === 'Lãnh chúa' || npc.job === 'Thợ xây') houseType = 'Thành đá';
                            } else if (tier === 3) { // MONSTER
                                houseType = 'Hang động';
                            } else { // TRIBE and others
                                houseType = 'Lều cỏ';
                                if (npc.job === 'Thợ xây' || npc.job === 'Chiến binh') houseType = 'Trại';
                            }

                            state.houses.push({ id: ++state.houseIdCounter, x: bx, y: by, ownerId: null, tribeId: npc.tribeId, durability: 100, type: houseType });
                            npc.wood -= 10; npc.state = STATES.WANDERING; npc.actionWait = 180;
                        } else {
                            moveRandom(npc);
                            npc.energy -= 0.5;
                            if (npc.energy <= 0) npc.state = STATES.WANDERING;
                        }
                    }
                }
            } else {
                if (npc.wood >= 10) {
                    let bx = Math.round(npc.x); let by = Math.round(npc.y);
                    // Lang thang tự xây trên đất trống vô chủ hoặc chưa ai chiếm
                    if (bx>=0 && bx<COLS && by>=0 && by<ROWS && state.grid[bx][by] === TERRAIN.DAT && !state.houses.find(h=>h.x===bx&&h.y===by) && state.territoryGrid[bx][by] === null) {
                        let raceData = npc.raceId ? ENTITY_DATA.find(r => r.id === npc.raceId) : null;
                        let tier = raceData ? raceData.tier : 2;
                        let houseType = tier === 1 ? 'Nhà đá' : (tier === 3 ? 'Hang động' : 'Lều cỏ');

                        state.houses.push({ id: ++state.houseIdCounter, x: bx, y: by, ownerId: npc.id, tribeId: null, durability: 100, type: houseType });
                        npc.homeId = state.houseIdCounter;
                        npc.wood -= 10; npc.state = STATES.WANDERING; npc.actionWait = 180;
                    } else {
                        moveRandom(npc);
                        npc.energy -= 0.5;
                        if (npc.energy <= 0) npc.state = STATES.WANDERING;
                    }
                } else { npc.state = STATES.SEEKING_WOOD; }
            }
            break;
        case STATES.RESTING:
            if (!npc.homeId && npc.tribeId) {
                let emptyHouse = state.houses.find(x=>x.tribeId===npc.tribeId && x.ownerId===null);
                if (emptyHouse) { emptyHouse.ownerId = npc.id; npc.homeId = emptyHouse.id; }
            }
            if (npc.homeId) {
                let h = state.houses.find(x=>x.id===npc.homeId);
                if (h && Math.hypot(npc.x-h.x, npc.y-h.y) > 1) moveTowards(npc, h.x, h.y);
                else { npc.energy += 2; if(npc.energy>=100) npc.state = STATES.WANDERING; }
            } else { npc.energy += 1; if(npc.energy>=100) npc.state = STATES.WANDERING; }
            break;
        case STATES.GATHERING_FOR_TRIBE:
            if (!npc.inventory) npc.inventory = {foodCarried: 0, wood: 0};
            let tr = state.tribes.find(tr=>tr.id===npc.tribeId);
            if (!tr) { npc.state = STATES.WANDERING; break; }
            
            if (npc.job === "Nông dân") {
                if (npc.inventory.foodCarried >= 10) {
                    if(Math.hypot(npc.x-tr.x, npc.y-tr.y)<=2) { addTribeResource(tr, 'wheat', npc.inventory.foodCarried); tr.foodStorage += npc.inventory.foodCarried; npc.inventory.foodCarried = 0; npc.state = STATES.WANDERING; }
                    else moveTowards(npc, tr.x, tr.y);
                } else {
                    let f = state.resources.find(f => Math.hypot(f.x-npc.x, f.y-npc.y) <= 20 && f.amount > 0 && RESOURCES[f.id] && RESOURCES[f.id].group === RESOURCE_GROUPS.FOOD);
                    if (f) {
                        if (Math.hypot(f.x-npc.x, f.y-npc.y) <= 0.5) {
                            f.amount -= 5;
                            if (f.amount <= 0 && f.renewable !== 'Có') { let idx = state.resources.indexOf(f); if(idx>-1) state.resources.splice(idx,1); }
                            npc.inventory.foodCarried += 5; npc.actionWait = 30;
                        } else moveTowards(npc, f.x, f.y);
                    } else moveRandom(npc);
                }
            } else { // Thợ mộc mang gỗ về
                if (npc.wood > 0) {
                    if(Math.hypot(npc.x-tr.x, npc.y-tr.y)<=2) { addTribeResource(tr, 'timber', npc.wood); tr.woodStorage += npc.wood; npc.wood = 0; npc.state = STATES.WANDERING; }
                    else moveTowards(npc, tr.x, tr.y);
                } else {
                    npc.state = STATES.SEEKING_WOOD;
                }
            }
            break;
        case STATES.WANDERING:
            moveRandom(npc);
            npc.energy -= 0.2;
            break;
        case STATES.PRAYING:
            npc.faith += 1;
            npc.actionWait = 60;
            npc.state = STATES.WANDERING;
            break;
        case STATES.SEEKING_PARTNER:
            let partner = state.npcs.find(n => n.id !== npc.id && Math.hypot(n.x - npc.x, n.y - npc.y) <= 20 && n.relationshipStatus === RELATION.SINGLE && (!n.gender || !npc.gender || n.gender !== npc.gender));
            if (partner) {
                npc.partnerId = partner.id; partner.partnerId = npc.id;
                npc.relationshipStatus = RELATION.PARTNERED; partner.relationshipStatus = RELATION.PARTNERED;
                npc.state = STATES.WANDERING; partner.state = STATES.WANDERING;
            } else moveRandom(npc);
            break;
        case STATES.CARING_FAMILY:
            if (npc.partnerId && npc.reproductionCooldown <= 0) {
                let p = state.npcs.find(x => x.id === npc.partnerId);
                let tribe = npc.tribeId ? state.tribes.find(tr => tr.id === npc.tribeId) : null;
                let atCap = tribe && tribe.population >= getTribeHousingCap(tribe.id);
                let starving = tribe && getTribeFood(tribe) < tribe.population;
                if (atCap || starving || npc.hunger > 60 || (p && p.hunger > 60)) {
                    moveRandom(npc);
                    break;
                }
                if (p && Math.hypot(p.x - npc.x, p.y - npc.y) <= 3) {
                    // Tán tỉnh (Courtship)
                    npc.loveMeter = (npc.loveMeter || 0) + 1;
                    p.loveMeter = (p.loveMeter || 0) + 1;
                    
                    if (state.ticks % 10 === 0 && state.particles) {
                        state.particles.push({x: npc.x*16 + 8, y: npc.y*16 - 10, vx: (Math.random()-0.5)*0.5, vy: -0.5, life: 30, type: 'heart', color: '#e84393'});
                    }

                    if (npc.loveMeter >= 60) {
                        npc.loveMeter = 0; p.loveMeter = 0;
                        // Đặt cooldown ngay lập tức để tránh lỗi gọi import() liên tục trong lúc chờ Promise resolve
                        npc.reproductionCooldown = 1200; 
                        if (p) p.reproductionCooldown = 1200;

                        // Spawn child
                        import('../entities/npc.js').then(module => {
                            let child = module.createNpc(npc.x, npc.y, npc.id, p.id);
                            child.tribeId = npc.tribeId; child.kingdomId = npc.kingdomId;
                            npc.childrenIds.push(child.id); p.childrenIds.push(child.id);
                            npc.relationshipStatus = RELATION.FAMILY; p.relationshipStatus = RELATION.FAMILY;
                            
                            import('./memorySystem.js').then(m => {
                                m.addMemory(npc, 'ChildBorn', 'Sinh con', `Đã sinh ra bé ${child.name}`, 30, child.id);
                                m.addMemory(p, 'ChildBorn', 'Sinh con', `Đã sinh ra bé ${child.name}`, 30, child.id);
                            });
                        });
                    }
                } else if (p) {
                    moveTowards(npc, p.x, p.y);
                } else moveRandom(npc);
            } else moveRandom(npc);
            break;
        case STATES.FLEEING_DISASTER:
            moveRandom(npc); // simplified
            break;
        case STATES.ATTACKING:
            if (npc.health <= 0) { npc.state = STATES.WANDERING; break; }
            if (npc.targetEnemyId || npc.targetBossId) {
                let enemy = npc.targetEnemyId ? state.npcs.find(n => n.id === npc.targetEnemyId) : state.bosses.find(b => b.id === npc.targetBossId);
                if (enemy && enemy.health > 0) {
                    let dist = Math.hypot(enemy.x - npc.x, enemy.y - npc.y);
                    let engageDist = npc.raceId === 'centaur' ? 5 : 1.5;

                    if (dist <= engageDist) {
                        let damage = 5 + Math.random() * 10;
                        
                        if (npc.tribeId) {
                            let attTribe = state.tribes.find(t=>t.id===npc.tribeId);
                            if (attTribe && attTribe.isHeroTribe) damage *= 1.5; // Tộc anh hùng gây nhiều dame hơn
                        }
                        if (enemy.tribeId) {
                            let defTribe = state.tribes.find(t=>t.id===enemy.tribeId);
                            if (defTribe && defTribe.isHeroTribe) damage *= 0.5; // Tộc anh hùng chịu ít dame hơn
                        }

                        let nx_round = Math.round(npc.x), ny_round = Math.round(npc.y);
                        if (nx_round>=0 && nx_round<COLS && ny_round>=0 && ny_round<ROWS && state.envGrid[nx_round] && state.envGrid[nx_round][ny_round]) {
                            let biome = state.envGrid[nx_round][ny_round].biome;
                            if (BIOME_EFFECTS && BIOME_EFFECTS[biome]) {
                                if (BIOME_EFFECTS[biome].preferredTribes.includes(npc.raceId)) damage *= (1 + BIOME_EFFECTS[biome].damageBuff);
                                if (BIOME_EFFECTS[biome].preferredTribes.includes(enemy.raceId)) damage *= (1 - BIOME_EFFECTS[biome].damageBuff);
                            }
                            // Elf đánh từ rừng được buff sát thương mạnh
                            if (npc.raceId === 'elf' && biome === 'Rừng') damage *= 1.5;
                        }
                        
                        // Phòng thủ bờ biển: phe cạn đứng cạnh nước (cách <2) đánh boss biển
                        if (npc.targetBossId) {
                            let rData = npc.raceId ? ENTITY_DATA.find(r => r.id === npc.raceId) : null;
                            let isLand = rData && (!rData.terrainAffinity.includes(1));
                            let isNearWater = false;
                            for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++) {
                                let tx=Math.round(npc.x)+dx, ty=Math.round(npc.y)+dy;
                                if(tx>=0&&tx<COLS&&ty>=0&&ty<ROWS&&state.grid[tx]&&state.grid[tx][ty]===1) isNearWater = true;
                            }
                            if (isLand && isNearWater) {
                                damage *= 1.5;
                                if(Math.random()<0.1) state.particles.push({x: npc.x*16+8, y: npc.y*16+8, vx: 0, vy: -1, life: 20, type: 'magic', color: '#00ffff'}); // Hiệu ứng buff
                            }
                        }

                        enemy.health -= damage;

                        if (enemy.health <= 0 && npc.traits && npc.traits.includes('heroic')) {
                            let isBoss = state.bosses.find(b=>b.id===enemy.id) || ['dragon', 'leviathan', 'titan', 'kraken_elder', 'void_wyrm', 'death_knight', 'troll_king', 'dire_bear', 'alpha_wolf', 'fae_king'].includes(enemy.raceId);
                            if (isBoss) {
                                let logStr = `[Năm ${state.time.year}] Anh hùng ${npc.name} đã tung đòn kết liễu ác quỷ ${enemy.name}, giải cứu thế giới khỏi tai ương!`;
                                if (!npc.lifeStory) npc.lifeStory = [];
                                npc.lifeStory.push(logStr);
                                import('../systems/historySystem.js').then(m => m.addWorldEvent('Legendary', 'Legendary', 'Chiến công huyền thoại', logStr));
                            }
                        }

                        // Merfolk cắn vây boss
                        if (npc.raceId === 'merfolk' && npc.targetBossId) {
                            enemy.actionWait += 5; // Giảm tốc độ boss
                        }
                        
                        // Ngoại giao: Hành động thù địch lan truyền
                        if (enemy.tribeId && npc.tribeId && enemy.tribeId !== npc.tribeId && Math.random() < 0.05) {
                            let attackerTribe = state.tribes.find(t => t.id === npc.tribeId);
                            let victimTribe = state.tribes.find(t => t.id === enemy.tribeId);
                            if (attackerTribe && victimTribe) {
                                state.tribes.forEach(t => {
                                    if (t.id !== attackerTribe.id && t.id !== victimTribe.id) {
                                        // Đồng minh của nạn nhân sẽ ghét kẻ tấn công
                                        if (t.diplomaticStatus && t.diplomaticStatus[victimTribe.id] === 'alliance') {
                                            if (t.relations[attackerTribe.id] !== undefined) t.relations[attackerTribe.id] -= 1;
                                        }
                                        // Đặc biệt: Đánh Elf thì Dryad ghét
                                        if (victimTribe.raceId === 'elf' && t.raceId === 'dryad') {
                                            if (t.relations[attackerTribe.id] !== undefined) t.relations[attackerTribe.id] -= 5;
                                        }
                                    }
                                });
                            }
                        }

                        npc.actionWait = 30; // attack cooldown
                        
                        if (npc.raceId === 'centaur' && dist > 1.5) {
                            state.particles.push({x: npc.x*16+8, y: npc.y*16+8, vx: (enemy.x-npc.x)*2, vy: (enemy.y-npc.y)*2, life: 10, type: 'magic', color: '#ffff00'});
                        }

                        state.particles.push({x: enemy.x * 16 + 8, y: enemy.y * 16 + 8, vx: Math.random()*2-1, vy: Math.random()*2-1, life: 30, type: 'blood', color: '#e74c3c'});
                    } else if (dist <= 15) {
                        moveTowards(npc, enemy.x, enemy.y);
                    } else {
                        npc.state = STATES.WANDERING;
                        npc.targetEnemyId = null;
                        npc.targetBossId = null;
                    }
                } else {
                    npc.state = STATES.WANDERING;
                    npc.targetEnemyId = null;
                    npc.targetBossId = null;
                }
            } else npc.state = STATES.WANDERING;
            break;
        default: moveRandom(npc); break;
    }
}
