import { useState } from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Anti-bot honeypot check
    if (honeypot.trim().length > 0) {
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setStatus('error');
      setFeedbackMessage('Please enter your email address to subscribe.');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setStatus('error');
      setFeedbackMessage('Please enter a valid email address (for example, producer@studio.com).');
      return;
    }

    setStatus('loading');
    setFeedbackMessage('');

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: trimmedEmail, companyWebsite: honeypot }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setStatus('error');
        setFeedbackMessage(
          data?.error || 'Unable to process subscription right now. Please try again shortly.'
        );
        return;
      }

      setStatus('success');
      setFeedbackMessage(
        data?.message ||
          'You are subscribed to The Cinematic Journal. New field notes will arrive when published.'
      );
      setEmail('');
    } catch {
      setStatus('error');
      setFeedbackMessage(
        'The subscription service could not be reached. Please verify your connection and try again.'
      );
    }
  };

  return (
    <section
      aria-labelledby="journal-dispatch-heading"
      className="border-t border-[#14100E]/15 bg-[#F4EFE6] text-[#14100E]"
    >
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-3">
            <p className="text-xs font-mono-tech tracking-wider text-[#012CEB] font-semibold">
              FIELD NOTES &amp; LIGHTING STUDIES
            </p>
            <h2
              id="journal-dispatch-heading"
              className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#14100E] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              Occasional notes from the set and color suite.
            </h2>
            <p className="text-sm sm:text-base text-[#6B625A] max-w-xl leading-relaxed">
              Receive new articles on lighting geometry, lens tests, and pre-production workflows
              directly when published. Sent only when a new essay is released.
            </p>
          </div>

          <div className="lg:col-span-5">
            <form onSubmit={handleSubmit} noValidate className="space-y-3">
              {/* Hidden honeypot input for abuse protection */}
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="company-website-field">Company Website</label>
                <input
                  id="company-website-field"
                  type="text"
                  name="companyWebsite"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <label
                htmlFor="journal-subscriber-email"
                className="block text-xs font-mono-tech font-semibold text-[#14100E] tracking-wider uppercase"
              >
                Email Address
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="journal-subscriber-email"
                  name="email"
                  type="email"
                  required
                  disabled={status === 'loading'}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') {
                      setStatus('idle');
                      setFeedbackMessage('');
                    }
                  }}
                  placeholder="name@production.com"
                  aria-invalid={status === 'error'}
                  aria-describedby={feedbackMessage ? 'newsletter-feedback' : undefined}
                  className="flex-1 min-h-[44px] px-4 py-2.5 bg-white border-2 border-[#14100E]/20 hover:border-[#14100E] focus:border-[#012CEB] rounded-xl text-sm text-[#14100E] placeholder:text-[#6B625A]/60 focus:outline-none focus:ring-2 focus:ring-[#012CEB]/20 transition-all shadow-xs disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="min-h-[44px] px-6 py-2.5 bg-[#14100E] hover:bg-[#012CEB] text-[#F4EDE4] text-xs font-mono-tech font-semibold tracking-wide inline-flex items-center justify-center gap-2 transition-all rounded-xl shadow-[2px_2px_0_#012CEB] whitespace-nowrap shrink-0 disabled:opacity-60 cursor-pointer"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <>
                      <span>Join Reader List</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>

              {feedbackMessage && (
                <div
                  id="newsletter-feedback"
                  role={status === 'error' ? 'alert' : 'status'}
                  aria-live="polite"
                  className={`flex items-start gap-2 pt-1 text-xs leading-relaxed ${
                    status === 'error' ? 'text-red-600' : 'text-[#012CEB] font-semibold'
                  }`}
                >
                  {status === 'error' ? (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  )}
                  <span>{feedbackMessage}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
