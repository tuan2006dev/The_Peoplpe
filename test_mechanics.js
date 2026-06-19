const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json'
};

const server = http.createServer((request, response) => {
    let filePath = '.' + request.url;
    if (filePath == './') filePath = './index.html';
    
    let extname = String(path.extname(filePath)).toLowerCase();
    let contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            response.writeHead(404);
            response.end('Error');
        } else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
    return new Promise((resolve) => {
        server.listen(3000, async () => {
            console.log('Server started on port 3000');
            let browser;
            try {
                browser = await puppeteer.launch({headless: "new"});
                const page = await browser.newPage();
                await page.setViewport({width: 1366, height: 768});
                
                console.log('Loading game...');
                await page.goto('http://127.0.0.1:3000/index.html', {waitUntil: 'networkidle0'});
                await delay(2000); // Wait for the game to fully render
                await page.screenshot({path: 'test_screenshots/01_initial_load.png'});
                console.log('Screenshot 01: Initial load');

                // Helper to click canvas
                const clickCanvas = async (x, y) => {
                    await page.mouse.click(x, y);
                    await delay(200);
                };

                // --- TEST 1: SPEED CONTROLS ---
                console.log('Testing Speed Controls...');
                await page.click('button[data-speed="5"]');
                await delay(500);
                await page.screenshot({path: 'test_screenshots/02_speed_5x.png'});

                // --- TEST 2: TERRAIN TOOLS ---
                console.log('Testing Terrain Tools...');
                // Click "Nui" tool
                await page.click('button[data-tool="nui"]');
                await delay(500);
                // Draw some mountains on canvas
                await clickCanvas(500, 300);
                await clickCanvas(520, 300);
                await clickCanvas(540, 300);
                await page.screenshot({path: 'test_screenshots/03_terrain_mountain.png'});

                // --- TEST 3: CREATING LIFE ---
                console.log('Testing Create Life...');
                await page.click('button[data-tool="nguoi"]');
                await delay(500);
                // Spawn a few people
                for (let i = 0; i < 5; i++) {
                    await clickCanvas(600 + (Math.random() * 50), 300 + (Math.random() * 50));
                }
                await delay(1000); // Let them spawn and render
                await page.screenshot({path: 'test_screenshots/04_create_people.png'});

                // --- TEST 4: GOD POWERS ---
                console.log('Testing God Powers...');
                await page.click('button[data-tool="bless"]');
                await delay(500);
                // Bless the area where we spawned people
                await clickCanvas(625, 325);
                await delay(1000);
                await page.screenshot({path: 'test_screenshots/05_god_power_bless.png'});

                // --- TEST 5: DISASTERS ---
                console.log('Testing Disasters...');
                await page.click('button[data-tool="mua"]');
                await delay(500);
                // Make it rain
                await clickCanvas(400, 400);
                await delay(1000);
                await page.screenshot({path: 'test_screenshots/06_disaster_rain.png'});

                // --- TEST 6: UI TABS (RIGHT SIDEBAR) ---
                console.log('Testing UI Tabs...');
                const tabs = [
                    'tab-people', 'tab-tribe', 'tab-kingdom', 
                    'tab-religion', 'tab-tech', 'tab-env', 'tab-story', 'tab-history'
                ];
                let tabCount = 7;
                for (const tabTarget of tabs) {
                    await page.click(`button[data-target="${tabTarget}"]`);
                    await delay(500);
                    await page.screenshot({path: `test_screenshots/0${tabCount}_tab_${tabTarget.replace('tab-', '')}.png`});
                    tabCount++;
                }

                console.log('All tests completed successfully.');

            } catch (e) {
                console.error("Puppeteer test error:", e);
            } finally {
                if (browser) {
                    await browser.close();
                }
                server.close();
                resolve();
            }
        });
    });
}

// Make directory for screenshots
const fsPromises = require('fs').promises;
async function setupAndRun() {
    try {
        await fsPromises.mkdir('test_screenshots', { recursive: true });
        await runTests();
    } catch (e) {
        console.error("Setup error:", e);
    }
}

setupAndRun();
