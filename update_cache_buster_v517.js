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
        
        // Match version patterns like v=516 or similar and update to 517
        const versionRegex = /(\?v=|\&v=)\d+/g;
        if (versionRegex.test(content)) {
            content = content.replace(versionRegex, (match, prefix) => `${prefix}517`);
            changed = true;
        }
        
        // Match const CURRENT_VERSION = '516';
        if (content.includes('CURRENT_VERSION')) {
            content = content.replace(/const CURRENT_VERSION = '\d+';/g, "const CURRENT_VERSION = '517';");
            content = content.replace(/const CURRENT_VERSION = "\d+";/g, 'const CURRENT_VERSION = "517";'); // handle mismatched quotes safely;
            changed = true;
        }

        // Match hardcoded redirections like client-dashboard.html?v=516
        const redirectVersionRegex = /client-dashboard\.html\?v=\d+/g;
        if (redirectVersionRegex.test(content)) {
            content = content.replace(redirectVersionRegex, "client-dashboard.html?v=517");
            changed = true;
        }
        
        if (changed) {
            fs.writeFileSync(filePath, content);
            console.log(`Updated cache buster to v517 in ${file}`);
            count++;
        }
    }
});

// Update sw.js comment/version
const swPath = path.join(publicDir, 'sw.js');
if (fs.existsSync(swPath)) {
    let swContent = fs.readFileSync(swPath, 'utf8');
    swContent = swContent.replace(/Service Worker Cache Buster v\d+/g, "Service Worker Cache Buster v517");
    fs.writeFileSync(swPath, swContent);
    console.log("Updated sw.js version comment to v517");
}

// Update src/app/page.tsx redirects
const pagePath = path.join(__dirname, 'src', 'app', 'page.tsx');
if (fs.existsSync(pagePath)) {
    let pageContent = fs.readFileSync(pagePath, 'utf8');
    pageContent = pageContent.replace(/client-dashboard\.html\?v=\d+/g, "client-dashboard.html?v=517");
    pageContent = pageContent.replace(/client-login\.html\?v=\d+/g, "client-login.html?v=517");
    fs.writeFileSync(pagePath, pageContent);
    console.log("Updated redirects in src/app/page.tsx to v517");
}

console.log(`Total HTML files updated: ${count}`);
