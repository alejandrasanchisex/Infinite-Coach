
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

async function retryOp(operation, maxAttempts = 3, initialDelay = 1000, timeoutMs = 6000) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const promiseCall = operation();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Timeout de red (Supabase no responde)")), timeoutMs)
            );
            return await Promise.race([promiseCall, timeoutPromise]);
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
            const isTrainer = (safeGetLocalStorage('_trainerAuthed') === '1' || safeGetSessionStorage('_trainerAuthed') === '1');
            const clientId = (safeGetLocalStorage('clientId') || safeGetSessionStorage('clientId'));

            console.log(`[Supabase GetData] Cargando datos granulares. isTrainer: ${isTrainer}, clientId: ${clientId}`);

            // Helpers de conversión locales
            const mapClientFromSQL = r => ({
                id: r.id,
                name: r.name,
                email: r.email,
                phone: r.phone,
                gender: r.gender,
                status: r.status,
                monthlyFee: r.monthly_fee ? parseFloat(r.monthly_fee) : 0,
                subscriptionAmount: r.monthly_fee ? parseFloat(r.monthly_fee) : 0,
                assignedRoutine: r.assigned_routine,
                assignedDiet: r.assigned_diet,
                technicalData: r.technical_data,
                onboardingAnswers: r.onboarding_answers,
                initialSetupDone: r.initial_setup_done,
                profilePhoto: r.profile_photo,
                createdAt: r.created_at,
                updatedAt: r.updated_at
            });

            const mapBlockFromSQL = r => ({
                id: r.id,
                clientId: r.client_id,
                name: r.title,
                title: r.title,
                status: r.status,
                published: r.published,
                startDate: r.start_date,
                endDate: r.end_date,
                weeks: r.weeks
            });

            const mapDietFromSQL = r => ({
                id: r.id,
                clientId: r.client_id,
                name: r.title,
                title: r.title,
                status: r.status,
                published: r.published,
                days: r.days
            });

            const mapLogFromSQL = r => ({
                id: r.id,
                clientId: r.client_id,
                date: r.date,
                weekNumber: r.week_number,
                dayNumber: r.day_number,
                exercises: r.exercises
            });

            const mapFeedbackFromSQL = r => ({
                id: r.id,
                clientId: r.client_id,
                week: r.week,
                date: r.date,
                weight: r.weight ? parseFloat(r.weight) : null,
                sleep: r.sleep ? parseInt(r.sleep) : null,
                stress: r.stress ? parseInt(r.stress) : null,
                energy: r.energy ? parseInt(r.energy) : null,
                adherence: r.adherence ? parseInt(r.adherence) : null,
                satisfaction: r.satisfaction ? parseInt(r.satisfaction) : null,
                answers: r.answers,
                perimeters: r.perimeters,
                photos: r.photos,
                comments: r.comments,
                trainerResponse: r.trainer_response,
                createdAt: r.created_at,
                updatedAt: r.updated_at
            });

            // 1. Obtener la cabecera del perfil (para el tema de brand, habits, appointments, invoices)
            const runProfileQuery = async () => {
                const { data, error } = await this.client
                    .from('trainer_profiles')
                    .select('full_data')
                    .eq('trainer_id', trainerId)
                    .single();
                if (error) {
                    if (error.code === 'PGRST116') return { full_data: null };
                    throw error;
                }
                return data;
            };
            const profileRes = await retryOp(runProfileQuery, 3, 1000);
            const profileObj = (profileRes && profileRes.full_data) ? profileRes.full_data : {};

            let clientRows = [], blockRows = [], dietRows = [], logRows = [], feedbackRows = [];

            // 2. Carga granular optimizada según el rol del usuario
            if (!isTrainer && clientId) {
                // ROL CLIENTE: Descarga aislada y rápida de sus propios datos (5 KB)
                const queries = [
                    retryOp(() => this.client.from('clients').select('*').eq('id', clientId), 3, 1000),
                    retryOp(() => this.client.from('training_blocks').select('*').eq('client_id', clientId), 3, 1000),
                    retryOp(() => this.client.from('client_diets').select('*').eq('client_id', clientId), 3, 1000),
                    retryOp(() => this.client.from('training_logs').select('*').eq('client_id', clientId), 3, 1000),
                    retryOp(() => this.client.from('feedbacks').select('*').eq('client_id', clientId), 3, 1000)
                ];
                const [cRes, bRes, dRes, lRes, fRes] = await Promise.all(queries);
                clientRows = cRes.data || [];
                blockRows = bRes.data || [];
                dietRows = dRes.data || [];
                logRows = lRes.data || [];
                feedbackRows = fRes.data || [];
            } else {
                // ROL ENTRENADOR: Descarga segmentada por lotes de toda la marca
                const queries = [
                    retryOp(() => this.client.from('clients').select('*').eq('trainer_id', trainerId), 3, 1000),
                    retryOp(() => this.client.from('training_blocks').select('*').eq('trainer_id', trainerId), 3, 1000),
                    retryOp(() => this.client.from('client_diets').select('*').eq('trainer_id', trainerId), 3, 1000),
                    retryOp(() => this.client.from('training_logs').select('*').eq('trainer_id', trainerId), 3, 1000),
                    retryOp(() => this.client.from('feedbacks').select('*').eq('trainer_id', trainerId), 3, 1000)
                ];
                const [cRes, bRes, dRes, lRes, fRes] = await Promise.all(queries);
                clientRows = cRes.data || [];
                blockRows = bRes.data || [];
                dietRows = dRes.data || [];
                logRows = lRes.data || [];
                feedbackRows = fRes.data || [];
            }

            // 3. Ensamblado del JSON monolítico compatible en memoria
            const assembled = {
                brand: profileObj.brand || {},
                appointments: profileObj.appointments || [],
                habits: profileObj.habits || [],
                invoices: profileObj.invoices || [],
                __reset_version: profileObj.__reset_version || null,
                clients: clientRows.map(mapClientFromSQL),
                trainingBlocks: blockRows.map(mapBlockFromSQL),
                diets: dietRows.map(mapDietFromSQL),
                trainingLogs: logRows.map(mapLogFromSQL),
                feedbacks: feedbackRows.map(mapFeedbackFromSQL),
                lastModified: profileObj.lastModified || new Date().toISOString()
            };

            // Cortafuegos de cuota para ASTeam
            if (trainerId === 't-w0iybl7qb' && assembled.clients) {
                assembled.clients.forEach(c => {
                    if (c.id === '20f2e6c2-2699-4ccc-a982-1e9fb141b9bb' || c.id === '0db0ea7a-c413-44cb-b99e-dfd9790383eb') {
                        if (!c.monthlyFee || c.monthlyFee === 0) c.monthlyFee = 65;
                        if (!c.subscriptionAmount || c.subscriptionAmount === 0) c.subscriptionAmount = 65;
                    }
                });
            }

            return assembled;
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

            console.log(`[Supabase SaveData] Guardando datos granulares. isTrainer: ${isTrainer}, clientId: ${clientId}`);

            // Helpers de mapeo locales
            const mapClientToSQL = c => ({
                id: c.id,
                trainer_id: trainerId,
                name: c.name || 'Sin Nombre',
                email: c.email || null,
                phone: c.phone || null,
                gender: c.gender || null,
                status: c.status || 'active',
                monthly_fee: c.monthlyFee ? parseFloat(c.monthlyFee) : 0,
                assigned_routine: c.assignedRoutine || null,
                assigned_diet: c.assignedDiet || null,
                technical_data: c.technicalData || {},
                onboarding_answers: c.onboardingAnswers || [],
                initial_setup_done: c.initialSetupDone || false,
                profile_photo: c.profilePhoto || null,
                updated_at: new Date().toISOString()
            });

            const mapBlockToSQL = b => ({
                id: b.id,
                client_id: b.clientId,
                trainer_id: trainerId,
                title: b.title || b.name || 'Bloque',
                status: b.status || 'active',
                published: b.published || false,
                start_date: b.startDate || null,
                end_date: b.endDate || null,
                weeks: b.weeks || [],
                updated_at: new Date().toISOString()
            });

            const mapDietToSQL = d => ({
                id: d.id,
                client_id: d.clientId,
                trainer_id: trainerId,
                title: d.title || d.name || 'Dieta',
                status: d.status || 'active',
                published: d.published || false,
                days: d.days || [],
                updated_at: new Date().toISOString()
            });

            const mapLogToSQL = l => ({
                id: l.id,
                client_id: l.clientId,
                trainer_id: trainerId,
                date: l.date,
                week_number: l.weekNumber,
                day_number: l.dayNumber,
                exercises: l.exercises || []
            });

            const mapFeedbackToSQL = f => ({
                id: f.id,
                client_id: f.clientId,
                trainer_id: trainerId,
                week: f.week || 0,
                date: f.date,
                weight: f.weight ? parseFloat(f.weight) : null,
                sleep: f.sleep ? parseInt(f.sleep) : null,
                stress: f.stress ? parseInt(f.stress) : null,
                energy: f.energy ? parseInt(f.energy) : null,
                adherence: f.adherence ? parseInt(f.adherence) : null,
                satisfaction: f.satisfaction ? parseInt(f.satisfaction) : null,
                answers: f.answers || [],
                perimeters: f.perimeters || {},
                photos: f.photos || {},
                comments: f.comments || null,
                trainer_response: f.trainerResponse || null,
                updated_at: new Date().toISOString()
            });

            // 1. Blindaje contra guardados vacíos accidentalmente
            const dataIsEmpty = (
                (!fullData.clients || fullData.clients.length === 0) &&
                (!fullData.trainingBlocks || fullData.trainingBlocks.length === 0)
            );
            if (dataIsEmpty) {
                console.error("🚨 [BLINDAJE SUPABASE] Guardado cancelado para evitar pisar datos vacíos.");
                return false;
            }

            // Sanitización ASTeam
            if (trainerId === 't-w0iybl7qb' && fullData) {
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
            }

            // 2. Clasificar datos a guardar según rol del usuario
            const upsertPromises = [];

            if (!isTrainer && clientId) {
                // MODO CLIENTE: Solo guarda sus propios datos aislados (No toca datos de otros clientes)
                const myClient = fullData.clients ? fullData.clients.find(c => c.id === clientId) : null;
                if (myClient) {
                    upsertPromises.push(retryOp(() => this.client.from('clients').upsert(mapClientToSQL(myClient)), 3, 1000));
                }

                if (fullData.trainingBlocks) {
                    const myBlocks = fullData.trainingBlocks.filter(b => b.clientId === clientId).map(mapBlockToSQL);
                    if (myBlocks.length > 0) upsertPromises.push(retryOp(() => this.client.from('training_blocks').upsert(myBlocks), 3, 1000));
                }
                if (fullData.diets) {
                    const myDiets = fullData.diets.filter(d => d.clientId === clientId).map(mapDietToSQL);
                    if (myDiets.length > 0) upsertPromises.push(retryOp(() => this.client.from('client_diets').upsert(myDiets), 3, 1000));
                }
                if (fullData.trainingLogs) {
                    const myLogs = fullData.trainingLogs.filter(l => l.clientId === clientId).map(mapLogToSQL);
                    if (myLogs.length > 0) upsertPromises.push(retryOp(() => this.client.from('training_logs').upsert(myLogs), 3, 1000));
                }
                if (fullData.feedbacks) {
                    const myFeedbacks = fullData.feedbacks.filter(f => f.clientId === clientId).map(mapFeedbackToSQL);
                    if (myFeedbacks.length > 0) upsertPromises.push(retryOp(() => this.client.from('feedbacks').upsert(myFeedbacks), 3, 1000));
                }
            } else {
                // MODO ENTRENADOR: Guarda todo de forma relacional y actualiza cabecera de perfil
                if (fullData.clients) {
                    const sqlClients = fullData.clients.map(mapClientToSQL);
                    upsertPromises.push(retryOp(() => this.client.from('clients').upsert(sqlClients), 3, 1000));
                }
                if (fullData.trainingBlocks) {
                    const sqlBlocks = fullData.trainingBlocks.map(mapBlockToSQL);
                    upsertPromises.push(retryOp(() => this.client.from('training_blocks').upsert(sqlBlocks), 3, 1000));
                }
                if (fullData.diets) {
                    const sqlDiets = fullData.diets.map(mapDietToSQL);
                    upsertPromises.push(retryOp(() => this.client.from('client_diets').upsert(sqlDiets), 3, 1000));
                }
                if (fullData.trainingLogs) {
                    const sqlLogs = fullData.trainingLogs.map(mapLogToSQL);
                    upsertPromises.push(retryOp(() => this.client.from('training_logs').upsert(sqlLogs), 3, 1000));
                }
                if (fullData.feedbacks) {
                    const sqlFeedbacks = fullData.feedbacks.map(mapFeedbackToSQL);
                    upsertPromises.push(retryOp(() => this.client.from('feedbacks').upsert(sqlFeedbacks), 3, 1000));
                }

                // Guardar la cabecera en trainer_profiles con brand, appointments, habits, invoices
                const profileData = {
                    brand: fullData.brand || {},
                    appointments: fullData.appointments || [],
                    habits: fullData.habits || [],
                    invoices: fullData.invoices || [],
                    __reset_version: fullData.__reset_version || null,
                    lastModified: new Date().toISOString()
                };

                upsertPromises.push(retryOp(() => this.client
                    .from('trainer_profiles')
                    .upsert({
                        trainer_id: trainerId,
                        full_data: profileData,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'trainer_id' }), 3, 1000));
            }

            await Promise.all(upsertPromises);
            console.log("✅ Guardado granular relacional completado con éxito en Supabase!");
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
