const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const INTEREST_TRAINERS = ['t-8umeizyns', 't-w0iybl7qb', 't-vdyrwk7dt', 'admin', 'demo', 'alejandra_asteam_gmail_com'];

async function checkTrainer(trainerId) {
    try {
        console.log(`Querying trainer "${trainerId}"...`);
        const { data, error } = await supabase
            .from('trainer_profiles')
            .select('full_data')
            .eq('trainer_id', trainerId)
            .single();

        if (error) {
            console.log(`Error querying trainer "${trainerId}":`, error.message);
            return;
        }

        const db = data.full_data || {};
        const clients = db.clients || [];
        const logs = db.trainingLogs || [];

        const alejandraClients = clients.filter(c => (c.email || '').toLowerCase() === 'alejandrasanchisex@gmail.com');
        if (alejandraClients.length > 0) {
            console.log(`Trainer "${trainerId}" has Alejandra Sanchis clients:`);
            alejandraClients.forEach(c => {
                const clientLogs = logs.filter(l => l.clientId === c.id);
                console.log(`- Client ID: ${c.id}, Name: ${c.name}, AccessCode: ${c.accessCode}, Logs: ${clientLogs.length}`);
                clientLogs.forEach(l => {
                    console.log(`  - Date: ${l.date}, Day: ${l.dayNumber || l.workoutDayIndex}, Completed: ${l.completed}`);
                });
            });
        } else {
            console.log(`Trainer "${trainerId}" does not have Alejandra Sanchis.`);
        }
    } catch (e) {
        console.error(`Exception checking "${trainerId}":`, e);
    }
}

async function run() {
    for (const t of INTEREST_TRAINERS) {
        await checkTrainer(t);
    }
    console.log("Done.");
}

run();
