import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('> Running validation suite...');

// Command to run: build, lint, typecheck, and test
const command = 'npm run build:only && npm run lint && npm run check-any && npm run test';

const child = spawn(command, {
    cwd: rootDir,
    shell: true,
    stdio: 'inherit'
});

child.on('close', (code) => {
    if (code !== 0) {
        console.error(`\n❌ Validation Failed with exit code: ${code}`);
    } else {
        console.log(`\n✅ Validation Passed`);
    }
    process.exit(code);
});
