import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/shared/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-[12px] text-sm font-medium font-inter transition-all duration-200 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-[#6422F2] text-white shadow-light hover:shadow-hover hover:bg-[#6422F2]/90 active:shadow-sm',
        destructive:
          'bg-[#FF3B30] text-white shadow-light hover:shadow-hover hover:bg-[#FF3B30]/90 active:shadow-sm',
        outline:
          'border border-[#D1D1D6] bg-white shadow-light hover:shadow-hover hover:bg-[#F2F2F7] hover:border-[#C7C7CC] active:shadow-sm dark:border-[#48484A] dark:bg-[#1C1C1E] dark:hover:bg-[#2C2C2E]',
        secondary:
          'bg-[#F2F2F7] text-[#1D1D1F] shadow-light hover:shadow-hover hover:bg-[#E5E5EA] active:shadow-sm dark:bg-[#2C2C2E] dark:text-[#F0EEEF] dark:hover:bg-[#3A3A3C]',
        ghost: 'hover:bg-[#F2F2F7] hover:text-[#1D1D1F] dark:hover:bg-[#2C2C2E] dark:hover:text-[#F0EEEF]',
        link: 'text-[#6422F2] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-[44px] px-5 py-[10px]',
        sm: 'h-[36px] rounded-[8px] px-4 py-[6px] text-xs',
        lg: 'h-[52px] rounded-[16px] px-8 py-[14px] text-base',
        icon: 'h-[44px] w-[44px] p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

