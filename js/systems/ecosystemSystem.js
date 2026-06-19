import { state } from '../gameState.js';
import { ENTITY_DATA, TIER } from '../data/races.js';
import { COLS, ROWS, TERRAIN } from '../config.js';
import { moveRandom, moveTowards } from '../utils.js';

export function spawnAnimal(x, y, raceId) {
    let raceData = ENTITY_DATA.find(r => r.id === raceId);
    if (!raceData) return;
    let a = {
        id: ++state.idCounter,
        raceId: raceId,
        name: raceData.name,
        x: x, y: y,
        health: 50,
        energy: 100,
        hunger: 0,
        actionWait: 0,
        gender: Math.random() < 0.5 ? 'male' : 'female',
        reproductionCooldown: 0
    };
    state.animals.push(a);
}

export function updateEcosystem() {
    if (Math.random() < 0.05 && state.animals.length < 30) {
        let allowed = ENTITY_DATA.filter(r => r.tier === TIER.ANIMAL);
        let r = allowed[Math.floor(Math.random() * allowed.length)];
        let x = Math.floor(Math.random() * COLS);
        let y = Math.floor(Math.random() * ROWS);
        if (state.grid[x] && state.grid[x][y] !== TERRAIN.NUOC || r.terrainAffinity.includes(TERRAIN.NUOC)) {
            spawnAnimal(x, y, r.id);
            spawnAnimal(x + (Math.random()*2-1), y + (Math.random()*2-1), r.id);
            state.animals[state.animals.length-1].gender = state.animals[state.animals.length-2].gender === 'male' ? 'female' : 'male';
        }
    }

    state.animals.forEach(a => {
        if (a.health <= 0) return;
        if (a.actionWait > 0) { a.actionWait--; return; }

        let raceData = ENTITY_DATA.find(r => r.id === a.raceId);
        if (!raceData) return;

        a.hunger += 0.5;
        if (a.hunger > 100) a.health -= 2;
        if (a.reproductionCooldown > 0) a.reproductionCooldown--;

        // Reproduction
        if (state.ticks % 15 === 0 && a.gender === 'female' && a.reproductionCooldown <= 0 && a.hunger < 50) {
            let mate = state.animals.find(m => m.raceId === a.raceId && m.gender === 'male' && m.health > 0 && Math.hypot(m.x - a.x, m.y - a.y) <= 2);
            if (mate && Math.random() < 0.3) {
                spawnAnimal(a.x, a.y, a.raceId);
                a.reproductionCooldown = 300;
                mate.reproductionCooldown = 300;
            }
        }

        // Predator Logic
        if (a.raceId === 'giant_crab') {
            if (a.hunger > 40) {
                let preys = state.animals.filter(p => p.id !== a.id && p.health > 0 && Math.hypot(p.x - a.x, p.y - a.y) <= 8 && (p.raceId === 'salmon' || p.raceId === 'duck'));
                if (preys.length > 0) {
                    let prey = preys[0];
                    if (Math.hypot(prey.x - a.x, prey.y - a.y) <= 1) {
                        prey.health -= 20; a.actionWait = 15;
                        if (prey.health <= 0) a.hunger -= 50;
                    } else {
                        moveTowards(a, prey.x, prey.y);
                        return;
                    }
                }
            }
        } else {
            // Orc & Goblin săn thú hoang
            let predator = state.npcs.find(n => (n.raceId === 'orc' || n.raceId === 'goblin') && Math.hypot(n.x - a.x, n.y - a.y) <= 5 && n.health > 0);
            if (predator) {
                if (Math.hypot(predator.x - a.x, predator.y - a.y) <= 1.5) {
                    a.health -= 15;
                    predator.actionWait = 10;
                    if (a.health <= 0 && predator.inventory) {
                        predator.inventory.foodCarried += 10; 
                    }
                }
                // Flee
                let dx = a.x - predator.x; let dy = a.y - predator.y;
                let dist = Math.hypot(dx, dy);
                if (dist > 0) {
                    moveTowards(a, a.x + (dx/dist)*2, a.y + (dy/dist)*2);
                    a.actionWait = 5;
                    return;
                }
            }
        }

        let validTerrain = raceData.terrainAffinity;
        let cx = Math.floor(a.x); let cy = Math.floor(a.y);
        if (state.grid[cx] && validTerrain.length > 0 && !validTerrain.includes(state.grid[cx][cy])) {
            moveRandom(a);
        } else {
            if (a.hunger > 30) {
                if (state.grid[cx] && (state.grid[cx][cy] === TERRAIN.DAT || state.grid[cx][cy] === TERRAIN.RUNG)) {
                    a.hunger -= 10; a.actionWait = 30;
                } else { moveRandom(a); }
            } else { moveRandom(a); }
        }
    });

    for (let i = state.animals.length - 1; i >= 0; i--) {
        if (state.animals[i].health <= 0) state.animals.splice(i, 1);
    }
}
