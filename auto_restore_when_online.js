const { exec } = require('child_process');
const https = require('https');
const path = require('path');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";

function checkOnline() {
    return new Promise((resolve) => {
        const url = new URL(SUPABASE_URL + `/rest/v1/trainer_profiles?trainer_id=eq.t-8umeizyns&select=trainer_id`);
        const options = {
            method: 'GET',
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        };

        const req = https.request(options, (res) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                resolve(true);
            } else {
                resolve(false);
            }
        });

        // Set strict timeout of 5 seconds
        req.setTimeout(5000, () => {
            req.destroy();
            resolve(false);
        });

        req.on('error', () => {
            resolve(false);
        });
        req.end();
    });
}

async function loop() {
    console.log(`[${new Date().toISOString()}] Polling database status...`);
    const isOnline = await checkOnline();
    if (isOnline) {
        console.log(`[${new Date().toISOString()}] Database is ONLINE! Executing restore_and_prune_asteam.js...`);
        exec('node restore_and_prune_asteam.js', (err, stdout, stderr) => {
            if (err) {
                console.error("Execution failed:", err);
            }
            console.log("Stdout:", stdout);
            console.error("Stderr:", stderr);
            console.log("Auto-restore completed. Exiting.");
            process.exit(0);
        });
    } else {
        console.log("Database is still offline (522/Timeout). Waiting 15 seconds...");
        setTimeout(loop, 15000);
    }
}

loop();
