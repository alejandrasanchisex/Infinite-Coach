const { createClient } = require('@supabase/supabase-js');
const supabase = createClient("https://bieeydhacavxymoosasx.supabase.co", "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ");

const TRAINER_ID = 't-w0iybl7qb'; // Asteam

async function run() {
    try {
        const { data: row, error } = await supabase
            .from('trainer_profiles')
            .select('full_data')
            .eq('trainer_id', TRAINER_ID)
            .single();

        if (error) throw error;

        const db = row.full_data || {};
        const clients = db.clients || [];
        const sdenka = clients.find(c => (c.name || '').toLowerCase().includes('sdenka'));
        
        if (!sdenka) {
            console.log("Sdenka client not found!");
            return;
        }

        console.log(`Sdenka Client ID: ${sdenka.id}`);
        const logs = (db.trainingLogs || []).filter(l => l.clientId === sdenka.id);
        console.log(`\nSdenka Logs in database (${logs.length}):`);
        logs.forEach((l, idx) => {
            console.log(`\n[Log index: ${idx}] ID: ${l.id}`);
            console.log(`- Date: ${l.date}`);
            console.log(`- Day: ${l.dayNumber}`);
            console.log(`- Completed: ${l.completed}`);
            console.log(`- weekIndex: ${l.weekIndex}`);
            console.log(`- comment: ${l.comment}`);
            console.log(`- Exercises count: ${l.exercises ? l.exercises.length : 0}`);
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
