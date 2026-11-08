import React, { useEffect, useRef } from 'react';

interface SparkleTrailOverlayProps {
  /** Increments or updates timestamp whenever the player flips pancakes with the spatula */
  flipBurstTrigger?: number;
}

interface SparkleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  rotation: number;
  vRot: number;
  color: string;
  shape: 'star' | 'circle' | 'diamond';
}

const SPARKLE_PALETTE = [
  '#fde047', // Butter Yellow
  '#fbbf24', // Golden Amber
  '#34d399', // Emerald Mint
  '#ffffff', // Pure Shimmer White
  '#f59e0b', // Maple Gold
  '#38bdf8', // Sky Sparkle
];

export const SparkleTrailOverlay: React.FC<SparkleTrailOverlayProps> = ({
  flipBurstTrigger = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<SparkleParticle[]>([]);
  const lastSpawnRef = useRef<{ x: number; y: number; time: number }>({
    x: -100,
    y: -100,
    time: 0,
  });

  // Helper to push new sparkle particles
  const spawnSparklesAt = (
    x: number,
    y: number,
    count: number,
    speedMultiplier = 1,
    upwardBias = 0.4
  ) => {
    const list = particlesRef.current;
    // Cap max active particles to keep mobile 60fps effortless
    if (list.length > 220) {
      list.splice(0, count);
    }

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (0.6 + Math.random() * 2.4) * speedMultiplier;
      const shapes: Array<'star' | 'circle' | 'diamond'> = ['star', 'star', 'circle', 'diamond'];
      list.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - upwardBias,
        size: 3.5 + Math.random() * 5.5,
        alpha: 0.95,
        decay: 0.018 + Math.random() * 0.018,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.14,
        color: SPARKLE_PALETTE[Math.floor(Math.random() * SPARKLE_PALETTE.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }
  };

  // Trigger a sweeping Spatula Flip Arc of shimmering stars whenever flipBurstTrigger changes
  useEffect(() => {
    if (!flipBurstTrigger) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const centerX = width * 0.52;
    const centerY = height * 0.54;

    // Create a sweeping upward spatula flip arc over 380ms
    const steps = 12;
    const timers: number[] = [];

    for (let step = 0; step < steps; step++) {
      const timerId = window.setTimeout(() => {
        const progress = step / (steps - 1); // 0 to 1
        // Parabolic upward flip arc across the skillet
        const arcAngle = Math.PI * (0.85 - progress * 0.7);
        const radiusX = Math.min(width * 0.28, 170);
        const radiusY = Math.min(height * 0.22, 145);

        const px = centerX + Math.cos(arcAngle) * radiusX * 0.65;
        const py = centerY - Math.sin(arcAngle) * radiusY;

        // Also mirror a second arc for the second pancake being flipped
        const px2 = centerX - Math.cos(arcAngle) * radiusX * 0.65;

        spawnSparklesAt(px, py, 7, 1.9, 1.6);
        spawnSparklesAt(px2, py, 7, 1.9, 1.6);
      }, step * 30);

      timers.push(timerId);
    }

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [flipBurstTrigger]);

  // Set up pointer / touch listeners and 60fps canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    const handlePointerMove = (e: PointerEvent) => {
      const now = performance.now();
      const dx = e.clientX - lastSpawnRef.current.x;
      const dy = e.clientY - lastSpawnRef.current.y;
      const distSq = dx * dx + dy * dy;

      if (distSq > 90 || now - lastSpawnRef.current.time > 28) {
        lastSpawnRef.current = { x: e.clientX, y: e.clientY, time: now };
        spawnSparklesAt(e.clientX, e.clientY, 2, 0.85, 0.35);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      lastSpawnRef.current = { x: e.clientX, y: e.clientY, time: performance.now() };
      // Burst of sparkles on tap / click
      spawnSparklesAt(e.clientX, e.clientY, 10, 1.4, 0.8);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    let animId = 0;
    const renderLoop = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.035; // Gentle float gravity
        p.vx *= 0.98;
        p.rotation += p.vRot;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;

        const r = p.size * (0.5 + p.alpha * 0.6);

        if (p.shape === 'star') {
          // 4-point shimmering star
          ctx.beginPath();
          ctx.moveTo(0, -r * 1.45);
          ctx.quadraticCurveTo(0, 0, r * 1.45, 0);
          ctx.quadraticCurveTo(0, 0, 0, r * 1.45);
          ctx.quadraticCurveTo(0, 0, -r * 1.45, 0);
          ctx.quadraticCurveTo(0, 0, 0, -r * 1.45);
          ctx.fill();
        } else if (p.shape === 'diamond') {
          ctx.beginPath();
          ctx.moveTo(0, -r);
          ctx.lineTo(r * 0.7, 0);
          ctx.lineTo(0, r);
          ctx.lineTo(-r * 0.7, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animId = window.requestAnimationFrame(renderLoop);
    };

    animId = window.requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50 w-full h-full"
      aria-hidden="true"
    />
  );
};
