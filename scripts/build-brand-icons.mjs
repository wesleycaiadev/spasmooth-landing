import fs from 'node:fs/promises';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const source = new URL('public/assets/spasmooth-lotus-transparent-v3.webp', root);
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

for (const [name, size] of [['icon', 64], ['apple-icon', 200]]) {
    // Both trim and contain must retain alpha. Sharp otherwise pads contain with black.
    const png = await sharp(await fs.readFile(source))
        .trim({ background: transparent })
        .resize(size, size, { fit: 'contain', background: transparent })
        .ensureAlpha()
        .png({ palette: false })
        .toBuffer();
    await fs.writeFile(new URL(`src/app/${name}.png`, root), png);
    if (name !== 'icon') continue;

    const header = Buffer.alloc(22);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(1, 4);
    header[6] = size;
    header[7] = size;
    header.writeUInt16LE(1, 10);
    header.writeUInt16LE(32, 12);
    header.writeUInt32LE(png.length, 14);
    header.writeUInt32LE(22, 18);
    await fs.writeFile(new URL('src/app/favicon.ico', root), Buffer.concat([header, png]));
}
