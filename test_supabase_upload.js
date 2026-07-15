const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
    const dummyBuffer = Buffer.from("hello world");
    const fileName = `test_${Date.now()}.txt`;
    
    console.log(`Trying to upload dummy file ${fileName} to 'Media' bucket...`);
    
    try {
        const { data, error } = await supabase.storage
            .from('Media')
            .upload(fileName, dummyBuffer, {
                contentType: 'text/plain',
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error("Upload failed with error details:");
            console.error(JSON.stringify(error, null, 2));
            return;
        }

        console.log("Upload succeeded! Data:", data);
        
        // Get public URL
        const { data: urlData } = supabase.storage
            .from('Media')
            .getPublicUrl(fileName);
        console.log("Public URL:", urlData.publicUrl);
        
        // Clean up
        console.log("Cleaning up test file...");
        const { error: removeError } = await supabase.storage
            .from('Media')
            .remove([fileName]);
        if (removeError) {
            console.error("Cleanup failed:", removeError);
        } else {
            console.log("Cleanup succeeded!");
        }
    } catch (e) {
        console.error("Upload threw exception:", e);
    }
}

run();
