const fs = require('fs');

const filePath = 'public/trainer-client-detail.html';
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
console.log("Checking declarations of clientId in HTML...");

// Search for declarations (const, let, var, function parameters, catch parameters)
const declRegex = /(const|let|var)\s+clientId\b|\bclientId\s*=/;
lines.forEach((line, idx) => {
    if (declRegex.test(line)) {
        console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
});

console.log("\nSearching for all occurrences of clientId...");
lines.forEach((line, idx) => {
    if (line.includes('clientId')) {
        // Print the usage line if it matches
        console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
});
