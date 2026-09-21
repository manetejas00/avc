import type { InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

export default function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={twMerge('field-premium', className)} {...props} />;
}
