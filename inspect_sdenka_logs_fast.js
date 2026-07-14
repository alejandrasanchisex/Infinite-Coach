const { createClient } = require('@supabase/supabase-js');
const supabase = createClient("https://bieeydhacavxymoosasx.supabase.co", "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ");

const TRAINER_ID = 't-w0iybl7qb'; // Asteam

async function run() {
    try {
        console.log("Querying Supabase using fast JSONB path select...");
        const { data, error } = await supabase
            .from('trainer_profiles')
            .select('clients:full_data->clients, trainingLogs:full_data->trainingLogs')
            .eq('trainer_id', TRAINER_ID)
            .single();

        if (error) {
            console.log("Fast query error:", error);
            return;
        }

        const clients = data.clients || [];
        const sdenka = clients.find(c => (c.name || '').toLowerCase().includes('sdenka'));
        if (!sdenka) {
            console.log("Sdenka client not found under ASTeam!");
            return;
        }

        console.log(`Sdenka Client ID: ${sdenka.id}, ActiveBlockId: ${sdenka.activeBlockId}`);
        const logs = (data.trainingLogs || []).filter(l => l.clientId === sdenka.id);
        console.log(`\nSdenka Logs (${logs.length}):`);
        logs.forEach((l, idx) => {
            console.log(`\n[Log index: ${idx}] ID: ${l.id}, Date: ${l.date}, Day: ${l.dayNumber}, Completed: ${l.completed}, weekIndex: ${l.weekIndex}`);
            if (l.exercises && l.exercises.length > 0) {
                l.exercises.forEach(ex => {
                    const setsStr = (ex.sets || []).map(s => `W:${s.weight}/R:${s.reps}`).join(', ');
                    console.log(`  * ${ex.name}: [${setsStr}]`);
                });
            }
        });

    } catch (e) {
        console.error(e);
    }
}

run();
