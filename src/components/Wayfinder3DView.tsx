import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Wayfinder3DViewProps {
  onRecenter?: () => void;
  destinationLabel?: string;
  remainingDistance?: string;
}

export const Wayfinder3DView: React.FC<Wayfinder3DViewProps> = ({
  destinationLabel = 'Room 204 (Level 2)',
  remainingDistance = '45m left'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [cameraMode, setCameraMode] = useState<'ar_digital' | 'ar_camera'>('ar_digital');
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [compassDegrees, setCompassDegrees] = useState(14);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 360;
    const height = container.clientHeight || 288;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f172a, 0.035);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 100);
    camera.position.set(0, 1.6, 3.5);

    // Renderer setup
    const isHeadless = typeof navigator !== 'undefined' && (/HeadlessChrome/i.test(navigator.userAgent) || navigator.webdriver);
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = !isHeadless;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Procedural lighting rig (3-point)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x60a5fa, 1.8);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 2, 12);
    pointLight.position.set(0, 2, 0);
    scene.add(pointLight);

    // Hallway group
    const hallwayGroup = new THREE.Group();
    scene.add(hallwayGroup);

    // Floor with cyber tech grid
    const floorGeo = new THREE.PlaneGeometry(6, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f2038,
      roughness: 0.35,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.z = -8;
    floor.receiveShadow = true;
    hallwayGroup.add(floor);

    // Grid lines on floor
    const gridHelper = new THREE.GridHelper(24, 24, 0x38bdf8, 0x1e3a5f);
    gridHelper.position.set(0, 0.015, -8);
    hallwayGroup.add(gridHelper);

    // Wall geometries
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x132742,
      roughness: 0.6,
      metalness: 0.1
    });

    const leftWallGeo = new THREE.BoxGeometry(0.3, 3.5, 24);
    const leftWall = new THREE.Mesh(leftWallGeo, wallMat);
    leftWall.position.set(-3.1, 1.75, -8);
    hallwayGroup.add(leftWall);

    const rightWall = leftWall.clone();
    rightWall.position.set(3.1, 1.75, -8);
    hallwayGroup.add(rightWall);

    // Doorway cutouts & trim
    const doorTrimGeo = new THREE.BoxGeometry(0.1, 2.4, 1.3);
    const doorTrimMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3 });
    const doorTrim = new THREE.Mesh(doorTrimGeo, doorTrimMat);
    doorTrim.position.set(2.95, 1.2, -15);
    hallwayGroup.add(doorTrim);

    // Ceiling lights
    const ceilingLights: THREE.Mesh[] = [];
    const lightMat = new THREE.MeshBasicMaterial({ color: 0x93c5fd });
    for (let z = 0; z >= -18; z -= 4) {
      const lightGeo = new THREE.BoxGeometry(1.4, 0.08, 0.3);
      const ceilingLight = new THREE.Mesh(lightGeo, lightMat);
      ceilingLight.position.set(0, 3.4, z);
      hallwayGroup.add(ceilingLight);
      ceilingLights.push(ceilingLight);
    }

    // AR Waypoint Curved Navigation Tube
    const navPathCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.2, 2.5),
      new THREE.Vector3(0, 0.2, 0),
      new THREE.Vector3(0.4, 0.25, -3),
      new THREE.Vector3(-0.2, 0.25, -6),
      new THREE.Vector3(0.8, 0.3, -9),
      new THREE.Vector3(1.4, 0.35, -12),
      new THREE.Vector3(1.8, 0.4, -15) // Door 204
    ]);

    const tubeGeo = new THREE.TubeGeometry(navPathCurve, 64, 0.08, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x3b82f6,
      emissiveIntensity: 0.85,
      roughness: 0.2
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(tubeMesh);

    // Floating Chevron Directional Arrows
    const arrows: { mesh: THREE.Mesh; offset: number }[] = [];
    const arrowGeo = new THREE.ConeGeometry(0.18, 0.45, 4);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    for (let i = 0; i < 5; i++) {
      const arrow = new THREE.Mesh(arrowGeo, arrowMat);
      arrow.rotation.x = Math.PI / 2;
      scene.add(arrow);
      arrows.push({ mesh: arrow, offset: i * 0.18 });
    }

    // 3D Procedural AR Pin & Door Signboard Group
    const pinGroup = new THREE.Group();

    // Beacon ring
    const beaconRingGeo = new THREE.RingGeometry(0.3, 0.44, 32);
    const beaconRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const ringMesh = new THREE.Mesh(beaconRingGeo, beaconRingMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0.05;
    pinGroup.add(ringMesh);

    // Pin stem
    const pinStemGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.5, 16);
    const pinStemMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x2563eb });
    const pinStem = new THREE.Mesh(pinStemGeo, pinStemMat);
    pinStem.position.y = 0.75;
    pinGroup.add(pinStem);

    // Pin head sphere
    const pinHeadGeo = new THREE.SphereGeometry(0.3, 24, 24);
    const pinHeadMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x1d4ed8,
      roughness: 0.1
    });
    const pinHead = new THREE.Mesh(pinHeadGeo, pinHeadMat);
    pinHead.position.y = 1.6;
    pinGroup.add(pinHead);

    // Destination signboard
    const signGeo = new THREE.BoxGeometry(1.6, 0.7, 0.08);
    const signMat = new THREE.MeshStandardMaterial({ color: 0x0f2942, roughness: 0.4 });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 2.3, 0);
    pinGroup.add(sign);

    // Room number text badge canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 112;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f2942';
      ctx.fillRect(0, 0, 256, 112);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, 248, 104);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ROOM 204', 128, 52);
      ctx.fillStyle = '#7bd0ff';
      ctx.font = '600 20px "Inter", sans-serif';
      ctx.fillText('CS301 LECTURE', 128, 86);
    }
    const signTex = new THREE.CanvasTexture(canvas);
    signTex.colorSpace = THREE.SRGBColorSpace;
    const signFaceGeo = new THREE.PlaneGeometry(1.5, 0.62);
    const signFaceMat = new THREE.MeshBasicMaterial({ map: signTex, transparent: true });
    const signFace = new THREE.Mesh(signFaceGeo, signFaceMat);
    signFace.position.set(0, 2.3, 0.045);
    pinGroup.add(signFace);

    pinGroup.position.set(1.8, 0, -15);
    scene.add(pinGroup);

    // Drag interaction state
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotY = 0;
    let targetCamY = 1.6;

    const domTarget = renderer.domElement;

    const onPointerDown = (clientX: number, clientY: number) => {
      isDragging = true;
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;
      const deltaX = clientX - prevMouseX;
      const deltaY = clientY - prevMouseY;
      targetRotY -= deltaX * 0.005;
      targetCamY = Math.max(1.0, Math.min(2.4, targetCamY - deltaY * 0.005));
      prevMouseX = clientX;
      prevMouseY = clientY;
      setCompassDegrees(prev => ((prev + Math.round(deltaX * 0.5)) % 360 + 360) % 360);
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onMouseDown = (e: MouseEvent) => onPointerDown(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => onPointerMove(e.clientX, e.clientY);
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    domTarget.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onPointerUp);
    domTarget.addEventListener('touchstart', onTouchStart, { passive: true });
    domTarget.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // Resize handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 360;
      const h = container.clientHeight || 288;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();
    const scratchVec = new THREE.Vector3();
    const upVec = new THREE.Vector3(0, 1, 0);

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Pulsing beacon ring & pin
      ringMesh.scale.setScalar(1 + 0.18 * Math.sin(elapsedTime * 3));
      pinHead.position.y = 1.6 + 0.08 * Math.sin(elapsedTime * 2.5);
      sign.position.y = 2.3 + 0.08 * Math.sin(elapsedTime * 2.5);
      signFace.position.y = 2.3 + 0.08 * Math.sin(elapsedTime * 2.5);

      // Animate arrows along the path
      arrows.forEach((item, index) => {
        const t = (elapsedTime * 0.15 + item.offset) % 1.0;
        const pt = navPathCurve.getPointAt(t);
        const tangent = navPathCurve.getTangentAt(t, scratchVec).normalize();
        item.mesh.position.copy(pt);
        item.mesh.position.y += 0.15 + 0.04 * Math.sin(elapsedTime * 4 + index);
        item.mesh.quaternion.setFromUnitVectors(upVec, tangent);
      });

      // Smooth camera interpolation
      camera.rotation.y += (targetRotY - camera.rotation.y) * 0.08;
      camera.position.y += (targetCamY - camera.position.y) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      domTarget.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onPointerUp);
      domTarget.removeEventListener('touchstart', onTouchStart);
      domTarget.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('resize', handleResize);

      // Dispose resources
      floorGeo.dispose();
      floorMat.dispose();
      leftWallGeo.dispose();
      wallMat.dispose();
      doorTrimGeo.dispose();
      doorTrimMat.dispose();
      lightMat.dispose();
      tubeGeo.dispose();
      tubeMat.dispose();
      arrowGeo.dispose();
      arrowMat.dispose();
      beaconRingGeo.dispose();
      beaconRingMat.dispose();
      pinStemGeo.dispose();
      pinStemMat.dispose();
      pinHeadGeo.dispose();
      pinHeadMat.dispose();
      signGeo.dispose();
      signMat.dispose();
      signFaceGeo.dispose();
      signFaceMat.dispose();
      signTex.dispose();

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const handleCalibrate = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
      setCompassDegrees(0);
    }, 600);
  };

  const handleToggleCamera = () => {
    setCameraMode(prev => (prev === 'ar_digital' ? 'ar_camera' : 'ar_digital'));
  };

  return (
    <div className="relative w-full h-72 rounded-2xl overflow-hidden bg-slate-900 shadow-inner select-none">
      {/* Optional Simulated Camera Backdrop */}
      {cameraMode === 'ar_camera' && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity duration-300 pointer-events-none"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80")'
          }}
        />
      )}

      {/* 3D WebGL Canvas Mount Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top AR HUD Bar */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
        {/* Pulsating AR Beacon Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-white shadow-lg pointer-events-auto">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-400" />
          </span>
          <span className="font-label-sm text-label-sm font-semibold tracking-wide text-sky-200">
            AR Live Waypoint • SREC CSE Block L2
          </span>
        </div>

        {/* Top-Right AR Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={handleCalibrate}
            aria-label="Calibrate AR Compass"
            className="w-8 h-8 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-sky-300 hover:text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
            title={`Compass: ${compassDegrees}°`}
          >
            <span className={`material-symbols-outlined text-[17px] ${isCalibrating ? 'animate-spin' : ''}`}>
              explore
            </span>
          </button>
          <button
            onClick={handleToggleCamera}
            aria-label="Switch Camera / View Mode"
            className={`w-8 h-8 rounded-full backdrop-blur-md border text-sky-300 hover:text-white flex items-center justify-center shadow-lg active:scale-95 transition-all ${
              cameraMode === 'ar_camera' ? 'bg-secondary border-secondary text-white' : 'bg-slate-900/80 border-white/10'
            }`}
            title={cameraMode === 'ar_camera' ? 'Live Camera Feed Mode' : 'Synthetic 3D Grid Mode'}
          >
            <span className="material-symbols-outlined text-[17px]">
              {cameraMode === 'ar_camera' ? 'videocam' : 'flip_camera_ios'}
            </span>
          </button>
        </div>
      </div>

      {/* Swipe to rotate 3D view badge */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 pointer-events-none z-10">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-sm border border-white/10 text-[11px] text-slate-300 font-code-sm">
          <span className="material-symbols-outlined text-[13px] text-sky-400">pan_tool</span>
          Swipe to rotate 3D corridor view
        </span>
      </div>

      {/* Bottom Floating Guidance Card */}
      <div className="absolute bottom-3 inset-x-3 pointer-events-auto z-10">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/95 backdrop-blur-lg border border-sky-500/30 shadow-xl text-white">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 shadow-sm text-white">
            <span className="material-symbols-outlined text-[24px]">turn_slight_right</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <span className="font-title-sm text-title-sm text-white font-semibold truncate">
                Turn slightly right in 15m
              </span>
              <span className="font-code-sm text-code-sm text-sky-400 font-bold shrink-0">
                {remainingDistance}
              </span>
            </div>
            <span className="font-body-sm text-body-sm text-slate-300 text-[12px] block truncate">
              Proceed along Eng Corridor to {destinationLabel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
