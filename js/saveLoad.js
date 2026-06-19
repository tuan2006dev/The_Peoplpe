import { state } from './gameState.js';
import { SAVE_KEY, SAVE_VERSION } from './config.js';
import { playSound } from './utils.js';
import { logEvent } from './systems/historySystem.js';

export function getSaveData() {
    return JSON.stringify({ ...state, saveVersion: SAVE_VERSION });
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

        Object.assign(state, data);
        
        // Apply defaults for missing fields
        if (!state.storyEvents) state.storyEvents = [];
        if (!state.eventChains) state.eventChains = [];
        if (!state.newspaperArticles) state.newspaperArticles = [];
        if (state.worldDramaScore === undefined) state.worldDramaScore = 0;
        logEvent("Tải game thành công.");
    } catch(e) { alert("Lỗi khi tải file save!"); console.error(e); }
}

export function saveGame() {
    localStorage.setItem(SAVE_KEY, getSaveData());
    let now = new Date();
    document.getElementById('last-autosave-time').innerText = now.toLocaleTimeString();
    playSound("save");
}
