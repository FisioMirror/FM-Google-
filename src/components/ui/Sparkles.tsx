/**
 * Sparkles Component - Magic UI Inspired
 * Efecto de partículas brillantes para fondos
 * Adaptado a la paleta de colores de FisioMirror
 */
import { motion, useMotionTemplate, useMotionValue, animate } from 'framer-motion';
import { useEffect, useMemo } from 'react';
import { fisioColors } from '../../lib/ui-config';

interface SparklesProps {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  particleColor?: string;
  speed?: number;
}

const DEFAULT_COLOR = fisioColors.kinetic.DEFAULT;
const DEFAULT_SPEED = 0.5;

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomPosition(width: number, height: number) {
  return {
    x: randomIntFromInterval(0, width),
    y: randomIntFromInterval(0, height),
  };
}

export function Sparkles({
  id = 'sparkles',
  className,
  background = 'transparent',
  minSize = 0.4,
  maxSize = 1.2,
  particleDensity = 80,
  particleColor = DEFAULT_COLOR,
  speed = DEFAULT_SPEED,
}: SparklesProps) {
  const width = useMotionValue(0);
  const height = useMotionValue(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      width.set(window.innerWidth);
      height.set(window.innerHeight);

      const handleResize = () => {
        width.set(window.innerWidth);
        height.set(window.innerHeight);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [width, height]);

  const particles = useMemo(() => {
    const count = Math.floor((width.get() * height.get()) / (10000 / particleDensity));
    return Array.from({ length: count }, () => ({
      id: Math.random(),
      size: randomIntFromInterval(minSize, maxSize),
      position: getRandomPosition(width.get(), height.get()),
      opacity: Math.random() * 0.6 + 0.2,
    }));
  }, [width, height, particleDensity, minSize, maxSize]);

  const sparkle = (x: number, y: number) => {
    const sparkleElement = document.createElement('div');
    sparkleElement.className = 'fixed pointer-events-none';
    sparkleElement.style.left = `${x}px`;
    sparkleElement.style.top = `${y}px`;
    sparkleElement.style.width = '4px';
    sparkleElement.style.height = '4px';
    sparkleElement.style.background = particleColor;
    sparkleElement.style.borderRadius = '50%';
    sparkleElement.style.boxShadow = `0 0 10px ${particleColor}`;
    sparkleElement.style.opacity = '0';
    document.body.appendChild(sparkleElement);

    animate(sparkleElement, { opacity: [0, 1, 0] }, { duration: 0.3 });
    setTimeout(() => sparkleElement.remove(), 300);
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      sparkle(e.clientX, e.clientY);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [particleColor]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const backgroundColor = useMotionTemplate`${background}`;

  return (
    <div
      id={id}
      className={`fixed inset-0 overflow-hidden ${className || ''}`}
      style={{ background: backgroundColor }}
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            background: particleColor,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.position.x}px`,
            top: `${particle.position.y}px`,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 2}px ${particleColor}`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            opacity: [particle.opacity, particle.opacity * 0.5, particle.opacity],
          }}
          transition={{
            duration: randomIntFromInterval(3, 6) * speed,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Mouse trail effect */}
      <motion.div
        className="absolute w-4 h-4 rounded-full pointer-events-none"
        style={{
          background: particleColor,
          boxShadow: `0 0 10px ${particleColor}`,
          opacity: 0.3,
        }}
        animate={{
          x: mouseX,
          y: mouseY,
        }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 200,
        }}
      />
    </div>
  );
}

export function SparklesCore({
  id = 'sparkles-core',
  className,
  background = 'transparent',
  minSize = 0.4,
  maxSize = 1.2,
  particleDensity = 80,
  particleColor = DEFAULT_COLOR,
}: SparklesProps) {
  return (
    <Sparkles
      id={id}
      className={className}
      background={background}
      minSize={minSize}
      maxSize={maxSize}
      particleDensity={particleDensity}
      particleColor={particleColor}
      speed={0.3}
    />
  );
}
