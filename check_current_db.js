const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkCurrent() {
    for (const trainerId of ['t-w0iybl7qb', 'alejandra_asteam_gmail_com']) {
        console.log(`Checking DB for ${trainerId}...`);
        const { data, error } = await supabase.from('trainer_profiles').select('*').eq('trainer_id', trainerId).single();
        if (error) {
            console.error(error);
            continue;
        }
        const fullData = data.full_data || {};
        console.log(`- ${trainerId} trainingBlocks count:`, (fullData.trainingBlocks || []).length);
        console.log(`- ${trainerId} clients count:`, (fullData.clients || []).length);
    }
}

checkCurrent();
