import { state } from '../gameState.js';
import { TILE_SIZE } from '../config.js';
import { getNpcsInRadius } from './worldSystem.js';

export function updateGodLogic() {
    state.god.divinePower += 0.1;
    if(state.god.divinePower > 1000) state.god.divinePower = 1000;
    document.getElementById('dp-val').innerText = Math.floor(state.god.divinePower);
}

export function spawnEffect(type, tx, ty, duration) {
    getNpcsInRadius(tx, ty, 3).forEach(npc => {
        if(type==='bless') { npc.health+=50; npc.energy+=50; npc.mood="Hạnh phúc"; npc.faith+=20; }
        else if(type==='curse') { npc.health-=30; npc.energy-=30; npc.mood="Sợ hãi"; npc.fear+=20; }
        else if(type==='heal') { npc.health=100; npc.sick=false; }
    });
    for(let i=0; i<10; i++) state.particles.push({ x: tx*TILE_SIZE+8, y: ty*TILE_SIZE+8, vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2, life: duration, type });
}
