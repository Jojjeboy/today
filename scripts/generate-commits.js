import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPath = path.join(__dirname, '../src/commits.json');

try {
    const logOutput = execSync('git log -n 20 --pretty=format:"%H|%ad|%s" --date=iso', { encoding: 'utf-8' });

    const commits = logOutput.split('\n').map(line => {
        const [hash, date, message] = line.split('|');
        if (!hash) return null;
        return { hash, date, message };
    }).filter(commit => commit !== null);

    const jsonContent = JSON.stringify(commits, null, 2);
    fs.writeFileSync(outputPath, jsonContent);
    
    // Also write to public folder so it can be fetched at runtime
    const publicPath = path.join(__dirname, '../public/commits.json');
    fs.writeFileSync(publicPath, jsonContent);

    console.log(`Generated commits.json with ${commits.length} commits in src/ and public/.`);
} catch (error) {
    console.error('Error generating commits.json:', error);
    // Create an empty file or a placeholder if git fails (e.g., no repo)
    const emptyContent = JSON.stringify([], null, 2);
    fs.writeFileSync(outputPath, emptyContent);
    const publicPath = path.join(__dirname, '../public/commits.json');
    fs.writeFileSync(publicPath, emptyContent);
}
