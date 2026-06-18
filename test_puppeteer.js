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

(async () => {
    server.listen(3000, async () => {
        try {
            const browser = await puppeteer.launch({headless: "new"});
            const page = await browser.newPage();
            page.setViewport({width: 1280, height: 720});
            await page.goto('http://127.0.0.1:3000/index.html', {waitUntil: 'networkidle0'});
            await page.screenshot({path: 'screenshot.png'});
            console.log('Screenshot saved to screenshot.png');
            await browser.close();
        } catch (e) {
            console.error("Puppeteer error:", e);
        } finally {
            server.close();
        }
    });
})();
