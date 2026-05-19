const fs = require('fs');

function hidePhotoUploadForExercises(path) {
    let content = fs.readFileSync(path, 'utf8');

    // Add IDs to the labels
    const oldFormHtml = `            <div class="form-group">
                <label>Imagen de la Ficha</label>
                <div class="upload-area">
                    <input type="text" id="editUrl" class="form-control" style="flex: 1;" placeholder="URL o sube un archivo...">
                    <label for="fileInput" class="btn-upload">`;
    const newFormHtml = `            <div class="form-group">
                <label id="editUrlLabel">Imagen de la Ficha</label>
                <div class="upload-area">
                    <input type="text" id="editUrl" class="form-control" style="flex: 1;" placeholder="URL o sube un archivo...">
                    <label for="fileInput" id="uploadBtnLabel" class="btn-upload">`;
                    
    if (content.includes(oldFormHtml)) {
        content = content.replace(oldFormHtml, newFormHtml);
    }

    // Update openEditModal function
    const oldOpenEdit = `        function openEditModal(id) {
            const m = mediaCache.find(item => item.id == id);
            if(!m) return;
            document.getElementById('editId').value = m.id;
            document.getElementById('editUrl').value = m.url;
            document.getElementById('editTitle').value = m.title;
            document.getElementById('editDesc').value = m.description || "";
            
            if (m.category === 'exercise') {
                document.getElementById('editIngredientsGroup').style.display = 'none';
                document.getElementById('editMuscleGroup').style.display = 'block';
                document.getElementById('editMuscle').value = Array.isArray(m.muscleGroup) ? m.muscleGroup.join(', ') : (m.muscleGroup || "");
            } else {
                document.getElementById('editIngredientsGroup').style.display = 'block';
                document.getElementById('editMuscleGroup').style.display = 'none';
                document.getElementById('editIngredients').value = Array.isArray(m.ingredients) ? m.ingredients.join(', ') : (m.ingredients || "");
            }
            
            document.getElementById('editModal').style.display = 'flex';
        }`;

    const newOpenEdit = `        function openEditModal(id) {
            const m = mediaCache.find(item => item.id == id);
            if(!m) return;
            document.getElementById('editId').value = m.id;
            document.getElementById('editUrl').value = m.url;
            document.getElementById('editTitle').value = m.title;
            document.getElementById('editDesc').value = m.description || "";
            
            if (m.category === 'exercise') {
                document.getElementById('editUrlLabel').innerText = 'Enlace del Vídeo (YouTube, Vimeo, etc.)';
                document.getElementById('uploadBtnLabel').style.display = 'none';
                
                document.getElementById('editIngredientsGroup').style.display = 'none';
                document.getElementById('editMuscleGroup').style.display = 'block';
                document.getElementById('editMuscle').value = Array.isArray(m.muscleGroup) ? m.muscleGroup.join(', ') : (m.muscleGroup || "");
            } else {
                document.getElementById('editUrlLabel').innerText = 'Imagen de la Ficha';
                document.getElementById('uploadBtnLabel').style.display = 'inline-flex';
                
                document.getElementById('editIngredientsGroup').style.display = 'block';
                document.getElementById('editMuscleGroup').style.display = 'none';
                document.getElementById('editIngredients').value = Array.isArray(m.ingredients) ? m.ingredients.join(', ') : (m.ingredients || "");
            }
            
            document.getElementById('editModal').style.display = 'flex';
        }`;

    if (content.includes('function openEditModal(id) {')) {
        const startIdx = content.indexOf('        function openEditModal(id) {');
        const endIdx = content.indexOf('        }', startIdx);
        if (startIdx !== -1 && endIdx !== -1) {
            const partToReplace = content.substring(startIdx, endIdx + 9);
            content = content.replace(partToReplace, newOpenEdit);
        }
    }
    
    // update cache buster
    content = content.replace(/js\/data-models\.js\?v=\d+/g, 'js/data-models.js?v=20260525');

    fs.writeFileSync(path, content);
    console.log('Fixed photo upload for exercises in ' + path);
}

hidePhotoUploadForExercises('public/trainer-media.html');
hidePhotoUploadForExercises('public/trainer-media-pro.html');
