'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Camera,
  Film,
  Sparkles,
} from 'lucide-react';

interface ContactCtaSectionProps {
  onNavigate?: (path: string) => void;
}

export default function ContactCtaSection({ onNavigate }: ContactCtaSectionProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
      return;
    }
    if (path === '/' || path === '/home' || path.startsWith('/#')) {
      window.location.href = path === '/' ? '/#home' : path;
      return;
    }
    if (path === '/about' || path === '/work' || path === '/visuals' || path === '/contact') {
      window.location.href = `/#${path.replace('/', '')}`;
      return;
    }
    router.push(path);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone.trim();

    if (!trimmedName || trimmedName.length < 2) {
      errors.name = 'Full name is compulsory (minimum 2 characters).';
    }

    if (!trimmedPhone || !/^[+\d\s().-]{7,30}$/.test(trimmedPhone)) {
      errors.phone = 'Phone or WhatsApp number is compulsory (minimum 7 digits).';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          message: formData.message.trim(),
          source: 'Contact CTA Section',
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Unable to submit your details. Please try again.');
      }

      setIsSubmitted(true);
      setFormData({
        name: '',
        phone: '',
        message: '',
      });
      setFieldErrors({});
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'A network or server error occurred. Please try again or email Anooprawat123123@gmail.com directly.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  return (
    <section
      aria-labelledby="cinematic-contact-cta-heading"
      className="border-t border-[#14100E]/15 bg-[#E6DDD2] text-[#14100E] relative overflow-hidden"
    >
      {/* Subtle background ambient grain & optical glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 right-1/4 w-96 h-96 bg-[#C5A059]/5 rounded-full blur-3xl pointer-events-none"
      />

      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-16 items-start">
          
          {/* ================= LEFT COLUMN ================= */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* Category / Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14100E]/5 border border-[#14100E]/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse" />
              <p className="text-[11px] font-mono-tech tracking-widest text-[#14100E]/80 uppercase font-semibold">
                Collaboration &amp; Direction of Photography
              </p>
            </div>

            {/* Heading */}
            <h2
              id="cinematic-contact-cta-heading"
              className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#14100E] tracking-tight leading-[1.12]"
              style={{ textWrap: 'balance' }}
            >
              Have a story worth bringing to life?
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-[#6B625A] leading-relaxed">
              Available for narrative features, short films, commercial campaigns, and visual
              storytelling collaborations. Directors, producers, agencies, and production teams are
              invited to share scripts, treatments, or shooting schedules for upcoming projects.
            </p>

            {/* Cinematic Viewfinder / Technical Accent Card */}
            <div className="pt-2">
              <div className="p-4 sm:p-5 rounded-xl border border-[#14100E]/12 bg-[#DED5C9]/50 backdrop-blur-xs relative overflow-hidden">
                <div className="flex items-center justify-between text-[11px] font-mono-tech tracking-wider text-[#6B625A] uppercase pb-3 border-b border-[#14100E]/10">
                  <span className="flex items-center gap-1.5 font-semibold text-[#14100E]">
                    <Camera className="w-3.5 h-3.5 text-[#C5A059]" />
                    Cinematographer Desk
                  </span>
                  <span className="text-[#C5A059] font-bold">2.39:1 SCOPE</span>
                </div>

                <div className="mt-3 space-y-2 text-xs font-mono-tech text-[#6B625A]">
                  <div className="flex items-center justify-between">
                    <span>LOCATION:</span>
                    <span className="text-[#14100E] font-medium">Dehradun</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>DIRECT INQUIRIES:</span>
                    <a
                      href="https://mail.google.com/mail/?view=cm&fs=1&to=Anooprawat123123@gmail.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#14100E] font-medium underline underline-offset-2 hover:text-[#C5A059] transition-colors"
                      title="Open Gmail compose in new tab"
                    >
                      Anooprawat123123@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>FORMAT:</span>
                    <span className="text-[#14100E] font-medium">Let&apos;s talk about it</span>
                  </div>
                </div>

                {/* Subtle corner framing marks */}
                <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-[#14100E]/20" />
                <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-[#14100E]/20" />
                <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-[#14100E]/20" />
                <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-[#14100E]/20" />
              </div>
            </div>

            {/* Selected Work Secondary Link */}
            <div className="pt-1">
              <a
                href="/#work"
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof window !== 'undefined') {
                    if (window.location.pathname === '/') {
                      const el = document.getElementById('work');
                      if (el && (window as any).lenis) {
                        (window as any).lenis.scrollTo(el, { duration: 1.2, offset: 0 });
                        window.history.pushState(null, '', '/#work');
                        return;
                      }
                    }
                    window.location.href = '/#work';
                  }
                }}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#14100E] hover:text-[#C5A059] underline underline-offset-8 decoration-[#14100E]/30 hover:decoration-[#C5A059] transition-colors cursor-pointer"
              >
                <span>Explore Selected Cinematography Work</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* ================= RIGHT COLUMN (PROJECT INQUIRY FORM) ================= */}
          <div className="lg:col-span-7 xl:col-span-7">
            <div className="bg-[#F4EFE6] border-2 border-[#14100E] rounded-2xl p-6 sm:p-8 lg:p-9 shadow-[4px_4px_0_#14100E] transition-all">
              
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4 pb-6 border-b border-[#14100E]/12">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Film className="w-4 h-4 text-[#C5A059]" />
                    <span className="text-[11px] font-mono-tech tracking-widest text-[#6B625A] uppercase font-semibold">
                      Direct Production Inquiry
                    </span>
                  </div>
                  <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#14100E]">
                    Start a Project Conversation
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B625A] mt-1">
                    Fill in your project parameters below. All inquiries are reviewed directly by Anup Rawat.
                  </p>
                </div>
              </div>

              {/* Form Content / Success State */}
              {isSubmitted ? (
                <div className="py-10 text-center space-y-5 animate-in fade-in duration-300">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#14100E] text-[#C5A059] flex items-center justify-center shadow-[2px_2px_0_#C5A059]">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-2 max-w-md mx-auto">
                    <h4 className="font-editorial text-2xl font-semibold text-[#14100E]">
                      Inquiry Stored Successfully
                    </h4>
                    <p className="text-sm text-[#6B625A] leading-relaxed">
                      Thank you for reaching out. Your project brief has been securely delivered and
                      recorded in our database. Anup will review your materials and contact you within
                      24–48 hours.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsSubmitted(false)}
                      className="px-6 py-2.5 rounded-xl border border-[#14100E] bg-transparent hover:bg-[#14100E] hover:text-[#F4EFE6] text-xs font-semibold tracking-wider uppercase transition-all"
                    >
                      Send Another Inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
                  {/* General Error Banner */}
                  {errorMessage && (
                    <div
                      role="alert"
                      className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-900 text-xs sm:text-sm flex items-start gap-2.5"
                    >
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Name & Phone Row (Only Compulsory Fields) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label
                        htmlFor="cta-inquiry-name"
                        className="block text-xs font-semibold uppercase tracking-wider text-[#14100E]/80 mb-1.5"
                      >
                        Full Name <span className="text-[#C5A059]">*</span>
                      </label>
                      <input
                        id="cta-inquiry-name"
                        name="name"
                        type="text"
                        required
                        disabled={isSubmitting}
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Christopher Nolan"
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border text-sm text-[#14100E] placeholder-[#14100E]/40 focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-all ${
                          fieldErrors.name
                            ? 'border-red-500 bg-red-50/30'
                            : 'border-[#14100E]/20 focus:border-[#C5A059]'
                        }`}
                      />
                      {fieldErrors.name && (
                        <p className="text-[11px] text-red-600 mt-1">{fieldErrors.name}</p>
                      )}
                    </div>

                    {/* Phone / WhatsApp */}
                    <div>
                      <label
                        htmlFor="cta-inquiry-phone"
                        className="block text-xs font-semibold uppercase tracking-wider text-[#14100E]/80 mb-1.5"
                      >
                        Phone / WhatsApp <span className="text-[#C5A059]">*</span>
                      </label>
                      <input
                        id="cta-inquiry-phone"
                        name="phone"
                        type="tel"
                        required
                        disabled={isSubmitting}
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border text-sm text-[#14100E] placeholder-[#14100E]/40 focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-all ${
                          fieldErrors.phone
                            ? 'border-red-500 bg-red-50/30'
                            : 'border-[#14100E]/20 focus:border-[#C5A059]'
                        }`}
                      />
                      {fieldErrors.phone && (
                        <p className="text-[11px] text-red-600 mt-1">{fieldErrors.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="cta-inquiry-message"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#14100E]/80 mb-1.5"
                    >
                      Message
                    </label>
                    <textarea
                      id="cta-inquiry-message"
                      name="message"
                      required
                      rows={4}
                      disabled={isSubmitting}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Share a brief overview of the project, estimated shoot dates, location, or visual references..."
                      className={`w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border text-sm text-[#14100E] placeholder-[#14100E]/40 focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-all resize-none ${
                        fieldErrors.message
                          ? 'border-red-500 bg-red-50/30'
                          : 'border-[#14100E]/20 focus:border-[#C5A059]'
                      }`}
                    />
                    {fieldErrors.message && (
                      <p className="text-[11px] text-red-600 mt-1">{fieldErrors.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 bg-[#14100E] hover:bg-[#25201D] text-[#F9F6F0] text-sm font-semibold rounded-xl shadow-[3px_3px_0_#C5A059] inline-flex items-center justify-center gap-2.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C5A059]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#C5A059]" />
                          <span>Recording Inquiry...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Project Inquiry</span>
                          <span className="text-[#C5A059] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                            ↗
                          </span>
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-[#6B625A] mt-2.5 font-mono-tech">
                      🔒 Direct &amp; confidential. Your contact information is never shared.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}