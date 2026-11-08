import React, { useEffect, useRef } from 'react';
import { Sparkles, Zap } from 'lucide-react';

interface FastBonusCelebrationProps {
  triggerKey: number;
}

interface FireworkSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  decay: number;
  size: number;
  isStar: boolean;
}

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  tiltAngle: number;
  tiltSpeed: number;
  alpha: number;
}

const CELEBRATION_COLORS = [
  '#fbbf24', // Golden Amber
  '#34d399', // Emerald Green
  '#38bdf8', // Sky Blue
  '#fb7185', // Coral Rose
  '#a78bfa', // Bright Violet
  '#fef08a', // Sunshine Yellow
  '#f97316', // Tangy Orange
];

export const FastBonusCelebration: React.FC<FastBonusCelebrationProps> = ({ triggerKey }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!triggerKey) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const sparks: FireworkSpark[] = [];
    const confetti: ConfettiPiece[] = [];

    // Helper to spawn a radial firework explosion at (cx, cy)
    const spawnFireworkBurst = (cx: number, cy: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.25;
        const speed = 2.5 + Math.random() * 6.8;
        const color = CELEBRATION_COLORS[Math.floor(Math.random() * CELEBRATION_COLORS.length)];
        sparks.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          color,
          alpha: 1,
          decay: 0.014 + Math.random() * 0.012,
          size: 2.5 + Math.random() * 3.5,
          isStar: i % 4 === 0,
        });
      }
    };

    // Spawn 3 staggered firework bursts across the screen
    spawnFireworkBurst(width * 0.28, height * 0.32, 38);
    spawnFireworkBurst(width * 0.72, height * 0.3, 38);
    const secondWaveTimer = window.setTimeout(() => {
      spawnFireworkBurst(width * 0.5, height * 0.24, 46);
    }, 240);

    // Spawn 65 tumbling 3D confetti ribbons bursting from the center/top
    for (let i = 0; i < 65; i++) {
      const spreadX = width * 0.5 + (Math.random() - 0.5) * (width * 0.55);
      const startY = height * 0.42 + (Math.random() - 0.5) * 80;
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
      const speed = 5 + Math.random() * 9;
      confetti.push({
        x: spreadX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        width: 7 + Math.random() * 6,
        height: 11 + Math.random() * 7,
        color: CELEBRATION_COLORS[i % CELEBRATION_COLORS.length],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        tiltAngle: Math.random() * Math.PI * 2,
        tiltSpeed: 0.1 + Math.random() * 0.15,
        alpha: 1,
      });
    }

    let animId = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Update & draw firework sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.14; // Gravity
        s.vx *= 0.97; // Air resistance
        s.alpha -= s.decay;

        if (s.alpha <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, s.alpha);
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 8;

        if (s.isStar) {
          // 4-point star sparkle
          ctx.translate(s.x, s.y);
          ctx.beginPath();
          const r = s.size * 1.6;
          ctx.moveTo(0, -r);
          ctx.quadraticCurveTo(0, 0, r, 0);
          ctx.quadraticCurveTo(0, 0, 0, r);
          ctx.quadraticCurveTo(0, 0, -r, 0);
          ctx.quadraticCurveTo(0, 0, 0, -r);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Update & draw tumbling 3D confetti ribbons
      for (let i = confetti.length - 1; i >= 0; i--) {
        const c = confetti[i];
        c.x += c.vx;
        c.y += c.vy;
        c.vy += 0.22; // Gravity
        c.vx *= 0.985;
        c.rotation += c.rotationSpeed;
        c.tiltAngle += c.tiltSpeed;
        c.alpha -= 0.009;

        if (c.alpha <= 0 || c.y > height + 30) {
          confetti.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, c.alpha);
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rotation);
        const scaleY = Math.cos(c.tiltAngle);
        ctx.scale(1, scaleY);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.width / 2, -c.height / 2, c.width, c.height);
        ctx.restore();
      }

      if (sparks.length > 0 || confetti.length > 0) {
        animId = window.requestAnimationFrame(render);
      }
    };

    animId = window.requestAnimationFrame(render);

    return () => {
      window.clearTimeout(secondWaveTimer);
      window.cancelAnimationFrame(animId);
    };
  }, [triggerKey]);

  if (!triggerKey) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-start justify-center pt-16 sm:pt-20 overflow-hidden">
      {/* Full-Screen 60fps Fireworks & Confetti Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* 2.5D Fast Bonus Floating Achievement Banner */}
      <div className="relative z-10 animate-bounce flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 text-stone-950 border-3 border-white shadow-[0_8px_0_#b45309,0_12px_30px_rgba(251,191,36,0.75)]">
        <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600 fill-rose-500 shrink-0" />
        <span className="font-display font-bold text-sm sm:text-lg tracking-wide whitespace-nowrap">
          BONUS CEPAT! +50 POIN!
        </span>
        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-800 shrink-0" />
      </div>
    </div>
  );
};
