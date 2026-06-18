import { state } from '../gameState.js';
import { updateStoryDirector } from './storyDirectorSystem.js';

export function advanceDay() {
    state.time.day++; 
    if (state.time.day > 30) { 
        state.time.day = 1; state.time.month++; 
        if (state.time.month > 12) { state.time.month = 1; state.time.year++; } 
    }
    
    if (state.time.day === 30) {
        updateStoryDirector();
    }

    document.getElementById('time-display').innerText = `Năm ${state.time.year}, Tháng ${state.time.month}, Ngày ${state.time.day}`;
}
