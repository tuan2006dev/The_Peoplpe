import { state } from '../gameState.js';
import { STATES_TEXT } from '../data/constants.js';

export function updatePossessionHUD(npc) {
    let hud = document.getElementById('possession-hud');
    if (!hud) return;
    
    document.getElementById('poss-name').innerText = npc.name;
    document.getElementById('poss-hp').style.width = npc.health + '%';
    document.getElementById('poss-energy').style.width = npc.energy + '%';
    document.getElementById('poss-hunger').style.width = (100 - npc.hunger) + '%';
    
    document.getElementById('poss-faith').innerText = Math.floor(npc.faith);
    document.getElementById('poss-fear').innerText = Math.floor(npc.fear);
    document.getElementById('poss-lifegoal').innerText = npc.lifeGoal || 'Không rõ';
    
    // Faction
    let tribe = state.tribes.find(t => t.id === npc.tribeId);
    let kingdom = state.kingdoms.find(k => k.id === npc.kingdomId);
    let factionStr = "";
    if (tribe) factionStr += tribe.name;
    if (kingdom) factionStr += " - " + kingdom.name;
    document.getElementById('poss-faction').innerText = factionStr || 'Lang thang';
    
    // Family
    let spouse = state.npcs.find(n => n.id === npc.partnerId);
    document.getElementById('poss-family').innerText = spouse ? `Vợ/Chồng: ${spouse.name}` : 'Độc thân';
    
    // Stream of Consciousness
    let logHtml = (npc.personalLog || []).map(log => `<li>${log}</li>`).join('');
    let logContainer = document.getElementById('poss-thoughts-log');
    if (logContainer) {
        let isAtBottom = logContainer.scrollHeight - logContainer.clientHeight <= logContainer.scrollTop + 1;
        logContainer.innerHTML = logHtml || '<li>(Tâm trí trống rỗng...)</li>';
        if (isAtBottom) logContainer.scrollTop = logContainer.scrollHeight;
    }
    
    // Bind God Action Buttons if not already bound
    let btnInspire = document.getElementById('btn-god-inspire');
    if (btnInspire && !btnInspire.dataset.bound) {
        btnInspire.dataset.bound = true;
        btnInspire.addEventListener('click', () => {
            import('./possessionSystem.js').then(m => m.godActionInspire());
        });
    }
    let btnDream = document.getElementById('btn-god-dream');
    if (btnDream && !btnDream.dataset.bound) {
        btnDream.dataset.bound = true;
        btnDream.addEventListener('click', () => {
            import('./possessionSystem.js').then(m => m.godActionDream());
        });
    }
    let btnGift = document.getElementById('btn-god-gift');
    if (btnGift && !btnGift.dataset.bound) {
        btnGift.dataset.bound = true;
        btnGift.addEventListener('click', () => {
            import('./possessionSystem.js').then(m => m.godActionGift());
        });
    }
}
