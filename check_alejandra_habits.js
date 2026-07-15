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
    const habits = db.habits || [];
    console.log(`Total habits records count in Toledo's profile: ${habits.length}`);
    
    // Search habits for Alejandra Sanchis (cid: 968525f6-b4f0-4862-85e2-0380eed6f215)
    const cid = "968525f6-b4f0-4862-85e2-0380eed6f215";
    const aHabits = habits.filter(h => h.clientId === cid);
    console.log(`Total habits records for Alejandra: ${aHabits.length}`);
    
    // Sort by date descending
    aHabits.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    console.log("Recent habits records for Alejandra:");
    aHabits.forEach((h, idx) => {
        if (idx < 15) {
            console.log(`- Date: ${h.date}, sleep: ${h.sleep || h.sleepHours || 'N/A'}, steps: ${h.steps || 'N/A'}, water: ${h.water || 'N/A'}`);
        }
    });
}

run();
