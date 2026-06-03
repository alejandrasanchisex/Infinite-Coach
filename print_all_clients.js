const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function printAll() {
    console.log("Fetching all trainer profiles...");
    const { data: profiles, error } = await supabase.from('trainer_profiles').select('*');
    if (error) {
        console.error(error);
        return;
    }
    
    console.log(`Found ${profiles.length} profiles.`);
    for (const profile of profiles) {
        const fullData = profile.full_data || {};
        const clients = fullData.clients || [];
        console.log(`\nTrainer: ${profile.trainer_id} (${profile.email || 'No email'}) - Clients Count: ${clients.length}`);
        clients.forEach(c => {
            console.log(`  - Client Name: "${c.name}" | ID: "${c.id}"`);
        });
    }
}

printAll();
