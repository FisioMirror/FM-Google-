import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/utils';

interface AvatarContextType {
  hasImageLoaded: boolean;
  setHasImageLoaded: (loaded: boolean) => void;
}

const AvatarContext = createContext<AvatarContextType>({
  hasImageLoaded: false,
  setHasImageLoaded: () => {},
});

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children: React.ReactNode;
}

export function Avatar({ size = 'md', className, children, ...props }: AvatarProps) {
  const [hasImageLoaded, setHasImageLoaded] = useState(false);

  const sizeClasses = {
    sm: 'size-8 text-xs',
    md: 'size-10 text-sm',
    lg: 'size-14 text-base font-bold',
    xl: 'size-16 text-lg font-bold',
  };

  return (
    <AvatarContext.Provider value={{ hasImageLoaded, setHasImageLoaded }}>
      <div
        className={cn(
          'relative inline-flex items-center justify-center rounded-2xl overflow-hidden bg-gradient-to-tr from-teal-700 via-teal-600 to-teal-400 text-white font-extrabold shadow-sm ring-2 ring-teal-500/20 select-none shrink-0',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AvatarContext.Provider>
  );
}

export function AvatarImage({ src, alt = 'Avatar', className }: { src?: string; alt?: string; className?: string }) {
  const { setHasImageLoaded } = useContext(AvatarContext);

  if (!src) return null;

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      className={cn('size-full object-cover', className)}
      onLoad={() => setHasImageLoaded(true)}
      onError={(e) => {
        setHasImageLoaded(false);
        (e.currentTarget as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}

export function AvatarFallback({ children, className }: { children: React.ReactNode; className?: string }) {
  const { hasImageLoaded } = useContext(AvatarContext);

  if (hasImageLoaded) return null;

  return (
    <span className={cn('flex items-center justify-center uppercase tracking-wider', className)}>
      {children}
    </span>
  );
}

Avatar.Image = AvatarImage;
Avatar.Fallback = AvatarFallback;

export function AvatarDemo() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2.5">
        <Avatar size="lg">
          <Avatar.Image alt="Dra. Fisioterapeuta" src="/physi.png" />
          <Avatar.Fallback>FM</Avatar.Fallback>
        </Avatar>
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">Dra. Elena Ramos</p>
          <p className="text-[11px] text-teal-600 dark:text-teal-400">Fisioterapeuta Titular</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Avatar size="md">
          <Avatar.Image alt="Paciente" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" />
          <Avatar.Fallback>CR</Avatar.Fallback>
        </Avatar>
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">Carlos Romero</p>
          <p className="text-[11px] text-slate-400">Paciente Activo • Rodilla</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Avatar size="md">
          <Avatar.Fallback>JR</Avatar.Fallback>
        </Avatar>
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">Jorge Ramírez</p>
          <p className="text-[11px] text-slate-400">Token Pendiente (Sin foto)</p>
        </div>
      </div>
    </div>
  );
}
