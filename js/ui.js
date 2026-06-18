import { state } from './gameState.js';
import { STATES_TEXT } from './data/constants.js';
import { centerCamera } from './camera.js';
import { TILE_SIZE } from './config.js';
import { saveGame, loadSaveData, getSaveData } from './saveLoad.js';

export function setupUIEvents() {
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if(e.target.dataset.tool !== 'voice') {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                state.currentTool = e.target.dataset.tool;
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
            document.getElementById(e.currentTarget.dataset.target).classList.add('active');
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

    document.getElementById('close-voice').addEventListener('click', () => { document.getElementById('voice-menu').classList.add('hidden'); });
    
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
        found = np; desc = `<b>${np.name}</b> (Tuổi: ${Math.floor(np.age)})<br>Nghề: ${np.job}<br>Máu: ${Math.floor(np.health)}/100<br>Trạng thái: ${STATES_TEXT[np.state]||np.state}<br>Tâm trạng: ${np.mood}`;
        state.selectedNpcId = np.id;
    } else {
        state.selectedNpcId = null;
        let h = state.houses.find(h => h.x === tx && h.y === ty);
        if (h) { found = h; desc = `<b>Nhà của ${h.ownerId ? state.npcs.find(n=>n.id===h.ownerId)?.name : 'Vô danh'}</b><br>Độ bền: ${h.durability}/100`; }
    }
    
    let content = document.getElementById('inspect-content');
    let none = document.getElementById('inspect-none');
    if (found || state.envGrid[tx][ty]) {
        none.classList.add('hidden'); content.classList.remove('hidden');
        if (!found) desc = `<b>Ô Đất (${tx}, ${ty})</b><br>Biome: ${state.envGrid[tx][ty].biome}<br>Nhiệt độ: ${Math.floor(state.envGrid[tx][ty].temperature)}°C<br>Độ ẩm: ${Math.floor(state.envGrid[tx][ty].humidity)}%`;
        content.innerHTML = desc;
    } else {
        none.classList.remove('hidden'); content.classList.add('hidden');
    }
}

// Global hook for inline HTML onclick handlers if any
window.centerCamera = centerCamera;
window.inspectObject = inspectObject;
window.setSelectedNpc = (id) => state.selectedNpcId = id;

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
