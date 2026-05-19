const fs = require('fs');

function enforceBulletproofBlindaje(path) {
    let content = fs.readFileSync(path, 'utf8');
    
    const oldLogic = `        // 🔥 BLINDAJE DE RECETAS: Forzar foto, título e ingredientes originales
        if (finalItem.category === 'recipe' && finalItem.isSystem) {
            const originalRecipe = (window.SYSTEM_RECIPES || []).find(r => r.id === m.id);
            if (originalRecipe) {
                finalItem.url = originalRecipe.url;
                finalItem.title = originalRecipe.title;
                finalItem.ingredients = originalRecipe.ingredients;
            }
        }`;

    const newLogic = `        // 🔥 BLINDAJE DE RECETAS: Forzar foto, título e ingredientes originales
        const originalRecipe = (window.SYSTEM_RECIPES || []).find(r => r.id === m.id);
        if (originalRecipe) {
            finalItem.url = originalRecipe.url;
            finalItem.title = originalRecipe.title;
            finalItem.ingredients = originalRecipe.ingredients;
        }`;

    if (content.includes(oldLogic)) {
        content = content.replace(oldLogic, newLogic);
        fs.writeFileSync(path, content);
        console.log('Enforced bulletproof blindaje in ' + path);
    } else {
        console.log('Could not find old logic in ' + path);
    }
}

enforceBulletproofBlindaje('public/js/data-models.js');
enforceBulletproofBlindaje('js/data-models.js');
