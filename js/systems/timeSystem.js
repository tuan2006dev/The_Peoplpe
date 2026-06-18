import { state } from '../gameState.js';

export function advanceDay() {
    state.time.day++; 
    if (state.time.day > 30) { 
        state.time.day = 1; state.time.month++; 
        if (state.time.month > 12) { state.time.month = 1; state.time.year++; } 
    }
    document.getElementById('time-display').innerText = `Năm ${state.time.year}, Tháng ${state.time.month}, Ngày ${state.time.day}`;
}
