import type { HTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export default function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={twMerge('card-premium', className)} {...props} />;
}
