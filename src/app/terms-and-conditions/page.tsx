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
  title: 'Terms and Conditions | Anup Rawat — Cinematographer & Filmmaker',
  description:
    'Terms and conditions governing portfolio viewing, commercial film and photography enquiries, IP rights, and creative services by Anup Rawat.',
  alternates: {
    canonical: `${siteUrl}/terms-and-conditions`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Terms and Conditions | Anup Rawat Cinematography',
    description:
      'Legal terms and guidelines governing website use, intellectual property, shoot enquiries, and production bookings with Anup Rawat.',
    url: `${siteUrl}/terms-and-conditions`,
    siteName: 'Anup Rawat Cinematography',
    type: 'website',
  },
};

export default function TermsAndConditionsPage() {
  const lastUpdated = 'November 6, 2026';

  const sections = [
    { id: 'introduction', title: '1. Introduction' },
    { id: 'acceptance', title: '2. Acceptance of Terms' },
    { id: 'website-usage', title: '3. Website Usage & Acceptable Conduct' },
    { id: 'portfolio-ip', title: '4. Portfolio Content & Intellectual Property' },
    { id: 'copyright-media', title: '5. Copyright & Media Usage Restrictions' },
    { id: 'services-offered', title: '6. Cinematography & Visual Services' },
    { id: 'enquiries-communication', title: '7. Project Enquiries & Communication' },
    { id: 'booking-confirmation', title: '8. Booking & Project Confirmation Process' },
    { id: 'pricing-quotations', title: '9. Pricing, Quotations & Commercial Terms' },
    { id: 'cancellation-rescheduling', title: '10. Project Cancellation & Rescheduling' },
    { id: 'client-responsibilities', title: '11. Client Responsibilities & Clearances' },
    { id: 'third-party-links', title: '12. Third-Party Services & External Links' },
    { id: 'ai-assistant-disclaimer', title: '13. AI Chat Assistant Disclaimer' },
    { id: 'technical-availability', title: '14. Website Availability & Technical Issues' },
    { id: 'limitation-liability', title: '15. Limitation of Liability' },
    { id: 'indemnification', title: '16. Indemnification' },
    { id: 'privacy-reference', title: '17. Privacy & Personal Information' },
    { id: 'modifications', title: '18. Changes to These Terms' },
    { id: 'governing-law', title: '19. Governing Law & Jurisdiction' },
    { id: 'contact-info', title: '20. Contact Information' },
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
            <span className="text-[#14100E]">Terms & Conditions</span>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/privacy-policy"
              className="hidden sm:inline-block text-xs uppercase tracking-wider text-[#6B625A] hover:text-[#012CEB] transition-colors"
            >
              Privacy Policy →
            </Link>
            <span className="font-['DM_Mono'] text-[10px] sm:text-xs tracking-widest uppercase text-[#6B625A] bg-[#DDD3C5] px-2.5 py-1 rounded border border-[#14100E]/10">
              Legal // Agreement
            </span>
          </div>
        </div>
      </header>

      {/* Hero Title Section */}
      <section className="border-b border-[#14100E]/15 py-14 sm:py-20 px-6 sm:px-8 bg-gradient-to-b from-[#E6DDD2]/50 to-transparent">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 border border-[#14100E] px-3 py-1 bg-[#14100E] text-[#F4EFE6] text-[10px] sm:text-xs font-['DM_Mono'] uppercase tracking-widest shadow-[2px_2px_0_#012CEB]">
            Commercial & Intellectual Property Agreement
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-[#14100E] leading-[1.05]">
            Terms and Conditions
          </h1>
          <p className="text-sm sm:text-base text-[#6B625A] max-w-2xl mx-auto font-medium">
            Guidelines and legal provisions governing the access of portfolio materials, artistic showcases, project enquiry submissions, and commercial creative production bookings.
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
            Navigation Index
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

        {/* Terms Body */}
        <article className="lg:col-span-8 space-y-12 text-[#14100E] leading-relaxed text-sm sm:text-base">
          {/* Section 1 */}
          <section id="introduction" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              1. Introduction
            </h2>
            <p>
              These Terms and Conditions (“Terms”) govern your access to and use of the website <strong>https://anuprawat.com</strong> (the “Website”), operated by <strong>Anup Rawat</strong> (“Cinematographer”, “we”, “our”, or “us”), independent filmmaker, Director of Photography, and visual storyteller operating across Dehradun, Rishikesh, Uttarakhand, and internationally.
            </p>
            <p>
              The Website serves as an artistic showcase of cinematography reels, narrative film excerpts, commercial campaigns, and educational technical essays, as well as a direct conduit for prospective commercial and narrative project enquiries.
            </p>
          </section>

          {/* Section 2 */}
          <section id="acceptance" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              2. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, interacting with, or submitting enquiries through this Website, you acknowledge that you have read, understood, and agree to be bound by these Terms and our companion <Link href="/privacy-policy" className="text-[#012CEB] font-semibold underline hover:text-[#14100E]">Privacy Policy</Link>.
            </p>
            <p>
              If you do not agree with any part of these Terms, you must immediately discontinue your use of the Website.
            </p>
          </section>

          {/* Section 3 */}
          <section id="website-usage" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              3. Website Usage & Acceptable Conduct
            </h2>
            <p>
              You agree to use the Website only for lawful purposes related to viewing artistic work, reading cinematography publications, and initiating legitimate creative production enquiries. You agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>Use any robot, spider, scraper, deep-link, or automated data gathering software to extract video assets, photographs, code, or written articles without prior written permission.</li>
              <li>Attempt to gain unauthorized access to any administrative endpoints, private server routes, authentication tokens, or Neon database nodes.</li>
              <li>Submit false, fraudulent, defamatory, malicious, or spam enquiries through the contact forms or the AI Chat Assistant.</li>
              <li>Introduce viruses, trojans, worms, or any technologically harmful materials designed to disrupt normal site execution or server performance.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="portfolio-ip" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              4. Portfolio Content & Intellectual Property
            </h2>
            <p>
              All materials displayed on this Website—including but not limited to cinematography showreels, video teasers, behind-the-scenes photography, lighting diagrams, graphic mockups, animations, source code, and written essays—are protected under the <strong>Indian Copyright Act, 1957</strong>, international copyright treaties, and applicable intellectual property laws.
            </p>
            <p>
              Certain featured visual works represent commercial brand campaigns or collaborative narrative films where copyright, master rights, or trademark ownership may be held by, or shared with, respective production houses, directors, brands, or clients. Such materials are presented on this Website strictly for non-commercial portfolio and demonstrative showreel purposes pursuant to industry customary rights and fair dealing.
            </p>
          </section>

          {/* Section 5 */}
          <section id="copyright-media" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              5. Copyright & Media Usage Restrictions
            </h2>
            <p>
              Viewing portfolio media on this Website does <strong>not</strong> grant you any license, assignment, or authorization to use, reproduce, broadcast, or modify any media assets. Specifically:
            </p>
            <div className="bg-[#E6DDD2]/60 border-l-4 border-[#14100E] p-4 text-xs sm:text-sm space-y-2">
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>No Commercial Reuse:</strong> You may not download, screen-record, repost, or license any still frame or video clip for third-party commercial advertisements, social campaigns, or stock video archives.</li>
                <li><strong>No AI Model Training:</strong> Express reservation is hereby made restricting the use of visual works, lighting diagrams, and texts on this Website for training generative artificial intelligence or computer vision models without explicit commercial licensing.</li>
                <li><strong>Editorial Sharing:</strong> You may share links to the Website or published articles provided proper attribution to <em>“Anup Rawat (Cinematographer)”</em> is visibly maintained.</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section id="services-offered" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              6. Cinematography & Visual Services
            </h2>
            <p>
              Anup Rawat provides professional visual production services across varied creative formats:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li><strong>Narrative Cinematography:</strong> Feature films, short films, independent cinema, and episodic visual storytelling.</li>
              <li><strong>Commercial & Brand Films:</strong> Commercials, corporate visual identity, and product advertisements.</li>
              <li><strong>Music Videos & Fashion Visuals:</strong> Stylized music videos, fashion lookbooks, and high-contrast editorial photography.</li>
              <li><strong>Regional Shoot Execution:</strong> Location-specific production in Dehradun, Rishikesh, Mussoorie, Himalayas, and pan-India locations.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section id="enquiries-communication" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              7. Project Enquiries & Communication
            </h2>
            <p>
              Visitors may communicate and submit shoot details through our on-site contact form, interactive AI Chat Assistant, or via direct WhatsApp messaging.
            </p>
            <p>
              <strong>Important Clarification:</strong> Submitting an enquiry, sharing shoot dates, or conversing with the automated assistant does <strong>not</strong> constitute a binding contract, guaranteed reservation, or formal booking of Anup Rawat’s professional services.
            </p>
          </section>

          {/* Section 8 */}
          <section id="booking-confirmation" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              8. Booking & Project Confirmation Process
            </h2>
            <p>
              To ensure creative alignment, technical feasibility, and legal clarity, projects are considered formally confirmed <strong>only</strong> when all of the following steps have occurred:
            </p>
            <div className="bg-[#E6DDD2] p-5 rounded-xl border border-[#14100E]/20 space-y-3 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <span className="font-['DM_Mono'] font-bold text-[#012CEB] shrink-0 text-base">01.</span>
                <p>Direct technical and narrative alignment between the client/director and Anup Rawat regarding project scope, schedule, shoot locations, and technical packages.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-['DM_Mono'] font-bold text-[#012CEB] shrink-0 text-base">02.</span>
                <p>Execution of a written, mutually signed Production Agreement, Work Order, or official Deal Memo setting forth agreed deliverables, working hours, and credits.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-['DM_Mono'] font-bold text-[#012CEB] shrink-0 text-base">03.</span>
                <p>Receipt of the agreed advance mobilization or booking retainer deposit as specified in the formal contract.</p>
              </div>
            </div>
          </section>

          {/* Section 9 */}
          <section id="pricing-quotations" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              9. Pricing, Quotations & Commercial Terms
            </h2>
            <p>
              Because cinematography and filmmaking requirements vary substantially depending on camera bodies (e.g., ARRI LF, RED), anamorphic glass, crew scale, and travel locations, <strong>the Website does not process automated digital checkout or online retail transactions</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>All quotations provided via email, phone, or message are tailored estimates based on client specifications.</li>
              <li>Quotations remain valid for the period stated on the written estimate (typically 14 to 30 days).</li>
              <li>Equipment rentals, camera crew hire, travel, food, accommodation, and location permits are billed in accordance with the specific written contract.</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section id="cancellation-rescheduling" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              10. Project Cancellation & Rescheduling
            </h2>
            <p>
              Filmmaking is inherently subject to external variables, weather conditions in mountainous regions (such as Rishikesh or Dehradun), and location approvals.
            </p>
            <p>
              Terms governing cancellation, postponement, weather contingencies, or kill fees are governed <strong>exclusively by individual project agreements</strong> executed prior to production. This Website does not process automated cancellations or refunds.
            </p>
          </section>

          {/* Section 11 */}
          <section id="client-responsibilities" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              11. Client Responsibilities & Clearances
            </h2>
            <p>
              When commissioning visual production work, commissioning clients are responsible for:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>Securing all necessary location permissions, shooting permits, and municipal licenses.</li>
              <li>Obtaining model, talent, and actor release agreements for talent appearing on camera.</li>
              <li>Ensuring safe, legal shooting environments for cast and crew on set.</li>
            </ul>
          </section>

          {/* Section 12 */}
          <section id="third-party-links" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              12. Third-Party Services & External Links
            </h2>
            <p>
              This Website may provide hyperlinks to external third-party platforms, such as WhatsApp (Meta Platforms), Instagram, Vimeo, YouTube, and LinkedIn.
            </p>
            <p>
              These links are provided solely for convenience. We do not endorse, inspect, or control third-party platforms, and we are not liable for their content, service uptime, or terms of use.
            </p>
          </section>

          {/* Section 13 */}
          <section id="ai-assistant-disclaimer" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              13. AI Chat Assistant Disclaimer
            </h2>
            <p>
              Our website includes an automated AI Chat Assistant to assist visitors with rapid queries regarding gear, artistic philosophy, and general shoot availability.
            </p>
            <div className="bg-[#E6DDD2]/60 border-l-4 border-[#012CEB] p-4 text-xs sm:text-sm space-y-2">
              <p><strong>Please Note:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Information provided by the assistant is for informational, indicative guidance only.</li>
                <li>The assistant is an automated system and cannot execute binding contracts, confirm calendar locks, or promise firm price discounts.</li>
                <li>Final agreements require direct written confirmation from Anup Rawat.</li>
              </ul>
            </div>
          </section>

          {/* Section 14 */}
          <section id="technical-availability" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              14. Website Availability & Technical Issues
            </h2>
            <p>
              We strive to keep the Website accessible and operating smoothly. However, we do not warrant that the Website, its video streaming players, or interactive features will be uninterrupted, error-free, or entirely free of operational delays caused by network failure, third-party hosting maintenance, or telecommunications latency.
            </p>
          </section>

          {/* Section 15 */}
          <section id="limitation-liability" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              15. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted under applicable Indian law, Anup Rawat shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
              <li>Your access to, viewing of, or inability to access the Website.</li>
              <li>Any transmission delays or delivery failures of enquiry form submissions.</li>
              <li>Unauthorized access to or alteration of transmissions where reasonable digital safeguards were maintained.</li>
            </ul>
          </section>

          {/* Section 16 */}
          <section id="indemnification" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              16. Indemnification
            </h2>
            <p>
              You agree to defend, indemnify, and hold harmless Anup Rawat from and against any third-party claims, liabilities, damages, and expenses (including reasonable legal fees) arising out of your violation of these Terms or unauthorized commercial use of materials downloaded or copied from this Website.
            </p>
          </section>

          {/* Section 17 */}
          <section id="privacy-reference" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              17. Privacy & Personal Information
            </h2>
            <p>
              Our collection and handling of contact inquiries, phone numbers, and chat session tokens are governed by our <Link href="/privacy-policy" className="text-[#012CEB] font-semibold underline hover:text-[#14100E]">Privacy Policy</Link>, structured in compliance with the Digital Personal Data Protection Act, 2023. By using this Website, you consent to our privacy practices.
            </p>
          </section>

          {/* Section 18 */}
          <section id="modifications" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              18. Changes to These Terms
            </h2>
            <p>
              We reserve the right to modify or replace these Terms at any time to reflect changing operational practices, technical updates, or statutory requirements. Changes take effect immediately upon posting to this page with an updated revision date.
            </p>
          </section>

          {/* Section 19 */}
          <section id="governing-law" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E] border-b border-[#14100E]/15 pb-2">
              19. Governing Law & Jurisdiction
            </h2>
            <p>
              These Terms, their interpretation, and any disputes arising out of your use of the Website shall be governed by and construed in accordance with the <strong>laws of the Republic of India</strong>.
            </p>
            <p>
              Subject to dispute resolution mechanisms set forth in specific production agreements, the courts situated in <strong>Dehradun, Uttarakhand, India</strong> shall have exclusive territorial jurisdiction over any disputes arising under these Website Terms.
            </p>
          </section>

          {/* Section 20 */}
          <section id="contact-info" className="space-y-4 scroll-mt-24 pt-4 border-t border-[#14100E]/15">
            <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#14100E]">
              20. Contact Information
            </h2>
            <p>
              For formal inquiries, copyright licensing requests, or questions regarding these Terms, please contact:
            </p>
            <div className="bg-[#14100E] text-[#F4EFE6] p-6 rounded-xl border border-[#14100E] shadow-[6px_6px_0_#012CEB] space-y-2 font-['DM_Mono'] text-xs sm:text-sm">
              <div className="text-[#D4A017] font-bold text-sm sm:text-base">ANUP RAWAT // CINEMATOGRAPHER</div>
              <div>Representation: Independent Filmmaker & Director of Photography</div>
              <div>Primary Base: Dehradun & Rishikesh, Uttarakhand, India</div>
              <div>
                Official Email:{' '}
                <a
                  href="mailto:Anooprawat123123@gmail.com"
                  className="text-[#D4A017] underline hover:text-white transition-colors"
                >
                  Anooprawat123123@gmail.com
                </a>
              </div>
              <div>Website: https://anuprawat.com</div>
            </div>
          </section>
        </article>
      </main>

      {/* Cinematic Footer Integration */}
      <CinematicFooter />
    </div>
  );
}

