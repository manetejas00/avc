import type { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'text' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
};

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: Props) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5',
    md: 'text-sm px-5 py-2.5 min-h-[44px] gap-2',
    lg: 'text-base px-6 py-3 min-h-[48px] gap-2.5',
  }[size];

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#D4AF37] to-[#B8962E] hover:from-[#F4D675] hover:to-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20 border border-[#D4AF37]/50',
    secondary:
      'bg-[#141416] hover:bg-[#1f1f23] text-white border border-white/10 hover:border-[#D4AF37]/40 shadow-sm',
    ghost:
      'bg-transparent hover:bg-white/5 text-neutral-300 hover:text-white',
    text:
      'bg-transparent text-[#F4D675] hover:text-[#D4AF37] underline-offset-4 hover:underline p-0 min-h-0',
  }[variant];

  return (
    <button
      type={type}
      className={twMerge(baseStyles, sizeStyles, variantStyles, className)}
      {...props}
    />
  );
}
