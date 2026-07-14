const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const INTEREST_TRAINERS = ['t-8umeizyns', 't-w0iybl7qb', 't-vdyrwk7dt', 'admin', 'demo', 'alejandra_asteam_gmail_com'];

async function run() {
    try {
        console.log("Querying selected profiles for Alejandra Sanchis logs...");
        const { data, error } = await supabase
            .from('trainer_profiles')
            .select('trainer_id, full_data')
            .in('trainer_id', INTEREST_TRAINERS);

        if (error) throw error;

        console.log(`Found ${data.length} matching rows. Scanning...`);
        for (const row of data) {
            const db = row.full_data || {};
            const clients = db.clients || [];
            const logs = db.trainingLogs || [];

            // Find if this trainer has Alejandra Sanchis
            const alejandraClients = clients.filter(c => (c.email || '').toLowerCase() === 'alejandrasanchisex@gmail.com');
            
            if (alejandraClients.length > 0) {
                console.log(`\nTrainer "${row.trainer_id}" has Alejandra Sanchis clients:`);
                alejandraClients.forEach(c => {
                    console.log(`- Client ID: ${c.id}, Name: ${c.name}, AccessCode: ${c.accessCode}`);
                    
                    const clientLogs = logs.filter(l => l.clientId === c.id);
                    console.log(`  Logs count: ${clientLogs.length}`);
                    clientLogs.forEach(l => {
                        console.log(`    - ID: ${l.id}, Date: ${l.date}, Day: ${l.dayNumber || l.workoutDayIndex}, Completed: ${l.completed}`);
                    });
                });
            }
        }
        console.log("\nDone.");

    } catch (err) {
        console.error(err);
    }
}

run();
