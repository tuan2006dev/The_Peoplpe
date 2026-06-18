import { state } from './gameState.js';
import { TILE_SIZE, COLS, ROWS, COLORS, TERRAIN } from './config.js';
import { updateUITabs } from './ui.js';

export const canvas = document.getElementById('game-canvas');
export const ctx = canvas.getContext('2d');
export const minimapCanvas = document.getElementById('minimap');
export const mCtx = minimapCanvas.getContext('2d');

let patterns = {};

export function createTextures() {
    let createPat = (drawFunc) => {
        let tCan = document.createElement('canvas');
        tCan.width = TILE_SIZE; tCan.height = TILE_SIZE;
        let tCtx = tCan.getContext('2d');
        drawFunc(tCtx);
        return ctx.createPattern(tCan, 'repeat');
    };
    
    patterns[TERRAIN.DAT] = createPat(c => {
        c.fillStyle = '#2ecc71'; c.fillRect(0,0,16,16);
        c.fillStyle = '#27ae60'; c.fillRect(2,2,4,4); c.fillRect(10,8,3,3);
    });
    patterns[TERRAIN.NUOC] = createPat(c => {
        c.fillStyle = '#3498db'; c.fillRect(0,0,16,16);
        c.fillStyle = '#2980b9'; c.fillRect(0,4,16,2); c.fillRect(0,12,16,2);
    });
    patterns[TERRAIN.RUNG] = createPat(c => {
        c.fillStyle = '#2ecc71'; c.fillRect(0,0,16,16);
        c.fillStyle = '#1e8449'; 
        c.beginPath(); c.arc(8, 8, 6, 0, Math.PI*2); c.fill();
        c.fillStyle = '#145a32';
        c.beginPath(); c.arc(12, 12, 4, 0, Math.PI*2); c.fill();
    });
    patterns[TERRAIN.NUI] = createPat(c => {
        c.fillStyle = '#7f8c8d'; c.fillRect(0,0,16,16);
        c.fillStyle = '#95a5a6'; c.beginPath(); c.moveTo(2,16); c.lineTo(8,2); c.lineTo(14,16); c.fill();
        c.fillStyle = '#bdc3c7'; c.beginPath(); c.moveTo(5,9); c.lineTo(8,2); c.lineTo(11,9); c.fill();
    });
}

export function updateParticles() {
    for(let i=state.particles.length-1; i>=0; i--){
        let p = state.particles[i];
        p.x += p.vx; p.y += p.vy; p.life--;
        if(p.life <= 0) state.particles.splice(i, 1);
    }
}

export function draw() {
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    let startCol = Math.max(0, Math.floor((-state.camera.x) / (TILE_SIZE * state.camera.zoom)));
    let startRow = Math.max(0, Math.floor((-state.camera.y) / (TILE_SIZE * state.camera.zoom)));
    let endCol = Math.min(COLS, startCol + Math.ceil(canvas.width / (TILE_SIZE * state.camera.zoom)) + 1);
    let endRow = Math.min(ROWS, startRow + Math.ceil(canvas.height / (TILE_SIZE * state.camera.zoom)) + 1);

    ctx.save();
    ctx.translate(state.camera.x, state.camera.y);
    ctx.scale(state.camera.zoom, state.camera.zoom);

    let visTiles = 0;
    for (let x = startCol; x < endCol; x++) {
        for (let y = startRow; y < endRow; y++) {
            visTiles++;
            let tile = state.grid[x][y];
            ctx.fillStyle = patterns[tile] || COLORS[tile];
            
            if (tile === TERRAIN.NUOC) {
                ctx.save();
                ctx.translate(x*TILE_SIZE, y*TILE_SIZE);
                let offset = Math.sin(state.time.frames * 0.1 + x + y) * 2;
                ctx.translate(offset, 0);
                ctx.fillRect(-offset, 0, TILE_SIZE, TILE_SIZE);
                ctx.restore();
            } else if (tile === TERRAIN.RUNG) {
                ctx.save();
                ctx.translate(x*TILE_SIZE, y*TILE_SIZE);
                let skew = Math.sin(state.time.frames * 0.05 + x) * 0.1;
                ctx.transform(1, 0, skew, 1, 0, 0);
                ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
                ctx.restore();
            } else {
                ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
                if (tile === TERRAIN.NUI) {
                    ctx.fillStyle = 'rgba(0,0,0,0.3)';
                    ctx.beginPath(); ctx.moveTo(x*TILE_SIZE+14, y*TILE_SIZE+16); ctx.lineTo(x*TILE_SIZE+20, y*TILE_SIZE+16); ctx.lineTo(x*TILE_SIZE+16, y*TILE_SIZE+6); ctx.fill();
                }
            }
            
            if (state.settings.showGrid) { ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.strokeRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE); }
            if (state.settings.showTerritory && state.kingdoms.length > 0) {
                let kId = null;
                for(let k of state.kingdoms) { if(k.territory && k.territory.some(pt=>pt.x===x&&pt.y===y)){kId=k.id; break;} }
                if(kId) { let k=state.kingdoms.find(x=>x.id===kId); ctx.fillStyle=k.color; ctx.globalAlpha=0.2; ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE); ctx.globalAlpha=1.0; }
            }
        }
    }
    document.getElementById('dbg-vistiles').innerText = visTiles;

    ctx.fillStyle = '#e74c3c';
    state.foods.forEach(f => {
        if(f.x>=startCol && f.x<endCol && f.y>=startRow && f.y<endRow) {
            ctx.beginPath(); ctx.arc(f.x*TILE_SIZE+8, f.y*TILE_SIZE+8, 3, 0, Math.PI*2); ctx.fill();
        }
    });

    ctx.fillStyle = '#8e44ad';
    state.houses.forEach(h => {
        if(h.x>=startCol && h.x<endCol && h.y>=startRow && h.y<endRow) {
            ctx.fillRect(h.x*TILE_SIZE+2, h.y*TILE_SIZE+2, 12, 12);
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
                ctx.beginPath(); ctx.arc(px, py + walkY, 4, 0, Math.PI*2); ctx.fill();
            }
            
            if (state.settings.showNames) {
                ctx.fillStyle = '#fff'; ctx.font = '8px Arial'; ctx.textAlign = 'center';
                ctx.fillText(n.name, px, py - 6 + walkY);
            }
        }
    });
    
    if (state.settings.showEffects) {
        state.particles.forEach(p => {
            ctx.fillStyle = p.type==='bless'?'#f1c40f':p.type==='curse'?'#8e44ad':p.type==='heal'?'#2ecc71':'#fff';
            ctx.fillRect(p.x, p.y, 2, 2);
        });
        state.effects.forEach(e => {
            if (e.type === 'mua') { ctx.fillStyle = 'rgba(52, 152, 219, 0.2)'; ctx.beginPath(); ctx.arc(e.x*TILE_SIZE, e.y*TILE_SIZE, e.radius, 0, Math.PI*2); ctx.fill(); }
            if (e.type === 'bao') { ctx.strokeStyle = 'rgba(236, 240, 241, 0.5)'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(e.x*TILE_SIZE, e.y*TILE_SIZE, e.radius*(e.life%10/10), 0, Math.PI*2); ctx.stroke(); }
            if (e.type === 'plague') { ctx.fillStyle = 'rgba(155, 89, 182, 0.4)'; ctx.beginPath(); ctx.arc(e.x*TILE_SIZE, e.y*TILE_SIZE, e.radius, 0, Math.PI*2); ctx.fill(); }
            if (e.type === 'set' && Math.random()<0.2) { ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; ctx.fillRect(e.x*TILE_SIZE-e.radius, e.y*TILE_SIZE-e.radius, e.radius*2, e.radius*2); }
        });
    }

    ctx.restore();
    
    updateMinimap();
    updateUITabs();
}

function updateMinimap() {
    mCtx.fillStyle = '#1e272e';
    mCtx.fillRect(0, 0, 200, 120);
    mCtx.fillStyle = '#27ae60';
    for (let x=0; x<COLS; x++) {
        for (let y=0; y<ROWS; y++) {
            if (state.grid[x][y] !== TERRAIN.NUOC) mCtx.fillRect(x, y, 1, 1);
        }
    }
    mCtx.fillStyle = '#e74c3c';
    state.tribes.forEach(t => mCtx.fillRect(t.x, t.y, 2, 2));
    
    let vp = document.getElementById('minimap-viewport');
    let sc = 200 / COLS;
    vp.style.left = Math.max(0, -state.camera.x / (TILE_SIZE * state.camera.zoom) * sc) + 'px';
    vp.style.top = Math.max(0, -state.camera.y / (TILE_SIZE * state.camera.zoom) * sc) + 'px';
    vp.style.width = (canvas.width / (TILE_SIZE * state.camera.zoom) * sc) + 'px';
    vp.style.height = (canvas.height / (TILE_SIZE * state.camera.zoom) * sc) + 'px';
}
