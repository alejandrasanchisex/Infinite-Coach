const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const recipes = require('./admin_recipes.json');
const recipeIds = new Set(recipes.map(r => r.id));

async function run() {
    const { data, error } = await supabase.from('trainer_profiles').select('*');
    if (error) {
        console.error(error);
        return;
    }
    
    for (const profile of data) {
        if (profile.full_data && profile.full_data.hidden_system_media) {
            const originalHidden = profile.full_data.hidden_system_media;
            // Keep only IDs that are NOT in recipeIds
            const newHidden = originalHidden.filter(id => !recipeIds.has(id));
            
            if (originalHidden.length !== newHidden.length) {
                profile.full_data.hidden_system_media = newHidden;
                const { error: updateError } = await supabase
                    .from('trainer_profiles')
                    .update({ full_data: profile.full_data })
                    .eq('trainer_id', profile.trainer_id);
                
                if (updateError) {
                    console.error('Failed to update', profile.trainer_id, updateError);
                } else {
                    console.log(`Updated ${profile.trainer_id}: unhid ${originalHidden.length - newHidden.length} recipes.`);
                }
            }
        }
    }
}
run();
