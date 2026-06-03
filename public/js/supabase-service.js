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
