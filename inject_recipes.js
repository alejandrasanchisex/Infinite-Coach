const fs = require('fs');

const recipes = require('./admin_recipes.json');
// Limpiar las recetas: asegurarnos de que tengan id, title, url, ingredients, category='recipe', type='image'
const cleanRecipes = recipes.map(r => ({
    id: r.id,
    type: 'image',
    category: 'recipe',
    title: r.title,
    url: r.url,
    ingredients: r.ingredients || 'N/A',
    description: r.description || ''
}));

const recipesJsStr = `// RECETAS A FUEGO (148)\nwindow.SYSTEM_RECIPES = ${JSON.stringify(cleanRecipes, null, 2)};\n`;

function updateFile(path) {
    let content = fs.readFileSync(path, 'utf8');
    
    // Si ya pusimos SYSTEM_RECIPES antes, reemplazar
    if (content.includes('window.SYSTEM_RECIPES =')) {
        content = content.replace(/window\.SYSTEM_RECIPES = \[[\s\S]*?\];\n/, recipesJsStr);
    } else {
        // Encontrar window.SYSTEM_MEDIA y ponerlo justo antes
        content = content.replace(/window\.SYSTEM_MEDIA\s*=\s*\[/, recipesJsStr + '\nwindow.SYSTEM_MEDIA = [');
    }
    
    // Cambiar window.SYSTEM_MEDIA para que ya no contenga las RECETAS(20) si las tiene
    content = content.replace(/\/\/ RECETAS \(20\)[\s\S]*?\/\/ EJERCICIOS/g, '// EJERCICIOS');
    
    // Cambiar getAll para que use SYSTEM_RECIPES
    if (!content.includes('const system = [...(window.SYSTEM_RECIPES || []), ...(window.SYSTEM_MEDIA || [])];')) {
        content = content.replace(
            /const system = window\.SYSTEM_MEDIA \|\| \[\];/,
            'const system = [...(window.SYSTEM_RECIPES || []), ...(window.SYSTEM_MEDIA || [])];'
        );
    }

    fs.writeFileSync(path, content);
    console.log('Updated ' + path);
}

updateFile('public/js/data-models.js');
updateFile('js/data-models.js');

// Ahora vaciar custom-recipes.js para que no interfiera
fs.writeFileSync('js/custom-recipes.js', '// Vaciado porque las recetas ahora están grabadas a fuego en data-models.js\n');
fs.writeFileSync('public/js/custom-recipes.js', '// Vaciado porque las recetas ahora están grabadas a fuego en data-models.js\n');

