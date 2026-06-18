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
        Object.assign(state, data);
        if (!state.saveVersion) state.saveVersion = 10;
        // Apply defaults for missing fields if upgrading
        if (!state.storyEvents) state.storyEvents = [];
        if (!state.eventChains) state.eventChains = [];
        if (!state.newspaperArticles) state.newspaperArticles = [];
        if (state.worldDramaScore === undefined) state.worldDramaScore = 0;
        logEvent("Tải game thành công.");
    } catch(e) { alert("Lỗi khi tải file save!"); }
}

export function saveGame() {
    localStorage.setItem(SAVE_KEY, getSaveData());
    let now = new Date();
    document.getElementById('last-autosave-time').innerText = now.toLocaleTimeString();
    playSound("save");
}
