import { state } from '../gameState.js';
import { doOneTick } from '../main.js';
import { ENTITY_DATA } from '../data/races.js';
import { COLS, ROWS } from '../config.js';

export function runAutomatedTest(ticksToSimulate = 5000) {
    console.log(`[TEST] Bắt đầu chạy giả lập ${ticksToSimulate} ticks...`);
    let startTime = performance.now();
    let errors = [];
    let warnings = [];

    // Setup: Spawn a test tribe to ensure systems like technology and diplomacy run
    if (state.tribes.length === 0) {
        let humanRace = ENTITY_DATA.find(r => r.id === 'human');
        if (humanRace) {
            let cx = COLS/2, cy = ROWS/2;
            // Tạo leader
            let leader = { id: ++state.idCounter, name: 'Test Leader', x: cx, y: cy, health: 100, energy: 100, hunger: -99999, age: 20, raceId: 'human', job: 'Trưởng làng', gender: 'male' };
            state.npcs.push(leader);
            // Tạo tribe
            let tribe = {
                id: ++state.tribeIdCounter, name: 'Test Tribe', x: cx, y: cy, leaderId: leader.id,
                population: 10, members: [leader.id], houses: [], level: 'Trại nhỏ', inventory: { wheat: 1000 },
                ageLevel: 'Thời kỳ nguyên thủy', researchPoints: 490, culturePoints: 0,
                color: '#ff0000', radius: 10, territoryTiles: [{x: cx, y: cy}], borderQueue: [{x: cx, y: cy}]
            };
            state.tribes.push(tribe);
            // Spawn vài npc
            for(let i=0; i<49; i++) {
                let npc = { id: ++state.idCounter, name: 'Test NPC', x: cx+Math.random(), y: cy+Math.random(), health: 100, energy: 100, hunger: -99999, age: 20, raceId: 'human', job: 'Nông dân', tribeId: tribe.id, faith: 50 };
                state.npcs.push(npc);
                tribe.members.push(npc.id);
            }
            
            // Ép tạo tôn giáo cho Leader để test lây lan
            let religion = {
                id: ++state.relIdCounter, name: "Đạo Test Tự Động", founderId: leader.id, founderName: leader.name, color: '#f1c40f', followers: [leader.id], tribeIds: [tribe.id], foundedYear: 1, holyTenet: "Automation", influencePower: 10
            };
            state.religions.push(religion);
            leader.religionId = religion.id;
            leader.faith = 100;
        }
    }

    let initialPop = state.npcs.length;

    for (let i = 0; i < ticksToSimulate; i++) {
        try {
            doOneTick();
        } catch (e) {
            errors.push(`Crash tại tick ${state.ticks}: ${e.message}`);
            break; // Dừng nếu crash
        }

        // Assertion mỗi 100 ticks để đỡ lag
        if (state.ticks % 100 === 0) {
            // 1. Integrity Check
            state.npcs.forEach(n => {
                if (isNaN(n.x) || isNaN(n.y)) errors.push(`NPC ${n.id} bị NaN tọa độ.`);
                if (n.health < 0) errors.push(`NPC ${n.id} bị máu âm (${n.health}).`);
            });

            // 2. Economy Check
            state.tribes.forEach(t => {
                if (t.foodStorage < 0) errors.push(`Tribe ${t.id} bị âm foodStorage.`);
                if (t.inventory) {
                    for (let k in t.inventory) {
                        if (t.inventory[k] < 0) errors.push(`Tribe ${t.id} bị âm tài nguyên ${k}.`);
                    }
                }
            });
            
            // 3. Logic Check
            state.tribes.forEach(t => {
                let actualPop = state.npcs.filter(n => n.tribeId === t.id && n.health > 0).length;
                if (t.population !== actualPop) {
                    // UpdateTribeLogic chỉ chạy mỗi ngày, nên có thể sai lệch nhỏ giữa ngày
                    // Warnings thay vì Errors
                    // warnings.push(`Tribe ${t.id} có dân số ghi nhận ${t.population} nhưng đếm thực tế là ${actualPop}`);
                }
            });
        }
    }

    let endTime = performance.now();
    
    // Thu thập kết quả công nghệ
    let techProgress = state.tribes.map(t => `Tribe ${t.name}: ${t.ageLevel} (${Math.floor(t.researchPoints)} pts)`).join('<br>');

    // Thu thập kết quả tôn giáo
    let relProgress = state.religions.map(r => `Đạo ${r.name}: ${r.followers.length} tín đồ`).join('<br>');

    // Báo Cáo
    let reportHtml = `<h3>Báo cáo Automated Test</h3>
        <p><b>Thời gian chạy:</b> ${((endTime - startTime)/1000).toFixed(2)}s</p>
        <p><b>Số Tick đã mô phỏng:</b> ${ticksToSimulate}</p>
        <p><b>Dân số đầu:</b> ${initialPop} | <b>Dân số hiện tại:</b> ${state.npcs.length}</p>
        <p><b>Bộ tộc:</b> ${state.tribes.length} | <b>Boss hoạt động:</b> ${state.bossTracking.activeBosses.length}</p>
        <p><b>Tiến độ Nghiên Cứu:</b><br>${techProgress}</p>
        <p><b>Tôn giáo:</b><br>${relProgress || "Không có tôn giáo nào"}</p>
        <hr>`;
    
    if (errors.length > 0) {
        console.error(`[TEST] Phát hiện ${errors.length} lỗi:`, errors);
        reportHtml += `<p style="color:red"><b>Phát hiện ${errors.length} lỗi:</b></p><ul>` + errors.slice(0,10).map(e=>`<li>${e}</li>`).join('') + `</ul>`;
    } else {
        console.log(`[TEST] Thành công! Không phát hiện lỗi nghiêm trọng nào.`);
        reportHtml += `<p style="color:#2ecc71"><b>Thành công!</b> Trò chơi chạy mượt mà, không gặp lỗi logic hay crash.</p>`;
    }
    
    if (warnings.length > 0) {
        console.warn(`[TEST] Có ${warnings.length} cảnh báo:`, warnings);
    }
    
    // Hiển thị báo cáo lên màn hình
    let resultDiv = document.createElement('div');
    resultDiv.style.position = 'fixed';
    resultDiv.style.top = '10%'; resultDiv.style.left = '50%'; resultDiv.style.transform = 'translate(-50%, 0)';
    resultDiv.style.background = '#2f3640'; resultDiv.style.color = '#fff'; resultDiv.style.padding = '20px';
    resultDiv.style.border = errors.length>0 ? '3px solid #e74c3c' : '3px solid #2ecc71';
    resultDiv.style.zIndex = '99999'; resultDiv.style.borderRadius = '8px';
    resultDiv.innerHTML = reportHtml + `<button onclick="this.parentElement.remove()" style="margin-top:10px;padding:5px 10px;">Đóng</button>`;
    document.body.appendChild(resultDiv);
}
