const fs = require('fs');
const path = require('path');
const vm = require('vm');

function run() {
    const htmlPath = path.join(__dirname, 'public', 'client-login.html');
    if (!fs.existsSync(htmlPath)) {
        console.error("HTML file not found:", htmlPath);
        return;
    }
    const html = fs.readFileSync(htmlPath, 'utf8');
    
    // Extract script blocks
    const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
    let match;
    let blockCount = 0;
    while ((match = scriptRegex.exec(html)) !== null) {
        blockCount++;
        const code = match[1];
        try {
            new vm.Script(code);
            console.log(`Script block ${blockCount} syntax check: PASSED`);
        } catch (e) {
            console.error(`Script block ${blockCount} syntax check: FAILED`);
            console.error(e.message);
            // Print error location context
            const lines = code.split('\n');
            const errLine = e.stack.split('\n')[0].match(/:(\d+)/);
            if (errLine) {
                const lineNum = parseInt(errLine[1]);
                console.error("Error around line:", lineNum);
                for (let i = Math.max(0, lineNum - 5); i < Math.min(lines.length, lineNum + 5); i++) {
                    console.error(`${i + 1}: ${lines[i]}`);
                }
            }
        }
    }
}

run();
