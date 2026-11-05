import React from 'react';
import Link from 'next/link';
import { Lock, Unlock } from 'lucide-react';

export interface MechanicalStatus {
  gearsActive: boolean;
  sprayReady: boolean;
  weightTilted: boolean;
  cordPulled: boolean;
  unlocked: boolean;
}

interface CinematicHeaderProps {
  mechStatus: MechanicalStatus;
  onReset?: () => void;
}

export const CinematicHeader: React.FC<CinematicHeaderProps> = ({
  mechStatus,
  onReset,
}) => {
  return (
    <header className="relative z-30 w-full select-none">
      {/* Top Bar matching reference screenshot 1:1 */}
      <div className="w-full px-6 sm:px-10 pt-5 pb-3 flex items-center justify-between">
        {/* Top-Left: Compact, dark, high-contrast button */}
        <div className="flex items-center">
          <Link
            href="/"
            className="px-3.5 py-2 bg-[#121212] text-[#FAF8F3] font-mono-tech text-[11px] sm:text-xs font-bold tracking-wider uppercase rounded-xl shadow-[2px_3px_0px_rgba(0,0,0,0.22)] hover:bg-[#262626] active:translate-y-[1px] transition-all cursor-pointer whitespace-nowrap inline-flex items-center gap-2"
          >
            <img src="/ar-monogram.webp" alt="AR" className="w-4 h-4 object-contain" />
            <span>RETURN TO PORTFOLIO</span>
          </Link>
        </div>

        {/* Top-Center: Small centered lock/status indicator */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
          <div
            title={mechStatus.unlocked ? 'Terminal Unlocked' : 'Terminal Locked'}
            className="text-[#44403C] transition-colors duration-200"
          >
            {mechStatus.unlocked ? (
              <Unlock className="w-4 h-4 stroke-[1.6] text-[#15803D]" />
            ) : (
              <Lock className="w-4 h-4 stroke-[1.6]" />
            )}
          </div>
        </div>

        {/* Top-Right: Handwritten portfolio identity + outlined terminal status element */}
        <div className="flex items-center gap-3 sm:gap-3.5">
          <img
            src="/ar-monogram.webp"
            alt="AR"
            className="w-7 h-7 object-contain"
          />
          <span className="font-signature text-2xl sm:text-[27px] font-bold tracking-tight text-[#141414] whitespace-nowrap">
            Anup Rawat
          </span>

          <span className="text-[#B8B3A8] text-sm select-none" aria-hidden="true">
            •
          </span>

          <div className="px-3.5 py-2 rounded-lg border border-[#D4CFC4] bg-[#F6F3EC] font-mono-tech text-[11px] sm:text-xs font-semibold tracking-wider text-[#1C1917] shadow-[0_2px_4px_rgba(0,0,0,0.04)] whitespace-nowrap">
            TERMINAL // CLIENT AUTH
          </div>
        </div>
      </div>

      {/* Floating Bordered Cinematic Status Strip */}
      <div className="w-full px-4 pt-1 flex justify-center">
        <div
          role="status"
          aria-live="polite"
          className="inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 px-4 sm:px-5 py-2 bg-[#FAF8F2] border-2 border-[#141414] rounded-lg shadow-[3px_3px_0px_#141414] text-[11px] sm:text-xs font-mono-tech text-[#141414]"
        >
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors duration-300 ${
              mechStatus.unlocked ? 'bg-[#15803D]' : 'bg-[#D97706]'
            }`}
            aria-hidden="true"
          />
          <span className="font-bold text-[#1D4ED8] tracking-wide whitespace-nowrap">
            CINEMA KEY:
          </span>
          <span className="text-[#1C1917] whitespace-nowrap">
            Email powers gear spray
          </span>
          <span className="text-[#78716C]" aria-hidden="true">
            •
          </span>
          <span className="text-[#1C1917] whitespace-nowrap">
            Password tilts film weight
          </span>
          <span className="text-[#78716C]" aria-hidden="true">
            •
          </span>
          <span className="text-[#1C1917] whitespace-nowrap">
            Check cord pulls submit
          </span>
        </div>
      </div>
    </header>
  );
};
