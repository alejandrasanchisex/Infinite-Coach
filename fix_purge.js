const fs = require('fs');

function fixPurge(path) {
    let content = fs.readFileSync(path, 'utf8');
    
    // Eliminar la purga rota
    const brokenPurgeRegex = /\/\/ 🔥 PURGA DE RECETAS NO OFICIALES[\s\S]*?try \{ localStorage\.setItem\(sKey, JSON\.stringify\(data\)\); \} catch\(e\)\{\}\n        \}\n    \}/;
    content = content.replace(brokenPurgeRegex, '');
    
    // Inyectarla en el lugar correcto
    const correctPurge = `
    const data = { ...defaults, ...parsed };
    // 🔥 PURGA DE RECETAS NO OFICIALES (Blindaje 145)
    if (data.media && Array.isArray(data.media)) {
        const initialLen = data.media.length;
        data.media = data.media.filter(m => {
            if (m.category !== 'recipe') return true; 
            return String(m.id).startsWith('sys-');
        });
        if (data.media.length !== initialLen) {
            console.log("🧹 Purga de recetas no oficiales ejecutada.");
            try { localStorage.setItem(sKey, JSON.stringify(data)); } catch(e){}
        }
    }
    return data;
`;
    content = content.replace(/return \{ \.\.\.defaults, \.\.\.parsed \};/, correctPurge);
    
    fs.writeFileSync(path, content);
    console.log('Fixed purge in ' + path);
}

fixPurge('public/js/data-models.js');
fixPurge('js/data-models.js');
