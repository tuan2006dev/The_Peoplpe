import { state, resetState } from './gameState.js';
import { SAVE_KEY, SAVE_VERSION } from './config.js';
import { playSound } from './utils.js';
import { logEvent } from './systems/historySystem.js';
import { rebuildSpatialGrid } from './systems/worldSystem.js';

export function getSaveData() {
    // Clear spatialGrid to avoid duplication of NPC objects in save file
    let tempGrid = state.spatialGrid;
    state.spatialGrid = {};
    let json = JSON.stringify({ ...state, saveVersion: SAVE_VERSION });
    state.spatialGrid = tempGrid;
    return json;
}

export function loadSaveData(json) {
    try {
        let data = JSON.parse(json);
        if (!data || !data.grid || data.grid.length === 0) {
            alert("File save không hợp lệ hoặc bị hỏng!");
            return;
        }

        if (data.saveVersion && data.saveVersion < 11) {
            alert("Phiên bản save quá cũ, không hỗ trợ nâng cấp tự động.");
            return;
        }

        // Migrate from V11 to V12
        if (!data.saveVersion || data.saveVersion === 11) {
            console.log("Migrating save from V11 to V12...");
            if (data.npcs) {
                data.npcs.forEach(npc => {
                    let oldRace = npc.race;
                    if (oldRace === 'Nhân loại') npc.raceId = 'human';
                    else if (oldRace === 'Người thú') npc.raceId = 'orc';
                    else if (oldRace === 'Tiên') npc.raceId = 'elf';
                    else if (oldRace === 'Người lùn') npc.raceId = 'dwarf';
                    else npc.raceId = 'human';
                    delete npc.race;
                });
            }
            if (!data.monsters) data.monsters = [];
            if (!data.neutrals) data.neutrals = [];
            if (!data.animals) data.animals = [];
            if (!data.spirits) data.spirits = [];
            if (!data.bosses) data.bosses = [];
            data.saveVersion = 12;
        }

        // Initialize new Tech system fields for older saves
        if (data.kingdoms) {
            data.kingdoms.forEach(k => {
                if (!k.technologies) k.technologies = [];
                if (k.currentResearch === undefined) k.currentResearch = null;
                if (typeof k.researchPoints !== 'number') k.researchPoints = 0;
                if (typeof k.scienceOutput !== 'number') k.scienceOutput = 0;
                if (typeof k.researchSpeed !== 'number') k.researchSpeed = 1.0;
                if (typeof k.breakthroughs !== 'number') k.breakthroughs = 0;
                if (!k.currentEra) k.currentEra = "Stone Age";
            });
        }

        resetState();
        Object.assign(state, data);
        
        // Apply defaults for missing fields
        if (!state.storyEvents) state.storyEvents = [];
        if (!state.eventChains) state.eventChains = [];
        if (!state.newspaperArticles) state.newspaperArticles = [];
        if (state.worldDramaScore === undefined) state.worldDramaScore = 0;
        
        rebuildSpatialGrid();

        if (state.tribes) {
            state.tribes.forEach(t => {
                if (!t.diplomacy) t.diplomacy = {};
                if (!t.diplomaticStatus) t.diplomaticStatus = {};
                Object.keys(t.diplomaticStatus).forEach(id => { t.diplomacy[id] = t.diplomaticStatus[id]; });
                Object.keys(t.diplomacy).forEach(id => {
                    if (!t.diplomaticStatus[id]) t.diplomaticStatus[id] = t.diplomacy[id];
                });
            });
        }

        logEvent("Tải game thành công.");
    } catch(e) { alert("Lỗi khi tải file save!"); console.error(e); }
}

export function saveGame() {
    localStorage.setItem(SAVE_KEY, getSaveData());
    let now = new Date();
    document.getElementById('last-autosave-time').innerText = now.toLocaleTimeString();
    playSound("save");
}
