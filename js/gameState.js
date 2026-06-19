import { START_YEAR } from './config.js';

export const state = {
    grid: [], envGrid: [], territoryGrid: [],
    npcs: [], monsters: [], neutrals: [], animals: [], spirits: [], bosses: [], deadNpcs: [], effects: [], foods: [], resources: [], houses: [], tribes: [], buildings: [], religions: [],
    kingdoms: [], diplomacy: [], wars: [], activeDisasters: [],
    bossTracking: { waterTicks: 0, volcanoEruptions: 0, waterCorpses: 0, dragonsKilled: 0, initialForestCount: 0, forestsChopped: 0, darkRituals: 0, spellsCast: 0, activeBosses: [] },
    god: { divinePower: 100, reputation: 0, fearLevel: 0, mercyLevel: 0, miracleCount: 0, disasterCount: 0 },
    currentTool: 'dat', isMouseDragging: false,
    selectedNpcId: null, selectedHouseId: null, selectedTribeId: null, selectedRelId: null,
    time: { year: START_YEAR, month: 1, day: 1, frames: 0, framesPerDay: 300, speedMultiplier: 1 },
    climate: { season: "Xuân", globalTemp: 25, globalHum: 50, globalFert: 50, globalPol: 0 },
    historyLogs: [], idCounter: 0, houseIdCounter: 0, tribeIdCounter: 0, buildingIdCounter: 0, relIdCounter: 0, kdIdCounter: 0,
    worldHistory: [], legendaryPersons: [], endingProgress: { faithful:0, silent:0, dead:0, heaven:0, burning:0, gods:0, observer:0 },
    hasEnded: false,
    camera: { x: 0, y: 0, zoom: 1 },
    isCameraDragging: false, camDragStartX: 0, camDragStartY: 0, isMinimapDragging: false,
    spatialGrid: {}, particles: [], ticks: 0,
    possession: { active: false, npcId: null, keys: { w: false, a: false, s: false, d: false }, targetX: null, targetY: null },
    settings: { showGrid: false, showNames: true, showTerritory: true, showEffects: true, pauseOnEnding: true, autoSave: true, sound: false, graphicsQuality: 'High' },
    worldDramaScore: 0, storyEvents: [], eventChains: [], newspaperArticles: []
};

export function resetState() {
    state.grid = []; state.envGrid = []; state.territoryGrid = []; 
    state.npcs = []; state.monsters = []; state.neutrals = []; state.animals = []; state.spirits = []; state.bosses = [];
    state.deadNpcs = []; state.effects = []; state.foods = []; state.resources = []; state.houses = []; state.tribes = []; state.buildings = []; state.religions = []; state.kingdoms = []; state.diplomacy = []; state.wars = []; state.activeDisasters = [];
    state.bossTracking = { waterTicks: 0, volcanoEruptions: 0, waterCorpses: 0, dragonsKilled: 0, initialForestCount: 0, forestsChopped: 0, darkRituals: 0, spellsCast: 0, activeBosses: [] };
    state.historyLogs = []; state.worldHistory = []; state.legendaryPersons = []; state.particles = [];
    state.god = { divinePower: 100, reputation: 0, fearLevel: 0, mercyLevel: 0, miracleCount: 0, disasterCount: 0 };
    state.time = { year: START_YEAR, month: 1, day: 1, frames: 0, framesPerDay: 300, speedMultiplier: 1 };
    state.climate = { season: "Xuân", globalTemp: 25, globalHum: 50, globalFert: 50, globalPol: 0 };
    state.idCounter = 0; state.houseIdCounter = 0; state.tribeIdCounter = 0; state.buildingIdCounter = 0; state.relIdCounter = 0; state.kdIdCounter = 0;
    state.ticks = 0; state.hasEnded = false;
    state.possession = { active: false, npcId: null, keys: { w: false, a: false, s: false, d: false }, targetX: null, targetY: null };
    state.selectedNpcId = null; state.selectedHouseId = null; state.selectedTribeId = null; state.selectedRelId = null;
    state.worldDramaScore = 0; state.storyEvents = []; state.eventChains = []; state.newspaperArticles = [];
}
