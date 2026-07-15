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
    console.log(`Total training logs count in Toledo's profile: ${logs.length}`);
    
    // Search logs for Alejandra Sanchis (we will print recent logs)
    // First, let's list the clients to find Alejandra's ID
    const clients = db.clients || [];
    const alejandra = clients.find(c => c.name && c.name.toLowerCase().includes('alejandra'));
    if (!alejandra) {
        console.log("Alejandra not found in clients list!");
        return;
    }
    console.log(`Found Alejandra: ID=${alejandra.id}, accessCode=${alejandra.accessCode}`);

    const alejandraLogs = logs.filter(l => l.clientId === alejandra.id);
    console.log(`Total logs for Alejandra: ${alejandraLogs.length}`);
    
    // Sort logs by date descending
    alejandraLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log("Recent training logs for Alejandra:");
    alejandraLogs.forEach((l, idx) => {
        if (idx < 15) {
            console.log(`- Date: ${l.date}, WeekIndex: ${l.weekIndex}, Week: ${l.week}, DayIndex: ${l.dayIndex}, Day: ${l.day}, ExName: ${l.exerciseName}`);
        }
    });
}

run();
