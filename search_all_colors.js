const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function searchColors() {
    console.log("Fetching all trainer profiles to inspect brand colors...");
    const { data, error } = await supabase.from('trainer_profiles').select('*');
    if (error) {
        console.error(error);
        return;
    }
    
    data.forEach(p => {
        const fd = p.full_data || {};
        console.log(`Trainer ID: "${p.trainer_id}"`);
        console.log("  Brand name:", fd.brand ? fd.brand.name : "N/A");
        console.log("  Colors:", fd.brand ? JSON.stringify(fd.brand.colors) : "N/A");
        console.log("  Logo:", fd.brand ? fd.brand.logo : "N/A");
        console.log("  Whatsapp:", fd.brand ? fd.brand.whatsapp : "N/A");
        console.log("-----------------------------------------");
    });
}

searchColors();
