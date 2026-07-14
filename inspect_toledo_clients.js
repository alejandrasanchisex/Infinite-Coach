const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TRAINER_ID = 't-8umeizyns';

async function run() {
    try {
        const { data, error } = await supabase
            .from('trainer_profiles')
            .select('full_data')
            .eq('trainer_id', TRAINER_ID)
            .single();

        if (error) throw error;

        const db = data.full_data || {};
        const clients = db.clients || [];
        console.log(`Found ${clients.length} clients in Toledo's profile:`);
        for (const c of clients) {
            console.log(`- ID: ${c.id}, Name: ${c.name}, Email: ${c.email}`);
        }

        // Print training logs for these clients
        const logs = db.trainingLogs || [];
        console.log(`\nFound ${logs.length} training logs in Toledo's profile:`);
        for (const log of logs) {
            console.log(`- Client ID: ${log.clientId}, Date: ${log.date}, Routine ID: ${log.routineId}, Completed: ${log.completed}`);
        }

    } catch (err) {
        console.error(err);
    }
}

run();
