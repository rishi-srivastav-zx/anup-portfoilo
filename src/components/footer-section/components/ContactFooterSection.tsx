'use client';

import React, { useEffect, useState } from 'react';
import { Clapperboard3D } from './Clapperboard3D';
import {
  CinematographyTakeStill,
  getCinematographyTakeStill,
} from './cinematographyTakeVisuals';

/**
 * CONFIGURATION CONSTANT — PORTFOLIO OWNER EMAIL
 * Replace this address with Anup Rawat's primary production/booking email if needed.
 */
export const PORTFOLIO_OWNER_EMAIL = 'anuprawat.baaz@gmail.com';

interface FormValues {
  name: string;
  phone: string;
  message: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  message?: string;
}

/**
 * Synthesizes a subtle, realistic wooden/acrylic clapperboard physical snap sound
 * using Web Audio API (zero external audio file dependencies).
 */
function playClapperSnapSound() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime + 0.42; // Synced with the downward hinge snap

    // Short percussive wood/acrylic transient noise burst
    const bufferSize = ctx.sampleRate * 0.065;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const env = Math.exp(-i / (ctx.sampleRate * 0.009));
      data[i] = (Math.random() * 2 - 1) * env;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1450, now);
    filter.Q.setValueAtTime(1.8, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.065);
  } catch {
    // Ignore if browser blocks audio before gesture
  }
}

export const ContactFooterSection: React.FC = () => {
  const [values, setValues] = useState<FormValues>({
    name: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isFormFocused, setIsFormFocused] = useState(false);
  const [clapCount, setClapCount] = useState(0);
  const [activeTakeStill, setActiveTakeStill] =
    useState<CinematographyTakeStill | null>(null);
  const [isShutterFlash, setIsShutterFlash] = useState(false);

  const triggerSlateClap = () => {
    const nextCount = clapCount + 1;
    setClapCount(nextCount);
    const nextStill = getCinematographyTakeStill(nextCount - 1);
    setActiveTakeStill(nextStill);
    playClapperSnapSound();

    // Brief studio strobe flash synced with the slate snap
    setIsShutterFlash(true);
  };

  useEffect(() => {
    if (!isShutterFlash) return;
    const timer = window.setTimeout(() => {
      setIsShutterFlash(false);
    }, 180);
    return () => window.clearTimeout(timer);
  }, [isShutterFlash]);

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!values.name.trim()) {
      nextErrors.name = 'Please enter your name.';
    }

    const cleanedPhone = values.phone.trim();
    if (!cleanedPhone) {
      nextErrors.phone = 'Please enter your phone number.';
    } else if (!/^[+\d\s().-]{7,20}$/.test(cleanedPhone)) {
      nextErrors.phone = 'Please enter a valid phone number.';
    }

    if (!values.message.trim()) {
      nextErrors.message = 'Please share a few details about your project.';
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
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    triggerSlateClap();

    const subject = encodeURIComponent(
      `Cinematography Inquiry — ${values.name.trim()}`
    );
    const body = encodeURIComponent(
      `Name: ${values.name.trim()}\nPhone Number: ${values.phone.trim()}\n\nProject Details:\n${values.message.trim()}`
    );

    const mailtoUri = `mailto:${PORTFOLIO_OWNER_EMAIL}?subject=${subject}&body=${body}`;
    window.location.href = mailtoUri;
  };

  const currentTakeFormatted =
    clapCount > 0 ? String(clapCount).padStart(2, '0') : '01';
  const currentSceneFormatted = activeTakeStill
    ? activeTakeStill.sceneCode
    : '24';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#E6DDD2] text-[#14100E] relative overflow-hidden selection:bg-[#14100E] selection:text-[#F4EDE4]">
      {/* Seamless ambient transition from preceding section */}
      <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-20 bg-gradient-to-b from-[#E6DDD2] to-transparent" />

      {/* Main Studio Contact Section */}
      <section
        aria-label="Contact Anup Rawat"
        className="relative flex-1 flex items-center py-16 sm:py-20 lg:py-24 px-6 sm:px-10 lg:px-16 xl:px-24 overflow-hidden"
      >
        {/* Cinematography Take Background Image Layer (Revealed when user clicks slate to mark take) */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ease-out ${
            activeTakeStill ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {activeTakeStill && (
            <img
              key={activeTakeStill.takeNumber + '-' + clapCount}
              src={activeTakeStill.dataUrl}
              alt={`Cinematography set frame — ${activeTakeStill.title}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-[1.02] transition-transform duration-700 ease-out"
            />
          )}
          {/* Cinema scrim blended with warm theme palette */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#E6DDD2]/95 via-[#E6DDD2]/75 to-[#E6DDD2]/95" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#E6DDD2] via-transparent to-[#E6DDD2]/85" />
        </div>

        {/* Subtle Studio Strobe Flash when Slate Snaps Shut */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 bg-white transition-opacity duration-150 ${
            isShutterFlash ? 'opacity-25' : 'opacity-0'
          }`}
        />

        {/* Restrained Studio Atmosphere & Film Grain */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 studio-film-grain opacity-60"
        />
        {/* Warm golden-amber top-left studio glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/4 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.08)_0%,transparent_70%)] blur-3xl"
        />
        {/* Cool electric cobalt fill glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-1/3 w-[640px] h-[640px] rounded-full bg-[radial-gradient(circle,rgba(1,44,235,0.07)_0%,transparent_72%)] blur-3xl"
        />

        {/* Subtle top studio horizon hairline */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-6 right-6 sm:left-10 sm:right-10 lg:left-16 lg:right-16 h-px bg-gradient-to-r from-transparent via-[#14100E]/15 to-transparent"
        />

        <div className="relative z-10 w-full max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-12 items-center">
            {/* LEFT COLUMN: Oversized Expressive Brush Headline + Copy */}
            <div className="lg:col-span-4 flex flex-col items-start justify-center">
              <div className="relative select-none py-2">
                {/* Vivid Cobalt / Electric Blue "Contact" */}
                <h2 className="flex flex-col leading-none">
                  <span className="font-brush text-[4.5rem] sm:text-[5.5rem] xl:text-[6.5rem] text-[#012CEB] tracking-tight drop-shadow-[0_10px_24px_rgba(1,44,235,0.22)] transform -rotate-3 inline-block">
                    Contact
                  </span>
                  {/* Dark Ink "Me" with tasteful overlap */}
                  <span className="font-brush text-[4.25rem] sm:text-[5.25rem] xl:text-[6.25rem] text-[#14100E] tracking-tight -mt-5 sm:-mt-7 xl:-mt-8 ml-14 sm:ml-20 xl:ml-24 drop-shadow-[0_4px_12px_rgba(20,16,14,0.15)] transform -rotate-1 inline-block">
                    Me
                  </span>
                </h2>

                {/* Subtle expressive brush stroke accent beneath headline */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 260 18"
                  className="w-44 sm:w-56 h-3.5 mt-1 ml-2 text-[#012CEB]/80"
                  fill="none"
                >
                  <path
                    d="M3 13.5C62 4.5 154 2.5 257 9.5"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <p className="mt-6 text-base sm:text-lg xl:text-[1.15rem] text-[#6B625A] font-normal leading-relaxed max-w-[34ch]">
                Have a story to tell? Let&apos;s make something worth watching.
              </p>
            </div>

            {/* CENTER COLUMN: Realistic 3D Film Director's Clapperboard */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center relative my-2 lg:my-0">
              <Clapperboard3D
                clapCount={clapCount}
                sceneCode={currentSceneFormatted}
                takeNumber={currentTakeFormatted}
                isFormFocused={isFormFocused}
                onSlateClick={triggerSlateClap}
              />

              {/* Interactive Slate Trigger & Quiet Unboxed Take Metadata */}
              <div className="mt-1 flex flex-col items-center gap-1.5 text-center">
                <button
                  type="button"
                  onClick={triggerSlateClap}
                  className="text-xs font-mono-slate tracking-[0.2em] uppercase text-[#14100E]/70 hover:text-[#012CEB] transition-colors duration-150 focus:outline-none focus-visible:text-[#012CEB] whitespace-nowrap shrink-0 cursor-pointer font-medium"
                >
                  {activeTakeStill
                    ? `Click slate for next take (Take ${currentTakeFormatted})`
                    : 'Click slate to mark take'}
                </button>

                {activeTakeStill && (
                  <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono-slate text-[#6B625A]">
                    <span className="text-[#012CEB] font-semibold">
                      SCENE {activeTakeStill.sceneCode} · TAKE{' '}
                      {currentTakeFormatted}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#14100E]/80">{activeTakeStill.title}</span>
                    <span aria-hidden="true">·</span>
                    <button
                      type="button"
                      onClick={() => setActiveTakeStill(null)}
                      className="text-[#6B625A] hover:text-[#14100E] underline underline-offset-4 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Clear backdrop
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN: Integrated Themed Contact Form */}
            <div className="lg:col-span-4 w-full max-w-lg mx-auto lg:max-w-none">
              <form
                onSubmit={handleSubmit}
                noValidate
                onFocus={() => setIsFormFocused(true)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setIsFormFocused(false);
                  }
                }}
                className="space-y-6"
              >
                {/* Field 1: Name */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-semibold tracking-[0.14em] uppercase text-[#6B625A] mb-2"
                  >
                    Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    value={values.name}
                    onChange={(e) => handleChange('name', e)}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'error-name' : undefined}
                    className={`w-full px-4 py-3.5 bg-[#F4EFE6]/90 hover:bg-[#F4EFE6] focus:bg-[#FFFFFF] text-[#14100E] placeholder-[#6B625A]/60 text-sm sm:text-base rounded-xl border transition-all duration-150 focus:outline-none shadow-xs ${
                      errors.name
                        ? 'border-red-500/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                        : 'border-[#14100E]/15 hover:border-[#14100E]/30 focus:border-[#012CEB] focus:ring-2 focus:ring-[#012CEB]/20'
                    }`}
                  />
                  {errors.name && (
                    <p
                      id="error-name"
                      role="alert"
                      className="mt-1.5 text-xs text-red-600 font-medium"
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Field 2: Phone Number */}
                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-xs font-semibold tracking-[0.14em] uppercase text-[#6B625A] mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="Your phone number"
                    value={values.phone}
                    onChange={(e) => handleChange('phone', e)}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? 'error-phone' : undefined}
                    className={`w-full px-4 py-3.5 bg-[#F4EFE6]/90 hover:bg-[#F4EFE6] focus:bg-[#FFFFFF] text-[#14100E] placeholder-[#6B625A]/60 text-sm sm:text-base rounded-xl border transition-all duration-150 focus:outline-none shadow-xs ${
                      errors.phone
                        ? 'border-red-500/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                        : 'border-[#14100E]/15 hover:border-[#14100E]/30 focus:border-[#012CEB] focus:ring-2 focus:ring-[#012CEB]/20'
                    }`}
                  />
                  {errors.phone && (
                    <p
                      id="error-phone"
                      role="alert"
                      className="mt-1.5 text-xs text-red-600 font-medium"
                    >
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Field 3: Message */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-semibold tracking-[0.14em] uppercase text-[#6B625A] mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    placeholder="Tell me about your project..."
                    value={values.message}
                    onChange={(e) => handleChange('message', e)}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={
                      errors.message ? 'error-message' : undefined
                    }
                    className={`w-full px-4 py-3.5 bg-[#F4EFE6]/90 hover:bg-[#F4EFE6] focus:bg-[#FFFFFF] text-[#14100E] placeholder-[#6B625A]/60 text-sm sm:text-base rounded-xl border transition-all duration-150 resize-y focus:outline-none shadow-xs ${
                      errors.message
                        ? 'border-red-500/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                        : 'border-[#14100E]/15 hover:border-[#14100E]/30 focus:border-[#012CEB] focus:ring-2 focus:ring-[#012CEB]/20'
                    }`}
                  />
                  {errors.message && (
                    <p
                      id="error-message"
                      role="alert"
                      className="mt-1.5 text-xs text-red-600 font-medium"
                    >
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit Button: Send Message ↗ */}
                <div className="pt-1">
                  <button
                    type="submit"
                    className="group relative inline-flex items-center justify-center gap-2.5 w-full sm:w-auto min-w-[200px] px-8 py-3.5 rounded-xl bg-[#14100E] hover:bg-[#012CEB] active:bg-[#0022b8] text-[#F4EDE4] font-semibold text-sm sm:text-base tracking-wide transition-all duration-200 shadow-[0_8px_24px_rgba(20,16,14,0.18)] hover:shadow-[0_10px_28px_rgba(1,44,235,0.3)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#012CEB] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Send Message</span>
                    <span
                      aria-hidden="true"
                      className="inline-block transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    >
                      ↗
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM FOOTER — ELEGANT THEMED STRIP (Zero Navigation Links) */}
      <footer
        aria-label="Site footer"
        className="w-full bg-[#DDD3C5] text-[#14100E] border-t border-[#14100E]/15 px-6 sm:px-10 lg:px-16 xl:px-24 py-10 sm:py-12"
      >
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
          {/* Left Side: Editorial Sign-Off & Copyright */}
          <div className="space-y-4">
            <div className="text-lg sm:text-xl font-medium tracking-tight text-[#14100E] leading-snug">
              <p>Thanks for stopping by.</p>
              <p className="text-[#6B625A]">Keep creating.</p>
            </div>
            <p className="text-xs sm:text-sm text-[#6B625A] font-normal">
              © 2026 Anup Rawat. All rights reserved.
            </p>
          </div>

          {/* Right Side: Handwritten Signature-Style Brand (Anup Rawat / (Baaz)) */}
          <div className="flex flex-col items-start sm:items-end select-none">
            <span className="font-signature text-4xl sm:text-5xl font-bold text-[#14100E] leading-none tracking-tight transform -rotate-2">
              Anup Rawat
            </span>
            <span className="font-signature text-2xl sm:text-3xl font-bold text-[#012CEB] leading-none mt-1 sm:mr-2 transform -rotate-1">
              (Baaz)
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
