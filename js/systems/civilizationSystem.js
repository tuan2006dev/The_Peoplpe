import { state } from '../gameState.js';
import { logEvent, addWorldEvent } from './historySystem.js';

export const ERAS = [
    {
        id: "Stone Age",
        level: 1,
        jobs: ["Thợ săn", "Người hái lượm"],
        unlocks: ["Lửa trại", "Giáo đá", "Săn bắn", "Hái lượm"],
        requirements: null // Mặc định
    },
    {
        id: "Bronze Age",
        level: 2,
        jobs: ["Nông dân", "Thương nhân"],
        unlocks: ["Công cụ đồng", "Nông nghiệp", "Chợ"],
        requirements: (k) => k.population > 30 // Giả định thực phẩm ổn định do pop tăng
    },
    {
        id: "Iron Age",
        level: 3,
        jobs: ["Lính", "Thợ rèn"],
        unlocks: ["Vũ khí sắt", "Trại lính", "Đường đất"],
        requirements: (k) => k.industrialScore >= 50 // Đại diện cho khai thác quặng/thợ rèn
    },
    {
        id: "Medieval Age",
        level: 4,
        jobs: ["Hiệp sĩ", "Tu sĩ"],
        unlocks: ["Lâu đài", "Đền thờ", "Chuồng ngựa"],
        requirements: (k) => k.population > 100
    },
    {
        id: "Renaissance",
        level: 5,
        jobs: ["Học giả", "Nhà khoa học"],
        unlocks: ["Thư viện", "Học viện", "Đài thiên văn"],
        requirements: (k) => k.educationScore >= 100
    },
    {
        id: "Industrial Age",
        level: 6,
        jobs: ["Kỹ sư", "Công nhân"],
        unlocks: ["Nhà máy", "Động cơ hơi nước", "Đường sắt"],
        requirements: (k) => k.scienceScore >= 200 && k.industrialScore >= 300
    },
    {
        id: "Modern Age",
        level: 7,
        jobs: ["Bác sĩ", "Giáo viên"],
        unlocks: ["Điện lưới", "Bệnh viện", "Trường học"],
        requirements: (k) => k.industrialScore >= 800 && k.technologyScore >= 500
    },
    {
        id: "Digital Age",
        level: 8,
        jobs: ["Lập trình viên", "Nghiên cứu viên"],
        unlocks: ["Máy tính", "Internet", "Trung tâm dữ liệu"],
        requirements: (k) => k.scienceScore >= 1000 && k.educationScore >= 800
    },
    {
        id: "Space Age",
        level: 9,
        jobs: ["Phi hành gia", "Kỹ sư vũ trụ"],
        unlocks: ["Trung tâm tên lửa", "Cảng vũ trụ", "Trạm quỹ đạo"],
        requirements: (k) => k.technologyScore >= 3000 && k.population > 5000
    }
];

export function getNextEra(currentEraId) {
    let idx = ERAS.findIndex(e => e.id === currentEraId);
    if (idx >= 0 && idx < ERAS.length - 1) return ERAS[idx + 1];
    return null;
}

export function updateCivilizationLogic() {
    // Chạy mỗi 10 ticks để đỡ lag
    if (state.ticks % 10 !== 0) return;

    state.kingdoms.forEach(k => {
        // Initialize if missing
        if (!k.civilizationLevel) {
            k.civilizationLevel = 1;
            k.technologyScore = 0;
            k.cultureScore = 0;
            k.scienceScore = 0;
            k.industrialScore = 0;
            k.educationScore = 0;
        }

        // Gather metrics based on the current situation
        let scholars = 0; let scientists = 0; let engineers = 0; let teachers = 0; let workers = 0;
        
        state.npcs.forEach(n => {
            let t = state.tribes.find(tr => tr.id === n.tribeId);
            if (t && t.kingdomId === k.id) {
                if (n.job === 'Học giả' || n.job === 'Tu sĩ') scholars++;
                if (n.job === 'Nhà khoa học' || n.job === 'Nghiên cứu viên') scientists++;
                if (n.job === 'Kỹ sư' || n.job === 'Lập trình viên') engineers++;
                if (n.job === 'Giáo viên' || n.job === 'Bác sĩ') teachers++;
                if (n.job === 'Thợ rèn' || n.job === 'Công nhân') workers++;
            }
        });

        // Tích lũy các điểm số phụ trợ (chỉ dùng cho UI hoặc điều kiện phụ)
        k.scienceScore += (scientists * 0.5) + (scholars * 0.1);
        k.technologyScore += (engineers * 0.5) + (scientists * 0.2);
        k.educationScore += (teachers * 0.5) + (scholars * 0.2);
        k.industrialScore += (workers * 0.5) + (engineers * 0.2);
        k.cultureScore += k.faithPower * 0.01;
        
        // Era Progress is now tied to Technology unlocks, handled by researchSystem.js
        // We update civilizationLevel based on currentEra (which is updated by researchSystem.js)
        let eraData = ERAS.find(e => e.id === k.currentEra);
        if (eraData) {
            k.civilizationLevel = eraData.level;
        }
    });
}
