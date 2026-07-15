const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    const { data, error } = await supabase
        .from('trainer_profiles')
        .select('trainer_id, full_data')
        .eq('trainer_id', 't-w0iybl7qb');

    if (error) {
        console.error("Error fetching ASTeam profile:", error);
        return;
    }

    if (data && data.length > 0) {
        const fullData = data[0].full_data || {};
        console.log("ASTeam Profile Found in Supabase!");
        console.log("Trainer ID:", data[0].trainer_id);
        console.log("Brand Name:", fullData.brand ? fullData.brand.name : "None");
        console.log("Clients Count:", fullData.clients ? fullData.clients.length : 0);
        if (fullData.clients) {
            fullData.clients.forEach(c => {
                console.log(` - Client: ${c.name} (ID: ${c.id}), status: ${c.status}`);
            });
        }
    } else {
        console.log("ASTeam Profile NOT found in Supabase for ID t-w0iybl7qb");
    }
}

run();
