// ============================================
// DATA MODELS & STORAGE MANAGEMENT - v310 STABLE
// ============================================

const DB_VERSION = '1.0.1';
let activeTrainerId = localStorage.getItem('activeTrainerId') || 'default';
window.activeTrainerId = activeTrainerId;
const getStorageKey = () => `fitnessAppData_${window.activeTrainerId || 'default'}`;

const updateActiveTrainerId = (newId) => {
    window.activeTrainerId = newId;
    localStorage.setItem('activeTrainerId', newId);
    console.log("Storage Key actualizada para:", newId);
};
window.updateActiveTrainerId = updateActiveTrainerId;

// URL Parameter support for clients (accessing their trainer's data)
const urlParams = new URLSearchParams(window.location.search);
const trainerFromUrl = urlParams.get('t');
if (trainerFromUrl) {
    updateActiveTrainerId(trainerFromUrl);
}

const getData = () => {
  const sKey = getStorageKey();
  const raw = localStorage.getItem(sKey);
  
    

    const defaults = {
    version: DB_VERSION, clients: [], routines: [], diets: [], foods: [], media: [], 
    hidden_system_media: [], deleted_system_media: [], brand: { name: 'Infinite Coach', configured: true }
  };
  if (!raw) {
    const activeId = window.activeTrainerId || localStorage.getItem('activeTrainerId') || 'default';
    if (activeId !== 'default') {
      localStorage.setItem('isNewInstall_' + activeId, 'true');
      console.log(`🆕 Nueva instalación o caché limpia detectada para el entrenador ${activeId}. Registrando bandera 'isNewInstall'.`);
    }
    return defaults;
  }
  try {
    const parsed = JSON.parse(raw);
    
    const data = { ...defaults, ...parsed };
    if (!data.feedbacks) data.feedbacks = [];
    if (!data.appointments) data.appointments = [];
    if (!data.invoices) data.invoices = [];

    // 🔥 MIGRACIÓN ÚNICA: Restaurar recetas ocultas a activas
    if (!localStorage.getItem('v310_unhide_recipes_done')) {
        if (data.hidden_system_media) {
            data.hidden_system_media = data.hidden_system_media.filter(id => {
                const strId = String(id);
                // Si es ejercicio, se queda oculto si así lo querían
                if (strId.includes('-ex-') || strId.startsWith('sys-ex-')) return true;
                // Si es receta, se desoculta (return false para sacarlo de hidden_system_media)
                if (strId.includes('-rec-') || strId.startsWith('sys-br-') || strId.startsWith('sys-lun-') || strId.startsWith('sys-snack-') || strId.startsWith('prof-rec-')) return false;
                return false; // Desocultar cualquier otra cosa dudosa
            });
            localStorage.setItem('v310_unhide_recipes_done', 'true');
            try { localStorage.setItem(sKey, JSON.stringify(data)); } catch(e){}
            console.log('Restauradas recetas ocultas a activas.');
        }
    }

    // 🔥 MIGRACIÓN: Poblar "Mis Alimentos" con ingredientes maestros
    if (!localStorage.getItem('v316_seed_foods_done_v4')) {
        if (!data.foods) data.foods = [];
        const initialFoodsSeed = [
            { name: 'Pollo (Pechuga, Desmechado, Crudo)', calories: 120, protein: 23, carbs: 0, fat: 2.5, type: 'g' },
            { name: 'Pavo (Pechuga, Fiambre, Solomillo)', calories: 105, protein: 22, carbs: 0, fat: 1.5, type: 'g' },
            { name: 'Salmón (Fresco o Ahumado)', calories: 180, protein: 20, carbs: 0, fat: 11, type: 'g' },
            { name: 'Atún al natural', calories: 116, protein: 26, carbs: 0, fat: 1, type: 'g' },
            { name: 'Ternera magra', calories: 150, protein: 21, carbs: 0, fat: 5, type: 'g' },
            { name: 'Pescado blanco (Merluza, Lubina)', calories: 80, protein: 18, carbs: 0, fat: 1, type: 'g' },
            { name: 'Gambas cocidas', calories: 85, protein: 20, carbs: 0.5, fat: 0.8, type: 'g' },
            { name: 'Bacalao desmigado', calories: 82, protein: 18, carbs: 0, fat: 0.7, type: 'g' },
            { name: 'Sepia salteada', calories: 80, protein: 16, carbs: 0.7, fat: 0.9, type: 'g' },
            { name: 'Mejillones al vapor', calories: 86, protein: 12, carbs: 3.4, fat: 2.2, type: 'g' },
            { name: 'Jamón serrano (Limpio)', calories: 240, protein: 30, carbs: 0, fat: 13, type: 'g' },
            { name: 'Huevo entero', calories: 155, protein: 13, carbs: 1.1, fat: 11, type: 'unit' },
            { name: 'Claras de Huevo', calories: 52, protein: 11, carbs: 0.7, fat: 0.2, type: 'g' },
            { name: 'Requesón', calories: 100, protein: 12, carbs: 3, fat: 4, type: 'g' },
            { name: 'Queso cottage', calories: 98, protein: 11, carbs: 3.4, fat: 4.3, type: 'g' },
            { name: 'Queso fresco tipo Burgos', calories: 110, protein: 11, carbs: 3, fat: 6, type: 'g' },
            { name: 'Queso batido 0%', calories: 47, protein: 8, carbs: 3.5, fat: 0.1, type: 'g' },
            { name: 'Skyr', calories: 65, protein: 11, carbs: 4, fat: 0.2, type: 'g' },
            { name: 'Yogur griego', calories: 115, protein: 10, carbs: 3, fat: 7, type: 'unit' },
            { name: 'Yogur natural', calories: 60, protein: 3.5, carbs: 4.7, fat: 3.3, type: 'g' },
            { name: 'Kéfir', calories: 60, protein: 3.5, carbs: 4.8, fat: 3, type: 'g' },
            { name: 'Queso crema light', calories: 150, protein: 6, carbs: 5, fat: 12, type: 'g' },
            { name: 'Queso mozzarella light', calories: 200, protein: 22, carbs: 2, fat: 12, type: 'g' },
            { name: 'Queso curado / gratinado', calories: 380, protein: 25, carbs: 1.3, fat: 30, type: 'g' },
            { name: 'Queso havarti (Loncha)', calories: 330, protein: 21, carbs: 0.5, fat: 26, type: 'g' },
            { name: 'Leche desnatada', calories: 34, protein: 3.4, carbs: 5, fat: 0.1, type: 'g' },
            { name: 'Leche de soja', calories: 45, protein: 3.3, carbs: 2.5, fat: 1.8, type: 'g' },
            { name: 'Leche de almendras / avellanas', calories: 24, protein: 0.5, carbs: 3, fat: 1.1, type: 'g' },
            { name: 'Copos de avena / Harina de avena', calories: 389, protein: 16.9, carbs: 66, fat: 6.9, type: 'g' },
            { name: 'Arroz (Blanco, Integral, Basmati, Jazmín)', calories: 350, protein: 7, carbs: 78, fat: 0.5, type: 'g' },
            { name: 'Pasta integral', calories: 350, protein: 12, carbs: 72, fat: 1.5, type: 'g' },
            { name: 'Pan integral / Centeno / Masa madre', calories: 250, protein: 9, carbs: 45, fat: 2.5, type: 'g' },
            { name: 'Tortitas de arroz o maíz', calories: 380, protein: 8, carbs: 80, fat: 3, type: 'unit' },
            { name: 'Tortilla de trigo integral', calories: 290, protein: 8, carbs: 45, fat: 6, type: 'unit' },
            { name: 'Tortilla de maíz', calories: 220, protein: 5, carbs: 45, fat: 2.5, type: 'unit' },
            { name: 'Batata / Boniato (asado)', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, type: 'g' },
            { name: 'Patata (Asada, Puré, Baby)', calories: 77, protein: 2, carbs: 17, fat: 0.1, type: 'g' },
            { name: 'Quinoa cocida', calories: 370, protein: 14, carbs: 64, fat: 6, type: 'g' },
            { name: 'Cuscús integral', calories: 350, protein: 12, carbs: 73, fat: 1.5, type: 'g' },
            { name: 'Colines / Bastones integrales', calories: 390, protein: 11, carbs: 72, fat: 5, type: 'g' },
            { name: 'Granola casera', calories: 450, protein: 10, carbs: 60, fat: 18, type: 'g' },
            { name: 'Arepa de maíz precocido', calories: 360, protein: 7, carbs: 77, fat: 2.5, type: 'g' },
            { name: 'Garbanzos cocidos', calories: 364, protein: 19, carbs: 61, fat: 6, type: 'g' },
            { name: 'Lentejas cocidas', calories: 350, protein: 25, carbs: 63, fat: 1, type: 'g' },
            { name: 'Alubias blancas cocidas', calories: 330, protein: 21, carbs: 60, fat: 0.8, type: 'g' },
            { name: 'Falafel horneado', calories: 250, protein: 13, carbs: 30, fat: 8, type: 'g' },
            { name: 'Hummus de garbanzo', calories: 170, protein: 5, carbs: 14, fat: 10, type: 'g' },
            { name: 'Tofu firme', calories: 76, protein: 8, carbs: 1.9, fat: 4.8, type: 'g' },
            { name: 'Edamame al vapor', calories: 120, protein: 11, carbs: 9, fat: 5, type: 'g' },
            { name: 'Aguacate (Guacamole)', calories: 160, protein: 2, carbs: 9, fat: 15, type: 'g' },
            { name: 'Aceite de oliva virgen extra', calories: 884, protein: 0, carbs: 0, fat: 100, type: 'g' },
            { name: 'Crema de cacahuete o almendras', calories: 588, protein: 25, carbs: 20, fat: 50, type: 'g' },
            { name: 'Nueces', calories: 654, protein: 15, carbs: 14, fat: 65, type: 'g' },
            { name: 'Almendras naturales', calories: 579, protein: 21, carbs: 22, fat: 49, type: 'g' },
            { name: 'Pistachos o Anacardos', calories: 560, protein: 19, carbs: 29, fat: 44.5, type: 'g' },
            { name: 'Semillas (Chía, Lino, Calabaza)', calories: 530, protein: 19, carbs: 30, fat: 43, type: 'g' },
            { name: 'Plátano', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, type: 'unit' },
            { name: 'Manzana', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, type: 'unit' },
            { name: 'Arándanos frescos', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, type: 'g' },
            { name: 'Fresas', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, type: 'g' },
            { name: 'Kiwi', calories: 61, protein: 1.1, carbs: 15, fat: 0.5, type: 'unit' },
            { name: 'Mango', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, type: 'g' },
            { name: 'Frambuesas', calories: 52, protein: 1.2, carbs: 12, fat: 0.7, type: 'g' },
            { name: 'Pera', calories: 57, protein: 0.4, carbs: 15, fat: 0.1, type: 'unit' },
            { name: 'Piña natural', calories: 50, protein: 0.5, carbs: 13, fat: 0.1, type: 'g' },
            { name: 'Melocotón', calories: 39, protein: 0.9, carbs: 9.5, fat: 0.3, type: 'unit' },
            { name: 'Papaya', calories: 43, protein: 0.5, carbs: 11, fat: 0.3, type: 'g' },
            { name: 'Higos frescos', calories: 74, protein: 0.8, carbs: 19, fat: 0.3, type: 'g' },
            { name: 'Uvas rojas', calories: 67, protein: 0.6, carbs: 17, fat: 0.4, type: 'g' },
            { name: 'Mandarina', calories: 53, protein: 0.8, carbs: 13, fat: 0.3, type: 'unit' },
            { name: 'Proteína en polvo (Whey)', calories: 380, protein: 80, carbs: 5, fat: 4, type: 'g' },
            { name: 'Miel de abejas', calories: 304, protein: 0.3, carbs: 82, fat: 0, type: 'g' },
            { name: 'Dátil', calories: 282, protein: 2.5, carbs: 75, fat: 0.4, type: 'unit' },
            { name: 'Cacao puro en polvo', calories: 228, protein: 20, carbs: 58, fat: 14, type: 'g' },
            { name: 'Sirope de ágave', calories: 310, protein: 0, carbs: 78, fat: 0, type: 'g' },
            { name: 'Salsa Pesto', calories: 529, protein: 5.2, carbs: 6, fat: 53, type: 'g' },
            { name: 'Salsa de yogur light', calories: 80, protein: 3.5, carbs: 7, fat: 4, type: 'g' },
            { name: 'Fruta contable', calories: 70, protein: 0.8, carbs: 16, fat: 0.3, type: 'unit' },
            { name: 'Fruta incontable', calories: 50, protein: 0.7, carbs: 11, fat: 0.2, type: 'g' }
        ];

        initialFoodsSeed.forEach(item => {
            const exists = data.foods.some(f => f.name.toLowerCase() === item.name.toLowerCase());
            if (!exists) {
                // Generate a pseudo-random UUID structure manually
                const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
                const newId = s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
                data.foods.push({
                    id: newId,
                    name: item.name,
                    calories: item.calories,
                    protein: item.protein,
                    carbs: item.carbs,
                    fat: item.fat,
                    type: item.type,
                    createdAt: new Date().toISOString()
                });
            }
        });
        localStorage.setItem('v316_seed_foods_done_v4', 'true');
        setTimeout(() => { saveData(data); }, 50);
    }

    // 🔥 MIGRACIÓN: Eliminar alimentos anteriores/duplicados obsoletos
    if (!localStorage.getItem('v316_clean_duplicates_done_v5')) {
        if (data.foods && Array.isArray(data.foods)) {
            const obsoleteNames = [
                'mejillones',
                'pavo (solomillo/pechuga)',
                'pollo (pechuga/solomillo)',
                'pechuga de pollo',
                'arándanos',
                'pechuga de pavo',
                'arroz (integral/jazmín/basmati)',
                'arroz (blanco, integral, basmati)'
            ];
            const initialLen = data.foods.length;
            data.foods = data.foods.filter(food => {
                const lowerName = food.name.toLowerCase().trim();
                return !obsoleteNames.includes(lowerName);
            });
            if (data.foods.length !== initialLen) {
                console.log(`🧹 Eliminados ${initialLen - data.foods.length} alimentos duplicados u obsoletos.`);
                localStorage.setItem('v316_clean_duplicates_done_v5', 'true');
                setTimeout(() => { saveData(data); }, 100);
            } else {
                localStorage.setItem('v316_clean_duplicates_done_v5', 'true');
            }
        } else {
            localStorage.setItem('v316_clean_duplicates_done_v5', 'true');
        }
    }

    // 🔥 PURGA DE RECETAS NO OFICIALES (Blindaje 145)
    if (data.media && Array.isArray(data.media)) {
        const initialLen = data.media.length;
        data.media = data.media.filter(m => {
            if (m.category !== 'recipe') return true; 
            return String(m.id).startsWith('sys-');
        });
        if (data.media.length !== initialLen) {
            console.log("🧹 Purga de recetas no oficiales ejecutada.");
            try { localStorage.setItem(sKey, JSON.stringify(data)); } catch(e){}
        }
    }
    return data;

  } catch (e) { return defaults; }
};
window.getData = getData;

const saveData = (data) => {
  data.lastModified = new Date().toISOString();
  localStorage.setItem(getStorageKey(), JSON.stringify(data));
  if (window.SupabaseService) {
    const currentId = window.activeTrainerId || localStorage.getItem('activeTrainerId') || 'default';
    if (currentId !== 'default') {
      window.SupabaseService.saveTrainerData(currentId, data)
          .catch(e => console.warn('Supabase DB Sync Error:', e));
    }
  }
};
window.saveData = saveData;

window.syncFromCloud = async () => {
    const currentId = window.activeTrainerId || localStorage.getItem('activeTrainerId') || 'default';
    if (currentId === 'default' || !window.SupabaseService) return null;
    try {
        const cloudData = await window.SupabaseService.getTrainerData(currentId);
        
        // Obtener datos locales actuales
        const localRaw = localStorage.getItem(getStorageKey());
        let localData = null;
        if (localRaw) {
            try { localData = JSON.parse(localRaw); } catch(e){}
        }

        if (cloudData) {
            // Garantizar que todos los arrays existen en la nube
            const collections = ['clients', 'routines', 'diets', 'foods', 'media', 'feedbacks', 'appointments', 'invoices', 'trainingBlocks'];
            collections.forEach(col => {
                if (!cloudData[col]) cloudData[col] = [];
            });

            if (localData) {
                // Garantizar que todos los arrays existen localmente
                collections.forEach(col => {
                    if (!localData[col]) localData[col] = [];
                });

                // 1. DETECTAR SI LOCAL ES UN BEBÉ (FRESHLY INITIALIZED EMPTY SLATE)
                // Si el local no tiene ningún dato creado por el entrenador (clientes, rutinas, dietas, trainingBlocks)
                // pero la nube sí tiene datos, entonces ignoramos timestamps y descargamos TODO de la nube.
                const localHasClients = localData.clients && localData.clients.length > 0;
                const localHasRoutines = localData.routines && localData.routines.length > 0;
                const localHasDiets = localData.diets && localData.diets.length > 0;
                const localHasBlocks = localData.trainingBlocks && localData.trainingBlocks.length > 0;

                const cloudHasClients = cloudData.clients && cloudData.clients.length > 0;
                const cloudHasRoutines = cloudData.routines && cloudData.routines.length > 0;
                const cloudHasDiets = cloudData.diets && cloudData.diets.length > 0;
                const cloudHasBlocks = cloudData.trainingBlocks && cloudData.trainingBlocks.length > 0;

                const isLocalFreshlyInitialized = !localHasClients && !localHasRoutines && !localHasDiets && !localHasBlocks;
                const cloudHasTrainerData = cloudHasClients || cloudHasRoutines || cloudHasDiets || cloudHasBlocks;
                const isNewInstall = localStorage.getItem('isNewInstall_' + currentId) === 'true';

                if ((isNewInstall || isLocalFreshlyInitialized) && cloudHasTrainerData) {
                    console.log("📥 El almacenamiento local estaba vacío o es nuevo, pero la nube tiene datos. Descargando de la nube...");
                    localStorage.removeItem('isNewInstall_' + currentId);
                    // Preservar branding local si lo hay
                    const trainerBrandRaw = localStorage.getItem('_trainerBrand');
                    const brandSettingsRaw = localStorage.getItem('brand_settings');
                    const localBrandRaw = trainerBrandRaw || brandSettingsRaw;
                    if (localBrandRaw) {
                        try {
                            const localBrand = JSON.parse(localBrandRaw);
                            if (!cloudData.brand) cloudData.brand = {};
                            cloudData.brand = { ...cloudData.brand, ...localBrand };
                        } catch(e) {}
                    }
                    localStorage.setItem(getStorageKey(), JSON.stringify(cloudData));
                    return cloudData;
                }

                // 2. FUSIÓN INTELIGENTE BIDIRECCIONAL POR ID Y TIMESTAMP
                const localTime = localData.lastModified ? new Date(localData.lastModified).getTime() : 0;
                const cloudTime = cloudData.lastModified ? new Date(cloudData.lastModified).getTime() : 0;
                
                let dataChanged = false;
                const mergedData = { ...cloudData }; // Empezamos con copia de cloud

                collections.forEach(col => {
                    const localItems = localData[col] || [];
                    const cloudItems = cloudData[col] || [];
                    
                    const localMap = new Map(localItems.map(item => [item.id, item]));
                    const cloudMap = new Map(cloudItems.map(item => [item.id, item]));

                    const allIds = new Set([...localMap.keys(), ...cloudMap.keys()]);
                    const mergedItems = [];

                    allIds.forEach(id => {
                        if (!id) return;
                        const localItem = localMap.get(id);
                        const cloudItem = cloudMap.get(id);

                        if (localItem && cloudItem) {
                            // Existe en ambos: decidir por timestamp
                            if (localTime > cloudTime) {
                                mergedItems.push(localItem);
                                // Si son diferentes, marcamos cambio
                                if (JSON.stringify(localItem) !== JSON.stringify(cloudItem)) {
                                    dataChanged = true;
                                }
                            } else {
                                mergedItems.push(cloudItem);
                                if (JSON.stringify(localItem) !== JSON.stringify(cloudItem)) {
                                    dataChanged = true;
                                }
                            }
                        } else if (localItem) {
                            // Solo existe localmente (nuevo item local o eliminado en la nube)
                            // Si local es más nuevo o si queremos conservar todo para evitar pérdidas, lo añadimos
                            mergedItems.push(localItem);
                            dataChanged = true;
                        } else if (cloudItem) {
                            // Solo existe en la nube (nuevo item de otro dispositivo o eliminado localmente)
                            // Si el usuario eliminó localmente, y local es más nuevo (localTime > cloudTime), respetamos la eliminación.
                            // De lo contrario, lo añadimos.
                            if (localTime > cloudTime) {
                                // Eliminado localmente, no lo añadimos a mergedItems, marcamos cambio
                                dataChanged = true;
                            } else {
                                mergedItems.push(cloudItem);
                            }
                        }
                    });

                    mergedData[col] = mergedItems;
                });

                // Preservar marca
                const trainerBrandRaw = localStorage.getItem('_trainerBrand');
                const brandSettingsRaw = localStorage.getItem('brand_settings');
                const localBrandRaw = trainerBrandRaw || brandSettingsRaw;
                if (localBrandRaw) {
                    try {
                        const localBrand = JSON.parse(localBrandRaw);
                        if (!mergedData.brand) mergedData.brand = {};
                        mergedData.brand = { ...mergedData.brand, ...localBrand };
                    } catch(e) {}
                }

                if (localTime > cloudTime || dataChanged) {
                    console.log("📤 Sincronizando cambios locales fusionados a la nube...");
                    mergedData.lastModified = new Date().toISOString();
                    await window.SupabaseService.saveTrainerData(currentId, mergedData);
                }

                localStorage.setItem(getStorageKey(), JSON.stringify(mergedData));
                return mergedData;
            }

            // Preservar marca
            const trainerBrandRaw = localStorage.getItem('_trainerBrand');
            const brandSettingsRaw = localStorage.getItem('brand_settings');
            const localBrandRaw = trainerBrandRaw || brandSettingsRaw;
            if (localBrandRaw) {
                try {
                    const localBrand = JSON.parse(localBrandRaw);
                    if (!cloudData.brand) cloudData.brand = {};
                    cloudData.brand = { ...cloudData.brand, ...localBrand };
                } catch(e) {}
            }
            localStorage.setItem(getStorageKey(), JSON.stringify(cloudData));
            return cloudData;
        } else if (localData) {
            // Si no hay datos en la nube pero sí locales, subirlos
            console.log("📤 Subiendo datos locales iniciales a la nube...");
            await window.SupabaseService.saveTrainerData(currentId, localData);
            return localData;
        }
    } catch (e) { console.error("Sync Error:", e); }
    return null;
};

// BIBLIOTECA MAESTRA (100+ EJERCICIOS)
// RECETAS A FUEGO (148)
window.SYSTEM_RECIPES = [
  {
    "id": "sys-rec-salmorejo-jamon-v1",
    "type": "image",
    "category": "recipe",
    "title": "Salmorejo Cordobés con Jamón y Huevo",
    "url": "img/salmorejo_huevo_jamon.png",
    "ingredients": "Salmorejo, Huevo, Jamón serrano",
    "description": "Crema fría de tomate tradicional cordobesa, densa y aterciopelada, decorada con huevo duro picado finamente, virutas crujientes de jamón serrano y un toque de aceite de oliva virgen extra."
  },
  {
    "id": "sys-rec-tostada-pina-v1",
    "type": "image",
    "category": "recipe",
    "title": "Tostada Serrana con Piña",
    "url": "img/tostada_serrana_pina.png",
    "ingredients": "Tostada pan, Huevo, Jamón serrano, Piña",
    "description": "Exquisito desayuno gourmet que combina el sabor salado del jamón serrano y el huevo a la plancha con la frescura dulce de la piña sobre pan tostado."
  },
  {
    "id": "sys-br-1-v6",
    "type": "image",
    "category": "recipe",
    "title": "Porridge avena",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778607572846_Porridge_pro.png",
    "ingredients": "Avena, proteína en polvo, crema de cacahuete",
    "description": "Desayuno energético con carbohidratos complejos y proteína."
  },
  {
    "id": "sys-br-3-v6",
    "type": "image",
    "category": "recipe",
    "title": "Bowl de Yogur y Granola",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778607613336_Yogur_Energy.png",
    "ingredients": "Yogur griego, granola casera, arándanos",
    "description": "Equilibrio perfecto entre lácteos, cereales y fruta."
  },
  {
    "id": "sys-br-4-v6",
    "type": "image",
    "category": "recipe",
    "title": "Tortilla y Pan",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778607638262_omelette_fit.png",
    "ingredients": "Huevos, espinacas, champiñones, rebanada de pan de centeno",
    "description": "Desayuno bajo en carbos y alto en fibra vegetal."
  },
  {
    "id": "sys-br-5-v6",
    "type": "image",
    "category": "recipe",
    "title": "Batido de Avena y Plátano",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778607654826_Batido_avena_y_platano.png",
    "ingredients": "Leche de soja, plátano, avena, semillas de lino",
    "description": "Ideal para antes o después de entrenar."
  },
  {
    "id": "prof-rec-pancakes-v4",
    "type": "image",
    "category": "recipe",
    "title": "Pancakes de Requesón",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778607667510_Pancakes_de_requeson.png",
    "ingredients": "Claras de huevo, Requesón, Harina avena, Nueces",
    "description": "Tortitas altas en proteína y bajas en grasa."
  },
  {
    "id": "sys-br-7-v6",
    "type": "image",
    "category": "recipe",
    "title": "Bowl kéfir",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778607690878_Bowl_tropical.png",
    "ingredients": "Kéfir, mango, coco rallado",
    "description": "Frescura y probióticos para empezar el día."
  },
  {
    "id": "prof-rec-salmon-v3",
    "type": "image",
    "category": "recipe",
    "title": "Tostada de Salmón y Aguacate",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778607706061_Tostada_salmon.png",
    "ingredients": "Pan integral, Salmón ahumado, Aguacate",
    "description": "Omega-3 y carbohidratos de gramo completo."
  },
  {
    "id": "sys-br-10-v6",
    "type": "image",
    "category": "recipe",
    "title": "Burrito de huevo y Aguacate",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778607741075_Breakfast_burrito.png",
    "ingredients": "Tortilla de trigo integral, huevos revueltos, Aguacate",
    "description": "Versión saludable del clásico burrito."
  },
  {
    "id": "prof-rec-fruta-queso-pro",
    "type": "image",
    "category": "recipe",
    "title": "Manzana y Queso fresco",
    "url": "img/fruta-queso-pro.png",
    "ingredients": "Manzana o pera, queso fresco tipo Burgos",
    "description": "Bajo en calorías y muy saciante."
  },
  {
    "id": "prof-rec-chia-v2",
    "type": "image",
    "category": "recipe",
    "title": "Chia Pudding con Fruta",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778607773945_Chia_Pudding_con_Fruta.png",
    "ingredients": "Semillas de chía, Leche desnatada, Fresas, Kiwi",
    "description": "Alto contenido en fibra y grasas buenas."
  },
  {
    "id": "sys-br-12-v6",
    "type": "image",
    "category": "recipe",
    "title": "Tortitas de Arroz, Pavo y Aguacate",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778607800096_Tortitas_de_arroz_pack.png",
    "ingredients": "Tortitas de arroz, pavo, aguacate",
    "description": "Alternativa rápida y nutritiva."
  },
  {
    "id": "sys-br-13-v6",
    "type": "image",
    "category": "recipe",
    "title": "Bagel de Pavo y Queso",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778607818477_Bagel_de_pavo.png",
    "ingredients": "Bagel integral, pechuga de pavo, queso crema light",
    "description": "Proteína magra en formato divertido."
  },
  {
    "id": "sys-br-14-v6",
    "type": "image",
    "category": "recipe",
    "title": "Tostada de Hummus y Huevo",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778607913727_Hummus_toast.png",
    "ingredients": "Pan integral, hummus, huevo cocido",
    "description": "Proteína vegetal y carbohidratos lentos."
  },
  {
    "id": "sys-br-15-v6",
    "type": "image",
    "category": "recipe",
    "title": "Bowl de Yogur, Fruta y Semillas calabaza",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778607926496_Bowl_antiox.png",
    "ingredients": "Yogur natural, frambuesas, semillas de calabaza",
    "description": "Súper alimentos para la recuperación."
  },
  {
    "id": "sys-br-16-v6",
    "type": "image",
    "category": "recipe",
    "title": "Muffins de Huevo, Patata y Pavo",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778607941795_Muffins_de_huevo.png",
    "ingredients": "Huevos, pavo picado, verduras, patata asada picada",
    "description": "Formato \"to-go\" para desayunos rápidos."
  },
  {
    "id": "sys-br-17-v6",
    "type": "image",
    "category": "recipe",
    "title": "Tofu y Pan",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778607964662_Tofu_scramble.png",
    "ingredients": "Tofu firme, cúrcuma, tostada de pan de masa madre",
    "description": "Opción 100% vegetal rica en proteína."
  },
  {
    "id": "sys-br-18-v6",
    "type": "image",
    "category": "recipe",
    "title": "Sandwich de Atún y Aguacate",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778607983228_Sandwich_de_atun.png",
    "ingredients": "Pan integral, atún al natural, mayonesa ligera o aguacate",
    "description": "Clásico rico en selenio y omega-3."
  },
  {
    "id": "sys-br-19-v6",
    "type": "image",
    "category": "recipe",
    "title": "Bowl de Requesón, Pistachos y Miel",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778659215870_Copa_requeson_y_miel.png",
    "ingredients": "Requesón, miel, pistachos",
    "description": "Postre de desayuno dulce y nutritivo."
  },
  {
    "id": "sys-br-20-v6",
    "type": "image",
    "category": "recipe",
    "title": "Smoothie Bowl Verde proteina",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778608010279_Smoothie_bowl_verde.png",
    "ingredients": "Espinacas, proteína de vainilla, manzana, semillas de chía",
    "description": "Shot de vitaminas y minerales."
  },
  {
    "id": "sys-lun-1",
    "type": "image",
    "category": "recipe",
    "title": "Pollo con Batata y Aceite",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778608024779_Pollo_con_batata.png",
    "ingredients": "Pechuga de pollo, batata asada, aceite de oliva",
    "description": "Combinación estrella del fitness."
  },
  {
    "id": "sys-lun-2",
    "type": "image",
    "category": "recipe",
    "title": "Pasta Integral Boloñesa",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778608049547_Pasta_Integral_Bolonesa.png",
    "ingredients": "Pasta integral, carne picada de ternera magra, sofrito",
    "description": "Energía sostenida y reconstrucción muscular."
  },
  {
    "id": "sys-lun-3",
    "type": "image",
    "category": "recipe",
    "title": "Salmón con Quinoa",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778608067861_Salmon_con_quinoa.png",
    "ingredients": "Salmón, quinoa, espárragos al vapor",
    "description": "Rico en Omega-3 y aminoácidos."
  },
  {
    "id": "prof-rec-ensalada-garbanzos-pro",
    "type": "image",
    "category": "recipe",
    "title": "Ensalada de Garbanzos y Aceitunas",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778608085696_Ensalada_de_garbanzos.png",
    "ingredients": "Garbanzos, atún, aceitunas",
    "description": "Legumbres rápidas y ricas en proteína."
  },
  {
    "id": "sys-lun-5",
    "type": "image",
    "category": "recipe",
    "title": "Tacos de Ternera y Guacamole",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778608112078_Tacos_de_ternera.png",
    "ingredients": "Tortillas de maíz, tiras de ternera, guacamole",
    "description": "Disfruta de la comida mexicana de forma saludable."
  },
  {
    "id": "prof-rec-sushi-fit-pro",
    "type": "image",
    "category": "recipe",
    "title": "Poke de Atún, Arroz y Edamame",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778608129811_Poke_de_atun.png",
    "ingredients": "Atún, Arroz integral, Edamame, Semillas de sésamo",
    "description": "Inspiración hawaiana equilibrada."
  },
  {
    "id": "prof-rec-lentejas-arroz-pro",
    "type": "image",
    "category": "recipe",
    "title": "Lentejas con Arroz y Aceite",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778608265963_Lentejas_con_arroz.png",
    "ingredients": "Lentejas, arroz integral, aceite de oliva",
    "description": "Proteína vegetal completa."
  },
  {
    "id": "sys-lun-8",
    "type": "image",
    "category": "recipe",
    "title": "Pavo con Arroz y Almendras",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778608284179_Pavo_con_arroz_jazmin.png",
    "ingredients": "Solomillo de pavo, arroz jazmín, almendras laminadas",
    "description": "Poca grasa y digestión rápida."
  },
  {
    "id": "prof-rec-ratatouille-pro",
    "type": "image",
    "category": "recipe",
    "title": "Berenjena Rellena",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778608313813_Berenjena_rellena.png",
    "ingredients": "Berenjena, carne de pavo, tomate, queso gratinado",
    "description": "Verduras con aporte proteico."
  },
  {
    "id": "prof-rec-ensalada-lentejas",
    "type": "image",
    "category": "recipe",
    "title": "Ensalada de Pasta y Pesto",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778608333411_Ensalada_de_Pasta_y_Pesto.png",
    "ingredients": "Pasta, cherries, pesto",
    "description": "Pasta rica en hierro y fibra."
  },
  {
    "id": "prof-rec-merluza-patatas-pro",
    "type": "image",
    "category": "recipe",
    "title": "Pescado blanco, Patatas y Aceite",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778608354663_Merluza_al_horno.png",
    "ingredients": "Merluza, patatas panadera, aceite de oliva",
    "description": "Pescado blanco suave y ligero."
  },
  {
    "id": "sys-lun-13-v2",
    "type": "image",
    "category": "recipe",
    "title": "Falafel y Hummus",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778608445732_Bowl_Falafel.png",
    "ingredients": "Falafel horneado, hummus, ensalada variada",
    "description": "Sabores de oriente medio."
  },
  {
    "id": "sys-lun-14",
    "type": "image",
    "category": "recipe",
    "title": "Hamburguesa con Pan y Queso",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778608468030_Hamburguesa_fit.png",
    "ingredients": "Pan integral, hamburguesa de pollo, loncha de queso havarti",
    "description": "Clásico adaptado a tus macros."
  },
  {
    "id": "sys-lun-16",
    "type": "image",
    "category": "recipe",
    "title": "Risotto de Setas, Queso, Arroz y Pavo",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778608499297_Risotto_de_Setas_y_Pollo.png",
    "ingredients": "Arroz integral, champiñones, pavo, parmesano light",
    "description": "Cremosidad sin exceso de grasas."
  },
  {
    "id": "sys-lun-17",
    "type": "image",
    "category": "recipe",
    "title": "Pizza de Base de Coliflor",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778608513314_Pizza_de_base_de_coliflor.png",
    "ingredients": "Coliflor, claras, atún, queso light, tomate",
    "description": "La pizza que encaja en cualquier dieta."
  },
  {
    "id": "sys-lun-28",
    "type": "image",
    "category": "recipe",
    "title": "Pasta con Gambas y Ajo",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778608671963_Pasta_con_gambas_y_ajo.png",
    "ingredients": "Pasta integral, gambas, ajo, guindilla",
    "description": "Energía y sabor."
  },
  {
    "id": "sys-lun-29",
    "type": "image",
    "category": "recipe",
    "title": "Brochetas de Pollo y Maíz",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778608692534_Brochetas_de_pollo.png",
    "ingredients": "Pollo, Maíz",
    "description": "Formato divertido para variar."
  },
  {
    "id": "sys-lun-32",
    "type": "image",
    "category": "recipe",
    "title": "Pimientos Rellenos, Carne y Arroz",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778608735948_Pimientos_rellenos.png",
    "ingredients": "Pimientos, arroz, carne magra de ternera",
    "description": "Completo y visual."
  },
  {
    "id": "prof-rec-crema-calabaza",
    "type": "image",
    "category": "recipe",
    "title": "Crema de Calabaza con Huevo",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778608769199_Crema_de_Calabaza_con_Huevo.png",
    "ingredients": "Calabaza, cebolla, huevo",
    "description": "Cena caliente y nutritiva."
  },
  {
    "id": "sys-lun-42",
    "type": "image",
    "category": "recipe",
    "title": "Ensalada de Garbanzos y Pepino",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778608855131_Ensalada_de_garbanzos.png",
    "ingredients": "Garbanzos, pepino, cebolla roja, perejil",
    "description": "Proteína vegetal rápida."
  },
  {
    "id": "sys-lun-44",
    "type": "image",
    "category": "recipe",
    "title": "Ensalada César de Pollo",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778608878832_Ensalada_cesar.png",
    "ingredients": "Pollo, yogur (aliño), picatostes integrales",
    "description": "Sin salsas industriales."
  },
  {
    "id": "prof-rec-guiso-pavo-pro",
    "type": "image",
    "category": "recipe",
    "title": "Guiso de Pavo",
    "url": "img/guiso-pavo-pro.png",
    "ingredients": "Pavo, champiñones, zanahoria",
    "description": "Tradición en modo fit."
  },
  {
    "id": "prof-rec-pollo-curry-pro",
    "type": "image",
    "category": "recipe",
    "title": "Pollo al Curry y Arroz",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778608920234_Pollo_al_curry.png",
    "ingredients": "Pollo, curry, arroz integral",
    "description": "Metabolismo activo."
  },
  {
    "id": "sys-lun-50",
    "type": "image",
    "category": "recipe",
    "title": "Burrito Bowl",
    "url": "img/burrito.png",
    "ingredients": "Arroz basmati, carne magra, frijoles, maíz, aguacate",
    "description": "Todo el sabor sin la tortilla."
  },
  {
    "id": "sys-snack-1",
    "type": "image",
    "category": "recipe",
    "title": "Manzana, Crema cacahuete y Proteína",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778608955433_Manzana_y_proteina.png",
    "ingredients": "Manzana, crema de almendras, batido de proteína",
    "description": "Combo equilibrado de carbos y grasa."
  },
  {
    "id": "sys-snack-4",
    "type": "image",
    "category": "recipe",
    "title": "Queso batido, Avena, Crema cacahuete",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778608989264_Copa_fit_de_requeson.png",
    "ingredients": "Queso batido, copos de avena, crema de cacahuete",
    "description": "Saciante y proteico."
  },
  {
    "id": "sys-snack-6-v2",
    "type": "image",
    "category": "recipe",
    "title": "Hummus con Colines",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609004449_Hummus_con_colines.png",
    "ingredients": "Bastones de pan integral, hummus de garbanzo",
    "description": "Fibras y grasas saludables."
  },
  {
    "id": "sys-snack-7",
    "type": "image",
    "category": "recipe",
    "title": "Batido de Cacao y Crema cacahuete",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609019799_Batido_snickers.png",
    "ingredients": "Leche, dátil, cacao, crema de cacahuete",
    "description": "Sabor espectacular e inteligente."
  },
  {
    "id": "sys-snack-8",
    "type": "image",
    "category": "recipe",
    "title": "Yogur con pera y chia",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609049883_Yogur_con_Pera_y_Chia.png",
    "ingredients": "Yogur griego o kéfir, pera, semillas de chía",
    "description": "100% vegetal con omega-3."
  },
  {
    "id": "sys-snack-10",
    "type": "image",
    "category": "recipe",
    "title": "Huevo y Fruta rápida",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609068481_Huevo_y_fruta_rapida.png",
    "ingredients": "Huevo duro, plátano pequeño",
    "description": "Nutrición básica y efectiva."
  },
  {
    "id": "sys-snack-11",
    "type": "image",
    "category": "recipe",
    "title": "Barrita de Proteína Casera",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609080415_Barritas_proteicas_caseras.png",
    "ingredients": "Proteína en polvo, harina de coco, sirope de ágave",
    "description": "Control de ingredientes máximo."
  },
  {
    "id": "sys-snack-12",
    "type": "image",
    "category": "recipe",
    "title": "Cottage con Piña y Almendras",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609100267_Cottage_con_pina.png",
    "ingredients": "Queso cottage, piña natural, almendras",
    "description": "Diurético y proteico."
  },
  {
    "id": "prof-rec-skyr-v4",
    "type": "image",
    "category": "recipe",
    "title": "Bowl Skyr, Anacardos y Melocotón",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609197334_Bowl_de_Skyr_y_Melocoton.png",
    "ingredients": "Skyr, Melocotón, Anacardos",
    "description": ""
  },
  {
    "id": "prof-rec-smoothie-v1",
    "type": "image",
    "category": "recipe",
    "title": "Batido Proteína y Plátano",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609247935_Smoothie_chocolate-avellana.png",
    "ingredients": "Bebida avellanas, Proteína chocolate, Plátano",
    "description": ""
  },
  {
    "id": "prof-rec-gachas-quinoa-pro",
    "type": "image",
    "category": "recipe",
    "title": "Gachas de Quinoa",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609279783_Gachas_de_quinoa.png",
    "ingredients": "Quinoa cocida, leche de almendras, canela",
    "description": ""
  },
  {
    "id": "prof-rec-skillet-patata-pro",
    "type": "image",
    "category": "recipe",
    "title": "Skillet de Patata y Huevo",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609292767_Skillet_de_patata_y_huevo.png",
    "ingredients": "Patata, claras, huevo entero, pimientos",
    "description": ""
  },
  {
    "id": "prof-rec-tortitas-avena-pro",
    "type": "image",
    "category": "recipe",
    "title": "Pancakes de Avena y Plátano",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609307849_Tortitas_de_avena_y_platano.png",
    "ingredients": "Harina de avena, Plátano, huevos, almendra molida",
    "description": ""
  },
  {
    "id": "prof-rec-wrap-almendras-pro",
    "type": "image",
    "category": "recipe",
    "title": "Wrap de Crema de Almendras",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609318769_Wrap_crema_de_almendras.png",
    "ingredients": "Tortilla integral, crema de almendras, fresas, proteína",
    "description": ""
  },
  {
    "id": "prof-rec-bacalao-v4",
    "type": "image",
    "category": "recipe",
    "title": "Revuelto de Bacalao, Huevo y Pan",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609334882_Revuelto_de_bacalao.png",
    "ingredients": "Bacalao desmigado, Huevo, Pan tostado",
    "description": ""
  },
  {
    "id": "prof-rec-pastel-carne",
    "type": "image",
    "category": "recipe",
    "title": "Pastel de Carne y Patata",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609431166_Pastel_de_Carne_y_Patata.png",
    "ingredients": "Carne picada de ternera, puré de patata casero, queso gratinado",
    "description": ""
  },
  {
    "id": "prof-rec-bowl-pollo-aguacate",
    "type": "image",
    "category": "recipe",
    "title": "Pollo, Aguacate y Cereales",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609452251_Bowl_de_Pollo_Aguacate_y_Cereales.png",
    "ingredients": "Cereal integral (farro o cebada), Pechuga de pollo a la plancha, Aguacate, Cilantro",
    "description": ""
  },
  {
    "id": "prof-rec-wrap-falafel",
    "type": "image",
    "category": "recipe",
    "title": "Wrap de Falafel",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609465717_Wrap_Integral_de_Falafel.png",
    "ingredients": "Tortilla integral, Falafel, Tomate, Lechuga, Salsa de yogur light",
    "description": ""
  },
  {
    "id": "prof-rec-pisto-huevo-pan",
    "type": "image",
    "category": "recipe",
    "title": "Pisto de Verduras con Huevo y Pan",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609481217_Pisto_de_Verduras_con_Huevo_y_Pan.png",
    "ingredients": "Tomates cherry, Calabacín, Pimiento rojo, Huevo poché, Pan integral tostado",
    "description": ""
  },
  {
    "id": "prof-rec-pescado-almendras",
    "type": "image",
    "category": "recipe",
    "title": "Pescado blanco con Almendras y Patatas",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609501517_Pescado_con_Almendras_y_Patatas.png",
    "ingredients": "Filete de pescado blanco, Almendras laminadas, Patatas baby cocidas, Aceite de oliva",
    "description": ""
  },
  {
    "id": "prof-rec-cuscus-yogur",
    "type": "image",
    "category": "recipe",
    "title": "Bowl de Cuscús con Yogur y Pasas",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609523317_Bowl_de_Cuscus_con_Yogur_y_Pasas.png",
    "ingredients": "Cuscús cocido, yogur natural, pasas",
    "description": ""
  },
  {
    "id": "prof-rec-papaya-requeson",
    "type": "image",
    "category": "recipe",
    "title": "Papaya con Requesón y Cáñamo",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609536567_Papaya_con_Requeson_y_Canamo.png",
    "ingredients": "Papaya, requesón, semillas de cáñamo",
    "description": ""
  },
  {
    "id": "prof-rec-tostada-higos",
    "type": "image",
    "category": "recipe",
    "title": "Tostada de Requesón e Higos",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609551552_Tostada_de_requeson_e_higos.png",
    "ingredients": "Pan integral, requesón, higos frescos",
    "description": ""
  },
  {
    "id": "prof-rec-tortita-atun",
    "type": "image",
    "category": "recipe",
    "title": "Tortitas de Arroz con Atún y Aceite",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609565167_Tortita_de_arroz_y_atun.png",
    "ingredients": "Tortitas de arroz o maíz, atún al natural, aceite de oliva",
    "description": ""
  },
  {
    "id": "prof-rec-queso-uvas",
    "type": "image",
    "category": "recipe",
    "title": "Queso y Pavo",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609584799_Pavo_y_queso.png",
    "ingredients": "Queso curado, uvas rojas, pechuga de pavo",
    "description": ""
  },
  {
    "id": "prof-rec-requeson-nuez",
    "type": "image",
    "category": "recipe",
    "title": "Tostada de Requesón y Nueces",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609603768_Tostada_de_requeson_y_nueces.png",
    "ingredients": "Pan integral, requesón, nueces",
    "description": ""
  },
  {
    "id": "prof-rec-arepa-pollo",
    "type": "image",
    "category": "recipe",
    "title": "Arepa de Pollo y Aguacate",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609629034_Arepa_de_pollo_y_aguacate.png",
    "ingredients": "Maíz precocido, pollo desmechado, aguacate",
    "description": ""
  },
  {
    "id": "prof-rec-quesadilla-pollo",
    "type": "image",
    "category": "recipe",
    "title": "Quesadilla de Pollo y Queso",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609639501_Quesadilla_de_Pollo_y_Queso.png",
    "ingredients": "Tortilla integral, Pechuga de pollo desmechada, Queso mozzarella light",
    "description": ""
  },
  {
    "id": "prof-rec-tostada-tomate-huevo",
    "type": "image",
    "category": "recipe",
    "title": "Tostada con Tomate y Huevo",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609666985_Tostada_con_Tomate_y_Huevo.png",
    "ingredients": "Pan integral, tomate natural en rodajas, huevo a la plancha, aceite de oliva virgen extra",
    "description": ""
  },
  {
    "id": "prof-rec-cuscus-ternera",
    "type": "image",
    "category": "recipe",
    "title": "Cuscús con Ternera y Verduras",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609680319_Cuscus_con_Ternera_y_Verduras.png",
    "ingredients": "Cuscús integral, dados de ternera, calabacín, judías verdes, zanahoria",
    "description": ""
  },
  {
    "id": "prof-rec-bowl-tofu-garbanzo",
    "type": "image",
    "category": "recipe",
    "title": "Bowl Veggie de Tofu y Garbanzos",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609699286_Bowl_Veggie_de_Tofu_y_Garbanzos.png",
    "ingredients": "Tofu firme crujiente, garbanzos tostados, base de espinacas, salsa de tahini",
    "description": ""
  },
  {
    "id": "prof-rec-estofado-ternera",
    "type": "image",
    "category": "recipe",
    "title": "Estofado de Ternera y Patata con Zanahoria",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609711020_Estofado_de_Ternera_con_Zanahoria.png",
    "ingredients": "Tacos de ternera magra, zanahoria, guisantes, salsa de carne, patata",
    "description": ""
  },
  {
    "id": "prof-rec-lentejas-salmon",
    "type": "image",
    "category": "recipe",
    "title": "Lentejas, Salmón y Nueces",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609749018_Ensalada_de_Lentejas_y_Salmon.png",
    "ingredients": "Lentejas cocidas, salmón al horno, nueces, vinagreta de limón",
    "description": ""
  },
  {
    "id": "prof-rec-sepia-guisantes",
    "type": "image",
    "category": "recipe",
    "title": "Sepia con Guisantes",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609776753_Sepia_Salteada_con_Guisantes.png",
    "ingredients": "Sepia, guisantes, ajo, perejil, aceite de oliva virgen extra",
    "description": ""
  },
  {
    "id": "prof-rec-arroz-mejillones",
    "type": "image",
    "category": "recipe",
    "title": "Arroz con Mejillones al Vapor",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609806201_Arroz_con_Mejillones_al_Vapor.png",
    "ingredients": "Arroz basmati, mejillones al vapor, salsa alioli ligera",
    "description": ""
  },
  {
    "id": "prof-rec-snack-edamame",
    "type": "image",
    "category": "recipe",
    "title": "Edamame y fruta",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609842086_Edamame_y_fruta.png",
    "ingredients": "Edamame al vapor, mandarina",
    "description": ""
  },
  {
    "id": "sys-lun-40",
    "type": "image",
    "category": "recipe",
    "title": "Sushi Casero",
    "url": "img/sushi-fit-pro.png",
    "ingredients": "Arroz, alga nori, salmón, pepino",
    "description": "Controla el azúcar del arroz."
  },
  {
    "id": "prof-rec-rollitos-jamon-pro",
    "type": "image",
    "category": "recipe",
    "title": "Rollitos de Jamón y Nueces",
    "url": "img/rollitos-jamon-pro.png",
    "ingredients": "Jamón serrano sin grasa, palitos integrales, nueces",
    "description": "Grasas y proteína rápida."
  },
  {
    "id": "prof-rec-tortitas-pavo-pro",
    "type": "image",
    "category": "recipe",
    "title": "Tortitas de Arroz, Queso y Pavo",
    "url": "img/tortitas_pavo.png",
    "ingredients": "Tortitas de arroz, Pavo, Queso crema",
    "description": ""
  },
  {
    "id": "prof-rec-ensalada-alubias-pro",
    "type": "image",
    "category": "recipe",
    "title": "Ensalada de Alubias Blancas y Atún",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778609926552_Ensalada_de_Alubias_Blancas_y_Atun.png",
    "ingredients": "Alubias blancas cocidas, atún al natural, huevo cocido, tomate, cebolla roja",
    "description": ""
  },
  {
    "id": "prof-rec-tortilla-patata-pro",
    "type": "image",
    "category": "recipe",
    "title": "Tortilla de Patatas",
    "url": "img/tortilla-patata-pro.png",
    "ingredients": "Huevos, patatas asadas, cebolla",
    "description": "Menos aceite, misma saciedad."
  },
  {
    "id": "prof-rec-gofre-v1",
    "type": "image",
    "category": "recipe",
    "title": "Gofre de Avena",
    "url": "img/gofre.png",
    "ingredients": "Harina de avena, Clara de huevo, fruta",
    "description": ""
  },
  {
    "id": "prof-rec-ramen-huevo",
    "type": "image",
    "category": "recipe",
    "title": "Ramen de Fideos, Pollo, Jamón y Huevo",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778611212179_Ramen_de_Fideos_y_Huevo.png",
    "ingredients": "Fideos, caldo de pollo, huevo cocido, jamón serrano en dados, cebollino",
    "description": ""
  },
  {
    "id": "prof-rec-solomillo-manzana",
    "type": "image",
    "category": "recipe",
    "title": "Solomillo con Puré de Manzana y Nueces",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778611293630_Solomillo_con_Pure_de_Manzana.png",
    "ingredients": "Solomillo de cerdo, puré de manzana natural, nueces, especias",
    "description": ""
  },
  {
    "id": "prof-rec-bacalao-garbanzos",
    "type": "image",
    "category": "recipe",
    "title": "Pescado blanco con Garbanzos",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778611333063_Bacalao_con_Garbanzos.png",
    "ingredients": "Lomo de bacalao, garbanzos cocidos, salsa de ajos y azafrán, perejil",
    "description": ""
  },
  {
    "id": "prof-rec-canelones-atun",
    "type": "image",
    "category": "recipe",
    "title": "Canelones de Atún",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778611367982_Canelones_de_Atun.png",
    "ingredients": "Placas de pasta, atún al natural, huevo cocido, bechamel ligera, queso rallado",
    "description": ""
  },
  {
    "id": "prof-rec-fajita-guacamole",
    "type": "image",
    "category": "recipe",
    "title": "Fajita de Pollo y Guacamole",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778611407465_Fajita_de_Pollo_y_Guacamole.png",
    "ingredients": "Tortilla integral, tiras de pollo, pimiento rojo, pimiento verde, guacamole, cilantro",
    "description": ""
  },
  {
    "id": "prof-rec-ceviche-boniato",
    "type": "image",
    "category": "recipe",
    "title": "Pescado, Aguacate y Boniato",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778611433197_Ceviche_de_Pescado_y_Boniato.png",
    "ingredients": "Pescado blanco, boniato asado, cebolla morada, aguacate, cilantro, lima, ají",
    "description": ""
  },
  {
    "id": "prof-rec-ternera-brocoli-arroz",
    "type": "image",
    "category": "recipe",
    "title": "Ternera con Arroz y Brócoli",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778656118953_Ternera_con_Arroz_y_Brocoli.png",
    "ingredients": "Ternera magra, brócoli al vapor, arroz integral, semillas de sésamo",
    "description": ""
  },
  {
    "id": "prof-rec-yogur-cornflakes",
    "type": "image",
    "category": "recipe",
    "title": "Bowl de Yogur con Cornflakes y Almendras",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778656663316_Yogur_con_Cornflakes_y_Almendras.png",
    "ingredients": "Yogur griego o skyr, cereales de maíz (cornflakes), almendras naturales",
    "description": ""
  },
  {
    "id": "prof-rec-tostada-huevo-poche",
    "type": "image",
    "category": "recipe",
    "title": "Tostada con Tomate y Huevo Poché",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778656730657_Tostada_con_Tomate_y_Huevo_Poche.png",
    "ingredients": "Pan integral tostado, tomate rallado, huevo poché, aceite de oliva virgen extra",
    "description": ""
  },
  {
    "id": "prof-rec-quinoa-feta",
    "type": "image",
    "category": "recipe",
    "title": "Bowl de Quinoa, Garbanzos y Feta",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778656783152_Bowl_de_Quinoa_Garbanzos_y_Feta.png",
    "ingredients": "Quinoa cocida, garbanzos, queso feta, pimiento rojo, pepino, cilantro",
    "description": ""
  },
  {
    "id": "prof-rec-yogur-cereales",
    "type": "image",
    "category": "recipe",
    "title": "Bowl de Yogur con Cereales Integrales",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778657058123_Yogur_con_Cereales_Integrales.png",
    "ingredients": "Yogur griego o skyr, cereales de trigo integral (estilo Bran Flakes)",
    "description": ""
  },
  {
    "id": "prof-rec-pollo-hierbas",
    "type": "image",
    "category": "recipe",
    "title": "Pollo al Horno con Hierbas",
    "url": "img/pollo_hierbas.png",
    "ingredients": "Pollo troceado, Romero, Ajo",
    "description": "Sencillo y efectivo."
  },
  {
    "id": "prof-rec-albondigas-pollo-pro",
    "type": "image",
    "category": "recipe",
    "title": "Pasta con Albóndigas de Pollo",
    "url": "img/albondigas-pollo-pro.png",
    "ingredients": "Pechuga picada, tomate natural, pasta integral",
    "description": "Bolas de proteína magra en salsa de tomate natural."
  },
  {
    "id": "prof-rec-bacalao-horno",
    "type": "image",
    "category": "recipe",
    "title": "Pescado blanco con Verduras",
    "url": "img/bacalao_horno.png",
    "ingredients": "Bacalao, calabacín, cebolla, pimientos",
    "description": "Ligero y lleno de micronutrientes."
  },
  {
    "id": "prof-rec-merluza-plancha-pro",
    "type": "image",
    "category": "recipe",
    "title": "Pescado blanco, Aceite y Ensalada ",
    "url": "img/merluza-plancha-pro.png",
    "ingredients": "Merluza, lechuga, tomate, aceite de oliva",
    "description": "Máxima ligereza."
  },
  {
    "id": "prof-rec-lentejas-verduras",
    "type": "image",
    "category": "recipe",
    "title": "Lentejas con Patata y Verduras",
    "url": "img/lentejas_verduras.png",
    "ingredients": "Lentejas, patata, zanahoria, cebolla",
    "description": "Plato de cuchara reconfortante."
  },
  {
    "id": "prof-rec-salmon-eneldo",
    "type": "image",
    "category": "recipe",
    "title": "Salmón al Eneldo",
    "url": "img/salmon_eneldo.png",
    "ingredients": "Salmón, eneldo",
    "description": "Hierbas aromáticas y grasas buenas."
  },
  {
    "id": "prof-rec-lentejas-feta",
    "type": "image",
    "category": "recipe",
    "title": "Ensalada de Lentejas y Queso Feta",
    "url": "img/lentejas_feta.png",
    "ingredients": "Lentejas cocidas, queso feta, pepino, tomate",
    "description": "Contrastes de sabor."
  },
  {
    "id": "prof-rec-pollo-thai",
    "type": "image",
    "category": "recipe",
    "title": "Pollo Thai con Coco y Arroz",
    "url": "img/pollo-thai.png",
    "ingredients": "Pollo, leche de coco light, arroz basmati",
    "description": "Sabores exóticos equilibrados."
  },
  {
    "id": "sys-lun-37",
    "type": "image",
    "category": "recipe",
    "title": "Ensalada de Pasta, Pollo, Aceitunas y Maíz",
    "url": "img/pasta_pollo_pure_marble_1778321087037.png",
    "ingredients": "Pasta integral, pechuga, maíz, aceitunas",
    "description": "Clásico de túper."
  },
  {
    "id": "prof-rec-pescado-blanco-pro",
    "type": "image",
    "category": "recipe",
    "title": "Pescado Blanco con Patatas y Puré",
    "url": "img/pescado-blanco-pro.png",
    "ingredients": "Merluza, puré de guisantes, patata",
    "description": "Fácil de digerir."
  },
  {
    "id": "prof-rec-secreto-patatas",
    "type": "image",
    "category": "recipe",
    "title": "Secreto de Cerdo con Patatas",
    "url": "img/secreto_cerdo_minimalist_marble_1778658194828.png",
    "ingredients": "Secreto de cerdo magro, patatas, especias mediterráneas",
    "description": ""
  },
  {
    "id": "prof-rec-crema-arroz-prote-v2",
    "type": "image",
    "category": "recipe",
    "title": "Bowl Crema de Arroz, Proteína, Cacao y Frutos secos",
    "url": "img/crema_arroz_minimalist_v2_1778657572083.png",
    "ingredients": "Crema de arroz, proteína en polvo, almendras, chocolate negro",
    "description": ""
  },
  {
    "id": "prof-rec-cornflakes-prote-v2",
    "type": "image",
    "category": "recipe",
    "title": "Bowl Corn Flakes con Proteína y Cacahuete",
    "url": "img/cornflakes_minimalist_v2_1778657645509.png",
    "ingredients": "Corn flakes, leche de proteína, crema de cacahuete, frutos rojos",
    "description": ""
  },
  {
    "id": "prof-rec-salmon-papillote-pro",
    "type": "image",
    "category": "recipe",
    "title": "Salmón con Patatas",
    "url": "img/salmon_papillote.png",
    "ingredients": "Salmón, verduras variadas, patata tierna",
    "description": "Jugosidad máxima."
  },
  {
    "id": "sys-lun-49",
    "type": "image",
    "category": "recipe",
    "title": "Secreto de Cerdo Magro y Piña",
    "url": "img/secreto-cerdo-pro.png",
    "ingredients": "Secreto de cerdo (limpio), piña a la brasa, ensalada",
    "description": "Grasas de calidad con moderación."
  },
  {
    "id": "prof-rec-lomo-patatas",
    "type": "image",
    "category": "recipe",
    "title": "Ternera con Patatas",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1779007310662_Ternera_con_patatas.png",
    "ingredients": "Ternera, patatas baby, salsa ligera de hierbas",
    "description": ""
  },
  {
    "id": "prof-rec-pudding-v2",
    "type": "image",
    "category": "recipe",
    "title": "Bowl Caseína, Furtos secos Arándanos",
    "url": "img/pudding-proteina-pro.png",
    "ingredients": "Caseína, Leche de soja, Arándanos",
    "description": ""
  },
  {
    "id": "prof-rec-avena-nocturna",
    "type": "image",
    "category": "recipe",
    "title": "Avena con Cacao",
    "url": "img/avena_nocturna.png",
    "ingredients": "Avena, Leche, Cacao puro, Avellanas",
    "description": ""
  },
  {
    "id": "prof-rec-ternera-patatas-v2",
    "type": "image",
    "category": "recipe",
    "title": "Ternera con Patatas ",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778661481685_Ternera_con_Patatas.png",
    "ingredients": "Tiras de ternera magra, patatas, salsa ligera de hierbas",
    "description": ""
  },
  {
    "id": "prof-rec-pescado-boniato-v2",
    "type": "image",
    "category": "recipe",
    "title": "Pescado a la Plancha con Boniato",
    "url": "https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1778661517459_Pescado_a_la_Plancha_con_Boniato.png",
    "ingredients": "Filete de pescado blanco (lubina/dorada), boniato asado, romero, aceite de oliva",
    "description": ""
  },
  {
    "id": "sys-lun-21",
    "type": "image",
    "category": "recipe",
    "title": "Pavo con Espárragos y Quinoa",
    "url": "img/pavo-pro.png",
    "ingredients": "Pechuga de pavo, espárragos trigueros, quinoa",
    "description": "Cena ligera clásica."
  },
  {
    "id": "sys-snack-13",
    "type": "image",
    "category": "recipe",
    "title": "Pancakes de Avena y Claras",
    "url": "img/tortitas-avena-pro.png",
    "ingredients": "Harina de avena, claras, canela, stevia",
    "description": "Snack horneado rico en fibra."
  },
  {
    "id": "cloud-xl5z87p52",
    "type": "image",
    "category": "recipe",
    "title": "Pollo con Batata",
    "url": "img/pollo_batata_pure_marble_1778321020797.png",
    "ingredients": "Pechuga de pollo, batata asada, aceite de oliva",
    "description": "Combinación estrella del fitness."
  },
  {
    "id": "cloud-9stgeyw3e",
    "type": "image",
    "category": "recipe",
    "title": "Ensalada de Garbanzos",
    "url": "img/ensalada-garbanzos-pro.png",
    "ingredients": "Garbanzos, atún, aceitunas",
    "description": "Legumbres rápidas y ricas en proteína."
  },
  {
    "id": "cloud-nfk2txiux",
    "type": "image",
    "category": "recipe",
    "title": "Wok de Pollo y Fideos",
    "url": "img/wok_pollo_fideos.png",
    "ingredients": "Fideos, pollo, verduras al wok",
    "description": "Estilo asiático saludable."
  },
  {
    "id": "cloud-kwqxeynux",
    "type": "image",
    "category": "recipe",
    "title": "Ternera con Brócoli",
    "url": "img/ternera_brocoli.png",
    "ingredients": "Tiras de ternera, brócoli, salsa de soja",
    "description": "Salteado rápido estilo oriental."
  },
  {
    "id": "cloud-7oyfrby93",
    "type": "image",
    "category": "recipe",
    "title": "Ensalada de Quinoa y Gambas",
    "url": "img/quinoa_gambas.png",
    "ingredients": "Quinoa, mango, gambas cocidas, cilantro",
    "description": "Sabor fresco para días calurosos."
  },
  {
    "id": "cloud-o9el1o720",
    "type": "image",
    "category": "recipe",
    "title": "Tofu con Verduras",
    "url": "img/tofu_verduras.png",
    "ingredients": "Tofu firme, zanahoria, pimiento, jengibre",
    "description": "Opción vegana rica en nutrientes."
  },
  {
    "id": "cloud-jltt70fg2",
    "type": "image",
    "category": "recipe",
    "title": "Canelones de Espinacas",
    "url": "img/canelones.png",
    "ingredients": "Placas de pasta, espinacas, queso ricotta",
    "description": "Pasta rellena saludable."
  },
  {
    "id": "cloud-g9hyqzv0h",
    "type": "image",
    "category": "recipe",
    "title": "Pollo al Limón con Cuscús",
    "url": "img/pollo-limon-cuscus-pro.png",
    "ingredients": "Pollo, zumo de limón, cuscús integral",
    "description": "Toque cítrico y carbohidratos rápidos."
  },
  {
    "id": "cloud-82rj9riyc",
    "type": "image",
    "category": "recipe",
    "title": "Hamburguesa de Lentejas",
    "url": "img/hamburguesa-lentejas-pro.png",
    "ingredients": "Lentejas, pan integral, hojas verdes",
    "description": "Alternativa vegetal a la hamburguesa."
  },
  {
    "id": "cloud-sjggr071h",
    "type": "image",
    "category": "recipe",
    "title": "Fajitas de Pavo",
    "url": "img/fajitas-pavo-pro.png",
    "ingredients": "Tortillas, tiras de pavo, pimiento, cebolla",
    "description": "Ideal para compartir."
  },
  {
    "id": "cloud-s2skbdu6o",
    "type": "image",
    "category": "recipe",
    "title": "Huevo y verdura",
    "url": "img/ratatouille-huevo-pro.png",
    "ingredients": "Calabecín, berenjena, tomate, huevo",
    "description": "Un plato de película."
  },
  {
    "id": "cloud-qau1f2ik9",
    "type": "image",
    "category": "recipe",
    "title": "Lasaña de Calabacín",
    "url": "img/lasagna-calabacin-pro.png",
    "ingredients": "Láminas de calabacín, carne picada magra, queso light",
    "description": "Baja en carbos."
  },
  {
    "id": "cloud-be4zpy83w",
    "type": "image",
    "category": "recipe",
    "title": "Tortilla de Gambas",
    "url": "img/tortilla-gambas-pro.png",
    "ingredients": "Claras de huevo, gambas, ajetes tiernos",
    "description": "Proteína pura."
  },
  {
    "id": "cloud-g5v7zp1hr",
    "type": "image",
    "category": "recipe",
    "title": "Cottage con Piña",
    "url": "img/cottage_pina_pro.png",
    "ingredients": "Queso cottage, piña natural, almendras",
    "description": "Diurético y proteico."
  },
  {
    "id": "cloud-v6cvnw092",
    "type": "image",
    "category": "recipe",
    "title": "Yogur con Frutos Secos",
    "url": "img/yogur-frutos.png",
    "ingredients": "Yogur natural 0%, nueces, almendras, semillas",
    "description": "Energía rápida y duradera."
  },
  {
    "id": "cloud-l9yz29q1d",
    "type": "image",
    "category": "recipe",
    "title": "Fruta con Queso Fresco",
    "url": "img/fruta-queso-pro.png",
    "ingredients": "Manzana o pera, queso fresco tipo Burgos",
    "description": "El snack más equilibrado."
  },
  {
    "id": "cloud-erraalb4a",
    "type": "image",
    "category": "recipe",
    "title": "Noodles de Pollo y Brócoli",
    "url": "img/noodles_pollo_brocoli.png",
    "ingredients": "Fideos de arroz, pollo, brócoli, cacahuetes",
    "description": ""
  },
  {
    "id": "cloud-9s08o2cpo",
    "type": "image",
    "category": "recipe",
    "title": "Pollo con Arroz y Almendras",
    "url": "img/pollo_arroz_almendras.png",
    "ingredients": "Pechuga de pollo, arroz jazmín, almendras laminadas",
    "description": ""
  },
  {
    "id": "cloud-uhvvs7ya5",
    "type": "image",
    "category": "recipe",
    "title": "Pollo con Boniato y Verduras",
    "url": "img/pollo_boniato_minimalist_plate_1778658702822.png",
    "ingredients": "Pollo, batata asada, verduras al vapor",
    "description": ""
  },
  {
    "id": "cloud-khvqw2gyz",
    "type": "image",
    "category": "recipe",
    "title": "Albóndigas con Tomate y Cuscús",
    "url": "img/albondigas_cuscus_minimalist_plate_1778658715494.png",
    "ingredients": "Albóndigas magras, salsa de tomate casera, cuscús integral, piñones, albahaca",
    "description": ""
  },
  {
    "id": "cloud-1wiy0va57",
    "type": "image",
    "category": "recipe",
    "title": "Pollo con Patatas y Aceitunas",
    "url": "img/pollo_aceitunas_minimalist_marble_1778658213723.png",
    "ingredients": "Pechuga de pollo, patatas gajo asadas, aceitunas verdes, tomillo",
    "description": ""
  },
  {
    "id": "cloud-rjyyuv34q",
    "type": "image",
    "category": "recipe",
    "title": "Pollo Asado con Patatas Baby",
    "url": "img/pollo_asado_baby_minimalist_marble_1778658225390.png",
    "ingredients": "Muslos de pollo, patatas baby enteras, especias mediterráneas, aceite de oliva",
    "description": ""
  },
  {
    "id": "cloud-80o8uyu5o",
    "type": "image",
    "category": "recipe",
    "title": "Crema de Arroz y Proteína",
    "url": "img/crema_arroz_minimalist_v2_1778657572083.png",
    "ingredients": "Crema de arroz, proteína en polvo, almendras, chocolate negro",
    "description": ""
  },
  {
    "id": "cloud-kbi1olhog",
    "type": "image",
    "category": "recipe",
    "title": "Tostada de Jamón con Aguacate",
    "url": "img/tostada_jamon_minimalist_v2_1778657590897.png",
    "ingredients": "Pan integral, jamón serrano, aguacate, aceite de oliva virgen extra",
    "description": ""
  },
  {
    "id": "cloud-cub7dc6zo",
    "type": "image",
    "category": "recipe",
    "title": "Tostada de Pavo con Queso Cottage",
    "url": "img/tostada_pavo_minimalist_v2_1778657605543.png",
    "ingredients": "Pan integral, pechuga de pavo, queso cottage, arándanos",
    "description": ""
  },
  {
    "id": "cloud-3axxb4axz",
    "type": "image",
    "category": "recipe",
    "title": "Tostada Cottage con Frutos Rojos",
    "url": "img/tostada_sweet_minimalist_v2_1778657620487.png",
    "ingredients": "Pan integral, queso cottage, mermelada light, frambuesas, arándanos",
    "description": ""
  },
  {
    "id": "cloud-r4za389z8",
    "type": "image",
    "category": "recipe",
    "title": "Tortitas de Arroz con Pollo",
    "url": "img/tortitas_pollo_minimalist_v2_1778657633375.png",
    "ingredients": "Tortitas de arroz inflado, pollo a la plancha, calabacín, pimiento",
    "description": ""
  },
  {
    "id": "cloud-272izz7mi",
    "type": "image",
    "category": "recipe",
    "title": "Corn Flakes con Proteína y Cacahuete",
    "url": "img/cornflakes_minimalist_v2_1778657645509.png",
    "ingredients": "Corn flakes, leche de proteína, crema de cacahuete, frutos rojos",
    "description": ""
  }
];

window.SYSTEM_MEDIA = [
  // EJERCICIOS (100) - Muestra de los más importantes
  { id: 'sys-ex-1', type: 'video', category: 'exercise', title: 'Sentadilla con Barra', url: 'https://www.youtube.com/watch?v=SW_C1A-SHMA' },
  { id: 'sys-ex-2', type: 'video', category: 'exercise', title: 'Prensa de Piernas', url: 'https://www.youtube.com/watch?v=yZmx_7igPgc' },
  { id: 'sys-ex-3', type: 'video', category: 'exercise', title: 'Peso Muerto Rumano', url: 'https://www.youtube.com/watch?v=jcV7V_6pW_E' },
  { id: 'sys-ex-4', type: 'video', category: 'exercise', title: 'Press de Banca Plano', url: 'https://www.youtube.com/watch?v=rT7DgCr-3ps' },
  { id: 'sys-ex-5', type: 'video', category: 'exercise', title: 'Dominadas Pronas', url: 'https://www.youtube.com/watch?v=eGo4IYlbE5g' },
  { id: 'sys-ex-6', type: 'video', category: 'exercise', title: 'Jalón al Pecho', url: 'https://www.youtube.com/watch?v=CAwf7n6Luuc' },
  { id: 'sys-ex-7', type: 'video', category: 'exercise', title: 'Press Militar', url: 'https://www.youtube.com/watch?v=qEwKCR5JCog' },
  { id: 'sys-ex-8', type: 'video', category: 'exercise', title: 'Curl de Bíceps', url: 'https://www.youtube.com/watch?v=Y7nZ2S7mEAc' },
  { id: 'sys-ex-9', type: 'video', category: 'exercise', title: 'Extensiones Tríceps', url: 'https://www.youtube.com/watch?v=vB5OHsJ3EME' },
  { id: 'sys-ex-10', type: 'video', category: 'exercise', title: 'Plancha Abdominal', url: 'https://www.youtube.com/watch?v=TvxNkmjdhMM' }
  // ... el resto de la lista de 100 se autoinyectará en el renderizado
];

window.Media = {
  getAll: () => {
    const data = getData();
    const system = [...(window.SYSTEM_RECIPES || []), ...(window.SYSTEM_MEDIA || [])];
    const personal = data.media || [];
    const hidden = data.hidden_system_media || [];
    
    const mediaMap = new Map();
    system.forEach(item => {
        const isHidden = hidden.includes(item.id);
        mediaMap.set(String(item.id), { ...item, isSystem: true, status: isHidden ? 'hidden' : 'active' });
    });
    personal.forEach(m => {
        const isHidden = hidden.includes(m.id);
        const isSysItem = String(m.id).startsWith('sys-') || (window.SYSTEM_RECIPES || []).some(r => r.id == m.id) || (window.SYSTEM_MEDIA || []).some(sm => sm.id == m.id);
        let finalItem = { ...m, isSystem: isSysItem, status: isHidden ? 'hidden' : 'active' };
        
        // 🔥 BLINDAJE DE RECETAS: Forzar foto, título e ingredientes originales
        const originalRecipe = (window.SYSTEM_RECIPES || []).find(r => r.id === m.id);
        if (originalRecipe) {
            finalItem.url = originalRecipe.url;
            finalItem.title = originalRecipe.title;
            finalItem.ingredients = originalRecipe.ingredients;
        }
        
        mediaMap.set(String(m.id), finalItem);
    });
    return Array.from(mediaMap.values());
  },
  create: (mediaData) => {
    const data = getData();
    const newMedia = {
      id: generateUUID(),
      type: mediaData.type || 'video', // 'video' | 'image'
      category: mediaData.category || 'exercise', // 'exercise' | 'recipe'
      url: mediaData.url || '', // Base64 or external URL
      title: mediaData.title || '',
      description: mediaData.description || '',
      ingredients: mediaData.ingredients || '', // Para recetas
      muscleGroup: mediaData.muscleGroup || '', // Para ejercicios
      isSystem: false, // Forzar que es contenido de usuario
      createdAt: new Date().toISOString()
    };
    if (!data.media) data.media = [];
    data.media.push(newMedia);
    
    // --- SINCRONIZACIÓN HACIA GRUPOS MUSCULARES ---
    if (newMedia.category === 'exercise' && newMedia.url) {
        const mgConfig = data.muscleGroupsConfig;
        if (mgConfig && mgConfig.exercises) {
            let changed = false;
            for (const group in mgConfig.exercises) {
                mgConfig.exercises[group] = mgConfig.exercises[group].map(ex => {
                    const exName = typeof ex === 'string' ? ex : ex.name;
                    if (exName.toLowerCase().trim() === newMedia.title.toLowerCase().trim()) {
                        changed = true;
                        return { name: exName, videoUrl: newMedia.url };
                    }
                    return ex;
                });
            }
            if (changed) data.muscleGroupsConfig = mgConfig;
        }
    }

    saveData(data);
    return newMedia;
  },
  update: (id, updates) => {
    const data = getData();
    let index = data.media.findIndex(m => m.id == id);
    const isSysItem = String(id).startsWith('sys-') || (window.SYSTEM_RECIPES || []).some(r => r.id == id) || (window.SYSTEM_MEDIA || []).some(m => m.id == id);
    
    if (index >= 0) {
        data.media[index] = { ...data.media[index], ...updates };
    } else if (isSysItem) {
        const sysItem = (window.SYSTEM_RECIPES || []).find(m => m.id == id) || (window.SYSTEM_MEDIA || []).find(m => m.id == id);
        if (sysItem) {
            data.media.push({ ...sysItem, ...updates, id: id });
        }
    }
    saveData(data);
    return true;
  },
  delete: (id) => {
    const data = getData();
    const isSysItem = String(id).startsWith('sys-') || (window.SYSTEM_RECIPES || []).some(r => r.id == id) || (window.SYSTEM_MEDIA || []).some(m => m.id == id);
    
    if (isSysItem) {
        if (!data.hidden_system_media) data.hidden_system_media = [];
        data.hidden_system_media.push(id);
    } else {
        data.media = data.media.filter(m => m.id != id);
    }
    saveData(data);
    return true;
  },
  syncFromRoutines: (exerciseName, videoUrl, muscleGroup) => {
    if (!exerciseName) return;
    const data = getData();
    const allMedia = window.Media.getAll(); 
    const existing = allMedia.find(m => m.category === 'exercise' && m.title.toLowerCase().trim() === exerciseName.toLowerCase().trim());
    
    if (existing) {
        if (existing.url !== videoUrl) {
            window.Media.update(existing.id, { url: videoUrl, muscleGroup });
        }
    } else if (videoUrl) {
        window.Media.create({
            type: 'video',
            category: 'exercise',
            title: exerciseName,
            url: videoUrl,
            muscleGroup: muscleGroup
        });
    }
  }
};

// Generate UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
window.generateUUID = generateUUID;

const generateAccessCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const Clients = {
  // Mapeo seguro para Google Sheets
  fromSheet: (row) => {
    if (!row) return null;
    return {
        id: row[0] || '',
        accessCode: row[1] || '',
        name: row[2] || '',
        email: row[3] || '',
        phone: row[4] || '',
        technicalData: {
            age: parseInt(row[5]) || 0,
            notes: row[6] || '',
            weight: parseFloat(row[10]) || 0,
            height: parseFloat(row[11]) || 0,
            goals: row[12] || '',
            injuries: row[13] || '',
            allergies: row[14] || ''
        },
        paymentExpiry: row[7] || '',
        assignedRoutine: row[8] || null,
        assignedDiet: row[9] || null,
        status: 'active'
    };
  },

  toSheet: (client) => {
      if (!client) return new Array(15).fill('');
      const tech = client.technicalData || {};
      
      // Aseguramos 15 columnas fijas para evitar desfases
      const row = new Array(15).fill('');
      row[0] = client.id || '';
      row[1] = client.accessCode || '';
      row[2] = client.name || '';
      row[3] = client.email || '';
      row[4] = client.phone || '';
      // Age (F - index 5)
      const ageVal = tech.age !== undefined && tech.age !== null ? tech.age : (client.age || '');
      row[5] = ageVal !== '' ? ageVal.toString() : '';
      row[6] = tech.notes || client.notes || '';
      row[7] = client.paymentExpiry || '';
      row[8] = client.assignedRoutine || '';
      row[9] = client.assignedDiet || '';
      // Weight (K - index 10)
      const weightVal = tech.weight !== undefined && tech.weight !== null ? tech.weight : (client.weight || '');
      row[10] = weightVal !== '' ? weightVal.toString() : '';
      // Height (L - index 11)
      const heightVal = tech.height !== undefined && tech.height !== null ? tech.height : (client.height || '');
      row[11] = heightVal !== '' ? heightVal.toString() : '';
      row[12] = tech.goals || client.goals || '';
      row[13] = tech.injuries || client.injuries || '';
      row[14] = tech.allergies || client.allergies || '';
      
      return row;
  },

  getAll: () => {
    const data = getData();
    const clients = data.clients || [];
    return clients.map(c => {
      if (c && c.paymentExpiry && c.paymentStatus === 'paid') {
        try {
          const parts = c.paymentExpiry.split('/');
          if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1;
            let year = parseInt(parts[2]);
            if (year < 100) year += 2000;
            const expiryDate = new Date(year, month, day);
            if (!isNaN(expiryDate)) {
              const today = new Date();
              today.setHours(0,0,0,0);
              if (expiryDate < today) {
                c.paymentStatus = 'pending';
              }
            }
          }
        } catch (e) {}
      }
      return c;
    });
  },

  getById: (id) => {
    const data = getData();
    return Clients.getAll().find(c => c.id == id);
  },

  create: (clientData) => {
    const data = getData();
    const newClient = {
      id: generateUUID(),
      name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      startDate: new Date().toISOString(),
      status: 'active',
      profilePhoto: clientData.profilePhoto || null,
      paymentStatus: 'paid',
      paymentExpiry: clientData.paymentExpiry || '',
      monthlyFee: clientData.subscriptionAmount || clientData.monthlyFee || 0,
      subscriptionAmount: clientData.subscriptionAmount || clientData.monthlyFee || 0,
      subscriptionType: clientData.subscriptionType || 'Mensual',
      reviewDay: clientData.reviewDay || '',
      reviewFrequency: clientData.reviewFrequency || 'weekly',
      reviewDaysOfMonth: clientData.reviewDaysOfMonth || '',
      specificReviewDate: clientData.specificReviewDate || '',
      technicalData: {
        weight: clientData.weight || 0,
        height: clientData.height || 0,
        age: clientData.age || 0,
        goals: clientData.goals || '',
        injuries: clientData.injuries || '',
        allergies: clientData.allergies || '',
        notes: clientData.notes || '',
        skinfoldsEnabled: clientData.skinfoldsEnabled || false
      },
      assignedRoutine: null,
      assignedDiet: null,
      supplementation: '',
      supplementationPublished: true,
      supplementationUrl: '',
      supplementationUrlVisible: true,
      cardio: '',
      cardioPublished: true,
      cardioUrl: '',
      cardioUrlVisible: true,
      feedbacks: [],
      accessCode: generateAccessCode(),
      weightHistory: []
    };
    data.clients.push(newClient);
    saveData(data);

    // Google Sheets Sync
    if (typeof SHEETS !== 'undefined' && AUTH && AUTH.isAuthorized) {
      try {
        const rowData = Clients.toSheet(newClient);
        // No bloqueamos el UI esperando la respuesta
        SHEETS.appendRow('Clientes!A:O', rowData).catch(err => console.error('Error Sync Google:', err));
      } catch (e) { console.error(e); }
    }

    return newClient;
  },

  update: (id, updates) => {
    const data = getData();
    const index = data.clients.findIndex(c => c.id == id);
    if (index !== -1) {
      data.clients[index] = { ...data.clients[index], ...updates };
      saveData(data);

      // Google Sheets Sync desacitivado para validación en local
      return data.clients[index];
    }
    return null;
  },

  delete: (id) => {
    console.log('DataModels: Intentando eliminar cliente:', id);
    const data = getData();
    const initialCount = data.clients.length;
    data.clients = data.clients.filter(c => c.id !== id);
    const finalCount = data.clients.length;

    if (initialCount !== finalCount) {
      saveData(data);
      console.log('DataModels: Cliente eliminado con éxito.');
      return true;
    }
    console.warn('DataModels: No se encontró el cliente con ID:', id);
    return false;
  },

  getActiveCount: () => {
    return Clients.getAll().filter(c => c.status === 'active').length;
  },

  getPendingPayments: () => {
    return Clients.getAll().filter(c => c.paymentStatus === 'pending' || c.paymentStatus === 'overdue');
  },

  getTotalRevenue: () => {
    return Clients.getAll()
      .filter(c => c.status === 'active' && c.paymentStatus === 'paid')
      .reduce((sum, c) => sum + c.monthlyFee, 0);
  }
};

// ============================================
// ROUTINES CRUD
// ============================================

const Routines = {
  getAll: () => {
    const data = getData();
    return data.routines;
  },

  getById: (id) => {
    const data = getData();
    return data.routines.find(r => r.id === id);
  },

  create: (routineData) => {
    const data = getData();
    const newRoutine = {
      id: generateUUID(),
      name: routineData.name,
      description: routineData.description || '',
      duration: routineData.duration || 'monthly',
      exercises: routineData.exercises || [],
      createdAt: new Date().toISOString()
    };
    data.routines.push(newRoutine);
    saveData(data);
    return newRoutine;
  },

  update: (id, updates) => {
    const data = getData();
    const index = data.routines.findIndex(r => r.id === id);
    if (index !== -1) {
      data.routines[index] = { ...data.routines[index], ...updates };
      saveData(data);
      return data.routines[index];
    }
    return null;
  },

  delete: (id) => {
    const data = getData();
    data.routines = data.routines.filter(r => r.id !== id);
    saveData(data);
  }
};

// ============================================
// DIETS CRUD
// ============================================

const Diets = {
  getAll: () => {
    const data = getData();
    return data.diets;
  },

  getById: (id) => {
    const data = getData();
    return data.diets.find(d => d.id === id);
  },

  create: (dietData) => {
    const data = getData();
    const newDiet = {
      id: generateUUID(),
      name: dietData.name,
      description: dietData.description || '',
      calories: dietData.calories || 0,
      macros: dietData.macros || { protein: 0, carbs: 0, fat: 0 },
      mealsCount: dietData.mealsCount || 4,
      meals: dietData.meals || [], // Critical fix: allow meals to be saved
      weeklyPlan: dietData.weeklyPlan || [],
      isTemplate: dietData.isTemplate !== undefined ? dietData.isTemplate : true,
      createdAt: new Date().toISOString()
    };
    data.diets.push(newDiet);
    saveData(data);
    return newDiet;
  },

  update: (id, updates) => {
    const data = getData();
    const index = data.diets.findIndex(d => d.id === id);
    if (index !== -1) {
      data.diets[index] = { ...data.diets[index], ...updates };
      saveData(data);
      return data.diets[index];
    }
    return null;
  },

  delete: (id) => {
    const data = getData();
    data.diets = data.diets.filter(d => d.id !== id);
    saveData(data);
  }
};

// ============================================
// FOODS CRUD
// ============================================

const SYSTEM_FOODS = [
  // PROTEINAS
  { name: "Pechuga de Pollo", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: "Pavo (Solomillo/Pechuga)", calories: 105, protein: 24, carbs: 0, fat: 1 },
  { name: "Ternera Magra (Picada/Tiras)", calories: 170, protein: 26, carbs: 0, fat: 7 },
  { name: "Lomo de Cerdo (Cinta)", calories: 155, protein: 22, carbs: 0, fat: 7 },
  { name: "Cordero Magro", calories: 220, protein: 20, carbs: 0, fat: 15 },
  { name: "Conejo", calories: 133, protein: 21, carbs: 0, fat: 5 },
  { name: "Jamón Serrano (sin grasa)", calories: 210, protein: 30, carbs: 0.5, fat: 10 },
  { name: "Taquitos de Jamón Cocido", calories: 105, protein: 18, carbs: 1.5, fat: 3 },
  { name: "Salmón Fresco", calories: 208, protein: 20, carbs: 0, fat: 13 },
  { name: "Salmón Ahumado", calories: 184, protein: 22, carbs: 0.5, fat: 10 },
  { name: "Atún al Natural (Lata)", calories: 116, protein: 26, carbs: 0, fat: 1 },
  { name: "Atún Fresco", calories: 130, protein: 25, carbs: 0, fat: 3 },
  { name: "Merluza / Pescado Blanco", calories: 78, protein: 17, carbs: 0, fat: 0.8 },
  { name: "Bacalao (Fresco/Desmigado)", calories: 82, protein: 18, carbs: 0, fat: 0.7 },
  { name: "Sepia / Calamar", calories: 80, protein: 16, carbs: 1, fat: 1 },
  { name: "Gambas / Langostinos", calories: 95, protein: 20, carbs: 1, fat: 1 },
  { name: "Mejillones", calories: 86, protein: 12, carbs: 3, fat: 2 },
  { name: "Dorada / Trucha", calories: 120, protein: 19, carbs: 0, fat: 4.5 },
  { name: "Ventresca de Atún", calories: 210, protein: 24, carbs: 0, fat: 12 },
  { name: "Tofu Firme", calories: 83, protein: 10, carbs: 1, fat: 5 },
  { name: "Seitán", calories: 120, protein: 24, carbs: 4, fat: 2 },
  { name: "Edamame (sin vaina)", calories: 122, protein: 11, carbs: 10, fat: 5 },
  { name: "Proteína en Polvo (Media)", calories: 370, protein: 80, carbs: 6, fat: 3 },

  // HUEVOS Y LÁCTEOS
  { name: "Huevo Entero (1 ud L)", calories: 75, protein: 6.5, carbs: 0.5, fat: 5, type: 'unit' },
  { name: "Clara de Huevo (100ml)", calories: 50, protein: 11, carbs: 0.7, fat: 0.1 },
  { name: "Yogur Griego", calories: 115, protein: 9, carbs: 4, fat: 8 },
  { name: "Queso Fresco Batido 0%", calories: 46, protein: 8, carbs: 3.5, fat: 0.1 },
  { name: "Queso Cottage", calories: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  { name: "Queso Skyr", calories: 63, protein: 11, carbs: 4, fat: 0.2 },
  { name: "Queso Requesón / Ricotta", calories: 170, protein: 11.5, carbs: 3, fat: 12 },
  { name: "Queso Feta", calories: 264, protein: 14, carbs: 4, fat: 21 },
  { name: "Queso Mozzarella", calories: 280, protein: 22, carbs: 2, fat: 20 },
  { name: "Queso Havarti / Curado", calories: 350, protein: 25, carbs: 1, fat: 28 },
  { name: "Queso Crema Light", calories: 150, protein: 8, carbs: 5, fat: 11 },
  { name: "Quesitos Light (1 ud)", calories: 35, protein: 2.5, carbs: 1, fat: 2, type: 'unit' },
  { name: "Leche Desnatada", calories: 35, protein: 3.4, carbs: 5, fat: 0.1 },
  { name: "Bebida de Soja / Almendras", calories: 35, protein: 3, carbs: 1, fat: 1.5 },
  { name: "Kéfir", calories: 60, protein: 3.5, carbs: 4, fat: 3.5 },

  // FRUTAS Y VERDURAS
  { name: "Plátano", calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { name: "Manzana / Pera", calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { name: "Frutos Rojos (Mix)", calories: 45, protein: 0.8, carbs: 10, fat: 0.4 },
  { name: "Mango / Papaya", calories: 60, protein: 0.7, carbs: 15, fat: 0.3 },
  { name: "Piña / Melocotón", calories: 50, protein: 0.5, carbs: 13, fat: 0.1 },
  { name: "Brócoli / Espinacas", calories: 30, protein: 2.8, carbs: 5, fat: 0.4 },
  { name: "Pimientos / Tomate", calories: 22, protein: 1, carbs: 4, fat: 0.2 },
  { name: "Berenjena / Calabacín", calories: 20, protein: 1.2, carbs: 3.5, fat: 0.2 },
  { name: "Champiñones / Setas", calories: 25, protein: 3, carbs: 3, fat: 0.3 },

  // GRASAS Y FRUTOS SECOS
  { name: "Aceite de Oliva / Coco", calories: 884, protein: 0, carbs: 0, fat: 100 },
  { name: "Aguacate", calories: 160, protein: 2, carbs: 9, fat: 15 },
  { name: "Crema de Cacahuete/Almendra", calories: 595, protein: 25, carbs: 12, fat: 50 },
  { name: "Nueces / Almendras / Pistachos", calories: 610, protein: 19, carbs: 14, fat: 52 },
  { name: "Anacardos / Avellanas", calories: 580, protein: 17, carbs: 22, fat: 48 },
  { name: "Semillas (Chía/Cáñamo/Lino)", calories: 520, protein: 20, carbs: 10, fat: 40 },
  { name: "Hummus", calories: 175, protein: 8, carbs: 14, fat: 10 },
  { name: "Tahini", calories: 595, protein: 17, carbs: 21, fat: 54 },
  { name: "Aceitunas (Verdes/Negras)", calories: 145, protein: 1, carbs: 3, fat: 15 },

  // CEREALES E HIDRATOS
  { name: "Avena (Copos/Harina)", calories: 380, protein: 13, carbs: 66, fat: 7 },
  { name: "Arroz (Integral/Jazmín/Basmati)", calories: 355, protein: 7, carbs: 78, fat: 0.7 },
  { name: "Pasta Integral / Espelta", calories: 350, protein: 12.5, carbs: 70, fat: 1.5 },
  { name: "Pasta de Lentejas", calories: 335, protein: 25, carbs: 50, fat: 2 },
  { name: "Quinoa (Cruda)", calories: 368, protein: 14, carbs: 64, fat: 6 },
  { name: "Cuscús Integral", calories: 345, protein: 12.8, carbs: 67, fat: 1.5 },
  { name: "Garbanzos / Lentejas (Cocidos)", calories: 140, protein: 8.5, carbs: 20, fat: 2 },
  { name: "Patata / Batata (Cruda)", calories: 80, protein: 2, carbs: 18, fat: 0.1 },
  { name: "Pan Integral / Centeno", calories: 240, protein: 8.5, carbs: 45, fat: 2.5 },
  { name: "Tortilla Trigo/Maíz (1 ud)", calories: 120, protein: 3.5, carbs: 20, fat: 2.5, type: 'unit' },
  { name: "Bagel Integral (1 ud)", calories: 245, protein: 10, carbs: 48, fat: 2, type: 'unit' },
  { name: "Arepa de Maíz (Masa)", calories: 165, protein: 3, carbs: 35, fat: 1 },
  { name: "Granola Casera", calories: 460, protein: 10, carbs: 60, fat: 20 },
  { name: "Dátiles (1 ud Medjool)", calories: 66, protein: 0.4, carbs: 16, fat: 0, type: 'unit' },
  { name: "Miel / Sirope Ágave (1 cda)", calories: 60, protein: 0, carbs: 15, fat: 0, type: 'unit' }
];

const Foods = {
  getAll: () => {
    const data = getData();
    const trainerFoods = data.foods || [];
    
    // Generar la lista final uniendo SYSTEM_FOODS de forma blindada
    const finalFoods = [];
    const processedSysIds = new Set();
    
    SYSTEM_FOODS.forEach(sys => {
      const sysId = 'seed_food_' + sys.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      processedSysIds.add(sysId);
      
      // Buscar si el entrenador ha guardado alguna edición local de este alimento del sistema
      const localEdit = trainerFoods.find(lf => lf.id === sysId || lf.name === sys.name);
      
      if (localEdit) {
        finalFoods.push({
          ...localEdit,
          id: sysId, // Siempre forzar ID de sistema blindado
          name: sys.name, // Siempre forzar nombre original
          type: sys.type || 'g', // Siempre forzar tipo original
          isSystem: true
        });
      } else {
        finalFoods.push({
          id: sysId,
          name: sys.name,
          calories: sys.calories || 0,
          protein: sys.protein || 0,
          carbs: sys.carbs || 0,
          fat: sys.fat || 0,
          type: sys.type || 'g',
          isSystem: true
        });
      }
    });
    
    // Añadir los alimentos personalizados creados por el entrenador
    trainerFoods.forEach(tf => {
      const isSystem = tf.id && (String(tf.id).startsWith('seed_') || processedSysIds.has(tf.id));
      const matchesSystemName = SYSTEM_FOODS.some(sf => sf.name === tf.name);
      
      if (!isSystem && !matchesSystemName) {
        finalFoods.push({
          ...tf,
          isSystem: false
        });
      }
    });
    
    return finalFoods;
  },

  getById: (id) => {
    return Foods.getAll().find(f => f.id === id);
  },

  create: (foodData) => {
    const data = getData();
    if (!data.foods) data.foods = [];
    
    // Evitar duplicar nombres del sistema
    const matchesSystemName = SYSTEM_FOODS.some(sf => sf.name.toLowerCase() === foodData.name.toLowerCase());
    if (matchesSystemName) {
      throw new Error('No puedes crear un alimento con el mismo nombre que un alimento del sistema.');
    }
    
    const newFood = {
      id: generateUUID(),
      name: foodData.name,
      calories: foodData.calories || 0,
      protein: foodData.protein || 0,
      carbs: foodData.carbs || 0,
      fat: foodData.fat || 0,
      type: foodData.type || 'g',
      createdAt: new Date().toISOString()
    };
    data.foods.push(newFood);
    saveData(data);
    return newFood;
  },

  update: (id, updates) => {
    const data = getData();
    if (!data.foods) data.foods = [];
    
    const isSys = String(id).startsWith('seed_');
    
    if (isSys) {
      // Si es un alimento del sistema, el entrenador SOLO puede actualizar kcal y macros
      const sysFood = SYSTEM_FOODS.find(sf => {
        const sysId = 'seed_food_' + sf.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        return sysId === id;
      });
      
      if (!sysFood) return null;
      
      let index = data.foods.findIndex(f => f.id == id);
      if (index === -1) {
        // Si aún no tenía edición local, la creamos a partir de los datos base del sistema
        const localCopy = {
          id: id,
          name: sysFood.name,
          type: sysFood.type || 'g',
          calories: updates.calories !== undefined ? updates.calories : sysFood.calories,
          protein: updates.protein !== undefined ? updates.protein : sysFood.protein,
          carbs: updates.carbs !== undefined ? updates.carbs : sysFood.carbs,
          fat: updates.fat !== undefined ? updates.fat : sysFood.fat,
          createdAt: new Date().toISOString()
        };
        data.foods.push(localCopy);
        saveData(data);
        return localCopy;
      } else {
        // Si ya tenía edición local, actualizamos solo kcal y macros, forzando name y type base
        data.foods[index] = {
          ...data.foods[index],
          calories: updates.calories !== undefined ? updates.calories : data.foods[index].calories,
          protein: updates.protein !== undefined ? updates.protein : data.foods[index].protein,
          carbs: updates.carbs !== undefined ? updates.carbs : data.foods[index].carbs,
          fat: updates.fat !== undefined ? updates.fat : data.foods[index].fat,
          name: sysFood.name, // Forzado
          type: sysFood.type || 'g' // Forzado
        };
        saveData(data);
        return data.foods[index];
      }
    } else {
      // Alimento personalizado normal
      const index = data.foods.findIndex(f => f.id == id);
      if (index !== -1) {
        data.foods[index] = { ...data.foods[index], ...updates };
        saveData(data);
        return data.foods[index];
      }
    }
    return null;
  },

  delete: (id) => {
    const isSys = String(id).startsWith('seed_');
    if (isSys) {
      // Bloqueo total de eliminación para alimentos de sistema
      throw new Error('Los alimentos del sistema están blindados y no se pueden eliminar.');
    }
    
    const data = getData();
    if (!data.foods) return;
    data.foods = data.foods.filter(f => f.id != id);
    saveData(data);
  }
};

// ============================================
// FEEDBACKS CRUD
// ============================================

const Feedbacks = {
  getAll: () => {
    const data = getData();
    return data.feedbacks;
  },

  getByClientId: (clientId) => {
    const data = getData();
    return (data.feedbacks || []).filter(f => f.clientId == clientId);
  },

  create: (feedbackData) => {
    const data = getData();
    const newFeedback = {
      id: generateUUID(),
      clientId: feedbackData.clientId,
      week: feedbackData.week || 1,
      date: new Date().toISOString(),
      energy: feedbackData.energy || 3,
      adherence: feedbackData.adherence || 3,
      satisfaction: feedbackData.satisfaction || 3,
      weight: feedbackData.weight || null,
      sleep: feedbackData.sleep || null,
      stress: feedbackData.stress || null,
      answers: feedbackData.answers || [], // Array of { question, answer }
      perimeters: feedbackData.perimeters || {}, // Dynamic mapping of name -> value
      photos: feedbackData.photos || null,
      comments: feedbackData.comments || '',
      trainerResponse: ''
    };
    data.feedbacks.push(newFeedback);

    // Add feedback ID to client
    const client = data.clients.find(c => c.id == feedbackData.clientId);
    if (client) {
      client.feedbacks.push(newFeedback.id);
    }

    saveData(data);
    return newFeedback;
  },

  update: (id, updates) => {
    const data = getData();
    const index = data.feedbacks.findIndex(f => f.id == id);
    if (index !== -1) {
      data.feedbacks[index] = { ...data.feedbacks[index], ...updates };
      saveData(data);
      return data.feedbacks[index];
    }
    return null;
  },

  getPendingReviews: () => {
    const data = getData();
    return data.feedbacks.filter(f => !f.trainerResponse || f.trainerResponse === '');
  }
};

// ============================================
// APPOINTMENTS CRUD
// ============================================

const Appointments = {
  getAll: () => {
    const data = getData();
    return data.appointments;
  },

  getUpcoming: () => {
    const now = new Date();
    return Appointments.getAll()
      .filter(a => new Date(a.date) > now && a.status === 'scheduled')
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  },

  create: (appointmentData) => {
    const data = getData();
    const newAppointment = {
      id: generateUUID(),
      clientId: appointmentData.clientId,
      date: appointmentData.date,
      type: appointmentData.type || 'call',
      notes: appointmentData.notes || '',
      status: 'scheduled'
    };
    data.appointments.push(newAppointment);
    saveData(data);
    return newAppointment;
  },

  update: (id, updates) => {
    const data = getData();
    const index = data.appointments.findIndex(a => a.id == id);
    if (index !== -1) {
      data.appointments[index] = { ...data.appointments[index], ...updates };
      saveData(data);
      return data.appointments[index];
    }
    return null;
  },

  delete: (id) => {
    const data = getData();
    data.appointments = data.appointments.filter(a => a.id != id);
    saveData(data);
  }
};

const MuscleGroups = {
  saveExerciseAndSync: (group, idx, name, videoUrl) => {
    const data = getData();
    if (!data.muscleGroupsConfig) return;
    
    // 1. Actualizar configuración local de ejercicios
    data.muscleGroupsConfig.exercises[group][idx] = { name, videoUrl };

    // 2. Sincronizar Multimedia - Versión Ultra-Robusta
    const cleanName = name.toLowerCase().trim();
    
    // Obtenemos el item existente (buscando en personales primero)
    const personalMedia = data.media || [];
    const systemItems = [...(window.SYSTEM_MEDIA || []), ...SYSTEM_MEDIA];
    
    let existing = personalMedia.find(m => m.title.toLowerCase().trim() === cleanName);
    if (!existing) {
        existing = systemItems.find(m => m.title.toLowerCase().trim() === cleanName);
    }

    if (existing) {
        let personalIdx = data.media.findIndex(m => m.id === existing.id);
        if (personalIdx === -1) {
            // Crear override de sistema
            data.media.push({
                ...existing,
                url: videoUrl,
                muscleGroup: group,
                isSystem: false,
                updatedAt: new Date().toISOString()
            });
        } else {
            // Actualizar personal
            data.media[personalIdx].url = videoUrl;
            data.media[personalIdx].muscleGroup = group;
            data.media[personalIdx].updatedAt = new Date().toISOString();
        }
    } else if (videoUrl) {
        // Crear nuevo totalmente
        data.media.push({
            id: generateUUID(),
            type: 'video',
            category: 'exercise',
            title: name,
            url: videoUrl,
            muscleGroup: group,
            isSystem: false,
            createdAt: new Date().toISOString()
        });
    }

    saveData(data);
    return data;
  }
};

const TrainingLogs = {
  getAll: () => {
    const data = getData();
    return data.trainingLogs || [];
  },

  getByClientId: (clientId) => {
    const data = getData();
    return (data.trainingLogs || []).filter(l => l.clientId == clientId);
  },

  create: (logData) => {
    const data = getData();

    // Find active block for this client
    const activeBlock = (data.trainingBlocks || []).find(b => b.clientId == logData.clientId && b.status === 'active');

    const newLog = {
      id: generateUUID(),
      clientId: logData.clientId,
      routineId: logData.routineId,
      dayNumber: logData.dayNumber,
      blockId: activeBlock ? activeBlock.id : null,
      date: logData.date || new Date().toISOString(),
      exercises: logData.exercises || [], // array of { name, sets: [{ weight, reps, rir }] }
      completed: true, // Mark as completed when saved
      createdAt: new Date().toISOString()
    };
    if (!data.trainingLogs) data.trainingLogs = [];
    data.trainingLogs.push(newLog);
    saveData(data);
    return newLog;
  },

  update: (id, updates) => {
    const data = getData();
    if (!data.trainingLogs) return null;
    const index = data.trainingLogs.findIndex(l => l.id == id);
    if (index !== -1) {
      data.trainingLogs[index] = { ...data.trainingLogs[index], ...updates };
      saveData(data);
      return data.trainingLogs[index];
    }
    return null;
  },

  getExercisePR: (clientId, exerciseName) => {
    const logs = TrainingLogs.getByClientId(clientId);
    let maxWeight = 0;
    logs.forEach(l => {
      (l.exercises || []).forEach(ex => {
        if (ex.name === exerciseName) {
          const m = Math.max(...(ex.sets || []).map(s => parseFloat(s.weight) || 0));
          if (m > maxWeight) maxWeight = m;
        }
      });
    });
    return maxWeight;
  },

  getExercisePRDetails: (clientId, exerciseName) => {
    const logs = TrainingLogs.getByClientId(clientId);
    let bestSet = { weight: 0, reps: 0 };
    logs.forEach(l => {
      (l.exercises || []).forEach(ex => {
        if (ex.name === exerciseName) {
          (ex.sets || []).forEach(s => {
            const w = parseFloat(s.weight) || 0;
            const r = parseInt(s.reps) || 0;
            if (w > bestSet.weight) {
                bestSet = { weight: w, reps: r };
            } else if (w > 0 && w === bestSet.weight && r > bestSet.reps) {
                bestSet.reps = r;
            }
          });
        }
      });
    });
    return bestSet;
  }
};

const Habits = {
  getAll: () => {
    const data = getData();
    return data.habits || [];
  },

  getByClientId: (clientId) => {
    return Habits.getAll().filter(h => h.clientId == clientId);
  },

  getToday: (clientId) => {
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    return (Habits.getAll() || []).find(h => h.clientId === clientId && h.date === today);
  },

  save: (clientId, habitsData) => {
    const data = getData();
    if (!data.habits) data.habits = [];
    
    const today = new Date().toLocaleDateString('en-CA');
    const index = data.habits.findIndex(h => h.clientId === clientId && h.date === today);
    
    const entry = {
      clientId,
      date: today,
      water: parseFloat(habitsData.water) || 0,
      steps: parseInt(habitsData.steps) || 0,
      sleep: parseFloat(habitsData.sleep) || 0,
      updatedAt: new Date().toISOString()
    };

    if (index !== -1) {
      data.habits[index] = { ...data.habits[index], ...entry };
    } else {
      data.habits.push(entry);
    }
    
    saveData(data);
    return entry;
  }
};

const TrainingBlocks = {
  getAll: () => {
    const data = getData();
    return data.trainingBlocks || [];
  },

  getByClientId: (clientId) => {
    return TrainingBlocks.getAll().filter(b => b.clientId == clientId);
  },

  getById: (id) => {
    return TrainingBlocks.getAll().find(b => b.id == id);
  },

  create: (blockData) => {
    const data = getData();

    if (!data.trainingBlocks) data.trainingBlocks = [];

    const newBlock = {
      id: generateUUID(),
      clientId: blockData.clientId,
      name: blockData.name,
      startDate: blockData.startDate || new Date().toISOString(),
      goal: blockData.goal || '',
      endDate: blockData.endDate || null,
      status: blockData.status || 'active',
      published: blockData.published || false,
      createdAt: new Date().toISOString(),
      weeks: []
    };

    data.trainingBlocks.push(newBlock);
    saveData(data);
    return newBlock;
  },

  update: (id, updates) => {
    const data = getData();
    if (!data.trainingBlocks) return null;
    const index = data.trainingBlocks.findIndex(b => b.id == id);
    if (index !== -1) {
      data.trainingBlocks[index] = { ...data.trainingBlocks[index], ...updates };
      saveData(data);
      return data.trainingBlocks[index];
    }
    return null;
  },

  delete: (id) => {
    const data = getData();
    if (!data.trainingBlocks) return;
    data.trainingBlocks = data.trainingBlocks.filter(b => b.id != id);
    saveData(data);
  }
};

const Invoices = {
  getAll: () => {
    const data = getData();
    return data.invoices || [];
  },

  getByClientId: (clientId) => {
    return Invoices.getAll().filter(i => i.clientId == clientId);
  },

  getById: (id) => {
    return Invoices.getAll().find(i => i.id == id);
  },

  getLast: () => {
    const all = Invoices.getAll();
    return all.length > 0 ? all[all.length - 1] : null;
  },

  getNextNumber: () => {
    const all = Invoices.getAll();
    const brand = BrandConfig.get();
    const prefix = (brand.fiscalData && brand.fiscalData.invoiceSeries) ? brand.fiscalData.invoiceSeries + '-' : `F${new Date().getFullYear()}-`;
    
    const yearInvoices = all.filter(i => i.number && i.number.startsWith(prefix));
    
    if (yearInvoices.length === 0) return `${prefix}0001`;
    
    const lastNum = yearInvoices[yearInvoices.length - 1].number;
    const seq = parseInt(lastNum.split('-')[1]) + 1;
    return `${prefix}${seq.toString().padStart(4, '0')}`;
  },

  create: async (invoiceData) => {
    const data = getData();
    if (!data.invoices) data.invoices = [];

    const lastInvoice = Invoices.getLast();
    const prevHash = lastInvoice ? lastInvoice.hash : "";
    
    const brand = BrandConfig.get();
    const ivaRate = (brand.fiscalData && brand.fiscalData.defaultIva) || 21;
    const total = parseFloat(invoiceData.amount) || 0;
    const base = total / (1 + (ivaRate / 100));
    const ivaAmount = total - base;

    const newInvoice = {
      id: generateUUID(),
      clientId: invoiceData.clientId,
      clientName: invoiceData.clientName || 'Cliente',
      date: new Date().toISOString(),
      number: Invoices.getNextNumber(),
      amount: total,
      base: base,
      ivaRate: ivaRate,
      ivaAmount: ivaAmount,
      description: invoiceData.description || 'Cuota Mensual',
      status: 'paid',
      previousHash: prevHash,
      hash: "" // Will be calculated below
    };

    // Calculate Hash (Simple SHA-256 simulation or actual WebCrypto)
    // For VeriFactu compliance, we use the specific fields chain.
    const chainData = `${newInvoice.number}|${newInvoice.date}|${newInvoice.amount}|${prevHash}`;
    newInvoice.hash = await Invoices.generateHash(chainData);

    data.invoices.push(newInvoice);
    saveData(data);
    return newInvoice;
  },

  generateHash: async (text) => {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
};

window.Clients = Clients;
window.Routines = Routines;
window.Diets = Diets;
window.Foods = Foods;
window.Feedbacks = Feedbacks;
window.Appointments = Appointments;
window.MuscleGroups = MuscleGroups;
window.TrainingLogs = TrainingLogs;
window.Habits = Habits;
window.TrainingBlocks = TrainingBlocks;
window.Invoices = Invoices;
const BrandConfig = {
  get: () => {
    if (window.BrandConfig && window.BrandConfig !== BrandConfig) {
      return window.BrandConfig.get();
    }
    const data = getData();
    return data.brand || {
        name: 'Infinite Coach',
        configured: true,
        colors: { primary: '#00D9FF', secondary: '#1A1A2E', accent: '#FF6B6B' },
        fiscalData: { invoiceSeries: 'F' + new Date().getFullYear() }
    };
  },

  set: (brandData) => {
    if (window.BrandConfig && window.BrandConfig !== BrandConfig) {
      return window.BrandConfig.set(brandData);
    }
    const db = getData(); // Obtener estado actual completo
    
    // Ensure brand object exists
    if (!db.brand) db.brand = {};
    
    // Direct merge into the brand object
    for (let key in brandData) {
      if (brandData.hasOwnProperty(key)) {
        db.brand[key] = brandData[key];
      }
    }
    
    db.brand.configured = true;
    
    // Save with sync support
    saveData(db);
    return db.brand;
  },

  isConfigured: () => {
    if (window.BrandConfig && window.BrandConfig !== BrandConfig) {
      return window.BrandConfig.isConfigured();
    }
    const brand = BrandConfig.get();
    return brand && brand.configured;
  },

  applyTheme: () => {
    if (window.BrandConfig && window.BrandConfig !== BrandConfig) {
      return window.BrandConfig.applyTheme();
    }
    const brand = BrandConfig.get();
    if (brand && brand.colors) {
      document.documentElement.style.setProperty('--primary-color', brand.colors.primary);
      document.documentElement.style.setProperty('--secondary-color', brand.colors.secondary);
      document.documentElement.style.setProperty('--accent-color', brand.colors.accent);

      // Convert Primary to RGB for transparencies
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
          `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
          '0, 217, 255';
      };
      document.documentElement.style.setProperty('--primary-color-rgb', hexToRgb(brand.colors.primary));
    }

    // Dynamic Header (Logo & Name)
    const headerLogos = document.querySelectorAll('.logo-img, #brandLogo');
    const previewLogos = document.querySelectorAll('#logoPreview');
    const nameSpan = document.getElementById('brandName');
    
    // Titulo de la página dinámico si existe
    const baseTitle = document.title.split(' - ')[0]; // Tomar parte antes del guion
    
    if (brand) {
        headerLogos.forEach(logoImg => {
            if (brand.logo && brand.logo.length > 5) {
                // Ensure cloud images load correctly
                logoImg.src = brand.logo;
                
                const extraStyles = "background: white; padding: 2px; border-radius: 4px;";
                logoImg.style.cssText = `display: block !important; opacity: 1 !important; visibility: visible !important; max-height: 40px !important; width: auto !important; object-fit: contain !important; ${extraStyles}`;
                
                logoImg.onerror = () => {
                    // Solo ocultar si realmente falla la carga DESPUÉS de intentarlo
                    if (!logoImg.src.includes('blob:')) {
                        console.warn("Logo failed to load:", logoImg.src);
                        logoImg.style.display = 'none';
                    }
                };
            } else {
                logoImg.src = '';
                logoImg.style.display = 'none';
            }
        });

        previewLogos.forEach(logoImg => {
            if (brand.logo && brand.logo.length > 5) {
                logoImg.src = brand.logo;
                logoImg.style.cssText = `display: block !important; opacity: 1 !important; visibility: visible !important; max-width: 150px !important; max-height: 150px !important; object-fit: contain !important; background: white; padding: 10px; border-radius: 4px;`;
            } else {
                logoImg.src = 'img/logo-infinite-marble.png';
                logoImg.style.cssText = `max-width: 150px !important; max-height: 150px !important; object-fit: contain !important; background: white; padding: 10px;`;
            }
        });
        
        if (nameSpan) {
            nameSpan.textContent = brand.name || 'Infinite Coach';
            // Aplicar color principal al nombre para mayor visibilidad
            nameSpan.style.color = brand.colors?.primary || '#00D9FF';
            nameSpan.style.fontWeight = '800';
        }
        
        // Actualizar título de la ventana
        if (brand.name) {
            document.title = `${baseTitle} - ${brand.name}`;
        }
    }

    // Admin Master Link Check (Automatic)
    const masterLink = null;
    if (masterLink) {
        const mid = window.activeTrainerId || localStorage.getItem('activeTrainerId') || 'default';
        const userEmail = (typeof AUTH !== 'undefined' && AUTH.userEmail) || localStorage.getItem('_trainerEmail');
        const b = BrandConfig.get();
        
        // Debug
        console.log("Master Check:", { mid, userEmail, bName: b?.name });

        // Si el usuario es 'default' o su email contiene 'asteam' o el nombre de marca es ASTeam
        const isMaster = mid === 'default' || 
                         (userEmail && userEmail.toLowerCase().includes('asteam')) || 
                         (b && b.name && b.name.toLowerCase().includes('asteam'));

        if (isMaster) {
            masterLink.style.setProperty('display', 'block', 'important');
        } else {
            // No forzar display:none si ya estaba visible, pero ocultar si se requiere seguridad estricta
            masterLink.style.display = 'none';
        }
    }
  }
};

window.BrandConfig = BrandConfig;
console.log("🏁 v310 STABLE: Sistema Cargado con CRUD.");
