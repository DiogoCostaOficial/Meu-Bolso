import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from "~/components/ui/Button";


const Button = React.forwardRef(({ 
  className, 
  variant = 'default', 
  size = 'default', 
  children, 
  ...props 
}, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none",
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'default',
          'bg-red-600 text-white hover:bg-red-700': variant === 'destructive',
          'border border-gray-300 hover:bg-gray-100': variant === 'outline',
          'hover:bg-gray-100': variant === 'ghost',
        },
        {
          'h-10 py-2 px-4': size === 'default',
          'h-9 px-3 rounded-md': size === 'sm',
          'h-11 px-8 rounded-md': size === 'lg',
        },
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
