'use client';

import * as React from 'react';
import * as THREE from 'three';
import { QualityTier } from '@/infrastructure/motion/QualityTierContext';
import { SHADER_PALETTES } from '@/lib/motion';

export type AmbientVariant = 'fluid-aurora' | 'zen-water' | 'botanical-particles' | 'calm';

interface AmbientCanvasImplProps {
  variant?: AmbientVariant;
  tier: QualityTier;
}

// GLSL Vertex Shader: Đơn giản chuyển vị trí và truyền uv
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// GLSL Fragment Shader: Simplex noise lỏng + gợn sóng con trỏ + film grain
const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform vec2 uVelocity;
  uniform vec3 uColorBase;
  uniform vec3 uColorSage;
  uniform vec3 uColorAmber;
  uniform vec3 uColorClay;
  uniform float uSpeed;
  uniform float uDistortion;
  varying vec2 vUv;

  // Simplex noise 2D
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
      dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Pseudo-random film grain
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    st.x *= uResolution.x / uResolution.y;

    float t = uTime * uSpeed;

    // Tác động gợn sóng từ con trỏ
    vec2 mouseNorm = uMouse;
    mouseNorm.x *= uResolution.x / uResolution.y;
    float mouseDist = distance(st, mouseNorm);
    float ripple = sin(mouseDist * 18.0 - t * 4.0) * exp(-mouseDist * 3.5) * length(uVelocity) * 0.15;

    // Dòng chảy Simplex 2 tầng
    vec2 q = vec2(0.0);
    q.x = snoise(st + vec2(0.0, t * 0.15));
    q.y = snoise(st + vec2(t * 0.12, 0.0));

    vec2 r = vec2(0.0);
    r.x = snoise(st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * t + ripple);
    r.y = snoise(st + 1.0 * q + vec2(8.3, 2.8) + 0.12 * t);

    float f = snoise(st + r * uDistortion);

    // Hòa trộn bảng màu Spa: Base (ngà ấm) -> Sage (xanh xô thơm) -> Amber (hổ phách) -> Clay (đất nung)
    vec3 color = mix(uColorBase, uColorSage, clamp(f * f * 2.2, 0.0, 1.0));
    color = mix(color, uColorAmber, clamp(length(q) * 0.45, 0.0, 1.0));
    color = mix(color, uColorClay, clamp(length(r.x) * 0.35, 0.0, 1.0));

    // Thêm film grain nhẹ để loại bỏ hiện tượng color banding
    float grain = (random(st * 4.0 + fract(uTime)) - 0.5) * 0.025;
    color += grain;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function AmbientCanvasImpl({ variant = 'fluid-aurora', tier }: AmbientCanvasImplProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof window === 'undefined') return;

    // Khởi tạo Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Khởi tạo Renderer với DPR thích ứng theo Tier
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        powerPreference: tier === 3 ? 'high-performance' : 'default',
        antialias: false,
        alpha: true,
        depth: false,
        stencil: false,
      });
    } catch {
      return;
    }

    const dpr = tier === 3 ? Math.min(window.devicePixelRatio || 1, 2) : 1;
    renderer.setPixelRatio(dpr);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Tạo Shader Uniforms
    const palette = SHADER_PALETTES;
    const uniforms = {
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(container.clientWidth * dpr, container.clientHeight * dpr),
      },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uVelocity: { value: new THREE.Vector2(0, 0) },
      uColorBase: { value: new THREE.Color(...palette.warmIvory.rgb) },
      uColorSage: { value: new THREE.Color(...palette.sageGreen.rgb) },
      uColorAmber: {
        value: new THREE.Color(
          variant === 'zen-water' ? palette.sageLight.rgb[0] : palette.amberGlow.rgb[0],
          variant === 'zen-water' ? palette.sageLight.rgb[1] : palette.amberGlow.rgb[1],
          variant === 'zen-water' ? palette.sageLight.rgb[2] : palette.amberGlow.rgb[2],
        ),
      },
      uColorClay: {
        value: new THREE.Color(
          variant === 'zen-water' ? palette.warmCream.rgb[0] : palette.terracotta.rgb[0],
          variant === 'zen-water' ? palette.warmCream.rgb[1] : palette.terracotta.rgb[1],
          variant === 'zen-water' ? palette.warmCream.rgb[2] : palette.terracotta.rgb[2],
        ),
      },
      uSpeed: { value: variant === 'calm' ? 0.08 : variant === 'zen-water' ? 0.12 : 0.18 },
      uDistortion: { value: variant === 'zen-water' ? 0.9 : 0.65 },
    };

    // Quad Geometry & Material
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      depthWrite: false,
      depthTest: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Tạo hệ thống hạt 3D lơ lửng nếu là Tier 3 hoặc Tier 2
    let particlesMesh: THREE.Points | null = null;
    let particleGeometry: THREE.BufferGeometry | null = null;
    let particleMaterial: THREE.PointsMaterial | null = null;

    if (tier >= 2 && variant !== 'calm') {
      const particleCount = tier === 3 ? 100 : 50;
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 2;
        positions[i + 1] = (Math.random() - 0.5) * 2;
        positions[i + 2] = Math.random() * 0.5;
      }

      particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      particleMaterial = new THREE.PointsMaterial({
        color: 0x5b7b6a,
        size: tier === 3 ? 4 : 3,
        transparent: true,
        opacity: 0.35,
        blending: THREE.NormalBlending,
      });

      particlesMesh = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particlesMesh);
    }

    // Lắng nghe chuột/vận tốc
    let targetMouseX = 0.5;
    let targetMouseY = 0.5;
    let currentMouseX = 0.5;
    let currentMouseY = 0.5;
    let velocityX = 0;
    let velocityY = 0;
    let lastTime = performance.now();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      targetMouseX = (e.clientX - rect.left) / rect.width;
      targetMouseY = 1.0 - (e.clientY - rect.top) / rect.height;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // Xử lý thay đổi kích thước cửa sổ
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      uniforms.uResolution.value.set(width * dpr, height * dpr);
    };

    window.addEventListener('resize', handleResize);

    // Lắng nghe ẩn/hiện tab để tiết kiệm GPU
    let isPaused = false;
    const handleVisibility = () => {
      isPaused = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Render Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (isPaused) return;

      const delta = clock.getDelta();
      const now = performance.now();
      const dt = Math.max(1, now - lastTime);

      // Interpolation con trỏ theo quán tính
      const lerpFactor = 0.08;
      const dx = targetMouseX - currentMouseX;
      const dy = targetMouseY - currentMouseY;
      currentMouseX += dx * lerpFactor;
      currentMouseY += dy * lerpFactor;

      velocityX = (dx / dt) * 15;
      velocityY = (dy / dt) * 15;
      lastTime = now;

      uniforms.uTime.value += delta;
      uniforms.uMouse.value.set(currentMouseX, currentMouseY);
      uniforms.uVelocity.value.set(velocityX, velocityY);

      // Chuyển động nhẹ của hạt lơ lửng
      if (particlesMesh) {
        particlesMesh.rotation.z += delta * 0.02;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Dọn dẹp GPU triệt để khi unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);

      geometry.dispose();
      material.dispose();
      if (particleGeometry) particleGeometry.dispose();
      if (particleMaterial) particleMaterial.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [variant, tier]);

  return <div ref={containerRef} className="absolute inset-0 h-full w-full" />;
}
