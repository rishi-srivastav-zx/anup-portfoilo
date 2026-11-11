export interface CinematographyTakeStill {
  takeNumber: string;
  sceneCode: string;
  title: string;
  opticsSpec: string;
  dataUrl: string;
}

const TAKE_CONFIGS = [
  {
    takeNumber: '01',
    sceneCode: '24A',
    title: 'Stage A — Dolly & Anamorphic Rig',
    opticsSpec: '35MM ANAMORPHIC · T1.8 · 3200K TUNGSTEN',
    theme: 'soundstage' as const,
  },
  {
    takeNumber: '02',
    sceneCode: '24B',
    title: 'Macro Optics — Master Prime Iris',
    opticsSpec: '50MM MASTER PRIME · T1.4 · DUAL ISO 800',
    theme: 'optics' as const,
  },
  {
    takeNumber: '03',
    sceneCode: '25A',
    title: 'Night Lot — Rain Tower & Fresnel Backlight',
    opticsSpec: '40MM ANAMORPHIC · T2.0 · 5600K HMI / AMBER',
    theme: 'nightlot' as const,
  },
  {
    takeNumber: '04',
    sceneCode: '26C',
    title: 'Backlot Silhouette — Golden Hour Diffusion',
    opticsSpec: '75MM ANAMORPHIC · T2.2 · WARM AMBER RIM',
    theme: 'goldenhour' as const,
  },
];

const cachedStills: Map<number, CinematographyTakeStill> = new Map();

/**
 * Generates a high-resolution (1600x900) atmospheric cinematography photograph-style
 * backdrop image on an offscreen HTML5 Canvas so it never relies on fragile external URLs.
 */
export function getCinematographyTakeStill(
  takeIndex: number
): CinematographyTakeStill {
  const normalizedIdx =
    ((takeIndex % TAKE_CONFIGS.length) + TAKE_CONFIGS.length) %
    TAKE_CONFIGS.length;

  const existing = cachedStills.get(normalizedIdx);
  if (existing) {
    return existing;
  }

  const cfg = TAKE_CONFIGS[normalizedIdx];
  const width = 1600;
  const height = 900;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Deep dark soundstage base canvas
  const baseGrad = ctx.createLinearGradient(0, 0, width, height);
  if (cfg.theme === 'soundstage') {
    baseGrad.addColorStop(0, '#05070d');
    baseGrad.addColorStop(0.45, '#0b1326');
    baseGrad.addColorStop(1, '#120d08');
  } else if (cfg.theme === 'optics') {
    baseGrad.addColorStop(0, '#04060b');
    baseGrad.addColorStop(0.5, '#09152b');
    baseGrad.addColorStop(1, '#181009');
  } else if (cfg.theme === 'nightlot') {
    baseGrad.addColorStop(0, '#040814');
    baseGrad.addColorStop(0.55, '#0a1936');
    baseGrad.addColorStop(1, '#090c14');
  } else {
    baseGrad.addColorStop(0, '#140c06');
    baseGrad.addColorStop(0.5, '#1f1309');
    baseGrad.addColorStop(1, '#070b14');
  }
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Volumetric Studio Spotlight Beams (God rays cutting through cinema haze)
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const drawVolumetricBeam = (
    srcX: number,
    srcY: number,
    endX1: number,
    endX2: number,
    colorStart: string,
    colorMid: string
  ) => {
    const beamGrad = ctx.createLinearGradient(srcX, srcY, (endX1 + endX2) / 2, height);
    beamGrad.addColorStop(0, colorStart);
    beamGrad.addColorStop(0.45, colorMid);
    beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(srcX - 18, srcY);
    ctx.lineTo(srcX + 18, srcY);
    ctx.lineTo(endX2, height);
    ctx.lineTo(endX1, height);
    ctx.closePath();
    ctx.fill();
  };

  if (cfg.theme === 'soundstage') {
    // Warm amber Fresnel key beam from top-left + cool cobalt fill beam from top-right
    drawVolumetricBeam(
      280,
      -40,
      360,
      1180,
      'rgba(255, 168, 68, 0.42)',
      'rgba(245, 158, 11, 0.14)'
    );
    drawVolumetricBeam(
      1320,
      -30,
      520,
      1380,
      'rgba(59, 130, 246, 0.38)',
      'rgba(37, 99, 235, 0.14)'
    );
  } else if (cfg.theme === 'optics') {
    drawVolumetricBeam(
      800,
      -60,
      220,
      1380,
      'rgba(59, 130, 246, 0.34)',
      'rgba(37, 99, 235, 0.11)'
    );
    drawVolumetricBeam(
      420,
      -20,
      580,
      1280,
      'rgba(251, 146, 60, 0.36)',
      'rgba(234, 88, 12, 0.10)'
    );
  } else if (cfg.theme === 'nightlot') {
    drawVolumetricBeam(
      1180,
      -50,
      180,
      1120,
      'rgba(96, 165, 250, 0.44)',
      'rgba(37, 99, 235, 0.16)'
    );
    drawVolumetricBeam(
      460,
      20,
      520,
      1320,
      'rgba(251, 191, 36, 0.32)',
      'rgba(217, 119, 6, 0.10)'
    );
  } else {
    drawVolumetricBeam(
      340,
      -30,
      240,
      1420,
      'rgba(251, 146, 60, 0.50)',
      'rgba(245, 158, 11, 0.18)'
    );
    drawVolumetricBeam(
      1240,
      -20,
      620,
      1460,
      'rgba(59, 130, 246, 0.28)',
      'rgba(29, 78, 216, 0.09)'
    );
  }

  // 3. Out-of-Focus Cinema Bokeh Orbs (Shallow Depth of Field Anamorphic Oval Bokeh)
  const bokehPalette = [
    'rgba(255, 175, 75, 0.18)',
    'rgba(59, 130, 246, 0.20)',
    'rgba(245, 240, 230, 0.12)',
    'rgba(245, 158, 11, 0.15)',
    'rgba(37, 99, 235, 0.16)',
  ];

  for (let i = 0; i < 28; i++) {
    // Deterministic pseudo-random layout per take
    const seed = (normalizedIdx + 1) * 137 + i * 73;
    const bx = ((seed * 9301 + 49297) % 233280) / 233280 * width;
    const by = ((seed * 49297 + 9301) % 233280) / 233280 * height;
    const radiusY = 26 + (i % 7) * 18;
    const radiusX = radiusY * 0.68; // Classic 2x anamorphic vertical squeeze bokeh!

    const orbGrad = ctx.createRadialGradient(bx, by, radiusY * 0.1, bx, by, radiusY);
    const col = bokehPalette[i % bokehPalette.length];
    orbGrad.addColorStop(0, col);
    orbGrad.addColorStop(0.78, col);
    orbGrad.addColorStop(0.92, 'rgba(255, 255, 255, 0.08)');
    orbGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(radiusX / radiusY, 1);
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(0, 0, radiusY, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // 4. Scene-Specific Foreground / Midground Cinema Equipment Silhouettes & Optics
  if (cfg.theme === 'optics') {
    // Giant Cinema Prime Lens Barrel & Multi-Coated Glass Elements in Center-Left/Right
    const cx = width * 0.5;
    const cy = height * 0.5;
    const rings = [380, 320, 265, 210, 155, 95];
    rings.forEach((r, idx) => {
      ctx.strokeStyle =
        idx % 2 === 0
          ? 'rgba(59, 130, 246, 0.26)'
          : 'rgba(245, 158, 11, 0.22)';
      ctx.lineWidth = idx === 0 ? 4 : 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Multi-coating magenta/cobalt/amber lens reflection
    const coatingGrad = ctx.createRadialGradient(
      cx - 60,
      cy - 50,
      20,
      cx,
      cy,
      340
    );
    coatingGrad.addColorStop(0, 'rgba(59, 130, 246, 0.28)');
    coatingGrad.addColorStop(0.45, 'rgba(16, 185, 129, 0.08)');
    coatingGrad.addColorStop(0.75, 'rgba(245, 158, 11, 0.16)');
    coatingGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = coatingGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 340, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Detailed Silhouette of Professional Cinema Camera Rig (ARRI-style Body, Matte Box, Top Handle, Fluid Head Tripod, & Cinematographer Silhouette)
    const camX = cfg.theme === 'soundstage' ? width * 0.27 : width * 0.73;
    const camY = height * 0.62;
    const dir = cfg.theme === 'soundstage' ? 1 : -1;

    ctx.save();
    ctx.translate(camX, camY);
    ctx.scale(dir, 1);

    // Studio Fresnel Light Stand Silhouette in background
    ctx.strokeStyle = 'rgba(245, 240, 230, 0.14)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(460, -280);
    ctx.lineTo(460, 280);
    ctx.moveTo(390, 280);
    ctx.lineTo(530, 280);
    ctx.stroke();

    // Glowing Fresnel Lamp Head
    const lampGlow = ctx.createRadialGradient(460, -290, 6, 460, -290, 130);
    lampGlow.addColorStop(0, 'rgba(255, 235, 200, 0.95)');
    lampGlow.addColorStop(0.25, 'rgba(245, 158, 11, 0.55)');
    lampGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = lampGlow;
    ctx.beginPath();
    ctx.arc(460, -290, 130, 0, Math.PI * 2);
    ctx.fill();

    // Tripod legs
    ctx.strokeStyle = '#050608';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(0, 45);
    ctx.lineTo(-95, 290);
    ctx.moveTo(0, 45);
    ctx.lineTo(15, 290);
    ctx.moveTo(0, 45);
    ctx.lineTo(110, 290);
    ctx.stroke();

    // Rim highlight on tripod legs
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(6, 45);
    ctx.lineTo(114, 290);
    ctx.stroke();

    // Fluid Head & Baseplate
    ctx.fillStyle = '#07090d';
    ctx.fillRect(-55, -5, 110, 52);

    // Cinema Camera Body (ARRI Alexa / RED style modular body)
    ctx.fillStyle = '#080a0f';
    ctx.beginPath();
    ctx.roundRect(-85, -95, 165, 92, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Top Carry Handle & Cheeseplate
    ctx.fillStyle = '#080a0f';
    ctx.fillRect(-65, -125, 120, 14);
    ctx.fillRect(-50, -112, 16, 18);
    ctx.fillRect(25, -112, 16, 18);

    // V-Mount Battery on back of camera
    ctx.fillStyle = '#0b0e16';
    ctx.fillRect(-122, -84, 36, 72);

    // Prime Lens Barrel + Follow Focus Gear Rings
    ctx.fillStyle = '#090b10';
    ctx.fillRect(80, -76, 72, 56);

    // Swing-Away Matte Box & Carbon French Flag Brow
    ctx.beginPath();
    ctx.moveTo(152, -82);
    ctx.lineTo(205, -106);
    ctx.lineTo(205, 6);
    ctx.lineTo(152, -18);
    ctx.closePath();
    ctx.fillStyle = '#06080c';
    ctx.fill();
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Top French Flag Visor on Matte Box
    ctx.beginPath();
    ctx.moveTo(155, -84);
    ctx.lineTo(245, -128);
    ctx.lineTo(235, -104);
    ctx.lineTo(152, -78);
    ctx.closePath();
    ctx.fillStyle = '#0c0f17';
    ctx.fill();

    // Optical Lens Flare Point right at the Matte Box Front Element
    const lensGlow = ctx.createRadialGradient(202, -48, 4, 202, -48, 140);
    lensGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    lensGlow.addColorStop(0.2, 'rgba(96, 165, 250, 0.65)');
    lensGlow.addColorStop(0.55, 'rgba(37, 99, 235, 0.22)');
    lensGlow.addColorStop(1, 'rgba(37, 99, 235, 0)');
    ctx.fillStyle = lensGlow;
    ctx.beginPath();
    ctx.arc(202, -48, 140, 0, Math.PI * 2);
    ctx.fill();

    // Cinematographer (DP) Silhouette operating the camera (Head, Shoulders, Eye at EVF)
    ctx.fillStyle = '#05070b';
    // Head & Cap silhouette
    ctx.beginPath();
    ctx.arc(-155, -135, 42, 0, Math.PI * 2);
    ctx.fill();
    // Shoulders & Torso leaning into the viewfinder
    ctx.beginPath();
    ctx.moveTo(-240, 290);
    ctx.quadraticCurveTo(-235, -65, -155, -90);
    ctx.quadraticCurveTo(-90, -85, -65, 35);
    ctx.lineTo(-95, 290);
    ctx.closePath();
    ctx.fill();

    // Warm Amber Rim Highlight tracing the DP's silhouette & camera top
    ctx.strokeStyle = 'rgba(251, 146, 60, 0.55)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-155, -135, 42, -Math.PI * 0.65, Math.PI * 0.15);
    ctx.stroke();

    ctx.restore();
  }

  // 5. Signature Horizontal Anamorphic Blue Streak Flare across the frame
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const streakY = cfg.theme === 'optics' ? height * 0.5 : height * 0.54;
  const streakGrad = ctx.createLinearGradient(0, streakY, width, streakY);
  streakGrad.addColorStop(0, 'rgba(37, 99, 235, 0)');
  streakGrad.addColorStop(0.2, 'rgba(59, 130, 246, 0.25)');
  streakGrad.addColorStop(0.5, 'rgba(147, 197, 253, 0.55)');
  streakGrad.addColorStop(0.8, 'rgba(59, 130, 246, 0.25)');
  streakGrad.addColorStop(1, 'rgba(37, 99, 235, 0)');
  ctx.fillStyle = streakGrad;
  ctx.fillRect(0, streakY - 2.5, width, 5);

  const softStreakGrad = ctx.createLinearGradient(0, streakY - 28, 0, streakY + 28);
  softStreakGrad.addColorStop(0, 'rgba(37, 99, 235, 0)');
  softStreakGrad.addColorStop(0.5, 'rgba(37, 99, 235, 0.14)');
  softStreakGrad.addColorStop(1, 'rgba(37, 99, 235, 0)');
  ctx.fillStyle = softStreakGrad;
  ctx.fillRect(width * 0.08, streakY - 28, width * 0.84, 56);
  ctx.restore();

  // 6. Subtle Cinema Viewfinder Frame Marks & 2.39:1 Guides baked into the still
  ctx.strokeStyle = 'rgba(245, 240, 230, 0.12)';
  ctx.lineWidth = 1.5;
  const guideMarginX = 90;
  const guideMarginY = 70;
  const cornerLen = 32;

  // Top-left guide
  ctx.beginPath();
  ctx.moveTo(guideMarginX, guideMarginY + cornerLen);
  ctx.lineTo(guideMarginX, guideMarginY);
  ctx.lineTo(guideMarginX + cornerLen, guideMarginY);
  // Top-right guide
  ctx.moveTo(width - guideMarginX - cornerLen, guideMarginY);
  ctx.lineTo(width - guideMarginX, guideMarginY);
  ctx.lineTo(width - guideMarginX, guideMarginY + cornerLen);
  // Bottom-left guide
  ctx.moveTo(guideMarginX, height - guideMarginY - cornerLen);
  ctx.lineTo(guideMarginX, height - guideMarginY);
  ctx.lineTo(guideMarginX + cornerLen, height - guideMarginY);
  // Bottom-right guide
  ctx.moveTo(width - guideMarginX - cornerLen, height - guideMarginY);
  ctx.lineTo(width - guideMarginX, height - guideMarginY);
  ctx.lineTo(width - guideMarginX, height - guideMarginY - cornerLen);
  ctx.stroke();

  // Center crosshair
  const chX = width / 2;
  const chY = height / 2;
  ctx.beginPath();
  ctx.moveTo(chX - 14, chY);
  ctx.lineTo(chX + 14, chY);
  ctx.moveTo(chX, chY - 14);
  ctx.lineTo(chX, chY + 14);
  ctx.stroke();

  const still: CinematographyTakeStill = {
    takeNumber: cfg.takeNumber,
    sceneCode: cfg.sceneCode,
    title: cfg.title,
    opticsSpec: cfg.opticsSpec,
    dataUrl: canvas.toDataURL('image/jpeg', 0.9),
  };

  cachedStills.set(normalizedIdx, still);
  return still;
}
