const fs = require('fs');
const path = require('path');

const backupPath = path.join(__dirname, 'data', 'backup_real_t-w0iybl7qb_2026-06-11T08-32-42-498Z.json');
if (fs.existsSync(backupPath)) {
    const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    console.log("Backup file loaded successfully!");
    const clients = backup.clients || [];
    console.log(`Found ${clients.length} clients in backup.`);
    clients.forEach(c => {
        console.log(`Client: ${c.name}, ID: ${c.id}, assignedTrainerId: ${c.assignedTrainerId}`);
    });
} else {
    console.log("Backup file not found at:", backupPath);
}
