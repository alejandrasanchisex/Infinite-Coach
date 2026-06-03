// Crear una dieta base vacía para Amalia para que el entrenador la pueda editar
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const TRAINER_ID = 't-w0iybl7qb';
const AMALIA_ID = '0db0ea7a-c413-44cb-b99e-dfd9790383eb';

async function createBaseDiet() {
    const { data } = await supabase.from('trainer_profiles').select('full_data').eq('trainer_id', TRAINER_ID).single();
    const fd = data.full_data;
    
    const dietId = 'diet-amalia-' + Date.now();
    
    // Dieta base con estructura correcta para que el entrenador la rellene
    const newDiet = {
        id: dietId,
        name: 'Plan Nutricional Amalia',
        clientId: AMALIA_ID,
        published: false,
        createdAt: new Date().toISOString(),
        meals: [
            {
                id: 'meal-1-' + Date.now(),
                name: 'Desayuno',
                time: '08:00',
                foods: []
            },
            {
                id: 'meal-2-' + Date.now(),
                name: 'Media Mañana',
                time: '11:00',
                foods: []
            },
            {
                id: 'meal-3-' + Date.now(),
                name: 'Comida',
                time: '14:00',
                foods: []
            },
            {
                id: 'meal-4-' + Date.now(),
                name: 'Merienda',
                time: '17:00',
                foods: []
            },
            {
                id: 'meal-5-' + Date.now(),
                name: 'Cena',
                time: '20:30',
                foods: []
            }
        ],
        notes: '',
        targetCalories: 0,
        targetProtein: 0,
        targetCarbs: 0,
        targetFat: 0
    };
    
    if (!fd.diets) fd.diets = [];
    fd.diets.push(newDiet);
    
    // Asignar la dieta a Amalia
    const amalia = fd.clients.find(c => c.id === AMALIA_ID);
    if (amalia) {
        amalia.assignedDiet = dietId;
        amalia.dietPublished = false;
    }
    
    fd.lastModified = new Date().toISOString();
    
    const { error } = await supabase
        .from('trainer_profiles')
        .update({ full_data: fd, updated_at: new Date().toISOString() })
        .eq('trainer_id', TRAINER_ID);
    
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('✅ Dieta base creada y asignada a Amalia (ID:', dietId, ')');
        console.log('   Recarga la página y ve a Dieta para rellenar los alimentos.');
    }
}

createBaseDiet().catch(console.error);
