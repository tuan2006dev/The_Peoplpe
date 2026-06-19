import { state } from '../gameState.js';
import { TILE_SIZE, COLS, ROWS } from '../config.js';
import { centerCamera } from '../camera.js';
import { updatePossessionHUD } from '../ui/possessionHUD.js';

export function togglePossession(npcId) {
    if (state.possession.active && state.possession.npcId === npcId) {
        // Exit
        exitPossession();
    } else {
        // Enter
        let npc = state.npcs.find(n => n.id === npcId);
        if (!npc) return;
        
        if (state.possession.active) exitPossession(); // Exit previous if any
        
        state.possession.active = true;
        state.possession.npcId = npc.id;
        state.possession.targetX = null;
        state.possession.targetY = null;
        
        // Setup UI
        document.getElementById('right-sidebar').classList.add('hidden');
        document.getElementById('possession-hud').classList.remove('hidden');
        document.getElementById('action-bar').classList.remove('hidden');
        
        // Speed to 1x
        state.time.speedMultiplier = 1;
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        let btn1x = document.querySelector('.speed-btn[data-speed="1"]');
        if (btn1x) btn1x.classList.add('active');
        
        import('./memorySystem.js').then(m => {
            m.addPersonalLog(npc, `Cảm thấy một luồng sức mạnh siêu nhiên nhập vào cơ thể...`);
        });
    }
}

export function exitPossession() {
    if (!state.possession.active) return;
    
    let npc = state.npcs.find(n => n.id === state.possession.npcId);
    if (npc) {
        import('./memorySystem.js').then(m => {
            m.addPersonalLog(npc, `Luồng sức mạnh siêu nhiên đã rời đi. Cơ thể mệt nhoài.`);
            m.addMemory(npc, 'Miracle', 'Bị Thần Nhập', 'Linh hồn của Thần đã mượn tạm thể xác này.', 50, null);
            npc.faith = Math.min(100, npc.faith + 30);
            npc.energy = Math.max(0, npc.energy - 30);
            
            // Story Director hook for Divine Encounter
            let possessCount = (npc.memories || []).filter(mem => mem.title === 'Bị Thần Nhập').length;
            if (possessCount >= 3 && (!npc.traits || !npc.traits.includes('prophet'))) {
                import('./storyDirectorSystem.js').then(sd => {
                    if (!npc.traits) npc.traits = [];
                    if (!npc.traits.includes('prophet')) {
                        npc.traits.push('prophet');
                        sd.createStoryEvent('Divine Encounter', `Gặp Gỡ Thần Linh`, `${npc.name} đã được Thần mượn xác nhiều lần và nhận lãnh thiên mệnh.`, 'LEGENDARY', [npc.id]);
                        sd.addLifeStory(npc.id, `Trở thành sứ giả của Thần sau nhiều lần được chọn làm thể xác.`);
                    }
                }).catch(e => console.log("StoryDirector loading deferred"));
            }
        });
    }
    
    state.possession.active = false;
    state.possession.npcId = null;
    
    document.getElementById('right-sidebar').classList.remove('hidden');
    let hud = document.getElementById('possession-hud');
    if (hud) hud.classList.add('hidden');
    let ab = document.getElementById('action-bar');
    if (ab) ab.classList.add('hidden');
}

export function updatePossessionTick() {
    if (!state.possession.active) return;
    
    let npc = state.npcs.find(n => n.id === state.possession.npcId);
    if (!npc) {
        exitPossession();
        return;
    }
    
    // Dòng suy nghĩ (Tự động cập nhật qua HUD)
    if (Math.random() < 0.02) { // 2% chance per tick to generate a random thought
        let thought = "";
        if (npc.hunger > 70) thought = "Bụng réo liên tục... Mình cần tìm thứ gì đó để ăn gấp.";
        else if (npc.energy < 30) thought = "Mệt quá, muốn chợp mắt một lát.";
        else if (npc.mood < 30) thought = "Thật là một ngày tồi tệ. Mọi thứ đều nhàm chán.";
        else if (npc.state === 1) thought = "Phải tìm thức ăn thôi."; // SEEKING_FOOD
        else if (npc.state === 2) thought = "Ngon quá!"; // EATING
        else if (npc.state === 5) thought = "Làm việc, làm việc, làm việc... Tương lai sẽ tốt hơn."; // GATHERING
        else if (npc.state === 8) thought = "Zzz... Zzz..."; // SLEEPING
        else if (Math.random() < 0.1) thought = "Trời hôm nay thật đẹp.";
        
        if (thought !== "" && (!npc.personalLog || npc.personalLog[0]?.indexOf(thought) === -1)) {
            import('./memorySystem.js').then(m => m.addPersonalLog(npc, thought));
        }
    }
    
    // Năng lượng giảm dần khi theo dõi
    state.god.divinePower -= 0.5 / state.time.framesPerDay; 
    if (state.god.divinePower <= 0) {
        state.god.divinePower = 0;
        exitPossession();
        return;
    }
    
    // Lock Camera
    centerCamera(npc.x * TILE_SIZE, npc.y * TILE_SIZE);
    
    // Update HUD
    updatePossessionHUD(npc);
    
    // Quests
    import('./personalQuestSystem.js').then(m => m.checkPersonalQuestsTick());
}

export function godActionInspire() {
    if (!state.possession.active) return;
    let npc = state.npcs.find(n => n.id === state.possession.npcId);
    if (!npc || state.god.divinePower < 10) return;
    
    state.god.divinePower -= 10;
    npc.energy = 100;
    npc.mood = 100;
    import('./memorySystem.js').then(m => {
        m.addPersonalLog(npc, "Một luồng cảm hứng mãnh liệt từ hư không tràn vào tâm trí! Mình cảm thấy có thể làm được mọi thứ!");
    });
}

export function godActionDream() {
    if (!state.possession.active) return;
    let npc = state.npcs.find(n => n.id === state.possession.npcId);
    if (!npc || state.god.divinePower < 20) return;
    
    state.god.divinePower -= 20;
    import('./memorySystem.js').then(m => {
        m.generateLifeGoal(npc); // Reroll life goal
        m.addPersonalLog(npc, `Mơ một giấc mơ kỳ lạ... Từ nay mục tiêu của mình là: ${npc.lifeGoal}`);
    });
}

export function godActionGift() {
    if (!state.possession.active) return;
    let npc = state.npcs.find(n => n.id === state.possession.npcId);
    if (!npc || state.god.divinePower < 15) return;
    
    state.god.divinePower -= 15;
    npc.hunger = Math.max(0, npc.hunger - 50);
    import('./memorySystem.js').then(m => {
        m.addPersonalLog(npc, "Thấy một quả táo vàng rụng ngay trước mặt. Ăn vào thấy no và khỏe hẳn ra!");
    });
}
