import React, { forwardRef } from 'react';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
  className?: string;
}

/** Simple wrapper for HTML <select> with shadcn-like API */
export const Select = ({ value, onValueChange, children, className = '' }: SelectProps) => (
  <select
    value={value}
    onChange={e => onValueChange?.(e.target.value)}
    className={`w-full rounded-md border border-white/10 bg-black/50 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50 ${className}`}
  >
    {children}
  </select>
);

interface SelectTriggerProps {
  children?: React.ReactNode;
  className?: string;
}

/** Trigger component – just renders children, kept for compatibility */
export const SelectTrigger = ({ children, className = '' }: SelectTriggerProps) => (
  <div className={`inline-flex items-center ${className}`}>{children}</div>
);

interface SelectContentProps {
  children?: React.ReactNode;
  className?: string;
}

/** Content wrapper – renders children directly */
export const SelectContent = ({ children, className = '' }: SelectContentProps) => (
  <div className={className}>{children}</div>
);

interface SelectItemProps {
  value: string;
  children?: React.ReactNode;
  className?: string;
}

/** Item component representing an option */
export const SelectItem = forwardRef<HTMLOptionElement, SelectItemProps>(
  ({ value, children, className = '' }, ref) => (
    <option ref={ref} value={value} className={className}>
      {children}
    </option>
  )
);
SelectItem.displayName = 'SelectItem';

interface SelectValueProps {
  placeholder?: string;
}

/** Value display – simply shows the selected value */
export const SelectValue = ({ placeholder }: SelectValueProps) => (
  <span className="text-neutral-500">{placeholder}</span>
);
