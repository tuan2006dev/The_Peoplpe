import { state } from '../gameState.js';
import { TERRAIN } from '../config.js';

export function handleAction(npc, actionStr) {
    let inv = npc.inventory;
    switch(actionStr) {
        case 'eat':
            if (inv.foodCarried >= 10) {
                inv.foodCarried -= 10;
                npc.hunger -= 40;
                if (npc.hunger < 0) npc.hunger = 0;
            }
            break;
        case 'chop':
            if (state.grid[Math.floor(npc.x)][Math.floor(npc.y)] === TERRAIN.RUNG) {
                inv.wood += 5;
                state.grid[Math.floor(npc.x)][Math.floor(npc.y)] = TERRAIN.DAT;
                state.envGrid[Math.floor(npc.x)][Math.floor(npc.y)].biome = "Đồng cỏ";
            }
            break;
        case 'gather':
            let food = state.foods.find(f => Math.hypot(f.x - npc.x, f.y - npc.y) <= 2);
            if (food) {
                let idx = state.foods.indexOf(food);
                if (idx > -1) state.foods.splice(idx, 1);
                inv.foodCarried += 20;
            }
            break;
        case 'build':
            if (inv.wood >= 10 && state.grid[Math.floor(npc.x)][Math.floor(npc.y)] === TERRAIN.DAT) {
                if (!state.houses.find(h => h.x === Math.floor(npc.x) && h.y === Math.floor(npc.y))) {
                    let houseType = 'Lều cỏ';
                    if (npc.job === 'Thợ xây' || npc.job === 'Chiến binh') houseType = 'Nhà gỗ';
                    if (npc.job === 'Trưởng làng' || npc.job === 'Lãnh chúa') houseType = 'Nhà đá';

                    state.houses.push({ id: ++state.houseIdCounter, x: Math.floor(npc.x), y: Math.floor(npc.y), ownerId: npc.id, tribeId: npc.tribeId, durability: 100, type: houseType });
                    inv.wood -= 10;
                    npc.homeId = state.houseIdCounter;
                    npc.state = 'building_home';
                }
            }
            break;
        case 'rest':
            npc.energy += 30;
            if (npc.energy > 100) npc.energy = 100;
            npc.state = 'resting';
            break;
        case 'talk':
            let tNpc = state.npcs.find(n => n.id !== npc.id && Math.hypot(n.x - npc.x, n.y - npc.y) <= 2);
            if (tNpc) import('./dialogueSystem.js').then(m => m.openDialogue(npc, tNpc));
            break;
        case 'attack':
            let eNpc = state.npcs.find(n => n.id !== npc.id && Math.hypot(n.x - npc.x, n.y - npc.y) <= 2);
            if (eNpc) {
                eNpc.health -= 20;
                npc.energy -= 10;
                npc.state = 'attacking';
                if (eNpc.health <= 0) eNpc.health = 0;
            }
            break;
        case 'heal':
            let hNpc = state.npcs.find(n => n.id !== npc.id && Math.hypot(n.x - npc.x, n.y - npc.y) <= 2);
            if (hNpc && inv.medicine > 0) {
                inv.medicine--;
                hNpc.health += 30;
                if (hNpc.health > 100) hNpc.health = 100;
                npc.state = 'treating_sick';
            }
            break;
        case 'gift':
            let gNpc = state.npcs.find(n => n.id !== npc.id && Math.hypot(n.x - npc.x, n.y - npc.y) <= 2);
            if (gNpc && inv.foodCarried > 0) {
                inv.foodCarried -= 5;
                gNpc.inventory.foodCarried += 5;
                let rel = npc.relationships.find(r => r.targetNpcId === gNpc.id);
                if (!rel) { rel = { targetNpcId: gNpc.id, type: 'Người quen', affection: 0 }; npc.relationships.push(rel); }
                rel.affection += 10;
            }
            break;
        case 'follow':
            let fNpc = state.npcs.find(n => n.id !== npc.id && Math.hypot(n.x - npc.x, n.y - npc.y) <= 2);
            if (fNpc) {
                state.followedNpcId = fNpc.id;
            }
            break;
        case 'pray':
            npc.faith += 5;
            npc.state = 'praying';
            if (npc.faith > 100) npc.faith = 100;
            break;
        case 'work':
            npc.state = 'working_job';
            break;
    }
    
    // Refresh action bar
    import('../ui/actionBar.js').then(m => m.updateActionBar(npc));
}
