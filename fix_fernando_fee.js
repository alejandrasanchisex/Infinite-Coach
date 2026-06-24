const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TRAINER_ID = 't-w0iybl7qb';
const FERNANDO_ID = '20f2e6c2-2699-4ccc-a982-1e9fb141b9bb';

async function fixFee() {
    console.log('🔍 Obteniendo perfil de ASTeam de Supabase...');
    const { data, error } = await supabase
        .from('trainer_profiles')
        .select('full_data')
        .eq('trainer_id', TRAINER_ID)
        .single();
        
    if (error) {
        console.error('❌ Error al obtener datos:', error);
        return;
    }
    
    const fd = data.full_data || {};
    const clients = fd.clients || [];
    
    const fernando = clients.find(c => c.id === FERNANDO_ID);
    if (fernando) {
        console.log(`✅ Cliente Fernando López encontrado. Cuota anterior: ${fernando.monthlyFee}`);
        fernando.monthlyFee = 65;
        fernando.subscriptionAmount = 65;
        console.log(`⚙️ Nueva cuota asignada: 65 euros.`);
        
        // Guardar de vuelta
        const { error: saveError } = await supabase
            .from('trainer_profiles')
            .update({
                full_data: fd,
                updated_at: new Date().toISOString()
            })
            .eq('trainer_id', TRAINER_ID);
            
        if (saveError) {
            console.error('❌ Error al guardar datos actualizados:', saveError);
        } else {
            console.log('🎉 Cuota de Fernando López guardada con éxito en la base de datos (65€)!');
        }
    } else {
        console.log('❌ No se encontró a Fernando López en la lista de clientes.');
    }
}

fixFee().catch(console.error);
