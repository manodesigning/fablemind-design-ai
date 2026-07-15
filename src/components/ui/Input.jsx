import { forwardRef } from 'react';
import clsx from 'clsx';

export const Input = forwardRef(({
  label,
  error,
  hint,
  className,
  containerClassName,
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  return (
    <div className={clsx('flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label className="text-sm font-medium text-text-muted">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full rounded-xl bg-card border border-border px-4 py-2.5 text-sm text-white',
            'placeholder:text-muted/50 transition-all duration-200',
            'focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            error && 'border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20',
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';
