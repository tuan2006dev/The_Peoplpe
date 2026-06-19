import { state } from '../gameState.js';
import { AGES } from '../data/constants.js';
import { addWorldEvent, logEvent } from './historySystem.js';

// Ngưỡng điểm nghiên cứu để thăng cấp thời kỳ
const AGE_THRESHOLDS = [0, 500, 2000, 5000, 10000];

// Bonus mỗi thời kỳ ảnh hưởng đến game
const AGE_BONUSES = [
    {}, // Nguyên thủy - không có bonus
    { foodBonus: 0.1, woodBonus: 0.1 },           // Bộ lạc - thu thập hiệu quả hơn 10%
    { foodBonus: 0.25, woodBonus: 0.15, maxStorage: 100 }, // Nông nghiệp - kho lớn hơn
    { foodBonus: 0.4, woodBonus: 0.3, maxStorage: 200, soldierBonus: 0.2 }, // Vương quốc
    { foodBonus: 0.6, woodBonus: 0.5, maxStorage: 500, soldierBonus: 0.5 }, // Trung cổ
];

export function updateTechnologyLogic() {
    // Chạy mỗi ngày (được gọi từ daily update trong main.js)
    state.tribes.forEach(tribe => {
        if (!tribe.ageLevel) tribe.ageLevel = AGES[0];
        if (!tribe.researchPoints) tribe.researchPoints = 0;
        if (!tribe.culturePoints) tribe.culturePoints = 0;
        if (!tribe.unlockedTechs) tribe.unlockedTechs = [];

        let currentAgeIndex = AGES.indexOf(tribe.ageLevel);
        if (currentAgeIndex < 0) currentAgeIndex = 0;

        // Điểm nghiên cứu tích lũy mỗi ngày dựa trên dân số + nhà
        const houseCount = state.houses.filter(h => h.tribeId === tribe.id).length;
        const popBonus = tribe.population * 0.5;
        const houseBonus = houseCount * 0.3;
        const levelBonus = { 'Trại nhỏ': 1, 'Làng': 2, 'Thị trấn': 3 }[tribe.level] || 1;
        const dailyResearch = (popBonus + houseBonus) * levelBonus * (tribe.innovationRate || 1.0);
        tribe.researchPoints += dailyResearch;
        tribe.culturePoints += (tribe.population * 0.2) + houseCount * 0.1;

        // Áp dụng bonus thời kỳ vào kho tối đa
        const bonus = AGE_BONUSES[currentAgeIndex] || {};
        if (bonus.maxStorage && tribe.maxStorage < bonus.maxStorage) {
            tribe.maxStorage = bonus.maxStorage;
        }

        // Kiểm tra xem có thể thăng cấp thời kỳ không
        if (currentAgeIndex < AGES.length - 1) {
            const nextThreshold = AGE_THRESHOLDS[currentAgeIndex + 1];
            if (tribe.researchPoints >= nextThreshold) {
                const nextAge = AGES[currentAgeIndex + 1];
                tribe.ageLevel = nextAge;

                const msg = `Bộ lạc ${tribe.name} tiến vào ${nextAge}!`;
                logEvent(msg);
                addWorldEvent(
                    'Technology',
                    currentAgeIndex + 1 >= 3 ? 'Legendary' : 'Historic',
                    `🔬 ${tribe.name} tiến vào ${nextAge}`,
                    `Sau nhiều năm nghiên cứu và phát triển, ${tribe.name} đã chính thức bước vào ${nextAge}, mở ra một chương mới trong lịch sử loài người.`
                );

                // Áp dụng bonus thời kỳ mới
                const newBonus = AGE_BONUSES[currentAgeIndex + 1] || {};
                if (newBonus.maxStorage) tribe.maxStorage = newBonus.maxStorage;
            }
        }

        // Đồng bộ ageLevel lên kingdom nếu có
        if (tribe.kingdomId) {
            const kingdom = state.kingdoms.find(k => k.id === tribe.kingdomId);
            if (kingdom) {
                const tribeAgeIdx = AGES.indexOf(tribe.ageLevel);
                const kingdomAgeIdx = AGES.indexOf(kingdom.ageLevel || AGES[0]);
                if (tribeAgeIdx > kingdomAgeIdx) {
                    kingdom.ageLevel = tribe.ageLevel;
                    kingdom.researchPoints = Math.max(kingdom.researchPoints || 0, tribe.researchPoints);
                }
            }
        }
    });
}

// Hàm tiện ích để lấy bonus của một tribe theo thời kỳ hiện tại
export function getAgeBonus(tribe) {
    const idx = AGES.indexOf(tribe.ageLevel || AGES[0]);
    return AGE_BONUSES[Math.max(0, idx)] || {};
}