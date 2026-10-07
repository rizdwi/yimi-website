import React from 'react';

type CardProps = {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
};

export function Card({
  children,
  className = '',
  hoverEffect = false,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-yimi-blue-50 shadow-[0_8px_24px_rgba(31,47,107,0.06)] transition-all duration-300 ${
        hoverEffect
          ? 'hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(31,47,107,0.12)] cursor-pointer'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
