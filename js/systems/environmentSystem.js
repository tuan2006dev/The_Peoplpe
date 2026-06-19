import { state } from '../gameState.js';
import { SEASONS } from '../data/constants.js';

// Hệ số hunger theo mùa (nhân với hunger rate mặc định)
export const SEASON_HUNGER_MULTIPLIER = { 'Xuân': 1.0, 'Hạ': 0.9, 'Thu': 1.1, 'Đông': 1.5 };
// Hệ số food spawn theo mùa
export const SEASON_FOOD_MULTIPLIER = { 'Xuân': 1.3, 'Hạ': 1.1, 'Thu': 0.8, 'Đông': 0.2 };

export function updateEnvironmentLogic() {
    // Tính mùa từ tháng hiện tại
    const month = state.time.month;
    let seasonIndex;
    if (month <= 3) seasonIndex = 0;       // Xuân: tháng 1-3
    else if (month <= 6) seasonIndex = 1;  // Hạ: tháng 4-6
    else if (month <= 9) seasonIndex = 2;  // Thu: tháng 7-9
    else seasonIndex = 3;                  // Đông: tháng 10-12

    const newSeason = SEASONS[seasonIndex];
    const oldSeason = state.climate.season;

    if (newSeason !== oldSeason) {
        state.climate.season = newSeason;
        _applySeasonalClimate(newSeason);
    }

    // Cập nhật nhiệt độ theo mùa mỗi ngày
    _updateTemperature(seasonIndex);
}

function _applySeasonalClimate(season) {
    // Cập nhật fertility toàn cục theo mùa
    switch (season) {
        case 'Xuân':
            state.climate.globalFert = 70;
            state.climate.globalTemp = 20;
            state.climate.globalHum = 60;
            break;
        case 'Hạ':
            state.climate.globalFert = 80;
            state.climate.globalTemp = 35;
            state.climate.globalHum = 40;
            break;
        case 'Thu':
            state.climate.globalFert = 50;
            state.climate.globalTemp = 18;
            state.climate.globalHum = 55;
            break;
        case 'Đông':
            state.climate.globalFert = 20;
            state.climate.globalTemp = 2;
            state.climate.globalHum = 30;
            // Mùa đông: giảm fertility một số biome
            for (let x = 0; x < state.envGrid.length; x++) {
                for (let y = 0; y < state.envGrid[x].length; y++) {
                    const env = state.envGrid[x][y];
                    if (env.biome === 'Đồng cỏ' || env.biome === 'Rừng') {
                        env.fertility = Math.max(0, env.fertility - 20);
                    }
                }
            }
            break;
    }
}

function _updateTemperature(seasonIndex) {
    // Dao động nhiệt độ nhẹ mỗi ngày quanh giá trị mùa
    const baseTemps = [20, 33, 18, 3];
    const base = baseTemps[seasonIndex];
    state.climate.globalTemp = base + (Math.random() * 6 - 3);

    // Mùa đông: NPC trên tuyết bị lạnh (mất health)
    if (seasonIndex === 3) {
        state.npcs.forEach(npc => {
            const nx = Math.round(npc.x), ny = Math.round(npc.y);
            if (nx >= 0 && nx < state.envGrid.length && ny >= 0 && ny < state.envGrid[nx].length) {
                if (state.envGrid[nx][ny].biome === 'Tuyết' || state.envGrid[nx][ny].biome === 'Sa mạc') {
                    npc.health -= 0.5;
                }
            }
        });
    }
}