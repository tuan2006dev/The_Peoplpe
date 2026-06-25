export const TECH_CATEGORIES = {
    SURVIVAL: "Survival",
    AGRICULTURE: "Agriculture",
    MINING: "Mining",
    CONSTRUCTION: "Construction",
    MILITARY: "Military",
    ECONOMY: "Economy",
    SCIENCE: "Science",
    MEDICINE: "Medicine",
    TRANSPORTATION: "Transportation",
    INDUSTRY: "Industry",
    COMMUNICATION: "Communication",
    SPACE: "Space"
};

export const ERAS = {
    STONE: "Stone Age",
    BRONZE: "Bronze Age",
    IRON: "Iron Age",
    MEDIEVAL: "Medieval Age",
    RENAISSANCE: "Renaissance",
    INDUSTRIAL: "Industrial Age",
    MODERN: "Modern Age",
    DIGITAL: "Digital Age",
    SPACE: "Space Age"
};

export const TECHNOLOGY_TREE = [
    // --- STONE AGE ---
    {
        id: "tech_fire", name: "Fire", description: "The mastery of fire provides warmth and light.",
        era: ERAS.STONE, category: TECH_CATEGORIES.SURVIVAL, cost: 50, prerequisites: [],
        unlocks: ["Cooking", "Campfire"]
    },
    {
        id: "tech_stone_tools", name: "Stone Tools", description: "Basic tools made from sharpened stones.",
        era: ERAS.STONE, category: TECH_CATEGORIES.CONSTRUCTION, cost: 80, prerequisites: ["tech_fire"],
        unlocks: ["Axe", "Pickaxe"]
    },
    {
        id: "tech_hunting", name: "Hunting", description: "Techniques for tracking and killing wild animals.",
        era: ERAS.STONE, category: TECH_CATEGORIES.SURVIVAL, cost: 100, prerequisites: ["tech_stone_tools"],
        unlocks: ["Spear", "Hunter Job"]
    },
    {
        id: "tech_gathering", name: "Gathering", description: "Knowledge of edible plants and foraging.",
        era: ERAS.STONE, category: TECH_CATEGORIES.AGRICULTURE, cost: 60, prerequisites: [],
        unlocks: ["Food Collection Bonus"]
    },

    // --- BRONZE AGE ---
    {
        id: "tech_agriculture", name: "Agriculture", description: "Cultivating plants for a stable food source.",
        era: ERAS.BRONZE, category: TECH_CATEGORIES.AGRICULTURE, cost: 300, prerequisites: ["tech_gathering", "tech_stone_tools"],
        unlocks: ["Farm"]
    },
    {
        id: "tech_animal_husbandry", name: "Animal Husbandry", description: "Taming and breeding animals.",
        era: ERAS.BRONZE, category: TECH_CATEGORIES.AGRICULTURE, cost: 250, prerequisites: ["tech_hunting"],
        unlocks: ["Livestock"]
    },
    {
        id: "tech_pottery", name: "Pottery", description: "Creating clay vessels for storage.",
        era: ERAS.BRONZE, category: TECH_CATEGORIES.CONSTRUCTION, cost: 200, prerequisites: ["tech_fire"],
        unlocks: ["Food Storage"]
    },
    {
        id: "tech_bronze_working", name: "Bronze Working", description: "Smelting copper and tin to make bronze.",
        era: ERAS.BRONZE, category: TECH_CATEGORIES.MINING, cost: 400, prerequisites: ["tech_fire", "tech_stone_tools"],
        unlocks: ["Bronze Tools"]
    },

    // --- IRON AGE ---
    {
        id: "tech_iron_smelting", name: "Iron Smelting", description: "Extracting iron from its ore.",
        era: ERAS.IRON, category: TECH_CATEGORIES.MINING, cost: 800, prerequisites: ["tech_bronze_working"],
        unlocks: ["Iron Weapons"]
    },
    {
        id: "tech_road_building", name: "Road Building", description: "Paved pathways for better transport.",
        era: ERAS.IRON, category: TECH_CATEGORIES.CONSTRUCTION, cost: 600, prerequisites: ["tech_stone_tools"],
        unlocks: ["Roads"]
    },
    {
        id: "tech_military_org", name: "Military Organization", description: "Structured armies and tactics.",
        era: ERAS.IRON, category: TECH_CATEGORIES.MILITARY, cost: 900, prerequisites: ["tech_iron_smelting"],
        unlocks: ["Barracks"]
    },

    // --- MEDIEVAL AGE ---
    {
        id: "tech_writing", name: "Writing", description: "Recording information using symbols.",
        era: ERAS.MEDIEVAL, category: TECH_CATEGORIES.COMMUNICATION, cost: 1500, prerequisites: [],
        unlocks: ["Books"]
    },
    {
        id: "tech_education", name: "Education", description: "Formal schooling to pass down knowledge.",
        era: ERAS.MEDIEVAL, category: TECH_CATEGORIES.SCIENCE, cost: 2000, prerequisites: ["tech_writing"],
        unlocks: ["School"]
    },
    {
        id: "tech_architecture", name: "Architecture", description: "Advanced building techniques.",
        era: ERAS.MEDIEVAL, category: TECH_CATEGORIES.CONSTRUCTION, cost: 1800, prerequisites: ["tech_road_building"],
        unlocks: ["Castle"]
    },
    {
        id: "tech_religion_doctrine", name: "Religion Doctrine", description: "Structured religious beliefs.",
        era: ERAS.MEDIEVAL, category: TECH_CATEGORIES.SCIENCE, cost: 1200, prerequisites: ["tech_writing"],
        unlocks: ["Temple Upgrade"]
    },

    // --- RENAISSANCE ---
    {
        id: "tech_printing_press", name: "Printing Press", description: "Mass reproduction of written materials.",
        era: ERAS.RENAISSANCE, category: TECH_CATEGORIES.COMMUNICATION, cost: 4000, prerequisites: ["tech_writing", "tech_education"],
        unlocks: ["Faster Research"]
    },
    {
        id: "tech_astronomy", name: "Astronomy", description: "The study of celestial bodies.",
        era: ERAS.RENAISSANCE, category: TECH_CATEGORIES.SCIENCE, cost: 3500, prerequisites: ["tech_education"],
        unlocks: ["Observatory"]
    },
    {
        id: "tech_scientific_method", name: "Scientific Method", description: "Systematic observation and experimentation.",
        era: ERAS.RENAISSANCE, category: TECH_CATEGORIES.SCIENCE, cost: 5000, prerequisites: ["tech_education"],
        unlocks: ["Research Bonus"]
    },

    // --- INDUSTRIAL AGE ---
    {
        id: "tech_steam_engine", name: "Steam Engine", description: "Harnessing steam power for mechanics.",
        era: ERAS.INDUSTRIAL, category: TECH_CATEGORIES.INDUSTRY, cost: 10000, prerequisites: ["tech_scientific_method", "tech_iron_smelting"],
        unlocks: ["Factory", "Train"]
    },
    {
        id: "tech_mass_production", name: "Mass Production", description: "Manufacturing goods in large quantities.",
        era: ERAS.INDUSTRIAL, category: TECH_CATEGORIES.INDUSTRY, cost: 12000, prerequisites: ["tech_steam_engine"],
        unlocks: ["Industrial Goods"]
    },
    {
        id: "tech_coal_mining", name: "Coal Mining", description: "Extracting coal to fuel industry.",
        era: ERAS.INDUSTRIAL, category: TECH_CATEGORIES.MINING, cost: 8000, prerequisites: ["tech_iron_smelting"],
        unlocks: ["Industrial Expansion"]
    },

    // --- MODERN AGE ---
    {
        id: "tech_electricity", name: "Electricity", description: "Harnessing electrical energy.",
        era: ERAS.MODERN, category: TECH_CATEGORIES.INDUSTRY, cost: 25000, prerequisites: ["tech_steam_engine", "tech_mass_production"],
        unlocks: ["Power Grid"]
    },
    {
        id: "tech_medicine", name: "Medicine", description: "Advanced medical treatments.",
        era: ERAS.MODERN, category: TECH_CATEGORIES.MEDICINE, cost: 20000, prerequisites: ["tech_scientific_method"],
        unlocks: ["Hospital"]
    },
    {
        id: "tech_automobile", name: "Automobile", description: "Motorized vehicles for personal transport.",
        era: ERAS.MODERN, category: TECH_CATEGORIES.TRANSPORTATION, cost: 28000, prerequisites: ["tech_mass_production", "tech_electricity"],
        unlocks: ["Cars"]
    },
    {
        id: "tech_flight", name: "Flight", description: "Powered aviation.",
        era: ERAS.MODERN, category: TECH_CATEGORIES.TRANSPORTATION, cost: 35000, prerequisites: ["tech_automobile"],
        unlocks: ["Airplanes"]
    },

    // --- DIGITAL AGE ---
    {
        id: "tech_computers", name: "Computers", description: "Electronic devices for processing data.",
        era: ERAS.DIGITAL, category: TECH_CATEGORIES.COMMUNICATION, cost: 60000, prerequisites: ["tech_electricity"],
        unlocks: ["Digital Era"]
    },
    {
        id: "tech_internet", name: "Internet", description: "Global network of computers.",
        era: ERAS.DIGITAL, category: TECH_CATEGORIES.COMMUNICATION, cost: 80000, prerequisites: ["tech_computers"],
        unlocks: ["Communication Bonus"]
    },
    {
        id: "tech_ai", name: "Artificial Intelligence", description: "Machines capable of intelligent behavior.",
        era: ERAS.DIGITAL, category: TECH_CATEGORIES.SCIENCE, cost: 120000, prerequisites: ["tech_computers", "tech_internet"],
        unlocks: ["AI Research"]
    },

    // --- SPACE AGE ---
    {
        id: "tech_rocketry", name: "Rocketry", description: "Vehicles capable of reaching space.",
        era: ERAS.SPACE, category: TECH_CATEGORIES.TRANSPORTATION, cost: 200000, prerequisites: ["tech_flight", "tech_computers"],
        unlocks: ["Space Center"]
    },
    {
        id: "tech_satellite", name: "Satellite", description: "Objects placed into orbit.",
        era: ERAS.SPACE, category: TECH_CATEGORIES.COMMUNICATION, cost: 250000, prerequisites: ["tech_rocketry"],
        unlocks: ["Global Communication"]
    },
    {
        id: "tech_moon_colonization", name: "Moon Colonization", description: "Establishing a base on the moon.",
        era: ERAS.SPACE, category: TECH_CATEGORIES.SPACE, cost: 500000, prerequisites: ["tech_satellite"],
        unlocks: ["Lunar Base"]
    },
    {
        id: "tech_mars_colonization", name: "Mars Colonization", description: "Establishing a settlement on Mars.",
        era: ERAS.SPACE, category: TECH_CATEGORIES.SPACE, cost: 1000000, prerequisites: ["tech_moon_colonization"],
        unlocks: ["Mars Settlement"]
    }
];

export function getTechById(id) {
    return TECHNOLOGY_TREE.find(t => t.id === id);
}

export function getTechsByEra(era) {
    return TECHNOLOGY_TREE.filter(t => t.era === era);
}
