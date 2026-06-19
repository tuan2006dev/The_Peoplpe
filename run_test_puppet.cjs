const puppeteer = require('puppeteer');

(async () => {
    console.log("Khởi động Puppeteer...");
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Catch console logs
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    console.log("Truy cập localhost:8080...");
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle0', timeout: 30000 });
    
    console.log("Gọi window.runAutomatedTest(5000)...");
    
    // Run the test in the page context and wait for it to finish.
    // The test creates a report div. We can wait for it.
    await page.evaluate(() => {
        return new Promise((resolve) => {
            window.runAutomatedTest(5000);
            
            // Wait a bit for UI to update
            setTimeout(() => {
                resolve();
            }, 100);
        });
    });
    
    console.log("Đã chạy xong, đang thu thập kết quả...");
    
    const reportHtml = await page.evaluate(() => {
        // Find the result div (the last appended div)
        let divs = document.querySelectorAll('div');
        for (let i = divs.length - 1; i >= 0; i--) {
            if (divs[i].innerHTML.includes('Báo cáo Automated Test')) {
                return divs[i].innerText;
            }
        }
        return "Không tìm thấy báo cáo.";
    });
    
    console.log("=== KẾT QUẢ TEST ===");
    console.log(reportHtml);
    console.log("====================");
    
    await browser.close();
    process.exit(0);
})();
