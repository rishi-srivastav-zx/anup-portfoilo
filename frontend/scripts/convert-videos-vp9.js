const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const videosDir = path.join(__dirname, '..', 'public', 'videos');

console.log('Using ffmpeg at:', ffmpegPath);
console.log('Scanning directory:', videosDir);

const files = fs.readdirSync(videosDir).filter(f => f.toLowerCase().endsWith('.mov'));

console.log(`Found ${files.length} .mov file(s) to convert to WebM (VP9):\n`);

for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const baseName = path.parse(filename).name;
    const inputPath = path.join(videosDir, filename);
    const outputPath = path.join(videosDir, `${baseName}.webm`);

    const inputStats = fs.statSync(inputPath);
    const inputMB = (inputStats.size / (1024 * 1024)).toFixed(2);

    console.log(`[${i + 1}/${files.length}] Converting: "${filename}" (${inputMB} MB) -> "${baseName}.webm"...`);
    const startTime = Date.now();

    const args = [
        '-y',
        '-i', inputPath,
        '-c:v', 'libvpx-vp9',
        '-crf', '32',
        '-b:v', '0',
        '-speed', '2',
        '-quality', 'good',
        '-row-mt', '1',
        '-threads', '0',
        '-c:a', 'libopus',
        '-b:a', '128k',
        outputPath
    ];

    const proc = cp.spawnSync(ffmpegPath, args, { stdio: 'inherit' });

    if (proc.status === 0 && fs.existsSync(outputPath)) {
        const outStats = fs.statSync(outputPath);
        const outMB = (outStats.size / (1024 * 1024)).toFixed(2);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✓ Completed in ${elapsed}s: "${baseName}.webm" (${outMB} MB)\n`);
    } else {
        console.error(`✗ Error converting "${filename}": status code ${proc.status}\n`);
    }
}

console.log('All video conversions completed!');
