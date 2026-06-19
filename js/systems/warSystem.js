import { state } from '../gameState.js';
import { STATES } from '../data/constants.js';
import { addWorldEvent, logEvent } from './historySystem.js';

// Tỷ lệ tuyển lính khi có chiến tranh (30% dân số trưởng thành)
const SOLDIER_RATIO = 0.30;
// Số lãnh thổ chuyển giao cho bên thắng
const TERRITORY_TRANSFER_COUNT = 15;

export function updateWarLogic() {
    if (!state.tribes || state.tribes.length < 2) return;

    state.tribes.forEach(tribe => {
        if (!tribe.diplomacy) return;

        Object.entries(tribe.diplomacy).forEach(([enemyIdStr, relation]) => {
            if (relation !== 'war') return;
            const enemyId = parseInt(enemyIdStr);
            const enemyTribe = state.tribes.find(t => t.id === enemyId);
            if (!enemyTribe) return;

            // --- BƯỚC 1: TỰ ĐỘNG TUYỂN LÍNH ---
            _recruitSoldiers(tribe, enemyId);

            // --- BƯỚC 2: LÍNH HÀNH QUÂN VỀ PHÍA ĐỊCH ---
            _marchSoldiers(tribe, enemyTribe);
        });
    });

    // --- BƯỚC 3: KIỂM TRA KẾT QUẢ CHIẾN TRANH ---
    _checkWarOutcome();
}

// Tự động tuyển lính khi bắt đầu chiến tranh
function _recruitSoldiers(tribe, enemyId) {
    const members = state.npcs.filter(n =>
        n.tribeId === tribe.id && n.age >= 16 && n.health > 50 && !n.isSoldier
    );
    const targetSoldierCount = Math.floor(tribe.population * SOLDIER_RATIO);
    const currentSoldiers = state.npcs.filter(n => n.tribeId === tribe.id && n.isSoldier).length;

    if (currentSoldiers < targetSoldierCount) {
        // Ưu tiên NPC có bravery/combatSkill cao
        const candidates = members
            .sort((a, b) => (b.bravery + b.combatSkill) - (a.bravery + a.combatSkill))
            .slice(0, targetSoldierCount - currentSoldiers);

        candidates.forEach(npc => {
            npc.isSoldier = true;
            npc.job = 'Chiến binh';
            npc.state = STATES.WANDERING; // Reset để AI chiến tranh tiếp quản
        });
    }
}

// Lính di chuyển vào lãnh thổ địch gần nhất
function _marchSoldiers(tribe, enemyTribe) {
    const soldiers = state.npcs.filter(n =>
        n.tribeId === tribe.id && n.isSoldier && n.health > 0
    );

    soldiers.forEach(soldier => {
        // Nếu đang bị actionWait hoặc đang tấn công thì bỏ qua
        if (soldier.actionWait > 0 || soldier.state === STATES.ATTACKING) return;

        // Tìm kẻ địch gần nhất trong phạm vi 20 tiles
        const nearestEnemy = state.npcs
            .filter(n => n.tribeId === enemyTribe.id && n.health > 0)
            .sort((a, b) =>
                Math.hypot(a.x - soldier.x, a.y - soldier.y) -
                Math.hypot(b.x - soldier.x, b.y - soldier.y)
            )[0];

        if (nearestEnemy) {
            const dist = Math.hypot(nearestEnemy.x - soldier.x, nearestEnemy.y - soldier.y);
            
            let engageDist = 1.5;
            if (soldier.raceId === 'centaur') engageDist = 5;

            if (dist <= engageDist) {
                // Đã tiếp cận — chuyển sang trạng thái tấn công
                soldier.state = STATES.ATTACKING;
                soldier.targetEnemyId = nearestEnemy.id;
            } else if (dist <= 30) {
                // Trong tầm nhìn — di chuyển về phía địch
                soldier.state = STATES.WANDERING;

                // TACTICS
                if (soldier.raceId === 'dwarf' && dist > 10 && Math.random() < 0.05) {
                    // Đào hầm (dịch chuyển tức thời một đoạn)
                    soldier.x += (nearestEnemy.x - soldier.x) * 0.4;
                    soldier.y += (nearestEnemy.y - soldier.y) * 0.4;
                    soldier.actionWait = 10;
                    if (state.particles) state.particles.push({x: soldier.x*16, y: soldier.y*16, vx:0, vy:0, life:20, type:'smoke', color:'#888'});
                } else if (soldier.raceId === 'orc') {
                    // Orc lao thẳng, bỏ qua ngẫu nhiên
                    soldier.targetX = nearestEnemy.x;
                    soldier.targetY = nearestEnemy.y;
                } else if (soldier.raceId === 'centaur' && dist < 3) {
                    // Hit and run: Lùi lại nếu địch quá gần
                    soldier.targetX = soldier.x - (nearestEnemy.x - soldier.x);
                    soldier.targetY = soldier.y - (nearestEnemy.y - soldier.y);
                } else {
                    soldier.targetX = nearestEnemy.x + (Math.random() - 0.5) * 2;
                    soldier.targetY = nearestEnemy.y + (Math.random() - 0.5) * 2;
                }
            } else {
                // Quá xa — tiến về phía thủ đô địch
                soldier.state = STATES.WANDERING;
                soldier.targetX = enemyTribe.x + (Math.random() * 10 - 5);
                soldier.targetY = enemyTribe.y + (Math.random() * 10 - 5);
            }
        } else {
            // Không có địch, tiến thẳng vào lãnh thổ địch
            soldier.state = STATES.WANDERING;
            soldier.targetX = enemyTribe.x + (Math.random() * 8 - 4);
            soldier.targetY = enemyTribe.y + (Math.random() * 8 - 4);
        }
    });
}

// Kiểm tra kết quả chiến tranh: bên nào còn lính nhiều hơn thì thắng
function _checkWarOutcome() {
    // Chỉ chạy mỗi 300 ticks để tiết kiệm performance
    if (state.ticks % 300 !== 0) return;

    const warPairs = new Set();

    state.tribes.forEach(tribe => {
        if (!tribe.diplomacy) return;
        Object.entries(tribe.diplomacy).forEach(([enemyIdStr, relation]) => {
            if (relation !== 'war') return;
            const enemyId = parseInt(enemyIdStr);
            const pairKey = [tribe.id, enemyId].sort().join('-');
            if (warPairs.has(pairKey)) return;
            warPairs.add(pairKey);

            const enemyTribe = state.tribes.find(t => t.id === enemyId);
            if (!enemyTribe) return;

            const mySoldiers = state.npcs.filter(n => n.tribeId === tribe.id && n.isSoldier).length;
            const enemySoldiers = state.npcs.filter(n => n.tribeId === enemyTribe.id && n.isSoldier).length;

            // Nếu một bên không còn lính → bên kia thắng, chuyển lãnh thổ
            if (mySoldiers === 0 && enemySoldiers > 0) {
                _transferTerritory(enemyTribe, tribe, TERRITORY_TRANSFER_COUNT);
                _endWar(tribe, enemyTribe, enemyTribe.name);
            } else if (enemySoldiers === 0 && mySoldiers > 0) {
                _transferTerritory(tribe, enemyTribe, TERRITORY_TRANSFER_COUNT);
                _endWar(tribe, enemyTribe, tribe.name);
            }
            // Nếu cả 2 còn lính → chiến tranh tiếp tục (tribeSystem đã có cooldown tự đình chiến)
        });
    });
}

// Bên thắng chiếm một số lãnh thổ từ bên thua
function _transferTerritory(winner, loser, count) {
    // Tìm các ô thuộc loser tiếp giáp với lãnh thổ winner
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

// Kết thúc chiến tranh: trả lính về dân thường, cập nhật ngoại giao
function _endWar(tribe1, tribe2, winnerName) {
    [tribe1, tribe2].forEach(tribe => {
        // Trả lính về dân thường
        state.npcs.filter(n => n.tribeId === tribe.id && n.isSoldier).forEach(n => {
            n.isSoldier = false;
            n.job = 'Vô nghiệp'; // Sẽ được phân công lại bởi determineJob
            n.state = STATES.WANDERING;
            n.targetEnemyId = null;
        });
        // Cập nhật ngoại giao
        const otherId = tribe.id === tribe1.id ? tribe2.id : tribe1.id;
        tribe.diplomacy[otherId] = 'truce';
    });

    // Tiến hóa Pixel
    let winnerTribe = tribe1.name === winnerName ? tribe1 : tribe2;
    winnerTribe.winCount = (winnerTribe.winCount || 0) + 1;
    if (winnerTribe.winCount >= 3 && !winnerTribe.isHeroTribe) {
        winnerTribe.isHeroTribe = true;
        addWorldEvent('Evolution', 'Historic', `Sự tiến hóa của ${winnerTribe.name}`, `Trải qua bao chiến trường đẫm máu, ${winnerTribe.name} đã tiến hóa thành một Tộc Anh Hùng với sức mạnh vượt trội!`);
    }

    const loserName = winnerName === tribe1.name ? tribe2.name : tribe1.name;
    const msg = `Chiến tranh kết thúc! ${winnerName} đánh bại ${loserName} và chiếm thêm lãnh thổ.`;
    logEvent(msg);
    addWorldEvent(
        'War',
        'Historic',
        `⚔️ ${winnerName} chiến thắng`,
        msg
    );
}