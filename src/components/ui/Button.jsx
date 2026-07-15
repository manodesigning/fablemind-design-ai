import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const variants = {
  primary: 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20',
  ghost: 'bg-transparent hover:bg-white/5 text-muted hover:text-white',
  danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300',
  outline: 'border border-border hover:border-primary/50 text-muted hover:text-white bg-transparent',
  secondary: 'bg-card hover:bg-card-hover text-white border border-border',
};

const sizes = {
  xs: 'px-2 py-1 text-xs gap-1',
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
};

export const Button = forwardRef(({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  loading,
  icon,
  iconOnly,
  ...props
}, ref) => {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        iconOnly && 'aspect-square !px-0',
        iconOnly && (size === 'xs' ? 'w-6' : size === 'sm' ? 'w-8' : size === 'md' ? 'w-9' : 'w-10'),
        className,
      )}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          {!iconOnly && children}
        </>
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';
