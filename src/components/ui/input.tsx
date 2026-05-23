import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Additional class names */
  className?: string;
}

/**
 * Simple styled input component used across the Prowider UI.
 * Applies a dark‑mode ready look that matches the existing design system.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className = '', ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={`bg-black/50 border border-white/10 text-white placeholder:text-neutral-600 focus-visible:ring-2 focus-visible:ring-brand-accent/50 rounded-md px-3 py-2 ${className}`}
      {...props}
    />
  );
});

export default Input;
