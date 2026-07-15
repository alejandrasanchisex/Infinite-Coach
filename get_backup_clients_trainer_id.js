const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    const { data, error } = await supabase
        .from('trainer_profiles')
        .select('full_data')
        .eq('trainer_id', 't-w0iybl7qb_backup');

    if (error) {
        console.error(error);
        return;
    }

    if (data && data.length > 0) {
        const fullData = data[0].full_data || {};
        const clients = fullData.clients || [];
        console.log(`Found ${clients.length} clients in backup.`);
        clients.forEach(c => {
            console.log(`Client: ${c.name}, ID: ${c.id}, assignedTrainerId: ${c.assignedTrainerId}`);
        });
    } else {
        console.log("No backup found!");
    }
}

run();
