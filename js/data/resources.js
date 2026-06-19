export const RESOURCE_GROUPS = {
    FOOD: 1,
    BUILDING: 2,
    MINERALS: 3,
    SPECIAL: 4,
    ENERGY: 5
};

export const RESOURCES = {
    // NHÓM 1: LƯƠNG THỰC
    wheat: { id: 'wheat', name: 'Lúa mì', group: 1, type: 'Trồng trọt', renewable: 'Có', biomes: ['Đồng bằng', 'Đồi cỏ'], emoji: '🌾', raw: true },
    vegetable: { id: 'vegetable', name: 'Rau củ', group: 1, type: 'Trồng trọt', renewable: 'Có', biomes: ['Đồng bằng'], emoji: '🥬', raw: true },
    fruit: { id: 'fruit', name: 'Trái cây', group: 1, type: 'Hái lượm', renewable: 'Có', biomes: ['Rừng già', 'Rừng ngập mặn', 'Sa mạc'], emoji: '🍎', raw: true },
    grapes: { id: 'grapes', name: 'Nho', group: 1, type: 'Trồng trọt', renewable: 'Có', biomes: ['Đồi cỏ', 'Sa mạc'], emoji: '🍇', raw: true },
    meat: { id: 'meat', name: 'Thịt', group: 1, type: 'Săn bắt', renewable: 'Không', biomes: ['Đồng bằng', 'Rừng già', 'Băng nguyên', 'Đầm lầy'], emoji: '🥩', raw: true },
    milk: { id: 'milk', name: 'Sữa', group: 1, type: 'Chăn nuôi', renewable: 'Có', biomes: ['Đồng bằng', 'Đồi cỏ'], emoji: '🥛', raw: true },
    egg: { id: 'egg', name: 'Trứng', group: 1, type: 'Chăn nuôi', renewable: 'Có', biomes: ['Đồng bằng'], emoji: '🥚', raw: true },
    fish: { id: 'fish', name: 'Cá', group: 1, type: 'Đánh bắt', renewable: 'Có', biomes: ['Vùng nước nông', 'Rừng ngập mặn'], emoji: '🐟', raw: true },
    mushroom: { id: 'mushroom', name: 'Nấm', group: 1, type: 'Hái lượm', renewable: 'Có', biomes: ['Rừng già', 'Đầm lầy'], emoji: '🍄', raw: true },
    honey: { id: 'honey', name: 'Mật ong', group: 1, type: 'Hái lượm', renewable: 'Có', biomes: ['Rừng già', 'Đồng bằng'], emoji: '🍯', raw: true },

    // NHÓM 2: VẬT LIỆU XÂY DỰNG
    timber: { id: 'timber', name: 'Gỗ thường', group: 2, type: 'Thu thập', renewable: 'Có', biomes: ['Rừng già', 'Rừng ngập mặn'], emoji: '🪵', raw: true },
    stone: { id: 'stone', name: 'Đá xây dựng', group: 2, type: 'Khai thác', renewable: 'Không', biomes: ['Núi đá', 'Đồi cỏ', 'Băng nguyên', 'Đất hoang'], emoji: '🪨', raw: true },
    hardwood: { id: 'hardwood', name: 'Gỗ cứng', group: 2, type: 'Thu thập', renewable: 'Chậm', biomes: ['Rừng già', 'Rừng ngập mặn'], emoji: '🌳', raw: true },
    clay: { id: 'clay', name: 'Đất sét', group: 2, type: 'Khai thác', renewable: 'Có', biomes: ['Đầm lầy', 'Đồng bằng', 'Đồi cỏ'], emoji: '🏺', raw: true },
    sand: { id: 'sand', name: 'Cát', group: 2, type: 'Khai thác', renewable: 'Có', biomes: ['Sa mạc', 'Bãi biển'], emoji: '🏜️', raw: true },
    limestone: { id: 'limestone', name: 'Đá vôi', group: 2, type: 'Khai thác', renewable: 'Không', biomes: ['Núi đá', 'Đồng bằng'], emoji: '🧱', raw: true },

    // NHÓM 3: KHOÁNG SẢN & QUẶNG
    iron_ore: { id: 'iron_ore', name: 'Sắt', group: 3, type: 'Khai thác', renewable: 'Không', biomes: ['Núi đá', 'Đồi cỏ', 'Băng nguyên'], emoji: '⛏️', raw: true },
    copper: { id: 'copper', name: 'Đồng', group: 3, type: 'Khai thác', renewable: 'Không', biomes: ['Núi đá', 'Đồi cỏ'], emoji: '🟤', raw: true },
    gold: { id: 'gold', name: 'Vàng', group: 3, type: 'Khai thác', renewable: 'Rất hiếm', biomes: ['Núi đá', 'Sa mạc'], emoji: '👑', raw: true },
    silver: { id: 'silver', name: 'Bạc', group: 3, type: 'Khai thác', renewable: 'Hiếm', biomes: ['Núi đá'], emoji: '💍', raw: true },
    mithril: { id: 'mithril', name: 'Mithril', group: 3, type: 'Khai thác', renewable: 'Cực kỳ hiếm', biomes: ['Núi đá', 'Vực thẳm'], emoji: '💠', raw: true },
    obsidian: { id: 'obsidian', name: 'Obsidian', group: 3, type: 'Khai thác', renewable: 'Có', biomes: ['Núi lửa', 'Sa mạc'], emoji: '⬛', raw: true },
    sulfur: { id: 'sulfur', name: 'Lưu huỳnh', group: 3, type: 'Khai thác', renewable: 'Có', biomes: ['Núi lửa', 'Đầm lầy', 'Núi đá'], emoji: '🟨', raw: true },
    gems: { id: 'gems', name: 'Tinh thể', group: 3, type: 'Khai thác', renewable: 'Rất hiếm', biomes: ['Núi đá', 'Rạn san hô'], emoji: '💎', raw: true },

    // NHÓM 4: ĐẶC BIỆT
    herbs: { id: 'herbs', name: 'Thảo dược', group: 4, type: 'Thu thập', renewable: 'Có', biomes: ['Rừng già', 'Đầm lầy'], emoji: '🌿', raw: true },
    spores: { id: 'spores', name: 'Nấm độc', group: 4, type: 'Thu thập', renewable: 'Có', biomes: ['Đầm lầy'], emoji: '🦠', raw: true },
    silk: { id: 'silk', name: 'Tơ lụa', group: 4, type: 'Thu thập', renewable: 'Có', biomes: ['Rừng già'], emoji: '🐛', raw: true },
    wool: { id: 'wool', name: 'Len', group: 4, type: 'Chăn nuôi', renewable: 'Có', biomes: ['Đồng bằng', 'Băng nguyên'], emoji: '🐑', raw: true },
    leather: { id: 'leather', name: 'Da thú', group: 4, type: 'Săn bắt', renewable: 'Không', biomes: ['Đồng bằng', 'Rừng già'], emoji: '🐄', raw: true },
    coral: { id: 'coral', name: 'San hô', group: 4, type: 'Thu thập', renewable: 'Chậm', biomes: ['Rạn san hô'], emoji: '🪸', raw: true },
    salt: { id: 'salt', name: 'Muối', group: 4, type: 'Khai thác', renewable: 'Chậm', biomes: ['Sa mạc', 'Bãi biển'], emoji: '🧂', raw: true },

    // NHÓM 5: NĂNG LƯỢNG
    mana: { id: 'mana', name: 'Mana', group: 5, type: 'Thu thập', renewable: 'Chậm', biomes: ['Rừng già', 'Rạn san hô'], emoji: '✨', raw: true },
    oil: { id: 'oil', name: 'Dầu thô', group: 5, type: 'Khai thác', renewable: 'Không', biomes: ['Đầm lầy', 'Vùng nước sâu'], emoji: '🛢️', raw: true },
    uranium: { id: 'uranium', name: 'Uranium', group: 5, type: 'Khai thác', renewable: 'Cực hiếm', biomes: ['Vực thẳm'], emoji: '☢️', raw: true },
    soul: { id: 'soul', name: 'Linh hồn', group: 5, type: 'Thu thập', renewable: 'Không', biomes: ['Đất hoang'], emoji: '👻', raw: true },

    // THÀNH PHẨM (Processed)
    wine: { id: 'wine', name: 'Rượu', group: 4, type: 'Chế biến', raw: false, emoji: '🍷' },
    bread: { id: 'bread', name: 'Bánh mì', group: 1, type: 'Chế biến', raw: false, emoji: '🥖' },
    sword: { id: 'sword', name: 'Vũ khí Sắt', group: 3, type: 'Chế biến', raw: false, emoji: '🗡️' },
    planks: { id: 'planks', name: 'Ván gỗ', group: 2, type: 'Chế biến', raw: false, emoji: '🪵' },
    glass: { id: 'glass', name: 'Thủy tinh', group: 2, type: 'Chế biến', raw: false, emoji: '🪞' },
    gunpowder: { id: 'gunpowder', name: 'Thuốc súng', group: 3, type: 'Chế biến', raw: false, emoji: '💣' },
    leather_armor: { id: 'leather_armor', name: 'Giáp da', group: 2, type: 'Chế biến', raw: false, emoji: '🦺' },
    cloth: { id: 'cloth', name: 'Vải len', group: 4, type: 'Chế biến', raw: false, emoji: '🧵' },
    tar: { id: 'tar', name: 'Nhựa đường', group: 5, type: 'Chế biến', raw: false, emoji: '🕳️' },
    magic_crystal: { id: 'magic_crystal', name: 'Tinh thể phép', group: 5, type: 'Chế biến', raw: false, emoji: '🔮' },
};

// Chuỗi sản xuất
export const PRODUCTION_CHAINS = [
    { output: 'bread', inputs: { 'wheat': 2 }, building: 'Cối xay gió' },
    { output: 'sword', inputs: { 'iron_ore': 2 }, building: 'Xưởng rèn' },
    { output: 'planks', inputs: { 'timber': 2 }, building: 'Xưởng cưa' },
    { output: 'glass', inputs: { 'sand': 2, 'timber': 1 }, building: 'Lò nấu thủy tinh' },
    { output: 'gunpowder', inputs: { 'sulfur': 1, 'salt': 1 }, building: 'Nhà máy hóa chất' },
    { output: 'wine', inputs: { 'grapes': 2 }, building: 'Hầm rượu' },
    { output: 'leather_armor', inputs: { 'leather': 2, 'salt': 1 }, building: 'Xưởng thuộc da' },
    { output: 'cloth', inputs: { 'wool': 2 }, building: 'Xưởng dệt' },
    { output: 'tar', inputs: { 'oil': 2 }, building: 'Nhà máy lọc dầu' },
    { output: 'magic_crystal', inputs: { 'mana': 5, 'gems': 1 }, building: 'Tháp pháp sư' },
];

export const BUILDING_TYPES = [
    'Lều cỏ', 'Nhà đá', 'Thành đá', 'Hang động', 'Trại',
    'Cối xay gió', 'Xưởng rèn', 'Xưởng cưa', 'Lò nấu thủy tinh', 'Nhà máy hóa chất',
    'Hầm rượu', 'Xưởng thuộc da', 'Xưởng dệt', 'Nhà máy lọc dầu', 'Tháp pháp sư'
];
