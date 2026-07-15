const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    const { data, error } = await supabase
        .from('trainer_profiles')
        .select('full_data')
        .eq('trainer_id', 't-8umeizyns')
        .single();

    if (error) {
        console.error(error);
        return;
    }

    const db = data.full_data || {};
    const logs = db.trainingLogs || [];
    
    // Alejandra's client ID
    const cid = "968525f6-b4f0-4862-85e2-0380eed6f215";
    const aLogs = logs.filter(l => l.clientId === cid);
    
    // Sort descending by date
    aLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log("RAW DETAILS OF THE 5 LATEST LOGS FOR ALEJANDRA:");
    aLogs.slice(0, 5).forEach((l, idx) => {
        console.log(`\n--- Log #${idx + 1} ---`);
        console.log(JSON.stringify(l, null, 2));
    });
}

run();
