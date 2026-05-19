const fs = require('fs');

function updateTerneraURL(path) {
    let content = fs.readFileSync(path, 'utf8');
    
    // Encuentra el bloque de SYSTEM_RECIPES
    const match = content.match(/window\.SYSTEM_RECIPES = (\[[\s\S]*?\]);/);
    if (match) {
        let arr = JSON.parse(match[1]);
        
        const item = arr.find(x => x.id === 'prof-rec-lomo-patatas');
        if (item) {
            item.url = "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1779007310662_Ternera_con_patatas.png";
            item.title = "Ternera con Patatas"; // Remove trailing space
        }
        
        const newStr = 'window.SYSTEM_RECIPES = ' + JSON.stringify(arr, null, 2) + ';';
        content = content.replace(match[0], newStr);
        fs.writeFileSync(path, content);
        console.log('Updated Ternera URL in ' + path);
    } else {
        console.log('SYSTEM_RECIPES not found in ' + path);
    }
}

updateTerneraURL('public/js/data-models.js');
updateTerneraURL('js/data-models.js');
