const fs = require('fs');

function enforceBlindaje(path) {
    let content = fs.readFileSync(path, 'utf8');
    
    const oldLogic = `    personal.forEach(m => {
        const isHidden = hidden.includes(m.id);
        mediaMap.set(String(m.id), { ...m, isSystem: String(m.id).startsWith('sys-'), status: isHidden ? 'hidden' : 'active' });
    });`;

    const newLogic = `    personal.forEach(m => {
        const isHidden = hidden.includes(m.id);
        let finalItem = { ...m, isSystem: String(m.id).startsWith('sys-'), status: isHidden ? 'hidden' : 'active' };
        
        // 🔥 BLINDAJE DE RECETAS: Forzar foto, título e ingredientes originales
        if (finalItem.category === 'recipe' && finalItem.isSystem) {
            const originalRecipe = (window.SYSTEM_RECIPES || []).find(r => r.id === m.id);
            if (originalRecipe) {
                finalItem.url = originalRecipe.url;
                finalItem.title = originalRecipe.title;
                finalItem.ingredients = originalRecipe.ingredients;
            }
        }
        
        mediaMap.set(String(m.id), finalItem);
    });`;

    if (content.includes(oldLogic)) {
        content = content.replace(oldLogic, newLogic);
        fs.writeFileSync(path, content);
        console.log('Enforced blindaje in ' + path);
    } else {
        console.log('Could not find old logic in ' + path);
    }
}

enforceBlindaje('public/js/data-models.js');
enforceBlindaje('js/data-models.js');
