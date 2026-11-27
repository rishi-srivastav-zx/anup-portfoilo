'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import CinematicFooter from '@/components/legal/CinematicFooter';
import { enquiryService, workProjectService } from '@/api';

/**
 * CONFIGURATION CONSTANT — PORTFOLIO OWNER EMAIL
 * Replace this address with Anup Rawat's primary production/booking email if needed.
 */
export const PORTFOLIO_OWNER_EMAIL =
  process.env.NEXT_PUBLIC_PORTFOLIO_EMAIL || 'Anooprawat123123@gmail.com';

interface FormValues {
  name: string;
  phone: string;
  email: string;
  projectType: string;
  message: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  projectType?: string;
  message?: string;
}

interface EditorialFrame {
  src: string;
  alt: string;
  code: string;
}

const DEFAULT_FRAMES: [EditorialFrame, EditorialFrame, EditorialFrame] = [
  {
    src: '/images/anup_portrait.webp',
    alt: 'Anup Rawat — Director of Photography portrait',
    code: 'FR. 902 / CONTACT',
  },
  {
    src: '/images/polaroid_sunset.webp',
    alt: 'Cinematic golden hour production frame',
    code: '35MM // ST-01',
  },
  {
    src: '/landing-pages/meng-to-sketchbook/1956C3DE-266A-4B87-95D6-B5705F71403D_1_201_a.webp',
    alt: 'On-location visual storytelling still',
    code: '24FPS // ST-02',
  },
];

function scrollToTarget(targetId: string) {
  if (typeof window === 'undefined') return;
  const lenis = (window as unknown as { lenis?: { scrollTo: (t: string | number, opts?: Record<string, unknown>) => void } }).lenis;
  if (targetId === 'top') {
    if (lenis?.scrollTo) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return;
  }
  const el = document.getElementById(targetId);
  if (!el) return;
  if (lenis?.scrollTo) {
    lenis.scrollTo(`#${targetId}`, { duration: 1.1 });
  } else {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

export const ContactFooterSection: React.FC = () => {
  const [values, setValues] = useState<FormValues>({
    name: '',
    phone: '',
    email: '',
    projectType: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [frames, setFrames] = useState<[EditorialFrame, EditorialFrame, EditorialFrame]>(DEFAULT_FRAMES);
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  // Enrich the secondary film frames with live project stills when available
  useEffect(() => {
    let isMounted = true;
    workProjectService
      .getProjects()
      .then((res) => {
        if (!isMounted || !res?.success || !Array.isArray(res.data)) return;
        const withImages = res.data.filter(
          (p: { image_url?: string; imageUrl?: string }) => p?.image_url || p?.imageUrl
        );
        if (withImages.length === 0) return;

        setFrames((prev) => {
          const next: [EditorialFrame, EditorialFrame, EditorialFrame] = [...prev];
          if (withImages[0]) {
            next[1] = {
              src: withImages[0].image_url || withImages[0].imageUrl,
              alt: withImages[0].title || prev[1].alt,
              code: '35MM // REEL-01',
            };
          }
          if (withImages[1]) {
            next[2] = {
              src: withImages[1].image_url || withImages[1].imageUrl,
              alt: withImages[1].title || prev[2].alt,
              code: '24FPS // REEL-02',
            };
          }
          return next;
        });
      })
      .catch(() => {
        // Keep default existing website photographs
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!values.name.trim() || values.name.trim().length < 2) {
      nextErrors.name = 'Please enter your name (minimum 2 characters).';
    }

    const cleanedPhone = values.phone.trim();
    if (!cleanedPhone) {
      nextErrors.phone = 'Please enter your phone or WhatsApp number.';
    } else if (!/^[+\d\s().-]{7,30}$/.test(cleanedPhone)) {
      nextErrors.phone = 'Please enter a valid phone number (minimum 7 digits).';
    }

    const cleanedEmail = values.email.trim();
    if (!cleanedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail)) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!values.projectType.trim()) {
      nextErrors.projectType = 'Please specify your project type.';
    }

    return nextErrors;
  };

  const handleChange = (
    field: keyof FormValues,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const val = e.target.value;
    setValues((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (submitError) {
      setSubmitError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const data = await enquiryService.createEnquiry({
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        project_type: values.projectType.trim(),
        message: values.message.trim(),
        source: 'Editorial Contact Section',
      });

      if (!data?.success) {
        throw new Error(data?.error || data?.message || 'Unable to submit your details. Please try again.');
      }

      setIsSubmitted(true);
      setValues({
        name: '',
        phone: '',
        email: '',
        projectType: '',
        message: '',
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Failed to record details. Please try again.';
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const drawTransition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#EFE9DF] text-[#14100E] relative overflow-x-clip selection:bg-[#012CEB] selection:text-[#F7F3EC] font-sans">
      {/* Main Experimental Cinematic Editorial Contact Section */}
      <section
        aria-label="Contact Anup Rawat"
        className="relative flex-1 flex flex-col justify-between py-6 sm:py-8 lg:py-10 px-4 sm:px-8 lg:px-14 xl:px-16 overflow-x-clip"
      >
        {/* Split-tone editorial paper ground: warm off-white left, slightly deeper beige right */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[#EFE9DF]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none hidden lg:block absolute top-0 bottom-0 right-0 w-[43%] bg-[#DDD4C6]"
        />

        {/* Fine film grain overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 studio-film-grain opacity-75"
        />

        {/* Top Editorial Navigation Bar */}
        <div className="relative z-20 w-full max-w-[1480px] mx-auto flex items-center justify-between gap-2 text-[9px] sm:text-[11px] font-['DM_Mono'] tracking-[0.14em] sm:tracking-[0.18em] uppercase text-[#14100E]/80 pb-4 lg:pb-6">
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex flex-col gap-[3px] w-3.5 sm:w-4" aria-hidden="true">
              <span className="h-[1.5px] w-full bg-[#14100E]" />
              <span className="h-[1.5px] w-3/4 bg-[#14100E]" />
              <span className="h-[1.5px] w-full bg-[#14100E]" />
            </span>
            <span className="font-bold text-[#14100E]">CONTACT ME</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-8 shrink-0">
            <button
              type="button"
              onClick={() => scrollToTarget('top')}
              className="hover:text-[#012CEB] transition-colors cursor-pointer uppercase tracking-[0.14em] sm:tracking-[0.18em]"
            >
              BACK TO TOP
            </button>
            <button
              type="button"
              onClick={() => scrollToTarget('work')}
              className="hover:text-[#012CEB] transition-colors cursor-pointer uppercase tracking-[0.14em] sm:tracking-[0.18em] font-semibold"
            >
              PORTFOLIO //
            </button>
          </div>
        </div>

        {/* Side Vertical Margin Annotations (Desktop) */}
        <div
          aria-hidden="true"
          className="hidden xl:flex flex-col justify-between items-center pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-[72%] z-20 text-[10px] font-['DM_Mono'] tracking-[0.22em] uppercase text-[#14100E]/70"
        >
          <span className="[writing-mode:vertical-rl] rotate-180">CONTACT ME</span>
          <span className="[writing-mode:vertical-rl] rotate-180">BACK TO TOP</span>
        </div>
        <div
          aria-hidden="true"
          className="hidden xl:flex flex-col justify-center items-center pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 z-20 text-[10px] font-['DM_Mono'] tracking-[0.22em] uppercase text-[#14100E]/70"
        >
          <span className="[writing-mode:vertical-rl]">PORTFOLIO //</span>
        </div>

        {/* Core Asymmetric Editorial Composition */}
        <div className="relative z-10 w-full max-w-[1440px] mx-auto my-auto py-4 lg:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-4 items-center relative">
            {/* LEFT & CENTER-LEFT: OVERSIZED DISPLAY TYPOGRAPHY + BLUE CIRCLE + ANNOTATIONS */}
            <div className="lg:col-span-6 relative z-20 flex flex-col justify-center min-w-0">
              {/* Top micro metadata line */}
              <div className="flex items-center justify-between max-w-[460px] text-[9px] sm:text-[10px] font-['DM_Mono'] tracking-[0.2em] uppercase text-[#14100E]/75 mb-1.5 sm:mb-2">
                <span>FR. 902 / CONTACT</span>
                <span aria-hidden="true">&gt;</span>
                <span aria-hidden="true">→</span>
              </div>

              {/* LET'S MAKE */}
              <motion.h2
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={drawTransition}
                className="font-sans font-black uppercase text-[#14100E] leading-[0.88] tracking-[-0.045em] select-none"
              >
                <span className="relative z-20 block text-[2.75rem] sm:text-[4.5rem] md:text-[5.25rem] xl:text-[6.25rem]">
                  LET&apos;S MAKE
                </span>

                {/* SOMETHING + Electric Blue Circle */}
                <span className="relative block my-3 sm:my-4">
                  <motion.span
                    aria-hidden="true"
                    initial={shouldReduceMotion ? false : { scale: 0.85, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={drawTransition}
                    className="pointer-events-none absolute -left-1.5 sm:-left-3 top-1/2 -translate-y-1/2 w-[84px] h-[84px] sm:w-[150px] sm:h-[150px] md:w-[185px] md:h-[185px] xl:w-[235px] xl:h-[235px] rounded-full bg-[#012CEB] z-0"
                  />
                  <span className="relative z-10 inline-block text-[2.75rem] sm:text-[4.5rem] md:text-[5.25rem] xl:text-[6.25rem] text-[#14100E]">
                    SOMETHING
                  </span>
                </span>
              </motion.h2>

              {/* "EST. HERE" annotations + curved arrow */}
              <div className="relative z-20 flex items-center justify-between max-w-[520px] mt-2 sm:mt-3 mb-2 sm:mb-3 pr-4">
                <div className="flex items-center gap-1.5 text-[#012CEB] ml-16 sm:ml-40">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 32 22"
                    className="w-6 h-4 text-[#012CEB]"
                    fill="none"
                  >
                    <path
                      d="M28 19C19 15 12 10 5 4M5 4L12 5M5 4L6 11"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="font-['DM_Mono'] text-xs sm:text-sm font-medium tracking-[0.14em] uppercase">
                    EST. HERE
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 text-[#012CEB] -mt-10 mr-2">
                  <span className="font-['DM_Mono'] text-xs sm:text-sm font-medium tracking-[0.14em] uppercase">
                    EST. HERE
                  </span>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 48 26"
                    className="w-10 h-5 text-[#012CEB]"
                    fill="none"
                  >
                    <path
                      d="M3 16C17 6 33 7 44 13M44 13L38 7M44 13L37 18"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Bottom micro metadata + Availability */}
              <div className="flex flex-wrap items-center justify-between gap-2 max-w-[660px] text-[9px] sm:text-[10px] font-['DM_Mono'] tracking-[0.18em] uppercase text-[#14100E]/75 mt-2 sm:mt-4">
                <span>FR. 902 / CONTACT</span>
                <span aria-hidden="true">&gt;</span>
                <span className="font-['DM_Mono'] text-[10px] sm:text-xs font-semibold text-[#012CEB] tracking-[0.12em] uppercase inline-flex items-center gap-1">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    className="w-3.5 h-3.5"
                    fill="none"
                  >
                    <path
                      d="M15 4L5 15M5 15H12M5 15V8"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  AVAILABILITY: 2026/2027
                </span>
                <span aria-hidden="true">→</span>
              </div>

              {/* UNFORGETTABLE. (spans cleanly across left/center bottom on desktop) */}
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ ...drawTransition, delay: 0.08 }}
                className="relative z-30 mt-1 select-none"
              >
                <div className="font-sans font-black uppercase leading-[0.88] tracking-[-0.045em] text-[2.45rem] sm:text-[3.9rem] md:text-[4.65rem] xl:text-[5.75rem] lg:whitespace-nowrap">
                  <span className="text-[#14100E]">UN</span>
                  <span className="font-serif-italic italic font-normal text-[#012CEB]">FO</span>
                  <span className="text-[#14100E]">RGETTABLE</span>
                  <span className="text-[#012CEB]">.</span>
                </div>

                {/* Bottom micro film code strip */}
                <div className="flex items-center gap-8 sm:gap-16 mt-3 text-[9px] font-['DM_Mono'] tracking-[0.2em] uppercase text-[#14100E]/65">
                  <span>◄ I</span>
                  <span>R ___ 4W</span>
                </div>
              </motion.div>
            </div>

            {/* CENTER — LAYERED 2D CINEMATIC FILM FRAMES (Zero WebGL/3D) */}
            <div className="lg:col-span-2 relative z-20 flex items-center justify-center my-2 lg:my-0 lg:-ml-24 xl:-ml-28 lg:-mr-6">
              <div className="relative w-full max-w-[320px] sm:max-w-[360px] lg:w-[270px] xl:w-[310px] h-[340px] sm:h-[380px] xl:h-[420px] mx-auto">
                {/* Top-right curved blue arrow */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 36 32"
                  className="hidden sm:block absolute -top-3 right-1 w-7 h-7 text-[#012CEB] z-30"
                  fill="none"
                >
                  <path
                    d="M4 8C16 4 28 12 27 26M27 26L21 20M27 26L32 19"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Primary Vertical Film Still */}
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, rotate: -6, y: 14 }}
                  whileInView={{ opacity: 1, rotate: -3, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={drawTransition}
                  className="relative w-[205px] sm:w-[230px] xl:w-[250px] h-[290px] sm:h-[325px] xl:h-[355px] bg-[#14100E] p-2.5 sm:p-3 shadow-[0_22px_45px_rgba(20,16,14,0.28)] border border-[#14100E]"
                >
                  {/* Film top metadata */}
                  <div className="flex items-center justify-between text-[7px] font-['DM_Mono'] tracking-[0.2em] text-[#EFE9DF]/70 mb-1.5">
                    <span>[ 01 ]</span>
                    <span>{frames[0].code}</span>
                  </div>

                  {/* Photograph */}
                  <div className="relative w-full h-[calc(100%-26px)] overflow-hidden bg-[#0B0A09]">
                    <img
                      src={frames[0].src}
                      alt={frames[0].alt}
                      loading="lazy"
                      className="w-full h-full object-cover object-top"
                    />
                    {/* Fine electric-blue corner viewfinder ticks */}
                    <span aria-hidden="true" className="absolute top-2 left-2 w-3 h-3 border-t border-l border-[#012CEB]/80" />
                    <span aria-hidden="true" className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#012CEB]/80" />
                  </div>

                  {/* Film bottom code */}
                  <div className="flex items-center justify-between text-[7px] font-['DM_Mono'] tracking-[0.18em] text-[#EFE9DF]/65 mt-1">
                    <span>AR // 35MM</span>
                    <span>KODAK 5219</span>
                  </div>
                </motion.div>

                {/* Overlapping Frame 2 (Right-middle with sprocket holes & blue outline) */}
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, rotate: 4, x: 14 }}
                  whileInView={{ opacity: 1, rotate: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ ...drawTransition, delay: 0.1 }}
                  className="absolute right-0 sm:-right-3 top-[42%] w-[150px] sm:w-[170px] xl:w-[185px] bg-[#14100E] p-1.5 shadow-[0_16px_32px_rgba(20,16,14,0.32)] ring-1 ring-[#012CEB]/75 z-20"
                >
                  {/* Sprocket strip */}
                  <div aria-hidden="true" className="flex justify-between px-1 pb-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <span key={i} className="w-2 h-1.5 bg-[#EFE9DF]/85 rounded-[1px]" />
                    ))}
                  </div>
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-[#0B0A09] border border-[#012CEB]/60">
                    <img
                      src={frames[1].src}
                      alt={frames[1].alt}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-[6.5px] font-['DM_Mono'] tracking-[0.16em] text-[#EFE9DF]/70 mt-1 flex justify-between px-0.5">
                    <span>{frames[1].code}</span>
                    <span>2.39:1</span>
                  </div>
                </motion.div>

                {/* Overlapping Frame 3 (Bottom-left/center with electric-blue frame border) */}
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, rotate: -4, y: 12 }}
                  whileInView={{ opacity: 1, rotate: -1.5, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ ...drawTransition, delay: 0.16 }}
                  className="absolute left-8 sm:left-10 bottom-0 w-[145px] sm:w-[160px] xl:w-[175px] bg-[#14100E] p-1.5 shadow-[0_16px_32px_rgba(20,16,14,0.3)] outline outline-1 outline-[#012CEB] outline-offset-2 z-10"
                >
                  <div aria-hidden="true" className="flex justify-between px-1 pb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="w-2 h-1.5 bg-[#EFE9DF]/85 rounded-[1px]" />
                    ))}
                  </div>
                  <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#0B0A09]">
                    <img
                      src={frames[2].src}
                      alt={frames[2].alt}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>

                {/* Bottom-left curved blue arrow */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 46 28"
                  className="hidden sm:block absolute bottom-4 -left-10 w-10 h-6 text-[#012CEB]"
                  fill="none"
                >
                  <path
                    d="M4 4C10 18 26 22 41 18M41 18L34 13M41 18L35 24"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {/* RIGHT SIDE — OVERSIZED EDITORIAL PAPER CONTACT FORM */}
            <div className="lg:col-span-4 relative z-20 w-full max-w-xl mx-auto lg:max-w-none">
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20, rotate: 2 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={drawTransition}
                className="relative bg-[#F7F3EC] p-6 sm:p-8 xl:p-10 shadow-[0_24px_60px_rgba(20,16,14,0.14)] border border-[#14100E]/10 lg:rotate-[1deg]"
              >
                {/* Hand-drawn curved blue arrows framing the paper sheet */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 36 48"
                  className="hidden lg:block absolute left-3 top-20 w-7 h-10 text-[#012CEB] pointer-events-none"
                  fill="none"
                >
                  <path
                    d="M28 4C10 12 8 30 24 41M24 41L16 42M24 41L23 33"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <svg
                  aria-hidden="true"
                  viewBox="0 0 36 48"
                  className="hidden lg:block absolute right-4 top-[44%] w-7 h-10 text-[#012CEB] pointer-events-none"
                  fill="none"
                >
                  <path
                    d="M8 4C28 10 30 28 14 40M14 40L22 41M14 40L15 32"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <form onSubmit={handleSubmit} noValidate className="space-y-6 sm:space-y-7 relative z-10 lg:pl-4 font-sans">
                  {/* Field 1: YOUR NAME * */}
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block font-['DM_Mono'] text-xs sm:text-[13px] font-bold tracking-[0.14em] uppercase text-[#14100E] mb-1.5"
                    >
                      YOUR NAME <span className="text-[#012CEB]">*</span>
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Full name or production house"
                      value={values.name}
                      onChange={(e) => handleChange('name', e)}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'error-name' : undefined}
                      className={`w-full py-2.5 bg-transparent text-[#14100E] placeholder-[#6B625A]/45 text-sm sm:text-base rounded-none border-0 border-b-2 transition-colors duration-200 focus:outline-none ${
                        errors.name
                          ? 'border-red-600 focus:border-red-600'
                          : 'border-[#012CEB]/75 focus:border-[#012CEB]'
                      }`}
                    />
                    {errors.name && (
                      <p id="error-name" role="alert" className="mt-1.5 text-xs text-red-600 font-medium">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Field 2: YOUR EMAIL * */}
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block font-['DM_Mono'] text-xs sm:text-[13px] font-bold tracking-[0.14em] uppercase text-[#14100E] mb-1.5"
                    >
                      YOUR EMAIL <span className="text-[#012CEB]">*</span>
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="producer@studio.com"
                      value={values.email}
                      onChange={(e) => handleChange('email', e)}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? 'error-email' : undefined}
                      className={`w-full py-2.5 bg-transparent text-[#14100E] placeholder-[#6B625A]/45 text-sm sm:text-base rounded-none border-0 border-b-2 transition-colors duration-200 focus:outline-none ${
                        errors.email
                          ? 'border-red-600 focus:border-red-600'
                          : 'border-[#012CEB]/75 focus:border-[#012CEB]'
                      }`}
                    />
                    {errors.email && (
                      <p id="error-email" role="alert" className="mt-1.5 text-xs text-red-600 font-medium">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Field 3: PHONE / WHATSAPP * (Required by /api/contact/enquiry) */}
                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="block font-['DM_Mono'] text-xs sm:text-[13px] font-bold tracking-[0.14em] uppercase text-[#14100E] mb-1.5"
                    >
                      PHONE / WHATSAPP <span className="text-[#012CEB]">*</span>
                    </label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+91 98XXX XXXXX"
                      value={values.phone}
                      onChange={(e) => handleChange('phone', e)}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? 'error-phone' : undefined}
                      className={`w-full py-2.5 bg-transparent text-[#14100E] placeholder-[#6B625A]/45 text-sm sm:text-base rounded-none border-0 border-b-2 transition-colors duration-200 focus:outline-none ${
                        errors.phone
                          ? 'border-red-600 focus:border-red-600'
                          : 'border-[#012CEB]/75 focus:border-[#012CEB]'
                      }`}
                    />
                    {errors.phone && (
                      <p id="error-phone" role="alert" className="mt-1.5 text-xs text-red-600 font-medium">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Field 4: PROJECT TYPE * */}
                  <div>
                    <label
                      htmlFor="contact-project-type"
                      className="block font-['DM_Mono'] text-xs sm:text-[13px] font-bold tracking-[0.14em] uppercase text-[#14100E] mb-1.5"
                    >
                      PROJECT TYPE <span className="text-[#012CEB]">*</span>
                    </label>
                    <input
                      id="contact-project-type"
                      name="projectType"
                      type="text"
                      placeholder="Feature Film, Commercial, Music Video..."
                      value={values.projectType}
                      onChange={(e) => handleChange('projectType', e)}
                      aria-invalid={Boolean(errors.projectType)}
                      aria-describedby={errors.projectType ? 'error-project-type' : undefined}
                      className={`w-full py-2.5 bg-transparent text-[#14100E] placeholder-[#6B625A]/45 text-sm sm:text-base rounded-none border-0 border-b-2 transition-colors duration-200 focus:outline-none ${
                        errors.projectType
                          ? 'border-red-600 focus:border-red-600'
                          : 'border-[#012CEB]/75 focus:border-[#012CEB]'
                      }`}
                    />
                    {errors.projectType && (
                      <p id="error-project-type" role="alert" className="mt-1.5 text-xs text-red-600 font-medium">
                        {errors.projectType}
                      </p>
                    )}
                  </div>

                  {/* Field 5: TELL US THE STORY */}
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block font-['DM_Mono'] text-xs sm:text-[13px] font-bold tracking-[0.14em] uppercase text-[#14100E] mb-1.5"
                    >
                      TELL US THE STORY
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={3}
                      placeholder="Logline, shoot dates, locations..."
                      value={values.message}
                      onChange={(e) => handleChange('message', e)}
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? 'error-message' : undefined}
                      className={`w-full py-2 bg-transparent text-[#14100E] placeholder-[#6B625A]/45 text-sm sm:text-base rounded-none border-0 border-b-2 resize-y transition-colors duration-200 focus:outline-none ${
                        errors.message
                          ? 'border-red-600 focus:border-red-600'
                          : 'border-[#012CEB]/75 focus:border-[#012CEB]'
                      }`}
                    />
                    {errors.message && (
                      <p id="error-message" role="alert" className="mt-1.5 text-xs text-red-600 font-medium">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submission Notifications */}
                  {isSubmitted && (
                    <div className="p-3 bg-emerald-500/10 border-l-2 border-emerald-600 text-emerald-900 text-xs sm:text-sm font-medium">
                      ✓ Thank you! Your story details have been received. Anup Rawat will reach out promptly.
                    </div>
                  )}
                  {submitError && (
                    <div className="p-3 bg-red-500/10 border-l-2 border-red-600 text-red-900 text-xs sm:text-sm font-medium">
                      {submitError}
                    </div>
                  )}

                  {/* Oversized Electric-Blue Tilted SEND MESSAGE Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative w-full py-4 sm:py-5 px-6 bg-[#012CEB] hover:bg-[#0022B8] active:bg-[#001B94] text-white font-sans font-bold text-lg sm:text-2xl tracking-[0.04em] uppercase transition-all duration-200 shadow-[0_14px_32px_rgba(1,44,235,0.28)] hover:shadow-[0_18px_38px_rgba(1,44,235,0.38)] transform lg:-rotate-[2deg] hover:rotate-0 hover:-translate-y-0.5 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14100E]"
                    >
                      <span>{isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}</span>
                      <span
                        aria-hidden="true"
                        className="inline-block text-2xl sm:text-3xl leading-none transition-transform duration-200 group-hover:translate-x-1.5"
                      >
                        →
                      </span>
                      {/* Subtle 4-point editorial sparkle */}
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="w-5 h-5 text-white/35 absolute right-4 top-2.5 pointer-events-none"
                        fill="currentColor"
                      >
                        <path d="M12 2L14.2 9.8L22 12L14.2 14.2L12 22L9.8 14.2L2 12L9.8 9.8L12 2Z" />
                      </svg>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom-right editorial label */}
        <div className="relative z-20 w-full max-w-[1480px] mx-auto flex justify-end pt-4">
          <button
            type="button"
            onClick={() => scrollToTarget('work')}
            className="text-[10px] sm:text-[11px] font-['DM_Mono'] tracking-[0.18em] uppercase text-[#14100E]/75 hover:text-[#012CEB] transition-colors cursor-pointer"
          >
            PORTFOLIO //
          </button>
        </div>
      </section>

      {/* BOTTOM FOOTER — ELEGANT THEMED STRIP (CINEMATIC FOOTER) */}
      <CinematicFooter onSecretClick={() => router.push('/login-page')} />
    </div>
  );
};
