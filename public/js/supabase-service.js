/**
 * SUPABASE SERVICE (Vanilla JS)
 * Gestión de base de datos y almacenamiento en la nube profesional.
 */

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function retryOp(operation, maxAttempts = 3, initialDelay = 1000) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (err) {
            lastError = err;
            console.warn(`[Supabase Retry] Attempt ${attempt}/${maxAttempts} failed:`, err.message || err);
            if (attempt < maxAttempts) {
                await delay(initialDelay * Math.pow(2, attempt - 1));
            }
        }
    }
    throw lastError;
}

const SupabaseService = {
    client: null,

    init() {
        if (typeof supabase === 'undefined') {
            console.error("Supabase SDK no cargado.");
            return false;
        }
        if (this.client) return true; // Prevenir múltiples instancias
        this.client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("Supabase listo ✅");
        return true;
    },

    /**
     * Obtiene los datos completos del entrenador desde la base de datos SQL
     */
    async getTrainerData(trainerId) {
        if (!this.client) this.init();
        try {
            const runQuery = async () => {
                const { data, error } = await this.client
                    .from('trainer_profiles')
                    .select('full_data')
                    .eq('trainer_id', trainerId)
                    .single();

                if (error) {
                    if (error.code === 'PGRST116') return { full_data: null }; // Retornar envoltura para PGRST116
                    throw error;
                }
                return data;
            };

            const result = await retryOp(runQuery, 3, 1000);
            if (!result || !result.full_data) return null;

            const fd = result.full_data;
            if (trainerId === 't-w0iybl7qb' && fd && fd.clients) {
                fd.clients.forEach(c => {
                    if (c.id === '20f2e6c2-2699-4ccc-a982-1e9fb141b9bb' || c.id === '0db0ea7a-c413-44cb-b99e-dfd9790383eb') {
                        if (!c.monthlyFee || c.monthlyFee === 0) c.monthlyFee = 65;
                        if (!c.subscriptionAmount || c.subscriptionAmount === 0) c.subscriptionAmount = 65;
                    }
                });
            }
            return fd;
        } catch (error) {
            console.error("Error cargando desde Supabase despues de reintentos:", error);
            return null;
        }
    },

    /**
     * Guarda los datos completos del entrenador en la nube (Persistencia Profesional)
     */
    async saveTrainerData(trainerId, fullData) {
        if (!this.client) this.init();
        try {
            // 🛡️ RESET BLINDAJE GLOBAL: Bloquear escrituras de sesiones obsoletas que intentan pisar un reset limpio
            if (trainerId && trainerId !== 'default') {
                try {
                    const fetchResetProfile = async () => {
                        const { data, error } = await this.client
                            .from('trainer_profiles')
                            .select('reset_version:full_data->__reset_version')
                            .eq('trainer_id', trainerId)
                            .single();
                        if (error && error.code !== 'PGRST116') throw error;
                        return data;
                    };
                    const cloudProfile = await retryOp(fetchResetProfile, 3, 1000);
                    
                    if (cloudProfile && cloudProfile.reset_version) {
                        const cloudReset = cloudProfile.reset_version;
                        const localReset = fullData ? fullData.__reset_version : null;
                        if (String(localReset) !== String(cloudReset)) {
                            console.error(`🚨 [RESET DB SHIELD] GUARDADO BLOQUEADO: La nube tiene un reset v${cloudReset} y el cliente intentó guardar v${localReset}. Descartando guardado para evitar restaurar datos borrados.`);
                            return false; 
                        }
                    }
                } catch (errResetCheck) {
                    console.warn("[RESET DB SHIELD] Error en la verificación de reset, continuando...", errResetCheck);
                }
            }
            // 🛡️ CORTAFUEGOS MULTI-INQUILINO (CATASTRÓFICO):
            // Si el que guarda es un cliente, verificar que el clientId que realiza la operación realmente exista en el array de clients del trainerId al que intenta guardar
            const isTrainer = typeof localStorage !== 'undefined' && localStorage.getItem('_trainerAuthed') === '1';
            const clientId = typeof localStorage !== 'undefined' ? (localStorage.getItem('clientId') || sessionStorage.getItem('clientId')) : null;
            
            if (!isTrainer && clientId) {
                const clientsList = (fullData && fullData.clients) || [];
                const clientExists = clientsList.some(c => c.id === clientId);
                if (!clientExists) {
                    console.error(`🚨 [CORTAFUEGOS SUPABASE] INTENTO DE ACCESO NO AUTORIZADO BLOQUEADO: El cliente ${clientId} intentó guardar datos en el perfil del entrenador ${trainerId}, al cual no pertenece.`);
                    return false;
                }
            }
            // 🛡️ CORTAFUEGOS ASTEAM: Evitar contaminación con datos de prueba
            if (trainerId === 't-w0iybl7qb' && fullData) {
                console.log("🛡️ [ASTEAM CORTAFUEGOS] Aplicando sanitización estricta...");
                
                if (fullData.clients) {
                    // 🛡️ ENFORCE FEES FOR ASTEAM CLIENTS (AMALIA AND FERNANDO)
                    fullData.clients.forEach(c => {
                        if (c.id === '20f2e6c2-2699-4ccc-a982-1e9fb141b9bb' || c.id === '0db0ea7a-c413-44cb-b99e-dfd9790383eb') {
                            const fee = parseFloat(c.monthlyFee);
                            const sub = parseFloat(c.subscriptionAmount);
                            if (isNaN(fee) || fee === 0) c.monthlyFee = 65;
                            if (isNaN(sub) || sub === 0) c.subscriptionAmount = 65;
                        }
                    });
                }
                
                // Filtrar revisiones de prueba específicamente (conservando las reales)
                if (fullData.feedbacks) {
                    fullData.feedbacks = fullData.feedbacks.filter(f => !String(f.id).startsWith('fb-demo'));
                }
                if (fullData.invoices) {
                    fullData.invoices = fullData.invoices.filter(i => !String(i.id).startsWith('inv-'));
                }
            }

            // 🛡️ BLINDAJE SUPABASE: Nunca guardar datos vacíos que destruirían datos reales en la nube
            const dataIsEmpty = (
                (!fullData.clients || fullData.clients.length === 0) &&
                (!fullData.routines || fullData.routines.length === 0) &&
                (!fullData.trainingBlocks || fullData.trainingBlocks.length === 0)
            );
            
            if (dataIsEmpty) {
                // Verificar si la nube tiene datos reales antes de sobrescribir
                try {
                    const { data: cloudProfile } = await this.client
                        .from('trainer_profiles')
                        .select('clients:full_data->clients, routines:full_data->routines, trainingBlocks:full_data->trainingBlocks')
                        .eq('trainer_id', trainerId)
                        .single();
                    
                    if (cloudProfile) {
                        const cloudHasData = (
                            (cloudProfile.clients && cloudProfile.clients.length > 0) ||
                            (cloudProfile.routines && cloudProfile.routines.length > 0) ||
                            (cloudProfile.trainingBlocks && cloudProfile.trainingBlocks.length > 0)
                        );
                        if (cloudHasData) {
                            console.error('🚨 [BLINDAJE SUPABASE] BLOQUEADO: Intento de sobrescribir datos reales en la nube con datos vacíos. Operación cancelada para proteger los datos.');
                            return false;
                        }
                    }
                } catch (cloudCheckErr) {
                    // Si no podemos verificar, mejor no guardar datos vacíos
                    console.warn('[BLINDAJE SUPABASE] No se pudo verificar la nube. Guardado de datos vacíos cancelado por precaución.', cloudCheckErr);
                    return false;
                }
            }

            // --- DETECTAR Y PREVENIR DUPLICADOS DE CLIENTES MULTI-INQUILINO ---
            if (fullData && fullData.clients && fullData.clients.length > 0 && trainerId !== 'default') {
                try {
                    // Fetch all other trainer profiles from Supabase to check for collisions
                    const { data: otherProfiles, error: fetchErr } = await this.client
                        .from('trainer_profiles')
                        .select('trainer_id, clients:full_data->clients')
                        .neq('trainer_id', trainerId);

                    if (!fetchErr && otherProfiles) {
                        const otherClientIds = new Map(); // id -> trainer_id
                        const otherAccessCodes = new Map(); // accessCode -> trainer_id

                        otherProfiles.forEach(p => {
                            const clients = p.clients || [];
                            clients.forEach(c => {
                                if (c.id) otherClientIds.set(c.id, p.trainer_id);
                                if (c.accessCode) {
                                    otherAccessCodes.set(c.accessCode.trim().toUpperCase(), p.trainer_id);
                                }
                            });
                        });

                        const initialCount = fullData.clients.length;
                        let hasConflict = false;

                        fullData.clients = fullData.clients.filter(c => {
                            const cleanCode = (c.accessCode || '').trim().toUpperCase();

                            // Check ID collision
                            if (c.id && otherClientIds.has(c.id)) {
                                const ownerTrainer = otherClientIds.get(c.id);
                                console.error(`🚨 [SEGURIDAD MULTI-INQUILINO] Conflicto de Cliente detectado. El cliente "${c.name}" (ID: ${c.id}) ya pertenece al entrenador "${ownerTrainer}". Se eliminará del perfil actual ("${trainerId}").`);
                                hasConflict = true;
                                return false;
                            }

                            // Check Access Code collision
                            if (cleanCode && otherAccessCodes.has(cleanCode)) {
                                const ownerTrainer = otherAccessCodes.get(cleanCode);
                                console.error(`🚨 [SEGURIDAD MULTI-INQUILINO] Conflicto de Código de Acceso detectado. El cliente "${c.name}" (Código: ${cleanCode}) tiene un código asignado al entrenador "${ownerTrainer}". Se eliminará del perfil actual ("${trainerId}").`);
                                hasConflict = true;
                                return false;
                            }

                            return true;
                        });

                        if (hasConflict) {
                            console.warn(`⚠️ Se filtraron ${initialCount - fullData.clients.length} clientes duplicados para evitar contaminación cruzada.`);
                            
                            // Actualizar local storage en caliente para evitar bucles de carga
                            if (typeof localStorage !== 'undefined') {
                                const sKey = `fitnessAppData_${trainerId}`;
                                const localRaw = localStorage.getItem(sKey);
                                if (localRaw) {
                                    try {
                                        const localData = JSON.parse(localRaw);
                                        localData.clients = fullData.clients;
                                        localData.lastModified = new Date().toISOString();
                                        localStorage.setItem(sKey, JSON.stringify(localData));
                                        console.log(`✅ LocalStorage de ${trainerId} corregido y limpiado.`);
                                    } catch(e) {
                                        console.warn("No se pudo actualizar el localStorage con los clientes limpios:", e);
                                    }
                                }
                            }
                        }
                    }
                } catch (errCheck) {
                    console.warn('[SEGURIDAD MULTI-INQUILINO] Error verificando colisiones cruzadas, continuando guardado normal por seguridad:', errCheck);
                }
            }

            // Si el que guarda es un cliente, preservar la configuración de marca del entrenador de la nube
            if (!isTrainer && trainerId !== 'default') {
                try {
                    const fetchBrandProfile = async () => {
                        const { data, error } = await this.client
                            .from('trainer_profiles')
                            .select('brand:full_data->brand')
                            .eq('trainer_id', trainerId)
                            .single();
                        if (error && error.code !== 'PGRST116') throw error;
                        return data;
                    };
                    const cloudProfile = await retryOp(fetchBrandProfile, 3, 1000);
                    
                    if (cloudProfile && cloudProfile.brand) {
                        console.log("💾 Sincronización de Cliente: Preservando configuración de marca de la nube.");
                        fullData.brand = cloudProfile.brand;
                    }
                } catch (errFetch) {
                    console.warn("No se pudo pre-cargar la marca de la nube para fusionar:", errFetch);
                }
            }

            const runUpsert = async () => {
                const { error } = await this.client
                    .from('trainer_profiles')
                    .upsert({ 
                        trainer_id: trainerId, 
                        full_data: fullData,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'trainer_id' });

                if (error) throw error;
                return true;
            };

            await retryOp(runUpsert, 3, 1000);
            return true;
        } catch (error) {
            console.error("Error guardando en Supabase DB despues de reintentos:", error);
            return false;
        }
    },

    /**
     * Gestión del Panel Maestro (SaaS Global Config)
     */
    async getGlobalConfig() {
        if (!this.client) this.init();
        try {
            const fetchConfig = async () => {
                const { data, error } = await this.client
                    .from('saas_config')
                    .select('data')
                    .eq('id', 'config')
                    .single();
                if (error) throw error;
                return data;
            };
            const result = await retryOp(fetchConfig, 3, 1000);
            return result ? result.data : null;
        } catch (e) { 
            console.error("Error cargando config global desde Supabase:", e);
            return null; 
        }
    },

    async saveGlobalConfig(configData) {
        if (!this.client) this.init();
        try {
            const runUpsert = async () => {
                const { error } = await this.client
                    .from('saas_config')
                    .upsert({ id: 'config', data: configData, updated_at: new Date().toISOString() });
                if (error) throw error;
                return true;
            };
            await retryOp(runUpsert, 3, 1000);
            return true;
        } catch (e) { 
            console.error("Error guardando config global en Supabase:", e);
            return false; 
        }
    },

    /**
     * Sube un archivo a un bucket de Supabase Storage
     * @param {File} file - El archivo a subir
     * @param {String} bucket - Nombre del bucket (ej: 'media')
     */
    async uploadFile(file, bucket = 'Media') {
        if (!this.client) this.init();
        
        try {
            // Sanitizar nombre de archivo (Ultra-agresivo para evitar errores de Supabase)
            const cleanName = (file.name || 'upload.jpg')
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar acentos y ñ
                .replace(/\s+/g, '_') // Espacios por guiones bajos
                .replace(/[^a-zA-Z0-9._-]/g, ''); // Quitar todo lo que no sea seguro
            
            const fileName = `${Date.now()}_${cleanName}`;
            console.log(`🚀 Iniciando subida a Supabase Bucket 'Media': ${fileName}`);

            const { data, error } = await this.client.storage
                .from(bucket)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error("❌ Error de Supabase Storage:", error);
                throw error;
            }

            console.log("✅ Archivo subido, obteniendo URL pública...");

            // Obtener la URL pública del archivo subido
            const { data: urlData } = this.client.storage
                .from(bucket)
                .getPublicUrl(fileName);

            console.log("🔗 URL Pública:", urlData.publicUrl);
            return urlData.publicUrl;
        } catch (error) {
            console.error("❌ Error crítico subiendo a Supabase Storage:", error);
            return null;
        }
    }
};

window.SupabaseService = SupabaseService;
