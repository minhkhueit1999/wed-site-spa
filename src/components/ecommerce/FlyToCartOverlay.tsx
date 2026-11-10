'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCartStore } from '@/infrastructure/store/useCartStore';

export function FlyToCartOverlay() {
  const flyAnimationCount = useCartStore((state) => state.flyAnimationCount);
  const lastAddedItem = useCartStore((state) => state.lastAddedItem);
  const [animatingOrbs, setAnimatingOrbs] = useState<{ id: number; icon: string; name: string }[]>(
    [],
  );

  useEffect(() => {
    if (flyAnimationCount === 0 || !lastAddedItem) return;

    const newOrb = {
      id: Date.now() + Math.random(),
      icon:
        lastAddedItem.product.category === 'tinh-dau'
          ? '🍋'
          : lastAddedItem.product.category === 'cham-soc-co-the'
            ? '🌿'
            : lastAddedItem.product.category === 'nen-thom'
              ? '✨'
              : '🪷',
      name: lastAddedItem.product.name,
    };

    const animTimer = setTimeout(() => {
      setAnimatingOrbs((prev) => [...prev, newOrb]);
    }, 10);

    const cleanupTimer = setTimeout(() => {
      setAnimatingOrbs((prev) => prev.filter((o) => o.id !== newOrb.id));
    }, 1000);

    return () => {
      clearTimeout(animTimer);
      clearTimeout(cleanupTimer);
    };
  }, [flyAnimationCount, lastAddedItem]);

  if (animatingOrbs.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      <AnimatePresence>
        {animatingOrbs.map((orb) => (
          <motion.div
            key={orb.id}
            initial={{
              x: '50vw',
              y: '60vh',
              scale: 1.4,
              opacity: 1,
            }}
            animate={{
              // Parabolic curve
              x: ['50vw', '70vw', 'calc(100vw - 80px)'],
              y: ['60vh', '25vh', '30px'],
              scale: [1.4, 1.1, 0.4],
              opacity: [1, 0.9, 0],
            }}
            transition={{
              duration: 0.9,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="absolute flex items-center justify-center rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C68B59] p-3 text-lg shadow-2xl ring-4 ring-[#FAF7F2]/50"
            style={{
              boxShadow: '0 0 25px rgba(212, 175, 55, 0.8)',
            }}
          >
            <span>{orb.icon}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
