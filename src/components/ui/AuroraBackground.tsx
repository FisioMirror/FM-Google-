/**
 * Aurora Background Component
 * Fondo animado tipo aurora boreal
 * Adaptado a la paleta de FisioMirror
 */
import { motion, useMotionTemplate, useMotionValue, animate } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { fisioColors } from '../../lib/ui-config';

interface AuroraBackgroundProps {
  className?: string;
  colors?: string[];
  speed?: number;
  opacity?: number;
}

const DEFAULT_COLORS = [
  fisioColors.primary[700],
  fisioColors.secondary[400],
  fisioColors.kinetic.DEFAULT,
];

export function AuroraBackground({
  className,
  colors = DEFAULT_COLORS,
  speed = 0.5,
  opacity = 0.15,
}: AuroraBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = container.offsetWidth;
    let height = container.offsetHeight;

    canvas.width = width;
    canvas.height = height;

    // Aurora effect parameters
    const waves: { x: number; y: number; length: number; amplitude: number; frequency: number; color: string }[] = [
      { x: 0, y: height / 2, length: width * 1.5, amplitude: height / 4, frequency: 0.01, color: colors[0] },
      { x: 0, y: height / 2 + 20, length: width * 1.5, amplitude: height / 6, frequency: 0.015, color: colors[1] },
      { x: 0, y: height / 2 - 20, length: width * 1.5, amplitude: height / 8, frequency: 0.02, color: colors[2] },
    ];

    function drawAurora() {
      ctx.clearRect(0, 0, width, height);

      waves.forEach((wave, index) => {
        ctx.beginPath();
        ctx.moveTo(0, height / 2);

        for (let x = 0; x < width; x += 5) {
          const y = wave.y + Math.sin(x * wave.frequency + wave.x) * wave.amplitude * (1 - x / width);
          ctx.lineTo(x, y);
        }

        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = opacity * (index + 1) / waves.length;
        ctx.stroke();

        ctx.globalAlpha = opacity * 0.3 * (index + 1) / waves.length;
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = wave.color;
        ctx.fill();

        ctx.globalAlpha = 1;
      });

      // Update wave positions for animation
      waves.forEach((wave) => {
        wave.x += 0.005 * speed;
      });

      requestAnimationFrame(drawAurora);
    }

    drawAurora();

    const handleResize = () => {
      width = container.offsetWidth;
      height = container.offsetHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [colors, speed, opacity]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 overflow-hidden ${className || ''}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
        style={{ opacity }}
      />
    </div>
  );
}

// Versión simplificada con CSS gradients
export function AuroraBackgroundCSS({
  className,
  opacity = 0.15,
}: { className?: string; opacity?: number }) {
  return (
    <div
      className={`fixed inset-0 overflow-hidden ${className || ''}`}
      style={{
        background: `linear-gradient(135deg, ${fisioColors.gradients.aurora.teal} 0%, ${fisioColors.gradients.aurora.blue} 50%, ${fisioColors.gradients.aurora.mixed} 100%)`,
        opacity,
      }}
    />
  );
}
