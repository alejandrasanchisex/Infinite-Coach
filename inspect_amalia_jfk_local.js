const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TRAINER_ID = 't-kghykurxf';
const CLIENT_ID = '911db0b5-7407-4546-97f6-f38cacf99cd3';

async function check() {
    console.log(`Checking DB for trainer ${TRAINER_ID}...`);
    const { data, error } = await supabase.from('trainer_profiles').select('*').eq('trainer_id', TRAINER_ID).single();
    if (error) {
        console.error(error);
        return;
    }
    const fullData = data.full_data || {};
    const clients = fullData.clients || [];
    const amalia = clients.find(c => c.id === CLIENT_ID);
    if (!amalia) {
        console.log("Amalia Delgado not found under trainer " + TRAINER_ID);
        return;
    }
    console.log("Amalia Delgado:", JSON.stringify(amalia, null, 2));
}

check();
