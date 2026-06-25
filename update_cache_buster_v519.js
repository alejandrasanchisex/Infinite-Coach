const fs = require('fs');
const path = require('path');

const OLD_V = /(\?v=|\&v=)\d+/g;
const NEW_V = '$1519';

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir);

let count = 0;
files.forEach(file => {
    if (path.extname(file) === '.html') {
        const filePath = path.join(publicDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;

        if (OLD_V.test(content)) {
            content = content.replace(OLD_V, NEW_V);
            changed = true;
        }
        OLD_V.lastIndex = 0;

        if (content.includes('CURRENT_VERSION')) {
            content = content.replace(/const CURRENT_VERSION = '\d+';/g, "const CURRENT_VERSION = '519';");
            content = content.replace(/const CURRENT_VERSION = "\d+";/g, 'const CURRENT_VERSION = "519";');
            changed = true;
        }

        content = content.replace(/client-dashboard\.html\?v=\d+/g, "client-dashboard.html?v=519");

        if (changed) {
            fs.writeFileSync(filePath, content);
            console.log(`Updated: ${file}`);
            count++;
        }
    }
});

const swPath = path.join(publicDir, 'sw.js');
if (fs.existsSync(swPath)) {
    let sw = fs.readFileSync(swPath, 'utf8');
    sw = sw.replace(/Service Worker Cache Buster v\d+/g, "Service Worker Cache Buster v519");
    fs.writeFileSync(swPath, sw);
    console.log("Updated sw.js → v519");
}

const pagePath = path.join(__dirname, 'src', 'app', 'page.tsx');
if (fs.existsSync(pagePath)) {
    let pg = fs.readFileSync(pagePath, 'utf8');
    pg = pg.replace(/client-dashboard\.html\?v=\d+/g, "client-dashboard.html?v=519");
    pg = pg.replace(/client-login\.html\?v=\d+/g, "client-login.html?v=519");
    fs.writeFileSync(pagePath, pg);
    console.log("Updated page.tsx → v519");
}

console.log(`\nTotal HTML files updated: ${count}`);
