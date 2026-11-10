'use client';

import * as React from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { useQualityTier } from '@/infrastructure/motion/QualityTierContext';
import { SPRING_PRESETS } from '@/lib/motion';

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  strength?: number;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function MagneticButton({
  children,
  strength = 0.35,
  className = '',
  onClick,
  ...props
}: MagneticButtonProps) {
  const { tier, mode } = useQualityTier();
  const isReduced = tier === 1 || mode === 'reduced';

  const ref = React.useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = SPRING_PRESETS.tactile;
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isReduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) * strength;
    const distanceY = (e.clientY - centerY) * strength;

    x.set(distanceX);
    y.set(distanceY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (isReduced) {
    return (
      <button {...props} onClick={onClick} className={className}>
        {children}
      </button>
    );
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className="inline-block"
    >
      <button {...props} onClick={onClick} className={className}>
        {children}
      </button>
    </motion.div>
  );
}
