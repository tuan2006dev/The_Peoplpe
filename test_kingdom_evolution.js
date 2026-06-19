const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');
const fsPromises = require('fs').promises;

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
                browser = await puppeteer.launch({
                    headless: "new",
                    protocolTimeout: 60000 // Tăng timeout lên 60 giây
                });
                const page = await browser.newPage();
                await page.setViewport({width: 1366, height: 768});
                // Tăng timeout mặc định của page
                page.setDefaultTimeout(60000);
                
                console.log('Loading game...');
                await page.goto('http://127.0.0.1:3000/index.html', {waitUntil: 'networkidle0'});
                await delay(2000); 

                const clickCanvas = async (x, y) => {
                    await page.mouse.click(x, y);
                    await delay(100);
                };

                console.log('1. Enabling Debug panel...');
                await page.click('button[data-target="tab-settings"]');
                await delay(500);
                await page.click('#set-debug'); // Enable debug to read #dbg-kingdoms easily
                await delay(500);

                // Vẽ đất + rừng trực tiếp qua JS injection (nhanh hơn nhiều so với click)
                console.log('2. Creating massive landmass & forests via JS injection...');
                await page.evaluate(() => {
                    const TERRAIN = { DAT: 0, NUOC: 1, RUNG: 2, NUI: 3 };
                    // Tìm module state từ window (game đã expose ra)
                    // Thay vào đó, dùng tool buttons và brush size để vẽ bằng evaluate
                    document.getElementById('brush-size').value = 15;
                    document.getElementById('brush-size').dispatchEvent(new Event('input'));
                });
                
                // Click nút đất và vẽ bằng mousedown+move để nhanh hơn
                await page.click('button[data-tool="dat"]');
                await delay(300);
                
                // Dùng drag (mousedown → move → mouseup) thay vì nhiều click riêng lẻ
                for(let x = 300; x <= 950; x += 80) {
                    await page.mouse.move(x, 200);
                    await page.mouse.down();
                    for(let y = 200; y <= 600; y += 30) {
                        await page.mouse.move(x, y);
                    }
                    await page.mouse.up();
                    await delay(30);
                }

                // Vẽ rừng
                await page.click('button[data-tool="rung"]');
                await delay(300);
                for(let x = 400; x <= 900; x += 120) {
                    await page.mouse.move(x, 300);
                    await page.mouse.down();
                    for(let y = 300; y <= 500; y += 30) {
                        await page.mouse.move(x, y);
                    }
                    await page.mouse.up();
                    await delay(30);
                }
                await page.screenshot({path: 'test_screenshots/evo_01_landmass.png'});


                console.log('3. Spawning life...');
                await page.click('button[data-tool="nguoi"]');
                await delay(500);
                for(let i=0; i<60; i++) {
                    let rx = 500 + Math.random() * 400;
                    let ry = 300 + Math.random() * 200;
                    await clickCanvas(rx, ry);
                }
                await page.screenshot({path: 'test_screenshots/evo_02_life_spawned.png'});

                console.log('4. Setting Max Speed (1000x)...');
                await page.click('button[data-speed="1000"]');
                await delay(1000);

                console.log('5. Waiting for Kingdom evolution (polling & blessing)...');
                await page.click('button[data-tool="bless"]');
                await delay(500);

                let kingdomCount = 0;
                let attempts = 0;
                let maxAttempts = 60; // Up to 5 minutes (60 * 5s)
                
                while(kingdomCount === 0 && attempts < maxAttempts) {
                    attempts++;
                    // Bless random locations to speed up growth
                    for(let i=0; i<3; i++) {
                        let rx = 500 + Math.random() * 400;
                        let ry = 300 + Math.random() * 200;
                        await clickCanvas(rx, ry);
                    }
                    
                    await delay(5000); // Wait 5 seconds
                    
                    // Check kingdom count
                    const countStr = await page.evaluate(() => {
                        return document.getElementById('dbg-kingdoms').innerText;
                    });
                    kingdomCount = parseInt(countStr) || 0;
                    
                    const popStr = await page.evaluate(() => document.getElementById('pop-display').innerText);
                    const yearStr = await page.evaluate(() => document.getElementById('time-display').innerText);
                    
                    console.log(`Attempt ${attempts}/${maxAttempts}: ${kingdomCount} Kingdoms | Pop: ${popStr} | Time: ${yearStr}`);
                }

                if (kingdomCount > 0) {
                    console.log('>>> KINGDOM DETECTED! Taking screenshot...');
                    await page.click('button[data-target="tab-kingdom"]');
                    await delay(1000);
                    await page.screenshot({path: 'test_screenshots/evo_03_kingdom_born.png'});

                    console.log('6. Letting the Kingdom expand and develop for another 60 seconds...');
                    // Keep blessing to keep them alive and growing
                    for(let i=0; i<12; i++) {
                        await delay(5000);
                        for(let j=0; j<2; j++) {
                            let rx = 500 + Math.random() * 400;
                            let ry = 300 + Math.random() * 200;
                            await clickCanvas(rx, ry);
                        }
                    }

                    console.log('>>> Expansion complete! Taking final screenshots...');
                    await page.screenshot({path: 'test_screenshots/evo_04_kingdom_expanded.png'});
                    
                    // Check Kingdom Tab
                    await page.click('button[data-target="tab-kingdom"]');
                    await delay(1000);
                    await page.screenshot({path: 'test_screenshots/evo_05_kingdom_tab.png'});

                    // Check Tech Tab
                    await page.click('button[data-target="tab-tech"]');
                    await delay(1000);
                    await page.screenshot({path: 'test_screenshots/evo_06_tech_tab.png'});
                    
                    console.log('All tests completed successfully!');
                } else {
                    console.log('Timeout reached without forming a kingdom.');
                    await page.screenshot({path: 'test_screenshots/evo_timeout_failure.png'});
                }

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

async function setupAndRun() {
    try {
        await fsPromises.mkdir('test_screenshots', { recursive: true });
        await runTests();
    } catch (e) {
        console.error("Setup error:", e);
    }
}

setupAndRun();
