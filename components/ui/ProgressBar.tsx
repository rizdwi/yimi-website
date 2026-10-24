'use client';

import React, { useEffect, useState, useRef } from 'react';

type ProgressBarProps = {
  percentage: number;
  height?: string;
  trackColor?: string;
  fillColor?: string;
  className?: string;
  showLabel?: boolean;
  label?: string;
};

export function ProgressBar({
  percentage,
  height = 'h-3.5',
  trackColor = 'bg-white/20',
  fillColor = 'bg-yimi-green-500',
  className = '',
  showLabel = false,
  label = 'Progres capaian',
}: ProgressBarProps) {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Clamp between 0 and 100
          const clamped = Math.min(100, Math.max(0, percentage));
          setAnimatedWidth(clamped);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [percentage]);

  return (
    <div ref={containerRef} className={`w-full ${className}`}>
      <div
        className={`w-full ${height} ${trackColor} rounded-full overflow-hidden p-0.5`}
        role="progressbar"
        aria-label={label}
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`${height} ${fillColor} rounded-full transition-all duration-1200 ease-out relative`}
          style={{ width: `${animatedWidth}%` }}
        >
          {/* Subtle sheen highlight */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/25 to-transparent rounded-full" />
        </div>
      </div>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold mt-1.5 text-neutral-500">
          <span>Tercapai {percentage}%</span>
          <span>Target 100%</span>
        </div>
      )}
    </div>
  );
}
