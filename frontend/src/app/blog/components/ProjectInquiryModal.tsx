'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface ProjectInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectInquiryModal({ isOpen, onClose }: ProjectInquiryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || name.trim().length < 2) {
      setStatus('error');
      setErrorMessage('Please enter your full name (compulsory).');
      return;
    }

    if (!phone.trim() || !/^[+\d\s().-]{7,30}$/.test(phone.trim())) {
      setStatus('error');
      setErrorMessage('Please enter a valid phone or WhatsApp number (compulsory).');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          message: message.trim(),
          source: 'Project Inquiry Modal',
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || 'Unable to submit your details at this moment.');
      }

      setStatus('success');
      setName('');
      setPhone('');
      setMessage('');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Unable to submit. Please try again.');
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="inquiry-modal-title"
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            data-lenis-prevent="true"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-[#14100E] border-2 border-[#C5A059]/40 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] p-6 sm:p-8 text-[#F4EDE4] z-10 m-auto max-h-[calc(100vh-2rem)] overflow-y-auto overscroll-contain"
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5 mb-5">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono-tech text-[#C5A059] bg-[#C5A059]/15 border border-[#C5A059]/30 font-semibold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3 text-[#C5A059]" />
                  Project Inquiry
                </span>
                <h3
                  id="inquiry-modal-title"
                  className="font-editorial text-2xl sm:text-3xl font-bold text-[#F4EDE4] tracking-tight"
                >
                  Discuss Your Project
                </h3>
                <p className="text-xs sm:text-sm text-[#A39E93] mt-1 font-sans">
                  Connect directly with cinematographer Anup Rawat.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-[#A39E93] hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form / Success view */}
            {status === 'success' ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center mx-auto text-[#C5A059]">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-editorial text-2xl font-bold text-[#F4EDE4]">
                  Inquiry Received
                </h4>
                <p className="text-sm text-[#A39E93] max-w-sm mx-auto leading-relaxed">
                  Thank you for sharing your project brief. Anup Rawat will review the details and get back to you promptly.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#D7B673] text-[#14100E] font-semibold text-xs font-mono-tech transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="modal-name" className="block text-xs font-mono-tech text-[#A39E93] mb-1.5">
                    Your Name / Producer Name <span className="text-[#C5A059]">*</span>
                  </label>
                  <input
                    id="modal-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Karan Malhotra"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1916] border border-white/15 text-[#F4EDE4] placeholder-[#A39E93]/50 text-sm focus:outline-none focus:border-[#C5A059] transition-colors"
                  />
                </div>

                {/* Phone / WhatsApp */}
                <div>
                  <label htmlFor="modal-phone" className="block text-xs font-mono-tech text-[#A39E93] mb-1.5">
                    Phone / WhatsApp <span className="text-[#C5A059]">*</span>
                  </label>
                  <input
                    id="modal-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1916] border border-white/15 text-[#F4EDE4] placeholder-[#A39E93]/50 text-sm focus:outline-none focus:border-[#C5A059] transition-colors"
                  />
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="modal-message" className="block text-xs font-mono-tech text-[#A39E93] mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="modal-message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your message, shoot dates, or visual references..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#1e1916] border border-white/15 text-[#F4EDE4] placeholder-[#A39E93]/50 text-sm focus:outline-none focus:border-[#C5A059] transition-colors resize-none"
                  />
                </div>

                {/* Error Banner */}
                {status === 'error' && errorMessage && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/60 border border-red-800/60 text-xs text-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-xs font-mono-tech text-[#A39E93] hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="px-6 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#D7B673] active:bg-[#B38F48] text-[#14100E] font-semibold text-xs font-mono-tech inline-flex items-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Brief...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Project Brief</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
