import { state } from './gameState.js';
import { TILE_SIZE } from './config.js';
import { canvas } from './renderer.js';

export function centerCamera(worldX, worldY) {
    state.camera.x = canvas.width / 2 - worldX * state.camera.zoom;
    state.camera.y = canvas.height / 2 - worldY * state.camera.zoom;
}

export function getWorldPos(e) {
    let rect = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;
    
    let wx = (mouseX - state.camera.x) / state.camera.zoom;
    let wy = (mouseY - state.camera.y) / state.camera.zoom;
    
    return { x: Math.floor(wx / TILE_SIZE), y: Math.floor(wy / TILE_SIZE), wx, wy };
}
