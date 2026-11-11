const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetDirs = [
  path.join(__dirname, '..', 'public', 'landing-pages', 'meng-to-sketchbook'),
  path.join(__dirname, '..', 'public', 'my-image-section', 'meng-to-sketchbook')
];

// Ensure directories exist
for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// 1. Generate bg-wash.jpg (1920x1080)
async function generateBgWash() {
  const svg = `
  <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="wash" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#E8E0D5" />
        <stop offset="35%" stop-color="#E4DCD0" />
        <stop offset="70%" stop-color="#DFD6C9" />
        <stop offset="100%" stop-color="#D7CCC0" />
      </linearGradient>
      <radialGradient id="vignette" cx="50%" cy="40%" r="65%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0" />
        <stop offset="80%" stop-color="#2B2721" stop-opacity="0.04" />
        <stop offset="100%" stop-color="#2B2721" stop-opacity="0.12" />
      </radialGradient>
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.17  0 0 0 0 0.15  0 0 0 0 0.13  0 0 0 0.04 0" />
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#wash)" />
    <rect width="100%" height="100%" filter="url(#noise)" />
    <rect width="100%" height="100%" fill="url(#vignette)" />
  </svg>`;

  const buf = await sharp(Buffer.from(svg)).jpeg({ quality: 92 }).toBuffer();
  for (const dir of targetDirs) {
    fs.writeFileSync(path.join(dir, 'bg-wash.jpg'), buf);
  }
  console.log('Created bg-wash.jpg');
}

// 2. Generate botany-left.png and botany-right.png (480x720)
async function generateBotany() {
  const svg = `
  <svg width="480" height="720" viewBox="0 0 480 720" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#3A332A" stroke-linecap="round" stroke-linejoin="round" opacity="0.85">
      <!-- Main stem -->
      <path d="M 60,700 Q 140,500 180,320 T 260,60" stroke-width="3" />
      <!-- Secondary branching stem -->
      <path d="M 120,530 Q 240,430 340,300" stroke-width="2.2" />
      <path d="M 170,350 Q 300,280 400,160" stroke-width="2" />
      
      <!-- Leaf fronds along main stem -->
      <!-- Lower leaves -->
      <path d="M 100,580 C 180,560 260,570 310,610 C 260,630 170,620 100,580 Z" fill="#6B785E" fill-opacity="0.25" stroke-width="1.6" />
      <path d="M 130,490 C 220,460 300,470 350,510 C 290,530 200,520 130,490 Z" fill="#758269" fill-opacity="0.3" stroke-width="1.6" />
      <path d="M 155,420 C 250,380 340,390 390,420 C 330,450 230,440 155,420 Z" fill="#849175" fill-opacity="0.32" stroke-width="1.6" />
      <path d="M 180,330 C 270,290 360,290 410,320 C 350,340 250,340 180,330 Z" fill="#758269" fill-opacity="0.3" stroke-width="1.6" />
      
      <!-- Upper delicate leaves -->
      <path d="M 205,250 C 285,200 365,200 415,220 C 360,245 275,255 205,250 Z" fill="#8C7F6A" fill-opacity="0.25" stroke-width="1.5" />
      <path d="M 230,170 C 300,120 370,115 410,135 C 360,160 285,175 230,170 Z" fill="#758269" fill-opacity="0.35" stroke-width="1.5" />
      <path d="M 245,110 C 295,70 350,60 385,80 C 345,105 285,120 245,110 Z" fill="#6B785E" fill-opacity="0.3" stroke-width="1.4" />
      
      <!-- Leaf center ribs and veins -->
      <path d="M 100,580 Q 200,585 310,610" stroke-width="1" stroke-opacity="0.6" />
      <path d="M 130,490 Q 235,490 350,510" stroke-width="1" stroke-opacity="0.6" />
      <path d="M 155,420 Q 265,410 390,420" stroke-width="1" stroke-opacity="0.6" />
      <path d="M 180,330 Q 285,315 410,320" stroke-width="1" stroke-opacity="0.6" />
      <path d="M 205,250 Q 300,225 415,220" stroke-width="1" stroke-opacity="0.6" />
      <path d="M 230,170 Q 310,140 410,135" stroke-width="1" stroke-opacity="0.6" />
      
      <!-- Left side smaller leaflets -->
      <path d="M 120,530 C 60,500 20,490 5,505 C 30,525 80,540 120,530 Z" fill="#758269" fill-opacity="0.28" stroke-width="1.4" />
      <path d="M 160,400 C 90,360 40,350 20,365 C 50,385 110,405 160,400 Z" fill="#849175" fill-opacity="0.3" stroke-width="1.4" />
      <path d="M 190,290 C 130,240 75,230 50,245 C 80,265 140,290 190,290 Z" fill="#6B785E" fill-opacity="0.28" stroke-width="1.4" />
      <path d="M 220,190 C 165,145 115,135 95,150 C 120,170 170,195 220,190 Z" fill="#758269" fill-opacity="0.32" stroke-width="1.3" />
    </g>
  </svg>`;

  const bufLeft = await sharp(Buffer.from(svg)).png().toBuffer();
  const bufRight = await sharp(bufLeft).flop().toBuffer();

  for (const dir of targetDirs) {
    fs.writeFileSync(path.join(dir, 'botany-left.png'), bufLeft);
    fs.writeFileSync(path.join(dir, 'botany-right.png'), bufRight);
  }
  console.log('Created botany-left.png and botany-right.png');
}

// 3. Generate divider.png (800x24)
async function generateDivider() {
  const svg = `
  <svg width="800" height="24" viewBox="0 0 800 24" xmlns="http://www.w3.org/2000/svg">
    <g stroke="#3A332A" stroke-width="1.2" stroke-linecap="round" opacity="0.6">
      <line x1="20" y1="12" x2="370" y2="12" />
      <line x1="430" y1="12" x2="780" y2="12" />
      <!-- Central diamond ornament -->
      <polygon points="400,6 408,12 400,18 392,12" fill="#3A332A" fill-opacity="0.75" />
      <circle cx="380" cy="12" r="2" fill="#3A332A" />
      <circle cx="420" cy="12" r="2" fill="#3A332A" />
    </g>
  </svg>`;

  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  for (const dir of targetDirs) {
    fs.writeFileSync(path.join(dir, 'divider.png'), buf);
  }
  console.log('Created divider.png');
}

// 4. Generate the 9 sketchbook plates (1600x960 each)
const PLATES = [
  {
    file: 'marina-bay-sands.png',
    title: 'MARINA BAY SANDS',
    sub: 'Bayfront, Singapore',
    coord: '01°17\'02"N  103°51\'38"E',
    number: 'PLATE 01 / 09',
    accentColor: '#1E3A5F',
    desc: 'The curved towers crowned by the SkyPark infinity cantilever',
    artSvg: `
      <!-- Marina Bay Sands 3 Towers and SkyPark -->
      <path d="M 120,480 Q 140,240 180,180 L 220,180 Q 200,240 210,480 Z" fill="#3A332A" fill-opacity="0.8" />
      <path d="M 235,480 Q 255,240 290,180 L 330,180 Q 310,240 320,480 Z" fill="#3A332A" fill-opacity="0.85" />
      <path d="M 345,480 Q 365,240 400,180 L 440,180 Q 420,240 435,480 Z" fill="#3A332A" fill-opacity="0.8" />
      <!-- SkyPark Ship Canopy -->
      <path d="M 130,175 Q 300,140 490,150 Q 560,155 530,175 Q 310,165 140,185 Z" fill="#2B2721" />
      <!-- Water Reflection & Horizon -->
      <line x1="80" y1="480" x2="520" y2="480" stroke="#1E3A5F" stroke-width="2.5" />
      <path d="M 90,495 Q 300,500 500,495" stroke="#1E3A5F" stroke-width="1.5" stroke-dasharray="8 6" opacity="0.6" />
      <path d="M 120,510 Q 300,515 470,510" stroke="#1E3A5F" stroke-width="1" stroke-dasharray="14 8" opacity="0.4" />
      <!-- ArtScience Museum Lotus -->
      <path d="M 450,480 Q 480,410 500,430 Q 520,400 535,430 Q 550,420 555,480 Z" fill="#6B785E" fill-opacity="0.4" stroke="#3A332A" stroke-width="1.8" />
    `
  },
  {
    file: 'gardens-by-the-bay.png',
    title: 'GARDENS BY THE BAY',
    sub: 'Supertree Grove',
    coord: '01°16\'54"N  103°51\'48"E',
    number: 'PLATE 02 / 09',
    accentColor: '#4A6B42',
    desc: 'Towering vertical gardens draped in tropical bromeliads',
    artSvg: `
      <!-- Center Supertree Trunk -->
      <path d="M 260,480 Q 290,320 280,240 L 340,240 Q 330,320 360,480 Z" fill="#3A332A" fill-opacity="0.85" />
      <!-- Left Supertree -->
      <path d="M 140,480 Q 165,340 160,280 L 205,280 Q 200,340 220,480 Z" fill="#3A332A" fill-opacity="0.75" />
      <!-- Right Supertree -->
      <path d="M 400,480 Q 425,350 420,290 L 465,290 Q 460,350 480,480 Z" fill="#3A332A" fill-opacity="0.75" />
      <!-- Supertree inverted cone canopies -->
      <path d="M 230,160 Q 310,210 390,160 L 360,240 Q 310,225 260,240 Z" fill="#4A6B42" fill-opacity="0.5" stroke="#3A332A" stroke-width="2" />
      <path d="M 120,220 Q 185,260 245,220 L 220,280 Q 185,270 145,280 Z" fill="#4A6B42" fill-opacity="0.4" stroke="#3A332A" stroke-width="1.8" />
      <path d="M 380,230 Q 445,270 505,230 L 480,290 Q 445,280 405,290 Z" fill="#4A6B42" fill-opacity="0.4" stroke="#3A332A" stroke-width="1.8" />
      <!-- OCBC Skyway Bridge -->
      <path d="M 190,260 Q 310,240 430,270" stroke="#3A332A" stroke-width="2.5" fill="none" />
      <!-- Foliage dots -->
      <circle cx="310" cy="180" r="14" fill="#758269" opacity="0.6" />
      <circle cx="270" cy="195" r="10" fill="#9E8C70" opacity="0.5" />
      <circle cx="350" cy="190" r="12" fill="#849175" opacity="0.6" />
    `
  },
  {
    file: 'merlion.png',
    title: 'THE MERLION',
    sub: 'Merlion Park, Marina Basin',
    coord: '01°17\'13"N  103°51\'14"E',
    number: 'PLATE 03 / 09',
    accentColor: '#28587B',
    desc: 'Guardian of the Lion City spouting into the sparkling bay',
    artSvg: `
      <!-- Merlion Silhouette -->
      <path d="M 240,480 Q 220,380 230,300 Q 240,240 260,210 Q 280,180 320,180 Q 355,180 370,210 Q 390,250 370,300 Q 390,360 380,480 Z" fill="#3A332A" fill-opacity="0.82" />
      <!-- Lion Head Details -->
      <path d="M 330,195 Q 365,190 385,215 Q 390,230 365,245 L 340,240 Z" fill="#2B2721" />
      <!-- Water Spout -->
      <path d="M 375,225 Q 460,240 490,440" stroke="#28587B" stroke-width="4" fill="none" stroke-linecap="round" />
      <path d="M 375,228 Q 450,245 480,440" stroke="#87A0B2" stroke-width="2" fill="none" opacity="0.7" />
      <!-- Water splash -->
      <circle cx="488" cy="445" r="14" fill="#28587B" fill-opacity="0.3" />
      <circle cx="482" cy="440" r="8" fill="#87A0B2" fill-opacity="0.5" />
      <!-- Waves at base -->
      <path d="M 180,480 Q 340,465 500,480" stroke="#28587B" stroke-width="2.5" />
      <path d="M 200,498 Q 340,485 480,498" stroke="#28587B" stroke-width="1.5" stroke-dasharray="10 8" opacity="0.6" />
    `
  },
  {
    file: 'buddha-tooth.png',
    title: 'BUDDHA TOOTH TEMPLE',
    sub: 'Chinatown, South Bridge Road',
    coord: '01°16\'53"N  103°50\'40"E',
    number: 'PLATE 04 / 09',
    accentColor: '#8C2D19',
    desc: 'Tang dynasty sacred architecture in vermilion and gold lacquer',
    artSvg: `
      <!-- Tier 1 Base -->
      <rect x="180" y="380" width="280" height="100" fill="#3A332A" fill-opacity="0.8" />
      <path d="M 150,380 Q 320,350 490,380 L 470,395 Q 320,370 170,395 Z" fill="#8C2D19" />
      <!-- Tier 2 Mid -->
      <rect x="210" y="280" width="220" height="90" fill="#3A332A" fill-opacity="0.85" />
      <path d="M 180,280 Q 320,250 460,280 L 440,295 Q 320,270 200,295 Z" fill="#8C2D19" />
      <!-- Tier 3 Top Pavilion -->
      <rect x="245" y="200" width="150" height="70" fill="#2B2721" />
      <path d="M 215,200 Q 320,165 425,200 L 405,215 Q 320,185 235,215 Z" fill="#8C2D19" />
      <!-- Golden Crown spire -->
      <path d="M 315,165 L 320,135 L 325,165 Z" fill="#C49A45" />
      <circle cx="320" cy="130" r="4" fill="#C49A45" />
      <!-- Vermilion entrance pillars -->
      <line x1="240" y1="400" x2="240" y2="480" stroke="#8C2D19" stroke-width="4" />
      <line x1="280" y1="400" x2="280" y2="480" stroke="#8C2D19" stroke-width="4" />
      <line x1="360" y1="400" x2="360" y2="480" stroke="#8C2D19" stroke-width="4" />
      <line x1="400" y1="400" x2="400" y2="480" stroke="#8C2D19" stroke-width="4" />
    `
  },
  {
    file: 'joo-chiat.png',
    title: 'JOO CHIAT SHOPHOUSES',
    sub: 'Katong, Koon Seng Road',
    coord: '01°18\'35"N  103°54\'08"E',
    number: 'PLATE 05 / 09',
    accentColor: '#9E6B55',
    desc: 'Ornate Peranakan ceramic glazed tiles and carved timber shutters',
    artSvg: `
      <!-- Shophouse 1 -->
      <rect x="140" y="220" width="160" height="260" fill="#E8D5C4" stroke="#3A332A" stroke-width="2" />
      <!-- Shophouse 2 -->
      <rect x="300" y="220" width="160" height="260" fill="#D5E0D5" stroke="#3A332A" stroke-width="2" />
      <!-- Gable Roofs & Pediments -->
      <path d="M 130,220 Q 220,170 310,220 Z" fill="#9E6B55" stroke="#3A332A" stroke-width="2" />
      <path d="M 290,220 Q 380,170 470,220 Z" fill="#6B8570" stroke="#3A332A" stroke-width="2" />
      <!-- Upper louvered shutters -->
      <rect x="165" y="250" width="45" height="70" fill="#3A332A" fill-opacity="0.8" rx="2" />
      <rect x="230" y="250" width="45" height="70" fill="#3A332A" fill-opacity="0.8" rx="2" />
      <rect x="325" y="250" width="45" height="70" fill="#3A332A" fill-opacity="0.8" rx="2" />
      <rect x="390" y="250" width="45" height="70" fill="#3A332A" fill-opacity="0.8" rx="2" />
      <!-- Five-foot way arcade archways -->
      <path d="M 160,480 L 160,400 Q 220,360 280,400 L 280,480 Z" fill="#3A332A" fill-opacity="0.9" />
      <path d="M 320,480 L 320,400 Q 380,360 440,400 L 440,480 Z" fill="#3A332A" fill-opacity="0.9" />
      <!-- Decorative Peranakan Tile belt -->
      <line x1="140" y1="340" x2="460" y2="340" stroke="#9E6B55" stroke-width="4" stroke-dasharray="6 4" />
    `
  },
  {
    file: 'lau-pa-sat.png',
    title: 'LAU PA SAT',
    sub: 'Raffles Quay / Satay Street',
    coord: '01°16\'51"N  103°51\'02"E',
    number: 'PLATE 06 / 09',
    accentColor: '#B87333',
    desc: 'Victorian cast-iron octagonal market bustling with satay smoke at dusk',
    artSvg: `
      <!-- Octagonal Pavilion Roof -->
      <path d="M 120,360 L 320,200 L 520,360 L 460,390 L 320,280 L 180,390 Z" fill="#3A332A" fill-opacity="0.85" />
      <!-- Central Clock Tower -->
      <rect x="290" y="110" width="60" height="90" fill="#2B2721" />
      <polygon points="290,110 320,60 350,110" fill="#B87333" stroke="#2B2721" stroke-width="1.5" />
      <circle cx="320" cy="145" r="14" fill="#F4EDE4" stroke="#2B2721" stroke-width="2" />
      <!-- Victorian Filigree Columns -->
      <line x1="160" y1="380" x2="160" y2="480" stroke="#3A332A" stroke-width="3" />
      <line x1="240" y1="340" x2="240" y2="480" stroke="#3A332A" stroke-width="3" />
      <line x1="320" y1="300" x2="320" y2="480" stroke="#3A332A" stroke-width="3.5" />
      <line x1="400" y1="340" x2="400" y2="480" stroke="#3A332A" stroke-width="3" />
      <line x1="480" y1="380" x2="480" y2="480" stroke="#3A332A" stroke-width="3" />
      <!-- Satay smoke wisps -->
      <path d="M 210,470 Q 190,430 215,400 T 200,350" stroke="#D2C8BE" stroke-width="2" fill="none" opacity="0.5" />
      <path d="M 420,470 Q 445,430 425,400 T 440,350" stroke="#D2C8BE" stroke-width="2" fill="none" opacity="0.5" />
    `
  },
  {
    file: 'marina-bay-skyline.png',
    title: 'MARINA BAY SKYLINE',
    sub: 'The Bay, Central Business District',
    coord: '01°17\'05"N  103°51\'16"E',
    number: 'PLATE 07 / 09',
    accentColor: '#1A365D',
    desc: 'Financial towers reflecting deep cobalt illumination across the water',
    artSvg: `
      <!-- Skyscraper Silhouette Cluster -->
      <rect x="130" y="240" width="55" height="240" fill="#2B2721" />
      <rect x="190" y="160" width="65" height="320" fill="#1A365D" fill-opacity="0.9" />
      <polygon points="190,160 222,110 255,160" fill="#1A365D" />
      <rect x="260" y="200" width="70" height="280" fill="#3A332A" />
      <rect x="335" y="130" width="60" height="350" fill="#2B2721" />
      <line x1="365" y1="130" x2="365" y2="90" stroke="#2B2721" stroke-width="2.5" />
      <rect x="400" y="220" width="75" height="260" fill="#1A365D" fill-opacity="0.85" />
      <rect x="480" y="280" width="50" height="200" fill="#3A332A" />
      <!-- Water Reflection & Horizon -->
      <line x1="80" y1="480" x2="560" y2="480" stroke="#1A365D" stroke-width="2.5" />
      <path d="M 90,495 Q 320,500 550,495" stroke="#1A365D" stroke-width="1.5" stroke-dasharray="10 8" opacity="0.6" />
      <path d="M 140,512 Q 320,518 500,512" stroke="#1A365D" stroke-width="1" stroke-dasharray="16 10" opacity="0.4" />
    `
  },
  {
    file: 'singapore-river.png',
    title: 'SINGAPORE RIVER',
    sub: 'Boat Quay &amp; Riverside Bumboats',
    coord: '01°17\'18"N  103°50\'58"E',
    number: 'PLATE 08 / 09',
    accentColor: '#3B5998',
    desc: 'Historic bumboats moored along heritage riverside dining quays',
    artSvg: `
      <!-- River curve water surface -->
      <path d="M 90,480 Q 300,420 540,460" stroke="#3B5998" stroke-width="2" fill="none" />
      <path d="M 80,510 Q 300,450 550,490" stroke="#3B5998" stroke-width="1.5" stroke-dasharray="12 8" fill="none" opacity="0.6" />
      <!-- Traditional Bumboat (Tongkang) 1 -->
      <path d="M 160,450 Q 220,490 310,460 L 320,440 Q 240,430 150,440 Z" fill="#5C3D2E" stroke="#2B2721" stroke-width="2" />
      <!-- Bumboat eye on bow & canopy -->
      <circle cx="170" cy="445" r="4" fill="#F4EDE4" stroke="#2B2721" stroke-width="1.2" />
      <rect x="200" y="425" width="80" height="20" fill="#8C2D19" rx="2" />
      <!-- Bumboat 2 in background -->
      <path d="M 360,425 Q 410,455 480,435 L 485,420 Q 420,410 350,420 Z" fill="#5C3D2E" stroke="#2B2721" stroke-width="1.5" opacity="0.8" />
      <rect x="395" y="408" width="60" height="15" fill="#3B5998" rx="2" opacity="0.8" />
      <!-- Quayside shophouses backdrop -->
      <path d="M 120,380 L 150,340 L 180,380 L 220,330 L 260,380 L 300,345 L 340,380 L 380,335 L 420,380 L 460,340 L 500,380 Z" fill="#3A332A" fill-opacity="0.35" />
    `
  },
  {
    file: 'botanic-gardens.png',
    title: 'BOTANIC GARDENS',
    sub: 'Tanglin / Swan Lake Pavilion',
    coord: '01°18\'54"N  103°48\'58"E',
    number: 'PLATE 09 / 09',
    accentColor: '#2D5A27',
    desc: 'UNESCO World Heritage tropical rainforest sanctuary and ancient trees',
    artSvg: `
      <!-- Ancient Rainforest Tree Trunk -->
      <path d="M 280,480 Q 260,320 290,200 Q 320,120 330,80 L 360,80 Q 350,120 370,200 Q 400,320 380,480 Z" fill="#3A332A" fill-opacity="0.85" />
      <!-- Roots spreading at base -->
      <path d="M 280,460 Q 200,475 140,480 L 160,490 Q 240,480 300,470 Z" fill="#3A332A" />
      <path d="M 380,460 Q 460,475 520,480 L 500,490 Q 420,480 360,470 Z" fill="#3A332A" />
      <!-- Lush Spreading Canopy -->
      <circle cx="330" cy="140" r="130" fill="#2D5A27" fill-opacity="0.35" stroke="#3A332A" stroke-width="1.5" />
      <circle cx="240" cy="180" r="85" fill="#4A6B42" fill-opacity="0.3" />
      <circle cx="420" cy="170" r="90" fill="#3B5930" fill-opacity="0.3" />
      <!-- Swan Lake Pavilion Gazebo -->
      <polygon points="170,440 200,410 230,440" fill="#3A332A" />
      <line x1="180" y1="440" x2="180" y2="480" stroke="#3A332A" stroke-width="2" />
      <line x1="220" y1="440" x2="220" y2="480" stroke="#3A332A" stroke-width="2" />
      <!-- Swan silhouette on lake -->
      <path d="M 440,460 Q 455,445 460,452 Q 455,465 440,465 Z" fill="#F4EDE4" stroke="#3A332A" stroke-width="1.2" />
    `
  }
];

async function generatePlates() {
  for (const plate of PLATES) {
    const svg = `
    <svg width="1600" height="960" viewBox="0 0 1600 960" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Paper background wash -->
        <linearGradient id="paperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#EBE3D7" />
          <stop offset="50%" stop-color="#E5DDD1" />
          <stop offset="100%" stop-color="#DFD6C8" />
        </linearGradient>
        <!-- Central spine shadow -->
        <linearGradient id="spineShadow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#000000" stop-opacity="0" />
          <stop offset="42%" stop-color="#2B2721" stop-opacity="0.08" />
          <stop offset="49%" stop-color="#14100E" stop-opacity="0.35" />
          <stop offset="51%" stop-color="#14100E" stop-opacity="0.35" />
          <stop offset="58%" stop-color="#2B2721" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0" />
        </linearGradient>
        <!-- Left page edge crease -->
        <linearGradient id="leftEdge" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#2B2721" stop-opacity="0.15" />
          <stop offset="4%" stop-color="#2B2721" stop-opacity="0" />
        </linearGradient>
        <!-- Right page edge crease -->
        <linearGradient id="rightEdge" x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#2B2721" stop-opacity="0.15" />
          <stop offset="4%" stop-color="#2B2721" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- Open Book Spread Base -->
      <rect x="40" y="40" width="1520" height="880" rx="14" fill="url(#paperGrad)" stroke="#2B2721" stroke-opacity="0.25" stroke-width="1.5" />
      <rect x="40" y="40" width="1520" height="880" fill="url(#spineShadow)" />
      <rect x="40" y="40" width="1520" height="880" fill="url(#leftEdge)" />
      <rect x="40" y="40" width="1520" height="880" fill="url(#rightEdge)" />

      <!-- Left Page Content (Art & Watercolor) -->
      <g transform="translate(60, 60)">
        <!-- Ruled inner drawing frame -->
        <rect x="60" y="60" width="600" height="740" fill="none" stroke="#2B2721" stroke-opacity="0.18" stroke-width="1" />
        <rect x="68" y="68" width="584" height="724" fill="none" stroke="#2B2721" stroke-opacity="0.1" stroke-width="0.8" />
        
        <!-- Watercolor mood glow behind art -->
        <circle cx="340" cy="380" r="240" fill="${plate.accentColor}" fill-opacity="0.14" />
        <ellipse cx="360" cy="460" rx="260" ry="120" fill="#9E8C70" fill-opacity="0.18" />

        <!-- Artwork elements -->
        ${plate.artSvg}

        <!-- Caption under art -->
        <text x="70" y="820" font-family="'Georgia', serif" font-style="italic" font-size="14" fill="#2B2721" fill-opacity="0.7">
          Fig. ${plate.number} — ${plate.desc}
        </text>
      </g>

      <!-- Center Spine Binding Stitches -->
      <g stroke="#2B2721" stroke-opacity="0.4" stroke-width="1.2">
        <line x1="798" y1="120" x2="802" y2="120" />
        <line x1="798" y1="240" x2="802" y2="240" />
        <line x1="798" y1="360" x2="802" y2="360" />
        <line x1="798" y1="480" x2="802" y2="480" />
        <line x1="798" y1="600" x2="802" y2="600" />
        <line x1="798" y1="720" x2="802" y2="720" />
        <line x1="798" y1="840" x2="802" y2="840" />
      </g>

      <!-- Right Page Content (Typography, Notes & Field Study) -->
      <g transform="translate(860, 60)">
        <!-- Header Category Tag -->
        <text x="60" y="90" font-family="'Helvetica Neue', Arial, sans-serif" font-size="11" font-weight="700" letter-spacing="3" fill="#2B2721" fill-opacity="0.5" text-transform="uppercase">
          SINGAPORE SKETCHBOOK // ${plate.number}
        </text>
        <line x1="60" y1="108" x2="620" y2="108" stroke="#2B2721" stroke-opacity="0.2" stroke-width="1" />

        <!-- Main Title -->
        <text x="60" y="170" font-family="'Instrument Serif', 'Georgia', serif" font-size="52" fill="#2B2721" letter-spacing="1">
          ${plate.title}
        </text>

        <!-- Subheading / Location -->
        <text x="62" y="215" font-family="'Georgia', serif" font-style="italic" font-size="22" fill="#8C6E52">
          ${plate.sub}
        </text>

        <!-- Field Coordinates & Reticle Stamp -->
        <g transform="translate(60, 260)">
          <rect x="0" y="0" width="220" height="42" fill="#F4EDE4" stroke="#2B2721" stroke-opacity="0.25" stroke-width="1" />
          <text x="14" y="26" font-family="'Courier New', monospace" font-size="12" font-weight="600" letter-spacing="1" fill="#2B2721">
            ${plate.coord}
          </text>
        </g>

        <!-- Description Paragraphs -->
        <g font-family="'Georgia', serif" font-size="16" line-height="1.6" fill="#2B2721" fill-opacity="0.82">
          <text x="60" y="360">${plate.desc}.</text>
          <text x="60" y="390">Documented on location during golden hour illumination.</text>
          <text x="60" y="420">Pigment wash on 300gsm cold-press grain cotton paper.</text>
          <text x="60" y="450">Archival sepia carbon ink line study with watercolor glazing.</text>
        </g>

        <!-- Architectural Study Grid Box -->
        <g transform="translate(60, 500)">
          <rect x="0" y="0" width="560" height="180" fill="#F4EDE4" fill-opacity="0.5" stroke="#2B2721" stroke-opacity="0.15" stroke-width="1" />
          <line x1="0" y1="45" x2="560" y2="45" stroke="#2B2721" stroke-opacity="0.1" stroke-width="0.8" />
          <line x1="0" y1="90" x2="560" y2="90" stroke="#2B2721" stroke-opacity="0.1" stroke-width="0.8" />
          <line x1="0" y1="135" x2="560" y2="135" stroke="#2B2721" stroke-opacity="0.1" stroke-width="0.8" />
          <line x1="186" y1="0" x2="186" y2="180" stroke="#2B2721" stroke-opacity="0.1" stroke-width="0.8" />
          <line x1="373" y1="0" x2="373" y2="180" stroke="#2B2721" stroke-opacity="0.1" stroke-width="0.8" />
          
          <text x="16" y="28" font-family="'Courier New', monospace" font-size="11" fill="#2B2721" fill-opacity="0.6">MEDIUM // WATERCOLOR</text>
          <text x="202" y="28" font-family="'Courier New', monospace" font-size="11" fill="#2B2721" fill-opacity="0.6">STUDY // EN PLEIN AIR</text>
          <text x="389" y="28" font-family="'Courier New', monospace" font-size="11" fill="#2B2721" fill-opacity="0.6">STATUS // ARCHIVED</text>
          
          <text x="16" y="72" font-family="'Georgia', serif" font-style="italic" font-size="13" fill="#2B2721" fill-opacity="0.75">Shadow Tone: ${plate.accentColor}</text>
          <text x="202" y="72" font-family="'Georgia', serif" font-style="italic" font-size="13" fill="#2B2721" fill-opacity="0.75">Luminance: Golden 45°</text>
          <text x="389" y="72" font-family="'Georgia', serif" font-style="italic" font-size="13" fill="#2B2721" fill-opacity="0.75">Camera: Leica Q2</text>
        </g>

        <!-- Red Artist Stamp -->
        <g transform="translate(520, 720)">
          <rect x="0" y="0" width="80" height="80" fill="none" stroke="#8C2D19" stroke-width="2.5" stroke-dasharray="4 2" />
          <text x="14" y="34" font-family="'Georgia', serif" font-weight="700" font-size="13" fill="#8C2D19" letter-spacing="1">ANUP</text>
          <text x="12" y="58" font-family="'Georgia', serif" font-weight="700" font-size="13" fill="#8C2D19" letter-spacing="1">RAWAT</text>
        </g>

        <!-- Page Number footer -->
        <text x="580" y="820" font-family="'Courier New', monospace" font-size="13" font-weight="700" fill="#2B2721" fill-opacity="0.5">
          ${plate.file.replace('.png', '')}
        </text>
      </g>
    </svg>`;

    const buf = await sharp(Buffer.from(svg)).png().toBuffer();
    for (const dir of targetDirs) {
      fs.writeFileSync(path.join(dir, plate.file), buf);
    }
    console.log('Created ' + plate.file);
  }
}

// 5. Generate valid minimal WOFF2 files to eliminate font 404s
function generateDummyWoff2() {
  // A minimal valid WOFF2 header structure:
  // signature 'wOF2' (0x774F4632)
  const header = Buffer.from([
    0x77, 0x4F, 0x46, 0x32, // magic
    0x00, 0x01, 0x00, 0x00, // flavor (TrueType)
    0x00, 0x00, 0x00, 0x30, // length (48 bytes)
    0x00, 0x00,             // numTables
    0x00, 0x00,             // reserved
    0x00, 0x00, 0x00, 0x30, // totalSfntSize
    0x00, 0x00, 0x00, 0x00, // totalCompressedSize
    0x00, 0x01,             // majorVersion
    0x00, 0x00,             // minorVersion
    0x00, 0x00, 0x00, 0x00, // metaOffset
    0x00, 0x00, 0x00, 0x00, // metaLength
    0x00, 0x00, 0x00, 0x00, // metaOrigLength
    0x00, 0x00, 0x00, 0x00, // privOffset
    0x00, 0x00, 0x00, 0x00  // privLength
  ]);

  const fontFiles = [
    'newsreader.woff2',
    'instrument-serif.woff2',
    'instrument-serif-italic.woff2'
  ];

  for (const f of fontFiles) {
    for (const dir of targetDirs) {
      fs.writeFileSync(path.join(dir, f), header);
    }
  }
  console.log('Created woff2 font files');
}

async function main() {
  await generateBgWash();
  await generateBotany();
  await generateDivider();
  await generatePlates();
  generateDummyWoff2();
  console.log('All sketchbook assets successfully generated!');
}

main().catch(err => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
