import { useCallback, useRef } from 'react';
import { Moon, Sun } from 'lucide-react';
import { flushSync } from 'react-dom';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<'button'> {
  duration?: number;
  variant?: 'circle' | 'square' | 'triangle' | 'diamond' | 'hexagon' | 'rectangle' | 'star';
  fromCenter?: boolean;
}

function getThemeTransitionClipPaths(
  shape: string,
  cx: number,
  cy: number,
  maxRadius: number,
  vw: number,
  vh: number
): [string, string] {
  const toX = (x: number) => `${(x / vw) * 100}%`;
  const toY = (y: number) => `${(y / vh) * 100}%`;
  const point = (x: number, y: number) => `${toX(x)} ${toY(y)}`;
  const toRadius = (r: number) => `${(r / (Math.hypot(vw, vh) / Math.SQRT2)) * 100}%`;

  switch (shape) {
    case 'square': {
      const halfSide = Math.max(cx, vw - cx, cy, vh - cy) * 1.05;
      return [
        `polygon(${point(cx, cy)} ${point(cx, cy)} ${point(cx, cy)} ${point(cx, cy)})`,
        `polygon(${point(cx - halfSide, cy - halfSide)} ${point(cx + halfSide, cy - halfSide)} ${point(cx + halfSide, cy + halfSide)} ${point(cx - halfSide, cy + halfSide)})`,
      ];
    }
    case 'diamond': {
      const R = maxRadius * Math.SQRT2;
      return [
        `polygon(${point(cx, cy)} ${point(cx, cy)} ${point(cx, cy)} ${point(cx, cy)})`,
        `polygon(${point(cx, cy - R)} ${point(cx + R, cy)} ${point(cx, cy + R)} ${point(cx - R, cy)})`,
      ];
    }
    case 'circle':
    default:
      return [`circle(0% at ${point(cx, cy)})`, `circle(${toRadius(maxRadius)} at ${point(cx, cy)})`];
  }
}

export function AnimatedThemeToggler({
  className,
  duration = 450,
  variant = 'circle',
  fromCenter = false,
  ...props
}: AnimatedThemeTogglerProps) {
  const { isDark, toggleTheme: toggleAppTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isTransitioningRef = useRef(false);
  const activeAnimRef = useRef<Animation | null>(null);

  const handleToggle = useCallback(() => {
    const button = buttonRef.current;
    if (!button || isTransitioningRef.current || document.documentElement.dataset.magicuiThemeVt === 'active') {
      toggleAppTheme();
      return;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let x: number, y: number;
    if (fromCenter) {
      x = viewportWidth / 2;
      y = viewportHeight / 2;
    } else {
      const { top, left, width, height } = button.getBoundingClientRect();
      x = left + width / 2;
      y = top + height / 2;
    }
    const maxRadius = Math.hypot(Math.max(x, viewportWidth - x), Math.max(y, viewportHeight - y));

    const applyTheme = () => {
      toggleAppTheme();
    };

    if (typeof (document as any).startViewTransition !== 'function') {
      applyTheme();
      return;
    }

    const clipPath = getThemeTransitionClipPaths(variant, x, y, maxRadius, viewportWidth, viewportHeight);
    const root = document.documentElement;
    root.dataset.magicuiThemeVt = 'active';
    root.style.setProperty('--magicui-theme-toggle-vt-duration', `${duration}ms`);

    const cleanup = () => {
      isTransitioningRef.current = false;
      delete root.dataset.magicuiThemeVt;
      root.style.removeProperty('--magicui-theme-toggle-vt-duration');
      activeAnimRef.current?.cancel();
    };

    isTransitioningRef.current = true;
    const transition = (document as any).startViewTransition(() => {
      flushSync(applyTheme);
    });

    transition?.finished?.finally(cleanup).catch(() => {});
    transition?.ready
      ?.then(() => {
        const anim = document.documentElement.animate(
          { clipPath },
          {
            duration,
            easing: variant === 'star' ? 'linear' : 'ease-in-out',
            fill: 'forwards',
            pseudoElement: '::view-transition-new(root)',
          }
        );
        activeAnimRef.current = anim;
      })
      .catch(() => {});
  }, [variant, fromCenter, duration, toggleAppTheme]);

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={handleToggle}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      className={cn(
        'p-2.5 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-high',
        className
      )}
      {...props}
    >
      {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-teal-600" />}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

export default AnimatedThemeToggler;
