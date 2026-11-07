"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCookieConsent } from "@/context/CookieConsentContext";

export interface CinematicFooterProps {
  onSecretClick?: () => void;
}

export default function CinematicFooter({ onSecretClick }: CinematicFooterProps = {}) {
  const router = useRouter();
  const { openPreferences } = useCookieConsent();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      aria-label="Site footer"
      className="w-full bg-[#DDD3C5] text-[#14100E] border-t border-[#14100E]/15 px-6 sm:px-10 lg:px-16 xl:px-24 py-12 sm:py-16 font-sans transition-colors"
    >
      <div className="max-w-[1440px] mx-auto space-y-12">
        {/* Top Tier: Brand, Summary, Creative Services, and Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Column 1: Brand & Philosophy (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-['DM_Mono'] text-xs font-bold uppercase tracking-widest text-[#012CEB] bg-[#E6DDD2] px-2.5 py-0.5 rounded border border-[#14100E]/10">
                DIRECTOR OF PHOTOGRAPHY
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-[#14100E]">
              ANUP RAWAT
            </h3>

            <p className="text-xs sm:text-sm text-[#6B625A] max-w-md leading-relaxed">
              Specializing in narrative feature films, commercial visuals, and evocative visual storytelling. Operating across Dehradun, Rishikesh, Uttarakhand, and global on-location productions.
            </p>

            <div className="pt-1 text-xs text-[#6B625A] space-y-1 font-['DM_Mono']">
              <div>Base: Dehradun & Rishikesh, Uttarakhand, India</div>
              <div>Direct: <a href="mailto:anuprawat@gmail.com" className="text-[#14100E] underline hover:text-[#012CEB]">anuprawat@gmail.com</a></div>
            </div>
          </div>

          {/* Column 2: Creative Services (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-['DM_Mono'] text-xs font-bold uppercase tracking-wider text-[#14100E]">
              Cinematography Services
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#6B625A]">
              <li>Narrative Feature Films & Short Cinema</li>
              <li>Commercials & Brand Campaigns</li>
              <li>Music Videos & Fashion Lookbooks</li>
              <li>Documentary & Environmental Visuals</li>
              <li>Himalayan & Regional Shoot Logistics (Dehradun / Rishikesh)</li>
            </ul>
          </div>

          {/* Column 3: Navigation & Verified Socials (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-['DM_Mono'] text-xs font-bold uppercase tracking-wider text-[#14100E]">
              Navigation & Networks
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/#about" className="text-[#6B625A] hover:text-[#14100E] transition-colors">
                  Origins & Philosophy
                </Link>
              </li>
              <li>
                <Link href="/#visuals" className="text-[#6B625A] hover:text-[#14100E] transition-colors">
                  Visual Sketchbook
                </Link>
              </li>
              <li>
                <Link href="/#work" className="text-[#6B625A] hover:text-[#14100E] transition-colors">
                  Featured Works & Films
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-[#6B625A] hover:text-[#14100E] transition-colors">
                  Cinematic Journal
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/?text=Hi%20Anup%2C%20I%20am%20reaching%20out%20from%20your%20cinematography%20portfolio%20regarding%20a%20project"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#012CEB] font-semibold hover:underline inline-flex items-center gap-1"
                >
                  WhatsApp Chat ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Tier: Copyright, Legal Links, and Persistent Cookie Manager */}
        <div className="pt-8 border-t border-[#14100E]/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-[#6B625A]">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>
              <span
                onClick={onSecretClick || (() => router.push('/login-page'))}
                className="cursor-default select-none text-[#6B625A] hover:text-[#14100E] focus:outline-none"
                aria-hidden="true"
                title="Cinematographer Portfolio"
              >
                ©
              </span>{' '}
              {currentYear} Anup Rawat. All rights reserved.
            </span>

            <span>·</span>

            <Link
              href="/privacy-policy"
              className="hover:text-[#14100E] underline underline-offset-4 transition-colors"
            >
              Privacy Policy
            </Link>

            <span>·</span>

            <Link
              href="/terms-and-conditions"
              className="hover:text-[#14100E] underline underline-offset-4 transition-colors"
            >
              Terms & Conditions
            </Link>

            <span>·</span>

            <button
              type="button"
              onClick={openPreferences}
              className="hover:text-[#14100E] underline underline-offset-4 transition-colors cursor-pointer text-left"
            >
              Cookie Preferences
            </button>
          </div>

          {/* Right: Studio Monogram / Brand mark */}
          <div
            className="flex items-center gap-3 select-none"
            onDoubleClick={() => router.push('/login-page')}
            title="Anup Rawat"
          >
            <span className="font-['DM_Mono'] text-[11px] tracking-wider uppercase text-[#6B625A]">
              KEEP CREATING
            </span>
            <img
              src="/images/ar-logo.webp"
              alt="Anup Rawat Logo"
              className="h-8 sm:h-9 w-auto object-contain cursor-default opacity-85 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}

