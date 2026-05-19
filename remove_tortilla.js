const fs = require('fs');

function removeTortillaDuplicate(path) {
    let content = fs.readFileSync(path, 'utf8');
    
    // Encuentra el bloque de SYSTEM_RECIPES
    const match = content.match(/window\.SYSTEM_RECIPES = (\[[\s\S]*?\]);/);
    if (match) {
        let arr = JSON.parse(match[1]);
        
        // Copia la descripción a la oficial
        const target = arr.find(x => x.id === 'prof-rec-tortilla-patata-pro');
        const duplicate = arr.find(x => x.id === 'cloud-pbs8qpwda');
        
        if (target && duplicate) {
            target.description = duplicate.description;
        }
        
        // Filtra el duplicado
        arr = arr.filter(x => x.id !== 'cloud-pbs8qpwda');
        
        const newStr = 'window.SYSTEM_RECIPES = ' + JSON.stringify(arr, null, 2) + ';';
        content = content.replace(match[0], newStr);
        fs.writeFileSync(path, content);
        console.log('Removed duplicate from ' + path);
    } else {
        console.log('SYSTEM_RECIPES not found in ' + path);
    }
}

removeTortillaDuplicate('public/js/data-models.js');
removeTortillaDuplicate('js/data-models.js');
