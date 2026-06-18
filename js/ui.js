import { state } from './gameState.js';
import { STATES_TEXT } from './data/constants.js';
import { centerCamera } from './camera.js';
import { TILE_SIZE } from './config.js';
import { saveGame, loadSaveData, getSaveData } from './saveLoad.js';

export function setupUIEvents() {
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if(e.target.dataset.tool !== 'voice') {
                if (e.target.classList.contains('active')) {
                    e.target.classList.remove('active');
                    state.currentTool = null; // deselect
                } else {
                    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    state.currentTool = e.target.dataset.tool;
                }
            } else {
                if (state.selectedNpcId) {
                    let n = state.npcs.find(x=>x.id===state.selectedNpcId);
                    if(n) {
                        document.getElementById('voice-npc-name').innerText = n.name;
                        document.getElementById('voice-menu').classList.remove('hidden');
                    }
                } else alert("Vui lòng Inspect một NPC trước khi ban thánh chỉ!");
            }
        });
    });

    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.time.speedMultiplier = parseInt(e.target.dataset.speed);
        });
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            e.currentTarget.classList.add('active');
            let targetId = e.currentTarget.dataset.target;
            document.getElementById(targetId).classList.add('active');
            
            if (targetId === 'tab-history') {
                updateWorldHistoryUI();
            }
            if (targetId === 'tab-inspect') {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                state.currentTool = null;
            }
        });
    });

    document.getElementById('btn-sound').addEventListener('click', e => {
        state.settings.sound = !state.settings.sound;
        e.target.innerText = state.settings.sound ? '🔊' : '🔇';
    });
    
    ['grid', 'names', 'territory', 'effects', 'pause-ending', 'autosave', 'debug', 'sound'].forEach(s => {
        let el = document.getElementById(`set-${s}`);
        if(el) {
            el.checked = state.settings[s==='pause-ending'?'pauseOnEnding':(s==='autosave'?'autoSave':(s==='sound'?'sound':(s==='debug'?'showDebug':'show'+s.charAt(0).toUpperCase()+s.slice(1))))];
            el.addEventListener('change', e => {
                if(s==='pause-ending') state.settings.pauseOnEnding = e.target.checked;
                else if(s==='autosave') state.settings.autoSave = e.target.checked;
                else if(s==='sound') { state.settings.sound = e.target.checked; document.getElementById('btn-sound').innerText = state.settings.sound?'🔊':'🔇'; }
                else if(s==='debug') { state.settings.showDebug = e.target.checked; document.getElementById('debug-panel').classList.toggle('hidden', !state.settings.showDebug); }
                else state.settings['show'+s.charAt(0).toUpperCase()+s.slice(1)] = e.target.checked;
            });
        }
    });

    let brushSizeEl = document.getElementById('brush-size');
    if (brushSizeEl) {
        brushSizeEl.addEventListener('input', e => {
            document.getElementById('brush-size-val').innerText = e.target.value;
        });
    }

    document.getElementById('close-voice').addEventListener('click', () => { document.getElementById('voice-menu').classList.add('hidden'); });
    
    let exitBtn = document.getElementById('btn-exit-possession');
    if (exitBtn) {
        exitBtn.addEventListener('click', () => {
            import('./systems/possessionSystem.js').then(m => m.exitPossession());
        });
    }
    
    let closeDialogueBtn = document.getElementById('btn-close-dialogue');
    if (closeDialogueBtn) {
        closeDialogueBtn.addEventListener('click', () => {
            document.getElementById('dialogue-panel').classList.add('hidden');
        });
    }
    
    document.querySelectorAll('.voice-cmd').forEach(btn => {
        btn.addEventListener('click', (e) => {
            let cmd = e.target.dataset.cmd;
            let npcId = state.selectedNpcId;
            if(!npcId) return;
            let npc = state.npcs.find(n => n.id === npcId);
            if(!npc) return;
            
            // Acceptance Logic
            let acceptanceScore = npc.faith + npc.fear + npc.loyalty/2 - npc.ambition/2 - npc.courage/2;
            let accepted = (Math.random() * 100) < acceptanceScore;
            
            import('./systems/memorySystem.js').then(m => {
                if (accepted) {
                    m.addPersonalLog(npc, `Đã tuân lệnh Thần: ${e.target.innerText}`);
                    npc.faith = Math.min(100, npc.faith + 5);
                    // Actual command execution can be complex, for now we just change their log.
                    if(cmd==='pray') npc.state = STATES.PRAYING;
                    if(cmd==='wood') npc.state = STATES.SEEKING_WOOD;
                } else {
                    m.addPersonalLog(npc, `CỨNG ĐẦU: Đã phớt lờ lệnh Thần (${e.target.innerText})!`);
                    m.addMemory(npc, 'Trauma', 'Nghi ngờ tín ngưỡng', `Dám cãi lại lệnh của Thần`, -10, null);
                    npc.faith = Math.max(0, npc.faith - 10);
                }
            });
            
            document.getElementById('voice-menu').classList.add('hidden');
            inspectObject(npc.x, npc.y, npc.x, npc.y);
        });
    });
    
    document.getElementById('btn-save').addEventListener('click', saveGame);
    document.getElementById('btn-load').addEventListener('click', () => {
        let s = localStorage.getItem('thePeopleSaveV11');
        if (s) loadSaveData(s); else alert("Không có dữ liệu save.");
    });
    document.getElementById('btn-export').addEventListener('click', () => {
        let blob = new Blob([getSaveData()], {type: "application/json"});
        let url = URL.createObjectURL(blob);
        let a = document.createElement('a'); a.href = url; a.download = "ThePeople_Save.json"; a.click();
    });
    document.getElementById('btn-import').addEventListener('click', () => document.getElementById('file-import').click());
    document.getElementById('file-import').addEventListener('change', e => {
        let file = e.target.files[0];
        if(file) {
            let reader = new FileReader();
            reader.onload = function(evt) { loadSaveData(evt.target.result); };
            reader.readAsText(file);
        }
    });
}

export function inspectObject(tx, ty, wx, wy) {
    let found = null; let desc = "";
    let np = state.npcs.find(n => Math.hypot(n.x - tx, n.y - ty) <= 1);
    if (np) {
        found = np; 
        desc = `<b>${np.name}</b> (Tuổi: ${Math.floor(np.age)}) ${np.favorite ? '⭐' : ''}<br>
                Chủng tộc: ${np.race} | Nghề: ${np.job}<br>
                Đặc điểm: ${np.traits.join(', ')}<br>
                Máu: ${Math.floor(np.health)}/100 | Năng lượng: ${Math.floor(np.energy)}<br>
                Trạng thái: ${STATES_TEXT[np.state]||np.state}<br>
                Tâm trạng: ${np.mood} | Hạnh phúc: ${Math.floor(np.happiness)}<br>
                Kế hoạch: ${np.currentPlan ? (STATES_TEXT[np.currentPlan]||np.currentPlan) : 'Không có'}<br>
                Lịch trình: ${np.dailyRoutine || 'Chưa rõ'}<br>
                Mục tiêu: ${np.lifeGoal || 'Không rõ'}<br>
                Chỉ số: Ambition(${Math.floor(np.ambition)}) Loyalty(${Math.floor(np.loyalty)}) Trauma(${Math.floor(np.trauma)})<br>
                <div style="margin-top:5px;display:flex;flex-wrap:wrap;gap:5px;">
                    <button class="action-btn" style="padding:4px;font-size:11px;background:#e67e22;" onclick="import('./systems/possessionSystem.js').then(m=>m.togglePossession(${np.id}))">Nhập hồn (Possess)</button>
                    <button class="action-btn" style="padding:4px;font-size:11px;" onclick="toggleFollowNpc(${np.id})">${state.followedNpcId === np.id ? 'Bỏ theo dõi' : 'Theo dõi'}</button>
                    <button class="action-btn" style="padding:4px;font-size:11px;" onclick="toggleFavoriteNpc(${np.id})">${np.favorite ? 'Bỏ Yêu thích' : 'Yêu thích'}</button>
                    <button class="action-btn" style="padding:4px;font-size:11px;" onclick="showFamilyTree(${np.id})">Gia phả</button>
                    <button class="action-btn" style="padding:4px;font-size:11px;" onclick="showMemories(${np.id})">Ký ức & Nhật ký</button>
                </div>`;
        state.selectedNpcId = np.id;
    } else {
        state.selectedNpcId = null;
        let h = state.houses.find(h => h.x === tx && h.y === ty);
        if (h) { found = h; desc = `<b>Nhà của ${h.ownerId ? state.npcs.find(n=>n.id===h.ownerId)?.name : 'Vô danh'}</b><br>Loại: ${h.type||'Lều cỏ'}<br>Độ bền: ${h.durability}/100`; }
    }
    
    let content = document.getElementById('inspect-content');
    let none = document.getElementById('inspect-none');
    if (found || state.envGrid[tx][ty]) {
        none.classList.add('hidden'); content.classList.remove('hidden');
        if (!found) {
            let territoryStr = "";
            let t = state.tribes.find(tr => Math.hypot(tr.x - tx, tr.y - ty) <= tr.radius);
            if (t) territoryStr = `<br>Lãnh thổ: Bộ lạc ${t.name}`;
            let k = state.kingdoms.find(kg => kg.territory && kg.territory.some(pt=>pt.x===tx&&pt.y===ty));
            if (k) territoryStr = `<br>Lãnh thổ: Vương quốc ${k.name}`;
            desc = `<b>Ô Đất (${tx}, ${ty})</b><br>Biome: ${state.envGrid[tx][ty].biome}${territoryStr}<br>Nhiệt độ: ${Math.floor(state.envGrid[tx][ty].temperature)}°C<br>Độ ẩm: ${Math.floor(state.envGrid[tx][ty].humidity)}%`;
        }
        content.innerHTML = desc;
    } else {
        none.classList.remove('hidden'); content.classList.add('hidden');
    }
}

window.centerCamera = centerCamera;
window.inspectObject = inspectObject;
window.setSelectedNpc = (id) => state.selectedNpcId = id;

window.toggleFollowNpc = (id) => {
    if (state.followedNpcId === id) state.followedNpcId = null;
    else state.followedNpcId = id;
    if (state.selectedNpcId) { let n = state.npcs.find(x=>x.id===state.selectedNpcId); if(n) inspectObject(n.x, n.y, n.x, n.y); }
};
window.toggleFavoriteNpc = (id) => {
    let n = state.npcs.find(x=>x.id===id);
    if (n) { n.favorite = !n.favorite; inspectObject(n.x, n.y, n.x, n.y); }
};
window.showMemories = (id) => {
    let n = state.npcs.find(x=>x.id===id);
    if (!n) return;
    let memHtml = (n.memories||[]).map(m => `<li>[Tuổi ${Math.floor(n.age - (state.time.year - m.year))}] ${m.title}: ${m.description} (${m.emotionalImpact>0?'+':''}${m.emotionalImpact} Hạnh phúc)</li>`).join('');
    let logHtml = (n.personalLog||[]).map(l => `<li>${l}</li>`).join('');
    let relHtml = (n.relationships||[]).map(r => `<li>NpcID ${r.targetNpcId}: ${r.type} (Tình cảm: ${Math.floor(r.affection)})</li>`).join('');
    
    let html = `
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#2f3640;border:2px solid #d4af37;padding:20px;z-index:100;width:400px;max-height:80%;overflow-y:auto;border-radius:5px;box-shadow:0 0 20px rgba(0,0,0,0.8);">
            <h3 class="gold-text">Hồ sơ của ${n.name} ${n.favorite?'⭐':''}</h3>
            <button onclick="this.parentElement.remove()" style="position:absolute;top:10px;right:10px;background:transparent;border:none;color:#fff;cursor:pointer;font-size:16px;">X</button>
            <h4 style="margin-top:10px;">Nhật ký gần đây</h4><ul style="font-size:12px;color:#dcdde1;padding-left:15px;">${logHtml||'Không có nhật ký'}</ul>
            <h4 style="margin-top:10px;">Ký ức quan trọng</h4><ul style="font-size:12px;color:#dcdde1;padding-left:15px;">${memHtml||'Không có ký ức'}</ul>
            <h4 style="margin-top:10px;">Mối quan hệ</h4><ul style="font-size:12px;color:#dcdde1;padding-left:15px;">${relHtml||'Chưa quen ai'}</ul>
        </div>
    `;
    let el = document.createElement('div'); el.innerHTML = html;
    document.body.appendChild(el.firstElementChild);
};

window.showFamilyTree = (id) => {
    let n = state.npcs.find(x=>x.id===id);
    if (!n) return;
    
    let getSpouse = () => n.partnerId ? state.npcs.find(x=>x.id===n.partnerId) : null;
    let getChildren = () => (n.childrenIds||[]).map(cId => state.npcs.find(x=>x.id===cId)).filter(x=>x);
    let getParents = () => [n.fatherId, n.motherId].filter(pid=>pid).map(pId => state.npcs.find(x=>x.id===pId)).filter(x=>x);
    
    let parents = getParents();
    let spouse = getSpouse();
    let children = getChildren();
    
    let pStr = parents.length > 0 ? parents.map(p=>p.name).join(' & ') : "Không có thông tin";
    let sStr = spouse ? spouse.name : "Độc thân";
    let cStr = children.length > 0 ? children.map(c=>c.name).join(', ') : "Chưa có con";
    
    let html = `
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#1e272e;border:2px solid #8e44ad;padding:20px;z-index:100;width:300px;text-align:center;border-radius:5px;box-shadow:0 0 20px rgba(0,0,0,0.8);">
            <h3 style="color:#8e44ad;">Gia phả</h3>
            <button onclick="this.parentElement.remove()" style="position:absolute;top:10px;right:10px;background:transparent;border:none;color:#fff;cursor:pointer;font-size:16px;">X</button>
            <div style="border:1px solid #485460;margin:10px 0;padding:5px;"><b>Cha mẹ:</b><br>${pStr}</div>
            <div style="border:2px solid #f1c40f;margin:10px 0;padding:5px;color:#f1c40f;"><b>${n.name}</b><br>+<br><b>${sStr}</b></div>
            <div style="border:1px solid #485460;margin:10px 0;padding:5px;"><b>Con cái:</b><br>${cStr}</div>
        </div>
    `;
    let el = document.createElement('div'); el.innerHTML = html;
    document.body.appendChild(el.firstElementChild);
};


export function updateUITabs() {
    document.getElementById('pop-display').innerText = state.npcs.length;
    document.getElementById('speed-val').innerText = state.time.speedMultiplier + 'x';
    
    if (state.ticks % 30 !== 0) return; 
    
    if (document.getElementById('tab-people').classList.contains('active')) {
        let list = document.getElementById('people-list');
        let search = document.getElementById('search-npc').value.toLowerCase();
        let filtered = state.npcs; 
        if (search) filtered = filtered.filter(n => n.name.toLowerCase().includes(search));
        
        list.innerHTML = filtered.slice(0, 50).map(n => `<li onclick="centerCamera(${n.x*TILE_SIZE},${n.y*TILE_SIZE}); setSelectedNpc(${n.id}); inspectObject(${n.x},${n.y},${n.x},${n.y})">${n.name} - ${n.job} (Máu: ${Math.floor(n.health)})</li>`).join('');
    }
    
    if (document.getElementById('tab-tribe').classList.contains('active')) {
        let list = document.getElementById('tribe-list');
        list.innerHTML = state.tribes.map(t => `<li>${t.name} - Pop: ${t.population}</li>`).join('');
    }
    
    if (document.getElementById('tab-kingdom').classList.contains('active')) {
        document.getElementById('civ-pop').innerText = state.npcs.length;
        let list = document.getElementById('kingdom-list');
        list.innerHTML = state.kingdoms.map(k => `<li><span style="color:${k.color}">■</span> ${k.name} - Pop: ${k.population}</li>`).join('');
    }
}

export function updateWorldHistoryUI() {
    let list = document.getElementById('world-history-list');
    if (!list) return;
    list.innerHTML = state.worldHistory.slice().reverse().map(e => `
        <li style="margin-bottom:10px; border-left:3px solid #f1c40f; padding-left:10px;">
            <div style="font-size:11px; color:#bdc3c7;">${e.timeStr}</div>
            <div style="font-weight:bold; color:${e.importance==='Legendary'?'#f1c40f':(e.importance==='Historic'?'#3498db':'#fff')};">${e.title}</div>
            <div style="font-size:13px; color:#ecf0f1;">${e.desc}</div>
        </li>
    `).join('');
}
