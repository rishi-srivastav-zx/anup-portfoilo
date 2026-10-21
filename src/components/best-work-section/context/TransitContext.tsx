"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  BEST_WORK_CONFIG,
  BestWorkConfig,
  ProjectConfig,
  TransitStationConfig,
} from '../config/bestWorkConfig';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  window.gsap = gsap;
  window.ScrollTrigger = ScrollTrigger;
}

declare global {
  interface Window {
    gsap?: any;
    ScrollTrigger?: any;
    Tone?: any;
    lucide?: any;
    stepOutToCaseStudy?: (event: React.MouseEvent | Event | null, dataIndex: number) => void;
  }
}

interface TransitContextValue {
  config: BestWorkConfig;
  transitStations: TransitStationConfig[];
  activeStationIdx: number;
  areDoorsHidden: boolean;
  // Refs for DOM elements animated by GSAP
  transitWorldRef: React.RefObject<HTMLDivElement | null>;
  transitTrainRef: React.RefObject<HTMLDivElement | null>;
  metroDoorsOverlayRef: React.RefObject<HTMLDivElement | null>;
  metroDoorLeftRef: React.RefObject<HTMLDivElement | null>;
  metroDoorRightRef: React.RefObject<HTMLDivElement | null>;
  metroDoorTextRef: React.RefObject<HTMLDivElement | null>;
  transitMapViewRef: React.RefObject<HTMLDivElement | null>;
  transitCsViewRef: React.RefObject<HTMLDivElement | null>;
  transitCsContentRef: React.RefObject<HTMLDivElement | null>;
  // Interactive actions
  triggerMetroEntrance: () => void;
  navigateTransit: (index: number) => void;
  nextStation: () => void;
  prevStation: () => void;
  stepOutToCaseStudy: (event: React.MouseEvent | Event | null, dataIndex: number) => void;
  returnToTransit: () => void;
}

const TransitContext = createContext<TransitContextValue | null>(null);

export const TransitProvider: React.FC<{
  config?: BestWorkConfig;
  children: React.ReactNode;
}> = ({ config = BEST_WORK_CONFIG, children }) => {
  const [activeStationIdx, setActiveStationIdx] = useState<number>(0);
  const [areDoorsHidden, setAreDoorsHidden] = useState<boolean>(false);

  const activeStationIdxRef = useRef<number>(0);
  activeStationIdxRef.current = activeStationIdx;

  // Element refs
  const transitWorldRef = useRef<HTMLDivElement | null>(null);
  const transitTrainRef = useRef<HTMLDivElement | null>(null);
  const metroDoorsOverlayRef = useRef<HTMLDivElement | null>(null);
  const metroDoorLeftRef = useRef<HTMLDivElement | null>(null);
  const metroDoorRightRef = useRef<HTMLDivElement | null>(null);
  const metroDoorTextRef = useRef<HTMLDivElement | null>(null);
  const transitMapViewRef = useRef<HTMLDivElement | null>(null);
  const transitCsViewRef = useRef<HTMLDivElement | null>(null);
  const transitCsContentRef = useRef<HTMLDivElement | null>(null);

  // Audio synths ref
  const audioRef = useRef<{
    initialized: boolean;
    arrivalSynth?: any;
    gearSynth?: any;
    f1MetroSynth?: any;
    hoverTickSynth?: any;
    popSynth?: any;
  }>({ initialized: false });

  // Scroll lock handler ref while case study is open
  const dissectScrollLockRef = useRef<((e: Event) => void) | null>(null);

  const transitStations = useMemo<TransitStationConfig[]>(() => {
    const { instructions: _unused, ...originStationData } = config.originStation;
    return [
      originStationData,
      ...config.projects.map((project) => ({
        ...project,
        isOrigin: false,
      })),
    ];
  }, [config]);

  const ensureMetroAudio = useCallback(async () => {
    if (audioRef.current.initialized || typeof window === 'undefined' || !window.Tone) {
      return;
    }
    try {
      const Tone = window.Tone;
      await Tone.start();

      const arrivalSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 2 },
      }).toDestination();
      arrivalSynth.volume.value = -12;

      const gearSynth = new Tone.MembraneSynth({
        pitchDecay: 0.01,
        octaves: 4,
        oscillator: { type: 'square' },
        envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.01 },
      }).toDestination();
      gearSynth.volume.value = -18;

      const f1MetroSynth = new Tone.FMSynth({
        harmonicity: 3.5,
        modulationIndex: 15,
        oscillator: { type: 'sawtooth' },
        modulation: { type: 'square' },
        envelope: { attack: 0.8, decay: 0.2, sustain: 0.8, release: 1.5 },
      }).toDestination();
      f1MetroSynth.volume.value = -18;

      const hoverTickSynth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.02, sustain: 0, release: 0.02 },
      }).toDestination();
      hoverTickSynth.volume.value = -24;

      const popSynth = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 6,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
      }).toDestination();
      popSynth.volume.value = -8;

      audioRef.current = {
        initialized: true,
        arrivalSynth,
        gearSynth,
        f1MetroSynth,
        hoverTickSynth,
        popSynth,
      };
    } catch {
      // Audio context requires user gesture
    }
  }, []);

  const lockDissectScroll = useCallback(() => {
    const csView = transitCsViewRef.current;
    const handler = (e: Event) => {
      if (csView && csView.contains(e.target as Node)) return;
      e.preventDefault();
      e.stopPropagation();
    };
    dissectScrollLockRef.current = handler;
    window.addEventListener('wheel', handler, { passive: false });
    window.addEventListener('touchmove', handler, { passive: false });
  }, []);

  const unlockDissectScroll = useCallback(() => {
    if (dissectScrollLockRef.current) {
      window.removeEventListener('wheel', dissectScrollLockRef.current);
      window.removeEventListener('touchmove', dissectScrollLockRef.current);
      dissectScrollLockRef.current = null;
    }
  }, []);

  const triggerMetroEntrance = useCallback(() => {
    ensureMetroAudio();
    const gsap = window.gsap;
    if (!gsap) {
      setAreDoorsHidden(true);
      return;
    }

    const enterBtn = document.getElementById('metro-enter-btn');
    if (enterBtn) enterBtn.style.pointerEvents = 'none';

    const tl = gsap.timeline({
      onComplete: () => {
        if (metroDoorsOverlayRef.current) {
          metroDoorsOverlayRef.current.style.display = 'none';
        }
        setAreDoorsHidden(true);
      },
    });

    tl.to('#metro-door-text', { opacity: 0, duration: 0.3 })
      .to('#metro-door-left', { x: '-100%', duration: 1.5, ease: 'power3.inOut' }, '-=0.1')
      .to('#metro-door-right', { x: '100%', duration: 1.5, ease: 'power3.inOut' }, '<');
  }, [ensureMetroAudio]);

  const navigateTransit = useCallback(
    (index: number) => {
      if (index < 0 || index >= transitStations.length) return;
      setActiveStationIdx(index);
      activeStationIdxRef.current = index;

      const targetX = -(index * 100);
      const gsap = window.gsap;
      const Tone = window.Tone;

      // Real physical device vibration (Haptics)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 50, 40, 50, 60, 50, 200]);
      }

      // Visual vibration: tight, high-frequency, multi-axis rattle
      if (gsap) {
        gsap.to('#transit-train', {
          y: 'random(-1.5, 1.5)',
          x: 'random(-0.5, 0.5)',
          rotationZ: 'random(-0.2, 0.2)',
          duration: 0.04,
          yoyo: true,
          repeat: 40,
          ease: 'power1.inOut',
          onComplete: () => {
            gsap.set('#transit-train', { y: 0, x: 0, rotationZ: 0 });
          },
        });
      }

      if (audioRef.current.initialized && Tone) {
        const { f1MetroSynth, gearSynth } = audioRef.current;
        if (f1MetroSynth) {
          f1MetroSynth.triggerAttackRelease('C3', 0.9);
          f1MetroSynth.frequency.setValueAtTime('C2', Tone.now());
          f1MetroSynth.frequency.exponentialRampToValueAtTime('C6', Tone.now() + 0.45);
          f1MetroSynth.frequency.exponentialRampToValueAtTime('C2', Tone.now() + 0.9);
        }
        if (gearSynth) {
          for (let i = 0; i < 4; i++) {
            gearSynth.triggerAttackRelease(
              'C1',
              '32n',
              Tone.now() + i * 0.2 + Math.random() * 0.1
            );
          }
        }
      }

      if (gsap && transitWorldRef.current) {
        gsap.to(transitWorldRef.current, {
          x: `${targetX}vw`,
          duration: 3.5,
          ease: 'sine.inOut',
        });
      }

      const progressText = document.getElementById('transit-progress-text');
      if (progressText) {
        progressText.innerText = `0${index + 1} / 0${transitStations.length}`;
      }

      // Step Out Button visibility
      if (gsap) {
        gsap.to('.step-out-btn', {
          opacity: 0,
          pointerEvents: 'none',
          duration: 0.3,
        });
        if (index > 0) {
          const activeBtn = document.getElementById(`step-out-btn-${index}`);
          if (activeBtn) {
            gsap.to(activeBtn, {
              opacity: 1,
              pointerEvents: 'auto',
              duration: 0.5,
              delay: 1,
            });
          }
        }
      }
    },
    [transitStations.length]
  );

  const nextStation = useCallback(() => {
    ensureMetroAudio();
    if (activeStationIdxRef.current < transitStations.length - 1) {
      navigateTransit(activeStationIdxRef.current + 1);
    }
  }, [ensureMetroAudio, navigateTransit, transitStations.length]);

  const prevStation = useCallback(() => {
    ensureMetroAudio();
    if (activeStationIdxRef.current > 0) {
      navigateTransit(activeStationIdxRef.current - 1);
    }
  }, [ensureMetroAudio, navigateTransit]);

  const stepOutToCaseStudy = useCallback(
    (event: React.MouseEvent | Event | null, dataIndex: number) => {
      if (event && 'stopPropagation' in event) {
        event.stopPropagation();
      }
      ensureMetroAudio();

      const data: ProjectConfig | undefined = config.projects[dataIndex];
      if (!data) return;

      document.body.style.overflow = 'hidden';
      lockDissectScroll();

      if (audioRef.current.initialized && audioRef.current.arrivalSynth) {
        audioRef.current.arrivalSynth.triggerAttackRelease(['E4', 'G4', 'C5'], '8n');
      }

      const bgHex = data.bg || '#F4EFE6';
      const textHex = data.text || '#051024';
      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;

      const overlay = document.createElement('div');
      overlay.id = 'step-out-overlay';
      overlay.className = 'fixed inset-0 z-[9998] transform translate-y-full';
      overlay.style.backgroundColor = bgHex;
      document.body.appendChild(overlay);

      if (!gsap) return;

      gsap.to(overlay, {
        y: '0%',
        duration: 0.55,
        ease: 'power3.inOut',
        onComplete: () => {
          const csContent = transitCsContentRef.current;
          const mapView = transitMapViewRef.current;
          const csView = transitCsViewRef.current;

          if (csContent) {
            csContent.innerHTML = data.customHTML;
            csContent.style.backgroundColor = bgHex;
            csContent.style.borderColor = textHex;
            csContent.style.boxShadow = `16px 16px 0px ${textHex}`;
          }

          if (mapView) {
            gsap.set(mapView, { height: 0, opacity: 0 });
            mapView.classList.add('hidden');
          }

          if (csView) {
            csView.classList.remove('hidden');
            gsap.set(csView, { opacity: 0, y: 20 });
          }

          gsap.to(overlay, {
            y: '-100%',
            duration: 0.55,
            ease: 'power3.inOut',
            onComplete: () => overlay.remove(),
          });

          if (csView) {
            gsap.to(csView, {
              opacity: 1,
              y: 0,
              duration: 0.45,
              delay: 0.1,
              ease: 'power3.out',
              onComplete: () => {
                if (ScrollTrigger && csContent) {
                  ScrollTrigger.refresh();
                  const revealElements = csContent.querySelectorAll(
                    '.reveal-text, .reveal-blur, .mockup-scene'
                  );
                  revealElements.forEach((el) => {
                    ScrollTrigger.create({
                      trigger: el,
                      scroller: csView,
                      start: 'top 90%',
                      toggleClass: 'is-visible',
                      once: false,
                    });
                  });
                }

                if (csContent && 'IntersectionObserver' in window) {
                  const spreadObserver = new IntersectionObserver(
                    (entries) => {
                      entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                          entry.target.classList.add('is-spread');
                          spreadObserver.unobserve(entry.target);
                        }
                      });
                    },
                    { root: csView, threshold: 0.4 }
                  );
                  csContent
                    .querySelectorAll('.spread-deck, .spread-reels')
                    .forEach((el) => spreadObserver.observe(el));
                }
              },
            });
          }
        },
      });
    },
    [config.projects, ensureMetroAudio, lockDissectScroll]
  );

  const returnToTransit = useCallback(() => {
    document.body.style.overflow = '';
    unlockDissectScroll();

    if (audioRef.current.initialized && audioRef.current.popSynth) {
      audioRef.current.popSynth.triggerAttackRelease('C4', '8n');
    }

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    const csContent = transitCsContentRef.current;
    const csView = transitCsViewRef.current;
    const mapView = transitMapViewRef.current;

    if (ScrollTrigger && csContent) {
      ScrollTrigger.getAll().forEach((st: any) => {
        if (st.trigger && csContent.contains(st.trigger)) {
          st.kill();
        }
      });
    }

    const overlay = document.createElement('div');
    overlay.id = 'step-out-overlay';
    overlay.className =
      'fixed inset-0 bg-[#F4EFE6] z-[9998] transform translate-y-full opacity-0';
    document.body.appendChild(overlay);

    if (!gsap) return;

    gsap.to(overlay, {
      y: '0%',
      opacity: 1,
      duration: 0.4,
      ease: 'power3.inOut',
      onComplete: () => {
        if (csView) csView.classList.add('hidden');
        if (csContent) csContent.innerHTML = '';

        if (mapView) {
          mapView.classList.remove('hidden');
          gsap.set(mapView, { height: '100%', opacity: 1 });
        }

        gsap.to(overlay, {
          y: '100%',
          duration: 0.5,
          ease: 'power3.inOut',
          onComplete: () => {
            overlay.remove();
            if (ScrollTrigger) ScrollTrigger.refresh();
          },
        });
      },
    });
  }, [unlockDissectScroll]);

  // Initial setup matching buildTransitSystem()
  useEffect(() => {
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
    }

    window.stepOutToCaseStudy = stepOutToCaseStudy;

    const doorText = metroDoorTextRef.current;
    if (doorText) {
      doorText.style.pointerEvents = 'auto';
      if (window.gsap) {
        window.gsap.to(doorText, { opacity: 1, duration: 0.5 });
      } else {
        doorText.style.opacity = '1';
      }
    }

    const timer = setTimeout(() => {
      navigateTransit(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [navigateTransit, stepOutToCaseStudy]);

  // Keyboard & touch swipe navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const csView = transitCsViewRef.current;
      if (csView && !csView.classList.contains('hidden')) {
        if (e.key === 'Escape') {
          returnToTransit();
        }
        return;
      }

      if (!areDoorsHidden) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerMetroEntrance();
        }
        return;
      }

      if (e.key === 'ArrowRight') {
        nextStation();
      } else if (e.key === 'ArrowLeft') {
        prevStation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [areDoorsHidden, nextStation, prevStation, returnToTransit, triggerMetroEntrance]);

  const value = useMemo<TransitContextValue>(
    () => ({
      config,
      transitStations,
      activeStationIdx,
      areDoorsHidden,
      transitWorldRef,
      transitTrainRef,
      metroDoorsOverlayRef,
      metroDoorLeftRef,
      metroDoorRightRef,
      metroDoorTextRef,
      transitMapViewRef,
      transitCsViewRef,
      transitCsContentRef,
      triggerMetroEntrance,
      navigateTransit,
      nextStation,
      prevStation,
      stepOutToCaseStudy,
      returnToTransit,
    }),
    [
      config,
      transitStations,
      activeStationIdx,
      areDoorsHidden,
      triggerMetroEntrance,
      navigateTransit,
      nextStation,
      prevStation,
      stepOutToCaseStudy,
      returnToTransit,
    ]
  );

  return <TransitContext.Provider value={value}>{children}</TransitContext.Provider>;
};

export function useTransit(): TransitContextValue {
  const ctx = useContext(TransitContext);
  if (!ctx) {
    throw new Error('useTransit must be used within a TransitProvider');
  }
  return ctx;
}
