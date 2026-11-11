const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SPREAD_WIDTH = 1760;
const SPREAD_HEIGHT = 1240;

const sourceDir = path.resolve('public/landing-pages/meng-to-sketchbook');

const PLATES_FILES = [
    { file: "1956C3DE-266A-4B87-95D6-B5705F71403D_1_201_a.webp", num: "01" },
    { file: "32E40AED-445C-4C30-BE11-CF56C53DB3B3.webp", num: "02" },
    { file: "90FAD19F-0B33-4498-9988-80A4EC7F916E.webp", num: "03" },
    { file: "929C8E5F-4089-4A7E-8A55-B4DD4BF9E3CE_1_201_a.webp", num: "04" },
    { file: "BC6B84CC-A454-4FFD-BED9-50603DC17A27.webp", num: "05" },
    { file: "BF6EEE2F-E74B-4CCA-8066-59CB3E28EA00.webp", num: "06" },
    { file: "C4299386-1599-4DD7-B54C-787F7F4C05EE.webp", num: "07" },
    { file: "DSC06133.webp", num: "08" },
    { file: "DSC06149.webp", num: "09" },
    { file: "F60F25E7-9F10-4D0A-9C18-9B8D9582ECFA.webp", num: "10" },
    { file: "P1000926.webp", num: "11" },
    { file: "P1000931.webp", num: "12" },
    { file: "P1000941.webp", num: "13" },
    { file: "P1001077.webp", num: "14" },
    { file: "P1001082.webp", num: "15" }
];

async function createSpread(plate) {
    const rawPhotoPath = path.join(sourceDir, plate.file);
    if (!fs.existsSync(rawPhotoPath)) {
        console.error('Missing source file:', rawPhotoPath);
        return;
    }

    // Leave a small space/margin around the book ("just have little space not to full cover that book")
    // Book is 1760 x 1240. Available area: 1620 x 1120 (leaving ~70px on left/right, ~60px on top/bottom)
    const MAX_PHOTO_W = 1600;
    const MAX_PHOTO_H = 1100;

    const photoMeta = await sharp(rawPhotoPath).metadata();
    const photoAspect = photoMeta.width / photoMeta.height;
    
    let targetW, targetH;
    if (photoAspect >= (MAX_PHOTO_W / MAX_PHOTO_H)) {
        // Wider: constrain by width
        targetW = MAX_PHOTO_W;
        targetH = Math.round(MAX_PHOTO_W / photoAspect);
    } else {
        // Taller: constrain by height
        targetH = MAX_PHOTO_H;
        targetW = Math.round(MAX_PHOTO_H * photoAspect);
    }

    // Center photo across the open sketchbook spread
    const centerX = SPREAD_WIDTH / 2; // 880
    const centerY = SPREAD_HEIGHT / 2; // 620
    const photoX = Math.round(centerX - targetW / 2);
    const photoY = Math.round(centerY - targetH / 2);

    // Clean white photo border ("have border things")
    const mattePad = 14;
    const frameX = photoX - mattePad;
    const frameY = photoY - mattePad;
    const frameW = targetW + mattePad * 2;
    const frameH = targetH + mattePad * 2;

    const resizedPhotoBuffer = await sharp(rawPhotoPath)
        .resize(targetW, targetH, { fit: 'inside' })
        .webp({ quality: 90 })
        .toBuffer();

    // Pure book paper spread with spine and crease, ZERO text
    const svgOverlay = `
    <svg width="${SPREAD_WIDTH}" height="${SPREAD_HEIGHT}" viewBox="0 0 ${SPREAD_WIDTH} ${SPREAD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="paperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#F5F0E6" />
          <stop offset="48%" stop-color="#EEE6D8" />
          <stop offset="52%" stop-color="#EBE3D4" />
          <stop offset="100%" stop-color="#E5DCCF" />
        </linearGradient>

        <!-- Spine Shadow down the center at x=880 -->
        <linearGradient id="spineShadow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0" />
          <stop offset="44%" stop-color="#2B2721" stop-opacity="0.04" />
          <stop offset="48%" stop-color="#18130E" stop-opacity="0.18" />
          <stop offset="49.7%" stop-color="#0F0C09" stop-opacity="0.45" />
          <stop offset="50.3%" stop-color="#0F0C09" stop-opacity="0.45" />
          <stop offset="52%" stop-color="#18130E" stop-opacity="0.18" />
          <stop offset="56%" stop-color="#2B2721" stop-opacity="0.04" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </linearGradient>

        <linearGradient id="leftCrease" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#1E1914" stop-opacity="0.22" />
          <stop offset="2.5%" stop-color="#1E1914" stop-opacity="0.05" />
          <stop offset="6%" stop-color="#1E1914" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="rightCrease" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#1E1914" stop-opacity="0.22" />
          <stop offset="2.5%" stop-color="#1E1914" stop-opacity="0.05" />
          <stop offset="6%" stop-color="#1E1914" stop-opacity="0" />
        </linearGradient>

        <!-- Soft realistic photo drop shadow -->
        <filter id="photoShadow" x="-10%" y="-10%" width="125%" height="125%">
          <feDropShadow dx="0" dy="6" stdDeviation="14" flood-color="#221A12" flood-opacity="0.32" />
        </filter>
      </defs>

      <!-- 1. Open Book Paper Base -->
      <rect x="24" y="24" width="${SPREAD_WIDTH - 48}" height="${SPREAD_HEIGHT - 48}" rx="18" fill="url(#paperGrad)" stroke="#2B2721" stroke-opacity="0.28" stroke-width="2" />

      <!-- Left and right page inner borders -->
      <rect x="44" y="44" width="812" height="${SPREAD_HEIGHT - 88}" rx="8" fill="none" stroke="#2B2721" stroke-opacity="0.06" stroke-width="1" />
      <rect x="904" y="44" width="812" height="${SPREAD_HEIGHT - 88}" rx="8" fill="none" stroke="#2B2721" stroke-opacity="0.06" stroke-width="1" />

      <!-- 2. Spine & Edge Shadows on the paper -->
      <rect x="24" y="24" width="${SPREAD_WIDTH - 48}" height="${SPREAD_HEIGHT - 48}" rx="18" fill="url(#spineShadow)" />
      <rect x="24" y="24" width="${SPREAD_WIDTH - 48}" height="${SPREAD_HEIGHT - 48}" rx="18" fill="url(#leftCrease)" />
      <rect x="24" y="24" width="${SPREAD_WIDTH - 48}" height="${SPREAD_HEIGHT - 48}" rx="18" fill="url(#rightCrease)" />

      <!-- 3. Crisp White Matte Frame behind photo ("border things") -->
      <rect x="${frameX}" y="${frameY}" width="${frameW}" height="${frameH}" rx="5" fill="#FFFFFF" filter="url(#photoShadow)" stroke="#2B2721" stroke-opacity="0.18" stroke-width="1.2" />

      <!-- 4. Center Spine Thread Stitches (subtle) -->
      <g stroke="#1A1510" stroke-opacity="0.35" stroke-width="1.6" stroke-linecap="round">
        <line x1="877" y1="80" x2="883" y2="80" />
        <line x1="877" y1="180" x2="883" y2="180" />
        <line x1="877" y1="1060" x2="883" y2="1060" />
        <line x1="877" y1="1160" x2="883" y2="1160" />
      </g>
    </svg>
    `;

    // Render Base SVG
    const baseBuffer = await sharp(Buffer.from(svgOverlay))
        .png()
        .toBuffer();

    const outputSpreadFilename = `spread-${plate.num}.webp`;
    const outputSpreadPath = path.join(sourceDir, outputSpreadFilename);

    // Overlay photo inside white frame
    await sharp(baseBuffer)
        .composite([
            {
                input: resizedPhotoBuffer,
                top: photoY,
                left: photoX,
            }
        ])
        .webp({ quality: 90, effort: 4 })
        .toFile(outputSpreadPath);

    console.log(`Generated text-free full spread: ${outputSpreadFilename} (${targetW}x${targetH} at [${photoX}, ${photoY}])`);
}

async function run() {
    console.log(`Building 15 clean, text-free full-view spreads (${SPREAD_WIDTH}x${SPREAD_HEIGHT})...`);
    for (let i = 0; i < PLATES_FILES.length; i++) {
        await createSpread(PLATES_FILES[i]);
    }
    console.log('All 15 clean spreads successfully generated!');
}

run().catch(console.error);
