"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useCookieConsent } from "@/context/CookieConsentContext";
import { Shield, Settings, Check, X } from "lucide-react";

export default function CookieConsentBanner() {
  const {
    consent,
    showBanner,
    showPreferencesModal,
    acceptAll,
    rejectNonEssential,
    saveConsent,
    openPreferences,
    closePreferences,
  } = useCookieConsent();

  // Local state for toggles inside the Preferences Modal
  const [prefs, setPrefs] = useState({
    necessary: true,
    functional: true,
    analytics: false,
    marketing: false,
  });

  // Sync modal state when opening
  useEffect(() => {
    if (consent?.preferences) {
      setPrefs({
        necessary: true,
        functional: Boolean(consent.preferences.functional),
        analytics: Boolean(consent.preferences.analytics),
        marketing: Boolean(consent.preferences.marketing),
      });
    }
  }, [consent, showPreferencesModal]);

  return (
    <>
      {/* 1. FLOATING COMPACT BANNER (Bottom-left/center on desktop, full-width on mobile) */}
      {showBanner && !showPreferencesModal && (
        <div
          role="region"
          aria-label="Cookie Consent Banner"
          className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-[440px] z-[9990] bg-[#14100E] text-[#F4EFE6] border-2 border-[#14100E] p-4 sm:p-5 rounded-2xl shadow-[6px_6px_0_#012CEB] animate-in fade-in slide-in-from-bottom-5 duration-300 font-sans"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#012CEB] text-white rounded-lg shrink-0 mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-['DM_Mono'] text-[10px] font-bold tracking-widest uppercase text-[#D4A017]">
                  Privacy & Cookies
                </span>
                <span className="text-[10px] text-[#A29A91] font-mono">v1.0</span>
              </div>
              <p className="text-xs text-[#E6DDD2]/90 leading-relaxed font-normal">
                We use strictly necessary technical cookies and functional session tokens for our AI chat assistant and security. No cross-site marketing trackers are deployed.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-white/10 text-[11px]">
            <Link
              href="/privacy-policy"
              className="text-[#D4A017] underline underline-offset-2 hover:text-white transition-colors"
            >
              Privacy Notice
            </Link>

            <button
              type="button"
              onClick={openPreferences}
              className="text-[#E6DDD2]/80 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Settings className="w-3 h-3" />
              <span>Customize</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-3 mt-1">
            <button
              type="button"
              onClick={rejectNonEssential}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-[#2B2721] text-[#E6DDD2] hover:bg-[#3E3831] hover:text-white border border-white/10 transition-all cursor-pointer text-center"
            >
              Essential Only
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="px-3 py-2 text-xs font-bold rounded-lg bg-[#012CEB] hover:bg-[#0022b8] text-white shadow-[2px_2px_0_#F4EFE6] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer text-center"
            >
              Accept All
            </button>
          </div>
        </div>
      )}

      {/* 2. FULL PREFERENCES MODAL */}
      {showPreferencesModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          className="fixed inset-0 z-[9995] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={closePreferences}
        >
          <div
            className="relative w-full max-w-xl max-h-[90vh] bg-[#F4EFE6] text-[#14100E] border-2 border-[#14100E] rounded-2xl shadow-[8px_8px_0_#14100E] flex flex-col overflow-hidden font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-[#14100E]/15 bg-[#E6DDD2] flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#012CEB]" />
                  <span className="font-['DM_Mono'] text-[10px] sm:text-xs font-bold tracking-widest uppercase text-[#6B625A]">
                    Privacy Preferences Manager
                  </span>
                </div>
                <h3 id="cookie-modal-title" className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-[#14100E]">
                  Cookie & Storage Settings
                </h3>
                <p className="text-xs text-[#6B625A] leading-relaxed">
                  Manage how your device stores session identifiers and technical data in accordance with the Digital Personal Data Protection Act, 2023.
                </p>
              </div>

              <button
                type="button"
                onClick={closePreferences}
                aria-label="Close preferences"
                className="p-1.5 rounded-lg border border-[#14100E]/20 hover:bg-[#14100E] hover:text-[#F4EFE6] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Category Cards */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 max-h-[55vh] text-xs sm:text-sm">
              {/* Category 1: Necessary */}
              <div className="border border-[#14100E]/20 p-4 rounded-xl bg-white/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#14100E] flex items-center gap-2">
                    <span>Strictly Necessary</span>
                    <span className="text-[10px] font-['DM_Mono'] uppercase tracking-wider bg-[#14100E] text-[#F4EFE6] px-2 py-0.5 rounded">
                      Always Active
                    </span>
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 font-mono">
                    <Check className="w-3.5 h-3.5" /> Required
                  </span>
                </div>
                <p className="text-xs text-[#6B625A] leading-relaxed">
                  Required for site security, DDoS rate-limiting, and authorized administrative access (HttpOnly authentication cookies). Cannot be disabled.
                </p>
              </div>

              {/* Category 2: Functional */}
              <div className="border border-[#14100E]/20 p-4 rounded-xl bg-white/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#14100E]">
                    Functional & Interactive (AI Assistant)
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs.functional}
                      onChange={(e) => setPrefs({ ...prefs, functional: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#012CEB]" />
                  </label>
                </div>
                <p className="text-xs text-[#6B625A] leading-relaxed">
                  Permits the AI Chat Assistant to store temporary conversation tokens in your browser's <code>sessionStorage</code> for smooth dialog across pages.
                </p>
              </div>

              {/* Category 3: Analytics */}
              <div className="border border-[#14100E]/20 p-4 rounded-xl bg-white/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#14100E]">
                    Performance & Analytics
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs.analytics}
                      onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#012CEB]" />
                  </label>
                </div>
                <p className="text-xs text-[#6B625A] leading-relaxed">
                  Anonymous metrics to measure showreel playback latency and article engagement. <em>(No third-party tracking scripts currently active).</em>
                </p>
              </div>

              {/* Category 4: Marketing */}
              <div className="border border-[#14100E]/20 p-4 rounded-xl bg-white/60 space-y-2 opacity-80">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-[#14100E] flex items-center gap-2">
                    <span>Marketing & Targeting</span>
                    <span className="text-[10px] font-['DM_Mono'] uppercase tracking-wider text-[#6B625A]">
                      Inactive
                    </span>
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prefs.marketing}
                      onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-neutral-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#012CEB]" />
                  </label>
                </div>
                <p className="text-xs text-[#6B625A] leading-relaxed">
                  Cross-site profiling and advertising pixels. This website does not deploy advertising or social media tracking pixels.
                </p>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-[#14100E]/15 bg-[#E6DDD2] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={rejectNonEssential}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-[#14100E] hover:underline cursor-pointer"
              >
                Reject Non-Essential
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => saveConsent(prefs)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#14100E] text-[#F4EFE6] hover:bg-[#2B2721] transition-colors cursor-pointer"
                >
                  Save My Preferences
                </button>
                <button
                  type="button"
                  onClick={acceptAll}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-[#012CEB] text-white hover:bg-[#0022b8] shadow-[2px_2px_0_#14100E] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

