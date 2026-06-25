import { state } from '../gameState.js';
import { logEvent, addWorldEvent } from './historySystem.js';

// Chạy mỗi ngày trong game - tự động trao đổi tài nguyên giữa các bộ lạc liên minh
export function updateTradeLogic() {
    if (!state.tribes || state.tribes.length < 2) return;

    // Chỉ chạy mỗi 5 ngày để tránh quá nhiều giao dịch
    if (state.time.day % 5 !== 0) return;

    state.tribes.forEach(tribe => {
        if (!tribe.diplomaticStatus && !tribe.diplomacy) return;

        state.tribes.forEach(partner => {
            if (partner.id <= tribe.id) return;
            const relation = (tribe.diplomaticStatus && tribe.diplomaticStatus[partner.id])
                || (tribe.diplomacy && tribe.diplomacy[partner.id]);
            if (relation !== 'alliance') return;

            let traded = false;

            // GIAO THƯƠNG THỨC ĂN: Bên nào thừa chuyển sang bên thiếu
            const foodSurplus = tribe.foodStorage - (partner.foodStorage + 50);
            if (foodSurplus > 30) {
                const amount = Math.floor(Math.min(foodSurplus * 0.3, 50));
                tribe.foodStorage -= amount;
                partner.foodStorage += amount;
                traded = true;
            } else {
                const reverseSurplus = partner.foodStorage - (tribe.foodStorage + 50);
                if (reverseSurplus > 30) {
                    const amount = Math.floor(Math.min(reverseSurplus * 0.3, 50));
                    partner.foodStorage -= amount;
                    tribe.foodStorage += amount;
                    traded = true;
                }
            }

            // GIAO THƯƠNG GỖ: Bên nào thừa chuyển sang bên thiếu
            const woodSurplus = tribe.woodStorage - (partner.woodStorage + 30);
            if (woodSurplus > 20) {
                const amount = Math.floor(Math.min(woodSurplus * 0.3, 30));
                tribe.woodStorage -= amount;
                partner.woodStorage += amount;
                traded = true;
            } else {
                const reverseWoodSurplus = partner.woodStorage - (tribe.woodStorage + 30);
                if (reverseWoodSurplus > 20) {
                    const amount = Math.floor(Math.min(reverseWoodSurplus * 0.3, 30));
                    partner.woodStorage -= amount;
                    tribe.woodStorage += amount;
                    traded = true;
                }
            }

            // Tăng điểm văn hóa cho cả hai bên khi giao thương
            if (traded) {
                tribe.culturePoints = (tribe.culturePoints || 0) + 5;
                partner.culturePoints = (partner.culturePoints || 0) + 5;

                if (Math.random() < 0.05) {
                    addWorldEvent(
                        'Discovery',
                        'Important',
                        `Tuyến đường thương mại ${tribe.name} ↔ ${partner.name}`,
                        `Nhờ liên minh bền vững, ${tribe.name} và ${partner.name} đã thiết lập tuyến đường thương mại thường xuyên, trao đổi lương thực và vật liệu.`
                    );
                } else {
                    logEvent(`Thương mại: ${tribe.name} ↔ ${partner.name} trao đổi tài nguyên.`);
                }
            }
        });
    });
}
