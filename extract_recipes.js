const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    const { data, error } = await supabase
        .from('trainer_profiles')
        .select('trainer_id, full_data')
        .eq('trainer_id', 'admin')
        .single();
    
    if (error) {
        console.error("Error:", error);
        return;
    }
    
    if (data.full_data && data.full_data.media) {
        const recipes = data.full_data.media.filter(m => m.category === 'recipe');
        fs.writeFileSync('admin_recipes.json', JSON.stringify(recipes, null, 2));
        console.log(`Saved ${recipes.length} recipes to admin_recipes.json`);
    }
}
run();
