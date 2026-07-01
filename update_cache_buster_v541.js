const fs = require('fs'), path = require('path');
const FROM = '540', TO = '541';
const publicDir = path.join(__dirname, 'public');
function processFile(f) {
    let c = fs.readFileSync(f, 'utf8'), o = c;
    c = c.replace(/\?v=540/g, `?v=${TO}`).replace(/CURRENT_VERSION\s*=\s*'540'/g, `CURRENT_VERSION = '${TO}'`)
         .replace(/Versión de la App: v540/g, `Versión de la App: v${TO}`).replace(/fitness-app-v540/g, `fitness-app-v${TO}`);
    if (c !== o) { fs.writeFileSync(f, c, 'utf8'); console.log('Updated:', path.relative(__dirname, f)); }
}
function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory() && e.name !== 'node_modules' && e.name !== '.git') walk(p);
        else if (e.isFile() && /\.(html|js|json)$/.test(e.name)) processFile(p);
    }
}
walk(publicDir);
console.log(`v${FROM} → v${TO} ✓`);
