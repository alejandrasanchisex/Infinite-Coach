const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    const { data, error } = await supabase.from('trainer_profiles').select('*').eq('trainer_id', 't-zum04ds2n').single();
    if (error) {
        console.error(error);
        return;
    }
    const fullData = data.full_data || {};
    console.log("Brand in DB:", JSON.stringify(fullData.brand, null, 2));
}
run();
