/* ============================================
   DIET EDITOR LOGIC (Core)
   ============================================ */

window.editingDietId = null;
window.activeMealForm = null;

window.getWeightPerUnit = function(foodName) {
    const name = (foodName || '').trim().toLowerCase();
    if (typeof window.foodDatabase !== 'undefined' && Array.isArray(window.foodDatabase)) {
        const dbMatch = window.foodDatabase.find(f => f && f.names && Array.isArray(f.names) && f.names.some(n => n && typeof n === 'string' && (n.trim().toLowerCase() === name || name.includes(n.trim().toLowerCase()) || n.trim().toLowerCase().includes(name))));
        if (dbMatch && dbMatch.weightPerUnit) {
            return dbMatch.weightPerUnit;
        }
    }
    const weights = {
        'plátano': 120, 'banana': 120, 'manzana': 150, 'pera': 150, 'naranja': 150,
        'melocotón': 150, 'durazno': 150, 'kiwi': 75, 'mandarina': 80, 'limón': 100,
        'huevo': 55, 'clara': 35, 'dátil': 8, 'tostada': 30, 'rebanada': 30,
        'pan': 30, 'tortita': 8, 'tortilla': 30, 'quesito': 15, 'yogur': 125,
        'lata': 60, 'atún': 60, 'patata': 150, 'papa': 150, 'boniato': 150,
        'batata': 150, 'aguacate': 150, 'tomate': 120, 'zanahoria': 80
    };
    for (const key in weights) {
        if (name.includes(key)) {
            return weights[key];
        }
    }
    return null;
};

window.onDietEditorClosed = function () {
    console.log('Diet editor closed');
};

window.duplicateDiet = function (dietId) {
    const diet = Diets.getById(dietId);
    if (!diet) {
        showToast('No se encontró la dieta a copiar', 'error');
        return;
    }

    const copy = JSON.parse(JSON.stringify(diet));
    copy.id = null; // Mark as new for creation
    copy.name = copy.name + ' (Copia)';
    copy.isTemplate = true;

    const created = Diets.create(copy);
    if (created && typeof window.viewDiet === 'function') {
        window.viewDiet(created.id);
    } else {
        showToast('Dieta duplicada correctamente', 'success');
        if (typeof renderDiets === 'function') renderDiets();
    }
};

window.editDietName = function (dietId) {
    const diet = Diets.getById(dietId);
    if (!diet) return;
    
    const newName = prompt('Introduce el nuevo título para esta dieta:', diet.name);
    if (newName && newName.trim() !== '') {
        Diets.update(dietId, { name: newName.trim() });
        showToast('Nombre de la dieta actualizado', 'success');
        
        // Refresh local editor dynamically
        if (typeof window.renderDietEditor === 'function') {
            window.renderDietEditor();
        } else if (typeof renderDiets === 'function') {
            renderDiets();
        }
    }
};


/* --- RENDER FUNCTIONS --- */

window.getDietEditorHTML = function (diet) {
    let currentCalories = 0;
    let currentMacros = { protein: 0, carbs: 0, fat: 0 };

    (diet.meals || []).forEach(meal => {
        const option1Foods = (meal.foods || []).filter(f => !f.option || Number(f.option) === 1);
        option1Foods.forEach(food => {
            currentCalories += parseFloat(food.calories || 0);
            currentMacros.protein += parseFloat(food.protein || 0);
            currentMacros.carbs += parseFloat(food.carbs || 0);
            currentMacros.fat += parseFloat(food.fat || 0);
        });
    });

    const proteinPercent = diet.macros?.protein ? Math.min(100, (currentMacros.protein / diet.macros.protein) * 100) : 0;
    const carbPercent = diet.macros?.carbs ? Math.min(100, (currentMacros.carbs / diet.macros.carbs) * 100) : 0;
    const fatPercent = diet.macros?.fat ? Math.min(100, (currentMacros.fat / diet.macros.fat) * 100) : 0;
    const calPercent = diet.calories ? Math.min(100, (currentCalories / diet.calories) * 100) : 0;

    const goalInputStyle = 'width: 60px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; color: inherit; text-align: center; padding: 2px; font-size: 0.9em;';

    const roundedCals = Math.round(currentCalories * 10) / 10;
    const roundedProtein = Math.round(currentMacros.protein * 10) / 10;
    const roundedCarbs = Math.round(currentMacros.carbs * 10) / 10;
    const roundedFat = Math.round(currentMacros.fat * 10) / 10;

    return `
        <div class="mb-lg flex-between align-start">
            <div>
                <div class="flex align-center gap-sm mb-xs">
                    <h2 class="text-primary m-0" style="font-size: 1.8rem; line-height: 1;">
                        ${diet.name || 'Sin título'}
                    </h2>
                    <button class="btn btn-xs btn-outline" style="padding: 2px 8px; font-size: 0.7rem; border-color: rgba(255,255,255,0.2);" onclick="window.editDietName('${diet.id}')">✏️ Editar Nombre</button>
                </div>
                <div class="text-muted mt-xs" style="font-size: 1.1rem;">
                    <strong>${diet.calories || 0} kcal</strong> - <span style="font-size: 0.85em;">${diet.description || 'Sin descripción'}</span>
                </div>
            </div>
        </div>

        <div class="card bg-secondary mb-lg p-md">
             <h4 class="text-center text-muted mb-md text-sm uppercase">Progreso Nutricional vs Objetivo</h4>
             <div class="grid grid-4 gap-md text-center">
                <div>
                    <div class="text-xs text-muted mb-xs uppercase">Calorías</div>
                    <div class="text-lg font-bold text-white flex justify-center align-center gap-xs">
                        ${roundedCals} <span class="text-xs text-muted">/ <input type="number" value="${diet.calories || 0}" onchange="window.updateDietGoal('calories', this.value)" style="${goalInputStyle}"></span>
                    </div>
                     <div class="progress-bar mt-xs" style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px;"><div style="width: ${calPercent}%; height: 100%; background: var(--primary-color); border-radius: 3px; transition: width 0.3s;"></div></div>
                </div>
                <div>
                    <div class="text-xs text-muted mb-xs uppercase">Proteína</div>
                    <div class="text-lg font-bold text-success flex justify-center align-center gap-xs">
                        ${roundedProtein}g <span class="text-xs text-muted">/ <input type="number" value="${diet.macros?.protein || 0}" onchange="window.updateDietGoal('protein', this.value)" style="${goalInputStyle}">g</span>
                    </div>
                     <div class="progress-bar mt-xs" style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px;"><div style="width: ${proteinPercent}%; height: 100%; background: #00e676; border-radius: 3px; transition: width 0.3s;"></div></div>
                </div>
                <div>
                    <div class="text-xs text-muted mb-xs uppercase">Carbos</div>
                    <div class="text-lg font-bold text-warning flex justify-center align-center gap-xs">
                        ${roundedCarbs}g <span class="text-xs text-muted">/ <input type="number" value="${diet.macros?.carbs || 0}" onchange="window.updateDietGoal('carbs', this.value)" style="${goalInputStyle}">g</span>
                    </div>
                     <div class="progress-bar mt-xs" style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px;"><div style="width: ${carbPercent}%; height: 100%; background: #ff9800; border-radius: 3px; transition: width 0.3s;"></div></div>
                </div>
                <div>
                    <div class="text-xs text-muted mb-xs uppercase">Grasas</div>
                    <div class="text-lg font-bold text-error flex justify-center align-center gap-xs">
                        ${roundedFat}g <span class="text-xs text-muted">/ <input type="number" value="${diet.macros?.fat || 0}" onchange="window.updateDietGoal('fat', this.value)" style="${goalInputStyle}">g</span>
                    </div>
                     <div class="progress-bar mt-xs" style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px;"><div style="width: ${fatPercent}%; height: 100%; background: #ff5252; border-radius: 3px; transition: width 0.3s;"></div></div>
                </div>
             </div>
        </div>

        <div class="grid grid-2 gap-sm" style="padding-right: 5px;">
            ${(diet.meals || []).map((meal, idx) => window.renderMealCard(meal, idx)).join('')}
        </div>
        <div class="flex gap-sm mt-lg justify-center pb-lg" style="grid-column: span 2; display: flex; justify-content: center; gap: 15px;">
            <button class="btn btn-outline" style="border-color: var(--primary-color); color: var(--primary-color);" onclick="window.addMealToDiet()">➕ Añadir Comida</button>
            <button class="btn btn-outline" style="border-color: var(--primary-color); color: var(--primary-color);" onclick="window.calculateRecipeQuantities()">⚡ Calcular macros</button>
            ${(diet.meals || []).length > 1 ? `<button class="btn btn-outline" style="border-color: rgba(255,100,100,0.5); color: #ff6b6b;" onclick="window.removeLastMealFromDiet()">✕ Eliminar Última Comida</button>` : ''}
        </div>
    `;
};

window.renderDietEditor = function () {
    if (!window.editingDietId) return;
    const diet = Diets.getById(window.editingDietId);
    if (!diet) return;

    // Helper para parsear la cantidad normalizando palabras en español
    function parseSpanishQuantity(str) {
        if (!str) return 0;
        let s = str.trim().toLowerCase();
        if (s.startsWith("un ") || s === "un" || s.startsWith("una ") || s === "una" || s.startsWith("uno ") || s === "uno") {
            s = s.replace(/^(un|una|uno)\b/, "1");
        } else if (s.startsWith("dos ")) {
            s = s.replace(/^dos\b/, "2");
        } else if (s.startsWith("tres ")) {
            s = s.replace(/^tres\b/, "3");
        } else if (s.startsWith("media ") || s.startsWith("medio ")) {
            s = s.replace(/^(media|medio)\b/, "0.5");
        }
        const val = parseFloat(s);
        return isNaN(val) ? 0 : val;
    }

    // Helper para obtener el peso por unidad de un alimento
    function getWeightPerUnit(foodName) {
        const name = (foodName || '').trim().toLowerCase();
        if (typeof window.foodDatabase !== 'undefined' && Array.isArray(window.foodDatabase)) {
            const dbMatch = window.foodDatabase.find(f => f && f.names && Array.isArray(f.names) && f.names.some(n => n && typeof n === 'string' && (n.trim().toLowerCase() === name || name.includes(n.trim().toLowerCase()) || n.trim().toLowerCase().includes(name))));
            if (dbMatch && dbMatch.weightPerUnit) {
                return dbMatch.weightPerUnit;
            }
        }
        const weights = {
            'plátano': 120,
            'banana': 120,
            'manzana': 150,
            'pera': 150,
            'naranja': 150,
            'melocotón': 150,
            'durazno': 150,
            'kiwi': 75,
            'mandarina': 80,
            'limón': 100,
            'huevo': 55,
            'clara': 35,
            'dátil': 8,
            'tostada': 30,
            'rebanada': 30,
            'pan': 30,
            'tortita': 8,
            'tortilla': 30,
            'quesito': 15,
            'yogur': 125,
            'lata': 60,
            'atún': 60,
            'patata': 150,
            'papa': 150,
            'boniato': 150,
            'batata': 150,
            'aguacate': 150,
            'tomate': 120,
            'zanahoria': 80
        };
        for (const key in weights) {
            if (name.includes(key)) {
                return weights[key];
            }
        }
        return null;
    }

    // Auto-sanar alimentos con 0 kcal buscando en base de datos de forma dinámica
    let dietChanged = false;
    (diet.meals || []).forEach(meal => {
        (meal.foods || []).forEach(food => {
            const nameInput = (food.name || '').trim().toLowerCase();
            const qtyStr = String(food.quantity || '');
            const qtyVal = parseSpanishQuantity(qtyStr);
            if (nameInput && qtyVal > 0 && (parseInt(food.calories) === 0 || !food.calories)) {
                let found = null;
                if (typeof Foods !== 'undefined') {
                    const allFoods = Foods.getAll();
                    if (Array.isArray(allFoods)) {
                        found = allFoods.find(f => {
                            if (!f || !f.name) return false;
                            const dbName = f.name.trim().toLowerCase();
                            return dbName === nameInput || dbName.includes(nameInput) || nameInput.includes(dbName);
                        });
                    }
                }
                if (!found && typeof window.foodDatabase !== 'undefined' && Array.isArray(window.foodDatabase)) {
                    found = window.foodDatabase.find(f => f && f.names && Array.isArray(f.names) && f.names.some(n => {
                        if (!n) return false;
                        const dbName = n.trim().toLowerCase();
                        return dbName === nameInput || dbName.includes(nameInput) || nameInput.includes(dbName);
                    }));
                }

                if (found) {
                    const baseCals = found.calories || found.cals || 0;
                    const baseP = found.protein || found.p || 0;
                    const baseC = found.carbs || found.c || 0;
                    const baseF = found.fat || found.f || 0;

                    let isUnit = (found.type === 'unit' || found.unit === 'unit');
                    const isQtyUnitInput = /unidade?s?|uds?|ración|raciones/i.test(qtyStr);
                    const isQtyGramInput = /g(r|ram(o|s|os)?)?s?\b/i.test(qtyStr.trim());
                    const weightPerUnit = getWeightPerUnit(nameInput);
                    
                    if (isQtyGramInput) {
                        isUnit = false;
                    } else if (!isUnit && (isQtyUnitInput || (qtyVal <= 20 && qtyVal > 0 && weightPerUnit !== null))) {
                        isUnit = true;
                    }

                    let factor = 1;
                    if (isUnit) {
                        if (found.type === 'unit' || found.unit === 'unit') {
                            factor = qtyVal;
                        } else {
                            const finalWeight = weightPerUnit !== null ? weightPerUnit : 100;
                            factor = (qtyVal * finalWeight) / 100;
                        }
                    } else {
                        factor = qtyVal / 100;
                    }

                    food.calories = Math.round(baseCals * factor);
                    food.protein = parseFloat((baseP * factor).toFixed(1));
                    food.carbs = parseFloat((baseC * factor).toFixed(1));
                    food.fat = parseFloat((baseF * factor).toFixed(1));
                    dietChanged = true;
                }
            }
        });
    });

    if (dietChanged) {
        Diets.update(window.editingDietId, { meals: diet.meals });
    }

    const content = window.getDietEditorHTML(diet);

    const embeddedContainer = document.getElementById('embeddedDietEditor');
    if (embeddedContainer) {
        embeddedContainer.innerHTML = content;
        return;
    }

    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal && existingModal.querySelector('#dietEditorContainer')) {
        existingModal.querySelector('#dietEditorContainer').innerHTML = content;

        // Focus management if a form is active
        if (window.activeMealForm) {
            const { mealIdx, option } = window.activeMealForm;
            setTimeout(() => {
                const input = document.getElementById(`newFoodName_${mealIdx}_${option}`);
                if (input) input.focus();
            }, 50);
        }
    } else {
        window.closeDietEditor = function () {
            if (typeof window.closeModal === 'function') window.closeModal();
            else {
                const modal = document.querySelector('.modal-overlay');
                if (modal) modal.remove();
            }
            if(window.onDietEditorClosed) window.onDietEditorClosed();
        };

        // Función de guardado explícito al cerrar
        window.saveAndCloseDietEditor = function() {
            showToast('Sincronizando cambios...', 'info');
            const diet = Diets.getById(window.editingDietId);
            if (diet) {
                Diets.update(window.editingDietId, diet); // Fuerza disparo de saveData()
                window.recalculateDietTotals(window.editingDietId);
            }
            setTimeout(() => {
                showToast('Dieta guardada correctamente', 'success');
                window.closeDietEditor();
            }, 300);
        };

        showModal('Editor de Dieta', `<div id="dietEditorContainer">${content}</div>`, [
            { text: '💾 GUARDAR Y CERRAR', class: 'btn-primary', onclick: 'window.saveAndCloseDietEditor()' },
            { text: 'Cerrar', class: 'btn-secondary', onclick: 'window.closeDietEditor()' }
        ], 'modal-xxl modal-compact');
    }
};

window.renderMealCard = function (meal, idx) {
    const options = {};
    (meal.foods || []).forEach((f, i) => {
        const opt = f.option || 1;
        if (!options[opt]) options[opt] = [];
        options[opt].push({ ...f, originalIdx: i });
    });

    let optionKeys = Object.keys(options).map(Number);
    if (optionKeys.length === 0) optionKeys = [1];

    if (window.activeMealForm && window.activeMealForm.mealIdx === idx) {
        if (!optionKeys.includes(window.activeMealForm.option)) {
            optionKeys.push(window.activeMealForm.option);
        }
    }
    optionKeys.sort((a, b) => a - b);

    const opt1Foods = options[1] || [];
    const mealTotalCals = opt1Foods.reduce((acc, f) => acc + (parseInt(f.calories) || 0), 0);
    const mealMacros = opt1Foods.reduce((acc, f) => {
        acc.p += parseInt(f.protein) || 0;
        acc.c += parseInt(f.carbs) || 0;
        acc.f += parseInt(f.fat) || 0;
        return acc;
    }, { p: 0, c: 0, f: 0 });

    return `
        <div class="card p-0 overflow-hidden" style="border: 1px solid rgba(255,255,255,0.1); margin-bottom: 10px;">
            <div class="flex-between p-md" style="background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.05);">
                <div class="flex align-center gap-md">
                     <input type="text" class="form-input text-lg font-bold bg-transparent border-none p-0" 
                        value="${meal.name}" 
                        onchange="window.updateMealName(${idx}, this.value)"
                        style="width: 140px; color: var(--text-primary); font-size: 1.1rem;">
                     
                     <div class="flex align-center gap-sm" style="background: rgba(0,0,0,0.2); padding: 4px 10px; border-radius: 6px;">
                         <div class="text-primary font-bold" style="font-size: 1rem;">
                            ${mealTotalCals} kcal
                         </div>
                         <div style="width: 1px; height: 16px; background: rgba(255,255,255,0.1);"></div>
                         <div class="flex gap-sm text-sm font-bold">
                            <span class="text-success" title="Proteínas">P: ${mealMacros.p}</span>
                            <span class="text-warning" title="Carbohidratos">C: ${mealMacros.c}</span>
                            <span class="text-error" title="Grasas">G: ${mealMacros.f}</span>
                         </div>
                     </div>
                </div>
                <button class="btn btn-sm btn-outline text-xs" onclick="window.addOptionToMeal(${idx})">+ Nueva Opción</button>
            </div>

            <div class="p-md">
                ${optionKeys.map(optNum => {
        const foods = options[optNum] || [];
        const optCals = foods.reduce((acc, f) => acc + (parseInt(f.calories) || 0), 0);
        const optMacros = foods.reduce((acc, f) => {
            acc.p += parseInt(f.protein) || 0;
            acc.c += parseInt(f.carbs) || 0;
            acc.f += parseInt(f.fat) || 0;
            return acc;
        }, { p: 0, c: 0, f: 0 });

        const isFormVisible = window.activeMealForm && window.activeMealForm.mealIdx === idx && window.activeMealForm.option === optNum;
        const photoUrl = (meal.optionPhotos && meal.optionPhotos[optNum]) ? meal.optionPhotos[optNum] : null;

        return `
                        <div style="margin-bottom: 15px; border-left: 2px solid ${optNum === 1 ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)'}; padding-left: 10px;">
                            <div class="flex-between mb-xs">
                                <div class="flex align-center gap-md">
                                    <div class="text-sm font-bold flex align-center gap-sm">
                                        <span style="color: ${optNum === 1 ? 'var(--text-primary)' : 'var(--text-secondary)'};">Opción ${optNum}</span>
                                        
                                        <!-- Reorder Controls -->
                                        <div class="flex align-center gap-xs" style="display: inline-flex; margin-left: 2px;">
                                            ${optNum > optionKeys[0] ? `
                                                <button class="btn btn-xs" 
                                                        style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-secondary); padding: 0; font-size: 8px;" 
                                                        onclick="window.moveOption(${idx}, ${optNum}, 'up')" 
                                                        title="Subir Opción">▲</button>
                                            ` : ''}
                                            ${optNum < optionKeys[optionKeys.length - 1] ? `
                                                <button class="btn btn-xs" 
                                                        style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-secondary); padding: 0; font-size: 8px;" 
                                                        onclick="window.moveOption(${idx}, ${optNum}, 'down')" 
                                                        title="Bajar Opción">▼</button>
                                            ` : ''}
                                        </div>

                                        ${optNum > 1 ? `<span class="text-xs text-muted" style="cursor:pointer;" onclick="window.removeOption(${idx}, ${optNum})">Eliminar</span>` : ''}
                                    </div>
                                    <div class="flex align-center gap-xs">
                                        <button class="btn btn-sm btn-link text-xs p-0 text-primary" style="font-weight: 700;" onclick="window.openRecipeSelection(${idx}, ${optNum})">📚 Recetas</button>
                                        <span class="text-muted" style="opacity: 0.3;">|</span>
                                        ${photoUrl ? `
                                            <div class="relative group" style="position: relative;">
                                                <img src="${photoUrl}" style="width: 32px; height: 32px; border-radius: 4px; object-fit: cover; border: 1px solid rgba(255,255,255,0.2); cursor: pointer;" onclick="window.openPhotoSelector(${idx}, ${optNum})">
                                                <button class="btn btn-xs btn-danger p-0 flex-center" 
                                                    style="position: absolute; top: -5px; right: -5px; width: 14px; height: 14px; border-radius: 50%; font-size: 10px;"
                                                    onclick="window.removeDietPhoto(${idx}, ${optNum})" title="Quitar foto">×</button>
                                            </div>
                                        ` : `
                                            <button class="btn btn-sm btn-link text-xs p-0 text-primary" onclick="window.openPhotoSelector(${idx}, ${optNum})">+ Foto</button>
                                        `}
                                    </div>
                                </div>
                                <div class="text-xs text-muted">Total: ${optCals} kcal (P:${optMacros.p} C:${optMacros.c} G:${optMacros.f})</div>
                            </div>

                            ${(meal.optionIngredients && meal.optionIngredients[optNum]) ? `
                                <div class="mb-sm p-sm rounded-sm" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); font-size: 0.75rem; color: var(--text-muted); line-height: 1.4;">
                                    <div class="flex-between align-center mb-xs">
                                        <strong class="text-xs uppercase" style="opacity: 0.7;">📝 Ingredientes / Notas</strong>
                                        <button class="btn btn-xs btn-link text-xs p-0" onclick="window.updateOptionIngredients(${idx}, ${optNum}, '')">× Quitar</button>
                                    </div>
                                    <div class="italic">${meal.optionIngredients[optNum]}</div>
                                </div>
                            ` : ''}

                            ${foods.length > 0 ? `
                                <table class="table" style="font-size: 0.8rem; width: 100%; border-collapse: collapse; margin-bottom: 5px;">
                                    <thead>
                                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-muted); text-align: left;">
                                            <th style="padding: 4px 5px; font-weight: normal;">Alimento</th>
                                            <th style="text-align: center; padding: 4px; font-weight: normal;">Cant.</th>
                                            <th style="text-align: center; padding: 4px; font-weight: normal;">Kcal</th>
                                            <th style="text-align: right; padding: 4px 5px; font-weight: normal;">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${foods.map(food => `
                                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.03);">
                                                <td style="padding: 6px 5px; font-weight: 500;">${food.name}</td>
                                                 <td style="text-align: center; color: var(--text-muted); padding: 6px;">
                                                      ${(() => {
                                                          const q = food.quantity;
                                                          if (!q || q === '1 ración' || q === '-') return '-';
                                                          if (/[a-zA-Z]/.test(q)) return q;
                                                          const n = parseFloat(q);
                                                          if (!isNaN(n)) {
                                                              let type = 'g';
                                                              if (typeof Foods !== 'undefined') {
                                                                  const dbFood = Foods.getAll().find(dbf => dbf && dbf.name && dbf.name.toLowerCase() === food.name.toLowerCase()) ||
                                                                                 Foods.getAll().find(dbf => dbf && dbf.name && (dbf.name.toLowerCase().includes(food.name.toLowerCase()) || food.name.toLowerCase().includes(dbf.name.toLowerCase())));
                                                                  if (dbFood) type = dbFood.type || 'g';
                                                              }
                                                              return type === 'unit' ? `${n} ${n === 1 ? 'ud' : 'uds'}` : `${n}g`;
                                                          }
                                                          return q;
                                                      })()}
                                                  </td>
                                                <td style="text-align: center; font-weight: bold; padding: 6px;">${food.calories}</td>
                                                <td style="text-align: right; padding: 6px 5px;">
                                                    <div style="display: flex; justify-content: flex-end; gap: 10px;">
                                                        <button style="background:none; border:none; padding:0; font-size:0.75rem; color:var(--text-muted); cursor:pointer; font-weight:500;" onclick="window.editFoodForm(${idx}, ${optNum}, ${food.originalIdx})">Editar</button>
                                                        <button style="background:none; border:none; padding:0; font-size:0.75rem; color:#ff5252; opacity:0.8; cursor:pointer; font-weight:500;" onclick="window.removeFood(${idx}, ${food.originalIdx})">Eliminar</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            ` : '<div class="text-xs text-muted py-1 italic">Sin alimentos</div>'}

                            <div class="mt-xs">
                                <button class="btn btn-sm btn-link text-xs p-0" onclick="window.toggleAddFoodForm(${idx}, ${optNum})">${isFormVisible ? 'Cancelar' : '+ Añadir Alimento'}</button>
                            </div>

                            ${isFormVisible ? `
                                <div style="background: rgba(0,0,0,0.3); padding: 10px; margin-top: 5px; border-radius: 6px; border: 1px solid var(--primary-color);">
                                     <div class="grid grid-2 gap-sm mb-sm">
                                         <div>
                                             <input type="text" id="newFoodName_${idx}_${optNum}" class="form-input text-sm" placeholder="🔍 Buscar alimento..." autofocus onchange="window.checkFoodMacros(${idx}, ${optNum})" list="foodList_${idx}_${optNum}">
                                             <datalist id="foodList_${idx}_${optNum}">
                                                ${(typeof Foods !== 'undefined') ? Foods.getAll().map(f => `<option value="${f.name}">`).join('') : ''}
                                             </datalist>
                                         </div>
                                         <div>
                                             <input type="text" id="newFoodQty_${idx}_${optNum}" class="form-input text-sm" placeholder="Cant." oninput="window.checkFoodMacros(${idx}, ${optNum})">
                                         </div>
                                     </div>
                                     <div class="grid grid-4 gap-xs mb-sm">
                                         <div>
                                             <label class="text-xs text-muted" style="display:block; text-align:center; margin-bottom:2px;">Kcal</label>
                                             <input type="number" id="newFoodCal_${idx}_${optNum}" class="form-input text-center text-sm" placeholder="0">
                                         </div>
                                         <div>
                                             <label class="text-xs text-muted" style="display:block; text-align:center; margin-bottom:2px;">Prot (g)</label>
                                             <input type="number" id="newFoodP_${idx}_${optNum}" class="form-input text-center text-sm" placeholder="0">
                                         </div>
                                         <div>
                                             <label class="text-xs text-muted" style="display:block; text-align:center; margin-bottom:2px;">Carbs (g)</label>
                                             <input type="number" id="newFoodC_${idx}_${optNum}" class="form-input text-center text-sm" placeholder="0">
                                         </div>
                                         <div>
                                             <label class="text-xs text-muted" style="display:block; text-align:center; margin-bottom:2px;">Grasa (g)</label>
                                             <input type="number" id="newFoodF_${idx}_${optNum}" class="form-input text-center text-sm" placeholder="0">
                                         </div>
                                     </div>
                                     <button class="btn btn-sm btn-primary w-full" onclick="window.addFood(${idx}, ${optNum})">Guardar Alimento</button>
                                </div>
                            ` : ''}
                        </div>
                    `;
    }).join('')}
            </div>
        </div>
    `;
};

/* --- ACTION FUNCTIONS --- */

window.calculateRecipeQuantities = function () {
    const diet = Diets.getById(window.editingDietId);
    if (!diet) {
        showToast('No se encontró la dieta actual', 'error');
        return;
    }

    // Helper para parsear la cantidad normalizando palabras en español
    function parseSpanishQuantity(str) {
        if (!str) return 0;
        let s = str.trim().toLowerCase();
        if (s.startsWith("un ") || s === "un" || s.startsWith("una ") || s === "una" || s.startsWith("uno ") || s === "uno") {
            s = s.replace(/^(un|una|uno)\b/, "1");
        } else if (s.startsWith("dos ")) {
            s = s.replace(/^dos\b/, "2");
        } else if (s.startsWith("tres ")) {
            s = s.replace(/^tres\b/, "3");
        } else if (s.startsWith("media ") || s.startsWith("medio ")) {
            s = s.replace(/^(media|medio)\b/, "0.5");
        }
        const val = parseFloat(s);
        return isNaN(val) ? 0 : val;
    }

    // Helper para obtener el peso por unidad de un alimento
    function getWeightPerUnit(foodName) {
        const name = (foodName || '').trim().toLowerCase();
        if (typeof window.foodDatabase !== 'undefined' && Array.isArray(window.foodDatabase)) {
            const dbMatch = window.foodDatabase.find(f => f && f.names && Array.isArray(f.names) && f.names.some(n => n && typeof n === 'string' && (n.trim().toLowerCase() === name || name.includes(n.trim().toLowerCase()) || n.trim().toLowerCase().includes(name))));
            if (dbMatch && dbMatch.weightPerUnit) {
                return dbMatch.weightPerUnit;
            }
        }
        const weights = {
            'plátano': 120,
            'banana': 120,
            'manzana': 150,
            'pera': 150,
            'naranja': 150,
            'melocotón': 150,
            'durazno': 150,
            'kiwi': 75,
            'mandarina': 80,
            'limón': 100,
            'huevo': 55,
            'clara': 35,
            'dátil': 8,
            'tostada': 30,
            'rebanada': 30,
            'pan': 30,
            'tortita': 8,
            'tortilla': 30,
            'quesito': 15,
            'yogur': 125,
            'lata': 60,
            'atún': 60,
            'patata': 150,
            'papa': 150,
            'boniato': 150,
            'batata': 150,
            'aguacate': 150,
            'tomate': 120,
            'zanahoria': 80
        };
        for (const key in weights) {
            if (name.includes(key)) {
                return weights[key];
            }
        }
        return null;
    }

    // Helper para obtener porciones mínimas lógicas
    function getMinQuantity(foodName) {
        const name = (foodName || '').trim().toLowerCase();
        
        // Grasas, aceites, condimentos, semillas, suplementos
        const microWeightKeywords = [
            'aceite', 'oliva', 'crema de cacahuete', 'mantequilla', 'cacahuete', 'nuez', 'nueces',
            'almendra', 'chía', 'chia', 'lino', 'sésamo', 'semillas', 'mayonesa', 'aguacate',
            'quesito', 'queso rallado', 'proteína', 'creatina', 'cacao', 'canela', 'sal', 'especias'
        ];
        if (microWeightKeywords.some(kw => name.includes(kw))) {
            return 5;
        }
        
        // Proteínas principales (carnes, pescados, huevos, tofu, etc.)
        const proteinKeywords = [
            'pollo', 'pavo', 'ternera', 'cerdo', 'merluza', 'salmón', 'salmon', 'bacalao', 'atún', 'atun',
            'lubina', 'dorada', 'pescado', 'carne', 'pechuga', 'muslo', 'solomillo', 'hamburguesa',
            'tofu', 'seitan', 'seitán', 'queso fresco', 'queso cottage', 'skyr', 'yogur griego'
        ];
        if (proteinKeywords.some(kw => name.includes(kw))) {
            return 80;
        }
        
        // Carbohidratos principales (arroz, pasta, patata, pan, avena)
        const carbKeywords = [
            'arroz', 'pasta', 'patata', 'papa', 'boniato', 'batata', 'pan', 'avena', 'quinoa', 'legumbres',
            'lentejas', 'garbanzos', 'alubias'
        ];
        if (carbKeywords.some(kw => name.includes(kw))) {
            return 40;
        }
        
        // Frutas y verduras
        const fruitVegKeywords = [
            'manzana', 'pera', 'plátano', 'banana', 'fresa', 'arándanos', 'naranja', 'tomate', 'zanahoria',
            'lechuga', 'espinacas', 'brócoli', 'brocoli', 'calabacín', 'cebolla', 'pimiento'
        ];
        if (fruitVegKeywords.some(kw => name.includes(kw))) {
            return 50;
        }
        
        return 30;
    }

    const targetCals = parseFloat(diet.calories) || 0;
    const targetP = parseFloat(diet.macros?.protein) || 0;
    const targetC = parseFloat(diet.macros?.carbs) || 0;
    const targetF = parseFloat(diet.macros?.fat) || 0;

    if (targetCals <= 0) {
        showToast('⚠️ Por favor, define primero un objetivo de calorías mayor a 0.', 'warning');
        return;
    }

    if (!diet.meals || diet.meals.length === 0) {
        showToast('⚠️ No hay comidas en esta dieta para calcular.', 'warning');
        return;
    }

    const numMeals = diet.meals.length;
    const targetMealCals = targetCals / numMeals;
    const targetMealP = targetP / numMeals;
    const targetMealC = targetC / numMeals;
    const targetMealF = targetF / numMeals;

    // Saber si ajustamos basándonos en los macros objetivos de la calculadora
    const calculateByMacros = targetP > 0 && targetC > 0 && targetF > 0;

    // Calcular la suma de calorías actuales de la Opción 1 de todas las comidas
    const totalOption1Cals = diet.meals.reduce((sum, meal) => {
        const opt1Foods = (meal.foods || []).filter(f => (f.option || 1) === 1);
        const opt1Cals = opt1Foods.reduce((s, f) => s + (parseFloat(f.calories) || 0), 0);
        return sum + opt1Cals;
    }, 0);

    // Consideramos que la dieta está alineada si la suma de todas las opción 1 es muy cercana o igual al targetCals.
    // Esto significa que el entrenador ya tiene configuradas sus comidas de Opción 1 y quiere preservar su distribución de calorías
    // (ya sea porque están repartidas de forma igual o con una distribución personalizada).
    const keepExistingOption1 = Math.abs(totalOption1Cals - targetCals) < 15 && totalOption1Cals > 0;

    // Recorrer comidas y ajustar las cantidades de cada opción de alimento
    diet.meals.forEach((meal, mealIdx) => {
        // Encontrar alimentos de la Opción 1 de esta comida
        const opt1Foods = (meal.foods || []).filter(f => (f.option || 1) === 1);
        const opt1Cals = opt1Foods.reduce((s, f) => s + (parseFloat(f.calories) || 0), 0);
        
        // Si optamos por mantener la Opción 1, y esta ya tiene calorías definidas,
        // usamos esas calorías como objetivo para el resto de opciones de esta comida.
        // De lo contrario, usamos el promedio targetMealCals.
        const hasOpt1Configured = opt1Foods.length > 0 && opt1Cals > 0;
        const mealTargetCals = (keepExistingOption1 && hasOpt1Configured) ? opt1Cals : targetMealCals;

        // Encontrar todas las opciones únicas en esta comida
        const optionNums = Array.from(new Set((meal.foods || []).map(f => f.option || 1)));
        
        optionNums.forEach(optNum => {
            // Si debemos mantener Opción 1 intacta, saltamos el cálculo para la Opción 1
            if (keepExistingOption1 && hasOpt1Configured && optNum === 1) {
                return;
            }

            const optFoods = (meal.foods || []).filter(f => (f.option || 1) === optNum);
            if (optFoods.length === 0) return;

            // 1. Preparar referencias de base
            optFoods.forEach(f => {
                const nameInput = (f.name || '').trim().toLowerCase();
                let found = null;

                if (typeof Foods !== 'undefined') {
                    const allFoods = Foods.getAll();
                    if (Array.isArray(allFoods)) {
                        found = allFoods.find(food => {
                            if (!food || !food.name) return false;
                            const dbName = food.name.trim().toLowerCase();
                            return dbName === nameInput || dbName.includes(nameInput) || nameInput.includes(dbName);
                        });
                    }
                }

                if (!found && typeof window.foodDatabase !== 'undefined' && Array.isArray(window.foodDatabase)) {
                    found = window.foodDatabase.find(food => {
                        if (!food || !food.names) return false;
                        return food.names.some(n => {
                            if (!n) return false;
                            const dbName = n.trim().toLowerCase();
                            return dbName === nameInput || dbName.includes(nameInput) || n.trim().toLowerCase().includes(nameInput);
                        });
                    });
                }

                let isUnit = false;
                let baseCals = 0;
                let baseP = 0;
                let baseC = 0;
                let baseF = 0;

                const qtyStr = String(f.quantity || '');
                const qtyVal = parseSpanishQuantity(qtyStr);

                if (found) {
                    isUnit = (found.type === 'unit' || found.unit === 'unit');
                    baseCals = found.calories || found.cals || 0;
                    baseP = found.protein || found.p || 0;
                    baseC = found.carbs || found.c || 0;
                    baseF = found.fat || found.f || 0;

                    // Determinar si es una cantidad basada en unidades o gramos
                    const isQtyUnitInput = /unidade?s?|uds?|ración|raciones/i.test(qtyStr);
                    const isQtyGramInput = /g(r|ram(o|s|os)?)?s?\b/i.test(qtyStr.trim());
                    const weightPerUnit = getWeightPerUnit(nameInput);
                    
                    if (isQtyGramInput) {
                        isUnit = false;
                    } else if (!isUnit && (isQtyUnitInput || (qtyVal > 0 && qtyVal <= 20 && weightPerUnit !== null))) {
                        isUnit = true;
                    }
 
                    if (isUnit) {
                        // Adaptar macros base de 100g a 1 unidad si no es de tipo unit
                        if (found.type !== 'unit' && found.unit !== 'unit') {
                            const finalWeight = weightPerUnit !== null ? weightPerUnit : 100;
                            const unitFactor = finalWeight / 100;
                            baseCals = baseCals * unitFactor;
                            baseP = baseP * unitFactor;
                            baseC = baseC * unitFactor;
                            baseF = baseF * unitFactor;
                        }
                    }
                } else {
                    // Fallback using the food's existing macro values if positive
                    const existingCals = parseFloat(f.calories) || 0;
                    if (existingCals > 0) {
                        baseCals = existingCals;
                        baseP = parseFloat(f.protein) || 0;
                        baseC = parseFloat(f.carbs) || 0;
                        baseF = parseFloat(f.fat) || 0;

                        const existingQty = parseFloat(f.quantity);
                        if (!isNaN(existingQty) && existingQty > 0) {
                            isUnit = (existingQty < 10);
                            if (isUnit) {
                                baseCals = baseCals / existingQty;
                                baseP = baseP / existingQty;
                                baseC = baseC / existingQty;
                                baseF = baseF / existingQty;
                            } else {
                                baseCals = (baseCals / existingQty) * 100;
                                baseP = (baseP / existingQty) * 100;
                                baseC = (baseC / existingQty) * 100;
                                baseF = (baseF / existingQty) * 100;
                            }
                        } else {
                            isUnit = false;
                        }
                    } else {
                        // Standard fallback
                        isUnit = false;
                        baseCals = 100;
                        baseP = 5;
                        baseC = 10;
                        baseF = 2;
                    }
                }

                let parsedQty = qtyVal;
                let refQty = 100;
                if (isUnit) {
                    refQty = (!isNaN(parsedQty) && parsedQty > 0) ? parsedQty : 1;
                } else {
                    refQty = (!isNaN(parsedQty) && parsedQty > 0) ? parsedQty : 100;
                }

                let factor = isUnit ? refQty : (refQty / 100);
                
                f._refCals = baseCals * factor;
                f._refP = baseP * factor;
                f._refC = baseC * factor;
                f._refF = baseF * factor;
                f._baseCals = baseCals;
                f._baseP = baseP;
                f._baseC = baseC;
                f._baseF = baseF;
                f._refQty = refQty;
                f._isUnit = isUnit;

                // Determinar el macro dominante para escalado inteligente
                const pCals = (parseFloat(baseP) || 0) * 4;
                const cCals = (parseFloat(baseC) || 0) * 4;
                const fCals = (parseFloat(baseF) || 0) * 9;
                const maxCals = Math.max(pCals, cCals, fCals);
                
                if (maxCals === pCals && pCals > 0) {
                    f._dominant = 'protein';
                } else if (maxCals === cCals && cCals > 0) {
                    f._dominant = 'carbs';
                } else if (maxCals === fCals && fCals > 0) {
                    f._dominant = 'fat';
                } else {
                    f._dominant = 'calories';
                }
            });

            // 2. Sumar totales de referencia de la opción
            const totalRefCals = optFoods.reduce((sum, f) => sum + (f._refCals || 0), 0);
            const totalRefP = optFoods.reduce((sum, f) => sum + (f._refP || 0), 0);
            const totalRefC = optFoods.reduce((sum, f) => sum + (f._refC || 0), 0);
            const totalRefF = optFoods.reduce((sum, f) => sum + (f._refF || 0), 0);

            // 3. Calcular factores de escala
            let sCals = totalRefCals > 0 ? (mealTargetCals / totalRefCals) : 1;
            let sP = totalRefP > 0 ? (targetMealP / totalRefP) : 1;
            let sC = totalRefC > 0 ? (targetMealC / totalRefC) : 1;
            let sF = totalRefF > 0 ? (targetMealF / totalRefF) : 1;

            if (totalRefCals > 0) {
                optFoods.forEach(f => {
                    // Elegir factor de escala según dominant macro si calculamos por macros
                    let S = sCals;
                    if (calculateByMacros) {
                        if (f._dominant === 'protein') S = sP;
                        else if (f._dominant === 'carbs') S = sC;
                        else if (f._dominant === 'fat') S = sF;
                    }

                    const newQty = f._refQty * S;
                    let finalQty = 0;
                    if (f._isUnit) {
                        finalQty = Math.max(1, Math.round(newQty));
                        f.quantity = String(`${finalQty} ${finalQty === 1 ? 'ud' : 'uds'}`);
                    } else {
                        // Obtener cantidad mínima lógica
                        const minQty = getMinQuantity(f.name);
                        finalQty = Math.max(minQty, Math.round(newQty / 5) * 5);
                        f.quantity = finalQty + "g";
                    }

                    const finalFactor = f._isUnit ? finalQty : (finalQty / 100);
                    f.calories = Math.round(f._baseCals * finalFactor);
                    f.protein = parseFloat((f._baseP * finalFactor).toFixed(1));
                    f.carbs = parseFloat((f._baseC * finalFactor).toFixed(1));
                    f.fat = parseFloat((f._baseF * finalFactor).toFixed(1));
                });
            }

            // Limpiar variables temporales
            optFoods.forEach(f => {
                delete f._refCals;
                delete f._refP;
                delete f._refC;
                delete f._refF;
                delete f._baseCals;
                delete f._baseP;
                delete f._baseC;
                delete f._baseF;
                delete f._refQty;
                delete f._isUnit;
                delete f._dominant;
            });
        });
    });

    // Guardar cambios
    Diets.update(window.editingDietId, { meals: diet.meals });
    
    // Recalcular y re-renderizar
    window.recalculateDietTotals(window.editingDietId);
    window.renderDietEditor();

    if (keepExistingOption1) {
        showToast('⚡ Opción secundaria ajustada a los macros de la Opción 1', 'success');
    } else {
        showToast('⚡ Cantidades y macros ajustados proporcionalmente', 'success');
    }
};

window.toggleAddFoodForm = function (mealIdx, option) {
    if (window.activeMealForm && window.activeMealForm.mealIdx === mealIdx && window.activeMealForm.option === option) {
        window.activeMealForm = null;
    } else {
        window.activeMealForm = { mealIdx, option };
    }
    window.renderDietEditor();
};

window.addOptionToMeal = function (mealIdx) {
    const diet = Diets.getById(window.editingDietId);
    const meal = diet.meals[mealIdx];
    let maxOpt = 0;
    (meal.foods || []).forEach(f => {
        if ((f.option || 1) > maxOpt) maxOpt = f.option || 1;
    });

    if (window.activeMealForm && window.activeMealForm.mealIdx === mealIdx && window.activeMealForm.option > maxOpt) {
        return;
    }

    const newOpt = maxOpt + 1;
    window.activeMealForm = { mealIdx, option: newOpt };
    window.renderDietEditor();
};

window.addFood = function (mealIdx, optionNum) {
    const name = document.getElementById(`newFoodName_${mealIdx}_${optionNum}`).value;
    const quantity = document.getElementById(`newFoodQty_${mealIdx}_${optionNum}`).value;
    const calories = document.getElementById(`newFoodCal_${mealIdx}_${optionNum}`).value;
    const protein = document.getElementById(`newFoodP_${mealIdx}_${optionNum}`).value;
    const carbs = document.getElementById(`newFoodC_${mealIdx}_${optionNum}`).value;
    const fat = document.getElementById(`newFoodF_${mealIdx}_${optionNum}`).value;

    if (!name) {
        showToast('Ingresa el nombre del alimento', 'error');
        return;
    }

    // Normalizar cantidad al guardar para asegurar sufijos g/ud si es solo número
    let normalizedQty = quantity || '-';
    if (normalizedQty && normalizedQty !== '-' && normalizedQty !== '1 ración' && !/[a-zA-Z]/.test(normalizedQty)) {
        const n = parseFloat(normalizedQty);
        if (!isNaN(n)) {
            let type = 'g';
            if (typeof Foods !== 'undefined') {
                const dbFood = Foods.getAll().find(dbf => dbf && dbf.name && dbf.name.toLowerCase() === name.toLowerCase()) ||
                               Foods.getAll().find(dbf => dbf && dbf.name && (dbf.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(dbf.name.toLowerCase())));
                if (dbFood) type = dbFood.type || 'g';
            }
            normalizedQty = type === 'unit' ? `${n} ${n === 1 ? 'ud' : 'uds'}` : `${n}g`;
        }
    }

    const food = {
        name,
        quantity: normalizedQty,
        calories: parseInt(calories) || 0,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        option: optionNum
    };

    const diet = Diets.getById(window.editingDietId);
    if (!diet) return;
    if (!diet.meals[mealIdx].foods) diet.meals[mealIdx].foods = [];

    const editIdx = (window.activeMealForm && window.activeMealForm.editIdx !== undefined) ? window.activeMealForm.editIdx : null;

    if (editIdx !== null) {
        diet.meals[mealIdx].foods[editIdx] = food;
        showToast('Alimento actualizado', 'success');
    } else {
        diet.meals[mealIdx].foods.push(food);
        showToast('Alimento añadido', 'success');
        
        // Guardar en base de datos global de alimentos si no existe
        const existingFood = Foods.getAll().find(f => f.name.toLowerCase() === name.toLowerCase());
        if (!existingFood) {
            let detectedType = 'g';
            const qtyStr = String(quantity || '');
            if (/[a-zA-Z]/.test(qtyStr)) {
                if (/unidade?s?|uds?|ración|raciones/i.test(qtyStr)) {
                    detectedType = 'unit';
                }
            } else {
                const n = parseFloat(qtyStr);
                if (!isNaN(n) && n <= 20) {
                    if (window.getWeightPerUnit(name) !== null) {
                        detectedType = 'unit';
                    }
                }
            }
            Foods.create({
                name: food.name,
                calories: food.calories,
                protein: food.protein,
                carbs: food.carbs,
                fat: food.fat,
                type: detectedType
            });
        }
    }

    // 🔥 GUARDADO INMEDIATO Y RECALCULO
    Diets.update(window.editingDietId, { meals: diet.meals });
    window.recalculateDietTotals(window.editingDietId);
    
    window.activeMealForm = null;
    window.renderDietEditor();
};

window.recalculateDietTotals = function(dietId) {
    // Si existe la función de refrescar la lista de dietas, la llamamos
    if (typeof loadDiets === 'function') loadDiets();
};

window.editFoodForm = function (mealIdx, optionNum, originalFoodIdx) {
    const diet = Diets.getById(window.editingDietId);
    const food = diet.meals[mealIdx].foods[originalFoodIdx];

    window.activeMealForm = { mealIdx, option: optionNum, editIdx: originalFoodIdx };
    window.renderDietEditor();

    setTimeout(() => {
        const nameInput = document.getElementById(`newFoodName_${mealIdx}_${optionNum}`);
        if (nameInput) {
            nameInput.value = food.name || '';
            const qtyVal = (food.quantity === '1 ración' || food.quantity === '-') ? '' : (food.quantity || '');
            document.getElementById(`newFoodQty_${mealIdx}_${optionNum}`).value = qtyVal;
            document.getElementById(`newFoodCal_${mealIdx}_${optionNum}`).value = food.calories || 0;
            document.getElementById(`newFoodP_${mealIdx}_${optionNum}`).value = food.protein || 0;
            document.getElementById(`newFoodC_${mealIdx}_${optionNum}`).value = food.carbs || 0;
            document.getElementById(`newFoodF_${mealIdx}_${optionNum}`).value = food.fat || 0;
            nameInput.focus();

            // Si tiene nombre y cantidad, y los macros están a 0, intentar autocalcular desde "Mis Alimentos"
            if (nameInput.value && qtyVal && (parseInt(food.calories) === 0 || !food.calories)) {
                window.checkFoodMacros(mealIdx, optionNum);
            }
        }
    }, 50);
};

window.removeFood = function (mealIdx, originalFoodIdx) {
    if (!window.confirm('¿Eliminar este alimento?')) return;
    const diet = Diets.getById(window.editingDietId);
    diet.meals[mealIdx].foods.splice(originalFoodIdx, 1);
    Diets.update(window.editingDietId, { meals: diet.meals });
    window.recalculateDietTotals(window.editingDietId);
    window.renderDietEditor();
};

window.removeOption = function (mealIdx, optionNum) {
    if (!confirm('¿Eliminar toda la Opción ' + optionNum + '?')) return;
    const diet = Diets.getById(window.editingDietId);
    diet.meals[mealIdx].foods = diet.meals[mealIdx].foods.filter(f => (f.option || 1) !== optionNum);
    
    if (diet.meals[mealIdx].optionPhotos && diet.meals[mealIdx].optionPhotos[optionNum]) {
        delete diet.meals[mealIdx].optionPhotos[optionNum];
    }
    if (diet.meals[mealIdx].optionIngredients && diet.meals[mealIdx].optionIngredients[optionNum]) {
        delete diet.meals[mealIdx].optionIngredients[optionNum];
    }
    
    Diets.update(window.editingDietId, { meals: diet.meals });
    window.renderDietEditor();
};

window.moveOption = function (mealIdx, optNum, direction) {
    const diet = Diets.getById(window.editingDietId);
    if (!diet) return;
    const meal = diet.meals[mealIdx];
    if (!meal) return;

    // Obtener la lista ordenada de opciones de comida en esta comida
    const options = {};
    (meal.foods || []).forEach(f => {
        const opt = f.option || 1;
        options[opt] = true;
    });
    let optionKeys = Object.keys(options).map(Number);
    optionKeys.sort((a, b) => a - b);

    const currentIdx = optionKeys.indexOf(optNum);
    if (currentIdx === -1) return;

    let targetOptNum = null;
    if (direction === 'up' && currentIdx > 0) {
        targetOptNum = optionKeys[currentIdx - 1];
    } else if (direction === 'down' && currentIdx < optionKeys.length - 1) {
        targetOptNum = optionKeys[currentIdx + 1];
    }

    if (targetOptNum === null) return;

    // 1. Intercambiar la propiedad option de los alimentos
    meal.foods.forEach(f => {
        const currentOpt = f.option || 1;
        if (currentOpt === optNum) {
            f.option = targetOptNum;
        } else if (currentOpt === targetOptNum) {
            f.option = optNum;
        }
    });

    // 2. Intercambiar fotos
    if (!meal.optionPhotos) meal.optionPhotos = {};
    const tempPhoto = meal.optionPhotos[optNum];
    if (meal.optionPhotos[targetOptNum] !== undefined) {
        meal.optionPhotos[optNum] = meal.optionPhotos[targetOptNum];
    } else {
        delete meal.optionPhotos[optNum];
    }
    if (tempPhoto !== undefined) {
        meal.optionPhotos[targetOptNum] = tempPhoto;
    } else {
        delete meal.optionPhotos[targetOptNum];
    }

    // 3. Intercambiar ingredientes/notas
    if (!meal.optionIngredients) meal.optionIngredients = {};
    const tempIng = meal.optionIngredients[optNum];
    if (meal.optionIngredients[targetOptNum] !== undefined) {
        meal.optionIngredients[optNum] = meal.optionIngredients[targetOptNum];
    } else {
        delete meal.optionIngredients[optNum];
    }
    if (tempIng !== undefined) {
        meal.optionIngredients[targetOptNum] = tempIng;
    } else {
        delete meal.optionIngredients[targetOptNum];
    }

    // Guardar cambios, recalcular totales y volver a renderizar
    Diets.update(window.editingDietId, { meals: diet.meals });
    window.recalculateDietTotals(window.editingDietId);
    window.renderDietEditor();
};

window.updateMealName = function (mealIdx, newName) {
    const diet = Diets.getById(window.editingDietId);
    diet.meals[mealIdx].name = newName;
    Diets.update(window.editingDietId, { meals: diet.meals });
};

window.addMealToDiet = function () {
    const diet = Diets.getById(window.editingDietId);
    if (!diet) return;
    if (!diet.meals) diet.meals = [];
    
    const newMealIndex = diet.meals.length + 1;
    diet.meals.push({
        name: 'Comida ' + newMealIndex,
        foods: [],
        optionPhotos: {},
        optionIngredients: {}
    });
    
    Diets.update(diet.id, { 
        meals: diet.meals,
        mealsCount: diet.meals.length
    });
    showToast('Comida añadida', 'success');
    window.renderDietEditor();
};

window.removeLastMealFromDiet = function () {
    const diet = Diets.getById(window.editingDietId);
    if (!diet) return;
    if (!diet.meals || diet.meals.length <= 1) return;
    
    if (confirm('¿Estás seguro de eliminar la última comida (' + diet.meals[diet.meals.length - 1].name + ')?')) {
        diet.meals.pop();
        Diets.update(diet.id, { 
            meals: diet.meals,
            mealsCount: diet.meals.length
        });
        showToast('Última comida eliminada', 'success');
        window.renderDietEditor();
    }
};

window.updateDietGoal = function (type, value) {
    const val = parseInt(value) || 0;
    const diet = Diets.getById(window.editingDietId);
    if (type === 'calories') {
        diet.calories = val;
    } else {
        if (!diet.macros) diet.macros = { protein: 0, carbs: 0, fat: 0 };
        diet.macros[type] = val;
    }
    Diets.update(window.editingDietId, { calories: diet.calories, macros: diet.macros });
    window.renderDietEditor();
};

// --- PHOTO SELECTOR LOGIC ---

window.openPhotoSelector = function (mealIdx, optionNum) {
    const renderPhotosList = (query = '') => {
        const recipes = Media.getAll().filter(m => m.category === 'recipe');
        const filtered = recipes.filter(r => r.title.toLowerCase().includes(query.toLowerCase()));
        
        if (filtered.length === 0) {
            return `<p class="text-muted p-md text-center">No se encontraron recetas con "${query}"</p>`;
        }
        return `
            <div class="grid grid-3 gap-sm">${filtered.map(r => `
                <div class="card p-0 cursor-pointer hover-scale" style="transition: transform 0.2s;" onclick="window.selectDietPhoto(${mealIdx}, ${optionNum}, '${r.url}')">
                    <img src="${r.url}" style="width: 100%; aspect-ratio: 16/9; object-fit: cover;">
                    <div class="p-xs text-xs text-center text-truncate" style="font-weight: 600;">${r.title}</div>
                </div>`).join('')}
            </div>`;
    };

    window.onPhotoSearch = function (val) {
        const container = document.getElementById('photoListContainer');
        if (container) {
            container.innerHTML = renderPhotosList(val);
        }
    };

    const initialList = renderPhotosList();
    const content = `
        <div class="tabs mb-md" style="display: flex; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
            <button id="tabBtn-lib" class="btn btn-sm btn-primary" onclick="window.switchPhotoTab('lib')">Biblioteca</button>
            <button id="tabBtn-upload" class="btn btn-sm btn-outline" onclick="window.switchPhotoTab('upload')">Subir Foto</button>
        </div>
        <div id="tab-lib">
             <div class="mb-md">
                 <input type="text" id="photoSearchInput" class="form-input" placeholder="🔍 Buscar receta por título..." oninput="window.onPhotoSearch(this.value)" style="width: 100%; margin-bottom: 10px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 8px 12px; color: var(--text-primary);">
             </div>
             <div id="photoListContainer" style="max-height: 400px; overflow-y: auto; padding-right: 5px;">
                 ${initialList}
             </div>
        </div>
        <div id="tab-upload" style="display: none; padding: 20px; text-center;">
             <input type="file" id="dietPhotoInput" accept="image/*" class="form-input" onchange="window.previewDietPhotoUpload()">
             <img id="dietPhotoPreview" style="max-width: 100%; margin-top: 10px; border-radius: 8px; display: none;">
             <button class="btn btn-primary mt-md" onclick="window.saveUploadedDietPhoto(${mealIdx}, ${optionNum})">Guardar Foto</button>
        </div>
    `;
    showModal('Seleccionar Foto', content, [{ text: 'Cerrar', class: 'btn-secondary', onclick: 'window.closeModal(this)' }]);
    
    setTimeout(() => {
        document.getElementById('photoSearchInput')?.focus();
    }, 100);
};

window.switchPhotoTab = function (tab) {
    document.getElementById('tab-lib').style.display = tab === 'lib' ? 'block' : 'none';
    document.getElementById('tab-upload').style.display = tab === 'upload' ? 'block' : 'none';
    document.getElementById('tabBtn-lib').className = tab === 'lib' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-outline';
    document.getElementById('tabBtn-upload').className = tab === 'upload' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-outline';
};

// --- RECIPE SELECTION FROM LIBRARY ---

window.openRecipeSelection = function (mealIdx, optionNum) {
    const renderSelectionContent = (filterText = '') => {
        const query = filterText.toLowerCase();
        const hiddenIds = JSON.parse(localStorage.getItem('hidden_system_media') || '[]');
        const allMedia = Media.getAll().filter(m => m.category === 'recipe');
        const userMedia = allMedia.filter(m => !m.isSystem);
        const replacedSystemIds = userMedia.filter(m => m.originalId).map(m => String(m.originalId));

        let filtered = allMedia.filter(m => {
            const mid = String(m.id);
            if (hiddenIds.includes(mid)) return false;
            if (m.isSystem && replacedSystemIds.includes(mid)) return false;
            return m.title.toLowerCase().includes(query) || (m.ingredients && m.ingredients.toLowerCase().includes(query));
        });

        const categories = {
            '🌅 Desayunos': filtered.filter(m => m.id.includes('sys-br') || m.id.includes('pancakes') || m.id.includes('gachas') || m.id.includes('avena') || m.id.includes('toast')),
            '🥘 Comidas/Cenas': filtered.filter(m => m.id.includes('sys-lun') || m.id.startsWith('prof-') || m.id.includes('lasagna') || m.id.includes('hamburguesa') || m.id.includes('pavo') || m.id.includes('pollo')),
            '🍎 Snacks': filtered.filter(m => m.id.includes('sys-snack') || m.id.includes('fruta-queso') || m.id.includes('rollitos') || m.id.includes('jamon') || m.id.includes('bocadillo')),
            '⭐ Otras/Mis Recetas': filtered.filter(m => !m.id.includes('sys-br') && !m.id.includes('sys-lun') && !m.id.startsWith('prof-') && !m.id.includes('sys-snack') && !m.id.includes('pancakes') && !m.id.includes('bocadillo'))
        };

        let html = `
            <div class="mb-md">
                <input type="text" id="recipeSearchInput" class="form-input" placeholder="🔍 Buscar receta por título o ingrediente (ej: Pavo)..." value="${filterText}" oninput="window.onRecipeSearch(this.value, ${mealIdx}, ${optionNum})">
            </div>
            <style>
                .recipe-card-pro:hover .ingredients-container { background: rgba(0,0,0,0.85) !important; justify-content: flex-start !important; }
                .recipe-card-pro:hover .ingredients-text { -webkit-line-clamp: unset !important; display: block !important; overflow: auto !important; max-height: 120px; font-size: 0.65rem !important; }
            </style>
            <div style="padding-right: 5px;" id="recipeListContainer">
        `;

        html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px;">`;
        filtered.forEach(r => {
            html += `
                <div class="card p-0 cursor-pointer hover-scale recipe-card-pro" onclick="window.applyRecipeToOption(${mealIdx}, ${optionNum}, '${r.id}')" 
                     style="transition: transform 0.2s; border: 1px solid rgba(255,255,255,0.05); min-height: 180px; display: flex; flex-direction: column; overflow: hidden; position: relative;"
                     title="${r.ingredients || 'Consultar receta'}">
                    <img src="${r.url}" style="width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: 6px 6px 0 0;">
                    <div class="ingredients-container" style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center; padding: 6px; background: rgba(0,0,0,0.3); transition: all 0.3s ease;">
                        <div class="text-xs font-bold text-center text-truncate" style="font-size: 0.7rem; color: var(--text-primary);">${r.title}</div>
                        <div class="ingredients-text" style="font-size: 0.58rem; color: var(--text-muted); font-style: italic; text-align: center; opacity: 0.8; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; margin-top: 2px;">
                            ${r.ingredients || 'Consultar receta'}
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;

        if (filtered.length === 0) {
            html = `<p class="text-center text-muted p-lg italic">No se encontraron recetas con "${filterText}"</p>`;
        }

        html += `</div>`;
        return html;
    };

    window.onRecipeSearch = function(val, mIdx, oNum) {
        const container = document.getElementById('recipeListContainer');
        const query = val.toLowerCase();
        const hiddenIds = JSON.parse(localStorage.getItem('hidden_system_media') || '[]');
        const allMedia = Media.getAll().filter(m => m.category === 'recipe');
        const userMedia = allMedia.filter(m => !m.isSystem);
        const replacedSystemIds = userMedia.filter(m => m.originalId).map(m => String(m.originalId));
        
        let filtered = allMedia.filter(m => {
            const mid = String(m.id);
            if (hiddenIds.includes(mid)) return false;
            if (m.isSystem && replacedSystemIds.includes(mid)) return false;
            
            const q = query;
            return m.title.toLowerCase().includes(q) || (m.ingredients && m.ingredients.toLowerCase().includes(q));
        });

        const categories = {
            '🌅 Desayunos': filtered.filter(m => m.id.includes('sys-br') || m.id.includes('pancakes') || m.id.includes('gachas') || m.id.includes('avena') || m.id.includes('toast')),
            '🥘 Comidas/Cenas': filtered.filter(m => m.id.includes('sys-lun') || m.id.startsWith('prof-') || m.id.includes('lasagna') || m.id.includes('hamburguesa') || m.id.includes('pavo') || m.id.includes('pollo')),
            '🍎 Snacks': filtered.filter(m => m.id.includes('sys-snack') || m.id.includes('fruta-queso') || m.id.includes('rollitos') || m.id.includes('jamon') || m.id.includes('bocadillo')),
            '⭐ Otras/Mis Recetas': filtered.filter(m => !m.id.includes('sys-br') && !m.id.includes('sys-lun') && !m.id.startsWith('prof-') && !m.id.includes('sys-snack') && !m.id.includes('pancakes') && !m.id.includes('bocadillo'))
        };

        let html = `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px;">`;
        filtered.forEach(r => {
            html += `
                <div class="card p-0 cursor-pointer hover-scale recipe-card-pro" onclick="window.applyRecipeToOption(${mIdx}, ${oNum}, '${r.id}')" 
                     style="transition: transform 0.2s; border: 1px solid rgba(255,255,255,0.05); min-height: 180px; display: flex; flex-direction: column; overflow: hidden; position: relative;"
                     title="${r.ingredients || 'Consultar receta'}">
                    <img src="${r.url}" style="width: 100%; aspect-ratio: 1/1; object-fit: cover; border-radius: 6px 6px 0 0;">
                    <div class="ingredients-container" style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center; padding: 6px; background: rgba(0,0,0,0.3); transition: all 0.3s ease;">
                        <div class="text-xs font-bold text-center text-truncate" style="font-size: 0.7rem; color: var(--text-primary);">${r.title}</div>
                        <div class="ingredients-text" style="font-size: 0.58rem; color: var(--text-muted); font-style: italic; text-align: center; opacity: 0.8; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; margin-top: 2px;">
                            ${r.ingredients || 'Consultar receta'}
                        </div>
                    </div>
                </div>
            `;
        });
        html += `</div>`;

        if (filtered.length === 0) html = `<p class="text-center text-muted p-lg italic">No se encontraron recetas con "${val}"</p>`;
        container.innerHTML = html;
    };

    const initialContent = renderSelectionContent();
    showModal('Biblioteca de Recetas Maestras', initialContent, [
        { text: 'Cerrar', class: 'btn-secondary', onclick: 'window.closeModal(this)' }
    ], 'modal-lg');

    // Focus focus
    setTimeout(() => {
        const input = document.getElementById('recipeSearchInput');
        if (input) input.focus();
    }, 100);
};

window.applyRecipeToOption = function (mealIdx, optionNum, recipeId) {
    const recipe = Media.getAll().find(r => r.id === recipeId);
    if (!recipe) return;

    const diet = Diets.getById(window.editingDietId);
    if (!diet) return;

    // 1. Asignar Foto si tiene
    if (recipe.url) {
        if (!diet.meals[mealIdx].optionPhotos) diet.meals[mealIdx].optionPhotos = {};
        diet.meals[mealIdx].optionPhotos[optionNum] = recipe.url;
    }

    // 2. Asignar Título como nota (ocultando ingredientes crudos) y desglosar alimentos
    if (recipe.ingredients) {
        if (!diet.meals[mealIdx].optionIngredients) diet.meals[mealIdx].optionIngredients = {};
        // Desactivado a petición del usuario: no se añade la nota con el título
        diet.meals[mealIdx].optionIngredients[optionNum] = '';
        
        const rawIngs = recipe.ingredients || '';
        if (rawIngs) {
            if (!diet.meals[mealIdx].foods) diet.meals[mealIdx].foods = [];
            
            const optToUse = parseInt(optionNum) || 1;
            diet.meals[mealIdx].foods = diet.meals[mealIdx].foods.filter(f => (parseInt(f.option) || 1) !== optToUse);

            const ingredients = rawIngs.split(/[\n,]/).map(s => s.trim()).filter(s => s.length > 1);
            ingredients.forEach(name => {
                const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
                diet.meals[mealIdx].foods.push({
                    name: capitalizedName,
                    quantity: '-',
                    calories: 0,
                    protein: 0,
                    carbs: 0,
                    fat: 0,
                    option: optToUse
                });
            });
        }
    }

    // 3. Opcional: Actualizar nombre de la comida si es la primera opción y está vacío o es genérico
    if (optionNum === 1 && (diet.meals[mealIdx].name.toLowerCase().includes('comida') || !diet.meals[mealIdx].name)) {
        diet.meals[mealIdx].name = recipe.title;
    }

    Diets.update(window.editingDietId, { meals: diet.meals });
    showToast(`✅ ${recipe.title} cargado como alimentos editables`, 'success');
    
    // Cerrar modal de recetas
    const modals = document.querySelectorAll('.modal-overlay');
    if (modals.length > 0) modals[modals.length - 1].remove();

    window.renderDietEditor();
};

window.updateOptionIngredients = function (mealIdx, optionNum, value) {
    const diet = Diets.getById(window.editingDietId);
    if (!diet.meals[mealIdx].optionIngredients) diet.meals[mealIdx].optionIngredients = {};
    
    if (!value || value.trim() === '') {
        delete diet.meals[mealIdx].optionIngredients[optionNum];
    } else {
        diet.meals[mealIdx].optionIngredients[optionNum] = value;
    }
    
    Diets.update(window.editingDietId, { meals: diet.meals });
    window.renderDietEditor();
};

window.previewDietPhotoUpload = async function () {
    const input = document.getElementById('dietPhotoInput');
    if (input.files && input.files[0]) {
        const base64 = await imageToBase64(input.files[0]);
        const img = document.getElementById('dietPhotoPreview');
        img.src = base64;
        img.style.display = 'block';
    }
};

window.saveUploadedDietPhoto = async function (mealIdx, optionNum) {
    const input = document.getElementById('dietPhotoInput');
    if (input.files && input.files[0]) {
        const base64 = await imageToBase64(input.files[0]);
        Media.create({ type: 'image', category: 'recipe', url: base64, title: 'Foto subida' });
        window.selectDietPhoto(mealIdx, optionNum, base64);
    }
};

window.selectDietPhoto = function (mealIdx, optionNum, url) {
    const diet = Diets.getById(window.editingDietId);
    if (!diet.meals[mealIdx].optionPhotos) diet.meals[mealIdx].optionPhotos = {};
    diet.meals[mealIdx].optionPhotos[optionNum] = url;
    Diets.update(window.editingDietId, { meals: diet.meals });
    window.renderDietEditor();

    const modals = document.querySelectorAll('.modal-overlay');
    if (modals.length > 0) modals[modals.length - 1].remove();
};

window.removeDietPhoto = function (mealIdx, optionNum) {
    window.showConfirm('¿Quitar foto?', () => {
        const diet = Diets.getById(window.editingDietId);
        if (diet.meals[mealIdx].optionPhotos) {
            delete diet.meals[mealIdx].optionPhotos[optionNum];
            Diets.update(window.editingDietId, { meals: diet.meals });
            window.renderDietEditor();
        }
    });
};

/* ============================================
   PUBLICAR DIETA AL CLIENTE
   ============================================ */

function _snapshotDietToHistory(clientId, dietId, actionLabel) {
    const diet = Diets.getById(dietId);
    const client = Clients.getById(clientId);
    if (!diet || !client) return;

    const history = client.dietHistory || [];
    history.push({
        dietId: diet.id,
        dietName: diet.name,
        calories: diet.calories || 0,
        macros: diet.macros || {},
        mealsCount: diet.mealsCount || 0,
        action: actionLabel,
        archivedAt: new Date().toISOString()
    });
    Clients.update(clientId, { dietHistory: history });
}

function _renderDietHistory(client) {
    const history = (client.dietHistory || []).slice().reverse();
    if (history.length === 0) return '';
    const rows = history.map(h => {
        const date = new Date(h.archivedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
        const badge = h.action === 'archived'
            ? `<span style="background:rgba(255,82,82,0.15);color:#ff5252;padding:1px 7px;border-radius:20px;font-size:0.7rem;">Archivada</span>`
            : `<span style="background:rgba(0,230,118,0.12);color:#00e676;padding:1px 7px;border-radius:20px;font-size:0.7rem;">Actualización</span>`;
        return `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
                <div>
                    <span style="font-size:0.78rem;color:var(--text-primary);">${h.dietName}</span>
                    <span style="font-size:0.72rem;color:var(--text-muted);margin-left:6px;">${h.calories} kcal</span>
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                    ${badge}
                    <span style="font-size:0.7rem;color:var(--text-muted);">${date}</span>
                </div>
            </div>`;
    }).join('');

    return `
        <details style="margin-top:8px;">
            <summary style="cursor:pointer;font-size:0.75rem;color:var(--text-muted);padding:4px 0;list-style:none;display:flex;align-items:center;gap:5px;">
                <span>📋</span> Historial de dietas previas (${history.length})
            </summary>
            <div style="margin-top:6px;padding:8px 10px;background:rgba(0,0,0,0.2);border-radius:6px;">
                ${rows}
            </div>
        </details>`;
}

window.publishDietToClient = function (dietIdOverride) {
    const dietId = dietIdOverride || window.editingDietId;
    if (!dietId) {
        showToast('No hay ninguna dieta seleccionada para publicar.', 'error');
        return;
    }
    const diet = Diets.getById(dietId);
    if (!diet) return;

    window.lastPublishDietId = dietId;
    const clients = Clients.getAll().filter(c => c.status !== 'inactive');

    const clientRows = clients.map(c => {
        let assignedDiets = c.assignedDiets || [];
        if (!Array.isArray(assignedDiets)) {
            assignedDiets = c.assignedDiet ? [c.assignedDiet] : [];
        }
        const hasThisDiet  = assignedDiets.includes(dietId);

        let statusHtml = '';
        if (hasThisDiet) {
            statusHtml = '<span style="color:#00e676;">✓ Esta dieta está activa para este cliente</span>';
        } else if (assignedDiets.length > 0) {
            statusHtml = `Tiene asignadas ${assignedDiets.length} dietas activas`;
        } else {
            statusHtml = 'Sin dieta asignada';
        }

        let actionsHtml = '';
        if (hasThisDiet) {
            actionsHtml = `
                <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;">
                    <button class="btn btn-sm btn-primary" style="font-size:0.75rem;min-width:160px;"
                        onclick="window._updateActiveDiet('${c.id}','${dietId}')">
                        🔄 Actualizar dieta
                    </button>
                    <button class="btn btn-sm btn-outline" style="font-size:0.75rem;min-width:160px;color:#ff9800;border-color:rgba(255,152,0,0.4);"
                        onclick="window._archiveDiet('${c.id}','${dietId}')">
                        📦 Guardar como dieta antigua
                    </button>
                </div>`;
        } else {
            actionsHtml = `
                <button class="btn btn-sm btn-primary" style="font-size:0.75rem;"
                    onclick="window._assignDiet('${c.id}','${dietId}')">
                    📤 Asignar Dieta
                </button>`;
        }

        const historyHtml = _renderDietHistory(c);

        return `
            <div style="
                padding: 12px 16px;
                border-radius: 8px;
                margin-bottom: 10px;
                background: ${hasThisDiet ? 'rgba(0,217,255,0.07)' : 'rgba(255,255,255,0.03)'};
                border: 1px solid ${hasThisDiet ? 'rgba(0,217,255,0.22)' : 'rgba(255,255,255,0.07)'};
            ">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
                    <div style="flex:1;min-width:0;">
                        <div style="font-weight:600;color:var(--text-primary);margin-bottom:2px;">${c.name}</div>
                        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
                            ${c.dietPublished ? 
                                '<span style="background:rgba(0,230,118,0.1);color:#00e676;padding:2px 6px;border-radius:4px;font-size:0.65rem;font-weight:700;text-transform:uppercase;border:1px solid rgba(0,230,118,0.2);">✅ Publicada</span>' : 
                                '<span style="background:rgba(255,152,0,0.1);color:#ff9800;padding:2px 6px;border-radius:4px;font-size:0.65rem;font-weight:700;text-transform:uppercase;border:1px solid rgba(255,152,0,0.2);">📋 Borrador</span>'}
                        </div>
                        <div style="font-size:0.77rem;color:var(--text-muted);">${statusHtml}</div>
                    </div>
                    <div style="flex-shrink:0;display:flex;flex-direction:column;gap:5px;">
                        ${actionsHtml}
                        ${hasThisDiet ? `<button class="btn btn-xs ${c.dietPublished ? 'btn-outline' : 'btn-primary'}" style="font-size:0.65rem;" onclick="window._togglePublicStatus('${c.id}', ${!c.dietPublished})">${c.dietPublished ? 'Ocultar' : 'Publicar Ahora'}</button>` : ''}
                    </div>
                </div>
                ${historyHtml}
            </div>`;
    }).join('');

    const modalContent = `
        <div style="margin-bottom:16px;padding:12px 16px;background:rgba(0,217,255,0.06);border-radius:8px;border-left:3px solid var(--primary-color);">
            <div style="font-size:0.78rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Dieta</div>
            <div style="font-weight:700;color:var(--text-primary);font-size:1rem;">🥗 ${diet.name}</div>
            <div style="font-size:0.82rem;color:var(--text-muted);margin-top:2px;">${diet.calories || 0} kcal · ${diet.mealsCount || 0} comidas</div>
        </div>
        <div style="font-size:0.82rem;color:var(--text-muted);margin-bottom:12px;">Gestiona la asignación de esta dieta a tus clientes:</div>
        <div style="padding-right:4px;">
            ${clientRows}
        </div>`;

    document.getElementById('publishDietModal')?.remove();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'publishDietModal';
    overlay.innerHTML = `
        <div class="modal modal-lg" style="max-width:600px;">
            <div class="modal-header">
                <h3 class="modal-title">📤 Publicar Dieta al Cliente</h3>
            </div>
            <div class="modal-body" style="padding:1.5rem;">
                ${modalContent}
            </div>
            <div class="modal-footer" style="display:flex;justify-content:flex-end;padding:1rem 1.5rem;border-top:1px solid rgba(255,255,255,0.07);">
                <button class="btn btn-secondary" onclick="document.getElementById('publishDietModal').remove()">Cerrar</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);
};

window._assignDiet = function (clientId, dietId) {
    const client = Clients.getById(clientId);
    if (!client) return;
    let assignedDiets = client.assignedDiets || [];
    if (!Array.isArray(assignedDiets)) {
        assignedDiets = client.assignedDiet ? [client.assignedDiet] : [];
    }
    if (!assignedDiets.includes(dietId)) {
        assignedDiets.push(dietId);
    }
    
    let publishedDiets = client.publishedDiets || [];
    if (!Array.isArray(publishedDiets)) {
        if (client.dietPublished !== false) {
            publishedDiets = [...assignedDiets];
        } else {
            publishedDiets = [];
        }
    }
    if (!publishedDiets.includes(dietId)) {
        publishedDiets.push(dietId);
    }

    Clients.update(clientId, { 
        assignedDiet: dietId, 
        assignedDiets: assignedDiets,
        publishedDiets: publishedDiets,
        dietPublished: true 
    });
    showToast('✓ Dieta publicada al cliente correctamente', 'success');
    document.getElementById('publishDietModal')?.remove();
    window.publishDietToClient(dietId);
};

window._updateActiveDiet = function (clientId, dietId) {
    _snapshotDietToHistory(clientId, dietId, 'updated');
    const client = Clients.getById(clientId);
    if (client) {
        let assignedDiets = client.assignedDiets || [];
        if (!Array.isArray(assignedDiets)) {
            assignedDiets = client.assignedDiet ? [client.assignedDiet] : [];
        }
        if (!assignedDiets.includes(dietId)) {
            assignedDiets.push(dietId);
        }
        
        let publishedDiets = client.publishedDiets || [];
        if (!Array.isArray(publishedDiets)) {
            publishedDiets = [...assignedDiets];
        }
        if (!publishedDiets.includes(dietId)) {
            publishedDiets.push(dietId);
        }

        Clients.update(clientId, { 
            assignedDiet: dietId, 
            assignedDiets: assignedDiets,
            publishedDiets: publishedDiets,
            dietPublished: true 
        });
    }
    showToast('🔄 Dieta actualizada en la App del cliente y guardada en historial', 'success');
    document.getElementById('publishDietModal')?.remove();
    window.publishDietToClient(dietId);
};

window._togglePublicStatus = function (clientId, status) {
    Clients.update(clientId, { dietPublished: status });
    showToast(status ? '✅ Dieta visible para el cliente' : '📋 Dieta oculta (borrador)', 'info');
    const dietId = window.lastPublishDietId;
    if (dietId) window.publishDietToClient(dietId);
};

window._archiveDiet = function (clientId, dietId) {
    if (!confirm('¿Guardar esta dieta como "antigua"?')) return;
    _snapshotDietToHistory(clientId, dietId, 'archived');
    
    const client = Clients.getById(clientId);
    if (client) {
        let assignedDiets = client.assignedDiets || [];
        if (!Array.isArray(assignedDiets)) {
            assignedDiets = client.assignedDiet ? [client.assignedDiet] : [];
        }
        assignedDiets = assignedDiets.filter(id => id !== dietId);
        
        let publishedDiets = client.publishedDiets || [];
        if (Array.isArray(publishedDiets)) {
            publishedDiets = publishedDiets.filter(id => id !== dietId);
        }
        
        let primaryDietId = client.assignedDiet;
        if (primaryDietId === dietId) {
            primaryDietId = assignedDiets.length > 0 ? assignedDiets[0] : null;
        }

        Clients.update(clientId, { 
            assignedDiet: primaryDietId, 
            assignedDiets: assignedDiets,
            publishedDiets: publishedDiets,
            dietPublished: publishedDiets.length > 0
        });
    }
    showToast('📦 Dieta archivada', 'info');
    document.getElementById('publishDietModal')?.remove();
    window.publishDietToClient(dietId);
};

// --- DATABASE AND UTILS ---

window.foodDatabase = [
    // 1. Proteínas / Carnes / Pescados
    { names: ['Pollo', 'Pechuga de pollo', 'Pollo desmechado', 'Pollo (crudo)'], cals: 120, p: 23, c: 0, f: 2.5 },
    { names: ['Pavo', 'Pechuga de pavo', 'Fiambre de pavo', 'Solomillo de pavo', 'Pavo picado', 'Carne de pavo'], cals: 105, p: 22, c: 0, f: 1.5 },
    { names: ['Salmón', 'Salmón ahumado', 'Salmón al horno'], cals: 180, p: 20, c: 0, f: 11 },
    { names: ['Atún al natural', 'Lata de atún', 'Atún'], cals: 116, p: 26, c: 0, f: 1 },
    { names: ['Ternera', 'Carne de ternera', 'Carne picada de ternera', 'Ternera magra', 'Tiras de ternera', 'Dados de ternera', 'Hamburguesa de ternera', 'Carne magra de ternera'], cals: 150, p: 21, c: 0, f: 5 },
    { names: ['Merluza', 'Pescado blanco', 'Filete de pescado blanco'], cals: 80, p: 18, c: 0, f: 1 },
    { names: ['Gambas'], cals: 85, p: 20, c: 0.5, f: 0.8 },
    { names: ['Bacalao', 'Bacalao desmigado'], cals: 82, p: 18, c: 0, f: 0.7 },
    { names: ['Sepia'], cals: 80, p: 16, c: 0.7, f: 0.9 },
    { names: ['Mejillones', 'Mejillones al vapor'], cals: 86, p: 12, c: 3.4, f: 2.2 },
    { names: ['Jamón serrano', 'Jamón serrano sin grasa'], cals: 240, p: 30, c: 0, f: 13 },

    // 2. Lácteos / Huevos
    { names: ['Huevo', 'Huevo entero', 'Huevo cocido', 'Huevo duro', 'Huevo poché', 'Huevo a la plancha', 'Huevos', 'Huevos revueltos'], cals: 155, p: 13, c: 1.1, f: 11, type: 'unit', weightPerUnit: 55 },
    { names: ['Claras', 'Claras de huevo'], cals: 52, p: 11, c: 0.7, f: 0.2 },
    { names: ['Requesón'], cals: 100, p: 12, c: 3, f: 4 },
    { names: ['Queso cottage', 'Cottage'], cals: 98, p: 11, c: 3.4, f: 4.3 },
    { names: ['Queso fresco tipo Burgos', 'Queso fresco'], cals: 110, p: 11, c: 3, f: 6 },
    { names: ['Queso batido'], cals: 47, p: 8, c: 3.5, f: 0.1 },
    { names: ['Skyr'], cals: 65, p: 11, c: 4, f: 0.2 },
    { names: ['Yogur griego'], cals: 115, p: 10, c: 3, f: 7, type: 'unit', weightPerUnit: 125 },
    { names: ['Yogur natural'], cals: 60, p: 3.5, c: 4.7, f: 3.3 },
    { names: ['Kéfir'], cals: 60, p: 3.5, c: 4.8, f: 3 },
    { names: ['Queso crema', 'Queso crema light'], cals: 150, p: 6, c: 5, f: 12 },
    { names: ['Queso mozzarella light', 'Queso mozzarella'], cals: 200, p: 22, c: 2, f: 12 },
    { names: ['Queso gratinado', 'Queso curado'], cals: 380, p: 25, c: 1.3, f: 30 },
    { names: ['Loncha de queso havarti', 'Queso havarti'], cals: 330, p: 21, c: 0.5, f: 26 },
    { names: ['Leche desnatada'], cals: 34, p: 3.4, c: 5, f: 0.1 },
    { names: ['Leche de soja', 'Bebida de soja'], cals: 45, p: 3.3, c: 2.5, f: 1.8 },
    { names: ['Bebida avellanas', 'Bebida de almendras', 'Leche de almendras'], cals: 24, p: 0.5, c: 3, f: 1.1 },

    // 3. Carbohidratos / Cereales
    { names: ['Avena', 'Copos de avena', 'Avena integral', 'Harina de avena', 'Harina avena'], cals: 389, p: 16.9, c: 66, f: 6.9 },
    { names: ['Arroz', 'Arroz blanco', 'Arroz integral', 'Arroz basmati', 'Arroz jazmín', 'Arroz cocido', 'Arroz (Blanco, Integral, Basmati, Jazmín)', 'Arroz (Integral/Jazmín/Basmati)', 'Arroz (Blanco, Integral, Basmati)'], cals: 350, p: 7, c: 78, f: 0.5 },
    { names: ['Pasta', 'Pasta integral'], cals: 350, p: 12, c: 72, f: 1.5 },
    { names: ['Pan integral', 'Pan Integral / Centeno', 'Rebanada de pan', 'Tostada de pan', 'Bagel integral', 'Pan tostado'], cals: 250, p: 9, c: 45, f: 2.5 },
    { names: ['Pan de centeno', 'Rebanada de pan de centeno'], cals: 260, p: 9, c: 48, f: 2 },
    { names: ['Pan de masa madre', 'Tostada de pan de masa madre'], cals: 275, p: 10, c: 52, f: 1.5 },
    { names: ['Tortitas de arroz', 'Tortita de arroz', 'Tortitas de arroz o maíz', 'Tortitas de maíz'], cals: 380, p: 8, c: 80, f: 3, type: 'unit', weightPerUnit: 8 },
    { names: ['Tortilla de trigo integral', 'Tortilla integral'], cals: 290, p: 8, c: 45, f: 6, type: 'unit', weightPerUnit: 40 },
    { names: ['Tortillas de maíz', 'Tortilla de maíz'], cals: 220, p: 5, c: 45, f: 2.5, type: 'unit', weightPerUnit: 25 },
    { names: ['Batata asada', 'Batata', 'Sweet potato'], cals: 86, p: 1.6, c: 20, f: 0.1 },
    { names: ['Patata', 'Patatas', 'Patata asada', 'Patatas panadera', 'Patatas baby', 'Patatas baby cocidas', 'Puré de patata casero'], cals: 77, p: 2, c: 17, f: 0.1 },
    { names: ['Quinoa', 'Quinoa cocida'], cals: 370, p: 14, c: 64, f: 6 },
    { names: ['Cuscús cocido', 'Cuscús integral', 'Cuscús'], cals: 350, p: 12, c: 73, f: 1.5 },
    { names: ['Bastones de pan integral', 'Colines', 'Picatostes integrales', 'Palitos integrales'], cals: 390, p: 11, c: 72, f: 5 },
    { names: ['Granola casera', 'Granola'], cals: 450, p: 10, c: 60, f: 18 },
    { names: ['Maíz precocido', 'Arepa', 'Harina de maíz'], cals: 360, p: 7, c: 77, f: 2.5 },

    // 4. Legumbres / Vegetales
    { names: ['Garbanzos', 'Garbanzos tostados'], cals: 364, p: 19, c: 61, f: 6 },
    { names: ['Lentejas', 'Lentejas cocidas'], cals: 350, p: 25, c: 63, f: 1 },
    { names: ['Alubias blancas cocidas', 'Alubias blancas'], cals: 330, p: 21, c: 60, f: 0.8 },
    { names: ['Falafel', 'Falafel horneado'], cals: 250, p: 13, c: 30, f: 8 },
    { names: ['Hummus', 'Hummus de garbanzo'], cals: 170, p: 5, c: 14, f: 10 },
    { names: ['Tofu', 'Tofu firme', 'Tofu scramble', 'Tofu firme crujiente'], cals: 76, p: 8, c: 1.9, f: 4.8 },
    { names: ['Edamame', 'Edamame al vapor'], cals: 120, p: 11, c: 9, f: 5 },
    { names: ['Aguacate', 'Guacamole'], cals: 160, p: 2, c: 9, f: 15 },
    { names: ['Tomate', 'Tomates', 'Cherries', 'Tomates cherry', 'Sofrito', 'Tomate natural en rodajas'], cals: 18, p: 0.9, c: 3.9, f: 0.2 },
    { names: ['Espinacas', 'Base de espinacas'], cals: 23, p: 2.9, c: 3.6, f: 0.4 },
    { names: ['Champiñones', 'Setas'], cals: 22, p: 3.1, c: 3.3, f: 0.3 },
    { names: ['Berenjena'], cals: 25, p: 1, c: 6, f: 0.2 },
    { names: ['Calabacín'], cals: 17, p: 1.2, c: 3.1, f: 0.3 },
    { names: ['Calabaza'], cals: 26, p: 1, c: 6.5, f: 0.1 },
    { names: ['Pimientos', 'Pimiento rojo'], cals: 20, p: 0.9, c: 4.6, f: 0.2 },
    { names: ['Pepino'], cals: 15, p: 0.7, c: 3.6, f: 0.1 },
    { names: ['Cebolla', 'Cebolla roja'], cals: 40, p: 1.1, c: 9.3, f: 0.1 },
    { names: ['Espárragos al vapor', 'Espárragos'], cals: 20, p: 2.2, c: 3.9, f: 0.1 },
    { names: ['Zanahoria'], cals: 41, p: 0.9, c: 9.6, f: 0.2 },
    { names: ['Lechuga'], cals: 15, p: 1.4, c: 2.9, f: 0.2 },

    // 5. Frutas
    { names: ['Banana', 'Plátano', 'Plátano pequeño'], cals: 89, p: 1.1, c: 23, f: 0.3, type: 'unit', weightPerUnit: 120 },
    { names: ['Manzana'], cals: 52, p: 0.3, c: 14, f: 0.2, type: 'unit', weightPerUnit: 150 },
    { names: ['Arándanos'], cals: 57, p: 0.7, c: 14, f: 0.3 },
    { names: ['Fresas'], cals: 32, p: 0.7, c: 7.7, f: 0.3 },
    { names: ['Kiwi'], cals: 61, p: 1.1, c: 15, f: 0.5, type: 'unit', weightPerUnit: 75 },
    { names: ['Mango'], cals: 60, p: 0.8, c: 15, f: 0.4 },
    { names: ['Frambuesas'], cals: 52, p: 1.2, c: 12, f: 0.7 },
    { names: ['Pera'], cals: 57, p: 0.4, c: 15, f: 0.1, type: 'unit', weightPerUnit: 160 },
    { names: ['Piña natural', 'Piña'], cals: 50, p: 0.5, c: 13, f: 0.1 },
    { names: ['Melocotón'], cals: 39, p: 0.9, c: 9.5, f: 0.3, type: 'unit', weightPerUnit: 150 },
    { names: ['Papaya'], cals: 43, p: 0.5, c: 11, f: 0.3 },
    { names: ['Higos frescos', 'Higos'], cals: 74, p: 0.8, c: 19, f: 0.3 },
    { names: ['Uvas rojas', 'Uvas'], cals: 67, p: 0.6, c: 17, f: 0.4 },
    { names: ['Mandarina'], cals: 53, p: 0.8, c: 13, f: 0.3, type: 'unit', weightPerUnit: 80 },
    { names: ['Fruta contable'], cals: 70, p: 0.8, c: 16, f: 0.3, type: 'unit', weightPerUnit: 120 },
    { names: ['Fruta incontable'], cals: 50, p: 0.7, c: 11, f: 0.2 },

    // 6. Grasas / Semillas / Otros
    { names: ['Aceite de oliva', 'Aceite de oliva virgen extra', 'Aceite'], cals: 884, p: 0, c: 0, f: 100 },
    { names: ['Crema de cacahuete', 'Crema de almendras'], cals: 588, p: 25, c: 20, f: 50 },
    { names: ['Semillas de calabaza', 'Semillas de lino', 'Semillas de chía', 'Semillas de sésamo', 'Semillas de cáñamo'], cals: 530, p: 19, c: 30, f: 43 },
    { names: ['Coco rallado'], cals: 660, p: 6.9, c: 24, f: 65 },
    { names: ['Nueces'], cals: 654, p: 15, c: 14, f: 65 },
    { names: ['Anacardos'], cals: 553, p: 18, c: 30, f: 44 },
    { names: ['Pistachos'], cals: 562, p: 20, c: 28, f: 45 },
    { names: ['Almendras', 'Almendras laminadas', 'Almendra molida'], cals: 579, p: 21, c: 22, f: 49 },
    { names: ['Proteina en polvo', 'Batido de proteina', 'Whey Protein', 'Proteína de vainilla', 'Proteína chocolate', 'Proteína', 'Proteína en polvo isolate'], cals: 380, p: 80, c: 5, f: 4 },
    { names: ['Miel'], cals: 304, p: 0.3, c: 82, f: 0 },
    { names: ['Dátil'], cals: 282, p: 2.5, c: 75, f: 0.4, type: 'unit', weightPerUnit: 8 },
    { names: ['Cacao'], cals: 228, p: 20, c: 58, f: 14 },
    { names: ['Sirope de ágave'], cals: 310, p: 0, c: 78, f: 0 },
    { names: ['Aceitunas'], cals: 115, p: 0.8, c: 6.3, f: 10.7 },
    { names: ['Pesto'], cals: 529, p: 5.2, c: 6, f: 53 },
    { names: ['Mayonesa ligera'], cals: 180, p: 0.9, c: 8, f: 16 },
    { names: ['Salmorejo'], cals: 70, p: 1, c: 6, f: 4.5 },
    { names: ['Salsa de yogur light', 'Salsa de yogur'], cals: 80, p: 3.5, c: 7, f: 4 },
    { names: ['Canela'], cals: 247, p: 4, c: 81, f: 1.2 },
    { names: ['Cúrcuma'], cals: 354, p: 8, c: 65, f: 10 }
];

window.checkFoodMacros = function (mealIdx, optionNum) {
    const suffix = (optionNum !== undefined && optionNum !== null) ? `${mealIdx}_${optionNum}` : `${mealIdx}`;
    const nameEl = document.getElementById(`newFoodName_${suffix}`);
    const qtyEl = document.getElementById(`newFoodQty_${suffix}`);
    if (!nameEl || !qtyEl) return;

    const nameInput = nameEl.value.trim().toLowerCase();
    const qtyInput = qtyEl.value;
    
    // Si no hay nombre, limpiamos campos
    if (!nameInput) {
        const calEl = document.getElementById(`newFoodCal_${suffix}`);
        const pEl = document.getElementById(`newFoodP_${suffix}`);
        const cEl = document.getElementById(`newFoodC_${suffix}`);
        const fEl = document.getElementById(`newFoodF_${suffix}`);
        if (calEl) calEl.value = '';
        if (pEl) pEl.value = '';
        if (cEl) cEl.value = '';
        if (fEl) fEl.value = '';
        return;
    }

    // Helper para parsear la cantidad normalizando palabras en español
    function parseSpanishQuantity(str) {
        if (!str) return 0;
        let s = str.trim().toLowerCase();
        if (s.startsWith("un ") || s === "un" || s.startsWith("una ") || s === "una" || s.startsWith("uno ") || s === "uno") {
            s = s.replace(/^(un|una|uno)\b/, "1");
        } else if (s.startsWith("dos ")) {
            s = s.replace(/^dos\b/, "2");
        } else if (s.startsWith("tres ")) {
            s = s.replace(/^tres\b/, "3");
        } else if (s.startsWith("media ") || s.startsWith("medio ")) {
            s = s.replace(/^(media|medio)\b/, "0.5");
        }
        const val = parseFloat(s);
        return isNaN(val) ? 0 : val;
    }

    // Helper para obtener el peso por unidad de un alimento
    function getWeightPerUnit(foodName) {
        const name = (foodName || '').trim().toLowerCase();
        if (typeof window.foodDatabase !== 'undefined' && Array.isArray(window.foodDatabase)) {
            const dbMatch = window.foodDatabase.find(f => f && f.names && Array.isArray(f.names) && f.names.some(n => n && typeof n === 'string' && (n.trim().toLowerCase() === name || name.includes(n.trim().toLowerCase()) || n.trim().toLowerCase().includes(name))));
            if (dbMatch && dbMatch.weightPerUnit) {
                return dbMatch.weightPerUnit;
            }
        }
        const weights = {
            'plátano': 120,
            'banana': 120,
            'manzana': 150,
            'pera': 150,
            'naranja': 150,
            'melocotón': 150,
            'durazno': 150,
            'kiwi': 75,
            'mandarina': 80,
            'limón': 100,
            'huevo': 55,
            'clara': 35,
            'dátil': 8,
            'tostada': 30,
            'rebanada': 30,
            'pan': 30,
            'tortita': 8,
            'tortilla': 30,
            'quesito': 15,
            'yogur': 125,
            'lata': 60,
            'atún': 60,
            'patata': 150,
            'papa': 150,
            'boniato': 150,
            'batata': 150,
            'aguacate': 150,
            'tomate': 120,
            'zanahoria': 80
        };
        for (const key in weights) {
            if (name.includes(key)) {
                return weights[key];
            }
        }
        return null;
    }

    const qty = parseSpanishQuantity(qtyInput);

    // 1. Buscar en la base de datos de usuario (Foods) - Ahora con búsqueda flexible e inmune a nulos
    let found = null;
    if (typeof Foods !== 'undefined') {
        const allFoods = Foods.getAll();
        if (Array.isArray(allFoods)) {
            found = allFoods.find(f => {
                if (!f || !f.name) return false;
                const dbName = f.name.trim().toLowerCase();
                return dbName === nameInput || dbName.includes(nameInput) || nameInput.includes(dbName);
            });
        }
    }

    // 2. Si no, buscar en la base de datos interna básica
    if (!found && typeof window.foodDatabase !== 'undefined' && Array.isArray(window.foodDatabase)) {
        found = window.foodDatabase.find(f => f && f.names && Array.isArray(f.names) && f.names.some(n => {
            if (!n) return false;
            const dbName = n.trim().toLowerCase();
            return dbName === nameInput || dbName.includes(nameInput) || nameInput.includes(dbName);
        }));
    }

    if (found && qty > 0) {
        const baseCals = found.calories || found.cals || 0;
        const baseP = found.protein || found.p || 0;
        const baseC = found.carbs || found.c || 0;
        const baseF = found.fat || found.f || 0;

        // Determinar si es una cantidad basada en unidades o gramos
        const isQtyUnitInput = /unidade?s?|uds?|ración|raciones/i.test(qtyInput);
        const isQtyGramInput = /g(r|ram(o|s|os)?)?s?\b/i.test(qtyInput.trim());
        let isUnit = (found.type === 'unit' || found.unit === 'unit');
        const weightPerUnit = getWeightPerUnit(nameInput);
        
        if (isQtyGramInput) {
            isUnit = false;
        } else if (!isUnit && (isQtyUnitInput || (qty <= 20 && qty > 0 && weightPerUnit !== null))) {
            isUnit = true;
        }

        let factor = 1;
        if (isUnit) {
            if (found.type === 'unit' || found.unit === 'unit') {
                factor = qty; // Multiplicamos directo
            } else {
                // Alimento en gramos pero ingresado por unidades: buscar peso por unidad
                const finalWeight = weightPerUnit !== null ? weightPerUnit : 100;
                factor = (qty * finalWeight) / 100;
            }
        } else {
            // Por defecto asumimos gramos (cada 100g)
            factor = qty / 100;
        }

        const calEl = document.getElementById(`newFoodCal_${suffix}`);
        const pEl = document.getElementById(`newFoodP_${suffix}`);
        const cEl = document.getElementById(`newFoodC_${suffix}`);
        const fEl = document.getElementById(`newFoodF_${suffix}`);
        
        if (calEl) calEl.value = Math.round(baseCals * factor);
        if (pEl) pEl.value = (baseP * factor).toFixed(1);
        if (cEl) cEl.value = (baseC * factor).toFixed(1);
        if (fEl) fEl.value = (baseF * factor).toFixed(1);
    } else if (found) {
        // Si encontramos el alimento pero no hay cantidad aún, podrías poner los valores base de 100g/1ud como ayuda
        const baseCals = found.calories || found.cals || 0;
        const calEl = document.getElementById(`newFoodCal_${suffix}`);
        if (calEl) calEl.placeholder = baseCals;
    }
};

window.performMacroCalculation = function() {
    if (window.openNutritionCalculator) {
        window.openNutritionCalculator('macros');
    } else {
        showToast('Calculadora no disponible en esta página', 'error');
    }
};
