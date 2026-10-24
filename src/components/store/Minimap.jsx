import React, { useEffect, useRef } from 'react';
import { CATEGORIES, shelfZ, COUNTER_XS, COUNTER_Z } from '@/lib/catalog';

const S = 4;

export default function Minimap({ playerRef }) {
  const ref = useRef(null);

  useEffect(() => {
    const g = ref.current.getContext('2d');
    const px = (x) => (x + 20) * S;
    const pz = (z) => (z + 15) * S;
    const draw = () => {
      g.clearRect(0, 0, 160, 120);
      g.fillStyle = 'rgba(255,255,255,0.85)';
      g.fillRect(0, 0, 160, 120);
      g.fillStyle = '#0B2A6F';
      CATEGORIES.forEach((_, i) => g.fillRect(px(-9), pz(shelfZ(i)) - 1.2, 18 * S, 2.4));
      COUNTER_XS.forEach((x) => g.fillRect(px(x) - 5, pz(COUNTER_Z) - 2, 10, 4));
      const { x, z, yaw } = playerRef.current || { x: 0, z: 13.5, yaw: 0 };
      g.save();
      g.translate(px(x), pz(z));
      g.rotate(-yaw);
      g.fillStyle = '#F2B84B';
      g.beginPath(); g.moveTo(0, -6); g.lineTo(4, 4); g.lineTo(-4, 4); g.closePath(); g.fill();
      g.restore();
    };
    const id = setInterval(draw, 100);
    return () => clearInterval(id);
  }, [playerRef]);

  return <canvas ref={ref} width={160} height={120} aria-label="Store minimap" className="absolute z-20 bottom-4 left-4 rounded-xl shadow-lg border border-[#0B2A6F]/10 hidden sm:block" />;
}