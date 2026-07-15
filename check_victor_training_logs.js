const https = require('https');

const SUPABASE_URL = "https://bieeydhacavxymoosasx.supabase.co";
const SUPABASE_KEY = "sb_publishable_ffxbK3z-Am1wVmqV5Szs_w_zOv8RLWQ";

function makeRequest(method, path) {
    return new Promise((resolve, reject) => {
        const url = new URL(SUPABASE_URL + path);
        const options = {
            method: method,
            hostname: url.hostname,
            port: 443,
            path: url.pathname + url.search,
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => { responseBody += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(responseBody));
                } else {
                    reject(new Error(`Status ${res.statusCode}: ${responseBody}`));
                }
            });
        });

        req.on('error', (err) => { reject(err); });
        req.end();
    });
}

async function run() {
    const result = await makeRequest('GET', `/rest/v1/trainer_profiles?trainer_id=eq.t-8umeizyns&select=full_data`);
    if (result && result.length > 0) {
        const fullData = result[0].full_data || {};
        const logs = fullData.trainingLogs || [];
        console.log(`Total training logs count: ${logs.length}`);
        
        // Group by week and day
        const groups = {};
        logs.forEach(log => {
            const key = `Week ${log.week || log.weekIndex}, Day ${log.day || log.dayIndex}`;
            if (!groups[key]) groups[key] = 0;
            groups[key]++;
        });
        
        console.log("Logs by Week/Day:");
        Object.keys(groups).forEach(k => {
            console.log(`- ${k}: ${groups[k]} sets/logs`);
        });
        
        // Let's print logs from Week 3 specifically
        const w3Logs = logs.filter(log => String(log.week || log.weekIndex) === '3');
        console.log(`Week 3 logs details:`);
        w3Logs.forEach(log => {
            console.log(`  - Log: id=${log.id}, date=${log.date}, dayIndex=${log.day || log.dayIndex}, exercise=${log.exerciseName || log.exerciseId}, setsCount=${log.sets ? log.sets.length : 0}`);
        });
    } else {
        console.log("Profile not found");
    }
}

run().catch(console.error);
