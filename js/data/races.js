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
        id: "human", name: "Nhân Loại", tier: TIER.EMPIRE, aiBehavior: "balanced_expansion",
        baseStats: { aggression: 5, diplomacy: 8, expansion: 8, cooperation: 7, fear: 3 },
        defaultRelations: { "dwarf": 100, "nomad": 100, "vintner": 100, "elf": 50, "dryad": 50, "centaur": 50, "kraken_elder": -100, "leviathan": -100, "lich": -100 },
        terrainAffinity: [TERRAIN.DAT], specialTraits: [], isBuildable: true, isBreedable: true
    },
    {
        id: "orc", name: "Quỷ Xanh (Orc)", tier: TIER.EMPIRE, aiBehavior: "warmonger_no_peace",
        baseStats: { aggression: 10, diplomacy: 1, expansion: 8, cooperation: 3, fear: 1 },
        defaultRelations: { "goblin": 50, "troll": 50, "elf": -100, "dryad": -100, "merfolk": -100, "human": 0 },
        terrainAffinity: [TERRAIN.DAT, TERRAIN.CAT, TERRAIN.NUI], specialTraits: ["savage", "hate_forest", "never_peace"], isBuildable: true, isBreedable: true
    },
    {
        id: "elf", name: "Tiên (Elf)", tier: TIER.EMPIRE, aiBehavior: "forest_protector",
        baseStats: { aggression: 2, diplomacy: 9, expansion: 4, cooperation: 8, fear: 3 },
        defaultRelations: { "dryad": 100, "centaur": 100, "human": 50, "merfolk": 50, "fairy": 50, "orc": -100, "goblin": -100, "lich": -100, "dragon": -100 },
        terrainAffinity: [TERRAIN.RUNG], specialTraits: ["forest_walker", "hate_deforestation"], isBuildable: true, isBreedable: true
    },
    {
        id: "dwarf", name: "Người Lùn", tier: TIER.EMPIRE, aiBehavior: "underground_miner",
        baseStats: { aggression: 4, diplomacy: 6, expansion: 5, cooperation: 8, fear: 2 },
        defaultRelations: { "human": 100, "golem": 100, "nomad": 50, "scribe": 50, "goblin": -100, "dragon_turtle": -100, "orc": -100 },
        terrainAffinity: [TERRAIN.NUI], specialTraits: ["miner"], isBuildable: true, isBreedable: true
    },
    {
        id: "halfling", name: "Người Bán Nhỏ", tier: TIER.EMPIRE, aiBehavior: "peaceful_farmer",
        baseStats: { aggression: 1, diplomacy: 9, expansion: 6, cooperation: 8, fear: 8 },
        defaultRelations: { "human": 50, "vintner": 50, "goblin": -100, "troll": -100 },
        terrainAffinity: [TERRAIN.DAT], specialTraits: ["stealth", "city_stealth"], isBuildable: true, isBreedable: true
    },
    {
        id: "centaur", name: "Nhân Mã", tier: TIER.EMPIRE, aiBehavior: "nomadic_archer",
        baseStats: { aggression: 6, diplomacy: 4, expansion: 8, cooperation: 5, fear: 2 },
        defaultRelations: { "elf": 50, "orc": -100 },
        terrainAffinity: [TERRAIN.DAT], specialTraits: ["fast"], isBuildable: false, isBreedable: true
    },
    {
        id: "draconian", name: "Rồng Người", tier: TIER.EMPIRE, aiBehavior: "vassal_lord",
        baseStats: { aggression: 8, diplomacy: 2, expansion: 3, cooperation: 4, fear: 1 },
        defaultRelations: { "dwarf": -100 },
        terrainAffinity: [TERRAIN.NUI], specialTraits: ["fire_resist"], isBuildable: true, isBreedable: true
    },
    {
        id: "lich", name: "Undead Cấp Cao", tier: TIER.EMPIRE, aiBehavior: "undead_commander",
        baseStats: { aggression: 9, diplomacy: 0, expansion: 7, cooperation: 0, fear: 0 },
        defaultRelations: { "celestial": -100, "elf": -100, "dryad": -100 },
        terrainAffinity: [TERRAIN.DAT, TERRAIN.DAM_LAY], specialTraits: ["undead", "undead_master"], isBuildable: true, isBreedable: false
    },

    // --- TIER 2: BỘ LẠC ---
    {
        id: "goblin", name: "Yêu Tinh", tier: TIER.TRIBE, aiBehavior: "thief_trapper",
        baseStats: { aggression: 8, diplomacy: 2, expansion: 6, cooperation: 4, fear: 6 },
        defaultRelations: { "orc": 50, "troll": 50, "dwarf": -100, "elf": -100, "halfling": -100 },
        terrainAffinity: [TERRAIN.DAM_LAY, TERRAIN.NUI], specialTraits: ["thief"], isBuildable: true, isBreedable: true
    },
    {
        id: "troll", name: "Troll", tier: TIER.TRIBE, aiBehavior: "bridge_toll",
        baseStats: { aggression: 9, diplomacy: 1, expansion: 4, cooperation: 2, fear: 2 },
        defaultRelations: { "goblin": 50, "orc": 50, "dwarf": -50, "elf": -50 },
        terrainAffinity: [TERRAIN.NUI, TERRAIN.DAM_LAY], specialTraits: ["regen"], isBuildable: true, isBreedable: true
    },
    {
        id: "minotaur", name: "Ngưu Ma", tier: TIER.TRIBE, aiBehavior: "wall_destroyer",
        baseStats: { aggression: 9, diplomacy: 1, expansion: 2, cooperation: 2, fear: 1 },
        defaultRelations: { "orc": 50, "human": -50, "elf": -50 },
        terrainAffinity: [TERRAIN.NUI], specialTraits: ["wall_breaker"], isBuildable: true, isBreedable: true
    },
    {
        id: "satyr", name: "Người Dê", tier: TIER.TRIBE, aiBehavior: "dancing_stunner",
        baseStats: { aggression: 3, diplomacy: 7, expansion: 3, cooperation: 6, fear: 5 },
        defaultRelations: { "elf": 50, "dryad": 50, "goblin": -50, "troll": -50 },
        terrainAffinity: [TERRAIN.RUNG], specialTraits: ["stun", "stun_attack"], isBuildable: false, isBreedable: true
    },
    {
        id: "dryad", name: "Tiên Cây", tier: TIER.TRIBE, aiBehavior: "forest_defender",
        baseStats: { aggression: 1, diplomacy: 8, expansion: 2, cooperation: 9, fear: 4 },
        defaultRelations: { "elf": 100, "orc": -100, "goblin": -100, "lich": -100 },
        terrainAffinity: [TERRAIN.RUNG], specialTraits: ["nature_control"], isBuildable: false, isBreedable: true
    },
    {
        id: "yeti", name: "Người Tuyết", tier: TIER.TRIBE, aiBehavior: "ice_power",
        baseStats: { aggression: 6, diplomacy: 2, expansion: 2, cooperation: 3, fear: 4 },
        defaultRelations: { "dragon": -100, "infernal": -100 },
        terrainAffinity: [TERRAIN.TUYET], specialTraits: ["ice_aura"], isBuildable: true, isBreedable: true
    },
    {
        id: "merfolk", name: "Người Cá", tier: TIER.TRIBE, aiBehavior: "ocean_lord",
        baseStats: { aggression: 3, diplomacy: 5, expansion: 3, cooperation: 6, fear: 4 },
        defaultRelations: { "elf": 50, "undine": 50, "kraken_elder": -100, "leviathan": -100, "orc": -100 },
        terrainAffinity: [TERRAIN.NUOC], specialTraits: ["water_breathing", "water_blockade"], isBuildable: false, isBreedable: true
    },
    {
        id: "fairy", name: "Tiên Nhỏ (Fairy)", tier: TIER.TRIBE, aiBehavior: "playful", 
        baseStats: { aggression: 1, diplomacy: 8, expansion: 3, cooperation: 8, fear: 5 }, 
        defaultRelations: { "elf": 50 }, terrainAffinity: [TERRAIN.RUNG], specialTraits: ["flying"], isBuildable: false, isBreedable: true 
    },

    // --- TIER 3: QUÁI VẬT ---
    { id: "dragon", name: "Rồng Lửa", tier: TIER.MONSTER, aiBehavior: "gold_hoarder", baseStats: { aggression: 10, diplomacy: 0, expansion: 1, cooperation: 0, fear: 1 }, defaultRelations: { "dwarf": -100, "phoenix": -100 }, terrainAffinity: [TERRAIN.NUI], specialTraits: ["fire_breath", "can_fly"], isBuildable: false, isBreedable: false },
    { id: "wyvern", name: "Wyvern", tier: TIER.MONSTER, aiBehavior: "lone_hunter", baseStats: { aggression: 8, diplomacy: 0, expansion: 2, cooperation: 0, fear: 4 }, defaultRelations: { "griffin": -50 }, terrainAffinity: [TERRAIN.NUI], specialTraits: ["poison_sting", "can_fly"], isBuildable: false, isBreedable: false },
    { id: "griffin", name: "Griffin", tier: TIER.MONSTER, aiBehavior: "mountain_guard", baseStats: { aggression: 6, diplomacy: 2, expansion: 2, cooperation: 1, fear: 3 }, defaultRelations: { "human": 50 }, terrainAffinity: [TERRAIN.NUI], specialTraits: ["can_fly"], isBuildable: false, isBreedable: true },
    { id: "phoenix", name: "Phượng Hoàng", tier: TIER.MONSTER, aiBehavior: "immortal", baseStats: { aggression: 2, diplomacy: 2, expansion: 1, cooperation: 2, fear: 0 }, defaultRelations: { "yeti": -100, "ice_elemental": -100 }, terrainAffinity: [TERRAIN.CAT], specialTraits: ["rebirth", "can_fly"], isBuildable: false, isBreedable: false },
    { id: "basilisk", name: "Rắn Vua", tier: TIER.MONSTER, aiBehavior: "petrifier", baseStats: { aggression: 9, diplomacy: 0, expansion: 1, cooperation: 0, fear: 2 }, defaultRelations: {}, terrainAffinity: [TERRAIN.DAM_LAY], specialTraits: ["petrify"], isBuildable: false, isBreedable: true },
    { id: "hydra", name: "Hydra", tier: TIER.MONSTER, aiBehavior: "multi_head_beast", baseStats: { aggression: 10, diplomacy: 0, expansion: 1, cooperation: 0, fear: 1 }, defaultRelations: { "dragon": -50 }, terrainAffinity: [TERRAIN.DAM_LAY], specialTraits: ["multi_head"], isBuildable: false, isBreedable: false },
    { id: "chimera", name: "Chimera", tier: TIER.MONSTER, aiBehavior: "chaotic", baseStats: { aggression: 10, diplomacy: 0, expansion: 2, cooperation: 0, fear: 2 }, defaultRelations: {}, terrainAffinity: [TERRAIN.CAT], specialTraits: ["multi_attack"], isBuildable: false, isBreedable: false },
    { id: "manticore", name: "Manticore", tier: TIER.MONSTER, aiBehavior: "poison_hunter", baseStats: { aggression: 9, diplomacy: 0, expansion: 2, cooperation: 0, fear: 3 }, defaultRelations: { "centaur": -50 }, terrainAffinity: [TERRAIN.CAT], specialTraits: ["poison_spike"], isBuildable: false, isBreedable: false },
    { id: "cockatrice", name: "Cockatrice", tier: TIER.MONSTER, aiBehavior: "paralyzer", baseStats: { aggression: 7, diplomacy: 0, expansion: 1, cooperation: 0, fear: 5 }, defaultRelations: {}, terrainAffinity: [TERRAIN.RUNG], specialTraits: ["paralyze"], isBuildable: false, isBreedable: true },
    { id: "dragon_turtle", name: "Rùa Rồng", tier: TIER.MONSTER, aiBehavior: "flooder", baseStats: { aggression: 4, diplomacy: 0, expansion: 1, cooperation: 0, fear: 1 }, defaultRelations: { "merfolk": -100 }, terrainAffinity: [TERRAIN.NUOC], specialTraits: ["flood", "high_defense"], isBuildable: false, isBreedable: false },
    { id: "sea_serpent", name: "Rắn Biển", tier: TIER.MONSTER, aiBehavior: "ship_destroyer", baseStats: { aggression: 8, diplomacy: 0, expansion: 2, cooperation: 0, fear: 2 }, defaultRelations: { "human": -100, "nomad": -100 }, terrainAffinity: [TERRAIN.NUOC], specialTraits: ["sink_ships"], isBuildable: false, isBreedable: true },
    { id: "hippocampus", name: "Ngựa Biển", tier: TIER.MONSTER, aiBehavior: "fast_mount", baseStats: { aggression: 1, diplomacy: 5, expansion: 2, cooperation: 8, fear: 6 }, defaultRelations: {}, terrainAffinity: [TERRAIN.NUOC], specialTraits: ["fast_swimmer"], isBuildable: false, isBreedable: true },
    { id: "golem", name: "Người Đá (Golem)", tier: TIER.MONSTER, aiBehavior: "guardian", baseStats: { aggression: 4, diplomacy: 1, expansion: 0, cooperation: 9, fear: 0 }, defaultRelations: { "dwarf": 100 }, terrainAffinity: [TERRAIN.NUI], specialTraits: ["high_defense", "construct"], isBuildable: true, isBreedable: false },
    { id: "automaton", name: "Người Máy", tier: TIER.MONSTER, aiBehavior: "logical", baseStats: { aggression: 3, diplomacy: 1, expansion: 1, cooperation: 8, fear: 0 }, defaultRelations: { "merchant_guild": -50 }, terrainAffinity: [TERRAIN.DAT], specialTraits: ["construct"], isBuildable: true, isBreedable: false },

    // --- TIER 4: TRUNG LẬP KINH TẾ ---
    { id: "nomad", name: "Lữ Khách", tier: TIER.NEUTRAL, aiBehavior: "trader_network", baseStats: { aggression: 0, diplomacy: 10, expansion: 4, cooperation: 9, fear: 9 }, defaultRelations: {}, terrainAffinity: [], specialTraits: ["trader", "beloved_by_all"], isBuildable: false, isBreedable: false },
    { id: "vintner", name: "Thợ Rượu", tier: TIER.NEUTRAL, aiBehavior: "wine_maker", baseStats: { aggression: 0, diplomacy: 9, expansion: 2, cooperation: 8, fear: 8 }, defaultRelations: { "elf": 50, "human": 50, "halfling": 50, "orc": -50, "goblin": -50 }, terrainAffinity: [TERRAIN.DAT], specialTraits: ["produce_wine"], isBuildable: false, isBreedable: false },
    { id: "scribe", name: "Học Giả", tier: TIER.NEUTRAL, aiBehavior: "historian", baseStats: { aggression: 0, diplomacy: 10, expansion: 1, cooperation: 7, fear: 9 }, defaultRelations: { "human": 50, "elf": 50, "orc": -50, "goblin": -50 }, terrainAffinity: [], specialTraits: ["boost_research"], isBuildable: false, isBreedable: false },
    { id: "merchant_guild", name: "Thương Hội", tier: TIER.NEUTRAL, aiBehavior: "war_profiteer", baseStats: { aggression: 1, diplomacy: 10, expansion: 5, cooperation: 8, fear: 5 }, defaultRelations: { "dwarf": -50, "automaton": -50 }, terrainAffinity: [], specialTraits: ["wealth"], isBuildable: true, isBreedable: false },
    { id: "obelisk", name: "Đá Thiêng", tier: TIER.NEUTRAL, aiBehavior: "disaster_ward", baseStats: { aggression: 0, diplomacy: 0, expansion: 0, cooperation: 10, fear: 0 }, defaultRelations: {}, terrainAffinity: [], specialTraits: ["ward_disaster"], isBuildable: false, isBreedable: false },
    { id: "sphinx", name: "Nhân Sư", tier: TIER.NEUTRAL, aiBehavior: "riddler", baseStats: { aggression: 2, diplomacy: 5, expansion: 0, cooperation: 2, fear: 0 }, defaultRelations: { "lich": -100, "skeleton": -100, "banshee": -100, "wight": -100, "ghost": -100 }, terrainAffinity: [TERRAIN.CAT], specialTraits: ["riddle"], isBuildable: false, isBreedable: false },

    // --- TIER 5: ĐỘNG VẬT ---
    { id: "cow", name: "Bò", tier: TIER.ANIMAL, aiBehavior: "passive_herd", baseStats: { aggression: 0, diplomacy: 0, expansion: 3, cooperation: 2, fear: 8 }, defaultRelations: {}, terrainAffinity: [TERRAIN.DAT], specialTraits: ["livestock"], isBuildable: false, isBreedable: true },
    { id: "sheep", name: "Cừu", tier: TIER.ANIMAL, aiBehavior: "passive_herd", baseStats: { aggression: 0, diplomacy: 0, expansion: 3, cooperation: 2, fear: 9 }, defaultRelations: {}, terrainAffinity: [TERRAIN.DAT], specialTraits: ["livestock"], isBuildable: false, isBreedable: true },
    { id: "goat", name: "Dê", tier: TIER.ANIMAL, aiBehavior: "passive_herd", baseStats: { aggression: 0, diplomacy: 0, expansion: 3, cooperation: 2, fear: 8 }, defaultRelations: {}, terrainAffinity: [TERRAIN.NUI], specialTraits: ["livestock"], isBuildable: false, isBreedable: true },
    { id: "pig", name: "Lợn", tier: TIER.ANIMAL, aiBehavior: "passive_herd", baseStats: { aggression: 0, diplomacy: 0, expansion: 3, cooperation: 2, fear: 7 }, defaultRelations: {}, terrainAffinity: [TERRAIN.DAT], specialTraits: ["livestock"], isBuildable: false, isBreedable: true },
    { id: "chicken", name: "Gà", tier: TIER.ANIMAL, aiBehavior: "passive_herd", baseStats: { aggression: 0, diplomacy: 0, expansion: 2, cooperation: 1, fear: 10 }, defaultRelations: {}, terrainAffinity: [TERRAIN.DAT], specialTraits: ["livestock"], isBuildable: false, isBreedable: true },
    { id: "duck", name: "Vịt", tier: TIER.ANIMAL, aiBehavior: "passive_herd", baseStats: { aggression: 0, diplomacy: 0, expansion: 2, cooperation: 1, fear: 9 }, defaultRelations: {}, terrainAffinity: [TERRAIN.NUOC], specialTraits: ["livestock"], isBuildable: false, isBreedable: true },
    { id: "deer", name: "Hươu", tier: TIER.ANIMAL, aiBehavior: "fleeing_prey", baseStats: { aggression: 0, diplomacy: 0, expansion: 4, cooperation: 2, fear: 9 }, defaultRelations: {}, terrainAffinity: [TERRAIN.RUNG], specialTraits: ["prey"], isBuildable: false, isBreedable: true },
    { id: "rabbit", name: "Thỏ", tier: TIER.ANIMAL, aiBehavior: "fleeing_prey", baseStats: { aggression: 0, diplomacy: 0, expansion: 5, cooperation: 1, fear: 10 }, defaultRelations: {}, terrainAffinity: [TERRAIN.DAT], specialTraits: ["prey", "fast_breed"], isBuildable: false, isBreedable: true },
    { id: "moose", name: "Nai Sừng Tấm", tier: TIER.ANIMAL, aiBehavior: "fleeing_prey", baseStats: { aggression: 0, diplomacy: 0, expansion: 3, cooperation: 1, fear: 5 }, defaultRelations: {}, terrainAffinity: [TERRAIN.TUYET], specialTraits: ["prey", "strong"], isBuildable: false, isBreedable: true },
    { id: "salmon", name: "Cá Hồi", tier: TIER.ANIMAL, aiBehavior: "fleeing_prey", baseStats: { aggression: 0, diplomacy: 0, expansion: 6, cooperation: 3, fear: 8 }, defaultRelations: {}, terrainAffinity: [TERRAIN.NUOC], specialTraits: ["prey"], isBuildable: false, isBreedable: true },
    { id: "giant_crab", name: "Cua Khổng Lồ", tier: TIER.ANIMAL, aiBehavior: "fleeing_prey", baseStats: { aggression: 0, diplomacy: 0, expansion: 2, cooperation: 1, fear: 3 }, defaultRelations: {}, terrainAffinity: [TERRAIN.NUOC, TERRAIN.DAT], specialTraits: ["armor", "prey"], isBuildable: false, isBreedable: true },
    { id: "horse", name: "Ngựa", tier: TIER.ANIMAL, aiBehavior: "tameable_mount", baseStats: { aggression: 0, diplomacy: 0, expansion: 5, cooperation: 4, fear: 7 }, defaultRelations: {}, terrainAffinity: [TERRAIN.DAT], specialTraits: ["mount"], isBuildable: false, isBreedable: true },
    { id: "donkey", name: "Lừa", tier: TIER.ANIMAL, aiBehavior: "tameable_mount", baseStats: { aggression: 0, diplomacy: 0, expansion: 3, cooperation: 4, fear: 6 }, defaultRelations: {}, terrainAffinity: [TERRAIN.DAT], specialTraits: ["mount", "carry_weight"], isBuildable: false, isBreedable: true },
    { id: "camel", name: "Lạc Đà", tier: TIER.ANIMAL, aiBehavior: "tameable_mount", baseStats: { aggression: 0, diplomacy: 0, expansion: 4, cooperation: 4, fear: 5 }, defaultRelations: {}, terrainAffinity: [TERRAIN.CAT], specialTraits: ["mount", "desert_walk"], isBuildable: false, isBreedable: true },
    { id: "elephant", name: "Voi", tier: TIER.ANIMAL, aiBehavior: "tameable_mount", baseStats: { aggression: 0, diplomacy: 0, expansion: 3, cooperation: 3, fear: 2 }, defaultRelations: {}, terrainAffinity: [TERRAIN.RUNG], specialTraits: ["mount", "wall_breaker"], isBuildable: false, isBreedable: true },

    // --- TIER 6: LINH HỒN & MA QUỶ ---
    { id: "banshee", name: "Banshee", tier: TIER.SPIRIT, aiBehavior: "fear_screamer", baseStats: { aggression: 8, diplomacy: 0, expansion: 1, cooperation: 0, fear: 0 }, defaultRelations: {}, terrainAffinity: [], specialTraits: ["undead", "fear_scream"], isBuildable: false, isBreedable: false },
    { id: "wight", name: "Wight", tier: TIER.SPIRIT, aiBehavior: "life_drainer", baseStats: { aggression: 9, diplomacy: 0, expansion: 1, cooperation: 0, fear: 0 }, defaultRelations: { "celestial": -100 }, terrainAffinity: [], specialTraits: ["undead", "life_drain"], isBuildable: false, isBreedable: false },
    { id: "ghost", name: "Ghost", tier: TIER.SPIRIT, aiBehavior: "haunter", baseStats: { aggression: 5, diplomacy: 0, expansion: 2, cooperation: 0, fear: 0 }, defaultRelations: {}, terrainAffinity: [], specialTraits: ["undead", "intangible"], isBuildable: false, isBreedable: false },
    { id: "skeleton", name: "Bộ Xương", tier: TIER.SPIRIT, aiBehavior: "mindless_undead", baseStats: { aggression: 10, diplomacy: 0, expansion: 2, cooperation: 5, fear: 0 }, defaultRelations: {}, terrainAffinity: [], specialTraits: ["undead"], isBuildable: false, isBreedable: false },
    { id: "elemental", name: "Elemental", tier: TIER.SPIRIT, aiBehavior: "nature_helper", baseStats: { aggression: 7, diplomacy: 0, expansion: 2, cooperation: 5, fear: 0 }, defaultRelations: {}, terrainAffinity: [], specialTraits: ["elemental_body"], isBuildable: false, isBreedable: false },
    { id: "undine", name: "Thủy Thần (Undine)", tier: TIER.SPIRIT, aiBehavior: "water_guardian", baseStats: { aggression: 2, diplomacy: 6, expansion: 2, cooperation: 6, fear: 2 }, defaultRelations: { "merfolk": 50 }, terrainAffinity: [TERRAIN.NUOC], specialTraits: ["water_magic"], isBuildable: false, isBreedable: false },
    { id: "celestial", name: "Thiên Thần", tier: TIER.SPIRIT, aiBehavior: "holy_crusader", baseStats: { aggression: 6, diplomacy: 5, expansion: 2, cooperation: 8, fear: 0 }, defaultRelations: { "lich": -100, "wight": -100, "death_knight": -100 }, terrainAffinity: [], specialTraits: ["holy_magic", "flying"], isBuildable: false, isBreedable: false },
    { id: "ice_elemental", name: "Tinh Linh Băng", tier: TIER.SPIRIT, aiBehavior: "nature_helper", baseStats: { aggression: 5, diplomacy: 0, expansion: 2, cooperation: 5, fear: 0 }, defaultRelations: { "phoenix": -100 }, terrainAffinity: [TERRAIN.TUYET], specialTraits: ["elemental_body"], isBuildable: false, isBreedable: false },

    // --- TIER 7: BOSS ---
    { id: "leviathan", name: "Leviathan", tier: TIER.BOSS, aiBehavior: "world_drowner", baseStats: { aggression: 10, diplomacy: 0, expansion: 5, cooperation: 0, fear: 0 }, defaultRelations: {}, terrainAffinity: [TERRAIN.NUOC], specialTraits: ["tsunami", "boss", "hate_all"], isBuildable: false, isBreedable: false },
    { id: "titan", name: "Titan Đá", tier: TIER.BOSS, aiBehavior: "earth_shaker", baseStats: { aggression: 10, diplomacy: 0, expansion: 3, cooperation: 0, fear: 0 }, defaultRelations: {}, terrainAffinity: [TERRAIN.NUI], specialTraits: ["earthquake", "boss"], isBuildable: false, isBreedable: false },
    { id: "kraken_elder", name: "Kraken Vĩ Đại", tier: TIER.BOSS, aiBehavior: "ship_devourer", baseStats: { aggression: 10, diplomacy: 0, expansion: 4, cooperation: 0, fear: 0 }, defaultRelations: { "merfolk": -100, "nomad": -100 }, terrainAffinity: [TERRAIN.NUOC], specialTraits: ["tentacles", "boss"], isBuildable: false, isBreedable: false },
    { id: "void_wyrm", name: "Thực Thể Hư Không", tier: TIER.BOSS, aiBehavior: "annihilator", baseStats: { aggression: 10, diplomacy: 0, expansion: 8, cooperation: 0, fear: 0 }, defaultRelations: {}, terrainAffinity: [], specialTraits: ["black_hole", "boss", "hate_all"], isBuildable: false, isBreedable: false },
    { id: "death_knight", name: "Kỵ Sĩ Tử Thần", tier: TIER.BOSS, aiBehavior: "corpse_raiser", baseStats: { aggression: 10, diplomacy: 0, expansion: 6, cooperation: 0, fear: 0 }, defaultRelations: { "celestial": -100, "elf": -100, "human": -100, "lich": 100 }, terrainAffinity: [], specialTraits: ["resurrect_dead", "boss"], isBuildable: false, isBreedable: false },
    { id: "troll_king", name: "Vua Troll", tier: TIER.BOSS, aiBehavior: "hyper_regenerator", baseStats: { aggression: 10, diplomacy: 0, expansion: 4, cooperation: 5, fear: 0 }, defaultRelations: { "dwarf": -50, "halfling": -50 }, terrainAffinity: [TERRAIN.NUI], specialTraits: ["hyper_regen", "boss"], isBuildable: false, isBreedable: false },
    { id: "dire_bear", name: "Gấu Ma", tier: TIER.BOSS, aiBehavior: "bear_summoner", baseStats: { aggression: 10, diplomacy: 0, expansion: 3, cooperation: 0, fear: 0 }, defaultRelations: {}, terrainAffinity: [TERRAIN.RUNG], specialTraits: ["summon_bears", "boss"], isBuildable: false, isBreedable: false },
    { id: "alpha_wolf", name: "Sói Chúa", tier: TIER.BOSS, aiBehavior: "pack_buffer", baseStats: { aggression: 10, diplomacy: 0, expansion: 5, cooperation: 8, fear: 0 }, defaultRelations: { "orc": -50, "human": -50 }, terrainAffinity: [TERRAIN.RUNG], specialTraits: ["pack_buff", "boss"], isBuildable: false, isBreedable: false },
    { id: "fae_king", name: "Vua Tiên", tier: TIER.BOSS, aiBehavior: "forest_avenger", baseStats: { aggression: 10, diplomacy: 0, expansion: 8, cooperation: 0, fear: 0 }, defaultRelations: { "orc": -100, "goblin": -100 }, terrainAffinity: [TERRAIN.RUNG], specialTraits: ["magic_storm", "boss"], isBuildable: false, isBreedable: false }
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

// Post process relationships
ENTITY_DATA.forEach(a => {
    if (a.defaultRelations) {
        Object.keys(a.defaultRelations).forEach(bId => {
            if (RELATION_MATRIX[a.id] && RELATION_MATRIX[a.id][bId] !== undefined) {
                RELATION_MATRIX[a.id][bId] = a.defaultRelations[bId];
                if (RELATION_MATRIX[bId] && RELATION_MATRIX[bId][a.id] === 0) {
                    RELATION_MATRIX[bId][a.id] = a.defaultRelations[bId]; // symmetric by default if not previously set
                }
            }
        });
    }
});

// Special traits relationships logic (e.g. Hate all, Undead vs Living)
ENTITY_DATA.forEach(a => {
    // Beloved by all (Nomad)
    if (a.specialTraits && a.specialTraits.includes("beloved_by_all")) {
        ENTITY_DATA.forEach(b => {
            if (a.id !== b.id && (!b.specialTraits || !b.specialTraits.includes("hate_all"))) {
                RELATION_MATRIX[a.id][b.id] = 100;
                RELATION_MATRIX[b.id][a.id] = 100;
            }
        });
    }
    
    // Hate all (Kraken, Leviathan, Void Wyrm)
    if (a.specialTraits && a.specialTraits.includes("hate_all")) {
        ENTITY_DATA.forEach(b => {
            if (a.id !== b.id) {
                RELATION_MATRIX[a.id][b.id] = -100;
                RELATION_MATRIX[b.id][a.id] = -100;
            }
        });
    }

    // Undead vs Living
    if (a.specialTraits && a.specialTraits.includes("undead")) {
        ENTITY_DATA.forEach(b => {
            if (a.id !== b.id && b.tier !== TIER.BOSS && b.tier !== TIER.SPIRIT) { // Living entities
                if (!b.specialTraits || !b.specialTraits.includes("undead")) {
                    RELATION_MATRIX[a.id][b.id] = -100;
                    RELATION_MATRIX[b.id][a.id] = -100;
                }
            }
        });
    }
});
