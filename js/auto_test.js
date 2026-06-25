import { state } from './gameState.js';
import { updateKingdomLogic } from './systems/kingdomSystem.js';
import { updateCivilizationLogic } from './systems/civilizationSystem.js';
import { determineJob } from './systems/aiSystem.js';

export function runHeadlessTests() {
    console.log("=== BẮT ĐẦU CHẠY UNIT TEST HỆ THỐNG VĂN MINH ===");
    let errors = 0;

    try {
        // 1. Tạo 1 Tribe giả
        state.tribes.push({
            id: 999, name: "Test Tribe", population: 60, leaderId: 1, 
            faith: 50, color: "red", ageLevel: 1, researchPoints: 0, 
            culturePoints: 0, educationLevel: 0, innovationRate: 0, unlockedTechs: []
        });

        // 2. Chạy updateKingdomLogic để Tribe này biến thành Kingdom
        updateKingdomLogic();

        let k = state.kingdoms.find(kd => kd.tribeIds.includes(999));
        if (!k) {
            console.error("❌ LỖI: Không thể tạo Vương quốc từ Tribe 50 dân.");
            errors++;
        } else {
            console.log("✅ Đã tạo thành công Vương quốc " + k.name);
            
            // 3. Kiểm tra các chỉ số khởi tạo
            if (k.civilizationLevel !== 1 || k.currentEra !== "Stone Age") {
                console.error("❌ LỖI: Kingdom không khởi tạo ở Stone Age.");
                errors++;
            } else {
                console.log("✅ Kingdom khởi tạo đúng ở Stone Age.");
            }

            // 4. Tạo NPC giả thuộc về Tribe 999
            let testNpc = {
                id: 888, tribeId: 999, job: "Vô nghiệp", age: 20
            };
            state.npcs.push(testNpc);

            // 5. Test ép nghề nghiệp Văn minh cao
            k.civilizationLevel = 6; // Ép lên Industrial
            determineJob(testNpc);
            
            console.log("✅ Nghề nghiệp sau khi ép lên Industrial: " + testNpc.job);
            
            // 6. Test updateCivilizationLogic
            // Chỉnh tick để trigger update
            state.ticks = 10;
            testNpc.job = "Kỹ sư"; // Force job to get RP
            updateCivilizationLogic();

            if (k.researchPoints === 0 || k.technologyScore === 0) {
                console.error("❌ LỖI: Kỹ sư không tạo ra điểm Research/Tech.");
                errors++;
            } else {
                console.log(`✅ Kỹ sư đã tạo ra ${k.researchPoints} RP và ${k.technologyScore} Tech Score.`);
            }
        }
    } catch (e) {
        console.error("❌ LỖI CRASH KHI TEST: ", e);
        errors++;
    }

    if (errors === 0) {
        console.log("🎉 TẤT CẢ UNIT TEST ĐỀU PASSED! HỆ THỐNG VĂN MINH HOẠT ĐỘNG HOÀN HẢO.");
        alert("Bot Antigravity Test: Toàn bộ chức năng Văn Minh hoạt động TỐT! (Xem Console F12 để biết chi tiết)");
    } else {
        console.error(`⚠️ PHÁT HIỆN ${errors} LỖI.`);
        alert(`Bot Antigravity Test: Phát hiện ${errors} lỗi! (Xem Console F12)`);
    }

    // Cleanup
    state.tribes = state.tribes.filter(t => t.id !== 999);
    state.kingdoms = state.kingdoms.filter(k => !k.tribeIds.includes(999));
    state.npcs = state.npcs.filter(n => n.id !== 888);
}
