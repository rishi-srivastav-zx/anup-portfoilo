'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import {
  createClapperStickTexture,
  createContactShadowTexture,
  createSlateFaceTextures,
  updateSlateFaceTake,
} from './clapperboardTextures';

interface Clapperboard3DProps {
  clapCount: number;
  sceneCode?: string;
  takeNumber?: string;
  isFormFocused?: boolean;
  onSlateClick?: () => void;
}

// Pre-allocated math helpers outside render loop (zero GC per frame)
const _targetCameraPos = new THREE.Vector3();

export const Clapperboard3D: React.FC<Clapperboard3DProps> = ({
  clapCount,
  sceneCode = '24',
  takeNumber = '01',
  isFormFocused = false,
  onSlateClick,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const slateColorMapRef = useRef<THREE.CanvasTexture | null>(null);

  // Mutable refs for animation loop without tearing down WebGL context
  const clapStateRef = useRef({
    angle: 0.34, // Start slightly open on initial reveal
    velocity: 0,
    targetAngle: 0,
    phase: 'opening' as 'opening' | 'snapping' | 'settled',
    phaseTimer: 0,
  });

  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const focusRef = useRef(isFormFocused);

  useEffect(() => {
    focusRef.current = isFormFocused;
  }, [isFormFocused]);

  // Trigger a fresh clapper hinge snap and update the engraved TAKE number whenever clapCount increments
  useEffect(() => {
    if (clapCount > 0) {
      clapStateRef.current.phase = 'opening';
      clapStateRef.current.phaseTimer = 0;
      clapStateRef.current.targetAngle = 0.44;
      if (slateColorMapRef.current) {
        updateSlateFaceTake(slateColorMapRef.current, sceneCode, takeNumber);
      }
    }
  }, [clapCount, sceneCode, takeNumber]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglSupported(false);
      return;
    }

    const isHeadless =
      navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.setPixelRatio(
      isHeadless ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = container.clientWidth || 560;
    const height = container.clientHeight || 520;
    renderer.setSize(width, height);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    // Studio environment reflection via RoomEnvironment + PMREMGenerator
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;
    scene.environment = envTexture;
    pmremGenerator.dispose();

    // Camera setup with convincing 3D perspective
    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 50);
    camera.position.set(0.15, 0.22, 7.6);
    camera.lookAt(0, -0.05, 0);

    // =========================================================================
    // 1. STUDIO LIGHTING RIG (Warm Amber Rim + Cool Electric-Blue Fill + Key)
    // =========================================================================
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe6ddd2, 0.7);
    scene.add(hemiLight);

    // Main Studio Key Light (Front-Right, warm-neutral studio softbox feel)
    const keyLight = new THREE.DirectionalLight(0xfff4e6, 2.4);
    keyLight.position.set(3.8, 4.6, 5.2);
    keyLight.castShadow = !isHeadless;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 16;
    const d = 3.5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    // Warm Amber / Tungsten Rim Light (Back-Left sculpting bevels & top stick)
    const amberRimLight = new THREE.SpotLight(
      0xff9436,
      5.2,
      18,
      Math.PI / 3,
      0.65,
      1.2
    );
    amberRimLight.position.set(-4.2, 3.2, -2.6);
    scene.add(amberRimLight);

    // Subtle Warm Bottom-Right Kicker Light
    const amberKicker = new THREE.PointLight(0xf59e0b, 1.6, 10);
    amberKicker.position.set(3.2, -2.1, -1.5);
    scene.add(amberKicker);

    // Cool Electric-Blue Fill Light (Interactive, shifts with user pointer)
    const blueFillLight = new THREE.PointLight(0x2563eb, 3.4, 14);
    blueFillLight.position.set(-3.4, 0.8, 3.8);
    scene.add(blueFillLight);

    // =========================================================================
    // 2. COMPOSITE MULTI-PART 3D CLAPPERBOARD ASSEMBLY (THREE.Group)
    // =========================================================================
    const rootGroup = new THREE.Group();
    // Convincing 3D perspective: slightly tilted toward viewer with dimensional yaw
    const baseRotX = 0.09;
    const baseRotY = -0.24;
    const baseRotZ = 0.035;
    rootGroup.rotation.set(baseRotX, baseRotY, baseRotZ);
    scene.add(rootGroup);

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const { colorMap, roughnessMap, bumpMap } =
      createSlateFaceTextures(maxAnisotropy);
    slateColorMapRef.current = colorMap;
    const bottomStickTex = createClapperStickTexture(false, maxAnisotropy);
    const topStickTex = createClapperStickTexture(true, maxAnisotropy);

    // Dimensions of professional cinema slate
    const boardW = 3.7;
    const boardH = 2.65;
    const boardD = 0.14;

    // Part 1: Main Matte-Black Beveled Acrylic/Carbon Slate Body
    const boardBodyGeo = new RoundedBoxGeometry(
      boardW,
      boardH,
      boardD,
      6,
      0.045
    );
    const matteBlackBodyMat = new THREE.MeshPhysicalMaterial({
      color: 0x0c0d10,
      roughness: 0.42,
      metalness: 0.18,
      clearcoat: 0.22,
      clearcoatRoughness: 0.38,
      envMapIntensity: 0.9,
    });
    const boardBodyMesh = new THREE.Mesh(boardBodyGeo, matteBlackBodyMat);
    boardBodyMesh.position.set(0, -0.22, 0);
    boardBodyMesh.castShadow = true;
    boardBodyMesh.receiveShadow = true;
    rootGroup.add(boardBodyMesh);

    // Part 2: Engraved Front Slate Faceplate (flush on front of board body)
    const frontFaceGeo = new THREE.PlaneGeometry(boardW - 0.08, boardH - 0.08);
    const frontFaceMat = new THREE.MeshPhysicalMaterial({
      map: colorMap,
      roughnessMap: roughnessMap,
      bumpMap: bumpMap,
      bumpScale: 0.004,
      roughness: 0.55,
      metalness: 0.12,
      clearcoat: 0.28,
      clearcoatRoughness: 0.32,
      envMapIntensity: 1.0,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const frontFaceMesh = new THREE.Mesh(frontFaceGeo, frontFaceMat);
    frontFaceMesh.position.set(0, -0.22, boardD / 2 + 0.001);
    rootGroup.add(frontFaceMesh);

    // Part 3: Brushed Electric-Blue Edge Trim Bar (subtle top-of-slate inlay)
    const blueTrimGeo = new RoundedBoxGeometry(
      boardW - 0.16,
      0.022,
      boardD + 0.006,
      3,
      0.008
    );
    const electricBlueMat = new THREE.MeshPhysicalMaterial({
      color: 0x2563eb,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.18,
      roughness: 0.24,
      metalness: 0.78,
      clearcoat: 0.5,
    });
    const blueTrimMesh = new THREE.Mesh(blueTrimGeo, electricBlueMat);
    blueTrimMesh.position.set(0, boardH / 2 - 0.22, 0);
    rootGroup.add(blueTrimMesh);

    // Part 4: Lower Fixed Clapper Stick (Mounted on top edge of slate)
    const stickH = 0.34;
    const stickD = 0.2;
    const lowerStickY = boardH / 2 - 0.22 + stickH / 2 + 0.008;

    const stickGeo = new RoundedBoxGeometry(boardW, stickH, stickD, 5, 0.032);
    const lowerStickMat = new THREE.MeshPhysicalMaterial({
      map: bottomStickTex,
      roughness: 0.34,
      metalness: 0.1,
      clearcoat: 0.2,
      clearcoatRoughness: 0.35,
    });
    const lowerStickMesh = new THREE.Mesh(stickGeo, lowerStickMat);
    lowerStickMesh.position.set(0, lowerStickY, 0);
    lowerStickMesh.castShadow = true;
    lowerStickMesh.receiveShadow = true;
    rootGroup.add(lowerStickMesh);

    // Part 5: Hinged Upper Clapper Stick (Pivots at left hinge pin)
    const hingePivotX = -boardW / 2 + 0.18;
    const hingePivotY = lowerStickY + stickH / 2 + 0.006;

    const hingePivotGroup = new THREE.Group();
    hingePivotGroup.position.set(hingePivotX, hingePivotY, 0);
    rootGroup.add(hingePivotGroup);

    const upperStickMat = new THREE.MeshPhysicalMaterial({
      map: topStickTex,
      roughness: 0.34,
      metalness: 0.1,
      clearcoat: 0.2,
      clearcoatRoughness: 0.35,
    });
    const upperStickMesh = new THREE.Mesh(stickGeo, upperStickMat);
    // Offset relative to left hinge pivot so it rotates accurately around the left pin
    upperStickMesh.position.set(boardW / 2 - 0.18, stickH / 2, 0);
    upperStickMesh.castShadow = true;
    upperStickMesh.receiveShadow = true;
    hingePivotGroup.add(upperStickMesh);

    // Part 6: Magnetic Closure Inserts on Right End of Sticks
    const magnetGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.02, 20);
    const chromeMat = new THREE.MeshPhysicalMaterial({
      color: 0xd4d8e2,
      metalness: 0.94,
      roughness: 0.16,
    });
    const lowerMagnet = new THREE.Mesh(magnetGeo, chromeMat);
    lowerMagnet.position.set(
      boardW / 2 - 0.24,
      lowerStickY + stickH / 2,
      0
    );
    rootGroup.add(lowerMagnet);

    const upperMagnet = new THREE.Mesh(magnetGeo, chromeMat);
    upperMagnet.position.set(boardW - 0.42, 0.005, 0);
    hingePivotGroup.add(upperMagnet);

    // Part 7: CNC-Machined Anodized Gunmetal Hinge Bracket (Left Side)
    const hingeBracketW = 0.44;
    const hingeBracketH = 0.82;
    const hingeBracketD = stickD + 0.06;
    const hingeBracketGeo = new RoundedBoxGeometry(
      hingeBracketW,
      hingeBracketH,
      hingeBracketD,
      4,
      0.04
    );
    const gunmetalMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a1d24,
      metalness: 0.88,
      roughness: 0.22,
      anisotropy: 0.6,
      clearcoat: 0.3,
    });
    const hingeBracketMesh = new THREE.Mesh(hingeBracketGeo, gunmetalMat);
    hingeBracketMesh.position.set(
      -boardW / 2 + 0.19,
      hingePivotY - 0.08,
      0
    );
    hingeBracketMesh.castShadow = true;
    rootGroup.add(hingeBracketMesh);

    // Part 8: Brushed Steel Hinge Pivot Barrel & Electric-Blue Anodized Hex Bolts
    const pivotPinGeo = new THREE.CylinderGeometry(
      0.068,
      0.068,
      hingeBracketD + 0.03,
      24
    );
    pivotPinGeo.rotateX(Math.PI / 2);
    const pivotPinMesh = new THREE.Mesh(pivotPinGeo, chromeMat);
    pivotPinMesh.position.set(hingePivotX, hingePivotY, 0);
    rootGroup.add(pivotPinMesh);

    // Precision electric-blue anodized bolts on the hinge plate
    const boltGeo = new THREE.CylinderGeometry(
      0.042,
      0.042,
      hingeBracketD + 0.025,
      6 // Hexagonal bolt head
    );
    boltGeo.rotateX(Math.PI / 2);

    const boltPositions = [
      [hingePivotX - 0.06, hingePivotY - 0.24],
      [hingePivotX + 0.08, hingePivotY - 0.24],
      [hingePivotX, hingePivotY + 0.18],
    ];
    boltPositions.forEach(([bx, by]) => {
      const bolt = new THREE.Mesh(boltGeo, electricBlueMat);
      bolt.position.set(bx, by, 0);
      rootGroup.add(bolt);
    });

    // =========================================================================
    // 3. STUDIO FLOOR SURFACE & NATURAL CONTACT SHADOW GROUNDING
    // =========================================================================
    const shadowTex = createContactShadowTexture();
    const shadowPlaneGeo = new THREE.PlaneGeometry(5.6, 2.4);
    shadowPlaneGeo.rotateX(-Math.PI / 2);
    const shadowPlaneMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.44,
    });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.position.set(0, -1.86, 0.1);
    scene.add(shadowPlane);

    // Pre-compile shaders once to prevent first-frame hitch
    renderer.compile(scene, camera);

    // Initial hinge angle setup
    if (prefersReducedMotion) {
      clapStateRef.current.angle = 0.12;
      clapStateRef.current.phase = 'settled';
      hingePivotGroup.rotation.z = 0.12;
    } else {
      clapStateRef.current.angle = 0.36;
      clapStateRef.current.phase = 'opening';
      clapStateRef.current.phaseTimer = 0;
      hingePivotGroup.rotation.z = 0.36;
    }

    // =========================================================================
    // 4. POINTER & RESIZE HANDLERS
    // =========================================================================
    const handlePointerMove = (e: PointerEvent) => {
      if (prefersReducedMotion || window.innerWidth < 768) return;
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      pointerRef.current.x = THREE.MathUtils.clamp(nx, -1.2, 1.2);
      pointerRef.current.y = THREE.MathUtils.clamp(ny, -1.2, 1.2);
      pointerRef.current.active = true;
    };

    const handlePointerLeave = () => {
      pointerRef.current.active = false;
    };

    window.addEventListener('pointermove', handlePointerMove, {
      passive: true,
    });
    container.addEventListener('pointerleave', handlePointerLeave, {
      passive: true,
    });

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 560;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      // Slightly wider FOV on compact screens so the clapperboard never clips
      camera.fov = w < 500 ? 40 : 34;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglSupported(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

    // =========================================================================
    // 5. ANIMATION LOOP (Damped Rotation, Subtle Float, Hinge Kinematics)
    // =========================================================================
    const clock = new THREE.Clock();
    let animFrameId = 0;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // 1. Subtle floating motion
        const floatY = Math.sin(elapsed * 1.35) * 0.065;
        const floatRotZ = Math.cos(elapsed * 0.9) * 0.012;
        rootGroup.position.y = floatY;

        // Contact shadow subtly scales with float height
        const shadowScale = 1 - floatY * 0.35;
        shadowPlane.scale.set(shadowScale, 1, shadowScale);

        // 2. Gentle pointer-reactive rotation (desktop) or gentle drift (mobile)
        const isMobile = window.innerWidth < 768;
        const px = isMobile
          ? Math.sin(elapsed * 0.6) * 0.12
          : pointerRef.current.active
            ? pointerRef.current.x
            : 0;
        const py = isMobile
          ? Math.cos(elapsed * 0.5) * 0.08
          : pointerRef.current.active
            ? pointerRef.current.y
            : 0;

        // Slight tilt adjustment when user focuses on the contact form
        const focusYawBoost = focusRef.current ? 0.08 : 0;

        const targetRotY = baseRotY + px * 0.24 + focusYawBoost;
        const targetRotX = baseRotX - py * 0.16;
        const targetRotZ = baseRotZ + floatRotZ + px * 0.03;

        rootGroup.rotation.y = THREE.MathUtils.damp(
          rootGroup.rotation.y,
          targetRotY,
          4.5,
          dt
        );
        rootGroup.rotation.x = THREE.MathUtils.damp(
          rootGroup.rotation.x,
          targetRotX,
          4.5,
          dt
        );
        rootGroup.rotation.z = THREE.MathUtils.damp(
          rootGroup.rotation.z,
          targetRotZ,
          4.5,
          dt
        );

        // 3. Restrained camera movement that reveals depth
        _targetCameraPos.set(
          0.15 + px * 0.22,
          0.22 + py * 0.14,
          focusRef.current ? 7.35 : 7.6
        );
        camera.position.lerp(_targetCameraPos, 1 - Math.exp(-3.5 * dt));
        camera.lookAt(0, -0.05, 0);

        // 4. Soft studio lighting shift on interaction
        blueFillLight.position.x = THREE.MathUtils.damp(
          blueFillLight.position.x,
          -3.2 + px * 2.2,
          4.0,
          dt
        );
        blueFillLight.position.y = THREE.MathUtils.damp(
          blueFillLight.position.y,
          0.8 + py * 1.8,
          4.0,
          dt
        );
        blueFillLight.intensity = THREE.MathUtils.damp(
          blueFillLight.intensity,
          focusRef.current ? 4.4 : 3.4 + Math.abs(px) * 0.9,
          4.0,
          dt
        );
        amberRimLight.intensity = THREE.MathUtils.damp(
          amberRimLight.intensity,
          focusRef.current ? 6.2 : 5.2 + Math.abs(py) * 0.8,
          4.0,
          dt
        );

        // 5. Clapper-hinge reveal & snap physics
        const cs = clapStateRef.current;
        cs.phaseTimer += dt;

        if (cs.phase === 'opening') {
          cs.angle = THREE.MathUtils.damp(cs.angle, 0.44, 7.5, dt);
          if (cs.phaseTimer > 0.55) {
            cs.phase = 'snapping';
            cs.phaseTimer = 0;
          }
        } else if (cs.phase === 'snapping') {
          // Fast crisp downward snap of the top slate stick
          cs.angle = THREE.MathUtils.damp(cs.angle, 0.0, 26.0, dt);
          if (cs.angle < 0.008) {
            cs.angle = 0;
            cs.phase = 'settled';
          }
        } else {
          // Settled: rest slightly cracked open (0.06 rad) after a brief pause so the chevron silhouette stays iconic
          if (cs.phaseTimer > 1.3) {
            cs.angle = THREE.MathUtils.damp(cs.angle, 0.085, 3.2, dt);
          }
        }

        hingePivotGroup.rotation.z = cs.angle;
      }

      renderer.render(scene, camera);
    };

    animFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      renderer.domElement.removeEventListener(
        'webglcontextlost',
        handleContextLost
      );
      resizeObserver.disconnect();

      // Dispose all geometries, materials, and textures
      boardBodyGeo.dispose();
      matteBlackBodyMat.dispose();
      frontFaceGeo.dispose();
      frontFaceMat.dispose();
      blueTrimGeo.dispose();
      electricBlueMat.dispose();
      stickGeo.dispose();
      lowerStickMat.dispose();
      upperStickMat.dispose();
      magnetGeo.dispose();
      chromeMat.dispose();
      hingeBracketGeo.dispose();
      gunmetalMat.dispose();
      pivotPinGeo.dispose();
      boltGeo.dispose();
      shadowPlaneGeo.dispose();
      shadowPlaneMat.dispose();

      colorMap.dispose();
      roughnessMap.dispose();
      bumpMap.dispose();
      bottomStickTex.dispose();
      topStickTex.dispose();
      shadowTex.dispose();
      envTexture.dispose();

      renderer.dispose();
    };
  }, []);

  if (!webglSupported) {
    // Graceful high-craft SVG/CSS 3D-rendered studio slate fallback if WebGL is disabled
    return (
      <div className="relative flex items-center justify-center w-full h-full min-h-[360px] p-6">
        <div
          onClick={onSlateClick}
          className="relative w-full max-w-[420px] aspect-[4/3] rounded-xl bg-gradient-to-br from-[#14171f] via-[#0c0d12] to-[#07080b] border border-white/15 shadow-[0_30px_70px_rgba(0,0,0,0.85)] p-6 flex flex-col justify-between cursor-pointer transform -rotate-2"
        >
          <div className="h-8 w-full rounded bg-[repeating-linear-gradient(135deg,#0e1014_0px,#0e1014_24px,#f2ede2_24px,#f2ede2_48px)] border-b-2 border-[#2563eb]" />
          <div className="text-center my-auto py-6 border-y border-white/10">
            <p className="text-2xl md:text-3xl font-bold tracking-[0.22em] text-[#f5f0e6]">
              ANUP RAWAT
            </p>
            <p className="text-xs font-semibold tracking-[0.35em] text-[#3b82f6] mt-2">
              CINEMATOGRAPHER
            </p>
          </div>
          <div className="flex justify-between text-[11px] font-mono-slate text-[#f5f0e6]/60 tracking-widest">
            <span>BAAZ CINEMA</span>
            <span>24.00 FPS · S35</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center select-none">
      {/* Subtle studio ambient glow behind the 3D clapperboard (warm amber + cool cobalt) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="w-[72%] h-[68%] rounded-full bg-[radial-gradient(circle_at_35%_45%,rgba(37,99,235,0.16),rgba(245,158,11,0.08)_55%,transparent_75%)] blur-2xl" />
      </div>

      {/* Interactive 3D WebGL Canvas Mount */}
      <div
        ref={mountRef}
        onClick={onSlateClick}
        role="button"
        tabIndex={0}
        aria-label="Interactive 3D Film Director's Clapperboard for Anup Rawat. Click or press Enter to clap the slate."
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSlateClick?.();
          }
        }}
        title="Click to clap the slate"
        className="relative z-10 w-full h-[360px] sm:h-[430px] lg:h-[520px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/60 rounded-xl"
      />
    </div>
  );
};
