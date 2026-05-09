// ============================================
// DATA MODELS & STORAGE MANAGEMENT
// ============================================

const DB_VERSION = '1.0.1';
const PLATFORM_KEY = 'saasFitnessPlatform';
let activeTrainerId = localStorage.getItem('activeTrainerId') || 'default';
const getStorageKey = () => `fitnessAppData_${window.activeTrainerId || localStorage.getItem('activeTrainerId') || 'default'}`;

/**
 * Update the storage key when the trainer ID changes
 */
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

/**
 * Check if the active trainer has an active subscription
 * Only for SaaS model (trainers using the platform)
 */
const checkTrainerSubscription = () => {
  const currentTrainerId = window.activeTrainerId || localStorage.getItem('activeTrainerId') || 'default';
  if (currentTrainerId === 'default') return true; 
  
  const platform = JSON.parse(localStorage.getItem(PLATFORM_KEY) || '{"trainers":[]}');
  const trainer = platform.trainers.find(t => t.id === currentTrainerId);
  
  if (!trainer) return true; // Safety fallback for new trainers until synced

  // Validar Estado y Fecha de Expiración
  const now = new Date();
  let isExpired = false;
  
  if (trainer.expiryDate && trainer.planPrice !== 0) {
      // Parsear fecha DD/MM/YYYY
      const parts = trainer.expiryDate.split('/');
      if (parts.length === 3) {
          const expiry = new Date(parts[2], parts[1] - 1, parts[0]);
          if (now > expiry) isExpired = true;
      }
  }

  if (trainer.status !== 'active' || isExpired) {
    // Redirect to subscription portal (avoid loop)
    const isPayPage = window.location.href.includes('trainer-subscription.html') || 
                      window.location.href.includes('admin-dashboard.html') ||
                      window.location.href.includes('subscription-success.html');
                      
    if (!isPayPage) {
        window.location.href = 'trainer-subscription.html';
    }
    return false;
  }
  return true;
};

// Initialize database structure
const initDatabase = () => {
  const existingData = localStorage.getItem(getStorageKey());
  if (!existingData) {
    const initialData = {
      version: DB_VERSION,
      brand: null,
      clients: [],
      routines: [],
      diets: [],
      foods: [],
      media: [],
      appointments: [],
      feedbacks: [],
      invoices: []
    };
    localStorage.setItem(getStorageKey(), JSON.stringify(initialData));
    return initialData;
  }
  return JSON.parse(existingData);
};

// Get all data
const getData = () => {
  const sKey = getStorageKey();
  const raw = localStorage.getItem(sKey);
  if (!raw) return initDatabase();

  try {
    const data = JSON.parse(raw);
    
    // 🛠 MIGRACION FIX IMAGENES V129
    if (data.media && Array.isArray(data.media)) {
        const correctUrls = {
            'sys-br-13-v6': 'img/bagel-pavo-pro.jpg',
            'sys-br-14-v6': 'img/hummus-toast-pro.jpg',
            'sys-br-15-v6': 'img/bowl-antiox-pro.jpg',
            'sys-br-16-v6': 'img/muffins-huevo-pro.jpg',
            'sys-br-18-v6': 'img/sandwich-atun-pro.jpg',
            'sys-br-19-v6': 'img/copa-requeson-miel-pro.jpg',
            'sys-br-20-v6': 'img/smoothie-verde-pro.jpg',
            'sys-lun-1': 'img/pollo_batata_pure_marble_1778321020797.png',
            'sys-lun-2': 'img/pasta_bolonesa_pure_marble_1778321465389.png',
            'sys-lun-4': 'img/ensalada_pasta_lentejas.png'
        };
        let changedMedia = false;
        data.media.forEach(m => {
            if (correctUrls[m.id] && m.url !== correctUrls[m.id]) {
                m.url = correctUrls[m.id];
                changedMedia = true;
            }
        });
        if (changedMedia) {
            localStorage.setItem(sKey, JSON.stringify(data));
        }
    }

    // 🔥 LIMPIEZA DE MEDIA CORRUPTA (Segura)
    if (data.media && Array.isArray(data.media)) {
        data.media = data.media.filter(m => {
            // Solo eliminamos si es un string literal de error de objeto o si no tiene URL absoluta/base64
            if (!m.url || typeof m.url !== 'string') return false;
            if (m.url.includes('[object Object]')) return false;
            return true;
        });
    }

    const defaults = {
      version: DB_VERSION,
      brand: null,
      clients: [],
      routines: [],
      diets: [],
      foods: [],
      media: [],
      appointments: [],
      feedbacks: [],
      invoices: []
    };
    return { ...defaults, ...data };
  } catch (e) {
    return initDatabase();
  }
};

// Save all data
const saveData = (data) => {
  try {
    const currentId = window.activeTrainerId || localStorage.getItem('activeTrainerId') || 'default';
    const sKey = getStorageKey();
    localStorage.setItem(sKey, JSON.stringify(data));
    
    // 🔥 PROFESIONAL CLOUD SYNC (Supabase is now Primary)
    if (window.SupabaseService && currentId !== 'default') {
      window.SupabaseService.saveTrainerData(currentId, data)
        .then(() => console.log(`Supabase Sync (${currentId}): OK ✅`))
        .catch(err => console.error("Supabase Sync Error:", err));
    }

    // Secondary Sync (Firebase - Deprecating but keeping as backup)
    if (window.FirebaseService && window.FirebaseService.isReady && currentId !== 'default') {
      window.FirebaseService.saveData('trainerData', currentId, data)
        .catch(err => console.error("Firebase Backup Error:", err));
    }
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      alert("⚠️ Error: El logo es demasiado grande para el almacenamiento local. Intenta usar uno más pequeño (< 1MB) o espera a que suba a la nube.");
    }
    console.error("Critical saveData Error:", e);
  }
};

/**
 * Force Sync from Cloud (Used on login or manual refresh)
 * Uses smart merge: keeps entries from both local and cloud by ID,
 * so locally-created data is never lost if the cloud is behind.
 */
const syncFromCloud = async () => {
  const currentId = window.activeTrainerId || localStorage.getItem('activeTrainerId') || 'default';
  if (currentId === 'default') return null;

  console.log("Iniciando sincronización profesional con Supabase para:", currentId);

  try {
    // 1. Intentar Supabase primero (Prioridad 1)
    let cloudData = null;
    if (window.SupabaseService) {
        cloudData = await window.SupabaseService.getTrainerData(currentId);
    }

    // 2. Firebase Legacy como fallback
    if (!cloudData && window.FirebaseService && window.FirebaseService.isReady) {
        console.log("Datos no hallados en Supabase, buscando en Firebase Legacy...");
        cloudData = await window.FirebaseService.getData('trainerData', currentId);
    }

    if (cloudData) {
        const localData = getData();

        /**
         * Smart merge: combines two arrays by ID.
         * Local entries take priority over cloud entries with the same ID.
         * This ensures newly created local data is never overwritten by stale cloud data.
         */
        const mergeArrayById = (cloudArr, localArr) => {
            const map = new Map();
            // First, put cloud data in
            (cloudArr || []).forEach(item => map.set(String(item.id), item));
            // Then local data OVERWRITES cloud (local is always more recent)
            (localArr || []).forEach(item => map.set(String(item.id), item));
            return Array.from(map.values());
        };

        const merged = { ...cloudData };
        
        // Smart-merge all key collections
        merged.clients     = mergeArrayById(cloudData.clients,     localData.clients);
        merged.diets       = mergeArrayById(cloudData.diets,       localData.diets);
        merged.routines    = mergeArrayById(cloudData.routines,    localData.routines);
        merged.foods       = mergeArrayById(cloudData.foods,       localData.foods);
        merged.media       = mergeArrayById(cloudData.media,       localData.media);
        merged.appointments= mergeArrayById(cloudData.appointments,localData.appointments);
        merged.feedbacks   = mergeArrayById(cloudData.feedbacks,   localData.feedbacks);
        merged.invoices    = mergeArrayById(cloudData.invoices,    localData.invoices);

        // Mantener marca local si la nube está vacía
        const cloudHasBrand = cloudData.brand && (cloudData.brand.name || cloudData.brand.logo);
        if (!cloudHasBrand && localData.brand) {
            merged.brand = localData.brand;
        } else if (cloudHasBrand) {
            merged.brand = cloudData.brand; // Nube tiene prioridad en la marca (configuraciones globales)
        }
        
        localStorage.setItem(getStorageKey(), JSON.stringify(merged));
        console.log("Sincronización inteligente completada ✅ - Clientes locales preservados:", merged.clients.length);
        
        // Re-upload merged data to cloud to ensure it's up to date
        if (window.SupabaseService) {
            window.SupabaseService.saveTrainerData(currentId, merged)
                .then(() => console.log("Merged data re-uploaded to cloud ✅"))
                .catch(err => console.warn("Re-upload warning:", err));
        }
        
        return merged;
    }
  } catch (e) {
    console.error("Error en sync de nube:", e);
  }
  return null;
};
window.syncFromCloud = syncFromCloud;

// Generate UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// ============================================
// BRAND CONFIGURATION
// ============================================

const BrandConfig = {
  get: () => {
    const data = getData();
    return data.brand || {
        name: 'Infinite Coach',
        configured: true,
        colors: { primary: '#00D9FF', secondary: '#1A1A2E', accent: '#FF6B6B' },
        fiscalData: { invoiceSeries: 'F' + new Date().getFullYear() }
    };
  },

  set: (brandData) => {
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
    const brand = BrandConfig.get();
    return brand && brand.configured;
  },

  applyTheme: () => {
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
    const logos = document.querySelectorAll('.logo-img, #brandLogo, #logoPreview');
    const nameSpan = document.getElementById('brandName');
    
    // Titulo de la página dinámico si existe
    const baseTitle = document.title.split(' - ')[0]; // Tomar parte antes del guion
    
    if (brand) {
        logos.forEach(logoImg => {
            if (brand.logo && brand.logo.length > 5) {
                // Ensure cloud images load correctly
                logoImg.src = brand.logo;
                
                // Si es logo de cabecera, asegurar visibilidad sobre fondo oscuro
                const isHeaderLogo = logoImg.id === 'brandLogo' || logoImg.classList.contains('logo-img');
                const extraStyles = isHeaderLogo ? "background: white; padding: 2px; border-radius: 4px;" : "";
                
                logoImg.style.cssText = `display: block !important; opacity: 1 !important; visibility: visible !important; min-height: 40px !important; width: auto !important; ${extraStyles}`;
                
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
        
        if (nameSpan) {
            nameSpan.textContent = brand.name || 'Fitness App';
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
    const masterLink = document.getElementById('masterLink');
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

// ============================================
// CLIENTS CRUD
// ============================================

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
    return data.clients;
  },

  getById: (id) => {
    const data = getData();
    return data.clients.find(c => c.id == id);
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

const Foods = {
  getAll: () => {
    const data = getData();
    return data.foods || [];
  },

  getById: (id) => {
    const data = getData();
    return (data.foods || []).find(f => f.id === id);
  },

  create: (foodData) => {
    const data = getData();
    if (!data.foods) data.foods = [];
    const newFood = {
      id: generateUUID(),
      name: foodData.name,
      calories: foodData.calories || 0,
      protein: foodData.protein || 0,
      carbs: foodData.carbs || 0,
      fat: foodData.fat || 0,
      type: foodData.type || 'g', // 'g' for grams (100g base), 'unit' for unit base
      createdAt: new Date().toISOString()
    };
    data.foods.push(newFood);
    saveData(data);
    return newFood;
  },

  update: (id, updates) => {
    const data = getData();
    if (!data.foods) data.foods = [];
    const index = data.foods.findIndex(f => f.id == id);
    if (index !== -1) {
      data.foods[index] = { ...data.foods[index], ...updates };
      saveData(data);
      return data.foods[index];
    }
    return null;
  },

  delete: (id) => {
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

// ============================================
// SYSTEM TEMPLATES (Shared by all trainers)
// ============================================
const SYSTEM_MEDIA = [
  // --- DESAYUNOS (1-35) ---
  { id: 'sys-br-1-v6', type: 'image', category: 'recipe', title: 'Porridge Pro', description: 'Desayuno energético con carbohidratos complejos y proteína.', ingredients: 'Avena, proteína en polvo, crema de cacahuete', url: 'img/pudding.png', isSystem: true },
  { id: 'sys-br-2-v6', type: 'image', category: 'recipe', title: 'Tostada Mediterránea', description: 'Grasas saludables y proteína de alto valor biológico.', ingredients: 'Pan integral, huevo poché, aceite de oliva', url: 'img/mediterranea.png', isSystem: true },
  { id: 'sys-br-3-v6', type: 'image', category: 'recipe', title: 'Yogur Energy', description: 'Equilibrio perfecto entre lácteos, cereales y fruta.', ingredients: 'Yogur griego, granola casera, arándanos', url: 'img/skyr.png', isSystem: true },
  { id: 'sys-br-4-v6', type: 'image', category: 'recipe', title: 'Omelette Fit', description: 'Desayuno bajo en carbos y alto en fibra vegetal.', ingredients: 'Huevos, espinacas, champiñones, rebanada de pan de centeno', url: 'img/skillet-patata-pro.png', isSystem: true },
  { id: 'sys-br-5-v6', type: 'image', category: 'recipe', title: 'Batido de Avena y Plátano', description: 'Ideal para antes o después de entrenar.', ingredients: 'Leche de soja, plátano, avena, semillas de lino', url: 'img/smoothie.png', isSystem: true },
  { id: 'sys-br-6-v6', type: 'image', category: 'recipe', title: 'Pancakes de Requesón', description: 'Tortitas altas en proteína y bajas en grasa.', ingredients: 'Claras de huevo, requesón, harina de avena, nueces', url: 'img/pancakes-requeson-pro.png', isSystem: true },
  { id: 'sys-br-7-v6', type: 'image', category: 'recipe', title: 'Bowl Tropical', description: 'Frescura y probióticos para empezar el día.', ingredients: 'Kéfir, mango, coco rallado', url: 'img/tropical.png', isSystem: true },
  { id: 'sys-br-8-v6', type: 'image', category: 'recipe', title: 'Tostada de Salmón', description: 'Omega-3 y carbohidratos de gramo completo.', ingredients: 'Pan de espelta, salmón ahumado, aguacate', url: 'img/salmon.png', isSystem: true },
  { id: 'sys-br-9-v6', type: 'image', category: 'recipe', title: 'Manzana y Proteína', description: 'Bajo en calorías y muy saciante.', ingredients: 'Manzana o pera, queso fresco batido 0%, almendras', url: 'img/fruta-queso-pro.png', isSystem: true },
  { id: 'sys-br-10-v6', type: 'image', category: 'recipe', title: 'Breakfast Burrito', description: 'Versión saludable del clásico burrito.', ingredients: 'Tortilla de trigo integral, huevos revueltos, rodajas de aguacate', url: 'img/burrito.png', isSystem: true },
  { id: 'sys-br-11-v6', type: 'image', category: 'recipe', title: 'Chia Pudding con Fruta', description: 'Alto contenido en fibra y grasas buenas.', ingredients: 'Semillas de chía, leche desnatada, fresas', url: 'img/chia.png', isSystem: true },
  { id: 'sys-br-12-v6', type: 'image', category: 'recipe', title: 'Tortitas de Arroz Pack', description: 'Alternativa rápida y nutritiva.', ingredients: 'Tortitas de arroz, pavo, queso crema', url: 'img/tortitas-avena-pro.png', isSystem: true },
  { id: 'sys-br-13-v6', type: 'image', category: 'recipe', title: 'Bagel de Pavo', description: 'Proteína magra en formato divertido.', ingredients: 'Bagel integral, pechuga de pavo, queso crema light', url: 'img/bagel-pavo-pro.jpg', isSystem: true },
  { id: 'sys-br-14-v6', type: 'image', category: 'recipe', title: 'Hummus Toast', description: 'Proteína vegetal y carbohidratos lentos.', ingredients: 'Pan integral, hummus, huevo cocido', url: 'img/hummus-toast-pro.jpg', isSystem: true },
  { id: 'sys-br-15-v6', type: 'image', category: 'recipe', title: 'Bowl Antiox', description: 'Súper alimentos para la recuperación.', ingredients: 'Yogur natural, frambuesas, semillas de calabaza', url: 'img/bowl-antiox-pro.jpg', isSystem: true },
  { id: 'sys-br-16-v6', type: 'image', category: 'recipe', title: 'Muffins de Huevo', description: 'Formato "to-go" para desayunos rápidos.', ingredients: 'Huevos, pavo picado, verduras, patata asada picada', url: 'img/muffins-huevo-pro.jpg', isSystem: true },
  { id: 'sys-br-17-v6', type: 'image', category: 'recipe', title: 'Tofu Scramble', description: 'Opción 100% vegetal rica en proteína.', ingredients: 'Tofu firme, cúrcuma, tostada de pan de masa madre', url: 'img/tofu_verduras.png', isSystem: true },
  { id: 'sys-br-18-v6', type: 'image', category: 'recipe', title: 'Sandwich de Atún', description: 'Clásico rico en selenio y omega-3.', ingredients: 'Pan integral, atún al natural, mayonesa ligera o aguacate', url: 'img/sandwich-atun-pro.jpg', isSystem: true },
  { id: 'sys-br-19-v6', type: 'image', category: 'recipe', title: 'Copa de Requesón y Miel', description: 'Postre de desayuno dulce y nutritivo.', ingredients: 'Requesón, miel, pistachos', url: 'img/copa-requeson-miel-pro.jpg', isSystem: true },
  { id: 'sys-br-20-v6', type: 'image', category: 'recipe', title: 'Smoothie Bowl Verde', description: 'Shot de vitaminas y minerales.', ingredients: 'Espinacas, proteína de vainilla, manzana, semillas de chía', url: 'img/smoothie-verde-pro.jpg', isSystem: true },

  // --- ALMUERZOS Y CENAS (36-85) ---
  { id: 'sys-lun-1', type: 'image', category: 'recipe', title: 'Pollo con Batata', description: 'Combinación estrella del fitness.', ingredients: 'Pechuga de pollo, batata asada, aceite de oliva', url: 'img/pollo_batata_pure_marble_1778321020797.png', isSystem: true },
  { id: 'sys-lun-2', type: 'image', category: 'recipe', title: 'Pasta Integral Boloñesa', description: 'Energía sostenida y reconstrucción muscular.', ingredients: 'Pasta integral, carne picada de ternera magra, sofrito con aceite', url: 'img/pasta_bolonesa_pure_marble_1778321465389.png', isSystem: true },
  { id: 'sys-lun-3', type: 'image', category: 'recipe', title: 'Salmón con Quinoa', description: 'Rico en Omega-3 y aminoácidos.', ingredients: 'Salmón, quinoa, espárragos al vapor', url: 'img/salmon_papillote.png', isSystem: true },
  { id: 'sys-lun-4', type: 'image', category: 'recipe', title: 'Ensalada de Garbanzos', description: 'Legumbres rápidas y ricas en proteína.', ingredients: 'Garbanzos, atún, aceitunas', url: 'img/ensalada-garbanzos-pro.png', isSystem: true },
  { id: 'sys-lun-5', type: 'image', category: 'recipe', title: 'Tacos de Ternera', description: 'Disfruta de la comida mexicana de forma saludable.', ingredients: 'Tortillas de maíz, tiras de ternera, guacamole', url: 'img/fajitas-pavo-pro.png', isSystem: true },
  { id: 'sys-lun-6', type: 'image', category: 'recipe', title: 'Poke de Atún', description: 'Inspiración hawaiana equilibrada.', ingredients: 'Arroz integral, atún fresco, edamame, aliño de sésamo', url: 'img/sushi-fit-pro.png', isSystem: true },
  { id: 'sys-lun-7', type: 'image', category: 'recipe', title: 'Lentejas con Arroz', description: 'Proteína vegetal completa.', ingredients: 'Lentejas, arroz integral, chorrito de aceite de oliva', url: 'img/lentejas-arroz-pro.png', isSystem: true },
  { id: 'sys-lun-8', type: 'image', category: 'recipe', title: 'Pavo con Arroz Jazmín', description: 'Poca grasa y digestión rápida.', ingredients: 'Solomillo de pavo, arroz jazmín, almendras laminadas', url: 'img/pavo-pro.png', isSystem: true },
  { id: 'sys-lun-9', type: 'image', category: 'recipe', title: 'Berenjena Rellena', description: 'Verduras con aporte proteico.', ingredients: 'Berenjena, carne de pavo, tomate, queso gratinado', url: 'img/berenjena-rellena-pro.png', isSystem: true },
  { id: 'sys-lun-10', type: 'image', category: 'recipe', title: 'Ensalada de Pasta de Lentejas', description: 'Pasta rica en hierro y fibra.', ingredients: 'Pasta de lentejas, cherries, pesto', url: 'img/ensalada_pasta_lentejas.png', isSystem: true },
  { id: 'sys-lun-11', type: 'image', category: 'recipe', title: 'Merluza al Horno', description: 'Pescado blanco suave y ligero.', ingredients: 'Merluza, patatas panadera, aceite de oliva', url: 'img/merluza-patatas-pro.png', isSystem: true },
  { id: 'sys-lun-12', type: 'image', category: 'recipe', title: 'Wok de Pollo y Fideos', description: 'Estilo asiático saludable.', ingredients: 'Pollo, fideos de arroz, brócoli, cacahuetes', url: 'img/wok-pollo-pro.png', isSystem: true },
  { id: 'sys-lun-13-v2', type: 'image', category: 'recipe', title: 'Bowl de Falafel', description: 'Sabores de oriente medio.', ingredients: 'Falafel horneado, hummus, ensalada variada', url: 'img/falafel.png', isSystem: true },
  { id: 'sys-lun-14', type: 'image', category: 'recipe', title: 'Hamburguesa Fit', description: 'Clásico adaptado a tus macros.', ingredients: 'Pan integral, hamburguesa de pollo, loncha de queso havarti', url: 'img/hamburguesa-lentejas-pro.png', isSystem: true },
  { id: 'sys-lun-15', type: 'image', category: 'recipe', title: 'Albóndigas de Pollo', description: 'Bolas de proteína magra en salsa de tomate natural.', ingredients: 'Pechuga picada, tomate natural, pasta integral', url: 'img/albondigas-pollo-pro.png', isSystem: true },
  { id: 'sys-lun-16', type: 'image', category: 'recipe', title: 'Risotto Fit de Setas', description: 'Cremosidad sin exceso de grasas.', ingredients: 'Arroz integral, champiñones, pavo, parmesano light', url: 'img/pollo_arroz_almendras.png', isSystem: true },
  { id: 'sys-lun-17', type: 'image', category: 'recipe', title: 'Pizza de Base de Coliflor', description: 'La pizza que encaja en cualquier dieta.', ingredients: 'Coliflor, claras, atún, queso light, tomate', url: 'img/pizza-coliflor-pro.png', isSystem: true },
  { id: 'sys-lun-18', type: 'image', category: 'recipe', title: 'Ternera con Brócoli', description: 'Salteado rápido estilo oriental.', ingredients: 'Tiras de ternera, brócoli, salsa de soja baja en sodio', url: 'img/ternera_brocoli.png', isSystem: true },
  { id: 'sys-lun-19', type: 'image', category: 'recipe', title: 'Bacalao al Horno con Verduras', description: 'Ligero y lleno de micronutrientes.', ingredients: 'Bacalao, calabacín, cebolla, pimientos', url: 'img/bacalao_horno.png', isSystem: true },
  { id: 'sys-lun-20', type: 'image', category: 'recipe', title: 'Ensalada de Quinoa y Gambas', description: 'Sabor fresco para días calurosos.', ingredients: 'Quinoa, mango, gambas cocidas, cilantro', url: 'img/quinoa_gambas.png', isSystem: true },
  { id: 'sys-lun-21', type: 'image', category: 'recipe', title: 'Pavo con Espárragos', description: 'Cena ligera clásica.', ingredients: 'Pechuga de pavo, espárragos trigueros, quinoa', url: 'img/pavo-pro.png', isSystem: true },
  { id: 'sys-lun-22', type: 'image', category: 'recipe', title: 'Tortilla de Patatas al Horno', description: 'Menos aceite, misma saciedad.', ingredients: 'Huevos, patatas asadas, cebolla', url: 'img/tortilla-patata-pro.png', isSystem: true },
  { id: 'sys-lun-23', type: 'image', category: 'recipe', title: 'Tofu con Verduras', description: 'Opción vegana rica en nutrientes.', ingredients: 'Tofu firme, zanahoria, pimiento, jengibre', url: 'img/tofu-verduras-pro.png', isSystem: true },
  { id: 'sys-lun-24', type: 'image', category: 'recipe', title: 'Merluza a la Plancha', description: 'Máxima ligereza.', ingredients: 'Merluza, lechuga, tomate, aceite de oliva', url: 'img/merluza-plancha-pro.png', isSystem: true },
  { id: 'sys-lun-25', type: 'image', category: 'recipe', title: 'Canelones de Espinacas', description: 'Pasta rellena saludable.', ingredients: 'Placas de pasta, espinacas, queso ricotta', url: 'img/canelones.png', isSystem: true },
  { id: 'sys-lun-26', type: 'image', category: 'recipe', title: 'Pollo al Limón con Cuscús', description: 'Toque cítrico y carbohidratos rápidos.', ingredients: 'Pollo, zumo de limón, cuscús integral', url: 'img/pollo-limon-cuscus-pro.png', isSystem: true },
  { id: 'sys-lun-27', type: 'image', category: 'recipe', title: 'Lentejas con Verduras', description: 'Plato de cuchara reconfortante.', ingredients: 'Lentejas, patata, zanahoria, cebolla', url: 'img/lentejas_verduras.png', isSystem: true },
  { id: 'sys-lun-28', type: 'image', category: 'recipe', title: 'Pasta con Gambas y Ajo', description: 'Energía y sabor.', ingredients: 'Pasta integral, gambas, ajo, guindilla', url: 'img/ensalada_pasta_lentejas.png', isSystem: true },
  { id: 'sys-lun-29', type: 'image', category: 'recipe', title: 'Brochetas de Pollo', description: 'Formato divertido para variar.', ingredients: 'Pollo, pimiento, cebolla, calabacín', url: 'img/pollo.png', isSystem: true },
  { id: 'sys-lun-30', type: 'image', category: 'recipe', title: 'Salmón al Eneldo', description: 'Hierbas aromáticas y grasas buenas.', ingredients: 'Salmón, eneldo, patatas al vapor', url: 'img/salmon_eneldo.png', isSystem: true },
  { id: 'sys-lun-31', type: 'image', category: 'recipe', title: 'Ensalada de Lentejas y Feta', description: 'Contrastes de sabor.', ingredients: 'Lentejas cocidas, queso feta, pepino, tomate', url: 'img/lentejas_feta.png', isSystem: true },
  { id: 'sys-lun-32', type: 'image', category: 'recipe', title: 'Pimientos Rellenos', description: 'Completo y visual.', ingredients: 'Pimientos, arroz, carne magra de ternera', url: 'img/pimientos-rellenos-pro.png', isSystem: true },
  { id: 'sys-lun-33', type: 'image', category: 'recipe', title: 'Pollo Thai con Coco', description: 'Sabores exóticos equilibrados.', ingredients: 'Pollo, leche de coco light, arroz basmati', url: 'img/pollo-thai.png', isSystem: true },
  { id: 'sys-lun-34', type: 'image', category: 'recipe', title: 'Hamburguesa de Lentejas', description: 'Alternativa vegetal a la hamburguesa.', ingredients: 'Lentejas, pan integral, hojas verdes', url: 'img/hamburguesa-lentejas-pro.png', isSystem: true },
  { id: 'sys-lun-35', type: 'image', category: 'recipe', title: 'Crema de Calabaza con Huevo', description: 'Cena caliente y nutritiva.', ingredients: 'Calabaza, cebolla, huevo poché', url: 'img/crema-calabaza.png', isSystem: true },
  { id: 'sys-lun-36', type: 'image', category: 'recipe', title: 'Fajitas de Pavo', description: 'Ideal para compartir.', ingredients: 'Tortillas, tiras de pavo, pimiento, cebolla', url: 'img/fajitas-pavo-pro.png', isSystem: true },
  { id: 'sys-lun-37', type: 'image', category: 'recipe', title: 'Ensalada de Pasta y Pollo', description: 'Clásico de túper.', ingredients: 'Pasta integral, pechuga, maíz, olivas', url: 'img/pasta-pollo-pro.png', isSystem: true },
  { id: 'sys-lun-38', type: 'image', category: 'recipe', title: 'Salmón en Papillote', description: 'Jugosidad máxima.', ingredients: 'Salmón, verduras variadas, patata tierna', url: 'img/salmon_papillote.png', isSystem: true },
  { id: 'sys-lun-39', type: 'image', category: 'recipe', title: 'Ratatouille con Huevo', description: 'Un plato de película.', ingredients: 'Calabecín, berenjena, tomate, huevo', url: 'img/ratatouille-huevo-pro.png', isSystem: true },
  { id: 'sys-lun-40', type: 'image', category: 'recipe', title: 'Sushi Casero Fit', description: 'Controla el azúcar del arroz.', ingredients: 'Arroz, alga nori, salmón, pepino', url: 'img/sushi-fit-pro.png', isSystem: true },
  { id: 'sys-lun-41', type: 'image', category: 'recipe', title: 'Pollo al Horno con Hierbas', description: 'Sencillo y efectivo.', ingredients: 'Pollo troceado, patatas, romero, ajo', url: 'img/pollo-hierbas-pro.png', isSystem: true },
  { id: 'sys-lun-42', type: 'image', category: 'recipe', title: 'Ensalada de Garbanzos y Pepino', description: 'Proteína vegetal rápida.', ingredients: 'Garbanzos, pepino, cebolla roja, perejil', url: 'img/ensalada-garbanzos-pro.png', isSystem: true },
  { id: 'sys-lun-43', type: 'image', category: 'recipe', title: 'Lasaña de Calabacín', description: 'Baja en carbos.', ingredients: 'Láminas de calabacín, carne picada magra, queso light', url: 'img/lasagna-calabacin-pro.png', isSystem: true },
  { id: 'sys-lun-44', type: 'image', category: 'recipe', title: 'Ensalada César Saludable', description: 'Sin salsas industriales.', ingredients: 'Leche, pollo, yogur (aliño), picatostes integrales', url: 'img/ensalada_pasta_lentejas.png', isSystem: true },
  { id: 'sys-lun-45', type: 'image', category: 'recipe', title: 'Guiso de Pavo', description: 'Tradición en modo fit.', ingredients: 'Pavo, champiñones, zanahoria, vino blanco', url: 'img/guiso-pavo-pro.png', isSystem: true },
  { id: 'sys-lun-46', type: 'image', category: 'recipe', title: 'Tortilla de Gambas', description: 'Proteína pura.', ingredients: 'Claras de huevo, gambas, ajetes tiernos', url: 'img/tortilla-gambas-pro.png', isSystem: true },
  { id: 'sys-lun-47', type: 'image', category: 'recipe', title: 'Pollo al Curry', description: 'Metabolismo activo.', ingredients: 'Pollo, curry, leche de coco, arroz integral', url: 'img/pollo-curry-pro.png', isSystem: true },
  { id: 'sys-lun-48', type: 'image', category: 'recipe', title: 'Pescado Blanco con Puré', description: 'Fácil de digerir.', ingredients: 'Merluza, puré de guisantes, patata', url: 'img/pescado-blanco-pro.png', isSystem: true },
  { id: 'sys-lun-49', type: 'image', category: 'recipe', title: 'Secrego de Cerdo Magro', description: 'Grasas de calidad con moderación.', ingredients: 'Secreto de cerdo (limpio), piña a la brasa, ensalada', url: 'img/secreto-cerdo-pro.png', isSystem: true },
  { id: 'sys-lun-50', type: 'image', category: 'recipe', title: 'Burrito Bowl', description: 'Todo el sabor sin la tortilla.', ingredients: 'Arroz basmati, carne magra, frijoles, maíz', url: 'img/burrito.png', isSystem: true },
  { id: 'sys-snack-1', type: 'image', category: 'recipe', title: 'Manzana y Proteína', description: 'Combo equilibrado de carbos y grasa.', ingredients: 'Manzana, crema de almendras, batido de proteína', url: 'img/fruta-queso-pro.png', isSystem: true },
  { id: 'sys-snack-2', type: 'image', category: 'recipe', title: 'Tortitas de Arroz Pack', description: 'Snack rápido post-entreno.', ingredients: 'Tortitas de arroz, pavo, aguacate', url: 'img/tortitas-avena-pro.png', isSystem: true },
  { id: 'sys-snack-3', type: 'image', category: 'recipe', title: 'Rollitos de Jamón y Nueces', description: 'Grasas y proteína rápida.', ingredients: 'Jamón serrano sin grasa, palitos de pan integral, nueces', url: 'img/rollitos-jamon-pro.png', isSystem: true },
  { id: 'sys-snack-4', type: 'image', category: 'recipe', title: 'Copa Fit de Requesón', description: 'Saciante y proteico.', ingredients: 'Queso batido, copos de avena, crema de cacahuete', url: 'img/copa_requeson.png', isSystem: true },
  { id: 'sys-snack-5', type: 'image', category: 'recipe', title: 'Edamame y Fruta', description: 'Proteína vegetal de alta calidad.', ingredients: 'Edamame al vapor, mandarina', url: 'img/yogur-frutos.png', isSystem: true },
  { id: 'sys-snack-6-v2', type: 'image', category: 'recipe', title: 'Hummus con Colines', description: 'Fibras y grasas saludables.', ingredients: 'Bastones de pan integral, hummus de garbanzo', url: 'img/hummus_colines_pro.png', isSystem: true },
  { id: 'sys-snack-7', type: 'image', category: 'recipe', title: 'Batido "Snickers" Saludable', description: 'Sabor espectacular e inteligente.', ingredients: 'Leche, dátil, cacao, crema de cacahuete', url: 'img/smoothie.png', isSystem: true },
  { id: 'sys-snack-8', type: 'image', category: 'recipe', title: 'Yogur de Soja con Semillas', description: '100% vegetal con omega-3.', ingredients: 'Yogur de soja, media pera, semillas de chía', url: 'img/yogur-frutos.png', isSystem: true },
  { id: 'sys-snack-9', type: 'image', category: 'recipe', title: 'Tostadita de Requesón', description: 'Pequeño bocado proteico.', ingredients: 'Pan de centeno, requesón, nuez', url: 'img/mediterranea.png', isSystem: true },
  { id: 'sys-snack-10', type: 'image', category: 'recipe', title: 'Huevo y Fruta rápida', description: 'Nutrición básica y efectiva.', ingredients: 'Huevo duro, plátano pequeño', url: 'img/huevo_fruta_pro.png', isSystem: true },
  { id: 'sys-snack-11', type: 'image', category: 'recipe', title: 'Barrita de Proteína Casera', description: 'Control de ingredientes máximo.', ingredients: 'Proteína en polvo, harina de coco, sirope de ágave', url: 'img/barrita_proteina_pro.png', isSystem: true },
  { id: 'sys-snack-12', type: 'image', category: 'recipe', title: 'Cottage con Piña', description: 'Diurético y proteico.', ingredients: 'Queso cottage, piña natural, almendras', url: 'img/cottage_pina_pro.png', isSystem: true },
  { id: 'sys-snack-13', type: 'image', category: 'recipe', title: 'Tortitas de Avena y Claras', description: 'Snack horneado rico en fibra.', ingredients: 'Harina de avena, claras, canela, stevia', url: 'img/tortitas-avena-pro.png', isSystem: true },
  { id: 'sys-snack-14', type: 'image', category: 'recipe', title: 'Yogur con Frutos Secos', description: 'Energía rápida y duradera.', ingredients: 'Yogur natural 0%, nueces, almendras, semillas', url: 'img/yogur-frutos.png', isSystem: true },
  { id: 'sys-snack-15', type: 'image', category: 'recipe', title: 'Fruta con Queso Fresco', description: 'El snack más equilibrado.', ingredients: 'Manzana o pera, queso fresco tipo Burgos', url: 'img/fruta-queso-pro.png', isSystem: true }
];

// ============================================
// MEDIA LIBRARY
// ============================================

const Media = {
  getAll: () => {
    try {
        let data = getData() || {};
        if (typeof initializeSystemLibrary === 'function') {
            initializeSystemLibrary();
            data = getData() || {};
        }
        const personal = Array.isArray(data.media) ? data.media : [];
        const sys = Array.isArray(window.SYSTEM_MEDIA) ? window.SYSTEM_MEDIA : (typeof SYSTEM_MEDIA !== 'undefined' ? SYSTEM_MEDIA : []);
        
        // Deduplicación inteligente por ID y por Título (case insensitive)
        const seenIds = new Set();
        const seenTitles = new Set();
        const combined = [];

        // Primero procesamos lo que está en data.media (personales/editados)
        personal.forEach(m => {
            if (!m) return;
            const titleKey = m.title ? m.title.toLowerCase().trim() : '';
            if (m.id) seenIds.add(String(m.id));
            if (titleKey) seenTitles.add(titleKey);
            combined.push(m);
        });

        // Luego añadimos lo del sistema solo si no existe ya
        sys.forEach(m => {
            if (!m) return;
            const titleKey = m.title ? m.title.toLowerCase().trim() : '';
            if (!seenIds.has(String(m.id)) && (!titleKey || !seenTitles.has(titleKey))) {
                combined.push(m);
            }
        });

        return combined;
    } catch (e) {
        console.error("❌ Error en Media.getAll:", e);
        return (typeof SYSTEM_MEDIA !== 'undefined') ? SYSTEM_MEDIA : [];
    }
  },

  getByCategory: (category) => {
    return Media.getAll().filter(m => m.category === category);
  },

  create: (mediaData) => {
    const data = getData();
    const newMedia = {
      id: generateUUID(),
      type: mediaData.type, // 'video' | 'image'
      category: mediaData.category, // 'exercise' | 'recipe'
      url: mediaData.url, // Base64 or external URL
      title: mediaData.title,
      description: mediaData.description || '',
      ingredients: mediaData.ingredients || '', // Para recetas
      muscleGroup: mediaData.muscleGroup || '', // Para ejercicios
      isSystem: false, // Forzar que es contenido de usuario
      createdAt: new Date().toISOString()
    };
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
    let itemToSync = null;
    let oldTitle = null;
    
    if (index === -1) {
        const sysItems = [...(window.SYSTEM_MEDIA || []), ...SYSTEM_MEDIA];
        const systemItem = sysItems.find(m => m.id == id);
        
        if (systemItem) {
            oldTitle = systemItem.title;
            const newItem = { ...systemItem, ...updates, isSystem: false };
            data.media.push(newItem);
            itemToSync = newItem;
        } else {
            return null;
        }
    } else {
        oldTitle = data.media[index].title;
        data.media[index] = { ...data.media[index], ...updates };
        itemToSync = data.media[index];
    }

    // --- SINCRONIZACIÓN PROFUNDA HACIA GRUPOS MUSCULARES ---
    if (itemToSync && itemToSync.category === 'exercise') {
        const newTitle = itemToSync.title;
        const newUrl = itemToSync.url;
        const searchTitle = (oldTitle || itemToSync.title).toLowerCase().trim();
        
        const mgConfig = data.muscleGroupsConfig;
        if (mgConfig && mgConfig.exercises) {
            let changed = false;
            for (const group in mgConfig.exercises) {
                mgConfig.exercises[group] = mgConfig.exercises[group].map(ex => {
                    const exName = typeof ex === 'string' ? ex : ex.name;
                    if (exName.toLowerCase().trim() === searchTitle) {
                        changed = true;
                        // Sincronizamos tanto NOMBRE como VIDEO
                        return { name: newTitle, videoUrl: newUrl };
                    }
                    return ex;
                });
            }
            if (changed) data.muscleGroupsConfig = mgConfig;
        }
    }

    saveData(data);
    return itemToSync;
  },

  delete: (id) => {
    // No permitir borrar plantillas del sistema
    if (String(id).startsWith('sys-')) return;
    
    const data = getData();
    data.media = (data.media || []).filter(m => m.id != id);
    saveData(data);
  },

  // Helper para sincronizar desde la Biblioteca de Rutinas hacia Multimedia
  syncFromRoutines: (exerciseName, videoUrl, muscleGroup) => {
    if (!exerciseName) return;
    const data = getData();
    const allMedia = Media.getAll(); 
    const existing = allMedia.find(m => m.category === 'exercise' && m.title.toLowerCase().trim() === exerciseName.toLowerCase().trim());
    
    if (existing) {
        if (existing.url !== videoUrl) {
            Media.update(existing.id, { url: videoUrl, muscleGroup });
        }
    } else if (videoUrl) {
        Media.create({
            type: 'video',
            category: 'exercise',
            title: exerciseName,
            url: videoUrl,
            muscleGroup: muscleGroup
        });
    }
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

// ============================================
// TRAINING LOGS CRUD
// ============================================

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

// ============================================
// HABITS CRUD
// ============================================

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

// ============================================
// INVOICES CRUD (VeriFactu Ready)
// ============================================

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
window.Invoices = Invoices;

// ============================================
// UTILITIES
// ============================================

const generateAccessCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const exportData = () => {
  const data = getData();
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `fitness-app-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
};

const importData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    localStorage.setItem(getStorageKey(), jsonString);
    return data;
  } catch (error) {
    console.error("Error syncing from cloud:", error);
    return null;
  }
};


// Initialize on load
initDatabase();

// Migration: Ensure dietPublished is true for clients with assigned diets
(function migrateDietPublished() {
    try {
        const data = getData();
        let changed = false;
        if (data.clients) {
            data.clients.forEach(c => {
                if (c.assignedDiet && (c.dietPublished === undefined || c.dietPublished === null)) {
                    c.dietPublished = true;
                    changed = true;
                }
            });
        }
        if (changed) {
            saveData(data);
            console.log('Migration: Updated dietPublished status for existing clients.');
        }
    } catch(e) { console.error('Migration error:', e); }
})();

// ============================================
// SYSTEM LIBRARY PRO (Consolidated)
// ============================================

const SYSTEM_LIBRARY_PRO = {
    FOODS: [
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
        { name: "Plátano", calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
        { name: "Manzana / Pera", calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
        { name: "Frutos Rojos (Mix)", calories: 45, protein: 0.8, carbs: 10, fat: 0.4 },
        { name: "Mango / Papaya", calories: 60, protein: 0.7, carbs: 15, fat: 0.3 },
        { name: "Piña / Melocotón", calories: 50, protein: 0.5, carbs: 13, fat: 0.1 },
        { name: "Brócoli / Espinacas", calories: 30, protein: 2.8, carbs: 5, fat: 0.4 },
        { name: "Pimientos / Tomate", calories: 22, protein: 1, carbs: 4, fat: 0.2 },
        { name: "Berenjena / Calabacín", calories: 20, protein: 1.2, carbs: 3.5, fat: 0.2 },
        { name: "Champiñones / Setas", calories: 25, protein: 3, carbs: 3, fat: 0.3 },
        { name: "Aceite de Oliva / Coco", calories: 884, protein: 0, carbs: 0, fat: 100 },
        { name: "Aguacate", calories: 160, protein: 2, carbs: 9, fat: 15 },
        { name: "Crema de Cacahuete/Almendra", calories: 595, protein: 25, carbs: 12, fat: 50 },
        { name: "Nueces / Almendras / Pistachos", calories: 610, protein: 19, carbs: 14, fat: 52 },
        { name: "Anacardos / Avellanas", calories: 580, protein: 17, carbs: 22, fat: 48 },
        { name: "Semillas (Chía/Cáñamo/Lino)", calories: 520, protein: 20, carbs: 10, fat: 40 },
        { name: "Hummus", calories: 175, protein: 8, carbs: 14, fat: 10 },
        { name: "Tahini", calories: 595, protein: 17, carbs: 21, fat: 54 },
        { name: "Aceitunas (Verdes/Negras)", calories: 145, protein: 1, carbs: 3, fat: 15 },
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
    ],
    RECIPES: [
        { id: 'prof-rec-salmon-v3', title: 'Tostada de Salmón', category: 'recipe', ingredients: 'Pan integral, Salmón ahumado, Aguacate', tags: 'Desayuno', url: 'img/salmon.png' },
        { id: 'prof-rec-medit-v3', title: 'Tostada Mediterránea Fit', category: 'recipe', ingredients: 'Pan integral, Huevo poché, Aceite', tags: 'Desayuno', url: 'img/mediterranea.png' },
        { id: 'prof-rec-tropical-v4', title: 'Bowl Tropical Premium', category: 'recipe', ingredients: 'Kéfir, Mango fresco, Coco rallado', tags: 'Desayuno', url: 'img/tropical.png' },
        { id: 'prof-rec-skyr-v4', title: 'Bowl de Skyr y Melocotón', category: 'recipe', ingredients: 'Skyr, Melocotón, Anacardos', tags: 'Merienda', url: 'img/skyr.png' },
        { id: 'prof-rec-gofre-v1', title: 'Gofre de Avena', category: 'recipe', ingredients: 'Harina de avena, Clara de huevo, Aceite coco', tags: 'Desayuno', url: 'img/gofre.png' },
        { id: 'prof-rec-smoothie-v1', title: 'Smoothie Chocolate-Avellana', category: 'recipe', ingredients: 'Bebida avellanas, Proteína chocolate, Plátano', tags: 'Merienda', url: 'img/smoothie.png' },
        { id: 'prof-rec-chia-v2', title: 'Chia Pudding con Fruta', category: 'recipe', ingredients: 'Semillas de chía, Leche desnatada, Fresas, Kiwi', tags: 'Desayuno', url: 'img/chia.png' },
        { id: 'prof-rec-pudding-v2', title: 'Pudding de Proteína Gourmet', category: 'recipe', ingredients: 'Caseína, Leche de soja, Arándanos', tags: 'Merienda', url: 'img/pudding-proteina-pro.png' },
        { id: 'prof-rec-pancakes-v4', title: 'Pancakes de Requesón', category: 'recipe', ingredients: 'Claras de huevo, Requesón, Harina avena, Nueces', tags: 'Desayuno', url: 'img/pancakes-requeson-pro.png' },
        { id: 'prof-rec-fruta-queso-pro', title: 'Manzana y Proteína', category: 'recipe', ingredients: 'Manzana o pera, queso fresco tipo Burgos', tags: 'Merienda', url: 'img/fruta-queso-pro.png' },
        { id: 'prof-rec-gachas-quinoa-pro', title: 'Gachas de Quinoa', category: 'recipe', ingredients: 'Quinoa cocida, leche de almendras, canela', tags: 'Desayuno', url: 'img/gachas-quinoa-pro.png' },
        { id: 'prof-rec-rollitos-jamon-pro', title: 'Rollitos de Jamón y Nueces', category: 'recipe', ingredients: 'Jamón serrano sin grasa, palitos integrales, nueces', tags: 'Merienda', url: 'img/rollitos-jamon-pro.png' },
        { id: 'prof-rec-skillet-patata-pro', title: 'Skillet de Patata y Huevo', category: 'recipe', ingredients: 'Patata picada, claras y huevo entero, pimientos', tags: 'Desayuno', url: 'img/skillet-patata-pro.png' },
        { id: 'prof-rec-tortitas-avena-pro', title: 'Tortitas de Avena y Plátano', category: 'recipe', ingredients: 'Plátano, huevos, almendra molida', tags: 'Desayuno', url: 'img/tortitas-avena-pro.png' },
        { id: 'prof-rec-wrap-almendras-pro', title: 'Wrap de Crema de Almendras', category: 'recipe', ingredients: 'Tortilla integral, crema de almendras, fresas, proteína', tags: 'Desayuno', url: 'img/wrap-almendras-pro.png' },
        { id: 'prof-rec-falafel-v4', title: 'Bowl de Falafel Gourmet', category: 'recipe', ingredients: 'Falafel horneado, Hummus, Ensalada', tags: 'Comida', url: 'img/falafel.png' },
        { id: 'prof-rec-bacalao-v4', title: 'Revuelto de Bacalao Élite', category: 'recipe', ingredients: 'Bacalao desmigado, Huevo, Pan tostado', tags: 'Cena', url: 'img/bacalao.png' },
        { id: 'prof-rec-burrito-v4', title: 'Burrito Bowl Saludable', category: 'recipe', ingredients: 'Arroz basmati, Carne magra, Frijoles', tags: 'Comida', url: 'img/burrito.png' },
        { id: 'prof-rec-pollo-hierbas', title: 'Pollo al Horno con Hierbas', category: 'recipe', ingredients: 'Pollo troceado, Patatas, Romero, Ajo', tags: 'Cena', url: 'img/pollo_hierbas.png' },
        { id: 'prof-rec-albondigas-pollo-pro', title: 'Albóndigas de Pollo', category: 'recipe', ingredients: 'Pechuga picada, tomate natural, pasta integral', tags: 'Comida', url: 'img/albondigas-pollo-pro.png' },
        { id: 'prof-rec-ensalada-garbanzos-pro', title: 'Ensalada de Garbanzos', category: 'recipe', ingredients: 'Garbanzos, atún, aceitunas', tags: 'Comida', url: 'img/ensalada-garbanzos-pro.png' },
        { id: 'prof-rec-fajitas-pavo-pro', title: 'Fajitas de Pavo', category: 'recipe', ingredients: 'Tortillas, tiras de pavo, pimiento, cebolla', tags: 'Cena', url: 'img/fajitas-pavo-pro.png' },
        { id: 'prof-rec-guiso-pavo-pro', title: 'Guiso de Pavo', category: 'recipe', ingredients: 'Pavo, champiñones, zanahoria, vino blanco', tags: 'Comida', url: 'img/guiso-pavo-pro.png' },
        { id: 'prof-rec-lasagna-calabacin-pro', title: 'Lasaña de Calabacín', category: 'recipe', ingredients: 'Láminas de calabacín, carne picada magra, queso light', tags: 'Cena', url: 'img/lasagna-calabacin-pro.png' },
        { id: 'prof-rec-lentejas-arroz-pro', title: 'Lentejas con Arroz', category: 'recipe', ingredients: 'Lentejas, arroz integral, aceite de oliva', tags: 'Comida', url: 'img/lentejas-arroz-pro.png' },
        { id: 'prof-rec-merluza-patatas-pro', title: 'Merluza al Horno', category: 'recipe', ingredients: 'Merluza, patatas panadera, aceite de oliva', tags: 'Cena', url: 'img/merluza-patatas-pro.png' },
        { id: 'prof-rec-merluza-plancha-pro', title: 'Merluza a la Plancha', category: 'recipe', ingredients: 'Merluza, lechuga, tomate, aceite de oliva', tags: 'Cena', url: 'img/merluza-plancha-pro.png' },
        { id: 'prof-rec-pavo-pro', title: 'Solomillo de Pavo', category: 'recipe', ingredients: 'Solomillo de pavo, arroz jazmín, almendras', tags: 'Comida', url: 'img/pavo-pro.png' },
        { id: 'prof-rec-pescado-blanco-pro', title: 'Pescado Blanco con Puré', category: 'recipe', ingredients: 'Merluza, puré de guisantes, patata', tags: 'Cena', url: 'img/pescado-blanco-pro.png' },
        { id: 'prof-rec-pollo-curry-pro', title: 'Pollo al Curry', category: 'recipe', ingredients: 'Pollo, curry, leche de coco, arroz integral', tags: 'Comida', url: 'img/pollo-curry-pro.png' },
        { id: 'prof-rec-pollo-limon-cuscus-pro', title: 'Pollo al Limón con Cuscús', category: 'recipe', ingredients: 'Pollo, zumo de limón, cuscús integral', tags: 'Comida', url: 'img/pollo-limon-cuscus-pro.png' },
        { id: 'prof-rec-salmon-papillote-pro', title: 'Salmón en Papillote', category: 'recipe', ingredients: 'Salmón, verduras variadas, patata tierna', tags: 'Cena', url: 'img/salmon_papillote.png' },
        { id: 'prof-rec-secreto-cerdo-pro', title: 'Secreto de Cerdo Magro', category: 'recipe', ingredients: 'Secreto de cerdo, piña a la brasa, ensalada', tags: 'Cena', url: 'img/secreto-cerdo-pro.png' },
        { id: 'prof-rec-sushi-fit-pro', title: 'Poke de Atún', category: 'recipe', ingredients: 'Arroz, alga nori, salmón, pepino', tags: 'Cena', url: 'img/sushi-fit-pro.png' },
        { id: 'prof-rec-tofu-verduras-pro', title: 'Tofu con Verduras', category: 'recipe', ingredients: 'Tofu firme, zanahoria, pimiento, jengibre', tags: 'Cena', url: 'img/tofu_verduras.png' },
        { id: 'prof-rec-tortilla-gambas-pro', title: 'Tortilla de Gambas', category: 'recipe', ingredients: 'Claras de huevo, gambas, ajetes tiernos', tags: 'Cena', url: 'img/tortilla-gambas-pro.png' },
        { id: 'prof-rec-tortilla-patata-pro', title: 'Tortilla de Patatas', category: 'recipe', ingredients: 'Huevos, patatas asadas, cebolla', tags: 'Comida', url: 'img/tortilla-patata-pro.png' },
        { id: 'prof-rec-wok-pollo-pro', title: 'Wok de Pollo y Fideos', category: 'recipe', ingredients: 'Pollo, fideos de arroz, brócoli, cacahuetes', tags: 'Comida', url: 'img/wok-pollo-pro.png' },
        { id: 'prof-rec-hamburguesa-lentejas-pro', title: 'Hamburguesa de Lentejas', category: 'recipe', ingredients: 'Lentejas, pan integral, hojas verdes', tags: 'Comida', url: 'img/hamburguesa-lentejas-pro.png' },
        { id: 'prof-rec-ratatouille-pro', title: 'Berenjena Rellena', category: 'recipe', ingredients: 'Berenjena, carne de pavo, tomate, queso gratinado', tags: 'Cena', url: 'img/berenjena-rellena-pro.png' },
        { id: 'prof-rec-avena-nocturna', title: 'Avena Nocturna con Cacao', category: 'recipe', ingredients: 'Avena, Leche, Cacao puro, Avellanas', tags: 'Desayuno', url: 'img/avena_nocturna.png' },
        { id: 'prof-rec-yogur-frutos', title: 'Yogur con Frutos Secos', category: 'recipe', ingredients: 'Yogur natural 0%, nueces, almendras, semillas', tags: 'Merienda', url: 'img/yogur-frutos.png' },
        { id: 'prof-rec-crema-calabaza', title: 'Crema de Calabaza con Huevo', category: 'recipe', ingredients: 'Calabaza, cebolla, huevo poché', tags: 'Cena', url: 'img/crema-calabaza.png' },
        { id: 'prof-rec-pollo-thai', title: 'Pollo Thai con Coco', category: 'recipe', ingredients: 'Pollo, leche de coco light, arroz basmati', tags: 'Comida', url: 'img/pollo-thai.png' },
        { id: 'prof-rec-ensalada-lentejas', title: 'Ensalada de Pasta de Lentejas', category: 'recipe', ingredients: 'Pasta de lentejas, cherries, pesto', tags: 'Comida', url: 'img/ensalada-lentejas.png' },
        { id: 'prof-rec-ternera-brocoli', title: 'Ternera con Brócoli', category: 'recipe', ingredients: 'Tiras de ternera, brócoli, salsa de soja', tags: 'Comida', url: 'img/ternera_brocoli.png' },
        { id: 'prof-rec-bacalao-horno', title: 'Bacalao al Horno con Verduras', category: 'recipe', ingredients: 'Bacalao, calabacín, cebolla, pimientos', tags: 'Cena', url: 'img/bacalao_horno.png' },
        { id: 'prof-rec-canelones', title: 'Canelones de Espinacas', category: 'recipe', ingredients: 'Placas de pasta, espinacas, queso ricotta', tags: 'Comida', url: 'img/canelones.png' },
        { id: 'prof-rec-quinoa-gambas', title: 'Ensalada de Quinoa y Gambas', category: 'recipe', ingredients: 'Quinoa, mango, gambas cocidas, cilantro', tags: 'Comida', url: 'img/quinoa_gambas.png' },
        { id: 'prof-rec-lentejas-verduras', title: 'Lentejas con Verduras', category: 'recipe', ingredients: 'Lentejas, patata, zanahoria, cebolla', tags: 'Comida', url: 'img/lentejas_verduras.png' },
        { id: 'prof-rec-salmon-eneldo', title: 'Salmón al Eneldo', category: 'recipe', ingredients: 'Salmón, eneldo, patatas al vapor', tags: 'Cena', url: 'img/salmon_eneldo.png' },
        { id: 'prof-rec-lentejas-feta', title: 'Ensalada de Lentejas y Feta', category: 'recipe', ingredients: 'Lentejas cocidas, queso feta, pepino, tomate', tags: 'Cena', url: 'img/lentejas_feta.png' },
        { id: 'prof-rec-noodles-pollo', title: 'Noodles de Pollo y Brócoli', category: 'recipe', ingredients: 'Fideos de arroz, pollo, brócoli, cacahuetes', tags: 'Comida', url: 'img/noodles_pollo_brocoli.png' },
        { id: 'prof-rec-pollo-arroz-almendras', title: 'Pollo con Arroz y Almendras', category: 'recipe', ingredients: 'Pechuga de pollo, arroz jazmín, almendras laminadas', tags: 'Comida', url: 'img/pollo_arroz_almendras.png' },
        { id: 'prof-rec-pollo-boniato', title: 'Pollo con Boniato', category: 'recipe', ingredients: 'Pollo, batata asada, verduras', tags: 'Comida', url: 'img/pollo_boniato.png' },
        { id: 'prof-rec-arepa-pollo', title: 'Arepa de Pollo y Aguacate', category: 'recipe', ingredients: 'Maíz precocido, pollo desmechado, aguacate', tags: 'Desayuno', url: 'img/arepa_pollo_aguacate.png' },
        { id: 'prof-rec-wok-fideos', title: 'Wok de Pollo y Fideos', category: 'recipe', ingredients: 'Fideos, pollo, verduras al wok', tags: 'Comida', url: 'img/wok_pollo_fideos.png' }
    ],
    EXERCISES: {
        'Pecho': [
            { name: 'Press de Banca Plano (Barra)', videoUrl: 'https://www.youtube.com/watch?v=tuwHzzPrzOM' },
            { name: 'Press Inclinado (Barra)', videoUrl: 'https://www.youtube.com/watch?v=SrqOu55lr6A' },
            { name: 'Press Declinado (Barra)', videoUrl: 'https://www.youtube.com/watch?v=LfyQbuJshYw' },
            { name: 'Press Plano (Mancuernas)', videoUrl: 'https://www.youtube.com/watch?v=8679p9qL-wY' },
            { name: 'Press Inclinado (Mancuernas)', videoUrl: 'https://www.youtube.com/watch?v=8iPEnn-ltC8' },
            { name: 'Aperturas Planas (Mancuernas)', videoUrl: 'https://www.youtube.com/watch?v=eGjt4lk6g34' },
            { name: 'Aperturas en Peck Deck', videoUrl: 'https://www.youtube.com/watch?v=6id882M_39E' },
            { name: 'Cruce de Poleas Altas', videoUrl: 'https://www.youtube.com/watch?v=taI4XpqatW0' },
            { name: 'Cruce de Poleas Bajas', videoUrl: 'https://www.youtube.com/watch?v=Mofp6LqWf1A' },
            { name: 'Flexiones (Push Ups)', videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4' },
            { name: 'Fondos en Paralelas (Pecho)', videoUrl: 'https://www.youtube.com/watch?v=2z8JmcrW-As' },
            { name: 'Press en Máquina Convergente', videoUrl: 'https://www.youtube.com/watch?v=xZ9Mms94k8o' },
            { name: 'Pullover con Mancuerna', videoUrl: 'https://www.youtube.com/watch?v=FK4rj9Ps0uM' }
        ],
        'Espalda': [
            { name: 'Dominadas (Prono)', videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g' },
            { name: 'Dominadas (Supino)', videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g' },
            { name: 'Jalón al Pecho (Ancho)', videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc' },
            { name: 'Jalón al Pecho (Estrecho)', videoUrl: 'https://www.youtube.com/watch?v=G86L6_W8y-w' },
            { name: 'Remo con Barra (90º)', videoUrl: 'https://www.youtube.com/watch?v=RQU8wL6G_HI' },
            { name: 'Remo con Mancuerna (1 mano)', videoUrl: 'https://www.youtube.com/watch?v=dFzUjzuW_2M' },
            { name: 'Remo en Polea Baja (Gironda)', videoUrl: 'https://www.youtube.com/watch?v=GZbfZ033f74' },
            { name: 'Peso Muerto Convencional', videoUrl: 'https://www.youtube.com/watch?v=ytGaGIn3SjE' },
            { name: 'Remo en Punta (T-Bar)', videoUrl: 'https://www.youtube.com/watch?v=j3Igk5nyZE4' },
            { name: 'Pull-over en Polea Alta', videoUrl: 'https://www.youtube.com/watch?v=P_m8_z_Lh-I' },
            { name: 'Hiperextensiones', videoUrl: 'https://www.youtube.com/watch?v=ph3pddpKzzw' },
            { name: 'Jalón con Brazos Rectos', videoUrl: 'https://www.youtube.com/watch?v=AJO_R0E-zB8' },
            { name: 'Remo con Soporte en Pecho', videoUrl: 'https://www.youtube.com/watch?v=roS6vXG3o1w' }
        ],
        'Hombros': [
            { name: 'Press Militar (Barra)', videoUrl: 'https://www.youtube.com/watch?v=2yjwxtZ_Vkg' },
            { name: 'Press Militar (Mancuernas)', videoUrl: 'https://www.youtube.com/watch?v=hzV0is76j5I' },
            { name: 'Press Arnold', videoUrl: 'https://www.youtube.com/watch?v=6mcHe6Pvefc' },
            { name: 'Elevaciones Laterales (Mancuernas)', videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo' },
            { name: 'Elevaciones Laterales (Polea)', videoUrl: 'https://www.youtube.com/watch?v=PPrzBWZDOhA' },
            { name: 'Elevaciones Frontales (Mancuernas)', videoUrl: 'https://www.youtube.com/watch?v=gzXoI26vT_o' },
            { name: 'Pájaros (Mancuernas)', videoUrl: 'https://www.youtube.com/watch?v=6yMdhi2DVao' },
            { name: 'Pájaros (Polea)', videoUrl: 'https://www.youtube.com/watch?v=H530fW3KWfk' },
            { name: 'Facepulls', videoUrl: 'https://www.youtube.com/watch?v=V8dZ3on_D_Y' },
            { name: 'Encogimientos de Hombros', videoUrl: 'https://www.youtube.com/watch?v=g6qbq4u19OY' },
            { name: 'Remo al Mentón (Barra EZ)', videoUrl: 'https://www.youtube.com/watch?v=um3VVz_SIsg' },
            { name: 'Pájaros en Peck Deck Invertido', videoUrl: 'https://www.youtube.com/watch?v=5yWTVfXNntc' }
        ],
        'Piernas': [
            { name: 'Sentadilla Libre (Barra)', videoUrl: 'https://www.youtube.com/watch?v=SW_C1A-SHMA' },
            { name: 'Prensa de Piernas 45º', videoUrl: 'https://www.youtube.com/watch?v=yZ800I4r_0g' },
            { name: 'Extensiones de Cuádriceps', videoUrl: 'https://www.youtube.com/watch?v=YyvSfVLYd80' },
            { name: 'Curl Femoral Tumbado', videoUrl: 'https://www.youtube.com/watch?v=1Tq3QdAUUoI' },
            { name: 'Curl Femoral Sentado', videoUrl: 'https://www.youtube.com/watch?v=F488k66OZuE' },
            { name: 'Zancadas Caminando (Lunges)', videoUrl: 'https://www.youtube.com/watch?v=D7KaRcUTQeE' },
            { name: 'Sentadilla Búlgara (Foco Cuádriceps)', videoUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE' },
            { name: 'Sentadilla Hack', videoUrl: 'https://www.youtube.com/watch?v=EdSndmB-A7c' },
            { name: 'Sentadilla Goblet', videoUrl: 'https://www.youtube.com/watch?v=MeIiGibT6X0' },
            { name: 'Peso Muerto Rumano (Isquios)', videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzz9Sg' },
            { name: 'Elevación de Gemelos (De pie)', videoUrl: 'https://www.youtube.com/watch?v=gwLzBJYoWlI' },
            { name: 'Elevación de Gemelos (Sentado)', videoUrl: 'https://www.youtube.com/watch?v=JbyjN7BW3ic' }
        ],
        'Glúteos': [
            { name: 'Hip Thrust (Barra)', videoUrl: 'https://www.youtube.com/watch?v=SEDZFull6pQ' },
            { name: 'Puente de Glúteo (Barra)', videoUrl: 'https://www.youtube.com/watch?v=j6iT33H99e0' },
            { name: 'Patada de Glúteo en Polea', videoUrl: 'https://www.youtube.com/watch?v=N_p2U_62jG8' },
            { name: 'Abducciones en Máquina', videoUrl: 'https://www.youtube.com/watch?v=NpZp824T3lE' },
            { name: 'Zancada Búlgara (Foco Glúteo)', videoUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE' },
            { name: 'Step Up (Cajón Alto)', videoUrl: 'https://www.youtube.com/watch?v=9_C8p9pNc6U' },
            { name: 'Abducciones en Polea', videoUrl: 'https://www.youtube.com/watch?v=NpZp824F3lE' }
        ],
        'Bíceps': [
            { name: 'Curl con Barra Z', videoUrl: 'https://www.youtube.com/watch?v=LY1V6p-XvJk' },
            { name: 'Curl Martillo', videoUrl: 'https://www.youtube.com/watch?v=zC3nLlEvin4' },
            { name: 'Curl Predicador (Scott)', videoUrl: 'https://www.youtube.com/watch?v=fIWP-FRFNU0' },
            { name: 'Curl Alterno (Mancuernas)', videoUrl: 'https://www.youtube.com/watch?v=sAq_ocpRh_I' },
            { name: 'Curl Concentrado', videoUrl: 'https://www.youtube.com/watch?v=v0ZStv9fU8k' },
            { name: 'Curl en Polea Baja', videoUrl: 'https://www.youtube.com/watch?v=AsAVbgh8Syg' }
        ],
        'Tríceps': [
            { name: 'Press Francés', videoUrl: 'https://www.youtube.com/watch?v=1u1_NreL7mU' },
            { name: 'Extensiones en Polea Alta', videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzHLU' },
            { name: 'Patada de Tríceps (Polea)', videoUrl: 'https://www.youtube.com/watch?v=6SS6K3lAwZ8' },
            { name: 'Press de Banca Estrecho', videoUrl: 'https://www.youtube.com/watch?v=wX-EPr_x4_A' },
            { name: 'Extensiones tras nuca', videoUrl: 'https://www.youtube.com/watch?v=6XhS6_q1Vtc' }
        ],
        'Core': [
            { name: 'Plancha Abdominal', videoUrl: 'https://www.youtube.com/watch?v=TvxNkmjdhMM' },
            { name: 'Crunch en Polea Alta', videoUrl: 'https://www.youtube.com/watch?v=S08E3B6xLMc' },
            { name: 'Elevación de Piernas (Colgado)', videoUrl: 'https://www.youtube.com/watch?v=hd_FpXy97r0' },
            { name: 'Rueda Abdominal (Ab Wheel)', videoUrl: 'https://www.youtube.com/watch?v=H7m_L0XF9vI' },
            { name: 'Dead Bug', videoUrl: 'https://www.youtube.com/watch?v=4XLEnwUr1gk' }
        ]
    }
};

/**
 * Inicialización global de activos del sistema.
 * Asegura que todos los entrenadores tengan acceso a la misma biblioteca profesional.
 */
function initializeSystemLibrary() {
    console.log("🚀 Inicializando Biblioteca Global del Sistema...");
    
    // 1. Inyectar Recetas PRO en SYSTEM_MEDIA
    SYSTEM_LIBRARY_PRO.RECIPES.forEach(pro => {
        const index = SYSTEM_MEDIA.findIndex(m => m.id === pro.id || (m.title && pro.title && m.title.toLowerCase() === pro.title.toLowerCase()));
        if (index !== -1) {
            SYSTEM_MEDIA[index] = { ...SYSTEM_MEDIA[index], ...pro, isSystem: true, type: 'image' };
        } else {
            SYSTEM_MEDIA.push({ ...pro, isSystem: true, type: 'image' });
        }
    });

    // 1.1 Inyectar Ejercicios PRO en SYSTEM_MEDIA (Para visualización en Biblioteca)
    Object.entries(SYSTEM_LIBRARY_PRO.EXERCISES).forEach(([category, exercises]) => {
        exercises.forEach(ex => {
            const exerciseId = `prof-ex-${ex.name.toLowerCase().replace(/\s+/g, '-')}`;
            const index = SYSTEM_MEDIA.findIndex(m => m.id === exerciseId || (m.title && m.title.toLowerCase() === ex.name.toLowerCase()));
            
            const exerciseData = {
                id: exerciseId,
                title: ex.name,
                category: 'exercise',
                type: 'video',
                url: ex.videoUrl,
                thumbnail: 'img/exercise-placeholder.png',
                isSystem: true,
                tags: category
            };

            if (index !== -1) {
                SYSTEM_MEDIA[index] = { ...SYSTEM_MEDIA[index], ...exerciseData };
            } else {
                SYSTEM_MEDIA.push(exerciseData);
            }
        });
    });

    // 2. Inyectar Ejercicios PRO en la configuración del entrenador
    const data = getData();
    let changed = false;

    if (!data.muscleGroupsConfig) {
        data.muscleGroupsConfig = {
            groups: Object.keys(SYSTEM_LIBRARY_PRO.EXERCISES),
            exercises: {}
        };
        changed = true;
    }

    const mgConfig = data.muscleGroupsConfig;
    if (!mgConfig.exercises) mgConfig.exercises = {};

    for (const group in SYSTEM_LIBRARY_PRO.EXERCISES) {
        if (!mgConfig.exercises[group]) {
            mgConfig.exercises[group] = [];
            changed = true;
        }

        SYSTEM_LIBRARY_PRO.EXERCISES[group].forEach(proEx => {
            const index = mgConfig.exercises[group].findIndex(ex => {
                const exName = typeof ex === 'string' ? ex : ex.name;
                return exName.toLowerCase().trim() === proEx.name.toLowerCase().trim();
            });

            if (index === -1) {
                mgConfig.exercises[group].push({ name: proEx.name, videoUrl: proEx.videoUrl });
                changed = true;
            } else {
                const currentEx = mgConfig.exercises[group][index];
                const currentUrl = typeof currentEx === 'string' ? '' : (currentEx.videoUrl || '');
                if (!currentUrl || currentUrl.includes('placeholder')) {
                    mgConfig.exercises[group][index] = { name: proEx.name, videoUrl: proEx.videoUrl };
                    changed = true;
                }
            }

            // También inyectar en la biblioteca multimedia (Media) para visualización
            if (data.media) {
                const mediaIndex = data.media.findIndex(m => 
                    m.category === 'exercise' && 
                    m.title.toLowerCase().trim() === proEx.name.toLowerCase().trim()
                );
                if (mediaIndex === -1) {
                    data.media.push({
                        id: 'sys-ex-' + proEx.name.replace(/\s+/g, '-').toLowerCase(),
                        type: 'video',
                        category: 'exercise',
                        url: proEx.videoUrl,
                        title: proEx.name,
                        muscleGroup: group,
                        isSystem: true,
                        createdAt: new Date().toISOString()
                    });
                    changed = true;
                }
            }
        });
    }

    // 3. Inyectar Alimentos PRO en la base de datos
    if (!data.foods) data.foods = [];
    SYSTEM_LIBRARY_PRO.FOODS.forEach(proFood => {
        const foodIdx = data.foods.findIndex(f => f.name === proFood.name);
        if (foodIdx === -1) {
            data.foods.push({
                id: 'sys-food-' + Math.random().toString(36).substr(2, 9),
                ...proFood,
                type: proFood.type || 'g',
                createdAt: new Date().toISOString(),
                isSystem: true
            });
            changed = true;
        } else {
            // Actualizar macros si han cambiado en el sistema
            const current = data.foods[foodIdx];
            if (current.calories !== proFood.calories || current.protein !== proFood.protein) {
                data.foods[foodIdx] = { ...current, ...proFood };
                changed = true;
            }
        }
    });

    if (changed) {
        saveData(data);
        console.log("✅ Base de datos sincronizada.");
    }

    console.log("🏁 Biblioteca Global cargada v129.");
    
    // Notificar a la UI de forma segura
    try {
        const vStatus = document.getElementById('status-videos');
        const pStatus = document.getElementById('status-photos');
        if (vStatus) vStatus.textContent = `${SYSTEM_MEDIA.filter(m => m.category === 'exercise').length} activos`;
        if (pStatus) pStatus.textContent = `${SYSTEM_MEDIA.filter(m => m.category === 'recipe').length} activos`;
        
        // El renderizado lo gestionará el DOMContentLoaded del HTML para evitar colisiones
    } catch(e) { console.warn("UI Status update skipped:", e); }
}

// Ejecutar inicialización inmediatamente para asegurar que los datos estén listos
initializeSystemLibrary();

// Global assignments to ensure availability across all scripts
window.activeTrainerId = activeTrainerId;
window.generateUUID = generateUUID;
window.Clients = Clients;
window.Routines = Routines;
window.Diets = Diets;
window.Foods = Foods;
window.Feedbacks = Feedbacks;
window.Media = Media;
window.TrainingLogs = TrainingLogs;
window.Habits = Habits;
window.TrainingBlocks = TrainingBlocks;
window.Appointments = Appointments;
window.Invoices = Invoices; 
window.BrandConfig = BrandConfig;
window.SYSTEM_MEDIA = SYSTEM_MEDIA;
window.getData = getData;
window.saveData = saveData;
