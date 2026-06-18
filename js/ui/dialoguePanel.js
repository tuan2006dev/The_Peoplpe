export function updateDialoguePanel(initiator, target, options) {
    let panel = document.getElementById('dialogue-panel');
    if (!panel) return;
    
    document.getElementById('dialogue-target-name').innerText = `Đang nói chuyện với ${target.name}`;
    
    let optionsContainer = document.getElementById('dialogue-options');
    optionsContainer.innerHTML = '';
    
    options.forEach(opt => {
        let btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.innerText = opt.text;
        btn.onclick = opt.outcome;
        optionsContainer.appendChild(btn);
    });
}
