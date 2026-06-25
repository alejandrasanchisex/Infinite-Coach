const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TRAINER_ID = 't-kghykurxf';

async function check() {
    console.log(`Checking DB for trainer ${TRAINER_ID}...`);
    const { data, error } = await supabase.from('trainer_profiles').select('*').eq('trainer_id', TRAINER_ID).single();
    if (error) {
        console.error(error);
        return;
    }
    const fullData = data.full_data || {};
    const clients = fullData.clients || [];
    clients.forEach(c => {
        console.log(`Client: "${c.name}" (ID: ${c.id})`);
        console.log(`- accessCode: ${c.accessCode}`);
        console.log(`- initialSetupDone: ${c.initialSetupDone}`);
        console.log(`- status: ${c.status}`);
        console.log(`- paymentStatus: ${c.paymentStatus}`);
    });
}

check();
