const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkFeedbacks() {
    const { data: profiles, error } = await supabase.from('trainer_profiles').select('*');
    if (error) {
        console.error(error);
        return;
    }
    for (const profile of profiles) {
        const fullData = profile.full_data || {};
        const feedbacks = fullData.feedbacks || [];
        if (feedbacks.length > 0) {
            console.log(`Trainer: ${profile.trainer_id}`);
            feedbacks.forEach(f => {
                console.log(`  - Feedback ID: ${f.id} | ClientID: ${f.clientId} | Date: ${f.date} | TrainerResponse: "${f.trainerResponse}"`);
            });
        }
    }
}
checkFeedbacks();
