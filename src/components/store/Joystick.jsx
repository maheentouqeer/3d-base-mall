import React, { useRef, useState } from 'react';

export default function Joystick({ onMove }) {
  const base = useRef(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const handle = (e) => {
    const r = base.current.getBoundingClientRect();
    let dx = e.clientX - (r.left + r.width / 2);
    let dy = e.clientY - (r.top + r.height / 2);
    const max = r.width / 2 - 16;
    const len = Math.hypot(dx, dy);
    if (len > max) { dx = (dx / len) * max; dy = (dy / len) * max; }
    setKnob({ x: dx, y: dy });
    onMove(dx / max, dy / max);
  };
  const end = () => { setKnob({ x: 0, y: 0 }); onMove(0, 0); };

  return (
    <div
      ref={base}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); handle(e); }}
      onPointerMove={(e) => { if (e.buttons || e.pointerType === 'touch') handle(e); }}
      onPointerUp={end}
      onPointerCancel={end}
      style={{ touchAction: 'none' }}
      className="absolute z-20 bottom-6 left-6 w-28 h-28 rounded-full bg-white/50 backdrop-blur border border-[#0B2A6F]/20 sm:hidden"
    >
      <div className="absolute w-12 h-12 rounded-full bg-[#0B2A6F] left-1/2 top-1/2 -ml-6 -mt-6 shadow-lg" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
    </div>
  );
}