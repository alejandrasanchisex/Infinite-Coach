const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// Read target version from command line args (e.g. node scripts/bump_version.js 661)
const targetVersion = process.argv[2];

if (!targetVersion || !/^\d+$/.test(targetVersion)) {
    console.error('❌ Error: Debes especificar un número de versión válido (ejemplo: node scripts/bump_version.js 661)');
    process.exit(1);
}

function walk(dir, callback) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    files.forEach(file => {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            if (file.name !== 'node_modules' && file.name !== '.git') {
                walk(fullPath, callback);
            }
        } else if (file.isFile() && /\.(html|js|json|css)$/.test(file.name)) {
            callback(fullPath, file.name);
        }
    });
}

console.log(`🚀 Iniciando actualización robusta a la versión v${targetVersion}...`);

walk(publicDir, (filePath, fileName) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Reemplazar CURRENT_VERSION = '...' o "..." (todos, sin importar el número previo)
    const currentVersionRegex = /(CURRENT_VERSION\s*=\s*['"])\d+(['"];?)/g;
    if (content.match(currentVersionRegex)) {
        content = content.replace(currentVersionRegex, `$1${targetVersion}$2`);
        changed = true;
    }

    // 2. Reemplazar window.APP_VERSION = '...' o "..." (todos)
    const appVersionRegex = /(window\.APP_VERSION\s*=\s*['"])\d+(['"];?)/g;
    if (content.match(appVersionRegex)) {
        content = content.replace(appVersionRegex, `$1${targetVersion}$2`);
        changed = true;
    }

    // 3. Reemplazar query params ?v=... o &v=... en imports
    const queryParamRegex = /([\?&]v=)\d+/g;
    if (content.match(queryParamRegex)) {
        content = content.replace(queryParamRegex, `$1${targetVersion}`);
        changed = true;
    }

    // 4. Reemplazar etiquetas de versión en texto legible (ej: Versión de la App: v660)
    const labelRegex = /(Versión de la App:\s*v)\d+/gi;
    if (content.match(labelRegex)) {
        content = content.replace(labelRegex, `$1${targetVersion}`);
        changed = true;
    }

    // 5. Reemplazar prefijos de caché de service workers u otros (ej: fitness-app-v660)
    const prefixRegex = /(fitness-app-v)\d+/gi;
    if (content.match(prefixRegex)) {
        content = content.replace(prefixRegex, `$1${targetVersion}`);
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Actualizado: ${path.relative(publicDir, filePath)}`);
    }
});

// Actualizar el archivo version.json central
const jsonPath = path.join(publicDir, 'version.json');
try {
    fs.writeFileSync(jsonPath, JSON.stringify({ version: targetVersion }, null, 2), 'utf8');
    console.log(`✅ Archivo version.json actualizado centralmente a la v${targetVersion}`);
} catch (e) {
    console.error('❌ Error al escribir version.json:', e.message);
}

console.log(`🎉 ¡App actualizada con éxito a la versión v${targetVersion}!`);
