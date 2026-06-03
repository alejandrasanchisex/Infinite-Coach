// Búsqueda exhaustiva de la dieta de Amalia en toda la base de datos
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const AMALIA_ID = '0db0ea7a-c413-44cb-b99e-dfd9790383eb';

async function searchEverywhere() {
    console.log('🔍 Buscando en TODOS los perfiles de entrenadores...\n');
    
    // 1. Obtener TODOS los trainer_profiles
    const { data: allProfiles, error } = await supabase
        .from('trainer_profiles')
        .select('trainer_id, updated_at, full_data');
    
    if (error) {
        console.error('Error:', error);
        return;
    }
    
    console.log(`Total de perfiles en Supabase: ${allProfiles.length}\n`);
    
    allProfiles.forEach(profile => {
        const fd = profile.full_data;
        const diets = fd.diets || [];
        const clients = fd.clients || [];
        const blocks = fd.trainingBlocks || [];
        const routines = fd.routines || [];
        
        console.log(`\n═══ ENTRENADOR: ${profile.trainer_id} ═══`);
        console.log(`  Última actualización: ${profile.updated_at}`);
        console.log(`  Clientes: ${clients.length}`);
        console.log(`  Dietas: ${diets.length}`);
        console.log(`  Bloques: ${blocks.length}`);
        console.log(`  Rutinas: ${routines.length}`);
        
        // Buscar a Amalia por ID o por nombre
        const amalia = clients.find(c => c.id === AMALIA_ID || (c.name && c.name.toLowerCase().includes('amalia')));
        if (amalia) {
            console.log(`\n  ✅ AMALIA ENCONTRADA: ${amalia.name} (id: ${amalia.id})`);
            console.log(`     assignedDiet: ${amalia.assignedDiet}`);
            
            if (amalia.assignedDiet) {
                const diet = diets.find(d => d.id === amalia.assignedDiet);
                if (diet) {
                    console.log(`     ✅ DIETA ENCONTRADA: "${diet.name}"`);
                    console.log(`        Comidas: ${(diet.meals || []).length}`);
                    (diet.meals || []).forEach(m => {
                        console.log(`        - ${m.name}: ${(m.foods || []).length} alimentos`);
                        (m.foods || []).forEach(f => {
                            console.log(`          • ${f.name || f.foodName}: ${f.quantity || f.amount}g`);
                        });
                    });
                } else {
                    console.log(`     ❌ Dieta asignada "${amalia.assignedDiet}" NO encontrada en este perfil`);
                }
            }
        }
        
        // Mostrar todas las dietas de este perfil
        if (diets.length > 0) {
            console.log(`\n  DIETAS:`);
            diets.forEach(d => {
                console.log(`    - "${d.name}" (id: ${d.id}) clientId: ${d.clientId} meals: ${(d.meals||[]).length}`);
            });
        }
    });
    
    // 2. Buscar en saas_config también
    console.log('\n\n🔍 Buscando en saas_config...');
    const { data: config } = await supabase.from('saas_config').select('*');
    if (config) {
        config.forEach(c => {
            console.log(`  Config id: ${c.id}, keys: ${Object.keys(c.data || {}).join(', ')}`);
        });
    }
}

searchEverywhere().catch(console.error);
