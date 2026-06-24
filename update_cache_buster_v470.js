const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const files = fs.readdirSync(publicDir);

let count = 0;
files.forEach(file => {
    if (path.extname(file) === '.html') {
        const filePath = path.join(publicDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        let changed = false;
        
        // Match version patterns like v=469 or similar and update to 470
        const versionRegex = /(\?v=|\&v=)\d+/g;
        if (versionRegex.test(content)) {
            content = content.replace(versionRegex, (match, prefix) => `${prefix}470`);
            changed = true;
        }
        
        // Match const CURRENT_VERSION = '467';
        if (content.includes('CURRENT_VERSION')) {
            content = content.replace(/const CURRENT_VERSION = '\d+';/g, "const CURRENT_VERSION = '470';");
            content = content.replace(/const CURRENT_VERSION = "\d+";/g, 'const CURRENT_VERSION = "470";');
            changed = true;
        }

        // Match hardcoded redirections like client-dashboard.html?v=453
        const redirectVersionRegex = /client-dashboard\.html\?v=\d+/g;
        if (redirectVersionRegex.test(content)) {
            content = content.replace(redirectVersionRegex, "client-dashboard.html?v=470");
            changed = true;
        }
        
        if (changed) {
            fs.writeFileSync(filePath, content);
            console.log(`Updated cache buster to v470 in ${file}`);
            count++;
        }
    }
});

// Update sw.js comment/version
const swPath = path.join(publicDir, 'sw.js');
if (fs.existsSync(swPath)) {
    let swContent = fs.readFileSync(swPath, 'utf8');
    swContent = swContent.replace(/Service Worker Cache Buster v\d+/g, "Service Worker Cache Buster v470");
    fs.writeFileSync(swPath, swContent);
    console.log("Updated sw.js version comment to v470");
}

// Update src/app/page.tsx redirects
const pagePath = path.join(__dirname, 'src', 'app', 'page.tsx');
if (fs.existsSync(pagePath)) {
    let pageContent = fs.readFileSync(pagePath, 'utf8');
    pageContent = pageContent.replace(/client-dashboard\.html\?v=\d+/g, "client-dashboard.html?v=470");
    pageContent = pageContent.replace(/client-login\.html\?v=\d+/g, "client-login.html?v=470");
    fs.writeFileSync(pagePath, pageContent);
    console.log("Updated redirects in src/app/page.tsx to v470");
}

console.log(`Total HTML files updated: ${count}`);
