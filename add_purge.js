const fs = require('fs');

function addPurge(path) {
    let content = fs.readFileSync(path, 'utf8');
    
    const purgeLogic = `
    // 🔥 PURGA DE RECETAS NO OFICIALES (Blindaje 145)
    if (data.media && Array.isArray(data.media)) {
        const initialLen = data.media.length;
        data.media = data.media.filter(m => {
            if (m.category !== 'recipe') return true; // Mantener ejercicios
            // Mantener solo las que son variaciones editadas de las recetas blindadas (empiezan por sys-)
            return String(m.id).startsWith('sys-');
        });
        if (data.media.length !== initialLen) {
            console.log("🧹 Purga de recetas no oficiales ejecutada.");
            // Guardar silenciosamente
            try { localStorage.setItem(sKey, JSON.stringify(data)); } catch(e){}
        }
    }
`;

    if (!content.includes('PURGA DE RECETAS NO OFICIALES')) {
        content = content.replace(
            /const defaults = \{/g,
            purgeLogic + '\n    const defaults = {'
        );
        fs.writeFileSync(path, content);
        console.log('Added purge to ' + path);
    }
}

addPurge('public/js/data-models.js');
addPurge('js/data-models.js');
