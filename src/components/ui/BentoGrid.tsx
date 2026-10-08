/**
 * Bento Grid Component - Magic UI Inspired
 * Layout de cuadrícula tipo "Bento Box"
 * Adaptado a la paleta de FisioMirror
 */
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { fisioColors } from '../../lib/ui-config';

interface BentoGridItem {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
  header?: ReactNode;
  content?: ReactNode;
  span?: 'col-span-1' | 'col-span-2' | 'col-span-3' | 'row-span-1' | 'row-span-2' | 'row-span-3';
  background?: string;
  onClick?: () => void;
}

interface BentoGridProps {
  items: BentoGridItem[];
  className?: string;
  gap?: string;
}

export function BentoGrid({ items, className, gap = 'gap-4' }: BentoGridProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3', gap, className)}>
      {items.map((item) => (
        <BentoCard
          key={item.id}
          title={item.title}
          description={item.description}
          icon={item.icon}
          className={item.className}
          span={item.span}
          background={item.background}
          onClick={item.onClick}
        >
          {item.header && <div className="absolute top-0 left-0 right-0 z-10">{item.header}</div>}
          {item.content}
        </BentoCard>
      ))}
    </div>
  );
}

interface BentoCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
  span?: string;
  background?: string;
  onClick?: () => void;
}

function BentoCard({
  title,
  description,
  icon,
  children,
  className,
  span,
  background,
  onClick,
}: BentoCardProps) {
  const cardClassName = cn(
    'relative group/bento overflow-hidden rounded-2xl',
    'transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl',
    'bg-gradient-to-br from-surface-container to-surface-container-lowest',
    className,
    span
  );

  const content = (
    <>
      {/* Glass overlay effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover/bento:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${fisioColors.glass.light} 0%, ${fisioColors.glass.DEFAULT} 100%)`,
          backdropFilter: 'blur(20px)',
        }}
      />

      {/* Custom background */}
      {background && (
        <div
          className="absolute inset-0"
          style={{
            background,
            opacity: 0.1,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 p-6 h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          {icon && <div className="text-primary">{icon}</div>}
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium"
          >
            {title}
          </motion.div>
        </div>

        {description && (
          <p className="text-sm text-on-surface-variant mb-4 flex-grow">{description}</p>
        )}

        <div className="flex-grow">{children}</div>
      </div>
    </>
  );

  return onClick ? (
    <motion.button
      onClick={onClick}
      className={cardClassName}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {content}
    </motion.button>
  ) : (
    <motion.div className={cardClassName}>{content}</motion.div>
  );
}

// Preset layouts
interface BentoLayoutProps {
  className?: string;
  children: ReactNode;
}

export function BentoLayout({ className, children }: BentoLayoutProps) {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {children}
    </div>
  );
}

export function BentoCardItem({
  title,
  description,
  icon,
  className,
  span,
  children,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
  span?: string;
  children?: ReactNode;
}) {
  return (
    <BentoCard
      title={title}
      description={description}
      icon={icon}
      className={className}
      span={span}
    >
      {children}
    </BentoCard>
  );
}
