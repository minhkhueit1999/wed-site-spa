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
    camera.position.set(0, 0.2, 4.4);

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
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 3. Lighting: Warm natural spa sanctuary ambience
    const ambientLight = new THREE.AmbientLight(0xfff8f0, 1.4);
    scene.add(ambientLight);

    const mainSun = new THREE.DirectionalLight(0xffedd5, 2.4);
    mainSun.position.set(4, 5, 4);
    scene.add(mainSun);

    const sageRimLight = new THREE.DirectionalLight(0x7da48d, 1.6);
    sageRimLight.position.set(-4, -2, -2);
    scene.add(sageRimLight);

    const warmUnderlight = new THREE.PointLight(0xd99b4b, 1.2, 5);
    warmUnderlight.position.set(0, -1, 1);
    scene.add(warmUnderlight);

    // Master Group chứa toàn bộ tác phẩm Spa Wellness
    const spaGroup = new THREE.Group();
    scene.add(spaGroup);

    // 4. Tháp 3 Đá Nóng Bazan Thiền Định (Zen Basalt Hot Stones)
    // Hàm tạo viên đá cuội bazan massage nhẵn bóng hữu cơ
    const createBasaltStone = (scaleX: number, scaleY: number, scaleZ: number, color: number) => {
      const geo = new THREE.SphereGeometry(1, tier === 3 ? 32 : 18, tier === 3 ? 24 : 14);
      const pos = geo.getAttribute('position');
      if (pos) {
        const v = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
          v.fromBufferAttribute(pos, i);
          // Biến dạng bất đối xứng tự nhiên của đá suối thiên nhiên
          const noise =
            Math.sin(v.x * 2.1) * 0.05 + Math.cos(v.z * 2.4) * 0.05 + Math.sin(v.y * 3.2) * 0.03;
          v.multiplyScalar(1 + noise);
          pos.setXYZ(i, v.x, v.y, v.z);
        }
        geo.computeVertexNormals();
      }
      geo.scale(scaleX, scaleY, scaleZ);

      const mat = new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.32,
        metalness: 0.12,
        clearcoat: 0.55,
        clearcoatRoughness: 0.2,
      });

      return new THREE.Mesh(geo, mat);
    };

    // Viên đá 1 (Đá đáy lớn - Bazan than chì)
    const baseStone = createBasaltStone(1.35, 0.42, 1.05, 0x222623);
    baseStone.position.set(0, -0.65, 0);
    baseStone.rotation.set(0.04, 0.2, -0.02);
    spaGroup.add(baseStone);

    // Viên đá 2 (Đá thân vừa - Cân bằng nghiêng nhẹ)
    const midStone = createBasaltStone(1.02, 0.36, 0.82, 0x2e3530);
    midStone.position.set(0.04, -0.22, 0.03);
    midStone.rotation.set(-0.06, -0.35, 0.05);
    spaGroup.add(midStone);

    // Viên đá 3 (Đá đỉnh tròn mịn - Tĩnh tại)
    const topStone = createBasaltStone(0.68, 0.32, 0.62, 0x3d4740);
    topStone.position.set(-0.03, 0.15, -0.01);
    topStone.rotation.set(0.05, 0.4, 0.02);
    spaGroup.add(topStone);

    // 5. Đóa Hoa Sen Thanh Khiết (Serene Lotus Flower)
    const lotusGroup = new THREE.Group();
    lotusGroup.position.set(0.85, -0.58, 0.45);
    lotusGroup.scale.set(0.65, 0.65, 0.65);
    lotusGroup.rotation.set(0.12, -0.4, 0.08);

    // Vật liệu cánh sen phớt hồng thanh thoát
    const petalMaterialOuter = new THREE.MeshPhysicalMaterial({
      color: 0xf5e8eb,
      roughness: 0.38,
      metalness: 0.05,
      transmission: 0.22,
      thickness: 0.15,
      clearcoat: 0.3,
      side: THREE.DoubleSide,
    });

    const petalMaterialInner = new THREE.MeshPhysicalMaterial({
      color: 0xecd1d8,
      roughness: 0.42,
      metalness: 0.05,
      transmission: 0.18,
      thickness: 0.12,
      clearcoat: 0.2,
      side: THREE.DoubleSide,
    });

    // Tạo hình cánh sen dạng mo cong
    const createPetalMesh = (material: THREE.Material, scale = 1) => {
      const geo = new THREE.SphereGeometry(0.35, 12, 10);
      geo.scale(0.48 * scale, 1.1 * scale, 0.14 * scale);
      const pos = geo.getAttribute('position');
      if (pos) {
        const v = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
          v.fromBufferAttribute(pos, i);
          // Uốn cong cánh sen nhẹ về phía ngoài
          v.z += (v.y + 0.3) * (v.y + 0.3) * 0.18;
          pos.setXYZ(i, v.x, v.y, v.z);
        }
        geo.computeVertexNormals();
      }
      return new THREE.Mesh(geo, material);
    };

    // Tầng cánh ngoài (8 cánh nở xòe)
    const outerPetalsCount = 8;
    for (let i = 0; i < outerPetalsCount; i++) {
      const angle = (i / outerPetalsCount) * Math.PI * 2;
      const petal = createPetalMesh(petalMaterialOuter, 1.05);
      petal.position.set(Math.cos(angle) * 0.22, 0.06, Math.sin(angle) * 0.22);
      petal.rotation.y = -angle + Math.PI / 2;
      petal.rotation.x = 0.55; // Nở mở ra
      lotusGroup.add(petal);
    }

    // Tầng cánh trong (6 cánh ôm e ấp)
    const innerPetalsCount = 6;
    for (let i = 0; i < innerPetalsCount; i++) {
      const angle = (i / innerPetalsCount) * Math.PI * 2 + 0.35;
      const petal = createPetalMesh(petalMaterialInner, 0.85);
      petal.position.set(Math.cos(angle) * 0.12, 0.14, Math.sin(angle) * 0.12);
      petal.rotation.y = -angle + Math.PI / 2;
      petal.rotation.x = 0.28; // Ôm đứng hơn
      lotusGroup.add(petal);
    }

    // Nhụy sen vàng hổ phách (Golden Amber Stamen Center)
    const stamenGeo = new THREE.CylinderGeometry(0.08, 0.06, 0.12, 16);
    const stamenMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.3,
      metalness: 0.4,
    });
    const stamenMesh = new THREE.Mesh(stamenGeo, stamenMat);
    stamenMesh.position.set(0, 0.14, 0);
    lotusGroup.add(stamenMesh);

    spaGroup.add(lotusGroup);

    // 6. Đĩa Nước Thủy Liệu Pháp & Gợn Sóng (Reflective Water Ripples)
    const waterBaseGeo = new THREE.CircleGeometry(1.9, tier === 3 ? 32 : 18);
    const waterBaseMat = new THREE.MeshPhysicalMaterial({
      color: 0x3d6756,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.75,
      ior: 1.333,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    const waterBase = new THREE.Mesh(waterBaseGeo, waterBaseMat);
    waterBase.rotation.x = -Math.PI / 2;
    waterBase.position.y = -0.88;
    spaGroup.add(waterBase);

    // Vòng sóng nước đồng tâm lan tỏa (Concentric Water Ripples)
    const ripple1Geo = new THREE.RingGeometry(1.0, 1.03, 32);
    const ripple1Mat = new THREE.MeshBasicMaterial({
      color: 0xcfe6dc,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    });
    const ripple1 = new THREE.Mesh(ripple1Geo, ripple1Mat);
    ripple1.rotation.x = -Math.PI / 2;
    ripple1.position.y = -0.87;
    spaGroup.add(ripple1);

    const ripple2Geo = new THREE.RingGeometry(1.4, 1.425, 32);
    const ripple2Mat = new THREE.MeshBasicMaterial({
      color: 0xd99b4b,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const ripple2 = new THREE.Mesh(ripple2Geo, ripple2Mat);
    ripple2.rotation.x = -Math.PI / 2;
    ripple2.position.y = -0.87;
    spaGroup.add(ripple2);

    // 7. Làn Sương Khói Tinh Dầu & Hạt Thảo Mộc (Herbal Aromatherapy Steam & Mist)
    const mistCount = tier === 3 ? 55 : 25;
    const mistPositions = new Float32Array(mistCount * 3);
    const mistSpeeds = new Float32Array(mistCount);
    const mistOffsets = new Float32Array(mistCount);

    for (let i = 0; i < mistCount; i++) {
      mistPositions[i * 3] = (Math.random() - 0.5) * 0.9;
      mistPositions[i * 3 + 1] = 0.2 + Math.random() * 1.5;
      mistPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.9;
      mistSpeeds[i] = 0.15 + Math.random() * 0.25;
      mistOffsets[i] = Math.random() * Math.PI * 2;
    }

    const mistGeo = new THREE.BufferGeometry();
    mistGeo.setAttribute('position', new THREE.BufferAttribute(mistPositions, 3));

    const mistMat = new THREE.PointsMaterial({
      color: 0xfff4e6,
      size: 0.07,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });

    const mistPoints = new THREE.Points(mistGeo, mistMat);
    spaGroup.add(mistPoints);

    // 8. GSAP ScrollTrigger: Xoay toàn cảnh điện ảnh khi cuộn trang
    let scrollTriggerInstance: ScrollTrigger | null = null;
    if (typeof window !== 'undefined') {
      scrollTriggerInstance = ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2,
        onUpdate: (self) => {
          const progress = self.progress;
          spaGroup.rotation.y = progress * Math.PI * 0.65;
          spaGroup.position.y = -progress * 0.45;
          camera.position.z = 4.4 + progress * 0.6;
        },
      });
    }

    // 9. Con trỏ tương tác (Inertia Parallax Tilt)
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetTiltX = ny * 0.22;
      targetTiltY = nx * 0.28;
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

    // 10. Render Loop: Nhịp thở tĩnh lặng & làn khói tinh dầu bốc lên
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (isPaused) return;

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Lerp tilt tương tác
      currentTiltX += (targetTiltX - currentTiltX) * 0.05;
      currentTiltY += (targetTiltY - currentTiltY) * 0.05;

      spaGroup.rotation.x = currentTiltX * 0.6;
      spaGroup.rotation.y += delta * 0.12 + (currentTiltY - spaGroup.rotation.y * 0.2) * 0.02;

      // Nhịp thở tĩnh lặng nhẹ nhàng như nổi trên mặt nước (gentle zen breathing)
      spaGroup.position.y = Math.sin(elapsed * 1.2) * 0.025;

      // Gợn sóng nước gợn mở rộng
      const r1Scale = 1 + Math.sin(elapsed * 1.5) * 0.05;
      ripple1.scale.set(r1Scale, r1Scale, 1);
      ripple1Mat.opacity = 0.25 + Math.sin(elapsed * 1.5) * 0.15;

      const r2Scale = 1 + Math.sin(elapsed * 1.5 + 1.2) * 0.06;
      ripple2.scale.set(r2Scale, r2Scale, 1);
      ripple2Mat.opacity = 0.18 + Math.sin(elapsed * 1.5 + 1.2) * 0.1;

      // Đóa hoa sen khẽ đung đưa êm dịu
      lotusGroup.rotation.z = 0.08 + Math.sin(elapsed * 1.4) * 0.03;

      // Làn sương khói tinh dầu thảo mộc bay là là bốc lên
      const posAttr = mistGeo.getAttribute('position') as THREE.BufferAttribute | undefined;
      if (posAttr && posAttr.array) {
        const positions = posAttr.array as Float32Array;
        for (let i = 0; i < mistCount; i++) {
          const idx = i * 3;
          const currentY = positions[idx + 1];
          const currentX = positions[idx];
          const currentZ = positions[idx + 2];
          const speed = mistSpeeds[i] ?? 0.2;
          const offset = mistOffsets[i] ?? 0;

          if (currentY !== undefined && currentX !== undefined && currentZ !== undefined) {
            // Tăng chiều cao Y
            let newY = currentY + delta * speed;
            let newX = currentX + Math.sin(elapsed * 1.8 + offset) * 0.0015;
            let newZ = currentZ + Math.cos(elapsed * 1.6 + offset) * 0.0015;

            // Vòng lặp sương khi bay lên quá cao
            if (newY > 1.8) {
              newY = 0.2;
              newX = (Math.random() - 0.5) * 0.6;
              newZ = (Math.random() - 0.5) * 0.6;
            }

            positions[idx] = newX;
            positions[idx + 1] = newY;
            positions[idx + 2] = newZ;
          }
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 11. Dọn dẹp GPU sạch sẽ khi unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (scrollTriggerInstance) scrollTriggerInstance.kill();

      // Dispose toàn bộ hình học và vật liệu
      baseStone.geometry.dispose();
      (baseStone.material as THREE.Material).dispose();
      midStone.geometry.dispose();
      (midStone.material as THREE.Material).dispose();
      topStone.geometry.dispose();
      (topStone.material as THREE.Material).dispose();

      petalMaterialOuter.dispose();
      petalMaterialInner.dispose();
      stamenGeo.dispose();
      stamenMat.dispose();

      waterBaseGeo.dispose();
      waterBaseMat.dispose();
      ripple1Geo.dispose();
      ripple1Mat.dispose();
      ripple2Geo.dispose();
      ripple2Mat.dispose();

      mistGeo.dispose();
      mistMat.dispose();

      renderer.dispose();

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [tier]);

  return <div ref={containerRef} className="h-full w-full" />;
}
