/**
 * SUPABASE SERVICE (Vanilla JS)
 * Gestión de base de datos y almacenamiento en la nube profesional.
 */

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";

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
            const { data, error } = await this.client
                .from('trainer_profiles')
                .select('full_data')
                .eq('trainer_id', trainerId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // No existe registro aún
                throw error;
            }
            return data.full_data;
        } catch (error) {
            console.error("Error cargando desde Supabase:", error);
            return null;
        }
    },

    /**
     * Guarda los datos completos del entrenador en la nube (Persistencia Profesional)
     */
    async saveTrainerData(trainerId, fullData) {
        if (!this.client) this.init();
        try {
            // 🛡️ CORTAFUEGOS ASTEAM: Evitar contaminación con datos de prueba
            if (trainerId === 't-w0iybl7qb' && fullData) {
                console.log("🛡️ [ASTEAM CORTAFUEGOS] Aplicando sanitización estricta...");
                const realClientIds = ['0db0ea7a-c413-44cb-b99e-dfd9790383eb', '20f2e6c2-2699-4ccc-a982-1e9fb141b9bb'];
                
                if (fullData.clients) {
                    fullData.clients = fullData.clients.filter(c => realClientIds.includes(c.id));
                    fullData.clients.forEach(c => {
                        if (c.id === '0db0ea7a-c413-44cb-b99e-dfd9790383eb') {
                            c.monthlyFee = 65;
                            c.subscriptionAmount = 65;
                        } else if (c.id === '20f2e6c2-2699-4ccc-a982-1e9fb141b9bb') {
                            c.monthlyFee = 0;
                            c.subscriptionAmount = 0;
                        }
                    });
                }
                
                const collectionsToFilter = ['feedbacks', 'appointments', 'invoices', 'trainingLogs', 'habits', 'trainingBlocks'];
                collectionsToFilter.forEach(col => {
                    if (fullData[col]) {
                        fullData[col] = fullData[col].filter(item => realClientIds.includes(item.clientId));
                    }
                });
                
                // Filtrar revisiones y facturas de prueba específicamente
                const realFeedbackIds = [
                    'bafc9306-f61b-4279-b461-24844f9bcaad',
                    '61428dc6-9fcb-4bb0-8e67-e15711020332',
                    '5d1e18c9-1216-44ca-b674-092802512f90',
                    '0f15956a-78f8-4f38-92e8-e7ffd49bfbf0',
                    'f70cac01-4d9f-4c90-aacc-c32df25e7fab'
                ];
                if (fullData.feedbacks) {
                    fullData.feedbacks = fullData.feedbacks.filter(f => realFeedbackIds.includes(f.id));
                }
                if (fullData.invoices) {
                    fullData.invoices = fullData.invoices.filter(i => !String(i.id).startsWith('inv-'));
                }
                
                if (fullData.diets) {
                    fullData.diets = fullData.diets.filter(d => !d.clientId || realClientIds.includes(d.clientId) || d.isTemplate);
                }
                if (fullData.routines) {
                    fullData.routines = fullData.routines.filter(r => !r.clientId || realClientIds.includes(r.clientId) || r.isTemplate);
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
                        .select('full_data')
                        .eq('trainer_id', trainerId)
                        .single();
                    
                    if (cloudProfile && cloudProfile.full_data) {
                        const cloudHasData = (
                            (cloudProfile.full_data.clients && cloudProfile.full_data.clients.length > 0) ||
                            (cloudProfile.full_data.routines && cloudProfile.full_data.routines.length > 0) ||
                            (cloudProfile.full_data.trainingBlocks && cloudProfile.full_data.trainingBlocks.length > 0)
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
                        .select('trainer_id, full_data')
                        .neq('trainer_id', trainerId);

                    if (!fetchErr && otherProfiles) {
                        const otherClientIds = new Map(); // id -> trainer_id
                        const otherAccessCodes = new Map(); // accessCode -> trainer_id

                        otherProfiles.forEach(p => {
                            const clients = (p.full_data && p.full_data.clients) || [];
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
            const isTrainer = typeof localStorage !== 'undefined' && localStorage.getItem('_trainerAuthed') === '1';
            if (!isTrainer && trainerId !== 'default') {
                try {
                    const { data: cloudProfile } = await this.client
                        .from('trainer_profiles')
                        .select('full_data')
                        .eq('trainer_id', trainerId)
                        .single();
                    
                    if (cloudProfile && cloudProfile.full_data && cloudProfile.full_data.brand) {
                        console.log("💾 Sincronización de Cliente: Preservando configuración de marca de la nube.");
                        fullData.brand = cloudProfile.full_data.brand;
                    }
                } catch (errFetch) {
                    console.warn("No se pudo pre-cargar la marca de la nube para fusionar:", errFetch);
                }
            }

            const { error } = await this.client
                .from('trainer_profiles')
                .upsert({ 
                    trainer_id: trainerId, 
                    full_data: fullData,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'trainer_id' });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error("Error guardando en Supabase DB:", error);
            return false;
        }
    },

    /**
     * Gestión del Panel Maestro (SaaS Global Config)
     */
    async getGlobalConfig() {
        if (!this.client) this.init();
        try {
            const { data, error } = await this.client
                .from('saas_config')
                .select('data')
                .eq('id', 'config')
                .single();
            if (error) throw error;
            return data.data;
        } catch (e) { return null; }
    },

    async saveGlobalConfig(configData) {
        if (!this.client) this.init();
        try {
            const { error } = await this.client
                .from('saas_config')
                .upsert({ id: 'config', data: configData, updated_at: new Date().toISOString() });
            if (error) throw error;
            return true;
        } catch (e) { return false; }
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
