const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function exportAdmin() {
    const { data, error } = await supabase.from('trainer_profiles').select('*').eq('trainer_id', 'admin').single();
    if (error) {
        console.error(error);
        return;
    }
    const fs = require('fs');
    fs.writeFileSync('admin_full.json', JSON.stringify(data.full_data, null, 2));
    console.log("Exported admin full data to admin_full.json");
}

exportAdmin();
