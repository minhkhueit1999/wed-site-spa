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
    camera.position.set(0, 0.4, 4.2);

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
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 3. Lighting: Warm natural morning sunlight & ambient spa glow
    const ambientLight = new THREE.AmbientLight(0xfff9f2, 1.8);
    scene.add(ambientLight);

    const mainSun = new THREE.DirectionalLight(0xfff3db, 3.2);
    mainSun.position.set(4, 6, 4);
    scene.add(mainSun);

    const roseGlowLight = new THREE.PointLight(0xffb3c6, 2.5, 6);
    roseGlowLight.position.set(0, 1.0, 1.2);
    scene.add(roseGlowLight);

    const emeraldRimLight = new THREE.DirectionalLight(0x6fa889, 2.0);
    emeraldRimLight.position.set(-4, -2, -3);
    scene.add(emeraldRimLight);

    // Master Group chứa Đóa Hoa Sen & Lá Thảo Mộc Spa
    const lotusSceneGroup = new THREE.Group();
    scene.add(lotusSceneGroup);

    // 4. TÁN LÁ SEN NGỌC BÍCH & NHÁNH LÁ SẢ THẢO MỘC (Herbal Leaves Base)
    // Tán lá sen lớn nâng đỡ đóa hoa (Lotus Pad)
    const leafGeo = new THREE.CircleGeometry(1.65, tier === 3 ? 36 : 22);
    const leafPos = leafGeo.getAttribute('position');
    if (leafPos) {
      const v = new THREE.Vector3();
      for (let i = 0; i < leafPos.count; i++) {
        v.fromBufferAttribute(leafPos, i);
        // Gợn sóng mép lá tự nhiên và võng nhẹ hình chiếc đĩa
        const dist = Math.sqrt(v.x * v.x + v.y * v.y);
        const wave = Math.sin(v.x * 4.0) * 0.04 + Math.cos(v.y * 4.0) * 0.04;
        v.z = -Math.pow(dist / 1.65, 2) * 0.12 + wave;
        leafPos.setXYZ(i, v.x, v.y, v.z);
      }
      leafGeo.computeVertexNormals();
    }

    const leafMat = new THREE.MeshPhysicalMaterial({
      color: 0x3d7053,
      roughness: 0.32,
      metalness: 0.08,
      clearcoat: 0.6,
      clearcoatRoughness: 0.25,
      side: THREE.DoubleSide,
    });

    const lotusLeafMesh = new THREE.Mesh(leafGeo, leafMat);
    lotusLeafMesh.rotation.x = -Math.PI / 2.15;
    lotusLeafMesh.position.set(0, -0.65, 0);
    lotusSceneGroup.add(lotusLeafMesh);

    // 2 Nhánh lá sả thảo mộc uốn cong xòe tự nhiên (Lemongrass leaves)
    const createGrassLeaf = (scaleX: number, scaleY: number, angleZ: number, posX: number) => {
      const gGeo = new THREE.CylinderGeometry(0.02, 0.08, 2.2, 10, 8, true);
      const gPos = gGeo.getAttribute('position');
      if (gPos) {
        const v = new THREE.Vector3();
        for (let i = 0; i < gPos.count; i++) {
          v.fromBufferAttribute(gPos, i);
          // Uốn cong hình chiếc lá cỏ sả
          v.z += Math.pow((v.y + 1.1) / 2.2, 2) * 0.35;
          v.x *= 1 - (v.y + 1.1) / 2.6; // Thuôn nhọn ở đầu lá
          gPos.setXYZ(i, v.x, v.y, v.z);
        }
        gGeo.computeVertexNormals();
      }
      gGeo.scale(scaleX, scaleY, 0.2);

      const gMat = new THREE.MeshStandardMaterial({
        color: 0x4f8263,
        roughness: 0.38,
        metalness: 0.05,
        side: THREE.DoubleSide,
      });

      const gMesh = new THREE.Mesh(gGeo, gMat);
      gMesh.position.set(posX, -0.62, 0.1);
      gMesh.rotation.set(0.3, 0, angleZ);
      return gMesh;
    };

    const grass1 = createGrassLeaf(1.1, 0.95, -0.7, -0.8);
    const grass2 = createGrassLeaf(1.0, 0.9, 0.65, 0.85);
    lotusSceneGroup.add(grass1);
    lotusSceneGroup.add(grass2);

    // 5. ĐÓA HOA SEN SPA NỞ RỘ RỰC RỠ (Radiant Blooming Lotus Flower)
    const lotusFlowerGroup = new THREE.Group();
    lotusFlowerGroup.position.set(0, -0.32, 0.05);
    lotusSceneGroup.add(lotusFlowerGroup);

    // Hàm tạo cánh sen hình mo cong thanh tú
    const createPetalMesh = (
      width: number,
      height: number,
      depth: number,
      material: THREE.Material,
    ) => {
      const geo = new THREE.SphereGeometry(1, 16, 14);
      geo.scale(width, height, depth);
      const pos = geo.getAttribute('position');
      if (pos) {
        const v = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
          v.fromBufferAttribute(pos, i);
          // Uốn cong cánh sen ra ngoài và vuốt nhọn đỉnh
          const t = (v.y + height) / (height * 2);
          v.z += Math.pow(t, 2) * (depth * 2.5);
          if (v.y > height * 0.2) {
            v.x *= 1 - (v.y - height * 0.2) / (height * 1.2);
          }
          pos.setXYZ(i, v.x, v.y, v.z);
        }
        geo.computeVertexNormals();
      }
      return new THREE.Mesh(geo, material);
    };

    // Vật liệu cánh sen phớt hồng ngọc sáng trong (Translucent Lotus Petal)
    const outerPetalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffd9e2,
      emissive: 0x6e2c3c,
      emissiveIntensity: 0.18,
      roughness: 0.25,
      metalness: 0.04,
      transmission: 0.32,
      thickness: 0.25,
      clearcoat: 0.65,
      clearcoatRoughness: 0.15,
      side: THREE.DoubleSide,
    });

    const midPetalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffecf0,
      emissive: 0x8a384b,
      emissiveIntensity: 0.15,
      roughness: 0.22,
      metalness: 0.04,
      transmission: 0.38,
      thickness: 0.2,
      clearcoat: 0.7,
      clearcoatRoughness: 0.12,
      side: THREE.DoubleSide,
    });

    const innerPetalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xfff5f7,
      emissive: 0xa84257,
      emissiveIntensity: 0.12,
      roughness: 0.2,
      metalness: 0.02,
      transmission: 0.42,
      thickness: 0.15,
      clearcoat: 0.75,
      clearcoatRoughness: 0.1,
      side: THREE.DoubleSide,
    });

    // Mảng lưu trữ cánh sen để tạo hiệu ứng thở hé mở (breathing petals)
    const animatedPetals: { mesh: THREE.Mesh; baseRotX: number; speedOffset: number }[] = [];

    // Tầng cánh ngoài (10 cánh lớn nở xòe 48 độ)
    const outerCount = 10;
    for (let i = 0; i < outerCount; i++) {
      const angle = (i / outerCount) * Math.PI * 2;
      const petal = createPetalMesh(0.24, 0.58, 0.06, outerPetalMaterial);
      petal.position.set(Math.cos(angle) * 0.42, -0.05, Math.sin(angle) * 0.42);
      petal.rotation.y = -angle + Math.PI / 2;
      petal.rotation.x = 0.85; // Cánh xòe rộng
      lotusFlowerGroup.add(petal);
      animatedPetals.push({ mesh: petal, baseRotX: 0.85, speedOffset: i * 0.2 });
    }

    // Tầng cánh giữa (8 cánh vừa nở 32 độ)
    const midCount = 8;
    for (let i = 0; i < midCount; i++) {
      const angle = (i / midCount) * Math.PI * 2 + 0.35;
      const petal = createPetalMesh(0.21, 0.52, 0.055, midPetalMaterial);
      petal.position.set(Math.cos(angle) * 0.26, 0.08, Math.sin(angle) * 0.26);
      petal.rotation.y = -angle + Math.PI / 2;
      petal.rotation.x = 0.52; // Cánh nghiêng vừa
      lotusFlowerGroup.add(petal);
      animatedPetals.push({ mesh: petal, baseRotX: 0.52, speedOffset: i * 0.25 });
    }

    // Tầng cánh trong (6 cánh thanh tú ôm e ấp 18 độ)
    const innerCount = 6;
    for (let i = 0; i < innerCount; i++) {
      const angle = (i / innerCount) * Math.PI * 2 + 0.65;
      const petal = createPetalMesh(0.17, 0.45, 0.05, innerPetalMaterial);
      petal.position.set(Math.cos(angle) * 0.14, 0.18, Math.sin(angle) * 0.14);
      petal.rotation.y = -angle + Math.PI / 2;
      petal.rotation.x = 0.28; // Cánh đứng hơn
      lotusFlowerGroup.add(petal);
      animatedPetals.push({ mesh: petal, baseRotX: 0.28, speedOffset: i * 0.3 });
    }

    // Gương sen & Nhụy vàng óng ánh hổ phách (Golden Amber Stamen Center)
    const centerReceptacleGeo = new THREE.CylinderGeometry(0.18, 0.12, 0.22, 20);
    const centerReceptacleMat = new THREE.MeshStandardMaterial({
      color: 0xf5b838,
      roughness: 0.25,
      metalness: 0.25,
    });
    const centerReceptacle = new THREE.Mesh(centerReceptacleGeo, centerReceptacleMat);
    centerReceptacle.position.set(0, 0.22, 0);
    lotusFlowerGroup.add(centerReceptacle);

    // Hạt sen vàng điểm trên gương sen
    const seedGeo = new THREE.SphereGeometry(0.025, 8, 8);
    const seedMat = new THREE.MeshBasicMaterial({ color: 0x6e4f16 });
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const seed = new THREE.Mesh(seedGeo, seedMat);
      seed.position.set(Math.cos(angle) * 0.09, 0.34, Math.sin(angle) * 0.09);
      lotusFlowerGroup.add(seed);
    }

    // 6. ĐĨA NƯỚC NGỌC BÍCH & GỢN SÓNG ĐỒNG TÂM (Rippling Jade Pond)
    const waterDiskGeo = new THREE.CircleGeometry(2.1, tier === 3 ? 36 : 20);
    const waterDiskMat = new THREE.MeshPhysicalMaterial({
      color: 0x477864,
      roughness: 0.08,
      metalness: 0.1,
      transmission: 0.82,
      ior: 1.333,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    });
    const waterDisk = new THREE.Mesh(waterDiskGeo, waterDiskMat);
    waterDisk.rotation.x = -Math.PI / 2;
    waterDisk.position.y = -0.72;
    lotusSceneGroup.add(waterDisk);

    // Vòng sóng nước đồng tâm co giãn nhẹ
    const ripple1Geo = new THREE.RingGeometry(1.2, 1.23, 36);
    const ripple1Mat = new THREE.MeshBasicMaterial({
      color: 0xd6ede1,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const ripple1 = new THREE.Mesh(ripple1Geo, ripple1Mat);
    ripple1.rotation.x = -Math.PI / 2;
    ripple1.position.y = -0.71;
    lotusSceneGroup.add(ripple1);

    const ripple2Geo = new THREE.RingGeometry(1.7, 1.725, 36);
    const ripple2Mat = new THREE.MeshBasicMaterial({
      color: 0xd99b4b,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
    });
    const ripple2 = new THREE.Mesh(ripple2Geo, ripple2Mat);
    ripple2.rotation.x = -Math.PI / 2;
    ripple2.position.y = -0.71;
    lotusSceneGroup.add(ripple2);

    // 7. HẠT PHẤN SEN VÀNG & LÀN SƯƠNG TINH DẦU (Golden Pollen & Morning Mist)
    const particleCount = tier === 3 ? 65 : 30;
    const particlePos = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    const particleAngles = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * 1.2;
      particlePos[i * 3 + 1] = 0.1 + Math.random() * 1.6;
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
      particleSpeeds[i] = 0.18 + Math.random() * 0.25;
      particleAngles[i] = Math.random() * Math.PI * 2;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xffebaa,
      size: 0.08,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });

    const pollenPoints = new THREE.Points(particleGeo, particleMat);
    lotusSceneGroup.add(pollenPoints);

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
          lotusSceneGroup.rotation.y = progress * Math.PI * 0.75;
          lotusSceneGroup.position.y = -progress * 0.45;
          camera.position.z = 4.2 + progress * 0.5;
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
      targetTiltY = nx * 0.3;
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

    // 10. Render Loop: Nhịp thở đóa sen & gợn sóng lan tỏa
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

      lotusSceneGroup.rotation.x = currentTiltX * 0.55;
      lotusSceneGroup.rotation.y +=
        delta * 0.14 + (currentTiltY - lotusSceneGroup.rotation.y * 0.2) * 0.03;

      // Nhịp thở bồng bềnh lơ lửng trên mặt nước (floating zen bobbing)
      lotusSceneGroup.position.y = Math.sin(elapsed * 1.3) * 0.035;

      // Cánh sen thở khẽ hé mở nhịp nhàng
      const breathVal = Math.sin(elapsed * 1.2) * 0.045;
      for (const item of animatedPetals) {
        item.mesh.rotation.x =
          item.baseRotX + breathVal + Math.sin(elapsed * 1.5 + item.speedOffset) * 0.015;
      }

      // Gợn sóng nước lan tỏa
      const r1Scale = 1 + Math.sin(elapsed * 1.6) * 0.06;
      ripple1.scale.set(r1Scale, r1Scale, 1);
      ripple1Mat.opacity = 0.3 + Math.sin(elapsed * 1.6) * 0.15;

      const r2Scale = 1 + Math.sin(elapsed * 1.6 + 1.2) * 0.08;
      ripple2.scale.set(r2Scale, r2Scale, 1);
      ripple2Mat.opacity = 0.2 + Math.sin(elapsed * 1.6 + 1.2) * 0.1;

      // Hạt phấn sen vàng bốc lên lơ lửng
      const posAttr = particleGeo.getAttribute('position') as THREE.BufferAttribute | undefined;
      if (posAttr && posAttr.array) {
        const positions = posAttr.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          const idx = i * 3;
          const currentY = positions[idx + 1];
          const currentX = positions[idx];
          const currentZ = positions[idx + 2];
          const speed = particleSpeeds[i] ?? 0.2;
          const angle = particleAngles[i] ?? 0;

          if (currentY !== undefined && currentX !== undefined && currentZ !== undefined) {
            let newY = currentY + delta * speed;
            let newX = currentX + Math.sin(elapsed * 1.8 + angle) * 0.002;
            let newZ = currentZ + Math.cos(elapsed * 1.6 + angle) * 0.002;

            if (newY > 1.8) {
              newY = 0.15;
              newX = (Math.random() - 0.5) * 0.8;
              newZ = (Math.random() - 0.5) * 0.8;
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

      leafGeo.dispose();
      leafMat.dispose();
      grass1.geometry.dispose();
      (grass1.material as THREE.Material).dispose();
      grass2.geometry.dispose();
      (grass2.material as THREE.Material).dispose();

      outerPetalMaterial.dispose();
      midPetalMaterial.dispose();
      innerPetalMaterial.dispose();
      centerReceptacleGeo.dispose();
      centerReceptacleMat.dispose();
      seedGeo.dispose();
      seedMat.dispose();

      waterDiskGeo.dispose();
      waterDiskMat.dispose();
      ripple1Geo.dispose();
      ripple1Mat.dispose();
      ripple2Geo.dispose();
      ripple2Mat.dispose();

      particleGeo.dispose();
      particleMat.dispose();

      renderer.dispose();

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [tier]);

  return <div ref={containerRef} className="h-full w-full" />;
}
