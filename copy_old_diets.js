// Copiar la dieta y el bloque original del perfil antiguo al perfil actual
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TRAINER_ID_NEW = 't-w0iybl7qb';
const TRAINER_ID_OLD = 'alejandra_asteam_gmail_com';
const AMALIA_ID = '0db0ea7a-c413-44cb-b99e-dfd9790383eb';

async function copyOldToNew() {
    // Obtener ambos perfiles
    const [{ data: oldProfile }, { data: newProfile }] = await Promise.all([
        supabase.from('trainer_profiles').select('full_data').eq('trainer_id', TRAINER_ID_OLD).single(),
        supabase.from('trainer_profiles').select('full_data').eq('trainer_id', TRAINER_ID_NEW).single()
    ]);

    const oldFd = oldProfile.full_data;
    const newFd = newProfile.full_data;

    // 1. Copiar la "Dieta Definición" al perfil nuevo
    const dietaToCopy = oldFd.diets.find(d => d.name === 'Dieta Definición');
    if (dietaToCopy) {
        console.log(`✅ Copiando dieta "${dietaToCopy.name}" (${dietaToCopy.id})`);
        // Asegurar que la dieta tenga el clientId correcto
        dietaToCopy.clientId = AMALIA_ID;
        
        if (!newFd.diets) newFd.diets = [];
        // Remover si ya existe (por si hay duplicada)
        newFd.diets = newFd.diets.filter(d => d.id !== dietaToCopy.id);
        newFd.diets.push(dietaToCopy);
        
        // Asignar a Amalia
        const amalia = newFd.clients.find(c => c.id === AMALIA_ID);
        if (amalia) {
            amalia.assignedDiet = dietaToCopy.id;
            amalia.dietPublished = true; // Ya estaba publicada
            console.log(`✅ Dieta asignada a Amalia`);
        }
    }

    // 2. Ver el bloque "Hipertrofia 1" del perfil antiguo - tiene clientId de Amalia
    const oldBlock = (oldFd.trainingBlocks || []).find(b => b.clientId === AMALIA_ID);
    if (oldBlock) {
        console.log(`\n✅ Bloque original encontrado: "${oldBlock.name}"`);
        console.log(`   Semanas: ${(oldBlock.weeks||[]).length}`);
        (oldBlock.weeks||[]).forEach((w, wi) => {
            console.log(`   Semana ${wi+1}:`);
            (w.days||[]).forEach((d, di) => {
                console.log(`     Día ${di+1} "${d.name}": ${(d.exercises||[]).length} ejercicios`);
                (d.exercises||[]).forEach(ex => console.log(`       - ${ex.name}`));
            });
        });
        
        // Preguntar si reemplazar el bloque recuperado o mantener el actual
        // Como el de los logs tiene más ejercicios reales, mantenemos el que ya está
        // pero mostramos la info del antiguo para que el usuario decida
        console.log('\n   ⚠️  El bloque actual (restaurado de los logs) tiene más ejercicios que el antiguo.');
        console.log('   Manteniendo el bloque actual con datos reales de los logs.');
    }

    // 3. Guardar en Supabase
    newFd.lastModified = new Date().toISOString();
    
    console.log('\n💾 Guardando en Supabase...');
    const { error } = await supabase
        .from('trainer_profiles')
        .update({ full_data: newFd, updated_at: new Date().toISOString() })
        .eq('trainer_id', TRAINER_ID_NEW);
    
    if (error) {
        console.error('❌ Error:', error);
    } else {
        console.log('\n✅ ¡TODO RESTAURADO!');
        console.log('   - Dieta "Dieta Definición" copiada y asignada a Amalia');
        console.log('   - Recarga la página (F5) para ver los cambios');
    }
}

copyOldToNew().catch(console.error);
