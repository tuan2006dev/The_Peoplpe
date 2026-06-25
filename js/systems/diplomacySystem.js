import { state } from '../gameState.js';
import { ENTITY_DATA, RELATION_MATRIX, TIER } from '../data/races.js';
import { addWorldEvent } from './historySystem.js';
import { getTribeFood, getTribeWood, consumeTribeFood, consumeTribeWood, addTribeResource } from '../utils.js';
import { RESOURCES } from '../data/resources.js';

const NEUTRAL_TRADE_CAP = { wine: 50, gold: 30 };

export function setTribeRelation(t1, t2, status) {
    if (!t1.diplomaticStatus) t1.diplomaticStatus = {};
    if (!t2.diplomaticStatus) t2.diplomaticStatus = {};
    if (!t1.diplomacy) t1.diplomacy = {};
    if (!t2.diplomacy) t2.diplomacy = {};
    t1.diplomaticStatus[t2.id] = status;
    t2.diplomaticStatus[t1.id] = status;
    t1.diplomacy[t2.id] = status;
    t2.diplomacy[t1.id] = status;
}

export function initializeTribeDiplomacy(tribe) {
    if (!tribe.relations) tribe.relations = {};
    if (!tribe.diplomaticStatus) tribe.diplomaticStatus = {};
    if (!tribe.diplomacy) tribe.diplomacy = {};
    if (!tribe.truceCooldowns) tribe.truceCooldowns = {};
    if (!tribe.relationTimers) tribe.relationTimers = {};
    
    state.tribes.forEach(otherT => {
        if (otherT.id !== tribe.id) {
            let val = 0;
            if (RELATION_MATRIX[tribe.raceId] && RELATION_MATRIX[tribe.raceId][otherT.raceId] !== undefined) {
                val = RELATION_MATRIX[tribe.raceId][otherT.raceId];
            }
            tribe.relations[otherT.id] = val;
            otherT.relations[tribe.id] = val;
            
            setTribeRelation(tribe, otherT, 'neutral');
            
            tribe.relationTimers[otherT.id] = 0;
            if(!otherT.relationTimers) otherT.relationTimers = {};
            otherT.relationTimers[tribe.id] = 0;
        }
    });
}

export function updateDiplomacy() {
    if (state.ticks % 30 !== 0) return; // Chỉ xử lý định kỳ
    
    for (let i = 0; i < state.tribes.length; i++) {
        let t1 = state.tribes[i];
        if (!t1.relations) initializeTribeDiplomacy(t1);
        
        let r1 = ENTITY_DATA.find(r => r.id === t1.raceId);
        if (!r1) continue;

        for (let j = i + 1; j < state.tribes.length; j++) {
            let t2 = state.tribes[j];
            if (!t2.relations) initializeTribeDiplomacy(t2);
            
            let r2 = ENTITY_DATA.find(r => r.id === t2.raceId);
            if (!r2) continue;

            let relScore = t1.relations[t2.id] || 0;
            let currentStatus = t1.diplomaticStatus[t2.id] || 'neutral';
            
            // Xử lý đình chiến
            if (t1.truceCooldowns[t2.id] > 0) {
                t1.truceCooldowns[t2.id] -= 30;
                t2.truceCooldowns[t1.id] -= 30;
                if (t1.truceCooldowns[t2.id] <= 0) {
                    setTribeRelation(t1, t2, 'neutral');
                }
            }

            // Tự động Liên minh hoặc Chiến tranh dựa trên điểm số
            if (relScore > 80 && currentStatus !== 'alliance') {
                t1.relationTimers[t2.id] = (t1.relationTimers[t2.id] || 0) + 1;
                if (t1.relationTimers[t2.id] >= 10) { // Giữ mức > 80 trong 10 chu kỳ (300 ticks)
                    setTribeRelation(t1, t2, 'alliance');
                    addWorldEvent('Alliance', 'Important', `Liên minh tự nhiên`, `Nhờ sự tương đồng và quan hệ tốt, ${t1.name} (${r1.name}) và ${t2.name} (${r2.name}) đã chính thức liên minh.`);
                    t1.relationTimers[t2.id] = 0;
                }
            } else if (relScore < -80 && currentStatus !== 'war') {
                t1.relationTimers[t2.id] = (t1.relationTimers[t2.id] || 0) + 1;
                if (t1.relationTimers[t2.id] >= 10) {
                    setTribeRelation(t1, t2, 'war');
                    addWorldEvent('War', 'Important', `Chiến tranh nổ ra`, `Mâu thuẫn không thể hàn gắn giữa ${t1.name} (${r1.name}) và ${t2.name} (${r2.name}) đã dẫn đến chiến tranh đẫm máu.`);
                    t1.relationTimers[t2.id] = 0;
                }
            } else {
                t1.relationTimers[t2.id] = 0;
            }

            // Cơ chế đàm phán hòa bình
            if (currentStatus === 'war') {
                // Tộc Orc không bao giờ ký hiệp ước hòa bình
                if (r1.id === 'orc' || r2.id === 'orc') {
                    // Không đàm phán hòa bình
                } else {
                    // Tộc có diplomacy cao có khả năng đề xuất hòa bình
                    let peaceChance = (r1.baseStats.diplomacy + r2.baseStats.diplomacy) * 0.001; 
                    if (Math.random() < peaceChance) {
                        setTribeRelation(t1, t2, 'truce');
                        t1.truceCooldowns[t2.id] = 1800; 
                        t2.truceCooldowns[t1.id] = 1800;
                        t1.relations[t2.id] += 50; // Cải thiện quan hệ
                        t2.relations[t1.id] += 50;
                        addWorldEvent('Peace', 'Historic', `Hiệp ước đình chiến`, `Thông qua đàm phán ngoại giao khéo léo, ${t1.name} và ${t2.name} đã chấp nhận ngừng bắn.`);
                    }
                }
            }

            // Hiệp ước bảo vệ biển (Human & Merfolk)
            if ((r1.id === 'human' && r2.id === 'merfolk') || (r1.id === 'merfolk' && r2.id === 'human')) {
                let humanTribe = r1.id === 'human' ? t1 : t2;
                let merfolkTribe = r1.id === 'merfolk' ? t1 : t2;
                if (getTribeFood(humanTribe) > 100 && getTribeWood(humanTribe) > 50 && relScore > 50 && currentStatus !== 'war') {
                    if (Math.random() < 0.05) { // 5% chance per tick when conditions are met
                        consumeTribeFood(humanTribe, 20);
                        consumeTribeWood(humanTribe, 10);
                        addTribeResource(merfolkTribe, 'wheat', 20);
                        addTribeResource(merfolkTribe, 'timber', 10);
                        t1.relations[t2.id] += 10;
                        t2.relations[t1.id] += 10;
                        // Gửi lính Merfolk tuần tra (spawn lính ở gần Human)
                        addWorldEvent('Alliance', 'Historic', `Hiệp Ước Bảo Vệ Biển`, `Đế chế ${humanTribe.name} đã cung cấp lương thực và gỗ cho ${merfolkTribe.name} để đổi lấy sự bảo hộ vùng biển.`);
                    }
                }
            }

            // Tặng quà ngoại giao để cải thiện quan hệ
            if (t1.inventory && t2.inventory && currentStatus !== 'war') {
                if (Math.random() < 0.05) {
                    let valuableItems = ['gold', 'gems', 'wine', 'silk', 'magic_crystal'];
                    for (let item of valuableItems) {
                        if (t1.inventory[item] > 5) {
                            t1.inventory[item] -= 5;
                            addTribeResource(t2, item, 5);
                            t1.relations[t2.id] += 15;
                            t2.relations[t1.id] += 15;
                            let resName = RESOURCES[item] ? RESOURCES[item].name : item;
                            addWorldEvent('Diplomacy', 'Historic', `Tặng Quà Ngoại Giao`, `Bộ lạc ${t1.name} đã gửi tặng 5 ${resName} quý giá cho ${t2.name} để thắt chặt tình hữu nghị.`);
                            break;
                        }
                    }
                }
            }
        }
    }
    
    // Phần thưởng từ các tộc trung lập (Vintner, Merchant Guild) — kho hữu hạn, không tạo vô hạn
    state.tribes.forEach(t1 => {
        let r1 = ENTITY_DATA.find(r => r.id === t1.raceId);
        if (!r1 || r1.tier === TIER.NEUTRAL) return;
        
        state.tribes.forEach(t2 => {
            if (t1.id === t2.id) return;
            let r2 = ENTITY_DATA.find(r => r.id === t2.raceId);
            if (r2 && r2.tier === TIER.NEUTRAL && t1.relations[t2.id] > 80) {
                if (!t2.inventory) t2.inventory = {};
                if (r2.id === 'vintner' && Math.random() < 0.05) {
                    let cap = NEUTRAL_TRADE_CAP.wine;
                    if ((t2.inventory['wine'] || 0) < cap && Math.random() < 0.3) {
                        t2.inventory['wine'] = Math.min(cap, (t2.inventory['wine'] || 0) + 1);
                    }
                    if ((t2.inventory['wine'] || 0) >= 5) {
                        t2.inventory['wine'] -= 5;
                        addTribeResource(t1, 'wine', 5);
                    }
                } else if (r2.id === 'merchant_guild' && Math.random() < 0.05) {
                    let cap = NEUTRAL_TRADE_CAP.gold;
                    if ((t2.inventory['gold'] || 0) < cap && Math.random() < 0.3) {
                        t2.inventory['gold'] = Math.min(cap, (t2.inventory['gold'] || 0) + 1);
                    }
                    if ((t2.inventory['gold'] || 0) >= 2) {
                        t2.inventory['gold'] -= 2;
                        addTribeResource(t1, 'gold', 2);
                    }
                }
            }
        });
    });
}
