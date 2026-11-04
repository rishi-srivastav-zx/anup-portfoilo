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

    // Scroll smoothly to target hash element using Lenis
    const scrollToHashTarget = (hash, immediate = false) => {
      if (!hash || typeof document === 'undefined') return;
      const cleanId = hash.replace(/^#\/?/, '').replace('#', '');
      if (!cleanId) return;
      const el = document.getElementById(cleanId);
      if (el) {
        lenis.scrollTo(el, {
          duration: immediate ? 0.01 : 1.2,
          offset: 0,
          immediate,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }
    };

    // Refresh ScrollTrigger once Lenis has initialized and DOM metrics are settled,
    // then smoothly scroll to target hash if present in URL
    const timer1 = setTimeout(() => {
      ScrollTrigger.refresh();
      if (typeof window !== 'undefined' && window.location.hash) {
        scrollToHashTarget(window.location.hash, false);
      }
    }, 200);

    const timer2 = setTimeout(() => {
      ScrollTrigger.refresh();
      if (typeof window !== 'undefined' && window.location.hash) {
        scrollToHashTarget(window.location.hash, false);
      }
    }, 600);

    const handleHashChange = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        scrollToHashTarget(window.location.hash, false);
      }
    };
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      lenis.off('scroll', handleScroll);
      gsap.ticker.remove(onTick);
      window.removeEventListener('hashchange', handleHashChange);
      clearTimeout(timer1);
      clearTimeout(timer2);
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
