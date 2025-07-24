import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'steel' | 'arcane' | 'green' | 'golden';
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  hover = false
}) => {
  const baseClasses = 'rounded-lg border backdrop-blur-sm transition-all duration-200';
  
  const variants = {
    default: 'bg-slate-800/50 border-slate-700',
    steel: 'bg-steel-900/20 border-steel-500/30',
    arcane: 'bg-arcane-900/20 border-arcane-500/30',
    green: 'bg-green-900/20 border-green-500/30',
    golden: 'bg-golden-900/20 border-golden-500/30'
  };

  const hoverClasses = hover ? 'hover:scale-105 hover:shadow-lg cursor-pointer' : '';

  const classes = twMerge(
    clsx(
      baseClasses,
      variants[variant],
      hoverClasses,
      className
    )
  );

  return (
    <div className={classes}>
      {children}
    </div>
  );
};

export default Card;
export { Card };