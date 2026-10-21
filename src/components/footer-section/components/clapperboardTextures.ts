import * as THREE from 'three';

/**
 * Generates high-resolution procedural PBR textures for the Anup Rawat (Baaz)
 * 3D Film Director's Clapperboard. Zero external image dependencies.
 */
export function createSlateFaceTextures(
  maxAnisotropy: number,
  sceneStr = '24',
  takeStr = '01'
): {
  colorMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const width = 2048;
  const height = 1536;

  // 1. Albedo / Color Map
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = width;
  colorCanvas.height = height;
  const ctx = colorCanvas.getContext('2d')!;

  drawSlateFaceAlbedo(ctx, width, height, sceneStr, takeStr);

  // 2. Roughness Map (Ink markings are smoother/glossier than matte acrylic)
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = width;
  roughCanvas.height = height;
  const rCtx = roughCanvas.getContext('2d')!;

  const pad = 76;
  const topBayBottom = 430;
  const centerBayBottom = 1120;
  const centerX = width / 2;
  const centerY = (topBayBottom + centerBayBottom) / 2;

  // Base roughness ~ 0.44 (rgb 112)
  rCtx.fillStyle = '#707070';
  rCtx.fillRect(0, 0, width, height);

  // Subtle surface smudge / studio patina variation
  for (let i = 0; i < 18; i++) {
    const rx = ((i * 397) % 1000) / 1000 * width;
    const ry = ((i * 613) % 1000) / 1000 * height;
    const rad = 220 + (i % 5) * 60;
    const g = rCtx.createRadialGradient(rx, ry, 10, rx, ry, rad);
    g.addColorStop(0, 'rgba(135, 135, 135, 0.14)');
    g.addColorStop(1, 'rgba(112, 112, 112, 0)');
    rCtx.fillStyle = g;
    rCtx.fillRect(0, 0, width, height);
  }

  // Engraved text & lines are smoother (darker in roughness map = shinier specular reflection)
  rCtx.fillStyle = '#262626';
  rCtx.font = '700 142px "Plus Jakarta Sans", -apple-system, sans-serif';
  rCtx.letterSpacing = '14px';
  rCtx.textAlign = 'center';
  rCtx.fillText('ANUP RAWAT', centerX, centerY - 22);
  rCtx.font = '600 44px "Plus Jakarta Sans", -apple-system, sans-serif';
  rCtx.letterSpacing = '18px';
  rCtx.fillText('CINEMATOGRAPHER', centerX, centerY + 86);

  // 3. Bump Map (Subtle physical relief on engraved markings)
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bCtx = bumpCanvas.getContext('2d')!;
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, width, height);
  bCtx.strokeStyle = '#606060';
  bCtx.lineWidth = 4;
  bCtx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);
  bCtx.fillStyle = '#a8a8a8';
  bCtx.font = '700 142px "Plus Jakarta Sans", -apple-system, sans-serif';
  bCtx.letterSpacing = '14px';
  bCtx.textAlign = 'center';
  bCtx.fillText('ANUP RAWAT', centerX, centerY - 22);

  const colorMap = new THREE.CanvasTexture(colorCanvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.anisotropy = maxAnisotropy;

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.colorSpace = THREE.NoColorSpace;
  roughnessMap.anisotropy = maxAnisotropy;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.colorSpace = THREE.NoColorSpace;
  bumpMap.anisotropy = maxAnisotropy;

  return { colorMap, roughnessMap, bumpMap };
}

/**
 * Updates an existing slate colorMap CanvasTexture in-place when a new take is marked.
 */
export function updateSlateFaceTake(
  colorMap: THREE.CanvasTexture,
  sceneStr: string,
  takeStr: string
): void {
  const canvas = colorMap.image as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  drawSlateFaceAlbedo(ctx, canvas.width, canvas.height, sceneStr, takeStr);
  colorMap.needsUpdate = true;
}

function drawSlateFaceAlbedo(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  sceneStr: string,
  takeStr: string
) {
  // Base matte-black carbon/acrylic surface
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#111318');
  bgGrad.addColorStop(0.5, '#0b0c10');
  bgGrad.addColorStop(1, '#08090c');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Outer recessed border frame
  const pad = 76;
  ctx.strokeStyle = 'rgba(245, 240, 230, 0.14)';
  ctx.lineWidth = 3;
  ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

  // Electric-blue precision accent line along top of the acrylic slate
  const blueGrad = ctx.createLinearGradient(pad, 0, width - pad, 0);
  blueGrad.addColorStop(0, '#1d4ed8');
  blueGrad.addColorStop(0.5, '#3b82f6');
  blueGrad.addColorStop(1, '#1d4ed8');
  ctx.fillStyle = blueGrad;
  ctx.fillRect(pad, pad, width - pad * 2, 7);

  // Corner precision registration ticks in electric blue
  const tickLen = 28;
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(pad, height - pad - tickLen);
  ctx.lineTo(pad, height - pad);
  ctx.lineTo(pad + tickLen, height - pad);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(width - pad - tickLen, height - pad);
  ctx.lineTo(width - pad, height - pad);
  ctx.lineTo(width - pad, height - pad - tickLen);
  ctx.stroke();

  // Horizontal slate divider lines
  const topBayBottom = 430;
  const centerBayBottom = 1120;

  ctx.strokeStyle = 'rgba(245, 240, 230, 0.16)';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(pad, topBayBottom);
  ctx.lineTo(width - pad, topBayBottom);
  ctx.stroke();

  // Vertical dividers in top bay (ROLL | SCENE | TAKE)
  const col1 = pad + (width - pad * 2) * 0.33;
  const col2 = pad + (width - pad * 2) * 0.67;

  ctx.beginPath();
  ctx.moveTo(col1, pad);
  ctx.lineTo(col1, topBayBottom);
  ctx.moveTo(col2, pad);
  ctx.lineTo(col2, topBayBottom);
  ctx.stroke();

  // Subtle top bay engraved labels
  ctx.fillStyle = 'rgba(245, 240, 230, 0.38)';
  ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '6px';
  ctx.textAlign = 'center';
  ctx.fillText('ROLL', (pad + col1) / 2, pad + 64);
  ctx.fillText('SCENE', (col1 + col2) / 2, pad + 64);
  ctx.fillText('TAKE', (col2 + width - pad) / 2, pad + 64);

  // Restrained slate numerals in warm ivory (with electric-blue highlight on active TAKE)
  ctx.fillStyle = 'rgba(245, 240, 230, 0.82)';
  ctx.font = '500 104px "JetBrains Mono", monospace';
  ctx.letterSpacing = '2px';
  ctx.fillText('A01', (pad + col1) / 2, pad + 245);
  ctx.fillText(sceneStr, (col1 + col2) / 2, pad + 245);

  ctx.fillStyle = '#60a5fa';
  ctx.fillText(takeStr, (col2 + width - pad) / 2, pad + 245);

  // Center Bay: Primary Personalization (ANUP RAWAT / CINEMATOGRAPHER)
  const centerX = width / 2;
  const centerY = (topBayBottom + centerBayBottom) / 2;

  ctx.fillStyle = '#f5f0e6';
  ctx.font = '700 142px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.letterSpacing = '14px';
  ctx.textAlign = 'center';
  ctx.fillText('ANUP RAWAT', centerX, centerY - 22);

  // Subtitle: CINEMATOGRAPHER
  ctx.fillStyle = '#3b82f6';
  ctx.font = '600 44px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.letterSpacing = '18px';
  ctx.fillText('CINEMATOGRAPHER', centerX, centerY + 86);

  // Subtle horizontal electric blue rules beside CINEMATOGRAPHER
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(pad + 140, centerY + 71);
  ctx.lineTo(centerX - 420, centerY + 71);
  ctx.moveTo(centerX + 420, centerY + 71);
  ctx.lineTo(width - pad - 140, centerY + 71);
  ctx.stroke();

  // Bottom bay divider
  ctx.strokeStyle = 'rgba(245, 240, 230, 0.16)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(pad, centerBayBottom);
  ctx.lineTo(width - pad, centerBayBottom);
  ctx.stroke();

  const bottomSplit = pad + (width - pad * 2) * 0.62;
  ctx.beginPath();
  ctx.moveTo(bottomSplit, centerBayBottom);
  ctx.lineTo(bottomSplit, height - pad);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(245, 240, 230, 0.36)';
  ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '5px';
  ctx.fillText('UNIT / VISUAL DIRECTION', pad + 48, centerBayBottom + 64);

  ctx.fillStyle = 'rgba(245, 240, 230, 0.85)';
  ctx.font = '600 54px "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '4px';
  ctx.fillText('BAAZ CINEMA', pad + 48, centerBayBottom + 185);

  ctx.fillStyle = 'rgba(245, 240, 230, 0.36)';
  ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
  ctx.letterSpacing = '5px';
  ctx.fillText('RATE / OPTICS', bottomSplit + 48, centerBayBottom + 64);

  ctx.fillStyle = 'rgba(245, 240, 230, 0.82)';
  ctx.font = '500 52px "JetBrains Mono", monospace';
  ctx.letterSpacing = '2px';
  ctx.fillText('24.00 FPS · S35', bottomSplit + 48, centerBayBottom + 185);
}

/**
 * Generates alternating matte-black and warm ivory diagonal stripes with a
 * subtle electric-blue precision accent stripe for the clapper sticks.
 */
export function createClapperStickTexture(
  isTopStick: boolean,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const width = 2048;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0e1014';
  ctx.fillRect(0, 0, width, height);

  const stripeWidth = 175;
  const slant = isTopStick ? height : -height;

  ctx.save();
  for (let x = -height * 2; x < width + height * 2; x += stripeWidth * 2) {
    ctx.beginPath();
    if (isTopStick) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x + stripeWidth, 0);
      ctx.lineTo(x + stripeWidth - Math.abs(slant), height);
      ctx.lineTo(x - Math.abs(slant), height);
    } else {
      ctx.moveTo(x - Math.abs(slant), 0);
      ctx.lineTo(x + stripeWidth - Math.abs(slant), 0);
      ctx.lineTo(x + stripeWidth, height);
      ctx.lineTo(x, height);
    }
    ctx.closePath();

    const isElectricAccent = Math.abs(x - 1320) < stripeWidth;
    if (isElectricAccent) {
      const blueGrad = ctx.createLinearGradient(x, 0, x + stripeWidth, height);
      blueGrad.addColorStop(0, '#1d4ed8');
      blueGrad.addColorStop(0.5, '#2563eb');
      blueGrad.addColorStop(1, '#3b82f6');
      ctx.fillStyle = blueGrad;
    } else {
      ctx.fillStyle = '#f2ede2';
    }
    ctx.fill();
  }
  ctx.restore();

  const edgeGrad = ctx.createLinearGradient(0, 0, 0, height);
  edgeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
  edgeGrad.addColorStop(0.12, 'rgba(0, 0, 0, 0)');
  edgeGrad.addColorStop(0.88, 'rgba(0, 0, 0, 0)');
  edgeGrad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
  ctx.fillStyle = edgeGrad;
  ctx.fillRect(0, 0, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

/**
 * Generates a soft radial contact shadow texture for grounding the 3D slate
 * onto the dark studio floor.
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.06,
    size / 2,
    size / 2,
    size * 0.48
  );
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.88)');
  grad.addColorStop(0.35, 'rgba(2, 4, 10, 0.55)');
  grad.addColorStop(0.7, 'rgba(5, 8, 18, 0.18)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
