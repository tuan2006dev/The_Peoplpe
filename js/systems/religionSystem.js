import { state } from '../gameState.js';
import { REL_NAMES } from '../data/names.js';
import { addWorldEvent, logEvent } from './historySystem.js';

const RELIGION_COLORS = ['#f1c40f', '#e67e22', '#9b59b6', '#1abc9c', '#e74c3c', '#3498db'];

export function updateReligionLogic() {
    if (state.ticks % 60 !== 0) return; // Chạy mỗi 60 ticks để tiết kiệm performance

    // --- BƯỚC 1: HÌNH THÀNH TÔN GIÁO MỚI ---
    _tryFormReligion();

    // --- BƯỚC 2: LAN TRUYỀN ĐỨC TIN ---
    _spreadFaith();

    // --- BƯỚC 3: MÂU THUẪN TÔN GIÁO ---
    _checkReligiousConflict();

    // --- BƯỚC 4: CẬP NHẬT SỐ TÍN ĐỒ ---
    _updateFollowerCounts();
}

// Một NPC đủ điều kiện có thể lập tôn giáo mới
function _tryFormReligion() {
    if (state.religions.length >= REL_NAMES.length) return;

    // Tìm NPC đủ điều kiện: đức tin cao, không có tôn giáo, tuổi đủ lớn
    const prophet = state.npcs.find(n =>
        n.age >= 20 &&
        n.faith >= 85 &&
        !n.religionId &&
        n.tribeId &&
        Math.random() < 0.001 // Xác suất hiếm mỗi 60 ticks
    );
    if (!prophet) return;

    // Đảm bảo chưa có tôn giáo tên này
    const usedNames = state.religions.map(r => r.name);
    const availableNames = REL_NAMES.filter(n => !usedNames.includes(n));
    if (availableNames.length === 0) return;

    const relId = ++state.relIdCounter;
    const relName = availableNames[Math.floor(Math.random() * availableNames.length)];
    const color = RELIGION_COLORS[relId % RELIGION_COLORS.length];

    const religion = {
        id: relId,
        name: relName,
        founderId: prophet.id,
        founderName: prophet.name,
        color,
        followers: [prophet.id],
        tribeIds: [prophet.tribeId],
        foundedYear: state.time.year,
        holyTenet: _generateTenet(),
        influencePower: 10
    };

    state.religions.push(religion);
    prophet.religionId = relId;
    prophet.faith = 100;
    if (!prophet.traits) prophet.traits = [];
    if (!prophet.traits.includes('Nhà tiên tri')) prophet.traits.push('Nhà tiên tri');

    logEvent(`${prophet.name} sáng lập tôn giáo ${relName}!`);
    addWorldEvent(
        'Religion',
        'Historic',
        `✝️ Tôn giáo ${relName} ra đời`,
        `${prophet.name}, một người đầy đức tin trong bộ lạc ${state.tribes.find(t => t.id === prophet.tribeId)?.name || '?'}, đã nhận được khải thị và sáng lập tôn giáo ${relName}.`
    );
}

// Giáo chủ/tín đồ truyền đạo cho người xung quanh
function _spreadFaith() {
    state.religions.forEach(religion => {
        const missionaries = state.npcs.filter(n => n.religionId === religion.id && n.faith > 60);

        missionaries.forEach(missionary => {
            const nearbyNpcs = state.npcs.filter(n =>
                n.id !== missionary.id &&
                Math.hypot(n.x - missionary.x, n.y - missionary.y) <= 5 &&
                n.faith < 90
            );

            nearbyNpcs.forEach(target => {
                // Tăng faith của người gần giáo chủ
                target.faith = Math.min(100, target.faith + 0.5);

                // Nếu đức tin đủ cao và chưa có tôn giáo → cải đạo
                if (target.faith >= 70 && !target.religionId && Math.random() < 0.02) {
                    target.religionId = religion.id;
                    if (!religion.followers.includes(target.id)) {
                        religion.followers.push(target.id);
                    }
                    if (target.tribeId && !religion.tribeIds.includes(target.tribeId)) {
                        religion.tribeIds.push(target.tribeId);
                    }
                }

                // Nếu đã có tôn giáo khác → có thể cải đạo nếu đức tin quá chênh lệch
                if (target.religionId && target.religionId !== religion.id && Math.random() < 0.005) {
                    const oldRel = state.religions.find(r => r.id === target.religionId);
                    if (oldRel) {
                        oldRel.followers = oldRel.followers.filter(id => id !== target.id);
                    }
                    target.religionId = religion.id;
                    religion.followers.push(target.id);
                }
            });
        });
    });
}

// Kiểm tra mâu thuẫn tôn giáo trong cùng bộ lạc
function _checkReligiousConflict() {
    state.tribes.forEach(tribe => {
        const tribeNpcs = state.npcs.filter(n => n.tribeId === tribe.id && n.religionId);
        if (tribeNpcs.length < 5) return;

        // Đếm số người theo mỗi tôn giáo
        const faithCounts = {};
        tribeNpcs.forEach(n => {
            faithCounts[n.religionId] = (faithCounts[n.religionId] || 0) + 1;
        });

        // Nếu có 2+ tôn giáo trong cùng bộ lạc → giảm loyalty, tăng khả năng drama
        if (Object.keys(faithCounts).length >= 2 && Math.random() < 0.001) {
            tribeNpcs.forEach(n => {
                n.loyalty = Math.max(0, n.loyalty - 5);
            });
            const relNames = Object.keys(faithCounts)
                .map(rId => state.religions.find(r => r.id === parseInt(rId))?.name)
                .filter(Boolean);
            addWorldEvent(
                'Religion',
                'Important',
                `⚡ Mâu thuẫn tôn giáo ở ${tribe.name}`,
                `Sự chia rẽ giữa ${relNames.join(' và ')} đã gây ra căng thẳng trong nội bộ ${tribe.name}.`
            );
        }
    });
}

// Cập nhật số tín đồ thực tế
function _updateFollowerCounts() {
    state.religions.forEach(religion => {
        religion.followers = state.npcs.filter(n => n.religionId === religion.id).map(n => n.id);
        religion.influencePower = religion.followers.length * 2;
    });
    // Xóa tôn giáo không còn tín đồ
    state.religions = state.religions.filter(r => r.followers.length > 0);
}

// Tạo giáo lý ngẫu nhiên
function _generateTenet() {
    const tenets = [
        'Sùng bái Mặt Trời', 'Tôn thờ Tổ tiên', 'Theo dấu Ngôi Sao', 
        'Phụng sự Đại Thần', 'Hòa hợp Thiên Nhiên', 'Chinh phục để sống'
    ];
    return tenets[Math.floor(Math.random() * tenets.length)];
}