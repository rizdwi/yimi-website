import React from 'react';
import Link from 'next/link';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'white';
export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = ButtonBaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonBaseProps & {
  href: string;
  target?: string;
  rel?: string;
  onClick?: () => void;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yimi-green-500 focus-visible:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none text-center';

  const sizeStyles = {
    sm: 'h-10 px-4 text-sm gap-1.5',
    md: 'h-12 px-6 text-base gap-2',
    lg: 'h-14 px-8 text-lg gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-yimi-blue-600 text-white hover:bg-yimi-blue-800 hover:-translate-y-0.5 shadow-[0_4px_14px_rgba(62,95,209,0.25)] hover:shadow-[0_8px_24px_rgba(31,47,107,0.35)]',
    secondary:
      'bg-yimi-yellow-400 text-yimi-blue-800 hover:bg-yellow-300 hover:-translate-y-0.5 font-bold shadow-[0_4px_14px_rgba(255,242,0,0.35)] hover:shadow-[0_8px_24px_rgba(255,242,0,0.45)]',
    outline:
      'border-2 border-yimi-blue-600 text-yimi-blue-600 bg-transparent hover:bg-yimi-blue-50 hover:-translate-y-0.5',
    white:
      'border-2 border-white text-white bg-transparent hover:bg-white/10 backdrop-blur-xs',
    ghost:
      'text-yimi-blue-800 bg-transparent hover:bg-yimi-blue-50',
  };

  const combinedClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  if ('href' in props && props.href) {
    const { href, target, rel, onClick } = props;
    const isExternal = href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('https://wa.me');
    
    if (isExternal) {
      return (
        <a
          href={href}
          target={target || '_blank'}
          rel={rel || 'noopener noreferrer'}
          onClick={onClick}
          className={combinedClasses}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} onClick={onClick} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  const { type = 'button', disabled, onClick } = props as ButtonAsButton;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={combinedClasses}
    >
      {children}
    </button>
  );
}
