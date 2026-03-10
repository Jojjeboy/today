import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const logFile = path.join(rootDir, 'lastvalidate.md');

// Initialize the log file
const timestamp = new Date().toISOString();
fs.writeFileSync(logFile, `# Validation Output (${timestamp})\n\n\`\`\`bash\n`);

console.log(`> Running validation suite and logging to ${logFile}`);

// Command to run: build, lint, typecheck, and test
const command = 'npm run build:only && npm run lint && npm run check-any && npm run test';

const child = spawn(command, {
    cwd: rootDir,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe']
});

const stream = fs.createWriteStream(logFile, { flags: 'a' });

const write = (data) => {
    process.stdout.write(data);
    stream.write(data);
};

const writeErr = (data) => {
    process.stderr.write(data);
    stream.write(data);
};

child.stdout.on('data', write);
child.stderr.on('data', writeErr);

child.on('close', (code) => {
    stream.write('\n```\n');
    if (code !== 0) {
        stream.write(`\n**❌ Validation Failed with exit code: ${code}**\n`);
    } else {
        stream.write(`\n**✅ Validation Passed via run-validate.js**\n`);
    }
    stream.end();
    process.exit(code);
});
