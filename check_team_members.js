const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    const { data, error } = await supabase
        .from('trainer_profiles')
        .select('full_data')
        .eq('trainer_id', 't-w0iybl7qb');

    if (error) {
        console.error(error);
        return;
    }

    if (data && data.length > 0) {
        const fullData = data[0].full_data || {};
        console.log("Team Members:", fullData.teamMembers);
    } else {
        console.log("No profile found!");
    }
}

run();
