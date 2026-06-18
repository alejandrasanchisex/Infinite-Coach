const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkTrainers() {
    const { data: profiles, error } = await supabase.from('trainer_profiles').select('*');
    if (error) {
        console.error(error);
        return;
    }
    for (const p of profiles) {
        const fullData = p.full_data || {};
        const brand = fullData.brand || {};
        const clients = fullData.clients || [];
        console.log(`TrainerID: ${p.trainer_id} | Email: ${p.email} | BrandName: ${brand.name} | Clients count: ${clients.length}`);
        if (clients.length > 0) {
            console.log(`  Clients: ` + clients.map(c => `"${c.name}" (Code: ${c.accessCode}, ID: ${c.id})`).join(', '));
        }
    }
}
checkTrainers();
