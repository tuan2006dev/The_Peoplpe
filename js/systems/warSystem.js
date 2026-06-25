import { state } from '../gameState.js';
import { COLS, ROWS } from '../config.js';
import { STATES } from '../data/constants.js';
import { moveTowards } from '../utils.js';
import { setTribeRelation } from './diplomacySystem.js';
import { addWorldEvent, logEvent } from './historySystem.js';

const SOLDIER_RATIO = 0.30;
const TERRITORY_TRANSFER_COUNT = 15;

function getDiplomaticStatus(tribe, otherId) {
    if (!tribe) return 'neutral';
    return (tribe.diplomaticStatus && tribe.diplomaticStatus[otherId])
        || (tribe.diplomacy && tribe.diplomacy[otherId])
        || 'neutral';
}

export function updateWarLogic() {
    if (!state.tribes || state.tribes.length < 2) return;

    state.tribes.forEach(tribe => {
        state.tribes.forEach(enemyTribe => {
            if (enemyTribe.id === tribe.id) return;
            if (getDiplomaticStatus(tribe, enemyTribe.id) !== 'war') return;

            _recruitSoldiers(tribe);
            _marchSoldiers(tribe, enemyTribe);
        });
    });

    _checkWarOutcome();
}

function _recruitSoldiers(tribe) {
    const members = state.npcs.filter(n =>
        n.tribeId === tribe.id && n.age >= 16 && n.health > 50 && !n.isSoldier
    );
    const targetSoldierCount = Math.floor(tribe.population * SOLDIER_RATIO);
    const currentSoldiers = state.npcs.filter(n => n.tribeId === tribe.id && n.isSoldier && n.health > 0).length;

    if (currentSoldiers < targetSoldierCount) {
        const candidates = members
            .sort((a, b) => (b.bravery + b.combatSkill) - (a.bravery + a.combatSkill))
            .slice(0, targetSoldierCount - currentSoldiers);

        candidates.forEach(npc => {
            npc.isSoldier = true;
            npc.job = 'Chiến binh';
            npc.state = STATES.WANDERING;
        });
    }
}

function _marchSoldiers(tribe, enemyTribe) {
    const soldiers = state.npcs.filter(n =>
        n.tribeId === tribe.id && n.isSoldier && n.health > 0
    );

    soldiers.forEach(soldier => {
        if (soldier.actionWait > 0 || soldier.state === STATES.ATTACKING) return;

        const nearestEnemy = state.npcs
            .filter(n => n.tribeId === enemyTribe.id && n.health > 0)
            .sort((a, b) =>
                Math.hypot(a.x - soldier.x, a.y - soldier.y) -
                Math.hypot(b.x - soldier.x, b.y - soldier.y)
            )[0];

        if (nearestEnemy) {
            const dist = Math.hypot(nearestEnemy.x - soldier.x, nearestEnemy.y - soldier.y);
            let engageDist = soldier.raceId === 'centaur' ? 5 : 1.5;

            if (dist <= engageDist) {
                soldier.state = STATES.ATTACKING;
                soldier.targetEnemyId = nearestEnemy.id;
            } else if (dist <= 30) {
                soldier.state = STATES.WANDERING;

                if (soldier.raceId === 'dwarf' && dist > 10 && Math.random() < 0.05) {
                    let newX = soldier.x + (nearestEnemy.x - soldier.x) * 0.4;
                    let newY = soldier.y + (nearestEnemy.y - soldier.y) * 0.4;
                    soldier.x = Math.max(0, Math.min(COLS - 1, newX));
                    soldier.y = Math.max(0, Math.min(ROWS - 1, newY));
                    soldier.actionWait = 10;
                    if (state.particles) state.particles.push({x: soldier.x*16, y: soldier.y*16, vx:0, vy:0, life:20, type:'smoke', color:'#888'});
                } else if (soldier.raceId === 'centaur' && dist < 3) {
                    moveTowards(soldier, soldier.x - (nearestEnemy.x - soldier.x), soldier.y - (nearestEnemy.y - soldier.y));
                } else {
                    moveTowards(soldier, nearestEnemy.x, nearestEnemy.y);
                }
            } else {
                soldier.state = STATES.WANDERING;
                moveTowards(soldier, enemyTribe.x, enemyTribe.y);
            }
        } else {
            soldier.state = STATES.WANDERING;
            moveTowards(soldier, enemyTribe.x, enemyTribe.y);
        }
    });
}

function _checkWarOutcome() {
    if (state.ticks % 300 !== 0) return;

    const warPairs = new Set();

    state.tribes.forEach(tribe => {
        state.tribes.forEach(enemyTribe => {
            if (enemyTribe.id <= tribe.id) return;
            if (getDiplomaticStatus(tribe, enemyTribe.id) !== 'war') return;

            const pairKey = [tribe.id, enemyTribe.id].sort().join('-');
            if (warPairs.has(pairKey)) return;
            warPairs.add(pairKey);

            const mySoldiers = state.npcs.filter(n => n.tribeId === tribe.id && n.isSoldier && n.health > 0).length;
            const enemySoldiers = state.npcs.filter(n => n.tribeId === enemyTribe.id && n.isSoldier && n.health > 0).length;

            if (mySoldiers === 0 && enemySoldiers > 0) {
                _transferTerritory(enemyTribe, tribe, TERRITORY_TRANSFER_COUNT);
                _endWar(tribe, enemyTribe, enemyTribe.name);
            } else if (enemySoldiers === 0 && mySoldiers > 0) {
                _transferTerritory(tribe, enemyTribe, TERRITORY_TRANSFER_COUNT);
                _endWar(tribe, enemyTribe, tribe.name);
            } else if (mySoldiers === 0 && enemySoldiers === 0) {
                _endWar(tribe, enemyTribe, "Hòa");
            }
        });
    });
}

function _transferTerritory(winner, loser, count) {
    const borderTiles = (loser.territoryTiles || []).filter(tile => {
        const neighbors = [
            {x: tile.x+1, y: tile.y}, {x: tile.x-1, y: tile.y},
            {x: tile.x, y: tile.y+1}, {x: tile.x, y: tile.y-1}
        ];
        return neighbors.some(n =>
            state.territoryGrid[n.x] && state.territoryGrid[n.x][n.y] === winner.id
        );
    });

    const toTransfer = borderTiles.slice(0, count);
    toTransfer.forEach(tile => {
        state.territoryGrid[tile.x][tile.y] = winner.id;
        winner.territoryTiles = winner.territoryTiles || [];
        winner.territoryTiles.push(tile);
        loser.territoryTiles = (loser.territoryTiles || []).filter(
            t => !(t.x === tile.x && t.y === tile.y)
        );
    });
}

function _endWar(tribe1, tribe2, winnerName) {
    [tribe1, tribe2].forEach(tribe => {
        state.npcs.filter(n => n.tribeId === tribe.id && n.isSoldier).forEach(n => {
            n.isSoldier = false;
            n.job = 'Vô nghiệp';
            n.state = STATES.WANDERING;
            n.targetEnemyId = null;
        });
    });

    setTribeRelation(tribe1, tribe2, 'truce');
    if (!tribe1.truceCooldowns) tribe1.truceCooldowns = {};
    if (!tribe2.truceCooldowns) tribe2.truceCooldowns = {};
    tribe1.truceCooldowns[tribe2.id] = 1800;
    tribe2.truceCooldowns[tribe1.id] = 1800;

    if (winnerName !== "Hòa") {
        let winnerTribe = tribe1.name === winnerName ? tribe1 : tribe2;
        winnerTribe.winCount = (winnerTribe.winCount || 0) + 1;
        if (winnerTribe.winCount >= 3 && !winnerTribe.isHeroTribe) {
            winnerTribe.isHeroTribe = true;
            addWorldEvent('Evolution', 'Historic', `Sự tiến hóa của ${winnerTribe.name}`, `Trải qua bao chiến trường đẫm máu, ${winnerTribe.name} đã tiến hóa thành một Tộc Anh Hùng với sức mạnh vượt trội!`);
        }
    }

    let msg = "";
    let eventTitle = "";
    if (winnerName === "Hòa") {
        msg = `Chiến tranh kết thúc do hai bên đều kiệt sức! ${tribe1.name} và ${tribe2.name} đình chiến.`;
        eventTitle = `🏳️ Đình chiến`;
    } else {
        const loserName = winnerName === tribe1.name ? tribe2.name : tribe1.name;
        msg = `Chiến tranh kết thúc! ${winnerName} đánh bại ${loserName} và chiếm thêm lãnh thổ.`;
        eventTitle = `⚔️ ${winnerName} chiến thắng`;
    }
    
    logEvent(msg);
    addWorldEvent('War', 'Historic', eventTitle, msg);
}
