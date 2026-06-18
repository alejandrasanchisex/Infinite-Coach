const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspect() {
    const trainerId = 't-w0iybl7qb';
    const { data } = await supabase
        .from('trainer_profiles')
        .select('full_data')
        .eq('trainer_id', trainerId)
        .single();
        
    const diets = data.full_data.diets || [];
    if (diets.length > 0) {
        const d = diets[0];
        console.log("Diet keys:", Object.keys(d));
        console.log("Diet basic info:", {
            id: d.id,
            clientId: d.clientId,
            name: d.name,
            status: d.status,
            published: d.published
        });
        if (d.meals) {
            console.log(`Meals count: ${d.meals.length}`);
            console.log("First meal keys:", Object.keys(d.meals[0]));
            console.log("First meal content sample:", JSON.stringify(d.meals[0], null, 2));
        }
        if (d.targetMacros) {
            console.log("Target Macros:", d.targetMacros);
        }
    }
}
inspect();
