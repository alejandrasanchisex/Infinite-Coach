// ============================================
// DATA MODELS & STORAGE MANAGEMENT - v311 BLINDAJE TOTAL
// ============================================

const DB_VERSION = '1.0.1';
let activeTrainerId = (function() {
    // 1. Obtener del parámetro de búsqueda de la URL 't'
    let tParam = null;
    if (typeof window !== 'undefined' && window.location && window.location.search) {
        tParam = new URLSearchParams(window.location.search).get('t');
    }
    
    // Normalizar tParam
    if (tParam) {
        tParam = tParam.toLowerCase().trim();
        if (tParam === 'asteam' || tParam === 'alejandra') {
            tParam = 't-w0iybl7qb';
        } else if (tParam === 'toledo' || tParam === 'vtoledo') {
            tParam = 't-8umeizyns';
        }
    }
    
    let storedTrainerId = localStorage.getItem('activeTrainerId');
    if (storedTrainerId) {
        storedTrainerId = storedTrainerId.trim();
    }
    
    // 2. Si el cliente está logueado, buscar su base de datos correspondiente (para restaurar contexto en PWA)
    let clientId = localStorage.getItem('clientId') || sessionStorage.getItem('clientId');
    if (clientId) {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('fitnessAppData_') && !key.endsWith('_backup')) {
                const raw = localStorage.getItem(key);
                if (raw) {
                    try {
                        const parsed = JSON.parse(raw);
                        if (parsed && parsed.clients && parsed.clients.some(c => c.id === clientId)) {
                            const foundTid = key.replace('fitnessAppData_', '');
                            if (foundTid && foundTid !== 'default' && foundTid !== 'admin') {
                                console.log(`[data-models] Cliente detectado en base de datos: ${foundTid}. Restaurando contexto.`);
                                return foundTid;
                            }
                        }
                    } catch(e) {}
                }
            }
        }
    }
    
    // 3. Si hay tParam específico, priorizarlo
    if (tParam && tParam !== 'default' && tParam !== 'admin') {
        return tParam;
    }
    
    // 4. Si hay entrenador guardado específico, conservarlo
    if (storedTrainerId && storedTrainerId !== 'default' && storedTrainerId !== 'admin') {
        return storedTrainerId;
    }
    
    // 5. Mapeos de correos de entrenadores (si es el panel de coach)
    const trainerEmail = localStorage.getItem('_trainerEmail') || '';
    if (trainerEmail) {
        const emailLower = trainerEmail.toLowerCase().trim();
        if (emailLower === 'ingenia@ingeniaia.es') return 't-zum04ds2n';
        if (emailLower === 'alejandra.asteam@gmail.com') return 't-w0iybl7qb';
        if (emailLower === 'vtoledonutrition@gmail.com') return 't-8umeizyns';
    }
    
    return tParam || storedTrainerId || 'default';
})();

if (activeTrainerId === 'alejandra_asteam_gmail_com') {
    activeTrainerId = 't-w0iybl7qb';
}
if (!activeTrainerId || activeTrainerId === 'default' || activeTrainerId === 'admin') {
    activeTrainerId = 'default';
}

localStorage.setItem('activeTrainerId', activeTrainerId);
window.activeTrainerId = activeTrainerId;
const getStorageKey = () => `fitnessAppData_${window.activeTrainerId || 'default'}`;

// 🧹 MOCK DATA CLEANUP FOR ASTEAM (PREVENT SPILLOVER RE-UPLOAD)
(function() {
    try {
        const sKey = 'fitnessAppData_t-w0iybl7qb';
        const raw = localStorage.getItem(sKey);
        if (raw) {
            const data = JSON.parse(raw);
            const clients = data.clients || [];
            
            // Check if there are any clients other than Amalia and Fernando
            const hasMock = clients.some(c => c.id !== '0db0ea7a-c413-44cb-b99e-dfd9790383eb' && c.id !== '20f2e6c2-2699-4ccc-a982-1e9fb141b9bb');
            
            // Check if Amalia or Fernando have incorrect fees in local storage
            const amalia = clients.find(c => c.id === '0db0ea7a-c413-44cb-b99e-dfd9790383eb');
            const fernando = clients.find(c => c.id === '20f2e6c2-2699-4ccc-a982-1e9fb141b9bb');
            const hasWrongFees = (amalia && amalia.monthlyFee !== 65) || (fernando && fernando.monthlyFee !== 0);
            
            // Check if there are mock feedbacks or invoices in local storage
            const feedbacks = data.feedbacks || [];
            const invoices = data.invoices || [];
            const hasMockFeedbacks = feedbacks.some(f => f.id === 'fb-pending-1' || f.id === 'fb-pending-2' || String(f.id).startsWith('fb-pending-'));
            const hasMockInvoices = invoices.some(i => String(i.id).startsWith('inv-'));
            
            if (hasMock || hasWrongFees || hasMockFeedbacks || hasMockInvoices) {
                console.warn("🧹 [ASTEAM CLEANUP] Test data spillover, wrong fees, or mock feedbacks/invoices detected in local storage. Wiping key and forcing clean sync from cloud...");
                localStorage.removeItem(sKey);
                localStorage.removeItem(sKey + '_backup');
                localStorage.setItem('isNewInstall_t-w0iybl7qb', 'true');
            }
        }
    } catch(e) {
        console.error("[ASTEAM CLEANUP] Error checking local storage:", e);
    }
})();

const updateActiveTrainerId = (newId) => {
    let targetId = newId;
    if (targetId === 'alejandra_asteam_gmail_com') {
        targetId = 't-w0iybl7qb';
    }
    window.activeTrainerId = targetId;
    localStorage.setItem('activeTrainerId', targetId);
    console.log("Storage Key actualizada para:", targetId);
};
window.updateActiveTrainerId = updateActiveTrainerId;

// URL Parameter support for clients (accessing their trainer's data)
const urlParams = new URLSearchParams(window.location.search);
let trainerFromUrl = urlParams.get('t');
if (trainerFromUrl) {
    const lower = trainerFromUrl.toLowerCase().trim();
    if (lower === 'asteam' || lower === 'alejandra') {
        trainerFromUrl = 't-w0iybl7qb';
    } else if (lower === 'toledo' || lower === 'vtoledo') {
        trainerFromUrl = 't-8umeizyns';
    }
    updateActiveTrainerId(trainerFromUrl);
}

const syncClientWithLatestFeedback = (client, feedbacks) => {
    if (!client) return false;
    const clientFeedbacks = (feedbacks || []).filter(f => f.clientId == client.id);
    if (clientFeedbacks.length === 0) return false;

    const sortedFeedbacks = [...clientFeedbacks].sort((a, b) => new Date(a.date) - new Date(b.date));
    const latestFeedback = sortedFeedbacks[sortedFeedbacks.length - 1];
    
    if (!client.technicalData) {
        client.technicalData = {};
    }
    
    let changed = false;
    
    if (latestFeedback.weight !== undefined && latestFeedback.weight !== null) {
        const val = Math.round(parseFloat(latestFeedback.weight) * 100) / 100;
        if (client.technicalData.weight !== val) {
            client.technicalData.weight = val;
            changed = true;
        }
    }
    
    if (latestFeedback.perimeters) {
        const p = latestFeedback.perimeters;
        const mappings = [
            { fbKey: 'Cintura', techKey: 'waist' },
            { fbKey: 'Cadera', techKey: 'glute' },
            { fbKey: 'Pecho', techKey: 'chest' },
            { fbKey: 'Brazo', techKey: 'arm' },
            { fbKey: 'Muslo', techKey: 'leg' }
        ];
        mappings.forEach(m => {
            if (p[m.fbKey] !== undefined && p[m.fbKey] !== null) {
                const val = parseFloat(p[m.fbKey]);
                if (client.technicalData[m.techKey] !== val) {
                    client.technicalData[m.techKey] = val;
                    changed = true;
                }
            }
        });
    }
    
    if (!client.weightHistory) {
        client.weightHistory = [];
        changed = true;
    }
    
    clientFeedbacks.forEach(fb => {
        if (fb.weight || (fb.perimeters && Object.keys(fb.perimeters).length > 0)) {
            const exists = client.weightHistory.some(h => 
                h.date && Math.abs(new Date(h.date) - new Date(fb.date)) < 1000 * 60 * 5
            );
            if (!exists) {
                client.weightHistory.push({
                    date: fb.date,
                    weight: fb.weight,
                    perimeters: fb.perimeters,
                    arm: fb.perimeters?.Brazo || undefined,
                    leg: fb.perimeters?.Muslo || undefined,
                    chest: fb.perimeters?.Pecho || undefined,
                    glute: fb.perimeters?.Cadera || undefined,
                    waist: fb.perimeters?.Cintura || undefined,
                    week: fb.week,
                    isFeedback: true
                });
                changed = true;
            }
        }
    });
    
    if (changed) {
        client.weightHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    return changed;
};

const getData = () => {
  const sKey = getStorageKey();
  const raw = localStorage.getItem(sKey);
  
    

    const defaults = {
    version: DB_VERSION, clients: [], routines: [], diets: [], foods: [], media: [], 
    hidden_system_media: [], deleted_system_media: [], brand: { name: 'Infinite Coach', configured: true },
    supplementationTemplates: [], feedbacks: [], appointments: [], invoices: [], trainingLogs: [], habits: [], trainingBlocks: [], deletedIds: []
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
    if (!data.trainingLogs) data.trainingLogs = [];
    if (!data.supplementationTemplates) data.supplementationTemplates = [];

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
        const initialFoodsSeed = [];

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
            return String(m.id).startsWith('sys-') || m.userEdited === true;
        });
        if (data.media.length !== initialLen) {
            console.log("🧹 Purga de recetas no oficiales ejecutada.");
            try { localStorage.setItem(sKey, JSON.stringify(data)); } catch(e){}
        }
    }

    // 🔥 AUTO-MIGRACIÓN DE GRUPOS MUSCULARES & ISQUIOTIBIALES/GEMELOS (v93 MIGRATION)
    let needsMigrationSave = false;
    const targetGroups = ['Pectorales', 'Dorsales', 'Lumbares', 'Hombros', 'Biceps', 'Triceps', 'Antebrazo', 'Abdominales', 'Cuadriceps', 'Isquiotibiales', 'Gemelos', 'Glúteos', 'Cuello'];
    
    // 1. Migrar data.media (Biblioteca Multimedia)
    if (data.media && Array.isArray(data.media)) {
        data.media.forEach(m => {
            if (m.category === 'exercise' && m.muscleGroup) {
                const oldGroup = m.muscleGroup;
                const g = m.muscleGroup.toLowerCase().trim();
                
                // Mapear hamstring/calves basándonos en el título primero
                const titleLower = (m.title || '').toLowerCase();
                if (titleLower.includes('femoral') || titleLower.includes('isquio') || titleLower.includes('rumano')) {
                    m.muscleGroup = 'Isquiotibiales';
                } else if (titleLower.includes('gemelo')) {
                    m.muscleGroup = 'Gemelos';
                } else if (g === 'pecho') {
                    m.muscleGroup = 'Pectorales';
                } else if (g === 'espalda') {
                    m.muscleGroup = 'Dorsales';
                } else if (g === 'bíceps' || g === 'biceps') {
                    m.muscleGroup = 'Biceps';
                } else if (g === 'tríceps' || g === 'triceps') {
                    m.muscleGroup = 'Triceps';
                } else if (g === 'core') {
                    m.muscleGroup = 'Abdominales';
                } else if (g === 'piernas' || g === 'pierna' || g === 'cuadriceps') {
                    m.muscleGroup = 'Cuadriceps';
                } else if (g === 'glúteos' || g === 'gluteos' || g === 'glúteo' || g === 'gluteo') {
                    m.muscleGroup = 'Glúteos';
                }
                
                if (m.muscleGroup !== oldGroup) {
                    needsMigrationSave = true;
                }
            }
        });
    }

    // 2. Migrar data.muscleGroupsConfig (Configuración del Entrenador)
    if (data.muscleGroupsConfig) {
        const mgConfig = data.muscleGroupsConfig;
        
        // Sincronizar grupos
        const oldGroupsStr = JSON.stringify(mgConfig.groups || []);
        mgConfig.groups = targetGroups;
        if (JSON.stringify(mgConfig.groups) !== oldGroupsStr) {
            needsMigrationSave = true;
        }

        // Migrar exercises map
        if (mgConfig.exercises) {
            const oldExercises = mgConfig.exercises;
            const newExercises = {};
            targetGroups.forEach(g => {
                newExercises[g] = [];
            });

            let oldKeysFound = false;
            Object.keys(oldExercises).forEach(key => {
                const exList = oldExercises[key] || [];
                if (!Array.isArray(exList)) return;

                if (!targetGroups.includes(key)) {
                    oldKeysFound = true;
                }

                exList.forEach(ex => {
                    const exName = typeof ex === 'string' ? ex : (ex.name || '');
                    const exUrl = typeof ex === 'string' ? '' : (ex.videoUrl || '');
                    if (!exName) return;

                    // Determinar destino
                    let destGroup = key;
                    const nameLower = exName.toLowerCase();
                    
                    if (nameLower.includes('femoral') || nameLower.includes('isquio') || nameLower.includes('rumano')) {
                        destGroup = 'Isquiotibiales';
                    } else if (nameLower.includes('gemelo')) {
                        destGroup = 'Gemelos';
                    } else {
                        const lowKey = key.toLowerCase().trim();
                        if (lowKey === 'pecho') destGroup = 'Pectorales';
                        else if (lowKey === 'espalda') destGroup = 'Dorsales';
                        else if (lowKey === 'bíceps' || lowKey === 'biceps') destGroup = 'Biceps';
                        else if (lowKey === 'tríceps' || lowKey === 'triceps') destGroup = 'Triceps';
                        else if (lowKey === 'core') destGroup = 'Abdominales';
                        else if (lowKey === 'piernas' || lowKey === 'pierna' || lowKey === 'cuadriceps') destGroup = 'Cuadriceps';
                        else if (lowKey === 'glúteos' || lowKey === 'gluteos' || lowKey === 'glúteo' || lowKey === 'gluteo') destGroup = 'Glúteos';
                        else if (targetGroups.includes(key)) destGroup = key;
                        else destGroup = 'Cuadriceps'; // Fallback
                    }

                    // Push a la nueva lista si no existe ya
                    const alreadyExists = newExercises[destGroup].some(existing => {
                        const existingName = typeof existing === 'string' ? existing : (existing.name || '');
                        return existingName.toLowerCase().trim() === exName.toLowerCase().trim();
                    });

                    if (!alreadyExists) {
                        newExercises[destGroup].push(typeof ex === 'string' ? { name: exName, videoUrl: exUrl } : ex);
                    }
                });
            });

            // Verificar si el nuevo mapa de ejercicios difiere del anterior para guardar
            const oldExercisesStr = JSON.stringify(oldExercises);
            const newExercisesStr = JSON.stringify(newExercises);
            if (oldExercisesStr !== newExercisesStr || oldKeysFound) {
                mgConfig.exercises = newExercises;
                needsMigrationSave = true;
            }
        }
    }

    if (needsMigrationSave) {
        console.log("🔥 [MIGRACIÓN v93] Cambios de grupos musculares detectados localmente. Guardando y sincronizando con Supabase...");
        try {
            localStorage.setItem(sKey, JSON.stringify(data));
            // Sincronizar inmediatamente si existe SupabaseService
            if (window.SupabaseService) {
                const currentId = window.activeTrainerId || localStorage.getItem('activeTrainerId') || 'default';
                if (currentId !== 'default') {
                    window.SupabaseService.saveTrainerData(currentId, data)
                        .then(() => console.log("🔥 [MIGRACIÓN v93] Sincronización exitosa con Supabase."))
                        .catch(err => console.warn("Supabase Sync Error during migration:", err));
                }
            }
        } catch(e) {
            console.error("Error saving migrated data:", e);
        }
    }

    // Auto-sync clients with latest feedback in memory if needed
    if (data.clients && data.feedbacks) {
        let changed = false;
        data.clients.forEach(client => {
            if (syncClientWithLatestFeedback(client, data.feedbacks)) {
                changed = true;
            }
        });
        if (changed) {
            try { localStorage.setItem(sKey, JSON.stringify(data)); } catch(e){}
        }
    }

    return data;

  } catch (e) { return defaults; }
};
window.getData = getData;

const mergeLocalEdits = (localNew, cloudMerged, localPrev, isTrainer) => {
    const collections = ['clients', 'routines', 'diets', 'foods', 'media', 'feedbacks', 'appointments', 'invoices', 'trainingBlocks', 'trainingLogs', 'habits', 'supplementationTemplates'];
    const trainerCollections = ['routines', 'diets', 'foods', 'media', 'trainingBlocks', 'supplementationTemplates', 'invoices'];
    const clientCollections = ['feedbacks', 'appointments', 'trainingLogs', 'habits'];
    
    const result = { ...cloudMerged };
    
    // 🛡️ CONCURRENCY SHIELD (PAGE-AWARE): Prevent stale browser tabs from overwriting collections they don't edit
    const getEditableCollectionsForPage = () => {
        if (typeof window === 'undefined') return null;
        const pathname = window.location.pathname;
        const page = pathname.split('/').pop() || '';
        
        if (page.includes('settings') || page.includes('asteam') || page.includes('subscription')) {
            return ['brand', 'trainerSettings', 'paymentSettings', 'fiscalData']; 
        }
        if (page.includes('diets')) {
            return ['diets', 'foods'];
        }
        if (page.includes('routines') && !page.includes('client')) {
            return ['routines'];
        }
        if (page.includes('clients') && !page.includes('detail')) {
            return ['clients'];
        }
        if (page.includes('appointments')) {
            return ['appointments'];
        }
        if (page.includes('media')) {
            return ['media'];
        }
        if (page.includes('feedback')) {
            return ['feedbacks'];
        }
        if (page.includes('dashboard')) {
            return ['appointments', 'feedbacks'];
        }
        if (page.includes('client-detail')) {
            return ['clients', 'trainingBlocks', 'trainingLogs', 'feedbacks', 'appointments', 'diets', 'routines'];
        }
        return null;
    };

    const editableCols = getEditableCollectionsForPage();
    
    // Get the client ID if we are on a client-specific detail page
    const getActiveClientIdFromUrl = () => {
        if (typeof window === 'undefined') return null;
        try {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('id');
        } catch (e) {
            return null;
        }
    };
    const activeClientId = getActiveClientIdFromUrl();

    collections.forEach(col => {
        const localItems = localNew[col] || [];
        const mergedItems = cloudMerged[col] || [];
        const prevItems = localPrev?.[col] || [];
        
        // Auto-assign IDs to habits if missing
        if (col === 'habits') {
            localItems.forEach(item => {
                if (!item.id && item.clientId && item.date) {
                    item.id = `${item.clientId}_
${item.date}`.replace('\n', ''); // Safe compile
                }
            });
            mergedItems.forEach(item => {
                if (!item.id && item.clientId && item.date) {
                    item.id = `${item.clientId}_
${item.date}`.replace('\n', ''); // Safe compile
                }
            });
            prevItems.forEach(item => {
                if (!item.id && item.clientId && item.date) {
                    item.id = `${item.clientId}_
${item.date}`.replace('\n', ''); // Safe compile
                }
            });
        }
        
        // 1. Page-level block: if the page is not allowed to edit this collection, preserve cloud
        if (editableCols && !editableCols.includes(col)) {
            result[col] = mergedItems;
            return;
        }
        
        if (col === 'clients') {
            const localMap = new Map(localItems.map(c => [c.id, c]));
            const cloudMap = new Map(mergedItems.map(c => [c.id, c]));
            const prevClientsMap = new Map(prevItems.map(c => [c.id, c]));
            
            const allClientIds = new Set([...localMap.keys(), ...cloudMap.keys()]);
            const finalClients = [];
            
            allClientIds.forEach(id => {
                const localClient = localMap.get(id);
                const cloudClient = cloudMap.get(id);
                const prevClient = prevClientsMap.get(id);
                
                // Respect explicit deletions
                const isExplicitlyDeleted = localNew.deletedIds && localNew.deletedIds.includes(id);
                if (isExplicitlyDeleted) return;
                
                // If we are on client-detail for client A, never apply local edits for client B
                if (activeClientId && id !== activeClientId) {
                    if (cloudClient) finalClients.push(cloudClient);
                    return;
                }
                
                if (localClient && cloudClient) {
                    const localChanged = !prevClient || JSON.stringify(localClient) !== JSON.stringify(prevClient);
                    if (!localChanged) {
                        finalClients.push(cloudClient);
                        return;
                    }
                    
                    const mergedClient = { ...cloudClient };
                    if (isTrainer) {
                        const trainerFields = ['email', 'phone', 'gender', 'status', 'reviewDay', 'monthlyFee', 'assignedDiet', 'assignedDiets', 'publishedDiets', 'dietPublished', 'assignedRoutine', 'activeBlockId', 'cardio', 'cardioUrl', 'cardioPublished', 'supplementation', 'supplementationPublished', 'supplementationUrl', 'supplementationUrlVisible', 'paymentStatus', 'paymentExpiry', 'subscriptionType', 'subscriptionAmount', 'reviewFrequency', 'reviewDaysOfMonth', 'specificReviewDate'];
                        trainerFields.forEach(f => {
                            if (localClient[f] !== undefined) mergedClient[f] = localClient[f];
                        });
                        if (localClient.technicalData) {
                            if (!mergedClient.technicalData) mergedClient.technicalData = {};
                            const trainerTechFields = ['targetMacros', 'skinfoldsEnabled', 'skinfolds'];
                            trainerTechFields.forEach(f => {
                                if (localClient.technicalData[f] !== undefined) mergedClient.technicalData[f] = localClient.technicalData[f];
                            });
                            const clientTechFields = ['age', 'height', 'goals', 'injuries', 'allergies', 'notes', 'weight', 'waist', 'glute', 'chest', 'arm', 'leg'];
                            clientTechFields.forEach(f => {
                                const localVal = localClient.technicalData[f];
                                const prevVal = prevClient?.technicalData?.[f];
                                if (localVal !== undefined) {
                                    if (prevVal === undefined || localVal !== prevVal) {
                                        mergedClient.technicalData[f] = localVal;
                                    } else if (mergedClient.technicalData[f] === undefined) {
                                        mergedClient.technicalData[f] = localVal;
                                    }
                                }
                            });
                        }
                        if (localClient.name && localClient.name !== cloudClient.name && localClient.name !== (prevClient?.name)) {
                            mergedClient.name = localClient.name;
                        }
                    } else {
                        const clientFields = ['profilePhoto', 'weightHistory', 'feedbacks'];
                        clientFields.forEach(f => {
                            if (localClient[f] !== undefined) mergedClient[f] = localClient[f];
                        });
                        if (localClient.technicalData) {
                            if (!mergedClient.technicalData) mergedClient.technicalData = {};
                            const clientTechFields = ['age', 'height', 'goals', 'injuries', 'allergies', 'notes', 'weight', 'waist', 'glute', 'chest', 'arm', 'leg'];
                            clientTechFields.forEach(f => {
                                if (localClient.technicalData[f] !== undefined) mergedClient.technicalData[f] = localClient.technicalData[f];
                            });
                        }
                        if (localClient.name && localClient.name !== cloudClient.name && localClient.name !== (prevClient?.name)) {
                            mergedClient.name = localClient.name;
                        }
                    }
                    finalClients.push(mergedClient);
                } else if (localClient) {
                    if (prevClient) {
                        const localChanged = JSON.stringify(localClient) !== JSON.stringify(prevClient);
                        if (localChanged) finalClients.push(localClient);
                    } else {
                        finalClients.push(localClient);
                    }
                } else if (cloudClient) {
                    finalClients.push(cloudClient);
                }
            });
            result.clients = finalClients;
        } else {
            // 3-WAY SMART ID-BASED MERGE for all other collections
            const localMap = new Map(localItems.map(item => [item.id, item]));
            const cloudMap = new Map(mergedItems.map(item => [item.id, item]));
            const prevMap = new Map(prevItems.map(item => [item.id, item]));
            
            const allIds = new Set([...localMap.keys(), ...cloudMap.keys()]);
            const finalItems = [];
            
            allIds.forEach(id => {
                if (!id) return;
                const localItem = localMap.get(id);
                const cloudItem = cloudMap.get(id);
                const prevItem = prevMap.get(id);
                
                // Respect explicit deletions
                const isExplicitlyDeleted = localNew.deletedIds && localNew.deletedIds.includes(id);
                if (isExplicitlyDeleted) return;
                
                // If we are on client-detail for client A, never apply local edits for items belonging to client B
                const itemClientId = localItem?.clientId || cloudItem?.clientId || prevItem?.clientId;
                if (activeClientId && itemClientId && itemClientId !== activeClientId) {
                    if (cloudItem) finalItems.push(cloudItem);
                    return;
                }
                
                // Role role check: if isTrainer is true, trainer cannot edit client collections (unless specifically responding, e.g. feedbacks, appointments)
                if (isTrainer && clientCollections.includes(col)) {
                    if (col === 'feedbacks' && localItem && cloudItem) {
                        const localChanged = !prevItem || localItem.trainerResponse !== prevItem.trainerResponse;
                        if (localChanged) {
                            const mergedFeedback = { ...cloudItem, trainerResponse: localItem.trainerResponse };
                            finalItems.push(mergedFeedback);
                            return;
                        }
                    }
                    if (col === 'appointments' && localItem && cloudItem) {
                        const localChanged = !prevItem || localItem.status !== prevItem.status || localItem.replyNotes !== prevItem.replyNotes;
                        if (localChanged) {
                            const mergedApp = { ...cloudItem, status: localItem.status, replyNotes: localItem.replyNotes };
                            finalItems.push(mergedApp);
                            return;
                        }
                    }
                    if (cloudItem) finalItems.push(cloudItem);
                    return;
                }
                
                // Client role check: clients cannot edit trainer collections
                if (!isTrainer && trainerCollections.includes(col)) {
                    if (cloudItem) finalItems.push(cloudItem);
                    return;
                }
                
                if (localItem && cloudItem) {
                    const localChanged = !prevItem || JSON.stringify(localItem) !== JSON.stringify(prevItem);
                    if (localChanged) {
                        finalItems.push(localItem);
                    } else {
                        finalItems.push(cloudItem);
                    }
                } else if (localItem) {
                    if (prevItem) {
                        const localChanged = JSON.stringify(localItem) !== JSON.stringify(prevItem);
                        if (localChanged) {
                            finalItems.push(localItem);
                        } else {
                            // Check if it's a new local item created after the last sync
                            const currentId = window.activeTrainerId || localStorage.getItem('activeTrainerId') || 'default';
                            const lastSyncTime = getLastSyncTime(currentId);
                            const itemCreatedAt = localItem.createdAt ? new Date(localItem.createdAt).getTime() : 0;
                            const isNewLocal = itemCreatedAt >= lastSyncTime || lastSyncTime === 0 || itemCreatedAt === 0;
                            
                            if (isNewLocal) {
                                finalItems.push(localItem);
                            }
                        }
                    } else {
                        finalItems.push(localItem);
                    }
                } else if (cloudItem) {
                    const isExplicit = localNew.deletedIds && localNew.deletedIds.includes(id);
                    if (!isExplicit) {
                        finalItems.push(cloudItem);
                    }
                }
            });

            result[col] = finalItems;
        }
    });
    // Merge non-array config fields
    const currentId = window.activeTrainerId || localStorage.getItem('activeTrainerId') || 'default';
    const configFields = ['brand', 'trainerSettings', 'paymentSettings', 'fiscalData'];
    configFields.forEach(field => {
        if (localNew[field] !== undefined) {
            if (editableCols && editableCols.includes(field)) {
                result[field] = localNew[field];
            } else {
                result[field] = cloudMerged[field] !== undefined ? cloudMerged[field] : localNew[field];
            }
        }
    });

    return result;
};

let saveQueuePromise = Promise.resolve();

const saveData = (data) => {
  // Sync clients with latest feedback metrics before saving
  if (data && data.clients && data.feedbacks) {
    data.clients.forEach(client => {
      syncClientWithLatestFeedback(client, data.feedbacks);
    });
  }

  // 🛡️ BLINDAJE TOTAL: Nunca guardar datos vacíos que destruirían datos reales
  const isDataDangerous = (
    (!data.clients || data.clients.length === 0) &&
    (!data.routines || data.routines.length === 0) &&
    (!data.trainingBlocks || data.trainingBlocks.length === 0)
  );
  
  // Comprobar si hay datos reales en el local storage que no debemos perder
  const currentRaw = localStorage.getItem(getStorageKey());
  let prevData = null;
  if (currentRaw) {
    try { prevData = JSON.parse(currentRaw); } catch(e) {}
  }
  
  if (isDataDangerous && prevData) {
    const savedHasData = (
      (prevData.clients && prevData.clients.length > 0) ||
      (prevData.routines && prevData.routines.length > 0) ||
      (prevData.trainingBlocks && prevData.trainingBlocks.length > 0)
    );
    if (savedHasData) {
      console.error('🚨 [BLINDAJE] BLOQUEADO: Intento de guardar datos vacíos cuando ya existen datos reales. Protegiendo datos del usuario.');
      return; // Bloquear guardado destructivo
    }
  }

  const localPrevModified = prevData ? prevData.lastModified : null;
  const isTrainer = typeof localStorage !== 'undefined' && localStorage.getItem('_trainerAuthed') === '1';
  
  // Merge page changes with the current local storage state (to preserve other tabs' edits)
  let mergedWithLocal = data;
  if (prevData) {
      mergedWithLocal = mergeLocalEdits(data, prevData, prevData, isTrainer);
  }

  const saveTime = new Date().toISOString();
  mergedWithLocal.lastModified = saveTime;
  
  // 💾 Crear backup automático antes de guardar
  try {
    const backupKey = getStorageKey() + '_backup';
    if (currentRaw && prevData) {
      const hasRealData = (
        (prevData.clients && prevData.clients.length > 0) ||
        (prevData.routines && prevData.routines.length > 0) ||
        (prevData.trainingBlocks && prevData.trainingBlocks.length > 0)
      );
      if (hasRealData) {
        localStorage.setItem(backupKey, currentRaw);
        localStorage.setItem(backupKey + '_ts', new Date().toISOString());
      }
    }
  } catch(e) {}

  localStorage.setItem(getStorageKey(), JSON.stringify(mergedWithLocal));
  if (window.SupabaseService) {
    const currentId = window.activeTrainerId || localStorage.getItem('activeTrainerId') || 'default';
    if (currentId !== 'default') {
      // Evitar sobrescrituras accidentales por pestañas abiertas con caché local obsoleta.
      // Verificamos si la nube tiene datos más nuevos antes de subir.
      saveQueuePromise = saveQueuePromise.then(async () => {
          try {
              const cloudData = await window.SupabaseService.getTrainerData(currentId);
              if (cloudData && cloudData.lastModified) {
                  const cloudTime = new Date(cloudData.lastModified).getTime();
                  const localTime = localPrevModified ? new Date(localPrevModified).getTime() : 0;
                  
                  if (cloudTime > localTime + 2500) {
                      console.log("🔄 Se detectaron cambios externos más nuevos en la nube. Fusionando antes de subir...");
                      
                      // Temporarily restore local lastModified to localPrevModified for syncFromCloud comparison
                      const tempSaved = JSON.parse(localStorage.getItem(getStorageKey()) || '{}');
                      tempSaved.lastModified = localPrevModified;
                      localStorage.setItem(getStorageKey(), JSON.stringify(tempSaved));

                      const freshData = await window.syncFromCloud();
                      if (freshData) {
                          // Obtenemos los datos recién fusionados en local storage
                          const mergedLocal = JSON.parse(localStorage.getItem(getStorageKey()) || '{}');
                          
                          // Aplicamos de forma segura los cambios locales sobre los datos fusionados de la nube
                          const finalData = mergeLocalEdits(mergedWithLocal, mergedLocal, prevData, isTrainer);
                          finalData.lastModified = new Date().toISOString();
                          
                          localStorage.setItem(getStorageKey(), JSON.stringify(finalData));
                          await window.SupabaseService.saveTrainerData(currentId, finalData);
                          return;
                      }
                  }
              }
              await window.SupabaseService.saveTrainerData(currentId, mergedWithLocal);
          } catch (e) {
              console.warn('Supabase DB Sync Error (Safe Merge failed, fallback directly):', e);
              await window.SupabaseService.saveTrainerData(currentId, mergedWithLocal).catch(() => {});
          }
      });
    }
  }
};
window.saveData = saveData;

const getLastSyncTime = (trainerId) => {
    if (typeof localStorage === 'undefined') return 0;
    const key = 'lastSyncTimestamp_' + trainerId;
    const val = localStorage.getItem(key);
    return val ? new Date(val).getTime() : 0;
};
const setLastSyncTime = (trainerId) => {
    if (typeof localStorage === 'undefined') return;
    const key = 'lastSyncTimestamp_' + trainerId;
    localStorage.setItem(key, new Date().toISOString());
};

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
            const collections = ['clients', 'routines', 'diets', 'foods', 'media', 'feedbacks', 'appointments', 'invoices', 'trainingBlocks', 'trainingLogs', 'habits', 'supplementationTemplates'];
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

                // 🛡️ BLINDAJE: Sólo tratar como "nueva instalación" si además NO hay un backup local válido
                const backupKey = getStorageKey() + '_backup';
                const localBackupRaw = localStorage.getItem(backupKey);
                let localBackupHasData = false;
                if (localBackupRaw) {
                    try {
                        const bk = JSON.parse(localBackupRaw);
                        localBackupHasData = (bk.clients && bk.clients.length > 0) || (bk.routines && bk.routines.length > 0) || (bk.trainingBlocks && bk.trainingBlocks.length > 0);
                    } catch(e) {}
                }

                if ((isNewInstall || isLocalFreshlyInitialized) && cloudHasTrainerData && !localBackupHasData) {
                    console.log("📥 El almacenamiento local estaba vacío o es nuevo, pero la nube tiene datos. Descargando de la nube...");
                    localStorage.removeItem('isNewInstall_' + currentId);
                    // No local brand merge needed. Clean up old local keys to prevent conflicts.
                    localStorage.removeItem(`_trainerBrand_${currentId}`);
                    localStorage.removeItem('_trainerBrand');
                    localStorage.removeItem(`brand_settings_${currentId}`);
                    localStorage.removeItem('brand_settings');
                    localStorage.setItem(getStorageKey(), JSON.stringify(cloudData));
                    setLastSyncTime(currentId); // Update last sync time
                    return cloudData;
                } else if ((isNewInstall || isLocalFreshlyInitialized) && cloudHasTrainerData && localBackupHasData) {
                    // Hay backup local válido - restaurarlo en vez de tratar como nueva instalación
                    console.log("🔄 [BLINDAJE] Se detectó backup local válido. Restaurando desde backup antes de fusionar...");
                    localData = JSON.parse(localBackupRaw);
                    localStorage.setItem(getStorageKey(), localBackupRaw);
                    localStorage.removeItem('isNewInstall_' + currentId);
                }

                // 2. FUSIÓN INTELIGENTE BIDIRECCIONAL POR ROL (ENTRENADOR VS CLIENTE) Y TIMESTAMP
                const localTime = localData.lastModified ? new Date(localData.lastModified).getTime() : 0;
                const cloudTime = cloudData.lastModified ? new Date(cloudData.lastModified).getTime() : 0;
                
                const isTrainer = typeof localStorage !== 'undefined' && localStorage.getItem('_trainerAuthed') === '1';
                
                // Categorizar colecciones según autoría
                const trainerCollections = ['routines', 'diets', 'foods', 'media', 'trainingBlocks', 'supplementationTemplates', 'invoices']; // clients se maneja aparte
                const clientCollections = ['feedbacks', 'appointments', 'trainingLogs', 'habits'];

                let dataChanged = false;
                const mergedData = { ...cloudData }; // Empezamos con copia de cloud

                collections.forEach(col => {
                    const localItems = localData[col] || [];
                    const cloudItems = cloudData[col] || [];
                    
                    // Auto-assign IDs to habits if missing
                    if (col === 'habits') {
                        localItems.forEach(item => {
                            if (!item.id && item.clientId && item.date) {
                                item.id = `${item.clientId}_
${item.date}`.replace('\n', ''); // Safe compile
                            }
                        });
                        cloudItems.forEach(item => {
                            if (!item.id && item.clientId && item.date) {
                                item.id = `${item.clientId}_
${item.date}`.replace('\n', ''); // Safe compile
                            }
                        });
                    }
                    
                    const localMap = new Map(localItems.map(item => [item.id, item]));
                    const cloudMap = new Map(cloudItems.map(item => [item.id, item]));

                    const allIds = new Set([...localMap.keys(), ...cloudMap.keys()]);
                    const mergedItems = [];

                    allIds.forEach(id => {
                        if (!id) return;
                        const localItem = localMap.get(id);
                        const cloudItem = cloudMap.get(id);

                        if (col === 'clients') {
                            // COLECCIÓN HÍBRIDA 'clients': Fusión a nivel de campos para evitar pérdida de datos
                            if (localItem && cloudItem) {
                                const isDifferent = JSON.stringify(localItem) !== JSON.stringify(cloudItem);
                                if (isDifferent) {
                                    dataChanged = true;
                                    
                                    // Campos del cliente controlados por el entrenador
                                    const trainerFields = [
                                        'email', 'phone', 'gender', 'status', 'reviewDay', 'monthlyFee', 
                                        'assignedDiet', 'assignedDiets', 'publishedDiets', 'dietPublished', 'assignedRoutine', 'cardio', 'cardioUrl', 'cardioPublished', 
                                        'supplementation', 'supplementationPublished', 'supplementationUrl', 'supplementationUrlVisible', 
                                        'paymentStatus', 'paymentExpiry', 'subscriptionType', 'subscriptionAmount', 
                                        'reviewFrequency', 'reviewDaysOfMonth', 'specificReviewDate'
                                    ];
                                    
                                    // Campos controlados por el cliente
                                    const clientFields = ['profilePhoto', 'weightHistory', 'feedbacks'];

                                    const mergedClient = { ...cloudItem }; // Empezar con copia de nube

                                    if (isTrainer) {
                                        // Entrenador es el máster:
                                        // - Para campos de Entrenador: si local es más nuevo, usarlos. Si no, usar nube (por si editó en otro dispositivo).
                                        // - Para campos de Cliente: usar siempre nube (el cliente es el que actualiza).
                                        trainerFields.forEach(f => {
                                            if (localTime > cloudTime && localItem[f] !== undefined) {
                                                mergedClient[f] = localItem[f];
                                            }
                                        });
                                        clientFields.forEach(f => {
                                            if (cloudItem[f] !== undefined) {
                                                mergedClient[f] = cloudItem[f];
                                            }
                                        });
                                        
                                        // Combinar technicalData
                                        const localTech = localItem.technicalData || {};
                                        const cloudTech = cloudItem.technicalData || {};
                                        const mergedTech = { ...cloudTech };
                                        
                                        // macros y otros que ponga el entrenador
                                        const trainerTechFields = ['targetMacros', 'skinfoldsEnabled', 'skinfolds'];
                                        trainerTechFields.forEach(f => {
                                            if (localTime > cloudTime && localTech[f] !== undefined) {
                                                mergedTech[f] = localTech[f];
                                            }
                                        });
                                        
                                        // campos de ficha del cliente (edad, altura, objetivos, peso, perímetros)
                                        const clientTechFields = ['age', 'height', 'goals', 'injuries', 'allergies', 'notes', 'weight', 'waist', 'glute', 'chest', 'arm', 'leg'];
                                        clientTechFields.forEach(f => {
                                            if (localTime > cloudTime && localTech[f] !== undefined) {
                                                mergedTech[f] = localTech[f];
                                            } else if (cloudTech[f] !== undefined) {
                                                mergedTech[f] = cloudTech[f];
                                            }
                                        });
                                        mergedClient.technicalData = mergedTech;

                                    } else {
                                        // Cliente es el máster:
                                        // - Para campos de Entrenador: usar siempre la nube.
                                        // - Para campos de Cliente: si local es más nuevo, usar local. Si no, usar nube.
                                        trainerFields.forEach(f => {
                                            if (cloudItem[f] !== undefined) {
                                                mergedClient[f] = cloudItem[f];
                                            }
                                        });
                                        clientFields.forEach(f => {
                                            if (localTime > cloudTime && localItem[f] !== undefined) {
                                                mergedClient[f] = localItem[f];
                                            }
                                        });

                                        // Combinar technicalData
                                        const localTech = localItem.technicalData || {};
                                        const cloudTech = cloudItem.technicalData || {};
                                        const mergedTech = { ...cloudTech };
                                        
                                        // macros y otros que ponga el entrenador
                                        const trainerTechFields = ['targetMacros', 'skinfoldsEnabled', 'skinfolds'];
                                        trainerTechFields.forEach(f => {
                                            if (cloudTech[f] !== undefined) {
                                                mergedTech[f] = cloudTech[f];
                                            }
                                        });
                                        
                                        // campos de ficha del cliente (edad, altura, objetivos, peso, perímetros)
                                        const clientTechFields = ['age', 'height', 'goals', 'injuries', 'allergies', 'notes', 'weight', 'waist', 'glute', 'chest', 'arm', 'leg'];
                                        clientTechFields.forEach(f => {
                                            if (localTime > cloudTime && localTech[f] !== undefined) {
                                                mergedTech[f] = localTech[f];
                                            } else if (cloudTech[f] !== undefined) {
                                                mergedTech[f] = cloudTech[f];
                                            }
                                        });
                                        mergedClient.technicalData = mergedTech;
                                    }
                                    
                                    // Mantener el nombre (ambos pueden actualizarlo de forma segura)
                                    if (localTime > cloudTime && localItem.name) {
                                        mergedClient.name = localItem.name;
                                    } else if (cloudItem.name) {
                                        mergedClient.name = cloudItem.name;
                                    }

                                    mergedItems.push(mergedClient);
                                } else {
                                    mergedItems.push(cloudItem);
                                }
                            } else if (localItem) {
                                mergedItems.push(localItem);
                            } else if (cloudItem) {
                                const isExplicitlyDeleted = localData.deletedIds && localData.deletedIds.includes(cloudItem.id);
                                if (!isExplicitlyDeleted) {
                                    mergedItems.push(cloudItem);
                                } else {
                                    dataChanged = true;
                                }
                            }
                        } else if (col === 'feedbacks') {
                            // COLECCIÓN HÍBRIDA 'feedbacks': Fusión a nivel de campos para evitar pérdida de la respuesta del entrenador
                            if (localItem && cloudItem) {
                                const isDifferent = JSON.stringify(localItem) !== JSON.stringify(cloudItem);
                                if (isDifferent) {
                                    dataChanged = true;
                                    const mergedFeedback = { ...cloudItem }; // Empezar con el del cloud
                                    
                                    // Fusión inteligente del trainerResponse
                                    if (isTrainer) {
                                        // Entrenador manda en su respuesta
                                        mergedFeedback.trainerResponse = localItem.trainerResponse || cloudItem.trainerResponse || '';
                                    } else {
                                        // Cliente acepta la respuesta del entrenador desde la nube
                                        mergedFeedback.trainerResponse = cloudItem.trainerResponse || localItem.trainerResponse || '';
                                    }
                                    mergedItems.push(mergedFeedback);
                                } else {
                                    mergedItems.push(cloudItem);
                                }
                            } else if (localItem) {
                                mergedItems.push(localItem);
                            } else if (cloudItem) {
                                const isExplicitlyDeleted = localData.deletedIds && localData.deletedIds.includes(cloudItem.id);
                                if (!isExplicitlyDeleted) {
                                    mergedItems.push(cloudItem);
                                } else {
                                    dataChanged = true;
                                }
                            }
                        } else if (col === 'appointments') {
                            // COLECCIÓN HÍBRIDA 'appointments'
                            if (localItem && cloudItem) {
                                const isDifferent = JSON.stringify(localItem) !== JSON.stringify(cloudItem);
                                if (isDifferent) {
                                    dataChanged = true;
                                    const mergedAppt = { ...cloudItem }; // Empezar con el del cloud
                                    
                                    if (isTrainer) {
                                        // Entrenador es máster de status y replyNotes
                                        mergedAppt.status = localItem.status || cloudItem.status;
                                        mergedAppt.replyNotes = localItem.replyNotes || cloudItem.replyNotes;
                                        if (localItem.date && localItem.date !== cloudItem.date) mergedAppt.date = localItem.date;
                                        if (localItem.time && localItem.time !== cloudItem.time) mergedAppt.time = localItem.time;
                                    } else {
                                        // Cliente acepta la aprobación/rechazo de la nube (del entrenador)
                                        mergedAppt.status = cloudItem.status || localItem.status;
                                        mergedAppt.replyNotes = cloudItem.replyNotes || localItem.replyNotes;
                                        if (localItem.status === 'cancelled') mergedAppt.status = 'cancelled';
                                    }
                                    
                                    mergedItems.push(mergedAppt);
                                } else {
                                    mergedItems.push(cloudItem);
                                }
                            } else if (localItem) {
                                mergedItems.push(localItem);
                            } else if (cloudItem) {
                                const isExplicitlyDeleted = localData.deletedIds && localData.deletedIds.includes(cloudItem.id);
                                if (!isExplicitlyDeleted) {
                                    mergedItems.push(cloudItem);
                                } else {
                                    dataChanged = true;
                                }
                            }
                        } else if (localItem && cloudItem) {
                            const isDifferent = JSON.stringify(localItem) !== JSON.stringify(cloudItem);
                            
                            if (isDifferent) {
                                dataChanged = true;
                                
                                if (isTrainer) {
                                    // Si es Entrenador: manda él para sus colecciones. Para colecciones del Cliente manda la Nube.
                                    if (trainerCollections.includes(col)) {
                                        if (localTime > cloudTime) {
                                            mergedItems.push(localItem);
                                        } else {
                                            mergedItems.push(cloudItem);
                                        }
                                    } else {
                                        mergedItems.push(cloudItem); // Datos de cliente: siempre preferir la Nube (que tiene el envío del cliente)
                                    }
                                } else {
                                    // Si es Cliente: manda el Entrenador (la Nube) para sus colecciones. Para las del Cliente manda local.
                                    if (trainerCollections.includes(col)) {
                                        mergedItems.push(cloudItem); // Rutinas/bloques del entrenador: siempre preferir la Nube
                                    } else {
                                        if (localTime > cloudTime) {
                                            mergedItems.push(localItem);
                                        } else {
                                            mergedItems.push(cloudItem);
                                        }
                                    }
                                }
                            } else {
                                mergedItems.push(cloudItem); // Idénticos, conservamos cualquiera
                            }
                        } else if (localItem) {
                            // Solo existe localmente
                            if (isTrainer) {
                                // Si es Entrenador y fue creado localmente más recientemente que el último sync en la nube: conservarlo
                                if (trainerCollections.includes(col)) {
                                    const lastSyncTime = getLastSyncTime(currentId);
                                    const itemCreatedAt = localItem.createdAt ? new Date(localItem.createdAt).getTime() : 0;
                                    const isNewLocal = itemCreatedAt >= lastSyncTime || lastSyncTime === 0 || itemCreatedAt === 0;

                                    if (localTime > cloudTime || isNewLocal) {
                                        mergedItems.push(localItem);
                                        dataChanged = true;
                                    }
                                } else {
                                    // Si es del cliente, la nube manda (si no está en nube, el cliente lo borró)
                                    dataChanged = true;
                                }
                            } else {
                                // Si es Cliente y fue creado localmente (como sus logs, hábitos, feedbacks): conservarlo
                                if (clientCollections.includes(col)) {
                                    mergedItems.push(localItem);
                                    dataChanged = true;
                                } else {
                                    // Si es del Entrenador (como rutinas, bloques, etc.), la nube manda (si no está en nube, el coach lo borró)
                                    dataChanged = true;
                                }
                            }
                        } else if (cloudItem) {
                            // Solo existe en la nube
                            if (isTrainer) {
                                // Si es del Entrenador y no está localmente:
                                // Solo lo borramos de la nube si el ID del cloudItem está explícitamente en la lista local de deletedIds.
                                // De lo contrario (por ejemplo, si se restauró en nube o es un nuevo dispositivo), lo importamos.
                                if (trainerCollections.includes(col)) {
                                    const isExplicitlyDeleted = localData.deletedIds && localData.deletedIds.includes(cloudItem.id);
                                    if (!isExplicitlyDeleted) {
                                        mergedItems.push(cloudItem);
                                        dataChanged = true;
                                    } else {
                                        dataChanged = true;
                                    }
                                } else {
                                    // Si es del cliente (logs, hábitos, feedbacks), siempre importarlo (el cliente lo subió)
                                    mergedItems.push(cloudItem);
                                    dataChanged = true;
                                }
                            } else {
                                // Si es Cliente y no está localmente:
                                // Solo lo borramos si está en deletedIds del cliente (nunca ocurre en la práctica, pero mantenemos simetría).
                                if (trainerCollections.includes(col)) {
                                    mergedItems.push(cloudItem);
                                    dataChanged = true;
                                } else {
                                    const isExplicitlyDeleted = localData.deletedIds && localData.deletedIds.includes(cloudItem.id);
                                    if (!isExplicitlyDeleted) {
                                        mergedItems.push(cloudItem);
                                        dataChanged = true;
                                    } else {
                                        dataChanged = true;
                                    }
                                }
                            }
                        }
                    });

                    mergedData[col] = mergedItems;
                });

                // Clean up old local keys to prevent conflicts.
                localStorage.removeItem(`_trainerBrand_${currentId}`);
                localStorage.removeItem('_trainerBrand');
                localStorage.removeItem(`brand_settings_${currentId}`);
                localStorage.removeItem('brand_settings');

                if (localTime > cloudTime || dataChanged) {
                    // 🛡️ BLINDAJE TOTAL: NUNCA subir datos vacíos a la nube si la nube tenía datos reales
                    const mergedHasData = (
                        (mergedData.clients && mergedData.clients.length > 0) ||
                        (mergedData.routines && mergedData.routines.length > 0) ||
                        (mergedData.trainingBlocks && mergedData.trainingBlocks.length > 0)
                    );
                    const cloudWasEmpty = !cloudHasClients && !cloudHasRoutines && !cloudHasBlocks;
                    
                    if (!mergedHasData && !cloudWasEmpty) {
                        console.error('🚨 [BLINDAJE SYNC] BLOQUEADO: El resultado de la fusión tiene 0 datos pero la nube tenía datos. Abortando subida a la nube para proteger datos.');
                    } else {
                        console.log("📤 Sincronizando cambios locales fusionados a la nube...");
                        mergedData.lastModified = new Date().toISOString();
                        await window.SupabaseService.saveTrainerData(currentId, mergedData);
                    }
                }

                mergedData.deletedIds = [];
                localStorage.setItem(getStorageKey(), JSON.stringify(mergedData));
                setLastSyncTime(currentId); // Update last sync time
                
                // 💾 Actualizar backup con datos frescos
                const mergedHasRealData = (
                    (mergedData.clients && mergedData.clients.length > 0) ||
                    (mergedData.routines && mergedData.routines.length > 0) ||
                    (mergedData.trainingBlocks && mergedData.trainingBlocks.length > 0)
                );
                if (mergedHasRealData) {
                    try { localStorage.setItem(getStorageKey() + '_backup', JSON.stringify(mergedData)); } catch(e) {}
                }
                return mergedData;
            }

            // Clean up old local keys to prevent conflicts.
            localStorage.removeItem(`_trainerBrand_${currentId}`);
            localStorage.removeItem('_trainerBrand');
            localStorage.removeItem(`brand_settings_${currentId}`);
            localStorage.removeItem('brand_settings');
            localStorage.setItem(getStorageKey(), JSON.stringify(cloudData));
            setLastSyncTime(currentId); // Update last sync time
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
    "id": "sys-rec-merluza-patatas-huevo-v1",
    "type": "image",
    "category": "recipe",
    "title": "Merluza al Horno con Patatas y Huevo",
    "url": "img/merluza_patatas_huevo.png",
    "ingredients": "Merluza, Patatas panadera, Aguacate, Huevo Entero (1 ud L), Verdura",
    "description": "Plato completo y equilibrado de merluza al horno y patatas panadera, servido con aguacate, un huevo entero y verduras frescas al gusto."
  },
  {
    "id": "sys-rec-tostada-aguacate-cottage-v1",
    "type": "image",
    "category": "recipe",
    "title": "Tostada de Aguacate y Huevo con Cottage",
    "url": "img/tostada_aguacate_huevo.png",
    "ingredients": "Pan integral Ortiz, Queso cottage, Huevo Entero (1 ud L), Aguacate, Frutos Rojas (Mix)",
    "description": "Una deliciosa y completa tostada gourmet con base de aguacate y queso cottage cremoso, coronada con huevo entero y acompañada de un refrescante mix de frutos rojos."
  },
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
        
        // 🔥 BLINDAJE DE RECETAS: Forzar foto, título e ingredientes originales solo si no ha sido editada por el usuario
        const originalRecipe = (window.SYSTEM_RECIPES || []).find(r => r.id === m.id);
        if (originalRecipe && !m.userEdited) {
            finalItem.url = originalRecipe.url;
            finalItem.title = originalRecipe.title;
            finalItem.ingredients = originalRecipe.ingredients;
        }
        
        mediaMap.set(String(m.id), finalItem);
    });
    return Array.from(mediaMap.values()).map(item => {
        if (item.category === 'exercise' && item.muscleGroup) {
            const titleLower = (item.title || '').toLowerCase();
            const g = item.muscleGroup.toLowerCase().trim();
            if (titleLower.includes('femoral') || titleLower.includes('isquio') || titleLower.includes('rumano')) {
                item.muscleGroup = 'Isquiotibiales';
            } else if (titleLower.includes('gemelo')) {
                item.muscleGroup = 'Gemelos';
            } else if (g === 'pecho') {
                item.muscleGroup = 'Pectorales';
            } else if (g === 'espalda') {
                item.muscleGroup = 'Dorsales';
            } else if (g === 'bíceps' || g === 'biceps') {
                item.muscleGroup = 'Biceps';
            } else if (g === 'tríceps' || g === 'triceps') {
                item.muscleGroup = 'Triceps';
            } else if (g === 'core') {
                item.muscleGroup = 'Abdominales';
            } else if (g === 'piernas' || g === 'pierna' || g === 'cuadriceps') {
                item.muscleGroup = 'Cuadriceps';
            } else if (g === 'glúteos' || g === 'gluteos' || g === 'glúteo' || g === 'gluteo') {
                item.muscleGroup = 'Glúteos';
            }
        }
        return item;
    });
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
      userEdited: true, // Proteger contra sobreescrituras automáticas
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
        data.media[index] = { ...data.media[index], ...updates, userEdited: true };
    } else if (isSysItem) {
        const sysItem = (window.SYSTEM_RECIPES || []).find(m => m.id == id) || (window.SYSTEM_MEDIA || []).find(m => m.id == id);
        if (sysItem) {
            data.media.push({ ...sysItem, ...updates, id: id, userEdited: true });
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
        if (!data.deletedIds) data.deletedIds = [];
        data.deletedIds.push(id);
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
  const data = typeof getData === 'function' ? getData() : { clients: [] };
  const existingClients = data.clients || [];
  
  let code = '';
  let isUnique = false;
  let attempts = 0;
  while (!isUnique && attempts < 100) {
    attempts++;
    code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    isUnique = !existingClients.some(c => (c.accessCode || '').trim().toUpperCase() === code);
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
        assignedDiets: row[9] ? [row[9]] : [],
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
    let client = Clients.getAll().find(c => c.id == id);
    if (client) return client;

    // Fallback: Buscar en otros perfiles locales si hubo migración de ID o pérdida de caché
    console.warn("⚠️ Client not found in active profile. Running local database recovery fallback...");
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('fitnessAppData_') && !key.endsWith('_backup')) {
            const raw = localStorage.getItem(key);
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    if (parsed && parsed.clients) {
                        const found = parsed.clients.find(c => c.id == id);
                        if (found) {
                            const newTrainerId = key.replace('fitnessAppData_', '');
                            console.log(`🎉 Client found in database of trainer ${newTrainerId}. Switching active trainer context...`);
                            
                            localStorage.setItem('activeTrainerId', newTrainerId);
                            window.activeTrainerId = newTrainerId;
                            if (typeof updateActiveTrainerId === 'function') {
                                updateActiveTrainerId(newTrainerId);
                            }
                            if (window.BrandConfig) {
                                window.BrandConfig.applyTheme();
                            }
                            return found;
                        }
                    }
                } catch (jsonErr) {
                    // Ignorar errores de análisis JSON en claves corruptas (ej. backups binarios)
                }
            }
        }
    }
    return null;
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
        weight: clientData.weight ? Math.round(parseFloat(clientData.weight) * 100) / 100 : 0,
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
      assignedDiets: [],
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
      if (!data.deletedIds) data.deletedIds = [];
      data.deletedIds.push(id);
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
      days: routineData.days || [],
      weeks: routineData.weeks || [],
      goal: routineData.goal || '',
      sourceBlockId: routineData.sourceBlockId || null,
      isTemplate: routineData.isTemplate !== undefined ? routineData.isTemplate : true,
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
    if (!data.deletedIds) data.deletedIds = [];
    data.deletedIds.push(id);
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
    
    let currentCalories = dietData.calories || 0;
    let currentMacros = dietData.macros || { protein: 0, carbs: 0, fat: 0 };
    if (dietData.meals && dietData.meals.length > 0) {
      let sumCals = 0;
      let sumMacros = { protein: 0, carbs: 0, fat: 0 };
      dietData.meals.forEach(meal => {
        const option1Foods = (meal.foods || []).filter(f => !f.option || Number(f.option) === 1);
        option1Foods.forEach(food => {
          sumCals += parseFloat(food.calories || 0);
          sumMacros.protein += parseFloat(food.protein || 0);
          sumMacros.carbs += parseFloat(food.carbs || 0);
          sumMacros.fat += parseFloat(food.fat || 0);
        });
      });
      if (sumCals > 0) {
        currentCalories = Math.round(sumCals * 10) / 10;
        currentMacros = {
          protein: Math.round(sumMacros.protein * 10) / 10,
          carbs: Math.round(sumMacros.carbs * 10) / 10,
          fat: Math.round(sumMacros.fat * 10) / 10
        };
      }
    }

    const newDiet = {
      id: generateUUID(),
      name: dietData.name,
      description: dietData.description || '',
      calories: currentCalories,
      macros: currentMacros,
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
      let merged = { ...data.diets[index], ...updates };
      
      // Auto-recalculate calories and macros if meals are being updated
      if (updates.meals) {
        let sumCals = 0;
        let sumMacros = { protein: 0, carbs: 0, fat: 0 };
        (merged.meals || []).forEach(meal => {
          const option1Foods = (meal.foods || []).filter(f => !f.option || Number(f.option) === 1);
          option1Foods.forEach(food => {
            sumCals += parseFloat(food.calories || 0);
            sumMacros.protein += parseFloat(food.protein || 0);
            sumMacros.carbs += parseFloat(food.carbs || 0);
            sumMacros.fat += parseFloat(food.fat || 0);
          });
        });
        
        merged.calories = Math.round(sumCals * 10) / 10;
        merged.macros = {
          protein: Math.round(sumMacros.protein * 10) / 10,
          carbs: Math.round(sumMacros.carbs * 10) / 10,
          fat: Math.round(sumMacros.fat * 10) / 10
        };
      }
      
      data.diets[index] = merged;
      saveData(data);
      return data.diets[index];
    }
    return null;
  },

  delete: (id) => {
    const data = getData();
    data.diets = data.diets.filter(d => d.id !== id);
    if (!data.deletedIds) data.deletedIds = [];
    data.deletedIds.push(id);
    saveData(data);
  }
};

// ============================================
// FOODS CRUD
// ============================================

const SYSTEM_FOODS = [
  // PROTEINAS
  { name: "Pechuga de Pollo", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: "Pollo a la plancha", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
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
  { name: "Verdura", calories: 25, protein: 1.5, carbs: 4, fat: 0.2 },

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
  { name: "Miel / Sirope Ágave (1 cda)", calories: 60, protein: 0, carbs: 15, fat: 0, type: 'unit' },
  { name: "Crema de arroz", calories: 365, protein: 7, carbs: 82, fat: 1 },
  { name: "Corn flakes/Crema arroz/Cereales 0%", calories: 370, protein: 7, carbs: 84, fat: 1 },
  { name: "Leche vegetal", calories: 35, protein: 1, carbs: 3, fat: 1.5 },
  { name: "Chocolate Negro  85% o Coco rallado", calories: 600, protein: 8, carbs: 20, fat: 50 },
  { name: "Salmorejo", calories: 70, protein: 1, carbs: 6, fat: 4.5 },
  { name: "Tostadas tipo Ortiz", calories: 380, protein: 11, carbs: 72, fat: 4 },
  { name: "Salmón ahumado o Jamón serrano", calories: 200, protein: 25, carbs: 0.5, fat: 10 },
  { name: "Cereales de maíz (cornflakes)", calories: 380, protein: 7, carbs: 84, fat: 1 },
  { name: "Tortitas de arroz inflado", calories: 387, protein: 8, carbs: 82, fat: 2.8 },
  { name: "Pan integral Ortiz", calories: 255, protein: 9.5, carbs: 45, fat: 2.5 }
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
          name: localEdit.name || sys.name,
          type: localEdit.type || sys.type || 'g',
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
      // Si es un alimento del sistema, el entrenador puede actualizar kcal, macros, name y type
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
          name: updates.name !== undefined ? updates.name : sysFood.name,
          type: updates.type !== undefined ? updates.type : (sysFood.type || 'g'),
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
        // Si ya tenía edición local, actualizamos kcal, macros, name y type
        data.foods[index] = {
          ...data.foods[index],
          calories: updates.calories !== undefined ? updates.calories : data.foods[index].calories,
          protein: updates.protein !== undefined ? updates.protein : data.foods[index].protein,
          carbs: updates.carbs !== undefined ? updates.carbs : data.foods[index].carbs,
          fat: updates.fat !== undefined ? updates.fat : data.foods[index].fat,
          name: updates.name !== undefined ? updates.name : data.foods[index].name,
          type: updates.type !== undefined ? updates.type : data.foods[index].type
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
    if (!data.deletedIds) data.deletedIds = [];
    data.deletedIds.push(id);
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
      weight: feedbackData.weight ? Math.round(parseFloat(feedbackData.weight) * 100) / 100 : null,
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
    if (!data.deletedIds) data.deletedIds = [];
    data.deletedIds.push(id);
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
                userEdited: true,
                updatedAt: new Date().toISOString()
            });
        } else {
            // Actualizar personal
            data.media[personalIdx].url = videoUrl;
            data.media[personalIdx].muscleGroup = group;
            data.media[personalIdx].userEdited = true;
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
            userEdited: true,
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
    return (data.trainingLogs || []).filter(l => l.completed !== false);
  },

  getByClientId: (clientId) => {
    const data = getData();
    return (data.trainingLogs || []).filter(l => l.clientId == clientId && l.completed !== false);
  },

  getDraft: (clientId, routineId, dayNumber) => {
    const data = getData();
    return (data.trainingLogs || []).find(l => 
        l.clientId == clientId && 
        l.routineId === routineId && 
        l.dayNumber === dayNumber && 
        l.completed === false
    );
  },

  saveDraft: (logData) => {
    const data = getData();
    if (!data.trainingLogs) data.trainingLogs = [];
    
    // Find active block for this client
    const activeBlock = (data.trainingBlocks || []).find(b => b.clientId == logData.clientId && b.status === 'active');

    // Find if a draft already exists for this client, routine, and day
    let draft = data.trainingLogs.find(l => 
        l.clientId == logData.clientId && 
        l.routineId === logData.routineId && 
        l.dayNumber === logData.dayNumber && 
        l.completed === false
    );

    if (draft) {
        // Update existing draft
        draft.exercises = logData.exercises || [];
        draft.comment = logData.comment || '';
        draft.lastModified = new Date().toISOString();
    } else {
        // Create new draft
        draft = {
            id: generateUUID(),
            clientId: logData.clientId,
            routineId: logData.routineId,
            dayNumber: logData.dayNumber,
            blockId: activeBlock ? activeBlock.id : null,
            date: logData.date || new Date().toISOString(),
            exercises: logData.exercises || [],
            comment: logData.comment || '',
            completed: false, // Explicitly false for drafts
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
        data.trainingLogs.push(draft);
    }
    
    saveData(data);
    return draft;
  },

  create: (logData) => {
    const data = getData();
    if (!data.trainingLogs) data.trainingLogs = [];

    // Find and update the existing draft if it exists
    let existingLog = data.trainingLogs.find(l => 
        l.clientId == logData.clientId && 
        l.routineId === logData.routineId && 
        l.dayNumber === logData.dayNumber && 
        l.completed === false
    );

    if (existingLog) {
        existingLog.exercises = logData.exercises || [];
        existingLog.comment = logData.comment || '';
        existingLog.completed = true;
        existingLog.date = new Date().toISOString();
        existingLog.lastModified = new Date().toISOString();
    } else {
        const activeBlock = (data.trainingBlocks || []).find(b => b.clientId == logData.clientId && b.status === 'active');
        existingLog = {
          id: generateUUID(),
          clientId: logData.clientId,
          routineId: logData.routineId,
          dayNumber: logData.dayNumber,
          blockId: activeBlock ? activeBlock.id : null,
          date: logData.date || new Date().toISOString(),
          exercises: logData.exercises || [],
          comment: logData.comment || '',
          completed: true,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        };
        data.trainingLogs.push(existingLog);
    }

    saveData(data);
    return existingLog;
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
    return Habits.getAll().filter(h => String(h.clientId) === String(clientId));
  },

  getToday: (clientId) => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    return (Habits.getAll() || []).find(h => String(h.clientId) === String(clientId) && h.date === today);
  },

  save: (clientId, habitsData) => {
    const data = getData();
    if (!data.habits) data.habits = [];
    
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const index = data.habits.findIndex(h => String(h.clientId) === String(clientId) && h.date === today);
    
    const entry = {
      id: `${clientId}_${today}`,
      clientId: String(clientId),
      date: today,
      water: parseFloat(habitsData.water) || 0,
      steps: parseInt(habitsData.steps) || 0,
      sleep: parseFloat(habitsData.sleep) || 0,
      weight: habitsData.weight ? Math.round(parseFloat(habitsData.weight) * 100) / 100 : 0,
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
    if (!data.deletedIds) data.deletedIds = [];
    data.deletedIds.push(id);
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

const SupplementationTemplates = {
  getAll: () => {
    const data = getData();
    if (!data.supplementationTemplates) data.supplementationTemplates = [];
    return data.supplementationTemplates;
  },
  getById: (id) => {
    const data = getData();
    if (!data.supplementationTemplates) data.supplementationTemplates = [];
    return data.supplementationTemplates.find(t => t.id === id);
  },
  create: (templateData) => {
    const data = getData();
    if (!data.supplementationTemplates) data.supplementationTemplates = [];
    const newTemplate = {
      id: generateUUID(),
      name: templateData.name,
      content: templateData.content || '',
      url: templateData.url || '',
      urlVisible: templateData.urlVisible !== undefined ? templateData.urlVisible : true,
      createdAt: new Date().toISOString()
    };
    data.supplementationTemplates.push(newTemplate);
    saveData(data);
    return newTemplate;
  },
  update: (id, updates) => {
    const data = getData();
    if (!data.supplementationTemplates) data.supplementationTemplates = [];
    const index = data.supplementationTemplates.findIndex(t => t.id === id);
    if (index !== -1) {
      data.supplementationTemplates[index] = { ...data.supplementationTemplates[index], ...updates };
      saveData(data);
      return data.supplementationTemplates[index];
    }
    return null;
  },
  delete: (id) => {
    const data = getData();
    if (!data.supplementationTemplates) data.supplementationTemplates = [];
    data.supplementationTemplates = data.supplementationTemplates.filter(t => t.id !== id);
    saveData(data);
  }
};

window.SupplementationTemplates = SupplementationTemplates;
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
    
    // Check if the active trainer is Alejandra
    let isAlejandra = false;
    let isToledo = false;
    if (typeof window !== 'undefined') {
        const activeId = window.activeTrainerId || localStorage.getItem('activeTrainerId') || '';
        const trainerEmail = localStorage.getItem('_trainerEmail') || '';
        if (activeId.includes('t-w0iybl7qb') || 
            activeId.includes('t-zum04ds2n') || 
            activeId.includes('alejandra_asteam_gmail_com') ||
            (trainerEmail && (trainerEmail.toLowerCase() === 'ingenia@ingeniaia.es' || trainerEmail.toLowerCase() === 'alejandra.asteam@gmail.com'))) {
            isAlejandra = true;
        }
        if (activeId.includes('t-8umeizyns') || (trainerEmail && trainerEmail.toLowerCase() === 'vtoledonutrition@gmail.com')) {
            isToledo = true;
        }
        console.log(`[BrandConfig] activeId="${activeId}" trainerEmail="${trainerEmail}" => isAlejandra=${isAlejandra}, isToledo=${isToledo}`);
    }

    // Default brand settings
    let defaultBrand = {
        name: 'Infinite Coach',
        logo: 'img/logo-infinite-coach.png',
        configured: true,
        colors: { primary: '#00D9FF', secondary: '#1A1A2E', accent: '#FF6B6B' },
        fiscalData: { invoiceSeries: 'F' + new Date().getFullYear() }
    };

    // Instant corporate brand override for ASTeam custom domain / active trainer
    if (isAlejandra) {
        defaultBrand = {
            name: 'ASTeam',
            logo: 'https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1779724548154_Gemini_Generated_Image_vse84nvse84nvse8.png',
            configured: true,
            colors: { primary: '#fdbfec', secondary: '#1a1a2e', accent: '#ff6b6b' },
            whatsapp: '615760338',
            fiscalData: { invoiceSeries: 'FAST' + new Date().getFullYear() }
        };
    } else if (isToledo) {
        defaultBrand = {
            name: 'Toledo The Bull',
            logo: 'https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1781711106755_toledo_the_bull.png',
            configured: true,
            colors: { primary: '#E60026', secondary: '#0A0A0E', accent: '#FFFFFF', themeMode: 'dark', bgDark: '#0A0A0E' },
            fiscalData: { invoiceSeries: 'FIT-VT-' + new Date().getFullYear() }
        };
    }

    let res = data.brand || defaultBrand;
    
    // If not Alejandra, ensure ASTeam config is cleared and default Infinite Coach is returned/configured
    if (!isAlejandra) {
        if (res && (res.name === 'ASTeam' || res.logo === 'https://bieeydhacavxymoosasx.supabase.co/storage/v1/object/public/Media/1779724548154_Gemini_Generated_Image_vse84nvse84nvse8.png' || (res.colors && res.colors.primary === '#fdbfec'))) {
            res = {
                name: 'Infinite Coach',
                logo: 'img/logo-infinite-coach.png',
                configured: true,
                colors: { primary: '#00D9FF', secondary: '#1A1A2E', accent: '#FF6B6B' },
                fiscalData: { invoiceSeries: 'F' + new Date().getFullYear() }
            };
            if (typeof saveData === 'function') {
                data.brand = res;
                saveData(data);
            }
        }
    }

    if (res && (res.name === 'MyFitness' || res.name === 'Fitness App' || (res.name === 'Infinite Coach' && defaultBrand.name === 'ASTeam'))) {
        res.name = defaultBrand.name;
        res.colors = defaultBrand.colors;
        res.logo = defaultBrand.logo;
        if (defaultBrand.whatsapp) res.whatsapp = defaultBrand.whatsapp;
    }

    // Auto-correct stale or corrupted ASTeam settings in local cache (forcing correct pink logo, colors, questions, and perimeters)
    if (isAlejandra && res && (res.name === 'ASTeam' || defaultBrand.name === 'ASTeam')) {
        let changed = false;
        res.name = 'ASTeam';
        if (!res.colors || res.colors.primary === '#00d9ff' || res.colors.primary === '#00D9FF') {
            res.colors = defaultBrand.colors;
            changed = true;
        }
        if (!res.logo || res.logo === 'img/logo-infinite-coach.png') {
            res.logo = defaultBrand.logo;
            changed = true;
        }
        if (!res.whatsapp || res.whatsapp === '+34000000000') {
            res.whatsapp = defaultBrand.whatsapp;
            changed = true;
        }
        const expectedQuestions = [
            "¿Qué tal te ves fisicamente?",
            "Sensaciones sobre la dieta (mucha/poca comida, ansiedad, poco apetito...)",
            "Comida/alimento que no te haya gustado y/o quieras cambiar de la dieta actual",
            "Comida/alimento que quieras tener en tu próxima dieta a ser posible",
            "¿Has realizado algún salto de dieta para tener en cuenta?",
            "¿Qué tal han ido los entrenos? Cuéntame tus sensaciones",
            "¿Has podido entrenar los días estipulados?",
            "¿Te recuperas correctamente de los entrenos entre sesiones?",
            "Del 1 al 10, ¿Cuál ha sido tu implicación en los entrenamientos? (Intensidad, realización de todas las series...)"
        ];
        if (!res.feedbackQuestions || res.feedbackQuestions.length < 5) {
            res.feedbackQuestions = expectedQuestions;
            changed = true;
        }
        const expectedPerimeters = ["Cintura", "Cadera", "Pecho", "Brazo", "Muslo"];
        if (!res.trainerPerimeters || res.trainerPerimeters.length < 3) {
            res.trainerPerimeters = expectedPerimeters;
            changed = true;
        }

        if (changed && typeof saveData === 'function') {
            data.brand = res;
            saveData(data);
        }
    }
    let logoChanged = false;
    if (res && (!res.logo || res.logo.length < 5 || res.logo === 'img/logo-infinite-marble.png')) {
        res.logo = 'img/logo-infinite-coach.png';
        logoChanged = true;
    }
    if (logoChanged && typeof saveData === 'function') {
        data.brand = res;
        saveData(data);
    }
    return res;
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
      
      // Dynamic Theme Light/Dark Class
      const isClientPage = window.location.pathname.includes('client-') || 
                           (document.body && document.body.classList.contains('theme-client'));
      const clientTheme = isClientPage ? (localStorage.getItem('clientThemeMode') || 'default') : 'default';
      let isLight = false;
      if (clientTheme === 'light') {
          isLight = true;
      } else if (clientTheme === 'dark') {
          isLight = false;
      } else {
          isLight = brand.colors.themeMode === 'light';
      }
      document.documentElement.classList.toggle('theme-light', isLight);
      if (document.body) {
          document.body.classList.toggle('theme-light', isLight);
      }

      // Apply custom background color depending on theme mode
      const applyColorsToDom = () => {
          if (!isLight) {
              const darkBg = brand.colors.bgDark || '#0F0F1E';
              document.documentElement.style.setProperty('--bg-dark', darkBg);
              if (document.body) {
                  document.body.style.setProperty('--bg-dark', darkBg);
              }
          } else {
              const lightBg = brand.colors.bgLight || '#E2E8F0';
              document.documentElement.style.setProperty('--bg-dark', lightBg);
              if (document.body) {
                  document.body.style.setProperty('--bg-dark', lightBg);
              }
          }
      };
      applyColorsToDom();
      if (typeof document !== 'undefined' && document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', applyColorsToDom);
      }
    }

    // Dynamic Header (Logo & Name)
    const headerLogos = document.querySelectorAll('.logo-img, #brandLogo');
    const previewLogos = document.querySelectorAll('#logoPreview');
    const nameSpan = document.getElementById('brandName');
    const loginLogoContainer = document.getElementById('brandLogoContainer');
    
    // Titulo de la página dinámico si existe
    const baseTitle = document.title.split(' - ')[0]; // Tomar parte antes del guion
    
    if (brand) {
        if (loginLogoContainer) {
            const defaultLogo = 'img/logo-infinite-coach.png';
            const hasLogo = brand.logo && brand.logo.length > 5;
            const logoSrc = hasLogo ? brand.logo : defaultLogo;
            loginLogoContainer.innerHTML = `<img src="${logoSrc}" alt="${brand.name || ''}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 19px;">`;
        }

        headerLogos.forEach(logoImg => {
            const defaultLogo = 'img/logo-infinite-coach.png';
            const hasLogo = brand.logo && brand.logo.length > 5;
            const logoSrcToUse = hasLogo ? brand.logo : defaultLogo;
            logoImg.src = logoSrcToUse;
            
            logoImg.style.cssText = `display: block !important; opacity: 1 !important; visibility: visible !important; width: 40px !important; height: 40px !important; object-fit: contain !important; background: white; padding: 2px; border-radius: 6px; flex-shrink: 0;`;
            
            logoImg.onerror = () => {
                if (!logoImg.dataset.fallbackApplied) {
                    logoImg.dataset.fallbackApplied = '1';
                    console.warn("Logo failed to load, falling back to default:", logoImg.src);
                    logoImg.src = defaultLogo;
                    logoImg.style.cssText = `display: block !important; opacity: 1 !important; visibility: visible !important; width: 40px !important; height: 40px !important; object-fit: contain !important; background: white; padding: 2px; border-radius: 6px; flex-shrink: 0;`;
                }
            };
        });

        previewLogos.forEach(logoImg => {
            if (brand.logo && brand.logo.length > 5) {
                logoImg.src = brand.logo;
                logoImg.style.cssText = `display: block !important; opacity: 1 !important; visibility: visible !important; max-width: 150px !important; max-height: 150px !important; object-fit: contain !important; background: white; padding: 10px; border-radius: 4px;`;
            } else {
                logoImg.src = 'img/logo-infinite-coach.png';
                logoImg.style.cssText = `max-width: 150px !important; max-height: 150px !important; object-fit: contain !important; background: white; padding: 10px;`;
            }
        });
        
        if (nameSpan) {
            nameSpan.textContent = brand.name || 'Infinite Coach';
            nameSpan.style.color = brand.colors?.primary || '#00D9FF';
            nameSpan.style.fontWeight = '800';
        }
        
        // Actualizar título de la ventana y meta de iOS Home Screen
        if (brand.name) {
            document.title = `${baseTitle} - ${brand.name}`;
            
            // Dynamic iOS Mobile Web App Title
            try {
                let appleTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]');
                if (!appleTitleMeta) {
                    appleTitleMeta = document.createElement('meta');
                    appleTitleMeta.name = 'apple-mobile-web-app-title';
                    document.head.appendChild(appleTitleMeta);
                }
                appleTitleMeta.content = brand.name;
            } catch (e) {
                console.warn("Could not set apple-mobile-web-app-title:", e);
            }
        }
        
        // Favicon PWA
        let absoluteLogo = '';
        try {
            const defaultLogo = 'img/logo-infinite-coach.png';
            const currentLogo = (brand && brand.logo && brand.logo.length > 5) ? brand.logo : defaultLogo;
            absoluteLogo = currentLogo.startsWith('http') || currentLogo.startsWith('data:')
                ? currentLogo
                : new URL(currentLogo, window.location.origin).href;
            
            const finalLogoUrl = absoluteLogo.startsWith('data:') 
                ? absoluteLogo 
                : absoluteLogo + (absoluteLogo.includes('?') ? '&' : '?') + 'v=' + new Date().getTime();

            document.querySelectorAll('link[rel*="icon"]').forEach(el => el.remove());

            const shortcut = document.createElement('link');
            shortcut.rel = 'shortcut icon';
            shortcut.type = 'image/png';
            shortcut.href = finalLogoUrl;
            document.head.appendChild(shortcut);

            const icon = document.createElement('link');
            icon.rel = 'icon';
            icon.type = 'image/png';
            icon.href = finalLogoUrl;
            document.head.appendChild(icon);

            let appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
            if (!appleIcon) {
                appleIcon = document.createElement('link');
                appleIcon.rel = 'apple-touch-icon';
                document.head.appendChild(appleIcon);
            }
            appleIcon.href = absoluteLogo;
        } catch(e) {}

        // Apuntar al manifest.json dinámico usando la URL de la API de Next.js
        try {
            let manifestLink = document.querySelector('link[rel="manifest"]');
            if (manifestLink) {
                const activeId = window.activeTrainerId || localStorage.getItem('activeTrainerId') || 'default';
                manifestLink.href = 'manifest.json?t=' + encodeURIComponent(activeId);
            }
        } catch (e) {
            console.warn("Could not set dynamic manifest URL:", e);
        }
    }
  }
};

window.BrandConfig = BrandConfig;
console.log("🏁 v311 BLINDAJE TOTAL: Sistema Cargado con protección máxima de datos.");

// ============================================
// 🛡️ RECUPERACIÓN DE EMERGENCIA
// Si los datos locales están vacíos pero existe un backup, restaurar automáticamente
// ============================================
(async () => {
    try {
        const currentId = window.activeTrainerId || localStorage.getItem('activeTrainerId') || 'default';
        if (currentId === 'default') return;
        
        const mainKey = getStorageKey();
        const backupKey = mainKey + '_backup';
        
        const mainRaw = localStorage.getItem(mainKey);
        const backupRaw = localStorage.getItem(backupKey);
        
        if (!backupRaw) return;
        
        let mainHasData = false;
        if (mainRaw) {
            try {
                const m = JSON.parse(mainRaw);
                mainHasData = (m.clients && m.clients.length > 0) || (m.routines && m.routines.length > 0) || (m.trainingBlocks && m.trainingBlocks.length > 0);
            } catch(e) {}
        }
        
        if (!mainHasData) {
            try {
                const bk = JSON.parse(backupRaw);
                const backupHasData = (bk.clients && bk.clients.length > 0) || (bk.routines && bk.routines.length > 0) || (bk.trainingBlocks && bk.trainingBlocks.length > 0);
                
                if (backupHasData) {
                    console.log('🔄 [RECUPERACIÓN] Se detectaron datos vacíos pero existe un backup válido. Restaurando...');
                    localStorage.setItem(mainKey, backupRaw);
                    console.log('✅ [RECUPERACIÓN] Datos restaurados desde backup local.');
                    // También intentar recuperar desde la nube para tener los más recientes
                    if (window.SupabaseService) {
                        window.syncFromCloud && window.syncFromCloud().catch(() => {});
                    }
                }
            } catch(e) {}
        }
    } catch(e) {}
})();

// ============================================
// AUTOMATIC CLOUD SYNC & AUTO-REFRESH UTILITY
// ============================================
(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    let isSyncing = false;
    let lastSyncTime = Date.now();

    async function triggerAutomaticSync() {
        if (isSyncing) return;
        
        // Prevent syncing too frequently (debounce to max once every 10 seconds)
        if (Date.now() - lastSyncTime < 10000) return;
        
        const currentId = window.activeTrainerId || localStorage.getItem('activeTrainerId') || 'default';
        if (currentId === 'default' || !window.SupabaseService || !window.syncFromCloud) return;

        isSyncing = true;
        try {
            console.log("🔄 [AutoSync] Iniciando sincronización automática en segundo plano...");
            const prevDataStr = localStorage.getItem(getStorageKey());
            
            const freshData = await window.syncFromCloud();
            lastSyncTime = Date.now();

            if (freshData) {
                const freshDataStr = localStorage.getItem(getStorageKey());
                let actualChange = false;
                
                if (prevDataStr !== freshDataStr) {
                    try {
                        const prevObj = JSON.parse(prevDataStr || '{}');
                        const freshObj = JSON.parse(freshDataStr || '{}');
                        const collections = ['clients', 'routines', 'diets', 'foods', 'media', 'feedbacks', 'appointments', 'invoices', 'trainingBlocks', 'trainingLogs', 'habits', 'supplementationTemplates'];
                        for (const col of collections) {
                            if (JSON.stringify(prevObj[col] || []) !== JSON.stringify(freshObj[col] || [])) {
                                actualChange = true;
                                break;
                            }
                        }
                        if (JSON.stringify(prevObj.brand || {}) !== JSON.stringify(freshObj.brand || {})) {
                            actualChange = true;
                        }
                    } catch (err) {
                        actualChange = true;
                    }
                }

                if (actualChange) {
                    console.log("🔔 [AutoSync] Se detectaron nuevos datos reales desde la nube. Actualizando interfaz...");

                    // Comprobar si el usuario está escribiendo para no interrumpir su flujo
                    const activeElement = document.activeElement;
                    const isUserTyping = activeElement && (
                        activeElement.tagName === 'INPUT' || 
                        activeElement.tagName === 'TEXTAREA' || 
                        activeElement.isContentEditable
                    );

                    if (!isUserTyping) {
                        // Si existe un inicializador global de página, lo llamamos para actualizar la UI suavemente
                        if (typeof window.initializeApp === 'function') {
                            console.log("⚡ [AutoSync] Re-ejecutando initializeApp() para refrescar la UI sin recargar la página.");
                            try {
                                await window.initializeApp();
                                return; // Éxito en recarga suave
                            } catch (err) {
                                console.warn("Error re-running initializeApp:", err);
                            }
                        }

                        // Evitamos recargar automáticamente la página para no perder el estado o progreso de edición
                        const isTrainerPage = typeof window !== 'undefined' && window.location.pathname.includes('trainer-');
                        if (isTrainerPage) {
                            console.log("⚡ [AutoSync] Se detectaron cambios en la nube, pero evitamos recargar automáticamente la página del entrenador.");
                            if (typeof showToast === 'function' && !window._hasShownNewDataToast) {
                                showToast('Nuevos datos disponibles de la nube. Por favor, recarga la página para ver las actualizaciones.', 'info');
                                window._hasShownNewDataToast = true;
                            }
                        } else {
                            console.log("⚡ [AutoSync] Se detectaron cambios en la nube, pero evitamos recargar automáticamente la página del cliente.");
                            if (typeof showToast === 'function' && !window._hasShownNewDataToast) {
                                showToast('Tu entrenador ha actualizado tus planes. Por favor, recarga la página para ver los cambios.', 'info');
                                window._hasShownNewDataToast = true;
                            }
                        }
                    } else {
                        console.log("✍️ [AutoSync] El usuario está escribiendo o editando. Sincronización guardada en caché local, se actualizará al terminar o cambiar de vista.");
                    }
                } else {
                    console.log("➡️ [AutoSync] Sincronización completada. No hay cambios nuevos o reales en la nube.");
                }
            }
        } catch (e) {
            console.warn("[AutoSync] Error en sincronización de fondo:", e);
        } finally {
            isSyncing = false;
        }
    }

    // 1. Escuchar cuando el usuario regresa a la app (cambio de pestaña, desbloqueo de móvil)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            console.log("📱 [AutoSync] App visible de nuevo. Ejecutando sincronización...");
            triggerAutomaticSync();
        }
    });

    window.addEventListener('focus', () => {
        console.log("🖥️ [AutoSync] Foco recuperado en la ventana. Ejecutando sincronización...");
        triggerAutomaticSync();
    });

    // 2. Ejecutar de forma periódica cada 30 segundos mientras la app esté activa y en primer plano
    setInterval(() => {
        if (document.visibilityState === 'visible') {
            triggerAutomaticSync();
        }
    }, 30000);
})();