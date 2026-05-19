const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function uploadImage() {
    const path = "C:\\Users\\usuario\\.gemini\\antigravity\\brain\\2617aa67-b389-4571-a76a-9db95dbf07e3\\ternera_con_patatas_1779007310662.png";
    const fileBuffer = fs.readFileSync(path);
    const fileName = "1779007310662_Ternera_con_patatas.png";

    console.log("Uploading to Supabase...");
    const { data, error } = await supabase
        .storage
        .from('Media')
        .upload(fileName, fileBuffer, {
            contentType: 'image/png',
            upsert: true
        });

    if (error) {
        console.error("Upload failed:", error);
    } else {
        const publicUrl = supabase.storage.from('Media').getPublicUrl(fileName).data.publicUrl;
        console.log("Success! URL:", publicUrl);
    }
}

uploadImage();
