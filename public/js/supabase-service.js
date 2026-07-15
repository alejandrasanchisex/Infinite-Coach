
// 🛡️ HELPERS DE ALMACENAMIENTO SEGUROS A PRUEBA DE CUOTA, COOKIES BLOQUEADAS Y EXCEPCIONES
function safeGetLocalStorage(key) {
    try {
        if (typeof localStorage !== 'undefined' && localStorage) {
            return localStorage.getItem(key);
        }
    } catch(e) {}
    return null;
}
function safeGetSessionStorage(key) {
    try {
        if (typeof sessionStorage !== 'undefined' && sessionStorage) {
            return sessionStorage.getItem(key);
        }
    } catch(e) {}
    return null;
}

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
        
        const clientOptions = {};
        const isClientPage = typeof window !== 'undefined' && 
            window.location && 
            window.location.pathname && 
            !window.location.pathname.includes('trainer-') && 
            !window.location.pathname.includes('admin-');
            
        if (isClientPage) {
            console.log("ℹ️ [Supabase Client] Configurando cliente sin persistencia de sesión para página de clientes.");
            clientOptions.auth = {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
            };
        }

        this.client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, clientOptions);
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
            const isTrainer = (safeGetLocalStorage('_trainerAuthed') === '1' || safeGetSessionStorage('_trainerAuthed') === '1');
            const clientId = (safeGetLocalStorage('clientId') || safeGetSessionStorage('clientId'));

            let cloudData = null;

            // 1. Unificar las lecturas de la nube (reset check, clients check, brand check) en una sola consulta
            if (trainerId && trainerId !== 'default') {
                try {
                    const fetchProfile = async () => {
                        const { data, error } = await this.client
                            .from('trainer_profiles')
                            .select('full_data')
                            .eq('trainer_id', trainerId)
                            .single();
                        if (error && error.code !== 'PGRST116') throw error;
                        return data ? data.full_data : null;
                    };
                    cloudData = await retryOp(fetchProfile, 3, 1000);
                } catch (errFetch) {
                    console.warn("[saveTrainerData] Error pre-cargando perfil de la nube:", errFetch);
                }
            }

            // 2. Ejecutar Reset Check con la información cargada
            if (cloudData && cloudData.__reset_version) {
                const cloudReset = cloudData.__reset_version;
                const localReset = fullData ? fullData.__reset_version : null;
                if (String(localReset) !== String(cloudReset)) {
                    console.error(`🚨 [RESET DB SHIELD] GUARDADO BLOQUEADO: La nube tiene un reset v${cloudReset} y el cliente intentó guardar v${localReset}. Descartando guardado.`);
                    return false; 
                }
            }

            // 3. Ejecutar Cortafuegos Multi-inquilino de Cliente
            if (!isTrainer && clientId) {
                if (!cloudData || !cloudData.clients) {
                    console.error("🚨 [CORTAFUEGOS SUPABASE] ABORTANDO GUARDADO: No se pudieron obtener los datos válidos del entrenador de la nube.");
                    return false;
                }
                
                console.log("🛡️ [Fusión Cliente Cortafuegos] Fusionando cambios del cliente en el perfil completo del entrenador...");
                const merged = { ...cloudData };
                
                if (merged.clients && fullData.clients) {
                    const localClient = fullData.clients.find(c => c.id === clientId);
                    if (localClient) {
                        merged.clients = merged.clients.map(c => c.id === clientId ? localClient : c);
                    }
                }
                
                const clientSpecificCols = ['feedbacks', 'appointments', 'trainingLogs', 'habits'];
                clientSpecificCols.forEach(col => {
                    if (fullData[col]) {
                        const otherClientsItems = (merged[col] || []).filter(item => item.clientId !== clientId);
                        const localClientItems = fullData[col].filter(item => item.clientId === clientId);
                        merged[col] = [...otherClientsItems, ...localClientItems];
                    }
                });
                
                fullData = merged;

                const clientsList = fullData.clients || [];
                const clientExists = clientsList.some(c => c.id === clientId);
                if (!clientExists) {
                    console.error(`🚨 [CORTAFUEGOS SUPABASE] INTENTO DE ACCESO NO AUTORIZADO BLOQUEADO: El cliente ${clientId} no pertenece a ${trainerId}.`);
                    return false;
                }
            }

            // 4. Cortafuegos ASTEAM
            if (trainerId === 't-w0iybl7qb' && fullData) {
                console.log("🛡️ [ASTEAM CORTAFUEGOS] Aplicando sanitización estricta...");
                if (fullData.clients) {
                    fullData.clients.forEach(c => {
                        if (c.id === '20f2e6c2-2699-4ccc-a982-1e9fb141b9bb' || c.id === '0db0ea7a-c413-44cb-b99e-dfd9790383eb') {
                            const fee = parseFloat(c.monthlyFee);
                            const sub = parseFloat(c.subscriptionAmount);
                            if (isNaN(fee) || fee === 0) c.monthlyFee = 65;
                            if (isNaN(sub) || sub === 0) c.subscriptionAmount = 65;
                        }
                    });
                }
                if (fullData.feedbacks) {
                    fullData.feedbacks = fullData.feedbacks.filter(f => !String(f.id).startsWith('fb-demo'));
                }
                if (fullData.invoices) {
                    fullData.invoices = fullData.invoices.filter(i => !String(i.id).startsWith('inv-'));
                }
            }

            // 5. Blindaje de datos vacíos
            const dataIsEmpty = (
                (!fullData.clients || fullData.clients.length === 0) &&
                (!fullData.routines || fullData.routines.length === 0) &&
                (!fullData.trainingBlocks || fullData.trainingBlocks.length === 0)
            );
            
            if (dataIsEmpty) {
                if (cloudData) {
                    const cloudHasData = (
                        (cloudData.clients && cloudData.clients.length > 0) ||
                        (cloudData.routines && cloudData.routines.length > 0) ||
                        (cloudData.trainingBlocks && cloudData.trainingBlocks.length > 0)
                    );
                    if (cloudHasData) {
                        console.error('🚨 [BLINDAJE SUPABASE] BLOQUEADO: Intento de sobrescribir datos reales en la nube con datos vacíos.');
                        return false;
                    }
                } else {
                    return false;
                }
            }

            // 6. Colisiones de accesos (Solo para entrenadores al crear o editar clientes en lote)
            if (isTrainer && fullData && fullData.clients && fullData.clients.length > 0 && trainerId !== 'default') {
                try {
                    const { data: otherProfiles, error: fetchErr } = await this.client
                        .from('trainer_profiles')
                        .select('trainer_id, clients:full_data->clients')
                        .neq('trainer_id', trainerId);

                    if (!fetchErr && otherProfiles) {
                        const otherClientIds = new Map();
                        const otherAccessCodes = new Map();

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
                            if (c.id && otherClientIds.has(c.id)) {
                                console.error(`🚨 [SEGURIDAD MULTI-INQUILINO] Conflicto de ID de cliente.`);
                                hasConflict = true;
                                return false;
                            }
                            if (cleanCode && otherAccessCodes.has(cleanCode)) {
                                console.error(`🚨 [SEGURIDAD MULTI-INQUILINO] Conflicto de Código de Acceso.`);
                                hasConflict = true;
                                return false;
                            }
                            return true;
                        });

                        if (hasConflict) {
                            if (typeof localStorage !== 'undefined') {
                                const sKey = `fitnessAppData_${trainerId}`;
                                const localRaw = safeGetSessionStorage(sKey) || safeGetLocalStorage(sKey);
                                if (localRaw) {
                                    try {
                                        const localData = JSON.parse(localRaw);
                                        localData.clients = fullData.clients;
                                        localData.lastModified = new Date().toISOString();
                                        localStorage.setItem(sKey, JSON.stringify(localData));
                                    } catch(e) {}
                                }
                            }
                        }
                    }
                } catch (errCheck) {
                    console.warn('[SEGURIDAD MULTI-INQUILINO] Error verificando colisiones:', errCheck);
                }
            }

            // 7. Preservar marca si es cliente
            if (!isTrainer && cloudData && cloudData.brand) {
                fullData.brand = cloudData.brand;
            }

            // 8. Upsert final
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
            throw error;
        }
    }
};

window.SupabaseService = SupabaseService;
