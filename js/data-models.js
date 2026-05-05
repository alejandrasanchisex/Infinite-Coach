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
 */
const syncFromCloud = async () => {
  const currentId = window.activeTrainerId || localStorage.getItem('activeTrainerId') || 'default';
  if (currentId === 'default') return null;

  console.log("Iniciando sincronización profesional con Supabase para:", currentId);
  
  try {
    // 1. Intentar Supabase primero (Prioridad 1: Nuevo Engine SaaS)
    let cloudData = null;
    if (window.SupabaseService) {
        cloudData = await window.SupabaseService.getTrainerData(currentId);
    }

    // 2. Si no hay en Supabase, buscar en Firebase (Prioridad 2: Migración Legacy)
    if (!cloudData && window.FirebaseService && window.FirebaseService.isReady) {
        console.log("Datos no hallados en Supabase, buscando en Firebase Legacy...");
        cloudData = await window.FirebaseService.getData('trainerData', currentId);
    }

    if (cloudData) {
        const localData = getData();
        const merged = { ...cloudData };
        
        // Mantener marca local si la nube está vacía en esa parte
        const cloudHasBrand = cloudData.brand && (cloudData.brand.name || cloudData.brand.logo);
        if (!cloudHasBrand && localData.brand) {
            merged.brand = localData.brand;
        }
        
        localStorage.setItem(getStorageKey(), JSON.stringify(merged));
        console.log("Sincronización profesional completada ✅");
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
  { id: 'sys-br-1', type: 'image', category: 'recipe', title: 'Porridge Pro', description: 'Desayuno energético con carbohidratos complejos y proteína.', ingredients: 'Avena, proteína en polvo, crema de cacahuete', url: 'https://images.unsplash.com/photo-1517433670267-24bb31200931?q=80&w=800', isSystem: true },
  { id: 'sys-br-2', type: 'image', category: 'recipe', title: 'Tostada Mediterránea', description: 'Grasas saludables y proteína de alto valor biológico.', ingredients: 'Pan integral, huevo poché, aceite de oliva', url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800', isSystem: true },
  { id: 'sys-br-3', type: 'image', category: 'recipe', title: 'Yogur Energy', description: 'Equilibrio perfecto entre lácteos, cereales y fruta.', ingredients: 'Yogur griego, granola casera, arándanos', url: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?q=80&w=800', isSystem: true },
  { id: 'sys-br-4', type: 'image', category: 'recipe', title: 'Omelette Fit', description: 'Desayuno bajo en carbos y alto en fibra vegetal.', ingredients: 'Huevos, espinacas, champiñones, rebanada de pan de centeno', url: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?q=80&w=800', isSystem: true },
  { id: 'sys-br-5', type: 'image', category: 'recipe', title: 'Batido de Avena y Plátano', description: 'Ideal para antes o después de entrenar.', ingredients: 'Leche de soja, plátano, avena, semillas de lino', url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800', isSystem: true },
  { id: 'sys-br-6', type: 'image', category: 'recipe', title: 'Pancakes de Requesón', description: 'Tortitas altas en proteína y bajas en grasa.', ingredients: 'Claras de huevo, requesón, harina de avena, nueces', url: 'https://images.unsplash.com/photo-1506084868730-3c2b1febb9f9?q=80&w=800', isSystem: true },
  { id: 'sys-br-7', type: 'image', category: 'recipe', title: 'Bowl Tropical', description: 'Frescura y probióticos para empezar el día.', ingredients: 'Kéfir, mango, coco rallado', url: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?q=80&w=800', isSystem: true },
  { id: 'sys-br-8', type: 'image', category: 'recipe', title: 'Tostada de Salmón', description: 'Omega-3 y carbohidratos de gramo completo.', ingredients: 'Pan de espelta, salmón ahumado, aguacate', url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800', isSystem: true },
  { id: 'sys-br-9', type: 'image', category: 'recipe', title: 'Queso Batido Nutritivo', description: 'Bajo en calorías y muy saciante.', ingredients: 'Queso fresco batido 0%, copos de maíz sin azúcar, almendras', url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=800', isSystem: true },
  { id: 'sys-br-10', type: 'image', category: 'recipe', title: 'Breakfast Burrito', description: 'Versión saludable del clásico burrito.', ingredients: 'Tortilla de trigo integral, huevos revueltos, rodajas de aguacate', url: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?q=80&w=800', isSystem: true },
  { id: 'sys-br-11', type: 'image', category: 'recipe', title: 'Chia Pudding con Fruta', description: 'Alto contenido en fibra y grasas buenas.', ingredients: 'Semillas de chía, leche desnatada, fresas', url: 'https://images.unsplash.com/photo-1510629954389-c1e0da47d614?q=80&w=800', isSystem: true },
  { id: 'sys-br-12', type: 'image', category: 'recipe', title: 'Gachas de Quinoa', description: 'Alternativa sin gluten a la avena.', ingredients: 'Quinoa cocida, leche de almendras, canela', url: 'https://images.unsplash.com/photo-1505253716362-afaba1dd3c67?q=80&w=800', isSystem: true },
  { id: 'sys-br-13', type: 'image', category: 'recipe', title: 'Bagel de Pavo', description: 'Proteína magra en formato divertido.', ingredients: 'Bagel integral, pechuga de pavo, queso crema light', url: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?q=80&w=800', isSystem: true },
  { id: 'sys-br-14', type: 'image', category: 'recipe', title: 'Hummus Toast', description: 'Proteína vegetal y carbohidratos lentos.', ingredients: 'Pan integral, hummus, huevo cocido', url: 'https://images.unsplash.com/photo-1518013391915-e41796d8ed50?q=80&w=800', isSystem: true },
  { id: 'sys-br-15', type: 'image', category: 'recipe', title: 'Bowl Antiox', description: 'Súper alimentos para la recuperación.', ingredients: 'Yogur natural, frambuesas, semillas de calabaza', url: 'https://images.unsplash.com/photo-1504387854560-3f776ef41ce7?q=80&w=800', isSystem: true },
  { id: 'sys-br-16', type: 'image', category: 'recipe', title: 'Muffins de Huevo', description: 'Formato "to-go" para desayunos rápidos.', ingredients: 'Huevos, pavo picado, verduras, patata asada picada', url: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?q=80&w=800', isSystem: true },
  { id: 'sys-br-17', type: 'image', category: 'recipe', title: 'Tofu Scramble', description: 'Opción 100% vegetal rica en proteína.', ingredients: 'Tofu firme, cúrcuma, tostada de pan de masa madre', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800', isSystem: true },
  { id: 'sys-br-18', type: 'image', category: 'recipe', title: 'Sandwich de Atún', description: 'Clásico rico en selenio y omega-3.', ingredients: 'Pan integral, atún al natural, mayonesa ligera o aguacate', url: 'https://images.unsplash.com/photo-1528735602780-25420f56540c?q=80&w=800', isSystem: true },
  { id: 'sys-br-19', type: 'image', category: 'recipe', title: 'Copa de Requesón y Miel', description: 'Postre de desayuno dulce y nutritivo.', ingredients: 'Requesón, miel, pistachos', url: 'https://images.unsplash.com/photo-1514327605112-b887c0e61c0a?q=80&w=800', isSystem: true },
  { id: 'sys-br-20', type: 'image', category: 'recipe', title: 'Smoothie Bowl Verde', description: 'Shot de vitaminas y minerales.', ingredients: 'Espinacas, proteína de vainilla, manzana, semillas de chía', url: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?q=80&w=800', isSystem: true },
  { id: 'sys-br-21', type: 'image', category: 'recipe', title: 'Tortitas de Plátano y Huevo', description: 'Pocas calorías y mucho sabor.', ingredients: 'Plátano, huevos, almendra molida', url: 'https://images.unsplash.com/photo-1506084868730-3c2b1febb9f9?q=80&w=800', isSystem: true },
  { id: 'sys-br-22', type: 'image', category: 'recipe', title: 'Cuscús de Desayuno', description: 'Energía duradera para el entrenamiento.', ingredients: 'Cuscús integral, yogur griego, pasas', url: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=800', isSystem: true },
  { id: 'sys-br-23', type: 'image', category: 'recipe', title: 'Skillet de Patata y Huevo', description: 'Desayuno potente y saciante.', ingredients: 'Patata picada, claras y huevo entero, pimientos', url: 'https://images.unsplash.com/photo-1594910350423-95240c0acc44?q=80&w=800', isSystem: true },
  { id: 'sys-br-24', type: 'image', category: 'recipe', title: 'Wrap de Crema de Almendras', description: 'Grasas de calidad y energía.', ingredients: 'Tortilla integral, crema de almendras, rodajas de fresa, proteína en polvo', url: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=800', isSystem: true },
  { id: 'sys-br-25', type: 'image', category: 'recipe', title: 'Papaya con Queso', description: 'Enzimas digestivas y confort intestinal.', ingredients: 'Papaya, queso cottage, semillas de cáñamo', url: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?q=80&w=800', isSystem: true },
  { id: 'sys-br-26', type: 'image', category: 'recipe', title: 'Revuelto de Bacalao', description: 'Proteína marina desde primera hora.', ingredients: 'Bacalao desmigado, huevo, rebanada de pan tostado', url: 'https://images.unsplash.com/photo-1496044178244-2c0673d317ec?q=80&w=800', isSystem: true },
  { id: 'sys-br-27', type: 'image', category: 'recipe', title: 'Avena Nocturna con Cacao', description: 'Prepáralo antes de dormir y ahorra tiempo.', ingredients: 'Avena, leche, cacao puro, avellanas', url: 'https://images.unsplash.com/photo-1517433670267-24bb31200931?q=80&w=800', isSystem: true },
  { id: 'sys-br-28', type: 'image', category: 'recipe', title: 'Tostada de Ricotta', description: 'Grasas lácteas y fruta natural.', ingredients: 'Pan integral, queso ricotta, higos', url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800', isSystem: true },
  { id: 'sys-br-29', type: 'image', category: 'recipe', title: 'Barritas Caseras', description: 'Snack de desayuno horneado.', ingredients: 'Avena, dátiles, cacahuetes, clara de huevo', url: 'https://images.unsplash.com/photo-1505252822730-804910e53a25?q=80&w=800', isSystem: true },
  { id: 'sys-br-30', type: 'image', category: 'recipe', title: 'Bowl de Skyr', description: 'Máxima proteína láctea.', ingredients: 'Skyr, melocotón, anacardos', url: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?q=80&w=800', isSystem: true },
  { id: 'sys-br-31', type: 'image', category: 'recipe', title: 'Arepa Fitness', description: 'Clásico latino adaptado al gimnasio.', ingredients: 'Arepa de maíz, pollo desmechado, aguacate', url: 'https://images.unsplash.com/photo-1551892374-ecf8754cc8b0?q=80&w=800', isSystem: true },
  { id: 'sys-br-32', type: 'image', category: 'recipe', title: 'Bocadillo de Tortilla', description: 'Clásico insuperable y saciante.', ingredients: 'Pan integral, tortilla de un huevo, tomate con aceite', url: 'https://images.unsplash.com/photo-1550507992-eb63ffee0847?q=80&w=800', isSystem: true },
  { id: 'sys-br-33', type: 'image', category: 'recipe', title: 'Smoothie Chocolate-Avellana', description: 'Sabor a Nutella pero nutritivo.', ingredients: 'Bebida de avellanas, proteína de chocolate, plátano', url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800', isSystem: true },
  { id: 'sys-br-34', type: 'image', category: 'recipe', title: 'Gofre de Avena', description: 'Textura deliciosa rica en fibra.', ingredients: 'Harina de avena, clara de huevo, chorrito de aceite de coco', url: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=800', isSystem: true },
  { id: 'sys-br-35', type: 'image', category: 'recipe', title: 'Pudding de Proteína', description: 'Post-entreno o desayuno proteico.', ingredients: 'Caseína, leche de soja, cereales integrales', url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=800', isSystem: true },

  // --- ALMUERZOS Y CENAS (36-85) ---
  { id: 'sys-lun-1', type: 'image', category: 'recipe', title: 'Pollo con Batata', description: 'Combinación estrella del fitness.', ingredients: 'Pechuga de pollo, batata asada, aceite de oliva', url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800', isSystem: true },
  { id: 'sys-lun-2', type: 'image', category: 'recipe', title: 'Pasta Integral Boloñesa', description: 'Energía sostenida y reconstrucción muscular.', ingredients: 'Pasta integral, carne picada de ternera magra, sofrito con aceite', url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800', isSystem: true },
  { id: 'sys-lun-3', type: 'image', category: 'recipe', title: 'Salmón con Quinoa', description: 'Rico en Omega-3 y aminoácidos.', ingredients: 'Salmón, quinoa, espárragos al vapor', url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=800', isSystem: true },
  { id: 'sys-lun-4', type: 'image', category: 'recipe', title: 'Ensalada de Garbanzos', description: 'Legumbres rápidas y ricas en proteína.', ingredients: 'Garbanzos, atún, aceitunas', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800', isSystem: true },
  { id: 'sys-lun-5', type: 'image', category: 'recipe', title: 'Tacos de Ternera', description: 'Disfruta de la comida mexicana de forma saludable.', ingredients: 'Tortillas de maíz, tiras de ternera, guacamole', url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=800', isSystem: true },
  { id: 'sys-lun-6', type: 'image', category: 'recipe', title: 'Poke de Atún', description: 'Inspiración hawaiana equilibrada.', ingredients: 'Arroz integral, atún fresco, edamame, aliño de sésamo', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800', isSystem: true },
  { id: 'sys-lun-7', type: 'image', category: 'recipe', title: 'Lentejas con Arroz', description: 'Proteína vegetal completa.', ingredients: 'Lentejas, arroz integral, chorrito de aceite de oliva', url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800', isSystem: true },
  { id: 'sys-lun-8', type: 'image', category: 'recipe', title: 'Pavo con Arroz Jazmín', description: 'Poca grasa y digestión rápida.', ingredients: 'Solomillo de pavo, arroz jazmín, almendras laminadas', url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=800', isSystem: true },
  { id: 'sys-lun-9', type: 'image', category: 'recipe', title: 'Berenjena Rellena', description: 'Verduras con aporte proteico.', ingredients: 'Berenjena, carne de pavo, tomate, queso gratinado', url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800', isSystem: true },
  { id: 'sys-lun-10', type: 'image', category: 'recipe', title: 'Ensalada de Pasta de Lentejas', description: 'Pasta rica en hierro y fibra.', ingredients: 'Pasta de lentejas, cherries, pesto', url: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=800', isSystem: true },
  { id: 'sys-lun-11', type: 'image', category: 'recipe', title: 'Merluza al Horno', description: 'Pescado blanco suave y ligero.', ingredients: 'Merluza, patatas panadera, aceite de oliva', url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800', isSystem: true },
  { id: 'sys-lun-12', type: 'image', category: 'recipe', title: 'Wok de Pollo y Fideos', description: 'Estilo asiático saludable.', ingredients: 'Pollo, fideos de arroz, brócoli, cacahuetes', url: 'https://images.unsplash.com/photo-1512058560550-42749359a777?q=80&w=800', isSystem: true },
  { id: 'sys-lun-13', type: 'image', category: 'recipe', title: 'Bowl de Falafel', description: 'Sabores de oriente medio.', ingredients: 'Falafel horneado, hummus, ensalada variada', url: 'https://images.unsplash.com/photo-1593001874117-c99c6ee0e02c?q=80&w=800', isSystem: true },
  { id: 'sys-lun-14', type: 'image', category: 'recipe', title: 'Hamburguesa Fit', description: 'Clásico adaptado a tus macros.', ingredients: 'Pan integral, hamburguesa de pollo, loncha de queso havarti', url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800', isSystem: true },
  { id: 'sys-lun-15', type: 'image', category: 'recipe', title: 'Albóndigas de Pollo', description: 'Bolas de proteína magra en salsa de tomate natural.', ingredients: 'Pechuga picada, tomate natural, pasta integral', url: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=800', isSystem: true },
  { id: 'sys-lun-16', type: 'image', category: 'recipe', title: 'Risotto Fit de Setas', description: 'Cremosidad sin exceso de grasas.', ingredients: 'Arroz integral, champiñones, pavo, parmesano light', url: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?q=80&w=800', isSystem: true },
  { id: 'sys-lun-17', type: 'image', category: 'recipe', title: 'Pizza de Base de Coliflor', description: 'La pizza que encaja en cualquier dieta.', ingredients: 'Coliflor, claras, atún, queso light, tomate', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800', isSystem: true },
  { id: 'sys-lun-18', type: 'image', category: 'recipe', title: 'Ternera con Brócoli', description: 'Salteado rápido estilo oriental.', ingredients: 'Tiras de ternera, brócoli, salsa de soja baja en sodio', url: 'https://images.unsplash.com/photo-1512058560550-42749359a777?q=80&w=800', isSystem: true },
  { id: 'sys-lun-19', type: 'image', category: 'recipe', title: 'Bacalao al Horno con Verduras', description: 'Ligero y lleno de micronutrientes.', ingredients: 'Bacalao, calabacín, cebolla, pimientos', url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800', isSystem: true },
  { id: 'sys-lun-20', type: 'image', category: 'recipe', title: 'Ensalada de Quinoa y Gambas', description: 'Sabor fresco para días calurosos.', ingredients: 'Quinoa, mango, gambas cocidas, cilantro', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800', isSystem: true },
  { id: 'sys-lun-21', type: 'image', category: 'recipe', title: 'Pavo con Espárragos', description: 'Cena ligera clásica.', ingredients: 'Pechuga de pavo, espárragos trigueros, quinoa', url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800', isSystem: true },
  { id: 'sys-lun-22', type: 'image', category: 'recipe', title: 'Tortilla de Patatas al Horno', description: 'Menos aceite, misma saciedad.', ingredients: 'Huevos, patatas asadas, cebolla', url: 'https://images.unsplash.com/photo-1594910350423-95240c0acc44?q=80&w=800', isSystem: true },
  { id: 'sys-lun-23', type: 'image', category: 'recipe', title: 'Tofu con Verduras', description: 'Opción vegana rica en nutrientes.', ingredients: 'Tofu firme, zanahoria, pimiento, jengibre', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800', isSystem: true },
  { id: 'sys-lun-24', type: 'image', category: 'recipe', title: 'Merluza a la Plancha', description: 'Máxima ligereza.', ingredients: 'Merluza, lechuga, tomate, aceite de oliva', url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800', isSystem: true },
  { id: 'sys-lun-25', type: 'image', category: 'recipe', title: 'Canelones de Espinacas', description: 'Pasta rellena saludable.', ingredients: 'Placas de pasta, espinacas, queso ricotta', url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800', isSystem: true },
  { id: 'sys-lun-26', type: 'image', category: 'recipe', title: 'Pollo al Limón con Cuscús', description: 'Toque cítrico y carbohidratos rápidos.', ingredients: 'Pollo, zumo de limón, cuscús integral', url: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=800', isSystem: true },
  { id: 'sys-lun-27', type: 'image', category: 'recipe', title: 'Lentejas con Verduras', description: 'Plato de cuchara reconfortante.', ingredients: 'Lentejas, patata, zanahoria, cebolla', url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800', isSystem: true },
  { id: 'sys-lun-28', type: 'image', category: 'recipe', title: 'Pasta con Gambas y Ajo', description: 'Energía y sabor.', ingredients: 'Pasta integral, gambas, ajo, guindilla', url: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=800', isSystem: true },
  { id: 'sys-lun-29', type: 'image', category: 'recipe', title: 'Brochetas de Pollo', description: 'Formato divertido para variar.', ingredients: 'Pollo, pimiento, cebolla, calabacín', url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=800', isSystem: true },
  { id: 'sys-lun-30', type: 'image', category: 'recipe', title: 'Salmón al Eneldo', description: 'Hierbas aromáticas y grasas buenas.', ingredients: 'Salmón, eneldo, patatas al vapor', url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=800', isSystem: true },
  { id: 'sys-lun-31', type: 'image', category: 'recipe', title: 'Ensalada de Lentejas y Feta', description: 'Contrastes de sabor.', ingredients: 'Lentejas cocidas, queso feta, pepino, tomate', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800', isSystem: true },
  { id: 'sys-lun-32', type: 'image', category: 'recipe', title: 'Pimientos Rellenos', description: 'Completo y visual.', ingredients: 'Pimientos, arroz, carne magra de ternera', url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800', isSystem: true },
  { id: 'sys-lun-33', type: 'image', category: 'recipe', title: 'Pollo Thai con Coco', description: 'Sabores exóticos equilibrados.', ingredients: 'Pollo, leche de coco light, arroz basmati', url: 'https://images.unsplash.com/photo-1512058560550-42749359a777?q=80&w=800', isSystem: true },
  { id: 'sys-lun-34', type: 'image', category: 'recipe', title: 'Hamburguesa de Lentejas', description: 'Alternativa vegetal a la hamburguesa.', ingredients: 'Lentejas, pan integral, hojas verdes', url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800', isSystem: true },
  { id: 'sys-lun-35', type: 'image', category: 'recipe', title: 'Crema de Calabaza con Huevo', description: 'Cena caliente y nutritiva.', ingredients: 'Calabaza, cebolla, huevo poché', url: 'https://images.unsplash.com/photo-1547514701-42782101795e?q=80&w=800', isSystem: true },
  { id: 'sys-lun-36', type: 'image', category: 'recipe', title: 'Fajitas de Pavo', description: 'Ideal para compartir.', ingredients: 'Tortillas, tiras de pavo, pimiento, cebolla', url: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?q=80&w=800', isSystem: true },
  { id: 'sys-lun-37', type: 'image', category: 'recipe', title: 'Ensalada de Pasta y Pollo', description: 'Clásico de túper.', ingredients: 'Pasta integral, pechuga, maíz, olivas', url: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=800', isSystem: true },
  { id: 'sys-lun-38', type: 'image', category: 'recipe', title: 'Salmón en Papillote', description: 'Jugosidad máxima.', ingredients: 'Salmón, verduras variadas, patata tierna', url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=800', isSystem: true },
  { id: 'sys-lun-39', type: 'image', category: 'recipe', title: 'Ratatouille con Huevo', description: 'Un plato de película.', ingredients: 'Calabacín, berenjena, tomate, huevo', url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800', isSystem: true },
  { id: 'sys-lun-40', type: 'image', category: 'recipe', title: 'Sushi Casero Fit', description: 'Controla el azúcar del arroz.', ingredients: 'Arroz, alga nori, salmón, pepino', url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800', isSystem: true },
  { id: 'sys-lun-41', type: 'image', category: 'recipe', title: 'Pollo al Horno con Hierbas', description: 'Sencillo y efectivo.', ingredients: 'Pollo troceado, patatas, romero, ajo', url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800', isSystem: true },
  { id: 'sys-lun-42', type: 'image', category: 'recipe', title: 'Ensalada de Garbanzos y Pepino', description: 'Proteína vegetal rápida.', ingredients: 'Garbanzos, pepino, cebolla roja, perejil', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800', isSystem: true },
  { id: 'sys-lun-43', type: 'image', category: 'recipe', title: 'Lasaña de Calabacín', description: 'Baja en carbos.', ingredients: 'Láminas de calabacín, carne picada magra, queso light', url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800', isSystem: true },
  { id: 'sys-lun-44', type: 'image', category: 'recipe', title: 'Ensalada César Saludable', description: 'Sin salsas industriales.', ingredients: 'Lechuga, pollo, yogur (aliño), picatostes integrales', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800', isSystem: true },
  { id: 'sys-lun-45', type: 'image', category: 'recipe', title: 'Guiso de Pavo', description: 'Tradición en modo fit.', ingredients: 'Pavo, champiñones, zanahoria, vino blanco', url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=800', isSystem: true },
  { id: 'sys-lun-46', type: 'image', category: 'recipe', title: 'Tortilla de Gambas', description: 'Proteína pura.', ingredients: 'Claras de huevo, gambas, ajetes tiernos', url: 'https://images.unsplash.com/photo-1594910350423-95240c0acc44?q=80&w=800', isSystem: true },
  { id: 'sys-lun-47', type: 'image', category: 'recipe', title: 'Pollo al Curry', description: 'Metabolismo activo.', ingredients: 'Pollo, curry, leche de coco, arroz integral', url: 'https://images.unsplash.com/photo-1512058560550-42749359a777?q=80&w=800', isSystem: true },
  { id: 'sys-lun-48', type: 'image', category: 'recipe', title: 'Pescado Blanco con Puré', description: 'Fácil de digerir.', ingredients: 'Merluza, puré de guisantes, patata', url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800', isSystem: true },
  { id: 'sys-lun-49', type: 'image', category: 'recipe', title: 'Secrego de Cerdo Magro', description: 'Grasas de calidad con moderación.', ingredients: 'Secreto de cerdo (limpio), piña a la brasa, ensalada', url: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=800', isSystem: true },
  { id: 'sys-lun-50', type: 'image', category: 'recipe', title: 'Burrito Bowl', description: 'Todo el sabor sin la tortilla.', ingredients: 'Arroz basmati, carne magra, frijoles, maíz', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800', isSystem: true },


  // --- SNACKS Y POST-ENTRENO (86-100) ---
  { id: 'sys-snack-1', type: 'image', category: 'recipe', title: 'Manzana y Proteína', description: 'Combo equilibrado de carbos y grasa.', ingredients: 'Manzana, crema de almendras, batido de proteína', url: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=800', isSystem: true },
  { id: 'sys-snack-2', type: 'image', category: 'recipe', title: 'Tortitas de Arroz Pack', description: 'Snack rápido post-entreno.', ingredients: 'Tortitas de arroz, pavo, aguacate', url: 'https://images.unsplash.com/photo-1599490659213-e2b9527bb087?q=80&w=800', isSystem: true },
  { id: 'sys-snack-3', type: 'image', category: 'recipe', title: 'Rollitos de Jamón y Nueces', description: 'Grasas y proteína rápida.', ingredients: 'Jamón serrano sin grasa, palitos de pan integral, nueces', url: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=800', isSystem: true },
  { id: 'sys-snack-4', type: 'image', category: 'recipe', title: 'Copa Fit de Requesón', description: 'Saciante y proteico.', ingredients: 'Queso batido, copos de avena, crema de cacahuete', url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=800', isSystem: true },
  { id: 'sys-snack-5', type: 'image', category: 'recipe', title: 'Edamame y Fruta', description: 'Proteína vegetal de alta calidad.', ingredients: 'Edamame al vapor, mandarina', url: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?q=80&w=800', isSystem: true },
  { id: 'sys-snack-6', type: 'image', category: 'recipe', title: 'Hummus con Colines', description: 'Fibras y grasas saludables.', ingredients: 'Bastones de pan integral, hummus de garbanzo', url: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=800', isSystem: true },
  { id: 'sys-snack-7', type: 'image', category: 'recipe', title: 'Batido "Snickers" Saludable', description: 'Sabor espectacular e inteligente.', ingredients: 'Leche, dátil, cacao, crema de cacahuete', url: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800', isSystem: true },
  { id: 'sys-snack-8', type: 'image', category: 'recipe', title: 'Yogur de Soja con Semillas', description: '100% vegetal con omega-3.', ingredients: 'Yogur de soja, media pera, semillas de chía', url: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?q=80&w=800', isSystem: true },
  { id: 'sys-snack-9', type: 'image', category: 'recipe', title: 'Tostadita de Requesón', description: 'Pequeño bocado proteico.', ingredients: 'Pan de centeno, requesón, nuez', url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800', isSystem: true },
  { id: 'sys-snack-10', type: 'image', category: 'recipe', title: 'Huevo y Fruta rápida', description: 'Nutrición básica y efectiva.', ingredients: 'Huevo duro, plátano pequeño', url: 'https://images.unsplash.com/photo-1594910350423-95240c0acc44?q=80&w=800', isSystem: true },
  { id: 'sys-snack-11', type: 'image', category: 'recipe', title: 'Barrita de Proteína Casera', description: 'Control de ingredientes máximo.', ingredients: 'Proteína en polvo, harina de coco, sirope de ágave', url: 'https://images.unsplash.com/photo-1505252822730-804910e53a25?q=80&w=800', isSystem: true },
  { id: 'sys-snack-12', type: 'image', category: 'recipe', title: 'Cottage con Piña', description: 'Diurético y proteico.', ingredients: 'Queso cottage, piña natural, almendras', url: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?q=80&w=800', isSystem: true },
  { id: 'sys-snack-13', type: 'image', category: 'recipe', title: 'Tortitas de Avena y Claras', description: 'Snack horneado rico en fibra.', ingredients: 'Harina de avena, claras, canela, stevia', url: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?q=80&w=800', isSystem: true },
  { id: 'sys-snack-14', type: 'image', category: 'recipe', title: 'Yogur con Frutos Secos', description: 'Energía rápida y duradera.', ingredients: 'Yogur natural 0%, nueces, almendras, semillas', url: 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?q=80&w=800', isSystem: true },
  { id: 'sys-snack-15', type: 'image', category: 'recipe', title: 'Fruta con Queso Fresco', description: 'El snack más equilibrado.', ingredients: 'Manzana o pera, queso fresco tipo Burgos', url: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?q=80&w=800', isSystem: true }
];

// ============================================
// MEDIA LIBRARY
// ============================================

const Media = {
  getAll: () => {
    const data = getData();
    const personal = data.media || [];
    const personalIds = new Set(personal.map(m => m.id));
    // Priorizamos personales. Si existe una versión personal del ID del sistema, se ignora la del sistema.
    return [...personal, ...SYSTEM_MEDIA.filter(m => !personalIds.has(m.id))];
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
        
        const currentTitle = data.media[index].title.toLowerCase().trim();
        const currentId = data.media[index].id;
        data.media = data.media.filter(m => m.id == currentId || m.title.toLowerCase().trim() !== currentTitle);
        
        index = data.media.findIndex(m => m.id == currentId);
        itemToSync = data.media[index];
    }

    // --- SINCRONIZACIÓN PROFUNDA HACIA GRUPOS MUSCULARES ---
    if (itemToSync && itemToSync.category === 'exercise') {
        const newTitle = itemToSync.title;
        const newUrl = itemToSync.url;
        const searchTitle = (oldTitle || newTitle).toLowerCase().trim();
        
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
        // Limpiamos CUALQUIER duplicado por título en la biblioteca personal
        // Excepto el que vamos a actualizar (si ya es personal)
        data.media = personalMedia.filter(m => 
            m.title.toLowerCase().trim() !== cleanName || m.id === existing.id
        );

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
    return true;
  } catch (e) {
    console.error('Error importing data:', e);
    return false;
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
// Exportar funciones críticas al ámbito global
window.getData = getData;
window.saveData = saveData;
window.SYSTEM_MEDIA = SYSTEM_MEDIA;
window.Media = Media;
window.Foods = Foods;
window.Diets = Diets;
window.Routines = Routines;
window.Clients = Clients;
window.Feedbacks = Feedbacks;
window.Appointments = Appointments;
