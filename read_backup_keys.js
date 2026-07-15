const fs = require('fs');
const path = require('path');

const SCRATCH_DIR = path.join(__dirname, 'scratch');

function inspectFileKeys(filename) {
    const filePath = path.join(SCRATCH_DIR, filename);
    if (!fs.existsSync(filePath)) {
        console.log(`File not found: ${filename}`);
        return;
    }
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log(`\nKeys of ${filename}:`, Object.keys(content));
    
    // Check if it's an array
    if (Array.isArray(content)) {
        console.log(`- It is an array of length ${content.length}`);
        if (content.length > 0) {
            console.log(`- Element 0 keys:`, Object.keys(content[0]));
            if (content[0].full_data) {
                console.log(`- Element 0 full_data keys:`, Object.keys(content[0].full_data));
                const clients = content[0].full_data.clients || [];
                console.log(`- Element 0 full_data.clients Count: ${clients.length}`);
                clients.forEach(c => {
                    console.log(`  * ${c.name} (${c.id})`);
                });
            }
        }
    } else {
        if (content.full_data) {
            console.log(`- full_data keys:`, Object.keys(content.full_data));
            const clients = content.full_data.clients || [];
            console.log(`- full_data.clients Count: ${clients.length}`);
            clients.forEach(c => {
                console.log(`  * ${c.name} (${c.id})`);
            });
        }
    }
}

inspectFileKeys('backup_pre_delete_media_alejandra_asteam_gmail_com_2026-06-11T08-44-18-615Z.json');
inspectFileKeys('backup_pre_rename_alejandra_asteam_gmail_com_2026-06-11T08-34-59-687Z.json');
inspectFileKeys('backup_real_alejandra_asteam_gmail_com_2026-06-11T08-32-42-498Z.json');
inspectFileKeys('backup_real_t-w0iybl7qb_2026-06-11T08-32-42-498Z.json');
