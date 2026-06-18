export const TECH_TREE = [
    { id: 't_fire', name: 'Lửa', category: 'Sinh tồn', cost: 50, req: [], effectDesc: 'Hồi energy nhanh hơn' },
    { id: 't_stone_tools', name: 'Công cụ đá', category: 'Sinh tồn', cost: 80, req: ['t_fire'], effectDesc: 'Thợ săn và thợ xây làm việc hiệu quả hơn' },
    { id: 't_hunting', name: 'Săn bắn', category: 'Sinh tồn', cost: 120, req: ['t_stone_tools'], effectDesc: 'Tìm thức ăn xa hơn' },
    { id: 't_agriculture', name: 'Trồng trọt', category: 'Sinh tồn', cost: 200, req: ['t_hunting'], effectDesc: 'Mở khóa Farm' },
    { id: 't_wood_house', name: 'Nhà gỗ', category: 'Xây dựng', cost: 100, req: ['t_stone_tools'], effectDesc: 'Nhà bền hơn' },
    { id: 't_language', name: 'Ngôn ngữ', category: 'Xã hội', cost: 80, req: [], effectDesc: 'Tăng tốc độ kết bạn' },
    { id: 't_spear', name: 'Giáo mác', category: 'Quân sự', cost: 100, req: ['t_stone_tools'], effectDesc: 'Tăng damage binh lính' },
    { id: 't_ritual', name: 'Nghi lễ', category: 'Tôn giáo', cost: 100, req: [], effectDesc: 'Tăng Faith' }
];
