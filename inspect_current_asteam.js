const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    console.log("Fetching current ASTeam trainer profile...");
    const { data, error } = await supabase
        .from('trainer_profiles')
        .select('full_data')
        .eq('trainer_id', 't-w0iybl7qb')
        .single();
        
    if (error) {
        console.error("Error:", error);
        return;
    }
    
    const fd = data.full_data || {};
    console.log("Current collections inside t-w0iybl7qb full_data:");
    Object.keys(fd).forEach(key => {
        const val = fd[key];
        if (Array.isArray(val)) {
            console.log(`- ${key}: length = ${val.length}`);
            if (key === 'clients') {
                val.forEach(c => {
                    console.log(`  * Client: ${c.name} (${c.id})`);
                });
            }
        } else {
            console.log(`- ${key}: type = ${typeof val}`);
        }
    });
}

run().catch(console.error);
