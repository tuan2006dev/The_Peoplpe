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
    
    // Inventory
    let inv = npc.inventory;
    document.getElementById('poss-inv').innerHTML = `
        🍖 Food: ${Math.floor(inv.foodCarried)} | 🪵 Wood: ${Math.floor(inv.wood)} | 💎 Rare: ${inv.rareMaterial}<br>
        🛠 Tool: ${inv.tool ? 'Có' : 'Không'} | ⚔️ Weapon: ${inv.weapon ? 'Có' : 'Không'} | 💊 Med: ${inv.medicine}
    `;
    
    // Quests
    let activeQuest = (npc.quests || []).find(q => q.status === 'active');
    if (activeQuest) {
        document.getElementById('poss-quest').innerHTML = `<b>${activeQuest.title}</b><br>${activeQuest.objective}`;
    } else {
        document.getElementById('poss-quest').innerText = 'Không có';
    }
    
    // Rels and Mems
    let relsHtml = (npc.relationships || []).map(r => {
        let tn = state.npcs.find(x => x.id === r.targetNpcId);
        return tn ? `${tn.name}: ${r.type} (${Math.floor(r.affection)})` : '';
    }).filter(x=>x).join('<br>');
    document.getElementById('poss-rels').innerHTML = relsHtml || 'Chưa quen ai';
    
    let memsHtml = (npc.memories || []).slice(-3).map(m => `[Tuổi ${Math.floor(npc.age - (state.time.year - m.year))}] ${m.title}`).join('<br>');
    document.getElementById('poss-mems').innerHTML = memsHtml || 'Không có ký ức';
    
    import('./actionBar.js').then(m => m.updateActionBar(npc));
}
