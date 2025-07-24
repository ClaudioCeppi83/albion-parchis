import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: 'default' | 'steel' | 'arcane' | 'green' | 'golden';
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  variant = 'default',
  className,
  ...props
}) => {
  const baseClasses = 'w-full px-3 py-2 rounded-lg border backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900';
  
  const variants = {
    default: 'bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500 focus:border-blue-500',
    steel: 'bg-steel-900/20 border-steel-500/50 text-steel-100 placeholder-steel-400 focus:ring-steel-400 focus:border-steel-400',
    arcane: 'bg-arcane-900/20 border-arcane-500/50 text-arcane-100 placeholder-arcane-400 focus:ring-arcane-400 focus:border-arcane-400',
    green: 'bg-green-900/20 border-green-500/50 text-green-100 placeholder-green-400 focus:ring-green-400 focus:border-green-400',
    golden: 'bg-golden-900/20 border-golden-500/50 text-golden-100 placeholder-golden-400 focus:ring-golden-400 focus:border-golden-400'
  };

  const errorClasses = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';

  const classes = twMerge(
    clsx(
      baseClasses,
      variants[variant],
      errorClasses,
      className
    )
  );

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <input className={classes} {...props} />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Input;
export { Input };