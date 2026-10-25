'use client';

import React, { useRef, useEffect } from 'react';

type ParallaxLayerProps = {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  ariaHidden?: boolean;
};

export function ParallaxLayer({
  children,
  speed = 0.3,
  className = '',
  ariaHidden = true,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isDesktop = window.matchMedia('(min-width: 768px)').matches;
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isDesktop || isReduced || !ref.current) return;

    let ctx: { revert: () => void } | null = null;
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ default: gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger);
        ctx = gsap.context(() => {
          if (!ref.current) return;
          gsap.to(ref.current, {
            yPercent: speed * 60,
            ease: 'none',
            scrollTrigger: {
              trigger: ref.current.parentElement || ref.current,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          });
        }, ref);
      }
    );

    return () => {
      ctx?.revert();
    };
  }, [speed]);

  return (
    <div
      ref={ref}
      className={`will-change-transform ${className}`}
      aria-hidden={ariaHidden ? 'true' : undefined}
    >
      {children}
    </div>
  );
}
