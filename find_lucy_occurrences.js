const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    console.log("Searching for lucy references globally in database...");
    const { data: profiles, error } = await supabase
        .from('trainer_profiles')
        .select('trainer_id, full_data');

    if (error) {
        console.error("Error:", error);
        return;
    }

    profiles.forEach(p => {
        const str = JSON.stringify(p.full_data || {}).toLowerCase();
        if (str.includes('lucytundidor') || str.includes('tundidor')) {
            console.log(`\nMatch in trainer_id: "${p.trainer_id}"`);
            const fd = p.full_data || {};
            console.log(`- Brand: ${fd.brand?.name}`);
            console.log(`- Clients: ${(fd.clients || []).length}`);
            console.log(`- Diets: ${(fd.diets || []).length}`);
            console.log(`- Routines: ${(fd.routines || []).length}`);
            console.log(`- teamMembers:`, (fd.teamMembers || []).map(t => `${t.name} (${t.email})`));
            
            // Check if there are diets and training logs
            console.log(`- diets:`, (fd.diets || []).map(d => `${d.name} (${d.id})`));
        }
    });
}
run().catch(console.error);
