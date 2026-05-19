const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    const { data, error } = await supabase
        .from('trainer_profiles')
        .select('trainer_id, full_data');
    
    if (error) {
        console.error("Error:", error);
        return;
    }
    
    data.forEach(d => {
        if (d.full_data && d.full_data.media) {
            const recipes = d.full_data.media.filter(m => m.category === 'recipe' && m.status !== 'hidden');
            console.log(`Trainer ${d.trainer_id}: ${recipes.length} recipes.`);
        }
    });
}
run();
