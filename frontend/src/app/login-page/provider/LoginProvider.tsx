'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AuthServices } from '@/api';

export interface LoginValidationResult {
  valid: boolean;
  error?: string;
  fieldErrors: {
    email?: string;
    password?: string;
    agree?: string;
  };
}

interface LoginContextType {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  agree: boolean;
  setAgree: (agree: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  fieldErrors: {
    email?: string;
    password?: string;
    agree?: string;
  };
  loading: boolean;
  isPasswordFilled: boolean;
  isFormValid: boolean;
  validate: () => LoginValidationResult;
  executeLogin: () => Promise<{ success: boolean; user?: unknown; error?: string }>;
}

const LoginContext = createContext<LoginContextType | null>(null);

export const LoginProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [email, setEmailState] = useState('');
  const [password, setPasswordState] = useState('');
  const [agree, setAgreeState] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    agree?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  // Grab root AuthContext if available
  let authContext: ReturnType<typeof useAuth> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    authContext = useAuth();
  } catch {
    authContext = null;
  }

  const clearError = useCallback(() => {
    setError(null);
    setFieldErrors({});
  }, []);

  const setEmail = useCallback(
    (val: string) => {
      setEmailState(val);
      if (error || fieldErrors.email) {
        clearError();
      }
    },
    [error, fieldErrors.email, clearError]
  );

  const setPassword = useCallback(
    (val: string) => {
      setPasswordState(val);
      if (error || fieldErrors.password) {
        clearError();
      }
    },
    [error, fieldErrors.password, clearError]
  );

  const setAgree = useCallback(
    (val: boolean) => {
      setAgreeState(val);
      if (error || fieldErrors.agree) {
        clearError();
      }
    },
    [error, fieldErrors.agree, clearError]
  );

  const isPasswordFilled = useMemo(() => {
    return password.trim().length > 0;
  }, [password]);

  const validate = useCallback((): LoginValidationResult => {
    const errs: { email?: string; password?: string; agree?: string } = {};

    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(trimmedEmail)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!trimmedPass) {
      errs.password = 'Password is required to proceed.';
    } else if (trimmedPass.length < 4) {
      errs.password = 'Password must be at least 4 characters.';
    }

    if (!agree) {
      errs.agree = 'Please engage the authorization cord (agree to terms).';
    }

    setFieldErrors(errs);

    const firstError = errs.password || errs.email || errs.agree;
    if (firstError) {
      setError(firstError);
      return { valid: false, error: firstError, fieldErrors: errs };
    }

    setError(null);
    return { valid: true, fieldErrors: {} };
  }, [email, password, agree]);

  const isFormValid = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      email.trim().length > 0 &&
      emailRegex.test(email.trim()) &&
      password.trim().length >= 4 &&
      agree
    );
  }, [email, password, agree]);

  const executeLogin = useCallback(async (): Promise<{
    success: boolean;
    user?: unknown;
    error?: string;
  }> => {
    // 1. Client-Side Validation
    const validation = validate();
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    setLoading(true);
    setError(null);

    const credentials = {
      email: email.trim(),
      password,
    };

    try {
      // 2. Try primary auth service / AuthContext login
      if (authContext?.login) {
        try {
          const res = await authContext.login(credentials);
          if (res?.success) {
            setLoading(false);
            return { success: true, user: res.user };
          }
        } catch (authCtxErr: unknown) {
          const msg =
            authCtxErr instanceof Error ? authCtxErr.message : String(authCtxErr);
          // If server refused / network error, attempt local Next.js proxy route
          if (!msg.includes('Failed to fetch') && !msg.includes('NetworkError') && !msg.includes('fetch failed')) {
            setError(msg || 'Invalid email or password.');
            setLoading(false);
            return { success: false, error: msg };
          }
        }
      }

      // 3. Fallback/Direct API route call to /api/auth/login
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg = data.message || 'Login failed. Please verify your credentials.';
        setError(errorMsg);
        setLoading(false);
        return { success: false, error: errorMsg };
      }

      if (authContext?.checkAuth) {
        await authContext.checkAuth(true);
      }
      setLoading(false);
      return { success: true, user: data.user };
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Unable to connect to login server.';
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  }, [email, password, validate, authContext]);

  const value = useMemo(
    () => ({
      email,
      setEmail,
      password,
      setPassword,
      agree,
      setAgree,
      error,
      setError,
      clearError,
      fieldErrors,
      loading,
      isPasswordFilled,
      isFormValid,
      validate,
      executeLogin,
    }),
    [
      email,
      setEmail,
      password,
      setPassword,
      agree,
      setAgree,
      error,
      clearError,
      fieldErrors,
      loading,
      isPasswordFilled,
      isFormValid,
      validate,
      executeLogin,
    ]
  );

  return <LoginContext.Provider value={value}>{children}</LoginContext.Provider>;
};

export const useLogin = (): LoginContextType => {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error('useLogin must be used within a LoginProvider');
  }
  return context;
};
