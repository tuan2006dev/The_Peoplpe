import { state } from '../gameState.js';

export function logEvent(msg) {
    state.historyLogs.push({ time: `Năm ${state.time.year}, T${state.time.month}, N${state.time.day}`, msg: msg });
    if (state.historyLogs.length > 100) state.historyLogs.shift();
    let notif = document.createElement('div');
    notif.className = 'notif-msg';
    notif.innerText = msg;
    document.getElementById('notification-area').appendChild(notif);
    setTimeout(() => { if(notif.parentNode) notif.parentNode.removeChild(notif); }, 5000);
}
