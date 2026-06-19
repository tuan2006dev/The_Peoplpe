import { TERRAIN } from '../config.js';

export const TIER = {
    EMPIRE: 1,
    TRIBE: 2,
    MONSTER: 3,
    NEUTRAL: 4,
    ANIMAL: 5,
    SPIRIT: 6,
    BOSS: 7
};

export const ENTITY_DATA = [
    // --- TIER 1: ĐẾ CHẾ ---
    {
        id: "human", name: "Nhân Loại", tier: TIER.EMPIRE,
        baseStats: { aggression: 5, diplomacy: 8, expansion: 8, cooperation: 7, fear: 3 },
        defaultRelations: { "dwarf": 80, "elf": 30, "orc": -80, "goblin": -60 },
        terrainAffinity: [TERRAIN.DAT], specialTraits: [], isBuildable: true, isBreedable: true
    },
    {
        id: "orc", name: "Quỷ Xanh (Orc)", tier: TIER.EMPIRE,
        baseStats: { aggression: 10, diplomacy: 1, expansion: 8, cooperation: 3, fear: 1 },
        defaultRelations: { "goblin": 60, "troll": 50, "human": -80, "elf": -100, "dwarf": -80 },
        terrainAffinity: [TERRAIN.DAT, TERRAIN.CAT, TERRAIN.NUI], specialTraits: ["savage"], isBuildable: true, isBreedable: true
    },
    {
        id: "elf", name: "Tiên (Elf)", tier: TIER.EMPIRE,
        baseStats: { aggression: 2, diplomacy: 9, expansion: 4, cooperation: 8, fear: 3 },
        defaultRelations: { "dryad": 100, "human": 30, "orc": -100, "goblin": -80 },
        terrainAffinity: [TERRAIN.RUNG], specialTraits: ["forest_walker"], isBuildable: true, isBreedable: true
    },
    {
        id: "dwarf", name: "Người Lùn", tier: TIER.EMPIRE,
        baseStats: { aggression: 4, diplomacy: 6, expansion: 5, cooperation: 8, fear: 2 },
        defaultRelations: { "human": 80, "orc": -80, "goblin": -100 },
        terrainAffinity: [TERRAIN.NUI], specialTraits: ["miner"], isBuildable: true, isBreedable: true
    },
    {
        id: "halfling", name: "Người Bán Nhỏ", tier: TIER.EMPIRE,
        baseStats: { aggression: 1, diplomacy: 9, expansion: 6, cooperation: 8, fear: 8 },
        defaultRelations: { "human": 50, "goblin": -100, "troll": -100 },
        terrainAffinity: [TERRAIN.DAT], specialTraits: ["stealth"], isBuildable: true, isBreedable: true
    },
    {
        id: "centaur", name: "Nhân Mã", tier: TIER.EMPIRE,
        baseStats: { aggression: 6, diplomacy: 4, expansion: 8, cooperation: 5, fear: 2 },
        defaultRelations: { "elf": 50, "orc": -100 },
        terrainAffinity: [TERRAIN.DAT], specialTraits: ["fast"], isBuildable: false, isBreedable: true
    },
    {
        id: "draconian", name: "Rồng Người", tier: TIER.EMPIRE,
        baseStats: { aggression: 8, diplomacy: 2, expansion: 3, cooperation: 4, fear: 1 },
        defaultRelations: { "dwarf": -100 },
        terrainAffinity: [TERRAIN.NUI], specialTraits: ["fire_resist"], isBuildable: true, isBreedable: true
    },
    {
        id: "lich", name: "Undead Cấp Cao", tier: TIER.EMPIRE,
        baseStats: { aggression: 9, diplomacy: 0, expansion: 7, cooperation: 0, fear: 0 },
        defaultRelations: { "elf": -100, "dryad": -100, "human": -100 },
        terrainAffinity: [TERRAIN.DAT, TERRAIN.DAM_LAY], specialTraits: ["undead"], isBuildable: true, isBreedable: false
    },

    // --- TIER 2: BỘ LẠC ---
    {
        id: "goblin", name: "Yêu Tinh", tier: TIER.TRIBE,
        baseStats: { aggression: 8, diplomacy: 2, expansion: 6, cooperation: 4, fear: 6 },
        defaultRelations: { "orc": 60, "troll": 50, "dwarf": -100, "elf": -80 },
        terrainAffinity: [TERRAIN.DAM_LAY, TERRAIN.NUI], specialTraits: ["thief"], isBuildable: true, isBreedable: true
    },
    {
        id: "troll", name: "Troll", tier: TIER.TRIBE,
        baseStats: { aggression: 9, diplomacy: 1, expansion: 4, cooperation: 2, fear: 2 },
        defaultRelations: { "goblin": 50, "orc": 50, "dwarf": -80 },
        terrainAffinity: [TERRAIN.NUI, TERRAIN.DAM_LAY], specialTraits: ["regen"], isBuildable: true, isBreedable: true
    },
    {
        id: "minotaur", name: "Ngưu Ma", tier: TIER.TRIBE,
        baseStats: { aggression: 9, diplomacy: 1, expansion: 2, cooperation: 2, fear: 1 },
        defaultRelations: { "orc": 50, "human": -60 },
        terrainAffinity: [TERRAIN.NUI], specialTraits: ["wall_breaker"], isBuildable: true, isBreedable: true
    },
    {
        id: "satyr", name: "Người Dê", tier: TIER.TRIBE,
        baseStats: { aggression: 3, diplomacy: 7, expansion: 3, cooperation: 6, fear: 5 },
        defaultRelations: { "elf": 80, "dryad": 80, "goblin": -80 },
        terrainAffinity: [TERRAIN.RUNG], specialTraits: ["stun"], isBuildable: false, isBreedable: true
    },
    {
        id: "dryad", name: "Tiên Cây", tier: TIER.TRIBE,
        baseStats: { aggression: 1, diplomacy: 8, expansion: 2, cooperation: 9, fear: 4 },
        defaultRelations: { "elf": 100, "orc": -100, "lich": -100 },
        terrainAffinity: [TERRAIN.RUNG], specialTraits: ["nature_control"], isBuildable: false, isBreedable: true
    },
    {
        id: "yeti", name: "Người Tuyết", tier: TIER.TRIBE,
        baseStats: { aggression: 6, diplomacy: 2, expansion: 2, cooperation: 3, fear: 4 },
        defaultRelations: {},
        terrainAffinity: [TERRAIN.TUYET], specialTraits: ["ice_aura"], isBuildable: true, isBreedable: true
    },
    {
        id: "merfolk", name: "Người Cá", tier: TIER.TRIBE,
        baseStats: { aggression: 3, diplomacy: 5, expansion: 3, cooperation: 6, fear: 4 },
        defaultRelations: { "elf": 50, "orc": -100 },
        terrainAffinity: [TERRAIN.NUOC], specialTraits: ["water_breathing"], isBuildable: false, isBreedable: true
    },

    // --- TIER 3: QUÁI VẬT ---
    { id: "dragon", name: "Rồng Lửa", tier: TIER.MONSTER, baseStats: { aggression: 10, diplomacy: 0, expansion: 1, cooperation: 0, fear: 1 }, defaultRelations: { "dwarf": -100 }, terrainAffinity: [TERRAIN.NUI], specialTraits: ["fire_breath", "can_fly"], isBuildable: false, isBreedable: false },
    { id: "wyvern", name: "Wyvern", tier: TIER.MONSTER, baseStats: { aggression: 8, diplomacy: 0, expansion: 2, cooperation: 0, fear: 4 }, defaultRelations: {}, terrainAffinity: [TERRAIN.NUI], specialTraits: ["poison_sting", "can_fly"], isBuildable: false, isBreedable: false },
    { id: "griffin", name: "Griffin", tier: TIER.MONSTER, baseStats: { aggression: 6, diplomacy: 2, expansion: 2, cooperation: 1, fear: 3 }, defaultRelations: { "human": 20 }, terrainAffinity: [TERRAIN.NUI], specialTraits: ["can_fly"], isBuildable: false, isBreedable: true },
    { id: "phoenix", name: "Phượng Hoàng", tier: TIER.MONSTER, baseStats: { aggression: 2, diplomacy: 2, expansion: 1, cooperation: 2, fear: 0 }, defaultRelations: { "yeti": -100 }, terrainAffinity: [TERRAIN.CAT], specialTraits: ["rebirth", "can_fly"], isBuildable: false, isBreedable: false },
    { id: "basilisk", name: "Rắn Vua", tier: TIER.MONSTER, baseStats: { aggression: 9, diplomacy: 0, expansion: 1, cooperation: 0, fear: 2 }, defaultRelations: {}, terrainAffinity: [TERRAIN.DAM_LAY], specialTraits: ["petrify"], isBuildable: false, isBreedable: true },
    { id: "hydra", name: "Hydra", tier: TIER.MONSTER, baseStats: { aggression: 10, diplomacy: 0, expansion: 1, cooperation: 0, fear: 1 }, defaultRelations: { "dragon": -80 }, terrainAffinity: [TERRAIN.DAM_LAY], specialTraits: ["multi_head"], isBuildable: false, isBreedable: false },
    { id: "chimera", name: "Chimera", tier: TIER.MONSTER, baseStats: { aggression: 10, diplomacy: 0, expansion: 2, cooperation: 0, fear: 2 }, defaultRelations: {}, terrainAffinity: [TERRAIN.CAT], specialTraits: ["multi_attack"], isBuildable: false, isBreedable: false },
    { id: "manticore", name: "Manticore", tier: TIER.MONSTER, baseStats: { aggression: 9, diplomacy: 0, expansion: 2, cooperation: 0, fear: 3 }, defaultRelations: { "centaur": -80 }, terrainAffinity: [TERRAIN.CAT], specialTraits: ["poison_spike"], isBuildable: false, isBreedable: false },
    { id: "cockatrice", name: "Cockatrice", tier: TIER.MONSTER, baseStats: { aggression: 7, diplomacy: 0, expansion: 1, cooperation: 0, fear: 5 }, defaultRelations: {}, terrainAffinity: [TERRAIN.RUNG], specialTraits: ["paralyze"], isBuildable: false, isBreedable: true },
    { id: "dragon_turtle", name: "Rùa Rồng", tier: TIER.MONSTER, baseStats: { aggression: 4, diplomacy: 0, expansion: 1, cooperation: 0, fear: 1 }, defaultRelations: { "merfolk": -100 }, terrainAffinity: [TERRAIN.NUOC], specialTraits: ["flood", "high_defense"], isBuildable: false, isBreedable: false },
    { id: "sea_serpent", name: "Rắn Biển", tier: TIER.MONSTER, baseStats: { aggression: 8, diplomacy: 0, expansion: 2, cooperation: 0, fear: 2 }, defaultRelations: { "human": -80 }, terrainAffinity: [TERRAIN.NUOC], specialTraits: ["sink_ships"], isBuildable: false, isBreedable: true },
    { id: "hippocampus", name: "Ngựa Biển", tier: TIER.MONSTER, baseStats: { aggression: 1, diplomacy: 5, expansion: 2, cooperation: 8, fear: 6 }, defaultRelations: {}, terrainAffinity: [TERRAIN.NUOC], specialTraits: ["fast_swimmer"], isBuildable: false, isBreedable: true },

    // --- TIER 4: TRUNG LẬP KINH TẾ ---
    { id: "nomad", name: "Lữ Khách", tier: TIER.NEUTRAL, baseStats: { aggression: 0, diplomacy: 10, expansion: 4, cooperation: 9, fear: 9 }, defaultRelations: {}, terrainAffinity: [], specialTraits: ["trader"], isBuildable: false, isBreedable: false },
    { id: "vintner", name: "Thợ Rượu", tier: TIER.NEUTRAL, baseStats: { aggression: 0, diplomacy: 9, expansion: 2, cooperation: 8, fear: 8 }, defaultRelations: {}, terrainAffinity: [TERRAIN.DAT], specialTraits: ["produce_wine"], isBuildable: false, isBreedable: false },
    { id: "scribe", name: "Học Giả", tier: TIER.NEUTRAL, baseStats: { aggression: 0, diplomacy: 10, expansion: 1, cooperation: 7, fear: 9 }, defaultRelations: {}, terrainAffinity: [], specialTraits: ["boost_research"], isBuildable: false, isBreedable: false },
    { id: "merchant_guild", name: "Thương Hội", tier: TIER.NEUTRAL, baseStats: { aggression: 1, diplomacy: 10, expansion: 5, cooperation: 8, fear: 5 }, defaultRelations: {}, terrainAffinity: [], specialTraits: ["wealth"], isBuildable: true, isBreedable: false },
    { id: "obelisk", name: "Đá Thiêng", tier: TIER.NEUTRAL, baseStats: { aggression: 0, diplomacy: 0, expansion: 0, cooperation: 10, fear: 0 }, defaultRelations: {}, terrainAffinity: [], specialTraits: ["ward_disaster"], isBuildable: false, isBreedable: false },
    { id: "sphinx", name: "Nhân Sư", tier: TIER.NEUTRAL, baseStats: { aggression: 2, diplomacy: 5, expansion: 0, cooperation: 2, fear: 0 }, defaultRelations: {}, terrainAffinity: [TERRAIN.CAT], specialTraits: ["riddle"], isBuildable: false, isBreedable: false },

    // --- TIER 5: ĐỘNG VẬT ---
    { id: "cow", name: "Bò", tier: TIER.ANIMAL, baseStats: { aggression: 1, diplomacy: 0, expansion: 3, cooperation: 2, fear: 8 }, defaultRelations: {}, terrainAffinity: [TERRAIN.DAT], specialTraits: ["livestock"], isBuildable: false, isBreedable: true },
    { id: "sheep", name: "Cừu", tier: TIER.ANIMAL, baseStats: { aggression: 0, diplomacy: 0, expansion: 3, cooperation: 2, fear: 9 }, defaultRelations: {}, terrainAffinity: [TERRAIN.DAT], specialTraits: ["livestock"], isBuildable: false, isBreedable: true },
    { id: "goat", name: "Dê", tier: TIER.ANIMAL, baseStats: { aggression: 2, diplomacy: 0, expansion: 3, cooperation: 2, fear: 8 }, defaultRelations: {}, terrainAffinity: [TERRAIN.NUI], specialTraits: ["livestock"], isBuildable: false, isBreedable: true },
    { id: "pig", name: "Lợn", tier: TIER.ANIMAL, baseStats: { aggression: 2, diplomacy: 0, expansion: 3, cooperation: 2, fear: 7 }, defaultRelations: {}, terrainAffinity: [TERRAIN.DAT], specialTraits: ["livestock"], isBuildable: false, isBreedable: true },
    { id: "chicken", name: "Gà", tier: TIER.ANIMAL, baseStats: { aggression: 0, diplomacy: 0, expansion: 2, cooperation: 1, fear: 10 }, defaultRelations: {}, terrainAffinity: [TERRAIN.DAT], specialTraits: ["livestock"], isBuildable: false, isBreedable: true },
    { id: "duck", name: "Vịt", tier: TIER.ANIMAL, baseStats: { aggression: 0, diplomacy: 0, expansion: 2, cooperation: 1, fear: 9 }, defaultRelations: {}, terrainAffinity: [TERRAIN.NUOC], specialTraits: ["livestock"], isBuildable: false, isBreedable: true },
    { id: "deer", name: "Hươu", tier: TIER.ANIMAL, baseStats: { aggression: 1, diplomacy: 0, expansion: 4, cooperation: 2, fear: 9 }, defaultRelations: {}, terrainAffinity: [TERRAIN.RUNG], specialTraits: ["prey"], isBuildable: false, isBreedable: true },
    { id: "rabbit", name: "Thỏ", tier: TIER.ANIMAL, baseStats: { aggression: 0, diplomacy: 0, expansion: 5, cooperation: 1, fear: 10 }, defaultRelations: {}, terrainAffinity: [TERRAIN.DAT], specialTraits: ["prey", "fast_breed"], isBuildable: false, isBreedable: true },
    { id: "moose", name: "Nai Sừng Tấm", tier: TIER.ANIMAL, baseStats: { aggression: 4, diplomacy: 0, expansion: 3, cooperation: 1, fear: 5 }, defaultRelations: {}, terrainAffinity: [TERRAIN.TUYET], specialTraits: ["prey", "strong"], isBuildable: false, isBreedable: true },
    { id: "salmon", name: "Cá Hồi", tier: TIER.ANIMAL, baseStats: { aggression: 0, diplomacy: 0, expansion: 6, cooperation: 3, fear: 8 }, defaultRelations: {}, terrainAffinity: [TERRAIN.NUOC], specialTraits: ["prey"], isBuildable: false, isBreedable: true },
    { id: "giant_crab", name: "Cua Khổng Lồ", tier: TIER.ANIMAL, baseStats: { aggression: 5, diplomacy: 0, expansion: 2, cooperation: 1, fear: 3 }, defaultRelations: {}, terrainAffinity: [TERRAIN.NUOC, TERRAIN.DAT], specialTraits: ["armor"], isBuildable: false, isBreedable: true },
    { id: "horse", name: "Ngựa", tier: TIER.ANIMAL, baseStats: { aggression: 1, diplomacy: 0, expansion: 5, cooperation: 4, fear: 7 }, defaultRelations: {}, terrainAffinity: [TERRAIN.DAT], specialTraits: ["mount"], isBuildable: false, isBreedable: true },
    { id: "donkey", name: "Lừa", tier: TIER.ANIMAL, baseStats: { aggression: 2, diplomacy: 0, expansion: 3, cooperation: 4, fear: 6 }, defaultRelations: {}, terrainAffinity: [TERRAIN.DAT], specialTraits: ["mount", "carry_weight"], isBuildable: false, isBreedable: true },
    { id: "camel", name: "Lạc Đà", tier: TIER.ANIMAL, baseStats: { aggression: 2, diplomacy: 0, expansion: 4, cooperation: 4, fear: 5 }, defaultRelations: {}, terrainAffinity: [TERRAIN.CAT], specialTraits: ["mount", "desert_walk"], isBuildable: false, isBreedable: true },
    { id: "elephant", name: "Voi", tier: TIER.ANIMAL, baseStats: { aggression: 5, diplomacy: 0, expansion: 3, cooperation: 3, fear: 2 }, defaultRelations: {}, terrainAffinity: [TERRAIN.RUNG], specialTraits: ["mount", "wall_breaker"], isBuildable: false, isBreedable: true },

    // --- TIER 6: LINH HỒN & MA QUỶ ---
    { id: "banshee", name: "Banshee", tier: TIER.SPIRIT, baseStats: { aggression: 8, diplomacy: 0, expansion: 1, cooperation: 0, fear: 0 }, defaultRelations: {}, terrainAffinity: [], specialTraits: ["undead", "fear_scream"], isBuildable: false, isBreedable: false },
    { id: "wight", name: "Wight", tier: TIER.SPIRIT, baseStats: { aggression: 9, diplomacy: 0, expansion: 1, cooperation: 0, fear: 0 }, defaultRelations: {}, terrainAffinity: [], specialTraits: ["undead", "life_drain"], isBuildable: false, isBreedable: false },
    { id: "ghost", name: "Ghost", tier: TIER.SPIRIT, baseStats: { aggression: 5, diplomacy: 0, expansion: 2, cooperation: 0, fear: 0 }, defaultRelations: {}, terrainAffinity: [], specialTraits: ["undead", "intangible"], isBuildable: false, isBreedable: false },
    { id: "skeleton", name: "Bộ Xương", tier: TIER.SPIRIT, baseStats: { aggression: 10, diplomacy: 0, expansion: 2, cooperation: 5, fear: 0 }, defaultRelations: {}, terrainAffinity: [], specialTraits: ["undead"], isBuildable: false, isBreedable: false },
    { id: "elemental", name: "Elemental", tier: TIER.SPIRIT, baseStats: { aggression: 7, diplomacy: 0, expansion: 2, cooperation: 5, fear: 0 }, defaultRelations: {}, terrainAffinity: [], specialTraits: ["elemental_body"], isBuildable: false, isBreedable: false },

    // --- TIER 7: BOSS ---
    { id: "leviathan", name: "Leviathan", tier: TIER.BOSS, baseStats: { aggression: 10, diplomacy: 0, expansion: 5, cooperation: 0, fear: 0 }, defaultRelations: {}, terrainAffinity: [TERRAIN.NUOC], specialTraits: ["tsunami", "boss"], isBuildable: false, isBreedable: false },
    { id: "titan", name: "Titan Đá", tier: TIER.BOSS, baseStats: { aggression: 10, diplomacy: 0, expansion: 3, cooperation: 0, fear: 0 }, defaultRelations: {}, terrainAffinity: [TERRAIN.NUI], specialTraits: ["earthquake", "boss"], isBuildable: false, isBreedable: false },
    { id: "kraken_elder", name: "Kraken Vĩ Đại", tier: TIER.BOSS, baseStats: { aggression: 10, diplomacy: 0, expansion: 4, cooperation: 0, fear: 0 }, defaultRelations: {}, terrainAffinity: [TERRAIN.NUOC], specialTraits: ["tentacles", "boss"], isBuildable: false, isBreedable: false },
    { id: "void_wyrm", name: "Thực Thể Hư Không", tier: TIER.BOSS, baseStats: { aggression: 10, diplomacy: 0, expansion: 8, cooperation: 0, fear: 0 }, defaultRelations: {}, terrainAffinity: [], specialTraits: ["black_hole", "boss"], isBuildable: false, isBreedable: false },
    { id: "death_knight", name: "Kỵ Sĩ Tử Thần", tier: TIER.BOSS, baseStats: { aggression: 10, diplomacy: 0, expansion: 6, cooperation: 0, fear: 0 }, defaultRelations: {}, terrainAffinity: [], specialTraits: ["resurrect_dead", "boss"], isBuildable: false, isBreedable: false },
    { id: "troll_king", name: "Vua Troll", tier: TIER.BOSS, baseStats: { aggression: 10, diplomacy: 0, expansion: 4, cooperation: 5, fear: 0 }, defaultRelations: {}, terrainAffinity: [TERRAIN.NUI], specialTraits: ["hyper_regen", "boss"], isBuildable: false, isBreedable: false },
    { id: "dire_bear", name: "Gấu Ma", tier: TIER.BOSS, baseStats: { aggression: 10, diplomacy: 0, expansion: 3, cooperation: 0, fear: 0 }, defaultRelations: {}, terrainAffinity: [TERRAIN.RUNG], specialTraits: ["summon_bears", "boss"], isBuildable: false, isBreedable: false },
    { id: "alpha_wolf", name: "Sói Chúa", tier: TIER.BOSS, baseStats: { aggression: 10, diplomacy: 0, expansion: 5, cooperation: 8, fear: 0 }, defaultRelations: {}, terrainAffinity: [TERRAIN.RUNG], specialTraits: ["pack_buff", "boss"], isBuildable: false, isBreedable: false },
    { id: "fae_king", name: "Vua Tiên", tier: TIER.BOSS, baseStats: { aggression: 10, diplomacy: 0, expansion: 8, cooperation: 0, fear: 0 }, defaultRelations: {}, terrainAffinity: [TERRAIN.RUNG], specialTraits: ["magic_storm", "boss"], isBuildable: false, isBreedable: false }
];

export const RELATION_MATRIX = {};
// Build the matrix bidirectionally
ENTITY_DATA.forEach(a => {
    RELATION_MATRIX[a.id] = {};
    ENTITY_DATA.forEach(b => {
        if (a.id === b.id) {
            RELATION_MATRIX[a.id][b.id] = 100;
        } else {
            RELATION_MATRIX[a.id][b.id] = 0; // default
        }
    });
});

ENTITY_DATA.forEach(a => {
    if (a.defaultRelations) {
        Object.keys(a.defaultRelations).forEach(bId => {
            if (RELATION_MATRIX[a.id] && RELATION_MATRIX[a.id][bId] !== undefined) {
                RELATION_MATRIX[a.id][bId] = a.defaultRelations[bId];
                if (RELATION_MATRIX[bId] && RELATION_MATRIX[bId][a.id] === 0) {
                    RELATION_MATRIX[bId][a.id] = a.defaultRelations[bId]; // symmetric by default
                }
            }
        });
    }
});
