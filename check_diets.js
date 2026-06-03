// Diagnóstico completo de dietas del entrenador ASTEAM
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const TRAINER_ID = 't-w0iybl7qb';
const AMALIA_ID = '0db0ea7a-c413-44cb-b99e-dfd9790383eb';

async function checkDiets() {
    const { data } = await supabase.from('trainer_profiles').select('full_data').eq('trainer_id', TRAINER_ID).single();
    const fd = data.full_data;
    
    console.log('=== DIETAS DEL ENTRENADOR ===');
    console.log(`Total dietas: ${(fd.diets || []).length}`);
    (fd.diets || []).forEach((d, i) => {
        console.log(`\nDieta ${i+1}: "${d.name}" (id: ${d.id})`);
        console.log('  Meals:', (d.meals || []).length);
        console.log('  ClientId:', d.clientId);
        console.log('  Published:', d.published);
    });
    
    console.log('\n=== AMALIA ===');
    const amalia = (fd.clients || []).find(c => c.id === AMALIA_ID);
    if (amalia) {
        console.log('  assignedDiet:', amalia.assignedDiet);
        console.log('  dietPublished:', amalia.dietPublished);
    }
    
    console.log('\n=== TODOS LOS CLIENTES Y SUS DIETAS ===');
    (fd.clients || []).forEach(c => {
        console.log(`  ${c.name}: assignedDiet=${c.assignedDiet}`);
    });
}
checkDiets().catch(console.error);
