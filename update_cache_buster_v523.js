const fs = require('fs'), path = require('path');
const FROM = '522', TO = '523';
const publicDir = path.join(__dirname, 'public');
function processFile(f) {
    let c = fs.readFileSync(f, 'utf8'), o = c;
    c = c.replace(/\?v=522/g, `?v=${TO}`).replace(/CURRENT_VERSION\s*=\s*'522'/g, `CURRENT_VERSION = '${TO}'`)
         .replace(/Versión de la App: v522/g, `Versión de la App: v${TO}`).replace(/fitness-app-v522/g, `fitness-app-v${TO}`);
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
