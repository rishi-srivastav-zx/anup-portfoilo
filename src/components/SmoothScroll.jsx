"use client";

import { useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function LenisScrollTriggerBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    if (typeof window !== 'undefined') {
      (window).lenis = lenis;
    }

    // Direct synchronization between Lenis and GSAP ScrollTrigger
    const handleScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on('scroll', handleScroll);

    // Drive Lenis directly with GSAP's ticker for synchronized frame updates
    const onTick = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(onTick);
    // Allow standard lag smoothing (500ms max lag, 33ms target) so brief main-thread pauses don't cause sudden jumpy stutters
    gsap.ticker.lagSmoothing(500, 33);

    // Refresh ScrollTrigger once Lenis has initialized and DOM metrics are settled
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      lenis.off('scroll', handleScroll);
      gsap.ticker.remove(onTick);
      clearTimeout(timer);
    };
  }, [lenis]);

  return null;
}

export default function SmoothScroll({ children }) {
  return (
    <ReactLenis
      root
      autoRaf={false}
      options={{
        lerp: 0.09,
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.2,
        syncTouch: false,
        respectReducedMotion: true,
      }}
    >
      <LenisScrollTriggerBridge />
      {children}
    </ReactLenis>
  );
}


