import type { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export default function Card({ hoverable = false, className, ...props }: CardProps) {
  return (
    <div
      className={twMerge(
        'rounded-2xl bg-[#0E0E12] border border-white/10 p-6 text-white shadow-xl transition-all duration-300',
        hoverable &&
          'hover:border-[#D4AF37]/40 hover:shadow-2xl hover:shadow-[#D4AF37]/5 hover:-translate-y-1',
        className
      )}
      {...props}
    />
  );
}
