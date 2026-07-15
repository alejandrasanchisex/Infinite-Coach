const fs = require('fs');
const path = require('path');

const SCRATCH_DIR = path.join('C:', 'Users', 'usuario', '.gemini', 'antigravity', 'brain', '220f53f9-6dfd-49b6-90bc-ebd0af9a1c2e', 'scratch');

function run() {
    if (!fs.existsSync(SCRATCH_DIR)) {
        console.log("Scratch dir not found:", SCRATCH_DIR);
        return;
    }
    const files = fs.readdirSync(SCRATCH_DIR);
    const details = files.map(file => {
        const filePath = path.join(SCRATCH_DIR, file);
        const stats = fs.statSync(filePath);
        return {
            name: file,
            mtime: stats.mtime,
            size: stats.size
        };
    });
    
    // Sort by modification time descending
    details.sort((a, b) => b.mtime - a.mtime);
    
    console.log("Recent files in scratch (newest first):");
    details.slice(0, 40).forEach(d => {
        console.log(`- ${d.name} (${d.size} bytes) - Modified: ${d.mtime.toISOString()}`);
    });
}

run();
