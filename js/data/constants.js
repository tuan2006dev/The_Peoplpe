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
export const BIOMES = ["Đồng cỏ", "Rừng", "Sa mạc", "Núi", "Đầm lầy", "Tuyết", "Đất chết", "Nước"];
export const BIOME_COLORS = { "Đồng cỏ": "#2ecc71", "Rừng": "#27ae60", "Sa mạc": "#f1c40f", "Núi": "#7f8c8d", "Đầm lầy": "#8e44ad", "Tuyết": "#ecf0f1", "Đất chết": "#95a5a6", "Nước": "#3498db" };
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
