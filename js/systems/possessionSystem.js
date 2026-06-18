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
    
    // Drain Divine Power
    state.god.divinePower -= 2 / state.time.framesPerDay; // ~2 per second if 60fps
    if (state.god.divinePower <= 0) {
        state.god.divinePower = 0;
        exitPossession();
        return;
    }
    
    // Move logic
    let speed = 0.1;
    let dx = 0; let dy = 0;
    let keys = state.possession.keys;
    
    if (keys.w) dy -= speed;
    if (keys.s) dy += speed;
    if (keys.a) dx -= speed;
    if (keys.d) dx += speed;
    
    if (dx !== 0 || dy !== 0) {
        // Manual move overrides target
        state.possession.targetX = null;
        state.possession.targetY = null;
        
        let newX = npc.x + dx;
        let newY = npc.y + dy;
        
        if (newX >= 0 && newX < COLS - 1 && newY >= 0 && newY < ROWS - 1) {
            npc.x = newX;
            npc.y = newY;
            npc.walkCycle += 0.3;
        }
    } else if (state.possession.targetX !== null && state.possession.targetY !== null) {
        // Move towards target
        let ddx = state.possession.targetX - npc.x;
        let ddy = state.possession.targetY - npc.y;
        let dist = Math.hypot(ddx, ddy);
        
        if (dist > 0.1) {
            npc.x += (ddx / dist) * speed;
            npc.y += (ddy / dist) * speed;
            npc.walkCycle += 0.3;
        } else {
            state.possession.targetX = null;
            state.possession.targetY = null;
        }
    } else {
        npc.walkCycle = 0;
    }
    
    // Lock Camera
    centerCamera(npc.x * TILE_SIZE, npc.y * TILE_SIZE);
    
    // Update HUD
    updatePossessionHUD(npc);
    
    // Quests
    import('./personalQuestSystem.js').then(m => m.checkPersonalQuestsTick());
}

export function handleInteract() {
    if (!state.possession.active) return;
    let npc = state.npcs.find(n => n.id === state.possession.npcId);
    if (!npc) return;
    
    // Find closest interactable
    let closestNpc = state.npcs.find(n => n.id !== npc.id && Math.hypot(n.x - npc.x, n.y - npc.y) <= 2);
    if (closestNpc) {
        import('./dialogueSystem.js').then(m => m.openDialogue(npc, closestNpc));
        return;
    }
    
    // If no NPC, try picking up food
    let food = state.foods.find(f => Math.hypot(f.x - npc.x, f.y - npc.y) <= 2);
    if (food) {
        import('./inventorySystem.js').then(m => m.handleAction(npc, 'gather'));
        return;
    }
}

export function handleQuickAction() {
    if (!state.possession.active) return;
    let ab = document.getElementById('action-bar');
    if (ab) ab.classList.toggle('hidden');
}
