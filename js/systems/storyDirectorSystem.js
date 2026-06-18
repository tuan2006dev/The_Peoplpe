import { state } from '../gameState.js';
import { logEvent } from './historySystem.js';

// --- UTILS ---
export function addArticle(title, content) {
    state.newspaperArticles.unshift({
        year: state.time.year,
        month: state.time.month,
        title: title,
        content: content
    });
    if (state.newspaperArticles.length > 50) state.newspaperArticles.pop();
}

export function createStoryEvent(type, title, description, importance, npcIds = [], kingdomIds = [], relIds = []) {
    let event = {
        id: 'evt_' + Date.now() + '_' + Math.floor(Math.random()*1000),
        title,
        description,
        type,
        importance,
        startYear: state.time.year,
        startMonth: state.time.month,
        startDay: state.time.day,
        involvedNpcIds: npcIds,
        involvedKingdomIds: kingdomIds,
        involvedReligionIds: relIds,
        status: 'ACTIVE'
    };
    state.storyEvents.push(event);
    
    // Log to history if it's Major or higher
    if (importance === 'WORLD_CHANGING' || importance === 'LEGENDARY' || importance === 'MAJOR') {
        let histImportance = importance === 'WORLD_CHANGING' ? 'Historic' : (importance === 'LEGENDARY' ? 'Legendary' : 'Important');
        state.worldHistory.push({
            year: state.time.year,
            timeStr: `Năm ${state.time.year}, Th.${state.time.month}`,
            title: title,
            desc: description,
            type: type,
            importance: histImportance
        });
    }
    
    addArticle(`Sự kiện: ${title}`, description);
    
    return event;
}

export function addLifeStory(npcId, eventStr) {
    let npc = state.npcs.find(n => n.id === npcId);
    if (!npc) return;
    if (!npc.lifeStory) npc.lifeStory = [];
    npc.lifeStory.push(`[Tuổi ${Math.floor(npc.age)}] ${eventStr}`);
}

// --- DRAMA SCORE ---
function calculateDramaScore() {
    let score = 0;
    
    // Wars
    score += state.wars.length * 15;
    
    // Disasters
    score += state.activeDisasters.length * 10;
    
    // NPCs Happiness / Loyalty / Ambition
    let totalHappiness = 0;
    let highAmbitionCount = 0;
    let lowLoyaltyCount = 0;
    
    if (state.npcs.length > 0) {
        state.npcs.forEach(n => {
            totalHappiness += n.happiness;
            if (n.ambition > 70) highAmbitionCount++;
            if (n.loyalty < 30) lowLoyaltyCount++;
        });
        let avgHappiness = totalHappiness / state.npcs.length;
        
        if (avgHappiness < 40) score += 20;
        if (avgHappiness < 20) score += 20; // total 40 if very sad
        
        score += (highAmbitionCount / state.npcs.length) * 30; // Max +30
        score += (lowLoyaltyCount / state.npcs.length) * 30; // Max +30
    }
    
    // Normalize
    if (score < 0) score = 0;
    if (score > 100) score = 100;
    
    return Math.floor(score);
}

// --- EVENT TRIGGERS ---

function getRandomNPC(filterFunc) {
    let candidates = state.npcs.filter(filterFunc);
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
}

function triggerChosenOne() {
    let npc = getRandomNPC(n => n.age > 10 && (!n.traits || !n.traits.includes('chosenByFate')));
    if (!npc) return;
    
    if (!npc.traits) npc.traits = [];
    npc.traits.push('chosenByFate');
    npc.intelligence = Math.min(100, npc.intelligence + 20);
    npc.leadership = Math.min(100, npc.leadership + 20);
    npc.faith = Math.min(100, npc.faith + 20);
    npc.courage = Math.min(100, npc.courage + 10);
    
    createStoryEvent('Chosen One', `Người Được Chọn: ${npc.name}`, `${npc.name} đã được số phận lựa chọn để làm những việc vĩ đại.`, 'LEGENDARY', [npc.id]);
    addLifeStory(npc.id, "Nhận được điềm báo từ các vì sao, trở thành Người Được Chọn.");
}

function triggerForbiddenLove() {
    if (state.tribes.length < 2 && state.kingdoms.length < 2 && state.religions.length < 2) return;
    
    let npc1 = getRandomNPC(n => n.age > 16 && !n.partnerId);
    if (!npc1) return;
    
    let npc2 = getRandomNPC(n => n.age > 16 && !n.partnerId && n.id !== npc1.id && 
        (n.tribeId !== npc1.tribeId || n.religionId !== npc1.religionId)
    );
    if (!npc2) return;
    
    // Force them to love each other
    npc1.partnerId = npc2.id;
    npc2.partnerId = npc1.id;
    
    let reason = npc1.tribeId !== npc2.tribeId ? "khác bộ lạc" : "khác tôn giáo";
    createStoryEvent('Forbidden Love', `Tình Yêu Cấm Đoán`, `${npc1.name} và ${npc2.name} đã yêu nhau dù họ ${reason}.`, 'MAJOR', [npc1.id, npc2.id]);
    addLifeStory(npc1.id, `Đem lòng yêu ${npc2.name} bất chấp định kiến.`);
    addLifeStory(npc2.id, `Đem lòng yêu ${npc1.name} bất chấp định kiến.`);
}

function triggerBetrayal() {
    let npc = getRandomNPC(n => n.ambition > 70 && n.loyalty < 30 && n.tribeId);
    if (!npc) return;
    
    let tribe = state.tribes.find(t => t.id === npc.tribeId);
    if (!tribe || tribe.leaderId === npc.id) return;
    let leader = state.npcs.find(l => l.id === tribe.leaderId);
    
    createStoryEvent('Betrayal', `Phản Bội ở ${tribe.name}`, `${npc.name} đã âm mưu lật đổ thủ lĩnh ${leader ? leader.name : 'của họ'}.`, 'MAJOR', [npc.id]);
    addLifeStory(npc.id, `Lên kế hoạch phản bội và lật đổ lãnh đạo.`);
    
    // Actually execute a coup chance
    if (Math.random() > 0.5) {
        tribe.leaderId = npc.id;
        addArticle(`Đảo chính thành công!`, `${npc.name} đã giành quyền kiểm soát ${tribe.name}.`);
    } else {
        if (leader) leader.health -= 20;
        npc.tribeId = null; // Exiled
        addArticle(`Đảo chính thất bại!`, `${npc.name} bị trục xuất khỏi ${tribe.name}.`);
    }
}

function triggerFalseProphet() {
    let npc = getRandomNPC(n => n.age > 20 && n.ambition > 60);
    if (!npc) return;
    
    createStoryEvent('False Prophet', `Tiên Tri Giả ${npc.name}`, `${npc.name} đi khắp nơi tuyên bố mình là hiện thân của Thần, thu hút nhiều tín đồ mù quáng.`, 'MAJOR', [npc.id]);
    addLifeStory(npc.id, `Tự xưng là Tiên Tri, lừa gạt mọi người.`);
    npc.faith = 0; // Tự xưng nên thực chất không tin thần
}

function triggerHeroRises() {
    if (state.wars.length === 0) return;
    let npc = getRandomNPC(n => n.age > 16 && n.courage > 50 && n.tribeId);
    if (!npc) return;
    
    npc.leadership = Math.min(100, npc.leadership + 30);
    npc.courage = 100;
    if (!npc.traits) npc.traits = [];
    npc.traits.push('heroic');
    
    createStoryEvent('Hero Rises', `Anh Hùng Trỗi Dậy: ${npc.name}`, `Trong thời khắc đen tối của chiến tranh, ${npc.name} đã đứng lên lãnh đạo mọi người.`, 'LEGENDARY', [npc.id]);
    addLifeStory(npc.id, `Trở thành anh hùng trong chiến tranh.`);
}

function triggerGreatExplorer() {
    let npc = getRandomNPC(n => n.age > 16 && n.ambition > 50);
    if (!npc) return;
    
    createStoryEvent('Great Explorer', `Nhà Thám Hiểm ${npc.name}`, `${npc.name} quyết định rời bỏ quê hương để khám phá những vùng đất chưa ai biết tới.`, 'MINOR', [npc.id]);
    addLifeStory(npc.id, `Bắt đầu hành trình thám hiểm vĩ đại.`);
    npc.tribeId = null; // Rời đi
    npc.x = Math.floor(Math.random() * state.grid.length);
    npc.y = Math.floor(Math.random() * state.grid[0].length);
}

function triggerLostCivilization() {
    createStoryEvent('Lost Civilization', `Tàn Tích Cổ Đại`, `Một tàn tích của nền văn minh cổ đại vừa được phát hiện, hứa hẹn mang lại nhiều tri thức mới.`, 'MAJOR');
    // Give global tech boost
    state.tribes.forEach(t => t.researchPoints += 50);
    addArticle(`Phát hiện khảo cổ vĩ đại`, `Việc nghiên cứu tàn tích đã thúc đẩy khoa học phát triển đột phá.`);
}

function triggerAssassination() {
    let tribe = state.tribes[Math.floor(Math.random() * state.tribes.length)];
    if (!tribe || !tribe.leaderId) return;
    
    let leader = state.npcs.find(n => n.id === tribe.leaderId);
    if (!leader) return;
    
    createStoryEvent('Assassination', `Ám Sát Thủ Lĩnh`, `Thủ lĩnh ${leader.name} của ${tribe.name} đã bị ám sát trong đêm!`, 'MAJOR', [leader.id]);
    addLifeStory(leader.id, `Bị ám sát chết.`);
    leader.health = -100; // Kill them
    tribe.leaderId = null;
    
    // Trigger succession crisis
    triggerSuccessionCrisis(tribe);
}

function triggerSuccessionCrisis(tribe) {
    if (!tribe) return;
    createStoryEvent('Succession Crisis', `Khủng Hoảng Kế Vị ở ${tribe.name}`, `Cái chết của thủ lĩnh đã để lại khoảng trống quyền lực, các phe phái đang tranh giành quyết liệt.`, 'MAJOR', [], [], []);
    tribe.culturePoints = Math.max(0, tribe.culturePoints - 50); // Mất ổn định
}

function triggerGoldenChild() {
    let npc = getRandomNPC(n => n.age < 5);
    if (!npc) return;
    
    if (!npc.traits) npc.traits = [];
    npc.traits.push('genius');
    npc.intelligence = Math.min(100, npc.intelligence + 30);
    
    createStoryEvent('Golden Child', `Đứa Trẻ Thiên Tài`, `${npc.name} bộc lộ trí tuệ siêu phàm từ khi còn rất nhỏ, mang theo hy vọng của cả tộc.`, 'MINOR', [npc.id]);
    addLifeStory(npc.id, `Được sinh ra như một thiên tài xuất chúng.`);
}

function triggerTheHeretic() {
    if (state.religions.length === 0) return;
    let npc = getRandomNPC(n => n.age > 16 && n.religionId && n.faith < 30 && n.courage > 60);
    if (!npc) return;
    
    let rel = state.religions.find(r => r.id === npc.religionId);
    createStoryEvent('The Heretic', `Kẻ Dị Giáo ${npc.name}`, `${npc.name} công khai chống lại những giáo lý của ${rel ? rel.name : 'tôn giáo'}, kêu gọi mọi người thức tỉnh.`, 'MAJOR', [npc.id]);
    addLifeStory(npc.id, `Trở thành kẻ dị giáo chống lại tôn giáo truyền thống.`);
    npc.religionId = null; // Rời đạo
}

function triggerGreatMigration() {
    let tribe = state.tribes[Math.floor(Math.random() * state.tribes.length)];
    if (!tribe || tribe.population < 10) return;
    
    createStoryEvent('Great Migration', `Cuộc Đại Di Cư của ${tribe.name}`, `Do điều kiện sống khó khăn, một phần bộ lạc ${tribe.name} quyết định di cư tìm vùng đất hứa.`, 'MAJOR', [], [], []);
    
    // split tribe roughly
    let migrants = state.npcs.filter(n => n.tribeId === tribe.id).slice(0, 5);
    migrants.forEach(m => {
        m.tribeId = null;
        m.x = Math.floor(Math.random() * state.grid.length);
        m.y = Math.floor(Math.random() * state.grid[0].length);
        addLifeStory(m.id, `Tham gia cuộc đại di cư.`);
    });
}

// --- MAIN LOOP ---

export function updateStoryDirector() {
    // 1. Calculate Score
    state.worldDramaScore = calculateDramaScore();
    
    // 2. Chance to trigger event based on score
    let triggerChance = 0.1 + (state.worldDramaScore / 200); // 10% to 60% chance every 30 days
    
    if (Math.random() < triggerChance) {
        let events = [];
        
        // Pick event category based on score
        if (state.worldDramaScore < 20) {
            events = [triggerGoldenChild, triggerGreatExplorer, triggerLostCivilization];
        } else if (state.worldDramaScore < 60) {
            events = [triggerChosenOne, triggerForbiddenLove, triggerFalseProphet, triggerTheHeretic];
        } else {
            events = [triggerBetrayal, triggerHeroRises, triggerAssassination, triggerGreatMigration];
        }
        
        // Execute random event from pool
        let selectedEvent = events[Math.floor(Math.random() * events.length)];
        selectedEvent();
    }
}
