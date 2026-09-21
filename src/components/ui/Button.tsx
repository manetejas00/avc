import type { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'text' };

export default function Button({ variant = 'primary', className, ...props }: Props) {
  const styles = variant === 'text'
    ? 'inline-flex items-center gap-2 text-gold-secondary hover:text-gold-primary font-semibold underline-offset-4 hover:underline'
    : variant === 'secondary' ? 'btn-secondary' : 'btn-primary';
  return <button className={twMerge(styles, className)} {...props} />;
}
