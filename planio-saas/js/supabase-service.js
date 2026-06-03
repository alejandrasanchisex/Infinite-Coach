/**
 * SUPABASE SERVICE (Vanilla JS) - PLANIO SAAS
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
        if (this.client) return true;
        this.client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("Supabase listo en Planio ✅");
        return true;
    },

    /**
     * Obtiene los datos completos del licenciatario desde la base de datos SQL
     */
    async getTrainerData(trainerId) {
        if (!this.client) this.init();
        try {
            const { data, error } = await this.client
                .from('trainer_profiles')
                .select('full_data')
                .eq('trainer_id', 'planio_' + trainerId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') return null; // No existe
                throw error;
            }
            return data.full_data;
        } catch (error) {
            console.error("Error cargando desde Supabase:", error);
            return null;
        }
    },

    /**
     * Guarda los datos en la nube (Persistencia Profesional)
     */
    async saveTrainerData(trainerId, fullData) {
        if (!this.client) this.init();
        try {
            // Preservar la configuración de marca si la guarda un sub-agente
            const isTrainer = typeof localStorage !== 'undefined' && localStorage.getItem('_planioAuthed') === '1';
            if (!isTrainer && trainerId !== 'default') {
                try {
                    const { data: cloudProfile } = await this.client
                        .from('trainer_profiles')
                        .select('full_data')
                        .eq('trainer_id', 'planio_' + trainerId)
                        .single();
                    
                    if (cloudProfile && cloudProfile.full_data && cloudProfile.full_data.brand) {
                        fullData.brand = cloudProfile.full_data.brand;
                    }
                } catch (errFetch) {
                    console.warn("No se pudo pre-cargar la marca para fusionar:", errFetch);
                }
            }

            const { error } = await this.client
                .from('trainer_profiles')
                .upsert({ 
                    trainer_id: 'planio_' + trainerId, 
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
     * Gestión de configuración de licencias SaaS
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
        } catch (e) { 
            return null; 
        }
    },

    /**
     * Sube un archivo (ej: Logotipo) a Supabase Storage
     */
    async uploadFile(file, bucket = 'Media') {
        if (!this.client) this.init();
        try {
            const cleanName = (file.name || 'upload.jpg')
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, '_')
                .replace(/[^a-zA-Z0-9._-]/g, '');
            
            const fileName = `planio_${Date.now()}_${cleanName}`;
            console.log(`🚀 Subiendo a Bucket '${bucket}': ${fileName}`);

            const { data, error } = await this.client.storage
                .from(bucket)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            const { data: urlData } = this.client.storage
                .from(bucket)
                .getPublicUrl(fileName);

            return urlData.publicUrl;
        } catch (error) {
            console.error("❌ Error subiendo archivo a Supabase Storage:", error);
            return null;
        }
    }
};

window.SupabaseService = SupabaseService;
