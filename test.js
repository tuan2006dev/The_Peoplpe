// test.js
import fs from 'fs';
import { performance } from 'perf_hooks';

global.window = {
    addEventListener: () => {},
    requestAnimationFrame: (cb) => setTimeout(() => cb(performance.now()), 16),
};
global.ResizeObserver = class { observe() {} };

let dummyContext = new Proxy({}, {
    get: (target, prop) => {
        if (prop === 'measureText') return () => ({ width: 10 });
        if (prop === 'createPattern') return () => ({});
        if (typeof prop === 'string' && prop !== 'then') return () => {};
        return undefined;
    }
});

global.document = {
    getElementById: (id) => ({
        addEventListener: () => {},
        appendChild: () => {},
        classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
        click: () => {},
        innerText: '',
        value: '',
        innerHTML: '',
        clientWidth: 800,
        clientHeight: 600,
        style: {},
        getContext: () => dummyContext,
        getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 })
    }),
    querySelectorAll: () => [],
    querySelector: () => ({ classList: { contains: () => false } }),
    createElement: (tag) => {
        let el = { 
            style: {}, 
            classList: { add: () => {}, remove: () => {} }, 
            appendChild: () => {}, 
            remove: () => {},
            width: 800,
            height: 600,
            getContext: () => dummyContext
        };
        return el;
    },
    body: { appendChild: () => {} }
};

global.localStorage = {
    getItem: () => null,
    setItem: () => {}
};
global.alert = console.log;
global.performance = performance;
global.Image = class {
    constructor() {
        setTimeout(() => { if (this.onload) this.onload(); }, 10);
    }
};
global.requestAnimationFrame = window.requestAnimationFrame;

async function runTest() {
    try {
        console.log("Loading main.js...");
        await import('./js/main.js');
        
        console.log("Game initialized successfully!");
        console.log("Running simulation for 3 seconds...");
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const { state } = await import('./js/gameState.js');
        console.log(`Ticks simulated: ${state.ticks}`);
        console.log(`Entities: ${state.npcs.length} NPCs, ${state.animals.length} animals, ${state.monsters.length} monsters, ${state.neutrals.length} neutrals.`);
        
        console.log("Test completed successfully without fatal errors.");
        process.exit(0);
    } catch (e) {
        console.error("Test failed with error:", e);
        process.exit(1);
    }
}

runTest();
