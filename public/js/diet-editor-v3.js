/* ============================================
   DIET EDITOR LOGIC (Core)
   ============================================ */

window.editingDietId = null;
window.activeMealForm = null;

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
        const option1Foods = (meal.foods || []).filter(f => !f.option || f.option === 1);
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
                        ${currentCalories} <span class="text-xs text-muted">/ <input type="number" value="${diet.calories || 0}" onchange="window.updateDietGoal('calories', this.value)" style="${goalInputStyle}"></span>
                    </div>
                     <div class="progress-bar mt-xs" style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px;"><div style="width: ${calPercent}%; height: 100%; background: var(--primary-color); border-radius: 3px; transition: width 0.3s;"></div></div>
                </div>
                <div>
                    <div class="text-xs text-muted mb-xs uppercase">Proteína</div>
                    <div class="text-lg font-bold text-success flex justify-center align-center gap-xs">
                        ${currentMacros.protein}g <span class="text-xs text-muted">/ <input type="number" value="${diet.macros?.protein || 0}" onchange="window.updateDietGoal('protein', this.value)" style="${goalInputStyle}">g</span>
                    </div>
                     <div class="progress-bar mt-xs" style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px;"><div style="width: ${proteinPercent}%; height: 100%; background: #00e676; border-radius: 3px; transition: width 0.3s;"></div></div>
                </div>
                <div>
                    <div class="text-xs text-muted mb-xs uppercase">Carbos</div>
                    <div class="text-lg font-bold text-warning flex justify-center align-center gap-xs">
                        ${currentMacros.carbs}g <span class="text-xs text-muted">/ <input type="number" value="${diet.macros?.carbs || 0}" onchange="window.updateDietGoal('carbs', this.value)" style="${goalInputStyle}">g</span>
                    </div>
                     <div class="progress-bar mt-xs" style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px;"><div style="width: ${carbPercent}%; height: 100%; background: #ff9800; border-radius: 3px; transition: width 0.3s;"></div></div>
                </div>
                <div>
                    <div class="text-xs text-muted mb-xs uppercase">Grasas</div>
                    <div class="text-lg font-bold text-error flex justify-center align-center gap-xs">
                        ${currentMacros.fat}g <span class="text-xs text-muted">/ <input type="number" value="${diet.macros?.fat || 0}" onchange="window.updateDietGoal('fat', this.value)" style="${goalInputStyle}">g</span>
                    </div>
                     <div class="progress-bar mt-xs" style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px;"><div style="width: ${fatPercent}%; height: 100%; background: #ff5252; border-radius: 3px; transition: width 0.3s;"></div></div>
                </div>
             </div>
        </div>

        <div class="grid grid-2 gap-sm" style="padding-right: 5px;">
            ${(diet.meals || []).map((meal, idx) => window.renderMealCard(meal, idx)).join('')}
        </div>
    `;
};

window.renderDietEditor = function () {
    if (!window.editingDietId) return;
    const diet = Diets.getById(window.editingDietId);
    if (!diet) return;

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
            { text: 'Cerrar sin guardar', class: 'btn-secondary', onclick: 'window.closeDietEditor()' }
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
                                                <td style="text-align: center; color: var(--text-muted); padding: 6px;">${food.quantity === '1 ración' ? '-' : food.quantity}</td>
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

    const food = {
        name,
        quantity: quantity || '-',
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
            Foods.create({
                name: food.name,
                calories: food.calories,
                protein: food.protein,
                carbs: food.carbs,
                fat: food.fat,
                type: 'unit'
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
    const diet = Diets.getById(dietId);
    if (!diet) return;

    let totalCals = 0;
    let totalMacros = { protein: 0, carbs: 0, fat: 0 };

    (diet.meals || []).forEach(meal => {
        // Solo sumamos la Opción 1 para el total de la tarjeta
        const option1Foods = (meal.foods || []).filter(f => !f.option || f.option === 1);
        option1Foods.forEach(food => {
            totalCals += parseInt(food.calories || 0);
            totalMacros.protein += parseFloat(food.protein || 0);
            totalMacros.carbs += parseFloat(food.carbs || 0);
            totalMacros.fat += parseFloat(food.fat || 0);
        });
    });

    // Actualizamos los valores reales del objeto dieta
    Diets.update(dietId, { 
        calories: totalCals, 
        macros: {
            protein: Math.round(totalMacros.protein),
            carbs: Math.round(totalMacros.carbs),
            fat: Math.round(totalMacros.fat)
        }
    });

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
    
    Diets.update(window.editingDietId, { meals: diet.meals });
    window.renderDietEditor();
};

window.updateMealName = function (mealIdx, newName) {
    const diet = Diets.getById(window.editingDietId);
    diet.meals[mealIdx].name = newName;
    Diets.update(window.editingDietId, { meals: diet.meals });
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
    const recipes = Media.getAll().filter(m => m.category === 'recipe');
    const content = `
        <div class="tabs mb-md" style="display: flex; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
            <button id="tabBtn-lib" class="btn btn-sm btn-primary" onclick="window.switchPhotoTab('lib')">Biblioteca</button>
            <button id="tabBtn-upload" class="btn btn-sm btn-outline" onclick="window.switchPhotoTab('upload')">Subir Foto</button>
        </div>
        <div id="tab-lib">
             ${recipes.length === 0 ? '<p class="text-muted p-md text-center">No hay recetas en la biblioteca</p>' :
            `<div class="grid grid-3 gap-sm">${recipes.map(r => `
                <div class="card p-0 cursor-pointer" onclick="window.selectDietPhoto(${mealIdx}, ${optionNum}, '${r.url}')">
                    <img src="${r.url}" style="width: 100%; aspect-ratio: 16/9; object-fit: cover;">
                    <div class="p-xs text-xs text-center text-truncate">${r.title}</div>
                </div>`).join('')}</div>`
        }
        </div>
        <div id="tab-upload" style="display: none; padding: 20px; text-center;">
             <input type="file" id="dietPhotoInput" accept="image/*" class="form-input" onchange="window.previewDietPhotoUpload()">
             <img id="dietPhotoPreview" style="max-width: 100%; margin-top: 10px; border-radius: 8px; display: none;">
             <button class="btn btn-primary mt-md" onclick="window.saveUploadedDietPhoto(${mealIdx}, ${optionNum})">Guardar Foto</button>
        </div>
    `;
    showModal('Seleccionar Foto', content, [{ text: 'Cerrar', class: 'btn-secondary', onclick: 'window.closeModal(this)' }]);
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
                diet.meals[mealIdx].foods.push({
                    name: name,
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
        const hasThisDiet  = c.assignedDiet === dietId;
        const hasDiffDiet  = c.assignedDiet && c.assignedDiet !== dietId;
        const otherDiet    = hasDiffDiet ? Diets.getById(c.assignedDiet) : null;

        let statusHtml = '';
        if (hasThisDiet) {
            statusHtml = '<span style="color:#00e676;">✓ Esta dieta está activa para este cliente</span>';
        } else if (hasDiffDiet) {
            statusHtml = `Tiene asignada: <em>${otherDiet ? otherDiet.name : 'otra dieta'}</em>`;
        } else {
            statusHtml = 'Sin dieta asignada';
        }

        let actionsHtml = '';
        if (hasThisDiet) {
            actionsHtml = `
                <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end;">
                    <button class="btn btn-sm btn-primary" style="font-size:0.75rem;min-width:160px;"
                        onclick="window._updateActiveDiet('${c.id}','${dietId}')">
                        🔄 Actualizar dieta actual
                    </button>
                    <button class="btn btn-sm btn-outline" style="font-size:0.75rem;min-width:160px;color:#ff9800;border-color:rgba(255,152,0,0.4);"
                        onclick="window._archiveDiet('${c.id}','${dietId}')">
                        📦 Guardar como dieta antigua
                    </button>
                </div>`;
        } else if (hasDiffDiet) {
            actionsHtml = `
                <button class="btn btn-sm btn-outline" style="font-size:0.75rem;"
                    onclick="window._assignDiet('${c.id}','${dietId}')">
                    📤 Reemplazar&nbsp;dieta
                </button>`;
        } else {
            actionsHtml = `
                <button class="btn btn-sm btn-primary" style="font-size:0.75rem;"
                    onclick="window._assignDiet('${c.id}','${dietId}')">
                    📤 Asignar
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
    Clients.update(clientId, { assignedDiet: dietId, dietPublished: true });
    showToast('✓ Dieta publicada al cliente correctamente', 'success');
    document.getElementById('publishDietModal')?.remove();
    window.publishDietToClient(dietId);
};

window._updateActiveDiet = function (clientId, dietId) {
    _snapshotDietToHistory(clientId, dietId, 'updated');
    Clients.update(clientId, { assignedDiet: dietId, dietPublished: true });
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
    Clients.update(clientId, { assignedDiet: null, dietPublished: false });
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
    { names: ['Proteina en polvo', 'Batido de proteina', 'Whey Protein', 'Proteína de vainilla', 'Proteína chocolate', 'Proteína', 'Proteína en polvo isolate'], cals: 380, p: 80, c: 5, f: 4, type: 'unit', weightPerUnit: 30 },
    { names: ['Miel'], cals: 304, p: 0.3, c: 82, f: 0 },
    { names: ['Dátil'], cals: 282, p: 2.5, c: 75, f: 0.4, type: 'unit', weightPerUnit: 8 },
    { names: ['Cacao'], cals: 228, p: 20, c: 58, f: 14 },
    { names: ['Sirope de ágave'], cals: 310, p: 0, c: 78, f: 0 },
    { names: ['Aceitunas'], cals: 115, p: 0.8, c: 6.3, f: 10.7 },
    { names: ['Pesto'], cals: 529, p: 5.2, c: 6, f: 53 },
    { names: ['Mayonesa ligera'], cals: 180, p: 0.9, c: 8, f: 16 },
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

    const qty = parseFloat(qtyInput) || 0;

    // 1. Buscar en la base de datos de usuario (Foods) - Ahora con búsqueda flexible e inmune a nulos
    let found = null;
    if (typeof Foods !== 'undefined') {
        const allFoods = Foods.getAll();
        if (Array.isArray(allFoods)) {
            // Primero intentamos match exacto, luego por inclusión, comparando de forma segura
            found = allFoods.find(f => f && f.name && typeof f.name === 'string' && f.name.trim().toLowerCase() === nameInput) || 
                    allFoods.find(f => f && f.name && typeof f.name === 'string' && f.name.trim().toLowerCase().includes(nameInput));
        }
    }

    // 2. Si no, buscar en la base de datos interna básica
    if (!found && typeof window.foodDatabase !== 'undefined' && Array.isArray(window.foodDatabase)) {
        found = window.foodDatabase.find(f => f && f.names && Array.isArray(f.names) && f.names.some(n => n && typeof n === 'string' && n.trim().toLowerCase().includes(nameInput)));
    }

    if (found && qty > 0) {
        const baseCals = found.calories || found.cals || 0;
        const baseP = found.protein || found.p || 0;
        const baseC = found.carbs || found.c || 0;
        const baseF = found.fat || found.f || 0;

        // LÓGICA DE CÁLCULO MEJORADA
        let factor = 1;
        
        // Si el alimento está guardado por UNIDADES (ej: 1 huevo, 1 dátil)
        if (found.type === 'unit' || found.unit === 'unit') {
            factor = qty; // Multiplicamos directo: 2 unidades * 75kcal = 150kcal
        } else {
            // Por defecto asumimos que el alimento está guardado cada 100g
            factor = qty / 100; // 200g / 100 = factor 2
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
