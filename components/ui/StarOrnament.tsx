import React from 'react';

type StarOrnamentProps = {
  size?: number;
  className?: string;
  color?: string;
  accentColor?: string;
};

export function StarOrnament({
  size = 32,
  className = '',
  color = '#3E5FD1',
  accentColor = '#2EE05A',
}: StarOrnamentProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block select-none ${className}`}
      aria-hidden="true"
    >
      {/* 8-pointed star (two overlapping rounded squares) */}
      <rect x="8" y="8" width="24" height="24" rx="3" fill={color} opacity="0.15" />
      <rect
        x="8"
        y="8"
        width="24"
        height="24"
        rx="3"
        transform="rotate(45 20 20)"
        fill={color}
        opacity="0.15"
      />
      <rect x="8" y="8" width="24" height="24" rx="3" stroke={color} strokeWidth="1.5" />
      <rect
        x="8"
        y="8"
        width="24"
        height="24"
        rx="3"
        transform="rotate(45 20 20)"
        stroke={color}
        strokeWidth="1.5"
      />
      {/* Center dot / ring */}
      <circle cx="20" cy="20" r="4.5" fill={accentColor} />
      <circle cx="20" cy="20" r="2" fill="#FFFFFF" />
    </svg>
  );
}
