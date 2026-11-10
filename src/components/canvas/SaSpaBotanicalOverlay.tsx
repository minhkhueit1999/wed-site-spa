'use client';

import React, { useEffect, useRef } from 'react';
import { useQualityTier } from '@/infrastructure/motion/QualityTierContext';

export function SaSpaBotanicalOverlay() {
  const { tier, mode } = useQualityTier();
  const isReducedMotion = mode === 'reduced';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (tier === 1 || isReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Hạt phấn hoa vàng kim & lá sả li ti lơ lửng
    const particleCount = tier === 3 ? 24 : 12;
    interface FloatingParticle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;
      rotation: number;
      rotSpeed: number;
    }

    const particles: FloatingParticle[] = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1.2,
      speedX: (Math.random() - 0.45) * 0.4,
      speedY: -(Math.random() * 0.4 + 0.15), // Trôi nhẹ lên trên
      opacity: Math.random() * 0.4 + 0.2,
      color: Math.random() > 0.4 ? '#D4AF37' : '#8DAA72', // Vàng hoàng thổ hoặc xanh sả non
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
    }));

    // Gợn sóng nước khi di chuột
    interface Ripple {
      x: number;
      y: number;
      radius: number;
      maxRadius: number;
      opacity: number;
    }
    let ripples: Ripple[] = [];

    const handlePointerMove = (e: MouseEvent) => {
      if (Math.random() > 0.75) {
        ripples.push({
          x: e.clientX,
          y: e.clientY,
          radius: 2,
          maxRadius: Math.random() * 35 + 25,
          opacity: 0.35,
        });
      }
    };
    window.addEventListener('mousemove', handlePointerMove, { passive: true });

    let time = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.01;

      // 1. Vẽ các hạt lơ lửng
      for (const p of particles) {
        p.x += p.speedX + Math.sin(time + p.y * 0.01) * 0.2;
        p.y += p.speedY;
        p.rotation += p.rotSpeed;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;

        // Vẽ hình hạt phấn hoa hoặc mảnh lá sả elip nhỏ
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.5, p.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 2. Vẽ gợn sóng nước lan tỏa
      ripples = ripples.filter((r) => r.opacity > 0.01);
      for (const r of ripples) {
        r.radius += 0.8;
        r.opacity *= 0.96;

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#D4AF37';
        ctx.globalAlpha = r.opacity;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointerMove);
    };
  }, [tier, isReducedMotion]);

  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden" aria-hidden="true">
      {/* 1. Lớp phủ bóng nắng qua tán lá (Komorebi Swaying Leaves Shadow Overlay) */}
      <div
        className="absolute -top-[10%] -left-[10%] h-[120%] w-[120%] opacity-25 mix-blend-multiply"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 20% 20%, rgba(31, 43, 36, 0.45) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 85% 15%, rgba(42, 59, 49, 0.35) 0%, transparent 55%),
            radial-gradient(ellipse 70% 50% at 50% 90%, rgba(31, 43, 36, 0.4) 0%, transparent 65%)
          `,
          filter: 'blur(35px)',
          animation: isReducedMotion ? 'none' : 'komorebi-sway 16s ease-in-out infinite alternate',
        }}
      />

      {/* 2. Canvas hạt thảo mộc & gợn sóng nước */}
      {tier !== 1 && !isReducedMotion && (
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-60" />
      )}

      {/* 3. Làn sương thảo mộc bốc lên từ chân trang (Botanical Mist) */}
      <div
        className="pointer-events-none absolute right-0 bottom-0 left-0 h-48 opacity-40"
        style={{
          background:
            'linear-gradient(to top, rgba(250, 247, 242, 0.8) 0%, rgba(250, 247, 242, 0.2) 60%, transparent 100%)',
        }}
      />

      <style jsx global>{`
        @keyframes komorebi-sway {
          0% {
            transform: translate(0, 0) scale(1) rotate(0deg);
          }
          50% {
            transform: translate(25px, 15px) scale(1.03) rotate(1.5deg);
          }
          100% {
            transform: translate(-20px, 25px) scale(0.98) rotate(-1deg);
          }
        }
      `}</style>
    </div>
  );
}
