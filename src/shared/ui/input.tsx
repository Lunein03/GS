import * as React from 'react';

import { cn } from '@/shared/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-[44px] w-full rounded-[8px] border border-[#D1D1D6] bg-white px-4 py-3 text-sm font-inter text-[#1D1D1F] shadow-light transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#1D1D1F] placeholder:text-[#86868B] hover:shadow-hover focus:border-[#6422F2] focus:shadow-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#6422F2] disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F2F2F7] dark:border-[#48484A] dark:bg-[#1C1C1E] dark:text-[#F0EEEF] dark:placeholder:text-[#98989D] dark:disabled:bg-[#2C2C2E] dark:focus:border-[#6422F2]',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };

