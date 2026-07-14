const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CLIENT_ID = '968525f6-b4f0-4862-85e2-0380eed6f215';

async function run() {
    try {
        const { data, error } = await supabase
            .from('trainer_profiles')
            .select('trainer_id, full_data');

        if (error) throw error;

        console.log(`Searching for Client ID "${CLIENT_ID}" in all trainer profiles...`);
        for (const row of data) {
            const db = row.full_data || {};
            const clients = db.clients || [];
            const found = clients.find(c => c.id === CLIENT_ID);
            if (found) {
                console.log(`Found in trainer: ${row.trainer_id}`);
                console.log(`  Client Name: ${found.name}`);
                console.log(`  Access Code: ${found.accessCode}`);
            }
        }
    } catch (err) {
        console.error(err);
    }
}

run();
