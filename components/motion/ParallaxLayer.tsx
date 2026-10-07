'use client';

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          isDesktop: '(min-width: 768px)',
          reduce: '(prefers-reduced-motion: reduce)',
        },
        (ctx) => {
          const { isDesktop, reduce } = (ctx.conditions || {}) as {
            isDesktop: boolean;
            reduce: boolean;
          };
          if (!isDesktop || reduce || !ref.current) return;

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
        }
      );
      return () => mm.revert();
    },
    { scope: ref }
  );

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
