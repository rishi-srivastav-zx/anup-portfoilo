import type { Metadata } from 'next';
import Link from 'next/link';
import CinematicFooter from '@/components/legal/CinematicFooter';

const siteUrl = (
  process.env.NEXT_PUBLIC_PRODUCTION_URL ||
  (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost')
    ? process.env.NEXT_PUBLIC_SITE_URL
    : null) ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  'https://anuprawat.com'
).replace(/\/+$/, '');

export const metadata: Metadata = {
  title: 'Privacy Policy | Anup Rawat — Cinematographer & Filmmaker',
  description:
    'Privacy Policy for Anup Rawat Cinematography. Explains our client enquiry handling, AI assistant sessions, data retention, and rights under India DPDP Act 2023.',
  alternates: {
    canonical: `${siteUrl}/privacy-policy`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Privacy Policy | Anup Rawat Cinematography',
    description:
      'Information on how personal data and project enquiries are collected, stored, and protected by Anup Rawat.',
    url: `${siteUrl}/privacy-policy`,
    siteName: 'Anup Rawat Cinematography',
    type: 'website',
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'November 6, 2026';

  const sections = [
    { id: 'introduction', title: '1. Introduction' },
    { id: 'ownership', title: '2. Website Ownership & Controller' },
    { id: 'information-collected', title: '3. Information We Collect' },
    { id: 'contact-enquiries', title: '4. Contact & Project Enquiries' },
    { id: 'ai-assistant', title: '5. AI Chat Assistant & Session Data' },
    { id: 'automated-tech', title: '6. Automatically Collected Technical Data' },
    { id: 'cookies-storage', title: '7. Cookies & Web Storage Usage' },
    { id: 'how-we-use', title: '8. How We Use Your Information' },
    { id: 'storage-security', title: '9. How We Store & Protect Information' },
    { id: 'third-parties', title: '10. Database & Third-Party Service Providers' },
    { id: 'data-sharing', title: '11. Data Sharing & Disclosure' },
    { id: 'external-links', title: '12. Third-Party Links & External Platforms' },
    { id: 'data-retention', title: '13. Data Retention' },
    { id: 'user-rights', title: '14. Your Rights (India DPDP Act 2023)' },
    { id: 'children', title: '15. Children’s Privacy' },
    { id: 'international-transfers', title: '16. International Data Transfers' },
    { id: 'policy-updates', title: '17. Policy Updates & Notifications' },
    { id: 'contact-us', title: '18. Contact Information for Privacy Queries' },
  ];

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#14100E] font-sans antialiased selection:bg-[#012CEB] selection:text-[#F4EFE6]">
      {/* Header Bar with Breadcrumb */}
      <header className="border-b border-[#14100E]/15 bg-[#E6DDD2]/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#14100E]">
            <Link
              href="/"
              className="text-[#6B625A] hover:text-[#012CEB] transition-colors"
            >
              Home
            </Link>
            <span className="text-[#A29A91]">/</span>
            <span className="text-[#14100E]">Privacy Policy</span>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/terms-and-conditions"
              className="hidden sm:inline-block text-xs uppercase tracking-wider text-[#6B625A] hover:text-[#012CEB] transition-colors"
            >
              Terms & Conditions →
            </Link>
            <span className="font-['DM_Mono'] text-[10px] sm:text-xs tracking-widest uppercase text-[#6B625A] bg-[#DDD3C5] px-2.5 py-1 rounded border border-[#14100E]/10">
              Legal // Compliance
            </span>
          </div>
        </div>
      </header>

      {/* Hero Title Section */}
      <section className="border-b border-[#14100E]/15 py-14 sm:py-20 px-6 sm:px-8 bg-gradient-to-b from-[#E6DDD2]/50 to-transparent">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 border border-[#14100E] px-3 py-1 bg-[#14100E] text-[#F4EFE6] text-[10px] sm:text-xs font-['DM_Mono'] uppercase tracking-widest shadow-[2px_2px_0_#012CEB]">
            Privacy & Data Protection Notice
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-[#14100E] leading-[1.05]">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-[#6B625A] max-w-2xl mx-auto font-medium">
            This document sets out the transparent and lawful basis on which personal data, commercial shoot inquiries, and session details are collected, processed, and safeguarded.
          </p>
          <div className="pt-2 text-xs font-['DM_Mono'] text-[#6B625A]">
            <span>Last Updated: </span>
            <time dateTime="2026-11-06" className="text-[#14100E] font-semibold">{lastUpdated}</time>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 sm:px-8 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Sticky Table of Contents Sidebar */}
        <aside className="lg:col-span-4 lg:sticky lg:top-24 h-fit border border-[#14100E]/20 bg-[#E6DDD2]/60 rounded-xl p-6 shadow-[4px_4px_0_#14100E]">
          <h2 className="font-['DM_Mono'] text-xs font-bold uppercase tracking-wider text-[#14100E] pb-3 border-b border-[#14100E]/15 mb-4">
            Table of Contents
          </h2>
          <nav aria-label="Table of Contents" className="space-y-1.5 text-xs sm:text-[13px] font-medium text-[#6B625A] max-h-[70vh] overflow-y-auto pr-1">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block py-1 hover:text-[#012CEB] hover:translate-x-0.5 transition-all truncate"
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Policy Body */}
        <article className="lg:col-span-8 space-y-12 text-[#14100E] leading-relaxed text-sm sm:text-base">
          {/* Section 1 */}
          <section id="introduction" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              1. Introduction
            </h2>
            <p>
              Welcome to the official portfolio and professional representation website of <strong>Anup Rawat</strong> (“we”, “our”, or “us”), Contemporary Cinematographer, Director of Photography (DoP), and Visual Artist.
            </p>
            <p>
              We value the privacy of every client, director, producer, agency representative, and website visitor. This Privacy Policy details our principles regarding the collection, processing, storage, and rights concerning personal information received via our website (<code>https://anuprawat.com</code>), project enquiry forms, and interactive AI chat assistance.
            </p>
            <p>
              We process personal data in good faith and in compliance with applicable laws, including the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> of India and related rules as notified.
            </p>
          </section>

          {/* Section 2 */}
          <section id="ownership" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              2. Website Ownership & Data Controller
            </h2>
            <p>
              This website is privately owned and operated by independent professional filmmaker and cinematographer <strong>Anup Rawat</strong>, based in Uttarakhand, India (operating across Dehradun, Rishikesh, and global on-location productions).
            </p>
            <div className="bg-[#E6DDD2] p-4 rounded-lg border border-[#14100E]/20 text-xs sm:text-sm space-y-1.5 font-['DM_Mono']">
              <div><strong>Data Fiduciary:</strong> Anup Rawat (Independent Cinematographer)</div>
              <div><strong>Primary Operating Locations:</strong> Dehradun & Rishikesh, Uttarakhand, India</div>
              <div><strong>Official Contact Email:</strong> anuprawat@gmail.com</div>
              <div><strong>Website:</strong> https://anuprawat.com</div>
            </div>
          </section>

          {/* Section 3 */}
          <section id="information-collected" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              3. Information We Collect
            </h2>
            <p>
              We collect information that you voluntarily choose to provide to us when discussing film productions, photography packages, or equipment bookings, as well as minimal technical data required for website operation:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li><strong>Direct Project Enquiries:</strong> Information submitted via the contact form on our website.</li>
              <li><strong>AI Assistant Conversations:</strong> Questions, project parameters, and phone numbers shared via the on-site AI Chat Assistant.</li>
              <li><strong>Administrative Authentication:</strong> Operational credentials restricted strictly to the site administrator.</li>
              <li><strong>Technical Logs:</strong> Server request metadata necessary for security, rate-limiting, and error diagnosis.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="contact-enquiries" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              4. Contact & Project Enquiries
            </h2>
            <p>
              When you submit a project inquiry through our portfolio contact section, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li><strong>Full Name:</strong> To address you and personalize correspondence.</li>
              <li><strong>Phone or WhatsApp Number:</strong> Mandatory to contact you regarding shoot dates, technical requirements, and production availability.</li>
              <li><strong>Project Message & Scope:</strong> Details about your narrative film, commercial shoot, fashion project, music video, or shoot location (e.g., Dehradun, Rishikesh, Mumbai, Delhi).</li>
              <li><strong>Project Type:</strong> Commercial, Narrative Feature, Documentary, Music Video, or Event.</li>
              <li><strong>Email Address (Optional):</strong> For formal treatment briefs and call sheets.</li>
            </ul>
            <p className="text-xs text-[#6B625A]">
              We do not share your contact details with external advertising brokers or marketing telecallers.
            </p>
          </section>

          {/* Section 5 */}
          <section id="ai-assistant" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              5. AI Chat Assistant & Session Data
            </h2>
            <p>
              Our website includes an on-screen interactive AI Chat Assistant designed to answer questions regarding Anup Rawat’s cinematography gear (e.g., ARRI Alexa Mini LF, Anamorphic primes), availability, shooting locations in Uttarakhand, and pricing methodology.
            </p>
            <div className="bg-[#E6DDD2]/60 border-l-4 border-[#012CEB] p-4 text-xs sm:text-sm space-y-2">
              <p><strong>How the Chat Assistant Operates:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Session Token:</strong> An ephemeral session ID and visitor token are stored in your browser’s <code>sessionStorage</code> (cleared automatically when you close your browser tab).</li>
                <li><strong>Grounded Responses:</strong> The assistant retrieves verified factual information from our self-hosted database knowledge base.</li>
                <li><strong>Lead Generation:</strong> If you choose to leave your contact number during the conversation, it is recorded in our database as an enquiry lead for Anup Rawat’s direct follow-up.</li>
                <li><strong>No Public Broadcast:</strong> Your chat messages are never published publicly.</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section id="automated-tech" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              6. Automatically Collected Technical Data
            </h2>
            <p>
              When navigating this website, our web servers and hosting infrastructure automatically record standard web server logs to ensure network stability, prevent DDoS attacks, and enforce rate limits:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>Internet Protocol (IP) address.</li>
              <li>Browser type, engine version, and operating system.</li>
              <li>Timestamp, HTTP status code, and resource path requested.</li>
              <li>Referring website address.</li>
            </ul>
            <p className="text-xs text-[#6B625A]">
              These technical logs are used exclusively for security diagnostics, anti-abuse throttling, and uptime monitoring.
            </p>
          </section>

          {/* Section 7 */}
          <section id="cookies-storage" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              7. Cookies & Web Storage Usage
            </h2>
            <p>
              We believe in minimal, purposeful client-side storage. Our policy categorizes cookies and storage into:
            </p>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="border border-[#14100E]/15 p-3 rounded bg-white/40">
                <span className="font-bold text-[#14100E]">Strictly Necessary Cookies:</span>
                <p className="text-[#6B625A] mt-1">
                  Used exclusively for administrator authentication (<code>access_token</code> and <code>refresh_token</code> set with <code>HttpOnly; Secure; SameSite=Strict</code>). Standard visitors do not receive tracking cookies.
                </p>
              </div>

              <div className="border border-[#14100E]/15 p-3 rounded bg-white/40">
                <span className="font-bold text-[#14100E]">Session Storage:</span>
                <p className="text-[#6B625A] mt-1">
                  Keys <code>ar_chat_conv_id</code> and <code>ar_chat_token</code> are stored in browser memory during active chat assistant use. They expire automatically when your browser tab is closed.
                </p>
              </div>

              <div className="border border-[#14100E]/15 p-3 rounded bg-white/40">
                <span className="font-bold text-[#14100E]">Analytics & Marketing Cookies:</span>
                <p className="text-[#6B625A] mt-1">
                  We currently <strong>do not deploy third-party advertising cookies, cross-site trackers, or behavioral profiling scripts</strong> (e.g., Facebook Pixel, Hotjar).
                </p>
              </div>
            </div>
          </section>

          {/* Section 8 */}
          <section id="how-we-use" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              8. How We Use Your Information
            </h2>
            <p>Personal data collected is used strictly for legitimate commercial and artistic purposes:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li><strong>Direct Client Communication:</strong> To respond to your project briefs, discuss director treatments, and prepare quotation estimates for cinematography and photography services.</li>
              <li><strong>Production Scheduling:</strong> To coordinate shoot calendars, location scouting in Uttarakhand (Dehradun, Rishikesh, Mussoorie), and crew logistics.</li>
              <li><strong>Site Security & Integrity:</strong> To prevent spam, brute-force attacks, and abusive inquiries on our forms.</li>
              <li><strong>Legal Compliance:</strong> To maintain required tax and accounting records for contracted commercial productions.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section id="storage-security" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              9. How We Store & Protect Information
            </h2>
            <p>
              We implement reasonable technical and organizational security measures to protect your personal data from unauthorized access, alteration, or disclosure:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li><strong>HTTPS Encryption:</strong> All data transmitted between your browser and our server is encrypted using Transport Layer Security (TLS/HTTPS).</li>
              <li><strong>Database Protection:</strong> Contact inquiries and chat leads are stored in managed PostgreSQL databases with encrypted network connections (SSL/TLS required).</li>
              <li><strong>Administrative Safeguards:</strong> Access to leads and backend dashboards is protected by Argon2-hashed passwords and short-lived JSON Web Tokens (JWT).</li>
            </ul>
            <p className="text-xs text-[#6B625A] italic">
              Please note: While we follow industry standards to safeguard your information, no transmission over the Internet or digital database can be guaranteed as 100% invulnerable. We cannot guarantee absolute security.
            </p>
          </section>

          {/* Section 10 */}
          <section id="third-parties" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              10. Database & Third-Party Service Providers
            </h2>
            <p>
              To maintain high-performance video streaming and dependable cloud infrastructure, we engage trusted third-party technology providers:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs sm:text-sm">
              <li>
                <strong>Database Hosting (Neon PostgreSQL):</strong> Managed, cloud-hosted relational database infrastructure with encrypted transmission.
              </li>
              <li>
                <strong>Image & Media CDN (ImageKit.io):</strong> Cloud-based media delivery network utilized for fast image and visual asset optimization.
              </li>
              <li>
                <strong>Web Typography (Google Fonts):</strong> Web fonts are loaded from Google Font servers to maintain typography consistency.
              </li>
              <li>
                <strong>Cloud Hosting Infrastructure:</strong> Application servers running Next.js and Node/Express runtime environments.
              </li>
            </ul>
          </section>

          {/* Section 11 */}
          <section id="data-sharing" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              11. Data Sharing & Disclosure
            </h2>
            <p>
              <strong>We never sell, rent, monetize, or trade your personal data</strong> to third-party data brokers or marketing agencies. Personal information is only disclosed in the following specific circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li><strong>With Production Team Members:</strong> Relevant shoot details (e.g., location, call time) shared with key crew members (e.g., gaffer, line producer) solely for executing contracted projects.</li>
              <li><strong>Legal Obligations:</strong> If required by Indian law enforcement, court order, or governmental authorities under applicable statutory regulations.</li>
              <li><strong>Safety & Protection:</strong> To protect the rights, property, or safety of Anup Rawat, our clients, or the general public.</li>
            </ul>
          </section>

          {/* Section 12 */}
          <section id="external-links" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              12. Third-Party Links & External Platforms
            </h2>
            <p>
              Our website may contain links to third-party websites and communication platforms, including:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li><strong>WhatsApp (Meta Platforms):</strong> Click-to-chat links (<code>wa.me</code>) allow direct communication. When using WhatsApp, their respective Privacy Policy applies.</li>
              <li><strong>Social & Professional Platforms:</strong> Links to Instagram, Vimeo, YouTube, and LinkedIn.</li>
            </ul>
            <p className="text-xs text-[#6B625A]">
              We have no control over the privacy practices of external websites. We encourage you to review their policies when leaving our site.
            </p>
          </section>

          {/* Section 13 */}
          <section id="data-retention" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              13. Data Retention
            </h2>
            <p>
              We retain personal data only for as long as necessary to fulfill the commercial and legal purposes for which it was collected:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li><strong>Project Inquiries & Leads:</strong> Retained for ongoing production discussions, re-engagements, or reference for a maximum of 24 months, after which inactive leads may be archived or permanently purged.</li>
              <li><strong>Contracted Production Records:</strong> Invoices, contracts, and tax receipts are retained for the statutory period required under Indian financial and commercial taxation laws.</li>
              <li><strong>AI Assistant Conversations:</strong> Chat session transcripts are retained for quality review, service improvements, and lead verification.</li>
            </ul>
          </section>

          {/* Section 14 */}
          <section id="user-rights" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              14. Your Rights (Digital Personal Data Protection Act, 2023)
            </h2>
            <p>
              In accordance with the <strong>Digital Personal Data Protection Act, 2023</strong> of India, you hold specific rights regarding personal data you have shared with us:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li><strong>Right to Access Information:</strong> Request confirmation on whether we process your personal data and a summary of personal data held.</li>
              <li><strong>Right to Correction & Erasure:</strong> Request the correction of inaccurate or misleading data, or erasure of personal data that is no longer necessary for the purpose it was collected.</li>
              <li><strong>Right of Grievance Redressal:</strong> Submit a complaint regarding our processing of your personal data.</li>
              <li><strong>Right to Nominate:</strong> Nominate another individual to exercise your privacy rights in the event of death or incapacity.</li>
            </ul>
            <p className="text-xs text-[#6B625A]">
              To exercise any of these rights, please contact us directly at <code>anuprawat@gmail.com</code>. We will verify and process valid requests within a reasonable timeframe.
            </p>
          </section>

          {/* Section 15 */}
          <section id="children" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              15. Children’s Privacy
            </h2>
            <p>
              Our portfolio and professional services are intended for directors, producers, brand managers, and commercial clients aged 18 and older. We do not knowingly solicit or collect personal data from minors. If you believe a minor has submitted personal information through our contact forms, please contact us immediately, and we will delete the data promptly.
            </p>
          </section>

          {/* Section 16 */}
          <section id="international-transfers" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              16. International Data Transfers
            </h2>
            <p>
              While Anup Rawat operates primarily from Uttarakhand, India, our cloud infrastructure providers (such as managed PostgreSQL database nodes and media delivery CDN endpoints) may store and process technical data across global data centers adhering to industry-standard data security benchmarks.
            </p>
          </section>

          {/* Section 17 */}
          <section id="policy-updates" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              17. Policy Updates & Notifications
            </h2>
            <p>
              We may update this Privacy Policy periodically to reflect technological changes, new service offerings, or legal developments under the DPDP Act. Any updates will be published directly on this page with an updated “Last Updated” date at the top. Continued use of the website following changes constitutes awareness of the revised terms.
            </p>
          </section>

          {/* Section 18 */}
          <section id="contact-us" className="space-y-4 scroll-mt-24 pt-4 border-t border-[#14100E]/15">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E]">
              18. Contact Information for Privacy Queries
            </h2>
            <p>
              If you have any questions, privacy requests, or grievances concerning this Privacy Policy or your personal data, you may reach out directly to:
            </p>
            <div className="bg-[#14100E] text-[#F4EFE6] p-6 rounded-xl border border-[#14100E] shadow-[6px_6px_0_#012CEB] space-y-2 font-['DM_Mono'] text-xs sm:text-sm">
              <div className="text-[#D4A017] font-bold text-sm sm:text-base">ANUP RAWAT // CINEMATOGRAPHER</div>
              <div>Grievance & Privacy Contact: Anup Rawat</div>
              <div>Location: Dehradun & Rishikesh, Uttarakhand, India</div>
              <div>
                Email:{' '}
                <a
                  href="mailto:anuprawat@gmail.com"
                  className="text-[#D4A017] underline hover:text-white transition-colors"
                >
                  anuprawat@gmail.com
                </a>
              </div>
              <div className="pt-2 text-xs text-[#E6DDD2]/70 font-sans">
                Response timeframe: Typically within 3 to 7 business days.
              </div>
            </div>
          </section>
        </article>
      </main>

      {/* Cinematic Footer Integration */}
      <CinematicFooter />
    </div>
  );
}

