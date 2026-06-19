import { state } from '../gameState.js';
import { TERRAIN } from '../config.js';

let tutorialStep = 0;
let isTutorialActive = false;

// Configs cho các bước hướng dẫn
const TUTORIAL_STEPS = [
    {
        title: "Bước 1: Khai phá Vùng Đất",
        desc: "Chào mừng vị Thần mới! Thế giới đang chìm trong biển nước. Hãy chọn công cụ <b>Đất</b> (màu xanh lá) bên trái, sau đó chỉnh 'Kích thước cọ' to lên và vẽ một vùng đất rộng lớn.",
        targetValue: 50,
        highlightBtn: "dat",
        check: () => {
            let landCount = 0;
            for (let x = 0; x < state.grid.length; x++) {
                for (let y = 0; y < state.grid[x].length; y++) {
                    if (state.grid[x][y] === TERRAIN.DAT) landCount++;
                }
            }
            return landCount;
        }
    },
    {
        title: "Bước 2: Gieo Mầm Sự Sống",
        desc: "Thật tuyệt! Nhưng con người cần gỗ để xây nhà. Hãy chọn <b>Rừng</b> và trồng một ít cây trên phần đất bạn vừa tạo.",
        targetValue: 15,
        highlightBtn: "rung",
        check: () => {
            let forestCount = 0;
            for (let x = 0; x < state.grid.length; x++) {
                for (let y = 0; y < state.grid[x].length; y++) {
                    if (state.grid[x][y] === TERRAIN.RUNG) forestCount++;
                }
            }
            return forestCount;
        }
    },
    {
        title: "Bước 3: Tạo Cư Dân",
        desc: "Mọi thứ đã sẵn sàng. Hãy kéo xuống phần 'Sự Sống', chọn công cụ <b>Tạo người</b> và nhấp nhiều lần lên đất để tạo ra những cư dân đầu tiên.",
        targetValue: 10,
        highlightBtn: "nguoi",
        check: () => state.npcs.length
    },
    {
        title: "Bước 4: Thúc Đẩy Thời Gian",
        desc: "Để xem thế giới phát triển nhanh hơn, hãy chỉnh <b>Tốc độ</b> lên <b>5x</b> hoặc <b>10x</b> ở thanh trên cùng bên phải màn hình.",
        targetValue: 2, // Tốc độ > 1
        highlightBtn: null,
        check: () => state.time.speedMultiplier
    },
    {
        title: "Bước 5: Chờ Đợi Bộ Lạc",
        desc: "Giờ hãy chờ đợi. Khi có đủ gỗ, người dân sẽ dựng lều. 4 túp lều cạnh nhau sẽ tạo thành một <b>Bộ Lạc</b>! (Mẹo: Bạn có thể dùng quyền năng <b>Ban phước</b> để giúp họ).",
        targetValue: 1,
        highlightBtn: "bless",
        check: () => state.tribes.length
    }
];

export function initTutorial() {
    const skipBtn = document.getElementById('btn-skip-tut');
    const resetBtn = document.getElementById('btn-reset-tut');
    const tutCheckbox = document.getElementById('set-tutorial');
    
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            endTutorial(false);
            if (tutCheckbox) tutCheckbox.checked = false;
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            localStorage.removeItem('thePeople_tutorialCompleted');
            if (tutCheckbox) tutCheckbox.checked = true;
            startTutorial();
            // Đóng tab settings
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        });
    }

    if (tutCheckbox) {
        const isCompleted = localStorage.getItem('thePeople_tutorialCompleted');
        tutCheckbox.checked = !isCompleted;
        
        tutCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                localStorage.removeItem('thePeople_tutorialCompleted');
                startTutorial();
            } else {
                endTutorial(false);
            }
        });
    }

    // Kiểm tra xem đã chơi hướng dẫn chưa
    const isCompleted = localStorage.getItem('thePeople_tutorialCompleted');
    if (!isCompleted) {
        // Delay một chút trước khi hiện
        setTimeout(() => startTutorial(), 1000);
    }
}

function startTutorial() {
    tutorialStep = 0;
    isTutorialActive = true;
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) overlay.classList.remove('hidden');
    renderCurrentStep();
}

export function endTutorial(showNotification = true) {
    isTutorialActive = false;
    const overlay = document.getElementById('tutorial-overlay');
    if (overlay) overlay.classList.add('hidden');
    clearAllHighlights();
    localStorage.setItem('thePeople_tutorialCompleted', 'true');
    
    const tutCheckbox = document.getElementById('set-tutorial');
    if (tutCheckbox) tutCheckbox.checked = false;

    if (showNotification) {
        // Thông báo chúc mừng
        import('./ui/notification.js').then(module => {
            module.showNotification("Bạn đã hoàn thành Hướng dẫn! Chúc bạn chơi vui vẻ.", "success");
        }).catch(e => console.log("Tutorial end notification failed", e));
    }
}

function clearAllHighlights() {
    document.querySelectorAll('.highlight-btn').forEach(el => el.classList.remove('highlight-btn'));
}

function renderCurrentStep() {
    if (!isTutorialActive) return;
    if (tutorialStep >= TUTORIAL_STEPS.length) {
        endTutorial(true);
        return;
    }

    const step = TUTORIAL_STEPS[tutorialStep];
    document.getElementById('tut-title').innerText = step.title;
    document.getElementById('tut-desc').innerHTML = step.desc;
    
    clearAllHighlights();
    if (step.highlightBtn) {
        const btn = document.querySelector(`button[data-tool="${step.highlightBtn}"]`);
        if (btn) btn.classList.add('highlight-btn');
    }
    
    updateProgressUI(0, step.targetValue);
}

function updateProgressUI(current, max) {
    const val = Math.min(current, max);
    const percent = Math.floor((val / max) * 100);
    document.getElementById('tut-progress-bar').style.width = percent + '%';
    document.getElementById('tut-progress-text').innerText = `${val}/${max}`;
}

// Gọi hàm này mỗi 30 ticks (0.5 giây ở speed 1x) trong main.js để kiểm tra
export function updateTutorialTick() {
    if (!isTutorialActive) return;
    if (state.ticks % 30 !== 0) return;

    const step = TUTORIAL_STEPS[tutorialStep];
    const currentValue = step.check();
    
    updateProgressUI(currentValue, step.targetValue);

    if (currentValue >= step.targetValue) {
        // Đã qua bước này
        tutorialStep++;
        renderCurrentStep();
    }
}
