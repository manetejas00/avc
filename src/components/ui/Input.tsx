import { forwardRef, type InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={twMerge(
        'w-full min-h-[44px] px-4 py-2.5 bg-[#08080A] border border-white/10 rounded-xl text-white text-sm placeholder:text-neutral-500 transition-all duration-200 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed',
        error && 'border-red-500/80 focus:border-red-500 focus:ring-red-500',
        className
      )}
      {...props}
    />
  );
});

export default Input;
