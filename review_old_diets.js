// Revisar las dietas del perfil antiguo alejandra_asteam_gmail_com
// y verificar si alguna podría ser la de Amalia
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TRAINER_ID_NEW = 't-w0iybl7qb';
const TRAINER_ID_OLD = 'alejandra_asteam_gmail_com';
const AMALIA_ID = '0db0ea7a-c413-44cb-b99e-dfd9790383eb';

async function reviewOldDiets() {
    // Obtener el perfil antiguo
    const { data: oldProfile } = await supabase
        .from('trainer_profiles')
        .select('full_data, updated_at')
        .eq('trainer_id', TRAINER_ID_OLD)
        .single();

    if (!oldProfile) { console.log('No hay perfil antiguo'); return; }

    const fd = oldProfile.full_data;
    console.log('=== PERFIL ANTIGUO (alejandra_asteam_gmail_com) ===');
    console.log('Actualizado:', oldProfile.updated_at);
    console.log('Clientes:', (fd.clients||[]).length);
    console.log('Dietas:', (fd.diets||[]).length);

    // Ver dietas detalladas
    (fd.diets||[]).forEach((d, i) => {
        console.log(`\n--- DIETA ${i+1}: "${d.name}" ---`);
        console.log('  ID:', d.id);
        console.log('  ClientId:', d.clientId);
        console.log('  Comidas:', (d.meals||[]).length);
        (d.meals||[]).forEach(m => {
            console.log(`\n  🍽️  ${m.name} (${m.time||''}):`);
            (m.foods||[]).forEach(f => {
                const name = f.name || f.foodName || 'Sin nombre';
                const qty = f.quantity || f.amount || f.grams || '?';
                const unit = f.unit || 'g';
                console.log(`       • ${name}: ${qty}${unit}`);
            });
        });
    });

    // Bloques del perfil antiguo
    console.log('\n\n=== BLOQUES PERFIL ANTIGUO ===');
    (fd.trainingBlocks||[]).forEach(b => {
        console.log(`Bloque: "${b.name}" status=${b.status} clientId=${b.clientId}`);
        console.log('  Semanas:', (b.weeks||[]).length);
        (b.weeks||[]).forEach((w,wi) => {
            console.log(`  Semana ${wi+1}: ${(w.days||[]).length} días`);
            (w.days||[]).forEach((d,di) => {
                console.log(`    Día ${di+1} "${d.name}": ${(d.exercises||[]).length} ejercicios`);
            });
        });
    });

    // Ver si podemos copiar las dietas al perfil nuevo
    console.log('\n\n¿Copiar dietas del perfil antiguo al nuevo? Ejecuta: node copy_old_diets.js');
}

reviewOldDiets().catch(console.error);
