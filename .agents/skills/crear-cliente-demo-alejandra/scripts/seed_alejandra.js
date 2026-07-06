const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function generateUUID() {
    return crypto.randomUUID();
}

function generateAccessCode(existingClients) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let isUnique = false;
    while (!isUnique) {
        code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        isUnique = !existingClients.some(c => (c.accessCode || '').trim().toUpperCase() === code);
    }
    return code;
}

const exerciseMuscleMapping = {
    "Press Inclinado (Mancuernas)": "pecho",
    "Remo con Mancuerna (1 mano)": "espalda",
    "Elevaciones Laterales (Mancuernas)": "hombro",
    "Jalón al Pecho (Ancho)": "espalda",
    "Curl Alterno (Mancuernas)": "brazo",
    "Extensiones en Polea Alta": "brazo",
    
    "Sentadilla Goblet": "pierna",
    "Prensa de Piernas 45º": "pierna",
    "Peso Muerto Rumano con Mancuernas": "pierna",
    "Extensiones de Cuádriceps": "pierna",
    "Elevación de Gemelos en Prensa": "pierna",
    
    "Hip Thrust (Barra)": "pierna",
    "Patada de Glúteo en Polea": "pierna",
    "Sentadilla Búlgara con Mancuernas": "pierna",
    "Plancha Abdominal": "core",
    "Crunch Abdominal en Suelo": "core"
};

const workoutProgressions = {
    "Press Inclinado (Mancuernas)": [
        { w: 10, r: 12 }, { w: 12.5, r: 10 }, { w: 12.5, r: 11 }, { w: 15, r: 10 }
    ],
    "Remo con Mancuerna (1 mano)": [
        { w: 12, r: 10 }, { w: 14, r: 10 }, { w: 14, r: 10 }, { w: 16, r: 10 }
    ],
    "Elevaciones Laterales (Mancuernas)": [
        { w: 4, r: 15 }, { w: 5, r: 12 }, { w: 5, r: 13 }, { w: 6, r: 12 }
    ],
    "Jalón al Pecho (Ancho)": [
        { w: 25, r: 12 }, { w: 30, r: 10 }, { w: 30, r: 12 }, { w: 35, r: 10 }
    ],
    "Sentadilla Goblet": [
        { w: 12, r: 12 }, { w: 14, r: 10 }, { w: 16, r: 10 }, { w: 18, r: 10 }
    ],
    "Prensa de Piernas 45º": [
        { w: 80, r: 12 }, { w: 100, r: 12 }, { w: 120, r: 10 }, { w: 130, r: 10 }
    ],
    "Extensiones de Cuádriceps": [
        { w: 15, r: 15 }, { w: 20, r: 15 }, { w: 20, r: 15 }, { w: 25, r: 12 }
    ],
    "Plancha Abdominal": [
        { w: 0, r: 45 }, { w: 0, r: 60 }, { w: 0, r: 60 }, { w: 0, r: 75 }
    ],
    "Hip Thrust (Barra)": [
        { w: 50, r: 10 }, { w: 60, r: 10 }, { w: 70, r: 10 }, { w: 80, r: 10 }
    ],
    "Peso Muerto Rumano con Mancuernas": [
        { w: 14, r: 10 }, { w: 16, r: 10 }, { w: 16, r: 10 }, { w: 18, r: 10 }
    ],
    "Patada de Glúteo en Polea": [
        { w: 5, r: 12 }, { w: 7.5, r: 12 }, { w: 7.5, r: 12 }, { w: 10, r: 10 }
    ],
    "Sentadilla Búlgara con Mancuernas": [
        { w: 6, r: 10 }, { w: 8, r: 10 }, { w: 8, r: 10 }, { w: 10, r: 10 }
    ]
};

async function seed() {
    let trainerIds = ['t-udve3b1u3', 't-w0iybl7qb'];
    
    // Check command line arguments
    if (process.argv[2]) {
        if (process.argv[2] !== 'all') {
            trainerIds = [process.argv[2]];
        }
    }
    
    console.log(`Seeding Alejandra Sanchis DEMO client for trainers: ${trainerIds.join(', ')}...`);
    
    for (const tId of trainerIds) {
        console.log(`\n===================================`);
        console.log(`Trainer: ${tId}`);
        const { data, error: fetchError } = await supabase.from('trainer_profiles').select('full_data').eq('trainer_id', tId).single();
        if (fetchError) {
            console.error(`Error fetching trainer profile ${tId}:`, fetchError);
            continue;
        }
        
        const fullData = data.full_data || {};
        if (!fullData.clients) fullData.clients = [];
        if (!fullData.feedbacks) fullData.feedbacks = [];
        if (!fullData.trainingBlocks) fullData.trainingBlocks = [];
        if (!fullData.trainingLogs) fullData.trainingLogs = [];
        if (!fullData.habits) fullData.habits = [];
        if (!fullData.diets) fullData.diets = [];
        if (!fullData.routines) fullData.routines = [];
        
        // 1. Limpieza de datos antiguos para evitar duplicados (buscando por emails de demo previos o nombre)
        const oldClients = fullData.clients.filter(c => 
            (c.email || '').trim().toLowerCase() === "alejandra.sanchis.client@gmail.com" ||
            (c.email || '').trim().toLowerCase() === "alejandrasanchis@gmail.com" ||
            (c.name || '').trim().toLowerCase() === "alejandra sanchis"
        );
        
        oldClients.forEach(oldClient => {
            const oldClientUuid = oldClient.id;
            console.log(`Cleaning old data for Alejandra Sanchis (ID: ${oldClientUuid})...`);
            fullData.feedbacks = fullData.feedbacks.filter(f => f.clientId !== oldClientUuid);
            fullData.trainingLogs = fullData.trainingLogs.filter(l => l.clientId !== oldClientUuid);
            fullData.habits = fullData.habits.filter(h => h.clientId !== oldClientUuid);
            fullData.trainingBlocks = fullData.trainingBlocks.filter(b => b.clientId !== oldClientUuid);
            if (fullData.appointments) {
                fullData.appointments = fullData.appointments.filter(a => a.clientId !== oldClientUuid);
            }
            
            if (oldClient.assignedDiets) {
                fullData.diets = fullData.diets.filter(d => !oldClient.assignedDiets.includes(d.id));
            }
            if (oldClient.assignedRoutine) {
                fullData.routines = fullData.routines.filter(r => r.id !== oldClient.assignedRoutine);
            }
            fullData.clients = fullData.clients.filter(c => c.id !== oldClientUuid);
        });
        
        // 1.1. Limpieza estricta de datos huérfanos residuales (evitar acumulación de feedbacks basura)
        const activeClientIds = new Set(fullData.clients.map(c => c.id));
        fullData.feedbacks = (fullData.feedbacks || []).filter(f => activeClientIds.has(f.clientId));
        fullData.trainingLogs = (fullData.trainingLogs || []).filter(l => activeClientIds.has(l.clientId));
        fullData.habits = (fullData.habits || []).filter(h => activeClientIds.has(h.clientId));
        fullData.trainingBlocks = (fullData.trainingBlocks || []).filter(b => activeClientIds.has(b.clientId));
        if (fullData.appointments) {
            fullData.appointments = fullData.appointments.filter(a => activeClientIds.has(a.clientId));
        }
        
        const clientUuid = generateUUID();
        const accessCode = generateAccessCode(fullData.clients);
        
        console.log(`Generating new client Alejandra Sanchis (ID: ${clientUuid}, AccessCode: ${accessCode})...`);
        
        // 2. Crear Cliente
        const client = {
            id: clientUuid,
            name: "Alejandra Sanchis",
            email: "alejandra.sanchis.client@gmail.com",
            phone: "+34 600 000 000",
            gender: "female",
            status: "active",
            reviewDay: "Lunes",
            monthlyFee: 65,
            subscriptionAmount: 65,
            subscriptionType: "Mensual",
            paymentStatus: "paid",
            accessCode: accessCode,
            createdAt: new Date().toISOString(),
            supplementation: "<p><strong>Creatina Monohidrato:</strong> 5g diarios en el desayuno con agua o zumo.</p><p><strong>Proteína de Suero (Whey Protein):</strong> 30g después del entrenamiento o como merienda.</p><p><strong>Omega 3:</strong> 1 cápsula con la cena para salud cardiovascular y antiinflamación.</p><p><strong>Multivitamínico:</strong> 1 cápsula en el desayuno.</p>",
            supplementationPublished: true,
            supplementationUrl: "",
            supplementationUrlVisible: true,
            technicalData: {
                age: 26,
                height: 165,
                weight: 62.5,
                goals: "Pérdida de grasa, tonificación y aumento de masa muscular en tren inferior (glúteos y piernas).",
                notes: "Entrena 4 días a la semana. Prefiere recetas sencillas y rápidas. Suplementa con creatina.",
                injuries: "Ninguna.",
                allergies: "Sin intolerancias alimentarias registradas.",
                skinfoldsEnabled: false
            }
        };
        
        // 3. Crear Dieta
        const dietId = generateUUID();
        const diet = {
            id: dietId,
            name: "Dieta Recomposición Corporal - Alejandra",
            description: "Planes con macros balanceados, alta en proteínas para tonificación y saciedad.",
            calories: 1635,
            macros: { protein: 135, carbs: 150, fat: 55 },
            mealsCount: 4,
            isTemplate: false,
            createdAt: new Date().toISOString(),
            weeklyPlan: [],
            meals: [
                {
                    id: `meal_${Date.now()}_1`,
                    name: "Desayuno: Tortilla Francesa y Tostada",
                    description: "",
                    optionPhotos: { "1": "img/tortilla_francesa_queso_fresco_1781257604552.png" },
                    optionIngredients: { "1": "Bate los 2 huevos medianos. Añade una pizca de sal. En una sartén caliente con 10g de aceite de oliva, vierte los huevos y dobla a la mitad cuando cuajen. Acompaña con una rebanada de pan de molde integral tostada." },
                    foods: [
                        { name: "Huevo entero", quantity: "2 uds", option: 1, protein: 13, carbs: 1, fat: 10, calories: 145 },
                        { name: "Pan de molde integral", quantity: "1 rebanada (30g)", option: 1, protein: 3, carbs: 15, fat: 1, calories: 80 },
                        { name: "Aceite de oliva virgen extra", quantity: "10g", option: 1, protein: 0, carbs: 0, fat: 10, calories: 90 }
                    ]
                },
                {
                    id: `meal_${Date.now()}_2`,
                    name: "Comida: Pollo con Arroz y Brócoli",
                    description: "",
                    optionPhotos: { "1": "img/ternera_arroz_pina_1781258723089.png" },
                    optionIngredients: { "1": "Sazona la pechuga de pollo con especias y cocínala a la plancha. Hierve el arroz jazmín. Prepara el brócoli al vapor o salteado al gusto." },
                    foods: [
                        { name: "Pechuga de pollo", quantity: "150g peso crudo", option: 1, protein: 35, carbs: 0, fat: 2, calories: 160 },
                        { name: "Arroz jazmín / integral", quantity: "50g peso crudo", option: 1, protein: 4, carbs: 40, fat: 0.5, calories: 180 },
                        { name: "Brócoli", quantity: "150g", option: 1, protein: 3, carbs: 4, fat: 0, calories: 30 }
                    ]
                },
                {
                    id: `meal_${Date.now()}_3`,
                    name: "Merienda: Yogur con Plátano y Cacahuete",
                    description: "",
                    optionPhotos: {},
                    optionIngredients: { "1": "Vierte el yogur proteico natural en un bol, corta el plátano en rodajas y añade una cucharadita de crema de cacahuete natural." },
                    foods: [
                        { name: "Yogur proteico natural (0% grasa)", quantity: "200g", option: 1, protein: 20, carbs: 8, fat: 0, calories: 110 },
                        { name: "Crema de cacahuete natural", quantity: "15g", option: 1, protein: 4, carbs: 2, fat: 9, calories: 95 },
                        { name: "Plátano", quantity: "1 mediano (100g)", option: 1, protein: 1.2, carbs: 22, fat: 0.3, calories: 90 }
                    ]
                },
                {
                    id: `meal_${Date.now()}_4`,
                    name: "Cena: Salmón con Ensalada y Aguacate",
                    description: "",
                    optionPhotos: {},
                    optionIngredients: { "1": "Cocina el filete de salmón a la plancha. Sirve con una base de espinacas, tomates cherry y aguacate." },
                    foods: [
                        { name: "Salmón fresco", quantity: "150g", option: 1, protein: 30, carbs: 0, fat: 18, calories: 280 },
                        { name: "Aguacate", quantity: "50g", option: 1, protein: 1, carbs: 4, fat: 7.5, calories: 80 },
                        { name: "Espinacas frescas y tomates cherry", quantity: "al gusto", option: 1, protein: 1, carbs: 2, fat: 0, calories: 15 }
                    ]
                }
            ]
        };
        fullData.diets.push(diet);
        client.assignedDiet = dietId;
        client.assignedDiets = [dietId];
        client.publishedDiets = [dietId];
        client.dietPublished = true;
        
        // 4. Crear Rutina de Fuerza
        const routineId = generateUUID();
        const routine = {
            id: routineId,
            name: "Fuerza Glúteo e Hipertrofia Alejandra",
            goal: "Recomposición corporal y enfoque en glúteos/piernas",
            weeks: 4,
            duration: "60 min",
            createdAt: new Date().toISOString(),
            isTemplate: false,
            description: "Plan de entrenamiento de 3 días a la semana enfocado en fuerza y volumen de tren inferior.",
            days: [
                {
                    name: "Día 1: Glúteo y Femoral",
                    weekName: "Semana 1",
                    weekNumber: 1,
                    exercises: [
                        { name: "Hip Thrust (Barra)", sets: "4", reps: "10-12", intensity: "RIR 1-2", notes: "Mantener 1s arriba", videoUrl: "https://www.youtube.com/watch?v=SEDZFull6pQ" },
                        { name: "Peso Muerto Rumano con Mancuernas", sets: "4", reps: "10", intensity: "RIR 2", notes: "Enfoque en excéntrica lenta", videoUrl: "https://www.youtube.com/watch?v=JCXUYuzz9Sg" },
                        { name: "Patada de Glúteo en Polea", sets: "3", reps: "15", intensity: "Fallo", notes: "Squeeze arriba", videoUrl: "https://www.youtube.com/watch?v=N_p2U_62jG8" },
                        { name: "Sentadilla Búlgara con Mancuernas", sets: "3", reps: "10", intensity: "RIR 2", notes: "Controlar bajada", videoUrl: "https://www.youtube.com/watch?v=2C-uNgKwPLE" }
                    ]
                },
                {
                    name: "Día 2: Tren Superior (Fuerza/Tono)",
                    weekName: "Semana 1",
                    weekNumber: 1,
                    exercises: [
                        { name: "Press Inclinado (Mancuernas)", sets: "4", reps: "12", intensity: "RIR 2", notes: "Controla la bajada en 2 segundos", videoUrl: "https://www.youtube.com/watch?v=8iPEnn-ltC8" },
                        { name: "Remo con Mancuerna (1 mano)", sets: "3", reps: "12", intensity: "RIR 2", notes: "Lleva la mancuerna hacia la cadera", videoUrl: "https://www.youtube.com/watch?v=dFzUjzuW_2M" },
                        { name: "Elevaciones Laterales (Mancuernas)", sets: "4", reps: "15", intensity: "RIR 1", notes: "No balancear", videoUrl: "https://www.youtube.com/watch?v=3VcKaXpzqRo" },
                        { name: "Jalón al Pecho (Ancho)", sets: "4", reps: "12", intensity: "RIR 2", notes: "Retraer escápulas", videoUrl: "https://www.youtube.com/watch?v=CAwf7n6Luuc" }
                    ]
                },
                {
                    name: "Día 3: Cuádriceps y Glúteo",
                    weekName: "Semana 1",
                    weekNumber: 1,
                    exercises: [
                        { name: "Sentadilla Goblet", sets: "4", reps: "10-12", intensity: "RIR 2", notes: "Sentadilla profunda controlada", videoUrl: "https://www.youtube.com/watch?v=MeIiGibT6X0" },
                        { name: "Prensa de Piernas 45º", sets: "3", reps: "12-15", intensity: "RIR 2", notes: "Pies altos y juntos en plataforma", videoUrl: "https://www.youtube.com/watch?v=yZ800I4r_0g" },
                        { name: "Extensiones de Cuádriceps", sets: "3", reps: "15", intensity: "RIR 1", notes: "Squeeze arriba 1s", videoUrl: "https://www.youtube.com/watch?v=YyvSfVLYd80" },
                        { name: "Plancha Abdominal", sets: "3", reps: "45 seg", intensity: "Z1-Z2", notes: "Mantener core activado", videoUrl: "https://www.youtube.com/watch?v=TvxNkmjdhMM" }
                    ]
                }
            ]
        };
        fullData.routines.push(routine);
        client.assignedRoutine = routineId;
        
        // 5. Crear Bloque de Entrenamiento Activo
        const blockId = generateUUID();
        const trainingBlock = {
            id: blockId,
            clientId: clientUuid,
            name: "Fuerza Glúteo e Hipertrofia Alejandra",
            startDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            endDate: null,
            status: "active",
            published: true,
            createdAt: new Date().toISOString(),
            weeks: [
                {
                    id: generateUUID(),
                    number: 1,
                    name: "Semana 1",
                    days: routine.days.map(d => ({
                        name: d.name,
                        exercises: d.exercises.map(e => ({
                            name: e.name,
                            sets: e.sets,
                            reps: e.reps,
                            intensity: e.intensity,
                            notes: e.notes,
                            videoUrl: e.videoUrl,
                            muscleGroup: exerciseMuscleMapping[e.name]
                        }))
                    }))
                }
            ]
        };
        fullData.trainingBlocks.push(trainingBlock);
        client.activeBlockId = blockId;
        
        // 6. Generar 12 Logs de Entrenamiento para Salón de la Fama
        for (let weekNum = 1; weekNum <= 4; weekNum++) {
            const timeOffset = (25 - weekNum * 7); // staggered weekly offsets
            const dateDay1 = new Date(Date.now() - (timeOffset + 4) * 24 * 60 * 60 * 1000).toISOString();
            const dateDay2 = new Date(Date.now() - (timeOffset + 2) * 24 * 60 * 60 * 1000).toISOString();
            const dateDay3 = new Date(Date.now() - (timeOffset) * 24 * 60 * 60 * 1000).toISOString();
            
            // Día 1
            const exercisesDay1 = trainingBlock.weeks[0].days[0].exercises.map(ex => {
                const prog = workoutProgressions[ex.name][weekNum - 1];
                return {
                    name: ex.name,
                    muscleGroup: exerciseMuscleMapping[ex.name],
                    sets: [
                        { reps: prog.r, weight: prog.w, completed: true },
                        { reps: prog.r, weight: prog.w, completed: true },
                        { reps: prog.r, weight: prog.w, completed: true }
                    ]
                };
            });
            fullData.trainingLogs.push({
                id: generateUUID(),
                clientId: clientUuid,
                routineId: routineId,
                dayNumber: 0,
                blockId: blockId,
                date: dateDay1,
                completed: true,
                createdAt: dateDay1,
                lastModified: dateDay1,
                exercises: exercisesDay1,
                comment: "Entrenamiento completado, muy buenas sensaciones de fuerza y empuje."
            });
            
            // Día 2
            const exercisesDay2 = trainingBlock.weeks[0].days[1].exercises.map(ex => {
                const prog = workoutProgressions[ex.name][weekNum - 1];
                return {
                    name: ex.name,
                    muscleGroup: exerciseMuscleMapping[ex.name],
                    sets: [
                        { reps: prog.r, weight: prog.w, completed: true },
                        { reps: prog.r, weight: prog.w, completed: true },
                        { reps: prog.r, weight: prog.w, completed: true }
                    ]
                };
            });
            fullData.trainingLogs.push({
                id: generateUUID(),
                clientId: clientUuid,
                routineId: routineId,
                dayNumber: 1,
                blockId: blockId,
                date: dateDay2,
                completed: true,
                createdAt: dateDay2,
                lastModified: dateDay2,
                exercises: exercisesDay2,
                comment: "Buen tono muscular. Completadas todas las series con buen RIR."
            });
            
            // Día 3
            const exercisesDay3 = trainingBlock.weeks[0].days[2].exercises.map(ex => {
                const prog = workoutProgressions[ex.name][weekNum - 1];
                return {
                    name: ex.name,
                    muscleGroup: exerciseMuscleMapping[ex.name],
                    sets: [
                        { reps: prog.r, weight: prog.w, completed: true },
                        { reps: prog.r, weight: prog.w, completed: true },
                        { reps: prog.r, weight: prog.w, completed: true }
                    ]
                };
            });
            fullData.trainingLogs.push({
                id: generateUUID(),
                clientId: clientUuid,
                routineId: routineId,
                dayNumber: 2,
                blockId: blockId,
                date: dateDay3,
                completed: true,
                createdAt: dateDay3,
                lastModified: dateDay3,
                exercises: exercisesDay3,
                comment: "Fatiga acumulada de la semana pero lograda la progresión de cargas."
            });
        }
        
        // 7. Generar Historial de Evolución de Peso (5 semanas de feedbacks)
        const dateW1 = new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString();
        const dateW2 = new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString();
        const dateW3 = new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString();
        const dateW4 = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
        
        // Match user's local time hour 14:32 (which is 12:32 UTC)
        const today = new Date();
        const dateW5 = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 12, 32, 7, 538)).toISOString();
        
        const fbId1 = "fb-" + generateUUID();
        const fbId2 = "fb-" + generateUUID();
        const fbId3 = "fb-" + generateUUID();
        const fbId4 = "fb-" + generateUUID();
        const fbId5 = "fb-" + generateUUID(); // PENDIENTE
        
        const feedbacksList = [
            {
                id: fbId1,
                clientId: clientUuid,
                date: dateW1,
                week: 1,
                sleep: 4,
                energy: 4,
                stress: 3,
                weight: 63.5,
                comments: "Comienzo motivada.",
                adherence: 4,
                satisfaction: 4,
                trainerResponse: "¡Gran inicio! Sigue así.",
                perimeters: { "Brazo": 28.0, "Muslo": 54.0, "Pecho": 88.0, "Cadera": 98.0, "Cintura": 72.0 },
                answers: [{ question: "¿Qué tal te ves físicamente?", answer: "Con ganas e inflamada al inicio." }]
            },
            {
                id: fbId2,
                clientId: clientUuid,
                date: dateW2,
                week: 2,
                sleep: 4,
                energy: 5,
                stress: 3,
                weight: 63.0,
                comments: "Me veo mejor en el espejo.",
                adherence: 5,
                satisfaction: 5,
                trainerResponse: "Bajada de peso controlada. Excelente.",
                perimeters: { "Brazo": 28.0, "Muslo": 54.0, "Pecho": 88.0, "Cadera": 97.5, "Cintura": 71.5 },
                answers: [{ question: "¿Qué tal te ves físicamente?", answer: "Menos hinchada." }]
            },
            {
                id: fbId3,
                clientId: clientUuid,
                date: dateW3,
                week: 3,
                sleep: 4,
                energy: 4,
                stress: 2,
                weight: 62.4,
                comments: "Muy buena adherencia a los platos.",
                adherence: 5,
                satisfaction: 5,
                trainerResponse: "Estupendo progreso de perímetros.",
                perimeters: { "Brazo": 27.8, "Muslo": 53.5, "Pecho": 87.5, "Cadera": 97.0, "Cintura": 70.8 },
                answers: [{ question: "¿Qué tal te ves físicamente?", answer: "Pantalones más sueltos." }]
            },
            {
                id: fbId4,
                clientId: clientUuid,
                date: dateW4,
                week: 4,
                sleep: 4,
                energy: 5,
                stress: 2,
                weight: 62.0,
                comments: "Me siento más fuerte entrenando.",
                adherence: 5,
                satisfaction: 5,
                trainerResponse: "Felicidades por la constancia.",
                perimeters: { "Brazo": 27.5, "Muslo": 53.0, "Pecho": 87.0, "Cadera": 96.5, "Cintura": 70.2 },
                answers: [{ question: "¿Qué tal te ves físicamente?", answer: "Visualmente más tonificada." }]
            },
            {
                id: fbId5, // PENDIENTE (14:32)
                clientId: clientUuid,
                date: dateW5,
                week: 5,
                sleep: 4,
                energy: 5,
                stress: 2,
                weight: 61.5,
                comments: "¡Muchísimas gracias por todo el apoyo! Vamos a tope.",
                adherence: 5,
                satisfaction: 5,
                trainerResponse: "",
                perimeters: { "Brazo": 27.2, "Muslo": 52.8, "Pecho": 86.5, "Cadera": 96.0, "Cintura": 69.8 },
                answers: [
                    { question: "¿Qué tal te ves fisicamente?", answer: "Me veo súper bien, la ropa me queda mucho mejor!" },
                    { question: "Sensaciones sobre la dieta (mucha/poca comida, ansiedad, poco apetito...)", answer: "Súper saciada, no paso nada de hambre." },
                    { question: "Comida/alimento que no te haya gustado y/o quieras cambiar de la dieta actual", answer: "Ninguno, me gusta todo." },
                    { question: "Comida/alimento que quieras tener en tu próxima dieta a ser posible", answer: "Quizá alguna fruta diferente si se puede." },
                    { question: "¿Has realizado algún salto de dieta para tener en cuenta?", answer: "No, he sido 100% constante." },
                    { question: "¿Qué tal han ido los entrenos? Cuéntame tus sensaciones", answer: "Muy bien, noto que gano fuerza semana a semana." },
                    { question: "¿Has podido entrenar los días estipulados?", answer: "Sí, he entrenado los 3 días." },
                    { question: "¿Te recuperas correctamente de los entrenos entre sesiones?", answer: "Sí, descanso genial." },
                    { question: "Del 1 al 10, ¿Cuál ha sido tu implicación en los entrenamientos? (Intensidad, realización de todas las series...)", answer: "9/10, dándolo todo en cada serie!" }
                ]
            }
        ];
        
        fullData.feedbacks.push(...feedbacksList);
        client.feedbacks = [fbId1, fbId2, fbId3, fbId4, fbId5];
        
        // Historial de peso y perímetros en el objeto del cliente
        client.weightHistory = feedbacksList.map(fb => ({
            date: fb.date,
            weight: fb.weight,
            perimeters: fb.perimeters,
            arm: fb.perimeters.Brazo,
            leg: fb.perimeters.Muslo,
            chest: fb.perimeters.Pecho,
            glute: fb.perimeters.Cadera,
            waist: fb.perimeters.Cintura,
            week: fb.week,
            isFeedback: true
        }));
        
        // 8. Registros de Hábitos Diarios
        const habitsDates = [
            new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            new Date().toISOString().split('T')[0]
        ];
        const habitsWeights = [62.0, 61.9, 61.9, 61.8, 61.7, 61.6, 61.5];
        const waterValues = [2.2, 2.5, 2.0, 2.4, 2.6, 2.8, 2.5];
        const stepsValues = [9500, 10200, 8800, 11000, 9700, 10500, 10100];
        const sleepValues = [8.0, 7.5, 7.0, 7.5, 8.0, 8.0, 7.5];

        habitsDates.forEach((date, i) => {
            fullData.habits.push({
                id: `${clientUuid}_${date}`,
                clientId: clientUuid,
                date: date,
                water: waterValues[i],
                steps: stepsValues[i],
                sleep: sleepValues[i],
                weight: habitsWeights[i],
                updatedAt: new Date(date + "T21:00:00.000Z").toISOString()
            });
        });
        
        // 9. Asegurar Preguntas de Revisión (feedbackQuestions) en el perfil de la marca del entrenador
        if (!fullData.brand) fullData.brand = {};
        const standardQuestions = [
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
        if (!fullData.brand.feedbackQuestions || fullData.brand.feedbackQuestions.length < 5) {
            fullData.brand.feedbackQuestions = standardQuestions;
        }

        // 10. Crear Citas (Appointments) para Alejandra
        if (!fullData.appointments) fullData.appointments = [];
        const dateFuture = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(); // En 5 días (Planificada)
        
        fullData.appointments.push({
            id: generateUUID(),
            clientId: clientUuid,
            date: dateFuture,
            type: 'call',
            notes: 'Sesión de control de mitad de mesociclo. Repaso de sensaciones de fuerza y adherencia a la dieta.',
            status: 'scheduled'
        });

        // 11. Crear Plantillas (Templates) en la Biblioteca si no existen
        const hasDietTemplate = (fullData.diets || []).some(d => d.isTemplate && d.name.includes("Recomposición"));
        if (!hasDietTemplate) {
            if (!fullData.diets) fullData.diets = [];
            fullData.diets.push({
                id: generateUUID(),
                name: "Plantilla Recomposición Estándar (1800 kcal)",
                description: "Plantilla genérica de recomposición corporal con desglose de 4 comidas y macros balanceados.",
                calories: 1800,
                macros: { protein: 140, carbs: 180, fat: 60 },
                mealsCount: 4,
                isTemplate: true,
                createdAt: new Date().toISOString(),
                meals: [
                    {
                        id: `meal_template_${Date.now()}_1`,
                        name: "Desayuno",
                        foods: [
                            { name: "Huevo entero", quantity: "2 uds", option: 1, protein: 13, carbs: 1, fat: 10, calories: 145 },
                            { name: "Avena en copos", quantity: "60g", option: 1, protein: 8, carbs: 40, fat: 4, calories: 230 }
                        ]
                    },
                    {
                        id: `meal_template_${Date.now()}_2`,
                        name: "Almuerzo",
                        foods: [
                            { name: "Pechuga de pollo", quantity: "150g", option: 1, protein: 35, carbs: 0, fat: 2, calories: 160 },
                            { name: "Arroz integral", quantity: "70g", option: 1, protein: 6, carbs: 55, fat: 1, calories: 250 }
                        ]
                    },
                    {
                        id: `meal_template_${Date.now()}_3`,
                        name: "Merienda",
                        foods: [
                            { name: "Yogur griego ligero", quantity: "150g", option: 1, protein: 15, carbs: 6, fat: 3, calories: 110 }
                        ]
                    },
                    {
                        id: `meal_template_${Date.now()}_4`,
                        name: "Cena",
                        foods: [
                            { name: "Merluza a la plancha", quantity: "180g", option: 1, protein: 32, carbs: 0, fat: 2, calories: 150 },
                            { name: "Patata cocida", quantity: "150g", option: 1, protein: 3, carbs: 30, fat: 0, calories: 130 }
                        ]
                    }
                ]
            });
        }

        const hasRoutineTemplate = (fullData.routines || []).some(r => r.isTemplate && r.name.includes("Fuerza A/B/C"));
        if (!hasRoutineTemplate) {
            if (!fullData.routines) fullData.routines = [];
            fullData.routines.push({
                id: generateUUID(),
                name: "Plantilla Fuerza 3 Días A/B/C",
                goal: "Fuerza e hipertrofia general",
                weeks: 4,
                duration: "60 min",
                createdAt: new Date().toISOString(),
                isTemplate: true,
                description: "Plantilla de entrenamiento de fuerza de 3 días para cuerpo completo.",
                days: [
                    {
                        name: "Día A: Empuje",
                        weekNumber: 1,
                        exercises: [
                            { name: "Press de Banca Plano (Barra)", sets: "4", reps: "8-10", intensity: "RIR 2", notes: "Controlar la bajada", videoUrl: "https://www.youtube.com/watch?v=tuwHzzPrzOM" },
                            { name: "Press Militar (Barra)", sets: "3", reps: "8-10", intensity: "RIR 2", notes: "Mantener abdomen tenso", videoUrl: "https://www.youtube.com/watch?v=2yjwxtZ_Vkg" }
                        ]
                    },
                    {
                        name: "Día B: Tracción",
                        weekNumber: 1,
                        exercises: [
                            { name: "Dominadas (Prono)", sets: "4", reps: "Max", intensity: "RIR 1", notes: "Controlar el descenso", videoUrl: "https://www.youtube.com/watch?v=eGo4IYlbE5g" },
                            { name: "Remo con Barra (90º)", sets: "4", reps: "10", intensity: "RIR 2", notes: "Espalda recta", videoUrl: "https://www.youtube.com/watch?v=RQU8wL6G_HI" }
                        ]
                    },
                    {
                        name: "Día C: Piernas",
                        weekNumber: 1,
                        exercises: [
                            { name: "Sentadilla Libre (Barra)", sets: "4", reps: "8-10", intensity: "RIR 2", notes: "Profundidad adecuada", videoUrl: "https://www.youtube.com/watch?v=SW_C1A-SHMA" }
                        ]
                    }
                ]
            });
        }
        
        fullData.clients.push(client);
        
        console.log("Saving trainer profile data to Supabase...");
        const { error: saveError } = await supabase
            .from('trainer_profiles')
            .update({ full_data: fullData })
            .eq('trainer_id', tId);
            
        if (saveError) {
            console.error(`Error saving profile for ${tId}:`, saveError);
        } else {
            console.log(`Success! Seeded DEMO Alejandra Sanchis for trainer ${tId} (Access Code: ${accessCode})`);
        }
    }
    console.log("\nAll tasks completed!");
}

seed().catch(console.error);
