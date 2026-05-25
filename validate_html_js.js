const fs = require('fs');
const vm = require('vm');

const filePath = 'public/trainer-client-detail.html';
const content = fs.readFileSync(filePath, 'utf8');

console.log("Extracting Script tag 1...");
const startTag = '<script>';
const endTag = '</script>';

// Find the main script tag starting at line 874
const startIndex = content.indexOf('<script>', 2000); // skip first few small scripts
const endIndex = content.indexOf('</script>', startIndex);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find the main script tag.");
    process.exit(1);
}

const jsCode = content.substring(startIndex + startTag.length, endIndex);
console.log(`JS Code extracted. Length: ${jsCode.length} characters.`);

try {
    console.log("Validating syntax via vm.Script...");
    new vm.Script(jsCode);
    console.log("🎉 Syntax is perfectly valid! No syntax errors found in this script tag.");
} catch (e) {
    console.error("❌ Syntax error detected in Javascript:");
    console.error(e.message);
    // Find the exact line in HTML where this happens
    const linesOfJs = jsCode.substring(0, e.position || 0).split('\n');
    const startLineNumber = content.substring(0, startIndex).split('\n').length;
    console.error(`Approximate HTML line number: ${startLineNumber + linesOfJs.length}`);
}
