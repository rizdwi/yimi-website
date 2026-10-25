'use client';

import React, { useRef, useEffect } from 'react';

type ParallaxLayerProps = {
  children?: React.ReactNode;
  speed?: number;
  className?: string;
  ariaHidden?: boolean;
  /**
   * 'transform' (default): geser elemen via yPercent (GSAP).
   * 'background': geser background-position saja — kotak elemen TIDAK
   * bergerak sehingga tidak menyumbang CLS (dipakai hero: motif bintang
   * sempat jadi satu-satunya penyebab CLS 0,190 di Lighthouse).
   * Mode ini mengasumsikan background (mis. bg-star8-pattern) ada di
   * elemen ini sendiri lewat className, bukan di children.
   */
  mode?: 'transform' | 'background';
};

export function ParallaxLayer({
  children,
  speed = 0.3,
  className = '',
  ariaHidden = true,
  mode = 'transform',
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
          if (mode === 'background') {
            // Hanya background yang bergerak; kotak elemen diam -> CLS 0.
            const drift = speed * 60;
            gsap.fromTo(
              ref.current,
              { backgroundPosition: `50% ${50 - drift / 2}%` },
              {
                backgroundPosition: `50% ${50 + drift / 2}%`,
                ease: 'none',
                scrollTrigger: {
                  trigger: ref.current.parentElement || ref.current,
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: true,
                },
              }
            );
            return;
          }
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
  }, [speed, mode]);

  return (
    <div
      ref={ref}
      className={`${mode === 'background' ? '' : 'will-change-transform '}${className}`}
      aria-hidden={ariaHidden ? 'true' : undefined}
    >
      {children}
    </div>
  );
}
