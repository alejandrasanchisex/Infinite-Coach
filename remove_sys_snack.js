const fs = require('fs');

function removeSysSnack2(path) {
    let content = fs.readFileSync(path, 'utf8');
    
    // Encuentra el bloque de SYSTEM_RECIPES
    const match = content.match(/window\.SYSTEM_RECIPES = (\[[\s\S]*?\]);/);
    if (match) {
        let arr = JSON.parse(match[1]);
        
        // Filtra el snack
        arr = arr.filter(x => x.id !== 'sys-snack-2');
        
        const newStr = 'window.SYSTEM_RECIPES = ' + JSON.stringify(arr, null, 2) + ';';
        content = content.replace(match[0], newStr);
        fs.writeFileSync(path, content);
        console.log('Removed sys-snack-2 from ' + path);
    } else {
        console.log('SYSTEM_RECIPES not found in ' + path);
    }
}

removeSysSnack2('public/js/data-models.js');
removeSysSnack2('js/data-models.js');
