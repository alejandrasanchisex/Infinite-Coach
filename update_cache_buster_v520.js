const fs = require('fs');
const path = require('path');

const FROM_VERSION = '519';
const TO_VERSION = '520';

const publicDir = path.join(__dirname, 'public');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // Replace ?v=519 with ?v=520
    content = content.replace(/\?v=519/g, `?v=${TO_VERSION}`);
    // Replace CURRENT_VERSION = '519' with CURRENT_VERSION = '520'
    content = content.replace(/CURRENT_VERSION\s*=\s*'519'/g, `CURRENT_VERSION = '${TO_VERSION}'`);
    // Replace version display text
    content = content.replace(/Versión de la App: v519/g, `Versión de la App: v${TO_VERSION}`);
    // Replace cache name strings like 'fitness-app-v519'
    content = content.replace(/fitness-app-v519/g, `fitness-app-v${TO_VERSION}`);

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${path.relative(__dirname, filePath)}`);
    }
}

function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name === '.git') continue;
            walk(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.html') || entry.name.endsWith('.js') || entry.name.endsWith('.json'))) {
            processFile(fullPath);
        }
    }
}

walk(publicDir);

// Also check sw.js in root if it exists
const swPath = path.join(__dirname, 'public', 'sw.js');
if (fs.existsSync(swPath)) {
    processFile(swPath);
}

console.log(`\nCache buster updated from v${FROM_VERSION} to v${TO_VERSION} ✓`);
