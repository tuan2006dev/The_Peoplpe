import { state } from './gameState.js';
import { TILE_SIZE, COLS, ROWS, COLORS, TERRAIN } from './config.js';
import { BIOME_COLORS } from './data/constants.js';
import { updateUITabs } from './ui.js';
import { centerCamera } from './camera.js';

export const canvas = document.getElementById('game-canvas');
export const ctx = canvas.getContext('2d');
export const minimapCanvas = document.getElementById('minimap');
export const mCtx = minimapCanvas.getContext('2d');

let patterns = {};
let lastMinimapTick = -1;
let minimapImageData = null;

export function createTextures() {
    let createPattern = (color1, size, type) => {
        let c = document.createElement('canvas'); c.width = size; c.height = size;
        let ctx = c.getContext('2d');
        ctx.fillStyle = color1; ctx.fillRect(0,0,size,size);
        
        // Add some noise/shading
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        if (type === 'dots') {
            for(let i=0; i<5; i++) { ctx.fillRect(Math.random()*size, Math.random()*size, 2, 2); }
        } else if (type === 'lines') {
            ctx.fillRect(0, size/2, size, 2);
        } else if (type === 'waves') {
            ctx.beginPath(); ctx.moveTo(0, size/2); ctx.quadraticCurveTo(size/2, 0, size, size/2); ctx.stroke();
        } else if (type === 'noise') {
            for(let i=0; i<10; i++) { ctx.fillRect(Math.random()*size, Math.random()*size, 1, 1); }
        }
        return ctx.createPattern(c, 'repeat');
    };
    
    // Create patterns per biome
    for (let biome in BIOME_COLORS) {
        let type = 'dots';
        if(biome.includes('Nước')) type = 'waves';
        if(biome.includes('Núi')) type = 'lines';
        if(biome.includes('Sa mạc') || biome.includes('Đất hoang')) type = 'noise';
        patterns[biome] = createPattern(BIOME_COLORS[biome], TILE_SIZE, type);
    }
}

export function updateParticles() {
    for(let i=state.particles.length-1; i>=0; i--){
        let p = state.particles[i];
        p.x += p.vx; p.y += p.vy; p.life--;
        if(p.life <= 0) state.particles.splice(i, 1);
    }
}

export function draw() {
    if (state.followedNpcId) {
        let n = state.npcs.find(x => x.id === state.followedNpcId);
        if (n) centerCamera(n.x * TILE_SIZE, n.y * TILE_SIZE);
        else state.followedNpcId = null;
    }

    ctx.fillStyle = '#1e272e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    let startCol = Math.max(0, Math.floor((-state.camera.x) / (TILE_SIZE * state.camera.zoom)));
    let startRow = Math.max(0, Math.floor((-state.camera.y) / (TILE_SIZE * state.camera.zoom)));
    let endCol = Math.min(COLS, startCol + Math.ceil(canvas.width / (TILE_SIZE * state.camera.zoom)) + 1);
    let endRow = Math.min(ROWS, startRow + Math.ceil(canvas.height / (TILE_SIZE * state.camera.zoom)) + 1);
    let v = { sx: startCol * TILE_SIZE, sy: startRow * TILE_SIZE, ex: endCol * TILE_SIZE, ey: endRow * TILE_SIZE };

    ctx.save();
    ctx.translate(state.camera.x, state.camera.y);
    ctx.scale(state.camera.zoom, state.camera.zoom);

    let visTiles = 0;
    for (let x = startCol; x < endCol; x++) {
        for (let y = startRow; y < endRow; y++) {
            visTiles++;
            let tile = state.grid[x][y];
            let biome = state.envGrid[x][y] ? state.envGrid[x][y].biome : null;
            ctx.fillStyle = (biome && patterns[biome]) ? patterns[biome] : (patterns[tile] || COLORS[tile]);
            
            if (tile === TERRAIN.NUOC) {
                if (state.camera.zoom > 0.5) {
                    ctx.save();
                    ctx.translate(x*TILE_SIZE, y*TILE_SIZE);
                    let offset = Math.sin(state.time.frames * 0.1 + x + y) * 2;
                    ctx.translate(offset, 0);
                    ctx.fillRect(-offset, 0, TILE_SIZE, TILE_SIZE);
                    ctx.restore();
                } else {
                    ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            } else if (tile === TERRAIN.RUNG) {
                if (state.camera.zoom > 0.5) {
                    ctx.save();
                    ctx.translate(x*TILE_SIZE, y*TILE_SIZE);
                    let skew = Math.sin(state.time.frames * 0.05 + x) * 0.1;
                    ctx.transform(1, 0, skew, 1, 0, 0);
                    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
                    ctx.restore();
                } else {
                    ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
                }
            } else {
                ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
                if (tile === TERRAIN.NUI) {
                    ctx.fillStyle = 'rgba(0,0,0,0.3)';
                    ctx.beginPath(); ctx.moveTo(x*TILE_SIZE+14, y*TILE_SIZE+16); ctx.lineTo(x*TILE_SIZE+20, y*TILE_SIZE+16); ctx.lineTo(x*TILE_SIZE+16, y*TILE_SIZE+6); ctx.fill();
                }
            }
            
            if (state.settings.showGrid) { ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.strokeRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE); }
        }
    }
    
    // Territories (Tribes & Kingdoms)
    if (state.settings.showTerritory) {
        ctx.lineWidth = 2;
        
        // Render Pixel Territories
        for (let x = startCol; x < endCol; x++) {
            for (let y = startRow; y < endRow; y++) {
                if (state.territoryGrid && state.territoryGrid[x] && state.territoryGrid[x][y]) {
                    let tId = state.territoryGrid[x][y];
                    let t = state.tribes.find(tr => tr.id === tId);
                    if (t && t.color) {
                        let px = x * TILE_SIZE;
                        let py = y * TILE_SIZE;
                        
                        ctx.globalAlpha = 0.2;
                        ctx.fillStyle = t.color;
                        ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
                        
                        ctx.globalAlpha = 0.8;
                        ctx.strokeStyle = t.color;
                        
                        if (y === 0 || state.territoryGrid[x][y-1] !== tId) {
                            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px+TILE_SIZE, py); ctx.stroke();
                        }
                        if (y === ROWS-1 || state.territoryGrid[x][y+1] !== tId) {
                            ctx.beginPath(); ctx.moveTo(px, py+TILE_SIZE); ctx.lineTo(px+TILE_SIZE, py+TILE_SIZE); ctx.stroke();
                        }
                        if (x === 0 || state.territoryGrid[x-1][y] !== tId) {
                            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py+TILE_SIZE); ctx.stroke();
                        }
                        if (x === COLS-1 || state.territoryGrid[x+1][y] !== tId) {
                            ctx.beginPath(); ctx.moveTo(px+TILE_SIZE, py); ctx.lineTo(px+TILE_SIZE, py+TILE_SIZE); ctx.stroke();
                        }
                        
                        // Kingdom Border (Unified)
                        if (t.kingdomId) {
                            let k = state.kingdoms.find(kg => kg.id === t.kingdomId);
                            if (k && k.color) {
                                ctx.lineWidth = 4;
                                ctx.strokeStyle = k.color;
                                
                                let checkEdge = (nx, ny) => {
                                    if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return true;
                                    let neighborTid = state.territoryGrid[nx][ny];
                                    if (neighborTid === null) return true;
                                    return !k.tribeIds.includes(neighborTid);
                                };
                                
                                if (checkEdge(x, y-1)) { ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px+TILE_SIZE, py); ctx.stroke(); }
                                if (checkEdge(x, y+1)) { ctx.beginPath(); ctx.moveTo(px, py+TILE_SIZE); ctx.lineTo(px+TILE_SIZE, py+TILE_SIZE); ctx.stroke(); }
                                if (checkEdge(x-1, y)) { ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py+TILE_SIZE); ctx.stroke(); }
                                if (checkEdge(x+1, y)) { ctx.beginPath(); ctx.moveTo(px+TILE_SIZE, py); ctx.lineTo(px+TILE_SIZE, py+TILE_SIZE); ctx.stroke(); }
                                
                                ctx.lineWidth = 2; // reset
                            }
                        }
                    }
                }
            }
        }
        ctx.globalAlpha = 1.0;
        
        state.tribes.forEach(t => {
            if (t.color) {
                // Tribe Icon (Tent)
                if (t.x * TILE_SIZE >= v.sx && t.x * TILE_SIZE <= v.ex && t.y * TILE_SIZE >= v.sy && t.y * TILE_SIZE <= v.ey) {
                    ctx.save();
                    ctx.translate(t.x * TILE_SIZE, t.y * TILE_SIZE);
                    ctx.fillStyle = t.color;
                    ctx.beginPath(); ctx.moveTo(TILE_SIZE/2, 0); ctx.lineTo(TILE_SIZE, TILE_SIZE); ctx.lineTo(0, TILE_SIZE); ctx.fill();
                    ctx.fillStyle = '#1a1a24';
                    ctx.beginPath(); ctx.moveTo(TILE_SIZE/2, TILE_SIZE/2); ctx.lineTo(TILE_SIZE/2+3, TILE_SIZE); ctx.lineTo(TILE_SIZE/2-3, TILE_SIZE); ctx.fill();
                    // Draw name text
                    if (state.camera.zoom > 0.8) {
                        ctx.fillStyle = '#fff';
                        ctx.font = "bold 10px Arial";
                        ctx.textAlign = "center";
                        ctx.fillText(t.name, TILE_SIZE/2, -5);
                    }
                    ctx.restore();
                }
            }
        });

        state.kingdoms.forEach(k => {
            // Kingdom Icon (Castle at Capital)
            if (k.capitalTribeId) {
                let cap = state.tribes.find(tr => tr.id === k.capitalTribeId);
                if (cap && cap.x * TILE_SIZE >= v.sx && cap.x * TILE_SIZE <= v.ex && cap.y * TILE_SIZE >= v.sy && cap.y * TILE_SIZE <= v.ey) {
                    ctx.globalAlpha = 1.0;
                    ctx.save();
                    ctx.translate(cap.x * TILE_SIZE, cap.y * TILE_SIZE);
                    ctx.fillStyle = k.color;
                    ctx.fillRect(0, TILE_SIZE/2, TILE_SIZE, TILE_SIZE/2);
                    ctx.fillRect(0, TILE_SIZE/2-4, 4, 4);
                    ctx.fillRect(TILE_SIZE/2-2, TILE_SIZE/2-4, 4, 4);
                    ctx.fillRect(TILE_SIZE-4, TILE_SIZE/2-4, 4, 4);
                    
                    if (state.camera.zoom > 0.8) {
                        ctx.fillStyle = '#fff';
                        ctx.font = "bold 11px Arial";
                        ctx.textAlign = "center";
                        ctx.fillText("👑 " + k.name, TILE_SIZE/2, -15);
                    }
                    ctx.restore();
                }
            }
        });
        ctx.globalAlpha = 1.0;
    }

    document.getElementById('dbg-vistiles').innerText = visTiles;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    state.resources.forEach(res => {
        if (res.amount <= 0) return;
        if(res.x >= startCol && res.x < endCol && res.y >= startRow && res.y < endRow) {
            let px = res.x * TILE_SIZE + TILE_SIZE/2;
            let py = res.y * TILE_SIZE + TILE_SIZE/2;
            
            // Vẽ bóng đen bên dưới emoji cho rõ
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath(); ctx.arc(px, py + 2, 4, 0, Math.PI*2); ctx.fill();
            
            ctx.font = '12px Arial';
            ctx.fillText(res.emoji, px, py);
            
            // Vẽ cọc/hộp lưu trữ nếu là tài nguyên khoáng sản/gỗ
            if (res.type === 'Khai thác' || res.type === 'Thu thập') {
                ctx.fillStyle = 'rgba(255,255,255,0.8)';
                ctx.fillRect(px - 6, py + 4, 12, 2);
                ctx.fillStyle = '#2ecc71';
                ctx.fillRect(px - 6, py + 4, 12 * (res.amount / res.maxAmount), 2);
            }
        }
    });

    // Draw Houses
    state.houses.forEach(h => {
        let hx = h.x * TILE_SIZE, hy = h.y * TILE_SIZE;
        if (hx >= v.sx && hx <= v.ex && hy >= v.sy && hy <= v.ey) {
            if (h.type === 'Nhà gỗ') {
                ctx.fillStyle = '#d35400'; ctx.fillRect(hx+2, hy+2, TILE_SIZE-4, TILE_SIZE-4);
                ctx.fillStyle = '#8e44ad'; ctx.fillRect(hx+TILE_SIZE/2-2, hy-2, 4, 4); // Chimney
            } else if (h.type === 'Nhà đá') {
                ctx.fillStyle = '#7f8c8d'; ctx.fillRect(hx+2, hy+2, TILE_SIZE-4, TILE_SIZE-4);
                ctx.fillStyle = '#bdc3c7'; ctx.fillRect(hx+4, hy+4, TILE_SIZE-8, TILE_SIZE-8);
                ctx.fillStyle = '#c0392b'; ctx.fillRect(hx+TILE_SIZE/2-3, hy-4, 6, 6); // Flag/chimney
            } else { // Lều cỏ default
                ctx.fillStyle = '#e67e22'; ctx.fillRect(hx+2, hy+4, TILE_SIZE-4, TILE_SIZE-4);
                ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.moveTo(hx, hy+4); ctx.lineTo(hx+TILE_SIZE/2, hy-2); ctx.lineTo(hx+TILE_SIZE, hy+4); ctx.fill();
            }
            if (state.selectedHouseId === h.id) {
                ctx.strokeStyle = '#e74c3c'; ctx.lineWidth = 2; ctx.strokeRect(hx, hy, TILE_SIZE, TILE_SIZE);
            }
        }
    });

    state.npcs.forEach(n => {
        if(n.x>=startCol && n.x<endCol && n.y>=startRow && n.y<endRow) {
            let px = n.x*TILE_SIZE + 8; let py = n.y*TILE_SIZE + 8;
            let walkY = Math.sin(n.walkCycle) * 2;
            
            if (n.isSailing) {
                ctx.fillStyle = '#d35400';
                ctx.beginPath(); ctx.moveTo(px - 6, py - 2 + walkY); ctx.lineTo(px + 6, py - 2 + walkY);
                ctx.lineTo(px + 4, py + 4 + walkY); ctx.lineTo(px - 4, py + 4 + walkY); ctx.fill();
                
                ctx.fillStyle = '#ecf0f1';
                ctx.beginPath(); ctx.moveTo(px, py - 8 + walkY); ctx.lineTo(px + 4, py - 2 + walkY);
                ctx.lineTo(px, py - 2 + walkY); ctx.fill();
            } else {
                ctx.fillStyle = n.id === state.selectedNpcId ? '#f1c40f' : (n.isSoldier ? '#e74c3c' : '#dcdde1');
                let isPossessed = state.possession && state.possession.active && state.possession.npcId === n.id;
                let tribe = state.tribes.find(tr => tr.id === n.tribeId);
                let isHero = tribe && tribe.isHeroTribe;
                
                if (isPossessed || isHero) {
                    ctx.shadowColor = isPossessed ? '#e67e22' : '#f1c40f';
                    ctx.shadowBlur = 15;
                    if (isPossessed) ctx.fillStyle = '#e67e22';
                    else if (n.isSoldier) ctx.fillStyle = '#e74c3c';
                    else ctx.fillStyle = '#f1c40f';
                }
                ctx.beginPath(); ctx.arc(px, py + walkY, 4, 0, Math.PI*2); ctx.fill();
                if (isPossessed || isHero) ctx.shadowBlur = 0;
            }
            
            // Draw indicators
            if (n.state === 'praying') {
                ctx.fillStyle = '#f1c40f'; ctx.font = '8px Arial'; ctx.fillText('🙏', px, py - 12 + walkY);
            } else if (n.state === 'talking') {
                ctx.fillStyle = '#fff'; ctx.font = '8px Arial'; ctx.fillText('💬', px, py - 12 + walkY);
            } else if (n.state === 'attacking' || n.state === 'defending') {
                ctx.fillStyle = '#e74c3c'; ctx.font = '8px Arial'; ctx.fillText('⚔️', px, py - 12 + walkY);
            }
            
            if (state.settings.showNames) {
                ctx.fillStyle = '#fff'; ctx.font = '8px Arial'; ctx.textAlign = 'center';
                ctx.fillText(n.name, px, py - 6 + walkY);
            }
        }
    });
    
    if (state.settings.showEffects) {
        state.particles.forEach(p => {
            ctx.fillStyle = p.color || (p.type==='bless'?'#f1c40f':p.type==='curse'?'#8e44ad':p.type==='heal'?'#2ecc71':'#fff');
            ctx.fillRect(p.x, p.y, 2, 2);
        });
        state.effects.forEach(e => {
            if (e.type === 'mua') { ctx.fillStyle = 'rgba(52, 152, 219, 0.2)'; ctx.beginPath(); ctx.arc(e.x*TILE_SIZE, e.y*TILE_SIZE, e.radius, 0, Math.PI*2); ctx.fill(); }
            if (e.type === 'bao') { ctx.strokeStyle = 'rgba(236, 240, 241, 0.5)'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(e.x*TILE_SIZE, e.y*TILE_SIZE, e.radius*(e.life%10/10), 0, Math.PI*2); ctx.stroke(); }
            if (e.type === 'plague') { ctx.fillStyle = 'rgba(155, 89, 182, 0.4)'; ctx.beginPath(); ctx.arc(e.x*TILE_SIZE, e.y*TILE_SIZE, e.radius, 0, Math.PI*2); ctx.fill(); }
            if (e.type === 'set' && Math.random()<0.2) { ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; ctx.fillRect(e.x*TILE_SIZE-e.radius, e.y*TILE_SIZE-e.radius, e.radius*2, e.radius*2); }
        });
    }

    // Draw Brush Preview
    if (state.currentTool && ['dat', 'nuoc', 'rung', 'nui', 'cat', 'tuyet', 'damlay', 'xoa'].includes(state.currentTool)) {
        if (state.hoverX >= 0 && state.hoverX < COLS && state.hoverY >= 0 && state.hoverY < ROWS) {
            let brushSize = parseInt(document.getElementById('brush-size') ? document.getElementById('brush-size').value : 1);
            ctx.strokeStyle = state.currentTool === 'xoa' ? 'rgba(231, 76, 60, 0.8)' : 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1;
            for(let i = -Math.floor(brushSize/2); i <= Math.floor(brushSize/2); i++) {
                for(let j = -Math.floor(brushSize/2); j <= Math.floor(brushSize/2); j++) {
                    if (Math.hypot(i, j) <= brushSize/2) {
                        ctx.strokeRect((state.hoverX + i) * TILE_SIZE, (state.hoverY + j) * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    }
                }
            }
        }
    }

    ctx.restore();

    updateMinimap();
    updateUITabs();
}

function updateMinimap() {
    // Chỉ render lại minimap mỗi 60 ticks để tiết kiệm performance
    if (state.ticks === lastMinimapTick) return;
    if (state.ticks % 3 !== 0) {
        // Chỉ cập nhật viewport, không redraw toàn bộ
        _updateMinimapViewport();
        return;
    }
    lastMinimapTick = state.ticks;

    mCtx.fillStyle = '#1e272e';
    mCtx.fillRect(0, 0, 200, 120);

    // Vẽ địa hình cơ bản
    const scaleX = 200 / state.grid.length;
    const scaleY = 120 / (state.grid[0]?.length || 1);

    for (let x = 0; x < state.grid.length; x++) {
        for (let y = 0; y < (state.grid[x]?.length || 0); y++) {
            if (state.grid[x][y] !== 1) { // Không phải nước
                const tribeId = state.territoryGrid?.[x]?.[y];
                if (tribeId) {
                    const tribe = state.tribes.find(t => t.id === tribeId);
                    mCtx.fillStyle = tribe ? tribe.color + '99' : '#27ae60';
                } else {
                    let biome = state.envGrid[x] && state.envGrid[x][y] ? state.envGrid[x][y].biome : null;
                    mCtx.fillStyle = (biome && BIOME_COLORS[biome]) ? BIOME_COLORS[biome] : '#2ecc71';
                }
                mCtx.fillRect(Math.floor(x * scaleX), Math.floor(y * scaleY), Math.ceil(scaleX), Math.ceil(scaleY));
            } else {
                let biome = state.envGrid[x] && state.envGrid[x][y] ? state.envGrid[x][y].biome : null;
                mCtx.fillStyle = (biome && BIOME_COLORS[biome]) ? BIOME_COLORS[biome] : '#2980b9';
                mCtx.fillRect(Math.floor(x * scaleX), Math.floor(y * scaleY), Math.ceil(scaleX), Math.ceil(scaleY));
            }
        }
    }

    // Vẽ thủ đô bộ lạc
    state.tribes.forEach(t => {
        mCtx.fillStyle = t.color;
        mCtx.fillRect(Math.floor(t.x * scaleX) - 1, Math.floor(t.y * scaleY) - 1, 3, 3);
    });

    // Vẽ thủ đô vương quốc
    state.kingdoms.forEach(k => {
        const cap = state.tribes.find(t => t.id === k.capitalTribeId);
        if (cap) {
            mCtx.fillStyle = k.color;
            mCtx.strokeStyle = '#fff';
            mCtx.lineWidth = 0.5;
            mCtx.fillRect(Math.floor(cap.x * scaleX) - 2, Math.floor(cap.y * scaleY) - 2, 4, 4);
            mCtx.strokeRect(Math.floor(cap.x * scaleX) - 2, Math.floor(cap.y * scaleY) - 2, 4, 4);
        }
    });

    _updateMinimapViewport();
}

function _updateMinimapViewport() {
    let vp = document.getElementById('minimap-viewport');
    let sc = 200 / state.grid.length;
    vp.style.left = Math.max(0, -state.camera.x / (TILE_SIZE * state.camera.zoom) * sc) + 'px';
    vp.style.top = Math.max(0, -state.camera.y / (TILE_SIZE * state.camera.zoom) * sc) + 'px';
    vp.style.width = (canvas.width / (TILE_SIZE * state.camera.zoom) * sc) + 'px';
    vp.style.height = (canvas.height / (TILE_SIZE * state.camera.zoom) * sc) + 'px';
}
