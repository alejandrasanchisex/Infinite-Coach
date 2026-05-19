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
            // Sanitizar nombre de archivo (quitar espacios y caracteres especiales)
            const cleanName = (file.name || 'upload.jpg')
                .replace(/\s+/g, '_')
                .replace(/[^a-zA-Z0-9._-]/g, '');
            
            const fileName = `${Date.now()}_${cleanName}`;
            console.log(`📤 Subiendo a Supabase (${bucket}): ${fileName}...`);

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
