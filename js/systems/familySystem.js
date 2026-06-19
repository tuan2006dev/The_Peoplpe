import { state } from '../gameState.js';

// Tỷ lệ thừa hưởng trait từ cha mẹ
const INHERIT_RATIO = 0.4; // 40% trait cha mẹ + 60% ngẫu nhiên
const MUTATION_CHANCE = 0.15; // 15% đột biến hoàn toàn ngẫu nhiên

export function updateFamilyLogic() {
    // Chỉ chạy mỗi 30 ticks để tiết kiệm performance
    if (state.ticks % 30 !== 0) return;

    state.npcs.forEach(npc => {
        // Chỉ xử lý trẻ em/thanh niên có cha mẹ
        if (npc.age > 10) return;
        if (!npc.fatherId && !npc.motherId) return;
        if (npc._inheritedTraits) return; // Chỉ thừa hưởng 1 lần

        const father = npc.fatherId ? state.npcs.find(n => n.id === npc.fatherId) : null;
        const mother = npc.motherId ? state.npcs.find(n => n.id === npc.motherId) : null;

        if (!father && !mother) return;

        // Thừa hưởng các chỉ số quan trọng
        const statsToInherit = ['intelligence', 'bravery', 'faith', 'leadership', 'ambition', 'courage'];
        statsToInherit.forEach(stat => {
            const parentValues = [];
            if (father && father[stat] !== undefined) parentValues.push(father[stat]);
            if (mother && mother[stat] !== undefined) parentValues.push(mother[stat]);
            if (parentValues.length === 0) return;

            const parentAvg = parentValues.reduce((a, b) => a + b, 0) / parentValues.length;

            if (Math.random() < MUTATION_CHANCE) {
                // Đột biến: giá trị hoàn toàn ngẫu nhiên
                npc[stat] = Math.floor(Math.random() * 100);
            } else {
                // Thừa hưởng: trung bình cha mẹ + ảnh hưởng ngẫu nhiên
                const randomInfluence = (Math.random() - 0.5) * 30;
                npc[stat] = Math.max(0, Math.min(100,
                    Math.floor(parentAvg * INHERIT_RATIO + npc[stat] * (1 - INHERIT_RATIO) + randomInfluence)
                ));
            }
        });

        // Thừa hưởng trait đặc biệt từ cha mẹ (20% xác suất)
        const parentTraits = [
            ...(father?.traits || []),
            ...(mother?.traits || [])
        ];
        if (parentTraits.length > 0 && Math.random() < 0.2) {
            if (!npc.traits) npc.traits = [];
            const inheritedTrait = parentTraits[Math.floor(Math.random() * parentTraits.length)];
            if (!npc.traits.includes(inheritedTrait)) {
                npc.traits.push(inheritedTrait);
            }
        }

        npc._inheritedTraits = true; // Đánh dấu đã xử lý
    });
}