import { state } from '../gameState.js';
import { TERRAIN } from '../config.js';

export function updateActionBar(npc) {
    let ab = document.getElementById('action-bar');
    if (!ab) return;
    
    // Check conditions
    let inv = npc.inventory || {};
    let hasFood = inv.foodCarried >= 10;
    let hasWood = inv.wood >= 10;
    let isNearTree = state.grid[Math.floor(npc.x)][Math.floor(npc.y)] === TERRAIN.RUNG;
    let isNearFood = state.foods.some(f => Math.hypot(f.x - npc.x, f.y - npc.y) <= 2);
    let isNearNpc = state.npcs.some(n => n.id !== npc.id && Math.hypot(n.x - npc.x, n.y - npc.y) <= 2);
    let canBuild = hasWood && state.grid[Math.floor(npc.x)][Math.floor(npc.y)] === TERRAIN.DAT && !state.houses.some(h => h.x === Math.floor(npc.x) && h.y === Math.floor(npc.y));
    
    let html = `
        <button id="btn-act-eat" class="action-btn" onclick="window.handlePossessionAction('eat')" ${hasFood ? '' : 'disabled'}>Ăn thịt</button>
        <button id="btn-act-rest" class="action-btn" onclick="window.handlePossessionAction('rest')">Nghỉ ngơi</button>
        <button id="btn-act-talk" class="action-btn" onclick="window.handlePossessionAction('talk')" ${isNearNpc ? '' : 'disabled'}>Nói chuyện</button>
        <button id="btn-act-gather" class="action-btn" onclick="window.handlePossessionAction('gather')" ${isNearFood ? '' : 'disabled'}>Hái lượm</button>
        <button id="btn-act-chop" class="action-btn" onclick="window.handlePossessionAction('chop')" ${isNearTree ? '' : 'disabled'}>Chặt cây</button>
        <button id="btn-act-build" class="action-btn" onclick="window.handlePossessionAction('build')" ${canBuild ? '' : 'disabled'}>Xây nhà</button>
        <button id="btn-act-pray" class="action-btn" onclick="window.handlePossessionAction('pray')">Cầu nguyện</button>
        <button id="btn-act-work" class="action-btn" onclick="window.handlePossessionAction('work')">Làm việc</button>
        <button id="btn-act-attack" class="action-btn" onclick="window.handlePossessionAction('attack')" ${isNearNpc ? '' : 'disabled'}>Tấn công</button>
        <button id="btn-act-heal" class="action-btn" onclick="window.handlePossessionAction('heal')" ${isNearNpc ? '' : 'disabled'}>Chữa trị</button>
        <button id="btn-act-gift" class="action-btn" onclick="window.handlePossessionAction('gift')" ${isNearNpc ? '' : 'disabled'}>Tặng đồ</button>
        <button id="btn-act-follow" class="action-btn" onclick="window.handlePossessionAction('follow')" ${isNearNpc ? '' : 'disabled'}>Theo dõi</button>
    `;
    
    ab.innerHTML = html;
}

window.handlePossessionAction = (actionStr) => {
    if (!state.possession.active) return;
    let npc = state.npcs.find(n => n.id === state.possession.npcId);
    if (!npc) return;
    import('../systems/inventorySystem.js').then(m => m.handleAction(npc, actionStr));
};
