import { state } from '../gameState.js';
import { ENTITY_DATA, TIER } from '../data/races.js';
import { COLS, ROWS, TERRAIN } from '../config.js';
import { moveRandom, moveTowards } from '../utils.js';

let recentDeaths = {};

export function registerDeath(x, y) {
    let key = `${Math.floor(x)},${Math.floor(y)}`;
    if (!recentDeaths[key]) recentDeaths[key] = [];
    recentDeaths[key].push(state.ticks);
    
    // Clean old (older than 150 ticks = 5 periods of 30)
    recentDeaths[key] = recentDeaths[key].filter(t => state.ticks - t < 150);
    
    if (recentDeaths[key].length >= 10) {
        spawnSpirit(Math.floor(x), Math.floor(y), 'ghost');
        recentDeaths[key] = []; 
    }
}

export function spawnSpirit(x, y, raceId) {
    let raceData = ENTITY_DATA.find(r => r.id === raceId);
    if (!raceData) return;
    let s = {
        id: ++state.idCounter,
        raceId: raceId,
        name: raceData.name,
        x: x, y: y,
        health: 200,
        actionWait: 0,
        life: 1500
    };
    state.spirits.push(s);
}

export function updateSpirits() {
    state.spirits.forEach(s => {
        if (s.health <= 0) return;
        s.life--;
        if (s.life <= 0) { s.health = 0; return; }
        if (s.actionWait > 0) { s.actionWait--; return; }

        let nearHoly = state.buildings.find(b => (b.type === 'temple' || b.type === 'shrine') && Math.hypot(b.x - s.x, b.y - s.y) <= 10);
        if (nearHoly) {
            moveTowards(s, s.x + (s.x - nearHoly.x), s.y + (s.y - nearHoly.y));
            s.health -= 5;
            s.actionWait = 10;
            return;
        }

        if (s.raceId === 'ghost') {
            state.npcs.forEach(n => {
                if (Math.hypot(n.x - s.x, n.y - s.y) <= 5) {
                    n.fear += 5;
                    n.happiness -= 5;
                }
            });
            moveRandom(s);
        } else if (s.raceId === 'banshee' || s.raceId === 'wight') {
            let target = state.npcs.find(n => Math.hypot(n.x - s.x, n.y - s.y) <= 5);
            if (target) {
                target.health -= 15;
                s.actionWait = 20;
                moveTowards(s, target.x, target.y);
            } else {
                moveRandom(s);
            }
        } else {
            moveRandom(s);
        }
    });

    for (let i = state.spirits.length - 1; i >= 0; i--) {
        if (state.spirits[i].health <= 0) state.spirits.splice(i, 1);
    }
}
