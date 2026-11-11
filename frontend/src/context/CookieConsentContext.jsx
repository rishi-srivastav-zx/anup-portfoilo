"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const CONSENT_STORAGE_KEY = "ar_cookie_consent_v1";
const CONSENT_VERSION = "1.0";

const defaultPreferences = {
  necessary: true,   // Always active & non-negotiable (admin JWT cookies, CSRF)
  functional: true,  // AI Chat Assistant visitor tokens (sessionStorage), smooth scroll
  analytics: false,  // Performance analytics (disabled until explicit opt-in)
  marketing: false,  // Remarketing/pixels (currently no marketing scripts active)
};

const CookieConsentContext = createContext(null);

export function CookieConsentProvider({ children }) {
  const [consentState, setConsentState] = useState(null); // null = loading
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);

  // Load existing consent on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.version === CONSENT_VERSION && parsed?.preferences) {
          setConsentState(parsed);
          setShowBanner(false);
          return;
        }
      }
    } catch {
      // LocalStorage access issues (e.g. private window)
    }

    // No prior valid consent found — show banner
    setShowBanner(true);
    setConsentState({
      hasConsented: false,
      timestamp: null,
      version: CONSENT_VERSION,
      preferences: defaultPreferences,
    });
  }, []);

  const saveConsent = useCallback((newPrefs) => {
    const consentPayload = {
      hasConsented: true,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
      preferences: {
        necessary: true,
        functional: Boolean(newPrefs.functional),
        analytics: Boolean(newPrefs.analytics),
        marketing: Boolean(newPrefs.marketing),
      },
    };

    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentPayload));
    } catch (err) {
      console.warn("[CookieConsent] Failed to save consent to localStorage", err);
    }

    setConsentState(consentPayload);
    setShowBanner(false);
    setShowPreferencesModal(false);
  }, []);

  const acceptAll = useCallback(() => {
    saveConsent({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
  }, [saveConsent]);

  const rejectNonEssential = useCallback(() => {
    saveConsent({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
  }, [saveConsent]);

  const openPreferences = useCallback(() => {
    setShowPreferencesModal(true);
  }, []);

  const closePreferences = useCallback(() => {
    setShowPreferencesModal(false);
  }, []);

  return (
    <CookieConsentContext.Provider
      value={{
        consent: consentState,
        showBanner,
        showPreferencesModal,
        acceptAll,
        rejectNonEssential,
        saveConsent,
        openPreferences,
        closePreferences,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    return {
      consent: null,
      showBanner: false,
      showPreferencesModal: false,
      acceptAll: () => {},
      rejectNonEssential: () => {},
      saveConsent: () => {},
      openPreferences: () => {},
      closePreferences: () => {},
    };
  }
  return context;
}
