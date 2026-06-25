const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    console.log("Fetching all trainer profiles...");
    const { data: profiles, error } = await supabase.from('trainer_profiles').select('trainer_id, full_data');
    if (error) {
        console.error(error);
        return;
    }
    
    profiles.forEach(p => {
        const clients = (p.full_data && p.full_data.clients) || [];
        clients.forEach(c => {
            if (c.initialSetupDone !== undefined) {
                console.log(`Trainer: ${p.trainer_id} | Client: "${c.name}" (ID: ${c.id}) | initialSetupDone: ${c.initialSetupDone} (${typeof c.initialSetupDone})`);
            }
        });
    });
}

check();
