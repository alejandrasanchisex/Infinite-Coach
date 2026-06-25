const fs = require('fs');
const path = require('path');

const FROM_VERSION = '520';
const TO_VERSION = '521';

const publicDir = path.join(__dirname, 'public');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    content = content.replace(/\?v=520/g, `?v=${TO_VERSION}`);
    content = content.replace(/CURRENT_VERSION\s*=\s*'520'/g, `CURRENT_VERSION = '${TO_VERSION}'`);
    content = content.replace(/Versión de la App: v520/g, `Versión de la App: v${TO_VERSION}`);
    content = content.replace(/fitness-app-v520/g, `fitness-app-v${TO_VERSION}`);
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
console.log(`\nCache buster updated from v${FROM_VERSION} to v${TO_VERSION} ✓`);
