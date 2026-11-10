'use client';

import * as React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useQualityTier } from '@/infrastructure/motion/QualityTierContext';
import { SPRING_PRESETS } from '@/lib/motion';

interface TiltCardProps {
  children: React.ReactNode;
  maxTilt?: number;
  className?: string;
}

export function TiltCard({ children, maxTilt = 8, className = '' }: TiltCardProps) {
  const { tier, mode } = useQualityTier();
  const isReduced = tier === 1 || mode === 'reduced';

  const ref = React.useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, SPRING_PRESETS.gentle);
  const mouseY = useSpring(y, SPRING_PRESETS.gentle);

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const [glarePos, setGlarePos] = React.useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isReduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;

    x.set(nx);
    y.set(ny);

    setGlarePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      opacity: 0.15,
    });
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  if (isReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div style={{ perspective: 1000 }} className="h-full w-full">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className={`relative overflow-hidden transition-shadow duration-300 ${className}`}
      >
        {children}

        {/* Lớp phản quang (Specular Sheen Glare) di chuyển theo ánh sáng con trỏ */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(circle 240px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.6), transparent 70%)`,
          }}
        />
      </motion.div>
    </div>
  );
}
