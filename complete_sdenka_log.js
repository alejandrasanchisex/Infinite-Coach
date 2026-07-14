const { createClient } = require('@supabase/supabase-js');
const supabase = createClient("https://bieeydhacavxymoosasx.supabase.co", "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ");

const TRAINER_ID = 't-w0iybl7qb'; // Asteam
const CLIENT_ID = '5f646908-f625-47cd-9713-1db985c9518f';
const TARGET_LOG_ID = 'a6c84a68-737a-48c5-90d9-1ca70d9c5e72';

async function run() {
    try {
        console.log("Fetching Asteam database...");
        const { data: row, error } = await supabase
            .from('trainer_profiles')
            .select('full_data')
            .eq('trainer_id', TRAINER_ID)
            .single();

        if (error) throw error;

        const db = row.full_data || {};
        const logs = db.trainingLogs || [];

        // Find Sdenka's target log
        const targetLog = logs.find(l => l.id === TARGET_LOG_ID);
        if (!targetLog) {
            console.log(`Target log ${TARGET_LOG_ID} not found!`);
            return;
        }

        console.log("Target log found. Updating to Completed...");
        targetLog.completed = true;
        targetLog.weekIndex = 0;
        targetLog.lastModified = new Date().toISOString();

        // Filter out other draft logs from Sdenka for Day 1/Day 3 that were created today
        const filteredLogs = logs.filter(l => {
            if (l.clientId === CLIENT_ID && l.id !== TARGET_LOG_ID && l.completed === false) {
                // Remove other drafts of today
                return false;
            }
            return true;
        });

        db.trainingLogs = filteredLogs;
        db.lastModified = new Date().toISOString();

        console.log(`Writing back to database (logs count: ${filteredLogs.length})...`);
        
        let success = false;
        for (let attempt = 1; attempt <= 5; attempt++) {
            try {
                console.log(`Attempt ${attempt}/5 to save to Supabase...`);
                const { error: updateError } = await supabase
                    .from('trainer_profiles')
                    .update({ full_data: db })
                    .eq('trainer_id', TRAINER_ID);

                if (updateError) {
                    console.log(`Attempt ${attempt} failed with error:`, updateError.message);
                } else {
                    console.log("SUCCESS! Sdenka's workout log has been set to completed directly in Supabase!");
                    success = true;
                    break;
                }
            } catch (errAttempt) {
                console.log(`Attempt ${attempt} threw exception:`, errAttempt.message);
            }
            console.log("Waiting 15 seconds before next attempt...");
            await new Promise(resolve => setTimeout(resolve, 15000));
        }

        if (!success) {
            console.log("All attempts to write to Supabase timed out.");
        }

    } catch (e) {
        console.error(e);
    }
}

run();
