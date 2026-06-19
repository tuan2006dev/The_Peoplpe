export const STATES = {
    IDLE: 'idle', WANDERING: 'wandering', SEEKING_FOOD: 'seeking_food', EATING: 'eating',
    RESTING: 'resting', SCARED: 'scared', SEEKING_WOOD: 'seeking_wood', CHOPPING_WOOD: 'chopping_wood',
    BUILDING_HOME: 'building_home', SEEKING_PARTNER: 'seeking_partner', CARING_FAMILY: 'caring_family',
    GATHERING_FOR_TRIBE: 'gathering_for_tribe', PRAYING: 'praying', PREACHING: 'preaching', COMMANDED: 'commanded',
    ATTACKING: 'attacking', DEFENDING: 'defending', FLEEING: 'fleeing', TRAINING: 'training', WORKING_JOB: 'working_job',
    FLEEING_DISASTER: 'fleeing_disaster', REBUILDING: 'rebuilding', TREATING_SICK: 'treating_sick', EVACUATING: 'evacuating', GATHERING_AFTER_DISASTER: 'gathering_after_disaster'
};
export const STATES_TEXT = {
    [STATES.IDLE]: 'Đứng chơi', [STATES.WANDERING]: 'Đi lang thang', [STATES.SEEKING_FOOD]: 'Tìm thức ăn', [STATES.EATING]: 'Đang ăn',
    [STATES.RESTING]: 'Đang nghỉ ngơi', [STATES.SCARED]: 'Sợ hãi', [STATES.SEEKING_WOOD]: 'Tìm gỗ', [STATES.CHOPPING_WOOD]: 'Chặt cây',
    [STATES.BUILDING_HOME]: 'Xây nhà', [STATES.SEEKING_PARTNER]: 'Tìm bạn đời', [STATES.CARING_FAMILY]: 'Chăm sóc gia đình',
    [STATES.GATHERING_FOR_TRIBE]: 'Kiếm tài nguyên', [STATES.PRAYING]: 'Cầu nguyện', [STATES.ATTACKING]: 'Tấn công',
    [STATES.DEFENDING]: 'Phòng thủ', [STATES.FLEEING]: 'Bỏ chạy', [STATES.WORKING_JOB]: 'Đang làm việc', [STATES.FLEEING_DISASTER]: 'Chạy nạn',
    [STATES.REBUILDING]: 'Sửa nhà', [STATES.TREATING_SICK]: 'Chữa bệnh'
};
export const RELATION = { SINGLE: 'Độc thân', SEEKING: 'Tìm bạn đời', PARTNERED: 'Có đôi', FAMILY: 'Có gia đình' };
export const BIOMES = [
    "Đồng bằng", "Rừng già", "Sa mạc", "Núi đá", "Băng nguyên", 
    "Đầm lầy", "Núi lửa", "Đất hoang", "Đồi cỏ", 
    "Bãi biển", "Rừng ngập mặn", 
    "Vùng nước nông", "Rạn san hô", "Vùng nước sâu", "Vực thẳm"
];

export const BIOME_COLORS = { 
    "Đồng bằng": "#6bc547", "Rừng già": "#1e6823", "Sa mạc": "#f1c40f", 
    "Núi đá": "#7f8c8d", "Băng nguyên": "#ecf0f1", "Đầm lầy": "#4a5d23", 
    "Núi lửa": "#c0392b", "Đất hoang": "#555555", "Đồi cỏ": "#8cbd4d", 
    "Bãi biển": "#f3e5ab", "Rừng ngập mặn": "#2d4c1e", 
    "Vùng nước nông": "#3498db", "Rạn san hô": "#1abc9c", 
    "Vùng nước sâu": "#2980b9", "Vực thẳm": "#1a252f" 
};

export const BIOME_EFFECTS = {
    "Đồng bằng": { speedMod: 1.0, damageBuff: 0, preferredTribes: ['human', 'halfling', 'centaur'] },
    "Rừng già": { speedMod: 0.7, damageBuff: 0.2, preferredTribes: ['elf', 'dryad', 'fairy', 'satyr'] },
    "Sa mạc": { speedMod: 0.6, damageBuff: 0.2, preferredTribes: ['orc', 'goblin'] },
    "Núi đá": { speedMod: 0.6, damageBuff: 0.2, preferredTribes: ['dwarf', 'troll', 'giant', 'griffin', 'yeti'] },
    "Băng nguyên": { speedMod: 0.7, damageBuff: 0.2, preferredTribes: ['yeti', 'lycan', 'dwarf'] },
    "Đầm lầy": { speedMod: 0.5, damageBuff: 0.2, preferredTribes: ['goblin', 'troll', 'lich'] },
    "Núi lửa": { speedMod: 0.8, damageBuff: 0.2, preferredTribes: ['dragon', 'draconian'] },
    "Đất hoang": { speedMod: 1.0, damageBuff: 0.2, preferredTribes: ['lich'] },
    "Đồi cỏ": { speedMod: 1.0, damageBuff: 0.1, preferredTribes: ['halfling', 'human', 'minotaur'] },
    "Bãi biển": { speedMod: 1.0, damageBuff: 0, preferredTribes: ['merfolk', 'human', 'dwarf'] },
    "Rừng ngập mặn": { speedMod: 0.6, damageBuff: 0.2, preferredTribes: ['elf', 'dryad', 'goblin', 'merfolk'] },
    "Vùng nước nông": { speedMod: 0.4, damageBuff: 0.1, preferredTribes: ['merfolk', 'undine'] },
    "Rạn san hô": { speedMod: 1.2, damageBuff: 0.2, preferredTribes: ['merfolk', 'undine'] },
    "Vùng nước sâu": { speedMod: 1.0, damageBuff: 0.2, preferredTribes: ['merfolk'] },
    "Vực thẳm": { speedMod: 1.0, damageBuff: 0.5, preferredTribes: ['lich'] }
};
export const SEASONS = ["Xuân", "Hạ", "Thu", "Đông"];
export const AGES = ["Thời kỳ nguyên thủy", "Thời kỳ bộ lạc", "Thời kỳ nông nghiệp", "Thời kỳ vương quốc", "Thời kỳ trung cổ"];

// --- VERSION 12 DEEP SIMULATION CONSTANTS ---
export const LIFE_GOALS = [
    "Sống yên bình", "Có gia đình lớn", "Trở thành thủ lĩnh", "Trở thành chiến binh",
    "Trở thành nhà nghiên cứu", "Trở thành nhà tiên tri", "Giàu có", "Khám phá thế giới",
    "Trả thù", "Phụng sự thần"
];

export const MEMORY_TYPES = {
    BIRTH: "Birth", DEATH: "Death", MARRIAGE: "Marriage", CHILD_BORN: "ChildBorn",
    WAR: "War", DISASTER: "Disaster", MIRACLE: "Miracle", BETRAYAL: "Betrayal",
    FRIENDSHIP: "Friendship", ACHIEVEMENT: "Achievement", TRAUMA: "Trauma"
};

export const RELATION_TYPES = {
    PARENT: "Cha mẹ", CHILD: "Con cái", SPOUSE: "Vợ chồng", SIBLING: "Anh em",
    FRIEND: "Bạn bè", RIVAL: "Đối thủ", ENEMY: "Kẻ thù", LEADER: "Thủ lĩnh", IDOL: "Thần tượng"
};

export const ROUTINES = {
    MORNING: "Sáng", NOON: "Trưa", AFTERNOON: "Chiều", EVENING: "Tối", NIGHT: "Đêm"
};
