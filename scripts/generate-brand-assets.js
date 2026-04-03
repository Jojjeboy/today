import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.resolve(__dirname, '../public');

// Allow custom source path through CLI argument, default to logo-source.png
const customSource = process.argv[2];
const sourcePath = customSource ? path.resolve(process.cwd(), customSource) : path.resolve(publicDir, 'logo-source.png');

async function generateBrandAssets() {
    try {
        if (!fs.existsSync(sourcePath)) {
            console.error(`❌ Source image not found at ${sourcePath}`);
            console.error(`Usage: node scripts/generate-brand-assets.js [source-image-path]`);
            console.error(`Default: public/logo-source.png`);
            process.exit(1);
        }

        console.log(`Generating branding assets from ${sourcePath}...`);

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

        // 4. Generate Apple Touch Icon (180x180, white background)
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
