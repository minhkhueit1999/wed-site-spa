'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useQualityTier } from '@/infrastructure/motion/QualityTierContext';
import { Button } from '@/components/ui';

export type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'ready';

interface PhaseConfig {
  label: string;
  instruction: string;
  duration: number; // giây
  targetScale: number;
  colorHex: string;
  rgb: [number, number, number];
}

const PHASES: Record<BreathingPhase, PhaseConfig> = {
  ready: {
    label: 'Chuẩn bị',
    instruction: 'Ngồi thẳng lưng, thả lỏng vai và nhấn "Bắt đầu" để điều hòa nhịp thở.',
    duration: 0,
    targetScale: 1.0,
    colorHex: '#405C4E',
    rgb: [0.251, 0.361, 0.306],
  },
  inhale: {
    label: 'Hít vào sâu',
    instruction: 'Hít vào nhẹ nhàng bằng mũi, đón nhận luồng dưỡng khí tinh khiết.',
    duration: 4,
    targetScale: 1.45,
    colorHex: '#D99B4B',
    rgb: [0.851, 0.608, 0.294],
  },
  hold: {
    label: 'Giữ hơi tĩnh lặng',
    instruction: 'Giữ hơi thở êm dịu, lắng nghe cơ thể và cảm nhận sự thư thái.',
    duration: 7,
    targetScale: 1.45,
    colorHex: '#B8714F',
    rgb: [0.722, 0.443, 0.31],
  },
  exhale: {
    label: 'Thở ra chậm rãi',
    instruction: 'Thở ra chậm rãi qua bờ môi, giải tỏa mọi căng thẳng tích tụ.',
    duration: 8,
    targetScale: 1.0,
    colorHex: '#405C4E',
    rgb: [0.251, 0.361, 0.306],
  },
};

export function BreathingOrb3D({ className = '' }: { className?: string }) {
  const { tier, mode, isWebGLSupported } = useQualityTier();
  const [isActive, setIsActive] = React.useState(false);
  const [phase, setPhase] = React.useState<BreathingPhase>('ready');
  const [countdown, setCountdown] = React.useState(0);
  const [completedCycles, setCompletedCycles] = React.useState(0);
  const [force2D, setForce2D] = React.useState(false);

  const canvasRef = React.useRef<HTMLDivElement>(null);
  const orbMeshRef = React.useRef<THREE.Mesh | null>(null);
  const materialRef = React.useRef<THREE.MeshPhysicalMaterial | null>(null);

  const use3D = !force2D && tier >= 2 && mode !== 'reduced' && isWebGLSupported;

  // 1. Quản lý đồng hồ chu kỳ thở 4-7-8
  React.useEffect(() => {
    if (!isActive) return;

    let currentPhase: BreathingPhase = 'inhale';

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) return prev - 1;

        // Chuyển giai đoạn tiếp theo trong chu kỳ 4-7-8
        if (currentPhase === 'inhale') {
          currentPhase = 'hold';
        } else if (currentPhase === 'hold') {
          currentPhase = 'exhale';
        } else if (currentPhase === 'exhale') {
          currentPhase = 'inhale';
          setCompletedCycles((c) => c + 1);
        }

        setPhase(currentPhase);
        return PHASES[currentPhase].duration;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  const handleToggleActive = () => {
    setIsActive((prev) => {
      const next = !prev;
      if (next) {
        setPhase('inhale');
        setCountdown(PHASES.inhale.duration);
      } else {
        setPhase('ready');
        setCountdown(0);
      }
      return next;
    });
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('ready');
    setCountdown(0);
    setCompletedCycles(0);
  };

  // 2. Khởi tạo & điều khiển Three.js WebGL Orb
  React.useEffect(() => {
    if (!use3D) return;
    const container = canvasRef.current;
    if (!container || typeof window === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 3.5;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'default',
      });
    } catch {
      // Tự động hạ cấp sang chế độ 2D nếu môi trường không tạo được ngữ cảnh WebGL
      queueMicrotask(() => {
        setForce2D(true);
      });
      return;
    }
    const size = Math.min(container.clientWidth || 280, 320);
    renderer.setSize(size, size);
    renderer.setPixelRatio(
      Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2),
    );
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Ánh sáng ấm
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xfff5e6, 2.5, 10);
    pointLight.position.set(2, 3, 3);
    scene.add(pointLight);

    const backLight = new THREE.DirectionalLight(0x5b7b6a, 1.2);
    backLight.position.set(-2, -2, -2);
    scene.add(backLight);

    // Geometry quả cầu nhịp thở biến dạng sinh học
    const geometry = new THREE.SphereGeometry(0.85, 48, 48);
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(...PHASES.ready.rgb),
      roughness: 0.2,
      metalness: 0.1,
      transmission: 0.45,
      ior: 1.4,
      clearcoat: 0.6,
      transparent: true,
      opacity: 0.92,
    });
    materialRef.current = material;

    const mesh = new THREE.Mesh(geometry, material);
    orbMeshRef.current = mesh;
    scene.add(mesh);

    // Render loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Xoay nhẹ tự nhiên
      mesh.rotation.y = elapsed * 0.15;
      mesh.rotation.x = Math.sin(elapsed * 0.2) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [use3D]);

  // 3. Cập nhật kích thước & màu sắc khối cầu 3D theo giai đoạn
  React.useEffect(() => {
    if (!use3D || !orbMeshRef.current || !materialRef.current) return;

    const currentConfig = PHASES[phase];
    const targetScale = currentConfig.targetScale;
    const [r, g, b] = currentConfig.rgb;

    const mesh = orbMeshRef.current;
    const mat = materialRef.current;

    // Chuyển mượt tỷ lệ scale và màu sắc
    const startScale = mesh.scale.x;
    const startColor = mat.color.clone();
    const endColor = new THREE.Color(r, g, b);

    const startTime = performance.now();
    const durationMs = (currentConfig.duration || 1) * 1000;

    let tweenId: number;
    const tween = () => {
      const now = performance.now();
      const progress = Math.min(1, (now - startTime) / durationMs);
      const ease = 0.5 - Math.cos(progress * Math.PI) / 2;

      const curScale = startScale + (targetScale - startScale) * ease;
      mesh.scale.set(curScale, curScale, curScale);
      mat.color.lerpColors(startColor, endColor, ease);

      if (progress < 1) {
        tweenId = requestAnimationFrame(tween);
      }
    };

    tween();
    return () => cancelAnimationFrame(tweenId);
  }, [phase, use3D]);

  const currentConfig = PHASES[phase];

  return (
    <div className={`rounded-3xl border border-[#E2D9CC] bg-[#FAF7F2] p-6 shadow-md ${className}`}>
      <div className="flex items-center justify-between border-b border-[#EAE1D3] pb-3">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#2B2622]">Điều hòa nhịp thở 4-7-8</h3>
          <p className="text-xs text-[#635B54]">
            Phương pháp thư giãn hệ thần kinh đối giao cảm trước và sau trị liệu
          </p>
        </div>
        <button
          type="button"
          onClick={() => setForce2D((prev) => !prev)}
          className="rounded-full border border-[#E2D9CC] bg-white px-2.5 py-1 text-[11px] font-medium text-[#405C4E] hover:bg-[#EAE1D3]"
          title="Chuyển đổi giao diện 3D WebGL / 2D Canvas"
        >
          {use3D ? 'Chế độ: 3D' : 'Chế độ: 2D'}
        </button>
      </div>

      {/* Vùng trực quan quả cầu nhịp thở */}
      <div className="relative my-6 flex h-64 items-center justify-center">
        {use3D ? (
          <div ref={canvasRef} className="flex h-64 w-64 items-center justify-center" />
        ) : (
          <div className="relative flex h-64 w-64 items-center justify-center">
            {/* Lớp hiển thị 2D CSS/SVG tương thích cao */}
            <div
              className="rounded-full blur-2xl transition-all"
              style={{
                width: `${currentConfig.targetScale * 140}px`,
                height: `${currentConfig.targetScale * 140}px`,
                backgroundColor: currentConfig.colorHex,
                opacity: 0.25,
                transitionDuration: `${currentConfig.duration}s`,
              }}
            />
            <div
              className="absolute rounded-full border border-white/60 shadow-xl transition-all"
              style={{
                width: `${currentConfig.targetScale * 120}px`,
                height: `${currentConfig.targetScale * 120}px`,
                backgroundColor: currentConfig.colorHex,
                opacity: 0.9,
                transitionDuration: `${currentConfig.duration}s`,
              }}
            />
          </div>
        )}

        {/* Thông số đếm ngược ở trung tâm quả cầu */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center text-white drop-shadow-md">
          {isActive ? (
            <>
              <span className="font-serif text-4xl font-bold">{countdown}</span>
              <span className="text-xs font-medium tracking-wide uppercase">giây</span>
            </>
          ) : (
            <span className="text-sm font-medium text-[#FAF7F2]">Sẵn sàng</span>
          )}
        </div>
      </div>

      {/* ARIA Live Region hỗ trợ công nghệ trợ năng & người khiếm thị */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="rounded-2xl border border-[#E2D9CC] bg-white p-4 text-center"
      >
        <span
          className="inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase"
          style={{
            backgroundColor: `${currentConfig.colorHex}20`,
            color: currentConfig.colorHex,
          }}
        >
          {currentConfig.label}
        </span>
        <p className="mt-2 text-sm text-[#2B2622]">{currentConfig.instruction}</p>
        {completedCycles > 0 && (
          <p className="mt-1 text-xs text-[#635B54]">
            Đã hoàn thành: <strong className="text-[#405C4E]">{completedCycles}</strong> chu kỳ thở
          </p>
        )}
      </div>

      {/* Nút điều khiển */}
      <div className="mt-5 flex justify-center gap-3">
        <Button
          variant={isActive ? 'secondary' : 'primary'}
          onClick={handleToggleActive}
          className="min-w-[140px]"
        >
          {isActive ? 'Tạm dừng' : 'Bắt đầu thở'}
        </Button>
        {isActive && (
          <Button variant="ghost" onClick={handleReset}>
            Làm lại
          </Button>
        )}
      </div>
    </div>
  );
}
