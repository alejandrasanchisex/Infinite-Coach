const fs = require('fs');
const path = require('path');
const vm = require('vm');

const publicDir = path.join(__dirname, '..', 'public');

function validateAllHtmlFiles() {
    console.log("🔍 Starting HTML inline JavaScript syntax validation...");
    
    let hasErrors = false;
    let checkedFiles = 0;
    let checkedScripts = 0;

    const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

    files.forEach(file => {
        const filePath = path.join(publicDir, file);
        const html = fs.readFileSync(filePath, 'utf8');
        checkedFiles++;

        const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
        let match;
        
        while ((match = scriptRegex.exec(html)) !== null) {
            const scriptTag = match[0];
            const jsCode = match[1];

            // Skip external script tags
            if (scriptTag.includes('src=')) {
                continue;
            }

            checkedScripts++;

            try {
                // Compile the JS code inside a VM script to check for syntax errors
                new vm.Script(jsCode, { filename: file });
            } catch (err) {
                hasErrors = true;
                console.error(`\n❌ Syntax Error in file: ${path.relative(process.cwd(), filePath)}`);
                
                // Calculate the line number in the HTML file
                const htmlBeforeScript = html.substring(0, match.index);
                const scriptStartLine = htmlBeforeScript.split('\n').length;
                
                // Parse the error stack to find the relative line number
                let relativeLine = 1;
                if (err.stack) {
                    const matchLine = err.stack.match(/:(\d+)(:\d+)?/);
                    if (matchLine) {
                        relativeLine = parseInt(matchLine[1], 10);
                    }
                }

                const absoluteLine = scriptStartLine + relativeLine - 1;
                console.error(`👉 Error message: ${err.message}`);
                console.error(`👉 Location: Line ${absoluteLine} in HTML file.`);
                
                // Print some surrounding lines
                const htmlLines = html.split('\n');
                const startPrint = Math.max(0, absoluteLine - 4);
                const endPrint = Math.min(htmlLines.length, absoluteLine + 4);
                
                console.error("\nCode snippet around error:");
                for (let i = startPrint; i < endPrint; i++) {
                    const prefix = (i + 1) === absoluteLine ? " > " : "   ";
                    console.error(`${prefix}${i + 1}: ${htmlLines[i]}`);
                }
                console.error("--------------------------------------------------");
            }
        }
    });

    console.log(`\nValidation complete: Checked ${checkedFiles} HTML files containing ${checkedScripts} inline script tags.`);
    
    if (hasErrors) {
        console.error("🚨 Validation failed: One or more HTML files contain syntax errors in their inline scripts!");
        process.exit(1);
    } else {
        console.log("🎉 Validation passed: All inline scripts are syntactically correct!");
        process.exit(0);
    }
}

validateAllHtmlFiles();
