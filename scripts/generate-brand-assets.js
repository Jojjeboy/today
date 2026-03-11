import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This script assumes you place your high-resolution original logo here
const sourcePath = path.resolve(__dirname, '../public/logo-source.png');
const publicDir = path.resolve(__dirname, '../public');

async function generateBrandAssets() {
    try {
        if (!fs.existsSync(sourcePath)) {
            console.error(`❌ Source image not found at ${sourcePath}`);
            console.error(`Please place your high-resolution logo (ideally 1024x1024 or larger) at public/logo-source.png before running this script.`);
            process.exit(1);
        }

        console.log('Generating branding assets from public/logo-source.png...');

        // 1. Generate Favicon (64x64)
        await sharp(sourcePath)
            .resize(64, 64)
            .png()
            .toFile(path.join(publicDir, 'favicon.png'));
        console.log('✅ favicon.png (64x64)');

        // 2. Generate PWA Icon 192x192
        await sharp(sourcePath)
            .resize(192, 192)
            .png()
            .toFile(path.join(publicDir, 'icon-192.png'));
        console.log('✅ icon-192.png (192x192)');

        // 3. Generate PWA Icon 512x512
        await sharp(sourcePath)
            .resize(512, 512)
            .png()
            .toFile(path.join(publicDir, 'icon-512.png'));
        console.log('✅ icon-512.png (512x512)');

        // 4. Generate Apple Touch Icon (180x180, white background to remove transparency for iOS)
        await sharp(sourcePath)
            .resize(180, 180)
            .flatten({ background: { r: 255, g: 255, b: 255 } })
            .png()
            .toFile(path.join(publicDir, 'apple-touch-icon.png'));
        console.log('✅ apple-touch-icon.png (180x180, flattened)');

        console.log('\n🎉 All brand assets generated successfully!');
    } catch (error) {
        console.error('Error generating assets:', error);
        process.exit(1);
    }
}

generateBrandAssets();
