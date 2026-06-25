import { state } from './gameState.js';
import { STATES_TEXT, STATES } from './data/constants.js';
import { centerCamera } from './camera.js';
import { TILE_SIZE } from './config.js';
import { saveGame, loadSaveData, getSaveData } from './saveLoad.js';
import { ENTITY_DATA } from './data/races.js';
import { getTribeFood, getTribeWood } from './utils.js';
import { TECHNOLOGY_TREE, ERAS, getTechById } from './data/technologyTree.js';
export function setupUIEvents() {
    document.getElementById('game-canvas').style.cursor = 'zoom-in';

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
                document.getElementById('game-canvas').style.cursor = state.currentTool ? 'crosshair' : 'zoom-in';
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
                document.getElementById('game-canvas').style.cursor = 'zoom-in';
            }
        });
    });

    // Guide Modal Tabs
    document.querySelectorAll('.guide-tab-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            document.querySelectorAll('.guide-tab-btn').forEach(b => {
                b.classList.remove('active');
                b.style.borderBottom = 'none';
                b.style.color = '#ecf0f1';
            });
            document.querySelectorAll('.guide-tab-pane').forEach(p => p.classList.add('hidden'));
            
            e.currentTarget.classList.add('active');
            e.currentTarget.style.borderBottom = '2px solid #3498db';
            e.currentTarget.style.color = '#3498db';
            
            let targetId = e.currentTarget.dataset.target;
            document.getElementById(targetId).classList.remove('hidden');
        });
    });

    document.getElementById('btn-sound').addEventListener('click', e => {
        state.settings.sound = !state.settings.sound;
        e.target.innerText = state.settings.sound ? '🔊' : '🔇';
    });

    let btnToggleLeft = document.getElementById('btn-toggle-left');
    if (btnToggleLeft) {
        btnToggleLeft.addEventListener('click', () => {
            let sidebar = document.getElementById('left-sidebar');
            if (sidebar) sidebar.classList.toggle('collapsed');
        });
    }

    let btnToggleRight = document.getElementById('btn-toggle-right');
    if (btnToggleRight) {
        btnToggleRight.addEventListener('click', () => {
            let sidebar = document.getElementById('right-sidebar');
            if (sidebar) sidebar.classList.toggle('collapsed');
        });
    }
    
    let btnCinematic = document.getElementById('btn-cinematic');
    if (btnCinematic) {
        btnCinematic.addEventListener('click', () => {
            document.body.classList.toggle('cinematic');
            import('./systems/historySystem.js').then(m => m.logEvent("Đã vào Chế độ Điện Ảnh. Bấm phím 'C' hoặc 'ESC' để thoát."));
            setTimeout(() => window.dispatchEvent(new Event('resize')), 400);
        });
    }

    window.addEventListener('keydown', e => {
        if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
            if (document.body.classList.contains('cinematic')) {
                document.body.classList.remove('cinematic');
                setTimeout(() => window.dispatchEvent(new Event('resize')), 400);
            }
        }
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
        let s = localStorage.getItem('thePeopleSaveV12') || localStorage.getItem('thePeopleSaveV11');
        if (s) loadSaveData(s); else alert("Không có dữ liệu save.");
    });
    
    document.getElementById('btn-random-map')?.addEventListener('click', () => {
        if(confirm('Bạn có chắc muốn xóa thế giới cũ và tạo một thế giới ngẫu nhiên mới?')) {
            import('./main.js').then(m => m.generateRandomMap());
        }
    });
    document.getElementById('btn-clear-map')?.addEventListener('click', () => {
        if(confirm('Nhấn chìm tất cả lục địa xuống biển? Các bộ lạc hiện tại sẽ bị xóa sổ.')) {
            import('./main.js').then(m => m.clearMapToWater());
        }
    });
    
    let btnReseed = document.getElementById('btn-reseed');
    if (btnReseed) {
        btnReseed.addEventListener('click', () => {
            if (confirm("Hành động này sẽ xóa các mỏ tài nguyên thô hiện tại và mọc lại toàn bộ tài nguyên mới trên khắp bản đồ. Bạn có chắc không?")) {
                state.resources = [];
                import('./systems/ecosystemSystem.js').then(m => m.initResources());
            }
        });
    }

    document.getElementById('btn-guide')?.addEventListener('click', () => {
        document.getElementById('guide-modal')?.classList.remove('hidden');
    });
    document.getElementById('close-guide-modal')?.addEventListener('click', () => {
        document.getElementById('guide-modal')?.classList.add('hidden');
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
        let raceName = ENTITY_DATA.find(r => r.id === np.raceId)?.name || np.raceId;
        desc = `<b>${np.name}</b> (${np.gender || '?'}, Tuổi: ${Math.floor(np.age)}) ${np.favorite ? '⭐' : ''}<br>
                Chủng tộc: ${raceName} | Nghề: ${np.job}<br>
                Đặc điểm: ${np.traits ? np.traits.join(', ') : 'Không'}<br>
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
            if (state.territoryGrid && state.territoryGrid[tx] && state.territoryGrid[tx][ty]) {
                let tId = state.territoryGrid[tx][ty];
                let t = state.tribes.find(tr => tr.id === tId);
                if (t) {
                    let leader = state.npcs.find(n => n.id === t.leaderId);
                    let soldiers = state.npcs.filter(n => n.tribeId === t.id && n.isSoldier).length;
                    let children = state.npcs.filter(n => n.tribeId === t.id && n.age < 16).length;
                    let workers = t.population - soldiers - children;

                    territoryStr = `<hr style="border-color:#485460;margin:5px 0;">
                    <b style="color:${t.color};">Bộ lạc ${t.name}</b> ${t.isHeroTribe ? '🌟 [Anh Hùng]' : ''}<br>
                    Cấp độ: ${t.level}<br>
                    Dân số: ${t.population} người (Lính: ${soldiers}, Dân: ${workers}, Trẻ em: ${children})<br>
                    Lãnh đạo: ${leader ? leader.name : 'Không có'}<br>
                    Kho: 🪵 ${Math.floor(getTribeWood(t))} | 🥩 ${Math.floor(getTribeFood(t))} | ⛏️ Quặng: ${(t.inventory.iron_ore||0) + (t.inventory.copper||0)}<br>
                    Điểm: 🎭 ${t.culturePoints}`;
                    
                    if (t.kingdomId) {
                        let k = state.kingdoms.find(kg => kg.id === t.kingdomId);
                        if (k) territoryStr += `<br>Vương quốc: <b style="color:${k.color};">${k.name}</b> (Thời đại: ${k.currentEra || 'Stone Age'} | 💡 ${Math.floor(k.researchPoints||0)} RP)`;
                    }
                }
            }
            desc = `<b>Ô Đất (${tx}, ${ty})</b><br>Biome: ${state.envGrid[tx][ty].biome}<br>Nhiệt độ: ${Math.floor(state.envGrid[tx][ty].temperature)}°C<br>Độ ẩm: ${Math.floor(state.envGrid[tx][ty].humidity)}%${territoryStr}`;
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
        list.innerHTML = state.tribes.map(t => `<li style="cursor:pointer" onclick="centerCamera(${t.x*TILE_SIZE},${t.y*TILE_SIZE}); inspectObject(${t.x},${t.y},${t.x},${t.y})"><span style="color:${t.color}">■</span> ${t.name} - Dân số: ${t.population}</li>`).join('');
    }

    if (document.getElementById('tab-religion') && document.getElementById('tab-religion').classList.contains('active')) {
        const list = document.getElementById('religion-list');
        if (list) {
            if (state.religions.length === 0) {
                list.innerHTML = '<li style="color:#bdc3c7;font-style:italic">Chưa có tôn giáo nào hình thành...</li>';
            } else {
                list.innerHTML = state.religions.map(r => {
                    const founder = state.npcs.find(n => n.id === r.founderId);
                    const founderStatus = founder ? `${founder.name} (Tuổi ${Math.floor(founder.age)})` : `${r.founderName} (đã mất)`;
                    return `<li style="border-left:3px solid ${r.color};padding-left:8px;margin-bottom:10px;">
                        <b style="color:${r.color}">${r.name}</b><br>
                        <span style="font-size:11px">✝️ Giáo lý: ${r.holyTenet}</span><br>
                        <span style="font-size:11px">👤 Sáng lập: ${founderStatus}</span><br>
                        <span style="font-size:11px">Tín đồ: <b>${r.followers.length}</b> người | Năm ra đời: ${r.foundedYear}</span><br>
                        <div style="background:#34495e;border-radius:3px;height:5px;margin-top:3px">
                            <div style="background:${r.color};border-radius:3px;height:5px;width:${Math.min(100, r.followers.length)}%"></div>
                        </div>
                    </li>`;
                }).join('');
            }
        }
    }
    
    if (document.getElementById('tab-kingdom') && document.getElementById('tab-kingdom').classList.contains('active')) {
        document.getElementById('civ-pop').innerText = state.npcs.length;
        let list = document.getElementById('kingdom-list');
        list.innerHTML = state.kingdoms.map(k => `<li style="cursor:pointer" onclick="centerCamera(${k.capitalX*TILE_SIZE},${k.capitalY*TILE_SIZE}); inspectObject(${k.capitalX},${k.capitalY},${k.capitalX},${k.capitalY})"><span style="color:${k.color}">■</span> ${k.name} - Dân số: ${k.population}</li>`).join('');
    }

    if (document.getElementById('tab-civ') && document.getElementById('tab-civ').classList.contains('active')) {
        let list = document.getElementById('civ-list');
        if (state.kingdoms.length === 0) {
            list.innerHTML = '<li style="color:#bdc3c7;font-style:italic">Chưa có vương quốc nào hình thành...</li>';
        } else {
            list.innerHTML = state.kingdoms.map(k => `
                <li style="border-left:3px solid ${k.color};padding-left:8px;margin-bottom:10px;">
                    <b style="color:${k.color}">${k.name}</b> (LV ${k.civilizationLevel || 1})<br>
                    <span style="font-size:12px; color:#f1c40f;">Thời đại: <b>${k.currentEra || "Stone Age"}</b></span><br>
                    <div style="background:#34495e;border-radius:3px;height:5px;margin-top:3px;margin-bottom:3px;">
                        <div style="background:#2ecc71;border-radius:3px;height:5px;width:${k.eraProgress || 0}%"></div>
                    </div>
                    <span style="font-size:11px">
                        🔬 Khoa học: ${Math.floor(k.scienceScore || 0)} | 
                        ⚙️ Công nghiệp: ${Math.floor(k.industrialScore || 0)} <br>
                        📚 Giáo dục: ${Math.floor(k.educationScore || 0)} | 
                        🎭 Văn hóa: ${Math.floor(k.cultureScore || 0)} <br>
                        🧪 Kỹ thuật: ${Math.floor(k.technologyScore || 0)} | 
                        💡 RP: ${Math.floor(k.researchPoints || 0)}
                    </span>
                </li>
            `).join('');
        }
    }

    
    if (document.getElementById('tab-story').classList.contains('active')) {
        let score = state.worldDramaScore || 0;
        document.getElementById('drama-score-val').innerText = score;
        let bar = document.getElementById('drama-score-bar');
        bar.style.width = score + '%';
        let desc = "Quá yên bình";
        bar.style.background = "#2ecc71";
        if (score > 20) { desc = "Lý tưởng"; bar.style.background = "#3498db"; }
        if (score > 60) { desc = "Căng thẳng"; bar.style.background = "#e67e22"; }
        if (score > 80) { desc = "Hỗn loạn"; bar.style.background = "#e74c3c"; }
        document.getElementById('drama-score-desc').innerText = desc;
        
        let newsList = document.getElementById('newspaper-list');
        newsList.innerHTML = (state.newspaperArticles || []).map(a => `<li style="margin-bottom:5px; border-bottom:1px dashed #ccc; padding-bottom:5px;"><b>Năm ${a.year}, Th.${a.month}: ${a.title}</b><br><i style="font-size:11px">${a.content}</i></li>`).join('');
        
        let eventsList = document.getElementById('active-storylines-list');
        eventsList.innerHTML = (state.storyEvents || []).slice().reverse().map(e => `<li><b style="color:#3498db">${e.title}</b> [${e.status}]<br><span style="font-size:11px; color:#bdc3c7">${e.description}</span></li>`).join('');
        
        let legendsList = document.getElementById('story-legends-list');
        let legends = state.npcs.filter(n => n.traits && (n.traits.includes('chosenByFate') || n.traits.includes('heroic') || n.traits.includes('genius')) || (n.lifeStory && n.lifeStory.length > 0));
        legendsList.innerHTML = legends.map(n => `<li style="cursor:pointer" onclick="centerCamera(${n.x*TILE_SIZE},${n.y*TILE_SIZE}); inspectObject(${n.x},${n.y},${n.x},${n.y})"><b class="gold-text">${n.name}</b> (${n.job})<br><span style="font-size:11px; color:#bdc3c7">${n.lifeStory ? n.lifeStory.slice(-2).join('<br>') : ''}</span></li>`).join('');
    }

    // --- TAB K.HỌC (TECH) ---
    if (document.getElementById('tab-tech') && document.getElementById('tab-tech').classList.contains('active')) {
        const techList = document.getElementById('global-tech-list');
        const avgEl = document.getElementById('tech-avg-pts');
        const leaderEl = document.getElementById('tech-leader');
        const rankingList = document.getElementById('tech-ranking-list');
        const treeDisplay = document.getElementById('tech-tree-display');
        if (!techList) return;

        let totalRP = 0;
        let sortedKingdoms = [...state.kingdoms].sort((a, b) => {
            let aScore = (a.technologies ? a.technologies.length * 100 : 0) + (a.researchPoints || 0);
            let bScore = (b.technologies ? b.technologies.length * 100 : 0) + (b.researchPoints || 0);
            return bScore - aScore;
        });

        if (sortedKingdoms.length > 0) {
            leaderEl.innerText = sortedKingdoms[0].name;
            let avg = Math.floor(sortedKingdoms.reduce((s, k) => s + (k.researchPoints || 0), 0) / sortedKingdoms.length);
            avgEl.innerText = avg;
            
            rankingList.innerHTML = sortedKingdoms.slice(0, 5).map((k, idx) => `
                <li>#${idx + 1} <b style="color:${k.color}">${k.name}</b> - Techs: ${k.technologies ? k.technologies.length : 0} | Đột phá: ${k.breakthroughs || 0}</li>
            `).join('');
        } else {
            leaderEl.innerText = "Chưa có";
            avgEl.innerText = 0;
            rankingList.innerHTML = "<li>Chưa có vương quốc nào</li>";
        }

        // Hiện tiến trình nghiên cứu hiện tại của từng Kingdom
        techList.innerHTML = state.kingdoms.map(k => {
            let currentTechHtml = `<span style="font-size:11px;color:#bdc3c7">Đang không nghiên cứu gì...</span>`;
            if (k.currentResearch) {
                let t = getTechById(k.currentResearch);
                if (t) {
                    let progress = Math.min(100, Math.floor((k.researchPoints / t.cost) * 100));
                    currentTechHtml = `
                        <span style="font-size:12px">Đang nghiên cứu: <b>${t.name}</b> (${t.category})</span><br>
                        <div style="background:#34495e;border-radius:3px;height:6px;margin:3px 0;width:100%">
                            <div style="background:#9b59b6;border-radius:3px;height:6px;width:${progress}%;transition:width 0.5s"></div>
                        </div>
                        <span style="font-size:10px;color:#bdc3c7">${Math.floor(k.researchPoints)} / ${t.cost} RP (+${Math.floor(k.scienceOutput||0)}/tick)</span>
                    `;
                }
            }

            return `<li style="margin-bottom:10px; border-left:3px solid ${k.color}; padding-left:8px;">
                <b style="color:${k.color}">${k.name}</b> - ${k.currentEra || "Stone Age"}<br>
                ${currentTechHtml}
            </li>`;
        }).join('');

        // Hiện toàn bộ cây công nghệ
        if (treeDisplay && state.ticks % 60 === 0) { // Only update tree rarely to save perf
            let treeHtml = "";
            let eras = Object.values(ERAS);
            eras.forEach(era => {
                let techsInEra = TECHNOLOGY_TREE.filter(t => t.era === era);
                if (techsInEra.length > 0) {
                    treeHtml += `<h5 style="color:#f1c40f; margin-top:5px; margin-bottom:2px;">${era}</h5>`;
                    techsInEra.forEach(t => {
                        let knownBy = state.kingdoms.filter(k => k.technologies && k.technologies.includes(t.id)).map(k => k.name).join(', ');
                        let colorStr = knownBy ? "#2ecc71" : "#bdc3c7";
                        treeHtml += `
                            <div style="font-size:11px; margin-bottom:2px; border-left:2px solid ${colorStr}; padding-left:5px;">
                                <b style="color:${colorStr}">${t.name}</b> (${t.cost} RP) - ${t.description}<br>
                                <span style="font-size:9px; color:#7f8c8d;">Unlocks: ${t.unlocks.join(', ')}</span><br>
                                <span style="font-size:9px; color:#95a5a6;">Sở hữu: ${knownBy || 'Chưa ai có'}</span>
                            </div>
                        `;
                    });
                }
            });
            treeDisplay.innerHTML = treeHtml;
        }
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
