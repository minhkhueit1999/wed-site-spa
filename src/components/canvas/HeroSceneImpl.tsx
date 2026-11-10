'use client';

import * as React from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { QualityTier } from '@/infrastructure/motion/QualityTierContext';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface HeroSceneImplProps {
  tier: QualityTier;
}

export function HeroSceneImpl({ tier }: HeroSceneImplProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === 'undefined') return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0, 4.2);

    // 2. Renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        powerPreference: tier === 3 ? 'high-performance' : 'default',
        antialias: tier === 3,
        alpha: true,
      });
    } catch {
      return;
    }
    const dpr = tier === 3 ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    renderer.setPixelRatio(dpr);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 3. Lighting: Warm natural spa ambience
    const ambientLight = new THREE.AmbientLight(0xfaf7f2, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xfff3e0, 2.5);
    dirLight1.position.set(4, 5, 3);
    scene.add(dirLight1);

    const rimLight = new THREE.DirectionalLight(0x5b7b6a, 1.8);
    rimLight.position.set(-3, -2, -2);
    scene.add(rimLight);

    // 4. Procedural Organic Zen Pebble Sculpture
    // Tạo hình khối đá thiền định hữu cơ biến dạng mềm
    const geometry = new THREE.IcosahedronGeometry(1.2, tier === 3 ? 32 : 16);
    const positionAttribute = geometry.getAttribute('position');

    if (positionAttribute) {
      const vertex = new THREE.Vector3();
      for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);
        // Biến dạng hữu cơ: dẹt nhẹ theo trục Y và kéo nhẹ theo XZ tạo hình viên sỏi spa
        vertex.y *= 0.65;
        const noise =
          Math.sin(vertex.x * 2.2 + 0.5) * 0.12 +
          Math.cos(vertex.z * 2.5 + 0.8) * 0.12 +
          Math.sin(vertex.y * 3.0) * 0.08;
        vertex.addScaledVector(vertex.clone().normalize(), noise);
        positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
      }
      geometry.computeVertexNormals();
    }

    // Vật liệu Ngọc Bích / Thủy tinh mờ cao cấp (Frosted Jade / Water Droplet)
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x405c4e,
      roughness: 0.18,
      metalness: 0.1,
      transmission: tier === 3 ? 0.6 : 0.2, // Hiệu ứng thấu quang trong suốt
      ior: 1.45,
      thickness: 1.2,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
      transparent: true,
      opacity: 0.95,
    });

    const sculptureMesh = new THREE.Mesh(geometry, material);
    sculptureMesh.rotation.set(0.3, 0.4, 0);
    scene.add(sculptureMesh);

    // Vòng hào quang ánh sáng bao quanh (Halo Ring)
    const ringGeo = new THREE.TorusGeometry(1.6, 0.02, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd99b4b,
      transparent: true,
      opacity: 0.35,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.2;
    scene.add(ringMesh);

    // 5. GSAP ScrollTrigger: Quỹ đạo xoay & dolly zoom khi cuộn trang
    let scrollTriggerInstance: ScrollTrigger | null = null;
    if (typeof window !== 'undefined') {
      scrollTriggerInstance = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2,
        onUpdate: (self) => {
          const progress = self.progress;
          sculptureMesh.rotation.y = 0.4 + progress * Math.PI * 0.75;
          sculptureMesh.rotation.x = 0.3 - progress * 0.35;
          sculptureMesh.position.y = -progress * 0.6;
          camera.position.z = 4.2 + progress * 0.8;
          ringMesh.rotation.z = progress * Math.PI;
        },
      });
    }

    // 6. Con trỏ tương tác (Inertia Parallax Tilt)
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetTiltX = ny * 0.25;
      targetTiltY = nx * 0.35;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // Thay đổi kích thước
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Quản lý tạm dừng khi tab ẩn
    let isPaused = false;
    const handleVisibility = () => {
      isPaused = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // 7. Render Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (isPaused) return;

      const delta = clock.getDelta();

      // Lerp tilt
      currentTiltX += (targetTiltX - currentTiltX) * 0.05;
      currentTiltY += (targetTiltY - currentTiltY) * 0.05;

      sculptureMesh.rotation.x += (currentTiltX - sculptureMesh.rotation.x) * 0.05;
      sculptureMesh.rotation.y += delta * 0.25 + currentTiltY * 0.05;

      // Dao động nhẹ tự nhiên như nổi trên mặt nước (floating breathing)
      sculptureMesh.position.y += Math.sin(clock.getElapsedTime() * 1.5) * 0.001;
      ringMesh.rotation.y += delta * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Dọn dẹp GPU sạch sẽ khi unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (scrollTriggerInstance) scrollTriggerInstance.kill();

      geometry.dispose();
      material.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [tier]);

  return <div ref={containerRef} className="h-full w-full" />;
}
