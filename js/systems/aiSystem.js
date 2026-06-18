import { state } from '../gameState.js';
import { STATES, RELATION } from '../data/constants.js';
import { TERRAIN, COLS, ROWS } from '../config.js';
import { moveRandom, moveTowards } from '../utils.js';
import { updatePlanning } from './planningSystem.js';

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
    if (state.possession.active && state.possession.npcId === npc.id) return; // Ignore AI if possessed

    let isScared = state.effects.some(e=>(e.type==='set'||e.type==='bao'||e.type==='plague') && Math.hypot(npc.x*16-e.x, npc.y*16-e.y)<16*6);
    if (isScared) { npc.state = STATES.FLEEING_DISASTER; return; }
    
    if (npc.state === STATES.EATING || npc.state === STATES.CHOPPING_WOOD || npc.state === STATES.PRAYING) return; 
    
    // Check for enemies
    if (npc.tribeId) {
        let t = state.tribes.find(tr => tr.id === npc.tribeId);
        if (t && t.diplomacy) {
            let enemyNear = state.npcs.find(n => n.id !== npc.id && n.tribeId && t.diplomacy[n.tribeId] === 'war' && Math.hypot(n.x - npc.x, n.y - npc.y) <= 8 && n.health > 0);
            if (enemyNear) {
                npc.state = STATES.ATTACKING;
                npc.targetEnemyId = enemyNear.id;
                return;
            }
        }
    }
    
    updatePlanning(npc);
}

export function executeState(npc) {
    if (npc.actionWait > 0) return;
    if (state.possession.active && state.possession.npcId === npc.id) return; // Ignore AI execution

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
                let houseType = 'Lều cỏ';
                if (npc.job === 'Thợ xây' || npc.job === 'Chiến binh') houseType = 'Nhà gỗ';
                if (npc.job === 'Trưởng làng' || npc.job === 'Lãnh chúa') houseType = 'Nhà đá';
                
                state.houses.push({ id: ++state.houseIdCounter, x: npc.x, y: npc.y, ownerId: npc.id, tribeId: npc.tribeId, durability: 100, type: houseType });
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
        case STATES.PRAYING:
            npc.faith += 1;
            npc.actionWait = 60;
            npc.state = STATES.WANDERING;
            break;
        case STATES.SEEKING_PARTNER:
            let partner = state.npcs.find(n => n.id !== npc.id && Math.hypot(n.x - npc.x, n.y - npc.y) <= 5 && n.relationshipStatus === RELATION.SINGLE);
            if (partner) {
                npc.partnerId = partner.id; partner.partnerId = npc.id;
                npc.relationshipStatus = RELATION.PARTNERED; partner.relationshipStatus = RELATION.PARTNERED;
                npc.state = STATES.WANDERING; partner.state = STATES.WANDERING;
            } else moveRandom(npc);
            break;
        case STATES.CARING_FAMILY:
            if (npc.partnerId && npc.reproductionCooldown <= 0) {
                let p = state.npcs.find(x => x.id === npc.partnerId);
                if (p && Math.hypot(p.x - npc.x, p.y - npc.y) <= 3) {
                    // Spawn child
                    import('../entities/npc.js').then(module => {
                        let child = module.createNpc(npc.x, npc.y, npc.id, p.id);
                        child.tribeId = npc.tribeId; child.kingdomId = npc.kingdomId;
                        npc.childrenIds.push(child.id); p.childrenIds.push(child.id);
                        npc.reproductionCooldown = 1200; p.reproductionCooldown = 1200;
                        npc.relationshipStatus = RELATION.FAMILY; p.relationshipStatus = RELATION.FAMILY;
                        
                        import('./memorySystem.js').then(m => {
                            m.addMemory(npc, 'ChildBorn', 'Sinh con', `Đã sinh ra bé ${child.name}`, 30, child.id);
                            m.addMemory(p, 'ChildBorn', 'Sinh con', `Đã sinh ra bé ${child.name}`, 30, child.id);
                        });
                    });
                } else if (p) {
                    moveTowards(npc, p.x, p.y);
                } else moveRandom(npc);
            } else moveRandom(npc);
            break;
        case STATES.FLEEING_DISASTER:
            moveRandom(npc); // simplified
            break;
        case STATES.ATTACKING:
            if (npc.targetEnemyId) {
                let enemy = state.npcs.find(n => n.id === npc.targetEnemyId);
                if (enemy && enemy.health > 0) {
                    let dist = Math.hypot(enemy.x - npc.x, enemy.y - npc.y);
                    if (dist <= 1.5) {
                        enemy.health -= 5 + Math.random() * 10;
                        npc.actionWait = 30; // attack cooldown
                        state.particles.push({x: enemy.x * 16 + 8, y: enemy.y * 16 + 8, vx: Math.random()*2-1, vy: Math.random()*2-1, life: 30, type: 'blood', color: '#e74c3c'});
                    } else if (dist <= 10) {
                        moveTowards(npc, enemy.x, enemy.y);
                    } else {
                        npc.state = STATES.WANDERING;
                        npc.targetEnemyId = null;
                    }
                } else {
                    npc.state = STATES.WANDERING;
                    npc.targetEnemyId = null;
                }
            } else npc.state = STATES.WANDERING;
            break;
        default: moveRandom(npc); break;
    }
}
